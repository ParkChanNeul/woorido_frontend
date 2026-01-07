# WOORIDO 프로덕트 아젠다 (Product Agenda)

> **Project:** WOORIDO - 커뮤니티 기반 챌린지 플랫폼 (구 계모임 플랫폼)
> **Version:** v4.0 - AI-Accelerated Development Edition
> **Last Updated:** 2026-01-07
> **Status:** **49 Days to Demo Day** ⚡ AI-Powered Sprint
>
> **CRITICAL DEADLINE: 2026년 2월 25일 (공식 시연)**
> - 현재: 2026-01-07
> - 남은 시간: **49일 (약 7주)**
> - **AI 도입 효과: 57일 일정 → 19일 개발 완료 예정 (67% 단축)**
> - 시연 형식: **라이브 데모 (Live Demo)**

---

## [0] Executive Summary

### 핵심 가치
> **"소모임 + 토스 = 우리두"**

### 용어 변경 안내 (Terminology Update)

**법적 리스크 회피를 위한 리브랜딩:**

| 구분 | 기존 용어 | 새 용어 | 영문 | 변경 이유 |
|------|----------|---------|------|----------|
| **플랫폼 정체성** | 계모임 플랫폼 | **챌린지 플랫폼** | Challenge Platform | 금융 규제 회피 |
| **그룹** | 계모임 (契) | **챌린지** | Challenge | 계 = 상호금융 오해 방지 |
| **리더** | 계주 / CP | **리더** | Leader | 친근하고 현대적 |
| **멤버** | 계원 | **팔로워** | Follower | SNS 친화적 |
| **월 회비** | 결제 | **서포트** | Support | 펀딩 느낌, 긍정적 뉘앙스 |

**내부 커뮤니케이션:**
- 팀 내부: "계모임"으로 통용 (빠른 이해)
- 외부/사용자: "챌린지"로 표기 (법적 안전성)
- API 엔드포인트: `/api/challenges` (DB는 `gye` 테이블 유지, View로 매핑)

**문서 내 표기 원칙:**
- 이 문서에서는 혼용하되, 괄호로 관계 명시
  - 예: "챌린지(계모임)", "리더(계주)"
- 외부 문서/UI는 "챌린지" 용어 일관 사용

### 해결하는 문제
| 기존 서비스 | 문제점 | 우리두 해결책 |
|------------|--------|--------------|
| 소모임/오픈채팅 | 회비 수금 불가 | SNS + 금융 통합 |
| 토스 모임통장 | 리더 독단 출금 → 먹튀 위험 | 투표 기반 출금 승인 |
| 카카오 모임통장 | 장부 불투명 | Recharts 시각화 장부 |

### 3대 핵심 차별화
```
┌─────────────────────────────────────────────────────────────┐
│                    우리두 Trust Triangle                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                         △                                  │
│                        /|\                                  │
│                       / | \                                 │
│                      /  |  \                                │
│         ┌───────────┐ ┌─┴─┐ ┌───────────┐                   │
│         │ 선충전 락  │ │장부│ │ 결제 감시  │                   │
│         │(Deposit   │ │투명│ │ 다각화    │                   │
│         │   Lock)   │ │ 화 │ │(Consensus │                   │
│         │           │ │   │ │   Pay)    │                   │
│         └───────────┘ └───┘ └───────────┘                   │
│                                                             │
│    1개월 보증금      1원 단위     모든 지출                   │
│    선입금으로       투명 공개     멤버 투표                   │
│    이탈 방지                     승인 필요                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## [1] Team & Mission

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

🤖 AI 전략:
  - Claude Code (40%): ERD 설계, 복잡한 비즈니스 로직
  - Cursor IDE (25%): 실시간 페어 프로그래밍
  - GitHub Copilot (20%): 코드 자동완성
  - v0.dev (15%): React UI 컴포넌트 생성
  → 개발 시간 67% 단축 효과
```

### Demo Day 핵심 메시지
> **"소모임처럼 모이고, 토스처럼 관리하되, 먹튀 걱정은 없다"**

**핵심 원칙:**
- **"Perfect is the enemy of done"** - 완벽한 기능보다 안정적으로 작동하는 데모
- **"Demo-Driven Development"** - 시연 시나리오 역산하여 필수 기능만 개발
- **"Zero Error Tolerance"** - 라이브 데모이므로 크리티컬 버그는 절대 불가
- **"AI as Co-Pilot"** - AI 도구를 활용한 빠른 프로토타이핑

---

## [2] 핵심 시스템 설계

### 2.1 플랫폼 가상머니 시스템 (우리두 어카운트)

