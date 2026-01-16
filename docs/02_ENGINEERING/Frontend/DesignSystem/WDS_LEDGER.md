# WDS Ledger Components

> **Category**: 장부 시스템 전용 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Last Updated**: 2026-01-16

---

## 1. LedgerSummaryCard (잔액 요약)

챌린지 장부의 요약 정보를 표시하는 카드입니다.

### Props Interface

```tsx
interface LedgerSummaryCardProps {
  totalBalance: number;        // 총 오픈 잔액
  thisMonth: {
    income: number;            // 이번 달 수입
    expense: number;           // 이번 달 지출
    net: number;               // 순 변동
  };
  lastMonth: {
    expense: number;           // 지난 달 지출
    transactionCount: number;  // 거래 건수
  };
  onDetailClick?: () => void;
}
```

### Layout

```
┌─────────────┬─────────────┬─────────────┐
│   총 오픈    │   이번 달    │  지난 달    │
│  800,000    │  -50,000    │ -120,000    │
│   크레딧    │  (1건 지출)  │  (3건 지출)  │
└─────────────┴─────────────┴─────────────┘
```

### Styling

| Property | Value |
|----------|-------|
| Background | `colors.surface` |
| Border Radius | `shape.radiusLg` (20px) |
| Padding | 16px |
| Gap | 12px (그리드 간격) |

### Usage

```tsx
<LedgerSummaryCard
  totalBalance={800000}
  thisMonth={{ income: 100000, expense: 150000, net: -50000 }}
  lastMonth={{ expense: 120000, transactionCount: 3 }}
  onDetailClick={() => openDetailModal()}
/>
```

---

## 2. ChartWrapper (차트 래퍼)

Recharts 차트를 WDS 스타일로 래핑하는 컴포넌트입니다.

### Props Interface

```tsx
interface ChartWrapperProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataItem[];
  title?: string;
  height?: number;            // 기본 200px
  loading?: boolean;
  emptyMessage?: string;
}

interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}
```

### Chart Type Colors

