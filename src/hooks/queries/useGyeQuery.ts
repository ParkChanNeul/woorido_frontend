/**
 * Gye (계) 관련 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGyeList,
  getGyeDetail,
  getGyeMembers,
  createGye,
  updateGye,
  joinGye,
  leaveGye,
} from "@/lib/api";
import type { GyeListParams, CreateGyeRequest } from "@/types";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

/**
 * 계 목록 조회 Query
 */
export function useGyeList(_params?: GyeListParams) {
  return useQuery({
    queryKey: queryKeys.gye.lists(),
    queryFn: () => getGyeList(),
  });
}

/**
 * 계 상세 조회 Query
 */
export function useGyeDetail(gyeId: string) {
  return useQuery({
    queryKey: queryKeys.gye.detail(gyeId),
    queryFn: () => getGyeDetail(gyeId),
    enabled: !!gyeId,
  });
}

/**
 * 계 멤버 목록 조회 Query
 */
export function useGyeMembers(gyeId: string) {
  return useQuery({
    queryKey: queryKeys.gye.members(gyeId),
    queryFn: () => getGyeMembers(gyeId),
    enabled: !!gyeId,
  });
}

/**
 * 계 생성 Mutation
 */
export function useCreateGye() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGyeRequest) => createGye(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.lists() });
      toast.success("계가 생성되었습니다");
    },
    onError: () => {
      toast.error("계 생성에 실패했습니다");
    },
  });
}

/**
 * 계 수정 Mutation
 */
export function useUpdateGye() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gyeId, data }: { gyeId: string; data: Partial<CreateGyeRequest> }) =>
      updateGye(gyeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.detail(variables.gyeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.lists() });
      toast.success("계 정보가 수정되었습니다");
    },
    onError: () => {
      toast.error("계 수정에 실패했습니다");
    },
  });
}

/**
 * 계 가입 Mutation
 */
export function useJoinGye() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gyeId, message }: { gyeId: string; message?: string }) =>
      joinGye(gyeId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.detail(variables.gyeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.members(variables.gyeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });
      toast.success("계에 가입되었습니다");
    },
    onError: () => {
      toast.error("계 가입에 실패했습니다");
    },
  });
}

/**
 * 계 탈퇴 Mutation
 */
export function useLeaveGye() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gyeId, reason }: { gyeId: string; reason?: string }) =>
      leaveGye(gyeId, reason),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.detail(variables.gyeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.gye.members(variables.gyeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.all });

      if (result.depositForfeited) {
        toast.warning(
          `계에서 탈퇴했습니다. 보증금 ${result.forfeitAmount.toLocaleString()}원이 몰수되었습니다.`
        );
      } else {
        toast.success("계에서 탈퇴했습니다");
      }
    },
    onError: () => {
      toast.error("계 탈퇴에 실패했습니다");
    },
  });
}
