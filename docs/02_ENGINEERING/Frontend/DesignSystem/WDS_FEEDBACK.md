# WDS Feedback Components

> **Category**: 피드백 UI 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Last Updated**: 2026-01-15

---

## 1. Skeleton

로딩 상태를 시각적으로 표현하는 플레이스홀더 컴포넌트입니다.

### Props Interface

```tsx
interface SkeletonProps {
  variant: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation: 'pulse' | 'wave' | 'none';
}

// Preset Components
interface SkeletonTextProps {
  lines?: number;          // 줄 수 (기본: 1)
  lastLineWidth?: string;  // 마지막 줄 너비 (기본: '60%')
}

interface SkeletonAvatarProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

interface SkeletonCardProps {
  hasImage?: boolean;
  hasAvatar?: boolean;
  lines?: number;
}
```

### Variants

| Variant | Shape | Usage |
|---------|-------|-------|
| `text` | 직사각형, 높이 auto | 텍스트 라인 |
| `circular` | 원형 | 아바타 |
| `rectangular` | 직사각형 | 이미지, 카드 |
| `rounded` | 둥근 모서리 | 버튼, 칩 |

### Styling

| Property | Value |
|----------|-------|
| Background | `colors.grey200` |
| Animation (Pulse) | opacity 0.4 ↔ 1, 1.5s |
| Animation (Wave) | shimmer gradient, 1.5s |

### Animation CSS

```css
/* Pulse */
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Wave (Shimmer) */
@keyframes skeletonWave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-wave::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,0.4),
    transparent
  );
  animation: skeletonWave 1.5s infinite;
}
```

### Usage

```tsx
// 기본 사용
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width="100%" height={200} />

// Preset 사용
<Skeleton.Text lines={3} />
<Skeleton.Avatar size="md" />
<Skeleton.Card hasImage hasAvatar lines={2} />

// PostCard 로딩 상태
function PostCardSkeleton() {
  return (
    <div className="post-card">
      <div className="header">
        <Skeleton.Avatar size="sm" />
        <Skeleton.Text lines={1} />
      </div>
      <Skeleton.Text lines={3} />
      <Skeleton variant="rectangular" height={200} />
    </div>
  );
}
```

---

## 2. Spinner

### Props Interface

```tsx
interface SpinnerProps {
  size: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'grey';
  label?: string;          // 접근성 라벨
}
```

### Sizes

| Size | Dimension | Border Width |
|------|-----------|-------------|
| `xs` | 16px | 2px |
| `sm` | 20px | 2px |
| `md` | 32px | 3px |
| `lg` | 48px | 4px |

### Styling

| Property | Value |
|----------|-------|
| Type | Border spinner (circular) |
| Color | `colors.orange500` (primary) |
| Track | `colors.grey200` |
| Animation | rotate 360°, 0.8s linear infinite |

### Usage

```tsx
// 인라인 로딩
<Button variant="primary" disabled>
  <Spinner size="xs" color="white" />
  처리 중...
</Button>

// 페이지 로딩
<div className="page-loader">
  <Spinner size="lg" />
  <p>데이터를 불러오는 중...</p>
</div>
```

---

## 3. ProgressBar

### Props Interface

```tsx
interface ProgressBarProps {
  value: number;           // 0-100
  max?: number;            // 기본: 100
  size: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showValue?: boolean;     // 퍼센트 표시
  animated?: boolean;      // 채워지는 애니메이션
  striped?: boolean;       // 줄무늬 패턴
}
```

### Sizes

| Size | Height |
|------|--------|
| `sm` | 4px |
| `md` | 8px |
| `lg` | 12px |

### Styling

| Property | Value |
|----------|-------|
| Track Background | `colors.grey200` |
| Fill Background | `colors.orange500` (primary) |
| Border Radius | `shape.radiusFull` |
| Animation | width transition 300ms |

### Usage

```tsx
// 투표 진행률
<ProgressBar 
  value={65} 
  size="md" 
  color="primary" 
  showValue 
/>

// 파일 업로드
<ProgressBar 
  value={uploadProgress} 
  size="sm" 
  animated 
/>

// 목표 달성률 (경고 색상)
<ProgressBar 
  value={30} 
  size="lg" 
  color={value < 50 ? 'warning' : 'success'} 
/>
```

### Vote Progress (투표 전용)

```tsx
interface VoteProgressProps {
  approve: number;         // 찬성 수
  reject: number;          // 반대 수
  total: number;           // 전체 투표권자
  threshold: number;       // 통과 기준 (%)
}

// 찬성/반대 양방향 표시
<VoteProgress 
  approve={6} 
  reject={2} 
  total={10} 
  threshold={50} 
/>
```

