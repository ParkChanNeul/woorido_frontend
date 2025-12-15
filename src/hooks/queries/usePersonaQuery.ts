/**
 * Persona (성향 분석) 관련 React Query hooks
 * Django Brain Core API 사용
 */

import { useQuery } from "@tanstack/react-query";
import { analyzePersona, getPersonaTypes } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";

/**
 * 사용자 성향 분석 Query
 */
export function usePersonaAnalysis(userId: string) {
  return useQuery({
    queryKey: queryKeys.persona.user(userId),
    queryFn: () => analyzePersona({ userId }),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30분 - 성향은 자주 변하지 않음
  });
}

/**
 * 성향 타입 목록 조회 Query
 */
export function usePersonaTypes() {
  return useQuery({
    queryKey: queryKeys.persona.types(),
    queryFn: () => getPersonaTypes(),
    staleTime: Infinity, // 성향 타입은 정적 데이터
  });
}
