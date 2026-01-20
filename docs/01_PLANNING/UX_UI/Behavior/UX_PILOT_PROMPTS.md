# UX Pilot 프롬프트 모음

> **Purpose**: UX Pilot AI 도구에 입력할 화면별 프롬프트
> **Created**: 2026-01-16
> **기준**: UX_SCENARIOS.md, UX_STRATEGY.md

---

## 공통 컨텍스트 (모든 프롬프트 앞에 추가)

```
Platform: Web application (responsive, mobile-first)
Brand: WOORIDO (우리두) - Community Challenge Platform
Brand Color: #E9481E (Orange)
Font: Pretendard (Korean)
Design Style: Modern, clean, trustworthy finance app
Key UX Principles: Transparency, Democracy, Trust, Accessibility, Delight
```

---

## W1: 홈 화면 (Home)

```
Create a mobile wireframe for WOORIDO Home Screen.

## Layout (top to bottom)
1. **Header**
   - Left: Logo (🍊 우리두)
   - Center: (empty)
   - Right: Balance Chip (₩500,000 format) + Notification bell with badge

2. **Section: 내 모임 (My Challenges)**
   - Section title with "전체보기 →" link
   - Vertical list of 3 GroupCards:
     * Thumbnail (60px, rounded)
     * Challenge name (bold)
     * Status badge (진행 중 / 모집 중)
     * Meta: 월 금액 + 정기 모임 일정
     * Footer: Member count (� 8/10명) + Brix badge (🍯 42.5)

3. **Section: 인기 챌린지 (Popular Challenges)**
   - Section title with "더보기 →" link
   - 2 GroupCards (same format)

4. **Bottom Navigation**
   - 5 tabs: 홈(active), 탐색, ➕, 내모임, MY
   - 홈 tab highlighted with orange

## User Context
- Persona: 김직장 (32세, 직장인)
- Emotion: Expectation, sense of belonging
- Goal: Quick overview of my challenges

## Interactions
- Tap GroupCard → Navigate to Challenge Detail
- Tap 전체보기 → My Challenges list
- Tap notification bell → Notification center
```

---

## W2: 탐색 화면 (Explore)

```
Create a mobile wireframe for WOORIDO Explore Screen.

## Layout
1. **Header**
   - Search bar (placeholder: "관심 있는 챌린지 검색")
   - Filter icon button

2. **Category Chips**
   - Horizontal scroll: 전체, 취미, 스터디, 운동, 저축, 여행, 음식

3. **Section: 추천 챌린지**
   - Title: "OO님을 위한 추천"
   - Horizontal carousel of GroupCards

4. **Section: 인기 챌린지**
   - Vertical list of GroupCards with ranking badge (1, 2, 3...)

5. **Bottom Navigation**
   - 탐색 tab active

## User Context
- Scenario: S1 (검색 진입 → 첫 챌린지 가입)
- Goal: Discover interesting challenges

## Interactions
- Type in search → Instant Elasticsearch results
- Tap category chip → Filter list
- Tap GroupCard → Challenge Detail with join option
```

---

## W3: 챌린지 가입 화면 (Challenge Join)

```
Create a mobile wireframe for WOORIDO Challenge Join Screen.

## Layout
1. **Header**
   - Back button
   - Challenge name
   - Share button

2. **Hero Section**
   - Challenge thumbnail (full width, 200px height)
   - Challenge name (large)
   - Category badge + Status badge
   - Leader info: Avatar + Name + Brix score

3. **Info Cards**
   - Card 1: 월 서포트 100,000원
   - Card 2: 보증금 100,000원 (🔒 아이콘 + "락" 설명 툴팁)
   - Card 3: 입회비 428,571원 (계산식 보기 링크)

4. **Trust Badges Row**
   - 🔒 보증금 보호
   - 🗳️ 투표 기반 지출
   - 📊 투명 장부

5. **Total Payment Card**
   - 총 결제 금액: 628,571원
   - 현재 잔액: 700,000원
   - 결제 후 잔액: 71,429원

6. **CTA Button**
   - "가입하기" (Primary, full width)
   - Below: 환불 정책 링크

## User Context
- Scenario: S1-Step 7 (결제 고민)
- Emotion: Anxiety → Understanding (Trust Triangle)
- Key UX: Entry fee transparency

## Interactions
- Tap 계산식 보기 → Modal with formula
- Tap 보증금 툴팁 → Explanation
- Tap 가입하기 → Payment confirmation modal
```

