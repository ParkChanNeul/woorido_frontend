/**
 * React Query 설정
 * 서버 상태 관리
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 캐시 유지
      staleTime: 1000 * 60 * 5,
      // 데이터가 stale 상태가 되면 백그라운드에서 자동 refetch
      refetchOnWindowFocus: true,
      // 네트워크 재연결 시 자동 refetch
      refetchOnReconnect: true,
      // 에러 발생 시 재시도 횟수
      retry: 1,
      // 재시도 딜레이 (지수 백오프)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Mutation 에러 발생 시 재시도 안함
      retry: false,
    },
  },
});

/**
 * React Query 키 팩토리
 * 일관된 쿼리 키 관리
 */
export const queryKeys = {
  // Auth
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
  },

  // Gye (Challenge)
  gye: {
    all: ["gye"] as const,
    lists: () => [...queryKeys.gye.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.gye.lists(), filters] as const,
    details: () => [...queryKeys.gye.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.gye.details(), id] as const,
    members: (gyeId: string) =>
      [...queryKeys.gye.detail(gyeId), "members"] as const,
  },

  // Wallet
  wallet: {
    all: ["wallet"] as const,
    balance: () => [...queryKeys.wallet.all, "balance"] as const,
    transactions: () => [...queryKeys.wallet.all, "transactions"] as const,
  },

  // Deposit
  deposit: {
    all: ["deposit"] as const,
    status: (gyeId: string) =>
      [...queryKeys.deposit.all, "status", gyeId] as const,
    calculate: (data: Record<string, unknown>) =>
      [...queryKeys.deposit.all, "calculate", data] as const,
  },

  // Simulation (Django)
  simulation: {
    all: ["simulation"] as const,
    calculate: (input: Record<string, unknown>) =>
      [...queryKeys.simulation.all, "calculate", input] as const,
  },

  // Persona (Django)
  persona: {
    all: ["persona"] as const,
    user: (userId?: string) =>
      [...queryKeys.persona.all, "user", userId] as const,
    types: () => [...queryKeys.persona.all, "types"] as const,
  },

  // Ledger
  ledger: {
    all: ["ledger"] as const,
    timeline: (gyeId: string) =>
      [...queryKeys.ledger.all, "timeline", gyeId] as const,
    summary: (gyeId: string) =>
      [...queryKeys.ledger.all, "summary", gyeId] as const,
  },

  // SNS - Posts
  post: {
    all: ["post"] as const,
    lists: () => [...queryKeys.post.all, "list"] as const,
    list: (gyeId: string, params?: Record<string, unknown>) =>
      [...queryKeys.post.lists(), gyeId, params] as const,
    details: () => [...queryKeys.post.all, "detail"] as const,
    detail: (postId: string) => [...queryKeys.post.details(), postId] as const,
  },

  // SNS - Comments
  comment: {
    all: ["comment"] as const,
    lists: () => [...queryKeys.comment.all, "list"] as const,
    list: (postId: string) =>
      [...queryKeys.comment.lists(), postId] as const,
    replies: (commentId: string) =>
      [...queryKeys.comment.all, "replies", commentId] as const,
  },

  // SNS - Announcements
  announcement: {
    all: ["announcement"] as const,
    lists: () => [...queryKeys.announcement.all, "list"] as const,
    list: (gyeId: string) =>
      [...queryKeys.announcement.lists(), gyeId] as const,
    details: () => [...queryKeys.announcement.all, "detail"] as const,
    detail: (announcementId: string) =>
      [...queryKeys.announcement.details(), announcementId] as const,
  },
} as const;
