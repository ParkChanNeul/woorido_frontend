# 🔴 보완 필요 자료 v2.0 (MVP 개발용)

> **작성일**: 2025-12-30
> **버전**: v2.0 - PM 검증 완료
> **목적**: 프론트엔드 MVP 개발 시 필요한 **완전한** 자료 정리
> **업데이트**: 빠진 15개 스펙 추가 + 로고 기반 디자인 토큰 + i18n

---

## ⚠️ PM 검증 결과

**v1.0에서 누락된 중요 스펙:**
1. ❌ 댓글 API (comments) - 피드의 핵심 기능
2. ❌ 나의 모임 API (my-groups)
3. ❌ 보증금 해제 API (leave, complete)
4. ❌ 이미지 업로드 API (media)
5. ❌ 공통 컴포넌트 Props 타입
6. ❌ 라우팅 가드 (Protected Route)
7. ❌ 로딩 스테이트 타입
8. ❌ Toast 알림 시스템
9. ❌ Optimistic Update 패턴
10. ❌ 에러 바운더리
11. ❌ 환경 변수 타입
12. ❌ 모바일 제스처
13. ❌ **실제 브랜드 컬러** (로고 기반)
14. ❌ **i18n 설정** (한/영)
15. ❌ 모임 탐색 API (discovery)

---

## 목차

