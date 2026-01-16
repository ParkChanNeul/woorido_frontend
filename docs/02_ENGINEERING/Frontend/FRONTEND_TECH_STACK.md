# WOORIDO Frontend Tech Stack

> **Purpose**: 프론트엔드 기술 스택 및 아키텍처 정의
> **Framework**: React 18 + TypeScript + Vite
> **Design System**: [WDS (WooriDo Design System)](./DesignSystem/DESIGN_TOKENS.md)
> **Last Updated**: 2026-01-15

---

## 1. 핵심 스택 요약

| 카테고리 | 선택 | 이유 |
|----------|------|------|
| **Framework** | React 18 + Vite | 빠른 빌드, HMR, TypeScript 지원 |
| **상태 관리** | React Query + Zustand | Server/Client 분리, 초경량 |
| **CSS 스타일링** | CSS Variables + CSS Modules | WDS 토큰 일원화, 장기 유지보수 |
| **UI Primitives** | Radix UI | Headless, 접근성, WDS 스타일 자유 |
| **BottomSheet** | vaul | Radix 호환, 제스처 내장, 5KB |
| **Toast** | sonner | 간편, 애니메이션 우수 |
| **애니메이션** | Framer Motion | Skeleton, 전환 효과 |
| **캘린더** | react-day-picker + schedule-x | Date Picker + 캘린더 뷰 |
| **폼** | react-hook-form + zod | 가벼움, 타입 안전 |
| **차트** | Recharts | React 네이티브, 커스텀 쉬움 |

---

## 2. Dependencies

### 2.1 Production Dependencies

```json
{
  "dependencies": {
    // === Framework ===
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^7.0.0",
    
    // === UI Primitives (Radix) ===
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    
    // === Overlay ===
    "vaul": "^1.0.0",
    "sonner": "^2.0.0",
    
    // === Animation ===
    "framer-motion": "^11.0.0",
    
    // === State Management ===
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    
    // === Form ===
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    
    // === Calendar ===
    "react-day-picker": "^9.0.0",
    "@schedule-x/react": "^2.0.0",
    "@schedule-x/events-service": "^2.0.0",
    
    // === Utilities ===
    "date-fns": "^3.6.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.12.0",
    "clsx": "^2.1.0"
  }
}
```

### 2.2 Dev Dependencies

```json
{
  "devDependencies": {
    // === Build ===
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    
    // === CSS ===
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    // === TypeScript ===
    "typescript": "^5.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    
    // === Linting ===
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 3. CSS 스타일링 전략

### 3.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **tokens.css가 Single Source of Truth** | 모든 WDS 토큰은 CSS 변수로 정의 |
| **컴포넌트 스타일은 CSS Modules** | 스코프 격리 + 토큰 변수 참조 |
| **Tailwind는 레이아웃 유틸리티만** | flex, gap, grid, padding (색상/폰트 X) |

### 3.2 폴더 구조

```
src/
├── styles/
│   ├── tokens.css           ← WDS 토큰 (Single Source of Truth)
│   ├── global.css           ← reset, 글로벌 스타일
│   └── utilities.css        ← 커스텀 유틸리티 (선택적)
│
├── components/
│   ├── Button/
│   │   ├── Button.tsx       ← 컴포넌트 로직
│   │   └── Button.module.css ← 스타일 (토큰 변수 참조)
│   └── ...
```

### 3.3 Tailwind 설정 (제한적)

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    // 색상, 폰트는 WDS 토큰 사용하므로 확장만
    extend: {},
  },
  corePlugins: {
    // 색상 관련 비활성화 (WDS 사용)
    backgroundColor: false,
    textColor: false,
    borderColor: false,
    
    // 레이아웃은 활성화
    display: true,
    flexbox: true,
    grid: true,
    gap: true,
    padding: true,
    margin: true,
  },
}
```

### 3.4 사용 패턴

```tsx
// Button.tsx
import styles from './Button.module.css';
import clsx from 'clsx';

function Button({ variant, fullWidth, children }) {
  return (
    <button 
      className={clsx(
        styles.button,              // CSS Module (토큰 기반)
        styles[variant],            // primary, secondary 등
        fullWidth && 'w-full',      // Tailwind 레이아웃만
        'flex items-center gap-2',
      )}
    >
      {children}
    </button>
  );
}
```

```css
/* Button.module.css */
.button {
  border-radius: var(--radius-sm);
  font-size: var(--font-w6-size);
  font-weight: var(--font-w6-weight);
  padding: var(--space-3) var(--space-4);
  transition: background-color var(--motion-duration-fast);
}

.primary {
  background-color: var(--color-orange-500);
  color: white;
}

.primary:hover {
  background-color: var(--color-orange-600);
}
```

---

## 4. 상태 관리 전략

### 4.1 상태 유형 분류

| 유형 | 저장소 | 예시 |
|------|-------|------|
| **Server State** | React Query | API 데이터 (챌린지, 피드, 유저) |
| **Client State** | useState | UI 상태 (모달 열림, 선택된 탭) |
| **Global Client State** | Zustand | 로그인 상태, 테마 |

### 4.2 React Query 설정

