# WOORIDO 프로덕트 아젠다 (Product Agenda)

> **Project:** WOORIDO - 커뮤니티 기반 계모임 플랫폼
> **Version:** v3.0 - Final Specification Edition
> **Last Updated:** 2025-12-30
> **Status:** **57 Days to Demo Day**
>
> **CRITICAL DEADLINE: 2026년 2월 25일 (공식 시연)**
> - 현재: 2025-12-30
> - 남은 시간: **57일 (8주)**
> - 시연 형식: **라이브 데모 (Live Demo)**

---

## [0] Executive Summary

### 핵심 가치
> **"소모임 + 토스 = 우리두"**

### 해결하는 문제
| 기존 서비스 | 문제점 | 우리두 해결책 |
|------------|--------|--------------|
| 소모임/오픈채팅 | 회비 수금 불가 | SNS + 금융 통합 |
| 토스 모임통장 | 계주 독단 출금 → 먹튀 위험 | 투표 기반 출금 승인 |
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
```

### Demo Day 핵심 메시지
> **"소모임처럼 모이고, 토스처럼 관리하되, 먹튀 걱정은 없다"**

**핵심 원칙:**
- **"Perfect is the enemy of done"** - 완벽한 기능보다 안정적으로 작동하는 데모
- **"Demo-Driven Development"** - 시연 시나리오 역산하여 필수 기능만 개발
- **"Zero Error Tolerance"** - 라이브 데모이므로 크리티컬 버그는 절대 불가

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
│   └── 락 잔액: 200,000원 (2개 모임 보증금)                   │
│                                                             │
│   가입 중인 모임:                                            │
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

### 2.2 계모임 가입 규칙

| 항목 | 값 |
|------|------|
| **최소 납입금** | 10,000원/월 |
| **최대 납입금** | 제한 없음 |
| **보증금** | 1개월치 (고정 락) |
| **가입 필요 금액** | 2개월치 (납입 + 보증금) |
| **납입일** | 매월 1일 고정 |
| **유예 기간** | 7일 |

### 2.3 수수료 모델

| 구분 | 월 납입금 | 수수료율 | 예시 |
|------|----------|---------|------|
| **소액** | 10,000원 미만 | 1% | 5,000원 → 50원 |
| **일반** | 10,000~200,000원 | 3% | 100,000원 → 3,000원 |
| **고액** | 200,000원 초과 | 1.5% | 500,000원 → 7,500원 |

### 2.4 선충전 락 시스템

```
[가입 시점]
 └─ 납입: 100,000원 → 계 금고
 └─ 락: 100,000원 → 보증금 (완주까지 유지)

[매월 1일] 자동 납입 시도
 └─ 잔액 충분 → 자동 차감
 └─ 잔액 부족 → 7일 유예 → 보증금에서 차감

[완주 시점]
 └─ 락 해제: 보증금 → 가용 잔액으로 복귀

[중도 이탈/퇴출]
 └─ 보증금 몰수 → 남은 멤버에게 균등 분배
```

---

## [3] 기술 스택

### 시스템 구조도

```
┌─────────────────────────────────────────┐
│          Frontend (React + TS)          │
│  - SNS 피드/댓글/좋아요                   │
│  - 계모임 관리 UI                        │
│  - Recharts 장부 차트                    │
│  - 투표 UI                              │
│  - 반응형 디자인 (Mobile-First)          │
└───────────────┬─────────────────────────┘
                │ REST API (JSON)
                ▼
┌─────────────────────────────────────────┐
│      Spring Boot (Main Backend)         │
│  - Oracle DB 연동 (JDBC)                │
│  - 모임/투표/장부/유저 CRUD              │
│  - JWT 인증 및 권한 관리                 │
│  - 토스페이 결제 연동                    │
│  - Django 분석 요청 라우팅               │
└──────┬──────────────┬───────────────────┘
       │ JDBC         │ HTTP API
       ▼              ▼