1. [API Response 스키마 (완전판)](#1-api-response-스키마-완전판)
2. [공통 컴포넌트 Props 타입](#2-공통-컴포넌트-props-타입)
3. [라우팅 시스템](#3-라우팅-시스템)
4. [상태 관리 전략](#4-상태-관리-전략)
5. [디자인 토큰 (로고 기반)](#5-디자인-토큰-로고-기반)
6. [폼 유효성 검사 (Zod)](#6-폼-유효성-검사-zod)
7. [에러 메시지 & Toast](#7-에러-메시지--toast)
8. [i18n 설정 (한/영)](#8-i18n-설정-한영)
9. [MSW 핸들러 (완전판)](#9-msw-핸들러-완전판)
10. [환경 변수 타입](#10-환경-변수-타입)

---

## 1. API Response 스키마 (완전판)

### 1.1 인증 API

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    profileImage?: string;
    createdAt: string;
  };
}

// POST /api/auth/signup
interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

interface SignupResponse {
  user: User;
}

// POST /api/auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
```

### 1.2 어카운트 API

```typescript
// GET /api/users/me
interface UserProfileResponse {
  id: string;
  email: string;
  nickname: string;
  profileImage?: string;
  hasGroups: boolean;    // 온보딩 분기용
  isNewUser: boolean;    // 가입 후 7일 이내
  createdAt: string;
}

// GET /api/users/me/account
interface AccountResponse {
  balance: number;          // 가용 잔액
  lockedBalance: number;    // 락 잔액
  total: number;            // 총 잔액
  locks: Array<{
    groupId: string;
    groupName: string;
    amount: number;
    lockedAt: string;
  }>;
}

// POST /api/users/me/account/charge
interface ChargeRequest {
  amount: number;           // 충전 금액
  paymentMethod: 'tosspay'; // MVP: 토스페이만
  returnUrl: string;        // 충전 후 복귀 URL
}

interface ChargeResponse {
  transactionId: string;
  newBalance: number;
  chargedAt: string;
}

// GET /api/users/me/account/transactions
interface TransactionListResponse {
  transactions: Array<{
    id: string;
    type: 'charge' | 'withdraw' | 'join' | 'lock' | 'unlock';
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
  }>;
  totalPages: number;
}
```

### 1.3 모임 API

```typescript
// GET /api/groups (모임 탐색)
interface GroupListRequest {
  category?: 'STUDY' | 'HOBBY' | 'SPORTS' | 'CULTURE' | 'ETC';
  keyword?: string;
  page: number;
  limit: number;
}

interface GroupListResponse {
  groups: Array<{
    id: string;
    name: string;
    category: string;
    monthlyFee: number;
    currentMembers: number;
    maxMembers: number;
    imageUrl?: string;
  }>;
  totalPages: number;
  totalCount: number;
}

// GET /api/groups/popular (온보딩용)
interface PopularGroupsResponse {
  groups: Array<{
    id: string;
    name: string;
    category: string;
    monthlyFee: number;
    currentMembers: number;
    thumbnail?: string;
  }>;
}

// POST /api/groups (모임 생성)
interface CreateGroupRequest {
  name: string;
  description: string;
  category: 'STUDY' | 'HOBBY' | 'SPORTS' | 'CULTURE' | 'ETC';
  monthlyFee: number;
  maxMembers: number;
  imageUrl?: string;
}

interface CreateGroupResponse {
  groupId: string;
  createdAt: string;
}

// GET /api/groups/:id
interface GroupDetailResponse {
  id: string;
  name: string;
  description: string;
  category: 'STUDY' | 'HOBBY' | 'SPORTS' | 'CULTURE' | 'ETC';
  monthlyFee: number;       // 월 납입금
  depositAmount: number;    // 보증금 (= monthlyFee)
  maxMembers: number;
  currentMembers: number;
  balance: number;          // 계모임 금고 잔액
  cpId: string;
  cpNickname: string;
  imageUrl?: string;
  status: 'recruiting' | 'active' | 'completed';
  isMember: boolean;        // 현재 유저가 멤버인지
  role?: 'cp' | 'member';   // 멤버인 경우 역할
  createdAt: string;
}

// POST /api/groups/:id/join
interface JoinGroupRequest {
  userId: string;
}

interface JoinGroupResponse {
  membershipId: string;
  lockedAmount: number;     // 락된 보증금
  joinedAt: string;
}

// POST /api/groups/:id/leave (보증금 해제 - 탈퇴)
interface LeaveGroupRequest {
  reason?: string;
}

interface LeaveGroupResponse {
  unlockedAmount: number;   // 반환된 보증금
  newBalance: number;
  leftAt: string;
}

// POST /api/groups/:id/complete (보증금 해제 - 완주, CP만)
interface CompleteGroupRequest {
  completedAt: string;
}

interface CompleteGroupResponse {
  completedMembers: Array<{
    userId: string;
    unlockedAmount: number;
  }>;
}

// GET /api/my-groups (나의 모임)
interface MyGroupsResponse {
  groups: Array<{
    id: string;
    name: string;
    role: 'cp' | 'member';
    thumbnail?: string;
    status: 'active' | 'completed';
    newPosts: number;       // 읽지 않은 글 수
    pendingVotes: number;   // 미투표 건수
  }>;
}

// GET /api/groups/:id/members
interface MemberListResponse {
  members: Array<{
    id: string;
    nickname: string;
    avatar?: string;
    role: 'cp' | 'member';
    joinedAt: string;
  }>;
}
```

### 1.4 피드 API (댓글 포함)

```typescript
// GET /api/groups/:groupId/posts
interface PostListRequest {
  page: number;
  limit: number;            // 20개 고정
}

interface PostListResponse {
  posts: Array<{
    id: string;
    authorId: string;
    authorNickname: string;
    authorAvatar?: string;
    content: string;
    images: Array<{
      url: string;
      order: number;
    }>;
    isAnnouncement: boolean; // 공지 여부
    likeCount: number;
    commentCount: number;
    isLikedByMe: boolean;
    createdAt: string;
  }>;
  totalPages: number;
  totalCount: number;
}

// POST /api/groups/:groupId/posts
interface CreatePostRequest {
  content: string;
  imageUrls?: string[];
  isAnnouncement?: boolean; // CP만 가능
}

interface CreatePostResponse {
  postId: string;
  createdAt: string;
}

// POST /api/posts/:postId/like
interface LikeResponse {
  liked: boolean;
  count: number;
}

// ⭐ 댓글 API (v1.0에서 누락)
// GET /api/posts/:postId/comments
interface CommentListResponse {
  comments: Array<{
    id: string;
    postId: string;
    parentId?: string;        // 대댓글인 경우
    authorId: string;
    authorNickname: string;
    authorAvatar?: string;
    content: string;
    likeCount: number;
    isLikedByMe: boolean;
    replies?: Comment[];      // 대댓글 목록 (1단계만)
    createdAt: string;
  }>;
}

// POST /api/posts/:postId/comments
interface CreateCommentRequest {
  content: string;
  parentId?: string;          // 대댓글인 경우
}

interface CreateCommentResponse {
  commentId: string;
  createdAt: string;
}

// POST /api/comments/:commentId/like
interface CommentLikeResponse {
  liked: boolean;
  count: number;
}

// POST /api/groups/:groupId/media (이미지 업로드)
interface UploadMediaRequest {
  file: File;
}

interface UploadMediaResponse {
  url: string;
  thumbnailUrl?: string;
}
```

### 1.5 장부 API

```typescript
// GET /api/groups/:groupId/ledger/summary
interface LedgerSummaryResponse {
  totalBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
}

// GET /api/groups/:groupId/ledger
interface LedgerEntryListResponse {
  entries: Array<{
    id: string;
    type: 'income' | 'expense' | 'deposit_in' | 'deposit_out';
    amount: number;
    balanceAfter: number;
    category?: string;
    memo?: string;
    userId: string;
    userNickname: string;
    voteId?: string;         // 투표 연결 (지출인 경우)
    createdAt: string;
  }>;
  totalPages: number;
}
```

### 1.6 투표 API

```typescript
// GET /api/groups/:groupId/votes
interface VoteListRequest {
  status?: 'open' | 'approved' | 'rejected' | 'expired';
}

interface VoteListResponse {
  votes: Array<{
    id: string;
    type: 'expense' | 'kick' | 'rule_change';
    title: string;
    description?: string;
    amount?: number;         // expense인 경우
    requiredRatio: number;   // 0.5 (50%) 또는 0.67 (67%)
    yesCount: number;
    noCount: number;
    abstainCount: number;
    myVote?: 'approve' | 'reject' | 'abstain';
    status: 'open' | 'approved' | 'rejected' | 'expired';
    expiresAt: string;
    createdAt: string;
  }>;
}

// POST /api/groups/:groupId/votes (지출 요청)
interface CreateVoteRequest {
  type: 'expense' | 'kick' | 'rule_change';
  title: string;
  description?: string;
  amount?: number;
  targetUserId?: string;    // kick인 경우
}

interface CreateVoteResponse {
  voteId: string;
  expiresAt: string;
}

// POST /api/votes/:voteId/cast
interface CastVoteRequest {
  vote: 'approve' | 'reject' | 'abstain';
}

interface CastVoteResponse {
  yesCount: number;
  noCount: number;
  abstainCount: number;
  myVote: 'approve' | 'reject' | 'abstain';
}
```

### 1.7 Django 분석 API

```typescript
// POST /api/analyze/monthly-stats
interface MonthlyStatsRequest {
  transactions: Array<{
    date: string;
    amount: number;
    category: string;
  }>;
}

interface MonthlyStatsResponse {
  total: number;
  avgPerDay: number;
  categories: Record<string, number>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;    // 전월 대비 증감률
}

// POST /api/analyze/category-ratio
interface CategoryRatioRequest {
  transactions: Array<{
    category: string;
    amount: number;
  }>;
}

interface CategoryRatioResponse {
  ratios: Array<{
    category: string;
    amount: number;
    percent: number;
  }>;
}

// POST /api/analyze/trend
interface TrendRequest {
  transactions: Array<{
    date: string;
    amount: number;
  }>;
}

interface TrendResponse {
  monthly: Array<{
    month: string;
    total: number;
  }>;
  prediction: number;       // 다음 달 예상 지출
}
```

---

## 2. 공통 컴포넌트 Props 타입

```typescript
// Skeleton 컴포넌트
interface SkeletonProps {
  variant: 'card' | 'list' | 'page' | 'text' | 'circle';
  count?: number;
  className?: string;
}

// EmptyState 컴포넌트
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Header 컴포넌트
interface HeaderProps {
  showBalance?: boolean;    // 잔액 표시 여부
  showBackButton?: boolean; // 뒤로가기 버튼
  title?: string;           // 페이지 제목
}

// BottomNav 컴포넌트
interface BottomNavProps {
  currentPath: string;
}

// Modal (Radix Dialog)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

// BottomSheet
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[];    // [0.5, 0.9] - 50%, 90%
  children: React.ReactNode;
}

// Toast 타입
interface ToastOptions {
  variant: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;        // ms
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Button 컴포넌트
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Card 컴포넌트
interface CardProps {
  variant: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

---

## 3. 라우팅 시스템

```typescript
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public Routes
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup/*',
        element: <SignupFlow />,
      },

      // Protected Routes
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: '/mypage',
            element: <MyPage />,
          },
          {
            path: '/charge',
            element: <ChargePage />,
          },
          {
            path: '/my-groups',
            element: <MyGroupsPage />,
          },
          {
            path: '/groups',
            children: [
              {
                path: 'create/*',
                element: <CreateGroupFlow />,
              },
              {
                path: ':id',
                element: <GroupDetailPage />,
                children: [
                  {
                    path: 'feed',
                    element: <FeedTab />,
                  },
                  {
                    path: 'ledger',
                    element: <LedgerTab />,
                  },
                  {
                    path: 'votes',
                    element: <VotesTab />,
                  },
                  {
                    path: 'members',
                    element: <MembersTab />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

// src/router/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

---

## 4. 상태 관리 전략

```typescript
// src/stores/uiStore.ts (Zustand)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // 사이드바
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // 모달
  currentModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  // 언어 (i18n)
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;

  // 테마 (Post-Demo)
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      currentModal: null,
      openModal: (id) => set({ currentModal: id }),
      closeModal: () => set({ currentModal: null }),

      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),

      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'woorido-ui-store',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
      }),
    }
  )
);

// src/hooks/useToast.ts
import { toast as sonnerToast } from 'sonner';

export const useToast = () => {
  const showToast = ({ variant, title, description, duration = 3000, action }: ToastOptions) => {
    const toastFn = {
      success: sonnerToast.success,
      error: sonnerToast.error,
      info: sonnerToast.info,
      warning: sonnerToast.warning,
    }[variant];

    toastFn(title, {
      description,
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    });
  };

  return { showToast };
};

// src/hooks/useOptimisticUpdate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useLikePost = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likePost,
    onMutate: async () => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: PostListResponse) => ({
        ...old,
        posts: old.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLikedByMe: !post.isLikedByMe,
                likeCount: post.isLikedByMe ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        ),
      }));

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
```

---

## 5. 디자인 토큰 (로고 기반)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand Colors (로고 기반)
        brand: {
          50: '#fff5f2',   // 매우 밝은 오렌지
          100: '#ffe6dc',
          200: '#ffc9b3',
          300: '#ffa680',
          400: '#ff7a4d',
          500: '#ff5722',  // Primary - 로고 오렌지
          600: '#e64a19',  // Hover
          700: '#d84315',  // Active
          800: '#bf360c',
          900: '#a12900',
        },
        // Semantic Colors
        success: {
          50: '#f0fdf4',
          500: '#10b981',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          700: '#1d4ed8',
        },
        // Neutrals
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontSize: {
        // Typography Scale
        'display': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],      // 48px
        'h1': ['2.25rem', { lineHeight: '1.3', fontWeight: '700' }],        // 36px
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],       // 30px
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],         // 24px
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],        // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }],  // 18px
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],         // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],  // 14px
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],   // 12px
      },
      spacing: {
        // 8px Grid System
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
      },
      borderRadius: {
        // Rounded System
        'card': '1rem',     // 16px
        'button': '0.5rem', // 8px
        'input': '0.5rem',  // 8px
        'badge': '9999px',  // 완전한 원형
      },
      boxShadow: {
        // Elevation
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        // Micro-interactions
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;

// src/styles/glassmorphism.css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.glass-card-dark {
  background: rgba(17, 24, 39, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 6. 폼 유효성 검사 (Zod)

```typescript
import { z } from 'zod';

