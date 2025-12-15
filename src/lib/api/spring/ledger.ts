/**
 * Spring Boot - Ledger (공개 장부) API
 * 거래 타임라인, 요약 정보
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";

/**
 * 공개 장부 타임라인 조회
 */
export async function getLedgerTimeline(
  gyeId: string,
  params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) {
  const { data } = await springClient.get(SPRING_ENDPOINTS.LEDGER.TIMELINE(gyeId), {
    params,
  });
  return data.data;
}

/**
 * 공개 장부 요약 조회
 */
export async function getLedgerSummary(gyeId: string) {
  const { data } = await springClient.get(SPRING_ENDPOINTS.LEDGER.SUMMARY(gyeId));
  return data.data;
}
