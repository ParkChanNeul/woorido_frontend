/**
 * Spring Boot - 인증 API
 */

import { springClient, tokenManager } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";
import type { AuthTokens } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

/**
 * 로그인
 */
export async function login(request: LoginRequest): Promise<AuthTokens> {
  const { data } = await springClient.post<{ data: AuthTokens }>(
    SPRING_ENDPOINTS.AUTH.LOGIN,
    request
  );
  tokenManager.setTokens(data.data);
  return data.data;
}

/**
 * 회원가입
 */
export async function register(request: RegisterRequest): Promise<AuthTokens> {
  const { data } = await springClient.post<{ data: AuthTokens }>(
    SPRING_ENDPOINTS.AUTH.REGISTER,
    request
  );
  tokenManager.setTokens(data.data);
  return data.data;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await springClient.post(SPRING_ENDPOINTS.AUTH.LOGOUT);
  tokenManager.clearTokens();
}

/**
 * 토큰 갱신
 */
export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  const { data } = await springClient.post<{ data: AuthTokens }>(
    SPRING_ENDPOINTS.AUTH.REFRESH,
    { refreshToken }
  );
  tokenManager.setTokens(data.data);
  return data.data;
}
