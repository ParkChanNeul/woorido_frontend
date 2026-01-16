# WDS Foundation Components

> **Category**: 기초 UI 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Last Updated**: 2026-01-15

---

## 1. Button

### Props Interface

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Variants

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `primary` | `colors.orange500` | White | CTA, 주요 액션 |
| `secondary` | `colors.grey100` | `colors.grey900` | 보조 액션 |
| `ghost` | Transparent | `colors.orange500` | 텍스트 버튼 |
| `danger` | `colors.error` | White | 삭제, 위험 액션 |

### States

| State | Style Change |
|-------|-------------|
| Hover | `colors.orange600` (Primary) |
| Active | `colors.orange700` (Primary) |
| Disabled | opacity: 0.5, cursor: not-allowed |
| Loading | Spinner 표시, 클릭 비활성 |

### Usage

```tsx
<Button variant="primary" size="md">충전하기</Button>
<Button variant="secondary" size="md">취소</Button>
<Button variant="ghost" size="sm">더보기</Button>
<Button variant="danger" size="md">탈퇴하기</Button>
<Button variant="primary" size="lg" fullWidth loading>처리 중...</Button>
```

---

## 2. Input

### Props Interface

```tsx
interface InputProps {
  type: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel';
  size: 'sm' | 'md' | 'lg';
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  readOnly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}
```

### States

| State | Border | Background |
|-------|--------|------------|
| Default | `colors.border` | White |
| Focus | `colors.orange500` (2px) | White |
| Error | `colors.error` | `colors.error` + 5% opacity |
| Disabled | `colors.grey200` | `colors.grey100` |

### Usage

```tsx
<Input 
  type="email" 
  label="이메일" 
  placeholder="example@email.com"
  helperText="회원가입에 사용한 이메일을 입력하세요"
/>

<Input 
  type="password" 
  label="비밀번호" 
  error="비밀번호는 8자 이상이어야 합니다"
/>

<Input 
  type="search" 
  placeholder="챌린지 검색..."
  leftIcon={<SearchIcon />}
/>
```

---

## 3. Avatar

### Props Interface

```tsx
interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;          // Fallback: 이름 이니셜
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  badge?: React.ReactNode; // 우측 하단 뱃지
}
```

### Sizes

| Size | Dimension | Typography |
|------|-----------|------------|
| `xs` | 24px | w7 |
| `sm` | 32px | w6 |
| `md` | 40px | w5 |
| `lg` | 56px | w4 |
| `xl` | 80px | w3 |

### Status Indicator

| Status | Color | Position |
|--------|-------|----------|
| `online` | `colors.success` | 우측 하단 |
| `offline` | `colors.grey400` | 우측 하단 |
| `away` | `colors.warning` | 우측 하단 |
| `busy` | `colors.error` | 우측 하단 |

### Usage

```tsx
<Avatar 
  src="/user/profile.jpg" 
  name="홍길동" 
  size="md" 
  status="online"
/>

<Avatar 
  name="김철수"  // 이미지 없으면 "김" 표시
  size="lg"
  badge={<LeaderBadge />}
/>
```

---

## 4. Badge

### Props Interface

```tsx
interface BadgeProps {
  color: 'orange' | 'grey' | 'green' | 'red' | 'blue' | 'purple' | 'gold';
  variant: 'fill' | 'weak' | 'outline';
  size: 'sm' | 'md' | 'lg';
  dot?: boolean;          // 왼쪽 점 표시
  children: React.ReactNode;
}
```

### Color Mapping

| Color | Fill Background | Fill Text | Weak Background |
|-------|----------------|-----------|-----------------|
| `orange` | `colors.orange500` | White | `colors.orange100` |
| `grey` | `colors.grey500` | White | `colors.grey100` |
| `green` | `colors.success` | White | #DCFCE7 |
| `red` | `colors.error` | White | #FEE2E2 |
| `blue` | #3B82F6 | White | #DBEAFE |
| `purple` | `colors.brixGrape` | White | #F3E8FF |
| `gold` | `colors.brixHoney` | White | #FEF3C7 |

### Usage

```tsx
<Badge color="orange" variant="fill" size="sm">모집 중</Badge>
<Badge color="grey" variant="weak" size="sm">완료</Badge>
<Badge color="green" variant="fill" size="sm" dot>인증</Badge>
<Badge color="red" variant="outline" size="sm">긴급</Badge>
```

---

## 5. Chip

선택 가능한 태그 컴포넌트입니다.

### Props Interface

```tsx
interface ChipProps {
  selected?: boolean;
  disabled?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### States

| State | Background | Border |
|-------|-----------|--------|
| Default | White | `colors.border` |
| Selected | `colors.orange100` | `colors.orange500` |
| Disabled | `colors.grey100` | `colors.grey200` |

### Usage

```tsx
// 카테고리 필터
<Chip selected onClick={() => setCategory('hobby')}>취미</Chip>
<Chip onClick={() => setCategory('study')}>학습</Chip>
<Chip onClick={() => setCategory('exercise')}>운동</Chip>

// 태그 (삭제 가능)
<Chip removable onRemove={() => removeTag('서울')}>서울</Chip>
```

---

## 6. Divider

### Props Interface

```tsx
interface DividerProps {
  orientation: 'horizontal' | 'vertical';
  variant: 'full' | 'inset' | 'middle';
  label?: string;         // 중앙 텍스트
}
```

### Variants

| Variant | Horizontal | Vertical |
|---------|-----------|----------|
| `full` | 전체 너비 | 전체 높이 |
| `inset` | 좌측 16px 여백 | 상단 16px 여백 |
| `middle` | 좌우 16px 여백 | 상하 16px 여백 |

### Usage

```tsx
<Divider orientation="horizontal" variant="full" />

<Divider 
  orientation="horizontal" 
  variant="middle" 
  label="또는"
/>

// 수직 구분선 (Flex 컨테이너 내)
<Divider orientation="vertical" variant="full" />
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_OVERLAY.md](./WDS_OVERLAY.md) - 오버레이 컴포넌트
- [WDS_FEEDBACK.md](./WDS_FEEDBACK.md) - 피드백 컴포넌트
- [WDS_DOMAIN.md](./WDS_DOMAIN.md) - 도메인 특화 컴포넌트
