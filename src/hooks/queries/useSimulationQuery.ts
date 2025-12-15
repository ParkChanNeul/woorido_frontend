/**
 * Simulation (시뮬레이션) 관련 React Query hooks
 * Django Brain Core API 사용 (비인증)
 */

import { useMutation } from "@tanstack/react-query";
import { calculateSimulation } from "@/lib/api";
import type { SimulationInput } from "@/types";
import { toast } from "sonner";

/**
 * 시뮬레이션 계산 Mutation
 * 비인증 사용자도 접근 가능한 Django API
 */
export function useSimulation() {
  return useMutation({
    mutationFn: (input: SimulationInput) => calculateSimulation(input),
    onError: (error: Error) => {
      toast.error(error.message || "시뮬레이션 계산에 실패했습니다");
    },
  });
}
