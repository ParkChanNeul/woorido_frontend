# 📊 WOORIDO 프로덕트 아젠다 (Product Agenda)

> **Project:** WOORIDO (Community-First Funding Solution)
> **Version:** v2.0 - Demo Day Sprint Edition 🚀
> **Last Updated:** 2025-12-19
> **Status:** **68 Days to Demo Day** ⏰
>
> **CRITICAL DEADLINE: 2026년 2월 25일 (공식 시연)**
> - 현재: 2025-12-19
> - 남은 시간: **68일 (10주)**
> - 시연 형식: **라이브 데모 (Live Demo)**
> - 이후 계획: 사이드 프로젝트로 지속 발전

---

## [0] Team & Mission

### 팀 구성
```
총 인원: 3명
역할: 풀스택 개발자 아카데미 프로젝트 팀
배경:
  - SI 회사 영업원 출신
  - 종합 마케팅 매니저 출신
  - 디지털 에이전시 대표 출신

강점: ⭐⭐⭐⭐⭐ 기획력, 비즈니스 이해도, 사용자 관점
약점: ⭐☆☆☆☆ 개발 능력 (학습 중, 비전공자)

멘토링:
  - 주 5회 수업시간
  - 노션, 지라 등 소통 채널로 질의응답
  - 아카데미 강사 + 연계 기업 사원 멘토
```

### 🎯 미션: Demo Day Success
**2026년 2월 25일 공식 시연에서 작동하는 라이브 데모 성공**

**핵심 원칙:**
- **"Perfect is the enemy of done"** - 완벽한 기능보다 안정적으로 작동하는 데모
- **"Demo-Driven Development"** - 시연 시나리오 역산하여 필수 기능만 개발
- **"Zero Error Tolerance"** - 라이브 데모이므로 크리티컬 버그는 절대 불가

---

## [1] Vision & Core Value

### 핵심 미션 🌟
> **"고객 수입·지출 데이터 분석 기반 지역 계모임 운영 솔루션 구축"**
> — KH정보교육원 Python & Elasticsearch 기반 금융 솔루션 개발자 아카데미

### Vision (장기)
**"기술로 신뢰를 보증하는 가장 안전한 취향 공동체"**

폐쇄형 커뮤니티의 오프라인 활동에 투명한 금융 인프라를 제공하여, 사람들이 **'돈 걱정 없이 취향으로 연결'**되는 세상을 만듭니다.

### Demo Day Value Proposition
**"당신의 재정 상황에 맞는 완벽한 계모임을 찾아드립니다"**

**핵심 차별화:**
```
기존 서비스:  통장 개설 → 돈 모으기 → 문제 발생 시 대응 (Reactive)
WOORIDO:     고객 재정 분석 → 신뢰 검증 → 맞춤 매칭 → 투명 운영 (Proactive)
```

**🔺 3-Layer Trust Architecture = 5대 코어**

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: 고객 이해 (Customer Intelligence) 💰              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                             │
│    재정 프로필 분석 (Django + pandas)                        │
│    ├─ 월 수입/지출/저축가능액 분석                           │
│    ├─ 적정 납입금 추천                                      │
│    └─ 재정 건전성 점수 산출                                  │
│                                                             │
│    🌟 핵심 미션: "고객 재정 데이터 분석 기반"                 │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ Feeds into
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: 신뢰 트라이포드 (Trust Tripod) ⭐ 핵심 차별화      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                             │
│                          △                                 │
│                         /|\                                │
│                        / | \                               │
│                       /  |  \                              │
│          ┌───────────┐ ┌─┴─┐ ┌───────────┐                │
│          │ 선충전 락  │ │장부│ │ 결제 감시  │                │
│          │(Deposit   │ │투명│ │ 다각화    │                │
│          │   Lock)   │ │ 화 │ │(Consensus │                │
│          └───────────┘ └───┘ │   Pay)    │                │
│                              └───────────┘                │
│                                                             │
│    "기술로 신뢰를 보증하는 3가지 메커니즘"                     │
│                                                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ Enabled by
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: 발견 엔진 (Discovery Engine) 🔍                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                             │
│    Elasticsearch 취향 검색 + 재정 적합성 필터                │
│    ├─ 태그/텍스트 전문 검색                                  │
│    ├─ 카테고리 필터링                                        │
│    └─ 재정 프로필 기반 매칭                                  │
│                                                             │
│    "Rate(이자)보다 Taste(취향)"                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**5대 코어 기능 (3-Layer 구조):**

**Layer 1: 고객 이해 (1개 코어)**
1. **💰 재정 분석 (Financial Analysis)**: Django pandas로 고객 수입/지출 분석, 적정 납입금 추천 🌟 **핵심 미션**

**Layer 2: 신뢰 트라이포드 (3개 코어) ⭐**
2. **🔒 선충전 락 (Deposit Lock)**: 보증금 선입금으로 신뢰 확보 (Mock)
3. **📊 장부 투명화 (Open Ledger)**: Recharts 시각화 + Django 데이터 분석
4. **🗳️ 결제 감시 다각화 (Consensus Pay)**: 투표 기반 지출 승인 시스템

**Layer 3: 발견 엔진 (1개 코어)**
5. **🔍 취향 검색 (Taste Search)**: Elasticsearch 태그/텍스트/카테고리 + 재정 필터

**아키텍처 핵심 메시지:**
> "먼저 고객을 이해하고(Layer 1), 신뢰를 보증하며(Layer 2), 최적의 매칭을 제공합니다(Layer 3)"

---

## [2] 기술 스택 (Spring-Django-Oracle-Elasticsearch Architecture)

### 시스템 구조도