---

## W4: 챌린지 상세 - 피드 탭 (Challenge Detail - Feed)

```
Create a mobile wireframe for WOORIDO Challenge Detail Feed Tab.

## Layout
1. **Header**
   - Back button
   - Challenge name (책벌레들)
   - Settings gear icon

2. **Tab Bar**
   - 5 tabs: 피드(active), 장부, 투표, 모임, 멤버
   - Orange underline on active

3. **Pinned Notice**
   - 📌 Badge + "공지" label
   - Notice content preview
   - Author + timestamp

4. **Feed List**
   - PostCard format:
     * Author: Avatar + Name + Brix badge
     * Content text (expandable)
     * Image (if attached)
     * Footer: ❤️ 12 | 💬 5 | timestamp

5. **FAB (Floating Action Button)**
   - ➕ icon
   - Position: bottom-right

## User Context
- Scenario: S4 (첫 게시글 작성)
- Emotion: Expression, belonging

## Interactions
- Tap PostCard → Post detail with comments
- Double-tap PostCard → Like with heart animation
- Tap FAB → Create post screen
```

---

## W5: 챌린지 상세 - 장부 탭 (Challenge Detail - Ledger)

```
Create a mobile wireframe for WOORIDO Challenge Detail Ledger Tab.

## Layout
1. **Summary Card**
   - Current balance: ₩3,200,000 (large, bold)
   - This month income/expense summary
   - Small trend chart (line chart)

2. **Category Breakdown**
   - Pie chart showing expense categories
   - Legend: 모임비, 식비, 대관료, 기타

3. **Filter Chips**
   - 전체, 입금, 출금, 이번달

4. **Transaction Timeline**
   - Grouped by date
   - Each item:
     * Icon by category
     * Description
     * Amount (+/- colored)
     * Related vote link (if applicable)

## User Context
- Scenario: M4 (장부 확인)
- Key UX: Transparency, every transaction visible

## Interactions
- Tap transaction → Detail modal with receipt
- Pull to refresh → Update data
- Tap chart → Django analysis modal
```

---

## W6: 챌린지 상세 - 모임 탭 (Challenge Detail - Meeting)

```
Create a mobile wireframe for WOORIDO Challenge Detail Meeting Tab.

## Layout
1. **Upcoming Meeting Card**
   - "다가오는 모임" label
   - Meeting title: 2월 영화 상영회
   - Date/Time: 2026-02-15 14:00
   - Location: 강남 카페
   - Attendance status: 8/10 참석
   - My status badge (참석 예정 / 불참)

2. **Action Button**
   - "참석 변경" or "모임 제안" (for leader)

3. **Past Meetings List**
   - MeetingCard format:
     * Title
     * Date
     * Status badge (완료 / 취소)
     * Expense amount

## User Context
- Scenario: L2 (정기 모임 제안)
- Key UX: Majority attendance required

## Interactions
- Tap upcoming card → Meeting detail
- Tap 모임 제안 (leader) → Create meeting vote
```

---

## W7: 챌린지 상세 - 투표 탭 (Challenge Detail - Vote)

```
Create a mobile wireframe for WOORIDO Challenge Detail Vote Tab.

## Layout
1. **Filter Chips**
   - 전체, 진행중, 완료

2. **Active Votes Section**
   - VoteCard format:
     * Type badge (지출 / 모임 / 강퇴)
     * Title
     * Amount (for expense)
     * Progress bar (agree/disagree)
     * Threshold line (e.g., 70%)
     * Remaining time
     * My vote status

3. **Completed Votes Section**
   - Same format with result badge (승인 / 거절)

## User Context
- Scenario: S5 (첫 투표 참여)
- Key UX: Democracy, clear voting status

## Interactions
- Tap VoteCard → Vote detail with cast options
- Tap 찬성/반대 → Submit vote with animation
```