```
┌─────────────────────────────────────────────────────────────┐
│                    우리두 어카운트                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   총 잔액: 500,000원                                        │
│   ├── 가용 잔액: 300,000원 (출금/가입 가능)                  │
│   └── 락 잔액: 200,000원 (2개 챌린지 보증금)                 │
│                                                             │
│   가입 중인 챌린지:                                          │
│   ├── 책벌레들 (100,000원/월) → 보증금 락: 100,000원         │
│   └── 영화광들 (100,000원/월) → 보증금 락: 100,000원         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 충전/출금 스펙
| 항목 | 스펙 |
|------|------|
| **충전 방법** | 토스페이 API (MVP), 이후 카드/계좌이체 확장 |
| **최소 충전** | 10,000원 |
| **최대 충전** | 1,000,000원 |
| **충전 수수료** | 없음 (PG 비용 플랫폼 부담) |
| **출금** | 가용 잔액 전액, 언제든 가능 |

### 2.2 챌린지(계모임) 가입 규칙

| 항목 | 값 | 비고 |
|------|------|------|
| **최소 서포트(납입금)** | 10,000원/월 | |
| **최대 서포트** | 제한 없음 | |
| **보증금** | 1개월치 (고정 락) | |
| **가입 필요 금액** | **보증금 + 입회비** | **입회비는 동적 계산** |
| **서포트 납입일** | 매월 1일 고정 | |
| **유예 기간** | 7일 | |

#### 입회비 계산 공식 (신규 추가)

```
입회비 = 챌린지 잔액 / (현재 멤버 수 - 1)
총 결제 금액 = 보증금 + 입회비

예시:
- 챌린지 잔액: 3,000,000원
- 현재 멤버: 8명
- 보증금: 100,000원 (1개월치)

→ 입회비 = 3,000,000 / (8 - 1) = 428,571원 (절사)
→ 총 결제 = 100,000 + 428,571 = 528,571원
```

**입회비 목적**: 신규 가입자가 기존 멤버들이 쌓아온 챌린지 잔액에 공정하게 기여

**향후 조정 가능**: 공식에 문제 발견 시 수정 예정

### 2.3 수수료 모델

| 구분 | 월 서포트 | 수수료율 | 예시 |
|------|----------|---------|------|
| **소액** | 10,000원 미만 | 1% | 5,000원 → 50원 |
| **일반** | 10,000~200,000원 | 3% | 100,000원 → 3,000원 |
| **고액** | 200,000원 초과 | 1.5% | 500,000원 → 7,500원 |

### 2.4 보증금 락 시스템 (Deposit Lock)

> 💡 보증금은 **예치금** 개념입니다. 미납 시 회비를 충당하기 위한 안전장치이며,
> 고시원 보증금이 월세 미납 시 충당되는 것과 동일한 원리입니다.

```
[가입 시점]
 └─ 서포트: 100,000원 → 오픈(챌린지 자금)
 └─ 보증금 락: 100,000원 → 개인 어카운트 내 잠금 상태
     ❗ 챌린지 금고(오픈)에 합산되지 않음
 └─ 입회비: 428,571원 → 오픈 (신규 추가)

[매월 1일] 자동 서포트 납입 시도
 └─ 크레딧 충분 → 자동 차감
 └─ 크레딧 부족 → 보증금에서 자동 납입 (안심결제)

[보증금 사용 후]
 └─ "보증금 충전이 필요합니다" 안내 지속 노출
 └─ 일정 기간 미충전 시 → 자동 탈퇴 (리더만 알림)

[정상 탈퇴 시]
 └─ 보증금 락 해제 → 가용 크레딧으로 복귀

[완주와 보증금]
 └─ ❌ 완주는 보증금과 무관
 └─ ✅ 완주 = 1년 운영 시 챌린지에 인증 마크 부여
```

---

## [3] 기술 스택

### 시스템 구조도 (AI 개발 최적화)

```
┌─────────────────────────────────────────┐
│          Frontend (React + TS)          │
│  - SNS 피드/댓글/좋아요                   │
│  - 챌린지 관리 UI                        │
│  - Recharts 장부 차트                    │
│  - 투표 UI                              │
│  - 챌린지 검색 (Elasticsearch)           │
│  - 반응형 디자인 (Mobile-First)          │
│  🤖 AI: v0.dev + Cursor (4일 → 1일)     │
└───────────────┬─────────────────────────┘
                │ REST API (JSON)
                ▼
┌─────────────────────────────────────────┐
│      Spring Boot (Main Backend)         │
│  - Oracle DB 연동 (MyBatis)             │
│  - 챌린지/투표/장부/유저 CRUD            │
│  - JWT 인증 및 권한 관리                 │
│  - 토스페이 결제 연동                    │
│  - Django 데이터 전달                   │
│  🤖 AI: Claude Code (5일 → 1.5일)       │
└──────┬──────────────┬───────────────────┘
       │ JDBC         │ REST API
       ▼              ▼
┌─────────────┐  ┌─────────────────────────┐
│  Oracle DB  │  │   Django (서브 백엔드)   │
│  (Docker)   │  │  ┌──────────────────┐   │
│             │  │  │ Analytics        │   │
│             │  │  │ - pandas 통계    │   │
│             │  │  │ - 재정 프로필    │   │
│             │  │  └──────────────────┘   │
│             │  │  ┌──────────────────┐   │
│             │  │  │ Elasticsearch    │   │
│             │  │  │ - 챌린지 검색    │   │
│             │  │  │ - 추천 알고리즘  │   │
│             │  │  │ - 한글 분석기    │   │
│             │  │  └──────────────────┘   │
│             │  │  ┌──────────────────┐   │
│             │  │  │ scikit-learn     │   │
│             │  │  │ (향후 도입 예정)  │   │
│             │  │  │ - ML 기반 추천   │   │
│             │  │  └──────────────────┘   │
│             │  │  ❌ Oracle 직접 연결 X  │
│             │  │  ✅ Spring Boot 경유   │
│             │  │  🤖 AI: Claude (4일→1.2일)│
└─────────────┘  └─────────────────────────┘
```

### 데이터 흐름: Spring Boot → Django → Elasticsearch

```
[챌린지 검색 요청]
Frontend → Django → Elasticsearch (한글 검색)
                ↓
         Elasticsearch → Django (검색 결과)
                ↓
         Django → Frontend (챌린지 목록)

