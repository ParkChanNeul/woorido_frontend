/**
 * Archetype (성향) 상수
 * "등급이 아닌 성향" - 상호 보완적 페르소나 매칭
 */

export const PERSONA_TYPES = {
  GUARDIAN: "GUARDIAN", // 안정형
  TRENDSETTER: "TRENDSETTER", // 활동형
  SAVER: "SAVER", // 저축형
  CHALLENGER: "CHALLENGER", // 도전형
} as const;

export type PersonaType = (typeof PERSONA_TYPES)[keyof typeof PERSONA_TYPES];

/**
 * Archetype 상세 정보
 */
export interface PersonaInfo {
  type: PersonaType;
  nameKo: string;
  nameEn: string;
  description: string;
  color: string; // Tailwind color class
  icon: string; // Icon name
  traits: string[]; // 주요 특성
}

export const PERSONA_INFO: Record<PersonaType, PersonaInfo> = {
  [PERSONA_TYPES.GUARDIAN]: {
    type: PERSONA_TYPES.GUARDIAN,
    nameKo: "수호자",
    nameEn: "The Guardian",
    description: "안정적이고 신뢰할 수 있는 성향",
    color: "bg-blue-500",
    icon: "Shield",
    traits: ["안정 추구", "계획적", "신뢰성 높음"],
  },
  [PERSONA_TYPES.TRENDSETTER]: {
    type: PERSONA_TYPES.TRENDSETTER,
    nameKo: "트렌드세터",
    nameEn: "The Trendsetter",
    description: "활동적이고 도전적인 성향",
    color: "bg-purple-500",
    icon: "Zap",
    traits: ["활동적", "트렌드 민감", "도전적"],
  },
  [PERSONA_TYPES.SAVER]: {
    type: PERSONA_TYPES.SAVER,
    nameKo: "저축가",
    nameEn: "The Saver",
    description: "저축과 절약을 중시하는 성향",
    color: "bg-green-500",
    icon: "PiggyBank",
    traits: ["절약형", "목표 지향", "계획적"],
  },
  [PERSONA_TYPES.CHALLENGER]: {
    type: PERSONA_TYPES.CHALLENGER,
    nameKo: "도전자",
    nameEn: "The Challenger",
    description: "새로운 도전을 즐기는 성향",
    color: "bg-orange-500",
    icon: "Target",
    traits: ["도전적", "목표 지향", "열정적"],
  },
} as const;

/**
 * 상호 보완적 페르소나 매칭
 */
export const COMPLEMENTARY_PERSONAS: Record<PersonaType, PersonaType[]> = {
  [PERSONA_TYPES.GUARDIAN]: [
    PERSONA_TYPES.TRENDSETTER,
    PERSONA_TYPES.CHALLENGER,
  ],
  [PERSONA_TYPES.TRENDSETTER]: [PERSONA_TYPES.GUARDIAN, PERSONA_TYPES.SAVER],
  [PERSONA_TYPES.SAVER]: [
    PERSONA_TYPES.TRENDSETTER,
    PERSONA_TYPES.CHALLENGER,
  ],
  [PERSONA_TYPES.CHALLENGER]: [PERSONA_TYPES.GUARDIAN, PERSONA_TYPES.SAVER],
} as const;
