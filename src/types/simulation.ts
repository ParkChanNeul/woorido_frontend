/**
 * 시뮬레이션 관련 타입 정의
 * Django API 연동
 */

/**
 * 시뮬레이션 입력 데이터
 */
export interface SimulationInput {
  monthlyIncome: number; // 월 소득
  monthlyExpense: number; // 월 지출
  savingsGoal: number; // 목표 금액
  preferredMonthlyAmount?: number; // 희망 월 납입금 (optional)
  tags?: string[]; // 목적 태그 (예: #여행, #맥북)
}

/**
 * 시뮬레이션 결과
 */
export interface SimulationResult {
  id: string;
  input: SimulationInput;
  scenarios: SimulationScenario[];
  recommendedScenario: string; // 추천 시나리오 ID
  createdAt: string;
}

/**
 * 시뮬레이션 시나리오
 */
export interface SimulationScenario {
  id: string;
  name: string; // 예: "안정형", "적극형"
  monthlyAmount: number; // 월 납입금
  duration: number; // 기간 (개월)
  totalAmount: number; // 총 수령액
  expectedReturn: number; // 예상 수익 (이자)
  depositRequired: number; // 필요 보증금 (3개월치)
  riskLevel: "low" | "medium" | "high"; // 리스크 레벨
  description: string;
}

/**
 * 시뮬레이션 차트 데이터 포인트
 */
export interface SimulationChartData {
  month: number;
  accumulated: number; // 누적 금액
  target: number; // 목표 금액
  projection: number; // 예상 금액 (이자 포함)
}