[추천 알고리즘]
Spring Boot → Oracle (사용자 데이터 조회)
       ↓
Spring Boot → Django (JSON 데이터 전달)
       ↓
Django: pandas로 협업 필터링 계산
       ↓
Django → Elasticsearch (유사 사용자 검색)
       ↓
Django → Frontend (추천 챌린지 Top 10)

[장부 분석]
Spring Boot → Oracle (거래 내역 조회)
       ↓
Spring Boot → Django (JSON 전달)
       ↓
Django: pandas로 통계 집계
       ↓
Django → Spring Boot → Frontend (차트 데이터)
```

### 기술 스택 상세 (AI 개발 효율 포함)

| 레이어 | 기술 | 비고 | AI 도구 |
|--------|------|------|---------|
| **Frontend** | React 18 + TypeScript | Vite 빌드 | v0.dev, Cursor |
| | Tailwind CSS | 반응형 | v0.dev |
| | Radix UI | 접근성 컴포넌트 | Copilot |
| | Recharts | 차트 시각화 | v0.dev |
| | React Query | 서버 상태 관리 | Cursor |
| | Zustand | 클라이언트 상태 | Copilot |
| **Main Backend** | Spring Boot 3.2 | REST API, DB 전담 | Claude Code |
| | Spring Security + JWT | 인증/인가 | Claude Code |
| | MyBatis | SQL 매핑 | Cursor |
| **Sub Backend** | Django 5.0 | 분석/검색 전용 | Claude Code |
| | pandas 2.1 + numpy | 데이터 분석 | Claude Code |
| | Elasticsearch 8.x | 검색/추천 엔진 | Claude Code |
| | **scikit-learn** | **ML 추천 (향후)** | Claude Code |
| | DRF | REST API | Copilot |
| **Database** | Oracle 21c XE | Docker | Claude Code (DDL) |
| **Storage** | AWS S3 | 이미지 저장 | - |
| **Payment** | 토스페이먼츠 | MVP 결제 | - |
| **Deployment** | Vercel (FE) / Docker (BE) | | - |

### Django 역할 (분석/검색/추천)

```
┌─────────────────────────────────────────────────────────────┐
│  Django Sub Backend Server                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ 하지 않는 것:                                            │
│  └─ Oracle DB 직접 연결 (Spring Boot만 연결)                 │
│  └─ 비즈니스 로직 처리 (CRUD)                               │
│  └─ 인증/인가 처리                                          │
│                                                             │
│  ✅ 하는 것:                                                 │
│  └─ Spring Boot에서 JSON 데이터 수신                        │
│  └─ pandas로 집계/통계 계산                                 │
│  └─ Elasticsearch 인덱싱 및 검색                            │
│  └─ 협업 필터링 추천 알고리즘                               │
│  └─ 결과를 JSON으로 반환                                    │
│                                                             │
│  API 엔드포인트:                                            │
│  [분석]                                                     │
│  └─ POST /api/analyze/monthly-stats    (월별 지출 통계)     │
│  └─ POST /api/analyze/category-ratio   (카테고리별 비율)    │
│  └─ POST /api/analyze/trend            (지출 트렌드)        │
│  └─ POST /api/analyze/financial-profile (재정 건전성 분석)  │
│  [검색]                                                     │
│  └─ GET  /api/search/challenges?q=     (챌린지 검색)        │
│  └─ GET  /api/search/users?q=          (사용자 검색)        │
│  └─ GET  /api/search/feeds?q=          (피드 검색)          │
│  [추천]                                                     │
│  └─ GET  /api/recommendations/challenges (개인화 추천)      │
│  └─ GET  /api/recommendations/similar   (유사 챌린지)       │
│                                                             │
│  [향후 확장: scikit-learn]                                  │
│  └─ 딥러닝 기반 추천                                        │
│  └─ 이탈 예측 모델                                          │
│  └─ 챌린지 성공률 예측                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## [4] Demo Day MVP 기능

### 개발 우선순위 (AI 최적화 반영)

| 순위 | 기능 | API 수 | 전통 개발 | AI 개발 | 단축률 |
|------|------|--------|----------|---------|--------|
| **1** | **SNS (피드/댓글/좋아요/이미지)** | 18개 | 21일 | 6일 | 71% |
| **2** | **챌린지 가입 + 입회비 계산** | 8개 | 7일 | 2일 | 71% |
| **3** | **장부 + Recharts + Django 분석** | 4+4개 | 10일 | 3일 | 70% |
| **4** | **가상머니 충전/차감** | 4개 | 7일 | 2일 | 71% |
| **5** | **투표 시스템 + 정기 모임** | 8개 | 7일 | 2.5일 | 64% |
| **6** | **검색 (Elasticsearch)** | 3개 | 5일 | 1.5일 | 70% |
| **7** | **추천 (Django + ES)** | 2개 | - | 2일 | New |
| | **총 API** | **51개** | **57일** | **19일** | **67%** |