```
┌─────────────────────────────────────────┐
│          Frontend (React + TS)          │
│  - 모임 관리 UI                          │
│  - Recharts 장부 차트                    │
│  - 투표 UI, SNS 피드                     │
│  - ⭐ 반응형 디자인 (Mobile-First)        │
│  - 웹앱 방식 (Desktop & Mobile)          │
│  - 🔍 취향 검색 UI                       │
└───────────────┬─────────────────────────┘
                │ REST API (JSON)
                ▼
┌─────────────────────────────────────────┐
│      Spring Boot (Main Backend)         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  역할:                                   │
│  - Oracle DB 단독 연동 (JDBC)            │
│  - 모임/투표/장부/유저 CRUD              │
│  - JWT 인증 및 권한 관리                 │
│  - Django 데이터 분석 요청 라우팅         │
│  - 🔍 Elasticsearch 검색 연동            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
└──────┬──────────────┬───────────┬───────┘
       │ JDBC         │ HTTP API  │ REST API
       │              │           │
       ▼              ▼           ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│  Oracle DB  │  │   Django    │  │  Elasticsearch  │
│             │  │  (분석 전용) │  │   (검색 전용)   │
│ - 모든 데이터│  │             │  │                 │
│   저장소    │  │ - pandas    │  │ - 태그 검색     │
│             │  │   집계/통계 │  │ - 텍스트 검색   │
│ - Spring만  │  │             │  │ - 카테고리 필터 │
│   접근 허용 │  │ ❌ DB 금지   │  │                 │
└─────────────┘  └─────────────┘  └─────────────────┘
```

### 각 레이어 상세 스펙

| 레이어 | 기술 | 주요 역할 | 시연 범위 |
|--------|------|----------|----------|
| **Frontend** | • React 18.3 + TypeScript 5.3<br>• Recharts 2.12<br>• Radix UI<br>• Storybook 10.1.8<br>• ⭐ **Responsive Design (Mobile-First)** | • 모임 대시보드<br>• 장부 차트 렌더링<br>• 투표 UI<br>• SNS 피드/댓글<br>• **반응형 웹앱 (Desktop & Mobile)** | • ✅ 반응형 디자인 전 기기 지원<br>• Desktop (≥768px), Mobile (<768px)<br>• 이미지 업로드 제외 (텍스트만) |
| **Main Backend** | • Spring Boot 3.2<br>• Spring Data JPA<br>• Spring Security<br>• JWT | • **Oracle DB 전담 연결**<br>• 비즈니스 로직<br>• RESTful API<br>• Django 라우팅 | • 핵심 CRUD 전담<br>• 인증/권한 관리 |
| **Analytics Backend** | • Django 5.0<br>• numpy 1.26<br>• pandas 2.1<br>• DRF | • Spring Boot에서 JSON 데이터 수신<br>• pandas 집계 및 통계<br>• 결과 JSON 반환<br>**❌ DB 직접 연결 금지** | • 월평균 지출<br>• 카테고리별 비율<br>• 지출 트렌드 (최소 1-2개 통계만) |
| **Database** | • Oracle 21c XE<br>• Docker 구동 | • 단일 데이터 저장소<br>• Spring Boot만 접근 | • 로컬 환경 (localhost) |
| **Search Engine** | • Elasticsearch 8.x<br>• Elastic Cloud Free Tier | • 🔍 **취향 검색 (4번째 코어)**<br>• 태그 검색<br>• 텍스트 전문 검색<br>• 카테고리 필터 | • 기본 검색만 (태그, 텍스트)<br>• 고급 기능 제외 (자동완성 등) |
| **Deployment** | • Frontend: Vercel<br>• Backend: 로컬 or 클라우드 | • 시연용 배포 | • 로컬 환경으로도 가능 |

### 반응형 디자인 전략 (Responsive Design Strategy) ⭐

**Why This Matters:**
> "모바일 환경을 웹앱처럼 구현하는게 초기에 팀원들을 설득한 핵심 포인트 중 하나입니다."

**핵심 원칙:**
- **Mobile-First Approach**: 모바일 화면 우선 설계 후 Desktop 확장
- **웹앱 방식 (Web App)**: 네이티브 앱 없이 모바일 브라우저에서 앱처럼 작동
- **PWA 기반**: 홈 화면 추가, 오프라인 대응 가능 (Demo Day 이후)
- **단일 코드베이스**: React 하나로 Desktop + Mobile 모두 대응

**Breakpoint 전략:**

```css
/* Mobile First */
모바일: < 768px (기본 스타일, 320px ~ 767px)
데스크톱: ≥ 768px (@media 쿼리로 확장)

/* 주요 디바이스 */
iPhone SE: 375 x 667px
iPhone 14: 390 x 844px
Galaxy S23: 360 x 800px
Desktop: 1920 x 1080px
```

**반응형 컴포넌트 예시:**

```tsx
// 장부 차트 - 모바일에서는 세로 스택, 데스크톱에서는 가로 배치
<div className="stats-container">
  {/* Mobile: 세로 스택 */}
  <LineChart width={350} height={250} /> {/* 모바일 */}

  {/* Desktop: 가로 배치 */}
  <LineChart width={800} height={400} /> {/* 데스크톱 */}
</div>

// CSS
.stats-container {
  display: flex;
  flex-direction: column; /* 모바일 기본 */
}

@media (min-width: 768px) {
  .stats-container {
    flex-direction: row; /* 데스크톱은 가로 */
  }
}
```

**Storybook 반응형 데모:**
- Week 0-1에 모든 컴포넌트 Mobile/Desktop 변형 작성
- Storybook Viewport Addon으로 실시간 확인
- 온보딩 시뮬레이션을 모바일/데스크톱 양쪽에서 실행

**시연 계획:**
- Demo Day에 **모바일 기기 (iPhone/Galaxy) + 데스크톱 듀얼 시연**
- 같은 URL, 다른 기기에서 동시 실행하여 반응형 증명
- "한 번 개발, 모든 기기에서 작동" 메시지 전달

**기술 스택:**
- Tailwind CSS: 반응형 유틸리티 클래스 (`sm:`, `md:`, `lg:`)
- Radix UI: 기본적으로 반응형 지원
- Recharts: `ResponsiveContainer`로 차트 크기 자동 조정

---

### 데이터 흐름 예시 1: "회원가입 후 재정 프로필 설정" 🌟 핵심 미션

