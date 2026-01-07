# 📘 WOORIDO 개발 및 운영 매뉴얼 (Integrated Master)

> **Project:** WOORIDO (System-Driven Community Funding Solution)
> **Author:** Project PM × A.M.I Genius Partner
> **Purpose:** 인간의 리스크를 시스템으로 대체하는 핀테크 계모임 플랫폼 구축 지침
> **Version:** **V3.2 Demo Day Sprint Edition (2025-12)**
> **Status:** **Dual Track: [Vision] Production Ready + [Demo] 68 Days Sprint**

-----

## 🚀 Quick Start (Local)

```bash
# 1. Project Clone
git clone https://github.com/woorido/woorido-backend.git

# 2. Infrastructure Up (Docker)
# - Oracle XE (1521), Elasticsearch (9200), Kibana (5601)
docker-compose up -d --build

# 3. Application Run
# - Spring Boot (Money Core): http://localhost:8080
# - Django (Brain Core): http://localhost:8000
# - React (Client): http://localhost:3000 (Vercel 배포 전 로컬 구동)
```

  * **배포 목표:** "자금 무결성(Oracle) + 취향 연결(Elastic) + 반응형(Responsive) + 발견(SEO) + **현실적 운영(MVP)**"
  * **핵심 흐름:** User Action → Spring(Money) → Oracle(Save) → Sync → Elasticsearch(Search) → Kibana(Insight)

-----

## [0] 팀 구성 & Demo Day 🚀

> **CRITICAL DEADLINE: 2026년 2월 25일 (공식 시연) - 68일**
> 이 문서는 **장기 비전 [Vision]** 과 **Demo Day 시연 범위 [Demo]** 를 병렬로 기술합니다.

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

### Demo Day 미션

**2026년 2월 25일 공식 시연에서 작동하는 라이브 데모 성공**

| 구분 | 장기 비전 [Vision] | Demo Day [Demo] |
|------|-------------------|-----------------|
| **목표** | 완벽한 핀테크 플랫폼 | 5분 라이브 데모 성공 |
| **기준** | Production Ready | Zero Error Tolerance |
| **범위** | 전체 기능 | 5대 코어 + 모임관리 |
| **이후** | - | 사이드 프로젝트로 지속 발전 |

### 🔺 3-Layer Trust Architecture = 5대 코어

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
1. **💰 재정 분석 (Financial Analysis)**: Django pandas로 고객 수입/지출 분석, 적정 납입금 추천 [Demo: 🌟 핵심 미션]

**Layer 2: 신뢰 트라이포드 (3개 코어) ⭐**
2. **🔒 선충전 락 (Deposit Lock)**: 보증금 선입금으로 신뢰 확보 [Demo: Mock]
3. **📊 장부 투명화 (Open Ledger)**: Recharts 시각화 + Django 데이터 분석 [Demo: 핵심]
4. **🗳️ 결제 감시 다각화 (Consensus Pay)**: 투표 기반 지출 승인 시스템 [Demo: 핵심]

**Layer 3: 발견 엔진 (1개 코어)**
5. **🔍 취향 검색 (Taste Search)**: Elasticsearch 태그/텍스트/카테고리 + 재정 필터 [Demo: 기본]

**아키텍처 핵심 메시지:**
> "먼저 고객을 이해하고(Layer 1), 신뢰를 보증하며(Layer 2), 최적의 매칭을 제공합니다(Layer 3)"

-----

## [A] A.M.I 전략 프레임 요약

WOORIDO는 '믿음'이 아닌 '시스템'으로 작동한다. 모든 기획과 개발은 아래 3대 원칙을 따른다.

1.  **System is Gye-ju (시스템이 곧 계주다).**
      * 돈은 오직 코드(Oracle + Spring)만이 통제한다. 인간 리더(CP)는 커뮤니티만 운영하며, 자금 접근 권한은 `0`이다.
2.  **Rule over Trust (신뢰보다 규칙).**
      * 도덕성에 호소하지 않는다. '3개월치 보증금(Deposit)'과 '자동 차감'이라는 냉정한 알고리즘으로 방어한다.
3.  **Taste over Rate (이자보다 취향).**
      * 단순 수익이 아닌, **Elasticsearch 기반의 정교한 취향(Tag) 매칭**과 제휴사 '혜택(Perks)'으로 실질 가치를 제공한다.

-----

## [B] 프로젝트 개요 및 정체성