---

## 4. EmptyState

데이터가 없을 때 표시하는 빈 상태 컴포넌트입니다.

### Props Interface

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size: 'sm' | 'md' | 'lg';
}
```

### Sizes

| Size | Icon Size | Title Typography | Usage |
|------|-----------|-----------------|-------|
| `sm` | 48px | w5 | 인라인, 카드 내부 |
| `md` | 80px | w3 | 섹션 |
| `lg` | 120px | w2 | 전체 페이지 |

### Styling

| Property | Value |
|----------|-------|
| Text Align | Center |
| Icon Color | `colors.grey400` |
| Title Color | `colors.textPrimary` |
| Description Color | `colors.textSecondary` |

### Preset Empty States

| Preset | Icon | Title | Description |
|--------|------|-------|-------------|
| `feed` | 📝 | 아직 게시글이 없어요 | 첫 번째 글을 작성해보세요 |
| `challenge` | 🎯 | 참여 중인 챌린지가 없어요 | 새로운 챌린지를 찾아보세요 |
| `vote` | 🗳️ | 진행 중인 투표가 없어요 | - |
| `search` | 🔍 | 검색 결과가 없어요 | 다른 키워드로 검색해보세요 |
| `ledger` | 📊 | 아직 거래 내역이 없어요 | - |
| `notification` | 🔔 | 새로운 알림이 없어요 | - |

### Usage

```tsx
// 기본 사용
<EmptyState
  icon={<FeedIcon />}
  title="아직 게시글이 없어요"
  description="첫 번째 글을 작성해보세요"
  action={{
    label: '글 작성하기',
    onClick: () => navigate('/feed/new'),
  }}
  size="md"
/>

// Preset 사용
<EmptyState.Feed />
<EmptyState.Challenge action={{ label: '챌린지 둘러보기', onClick: handleBrowse }} />
<EmptyState.Search />
---

## 5. AlertBanner (경고 배너)

상단에 고정되어 중요한 알림을 표시하는 배너입니다.

### Props Interface

```tsx
interface AlertBannerProps {
  variant: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  countdown?: {
    label: string;          // "자동 탈퇴까지" 
    targetDate: Date;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

### Variants

| Variant | Background | Border | Icon | Usage |
|---------|-----------|--------|------|-------|
| `warning` | `colors.warning` + 10% | `colors.warning` | ⚠️ | 권한 박탈, 납입 임박 |
| `error` | `colors.error` + 10% | `colors.error` | 🚨 | 자동 탈퇴 임박 |
| `info` | `colors.info` + 10% | `colors.orange500` | ℹ️ | 일반 안내 |
| `success` | `colors.success` + 10% | `colors.success` | ✅ | 완료 알림 |

### Layout

```
[D-0~7: 유예 기간]
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ 7일 내 충전 시 권한 복구  │  남은 기간: 5일  [충전 →]  │
└─────────────────────────────────────────────────────────────┘

[D-7~60: 모임 제외 상태]
┌─────────────────────────────────────────────────────────────┐
│  🚨 자동 탈퇴까지 30일  │  모임 참석 불가  [지금 충전 →]    │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
// 권한 박탈 배너
<AlertBanner
  variant="warning"
  title="7일 내 충전 시 권한 복구"
  countdown={{
    label: "남은 기간",
    targetDate: gracePeriodEnd,
  }}
  action={{
    label: "충전",
    onClick: () => openChargeModal(),
  }}
/>

// 자동 탈퇴 임박
<AlertBanner
  variant="error"
  title="자동 탈퇴까지"
  description="모임 참석 불가"
  countdown={{
    label: "",
    targetDate: autoLeaveDate,
  }}
  action={{
    label: "지금 충전",
    onClick: () => openChargeModal(),
  }}