```
1. 사용자: 온보딩 화면에서 재정 정보 입력
   - 월 수입: 350만원
   - 월 지출: 280만원
   - 월 저축 가능액: 70만원
   - 희망 월 납입금: 10만원

2. Frontend → Spring Boot
   POST /api/users/{userId}/financial-profile
   Body: {
     "monthlyIncome": 3500000,
     "monthlyExpense": 2800000,
     "savingsCapacity": 700000,
     "desiredContribution": 100000
   }

3. Spring Boot → Django API 호출 (분석 요청)
   POST http://django:8000/api/analyze/financial-profile
   Body: {
     "income": 3500000,
     "expense": 2800000,
     "savingsCapacity": 700000
   }

4. Django: pandas로 재정 분석
   savings_rate = 700000 / 3500000 = 20%
   health_score = (20% / 25%) × 100 = 80점
   appropriate_contribution = 700000 × 0.15 = 105,000원
   risk_level = "medium"

5. Django → Spring Boot 응답
   {
     "appropriateContribution": 105000,
     "financialHealthScore": 80.0,
     "riskLevel": "medium",
     "savingsRate": 20.0,
     "analysis": "재정 건전성이 보통입니다 (80점)"
   }

6. Spring Boot: Oracle에 저장
   - user_financial_profiles 테이블 UPSERT
   - user_trust_scores 테이블 업데이트 (재정건전성 점수)

7. Spring Boot → Frontend 응답
   {
     "profile": { ... },
     "analysis": { "appropriateContribution": 105000, ... }
   }

8. Frontend: 분석 결과 표시
   - "당신의 적정 월 납입금: 10.5만원"
   - "재정 건전성 점수: 80점 (보통)"
   - "적합한 계모임을 찾아보세요!" 버튼
```

---

### 데이터 흐름 예시 2: "계모임 추천 받기"

```
1. 사용자: 계모임 검색 페이지에서 "추천 받기" 클릭

2. Frontend → Spring Boot
   GET /api/gyes/recommendations?userId={userId}&tags=독서,문화

3. Spring Boot: 사용자 재정 프로필 조회
   SELECT * FROM user_financial_profiles WHERE user_id = ?
   SELECT * FROM user_trust_scores WHERE user_id = ?

4. Spring Boot → Elasticsearch 검색 (취향 매칭)
   GET /gyes/_search
   { "query": { "terms": { "tags": ["독서", "문화"] } } }

5. Spring Boot → Django API 호출 (매칭 분석)
   POST http://django:8000/api/analyze/gye-recommendation
   Body: {
     "userProfile": { "appropriateContribution": 105000, "trustScore": 82 },
     "availableGyes": [ /* Elasticsearch 결과 */ ]
   }

6. Django: pandas로 매칭 점수 계산
   각 계모임별로:
   - 재정 적합성 (40%): 납입금 차이 기반
   - 취향 일치율 (35%): 태그 교집합
   - 신뢰 유사도 (25%): 점수 차이

7. Django → Spring Boot 응답
   {
     "recommendations": [
       { "gyeId": "gye-1", "matchScore": 92, "reasons": [...] },
       { "gyeId": "gye-2", "matchScore": 78, "reasons": [...] }
     ]
   }

8. Spring Boot → Frontend 응답
   (매칭 점수 순으로 정렬하여 전달)

9. Frontend: 추천 계모임 카드 리스트 표시
   - "책벌레들 (92% 매칭) - 적정 납입금 범위 내"
   - "영화광들 (78% 매칭) - 여유 있는 납입금"
```

---

### 데이터 흐름 예시 3: "이번 달 지출 통계 조회"

```
1. 사용자: 장부 페이지에서 "통계 보기" 버튼 클릭

2. Frontend → Spring Boot
   GET /api/groups/1/stats?month=2026-01

3. Spring Boot: Oracle에서 장부 데이터 조회
   SELECT * FROM transactions
   WHERE group_id = 1 AND month = '2026-01'

   결과: [{date, amount, category}, {date, amount, category}, ...]

4. Spring Boot → Django API 호출
   POST http://localhost:8000/api/analyze/monthly-stats
   Body: [
     {"date": "2026-01-05", "amount": 50000, "category": "식비"},
     {"date": "2026-01-10", "amount": 120000, "category": "회식"},
     ...
   ]

5. Django: pandas로 집계
   df = pd.DataFrame(request.data)
   total = df['amount'].sum()
   avg = df['amount'].mean()
   category_ratio = df.groupby('category')['amount'].sum().to_dict()

6. Django → Spring Boot 응답
   {
     "total": 500000,
     "avgPerDay": 16129,
     "categories": {"식비": 200000, "회식": 300000}
   }

7. Spring Boot → Frontend 응답
   (Django 결과를 그대로 전달)

8. Frontend: Recharts로 차트 렌더링
   - Pie Chart: 카테고리별 비율
   - Line Chart: 일별 지출 추이
```

### 충돌 방지 원칙 (Critical)

✅ **DO:**
- Spring Boot만 Oracle DB에 JDBC 연결
- Django는 오직 Spring Boot HTTP API를 통해서만 데이터 수신
- Django는 stateless 계산 서버 (DB 상태 저장 X)

❌ **DON'T:**
- Django에서 복잡한 비즈니스 로직 구현

---

### Frontend-First 개발 전략 ⭐

**Why Frontend-First?**
> 비전공자 팀의 강점인 기획력과 UX 감각을 최대한 활용하기 위해, UI를 먼저 완성하고 백엔드를 역산하는 전략

**개발 워크플로우:**

```
[Phase 1] Storybook 스켈레톤 (Week 0-1)
    │
    │  • Phase 5B 컴포넌트 활용
    │  • 모든 페이지 스켈레톤 작성
    │  • Mobile + Desktop 변형 작성
    │
    ▼
[Phase 2] 온보딩 시뮬레이션 (Week 1-2)
    │
    │  • Storybook에서 사용자 플로우 시뮬레이션
    │  • UX 개선점 도출
    │  • 팀 내부 피드백 반영
    │
    ▼
[Phase 3] MSW Mock API (Week 2-3)
    │
    │  • Mock Service Worker 설정
    │  • 가짜 API 응답 정의
    │  • Frontend 독립 개발 가능
    │
    ▼
[Phase 4] 백엔드 구현 (Week 3-8)
    │
    │  • MSW Mock을 실제 API로 교체
    │  • Spring Boot + Oracle 연동
    │  • Django 분석 + Elasticsearch 검색
    │
    ▼
[Phase 5] 통합 테스트 (Week 9-10)
```