### 신규 추가: 정기 모임 (Meetings) 기능

**배경**: 챌린지(계모임)의 핵심 가치는 "실제 만남"
- 챌린지 잔액의 주요 지출처 = 정기 모임 대관료, 식비 등
- 리더가 정기 모임을 개최하고, 팔로워들이 참석 등록
- 모임 개최도 투표로 결정 (민주적 운영)

**기능 상세**:

```
[정기 모임 플로우]
1. 리더가 "모임 개최 투표" 생성
   - 투표 타입: MEETING_ATTENDANCE
   - 제목: "2월 독서 토론회"
   - 날짜/장소만 입력 (❌ 예상 비용 기재 안 함)

2. 팔로워들이 참석/불참 투표
   - ⭐ 과반수 이상 참석해야만 모임 개최 (필수 조건)

3. 과반수 참석 시 → MEETINGS 테이블에 모임 생성
   - 과반수 미달 시 → 모임 자동 취소

4. 모임 당일 진행

5. 모임 중/후 지출 발생 시
   - 지출할 '때마다' 별도 지출 투표 생성
   - ⭐ 해당 모임 참석자만 지출 투표 참여 가능
```

> ⚠️ **왜 과반수 참석이 필수인가?**
>
> 과반수 이하에서도 모임이 개최된다면, 리더가 "본인만 참석 가능한 날짜"를
> 파악한 뒤 해당 날짜에 누적 금액 전액을 사용하거나 인출 후 도주하는
> "먹튀" 현상이 발생할 수 있습니다.
>
> **"금전적으로 신뢰할 수 있는" 서비스 구조를 지키기 위한 핵심 안전장치입니다.**

> ⚠️ **왜 지출마다 투표하는가?**
>
> 한 번에 큰 금액을 승인받으면, 승인된 결제 수단(바코드 등)으로
> 무분별한 지출이 가능해집니다. 건별 승인으로 금전적 신뢰 구조를 유지합니다.

**DB 스키마**:
```sql
-- MEETINGS 테이블
CREATE TABLE meetings (
  id NUMBER PRIMARY KEY,
  challenge_id NUMBER NOT NULL,
  title VARCHAR2(200),
  description VARCHAR2(1000),
  meeting_date DATE,
  location VARCHAR2(200),
  -- ❌ estimated_cost 컬럼 없음 (모임 투표는 참석 여부만 결정)
  vote_id NUMBER,  -- 연결된 투표 (참석/불참)
  status VARCHAR2(20),  -- PLANNED, COMPLETED, CANCELLED
  created_at DATE DEFAULT SYSDATE
);

-- MEETING_ATTENDEES 테이블
CREATE TABLE meeting_attendees (
  meeting_id NUMBER,
  user_id NUMBER,
  registered_at DATE DEFAULT SYSDATE,
  PRIMARY KEY (meeting_id, user_id)
);
```

**API 추가** (Spring Boot):
```
POST   /api/challenges/{id}/meetings/vote  # 모임 참석 투표 생성 (날짜/장소만)
GET    /api/challenges/{id}/meetings       # 모임 목록
POST   /api/meetings/{id}/attend           # 참석 등록
DELETE /api/meetings/{id}/attend           # 참석 취소
```

**정기 모임 관련 지출 투표 규칙**:
- ⭐ **해당 모임에 참석한 멤버만** 지출 투표에 참여 가능
- 일반 지출 투표와 달리 전체 챌린지 멤버가 아닌 참석자 기준
- 지출 투표 API에 `meeting_id` 파라미터 추가 시 참석자 검증

### 시연 시나리오 (6분 라이브 데모)