### 1\) 프로젝트 목적

  * **주제:** 인간 계주의 리스크(먹튀)와 계원의 리스크(연체)를 기술로 원천 차단한 커뮤니티 펀딩.
  * **해결 과제:** 불투명한 사적 금융을 \*\*투명한 오픈 원장(Open Ledger)\*\*과 **데이터 매칭**으로 양성화한다.

### 2\) 철학 (The Why)

  * **"돈은 시스템이 관리하고, 사람은 운영만 한다."**
  * 가장 위험한 변수인 '사람의 마음'을 제거하고, 그 자리에 '불변의 코드'를 심는다.

### 3\) 운영 기본 원칙

  * **Deposit Lock:** 전액 선충전의 부담을 없애고, **3개월치 보증금**만 확실하게 잠가 이탈을 방어한다. (손실 회피 심리 자극)
  * **Simulation First:** 금융 연동 전, 가상 시뮬레이션으로 기대 이익을 먼저 보여주어 거부감을 없앤다(Hook).
  * **Hyper-Local:** 온라인으로 모집하되, 내 생활 반경(Geo-Location) 내의 사람들과 연결한다.

### 4\) 기술 스택 (Quad-Core Architecture)

| 레이어 | 기술 | 핵심 역할 |
| :--- | :--- | :--- |
| **Money Core** | **Spring Boot + Oracle** | **[금고]** 자금 락(Lock), 정산, 무결성 트랜잭션 (Write) |
| **Match Core** | **Elasticsearch** | **[광장]** 취향/목적 태그 매칭, AI Geo 검색 (Read) |
| **Brain Core** | **Django (Python)** | **[두뇌]** 가상 시뮬레이션, 유저 성향(Archetype) 분석 |
| **Admin Core** | **Kibana** | **[상황실]** 챌린지 트렌드 시각화, 시스템 로그 모니터링 |
| **Frontend** | React + TypeScript | 시뮬레이션 훅, 반응형 웹앱(PWA), i18n SEO |

-----

## [C] 운영 프레임워크 (The WOORI Logic)

### 1\) 유입 단계: 시뮬레이션 (The Hook)

  * **Logic:** 비로그인 상태에서 소득/목표 입력 시, Django가 예상 시나리오를 시각화.
  * **Goal:** 금융 데이터 연동의 거부감을 '호기심'으로 전환하여 이지 랜딩(Easy Landing) 유도.

### 2\) 매칭 단계: 취향과 패턴 (The Connection)

  * **Elasticsearch Engine:**
      * **Context Search:** 금액뿐만 아니라 `#유럽여행`, `#맥북`, `#30대_직장인` 등 **태그(Tag)와 맥락**을 검색.
      * **AI Geo-Spatial:** 단순 현 위치가 아닌, Django가 분석한 **'유저의 주 활동 지역(Life Zone)'** 기반 매칭.
  * **Archetype:** 등급제가 아닌 상호 보완적 페르소나(Saver + Trendsetter) 매칭.

### 3\) 계약 단계: 보증금 락 (The Contract)

  * **Spring Transaction:** 챌린지 시작 전, 월 납입금의 **3배수(3개월치)를 보증금**으로 설정하여 `Locked` 상태로 전환.
  * **Rule:** 중도 이탈 시 보증금은 차감되어 잔류 멤버들에게 자동 분배(N빵).

### 4\) 실행 및 보상 단계 (The Reward)

  * **Automation:** 매월 지정일에 자동 이체 및 지급 수행 (인간 개입 X).
  * **Benefit:** 완주 시 플랫폼 수수료 유지, 대신 \*\*제휴사 할인 쿠폰(Perks)\*\*으로 실질적 보상 제공.

### 5\) 역할 구분: CP(계주) vs 계원 ⭐ [Demo]

> **CP (Community Producer)** = 계주. 커뮤니티 운영 권한만 보유, **자금 접근 권한은 0**

**CP (Community Producer) 권한:**
| 권한 | 설명 | Demo Day |
|------|------|----------|
| 모임 생성/설정 | 모임 생성 및 기본 정보 변경 | ✅ |
| 멤버 관리 | 초대 및 강제 퇴출 | ⚠️ 제한적 |
| 공지 핀 고정 | 👑 CP만 공지사항 핀 고정 가능 | ✅ |
| 지출 요청 | 지출 요청 등록 | ✅ |
| 장부 수정 | 오류 정정 (감사 로그 기록) | ❌ Post-Demo |

