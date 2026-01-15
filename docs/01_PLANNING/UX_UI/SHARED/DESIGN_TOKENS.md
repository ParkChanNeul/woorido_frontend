# WOORIDO 디자인 시스템 v2.0 (Design System Specification)

> **Purpose**: React + TypeScript + Vite 환경을 위한 Type-Safe 디자인 시스템
> **Brand Identity**: 따뜻한 커뮤니티 (Tone-on-Tone) + 신뢰받는 금융 (Clean Typography)
> **Brand Color**: `Mandarin Orange` #E9481E
> **Documentation ID**: DS-2.0-2026

---

## 1. 아키텍처 (Architecture)

M3(Material Design 3)의 **3단 레이어 구조**를 채택하되, 도메인 특화 색상은 **Semantic Layer**에서 구체화합니다.

```mermaid
graph TD
    Ref[Reference Tokens <br/> (Raw Values)] --> Sys[System Tokens <br/> (M3 Roles)]
    Sys --> Sem[Semantic Tokens <br/> (Brix / Financial)]
    Sem --> Comp[Component Tokens <br/> (React Props)]
```

### React/TS 구현 전략 (`src/theme`)
*   **CSS Variables**: 빌드 시 주입 (런타임 오버헤드 최소화)
*   **TypeScript Map**: `tokens.sys.color.primary` 형태로 자동완성 지원

---

## 2. Reference Layer (기초 색상)

> **Tone-on-Tone 원칙**: 모든 중립 색상(Neutral)에 브랜드 컬러(Orange)를 2~5% 섞어 따뜻한 미니멀리즘을 구현합니다.

### 2.1 Brand Palette (Mandarin)
*   **Base**: `#E9481E` (Logo)

| Token Path | Value | Role |
|------------|-------|------|
| `ref.palette.orange.10` | #3E0F04 | On-Container (Text) |
| `ref.palette.orange.20` | #751E09 | Dark Active |
| `ref.palette.orange.30` | #B32E10 | Dark Hover |
| `ref.palette.orange.40` | **#E9481E** | **Primary (Logo)** |
| `ref.palette.orange.50` | #F36B45 | Light Hover |
| `ref.palette.orange.60` | #FA8F70 | Secondary |
| `ref.palette.orange.80` | #FDCBBC | Surface Highlight |
| `ref.palette.orange.90` | #FEE4DC | Container Background |
| `ref.palette.orange.95` | #FFF1EC | Tinted Surface |
| `ref.palette.orange.99` | #FFFBFA | Background |

### 2.2 Neutral Palette (Orange Tinted)
*   일반 회색(`#808080`) 대신 오렌지 틴트가 들어간 웜 그레이 사용.

| Token Path | Value | Role |
|------------|-------|------|
| `ref.palette.neutral.10` | #1C1917 | Main Text |
| `ref.palette.neutral.30` | #57534E | Sub Text |
| `ref.palette.neutral.50` | #78716C | Icon / Disabled Text |
| `ref.palette.neutral.80` | #D6D3D1 | Border |
| `ref.palette.neutral.90` | #E7E5E4 | Divider |
| `ref.palette.neutral.95` | #F5F5F4 | Card Background |
| `ref.palette.neutral.99` | #FAFAF9 | App Background |

### 2.3 Brix Palette (Fruits Metaphor)
*   당도 시스템을 위한 전용 과일 컬러.

| Fruit | Token | Value | Meaning |
|-------|-------|-------|---------|
| **Honey** | `ref.palette.gold.60` | #F59E0B | 꿀 (60+) / High Reliability |
| **Grape** | `ref.palette.purple.60` | #9333EA | 포도 (40~60) / Trust |
| **Apple** | `ref.palette.red.60` | #F43F5E | 사과 (25~40) / Moderate |
| **Mandarin**| `ref.palette.orange.40` | #E9481E | 귤 (12~25) / Basic (Brand) |
| **Tomato** | `ref.palette.tomato.70` | #FCA5A5 | 토마토 (0~12) / Bland |
| **Bitter** | `ref.palette.green.30` | #14532D | 쓴맛 (<0) / Warning |

---

## 3. System Layer (UI 역할)

### 3.1 Color Roles (M3 Standard)

