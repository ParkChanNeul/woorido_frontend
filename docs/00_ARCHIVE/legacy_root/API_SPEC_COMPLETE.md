# WOORIDO API 완전 명세서 (백엔드 구현 가이드)

## 📋 개요

**대상**: Spring Boot 백엔드 개발자
**목적**: 프론트엔드 Phase 3 & 5A에서 필요한 모든 API 구현
**프론트엔드**: 타입, hooks, stores 모두 구현 완료
**핵심 미션**: **고객 수입·지출 데이터 분석 기반** 지역 계모임 운영 솔루션

---

## 🎯 구현 필요 API 목록

### 🌟 핵심 미션 API (고객 재정 분석)
1. ❌ **재정 프로필 등록/수정** - TODO (핵심)
2. ❌ **재정 프로필 조회** - TODO (핵심)
3. ❌ **신뢰 점수 조회** - TODO (핵심)
4. ❌ **계모임 추천** - TODO (핵심)

### Django 분석 API (Stateless Brain)
5. ❌ **재정 프로필 분석** - TODO (Django)
6. ❌ **계모임 추천 분석** - TODO (Django)
7. ❌ **월간 장부 통계** - TODO (Django)

### Phase 3 TODO (Gye 관리)
8. ✅ **계 목록 조회** - 이미 구현 가정
9. ✅ **계 상세 조회** - 이미 구현 가정
10. ❌ **계 생성** - TODO
11. ❌ **계 수정** - TODO
12. ❌ **계 가입** - TODO
13. ❌ **계 탈퇴** - TODO
14. ❌ **계 멤버 목록** - TODO

### Phase 3 TODO (Ledger 공개 장부)
15. ❌ **공개 장부 타임라인** - TODO
16. ❌ **공개 장부 요약** - TODO

### Phase 5A (SNS 기능)
17. ❌ **계 피드 조회** (무한 스크롤)
18. ❌ **포스트 생성/수정/삭제**
19. ❌ **포스트 좋아요/취소**
20. ❌ **댓글 조회/생성/수정/삭제**
21. ❌ **댓글 좋아요/취소**
22. ❌ **대댓글 조회**
23. ❌ **미디어 업로드/삭제**
24. ❌ **공지사항 CRUD** (계주만)
25. ❌ **공지사항 읽음 처리**

**총 25개 API 엔드포인트** (기존 18개 + 핵심 미션 7개)

---

## 🔐 공통 사항

### 인증
```http
Authorization: Bearer {accessToken}
```

### 응답 형식
```typescript
// 성공
{
  "data": { /* 실제 데이터 */ },
  "code": "SUCCESS"
}

// 실패
{
  "code": "ERROR-CODE",
  "message": "에러 메시지"
}
```

### 에러 코드
```typescript
// 시스템
SYS-001: 시스템 에러
SYS-002: DB 에러

// 인증
AUTH-001: 인증 필요
AUTH-002: 토큰 만료
AUTH-003: 유효하지 않은 토큰

// 계 관련
SQD-001: 계가 마감됨
SQD-002: 계 정원 초과
SQD-003: 계 멤버가 아님

// 자금
FUND-001: 잔액 부족
FUND-002: 보증금 Lock 실패
FUND-003: 보증금 Unlock 실패

// SNS
POST-001: 포스트를 찾을 수 없음
POST-002: 포스트 권한 없음 (작성자 아님)
POST-003: 유효하지 않은 미디어

COMMENT-001: 댓글을 찾을 수 없음
COMMENT-002: 댓글 권한 없음
```

---

# PART 0: 핵심 미션 API (고객 재정 분석) 🌟

> **"고객 수입·지출 데이터 분석 기반 지역 계모임 운영 솔루션 구축"**
> 이 섹션은 프로젝트 핵심 미션을 구현하는 API입니다.

## 데이터 흐름