```
[1.5분] SNS 커뮤니티 시연
  - "책벌레들" 챌린지 피드 진입
  - 공지사항 확인 (📌 핀 고정)
  - 새 글 작성 (텍스트 + 이미지)
  - 다른 멤버 글에 댓글/좋아요
  - 페이지네이션 동작 확인

[1분] 챌린지 가입 플로우 + 입회비
  - 신규 회원 "이영희" 로그인
  - 우리두 어카운트 충전 (600,000원)
  - "책벌레들" 챌린지 발견 및 가입
    * 보증금 락: 100,000원
    * 입회비: 428,571원 (동적 계산)
    * 총 결제: 528,571원
  - 어카운트 잔액 변화 확인 (600,000 → 71,429원 가용)

[1분] 투명 장부 + Django 분석
  - 장부 탭 클릭
  - **Django 분석 결과 표시** (pandas 집계)
    * "1월 총 지출: 30만원"
    * "평균 일일 지출: 1만원"
    * "전월 대비 15% 감소"
  - Recharts 차트 시각화
    * Line Chart: 월별 지출 추이
    * Pie Chart: 카테고리별 비율
  - 장부 타임라인 확인

[1분] 정기 모임 개최 (신규)
  - 리더(김철수) 계정으로 전환
  - "2월 독서 토론회" 모임 참석 투표 생성
    * 날짜: 2026-02-15
    * 장소: 강남 카페
    * (❌ 비용 기재 없음 - 참석 여부만 투표)
  - 팔로워들 참석/불참 투표 참여
  - 과반수 참석 → "모임 확정" 상태
    * (과반수 미달 시 자동 취소됨을 설명)

[1분] 투표 기반 지출 승인 (모임 후)
  - 리더가 지출 투표 생성
    * 항목: "2월 모임 장소 대관료"
    * 금액: 50,000원
    * 첨부: 영수증 이미지
  - ⭐ 모임 참석자만 투표 참여 (찬성/반대)
  - 과반수 달성 → "승인됨" 상태 전환
  - 장부에 자동 기록 확인
  - (추가 지출 발생 시 건별로 별도 투표 진행)

[0.5분] 검색 및 추천 (신규)
  - 검색창에 "독서" 입력
  - Elasticsearch 한글 검색 결과 즉시 표시
  - "회원님을 위한 추천 챌린지" 섹션
    * Django 협업 필터링 결과
    * "비슷한 관심사의 사용자들이 참여한 챌린지"

[0.5분] 마무리 & 핵심 메시지
  "소모임처럼 모이고, 토스처럼 관리하되, 먹튀 걱정은 없다"
  - SNS로 소통 ✅
  - 선충전 락으로 이탈 방지 ✅
  - 투표로 지출 통제 ✅
  - 장부로 투명성 확보 ✅
  - 검색/추천으로 챌린지 발견 ✅ (신규)
  - 정기 모임으로 실제 만남 ✅ (신규)
```

---

## [5] 역할과 권한

### 리더(계주) = Leader (구 CP)

**용어 변경**: CP (Community Producer) → 리더 (Leader)

| 기능 | 리더 권한 | 비고 |
|------|---------|------|
| 챌린지 생성 | ✅ | 챌린지 개설자가 리더 |
| 챌린지 정보 수정 | ✅ | 이름, 설명, 규칙 등 |
| 공지사항 작성 | ✅ | 피드 상단 고정 |
| **정기 모임 투표 생성** | **✅** | **신규: MEETING_ATTENDANCE** |
| 지출 요청 등록 | ✅ | 투표 안건 등록 |
| **멤버 강제 퇴출** | **❌** | **투표 필요 (70%)** |
| **장부 금액 수정** | **❌** | **시스템만 가능** |
| 장부 메모 수정 | ✅ | 카테고리/메모만 |

### 팔로워(계원) = Follower

| 기능 | 팔로워 권한 | 비고 |
|------|-----------|------|
| 피드 작성 | ✅ | 텍스트/이미지 |
| 댓글/좋아요 | ✅ | |
| 투표 참여 | ✅ | 모든 투표 참여 가능 |
| **정기 모임 참석 등록** | **✅** | **신규** |
| 지출 요청 | ❌ | 리더만 가능 |
| 챌린지 정보 수정 | ❌ | |

### 악성 유저 처리

```
[신고 누적 시스템]
신고 접수 (리더 또는 팔로워)
  ↓
신고 3건 누적
  ↓
자동 일시정지 (7일)
  ↓
플랫폼 검토
  ├─ 허위 신고 → 복구 + 신고자 경고
  └─ 위반 확인 → 영구 퇴출 + 보증금 몰수
```

---

## [6] AI 가속 개발 일정 (19일 Sprint)

### 전체 일정 개요 (AI 반영)

```
1월 7일 ~ 1월 11일 (5일): 환경 세팅 + SNS 기초
   ↓
1월 12일 ~ 1월 17일 (6일): SNS 완성 + 챌린지 가입
   ↓
1월 18일 ~ 1월 22일 (5일): 장부/분석 + 투표/모임
   ↓
1월 23일 ~ 1월 25일 (3일): 검색/추천 (Django + ES)
   ↓
1월 26일 ~ 2월 7일 (13일): 통합 테스트 + 버그 수정 (여유)
   ↓
2월 8일 ~ 2월 20일 (13일): 시연 리허설 + 최종 점검
   ↓
2월 21일 ~ 2월 25일 (5일): 최종 안정화
   ↓
2월 25일: 🚀 DEMO DAY
```

**AI 개발 효율**:
- 전통 개발: 57일
- AI 도구 활용: 19일 (코어 개발)
- 단축률: 67%
- 버퍼 시간: 30일 (테스트/리허설)

### Phase 1: 환경 세팅 (Day 1-5) - 1/7~1/11

**목표:** Spring Boot + Django + Oracle + Elasticsearch 세팅

**할 일:**
- [ ] Spring Boot 프로젝트 초기화 (Claude Code)
- [ ] Oracle 21c XE Docker 설치 및 실행
- [ ] **Django 프로젝트 초기화 + pandas/Elasticsearch 설치**
- [ ] **Elasticsearch 8.x Docker + 한글 분석기 (nori) 설정**
- [ ] **Spring Boot ↔ Django HTTP 통신 테스트**
- [ ] React + TypeScript 프로젝트 세팅 (Vite)
- [ ] JWT 인증 기본 구현 (Claude Code)
- [ ] ERD 설계 → DDL 생성 (Claude Code)