---

## W8: 마이페이지 (My Page)

```
Create a mobile wireframe for WOORIDO My Page Screen.

## Layout
1. **Profile Section**
   - Avatar (large, 80px)
   - Name
   - Brix badge with score (🍇 45.2)
   - "프로필 편집" link

2. **Account Card**
   - Label: 우리두 어카운트
   - Balance: ₩500,000 (large)
   - Sub: 락 잔액 200,000원
   - Buttons: 충전 | 출금

3. **My Challenges Summary**
   - Count: 3개 챌린지 참여중
   - Total monthly support: 월 250,000원

4. **Menu List**
   - 알림 설정
   - 결제 수단 관리
   - 고객센터
   - 로그아웃

5. **Bottom Navigation**
   - MY tab active

## User Context
- Scenario: M1 (잔액 부족 → 충전)
- Key UX: Clear balance, easy top-up

## Interactions
- Tap 충전 → Charge modal (TossPay)
- Tap Brix badge → Score detail
```

---

## W9: 정기 모임 상세 (Meeting Detail)

```
Create a mobile wireframe for WOORIDO Meeting Detail Screen.

## Layout
1. **Header**
   - Back button
   - Title: 2월 영화 상영회

2. **Meeting Info Card**
   - 📅 2026-02-15 (토) 14:00
   - 📍 강남 OO카페
   - Status badge: 확정 / 대기중

3. **Attendance Section**
   - Title: 참석 현황 (8/10)
   - Threshold indicator: 과반수 필요
   - Avatar list of attendees

4. **My Attendance**
   - Current status
   - 참석 / 불참 toggle buttons

5. **Related Expenses**
   - List of approved expenses for this meeting
   - Total: ₩150,000

## User Context
- Scenario: L2-Step 5 (참석 현황 확인)

## Interactions
- Toggle attendance → Update vote
- Tap expense → Expense detail
```

---

## W10: 해산 플로우 (Dissolution Flow)

```
Create a mobile wireframe for WOORIDO Challenge Dissolution Flow.

## Screen 1: Dissolution Request
1. **Warning Alert**
   - ⚠️ Icon
   - Title: 챌린지 해산 요청
   - Message: 전원 동의 시에만 해산됩니다

2. **Info Panel**
   - Current balance: ₩3,200,000
   - Members: 10명
   - Per person: ₩320,000

3. **Confirmation Inputs**
   - Checkbox: 해산 후 복구 불가 동의
   - Checkbox: 잔액 분배 방식 동의

4. **CTA**
   - "해산 투표 시작" (Danger button)

## Screen 2: Dissolution Vote Status
1. **Vote Progress**
   - 전원 동의 필요 (10/10)
   - Current: 7/10 동의
   - Time remaining

2. **Member List**
   - Each member with vote status (✓ / ⏳ / ✗)

## User Context
- Scenario: L5 (챌린지 해산)
- Emotion: Serious, final decision
- Key UX: 100% agreement required

## Interactions
- All agree → Balance distribution animation
- Any reject → Dissolution cancelled
```

---

## 사용 방법

1. UX Pilot에 접속
2. "공통 컨텍스트" 섹션을 먼저 입력
3. 원하는 화면 프롬프트를 복사하여 입력
4. 생성된 와이어프레임을 Figma로 Export

---

## 관련 문서

- [UX_SCENARIOS.md](../../01_PLANNING/UX_UI/UX_SCENARIOS.md)
- [UX_STRATEGY.md](../../01_PLANNING/UX_UI/UX_STRATEGY.md)
- [WDS_DOMAIN.md](./WDS_DOMAIN.md)