**계원 (Member) 권한:**
| 권한 | 설명 | Demo Day |
|------|------|----------|
| 조회 | 대시보드, 장부, 피드 조회 | ✅ |
| 투표 | 지출 요청에 찬성/반대 투표 | ✅ |
| SNS 작성 | 피드/댓글 작성 | ✅ |
| 지출 요청 | 본인 건만 지출 요청 가능 | ✅ |

**UI 표시:**
- 👑 아이콘 또는 "계주" 뱃지로 CP 표시
- 권한별 버튼 노출/숨김 처리

-----

## [D] UX 표준 (Responsive Web App)

> **"Mobile First, Desktop Expanded"**
> 앱 스토어가 아닌 URL로 접근한다. 모든 디바이스에서 최적의 경험을 제공한다.

### 1\) 해상도 대응 전략 (Breakpoints)

  * **Mobile (\<768px):** **Focus & Scroll**. 한 번에 하나의 카드, 하단 탭바(Bottom Nav).
  * **Desktop (≥768px):** **Dashboard & Grid**. 한 눈에 비교 분석, 사이드/상단 네비게이션.

### 2\) 컴포넌트 변형 규칙

  * **Navigation:** Mobile(Bottom App Bar) ↔ Desktop(Sidebar/Header).
  * **Simulation:** Mobile(Step Wizard) ↔ Desktop(Split View: Input | Output).
  * **Visualization:** Mobile(Simple Gauge) ↔ Desktop(Detailed Chart & Table).

### 3\) Frontend Tech

  * **PWA:** 모바일 홈 화면 추가 시 네이티브 앱 경험(No Address Bar).
  * **Responsive:** CSS Grid/Flexbox 기반의 단일 코드베이스(One Code) 유지.
  * **i18n:** `react-i18next` 기반의 언어팩 관리 (KO/EN).

-----

## [E] Core Architecture (시스템 구조)

> **"돈은 무겁게(Oracle), 조회는 가볍게(Elasticsearch), 관리는 한눈에(Kibana)"**

### 도메인 모듈 구조

1.  **Fund Module (Write-Heavy):** 보증금, 입출금, 정산 로직. **(Oracle)**
2.  **Search Module (Read-Heavy):** 챌린지 탐색, 추천, 필터링, Geo 검색. **(Elasticsearch)**
3.  **Simulation Module (Analysis):** 가상 시나리오 및 성향 분석. **(Django)**
4.  **Admin Module (Insight):** 데이터 시각화 및 모니터링. **(Kibana)**

### 데이터 흐름 전략 (CQRS Lite)

  * **Command (생성/수정):** 챌린지 개설, 입금, 출금 → **Spring Boot + Oracle** (ACID 트랜잭션 보장).
  * **Query (조회/검색):** "내 주변 여행 챌린지 찾기" → **Elasticsearch** (고속 검색 및 집계).
  * **Sync:** Spring Event / Logstash를 통해 Oracle 변경분을 ES로 실시간 동기화.

-----

## [F] 데이터 및 로직 인프라 상세

### 1\) Spring Boot & Oracle (The Vault)

  * **Role:** 자금의 '금고'. 절대 깨지지 않는 장부.
  * **Logic:** `Wallet` 테이블의 `Available` vs `Deposit_Locked` 잔액을 엄격히 분리.

### 2\) Elasticsearch & Kibana (The Connector & The Eye)

  * **Elasticsearch (Engine):** 유저와 챌린지의 태그, 위치 데이터를 고속 인덱싱.
      * *Index:* `idx_challenge` (tags, location, amount), `idx_user_persona`
  * **Kibana (Dashboard):** PM 및 운영팀을 위한 BI 툴.
      * *Biz View:* "실시간 인기 태그(\#)", "지역별 챌린지 분포(Map)".
      * *Ops View:* 시스템 로그 및 트래픽 모니터링.

### 3\) Django (The Brain)

  * **Role:** 시스템의 '두뇌'.
  * **Logic:** 유저 마이데이터 분석 → 페르소나 도출 → 시뮬레이션 결과값(`expected_return`) 반환.

-----

## [G] 비즈니스 모델 (BM)