**Django 세팅:**
```bash
django-admin startproject woorido_analytics
pip install numpy pandas djangorestframework elasticsearch
```

**Elasticsearch 세팅:**
```bash
docker run -d -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms2g -Xmx2g" \
  elasticsearch:8.11.0

# 한글 분석기 설치 (nori)
docker exec -it es bin/elasticsearch-plugin install analysis-nori
```

**Checkpoint (1/11):**
- ✅ 개발 환경 100% 작동
- ✅ Spring Boot → Django Hello World 통신 성공
- ✅ Elasticsearch 한글 검색 테스트 성공

---

### Phase 2: SNS + 챌린지 (Day 6-11) - 1/12~1/17

**목표:** SNS 완성 + 챌린지 가입 (입회비 계산 포함)

**Backend (Spring Boot):**
- [ ] 피드 CRUD API (Claude Code)
- [ ] 댓글/대댓글 API
- [ ] 좋아요 토글 API
- [ ] 공지사항 핀 고정 API
- [ ] 이미지 업로드 S3
- [ ] 챌린지 CRUD API
- [ ] **입회비 계산 로직** (Claude Code)
  ```java
  BigDecimal entryFee = balance.divide(
    BigDecimal.valueOf(memberCount - 1),
    0, RoundingMode.FLOOR
  );
  ```
- [ ] 가입 시 보증금 + 입회비 차감
- [ ] 어카운트 충전 API (토스페이 Mock)

**Frontend (React):**
- [ ] 피드 목록 UI (v0.dev)
- [ ] 피드 작성 폼 (Cursor)
- [ ] 댓글 컴포넌트 (v0.dev)
- [ ] 챌린지 상세 페이지
- [ ] 가입 확인 모달 (입회비 표시)

**Checkpoint (1/17):**
- ✅ 피드 작성 → 댓글 → 좋아요 작동
- ✅ 챌린지 가입 시 입회비 동적 계산 성공
- ✅ 보증금 락 처리 확인

---

### Phase 3: 장부/분석 + 투표/모임 (Day 12-16) - 1/18~1/22

**목표:** Django 분석 + 정기 모임 투표 시스템

**Backend (Spring Boot):**
- [ ] 장부 CRUD API
- [ ] **정기 모임 투표 API** (신규)
  - POST /api/challenges/{id}/meetings/vote
  - 투표 타입: MEETING_ATTENDANCE
- [ ] **정기 모임 CRUD API** (신규)
  - POST /api/meetings/{id}/attend
- [ ] **지출 투표 API**
  - POST /api/votes (type=EXPENSE)
  - POST /api/votes/{id}/cast
  - GET /api/votes/{id}/result
- [ ] 투표 승인 시 자동 처리
  - MEETING_ATTENDANCE 승인 → MEETINGS 생성
  - EXPENSE 승인 → 장부 기록
- [ ] Django 분석 요청 라우팅

**Backend (Django):**
- [ ] POST /api/analyze/monthly-stats (pandas)
- [ ] POST /api/analyze/category-ratio
- [ ] POST /api/analyze/trend
- [ ] Spring Boot로부터 JSON 데이터 수신

**Frontend:**
- [ ] Recharts Line Chart (v0.dev)
- [ ] Recharts Pie Chart
- [ ] Django 분석 결과 카드 UI
- [ ] **정기 모임 투표 폼** (신규)
- [ ] **모임 참석 등록 UI**
- [ ] 지출 투표 UI

**Checkpoint (1/22):**
- ✅ Django 분석 결과 3초 이내 표시
- ✅ 정기 모임 개최 투표 → 승인 → MEETINGS 생성 작동
- ✅ 지출 투표 → 승인 → 장부 기록 작동

---

### Phase 4: 검색/추천 (Day 17-19) - 1/23~1/25

**목표:** Elasticsearch 검색 + Django 추천 알고리즘

**Backend (Django):**
- [ ] Spring Boot 데이터 → ES 인덱싱
  - 챌린지 데이터 인덱싱
  - 사용자 데이터 인덱싱
  - 피드 데이터 인덱싱
- [ ] GET /api/search/challenges?q= (한글 검색)
- [ ] GET /api/search/users?q=
- [ ] GET /api/search/feeds?q=
- [ ] GET /api/recommendations/challenges
  - 협업 필터링 (pandas)
  - Elasticsearch Vector Similarity
  - 하이브리드 점수 계산

**Frontend:**
- [ ] 검색 바 컴포넌트 (v0.dev)
- [ ] 검색 결과 페이지
- [ ] 추천 섹션 UI ("회원님을 위한 추천")

**Checkpoint (1/25):**
- ✅ 한글 검색 즉시 응답 (<1초)
- ✅ 추천 챌린지 Top 10 표시

---

### Phase 5: 통합 테스트 (Day 20-32) - 1/26~2/7

**목표:** 시연 시나리오 안정화

**테스트 항목:**
- [ ] 시연 시나리오 10회 반복 실행
- [ ] 크리티컬 버그 제로 달성
- [ ] 에러 핸들링 (Toast 메시지)
- [ ] 로딩 스피너 추가
- [ ] 반응형 테스트 (Mobile + Desktop)
- [ ] Django-Spring 통신 안정성
- [ ] Elasticsearch 쿼리 성능 (<1초)

