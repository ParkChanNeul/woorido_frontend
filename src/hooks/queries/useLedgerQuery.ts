/**
 * Ledger (공개 장부) 관련 React Query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { getLedgerTimeline, getLedgerSummary } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";

/**
 * 공개 장부 타임라인 조회 Query
 */
export function useLedgerTimeline(
  gyeId: string,
  params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) {
  return useQuery({
    queryKey: queryKeys.ledger.timeline(gyeId),
    queryFn: () => getLedgerTimeline(gyeId, params),
    enabled: !!gyeId,
  });
}

/**
 * 공개 장부 요약 조회 Query
 */
export function useLedgerSummary(gyeId: string) {
  return useQuery({
    queryKey: queryKeys.ledger.summary(gyeId),
    queryFn: () => getLedgerSummary(gyeId),
    enabled: !!gyeId,
  });
}