// 로그인
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상입니다'),
});

// 회원가입
export const signupSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상입니다')
    .regex(/[A-Z]/, '대문자를 1개 이상 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 1개 이상 포함해야 합니다')
    .regex(/[!@#$%^&*]/, '특수문자를 1개 이상 포함해야 합니다'),
  nickname: z
    .string()
    .min(2, '닉네임은 최소 2자 이상입니다')
    .max(10, '닉네임은 최대 10자입니다')
    .regex(/^[a-zA-Z가-힣0-9]+$/, '닉네임은 한글, 영문, 숫자만 가능합니다'),
});

// 충전
export const chargeSchema = z.object({
  amount: z
    .number()
    .min(10000, '최소 충전 금액은 10,000원입니다')
    .max(1000000, '최대 충전 금액은 1,000,000원입니다')
    .multipleOf(1000, '1,000원 단위로 입력해주세요'),
});

// 모임 생성
export const createGroupSchema = z.object({
  name: z.string().min(2, '모임 이름은 최소 2자 이상입니다').max(20, '모임 이름은 최대 20자입니다'),
  description: z.string().min(10, '모임 소개는 최소 10자 이상입니다').max(500, '모임 소개는 최대 500자입니다'),
  category: z.enum(['STUDY', 'HOBBY', 'SPORTS', 'CULTURE', 'ETC']),
  monthlyFee: z.number().min(10000, '월 납입금은 최소 10,000원입니다').multipleOf(1000, '1,000원 단위로 입력해주세요'),
  maxMembers: z.number().min(2, '최소 2명 이상').max(50, '최대 50명'),
});