1.  **Platform Fee:** 유지보수 및 보안을 위한 최소한의 **운영 수수료 (Safety Fee)**.
2.  **Affiliate Perks:** 챌린지 목적(Tag)과 연관된 제휴사 혜택 연결.
      * *System:* ES의 태그 분석 결과(`#여행`)를 바탕으로 관련 제휴사(하나투어) 타겟 광고 매칭.

-----

## [H] 핵심 가치 요약 (The WOORIDO Way)

1.  **Digital Gye-ju:** 계주는 사람이 아니다. 시스템이다. (No Fraud)
2.  **Deposit Defense:** 3개월치 보증금이 당신을 지킨다. (No Default)
3.  **Elastic Community:** 취향과 데이터로 연결된다. (No Boring)

> **"WOORIDO는 단순한 핀테크가 아닙니다. 가장 안전하고 투명한 취향 공동체입니다."**

-----

## [H-1] Demo Day MVP (시연 필수 기능) 🚀 [Demo]

> **"Perfect is the enemy of done"** - Demo Day는 완벽한 제품이 아닌, **작동하는 데모**가 목표

### 68일 타임라인

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

### 시연 시나리오 (5분 라이브 데모)

**시나리오: "독서 모임 '책벌레들'의 1월 활동"**

| 시간 | 시연 내용 |
|------|----------|
| **1분** | 👑 CP 계정 로그인 → 대시보드 진입 → 잔액/멤버 확인 |
| **1.5분** | 📊 장부 탭 → Recharts 차트 → Django 분석 결과 확인 |
| **1분** | 🗳️ 지출 요청 등록 → 멤버 계정으로 투표 → 승인 완료 |
| **1분** | 💬 SNS 피드 작성 → 댓글 → 공지 핀 고정 |
| **0.5분** | 🔍 Elasticsearch 검색 → 태그/카테고리 필터 |

### 필수 기능 체크리스트

| 기능 | 구현 범위 | Demo Day |
|------|----------|----------|
| 모임 관리 | 생성, 대시보드, 멤버 목록 | ✅ 필수 |
| 투명 장부 | Recharts + Django 분석 | ✅ 핵심 |
| 투표 승인 | 지출 요청 → 투표 → 승인 | ✅ 핵심 |
| SNS 피드 | 텍스트 작성, 댓글, 공지 | ✅ 경량 |
| 취향 검색 | 태그/텍스트 검색, 필터 | ✅ 기본 |
| 유저 인증 | 테스트 계정 로그인 (JWT) | ✅ 간소화 |

### 시연 성공 기준

**필수 체크:**
- [ ] 👑 CP 계정 로그인 → 대시보드 진입 성공
- [ ] 📊 장부 차트 정상 렌더링 (반응형: Mobile + Desktop)
- [ ] 🗳️ 지출 요청 → 투표 → 승인 Full Flow 작동
- [ ] 💬 SNS 글 작성 → 댓글 달기 성공
- [ ] 🔍 Elasticsearch 검색 정상 작동
- [ ] ⭐ **모바일 + 데스크톱 듀얼 시연 성공**
- [ ] **시나리오 3회 반복 테스트 시 에러 Zero**

-----

## [I] 개발 프로토콜 및 보안 표준 (Standard Protocols)

> **"금융 서비스의 기본은 예측 가능한 통신과 철저한 보안입니다."**

### 1\) API 공통 응답 규격 (Common Response)

모든 API(Spring, Django 공통)는 아래 JSON Wrapper 포맷을 엄격히 준수한다.

```json
{
  "timestamp": "2025-12-04T10:00:00",
  "status": 200,             // HTTP Status
  "code": "SUCCESS",         // Business Code (SUCCESS, FAIL, FUND-001...)
  "message": "요청이 정상 처리되었습니다.",
  "data": { ... }            // 실제 데이터 (Payload)
}
```

### 2\) 에러 코드 네이밍 규칙 (Error Handling)

  * **SYS-xxx:** 시스템 내부 오류 (NPE, DB Connection Fail)
  * **AUTH-xxx:** 인증/권한 오류 (Token Expired)
  * **FUND-xxx:** 자금 관련 오류 (FUND-001: 잔액 부족, FUND-002: 보증금 락 실패)
  * **SQD-xxx:** 챌린지/모임 관련 오류 (SQD-001: 모집 마감)

### 3\) 보안 및 암호화 가이드 (Security)

  * **Encryption (PII):** 계좌번호, 실명, 주민번호 등 민감 정보는 **AES-256** 암호화 후 DB 저장.
  * **Hashing (Password):** 비밀번호는 **BCrypt** 또는 **Argon2** 단방향 해싱.
  * **Communication:** 모든 통신은 **HTTPS (TLS 1.2+)** 필수 적용.

