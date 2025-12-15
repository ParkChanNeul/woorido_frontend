/**
 * Open Ledger (투명한 원장) 관련 타입 정의
 */

/**
 * 원장 타임라인 아이템
 */
export interface LedgerTimelineItem {
  id: string;
  gyeId: string;
  type: LedgerEventType;
  amount: number;
  fromUserId: string | null;
  toUserId: string | null;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * 원장 이벤트 타입
 */
export type LedgerEventType =
  | "GYE_CREATED" // 챌린지 생성
  | "MEMBER_JOINED" // 멤버 참여
  | "MEMBER_LEFT" // 멤버 탈퇴
  | "DEPOSIT_LOCKED" // 보증금 잠김
  | "DEPOSIT_UNLOCKED" // 보증금 해제
  | "DEPOSIT_FORFEITED" // 보증금 몰수
  | "MONTHLY_PAYMENT" // 월 납입금
  | "PAYOUT" // 지급
  | "PENALTY" // 패널티
  | "GYE_COMPLETED" // 챌린지 완료
  | "GYE_CANCELLED"; // 챌린지 취소

/**
 * 원장 요약 정보
 */
export interface LedgerSummary {
  gyeId: string;
  totalDeposit: number; // 총 보증금
  totalPayment: number; // 총 납입금
  totalPayout: number; // 총 지급액
  totalPenalty: number; // 총 패널티
  currentBalance: number; // 현재 잔액
  eventCount: number; // 총 이벤트 수
  lastUpdated: string;
}

/**
 * 원장 타임라인 요청
 */
export interface LedgerTimelineRequest {
  gyeId: string;
  eventType?: LedgerEventType; // 필터링
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * 원장 타임라인 응답
 */
export interface LedgerTimelineResponse {
  items: LedgerTimelineItem[];
  total: number;
  hasMore: boolean;
}