**Checkpoint (2/7):**
- ✅ 시연 시나리오 성공률 100%
- ✅ 모든 API 응답 < 3초

---

### Phase 6: 시연 리허설 (Day 33-49) - 2/8~2/25

**목표:** 완벽한 시연 준비

**할 일:**
- [ ] 시연 대본 작성 (6분)
- [ ] 시연 리허설 20회 이상
- [ ] Mobile + Desktop 듀얼 시연 테스트
- [ ] PPT 발표 자료 준비
- [ ] 백업 시연 영상 녹화
- [ ] 예상 질문 답변 준비
  - "입회비는 어떻게 계산하나요?"
  - "왜 Django와 Elasticsearch를 추가했나요?"
  - "AI 도구로 어떻게 67% 단축했나요?"

**2월 25일 D-Day:**
- [ ] 오전: 최종 점검
- [ ] 오후: 🚀 **DEMO DAY**

---

## [7] API 엔드포인트 요약

```
# 인증 (3개)
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/refresh

# 유저 (4개)
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/me/account
POST   /api/users/me/account/charge

# 챌린지 (8개) - DB는 gye, API는 challenges
GET    /api/challenges
POST   /api/challenges
GET    /api/challenges/{id}
PUT    /api/challenges/{id}
POST   /api/challenges/{id}/join         # 입회비 계산 포함
POST   /api/challenges/{id}/leave
GET    /api/challenges/{id}/members
DELETE /api/challenges/{id}/members/{userId}

# 정기 모임 (5개) - 신규
POST   /api/challenges/{id}/meetings/vote  # 모임 개최 투표
GET    /api/challenges/{id}/meetings       # 모임 목록
GET    /api/meetings/{id}                  # 모임 상세
POST   /api/meetings/{id}/attend           # 참석 등록
DELETE /api/meetings/{id}/attend           # 참석 취소

# 장부 (4개)
GET    /api/challenges/{id}/ledger
GET    /api/challenges/{id}/ledger/summary
POST   /api/challenges/{id}/ledger
PUT    /api/ledger/{entryId}

# 투표 (5개)
GET    /api/challenges/{id}/votes
POST   /api/challenges/{id}/votes          # type: EXPENSE or MEETING_ATTENDANCE
GET    /api/votes/{voteId}
POST   /api/votes/{voteId}/cast
GET    /api/votes/{voteId}/result

# SNS (18개)
GET    /api/challenges/{id}/posts
POST   /api/challenges/{id}/posts
GET    /api/posts/{postId}
PUT    /api/posts/{postId}
DELETE /api/posts/{postId}
POST   /api/posts/{postId}/like
DELETE /api/posts/{postId}/like
GET    /api/posts/{postId}/comments
POST   /api/posts/{postId}/comments
PUT    /api/comments/{commentId}
DELETE /api/comments/{commentId}
POST   /api/comments/{commentId}/like
DELETE /api/comments/{commentId}/like
GET    /api/comments/{commentId}/replies
POST   /api/comments/{commentId}/replies
GET    /api/challenges/{id}/announcements
POST   /api/challenges/{id}/announcements
POST   /api/challenges/{id}/media

# 신고 (2개)
POST   /api/reports
GET    /api/reports/me

# Django 분석 API (4개)
POST   /api/analyze/monthly-stats          # 월별 지출 통계
POST   /api/analyze/category-ratio         # 카테고리별 비율
POST   /api/analyze/trend                  # 지출 트렌드
POST   /api/analyze/financial-profile      # 재정 건전성 분석

# Django 검색 API (3개) - 신규
GET    /api/search/challenges?q=           # 챌린지 검색
GET    /api/search/users?q=                # 사용자 검색
GET    /api/search/feeds?q=                # 피드 검색

# Django 추천 API (2개) - 신규
GET    /api/recommendations/challenges     # 개인화 추천
GET    /api/recommendations/similar/{id}   # 유사 챌린지

총 API: Spring 47개 + Django 9개 = 56개
```

---

## [8] 성공 기준 & KPI

### Demo Day 체크리스트

**기능 검증:**
- [ ] SNS 피드 작성 → 댓글 → 좋아요 성공
- [ ] 이미지 업로드 성공
- [ ] 어카운트 충전 성공
- [ ] **챌린지 가입 시 입회비 동적 계산 성공** (신규)
- [ ] 보증금 락 처리 확인
- [ ] 장부 차트 정상 렌더링
- [ ] **Django 분석 결과 정상 표시**
- [ ] **정기 모임 개최 투표 → 승인 → MEETINGS 생성** (신규)
- [ ] **지출 투표 → 승인 → 장부 기록** (신규)
- [ ] **Elasticsearch 한글 검색 즉시 응답** (신규)
- [ ] **추천 챌린지 표시** (신규)
- [ ] 반응형 (Mobile + Desktop) 동작

**성능 지표:**
| 지표 | 목표 |
|------|------|
| 페이지 로딩 | < 3초 |
| Spring API 응답 | < 1초 |
| **Django 분석 응답** | **< 3초** |
| **Elasticsearch 검색 응답** | **< 1초** |
| 크리티컬 버그 | 0건 |
| 시연 성공률 | 100% |