┌─────────────┐  ┌─────────────────────────┐
│  Oracle DB  │  │   Django (분석 전용)     │
│  (Docker)   │  │  - pandas 통계 분석      │
│             │  │  - 재정 프로필 분석      │
│             │  │  - 장부 집계/트렌드      │
│             │  │  ❌ DB 직접 연결 금지    │
└─────────────┘  └─────────────────────────┘
```

### 데이터 흐름: Spring Boot ↔ Django

```
[장부 통계 요청]
Frontend → Spring Boot → Oracle (데이터 조회)
                ↓
         Spring Boot → Django (JSON 데이터 전달)
                ↓
         Django: pandas로 집계/분석
                ↓
         Django → Spring Boot (분석 결과 반환)
                ↓
         Spring Boot → Frontend (차트 데이터)
```

### 기술 스택 상세

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Frontend** | React 18 + TypeScript | Vite 빌드 |
| | Tailwind CSS | 반응형 |
| | Radix UI | 접근성 컴포넌트 |
| | Recharts | 차트 시각화 |
| | React Query | 서버 상태 관리 |
| | Zustand | 클라이언트 상태 |
| **Main Backend** | Spring Boot 3.2 | REST API, DB 전담 |
| | Spring Security + JWT | 인증/인가 |
| | Spring Data JPA | ORM |
| **Analytics Backend** | Django 5.0 | 분석 전용 |
| | pandas 2.1 + numpy | 데이터 분석 |
| | DRF | REST API |
| **Database** | Oracle 21c XE | Docker |
| **Storage** | AWS S3 | 이미지 저장 |
| **Payment** | 토스페이먼츠 | MVP 결제 |
| **Deployment** | Vercel (FE) / Docker (BE) | |

### Django 역할 (분석 전용)

```
┌─────────────────────────────────────────────────────────────┐
│  Django Analytics Server                                     │
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
│  └─ 결과를 JSON으로 반환                                    │
│                                                             │
│  API 엔드포인트:                                            │
│  └─ POST /api/analyze/monthly-stats    (월별 지출 통계)     │
│  └─ POST /api/analyze/category-ratio   (카테고리별 비율)    │
│  └─ POST /api/analyze/trend            (지출 트렌드)        │
│  └─ POST /api/analyze/financial-profile (재정 건전성 분석)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## [4] Demo Day MVP 기능

### 개발 우선순위 (확정)

| 순위 | 기능 | API 수 | 예상 기간 |
|------|------|--------|----------|
| **1** | **SNS (피드/댓글/좋아요/이미지)** | 18개 | 3주 |
| **2** | **계모임 가입 플로우** | 8개 | 1주 |
| **3** | **장부 + Recharts 차트 + Django 분석** | 4개 + 4개 | 1.5주 |
| **4** | **가상머니 충전/차감** | 4개 | 1주 |
| **5** | **보증금 락/해제** | (가입에 포함) | - |
| **6** | **투표 시스템** | 5개 | 1.5주 |
| | **총 API (Spring + Django)** | **44개 + 4개** | **8주** |

### 시연 시나리오 (6분 라이브 데모)

```
[1.5분] SNS 커뮤니티 시연
  - "책벌레들" 모임 피드 진입
  - 공지사항 확인 (📌 핀 고정)
  - 새 글 작성 (텍스트 + 이미지)
  - 다른 멤버 글에 댓글/좋아요
  - 페이지네이션 동작 확인

[1분] 계모임 가입 플로우
  - 신규 회원 "이영희" 로그인
  - 우리두 어카운트 충전 (200,000원)
  - "책벌레들" 모임 발견 및 가입
    * 첫 달 납입금: 100,000원
    * 보증금 락: 100,000원
  - 어카운트 잔액 변화 확인

[1.5분] 투명 장부 + Django 분석
  - 장부 탭 클릭
  - **Django 분석 결과 표시** (pandas 집계)
    * "1월 총 지출: 30만원"
    * "평균 일일 지출: 1만원"
    * "전월 대비 15% 감소"
  - Recharts 차트 시각화
    * Line Chart: 월별 지출 추이
    * Pie Chart: 카테고리별 비율
  - 장부 타임라인 확인

[1.5분] 투표 기반 지출 승인
  - CP (김철수) 계정으로 전환
  - 지출 요청 등록
    * 항목: "2월 모임 장소 대관료"
    * 금액: 50,000원
  - 이영희 계정으로 전환
  - 투표 참여 (찬성)
  - 과반수 달성 → "승인됨" 상태 전환
  - 장부에 자동 기록 확인

[0.5분] 마무리 & 핵심 메시지
  "소모임처럼 모이고, 토스처럼 관리하되, 먹튀 걱정은 없다"
  - SNS로 소통 ✅
  - 선충전 락으로 이탈 방지 ✅
  - 투표로 지출 통제 ✅
  - 장부로 투명성 확보 ✅
```