| Type | 색상 매핑 |
|------|----------|
| Income (수입) | `colors.income` (#F59E0B) |
| Expense (지출) | `colors.grey600` |

### Styling

| Property | Value |
|----------|-------|
| Background | `colors.surface` |
| Border Radius | `shape.radiusLg` |
| Padding | 16px |
| Font (Axis) | `typography.w6` |
| Font (Tooltip) | `typography.w5` |

### Usage

```tsx
<ChartWrapper
  type="bar"
  title="월별 지출 현황"
  data={[
    { label: '1월', value: 120000 },
    { label: '2월', value: 80000 },
    { label: '3월', value: 150000 },
  ]}
  height={250}
/>

// 로딩 상태
<ChartWrapper type="pie" data={[]} loading />

// 빈 상태
<ChartWrapper 
  type="line" 
  data={[]} 
  emptyMessage="아직 거래 내역이 없어요" 
/>
```

---

## 3. InsightCard (Django 분석 결과)

Django 분석 서버에서 제공하는 인사이트를 표시하는 카드입니다.

### Props Interface

```tsx
interface InsightCardProps {
  insights: InsightItem[];
  loading?: boolean;
  onInsightClick?: (insight: InsightItem) => void;
}

interface InsightItem {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary';
  icon: string;              // 이모지
  title: string;
  description: string;
  metric?: {
    value: number;
    unit: string;
    direction: 'up' | 'down' | 'neutral';
  };
}
```

### Insight Types

| Type | 아이콘 | 배경색 | 용도 |
|------|-------|--------|------|
| `trend` | 📈 | `colors.orange100` | 트렌드 분석 |
| `anomaly` | ⚠️ | `colors.warning` + 10% | 이상 감지 |
| `recommendation` | 💡 | `colors.success` + 10% | 추천 |
| `summary` | 📊 | `colors.surfaceGrey` | 요약 통계 |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Django 분석 결과                                         │
├─────────────────────────────────────────────────────────────┤
│  📈 평균 월 지출: 85,000 크레딧                              │
│  🏢 가장 많이 쓴 카테고리: 장소 대관 (60%)                   │
│  📉 전월 대비: 15% 감소                                      │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
<InsightCard
  insights={[
    {
      id: '1',
      type: 'summary',
      icon: '📊',
      title: '평균 월 지출',
      description: '최근 6개월 평균',
      metric: { value: 85000, unit: '크레딧', direction: 'neutral' },
    },
    {
      id: '2',
      type: 'trend',
      icon: '📉',
      title: '지출 감소',
      description: '전월 대비 15% 감소',
      metric: { value: -15, unit: '%', direction: 'down' },
    },
  ]}
/>
```

---

## 4. BarcodeCard (승인된 지출)

투표 승인 후 바코드 결제 대기 중인 지출 항목입니다.

### Props Interface

```tsx
interface BarcodeCardProps {
  barcode: {
    id: string;
    title: string;
    amount: number;
    approvedAt: string;
    expiresAt: string;
    status: 'PENDING' | 'USED' | 'EXPIRED';
  };
  onViewBarcode: () => void;
  onMarkComplete?: () => void;
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 2월 모임 대관료                              50,000원   │
│  승인: 2026-02-10  │  만료: 28:45 ⏱️                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   [바코드 보기]                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### States

| Status | 스타일 | 동작 |
|--------|--------|------|
| `PENDING` | 기본 | 바코드 보기 활성 |
| `USED` | `colors.success` 테두리 | "결제 완료" 표시 |
| `EXPIRED` | `colors.grey400` 배경 | "만료됨" 표시, 버튼 비활성 |

### Usage

```tsx
<BarcodeCard
  barcode={{
    id: 'bc_123',
    title: '2월 모임 대관료',
    amount: 50000,
    approvedAt: '2026-02-10T10:00:00Z',
    expiresAt: '2026-02-10T10:10:00Z',
    status: 'PENDING',
  }}
  onViewBarcode={() => openBarcodeModal('bc_123')}
/>
```

---

## 5. BarcodeModal (바코드 표시)

실제 바코드 이미지와 만료 타이머를 표시하는 모달입니다.

### Props Interface

```tsx
interface BarcodeModalProps {
  open: boolean;
  onClose: () => void;
  barcode: {
    id: string;
    title: string;
    amount: number;
    barcodeImage: string;     // Base64 또는 URL
    expiresAt: string;
  };
  onPaymentComplete: () => void;
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  💳 바코드 결제                                     [X]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🏢 2월 모임 대관료                                        │
│   금액: 50,000원                                            │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                      │  │
│   │       ████████████████████████████████████           │  │
│   │       ██  바코드 이미지 (1D/QR)  ██                  │  │
│   │       ████████████████████████████████████           │  │
│   │                                                      │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ⏱️ 만료까지: 08:45  (CountdownTimer 사용)                 │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                  결제 완료 확인                       │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   * 결제 완료 시 장부에 자동 기록됩니다                      │
│   * PG 응답에서 상호명/업종이 자동 파싱됩니다                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
<BarcodeModal
  open={isBarcodeModalOpen}
  onClose={() => setIsBarcodeModalOpen(false)}
  barcode={{
    id: 'bc_123',
    title: '2월 모임 대관료',
    amount: 50000,
    barcodeImage: 'data:image/png;base64,...',
    expiresAt: '2026-02-10T10:10:00Z',
  }}
  onPaymentComplete={() => handlePaymentComplete()}
/>
```

---

## 6. TransactionTimeline (거래 내역)

시간순으로 거래 내역을 표시하는 타임라인 컴포넌트입니다.

### Props Interface

```tsx
interface TransactionTimelineProps {
  transactions: Transaction[];
  groupBy: 'day' | 'month';
  onTransactionClick?: (tx: Transaction) => void;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

interface Transaction {
  id: string;
  type: TransactionType;       // API 기준
  category?: ExpenseCategory;  // 지출인 경우만
  amount: number;
  description: string;
  transactionDate: string;
  linkedVoteId?: string;       // 연결된 투표 ID
  linkedMeetingId?: string;    // 연결된 모임 ID
  createdBy?: {
    name: string;
    avatarUrl?: string;
  };
}

// API_SPECIFICATION_1.0.0.md TransactionType Enum 기준
type TransactionType = 'CHARGE' | 'WITHDRAW' | 'DEPOSIT' | 'REFUND' | 'FEE' | 'SETTLEMENT';

// API_SPECIFICATION_1.0.0.md ExpenseCategory Enum 기준
type ExpenseCategory = 'MEETING' | 'FOOD' | 'SUPPLIES' | 'OTHER';
```

> [!NOTE]
> **API 정합성 참고**
> - `TransactionType`: 거래 유형 (6개 값)
> - `ExpenseCategory`: 지출 카테고리 (4개 값)

### TransactionType Icons

| Type | Icon | 색상 | 설명 |
|------|------|------|------|
| CHARGE | 💳 | `colors.success` | 충전 |
| WITHDRAW | 📤 | `colors.grey600` | 출금 |
| DEPOSIT | 💰 | `colors.success` | 서포트 납입 |
| REFUND | 🔙 | `colors.warning` | 환불 |
| FEE | 📊 | `colors.grey400` | 수수료 |
| SETTLEMENT | 📋 | `colors.brixGrape` | 정산 |

### ExpenseCategory Icons

| Category | Icon | 색상 | 설명 |
|----------|------|------|------|
| MEETING | 🏢 | `colors.orange500` | 모임비 - 장소 대여 등 |
| FOOD | 🍽️ | `colors.brixApple` | 식비 - 다과, 식사 |
| SUPPLIES | 📦 | `colors.brixGrape` | 물품 - 소모품 구매 |
| OTHER | 📋 | `colors.grey600` | 기타 |

```
┌─────────────────────────────────────────────────────────────┐
│  📅 2026년 2월                                               │
├─────────────────────────────────────────────────────────────┤
│  ○ 2026-02-10                                               │
│  │                                                          │
│  ├─ 🏢 장소 대관                               -50,000원    │
│  │  2월 모임 대관료                                         │
│  │  [투표 보기]                                             │
│  │                                                          │
│  ├─ 🍽️ 식비                                   -80,000원    │
│  │  모임 후 식대                                            │
│  │                                                          │
│  ○ 2026-02-01                                               │
│  │                                                          │
│  ├─ 💰 서포트 납입                            +800,000원    │
│  │  8명 x 100,000원                                         │
│  │                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
<TransactionTimeline
  transactions={transactions}
  groupBy="month"
  onTransactionClick={(tx) => openDetail(tx.id)}
  hasMore={hasNextPage}
  onLoadMore={fetchNextPage}
/>
```

---

## 7. LinkedEntryIndicator (연결된 항목 표시)

투표 → 장부 연결을 시각적으로 표시하는 인디케이터입니다.

### Props Interface

```tsx
interface LinkedEntryIndicatorProps {
  type: 'vote' | 'meeting';
  linkedId: string;
  label: string;              // "투표에서 승인됨", "2월 모임 관련"
  onClick?: () => void;
}
```

### Styling

| Property | Value |
|----------|-------|
| Background | `colors.orange100` |
| Border | 1px dashed `colors.orange300` |
| Border Radius | `shape.radiusSm` |
| Padding | 4px 8px |
| Font | `typography.w7` |

### Usage

```tsx
// LedgerEntry 내부에서 사용
<LedgerEntry entry={entry}>
  {entry.linkedVoteId && (
    <LinkedEntryIndicator
      type="vote"
      linkedId={entry.linkedVoteId}
      label="투표에서 승인됨"
      onClick={() => navigateToVote(entry.linkedVoteId)}
    />
  )}
</LedgerEntry>
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_CALENDAR.md](./WDS_CALENDAR.md) - 캘린더 컴포넌트
- [WDS_FEEDBACK.md](./WDS_FEEDBACK.md) - 피드백 컴포넌트
- [WDS_DOMAIN.md](./WDS_DOMAIN.md) - 도메인 특화 컴포넌트
- [IA_SPECIFICATION.md](../../01_PLANNING/UX_UI/IA_SPECIFICATION.md) - 화면 설계