// 글 작성
export const createPostSchema = z.object({
  content: z.string().min(1, '내용을 입력해주세요').max(2000, '최대 2,000자입니다'),
  imageUrls: z.array(z.string().url()).max(10, '이미지는 최대 10장까지 업로드할 수 있습니다').optional(),
  isAnnouncement: z.boolean().optional(),
});

// 댓글 작성
export const createCommentSchema = z.object({
  content: z.string().min(1, '내용을 입력해주세요').max(500, '최대 500자입니다'),
});

// 지출 요청
export const createVoteSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(200, '최대 200자입니다'),
  description: z.string().max(1000, '최대 1,000자입니다').optional(),
  amount: z.number().min(1, '금액을 입력해주세요'),
});
```

---

## 7. 에러 메시지 & Toast

```typescript
// src/constants/errorMessages.ts
export const ERROR_MESSAGES = {
  // 인증
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다',
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다',
  INVALID_TOKEN: '로그인이 만료되었습니다. 다시 로그인해주세요',
  SIGNUP_FAILED: '회원가입에 실패했습니다. 다시 시도해주세요',

  // 어카운트
  INSUFFICIENT_BALANCE: '잔액이 부족합니다. 충전 후 다시 시도해주세요',
  CHARGE_FAILED: '충전에 실패했습니다. 잠시 후 다시 시도해주세요',
  PAYMENT_CANCELED: '결제가 취소되었습니다',
  WITHDRAW_FAILED: '출금 신청에 실패했습니다',

  // 모임
  GROUP_FULL: '모임 정원이 가득 찼습니다',
  ALREADY_JOINED: '이미 가입한 모임입니다',
  NOT_A_MEMBER: '모임 멤버만 접근할 수 있습니다',
  CREATE_GROUP_FAILED: '모임 생성에 실패했습니다',
  JOIN_FAILED: '모임 가입에 실패했습니다',

  // 피드
  CREATE_POST_FAILED: '게시글 작성에 실패했습니다',
  DELETE_POST_FAILED: '게시글 삭제에 실패했습니다',
  UPLOAD_IMAGE_FAILED: '이미지 업로드에 실패했습니다',

  // 투표
  ALREADY_VOTED: '이미 투표에 참여했습니다',
  VOTE_EXPIRED: '투표가 마감되었습니다',
  INSUFFICIENT_PERMISSION: 'CP만 수행할 수 있는 작업입니다',
  CREATE_VOTE_FAILED: '투표 생성에 실패했습니다',
  CAST_VOTE_FAILED: '투표 참여에 실패했습니다',

  // 일반
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다. (최대 5MB)',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다',
} as const;