---

## [5] 역할과 권한

### CP (Community Producer) = 계주

| 기능 | CP 권한 | 비고 |
|------|---------|------|
| 모임 생성 | ✅ | 모임 개설자가 CP |
| 모임 정보 수정 | ✅ | 이름, 설명, 규칙 등 |
| 공지사항 작성 | ✅ | 피드 상단 고정 |
| 지출 요청 등록 | ✅ | 투표 안건 등록 |
| **멤버 강제 퇴출** | **❌** | **투표 필요 (70%)** |
| **장부 금액 수정** | **❌** | **시스템만 가능** |
| 장부 메모 수정 | ✅ | 카테고리/메모만 |

### 악성 유저 처리

```
[신고 누적 시스템]
신고 접수 (CP 또는 멤버)
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

## [6] 57일 타임라인

### 전체 일정 개요

```
12월 30일 ~ 1월 5일 (1주): 환경 세팅 (Spring + Django + Oracle)
   ↓
1월 6일 ~ 1월 19일 (2주): SNS 완성 (피드/댓글/좋아요/이미지)
   ↓
1월 20일 ~ 1월 26일 (1주): 계모임 가입 + 가상머니
   ↓
1월 27일 ~ 2월 5일 (1.5주): 장부 + Recharts + Django 분석
   ↓
2월 6일 ~ 2월 14일 (1.5주): 투표 시스템
   ↓
2월 15일 ~ 2월 20일 (6일): 통합 테스트 + 버그 수정
   ↓
2월 21일 ~ 2월 25일 (5일): 시연 리허설
   ↓
2월 25일: 🚀 DEMO DAY
```

### Week 1: 환경 세팅 & SNS 기초 (12/30-1/5)

**목표:** 개발 환경 구축 (Spring + Django + Oracle) 및 SNS 기본 구조 설계

**할 일:**
- [ ] Spring Boot 프로젝트 초기화
- [ ] Oracle 21c XE Docker 설치 및 실행
- [ ] **Django 프로젝트 초기화 + pandas/numpy 설치**
- [ ] **Spring Boot ↔ Django HTTP 통신 테스트**
- [ ] React + TypeScript 프로젝트 세팅 (Vite)
- [ ] JWT 인증 기본 구현
- [ ] SNS DB 스키마 설계 (posts, comments, likes)
- [ ] 피드 CRUD API 기본 구현

**Django 세팅:**
```bash
django-admin startproject woorido_analytics
pip install numpy pandas djangorestframework
```

**Checkpoint (1/5):**
- ✅ 개발 환경 100% 작동 (Spring + Django + Oracle)
- ✅ Spring Boot → Django Hello World 통신 성공
- ✅ 피드 생성/조회 API 동작

---

### Week 2-3: SNS 완성 (1/6-1/19)

**목표:** SNS 핵심 기능 완성

**Backend:**
- [ ] 피드 CRUD 완성
- [ ] 댓글/대댓글 API
- [ ] 좋아요 토글 API
- [ ] 공지사항 핀 고정 API
- [ ] 이미지 업로드 (S3)
- [ ] 페이지네이션

**Frontend:**
- [ ] 피드 목록 UI (페이지네이션)
- [ ] 피드 작성 폼 (텍스트 + 이미지)
- [ ] 댓글/대댓글 컴포넌트
- [ ] 좋아요 버튼
- [ ] 공지사항 핀 표시

**Checkpoint (1/19):**
- ✅ 피드 작성 → 댓글 → 좋아요 Full Flow 작동
- ✅ 이미지 업로드 성공

---

### Week 4: 계모임 가입 + 가상머니 (1/20-1/26)

**목표:** 가입 플로우 및 어카운트 시스템 완성

**Backend:**
- [ ] 계모임 CRUD API
- [ ] 어카운트 충전 API (토스페이 Mock)
- [ ] 가입 시 잔액 확인 + 차감
- [ ] 보증금 락 처리

**Frontend:**
- [ ] 계모임 상세 페이지
- [ ] 가입 확인 모달
- [ ] 어카운트 충전 UI
- [ ] 잔액 표시

**Checkpoint (1/26):**
- ✅ 충전 → 가입 → 보증금 락 Full Flow 작동

---

### Week 5: 장부 + 차트 + Django 분석 (1/27-2/5)

**목표:** 장부 시각화 및 Django 데이터 분석 연동

**Backend (Spring Boot):**
- [ ] 장부 CRUD API
- [ ] 장부 요약 API (차트 데이터)
- [ ] Django 분석 요청 라우팅 구현

**Backend (Django):**
- [ ] POST /api/analyze/monthly-stats 구현
- [ ] POST /api/analyze/category-ratio 구현
- [ ] POST /api/analyze/trend 구현
- [ ] pandas 집계 로직 구현
  * 총 지출, 평균, 카테고리별 비율
  * 전월 대비 증감률 계산

**Django 분석 예시:**
```python
# views.py
@api_view(['POST'])
def monthly_stats(request):
    df = pd.DataFrame(request.data['transactions'])
    return Response({
        'total': int(df['amount'].sum()),
        'avg_per_day': int(df['amount'].mean()),
        'categories': df.groupby('category')['amount'].sum().to_dict(),
        'trend': calculate_trend(df)
    })