```
┌─────────────────────────────────────────────────────────────────────┐
│                    고객 재정 분석 파이프라인                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [1] 사용자 입력 (온보딩)                                           │
│      Frontend → POST /api/users/{id}/financial-profile              │
│                                                                     │
│  [2] Spring Boot → Django 분석 요청                                 │
│      POST http://django:8000/api/analyze/financial-profile          │
│                                                                     │
│  [3] Django pandas 분석 → 결과 반환                                 │
│      { 적정납입금, 재정건전성점수, 리스크등급 }                       │
│                                                                     │
│  [4] Spring Boot → Oracle 저장                                      │
│      user_financial_profiles, user_trust_scores 테이블              │
│                                                                     │
│  [5] 계모임 추천 요청 시                                            │
│      GET /api/gyes/recommendations?userId={id}                      │
│      → Django 분석 + Elasticsearch 검색 결합                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 0-1. 재정 프로필 등록/수정

### `POST /api/users/{userId}/financial-profile`

**권한**: 본인만 (userId === JWT user)

**Request Body**:
```json
{
  "monthlyIncome": 3500000,
  "monthlyExpense": 2800000,
  "savingsCapacity": 700000,
  "expenseCategories": {
    "food": 30,
    "transport": 15,
    "culture": 10,
    "housing": 25,
    "etc": 20
  },
  "desiredContribution": 100000,
  "riskTolerance": "medium"
}
```

**Validation**:
- `monthlyIncome`: 0 이상 (필수)
- `monthlyExpense`: 0 이상 (필수)
- `savingsCapacity`: 0 이상, monthlyIncome - monthlyExpense 이하 (필수)
- `expenseCategories`: 합계 100% (선택)
- `desiredContribution`: 0 이상 (선택)
- `riskTolerance`: "low" | "medium" | "high" (선택, 기본 "medium")

**비즈니스 로직**:
1. Spring Boot → Django API 호출
   ```
   POST http://django:8000/api/analyze/financial-profile
   Body: { income, expense, savingsCapacity, categories }
   ```
2. Django 분석 결과 수신
3. user_financial_profiles 테이블 UPSERT
4. user_trust_scores 테이블 재정건전성 점수 업데이트

**Response 200**:
```json
{
  "data": {
    "profile": {
      "id": "profile-uuid",
      "userId": "user-uuid",
      "monthlyIncome": 3500000,
      "monthlyExpense": 2800000,
      "savingsCapacity": 700000,
      "expenseCategories": {
        "food": 30,
        "transport": 15,
        "culture": 10,
        "housing": 25,
        "etc": 20
      },
      "desiredContribution": 100000,
      "riskTolerance": "medium",
      "createdAt": "2025-12-23T10:00:00Z",
      "updatedAt": "2025-12-23T10:00:00Z"
    },
    "analysis": {
      "appropriateContribution": 105000,
      "financialHealthScore": 80.0,
      "riskLevel": "medium",
      "savingsRate": 20.0,
      "analysisComment": "재정 건전성이 보통입니다 (80점). 적정 납입금 범위 내에서 참여를 권장합니다."
    }
  }
}
```

---

## 0-2. 재정 프로필 조회

### `GET /api/users/{userId}/financial-profile`

**권한**: 본인만

**Response 200**: 0-1과 동일

**Response 404**: 프로필 미등록
```json
{
  "code": "PROFILE-001",
  "message": "재정 프로필이 등록되지 않았습니다."
}
```

---

## 0-3. 신뢰 점수 조회

### `GET /api/users/{userId}/trust-score`

**권한**: 본인만

**Response 200**:
```json
{
  "data": {
    "trustScore": {
      "userId": "user-uuid",
      "financialHealthScore": 80.0,
      "completionRate": 100.0,
      "voteParticipation": 85.0,
      "communityActivity": 70.0,
      "totalTrustScore": 82.5,
      "rank": "상위 25%",
      "calculatedAt": "2025-12-23T10:00:00Z"
    },
    "breakdown": {
      "financialHealth": {
        "score": 80.0,
        "weight": 0.4,
        "contribution": 32.0
      },
      "completion": {
        "score": 100.0,
        "weight": 0.3,
        "contribution": 30.0
      },
      "voteParticipation": {
        "score": 85.0,
        "weight": 0.2,
        "contribution": 17.0
      },
      "communityActivity": {
        "score": 70.0,
        "weight": 0.1,
        "contribution": 7.0
      }
    }
  }
}
```

**신뢰 점수 계산 공식**:
```
totalTrustScore = (financialHealthScore × 0.4)
                + (completionRate × 0.3)
                + (voteParticipation × 0.2)
                + (communityActivity × 0.1)
```

---

## 0-4. 계모임 추천

### `GET /api/gyes/recommendations`

**권한**: 인증된 사용자

**Query Parameters**:
```typescript
userId: string           // 필수
limit?: number           // 기본 10
tags?: string[]          // 취향 태그 필터 (선택)
category?: string        // 카테고리 필터 (선택)
minContribution?: number // 최소 월 납입금 (선택)
maxContribution?: number // 최대 월 납입금 (선택)
```

**비즈니스 로직**:
1. 사용자 재정 프로필 조회
2. Spring Boot → Django API 호출
   ```
   POST http://django:8000/api/analyze/gye-recommendation
   Body: { userProfile, preferences, availableGyes }
   ```
3. Elasticsearch 검색 (취향 태그, 카테고리)
4. Django 매칭 점수 + Elasticsearch 결과 결합
5. 정렬 및 반환

**Response 200**:
```json
{
  "data": {
    "recommendations": [
      {
        "gye": {
          "id": "gye-uuid-1",
          "name": "책벌레들",
          "description": "독서를 사랑하는 사람들의 모임",
          "type": "savings",
          "monthlyAmount": 100000,
          "currentMembers": 6,
          "maxMembers": 10,
          "tags": ["독서", "문학", "자기계발"],
          "category": "문화/예술"
        },
        "matchScore": 92,
        "reasons": [
          "취향 일치율 85%",
          "적정 납입금 범위 내",
          "멤버 평균 신뢰점수와 유사"
        ],
        "financialFit": {
          "yourContribution": 100000,
          "appropriateRange": "80,000원 ~ 120,000원",
          "status": "적합"
        }
      },
      {
        "gye": {
          "id": "gye-uuid-2",
          "name": "영화광들",
          "description": "매주 영화 감상하는 모임",
          "type": "savings",
          "monthlyAmount": 80000,
          "currentMembers": 4,
          "maxMembers": 8,
          "tags": ["영화", "문화", "주말모임"],
          "category": "문화/예술"
        },
        "matchScore": 78,
        "reasons": [
          "취향 일치율 65%",
          "적정 납입금보다 낮음 (여유 있음)",
          "소규모 모임 선호 매칭"
        ],
        "financialFit": {
          "yourContribution": 80000,
          "appropriateRange": "80,000원 ~ 120,000원",
          "status": "여유"
        }
      }
    ],
    "total": 2,
    "userProfile": {
      "appropriateContribution": 105000,
      "trustScore": 82.5,
      "preferences": ["독서", "영화", "문화"]
    }
  }
}
```

---

# Django 분석 API (Stateless Brain)

> Django는 DB에 직접 연결하지 않고, Spring Boot로부터 받은 JSON을 pandas로 분석하여 결과만 반환합니다.

## D-1. 재정 프로필 분석

### `POST /api/analyze/financial-profile` (Django)

**호출자**: Spring Boot만

**Request Body**:
```json
{
  "income": 3500000,
  "expense": 2800000,
  "savingsCapacity": 700000,
  "categories": {
    "food": 30,
    "transport": 15,
    "culture": 10,
    "housing": 25,
    "etc": 20
  }
}
```

**Response 200**:
```json
{
  "appropriateContribution": 105000,
  "financialHealthScore": 80.0,
  "riskLevel": "medium",
  "savingsRate": 20.0,
  "analysis": "재정 건전성이 보통입니다 (80점). 적정 납입금 범위 내에서 참여를 권장합니다."
}
```

**Django 분석 로직**:
```python
# 적정 월 납입금 = 저축가능액 × 15%
appropriate = savings_capacity * 0.15

