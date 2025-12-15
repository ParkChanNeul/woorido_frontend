/**
 * 보증금 관련 상수
 * WOORIDO의 핵심 리스크 방어 시스템
 */

/**
 * 보증금 배수 (3개월치)
 * "Rule over Trust" - 손실 회피 심리 자극
 */
export const DEPOSIT_MULTIPLIER = 3;

/**
 * 보증금 상태
 */
export const DEPOSIT_STATUS = {
  NONE: "NONE", // 보증금 없음
  LOCKED: "LOCKED", // 잠김 (챌린지 진행 중)
  UNLOCKED: "UNLOCKED", // 해제 (챌린지 완료)
  FORFEITED: "FORFEITED", // 몰수 (중도 이탈)
} as const;

export type DepositStatus =
  (typeof DEPOSIT_STATUS)[keyof typeof DEPOSIT_STATUS];

/**
 * 보증금 계산 함수
 * @param monthlyAmount 월 납입금
 * @returns 필요한 보증금 (3개월치)
 */
export function calculateDeposit(monthlyAmount: number): number {
  return monthlyAmount * DEPOSIT_MULTIPLIER;
}

/**
 * 보증금 상태별 라벨
 */
export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  [DEPOSIT_STATUS.NONE]: "보증금 없음",
  [DEPOSIT_STATUS.LOCKED]: "보증금 잠김",
  [DEPOSIT_STATUS.UNLOCKED]: "보증금 해제됨",
  [DEPOSIT_STATUS.FORFEITED]: "보증금 몰수됨",
} as const;

/**
 * 보증금 상태별 색상 (Tailwind classes)
 */
export const DEPOSIT_STATUS_COLORS: Record<DepositStatus, string> = {
  [DEPOSIT_STATUS.NONE]: "text-gray-500",
  [DEPOSIT_STATUS.LOCKED]: "text-blue-500",
  [DEPOSIT_STATUS.UNLOCKED]: "text-green-500",
  [DEPOSIT_STATUS.FORFEITED]: "text-red-500",
} as const;