```

**Frontend:**
- [ ] Recharts Line Chart (월별 추이)
- [ ] Recharts Pie Chart (카테고리별)
- [ ] Django 분석 결과 카드 UI
- [ ] 장부 타임라인 UI

**Checkpoint (2/5):**
- ✅ 차트 정상 렌더링
- ✅ Django 분석 결과 3초 이내 표시
- ✅ 장부 내역 조회 성공

---

### Week 6-7: 투표 시스템 (2/6-2/14)

**목표:** 지출 요청 및 투표 승인 시스템 완성

**Backend:**
- [ ] 투표 생성/조회 API
- [ ] 투표 참여 API
- [ ] 과반수 판정 로직
- [ ] 승인 시 장부 자동 기록

**Frontend:**
- [ ] 지출 요청 폼
- [ ] 투표 UI (찬성/반대)
- [ ] 투표 현황 표시
- [ ] 결과 알림

**Checkpoint (2/14):**
- ✅ 지출 요청 → 투표 → 승인 → 장부 기록 Full Flow 작동

---

### Week 8: 통합 테스트 (2/15-2/20)

**목표:** 시연 시나리오 기준 안정화

**테스트 항목:**
- [ ] 시연 시나리오 10회 반복 실행
- [ ] 크리티컬 버그 제로 달성
- [ ] 에러 핸들링 (Toast 메시지)
- [ ] 로딩 스피너 추가
- [ ] 반응형 테스트 (Mobile + Desktop)

**Checkpoint (2/20):**
- ✅ 시연 시나리오 성공률 100%
- ✅ Spring Boot ↔ Django 통신 안정성 확인

---

### Week 9: 시연 리허설 (2/21-2/25)

**목표:** 완벽한 시연 준비

**할 일:**
- [ ] 시연 대본 작성 (6분)
- [ ] 시연 리허설 5회 이상
- [ ] Mobile + Desktop 듀얼 시연 테스트
- [ ] PPT 발표 자료 준비
- [ ] 백업 시연 영상 녹화
- [ ] 예상 질문 답변 준비

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

# 계모임 (8개)
GET    /api/gye
POST   /api/gye
GET    /api/gye/{id}
PUT    /api/gye/{id}
POST   /api/gye/{id}/join
POST   /api/gye/{id}/leave
GET    /api/gye/{id}/members
DELETE /api/gye/{id}/members/{userId}

# 장부 (4개)
GET    /api/gye/{id}/ledger
GET    /api/gye/{id}/ledger/summary
POST   /api/gye/{id}/ledger
PUT    /api/ledger/{entryId}

# 투표 (5개)
GET    /api/gye/{id}/votes
POST   /api/gye/{id}/votes
GET    /api/votes/{voteId}
POST   /api/votes/{voteId}/cast
GET    /api/votes/{voteId}/result

# SNS (18개)
GET    /api/gye/{gyeId}/posts
POST   /api/gye/{gyeId}/posts
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
GET    /api/gye/{gyeId}/announcements
POST   /api/gye/{gyeId}/announcements
POST   /api/gye/{gyeId}/media

# 신고 (2개)
POST   /api/reports
GET    /api/reports/me

# Django 분석 API (4개) - Django 서버
POST   /api/analyze/monthly-stats      # 월별 지출 통계
POST   /api/analyze/category-ratio     # 카테고리별 비율
POST   /api/analyze/trend              # 지출 트렌드
POST   /api/analyze/financial-profile  # 재정 건전성 분석

총 API: Spring 44개 + Django 4개 = 48개
```

