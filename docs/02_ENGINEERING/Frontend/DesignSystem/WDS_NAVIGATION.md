# WDS Navigation Components

> **Category**: 네비게이션 UI 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Responsive**: [WDS_RESPONSIVE.md](./WDS_RESPONSIVE.md) 참조
> **Last Updated**: 2026-01-16

---

## 1. BottomNav (하단 네비게이션)

모바일 전용 하단 네비게이션 바입니다.

### Props Interface

```tsx
interface BottomNavProps {
  items: BottomNavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;  // 활성 상태 아이콘
  badge?: number;                // 알림 뱃지
  href: string;
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🏠       🔍       ➕       📋       👤                   │
│   홈       탐색     생성     내모임     MY                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Items 구성

| ID | Label | Icon | Route |
|----|-------|------|-------|
| `home` | 홈 | 🏠 | `/` |
| `discover` | 탐색 | 🔍 | `/discover` |
| `create` | 생성 | ➕ | `/groups/create` (FAB 스타일) |
| `my-groups` | 내 모임 | 📋 | `/my-groups` |
| `mypage` | MY | 👤 | `/mypage` |

### Styling

| Property | Value |
|----------|-------|
| Height | 56px |
| Background | White |
| Border Top | 1px solid `colors.divider` |
| Shadow | `shadow.sm` |
| Icon Size | 24px |
| Label Font | `typography.w7` |
| Active Color | `colors.orange500` |
| Inactive Color | `colors.grey500` |

### Responsive Visibility

```css
/* Mobile Only */
.bottom-nav {
  display: flex;
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
```

### Usage

```tsx
<BottomNav
  items={[
    { id: 'home', label: '홈', icon: <HomeIcon />, href: '/' },
    { id: 'discover', label: '탐색', icon: <SearchIcon />, href: '/discover' },
    { id: 'create', label: '생성', icon: <PlusIcon />, href: '/groups/create' },
    { id: 'my-groups', label: '내 모임', icon: <GroupIcon />, href: '/my-groups', badge: 2 },
    { id: 'mypage', label: 'MY', icon: <UserIcon />, href: '/mypage' },
  ]}
  activeItem={currentPath}
  onItemClick={(id) => navigate(navItems.find(i => i.id === id)?.href)}
/>
```

---

## 2. Header (헤더/앱바)

상단 헤더 컴포넌트입니다. 해상도에 따라 표시 내용이 달라집니다.

### Props Interface

```tsx
interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBalance?: boolean;
  balance?: number;
  onBalanceClick?: () => void;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  leftAction?: 'back' | 'menu' | 'none';
  onLeftAction?: () => void;
  rightActions?: React.ReactNode;
}
```

### Layout - Mobile

```
┌─────────────────────────────────────────────────────────────┐
│  ←   📚 책벌레들                        ₩500,000  🔔(3)    │
└─────────────────────────────────────────────────────────────┘
```

### Layout - Desktop

```
┌─────────────────────────────────────────────────────────────┐
│  🍊 WooriDo            [탐색] [내 모임]         ₩500,000 🔔 👤 │
└─────────────────────────────────────────────────────────────┘
```

### Styling

| Property | Mobile | Desktop |
|----------|--------|---------|
| Height | 56px | 64px |
| Background | White | White |
| Border Bottom | 1px `colors.divider` | 1px `colors.divider` |
| Shadow | none | `shadow.sm` |
| Title Font | `typography.w3` | `typography.w2` |

### Balance Display

```tsx
// BalanceChip 컴포넌트
interface BalanceChipProps {
  amount: number;
  onClick?: () => void;
}
```

| State | Style |
|-------|-------|
| Normal | Background: `colors.grey100`, Text: `colors.textPrimary` |
| Hover | Background: `colors.grey200` |
| Low Balance | Text: `colors.warning` (10,000 미만) |

### Usage

```tsx
// 챌린지 상세 헤더
<Header
  title="책벌레들"
  leftAction="back"
  onLeftAction={() => navigate(-1)}
  showBalance
  balance={500000}
  onBalanceClick={() => openChargeModal()}
  showNotification
  notificationCount={3}