**MSW (Mock Service Worker) 설정:**

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // 모임 목록 조회
  http.get('/api/groups', () => {
    return HttpResponse.json([
      { id: 1, name: '책벌레들', balance: 500000, memberCount: 4 },
      { id: 2, name: '영화광들', balance: 300000, memberCount: 6 }
    ])
  }),

  // 장부 통계 (Django Mock)
  http.get('/api/groups/:id/stats', () => {
    return HttpResponse.json({
      total: 500000,
      avgPerDay: 16129,
      categories: { '식비': 200000, '회식': 300000 }
    })
  }),

  // Elasticsearch 검색 Mock
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    return HttpResponse.json({
      hits: [
        { id: 1, name: '책벌레들', tags: ['독서', '문학'] },
        { id: 2, name: '영화광들', tags: ['영화', '문화'] }
      ]
    })
  })
]
```

**Storybook 활용 전략:**

```
src/
├── stories/
│   ├── pages/           # 페이지 단위 스토리
│   │   ├── Login.stories.tsx
│   │   ├── Dashboard.stories.tsx
│   │   ├── Ledger.stories.tsx
│   │   └── Search.stories.tsx
│   │
│   ├── flows/           # 사용자 플로우 시뮬레이션
│   │   ├── Onboarding.stories.tsx
│   │   ├── VoteFlow.stories.tsx
│   │   └── SearchFlow.stories.tsx
│   │
│   └── components/      # 컴포넌트 단위 (기존 Phase 5B)
```

---

### 역할 구분: CP(계주) vs 계원 ⭐

**CP (Community Producer) = 계주**

```
┌─────────────────────────────────────────────────┐
│  CP (Community Producer) - 계주                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                 │
│  권한:                                          │
│  ├─ 모임 생성 및 설정 변경                       │
│  ├─ 멤버 초대 및 강제 퇴출                       │
│  ├─ 공지사항 작성 및 핀 고정                     │
│  ├─ 지출 요청 등록                              │
│  ├─ 장부 수정 (오류 정정)                        │
│  └─ 모임 종료 및 정산 시작                       │
│                                                 │
│  UI 표시:                                       │
│  └─ 👑 아이콘 또는 "계주" 뱃지                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**계원 (Member)**

```
┌─────────────────────────────────────────────────┐
│  계원 (Member) - 일반 멤버                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                                 │
│  권한:                                          │
│  ├─ 모임 조회 (대시보드, 장부, 피드)              │
│  ├─ 투표 참여 (찬성/반대)                        │
│  ├─ SNS 피드/댓글 작성                          │
│  ├─ 지출 요청 등록 (본인 건만)                   │
│  └─ 본인 정보 수정                              │
│                                                 │
│  제한:                                          │
│  ├─ ❌ 다른 멤버 강제 퇴출 불가                   │
│  ├─ ❌ 공지사항 핀 고정 불가                      │
│  └─ ❌ 장부 수정 불가 (조회만)                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

**권한 검증 로직:**

```java
// Spring Security - Role 기반 접근 제어
@PreAuthorize("hasRole('CP')")
public void deleteGroupMember(Long groupId, Long memberId) { ... }

@PreAuthorize("hasAnyRole('CP', 'MEMBER')")
public void castVote(Long expenseId, boolean approve) { ... }
```

---

## [3] Demo Day MVP (시연 필수 기능)

### 시연 시나리오 (6분 라이브 데모)

**시나리오: "신규 회원 이영희의 계모임 가입 여정"**

```
[1분] 🌟 재정 프로필 설정 (핵심 미션)
  - 신규 회원 "이영희" 로그인
  - 온보딩 화면에서 재정 정보 입력
    * 월 수입: 350만원
    * 월 지출: 280만원
    * 저축 가능액: 70만원
    * 희망 납입금: 10만원
  - Django 분석 결과 확인
    * "적정 월 납입금: 10.5만원"
    * "재정 건전성 점수: 80점 (보통)"
    * "당신에게 맞는 계모임을 추천해드릴게요!"

[1분] 🔍 재정 기반 계모임 추천
  - "계모임 추천받기" 버튼 클릭
  - 취향 태그 선택: #독서 #문화
  - 추천 결과 표시
    * "책벌레들 (92% 매칭) - 10만원/월, 재정 적합"
    * "영화광들 (78% 매칭) - 8만원/월, 여유"
  - 매칭 이유 표시
    * "취향 일치율 85%"
    * "적정 납입금 범위 내"

[1분] 계모임 가입 및 대시보드
  - "책벌레들" 계모임 가입
  - 모임 대시보드 진입
  - 현재 잔액: 50만원, 멤버 5명 확인
  - 본인 신뢰점수: 80점 표시

[1.5분] 투명 장부 확인
  - 장부 탭 클릭
  - Recharts 차트로 1월 지출 내역 시각화
    * Line Chart: 일별 지출 추이
    * Pie Chart: 카테고리별 비율
  - Django 분석 결과 확인
    * "1월 총 지출: 30만원"
    * "평균 일일 지출: 1만원"
    * "가장 많이 쓴 카테고리: 도서구입"

[1분] 지출 요청 및 투표 승인
  - CP_김철수 계정으로 전환 (👑 계주)
  - 지출 요청 등록
    * 항목: "2월 독서 모임 장소 대관료"
    * 금액: 10만원
  - 이영희 계정으로 전환
  - 투표 화면에서 "찬성" 클릭
  - 과반수 달성 → 상태 "승인됨"으로 전환 확인

[0.5분] SNS 소통 & 마무리
  - 피드에 "가입 인사" 글 작성
  - 다른 멤버가 댓글: "환영합니다!"
  - 마무리: **"3-Layer Trust Architecture"** 플로우 강조
    * Layer 1: 재정 분석으로 고객 이해
    * Layer 2: 신뢰 트라이포드로 투명 운영
    * Layer 3: 취향 검색으로 맞춤 매칭