### 4\) 환경 분리 및 배포 (Environment)

  * **Local:** 개발자 PC (Mock Data 사용 가능).
  * **Dev:** 통합 테스트 서버 (CI/CD 파이프라인 연동).
  * **Prod:** 운영 서버 (실제 금융망 연동, 운영자 승인 배포).

-----

## [J] AI Geo & SEO 최적화 표준 (Technical Standard)

### 1\) AI Geo-Spatial Logic (Hyper-Local)

단순 거리순이 아닌 **'생활권(Life Zone)'** 기반 매칭 쿼리를 구현한다.

  * **Data Structure:** Elasticsearch `geo_point` (lat, lon).
  * **Logic:** Distance Filter (3km) + Life Zone Boost (1.5x).
  * **Privacy:** 프론트엔드 노출 시 `GeoHash` 마스킹 필수.

### 2\) SEO & Shareability (Technical SEO)

React 기반이지만 완벽한 메타 데이터 제공을 목표로 한다.

  * **Dynamic Meta Tags:** `react-helmet-async` 사용 (Title, Description, OG Image).
  * **Sitemap:** `sitemap.xml` 자동 생성.

### 3\) Global SEO (Multi-Language Support)

다국어 환경을 고려하여 검색엔진이 언어별 페이지를 정확히 인덱싱하도록 한다.

  * **URL Strategy:** `/ko/...`, `/en/...` Sub-directory 방식 표준.
  * **Hreflang Tags:** 페이지 헤더에 언어별 대체 URL(`ko`, `en`, `x-default`)을 반드시 명시.

-----

## [K] 대외 인터페이스 연동 표준 (External API Standard)

> **"외부 시스템은 언제든 죽을 수 있다. 우리 시스템은 살아남아야 한다."**

### 1\) 기술 스택 및 패턴

  * **Client:** `Spring Cloud OpenFeign` 또는 `WebClient` 사용.
  * **Pattern:** **Circuit Breaker Pattern** (`Resilience4j`) 필수 적용.
      * *Policy:* 최근 10회 요청 중 실패율 50% 이상 시 **Circuit Open** (요청 차단).

### 2\) 타임아웃 및 재시도 정책

  * **Money/Banking API:** Connect 2s / Read 5s. (재시도 금지 - Never Retry).
  * **Notification/Auth API:** Connect 1s / Read 3s. (최대 2회 재시도).

### 3\) 오딧 로깅 (Audit Logging)

  * 금융 사고 대비를 위해 \*\*모든 대외계 트랜잭션의 원문(Request/Response)\*\*을 `EXTERNAL_API_LOG` 테이블에 기록한다. (PII 마스킹 필수)

-----

## [L] 배포 및 인프라 전략 (Human-Driven MVP)

> **"기계적인 자동화보다, 관리자의 통제 하에 확실하게 배포한다."**

### 1\) 인프라 토폴로지 (Hybrid Cloud)

비용 효율과 관리 편의를 위해 프론트엔드와 백엔드를 분리 운영한다.

| 영역 | 플랫폼 | 배포 방식 | HTTPS |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** (Free/Pro) | GitHub `main` 브랜치 Push 시 자동 배포 | **자동 적용** |
| **Backend** | **Linux Server** (Any) | **형상 관리자**가 서버 접속 후 스크립트 실행 | **Certbot** (Manual) |
| **Database** | **Docker** (On Server) | 백엔드와 동일 서버 내 컨테이너 구동 | - |

### 2\) 형상 관리 및 배포 절차 (CM Manual)

초기에는 CI/CD 툴 대신 \*\*형상 관리자(Configuration Manager)\*\*가 코드의 무결성을 검증하고 배포를 집행한다.

  * **브랜치:** `develop` (개발용) → `main` (배포용, CM만 Merge 가능).
  * **배포 절차:**
    1.  **Code Freeze:** 배포 30분 전 커밋 금지.
    2.  **Push:** CM이 `main` 브랜치에 코드 반영.
    3.  **Deploy Script:** 서버 접속 후 `deploy.sh` 실행 (`git pull` → `docker-compose up -d --build`).

### 3\) 컨테이너 전략 (Full Docker with Volume)