# 저축률 = 저축가능액 / 수입
savings_rate = savings_capacity / income

# 재정건전성 점수 = (저축률 / 목표저축률 25%) × 100, 최대 100점
health_score = min(100, (savings_rate / 0.25) * 100)

# 리스크 등급
if health_score >= 90: risk = 'low'
elif health_score >= 70: risk = 'medium'
else: risk = 'high'
```

---

## D-2. 계모임 추천 분석

### `POST /api/analyze/gye-recommendation` (Django)

**호출자**: Spring Boot만

**Request Body**:
```json
{
  "userProfile": {
    "appropriateContribution": 105000,
    "trustScore": 82.5,
    "riskLevel": "medium",
    "preferences": ["독서", "영화"]
  },
  "availableGyes": [
    {
      "id": "gye-1",
      "monthlyAmount": 100000,
      "avgTrustScore": 78,
      "tags": ["독서", "문학"],
      "currentMembers": 6,
      "maxMembers": 10
    },
    {
      "id": "gye-2",
      "monthlyAmount": 150000,
      "avgTrustScore": 85,
      "tags": ["영화", "문화"],
      "currentMembers": 4,
      "maxMembers": 8
    }
  ]
}
```

**Response 200**:
```json
{
  "recommendations": [
    {
      "gyeId": "gye-1",
      "matchScore": 92,
      "reasons": [
        "취향 일치율 85%",
        "적정 납입금 범위 내",
        "멤버 평균 신뢰점수와 유사"
      ],
      "financialFit": "적합"
    },
    {
      "gyeId": "gye-2",
      "matchScore": 65,
      "reasons": [
        "취향 일치율 50%",
        "적정 납입금 초과 (위험)",
        "신뢰 점수 차이 있음"
      ],
      "financialFit": "초과"
    }
  ]
}
```

**Django 매칭 로직**:
```python
def calculate_match_score(user, gye):
    # 1. 재정 적합성 (40%)
    contribution_diff = abs(user.appropriate - gye.monthly_amount)
    financial_score = max(0, 100 - (contribution_diff / user.appropriate * 100))

    # 2. 취향 일치율 (35%)
    common_tags = set(user.preferences) & set(gye.tags)
    taste_score = len(common_tags) / len(user.preferences) * 100

    # 3. 신뢰 점수 유사도 (25%)
    trust_diff = abs(user.trust_score - gye.avg_trust_score)
    trust_score = max(0, 100 - trust_diff)

    return financial_score * 0.4 + taste_score * 0.35 + trust_score * 0.25