| Token Pair | Light Mode Value | Usage |
|------------|------------------|-------|
| `sys.color.primary` | `ref.orange.40` (#E9481E) | CTA 버튼, 활성 아이콘, 로고 |
| `sys.color.on-primary` | #FFFFFF | CTA 위 텍스트 |
| `sys.color.primary-container` | `ref.orange.90` | 칩 배경, 선택된 아이템 배경 |
| `sys.color.on-primary-container` | `ref.orange.10` | 칩 텍스트 |
| `sys.color.background` | `ref.neutral.99` | 전체 배경 |
| `sys.color.surface` | `ref.neutral.99` | 기본 표면 |
| `sys.color.surface-container` | `ref.neutral.95` | **카드 배경 (Default)** |
| `sys.color.outline` | `ref.neutral.80` | 인풋 보더, 디바이더 |
| `sys.color.outline-variant` | `ref.neutral.90` | 약한 디바이더 |

### 3.2 Typography Roles
*   **Font Family**: `Pretendard`, `San Francisco`, `-apple-system`
*   **Monospace**: `JetBrains Mono`

| Token (`sys.typescale...`) | Size | Weight | Line Height | Usage |
|----------------------------|------|--------|-------------|-------|
| `display.large` | 32px | 700 | 1.3 | 마케팅 헤드라인 |
| `headline.medium` | 24px | 600 | 1.4 | 화면 타이틀 |
| `title.medium` | 18px | 600 | 1.5 | 카드 타이틀, 섹션 헤더 |
| `body.large` | 16px | 400 | 1.6 | 본문 (Default) |
| `body.medium` | 14px | 400 | 1.5 | 보조 본문 |
| `label.medium` | 14px | 500 | 1.2 | 버튼 텍스트, 태그 |
| **`financial.amount`** | **18px** | **600** | **1.2** | **금액 표시 (tnum)** |
| **`financial.variable`** | **inherit** | **inherit** | **inherit** | **금액 표시 (tnum)** |

> **Financial Font CSS**:
> ```css
> .font-financial {
>   font-family: var(--font-sans);
>   font-feature-settings: "tnum"; /* 고정폭 숫자 */
>   font-variant-numeric: tabular-nums;
>   letter-spacing: -0.02em;
> }
> ```

### 3.3 Shape & Elevation (Toss-like)

| Token | Value | Description |
|-------|-------|-------------|
| `sys.shape.corner.sm` | 8px | 버튼, 인풋 |
| `sys.shape.corner.md` | 16px | 작은 카드, 토스트 |
| `sys.shape.corner.lg` | **24px** | **메인 카드, 바텀시트 (Toss Style)** |
| `sys.shape.corner.full` | 9999px | 뱃지, 아바타 |
| `sys.shadow.soft` | `0 4px 20px rgba(0,0,0,0.06)` | 기본 그림자 (부드러움) |
| `sys.shadow.floating` | `0 8px 30px rgba(0,0,0,0.12)` | 모달, 플로팅 버튼 |

---

## 4. Semantic Layer (Domain Specific)

> **React 사용 시 이 토큰들을 주로 사용합니다.**

### 4.1 Financial Status (금액 상태)

| Token (`sys.color...`) | Reference | Meaning |
|------------------------|-----------|---------|
| `financial.income` | `ref.gold.60` (Honey) | 입금, 충전, 이익 (+) |
| `financial.expense` | `ref.neutral.10` (Black) | 지출, 출금 (-) *Toss Style: 빨간색 남용 지양* |
| `financial.withdraw` | `ref.neutral.10` (Black) | 평문 지출 |
| `financial.locked` | `ref.neutral.50` (Gray) | 보증금, 잠김 |

### 4.2 Brix Levels (당도)

| Token (`sys.color.brix...`) | Reference | Level |
|-----------------------------|-----------|-------|
| `honey` | `ref.gold.60` | 🍯 꿀 |
| `grape` | `ref.purple.60` | 🍇 포도 |
| `apple` | `ref.red.60` | 🍎 사과 |
| `mandarin` | `ref.orange.40` | 🍊 귤 (Standard) |
| `tomato` | `ref.tomato.70` | 🍅 토마토 |
| `bitter` | `ref.green.30` | 🥒 쓴맛 |

### 4.3 Entity Status (상태 뱃지)

| Status Enum | Token | Visual |
|-------------|-------|--------|
| `ACTIVE` | `sys.color.primary` | Orange Dot / Text |
| `RECRUITING` | `sys.color.primary` | Orange Badge |
| `COMPLETED` | `sys.color.neutral.50` | Gray Badge |
| `SUSPENDED` | `sys.color.error` | Red Badge |

---

## 5. Implementation Guide (React/TS)

### `src/theme/tokens.ts`

```typescript
// Type Definition
export interface WooriDoTheme {
  sys: {
    color: {
      primary: string;
      onPrimary: string;
      surface: string;
      background: string;
      // ...
      brix: {
        honey: string;
        grape: string;
        // ...
      };
      financial: {
        income: string;
        expense: string;
        locked: string;
      };
    };
    typography: {
      displayLarge: React.CSSProperties;
      financial: React.CSSProperties; // includes tnum
    };
    shape: {
      corner: {
        large: string; // '24px'
      };
    };
  };
}

// Usage Example
// <div style={{ 
//    backgroundColor: tokens.sys.color.primary,
//    borderRadius: tokens.sys.shape.corner.large 
// }}>
//   <span style={tokens.sys.typography.financial}>
//     {formatMoney(10000)}
//   </span>
// </div>
```
