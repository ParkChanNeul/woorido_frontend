/**
 * Spring Boot - 보증금 API
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";
import type {
  DepositCalculateRequest,
  DepositCalculateResponse,
  DepositLockRequest,
  DepositUnlockRequest,
  DepositStatusResponse,
} from "@/types";

/**
 * 보증금 계산
 */
export async function calculateDeposit(
  request: DepositCalculateRequest
): Promise<DepositCalculateResponse> {
  const { data } = await springClient.post<{ data: DepositCalculateResponse }>(
    SPRING_ENDPOINTS.DEPOSIT.CALCULATE,
    request
  );
  return data.data;
}

/**
 * 보증금 Lock (잠금)
 */
export async function lockDeposit(
  request: DepositLockRequest
): Promise<void> {
  await springClient.post(SPRING_ENDPOINTS.DEPOSIT.LOCK, request);
}

/**
 * 보증금 Unlock (해제)
 */
export async function unlockDeposit(
  request: DepositUnlockRequest
): Promise<void> {
  await springClient.post(SPRING_ENDPOINTS.DEPOSIT.UNLOCK, request);
}

/**
 * 보증금 상태 조회
 */
export async function getDepositStatus(
  gyeId: string
): Promise<DepositStatusResponse> {
  const { data } = await springClient.get<{ data: DepositStatusResponse }>(
    SPRING_ENDPOINTS.DEPOSIT.STATUS,
    { params: { gyeId } }
  );
  return data.data;
}