```

---

## D-3. 월간 장부 통계 분석

### `POST /api/analyze/monthly-stats` (Django)

**호출자**: Spring Boot만

**Request Body**:
```json
{
  "transactions": [
    {"date": "2026-01-05", "amount": 50000, "category": "식비", "type": "expense"},
    {"date": "2026-01-10", "amount": 120000, "category": "회식", "type": "expense"},
    {"date": "2026-01-15", "amount": 100000, "category": "납입", "type": "income"}
  ]
}
```

**Response 200**:
```json
{
  "summary": {
    "totalIncome": 100000,
    "totalExpense": 170000,
    "balance": -70000,
    "avgDailyExpense": 5666
  },
  "categoryBreakdown": {
    "식비": {"amount": 50000, "ratio": 29.4},
    "회식": {"amount": 120000, "ratio": 70.6}
  },
  "trend": {
    "direction": "increasing",
    "changeRate": 15.2,
    "message": "지출이 전월 대비 15.2% 증가했습니다."
  }
}
```

---

# PART 1: Gye (계) 관리 API

## 1. 계 생성

### `POST /api/gye`

**권한**: 인증된 사용자

**Request Body**:
```json
{
  "name": "2025 새해 저축 계",
  "description": "친구들과 함께하는 저축 계모임",
  "type": "savings",  // "savings" | "distribution"
  "monthlyAmount": 100000,
  "maxMembers": 10,
  "startDate": "2025-01-01",
  "rules": [
    "매월 1일까지 납부",
    "3회 연속 미납 시 퇴출"
  ]
}
```

**Validation**:
- `name`: 2~50자 (필수)
- `type`: "savings" or "distribution" (필수)
- `monthlyAmount`: 10,000 이상 (필수)
- `maxMembers`: 2~50 (필수)
- `startDate`: 오늘 이후 날짜 (필수)
- `rules`: 최대 10개, 각 100자 이내

**Response 201**:
```json
{
  "data": {
    "id": "gye-uuid",
    "name": "2025 새해 저축 계",
    "description": "친구들과 함께하는 저축 계모임",
    "type": "savings",
    "status": "recruiting",
    "hostId": "user-uuid",
    "host": {
      "id": "user-uuid",
      "nickname": "김철수",
      "profileImage": "https://cdn.example.com/profile.jpg",
      "creditScore": 850
    },
    "monthlyAmount": 100000,
    "targetAmount": 1000000,
    "currentAmount": 0,
    "maxMembers": 10,
    "currentMembers": 1,  // 생성자 자동 가입
    "startDate": "2025-01-01",
    "endDate": "2025-10-01",  // 자동 계산
    "currentRound": 0,
    "totalRounds": 10,
    "createdAt": "2025-12-12T10:00:00Z",
    "updatedAt": "2025-12-12T10:00:00Z"
  }
}
```

**비즈니스 로직**:
1. 생성자를 계주(host)로 설정
2. 생성자를 첫 멤버로 자동 가입 (orderNumber: 1)
3. `totalRounds = maxMembers`
4. `targetAmount = monthlyAmount * totalRounds`
5. `endDate = startDate + (totalRounds * 1개월)`
6. 보증금 계산: `monthlyAmount * 3` (3개월치)

---

## 2. 계 수정

### `PUT /api/gye/{gyeId}`

**권한**: 계주만 (hostId === userId)

**Request Body**:
```json
{
  "name": "수정된 계 이름",  // 선택
  "description": "수정된 설명",  // 선택
  "monthlyAmount": 150000,  // 선택 (recruiting 상태에서만)
  "maxMembers": 12,  // 선택 (recruiting 상태에서만)
  "rules": ["수정된 규칙 1"]  // 선택
}
```

**Validation**:
- `status`가 "recruiting"이 아니면 `monthlyAmount`, `maxMembers` 수정 불가
- `currentMembers`보다 작은 `maxMembers` 설정 불가

**Response 200**: Gye 객체 (1번과 동일)

---

## 3. 계 가입

### `POST /api/gye/{gyeId}/join`

**권한**: 인증된 사용자

**Request Body**:
```json
{
  "message": "가입 신청 메시지 (선택)"
}
```

**Validation**:
- 이미 멤버인 경우: 400 Bad Request
- 정원 초과: 400 Bad Request (SQD-002)
- 계 상태가 "recruiting"이 아닌 경우: 400 Bad Request

**Response 200**:
```json
{
  "data": {
    "member": {
      "id": "member-uuid",
      "gyeId": "gye-uuid",
      "userId": "user-uuid",
      "user": {
        "id": "user-uuid",
        "nickname": "이영희",
        "profileImage": "https://cdn.example.com/profile2.jpg",
        "creditScore": 720
      },
      "role": "member",  // "host" | "member"
      "status": "active",  // "active" | "pending" | "left" | "kicked"
      "orderNumber": 2,  // 가입 순서
      "paidRounds": 0,
      "totalPaid": 0,
      "joinedAt": "2025-12-12T11:00:00Z"
    }
  }
}
```

**비즈니스 로직**:
1. `orderNumber`: 현재 멤버 수 + 1
2. 보증금 3개월치 Lock (별도 API 호출 또는 트랜잭션)
3. 정원 채워지면 계 상태 → "ongoing"

---

## 4. 계 탈퇴

### `POST /api/gye/{gyeId}/leave`

**권한**: 계 멤버 (계주 제외)

**Request Body**:
```json
{
  "reason": "탈퇴 사유 (선택)"
}
```

**Validation**:
- 계주는 탈퇴 불가 (계 삭제만 가능)
- 계 상태가 "ongoing"이면 보증금 몰수

**Response 200**:
```json
{
  "data": {
    "leftAt": "2025-12-12T12:00:00Z",
    "depositForfeited": true,  // 보증금 몰수 여부
    "forfeitAmount": 300000
  }
}
```

**비즈니스 로직**:
1. 멤버 상태 → "left"
2. `status === "recruiting"`: 보증금 반환
3. `status === "ongoing"`: 보증금 몰수 → 계 공동 금고
4. `currentMembers` 감소

---

## 5. 계 멤버 목록 조회

### `GET /api/gye/{gyeId}/members`

**권한**: 계 멤버만

**Response 200**:
```json
{
  "data": {
    "members": [
      {
        "id": "member-uuid",
        "gyeId": "gye-uuid",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "nickname": "김철수",
          "profileImage": "https://cdn.example.com/profile.jpg",
          "creditScore": 850
        },
        "role": "host",
        "status": "active",
        "orderNumber": 1,
        "paidRounds": 3,
        "totalPaid": 300000,
        "joinedAt": "2025-12-12T10:00:00Z"
      },
      {
        "id": "member-uuid-2",
        "gyeId": "gye-uuid",
        "userId": "user-uuid-2",
        "user": {
          "id": "user-uuid-2",
          "nickname": "이영희",
          "profileImage": "https://cdn.example.com/profile2.jpg",
          "creditScore": 720
        },
        "role": "member",
        "status": "active",
        "orderNumber": 2,
        "paidRounds": 2,
        "totalPaid": 200000,
        "joinedAt": "2025-12-12T11:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

# PART 2: Ledger (공개 장부) API

## 6. 공개 장부 타임라인 조회

### `GET /api/ledger/{gyeId}/timeline`

**권한**: 계 멤버만

**Query Parameters**:
```typescript
page?: number      // 기본 1
limit?: number     // 기본 20
startDate?: string // YYYY-MM-DD
endDate?: string   // YYYY-MM-DD
```

**Response 200**:
```json
{
  "data": {
    "timeline": [
      {
        "id": "ledger-entry-uuid",
        "gyeId": "gye-uuid",
        "type": "payment",  // "payment" | "payout" | "deposit_lock" | "deposit_unlock" | "penalty"
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "nickname": "김철수",
          "profileImage": "https://cdn.example.com/profile.jpg"
        },
        "amount": 100000,
        "balance": 500000,  // 거래 후 계 잔액
        "round": 3,
        "description": "3회차 납부",
        "createdAt": "2025-03-01T09:00:00Z"
      },
      {
        "id": "ledger-entry-uuid-2",
        "gyeId": "gye-uuid",
        "type": "payout",
        "userId": "user-uuid-2",
        "user": {
          "id": "user-uuid-2",
          "nickname": "이영희",
          "profileImage": "https://cdn.example.com/profile2.jpg"
        },
        "amount": 1000000,
        "balance": 0,
        "round": 3,
        "description": "3회차 수령 (순번 2번)",
        "createdAt": "2025-03-05T14:00:00Z"
      }
    ],
    "total": 48,
    "currentPage": 1,
    "totalPages": 3
  }
}
```

**구현 힌트**:
- `ledger_entries` 테이블에 모든 거래 기록
- 정렬: `createdAt DESC`
- 잔액 계산: 이전 거래부터 누적 합산 (또는 비정규화로 저장)

---

## 7. 공개 장부 요약 조회

### `GET /api/ledger/{gyeId}/summary`

**권한**: 계 멤버만

**Response 200**:
```json
{
  "data": {
    "summary": {
      "gyeId": "gye-uuid",
      "currentRound": 3,
      "totalRounds": 10,
      "totalCollected": 3000000,  // 총 모금액
      "totalPaidOut": 2000000,    // 총 지급액
      "currentBalance": 1000000,  // 현재 잔액
      "nextPaymentDate": "2025-04-01",
      "nextPayoutMember": {
        "id": "user-uuid-3",
        "nickname": "박민수",
        "orderNumber": 3
      },
      "paymentStats": {
        "onTime": 25,      // 제때 납부 횟수
        "late": 3,         // 지연 납부
        "missed": 2        // 미납
      },
      "updatedAt": "2025-03-15T10:00:00Z"
    }
  }
}
```

---

# PART 3: SNS 기능 API

## 8. 계 피드 조회 (무한 스크롤)

### `GET /api/gye/{gyeId}/posts`

**권한**: 계 멤버만

**Query Parameters**:
```typescript
cursor?: string           // 다음 페이지 커서
limit?: number            // 기본 20
sortBy?: "latest" | "popular"  // 기본 latest
```

**Response 200**:
```json
{
  "data": {
    "posts": [
      {
        "id": "post-uuid",
        "gyeId": "gye-uuid",
        "authorId": "user-uuid",
        "author": {
          "id": "user-uuid",
          "nickname": "홍길동",
          "profileImage": "https://cdn.example.com/profile.jpg",
          "creditScore": 850
        },
        "type": "normal",  // "normal" | "quote"
        "content": "오늘 첫 납부 완료했습니다!",
        "media": [
          {
            "id": "media-uuid",
            "type": "image",  // "image" | "video"
            "url": "https://cdn.example.com/uploads/image.jpg",
            "thumbnailUrl": "https://cdn.example.com/uploads/thumb.jpg",
            "width": 1920,
            "height": 1080,
            "size": 2048576,
            "order": 0
          }
        ],
        "quotedPostId": null,
        "quotedPost": null,
        "likeCount": 15,
        "commentCount": 3,
        "isLiked": false,
        "createdAt": "2025-12-12T10:30:00Z",
        "updatedAt": "2025-12-12T10:30:00Z"
      }
    ],
    "total": 120,
    "hasMore": true,
    "nextCursor": "base64-encoded-cursor"
  }
}
```

**커서 구현**:
```sql
-- createdAt 기준
WHERE created_at < :cursor_created_at
ORDER BY created_at DESC
LIMIT :limit + 1

-- hasMore 판단: 결과가 limit+1개면 true
-- nextCursor: 마지막 아이템의 createdAt를 base64 인코딩
```

---

## 9. 포스트 상세 조회

### `GET /api/posts/{postId}`

**권한**: 계 멤버만

**Response 200**: Post 객체 (8번과 동일)

---

## 10. 포스트 생성

### `POST /api/gye/{gyeId}/posts`

**권한**: 계 멤버만

**Request Body**:
```json
{
  "content": "포스트 내용 (필수, 1~2000자)",
  "mediaIds": ["media-uuid-1", "media-uuid-2"],  // 선택, 최대 10개
  "quotedPostId": "post-uuid"  // 선택, 인용 포스트
}
```

**Response 201**: Post 객체

**비즈니스 로직**:
1. `mediaIds` 검증 (업로드한 사용자 == 요청자)
2. 미디어를 post에 연결 (`post_media.post_id` 업데이트)
3. 인용 포스트는 같은 계 내에서만

---

## 11. 포스트 수정

### `PUT /api/posts/{postId}`

**권한**: 작성자만

**Request Body**:
```json
{
  "content": "수정된 내용"
}
```

**Response 200**: Post 객체

**Note**: 미디어는 수정 불가

---

## 12. 포스트 삭제

### `DELETE /api/posts/{postId}`

**권한**: 작성자 또는 계주

**Response 204**: No Content

**Note**: 댓글도 soft delete

---

## 13. 포스트 좋아요

### `POST /api/posts/{postId}/like`

**권한**: 계 멤버만

**Response 200**:
```json
{
  "data": {
    "isLiked": true,
    "likeCount": 16
  }
}
```

**Note**: 중복 호출 시 멱등성 보장 (200 OK)

---

## 14. 포스트 좋아요 취소

### `DELETE /api/posts/{postId}/like`

**권한**: 계 멤버만

**Response 200**:
```json
{
  "data": {
    "isLiked": false,
    "likeCount": 15
  }
}
```

---

## 15. 댓글 목록 조회

### `GET /api/posts/{postId}/comments`

**권한**: 계 멤버만

**Query Parameters**:
```typescript
cursor?: string
limit?: number  // 기본 50
parentCommentId?: string  // 특정 댓글의 대댓글만
```

**Response 200**:
```json
{
  "data": {
    "comments": [
      {
        "id": "comment-uuid",
        "postId": "post-uuid",
        "authorId": "user-uuid",
        "author": {
          "id": "user-uuid",
          "nickname": "김철수",
          "profileImage": "https://cdn.example.com/profile.jpg",
          "creditScore": 780
        },
        "content": "축하합니다!",
        "parentCommentId": null,
        "replyCount": 2,
        "likeCount": 5,
        "isLiked": true,
        "createdAt": "2025-12-12T10:35:00Z",
        "updatedAt": "2025-12-12T10:35:00Z"
      }
    ],
    "total": 25,
    "hasMore": false,
    "nextCursor": null
  }
}
```

---

## 16. 대댓글 목록 조회

### `GET /api/comments/{commentId}/replies`

**권한**: 계 멤버만

**Query Parameters**: cursor, limit (동일)

**Response 200**: 15번과 동일 구조

---

## 17. 댓글 생성

### `POST /api/posts/{postId}/comments`

**권한**: 계 멤버만

**Request Body**:
```json
{
  "content": "댓글 내용 (필수, 1~500자)",
  "parentCommentId": "comment-uuid"  // 선택, 대댓글
}
```

**Response 201**: Comment 객체

**비즈니스 로직**:
1. 포스트의 `commentCount` 증가
2. 대댓글이면 부모 댓글의 `replyCount` 증가

---

## 18. 댓글 수정

### `PUT /api/comments/{commentId}`

**권한**: 작성자만

**Request Body**:
```json
{
  "content": "수정된 댓글"
}
```

**Response 200**: Comment 객체

---

## 19. 댓글 삭제

### `DELETE /api/comments/{commentId}`

**권한**: 작성자 또는 계주

**Response 204**: No Content

**비즈니스 로직**:
1. 포스트의 `commentCount` 감소
2. 대댓글 있으면 soft delete ("삭제된 댓글입니다" 표시)
3. 대댓글 없으면 완전 삭제

---

## 20. 댓글 좋아요

### `POST /api/comments/{commentId}/like`

**Response 200**:
```json
{
  "data": {
    "isLiked": true,
    "likeCount": 6
  }
}
```

---

## 21. 댓글 좋아요 취소

### `DELETE /api/comments/{commentId}/like`

**Response 200**: 20번과 동일

---

## 22. 미디어 업로드

### `POST /api/gye/{gyeId}/media`

**권한**: 계 멤버만

**Request**: `multipart/form-data`
```
Content-Type: multipart/form-data
file: (binary)
```

**Validation**:
- 최대 10MB
- 이미지: jpeg, png, gif, webp
- 동영상: mp4, webm

**Response 201**:
```json
{
  "data": {
    "id": "media-uuid",
    "type": "image",
    "url": "https://cdn.example.com/uploads/{gyeId}/image.jpg",
    "thumbnailUrl": "https://cdn.example.com/uploads/{gyeId}/thumb.jpg",
    "width": 1920,
    "height": 1080,
    "size": 2048576
  }
}
```

**구현 힌트**:
1. S3 업로드 (`gye/{gyeId}/media/{uuid}.{ext}`)
2. 동영상이면 썸네일 생성 (FFmpeg)
3. DB에 임시 저장 (post_id NULL)
4. 24시간 내 포스트 미연결 시 cronjob으로 삭제

---

## 23. 미디어 삭제

### `DELETE /api/media/{mediaId}`

**권한**: 업로드한 사용자만

**Response 204**: No Content

---

## 24. 공지사항 목록 조회

### `GET /api/gye/{gyeId}/announcements`

**권한**: 계 멤버만

**Query Parameters**:
```typescript
page?: number   // 기본 1
limit?: number  // 기본 10
```

**Response 200**:
```json
{
  "data": {
    "announcements": [
      {
        "id": "announcement-uuid",
        "gyeId": "gye-uuid",
        "authorId": "host-uuid",
        "author": {
          "id": "host-uuid",
          "nickname": "계주",
          "profileImage": "https://cdn.example.com/host.jpg"
        },
        "title": "첫 회차 납부 안내",
        "content": "12월 15일까지 납부 부탁드립니다.",
        "priority": "important",  // "normal" | "important" | "urgent"
        "isPinned": true,
        "viewCount": 45,
        "isRead": false,
        "createdAt": "2025-12-01T09:00:00Z",
        "updatedAt": "2025-12-01T09:00:00Z"
      }
    ],
    "total": 8
  }
}
```

**정렬**: `isPinned DESC, priority DESC, createdAt DESC`

---

## 25. 공지사항 상세 조회

### `GET /api/announcements/{announcementId}`

**권한**: 계 멤버만

**Response 200**: Announcement 객체

**Note**: 조회 시 자동으로 `viewCount++`, `isRead=true`

---

## 26. 공지사항 생성

### `POST /api/gye/{gyeId}/announcements`

**권한**: 계주만

**Request Body**:
```json
{
  "title": "공지 제목 (필수, 1~100자)",
  "content": "공지 내용 (필수, 1~5000자)",
  "priority": "important",
  "isPinned": true
}
```

**Response 201**: Announcement 객체

---

## 27. 공지사항 수정

### `PUT /api/announcements/{announcementId}`

**권한**: 계주만

**Request Body**: 26번과 동일 (모두 선택)

**Response 200**: Announcement 객체

---

## 28. 공지사항 삭제

### `DELETE /api/announcements/{announcementId}`

**권한**: 계주만

**Response 204**: No Content

---

## 29. 공지사항 읽음 처리

### `POST /api/announcements/{announcementId}/read`

**권한**: 계 멤버만

**Response 200**:
```json
{
  "data": {
    "isRead": true,
    "viewCount": 46
  }
}
```

**Note**: `announcement_reads` 테이블 (UNIQUE 제약)

---

# 📊 DB 스키마 전체

## 핵심 미션: 재정 프로필 관련 🌟

### user_financial_profiles
```sql
CREATE TABLE user_financial_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  monthly_income BIGINT NOT NULL,           -- 월 수입
  monthly_expense BIGINT NOT NULL,          -- 월 지출
  savings_capacity BIGINT NOT NULL,         -- 월 저축 가능액
  expense_categories JSONB,                 -- {"food": 30, "transport": 15, ...}
  desired_contribution BIGINT,              -- 희망 월 납입금
  risk_tolerance VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX idx_user (user_id)
);
```

### user_trust_scores
```sql
CREATE TABLE user_trust_scores (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  financial_health_score DECIMAL(5,2) DEFAULT 0,  -- 재정 건전성 (0-100)
  completion_rate DECIMAL(5,2) DEFAULT 0,         -- 계모임 완주율 (0-100)
  vote_participation DECIMAL(5,2) DEFAULT 0,      -- 투표 참여율 (0-100)
  community_activity DECIMAL(5,2) DEFAULT 0,      -- 커뮤니티 활동 (0-100)
  total_trust_score DECIMAL(5,2) DEFAULT 0,       -- 종합 신뢰 점수 (0-100)
  calculated_at TIMESTAMP NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_total_score (total_trust_score DESC)
);
```

### financial_analysis_logs (선택사항 - 디버깅용)
```sql
CREATE TABLE financial_analysis_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  request_payload JSONB NOT NULL,           -- Django로 보낸 요청
  response_payload JSONB NOT NULL,          -- Django에서 받은 응답
  analysis_type VARCHAR(30) NOT NULL,       -- 'financial_profile', 'gye_recommendation', 'monthly_stats'
  created_at TIMESTAMP NOT NULL,
  INDEX idx_user_created (user_id, created_at DESC)
);
```

---

## Gye 관련

### gyes (기존 테이블 가정)
```sql
CREATE TABLE gyes (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- 'savings', 'distribution'
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting', -- 'recruiting', 'ongoing', 'completed', 'cancelled'
  host_id UUID NOT NULL REFERENCES users(id),
  monthly_amount BIGINT NOT NULL,
  target_amount BIGINT NOT NULL,
  current_amount BIGINT NOT NULL DEFAULT 0,
  max_members INT NOT NULL,
  current_members INT NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  current_round INT NOT NULL DEFAULT 0,
  total_rounds INT NOT NULL,
  rules JSONB, -- ["규칙1", "규칙2"]
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX idx_status (status),
  INDEX idx_host (host_id)
);
```

### gye_members
```sql
CREATE TABLE gye_members (
  id UUID PRIMARY KEY,
  gye_id UUID NOT NULL REFERENCES gyes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(10) NOT NULL DEFAULT 'member', -- 'host', 'member'
  status VARCHAR(10) NOT NULL DEFAULT 'active', -- 'active', 'pending', 'left', 'kicked'
  order_number INT NOT NULL,
  paid_rounds INT NOT NULL DEFAULT 0,
  total_paid BIGINT NOT NULL DEFAULT 0,
  joined_at TIMESTAMP NOT NULL,
  left_at TIMESTAMP,
  UNIQUE (gye_id, user_id),
  INDEX idx_gye (gye_id),
  INDEX idx_user (user_id)
);
```

## Ledger 관련

### ledger_entries
```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  gye_id UUID NOT NULL REFERENCES gyes(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- 'payment', 'payout', 'deposit_lock', 'deposit_unlock', 'penalty'
  amount BIGINT NOT NULL,
  balance BIGINT NOT NULL, -- 거래 후 계 잔액
  round INT,
  description TEXT,
  created_at TIMESTAMP NOT NULL,
  INDEX idx_gye_created (gye_id, created_at DESC)
);
```

## SNS 관련

### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  gye_id UUID NOT NULL REFERENCES gyes(id),
  author_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(10) NOT NULL DEFAULT 'normal',
  content TEXT NOT NULL,
  quoted_post_id UUID REFERENCES posts(id),
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  INDEX idx_gye_created (gye_id, created_at DESC),
  INDEX idx_author (author_id)
);
```

### post_media
```sql
CREATE TABLE post_media (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  width INT,
  height INT,
  size BIGINT NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  INDEX idx_post (post_id, display_order)
);
```

### post_likes
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL,
  UNIQUE (user_id, post_id),
  INDEX idx_post (post_id)
);
```

### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  parent_comment_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  reply_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP,
  INDEX idx_post_created (post_id, created_at DESC),
  INDEX idx_parent (parent_comment_id)
);
```

### comment_likes
```sql
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL,
  UNIQUE (user_id, comment_id),
  INDEX idx_comment (comment_id)
);
```

### announcements
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY,
  gye_id UUID NOT NULL REFERENCES gyes(id),
  author_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX idx_gye_priority (gye_id, is_pinned DESC, priority DESC, created_at DESC)
);
```

