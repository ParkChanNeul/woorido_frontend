# WDS Overlay Components

> **Category**: 오버레이 UI 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Last Updated**: 2026-01-15

---

## 1. Modal (Dialog)

### Props Interface

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlay?: boolean;    // 배경 클릭 시 닫기 (기본: true)
  closeOnEscape?: boolean;     // ESC 키로 닫기 (기본: true)
  showCloseButton?: boolean;   // X 버튼 표시
  children: React.ReactNode;
  footer?: React.ReactNode;    // 하단 버튼 영역
}
```

### Sizes

| Size | Width | Max Height |
|------|-------|------------|
| `sm` | 320px | 80vh |
| `md` | 480px | 80vh |
| `lg` | 640px | 90vh |
| `full` | 100% - 32px | 100% - 32px |

### Styling

| Property | Value |
|----------|-------|
| Background | White |
| Border Radius | `shape.radiusXl` (24px) |
| Shadow | `shadow.lg` |
| Overlay | `rgba(0, 0, 0, 0.5)` |

### Usage

```tsx
<Modal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="챌린지 가입"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={handleCancel}>취소</Button>
      <Button variant="primary" onClick={handleConfirm}>가입하기</Button>
    </>
  }
>
  <JoinChallengeForm />
</Modal>
```

### Animation

```css
/* 등장 */
animation: modalEnter 250ms ease-out;

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

---

## 2. BottomSheet

모바일 전용 하단 시트 컴포넌트입니다.

### Props Interface

```tsx
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  height: 'auto' | 'half' | 'full' | number; // number는 px
  showHandle?: boolean;     // 상단 드래그 핸들 (기본: true)
  closeOnOverlay?: boolean;
  children: React.ReactNode;
}
```

### Height Options

| Height | Value | Usage |
|--------|-------|-------|
| `auto` | 콘텐츠 높이 | 짧은 액션 시트 |
| `half` | 50vh | 필터, 옵션 선택 |
| `full` | 100vh - 48px | 상세 정보 |
| `number` | {n}px | 커스텀 |

### Styling

| Property | Value |
|----------|-------|
| Background | White |
| Border Radius | `shape.radiusXl` (상단만) |
| Handle | 40px × 4px, `colors.grey300` |
| Shadow | `shadow.xl` |

### Usage

```tsx
<BottomSheet
  open={isFilterOpen}
  onClose={() => setIsFilterOpen(false)}
  title="필터"
  height="half"
>
  <FilterOptions />
</BottomSheet>

// 액션 시트
<BottomSheet open={isActionOpen} height="auto">
  <ActionList>
    <ActionItem onClick={handleEdit}>수정하기</ActionItem>
    <ActionItem onClick={handleDelete} danger>삭제하기</ActionItem>
  </ActionList>
</BottomSheet>
```

### Gesture Support

| Gesture | Action |
|---------|--------|
| Swipe Down | 닫기 (threshold: 100px) |
| Tap Overlay | 닫기 (closeOnOverlay) |

---

## 3. Toast

### Props Interface

```tsx
interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  duration?: number;       // ms (기본: 3000)
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast 호출 함수
function toast(props: ToastProps): void;
function toast.success(message: string, options?: Partial<ToastProps>): void;
function toast.error(message: string, options?: Partial<ToastProps>): void;
```

### Types

| Type | Icon | Color Accent |
|------|------|-------------|
| `success` | ✓ Check | `colors.success` |
| `error` | ✕ X | `colors.error` |
| `info` | ℹ Info | `colors.orange500` |
| `warning` | ⚠ Warning | `colors.warning` |

### Styling

| Property | Value |
|----------|-------|
| Background | White |
| Border Radius | `shape.radiusMd` (12px) |
| Shadow | `shadow.md` |
| Position | 상단 중앙 (모바일), 우측 하단 (데스크탑) |

### Usage

```tsx
// 기본 사용
toast.success('충전이 완료되었습니다');
toast.error('잔액이 부족합니다');

// 상세 옵션
toast({
  type: 'info',
  message: '새로운 투표가 등록되었습니다',
  description: '책벌레들 챌린지에서 투표가 시작되었어요',
  action: {
    label: '바로가기',
    onClick: () => navigate('/challenges/1/votes'),
  },
});
```

### Animation

```css
/* 등장 */
animation: toastEnter 200ms ease-out;

@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 퇴장 */
animation: toastExit 150ms ease-in;
```

---

## 4. Tooltip

### Props Interface

```tsx
interface TooltipProps {
  content: React.ReactNode;
  placement: 'top' | 'bottom' | 'left' | 'right';
  trigger: 'hover' | 'click' | 'focus';
  delay?: number;          // ms (기본: 300)
  children: React.ReactElement;
}
```

### Styling

| Property | Value |
|----------|-------|
| Background | `colors.grey900` |
| Text | White, w6 |
| Border Radius | `shape.radiusSm` (8px) |
| Padding | 8px 12px |
| Max Width | 240px |
| Arrow | 6px triangle |

### Usage

```tsx
<Tooltip 
  content="보증금은 챌린지 탈퇴 시 반환됩니다" 
  placement="top"
>
  <InfoIcon />
</Tooltip>

<Tooltip 
  content={
    <div>
      <strong>당도란?</strong>
      <p>사용자의 신뢰도를 나타내는 점수입니다.</p>
    </div>
  }
  placement="bottom"
  trigger="click"
>
  <BrixBadge score={42.5} />
</Tooltip>
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_FOUNDATION.md](./WDS_FOUNDATION.md) - 기초 컴포넌트
- [WDS_FEEDBACK.md](./WDS_FEEDBACK.md) - 피드백 컴포넌트
- [WDS_DOMAIN.md](./WDS_DOMAIN.md) - 도메인 특화 컴포넌트
