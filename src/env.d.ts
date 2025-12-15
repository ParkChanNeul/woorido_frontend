/// <reference types="vite/client" />

/**
 * Vite 환경변수 타입 선언
 * @see https://vitejs.dev/guide/env-and-mode.html
 */
interface ImportMetaEnv {
  // API URLs
  readonly VITE_SPRING_API_URL: string;
  readonly VITE_DJANGO_API_URL: string;

  // Application
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // Environment
  readonly VITE_NODE_ENV: "development" | "production" | "test";

  // Feature Flags (optional)
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_ENABLE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
