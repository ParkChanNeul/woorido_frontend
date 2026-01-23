# WDS Domain Components

> **Category**: 우리두 도메인 특화 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Last Updated**: 2026-01-15

---

## 1. BrixBadge (당도)

당도 점수를 시각화하는 전용 컴포넌트입니다. 점수에 따라 자동으로 레벨, 색상, 이모지가 결정됩니다.

### Props Interface

```tsx
interface BrixBadgeProps {
  score: number;           // 당도 점수
  showScore?: boolean;     // 점수 표시 (기본: true)
  size?: 'sm' | 'md';      // 크기
}
```

### Level Mapping

| Level | Range | Emoji | Color Token | Meaning |
|-------|-------|-------|-------------|---------|
| Honey | 60+ | 🍯 | `colors.brixHoney` | 꿀처럼 달콤한 신뢰 |
| Grape | 40~60 | 🍇 | `colors.brixGrape` | 달콤한 관계 |
| Apple | 25~40 | 🍎 | `colors.brixApple` | 적당히 달콤 |
| Mandarin | 12~25 | 🍊 | `colors.brixMandarin` | 기본 단맛 |
| Tomato | 0~12 | 🍅 | `colors.brixTomato` | 살짝 밍밍 |
| Bitter | <0 | 🥒 | `colors.brixBitter` | 쓴 관계 (주의) |

### Internal Logic

```typescript
function getBrixLevel(score: number): BrixLevel {
  if (score >= 60) return { level: 'honey', emoji: '🍯', color: colors.brixHoney };
  if (score >= 40) return { level: 'grape', emoji: '🍇', color: colors.brixGrape };
  if (score >= 25) return { level: 'apple', emoji: '🍎', color: colors.brixApple };
  if (score >= 12) return { level: 'mandarin', emoji: '🍊', color: colors.brixMandarin };
  if (score >= 0)  return { level: 'tomato', emoji: '🍅', color: colors.brixTomato };
  return { level: 'bitter', emoji: '🥒', color: colors.brixBitter };
}
```

### Usage

```tsx
<BrixBadge score={65.5} />                    // 🍯 65.5
<BrixBadge score={42.0} />                    // 🍇 42.0
<BrixBadge score={28.3} />                    // 🍎 28.3
<BrixBadge score={15.0} />                    // 🍊 15.0
<BrixBadge score={8.2} />                     // 🍅 8.2
<BrixBadge score={-5.0} />                    // 🥒 -5.0
<BrixBadge score={42.0} showScore={false} />  // 🍇 (아이콘만)
```

---

## 2. FinancialText (금액 표시)

금액을 표시하는 전용 컴포넌트입니다. Tabular Nums와 천단위 콤마가 자동 적용됩니다.

### Props Interface

```tsx
interface FinancialTextProps {
  amount: number;
  type?: 'income' | 'expense' | 'locked' | 'neutral';
  size?: 'lg' | 'md' | 'sm';
  showSign?: boolean;      // +/- 부호 표시
  showUnit?: boolean;      // '원' 또는 '크레딧' 표시
  unit?: '원' | '크레딧';
}
```

### Type → Color Mapping

