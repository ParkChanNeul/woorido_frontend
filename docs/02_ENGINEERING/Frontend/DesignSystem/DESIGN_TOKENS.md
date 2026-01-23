# WDS (WooriDo Design System) v2.0

> **Purpose**: React + TypeScript 환경을 위한 실용적 디자인 시스템
> **Philosophy**: TDS의 단순함 + M3의 시맨틱 + 우리두의 따뜻함
> **Brand Color**: `Mandarin Orange` #E9481E
> **Last Updated**: 2026-01-15

---

## 1. Overview

WDS는 **"따뜻한 커뮤니티 + 신뢰받는 금융"** 경험을 위한 디자인 시스템입니다.

### 핵심 원칙
- **Flat & Simple**: 복잡한 토큰 계층 대신 직관적인 플랫 구조
- **Warm Tone-on-Tone**: 모든 Grey에 브랜드 Orange 톤 반영
- **Domain-First**: 금융(Financial), 당도(Brix) 등 도메인 특화 토큰

### 패키지 구조
```
src/
├── theme/
│   ├── colors.ts       # 색상 토큰
│   ├── typography.ts   # 타이포그래피
│   ├── shape.ts        # 라운딩, 그림자
│   ├── motion.ts       # 애니메이션
│   └── index.ts        # 통합 export
```

---

## 2. Colors

### 2.1 Primary (Mandarin Orange)

브랜드 아이덴티티를 나타내는 주황색 팔레트입니다.

| Token | Value | Usage |
|-------|-------|-------|
| `colors.orange50` | #FFF7ED | 가장 연한 배경 |
| `colors.orange100` | #FFEDD5 | Container 배경 |
| `colors.orange200` | #FED7AA | Hover 배경 |
| `colors.orange300` | #FDBA74 | - |
| `colors.orange400` | #FB923C | Secondary |
| `colors.orange500` | **#E9481E** | **Primary (로고)** |
| `colors.orange600` | #D43D16 | Hover 상태 |
| `colors.orange700` | #BF310E | Active/Pressed |
| `colors.orange800` | #9A2A0B | - |
| `colors.orange900` | #7C2D12 | 가장 진한 |

### 2.2 Grey (Warm Stone)

톤온톤 원칙에 따라 Orange 톤이 살짝 섞인 따뜻한 회색입니다.

| Token | Value | Usage |
|-------|-------|-------|
| `colors.grey50` | #FAFAF9 | 앱 배경 |
| `colors.grey100` | #F5F5F4 | 카드/섹션 배경 |
| `colors.grey200` | #E7E5E4 | Divider |
| `colors.grey300` | #D6D3D1 | Border |
| `colors.grey400` | #A8A29E | Placeholder |
| `colors.grey500` | #78716C | Disabled Text |
| `colors.grey600` | #57534E | Sub Text |
| `colors.grey700` | #44403C | - |
| `colors.grey800` | #292524 | - |
| `colors.grey900` | #1C1917 | Main Text |

### 2.3 Semantic Colors

역할 기반의 시맨틱 토큰입니다.

| Token | Value | Usage |
|-------|-------|-------|
| `colors.background` | #FAFAF9 | 전체 배경 |
| `colors.surface` | #FFFFFF | 카드 표면 |
| `colors.surfaceGrey` | #F5F5F4 | 회색 표면 |
| `colors.textPrimary` | #1C1917 | 본문 텍스트 |
| `colors.textSecondary` | #57534E | 보조 텍스트 |
| `colors.textDisabled` | #78716C | 비활성 텍스트 |
| `colors.border` | #D6D3D1 | 기본 테두리 |
| `colors.divider` | #E7E5E4 | 구분선 |

### 2.4 Status Colors

상태를 나타내는 색상입니다.