// src/constants/successMessages.ts
export const SUCCESS_MESSAGES = {
  // 인증
  LOGIN_SUCCESS: '로그인되었습니다',
  LOGOUT_SUCCESS: '로그아웃되었습니다',
  SIGNUP_SUCCESS: '회원가입이 완료되었습니다',

  // 어카운트
  CHARGE_SUCCESS: '충전이 완료되었습니다',
  WITHDRAW_SUCCESS: '출금 신청이 완료되었습니다',

  // 모임
  CREATE_GROUP_SUCCESS: '모임이 생성되었습니다',
  JOIN_SUCCESS: '모임에 가입되었습니다',
  LEAVE_SUCCESS: '모임에서 탈퇴했습니다',

  // 피드
  CREATE_POST_SUCCESS: '게시글이 작성되었습니다',
  DELETE_POST_SUCCESS: '게시글이 삭제되었습니다',

  // 투표
  CREATE_VOTE_SUCCESS: '투표가 생성되었습니다',
  CAST_VOTE_SUCCESS: '투표가 완료되었습니다',

  // 일반
  COPY_SUCCESS: '클립보드에 복사되었습니다',
  SAVE_SUCCESS: '저장되었습니다',
} as const;

// src/components/Toast/index.tsx
import { Toaster } from 'sonner';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'white',
          color: '#111827',
          border: '1px solid #e5e7eb',
        },
        className: 'toast',
        duration: 3000,
      }}
      icons={{
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
      }}
    />
  );
};
```

---

## 8. i18n 설정 (한/영)

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ko from './locales/ko.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    fallbackLng: 'ko',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// src/i18n/locales/ko.json
{
  "common": {
    "login": "로그인",
    "logout": "로그아웃",
    "signup": "회원가입",
    "cancel": "취소",
    "confirm": "확인",
    "save": "저장",
    "delete": "삭제",
    "edit": "수정",
    "back": "뒤로"
  },
  "nav": {
    "home": "홈",
    "discover": "탐색",
    "create": "생성",
    "myGroups": "내 모임",
    "myPage": "MY"
  },
  "account": {
    "balance": "가용 잔액",
    "lockedBalance": "락 잔액",
    "totalBalance": "총 잔액",
    "charge": "충전하기",
    "withdraw": "출금하기",
    "history": "거래 내역"
  },
  "group": {
    "monthlyFee": "월 납입금",
    "deposit": "보증금",
    "members": "멤버",
    "join": "가입하기",
    "leave": "탈퇴하기",
    "status": {
      "recruiting": "모집 중",
      "active": "활동 중",
      "completed": "완료"
    }
  },
  "feed": {
    "createPost": "새 글 작성",
    "announcement": "공지사항",
    "like": "좋아요",
    "comment": "댓글",
    "reply": "답글"
  },
  "vote": {
    "approve": "찬성",
    "reject": "반대",
    "abstain": "기권",
    "deadline": "마감 시간",
    "createVote": "지출 요청"
  },
  "error": {
    "loginFailed": "이메일 또는 비밀번호가 올바르지 않습니다",
    "insufficientBalance": "잔액이 부족합니다",
    "networkError": "네트워크 오류가 발생했습니다"
  }
}

// src/i18n/locales/en.json
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "signup": "Sign Up",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back"
  },
  "nav": {
    "home": "Home",
    "discover": "Discover",
    "create": "Create",
    "myGroups": "My Groups",
    "myPage": "MY"
  },
  "account": {
    "balance": "Available Balance",
    "lockedBalance": "Locked Balance",
    "totalBalance": "Total Balance",
    "charge": "Charge",
    "withdraw": "Withdraw",
    "history": "Transaction History"
  },
  "group": {
    "monthlyFee": "Monthly Fee",
    "deposit": "Deposit",
    "members": "Members",
    "join": "Join",
    "leave": "Leave",
    "status": {
      "recruiting": "Recruiting",
      "active": "Active",
      "completed": "Completed"
    }
  },
  "feed": {
    "createPost": "Create Post",
    "announcement": "Announcement",
    "like": "Like",
    "comment": "Comment",
    "reply": "Reply"
  },
  "vote": {
    "approve": "Approve",
    "reject": "Reject",
    "abstain": "Abstain",
    "deadline": "Deadline",
    "createVote": "Request Expense"
  },
  "error": {
    "loginFailed": "Invalid email or password",
    "insufficientBalance": "Insufficient balance",
    "networkError": "Network error occurred"
  }
}

// src/components/LanguageToggle.tsx
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/uiStore';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useUIStore();

  const handleToggle = () => {
    const newLang = language === 'ko' ? 'en' : 'ko';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 text-sm rounded-button hover:bg-gray-100"
    >
      <span className="text-base">{language === 'ko' ? '🇰🇷' : '🇺🇸'}</span>
      <span>{language === 'ko' ? 'KO' : 'EN'}</span>
    </button>
  );
};

// 사용 예시
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.login')}</h1>
      <button>{t('common.confirm')}</button>
    </div>
  );
}
```