| Type | Color | Usage |
|------|-------|-------|
| `income` | `colors.income` (#F59E0B) | 입금, 충전 (+) |
| `expense` | `colors.expense` (#1C1917) | 지출, 출금 (-) |
| `locked` | `colors.locked` (#78716C) | 보증금, 잠김 |
| `neutral` | `colors.textPrimary` | 일반 금액 |

### Size → Typography Mapping

| Size | Typography Token |
|------|-----------------|
| `lg` | `typography.financialLarge` (28px) |
| `md` | `typography.financialMedium` (20px) |
| `sm` | `typography.financialSmall` (15px) |

### Usage

```tsx
<FinancialText amount={500000} />                         // 500,000
<FinancialText amount={500000} size="lg" showUnit />     // 500,000원
<FinancialText amount={50000} type="income" showSign />  // +50,000
<FinancialText amount={30000} type="expense" showSign /> // -30,000
<FinancialText amount={100000} type="locked" />          // 100,000 (회색)
<FinancialText amount={100000} unit="크레딧" showUnit /> // 100,000크레딧
```

---

## 3. StatusBadge (상태 뱃지)

챌린지, 모임, 투표 등의 상태를 표시하는 전용 뱃지입니다.

### Props Interface

```tsx
interface StatusBadgeProps {
  status: ChallengeStatus | MeetingStatus | VoteStatus;
  size?: 'sm' | 'md';
}

type ChallengeStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
type MeetingStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
type VoteStatus = 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
```

### Status Mapping

| Status | Label | Color | Variant |
|--------|-------|-------|---------|
| `RECRUITING` | 모집 중 | orange | fill |
| `IN_PROGRESS` | 진행 중 | green | fill |
| `COMPLETED` | 종료 | grey | weak |
| `SCHEDULED` | 예정 | blue | weak |
| `CONFIRMED` | 확정 | green | fill |
| `CANCELLED` | 취소 | red | weak |
| `APPROVED` | 승인 | green | fill |
| `REJECTED` | 반려 | red | fill |
| `EXPIRED` | 만료 | grey | weak |

### Usage

```tsx
<StatusBadge status="RECRUITING" />    // 🟠 모집 중
<StatusBadge status="IN_PROGRESS" />   // 🟢 진행 중
<StatusBadge status="COMPLETED" />     // ⚪ 종료
<StatusBadge status="APPROVED" />      // 🟢 승인
```

---

## 4. GroupCard (챌린지 카드)

챌린지 목록에서 사용하는 카드 컴포넌트입니다.

### Props Interface

```tsx
interface GroupCardProps {
  challenge: {
    id: string;
    name: string;
    category: ChallengeCategory;
    thumbnailUrl?: string;
    memberCount: number;
    maxMembers: number;
    monthlyFee: number;
    status: ChallengeStatus;
    isVerified?: boolean;  // ✅ 인증 뱃지
  };
  onClick?: () => void;
}
```

### Layout

```
┌────────────────────────────────────────────┐
│ [썸네일 이미지]                             │
├────────────────────────────────────────────┤
│ 📚 책벌레들  ✅              [모집 중]      │
│ 독서 · 👥 8/10명 · 💰 100,000원/월          │
│                                            │
│ [가입하기]                                  │
└────────────────────────────────────────────┘
```

### Styling

| Property | Value |
|----------|-------|
| Background | White |
| Border Radius | `shape.radiusLg` (20px) |
| Shadow | `shadow.sm` |
| Hover Shadow | `shadow.md` |
| Padding | 16px |

### Usage

```tsx
<GroupCard 
  challenge={challenge}
  onClick={() => navigate(`/challenges/${challenge.id}`)}
/>
```

---

## 5. PostCard (게시글 카드)

피드에서 사용하는 게시글 카드 컴포넌트입니다.

### Props Interface

```tsx
interface PostCardProps {
  post: {
    id: string;
    category: PostCategory;  // API 기준
    author: {
      id: string;
      name: string;
      avatarUrl?: string;
      brixScore?: number;
    };
    content: string;
    imageUrls?: string[];
    isPinned?: boolean;
    likeCount: number;
    commentCount: number;
    isLiked?: boolean;
    createdAt: string;
  };
  onLike?: () => void;
  onComment?: () => void;
  onClick?: () => void;
}

// API_SPECIFICATION_1.0.0.md PostCategory Enum 기준
type PostCategory = 'NOTICE' | 'GENERAL' | 'QUESTION';
```

### Category Mapping

| Category | 레이블 | 아이콘 | 설명 |
|----------|--------|------|------|
| `NOTICE` | 공지사항 | 📌 | 모임장만 작성 가능 |
| `GENERAL` | 일반 | - | 자유 게시글 |
| `QUESTION` | 질문 | ❓ | Q&A |

### Layout

```
┌────────────────────────────────────────────┐
│ 📌 [공지] 1월 모임 장소 변경 안내           │ (isPinned/isNotice)
├────────────────────────────────────────────┤
│ [Avatar] 김철수  🍇 42.5  · 2시간 전        │
│                                            │
│ 오늘 독서 모임 정말 좋았어요! 📚           │
│ [이미지]                                   │
│                                            │
│ ❤️ 12  💬 5                                │
└────────────────────────────────────────────┘
```

### States

| State | Style |
|-------|-------|
| Pinned | 상단 고정, 배경 `colors.orange100` |
| Notice | 📌 아이콘 + Bold 제목 |
| Liked | ❤️ 빨간색 채움 |

### Usage

```tsx
<PostCard 
  post={post}
  onLike={() => handleLike(post.id)}
  onComment={() => openComments(post.id)}
/>
```

---

## 6. VoteCard (투표 카드)

투표 목록에서 사용하는 카드 컴포넌트입니다.

### Props Interface

```tsx
interface VoteCardProps {
  vote: {
    id: string;
    title: string;
    type: VoteType;
    amount?: number;       // EXPENSE 타입일 때
    requester: {
      name: string;
      avatarUrl?: string;
    };
    voteCount: {
      agree: number;
      disagree: number;
      abstain: number;
      notVoted: number;
      total: number;
    };
    threshold: number;     // 통과 기준 % (70%)
    status: VoteStatus;
    expiresAt: string;
    myVote?: VoteChoice;   // API 기준
  };
  onVote?: (choice: VoteChoice) => void;
}

// API_SPECIFICATION_1.0.0.md VoteType Enum 기준
type VoteType = 'EXPENSE' | 'KICK' | 'LEADER_KICK' | 'DISSOLVE' | 'MEETING_ATTENDANCE';

// API_SPECIFICATION_1.0.0.md VoteStatus Enum 기준
type VoteStatus = 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

// API_SPECIFICATION_1.0.0.md VoteChoice Enum 기준
type VoteChoice = 'AGREE' | 'DISAGREE' | 'ABSTAIN';
```

> [!NOTE]
> **VoteType 별 용도**
> - `EXPENSE`: 지출 승인 투표
> - `KICK`: 멤버 강제 퇴장
> - `LEADER_KICK`: 리더 강제 퇴장 (팔로워만 투표)
> - `DISSOLVE`: 챌린지 해산
> - `MEETING_ATTENDANCE`: 정기 모임 참석

### Layout

```
┌────────────────────────────────────────────┐
│ 🗳️ 2월 모임 장소 대관료                    │
│ 요청자: 김철수 (CP) · 금액: 50,000원        │
├────────────────────────────────────────────┤
│ ██████████░░░░░░░░░  찬성 60% (6/10)       │
│                                            │
│ 남은 시간: 23시간                           │
│                                            │
│ [👍 찬성]  [👎 반대]  [⚪ 기권]             │
└────────────────────────────────────────────┘
```

### Usage

```tsx
<VoteCard 
  vote={vote}
  onVote={(choice) => handleVote(vote.id, choice)}
/>
```

---

## 7. BalanceCard (잔액 카드)

어카운트 페이지에서 사용하는 잔액 표시 카드입니다.

### Props Interface

```tsx
interface BalanceCardProps {
  balance: number;         // 총 잔액
  available: number;       // 가용 잔액
  locked: number;          // 보증금 락
  onCharge?: () => void;
  onWithdraw?: () => void;
}
```

### Layout

```
┌────────────────────────────────────────────┐
│      총 크레딧                             │
│      ₩500,000                              │
├────────────────────────────────────────────┤
│ 가용 크레딧    ₩300,000                    │
│ 보증금 락      ₩200,000  [상세보기 >]       │
├────────────────────────────────────────────┤
│ [충전하기]         [출금하기]               │
└────────────────────────────────────────────┘
```

### Styling (Glassmorphism)

| Property | Value |
|----------|-------|
| Background | `rgba(255,255,255,0.8)` |
| Backdrop Filter | `blur(10px)` |
| Border | 1px solid `rgba(255,255,255,0.3)` |
| Border Radius | `shape.radiusXl` (24px) |

### Usage

```tsx
<BalanceCard 
  balance={500000}
  available={300000}
  locked={200000}
  onCharge={() => openChargeModal()}
  onWithdraw={() => openWithdrawModal()}
/>
```

---

## 8. LedgerEntry (장부 항목)

장부에서 사용하는 거래 내역 항목 컴포넌트입니다.

### Props Interface

```tsx
interface LedgerEntryProps {
  entry: {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: LedgerCategory;
    amount: number;
    description: string;
    transactionDate: string;
    createdBy?: {
      name: string;
      avatarUrl?: string;
    };
  };
  onClick?: () => void;
}
```

### Layout

```
┌────────────────────────────────────────────┐
│ 🏢 장소 대관             2026-01-15        │
│ 2월 모임 대관료                            │
│                          -50,000원         │
└────────────────────────────────────────────┘
```

### Category Icons

| Category | Icon |
|----------|------|
| MEETING | 🏢 |
| FOOD | 🍽️ |
| SUPPLIES | 📦 |
| SUPPORT | 💰 |
| ENTRY_FEE | 🎫 |
| OTHER | 📋 |

### Usage

```tsx
<LedgerEntry 
  entry={entry}
  onClick={() => openDetail(entry.id)}
/>
```

---

## 9. MeetingCard (정기 모임 카드)

정기 모임 목록에서 사용하는 카드 컴포넌트입니다.

### Props Interface

```tsx
interface MeetingCardProps {
  meeting: {
    id: string;
    title: string;
    date: Date;
    location: string;
    status: MeetingStatus;
    attendeeCount: number;
    totalMembers: number;
    isQuorumMet: boolean;     // 과반수 충족 여부
  };
  onAttend?: () => void;
  onViewDetail?: () => void;
}

type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
```

### Status Mapping

> [!NOTE]
> API_SPECIFICATION_1.0.0.md MeetingStatus Enum 기준 (3개 값)

| Status | Label | Color | Description |
|--------|-------|-------|-------------|
| `SCHEDULED` | 예정 | `colors.grey500` | 모임 예정 |
| `COMPLETED` | 완료 | `colors.grey400` | 모임 완료 |
| `CANCELLED` | 취소 | `colors.error` | 모임 취소 |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📅 2월 독서 토론회                            📅 예정     │
│  2026-02-15 14:00 · 강남역 스터디카페                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  참석 예정: 7/10명                                          │
│                                                             │
│  ┌───────────────┐  ┌───────────────┐                      │
│  │   참석 확인    │  │   상세 보기    │                      │
│  └───────────────┘  └───────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Styling

| Property | Value |
|----------|-------|
| Background | White |
| Border Radius | `shape.radiusLg` (20px) |
| Shadow | `shadow.sm` |
| Hover Shadow | `shadow.md` |
| Padding | 16px |

### Usage

```tsx
<MeetingCard
  meeting={{
    id: 'meeting_123',
    title: '2월 독서 토론회',
    date: new Date('2026-02-15T14:00:00'),
    location: '강남역 스터디카페',
    status: 'SCHEDULED',
    attendeeCount: 7,
    totalMembers: 10,
    isQuorumMet: true,
  }}
  onAttend={() => handleAttend()}
  onViewDetail={() => openMeetingDetail('meeting_123')}
/>
```

---

## 10. AttendanceStatusBadge (참석 상태 뱃지)

정기 모임 참석 상태를 표시하는 뱃지입니다.

### Props Interface

```tsx
interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
}

type AttendanceStatus = 'ATTENDING' | 'NOT_ATTENDING' | 'PENDING';
```

### Status Mapping

> [!NOTE]
> API_SPECIFICATION_1.0.0.md AttendStatus Enum 기준

| Status | Label | Color | Icon |
|--------|-------|-------|------|
| `ATTENDING` | 참석 예정 | `colors.success` | ✅ |
| `NOT_ATTENDING` | 불참석 | `colors.error` | ❌ |
| `PENDING` | 미응답 | `colors.grey500` | ⏳ |

### Usage

```tsx
// 멤버 목록에서 모임 참석 현황 표시
<MemberCard>
  <Avatar src={member.avatarUrl} />
  <span>{member.name}</span>
  <AttendanceStatusBadge status={member.attendanceStatus} />
</MemberCard>
```

---

## 11. ChallengeStatusBadge (챌린지 상태 뱃지)

챌린지 상태를 표시하는 전용 뱃지입니다.

### Props Interface

```tsx
interface ChallengeStatusBadgeProps {
  status: ChallengeStatus;
  size?: 'sm' | 'md';
}

type ChallengeStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
```

### Status Mapping

| Status | Label | Color | Icon |
|--------|-------|-------|------|
| `RECRUITING` | 모집 중 | `colors.orange500` | 📢 |
| `IN_PROGRESS` | 진행 중 | `colors.success` | ✅ |
| `COMPLETED` | 종료 | `colors.grey400` | 🔒 |

### Usage

```tsx
<GroupCard>
  <ChallengeStatusBadge status={challenge.status} />
  <h3>{challenge.name}</h3>
</GroupCard>
```

---

## 12. MemberStatusBadge (멤버 상태 뱃지)

챌린지 내 멤버의 상태를 표시하는 뱃지입니다.

### Props Interface

```tsx
interface MemberStatusBadgeProps {
  status: MemberStatus;
  size?: 'sm' | 'md';
}

// API_SPECIFICATION_1.0.0.md MemberStatus Enum 기준
type MemberStatus = 'ACTIVE' | 'GRACE_PERIOD' | 'KICKED' | 'LEFT';
```

### Status Mapping

> [!NOTE]
> API_SPECIFICATION_1.0.0.md MemberStatus Enum 기준

| Status | Label | Color | Icon | 설명 |
|--------|-------|-------|------|------|
| `ACTIVE` | 활성 | `colors.success` | ✅ | 정상 참여 중 |
| `GRACE_PERIOD` | 유예 | `colors.warning` | ⏳ | 미납 후 7일 유예 |
| `KICKED` | 퇴장 | `colors.error` | ❌ | 투표로 퇴장됨 |
| `LEFT` | 탈퇴 | `colors.grey400` | 🚪 | 자진 탈퇴 |

### Usage

```tsx
// 멤버 목록에서 상태 표시
<MemberCard>
  <Avatar src={member.avatarUrl} />
  <span>{member.name}</span>
  <MemberStatusBadge status={member.status} />
</MemberCard>

// 유예 상태 강조 (경고 알림)
{member.status === 'GRACE_PERIOD' && (
  <AlertBanner variant="warning" message="납입 유예 중 (7일 이내 납입 필요)" />
)}
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_FOUNDATION.md](./WDS_FOUNDATION.md) - 기초 컴포넌트
- [WDS_OVERLAY.md](./WDS_OVERLAY.md) - 오버레이 컴포넌트
- [WDS_FEEDBACK.md](./WDS_FEEDBACK.md) - 피드백 컴포넌트
- [WDS_LEDGER.md](./WDS_LEDGER.md) - 장부 시스템 컴포넌트
- [WDS_CALENDAR.md](./WDS_CALENDAR.md) - 캘린더 컴포넌트
- [IA_SPECIFICATION.md](../../01_PLANNING/UX_UI/IA_SPECIFICATION.md) - 화면 설계

