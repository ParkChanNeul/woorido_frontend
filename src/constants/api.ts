/**
 * API 엔드포인트 상수
 * Spring Boot (8080) + Django (8000) 분리
 */

// ========================================
// Spring Boot API (Money Core - Port 8080)
// ========================================
export const SPRING_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    REGISTER: "/api/auth/register",
  },

  // Gye (Challenge)
  GYE: {
    LIST: "/api/gye",
    DETAIL: (id: string) => `/api/gye/${id}`,
    CREATE: "/api/gye",
    UPDATE: (id: string) => `/api/gye/${id}`,
    DELETE: (id: string) => `/api/gye/${id}`,
    JOIN: (id: string) => `/api/gye/${id}/join`,
    LEAVE: (id: string) => `/api/gye/${id}/leave`,
    MEMBERS: (id: string) => `/api/gye/${id}/members`,
  },

  // Wallet
  WALLET: {
    BALANCE: "/api/wallet/balance",
    DEPOSIT: "/api/wallet/deposit",
    WITHDRAW: "/api/wallet/withdraw",
    TRANSACTIONS: "/api/wallet/transactions",
  },

  // Deposit (보증금 Lock/Unlock)
  DEPOSIT: {
    LOCK: "/api/deposit/lock",
    UNLOCK: "/api/deposit/unlock",
    STATUS: "/api/deposit/status",
    CALCULATE: "/api/deposit/calculate",
  },

  // Transaction (자동 정산)
  TRANSACTION: {
    HISTORY: "/api/transaction/history",
    DETAIL: (id: string) => `/api/transaction/${id}`,
    SCHEDULE: "/api/transaction/schedule",
  },

  // User
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE: "/api/user/profile",
    BADGES: "/api/user/badges",
  },

  // Ledger (Open Ledger)
  LEDGER: {
    TIMELINE: (gyeId: string) => `/api/ledger/${gyeId}/timeline`,
    SUMMARY: (gyeId: string) => `/api/ledger/${gyeId}/summary`,
  },

  // SNS - Posts (계 전용 피드)
  POST: {
    LIST: (gyeId: string) => `/api/gye/${gyeId}/posts`,
    DETAIL: (postId: string) => `/api/posts/${postId}`,
    CREATE: (gyeId: string) => `/api/gye/${gyeId}/posts`,
    UPDATE: (postId: string) => `/api/posts/${postId}`,
    DELETE: (postId: string) => `/api/posts/${postId}`,
    LIKE: (postId: string) => `/api/posts/${postId}/like`,
    UNLIKE: (postId: string) => `/api/posts/${postId}/like`,
  },

  // SNS - Comments
  COMMENT: {
    LIST: (postId: string) => `/api/posts/${postId}/comments`,
    CREATE: (postId: string) => `/api/posts/${postId}/comments`,
    UPDATE: (commentId: string) => `/api/comments/${commentId}`,
    DELETE: (commentId: string) => `/api/comments/${commentId}`,
    LIKE: (commentId: string) => `/api/comments/${commentId}/like`,
    UNLIKE: (commentId: string) => `/api/comments/${commentId}/like`,
    REPLIES: (commentId: string) => `/api/comments/${commentId}/replies`,
  },

  // SNS - Media Upload
  MEDIA: {
    UPLOAD: (gyeId: string) => `/api/gye/${gyeId}/media`,
    DELETE: (mediaId: string) => `/api/media/${mediaId}`,
  },

  // SNS - Announcements (공지사항)
  ANNOUNCEMENT: {
    LIST: (gyeId: string) => `/api/gye/${gyeId}/announcements`,
    DETAIL: (announcementId: string) => `/api/announcements/${announcementId}`,
    CREATE: (gyeId: string) => `/api/gye/${gyeId}/announcements`,
    UPDATE: (announcementId: string) => `/api/announcements/${announcementId}`,
    DELETE: (announcementId: string) => `/api/announcements/${announcementId}`,
    READ: (announcementId: string) => `/api/announcements/${announcementId}/read`,
  },
} as const;

// ========================================
// Django API (Brain Core - Port 8000)
// ========================================
export const DJANGO_ENDPOINTS = {
  // Simulation (시뮬레이션 엔진)
  SIMULATION: {
    CALCULATE: "/api/simulation/calculate",
    SCENARIOS: "/api/simulation/scenarios",
  },

  // Persona (Archetype 분석)
  PERSONA: {
    ANALYZE: "/api/persona/analyze",
    DETAIL: "/api/persona/detail",
    TYPES: "/api/persona/types",
  },

  // Matching (취향 매칭)
  MATCHING: {
    RECOMMEND: "/api/matching/recommend",
    TAGS: "/api/matching/tags",
    GEO: "/api/matching/geo",
  },
} as const;

// ========================================
// API Response Codes
// ========================================
export const API_CODES = {
  SUCCESS: "SUCCESS",
  FAIL: "FAIL",

  // System Errors
  SYS_ERROR: "SYS-001",
  SYS_DB_ERROR: "SYS-002",

  // Auth Errors
  AUTH_UNAUTHORIZED: "AUTH-001",
  AUTH_TOKEN_EXPIRED: "AUTH-002",
  AUTH_INVALID_TOKEN: "AUTH-003",

  // Fund Errors
  FUND_INSUFFICIENT: "FUND-001",
  FUND_DEPOSIT_LOCK_FAIL: "FUND-002",
  FUND_DEPOSIT_UNLOCK_FAIL: "FUND-003",

  // Squad (Gye) Errors
  SQD_CLOSED: "SQD-001",
  SQD_FULL: "SQD-002",
  SQD_NOT_MEMBER: "SQD-003",

  // SNS Errors
  POST_NOT_FOUND: "POST-001",
  POST_UNAUTHORIZED: "POST-002",
  POST_INVALID_MEDIA: "POST-003",
  COMMENT_NOT_FOUND: "COMMENT-001",
  COMMENT_UNAUTHORIZED: "COMMENT-002",
} as const;