---

## [8] 성공 기준 & KPI

### Demo Day 체크리스트

**기능 검증:**
- [ ] SNS 피드 작성 → 댓글 → 좋아요 성공
- [ ] 이미지 업로드 성공
- [ ] 어카운트 충전 성공
- [ ] 계모임 가입 (보증금 락) 성공
- [ ] 장부 차트 정상 렌더링
- [ ] **Django 분석 결과 정상 표시**
- [ ] 투표 → 승인 → 장부 기록 성공
- [ ] 반응형 (Mobile + Desktop) 동작

**성능 지표:**
| 지표 | 목표 |
|------|------|
| 페이지 로딩 | < 3초 |
| Spring API 응답 | < 1초 |
| **Django 분석 응답** | **< 3초** |
| 크리티컬 버그 | 0건 |
| 시연 성공률 | 100% |

---

## [9] Risk & Mitigation

### High Priority Risks

#### 1. 개발 역량 부족 (비전공자 팀)
**Impact:** Critical | **Probability:** High

**Mitigation:**
- 주 5회 멘토링 최대 활용
- AI Pair Programming (Gemini, Claude Code)
- 오픈소스 템플릿 활용
- 매주 Checkpoint로 진행 검증

#### 2. 일정 지연
**Impact:** Critical | **Probability:** High

**Mitigation:**
- 매주 Checkpoint 엄격히 준수
- 50% 미달 시 즉시 범위 축소
- 예비 기능 목록:
  * 1순위 제외: Elasticsearch 검색
  * 2순위 제외: 이미지 업로드 (텍스트만)
  * 3순위 제외: Django 분석 간소화 (기본 통계만)

#### 4. Django-Spring 연동 실패
**Impact:** High | **Probability:** Medium

**Mitigation:**
- Week 1에 연동 우선 검증 (Hello World)
- Postman으로 API 계약 문서화
- 실패 시 Django 분석 간소화 (Spring Boot에서 간단한 통계만)

#### 3. 라이브 데모 실패
**Impact:** Critical | **Probability:** Medium

**Mitigation:**
- 시연 시나리오 10회+ 리허설
- 백업 시연 영상 준비
- 에러 핸들링 철저히

---

## [10] Post-Demo 계획

### 2순위 기능 (Demo 이후)
- 재정 프로필 분석 고도화 (Django 확장)
- Elasticsearch 취향 검색
- 무한 스크롤
- 실시간 알림 (WebSocket)

### 3순위 기능 (장기)
- 실제 결제 연동 (토스페이먼츠 라이브)
- CMS 자동 출금
- PWA (홈 화면 추가)
- AI 기반 추천 (Django ML 확장)
- 앱 스토어 출시

---

## Appendix: 용어 정의

| 용어 | 정의 |
|------|------|
| **우리두 어카운트** | 플랫폼 가상머니 지갑 |
| **가용 잔액** | 출금/가입 가능한 금액 |
| **락 잔액** | 보증금으로 잠긴 금액 |
| **CP** | Community Producer, 계주 |
| **선충전 락** | 가입 시 1개월 보증금 예치 |
| **결제 감시 다각화** | 투표 기반 지출 승인 시스템 |
| **장부 투명화** | Recharts 시각화된 오픈 원장 |

---

**"WOORIDO는 57일 안에 작동하는 데모를 만들고, 이후 완벽한 제품으로 성장합니다."**

**"Demo Day is just the beginning, not the end."**

---

**Document Version**: 3.0 Final
**Based On**: WOORIDO_FINAL_SPECIFICATION.md
**Last Updated**: 2025-12-30

**관련 문서:**
- [WOORIDO_FINAL_SPECIFICATION.md](./WOORIDO_FINAL_SPECIFICATION.md) - 상세 기술 명세서