| Token | Value | Usage |
|-------|-------|-------|
| `colors.success` | #16A34A | 성공, 완료 |
| `colors.warning` | #F59E0B | 경고, 주의 |
| `colors.error` | #DC2626 | 에러, 실패 |
| `colors.info` | #E9481E | 정보 (Primary 활용) |

### 2.5 Financial Colors

금융 도메인 전용 색상입니다. (토스 스타일: 지출은 빨간색 남용 지양)

| Token | Value | Usage |
|-------|-------|-------|
| `colors.income` | #F59E0B | 입금, 충전, 이익 (+) |
| `colors.expense` | #1C1917 | 지출, 출금 (-) |
| `colors.locked` | #78716C | 보증금, 잠긴 금액 |

### 2.6 Brix Colors (당도)

당도 시스템 전용 과일 색상입니다.

| Level | Token | Value | Range | Emoji |
|-------|-------|-------|-------|-------|
| Honey | `colors.brixHoney` | #F59E0B | 60+ | 🍯 |
| Grape | `colors.brixGrape` | #9333EA | 40~60 | 🍇 |
| Apple | `colors.brixApple` | #F43F5E | 25~40 | 🍎 |
| Mandarin | `colors.brixMandarin` | #E9481E | 12~25 | 🍊 |
| Tomato | `colors.brixTomato` | #FCA5A5 | 0~12 | 🍅 |
| Bitter | `colors.brixBitter` | #14532D | <0 | 🥒 |

---

## 3. Typography

### 3.1 Font Family

```css
--font-sans: 'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

### 3.2 Type Scale

Pretendard 기반의 타이포그래피 스케일입니다.

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `typography.w1` | 28px | 700 (Bold) | 1.35 | 마케팅 헤드라인 |
| `typography.w2` | 24px | 600 (SemiBold) | 1.4 | 화면 타이틀 |
| `typography.w3` | 20px | 600 (SemiBold) | 1.45 | 섹션 헤더 |
| `typography.w4` | 17px | 400 (Regular) | 1.55 | 본문 (Default) |
| `typography.w5` | 15px | 400 (Regular) | 1.5 | 보조 본문 |
| `typography.w6` | 13px | 500 (Medium) | 1.4 | 캡션, 라벨 |
| `typography.w7` | 11px | 500 (Medium) | 1.35 | 작은 캡션 |

### 3.3 Financial Typography

금액 표시 전용 스타일입니다. Tabular Nums로 숫자 정렬을 맞춥니다.

```css
.financial-text {
  font-family: var(--font-sans);
  font-weight: 600;
  font-feature-settings: "tnum";  /* 고정폭 숫자 */
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

| Token | Size | Usage |
|-------|------|-------|
| `typography.financialLarge` | 28px | 총 잔액 |
| `typography.financialMedium` | 20px | 거래 금액 |
| `typography.financialSmall` | 15px | 인라인 금액 |

---

## 4. Shape & Shadow

### 4.1 Border Radius

토스 스타일의 큰 라운딩을 적용합니다.

| Token | Value | Usage |
|-------|-------|-------|
| `shape.radiusSm` | 8px | 버튼, 인풋, 작은 요소 |
| `shape.radiusMd` | 12px | 칩, 토스트 |
| `shape.radiusLg` | 20px | 카드 |
| `shape.radiusXl` | 24px | 바텀시트, 모달 |
| `shape.radiusFull` | 9999px | 뱃지, 아바타, 원형 버튼 |

### 4.2 Shadow (Elevation)

부드러운 그림자로 깊이감을 표현합니다.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow.sm` | `0 1px 3px rgba(0,0,0,0.06)` | 기본 카드 |
| `shadow.md` | `0 4px 12px rgba(0,0,0,0.08)` | 호버 카드, 드롭다운 |
| `shadow.lg` | `0 8px 24px rgba(0,0,0,0.12)` | 모달, 바텀시트 |
| `shadow.xl` | `0 16px 48px rgba(0,0,0,0.16)` | 오버레이 |

---

## 5. Motion

### 5.1 Duration

| Token | Value | Usage |
|-------|-------|-------|
| `motion.durationFast` | 150ms | 호버, 토글, 마이크로 인터랙션 |
| `motion.durationNormal` | 250ms | 전환, 페이드 |
| `motion.durationSlow` | 400ms | 모달, 바텀시트, 페이지 전환 |

### 5.2 Easing

| Token | Value | Usage |
|-------|-------|-------|
| `motion.easeStandard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 기본 상호작용 |
| `motion.easeDecel` | `cubic-bezier(0, 0, 0.2, 1)` | 등장 애니메이션 |
| `motion.easeAccel` | `cubic-bezier(0.4, 0, 1, 1)` | 퇴장 애니메이션 |
| `motion.easeSpring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 바운스 효과 |

---

## 5.5 Dark Mode (PostDemo)

> [!NOTE]
> Dark Mode는 PostDemo에서 구현 예정입니다. 아래 토큰은 준비용입니다.

### Light Mode ↔ Dark Mode 매핑

| Semantic Token | Light Mode | Dark Mode |
|---------------|------------|-----------|
| `colors.background` | `grey50` (#FAFAF9) | `grey900` (#1C1917) |
| `colors.surface` | White (#FFFFFF) | `grey800` (#292524) |
| `colors.surfaceGrey` | `grey100` (#F5F5F4) | `grey700` (#44403C) |
| `colors.textPrimary` | `grey900` (#1C1917) | `grey50` (#FAFAF9) |
| `colors.textSecondary` | `grey600` (#57534E) | `grey400` (#A8A29E) |
| `colors.border` | `grey300` (#D6D3D1) | `grey600` (#57534E) |
| `colors.divider` | `grey200` (#E7E5E4) | `grey700` (#44403C) |

### CSS 구현 패턴

```css
/* tokens.css */
:root {
  /* Light Mode (기본) */
  --color-background: var(--color-grey-50);
  --color-surface: #FFFFFF;
  --color-text-primary: var(--color-grey-900);
  --color-text-secondary: var(--color-grey-600);
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-grey-900);
    --color-surface: var(--color-grey-800);
    --color-text-primary: var(--color-grey-50);
    --color-text-secondary: var(--color-grey-400);
  }
}