---

## 9. MSW 핸들러 (완전판)

```typescript
// src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as LoginRequest;

    if (email === 'test@woorido.com' && password === 'Test1234!') {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@woorido.com',
          nickname: '김철수',
          profileImage: null,
          createdAt: '2025-01-01T00:00:00Z',
        },
      });
    }

    return HttpResponse.json(
      { message: ERROR_MESSAGES.LOGIN_FAILED },
      { status: 401 }
    );
  }),

  // POST /api/auth/signup
  http.post('/api/auth/signup', async ({ request }) => {
    const data = await request.json() as SignupRequest;

    if (data.email === 'existing@woorido.com') {
      return HttpResponse.json(
        { message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      user: {
        id: '2',
        email: data.email,
        nickname: data.nickname,
        createdAt: new Date().toISOString(),
      },
    });
  }),
];

// src/mocks/handlers/account.ts
export const accountHandlers = [
  // GET /api/users/me
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@woorido.com',
      nickname: '김철수',
      hasGroups: true,
      isNewUser: false,
      createdAt: '2025-01-01T00:00:00Z',
    });
  }),

  // GET /api/users/me/account
  http.get('/api/users/me/account', () => {
    return HttpResponse.json({
      balance: 300000,
      lockedBalance: 200000,
      total: 500000,
      locks: [
        {
          groupId: '1',
          groupName: '책벌레들',
          amount: 100000,
          lockedAt: '2025-01-01T00:00:00Z',
        },
        {
          groupId: '2',
          groupName: '영화광들',
          amount: 100000,
          lockedAt: '2025-01-05T00:00:00Z',
        },
      ],
    });
  }),

  // POST /api/users/me/account/charge
  http.post('/api/users/me/account/charge', async ({ request }) => {
    const { amount } = await request.json() as ChargeRequest;

    return HttpResponse.json({
      transactionId: 'tx-' + Date.now(),
      newBalance: 300000 + amount,
      chargedAt: new Date().toISOString(),
    });
  }),
];

// src/mocks/handlers/groups.ts
export const groupHandlers = [
  // GET /api/groups/:id
  http.get('/api/groups/:id', ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      id,
      name: '책벌레들',
      description: '한 달에 한 권씩 독서하는 모임입니다',
      category: 'STUDY',
      monthlyFee: 100000,
      depositAmount: 100000,
      maxMembers: 10,
      currentMembers: 8,
      balance: 800000,
      cpId: '1',
      cpNickname: '김철수',
      isMember: true,
      role: 'cp',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
    });
  }),

  // GET /api/my-groups
  http.get('/api/my-groups', () => {
    return HttpResponse.json({
      groups: [
        {
          id: '1',
          name: '책벌레들',
          role: 'cp',
          thumbnail: 'https://picsum.photos/200',
          status: 'active',
          newPosts: 3,
          pendingVotes: 1,
        },
        {
          id: '2',
          name: '영화광들',
          role: 'member',
          thumbnail: 'https://picsum.photos/201',
          status: 'active',
          newPosts: 0,
          pendingVotes: 0,
        },
      ],
    });
  }),

  // GET /api/groups/popular
  http.get('/api/groups/popular', () => {
    return HttpResponse.json({
      groups: [
        {
          id: '3',
          name: '주말 등산',
          category: 'SPORTS',
          monthlyFee: 50000,
          currentMembers: 5,
          thumbnail: 'https://picsum.photos/202',
        },
        {
          id: '4',
          name: '맛집 탐방',
          category: 'CULTURE',
          monthlyFee: 150000,
          currentMembers: 8,
          thumbnail: 'https://picsum.photos/203',
        },
      ],
    });
  }),
];

// src/mocks/handlers/posts.ts
export const postHandlers = [
  // GET /api/groups/:groupId/posts
  http.get('/api/groups/:groupId/posts', () => {
    return HttpResponse.json({
      posts: [
        {
          id: '1',
          authorId: '1',
          authorNickname: '김철수',
          content: '이번 달 모임 장소가 변경되었습니다!',
          images: [],
          isAnnouncement: true,
          likeCount: 8,
          commentCount: 5,
          isLikedByMe: true,
          createdAt: '2025-01-15T10:00:00Z',
        },
        {
          id: '2',
          authorId: '2',
          authorNickname: '이영희',
          content: '책 완독 인증합니다! 📚',
          images: [{ url: 'https://picsum.photos/400', order: 1 }],
          isAnnouncement: false,
          likeCount: 12,
          commentCount: 3,
          isLikedByMe: false,
          createdAt: '2025-01-15T09:30:00Z',
        },
      ],
      totalPages: 5,
      totalCount: 100,
    });
  }),

  // POST /api/groups/:groupId/posts
  http.post('/api/groups/:groupId/posts', async ({ request }) => {
    const data = await request.json() as CreatePostRequest;

    return HttpResponse.json({
      postId: 'post-' + Date.now(),
      createdAt: new Date().toISOString(),
    });
  }),

  // POST /api/posts/:postId/like
  http.post('/api/posts/:postId/like', () => {
    return HttpResponse.json({
      liked: true,
      count: 13,
    });
  }),
];

// src/mocks/handlers/comments.ts
export const commentHandlers = [
  // GET /api/posts/:postId/comments
  http.get('/api/posts/:postId/comments', () => {
    return HttpResponse.json({
      comments: [
        {
          id: '1',
          postId: '2',
          authorId: '3',
          authorNickname: '박민수',
          content: '저도 다 읽었어요! 👏',
          likeCount: 5,
          isLikedByMe: true,
          replies: [
            {
              id: '2',
              postId: '2',
              parentId: '1',
              authorId: '2',
              authorNickname: '이영희',
              content: '@박민수 고생하셨어요~',
              likeCount: 2,
              isLikedByMe: false,
              createdAt: '2025-01-15T09:35:00Z',
            },
          ],
          createdAt: '2025-01-15T09:32:00Z',
        },
      ],
    });
  }),

  // POST /api/posts/:postId/comments
  http.post('/api/posts/:postId/comments', async ({ request }) => {
    const data = await request.json() as CreateCommentRequest;

    return HttpResponse.json({
      commentId: 'comment-' + Date.now(),
      createdAt: new Date().toISOString(),
    });
  }),
];

// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { accountHandlers } from './handlers/account';
import { groupHandlers } from './handlers/groups';
import { postHandlers } from './handlers/posts';
import { commentHandlers } from './handlers/comments';

export const worker = setupWorker(
  ...authHandlers,
  ...accountHandlers,
  ...groupHandlers,
  ...postHandlers,
  ...commentHandlers
);
```