```tsx
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5분
      gcTime: 1000 * 60 * 30,     // 30분
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 4.3 Zustand Store

```tsx
// src/store/appStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Auth
  isLoggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      setLoggedIn: (value) => set({ isLoggedIn: value }),
      
      theme: 'light',
      toggleTheme: () => set((s) => ({ 
        theme: s.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    { name: 'woorido-app' }
  )
);
```

---

## 5. 캘린더 통합 전략

### 5.1 라이브러리 구성

| 라이브러리 | 용도 | 번들 |
|-----------|------|------|
| `react-day-picker` | 날짜 선택 (모임 생성 폼) | 3KB |
| `@schedule-x/react` | 캘린더 뷰 (모임+장부 타임라인) | 30KB |

### 5.2 통합 캘린더 데이터 구조

```typescript
interface CalendarEvent {
  id: string;
  type: 'MEETING' | 'SUPPORT' | 'EXPENSE' | 'ENTRY_FEE';
  date: Date;
  title: string;
  summary: string;
  amount?: number;
  link: string;
}
```

### 5.3 이벤트 타입별 표시

| Type | 아이콘 | 색상 | Tooltip 내용 |
|------|-------|------|-------------|
| `MEETING` | 📅 | Orange | 장소, 참석 현황 |
| `SUPPORT` | 💰 | Green | 납입 총액, 인원 |
| `EXPENSE` | 📤 | Grey | 지출 금액, 사유 |
| `ENTRY_FEE` | 🎫 | Purple | 입회비 금액, 신규 멤버 |

### 5.4 UX 흐름

| 액션 | 동작 |
|------|------|
| **날짜 호버** | Tooltip 등장 (모임/거래 요약) |
| **Tooltip 클릭** | 해당 페이지로 이동 |
| **모임 이벤트** | `/groups/:id/meetings/:meetingId` |
| **거래 이벤트** | `/groups/:id/ledger?date=YYYY-MM-DD` |

---

## 6. 컴포넌트 라이브러리 매핑

### 6.1 WDS → 라이브러리 매핑

| WDS 컴포넌트 | 라이브러리 | 패키지 |
|-------------|-----------|--------|
| Modal | Radix Dialog | `@radix-ui/react-dialog` |
| BottomSheet | vaul | `vaul` |
| Toast | Sonner | `sonner` |
| Tooltip | Radix Tooltip | `@radix-ui/react-tooltip` |
| Tabs | Radix Tabs | `@radix-ui/react-tabs` |
| Avatar | Radix Avatar | `@radix-ui/react-avatar` |
| ProgressBar | Radix Progress | `@radix-ui/react-progress` |
| Checkbox | Radix Checkbox | `@radix-ui/react-checkbox` |
| Switch | Radix Switch | `@radix-ui/react-switch` |
| Dropdown | Radix DropdownMenu | `@radix-ui/react-dropdown-menu` |
| Skeleton | 자체 구현 | Framer Motion |
| Spinner | 자체 구현 | CSS |
| Button | 자체 구현 | - |
| Input | 자체 구현 | - |
| Badge | 자체 구현 | - |

### 6.2 도메인 컴포넌트

| 컴포넌트 | 설명 | 의존성 |
|---------|------|-------|
| BrixBadge | 당도 뱃지 | Badge |
| FinancialText | 금액 표시 | - |
| StatusBadge | 상태 뱃지 | Badge |
| GroupCard | 챌린지 카드 | Avatar, Badge |
| PostCard | 게시글 카드 | Avatar, BrixBadge |
| VoteCard | 투표 카드 | ProgressBar |
| BalanceCard | 잔액 카드 | FinancialText |

---

## 7. 프로젝트 구조

```
src/
├── assets/                  # 정적 파일 (이미지, 폰트)
├── components/              # 공통 컴포넌트
│   ├── foundation/          # Button, Input, Avatar...
│   ├── overlay/             # Modal, BottomSheet, Toast...
│   ├── feedback/            # Skeleton, Spinner, EmptyState...
│   └── domain/              # BrixBadge, FinancialText, Cards...
├── features/                # 기능별 모듈
│   ├── auth/
│   ├── challenge/
│   ├── feed/
│   ├── ledger/
│   ├── meeting/
│   └── vote/
├── hooks/                   # 커스텀 훅
├── lib/                     # 유틸리티
│   ├── api.ts               # API 클라이언트
│   └── queryClient.ts       # React Query 설정
├── routes/                  # 라우트 정의
├── store/                   # Zustand 스토어
├── styles/                  # 글로벌 스타일
│   ├── tokens.css           # WDS 토큰
│   └── global.css           # 글로벌 스타일
├── types/                   # TypeScript 타입
├── App.tsx
├── main.tsx
```

---

## 8. 관련 문서

- [DESIGN_TOKENS.md](./DesignSystem/DESIGN_TOKENS.md) - WDS 메인 토큰
- [WDS_FOUNDATION.md](./DesignSystem/WDS_FOUNDATION.md) - 기초 컴포넌트
- [WDS_OVERLAY.md](./DesignSystem/WDS_OVERLAY.md) - 오버레이 컴포넌트
- [WDS_FEEDBACK.md](./DesignSystem/WDS_FEEDBACK.md) - 피드백 컴포넌트
- [WDS_DOMAIN.md](./DesignSystem/WDS_DOMAIN.md) - 도메인 컴포넌트
- [IA_SPECIFICATION.md](../UX_UI/IA_SPECIFICATION.md) - 화면 설계
