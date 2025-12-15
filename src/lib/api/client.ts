import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiError, AuthTokens } from "@/types";
import { storage } from "../utils";
import { env } from "@/config";

const TOKEN_KEY = "woorido-auth-tokens";

/**
 * Spring Boot API 클라이언트 (Money Core - Port 8080)
 */
export const springClient: AxiosInstance = axios.create({
  baseURL: env.springApiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Django API 클라이언트 (Brain Core - Port 8000)
 */
export const djangoClient: AxiosInstance = axios.create({
  baseURL: env.djangoApiUrl,
  timeout: 15000, // Django는 분석 시간이 더 필요할 수 있음
  headers: {
    "Content-Type": "application/json",
  },
});


/**
 * 토큰 관리
 */
export const tokenManager = {
  getTokens(): AuthTokens | null {
    return storage.get<AuthTokens>(TOKEN_KEY);
  },

  setTokens(tokens: AuthTokens): void {
    storage.set(TOKEN_KEY, tokens);
  },

  clearTokens(): void {
    storage.remove(TOKEN_KEY);
  },

  getAccessToken(): string | null {
    return this.getTokens()?.accessToken ?? null;
  },

  getRefreshToken(): string | null {
    return this.getTokens()?.refreshToken ?? null;
  },
};

/**
 * Spring 클라이언트 요청 인터셉터 - 토큰 자동 첨부
 */
springClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Django 클라이언트 요청 인터셉터 - 토큰 자동 첨부 (선택적)
 * Django는 주로 비로그인 시뮬레이션에 사용되지만, 일부 API는 인증 필요
 */
djangoClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Spring 클라이언트 응답 인터셉터 - 에러 처리 + 토큰 갱신
 */
springClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config;

    // 401 에러 + 토큰 갱신 시도
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.headers["X-Retry"]
    ) {
      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken) {
        try {
          const { data } = await axios.post<{ data: AuthTokens }>(
            `${env.springApiUrl}/api/auth/refresh`,
            { refreshToken }
          );

          tokenManager.setTokens(data.data);
          originalRequest.headers["X-Retry"] = "true";
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

          return springClient(originalRequest);
        } catch {
          tokenManager.clearTokens();
          window.location.href = "/auth/login";
        }
      } else {
        tokenManager.clearTokens();
        window.location.href = "/auth/login";
      }
    }

    // 에러 메시지 정규화
    const apiError: ApiError = error.response?.data ?? {
      success: false,
      message: error.message || "Network error",
    };

    return Promise.reject(apiError);
  }
);

/**
 * Django 클라이언트 응답 인터셉터 - 에러 처리만 (인증 없음)
 */
djangoClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // 에러 메시지 정규화
    const apiError: ApiError = error.response?.data ?? {
      success: false,
      message: error.message || "Network error",
    };

    return Promise.reject(apiError);
  }
);

// Default export는 springClient 사용
export default springClient;