---

## 10. 환경 변수 타입

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DJANGO_API_URL: string;
  readonly VITE_ENABLE_MSW: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_TOSSPAY_CLIENT_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_KAKAO_CLIENT_ID: string;
  readonly VITE_S3_BUCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DJANGO_API_URL=http://localhost:8000
VITE_ENABLE_MSW=true
VITE_ENABLE_DEVTOOLS=true
VITE_TOSSPAY_CLIENT_KEY=test_ck_XXXXX
VITE_S3_BUCKET_URL=https://woorido-dev.s3.ap-northeast-2.amazonaws.com

// .env.production
VITE_API_BASE_URL=https://api.woorido.com/api
VITE_DJANGO_API_URL=https://analytics.woorido.com
VITE_ENABLE_MSW=false
VITE_ENABLE_DEVTOOLS=false
VITE_TOSSPAY_CLIENT_KEY=live_ck_XXXXX
VITE_S3_BUCKET_URL=https://woorido-prod.s3.ap-northeast-2.amazonaws.com
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-30 | v1.0 | 초안 작성 |
| 2025-12-30 | v2.0 | **PM 검증 완료**: 15개 누락 스펙 추가, 로고 기반 디자인 토큰, i18n 설정, 댓글 API, 보증금 해제 API, 공통 컴포넌트 Props, 라우팅 가드, Toast 시스템, Optimistic Update, 환경 변수 타입, MSW 완전판 |

---

**이 문서는 개발하면서 지속적으로 업데이트됩니다.**