```

**핵심 메시지 (Demo Day):**
> **"WOORIDO는 3-Layer Trust Architecture로 작동합니다."**
>
> 1️⃣ **고객을 이해합니다 (Layer 1)**: 재정 분석으로 당신의 상황을 파악합니다.
>
> 2️⃣ **신뢰를 보증합니다 (Layer 2 - 신뢰 트라이포드)**: 선충전 락, 투명 장부, 투표 감시로 안전을 보장합니다.
>
> 3️⃣ **최적의 매칭을 제공합니다 (Layer 3)**: Elasticsearch로 당신의 재정과 취향에 맞는 계모임을 찾아드립니다.
>
> **"고객 수입·지출 데이터 분석 기반, 이것이 우리의 핵심 미션입니다."**

### 필수 기능 6가지 (5대 코어 + 모임관리)

#### 0. 💰 재정 프로필 분석 (핵심 미션) 🌟
**구현 범위:**
- 온보딩 재정 정보 입력 폼
  * 월 수입, 월 지출, 저축 가능액
  * 희망 월 납입금
  * 지출 카테고리 비율 (선택)
- **Django 분석 연동**
  * API: POST /api/analyze/financial-profile
  * pandas 계산:
    - 적정 월 납입금 = 저축가능액 × 15%
    - 재정 건전성 점수 = (저축률 / 25%) × 100
    - 리스크 등급 분류
  * 결과를 카드 형태로 표시
- 신뢰 점수 대시보드
  * 재정건전성(40%) + 완주율(30%) + 투표참여(20%) + 활동(10%)

**시연에서 제외:**
- ❌ MyData API 연동 (수동 입력만)
- ❌ AI 기반 예측 (간단한 공식만)

---

#### 1. 모임 생성 및 관리 ✅
**구현 범위:**
- 모임 생성 (이름, 목표 금액, 기간)
- 멤버 초대 (Mock 테스트 유저 4-5명)
- 모임 대시보드
  * 현재 잔액 표시
  * 멤버 목록 (이름, 역할)
  * 이번 달 지출 요약

**시연에서 제외:**
- ❌ 실제 초대 링크 발송 (수동으로 테스트 계정 생성)
- ❌ 멤버 탈퇴/강제 퇴출
- ❌ 모임 종료 및 정산

#### 2. 투명 장부 (Recharts + Django 분석) ⭐ 핵심
**구현 범위:**
- 입출금 내역 테이블
  * 날짜, 금액, 카테고리, 메모
  * 페이지네이션 (10개씩)
- Recharts 시각화
  * Line Chart: 일별 지출 추이 (30일)
  * Pie Chart: 카테고리별 지출 비율
  * Bar Chart: 주차별 비교 (선택)
- **Django 데이터 분석 연동**
  * API: POST /api/analyze/monthly-stats
  * pandas 집계:
    - 총 지출, 평균 일일 지출
    - 카테고리별 비율
    - 지출 증감 트렌드
  * 결과를 카드 형태로 표시

**시연에서 제외:**
- ❌ PDF 리포트 다운로드
- ❌ 영수증 이미지 업로드
- ❌ 복잡한 필터링 (날짜 범위만)

#### 3. 투표 기반 결제 승인 (간소화) ✅
**구현 범위:**
- 리더가 지출 요청 등록
  * 금액, 목적, 카테고리
  * 상태: "투표 중"
- 멤버들이 투표
  * "찬성/반대" 버튼
  * 현재 투표 현황 (찬성 2/4)
- 과반수 달성 시
  * 상태 "승인됨"으로 자동 전환
  * 장부에 자동 기록

**간소화 포인트:**
- ❌ 실시간 푸시 알림 (새로고침으로 확인)
- ❌ 실제 결제 API 연동 (승인 후 수동 입력)
- ❌ 투표 마감 타이머

#### 4. SNS 피드/댓글 (경량) ✅
**구현 범위:**
- 피드 작성 (텍스트만, 최대 500자)
- 댓글 달기
- 공지사항 핀 고정 (👑 CP만 가능)
- 무한 스크롤 (10개씩 로드)

**시연에서 제외:**
- ❌ 이미지/동영상 업로드
- ❌ 좋아요, 해시태그
- ❌ 멘션, 알림

#### 5. 🔍 취향 검색 (Elasticsearch) ⭐ 4번째 코어
**구현 범위:**
- 태그 검색 (독서, 영화, 운동 등)
- 텍스트 전문 검색 (모임 이름, 설명)
- 카테고리 필터 (문화/예술, 스포츠, 취미 등)
- 검색 결과 리스트 UI

**기술 구현:**
```
Spring Boot ──REST API──▶ Elasticsearch 8.x
                              │
                              ├─ 인덱스: groups
                              │   └─ fields: name, description, tags, category
                              │
                              └─ 쿼리 예시:
                                  GET /groups/_search
                                  {
                                    "query": {
                                      "multi_match": {
                                        "query": "독서",
                                        "fields": ["name", "tags"]
                                      }
                                    }
                                  }
```

**시연 범위:**
- ✅ 기본 태그/텍스트 검색만
- ✅ 카테고리 필터
- ❌ 자동완성 (고급 기능)
- ❌ 복잡한 필터 조합
- ❌ 검색어 추천

**Elasticsearch 설치 (Elastic Cloud Free Tier 권장):**
```bash
# 또는 Docker로 로컬 설치
docker run -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0
```

#### 6. 유저 인증 (시연용 간소화) ✅
**구현 범위:**
- 로그인 화면 (ID/PW)
- JWT 토큰 발급 및 검증
- 테스트 계정 5개 사전 등록
  * 👑 CP_김철수 (CP - 계주)
  * 멤버_이영희 (member)
  * 멤버_박민수 (member)
  * 멤버_정수진 (member)
  * 멤버_최현우 (member)

**시연에서 제외:**
- ❌ 회원가입 UI
- ❌ 소셜 로그인 (카카오, 구글)
- ❌ 비밀번호 찾기, 이메일 인증

### 시연 성공 기준

**라이브 데모 체크리스트:**
- [ ] 👑 CP 계정 로그인 → 대시보드 진입 성공
- [ ] 장부 차트 정상 렌더링 (반응형: Mobile + Desktop)
- [ ] Django 분석 결과 3초 이내 표시
- [ ] 지출 요청 → 투표 → 승인 Full Flow 작동
- [ ] SNS 글 작성 → 댓글 달기 성공
- [ ] 🔍 **Elasticsearch 검색 정상 작동 (태그/텍스트)**
- [ ] ⭐ **모바일 + 데스크톱 듀얼 시연 성공**
- [ ] **위 시나리오 3회 반복 테스트 시 에러 Zero**

**기술 검증:**
- [ ] Spring Boot ↔ Oracle 연동 안정성
- [ ] Spring Boot ↔ Django API 통신 성공률 100%
- [ ] Spring Boot ↔ Elasticsearch 검색 성공률 100%
- [ ] Frontend API 호출 성공률 100%
- [ ] 페이지 로딩 속도 3초 이내 (Mobile/Desktop 모두)

---

## [4] 68일 타임라인 (주차별 로드맵)

### 전체 일정 개요

```
12월 (12일): 환경 세팅 + 학습 + Storybook 스켈레톤
   ↓
