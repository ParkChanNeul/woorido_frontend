/**
 * 유효성 검사 규칙 상수
 */

export const VALIDATION_RULES = {
  // 이메일
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
  },

  // 비밀번호
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },

  // 이름
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 20,
  },

  // 전화번호
  PHONE: {
    PATTERN: /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/,
  },

  // 금액
  AMOUNT: {
    MIN: 1000, // 최소 1,000원
    MAX: 100000000, // 최대 1억원
  },

  // 챌린지
  GYE: {
    TITLE: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50,
    },
    DESCRIPTION: {
      MAX_LENGTH: 500,
    },
    MONTHLY_AMOUNT: {
      MIN: 10000, // 최소 1만원
      MAX: 10000000, // 최대 1천만원
    },
    DURATION: {
      MIN_MONTHS: 3, // 최소 3개월
      MAX_MONTHS: 60, // 최대 5년
    },
    MEMBERS: {
      MIN: 2, // 최소 2명
      MAX: 100, // 최대 100명
    },
  },
} as const;

/**
 * 에러 메시지
 */
export const VALIDATION_MESSAGES = {
  EMAIL: {
    REQUIRED: "이메일을 입력해주세요",
    INVALID: "유효한 이메일 주소를 입력해주세요",
  },
  PASSWORD: {
    REQUIRED: "비밀번호를 입력해주세요",
    MIN_LENGTH: "비밀번호는 최소 8자 이상이어야 합니다",
    PATTERN: "비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다",
  },
  NAME: {
    REQUIRED: "이름을 입력해주세요",
    MIN_LENGTH: "이름은 최소 2자 이상이어야 합니다",
  },
  PHONE: {
    REQUIRED: "전화번호를 입력해주세요",
    INVALID: "유효한 전화번호를 입력해주세요",
  },
  AMOUNT: {
    REQUIRED: "금액을 입력해주세요",
    MIN: "최소 금액은 1,000원입니다",
    MAX: "최대 금액은 1억원입니다",
  },
} as const;