/>

// 홈 헤더
<Header
  title="우리두"
  showBalance
  balance={500000}
  showNotification
  notificationCount={3}
/>
```

---

## 3. SideNav (사이드 네비게이션)

데스크탑/태블릿용 좌측 네비게이션입니다.

### Props Interface

```tsx
interface SideNavProps {
  items: SideNavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface SideNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  children?: SideNavItem[];  // 서브메뉴
}
```

### Layout

```
┌────────────────────┐
│  🍊 WooriDo        │
├────────────────────┤
│  🏠 홈             │
│  🔍 탐색           │
│  ➕ 모임 만들기     │
│  📋 내 모임    (2) │
│    ├ 📚 책벌레들   │
│    └ 🎬 영화광들   │
├────────────────────┤
│  👤 내 정보        │
│  ⚙️ 설정           │
└────────────────────┘
```

### Responsive Width

| 해상도 | 너비 | 상태 |
|--------|------|------|
| < 768px | 숨김 | BottomNav 사용 |
| 768-1279px | 200px | 고정 |
| 1280px+ | 240px | 고정 |

### Styling

| Property | Value |
|----------|-------|
| Background | White |
| Border Right | 1px solid `colors.divider` |
| Padding | 16px |
| Item Height | 40px |
| Item Padding | 12px 16px |
| Active Background | `colors.orange100` |
| Active Text | `colors.orange500` |

### Usage

```tsx
// 레이아웃 컴포넌트에서 사용
<div className="app-layout">
  {isDesktopOrAbove && (
    <SideNav
      items={navItems}
      activeItem={currentPath}
      onItemClick={(id) => navigate(id)}
    />
  )}
  <main>{children}</main>
</div>
```

---

## 4. SegmentedControl (세그먼트 컨트롤)

탭 전환에 사용하는 세그먼트 컨트롤입니다.

### Props Interface

```tsx
interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

interface Segment {
  value: string;
  label: string;
  badge?: number;
  disabled?: boolean;
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [피드]  [장부]  [투표(2)]  [모임]  [멤버]                  │
│   ─────                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Styling

| Property | Value |
|----------|-------|
| Background | `colors.grey100` |
| Height (SM) | 32px |
| Height (MD) | 40px |
| Border Radius | `shape.radiusSm` |
| Active Background | White |
| Active Shadow | `shadow.sm` |
| Active Font Weight | 600 |
| Transition | 200ms ease-out |

### Animation (Framer Motion)

```tsx
const indicatorVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

// 인디케이터가 활성 탭으로 슬라이드
<motion.div
  className="segment-indicator"
  layoutId="segment-indicator"
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
/>
```

### Usage

```tsx
// 챌린지 탭
<SegmentedControl
  segments={[
    { value: 'feed', label: '피드' },
    { value: 'ledger', label: '장부' },
    { value: 'votes', label: '투표', badge: 2 },
    { value: 'meetings', label: '모임' },
    { value: 'members', label: '멤버' },
  ]}
  value={activeTab}
  onChange={setActiveTab}
  fullWidth
/>
```

---

## 5. Breadcrumb (브레드크럼)

페이지 경로를 표시하는 컴포넌트입니다.

### Props Interface

```tsx
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;  // 기본: '/'
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}
```

### Layout

```
홈 / 내 모임 / 책벌레들 / 장부
```

### Usage

```tsx
<Breadcrumb
  items={[
    { label: '홈', href: '/' },
    { label: '내 모임', href: '/my-groups' },
    { label: '책벌레들', href: '/groups/123' },
    { label: '장부' },  // 현재 페이지 (링크 없음)
  ]}
/>
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_RESPONSIVE.md](./WDS_RESPONSIVE.md) - 해상도 정책
- [WDS_FOUNDATION.md](./WDS_FOUNDATION.md) - 기초 컴포넌트
- [IA_SPECIFICATION.md](../../01_PLANNING/UX_UI/IA_SPECIFICATION.md) - 화면 설계