---

## [9] Risk & Mitigation

### High Priority Risks

#### 1. 개발 역량 부족 (비전공자 팀)
**Impact:** Critical | **Probability:** High

**Mitigation:**
- ✅ **AI 도구 전략 수립 완료** (67% 단축 검증)
- 주 5회 멘토링 최대 활용
- Claude Code로 복잡한 로직 생성
- Cursor로 실시간 페어 프로그래밍
- 매주 Checkpoint로 진행 검증

#### 2. 일정 지연
**Impact:** Critical | **Probability:** Medium (AI로 감소)

**Mitigation:**
- AI 도구로 19일 개발 → 30일 버퍼 확보
- 매주 Checkpoint 엄격히 준수
- 50% 미달 시 즉시 범위 축소:
  * 1순위 제외: 추천 시스템 (검색만 유지)
  * 2순위 제외: 정기 모임 기능
  * 3순위 제외: Elasticsearch (Django 간단 검색)

#### 3. Django-Spring-Elasticsearch 연동 실패
**Impact:** High | **Probability:** Medium

**Mitigation:**
- **Phase 1에서 연동 우선 검증** (1/11 체크포인트)
- Postman으로 API 계약 문서화
- 실패 시 Fallback:
  * Elasticsearch 제거 → Django 간단 LIKE 검색
  * 추천 제거 → 인기 챌린지만 표시

#### 4. 입회비 계산 공식 논란
**Impact:** Medium | **Probability:** Medium

**Mitigation:**
- 시연 시 "베타 버전, 공식 개선 예정" 명시
- 대안 공식 2개 준비:
  * A: balance / (members - 1) (현재)
  * B: balance / members (더 간단)
  * C: 고정 입회비 (예: participation_fee)

#### 5. 라이브 데모 실패
**Impact:** Critical | **Probability:** Low (리허설로 감소)

**Mitigation:**
- 시연 시나리오 20회+ 리허설
- 백업 시연 영상 준비
- 에러 핸들링 철저히
- Mock 데이터 사전 세팅

---

## [10] Post-Demo 계획

### 2순위 기능 (Demo 이후)
- **scikit-learn ML 추천 시스템** (Django 확장)
  - 이탈 예측 모델
  - 챌린지 성공률 예측
  - 최적 리워드 금액 추천
- 재정 프로필 분석 고도화
- 무한 스크롤
- 실시간 알림 (WebSocket)

### 3순위 기능 (장기)
- 실제 결제 연동 (토스페이먼츠 라이브)
- CMS 자동 출금
- PWA (홈 화면 추가)
- 앱 스토어 출시

---

## Appendix: 용어 정의

### 핵심 용어

| 용어 | 구 용어 | 정의 | DB 컬럼명 |
|------|---------|------|----------|
| **챌린지** | 계모임 | 커뮤니티 기반 목표 달성 그룹 | challenges (View) / gye (실제 테이블) |
| **리더** | 계주, CP | 챌린지 개설자 및 관리자 | leader_id |
| **팔로워** | 계원 | 챌린지 참여자 | follower |
| **정기 모임** | (신규) | 오프라인 만남 이벤트 | meetings |

### 재화 및 거래 용어 (NEW)

| 용어 | 영문 | 정의 |
|------|------|------|
| **크레딧** | Credit | 우리두 가상머니/재화 |
| **서포트** | Support | 매월 납입 행위 (와디즈 펀딩처럼) |
| **베네핏** | Benefit | 리더가 받는 할인 혜택/보상 |
| **오픈** | Open | 정기 모임에 사용할 돈 (서포트 합산) |
| **입회비** | Entry Fee | 신규 가입 시 기존 잔액 공평 분담 |

### 보증금 및 인증 용어

| 용어 | 정의 |
|------|------|
| **보증금 락** | 가입 시 1개월분 크레딧을 개인 어카운트 내 잠금 (미납 시 충당용) |
| **완주** | 1년 연속 운영 시 챌린지에 인증 마크 부여 (보증금과 무관) |

> ⚠️ **폐기된 용어**: "리워드" - 보증금 반환과 혼동을 일으켜 폐기됨

---

**"WOORIDO는 AI 도구로 19일 만에 작동하는 데모를 만들고, 이후 완벽한 제품으로 성장합니다."**

**"Demo Day is just the beginning, not the end."**

**"AI is not replacing developers, but empowering teams to move faster."**

---

**Document Version**: 4.0 AI-Accelerated
**Previous Version**: 3.0 Final (2025-12-30)
**Last Updated**: 2026-01-07
**AI Tools Used**: Claude Code, Cursor, Copilot, v0.dev

**관련 문서:**
- [TERMINOLOGY.md](../Product/TERMINOLOGY.md) - 용어 변경 가이드
- [SYSTEM_ARCHITECTURE.md](../../02_ENGINEERING/Architecture/SYSTEM_ARCHITECTURE.md) - 시스템 아키텍처
- [WBS_AI_MASTER.md](../../05_PROJECT_MANAGEMENT/WBS_AI_MASTER.md) - AI 개발 일정
- [USE_CASES.md](../Requirements/USE_CASES.md) - 유스케이스 명세
