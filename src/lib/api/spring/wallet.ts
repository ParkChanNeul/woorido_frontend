/**
 * Spring Boot - 지갑 API
 * Placeholder - 실제 구현은 기존 타입에 맞춰 확장 필요
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";

export async function getWalletBalance() {
  const { data } = await springClient.get(SPRING_ENDPOINTS.WALLET.BALANCE);
  return data.data;
}

export async function getTransactions() {
  const { data } = await springClient.get(SPRING_ENDPOINTS.WALLET.TRANSACTIONS);
  return data.data;
}