1월 1-15일 (15일): 핵심 CRUD + 기본 UI + MSW Mock API
   ↓
1월 16-31일 (16일): 투표 시스템 + 장부 차트 + 🔍 Elasticsearch 기본
   ↓
2월 1-10일 (10일): SNS + Django 분석 + 검색 고도화
   ↓
2월 11-20일 (10일): 통합 테스트 + 버그 수정 + 반응형 QA
   ↓
2월 21-25일 (5일): 시연 리허설 (Mobile + Desktop 듀얼)
   ↓
2월 25일: 🚀 DEMO DAY
```

---

### Week 0-1: 환경 세팅 & 학습 (12/19-12/31, 12일)

**목표:** 개발 환경 구축 및 기술 스택 기초 학습

**할 일:**
1. **개발 환경 세팅**
   - [ ] Spring Boot 프로젝트 초기화 (`spring initializr`)
   - [ ] Oracle 21c XE Docker 설치 및 실행
   - [ ] Django 프로젝트 초기화 + numpy/pandas 설치
   - [ ] 🔍 **Elasticsearch 세팅** (Elastic Cloud Free Tier 또는 Docker)
   - [ ] React + TypeScript 프로젝트 세팅 (Vite)
   - [ ] Storybook 확인 (Phase 5B 컴포넌트 활용)
   - [ ] ⭐ **MSW (Mock Service Worker) 설치**
   - [ ] GitHub 저장소 생성 및 팀원 권한 설정

2. **기술 스택 학습**
   - [ ] Spring Boot CRUD Tutorial 완주 (1-2개)
   - [ ] React Hooks 패턴 복습
   - [ ] Recharts 예제 코드 실습
   - [ ] Oracle SQL 기본 쿼리 연습
   - [ ] 🔍 Elasticsearch 기본 쿼리 (match, multi_match)

3. **Frontend-First 세팅**
   - [ ] Storybook 스켈레톤 페이지 작성 (Login, Dashboard, Ledger, Search)
   - [ ] MSW handlers 기본 설정
   - [ ] Mobile + Desktop Viewport 확인

4. **프로덕트 아젠다 팀 Alignment**
   - [ ] 3명 전원 문서 리뷰 및 동의
   - [ ] 역할 분담 (Frontend / Backend / 공통)
   - [ ] 주간 회의 일정 확정

**Checkpoint (12/31):**
- ✅ 개발 환경 모두 정상 작동 (Oracle, Django, Elasticsearch)
- ✅ Hello World 수준 통신 성공 (Frontend ↔ Spring ↔ Oracle)
- ✅ Elasticsearch 기본 검색 쿼리 테스트 성공
- ✅ Storybook 스켈레톤 페이지 4개 완성
- ❌ 50% 미달 시 → 1주일 추가 학습, 일정 재조정

---

### Week 2-3: 핵심 CRUD (1/1-1/15, 15일)

**목표:** 모임 관리 및 유저 인증 핵심 기능 완성

**Backend (Spring Boot):**
- [ ] User 엔티티 및 CRUD API
  * POST /api/users (회원가입은 제외, seed 데이터만)
  * POST /api/auth/login (JWT 발급)
- [ ] Group 엔티티 및 CRUD API
  * POST /api/groups (모임 생성)
  * GET /api/groups/{id} (모임 조회)
  * GET /api/groups/{id}/members (멤버 목록)
- [ ] Member 관계 테이블 (User ↔ Group)
- [ ] JWT 인증 필터 구현

**Frontend:**
- [ ] 로그인 페이지 (⭐ 반응형: Mobile + Desktop 변형)
- [ ] 모임 대시보드 (잔액, 멤버 목록)
  * Mobile: 세로 스택 카드 레이아웃
  * Desktop: 그리드 레이아웃
- [ ] 모임 생성 폼 (⭐ 반응형 입력 필드)

**Database:**
- [ ] Oracle 스키마 설계 (ERD)
  * users, groups, members, transactions, votes, posts
- [ ] Seed 데이터 스크립트 (테스트 계정 5개, 모임 1개)

**Checkpoint (1/15):**
- ✅ 로그인 → 모임 대시보드 진입 성공
- ✅ 모임 생성 기능 작동
- ⚠️ 50% 미달 → 다음 주 일정 1주 연기

---

### Week 4-5: 투표 시스템 + 장부 + Elasticsearch (1/16-1/31, 16일)

**목표:** 지출 요청/투표 로직, 장부 CRUD, 취향 검색 완성

**Backend (Spring Boot):**
- [ ] Transaction 엔티티 및 CRUD
  * POST /api/groups/{id}/transactions (입출금 기록)
  * GET /api/groups/{id}/transactions (내역 조회)
- [ ] Vote 엔티티 및 로직
  * POST /api/groups/{id}/expense-requests (지출 요청)
  * POST /api/expense-requests/{id}/votes (찬성/반대)
  * 과반수 달성 시 상태 "승인됨" 자동 전환
- [ ] 🔍 **Elasticsearch 연동**
  * GET /api/search?q={query} (태그/텍스트 검색)
  * GET /api/search?category={category} (카테고리 필터)
  * groups 인덱스 생성 및 매핑

**Frontend:**
- [ ] 장부 내역 테이블 (페이지네이션)
  * ⭐ Mobile: 카드 형태, Desktop: 테이블 형태
- [ ] 지출 요청 폼
- [ ] 투표 UI (찬성/반대 버튼 + 현황 표시)
  * ⭐ Mobile: 세로 스택, Desktop: 가로 배치
- [ ] 🔍 **검색 UI**
  * 검색창 컴포넌트
  * 검색 결과 리스트 (반응형)
  * 카테고리 필터 드롭다운

**Checkpoint (1/31):**
- ✅ 지출 요청 → 투표 → 승인 Full Flow 작동
- ✅ 장부 내역 CRUD 성공
- ✅ 🔍 Elasticsearch 검색 작동 (태그 + 텍스트)
- ⚠️ 핵심 기능 미완성 → 2월 일정 조정

---

### Week 6-7: Recharts + Django 분석 (2/1-2/10, 10일)

**목표:** 차트 시각화 및 Django 데이터 분석 연동

**Backend (Spring Boot):**
- [ ] Django 연동 API
  * POST /api/analyze/monthly-stats (Django로 데이터 전달)
  * Django 응답 받아서 Frontend로 전달

**Backend (Django):**
- [ ] API 엔드포인트
  * POST /api/analyze/monthly-stats
- [ ] pandas 집계 로직
  * 총 지출, 평균, 카테고리별 비율
  * 일별 추이 데이터

**Frontend:**
- [ ] ⭐ Recharts Line Chart (일별 지출 추이)
  * Mobile: width={350} height={250}
  * Desktop: width={800} height={400}
  * ResponsiveContainer로 자동 조정
- [ ] ⭐ Recharts Pie Chart (카테고리별 비율)
  * 반응형 크기 조정
- [ ] Django 분석 결과 카드 UI
  * Mobile: 1열, Desktop: 3열 그리드

**Checkpoint (2/10):**
- ✅ 차트 정상 렌더링
- ✅ Django 분석 결과 3초 이내 표시
- ⚠️ 미완성 → SNS 기능 간소화 검토

---

### Week 8: SNS 기능 (2/11-2/15, 5일)

**목표:** 피드/댓글 기본 기능 완성

**Backend:**
- [ ] Post 엔티티 및 CRUD
- [ ] Comment 엔티티 및 CRUD
- [ ] 공지사항 핀 고정 로직

**Frontend:**
- [ ] 피드 작성 폼 (텍스트만, ⭐ 반응형)
- [ ] 피드 목록 (무한 스크롤, ⭐ 반응형 카드)
- [ ] 댓글 컴포넌트 (Phase 5B 활용, ⭐ 반응형)

**Checkpoint (2/15):**
- ✅ 피드 작성 → 댓글 달기 성공
- ⚠️ 미완성 → 기능 축소 (공지만 남기기)

---

### Week 9: 통합 테스트 & 버그 수정 (2/16-2/20, 5일)

**목표:** 시연 시나리오 기준 통합 테스트 및 안정화

**테스트 항목:**
- [ ] 시연 시나리오 10회 반복 실행
- [ ] 크리티컬 버그 제로 달성
- [ ] 에러 핸들링 추가 (Toast 메시지)
- [ ] 로딩 스피너 추가
- [ ] 데이터 유효성 검증

**성능 최적화:**
- [ ] 페이지 로딩 속도 3초 이내
- [ ] API 응답 시간 1초 이내

**Checkpoint (2/20):**
- ✅ 시연 시나리오 성공률 100%
- ❌ 미달 → 시연 연기 요청 또는 범위 축소

---

### Week 10: 시연 리허설 (2/21-2/25, 5일)

**목표:** 완벽한 시연 준비

**할 일:**
- [ ] 시연 대본 작성 (5분)
- [ ] 시연 리허설 3회 이상
  * ⭐ **모바일 + 데스크톱 듀얼 시연 리허설**
  * iPhone/Galaxy 실제 기기 준비
  * 같은 URL 동시 접속 테스트
- [ ] PPT 발표 자료 준비
  * ⭐ 반응형 디자인 강조 슬라이드 추가
- [ ] 시연 영상 녹화 (백업용)
  * Mobile/Desktop 화면 분할 녹화
- [ ] 예상 질문 리스트 작성 및 답변 준비

**예상 질문:**
1. "실제 결제는 어떻게 연동하나요?"
   → "현재는 MVP 단계로 수동 입력이며, 이후 토스페이먼츠 API 연동 예정입니다."
2. "모바일에서도 작동하나요?" ⭐
   → "네! Mobile-First 웹앱 방식으로 구현했습니다. 같은 URL을 iPhone/Galaxy/Desktop 모두에서 접속 가능하며, 반응형으로 자동 최적화됩니다. 이것이 초기 팀 설득의 핵심 포인트였습니다."
   → **실제 시연: 모바일 + 데스크톱 듀얼 스크린으로 동시 시연**
3. "Django를 왜 사용했나요?"
   → "장부 데이터 분석에 pandas가 유용하며, 기술 스택 다양성을 보여주기 위함입니다."

**2월 25일 D-Day:**
- [ ] 오전: 최종 점검
- [ ] 오후: 🚀 **DEMO DAY**

---

## [5] Success Metrics & KPIs

### Demo Day 성공 기준

**정량적 지표:**
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 시연 시나리오 성공률 | 100% | 3회 리허설 모두 성공 |
| 크리티컬 버그 | 0건 | 시연 중 앱 크래시, 데이터 손실 없음 |
| 페이지 로딩 속도 | <3초 | Chrome DevTools |
| API 응답 시간 | <1초 | Postman |
| Django 분석 응답 시간 | <3초 | End-to-End |

**정성적 지표:**
- [ ] 심사위원 질문에 명확한 답변
- [ ] 핵심 가치(투명성, 민주성, 소통) 전달
- [ ] 기술 스택 다양성 어필 성공

---

## [6] Risk & Mitigation

### High Priority Risks

#### 1. 개발 역량 부족 (비전공자 팀) 🚨
**Risk:** 68일 안에 4가지 기능 + Django 연동 구현 실패
**Impact:** Critical | **Probability:** High

**Mitigation:**
- 주 5회 멘토링 최대 활용 (막힌 부분 즉시 질문)
- AI Pair Programming (Gemini, Claude Code)
- 오픈소스 템플릿 적극 활용 (Spring Boot Starter, Storybook)
- **매주 금요일 Demo Day로 진행 상황 검증**
- Checkpoint 실패 시 즉시 범위 축소

#### 2. 일정 지연
**Risk:** Checkpoint 미달로 데드라인 초과
**Impact:** Critical | **Probability:** High

**Mitigation:**
- **매주 Checkpoint 엄격히 준수**
- 50% 미달 시 즉시 다음 주 일정 조정
- 예비 기능 목록 미리 작성 (제외 가능 우선순위)
  * 1순위 제외: SNS 기능 (공지만 남기기)
  * 2순위 제외: Django 분석 (간단한 합계만)
  * 3순위 제외: 투표 시스템 (수동 승인)

#### 3. 라이브 데모 실패 (에러 발생)
**Risk:** 시연 중 크리티컬 버그로 앱 크래시
**Impact:** Critical | **Probability:** Medium

**Mitigation:**
- **시연 시나리오 10회 이상 리허설**
- 백업 시연 영상 준비
- 로컬 환경 + 클라우드 배포 이중화
- 에러 핸들링 철저히 (try-catch, fallback UI)

#### 4. Django-Spring 연동 실패
**Risk:** HTTP API 통신 오류, 데이터 포맷 불일치
**Impact:** High | **Probability:** Medium

**Mitigation:**
- Week 6 초반에 연동 우선 검증
- Postman으로 API 계약 문서화
- 실패 시 Django 제외, Spring Boot에서 간단한 통계만 구현

---

## [7] Decision Framework

### 기능 추가/제외 판단 기준

**우선순위 공식:**
```
Priority = (Demo Impact × Feasibility) / Complexity

