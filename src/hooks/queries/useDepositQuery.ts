/**
 * Deposit (보증금) 관련 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { calculateDeposit, lockDeposit, unlockDeposit, getDepositStatus } from "@/lib/api";
import type {
  DepositCalculateRequest,
  DepositLockRequest,
  DepositUnlockRequest,
} from "@/types";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

/**
 * 보증금 계산 Query
 */
export function useDepositCalculate(request: DepositCalculateRequest) {
  return useQuery({
    queryKey: queryKeys.deposit.calculate(request as unknown as Record<string, unknown>),
    queryFn: () => calculateDeposit(request),
    enabled: request.monthlyAmount > 0 && request.duration > 0,
  });
}

/**
 * 보증금 상태 조회 Query
 */
export function useDepositStatus(gyeId: string) {
  return useQuery({
    queryKey: queryKeys.deposit.status(gyeId),
    queryFn: () => getDepositStatus(gyeId),
    enabled: !!gyeId,
  });
}

/**
 * 보증금 Lock Mutation
 */
export function useLockDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepositLockRequest) => lockDeposit(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deposit.status(variables.gyeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      toast.success("보증금이 잠금 처리되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "보증금 잠금에 실패했습니다");
    },
  });
}

/**
 * 보증금 Unlock Mutation
 */
export function useUnlockDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DepositUnlockRequest) => unlockDeposit(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.deposit.status(variables.gyeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      toast.success("보증금이 해제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "보증금 해제에 실패했습니다");
    },
  });
}