/* 수동 토글 지원 */
[data-theme="dark"] {
  --color-background: var(--color-grey-900);
  --color-surface: var(--color-grey-800);
  --color-text-primary: var(--color-grey-50);
  --color-text-secondary: var(--color-grey-400);
}
```

### Zustand Theme Store

```typescript
// src/store/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'woorido-theme' }
  )
);
```

---


## 6. Components

WDS 컴포넌트는 9개의 카테고리로 분류되어 별도 문서에서 관리됩니다.

| 카테고리 | 문서 | 포함 컴포넌트 |
|---------|------|-------------|
| **Foundation** | [WDS_FOUNDATION.md](./WDS_FOUNDATION.md) | Button, Input, Avatar, Badge, Chip, Divider |
| **Overlay** | [WDS_OVERLAY.md](./WDS_OVERLAY.md) | Modal, BottomSheet, Toast, Tooltip |
| **Feedback** | [WDS_FEEDBACK.md](./WDS_FEEDBACK.md) | Skeleton, Spinner, ProgressBar, EmptyState, AlertBanner, CountdownTimer, State Transition |
| **Domain** | [WDS_DOMAIN.md](./WDS_DOMAIN.md) | BrixBadge, FinancialText, StatusBadge, GroupCard, PostCard, VoteCard, BalanceCard, LedgerEntry, MeetingCard |
| **Ledger** | [WDS_LEDGER.md](./WDS_LEDGER.md) | LedgerSummaryCard, ChartWrapper, InsightCard, BarcodeCard, BarcodeModal, TransactionTimeline |
| **Calendar** | [WDS_CALENDAR.md](./WDS_CALENDAR.md) | EventCalendar, DatePicker, MiniCalendar, DateRangePicker, UpcomingEventCard |
| **Navigation** | [WDS_NAVIGATION.md](./WDS_NAVIGATION.md) | BottomNav, Header, SideNav, SegmentedControl, Breadcrumb |
| **Form** | [WDS_FORM.md](./WDS_FORM.md) | FormField, AmountInput, Select, TextArea, ImageUpload, CheckboxGroup, Form |
| **Responsive** | [WDS_RESPONSIVE.md](./WDS_RESPONSIVE.md) | Breakpoints, Asset Resolution, Layout Patterns |

---

## 7. Implementation

### 7.1 tokens.ts

```typescript
// src/theme/tokens.ts
export const colors = {
  // Primary
  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange200: '#FED7AA',
  orange300: '#FDBA74',
  orange400: '#FB923C',
  orange500: '#E9481E',
  orange600: '#D43D16',
  orange700: '#BF310E',
  orange800: '#9A2A0B',
  orange900: '#7C2D12',

  // Grey (Warm Stone)
  grey50: '#FAFAF9',
  grey100: '#F5F5F4',
  grey200: '#E7E5E4',
  grey300: '#D6D3D1',
  grey400: '#A8A29E',
  grey500: '#78716C',
  grey600: '#57534E',
  grey700: '#44403C',
  grey800: '#292524',
  grey900: '#1C1917',

  // Semantic
  background: '#FAFAF9',
  surface: '#FFFFFF',
  surfaceGrey: '#F5F5F4',
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textDisabled: '#78716C',
  border: '#D6D3D1',
  divider: '#E7E5E4',

  // Status
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#E9481E',

  // Financial
  income: '#F59E0B',
  expense: '#1C1917',
  locked: '#78716C',

  // Brix
  brixHoney: '#F59E0B',
  brixGrape: '#9333EA',
  brixApple: '#F43F5E',
  brixMandarin: '#E9481E',
  brixTomato: '#FCA5A5',
  brixBitter: '#14532D',
} as const;