### announcement_reads
```sql
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMP NOT NULL,
  UNIQUE (announcement_id, user_id),
  INDEX idx_user (user_id)
);
```

---

# 🔒 보안 체크리스트

## 권한 검증
- [ ] 계 멤버십 확인 (JOIN gye_members WHERE gye_id AND user_id)
- [ ] 계주 권한 확인 (gyes.host_id = user_id)
- [ ] 포스트/댓글 작성자 확인 (author_id = user_id)

## 입력 검증
- [ ] XSS 방지 (HTML escape)
- [ ] SQL Injection 방지 (Prepared Statement)
- [ ] 파일 업로드 검증 (MIME, 크기, 확장자)
- [ ] Rate Limiting
  - 포스트 생성: 10/분
  - 댓글 생성: 30/분
  - 미디어 업로드: 20/시간

## 성능
- [ ] DB 인덱스 적용 (위 스키마 참고)
- [ ] N+1 쿼리 방지 (author JOIN)
- [ ] 카운트 비정규화 (likeCount, commentCount)
- [ ] 무한 스크롤 커서 최적화

---

# 🚀 구현 우선순위

## Phase 0 (핵심 미션 - 최우선) 🌟
> **"고객 수입·지출 데이터 분석 기반"** - 이것이 프로젝트의 핵심 미션입니다.

