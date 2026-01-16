# WDS Calendar Components

> **Category**: 캘린더 및 날짜 관련 컴포넌트
> **Parent**: [DESIGN_TOKENS.md](./DESIGN_TOKENS.md)
> **Tech Stack**: react-day-picker + @schedule-x/react
> **Last Updated**: 2026-01-16

---

## 1. EventCalendar (통합 캘린더 뷰)

장부 + 정기 모임 이벤트를 시간축으로 통합 표시하는 캘린더입니다.

### Props Interface

```tsx
interface EventCalendarProps {
  events: CalendarEvent[];
  view: 'month' | 'week' | 'agenda';
  onViewChange?: (view: 'month' | 'week' | 'agenda') => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  highlightToday?: boolean;
  compact?: boolean;          // 장부 탭 상단용 컴팩트 뷰
}

// [!NOTE] CalendarEvent.type은 프론트엔드 전용 복합 타입입니다.
// API의 TransactionType + MeetingStatus를 조합하여 생성합니다.
interface CalendarEvent {
  id: string;
  type: CalendarEventType;    // 프론트엔드 전용
  date: Date;
  title: string;
  summary: string;
  amount?: number;
  challengeId: string;
  link: string;
}

// 프론트엔드 전용 복합 타입 (API에 없음)
type CalendarEventType = 'MEETING' | 'SUPPORT' | 'EXPENSE' | 'ENTRY_FEE';
```

> [!NOTE]
> `CalendarEventType`은 프론트엔드 전용 복합 타입입니다.
> API의 `TransactionType` + `MeetingStatus`를 조합하여 생성합니다.

### Event Type Styling

| Type | 아이콘 | Color Token | Tooltip 내용 |
|------|-------|-------------|-------------|
| `MEETING` | 📅 | `colors.orange500` | 장소, 참석 현황 |
| `SUPPORT` | 💰 | `colors.success` | 납입 총액, 인원 |
| `EXPENSE` | 📤 | `colors.grey600` | 지출 금액, 사유 |
| `ENTRY_FEE` | 🎫 | `colors.brixGrape` | 입회비 금액, 신규 멤버 |

### Layout (Month View)

```
┌─────────────────────────────────────────────────────────────┐
│  ◀  2026년 2월  ▶                         [월] [주] [목록] │
├─────────────────────────────────────────────────────────────┤
│  일    월    화    수    목    금    토                     │
├─────────────────────────────────────────────────────────────┤
│       │     │     │     │     │  1💰 │  2   │
│       │     │     │     │     │서포트│      │
├───────┼─────┼─────┼─────┼─────┼─────┼──────┤
│   3   │  4  │  5  │  6  │  7  │  8  │  9📅 │
│       │     │     │     │     │     │독서  │
├───────┼─────┼─────┼─────┼─────┼─────┼──────┤
│  10   │ 11  │ 12  │ 13  │ 14📤│ 15  │  16  │
│       │     │     │     │대관 │     │      │
└───────┴─────┴─────┴─────┴─────┴─────┴──────┘
```

### Layout (Compact - 장부 탭 상단용)

```
┌─────────────────────────────────────────────────────────────┐
│  ◀  2월  ▶                                                  │
│  1💰  2   3   4   5   6   7📅  8   9   10  ...  28        │
└─────────────────────────────────────────────────────────────┘
```

### UX Flow

| 액션 | 동작 |
|------|------|
| **날짜 호버** | Tooltip 등장 (이벤트 요약) |
| **Tooltip 클릭** | 해당 페이지로 이동 |
| **모임 이벤트** | `/groups/:id/meetings/:meetingId` |
| **거래 이벤트** | `/groups/:id/ledger?date=YYYY-MM-DD` |

### Usage

```tsx
// 장부 탭 상단 (컴팩트)
<EventCalendar
  events={challengeEvents}
  view="month"
  compact
  onEventClick={(event) => navigateToEvent(event)}
  onDateClick={(date) => filterByDate(date)}
/>

// 풀 캘린더 뷰
<EventCalendar
  events={events}
  view="month"
  onViewChange={setView}
  highlightToday
/>
```

---

## 2. DatePicker (날짜 선택)

폼에서 사용하는 날짜 선택 컴포넌트입니다. react-day-picker를 래핑합니다.

### Props Interface

```tsx
interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabledDates?: Date[];     // 선택 불가 날짜
}
```

### States

| State | 스타일 |
|-------|--------|
| Default | Border: `colors.border` |
| Focus | Border: `colors.orange500` (2px) |
| Error | Border: `colors.error`, Helper: `colors.error` |
| Disabled | Background: `colors.grey100`, Cursor: not-allowed |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  모임 날짜 *                                                │
│  ┌────────────────────────────────────────────────┐        │
│  │  2026-02-15                            📅     │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  Dropdown:                                                  │
│  ┌────────────────────────────────────────────────┐        │
│  │  ◀  2026년 2월  ▶                              │        │
│  ├────────────────────────────────────────────────┤        │
│  │  일   월   화   수   목   금   토              │        │
│  │  ...  ...  ...  ...  ...  ...  1               │        │
│  │  2    3    4    5    6    7    8               │        │
│  │  ...                                          │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
// 모임 생성 폼
<DatePicker
  label="모임 날짜"
  value={meetingDate}
  onChange={setMeetingDate}
  minDate={new Date()}          // 오늘 이후만
  placeholder="날짜를 선택하세요"
  required
