/**
 * 라우트 경로 상수
 * 하드코딩된 경로를 방지하고 타입 안전성 확보
 */

export const ROUTES = {
  // Public Routes
  HOME: "/",
  EXPLORE: "/explore",

  // Gye Routes
  GYE_DETAIL: (id: string) => `/gye/${id}`,
  GYE_CREATE: "/create",

  // Wallet Routes
  WALLET: "/wallet",

  // Profile Routes
  PROFILE: "/profile",
  SETTINGS: "/settings",

  // Auth Routes
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },

  // Simulation (비로그인)
  SIMULATION: "/simulation",
} as const;

/**
 * 네비게이션 아이템 정의
 */
export const NAV_ITEMS = [
  {
    key: "home",
    path: ROUTES.HOME,
    labelKey: "nav.home",
    icon: "Home",
  },
  {
    key: "explore",
    path: ROUTES.EXPLORE,
    labelKey: "nav.explore",
    icon: "Search",
  },
  {
    key: "wallet",
    path: ROUTES.WALLET,
    labelKey: "nav.wallet",
    icon: "Wallet",
  },
  {
    key: "profile",
    path: ROUTES.PROFILE,
    labelKey: "nav.profile",
    icon: "User",
  },
] as const;