1. **재정 프로필 등록/조회 API** (Spring Boot)
2. **Django 재정 분석 엔드포인트** (필수)
3. **신뢰 점수 계산 로직**
4. **계모임 추천 API** (Elasticsearch 연동)

## Phase 1 (MVP - 1주)
5. 계 생성/가입/멤버 조회 (필수)
6. 포스트 생성/조회 (SNS 기본)
7. 댓글 생성/조회
8. 미디어 업로드

## Phase 2 (Core - 1주)
9. 계 수정/탈퇴
10. 공개 장부 타임라인/요약
11. 포스트 좋아요/댓글 좋아요
12. 공지사항 CRUD

## Phase 3 (Advanced - 선택)
13. 대댓글 기능
14. 인용 포스트
15. 공지사항 읽음 추적

---

# 📦 프론트엔드 준비 상태

✅ **Phase 3 (Gye 관리)**
- useCreateGye(), useUpdateGye(), useJoinGye(), useLeaveGye(), useGyeMembers() hooks 선언 완료
- API 함수 placeholder 준비됨

✅ **Phase 3 (Ledger)**
- useLedgerTimeline(), useLedgerSummary() hooks 선언 완료
- API 함수 placeholder 준비됨

✅ **Phase 5A (SNS)**
- 타입, API 함수, hooks, stores 완전 구현
- 무한 스크롤, 낙관적 업데이트 로직 완성

**백엔드 API 구현만 완료되면 즉시 연동 가능!**

---

**작성일**: 2025-12-12
**프론트엔드**: Claude Sonnet 4.5
**백엔드 대상**: Spring Boot 개발자
**총 API 개수**: 29개 엔드포인트
