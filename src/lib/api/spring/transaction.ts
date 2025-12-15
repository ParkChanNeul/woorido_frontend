/**
 * Spring Boot - 거래 API
 * Placeholder - 실제 구현은 기존 타입에 맞춰 확장 필요
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";

export async function getTransactionHistory() {
  const { data } = await springClient.get(SPRING_ENDPOINTS.TRANSACTION.HISTORY);
  return data.data;
}

export async function getTransactionDetail(id: string) {
  const { data } = await springClient.get(SPRING_ENDPOINTS.TRANSACTION.DETAIL(id));
  return data.data;
}
