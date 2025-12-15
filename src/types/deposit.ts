/**
 * 보증금 관련 타입 정의
 */

import type { DEPOSIT_STATUS } from "@/constants/deposit";

export type DepositStatus =
  (typeof DEPOSIT_STATUS)[keyof typeof DEPOSIT_STATUS];

/**
 * 보증금 정보
 */
export interface Deposit {
  id: string;
  userId: string;
  gyeId: string;
  amount: number; // 보증금 금액
  status: DepositStatus;
  lockedAt: string | null; // 잠김 시간
  unlockedAt: string | null; // 해제 시간
  forfeitedAt: string | null; // 몰수 시간
  createdAt: string;
  updatedAt: string;
}

/**
 * 보증금 계산 요청
 */
export interface DepositCalculateRequest {
  monthlyAmount: number;
  duration: number; // 개월 수
}

/**
 * 보증금 계산 응답
 */
export interface DepositCalculateResponse {
  monthlyAmount: number;
  depositAmount: number; // 3개월치
  multiplier: number; // 배수 (3)
  totalRequired: number; // 보증금 + 첫 달 납입금
}

/**
 * 보증금 Lock 요청
 */
export interface DepositLockRequest {
  gyeId: string;
  amount: number;
}

/**
 * 보증금 Unlock 요청
 */
export interface DepositUnlockRequest {
  gyeId: string;
}

/**
 * 보증금 상태 응답
 */
export interface DepositStatusResponse {
  deposit: Deposit;
  canUnlock: boolean; // 해제 가능 여부
  forfeitRisk: boolean; // 몰수 위험 여부
  daysRemaining: number; // 챌린지 종료까지 남은 일수
}
