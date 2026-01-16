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
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_FOUNDATION.md](./WDS_FOUNDATION.md) - 기초 컴포넌트
- [WDS_OVERLAY.md](./WDS_OVERLAY.md) - 오버레이 컴포넌트
- [WDS_DOMAIN.md](./WDS_DOMAIN.md) - 도메인 특화 컴포넌트