/>
```

---

## 6. CountdownTimer (카운트다운)

시간 제한이 있는 항목의 남은 시간을 표시합니다.

### Props Interface

```tsx
interface CountdownTimerProps {
  targetDate: Date;
  format: 'full' | 'short' | 'minimal';
  onExpire?: () => void;
  urgentThreshold?: number;   // ms (기본: 5분)
  showDays?: boolean;
}
```

### Formats

| Format | 예시 | Usage |
|--------|------|-------|
| `full` | 2일 5시간 30분 15초 | 투표 만료 |
| `short` | 2일 5:30:15 | 일반 카운트다운 |
| `minimal` | 05:30 | 바코드 만료 (10분 이내) |

### Styling

| 상태 | 색상 | 조건 |
|------|------|------|
| Normal | `colors.textSecondary` | > urgentThreshold |
| Urgent | `colors.warning` | 10% ~ urgentThreshold |
| Critical | `colors.error` + pulse 애니메이션 | < 10% |

### Animation (Framer Motion)

```tsx
// Critical 상태 pulse 애니메이션
const pulseVariants = {
  normal: { scale: 1 },
  urgent: { 
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
    }
  }
};
```

### Usage

```tsx
// 바코드 만료
<CountdownTimer
  targetDate={barcodeExpiry}
  format="minimal"
  onExpire={() => handleBarcodeExpired()}
  urgentThreshold={60000}  // 1분
/>

// 투표 종료
<CountdownTimer
  targetDate={voteDeadline}
  format="full"
  showDays
/>

// 배너 내 인라인
<AlertBanner
  variant="warning"
  title="보증금 충전 필요"
  countdown={{ label: "자동 탈퇴까지", targetDate: autoLeaveDate }}
/>
```

---

## 7. State Transition (상태 전이 피드백)

상태 변화를 사용자에게 시각적으로 알리는 피드백 시스템입니다.

### 7.1 Transition Types

| Type | 트리거 | 피드백 |
|------|--------|--------|
| `vote_approved` | 투표 승인됨 | Toast + 장부 하이라이트 |
| `vote_rejected` | 투표 거절됨 | Toast + 투표 카드 Fade |
| `payment_complete` | 결제 완료 | Toast + 장부 항목 슬라이드인 |
| `privilege_revoked` | 권한 박탈 | AlertBanner + 제한 UI 표시 |
| `privilege_restored` | 권한 복구 | Toast + Celebration 애니메이션 |
| `challenge_completed` | 완주 인증 | FullScreen Celebration |

### 7.2 Framer Motion Variants

```tsx
// 공통 전이 variants
export const transitionVariants = {
  // 새 항목 등장
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  
  // 항목 하이라이트
  highlight: {
    initial: { backgroundColor: 'transparent' },
    animate: { 
      backgroundColor: ['rgba(233, 72, 30, 0.2)', 'transparent'],
      transition: { duration: 1.5 }
    }
  },
  
  // 성공 축하
  celebrate: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: [0.8, 1.1, 1],
      opacity: 1,
      transition: { duration: 0.4, ease: 'backOut' }
    }
  },
  
  // 항목 제거
  fadeOut: {
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2 }
    }
  }
};
```

### 7.3 Usage Patterns

```tsx
// 투표 승인 → 장부 연동
function handleVoteApproved(vote: Vote) {
  // 1. Toast 표시
  toast.success('투표가 승인되었습니다');
  
  // 2. 장부에 새 항목 추가 (애니메이션)
  addLedgerEntry({
    ...vote,
    animationVariant: 'slideIn',
  });
  
  // 3. 연결 하이라이트
  setTimeout(() => {
    highlightLedgerEntry(vote.id, 'highlight');
  }, 500);
}

// 권한 복구
function handlePrivilegeRestored() {
  // 1. Toast 표시
  toast.success('권한이 복구되었습니다!');
  
  // 2. AlertBanner 제거 (fadeOut)
  setShowRevocationBanner(false);
  
  // 3. 축하 애니메이션
  showCelebration('privilege_restored');
}
```

### 7.4 CelebrationOverlay (전체 화면 축하)

```tsx
interface CelebrationOverlayProps {
  type: 'challenge_completed' | 'privilege_restored' | 'first_post';
  title: string;
  description?: string;
  onClose: () => void;
  autoClose?: number;         // ms
}
```

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         🎉                                  │
│                                                             │
│              축하합니다!                                      │
│                                                             │
│          1년 연속 운영 달성!                                   │
│     챌린지에 인증 마크가 부여되었습니다.                         │
│                                                             │
│              ┌────────────────┐                             │
│              │     확인       │                              │
│              └────────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_FOUNDATION.md](./WDS_FOUNDATION.md) - 기초 컴포넌트
- [WDS_OVERLAY.md](./WDS_OVERLAY.md) - 오버레이 컴포넌트
- [WDS_DOMAIN.md](./WDS_DOMAIN.md) - 도메인 특화 컴포넌트
- [WDS_LEDGER.md](./WDS_LEDGER.md) - 장부 시스템 컴포넌트
- [WDS_CALENDAR.md](./WDS_CALENDAR.md) - 캘린더 컴포넌트

