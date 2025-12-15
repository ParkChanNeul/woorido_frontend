/**
 * 환경변수 중앙 관리
 * 모든 환경변수는 이 파일을 통해서만 접근
 */

const env = {
  // API URLs
  springApiUrl: import.meta.env.VITE_SPRING_API_URL || "http://localhost:8080",
  djangoApiUrl: import.meta.env.VITE_DJANGO_API_URL || "http://localhost:8000",

  // Application
  appName: import.meta.env.VITE_APP_NAME || "WOORIDO",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Environment
  nodeEnv: import.meta.env.VITE_NODE_ENV || "development",
  isDev: import.meta.env.VITE_NODE_ENV === "development",
  isProd: import.meta.env.VITE_NODE_ENV === "production",

  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === "true",
} as const;

export default env;
