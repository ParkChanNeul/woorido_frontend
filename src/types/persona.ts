/**
 * Archetype (성향) 관련 타입 정의
 * Django API 연동
 */

import type { PERSONA_TYPES } from "@/constants/personas";

export type PersonaType = (typeof PERSONA_TYPES)[keyof typeof PERSONA_TYPES];

/**
 * 유저 성향 분석 결과
 */
export interface UserPersona {
  userId: string;
  personaType: PersonaType;
  score: number; // 성향 점수 (0-100)
  traits: PersonaTrait[];
  analyzedAt: string;
}

/**
 * 성향 특성
 */
export interface PersonaTrait {
  key: string;
  nameKo: string;
  nameEn: string;
  value: number; // 특성 값 (0-100)
  description: string;
}

/**
 * 성향 분석 요청
 */
export interface PersonaAnalyzeRequest {
  userId?: string; // 로그인 시
  financialData?: FinancialData; // 금융 데이터
  behaviorData?: BehaviorData; // 행동 데이터
}

/**
 * 금융 데이터 (마이데이터 연동)
 */
export interface FinancialData {
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number; // 저축률
  expenseCategories: ExpenseCategory[];
}

/**
 * 지출 카테고리
 */
export interface ExpenseCategory {
  category: string; // 예: "식비", "교통"
  amount: number;
  percentage: number;
}

/**
 * 행동 데이터
 */
export interface BehaviorData {
  gyeParticipationCount: number; // 참여한 챌린지 수
  completionRate: number; // 완주율
  averageMonthlyAmount: number; // 평균 월 납입금
  preferredTags: string[]; // 선호 태그
}

/**
 * 성향 분석 응답
 */
export interface PersonaAnalyzeResponse {
  persona: UserPersona;
  compatiblePersonas: PersonaType[]; // 호환 가능한 성향
  recommendations: string[]; // 추천 사항
}
