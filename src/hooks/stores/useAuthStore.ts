/**
 * Auth UI 상태 관리 Store
 * 토큰, 사용자 정보 등 인증 관련 클라이언트 상태
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUserId: (userId: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      setUserId: (userId) => {
        set({ userId });
      },

      clearAuth: () => {
        set({ accessToken: null, refreshToken: null, userId: null });
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },
    }),
    {
      name: "woorido-auth",
    }
  )
);