export const typography = {
  w1: { fontSize: 28, fontWeight: 700, lineHeight: 1.35 },
  w2: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
  w3: { fontSize: 20, fontWeight: 600, lineHeight: 1.45 },
  w4: { fontSize: 17, fontWeight: 400, lineHeight: 1.55 },
  w5: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 },
  w6: { fontSize: 13, fontWeight: 500, lineHeight: 1.4 },
  w7: { fontSize: 11, fontWeight: 500, lineHeight: 1.35 },
  financialLarge: { fontSize: 28, fontWeight: 600, fontFeatureSettings: '"tnum"' },
  financialMedium: { fontSize: 20, fontWeight: 600, fontFeatureSettings: '"tnum"' },
  financialSmall: { fontSize: 15, fontWeight: 600, fontFeatureSettings: '"tnum"' },
} as const;

export const shape = {
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '20px',
  radiusXl: '24px',
  radiusFull: '9999px',
} as const;

export const shadow = {
  sm: '0 1px 3px rgba(0,0,0,0.06)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
  xl: '0 16px 48px rgba(0,0,0,0.16)',
} as const;

export const motion = {
  durationFast: '150ms',
  durationNormal: '250ms',
  durationSlow: '400ms',
  easeStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeDecel: 'cubic-bezier(0, 0, 0.2, 1)',
  easeAccel: 'cubic-bezier(0.4, 0, 1, 1)',
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// Type exports
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Shape = typeof shape;
export type Shadow = typeof shadow;
export type Motion = typeof motion;
```

---

## 관련 문서

- [IA_SPECIFICATION.md](../../../01_PLANNING/UX_UI/Architecture/IA_SPECIFICATION.md) - 화면 설계
- [FRONTEND_TECH_STACK.md](../FRONTEND_TECH_STACK.md) - 프론트엔드 기술 스택