모든 백엔드 요소는 `docker-compose.yml` 하나로 정의한다.

  * **Persistence:** 데이터 유실 방지를 위해 Oracle, Elastic 컨테이너에 **Host Volume** 연결 필수.
  * **Transition:** 추후 트래픽 증가 시 DB 컨테이너만 외부 클라우드(RDS 등)로 분리한다.

### 4\) SSL 및 도메인

  * **Frontend:** Vercel 자동 HTTPS 사용.
  * **Backend:** Certbot (Let's Encrypt)을 통해 무료 인증서 발급 및 갱신 스크립트(`crontab`) 운용.

-----

## [M] 데이터베이스 관리 및 운영 표준 (DBA Manual)

> **"DB 관리자는 금고지기다. 개발 편의보다 '데이터 무결성'을 최우선으로 한다."**

전담 DBA 부재 시, 백엔드 리드가 아래 프로토콜에 따라 권한을 엄격히 행사한다.

### 1\) 스키마 변경 관리 (Manual Execution)

자동화 툴(Flyway 등)에 의존하지 않고, 모든 DDL(CREATE, ALTER)은 DBA가 직접 검증 후 수행한다.

  * **프로세스:**
    1.  **요청:** 개발자가 `feature/xxx_schema.sql` 작성 후 리뷰 요청.
    2.  **검증:** DBA가 SQL의 영향도(Lock 발생 여부, 데이터 손실 가능성) 체크.
    3.  **실행:** DBA가 운영 서버에 `SYSTEM` 계정으로 접속하여 직접 스크립트 실행.

### 2\) 조회 권한 정책 (Read-Only & Masking)

개발자에게 운영 DB 접근 권한을 최소화하여 개인정보 유출을 방지한다.

  * **계정:** `DEV_READ_ONLY` 계정 발급 (오직 `SELECT` 권한만 부여).
  * **마스킹:** 민감 정보 테이블(`WALLET`, `USER_INFO`)은 직접 조회를 금지한다.
      * 대신, 주민번호와 잔액이 마스킹된 **VIEW**(`V_USER_SAFE`, `V_WALLET_SAFE`)에 대한 조회 권한만 부여한다.

### 3\) 백업 및 복구 (Snapshot Policy & Diversification)

서버 장애 및 데이터 손상에 대비해 '스냅샷' 기반의 다중 백업을 수행한다.

  * **도구:** Oracle Data Pump (`expdp`) 활용.
  * **주기:** 매일 새벽 04:00 자동 수행 (보관 주기: 최근 7일 + 매월 1일자).
  * **저장소 다각화 (3-2-1 Rule):**
    1.  **Local:** 서버 내부 디스크 (빠른 복구용).
    2.  **Cloud:** 스크립트를 통해 **AWS S3** 또는 **Google Drive**로 즉시 전송 (재해 복구용).

### 4\) 비상 대응 프로토콜 (Kill First)

DB 부하로 인해 전체 서비스가 마비되는 경우, 보고보다 조치를 우선한다.

  * **Slow Query:** 실행 시간 30초 이상 또는 CPU 점유율 90% 이상 세션 발견 시.
  * **Action:** DBA 권한으로 해당 세션을 **즉시 강제 종료(KILL SESSION)** 한다.
  * **Post-Mortem:** 조치 후 PM 및 개발팀에 사유를 공유하고 쿼리 튜닝을 지시한다.

-----

## [N] 일정 관리 및 협업 표준 (Schedule Manager Manual)

> **"납기일보다 중요한 것은 '제품의 완성도'다. 유연하게 일하되, 룰은 지킨다."**

### 1\) 개발 주기 (Feature-Driven Development)

기계적인 2주 스프린트 대신, **핵심 기능 단위**로 배포 일정을 잡는다.

  * **원칙:** "날짜가 되었다고 배포하지 않는다. 기능이 완성되어야 배포한다."
  * **배포 기준:** 핵심 기능(예: 보증금 로직)의 QA가 100% 완료된 시점.

### 2\) 마감 및 지연 정책 (Grace Period)

  * **Cut-off:** 배포 예정일에 기능 완성도가 90% 이상이라면, 기계적으로 제외(Drop)하지 않고 \*\*최대 24시간의 유예 기간(Grace Period)\*\*을 부여한다.
  * **Notification:** 단, 지연이 예상되는 즉시(최소 6시간 전) 팀에 공유해야 한다. "말없이 늦는 것은 용납하지 않는다."

### 3\) 커뮤니케이션 (Async Report)

개발자의 몰입 시간 확보를 위해 동기식 회의(Daily Scrum)를 지양한다.

  * **Daily Report:** 매일 정오(12:00)까지 지정된 슬랙 채널에 텍스트로 공유.
      * *Format:* `[진행] 로그인 API 구현 / [예정] JWT 연동 / [이슈] 없음`
  * **Meeting:** 이슈 해결이 필요한 경우에만 비정기적으로 소집한다.

### 4\) 기획 변경 대응 (Flexible Trade-off)

개발 도중 기획이 변경되어도, 진행률 50% 미만이라면 적극 수용한다.

  * **Trade-off Rule:** 새로운 기능(A)이 긴급히 들어오면, 기존 일정에 있던 기능(B)을 백로그로 뺀다. \*\*"총량 불변의 법칙"\*\*을 지켜 개발자의 번아웃을 방지한다.

-----

## [O] 프론트엔드 아키텍처 및 개발 표준 (Frontend Standard)

> **"엄격한 규칙(Strict)으로 코드를 보호하고, 유연한 방어(Fallback)로 유저를 보호한다."**

### 1\) 소스 트리 구조 (Domain-Driven Hybrid)

```text
woorido-client/
├── src/
│   ├── assets/                      # [Strict Asset] 모든 정적 자원은 여기서 Import
│   │   └── images/                  # public 폴더 사용 지양
│   ├── components/
│   │   ├── ui/                      # [Atomic] 재사용 가능한 최소 단위 (Radix Wrapper)
│   │   │   ├── Button.tsx
│   │   │   ├── Skeleton.tsx         # [A안] 로딩 플레이스홀더
│   │   │   └── ErrorFallback.tsx    # [B안] 에러 발생 시 보여줄 대체 UI
│   │   ├── common/
│   │   │   └── ErrorBoundary.tsx    # [B안] 에러 격리 컨테이너
│   │   └── domain/                  # [Feature] 도메인별 복합 컴포넌트
│   │       ├── gye/                 # 챌린지 관련
│   │       ├── wallet/              # 지갑 관련
│   │       └── simulation/          # 시뮬레이션 관련
│   ├── hooks/
│   │   ├── queries/                 # [Server State] React Query (useGye, useWallet)
│   │   └── stores/                  # [Client State] Zustand (auth, ui)
│   ├── lib/api/
│   │   ├── spring/                  # Spring Boot Endpoints
│   │   └── django/                  # Django Endpoints
│   └── App.tsx
├── .husky/                          # [A안] Git Hook (Pre-commit)
└── .eslintrc.json                   # 코드 규칙
```

### 2\) 명명 규칙 (PascalCase)

  * **근거:** React 생태계 표준 준수 및 가독성 확보.
  * **규칙:** 컴포넌트를 반환하는 모든 파일명은 반드시 `PascalCase`를 사용한다. (예: `UserProfile.tsx`)

### 3\) 에러 처리 (Local Fallback)

  * **근거:** **B안 선택.** 부분적인 에러가 전체 서비스 중단(White Screen)으로 이어지는 것을 방지.
  * **규칙:** 주요 도메인 섹션(차트, 거래내역)은 `ErrorBoundary`로 감싸서, 에러 발생 시 전체 페이지가 아닌 \*\*해당 부분만 대체 UI(Fallback)\*\*를 노출한다.

### 4\) 코드 품질 관리 (Strict Husky)

  * **근거:** **A안 선택.** 나쁜 코드가 저장소에 들어오는 것을 원천 봉쇄.
  * **규칙:** `git commit` 시 `husky`가 동작하여 Lint, Prettier, TypeScript Check를 자동 수행하고, 실패 시 커밋을 거부한다.

### 5\) 데이터 로딩 (Skeleton UI)

  * **근거:** **A안 선택.** CLS(레이아웃 이동) 방지 및 고급스러운 UX 제공.
  * **규칙:** 데이터 로딩 중에는 단순 스피너 대신, 실제 UI와 유사한 형태의 `Skeleton` 컴포넌트를 보여준다.

-----

## [P] Development Tools & Storybook (개발 도구 표준)

> **"컴포넌트는 격리된 환경에서 개발하고, 통합은 신중하게 한다."**
> **신규 추가**: 2025-12-16 (Storybook 10.1.8 통합)
> **업데이트**: 2025-12-19 (Frontend-First 전략 추가)

### 0\) Frontend-First 개발 전략 ⭐ [Demo]

> **Why Frontend-First?**
> 비전공자 팀의 강점인 **기획력과 UX 감각**을 최대한 활용하기 위해, UI를 먼저 완성하고 백엔드를 역산하는 전략

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

**스토리 구조:**
```
src/stories/
├── pages/           # 페이지 단위 스토리
│   ├── Login.stories.tsx
│   ├── Dashboard.stories.tsx
│   ├── Ledger.stories.tsx
│   └── Search.stories.tsx
│
├── flows/           # 사용자 플로우 시뮬레이션
│   ├── Onboarding.stories.tsx
│   ├── VoteFlow.stories.tsx
│   └── SearchFlow.stories.tsx
│
└── components/      # 컴포넌트 단위 (기존 Phase 5B)
```

### 1\) Storybook 기반 컴포넌트 개발

WOORIDO 프론트엔드는 **Storybook 10.1.8**을 활용하여 컴포넌트 중심 개발을 수행한다.

  * **목적:** 백엔드 API 의존성 없이 독립적인 컴포넌트 개발 및 테스트.
  * **장점:**
    1. **독립 개발:** MSW(Mock Service Worker)를 통한 API 모킹으로 백엔드 없이 개발 가능.
    2. **시각적 테스트:** 67개 스토리를 통해 모든 컴포넌트 상태를 시각적으로 검증.
    3. **자동 문서화:** Props, 이벤트 핸들러 자동 문서 생성.
    4. **반응형 테스트:** Mobile/Desktop/Large Desktop 뷰포트 전환 테스트.
  * **실행:**
    * 개발 모드: `npm run storybook` (http://localhost:6006)
    * 프로덕션 빌드: `npm run build-storybook` (정적 배포 가능)

### 2\) MSW (Mock Service Worker) 통합

모든 Storybook 스토리는 MSW를 통해 실제 API 응답을 시뮬레이션한다.

  * **패턴:**
```typescript
export const MyStory: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/posts/:postId/like`, async () => {
          await delay(500);
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};
```
  * **장점:** 네트워크 지연, 에러 상태, 느린 응답 등 다양한 시나리오 테스트 가능.

### 3\) 스토리 작성 표준

모든 주요 컴포넌트는 최소 다음 스토리를 포함해야 한다:

  * **Default** - 기본 상태
  * **Loading** - 로딩 상태 (Skeleton UI)
  * **Empty** - 빈 상태 (EmptyState 컴포넌트)
  * **Error** - 에러 상태 (ErrorFallback)
  * **Mobile/Desktop** - 반응형 뷰포트
  * **Interactions** - 사용자 인터랙션 (좋아요, 댓글 등)

### 4\) 개발 환경 문서

상세한 개발 환경 설정 및 Storybook 사용 가이드는 다음 문서를 참조:

  * **`src/docs/DEVELOPMENT_GUIDE.md`** - 로컬 환경 설정, Storybook 사용법, 빌드 가이드
  * **`src/docs/IMPLEMENTATION_HISTORY.md`** - Phase별 구현 히스토리

### 5\) 컴포넌트 개발 워크플로우

```
1. Storybook에서 스토리 작성
   ↓
2. MSW로 API 모킹
   ↓
3. 컴포넌트 개발 및 실시간 확인
   ↓
4. 다양한 상태 테스트 (로딩, 에러, 빈 상태)
   ↓
5. 메인 앱에 통합
   ↓
6. 백엔드 API 연동 및 통합 테스트
```

### 6\) 현재 Storybook 커버리지

**Phase 5B SNS 컴포넌트** (67개 스토리):

  * **PostCard** - 15 stories (기본, 좋아요, 미디어, 인용 포스트 등)
  * **FeedTimeline** - 12 stories (무한 스크롤, 정렬, 필터 등)
  * **CommentList** - 14 stories (댓글, 대댓글, 빈 상태 등)
  * **MediaUploader** - 13 stories (업로드, 진행률, 미리보기 등)
  * **AnnouncementBanner** - 18 stories (우선순위별, 읽음 처리 등)

**향후 확장:** UI 컴포넌트, 도메인 컴포넌트 추가 예정

-----

*Last Updated: 2025-12-19 (v3.2 - Demo Day Sprint Edition + Dual Track) | WOORIDO Project Team*