/>

// 투표 만료일 선택
<DatePicker
  label="투표 마감일"
  value={expiresAt}
  onChange={setExpiresAt}
  minDate={addDays(new Date(), 1)}
  maxDate={addDays(new Date(), 7)}
  error={errors.expiresAt}
/>
```

---

## 3. MiniCalendar (미니 캘린더)

정기 모임 탭 사이드바에 사용하는 컴팩트 캘린더입니다.

### Props Interface

```tsx
interface MiniCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  highlightDates?: HighlightDate[];
  month?: Date;               // 표시할 월
  onMonthChange?: (month: Date) => void;
}

interface HighlightDate {
  date: Date;
  type: 'MEETING' | 'SUPPORT' | 'EXPENSE';
  count?: number;             // 해당 날짜 이벤트 수
}
```

### Responsive Visibility

| 해상도 | MiniCalendar 위치 |
|--------|------------------|
| Mobile (< 768px) | **숨김**, 상단 DatePicker로 대체 |
| Tablet (768-1279px) | 우측 사이드바 (200px 고정) |
| Desktop (1280px+) | 우측 사이드바 (240px 고정) |

### Layout

```
┌─────────────────────────┐
│  ◀  2월  ▶              │
├─────────────────────────┤
│  일  월  화  수  목  금  토 │
│      1●  2   3   4   5  6 │
│   7  8   9📅 10  11  12 13│
│  14  15  16  17  18  19 20│
│  21  22  23  24  25  26 27│
│  28                       │
└─────────────────────────┘
● = 이벤트 있는 날짜 (점 표시)
📅 = 선택된 날짜
```

### Usage

```tsx
// 정기 모임 탭 사이드바
<aside className="meeting-sidebar">
  <MiniCalendar
    selectedDate={selectedDate}
    onDateSelect={(date) => {
      setSelectedDate(date);
      scrollToMeeting(date);
    }}
    highlightDates={meetingDates.map(d => ({
      date: d,
      type: 'MEETING',
    }))}
  />
</aside>
```

---

## 4. DateRangePicker (날짜 범위 선택)

장부 필터링 등에서 사용하는 날짜 범위 선택 컴포넌트입니다.

### Props Interface

```tsx
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { start?: Date; end?: Date }) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: DateRangePreset[];
}

type DateRangePreset = {
  label: string;              // "이번 달", "최근 3개월"
  range: { start: Date; end: Date };
};
```

### Default Presets

| Preset | 범위 |
|--------|------|
| 이번 주 | 현재 주 월~일 |
| 이번 달 | 현재 월 1일~말일 |
| 지난 달 | 전월 1일~말일 |
| 최근 3개월 | 3개월 전~오늘 |
| 전체 기간 | null (필터 해제) |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  기간 선택                                                   │
│                                                             │
│  [이번 주] [이번 달] [지난 달] [최근 3개월] [직접 선택]       │
│                                                             │
│  2026-02-01  ~  2026-02-28                          🗓️     │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
<DateRangePicker
  startDate={filterStart}
  endDate={filterEnd}
  onChange={({ start, end }) => {
    setFilterStart(start);
    setFilterEnd(end);
    refetchTransactions();
  }}
  presets={[
    { label: '이번 달', range: { start: startOfMonth(new Date()), end: endOfMonth(new Date()) } },
    { label: '최근 3개월', range: { start: subMonths(new Date(), 3), end: new Date() } },
  ]}
/>
```

---

## 5. UpcomingEventCard (예정 이벤트)

다가오는 이벤트(모임, 납입일 등)를 표시하는 카드입니다.

### Props Interface

```tsx
interface UpcomingEventCardProps {
  event: {
    id: string;
    type: 'MEETING' | 'SUPPORT' | 'VOTE_EXPIRY';
    title: string;
    date: Date;
    daysUntil: number;
    description?: string;
  };
  onEventClick?: () => void;
}
```

### Event Types

| Type | 아이콘 | 강조 조건 |
|------|-------|----------|
| `MEETING` | 📅 | D-3 이하: `colors.warning` |
| `SUPPORT` | 💰 | D-3 이하: `colors.warning` |
| `VOTE_EXPIRY` | 🗳️ | D-1 이하: `colors.error` |

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📅 2월 독서 토론회                              D-3 ⚠️    │
│  2026-02-15 14:00 · 강남역 스터디카페                       │
└─────────────────────────────────────────────────────────────┘
```

### Usage

```tsx
// 홈 화면 미결 알림 섹션
<div className="upcoming-events">
  {upcomingEvents.map(event => (
    <UpcomingEventCard
      key={event.id}
      event={event}
      onEventClick={() => navigateToEvent(event)}
    />
  ))}
</div>
```

---

## 관련 문서

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - 메인 디자인 토큰
- [WDS_LEDGER.md](./WDS_LEDGER.md) - 장부 시스템 컴포넌트
- [WDS_FEEDBACK.md](./WDS_FEEDBACK.md) - 피드백 컴포넌트
- [WDS_FORM.md](./WDS_FORM.md) - 폼 컴포넌트
- [FRONTEND_TECH_STACK.md](../FRONTEND_TECH_STACK.md) - 캘린더 라이브러리 설정