Demo Impact: 시연 효과 (1-10점)
Feasibility: 우리가 구현 가능한가? (1-10점)
Complexity: 개발 난이도 (1-10점, 낮을수록 좋음)
```

**예시:**
- 투명 장부 차트: (10 × 8) / 3 = 26.7점 ⭐ 최우선
- 투표 시스템: (9 × 7) / 5 = 12.6점 ⭐ 필수
- SNS 피드: (6 × 8) / 4 = 12점 ✅ 포함
- 이미지 업로드: (4 × 5) / 8 = 2.5점 ❌ 제외

### Checkpoint 실패 시 대응

**50% 미달 시:**
1. 다음 주 일정 1주 연기
2. 후순위 기능 1개 제외
3. 멘토링 횟수 증가

**30% 미달 시:**
1. 전체 일정 재조정
2. MVP 범위 대폭 축소
3. 긴급 팀 회의 소집

---

## [8] Next Steps (즉시 실행)

### 이번 주 할 일 (12/19-12/25)

**1. 프로덕트 아젠다 팀 Alignment (D+0)**
- [ ] 3명 전원 이 문서 리뷰
- [ ] 68일 데드라인 및 시연 범위 동의
- [ ] 역할 분담
  * Frontend 담당: ________
  * Backend 담당: ________
  * 공통/테스트: ________

**2. 개발 환경 세팅 (D+1~3)**
- [ ] Spring Boot 프로젝트 초기화
  ```bash
  spring init --dependencies=web,jpa,security,oracle woorido-backend
  ```
- [ ] Oracle Docker 실행
  ```bash
  docker run -d -p 1521:1521 -e ORACLE_PASSWORD=password gvenzl/oracle-xe
  ```
- [ ] Django 프로젝트 생성
  ```bash
  django-admin startproject woorido_analytics
  pip install numpy pandas djangorestframework
  ```
- [ ] React 프로젝트 확인 (이미 있음)
- [ ] Storybook 확인 (Phase 5B 컴포넌트)
- [ ] ⭐ **반응형 디자인 세팅**
  - Tailwind CSS 반응형 유틸리티 확인
  - Storybook Viewport Addon 설치
  - 모바일 테스트 환경 준비 (Chrome DevTools Mobile Emulator)

**3. 학습 시작 (D+3~7)**
- [ ] Spring Boot CRUD Tutorial
  * 추천: Baeldung Spring Boot JPA Tutorial
  * 목표: User 엔티티 CRUD 구현
- [ ] React Hooks 복습
  * useState, useEffect, custom hooks
- [ ] Recharts 예제 실습
  * Line Chart, Pie Chart 기본 예제
  * ⭐ ResponsiveContainer 사용법 학습
- [ ] ⭐ **반응형 디자인 학습**
  * Tailwind responsive utilities (sm:, md:, lg:)
  * Mobile-First CSS 작성법
  * Storybook에서 Mobile/Desktop 변형 작성법

### 다음 주 할 일 (12/26-12/31)

**4. ERD 설계 (D+7~9)**
- [ ] Oracle 스키마 설계
  * users, groups, members
  * transactions, votes
  * posts, comments
- [ ] 관계 설정 (FK, Index)
- [ ] Seed 데이터 스크립트

**5. Hello World 통신 테스트 (D+9~12)**
- [ ] Frontend → Spring Boot → Oracle
- [ ] Spring Boot → Django (HTTP)
- [ ] 통신 성공 확인

**6. Checkpoint 0 (12/31)**
- [ ] 개발 환경 100% 작동
- [ ] Hello World 통신 성공
- [ ] 팀 역할 분담 완료

---

## [9] Post-Demo Plan (사이드 프로젝트)

### 2월 25일 이후 계획

**Short Term (3개월):**
- 실제 결제 API 연동 (토스페이먼츠)
- PWA 기능 강화 (홈 화면 추가, 오프라인 대응)
- 이미지 업로드 기능
- 실시간 푸시 알림

**Mid Term (6개월):**
- 보증금 락 시스템
- AI 취향 매칭 (Elasticsearch)
- 제휴사 혜택 연동

**Long Term (1년):**
- 수익형 계 옵션
- B2B 기업용 서비스
- 앱 스토어 출시

---

**"WOORIDO는 68일 안에 작동하는 데모를 만들고, 이후 사이드 프로젝트로 완벽한 제품을 완성합니다."**

**"Demo Day is just the beginning, not the end."**

*이 문서는 살아있는 문서(Living Document)입니다. 매주 Checkpoint마다 업데이트됩니다.*

---

## [Appendix] 참고 자료

### 기술 문서
- Spring Boot 공식 문서: https://spring.io/projects/spring-boot
- Django REST Framework: https://www.django-rest-framework.org/
- Recharts: https://recharts.org/
- Oracle XE Docker: https://github.com/gvenzl/oci-oracle-xe

### 튜토리얼
- Spring Boot + JPA: https://www.baeldung.com/spring-boot-start
- React Hooks: https://react.dev/reference/react
- pandas 기초: https://pandas.pydata.org/docs/getting_started/

### 팀 소통
- GitHub: (저장소 URL 추가)
- 노션: (워크스페이스 URL 추가)
- 지라: (프로젝트 URL 추가)
