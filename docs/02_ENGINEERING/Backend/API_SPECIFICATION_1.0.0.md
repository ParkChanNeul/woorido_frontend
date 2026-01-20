WOORIDO API 명세서 v1.0.0
작성일      2026-01-15
버전        1.0.0
총 API      92개 (Spring 83 + Django 9)
기준 문서   API_SCHEMA_1.0.0.md, POLICY_DEFINITION.md, DB_Schema_1.0.0.md

---

> **📁 도메인별 분리 파일 안내**
>
> 이 문서는 도메인별로 분리되어 `API/` 폴더에서 개별 조회 가능합니다:
> - [00_API_OVERVIEW.md](./API/00_API_OVERVIEW.md) - 공통 사항
> - [01_API_AUTH.md](./API/01_API_AUTH.md) - 인증 (8개)
> - [02_API_USER.md](./API/02_API_USER.md) - 사용자 (6개)
> - [03_API_ACCOUNT.md](./API/03_API_ACCOUNT.md) - 어카운트 (7개)
> - [04_API_CHALLENGE.md](./API/04_API_CHALLENGE.md) - 챌린지/멤버 (13개)
> - [05_API_MEETING.md](./API/05_API_MEETING.md) - 모임 (6개)
> - [06_API_VOTE.md](./API/06_API_VOTE.md) - 투표 (5개)
> - [07_API_SNS.md](./API/07_API_SNS.md) - 게시글/댓글/지출/장부 (17개)
> - [08_API_SYSTEM.md](./API/08_API_SYSTEM.md) - 신고/알림/환불/정산 (12개)
> - [10_API_DJANGO.md](./API/10_API_DJANGO.md) - 검색/분석/추천 (9개)

---

### 1. 공통 사항
## 1.1 기본 정보
Base URL        https://api.woorido.com/api/v1
Content-Type    application/json
Encoding        UTF-8

## 1.2 인증 헤더
헤더              필수    값                        설명
───────────────   ─────   ───────────────────────   ─────────────────
Authorization     Y       Bearer {accessToken}      액세스 토큰
Content-Type      Y       application/json          요청 본문 타입
X-Device-Id       N       {deviceId}                기기 고유 ID
X-App-Version     N       1.0.0                     앱 버전
X-Platform        N       IOS | ANDROID | WEB       플랫폼

## 1.3 공통 응답 형식
성공 응답

Copy{
  "success": true,
  "data": { },
  "message": "요청이 성공했습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}
에러 응답

Copy{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 1.4 페이지네이션
요청

page      Integer     0        페이지 번호 (0부터 시작)
size      Integer     20       페이지 크기 (최대 100)
sort      String      -        정렬 (예: createdAt,desc)
응답

Copy{
  "content": [ ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}

## 1.5 HTTP 상태 코드
코드    설명                  사용 상황
─────   ──────────────────    ─────────────────────────
200     OK                    조회/수정 성공
201     Created               생성 성공
204     No Content            삭제 성공 (응답 본문 없음)
400     Bad Request           유효성 검증 실패
401     Unauthorized          인증 필요/실패
403     Forbidden             권한 없음
404     Not Found             리소스 없음
409     Conflict              중복/충돌
500     Internal Server Error 서버 오류

### 2. AUTH (8개)
## 001 POST /auth/signup
회원가입
기본 정보
우선순위    P0
인증        불필요

Request Body

필드              타입      필수    제약조건                      설명
───────────────   ───────   ─────   ────────────────────────────  ─────────────────
email             String    Y       이메일 형식                   이메일 주소
password          String    Y       8-20자, 영문+숫자+특수문자    비밀번호
passwordConfirm   String    Y       password와 일치               비밀번호 확인
nickname          String    Y       2-20자                        닉네임
phone             String    Y       010-XXXX-XXXX                 휴대폰 번호
birthDate         String    Y       YYYY-MM-DD                    생년월일
agreedTerms       Boolean   Y       true                          이용약관 동의
agreedPrivacy     Boolean   Y       true                          개인정보 동의
agreedMarketing   Boolean   N       -                             마케팅 동의

Request 예시

Copy{
  "email": "user@example.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!",
  "nickname": "홍길동",
  "phone": "010-1234-5678",
  "birthDate": "1990-01-15",
  "agreedTerms": true,
  "agreedPrivacy": true,
  "agreedMarketing": false
}

Response 201 Created

필드              타입      설명
───────────────   ───────   ─────────────────
data.userId       Long      사용자 ID
data.email        String    이메일
data.nickname     String    닉네임
data.createdAt    String    생성일시 (ISO 8601)

Copy{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "회원가입이 완료되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ───────────────────────────────────────────
400     VALIDATION_001   비밀번호는 8-20자, 영문+숫자+특수문자 포함
409     USER_002         이미 존재하는 이메일입니다

## 002 POST /auth/login
로그인
기본 정보
우선순위    P0
인증        불필요

Request Body

필드       타입      필수    설명
────────   ───────   ─────   ─────────────────
email      String    Y       이메일 주소
password   String    Y       비밀번호

Request 예시

Copy{
  "email": "user@example.com",
  "password": "Password123!"
}

Response 200 OK

필드                   타입      설명
────────────────────   ───────   ─────────────────────────
data.accessToken       String    액세스 토큰 (1시간 유효)
data.refreshToken      String    리프레시 토큰 (14일 유효)
data.tokenType         String    토큰 타입 (Bearer)
data.expiresIn         Integer   만료 시간 (초)
data.user.userId       Long      사용자 ID
data.user.email        String    이메일
data.user.nickname     String    닉네임
data.user.profileImage String    프로필 이미지 URL
data.user.status       String    상태 (ACTIVE/SUSPENDED/WITHDRAWN)
data.user.isNewUser    Boolean   7일 이내 가입 여부

Copy{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "userId": 1,
      "email": "user@example.com",
      "nickname": "홍길동",
      "profileImage": "https://cdn.woorido.com/profiles/1.jpg",
      "status": "ACTIVE",
      "isNewUser": false
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────────────────────────
401     AUTH_001    이메일 또는 비밀번호가 일치하지 않습니다
403     USER_005    탈퇴 대기 상태입니다

## 003 POST /auth/logout
로그아웃
기본 정보
우선순위    P0
인증        필요

Request Body

필드           타입      필수    설명
────────────   ───────   ─────   ─────────────────
refreshToken   String    Y       리프레시 토큰

Request 예시

Copy{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "loggedOut": true
  },
  "message": "로그아웃되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────
401     AUTH_001    인증이 필요합니다

## 004 POST /auth/refresh
토큰 갱신
기본 정보
우선순위    P0
인증        불필요

Request Body

필드           타입      필수    설명
────────────   ───────   ─────   ─────────────────
refreshToken   String    Y       리프레시 토큰

Request 예시

Copy{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ──────────────────────────────
401     AUTH_004    리프레시 토큰이 만료되었습니다

## 005 POST /auth/email/verify
인증 코드 발송
기본 정보
우선순위    P1
인증        불필요

Request Body

필드    타입      필수    제약조건                    설명
──────  ───────   ─────   ─────────────────────────   ─────────────────
email   String    Y       이메일 형식                 이메일 주소
type    String    Y       SIGNUP | PASSWORD_RESET     발송 목적

Request 예시

Copy{
  "email": "user@example.com",
  "type": "SIGNUP"
}

Response 200 OK

필드             타입      설명
──────────────   ───────   ─────────────────────────
data.email       String    이메일
data.expiresIn   Integer   인증 코드 유효 시간 (초, 5분)
data.retryAfter  Integer   재발송 가능 시간 (초, 1분)

Copy{
  "success": true,
  "data": {
    "email": "user@example.com",
    "expiresIn": 300,
    "retryAfter": 60
  },
  "message": "인증 코드가 발송되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ──────────────────────────
400     AUTH_007    잠시 후 다시 시도해주세요
409     USER_002    이미 존재하는 이메일입니다

## 006 POST /auth/email/confirm
인증 코드 확인
기본 정보
우선순위    P1
인증        불필요

Request Body

필드    타입      필수    제약조건       설명
──────  ───────   ─────   ────────────   ─────────────────
email   String    Y       이메일 형식    이메일 주소
code    String    Y       6자리 숫자     인증 코드

Request 예시

Copy{
  "email": "user@example.com",
  "code": "123456"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "email": "user@example.com",
    "verified": true,
    "verificationToken": "temp_token_for_signup_or_reset"
  },
  "message": "이메일이 인증되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────────────────
400     AUTH_006    인증 코드가 일치하지 않습니다
400     AUTH_008    인증 코드가 만료되었습니다

## 007 POST /auth/password/reset
비밀번호 재설정 요청
기본 정보
우선순위    P0
인증        불필요

Request Body

필드    타입      필수    설명
──────  ───────   ─────   ─────────────────
email   String    Y       가입된 이메일
Request 예시

Copy{
  "email": "user@example.com"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "email": "user@example.com",
    "expiresIn": 1800
  },
  "message": "비밀번호 재설정 링크가 발송되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────────────
404     USER_001    사용자를 찾을 수 없습니다

## 008 PUT /auth/password/reset
비밀번호 재설정 실행
기본 정보
우선순위    P1
인증        불필요

Request Body

필드                타입      필수    제약조건                      설명
──────────────────  ───────   ─────   ────────────────────────────  ─────────────
token               String    Y       -                             재설정 토큰
newPassword         String    Y       8-20자, 영문+숫자+특수문자    새 비밀번호
newPasswordConfirm  String    Y       newPassword와 일치            새 비밀번호 확인

Request 예시

Copy{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123!",
  "newPasswordConfirm": "NewPassword123!"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "passwordReset": true
  },
  "message": "비밀번호가 재설정되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ─────────────────────────────────
400     AUTH_009         재설정 토큰이 만료되었습니다
400     VALIDATION_001   비밀번호 형식이 올바르지 않습니다

### 3. USER (6개)
## 009 GET /users/me
내 정보 조회
기본 정보
우선순위    P0
인증        필요

Response 200 OK

필드                         타입      설명
───────────────────────────  ───────   ─────────────────────────
data.userId                  Long      사용자 ID
data.email                   String    이메일
data.nickname                String    닉네임
data.phone                   String    휴대폰 번호
data.birthDate               String    생년월일
data.profileImage            String    프로필 이미지 URL
data.status                  String    상태 (UserStatus)
data.brix                    Double    당도 점수 (0-100)
data.account.accountId       Long      어카운트 ID
data.account.balance         Long      총 잔액
data.account.availableBalance Long     사용 가능 잔액
data.account.lockedBalance   Long      보증금 잠금 금액
data.stats.challengeCount    Integer   참여 챌린지 수
data.stats.completedChallenges Integer 완주 챌린지 수
data.stats.totalSupportAmount Long     총 서포트 금액
data.createdAt               String    가입일
data.updatedAt               String    수정일

Copy{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "phone": "010-1234-5678",
    "birthDate": "1990-01-15",
    "profileImage": "https://cdn.woorido.com/profiles/1.jpg",
    "status": "ACTIVE",
    "brix": 85.5,
    "account": {
      "accountId": 1,
      "balance": 500000,
      "availableBalance": 450000,
      "lockedBalance": 50000
    },
    "stats": {
      "challengeCount": 3,
      "completedChallenges": 2,
      "totalSupportAmount": 1500000
    },
    "createdAt": "2025-06-01T10:00:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────
401     AUTH_001    인증이 필요합니다

## 010 PUT /users/me
내 정보 수정
기본 정보
우선순위    P0
인증        필요

Request Body

필드           타입      필수    제약조건       설명
────────────   ───────   ─────   ────────────   ─────────────────
nickname       String    N       2-20자         닉네임
phone          String    N       010-XXXX-XXXX  휴대폰 번호
profileImage   String    N       URL 형식       프로필 이미지 URL

Request 예시

Copy{
  "nickname": "새닉네임",
  "profileImage": "https://cdn.woorido.com/profiles/new.jpg"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "userId": 1,
    "nickname": "새닉네임",
    "phone": "010-1234-5678",
    "profileImage": "https://cdn.woorido.com/profiles/new.jpg",
    "updatedAt": "2026-01-14T10:30:00Z"
  },
  "message": "정보가 수정되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ───────────────────────────
400     USER_006    닉네임은 2-20자여야 합니다
409     USER_007    이미 사용 중인 닉네임입니다

## 011 PUT /users/me/password
비밀번호 변경
기본 정보
우선순위    P1
인증        필요

Request Body

필드                타입      필수    제약조건                      설명
──────────────────  ───────   ─────   ────────────────────────────  ───────────────
currentPassword     String    Y       -                             현재 비밀번호
newPassword         String    Y       8-20자, 영문+숫자+특수문자    새 비밀번호
newPasswordConfirm  String    Y       newPassword와 일치            새 비밀번호 확인

Request 예시

Copy{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!",
  "newPasswordConfirm": "NewPassword456!"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "passwordChanged": true
  },
  "message": "비밀번호가 변경되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ─────────────────────────────────────
400     USER_003         현재 비밀번호가 일치하지 않습니다
400     VALIDATION_001   비밀번호 형식이 올바르지 않습니다

## 012 DELETE /users/me
회원 탈퇴
기본 정보
우선순위    P1
인증        필요

Request Body

필드       타입      필수    설명
────────   ───────   ─────   ─────────────────
password   String    Y       비밀번호 확인
reason     String    N       탈퇴 사유

Request 예시

Copy{
  "password": "Password123!",
  "reason": "서비스 이용을 더 이상 하지 않습니다"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "userId": 1,
    "status": "WITHDRAWN",
    "withdrawnAt": "2026-01-14T10:30:00Z",
    "dataDeletedAt": "2026-02-14T10:30:00Z"
  },
  "message": "탈퇴 처리되었습니다. 30일 내 재가입 시 데이터가 복구됩니다.",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 규칙

- 활성 챌린지 참여 중인 경우 먼저 탈퇴 필요
- 미정산 크레딧이 있는 경우 출금 또는 환불 필요
- 30일간 Soft Delete 상태 유지 후 완전 삭제

Errors

HTTP    코드        메시지
─────   ─────────   ────────────────────────────────
400     USER_003    비밀번호가 일치하지 않습니다
400     USER_008    활성 챌린지에서 먼저 탈퇴해주세요
400     USER_009    미정산 크레딧이 있습니다

## 013 GET /users/{userId}
사용자 조회
기본 정보
우선순위    P1
인증        필요

Path Parameters

파라미터   타입    필수    설명
────────   ──────  ─────   ────────────
userId     Long    Y       사용자 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "userId": 2,
    "nickname": "김철수",
    "profileImage": "https://cdn.woorido.com/profiles/2.jpg",
    "brix": 78.5,
    "stats": {
      "completedChallenges": 5,
      "totalMeetings": 30
    },
    "commonChallenges": [
      {
        "challengeId": 1,
        "name": "책벌레들"
      }
    ],
    "isVerified": true,
    "createdAt": "2025-03-15T10:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────────────
404     USER_001    사용자를 찾을 수 없습니다

## 014 GET /users/check-nickname
닉네임 중복 체크
기본 정보
우선순위    P0
인증        불필요

Query Parameters

파라미터   타입      필수    제약조건    설명
────────   ───────   ─────   ─────────   ────────────────
nickname   String    Y       2-20자      확인할 닉네임

Response 200 OK (사용 가능)

Copy{
  "success": true,
  "data": {
    "nickname": "새닉네임",
    "available": true
  },
  "message": "사용 가능한 닉네임입니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Response 200 OK (사용 불가)

Copy{
  "success": true,
  "data": {
    "nickname": "홍길동",
    "available": false
  },
  "message": "이미 사용 중인 닉네임입니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ───────────────────────────
400     USER_006    닉네임은 2-20자여야 합니다

### 4. ACCOUNT (7개)
## 015 GET /accounts/me
내 어카운트 조회
기본 정보
우선순위    P0
인증        필요

Response 200 OK

필드                              타입      설명
────────────────────────────────  ───────   ──────────────────────────
data.accountId                    Long      어카운트 ID
data.userId                       Long      사용자 ID
data.balance                      Long      총 잔액
data.availableBalance             Long      출금 가능 잔액
data.lockedBalance                Long      보증금 잠금 금액
data.limits.dailyWithdrawLimit    Long      일일 출금 한도
data.limits.monthlyWithdrawLimit  Long      월간 출금 한도
data.limits.usedToday             Long      오늘 사용 금액
data.limits.usedThisMonth         Long      이번 달 사용 금액
data.linkedBankAccount            Object    연결된 은행 계좌 정보
data.createdAt                    String    생성일

Copy{
  "success": true,
  "data": {
    "accountId": 1,
    "userId": 1,
    "balance": 500000,
    "availableBalance": 450000,
    "lockedBalance": 50000,
    "limits": {
      "dailyWithdrawLimit": 1000000,
      "monthlyWithdrawLimit": 5000000,
      "usedToday": 100000,
      "usedThisMonth": 500000
    },
    "linkedBankAccount": {
      "bankCode": "088",
      "bankName": "신한은행",
      "accountNumber": "110-***-***789",
      "accountHolder": "홍길동",
      "isVerified": true
    },
    "createdAt": "2025-06-01T10:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────
401     AUTH_001    인증이 필요합니다

## 016 GET /accounts/me/transactions
거래 내역 조회
기본 정보
우선순위    P0
인증        필요

Query Parameters

파라미터    타입      필수    기본값    설명
──────────  ───────   ─────   ───────   ─────────────────────
type        String    N       -         TransactionType Enum
startDate   String    N       -         조회 시작일 (YYYY-MM-DD)
endDate     String    N       -         조회 종료일 (YYYY-MM-DD)
page        Integer   N       0         페이지 번호
size        Integer   N       20        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "transactionId": 1,
        "type": "CHARGE",
        "amount": 100000,
        "balance": 500000,
        "description": "크레딧 충전",
        "relatedChallenge": null,
        "createdAt": "2026-01-14T10:00:00Z"
      },
      {
        "transactionId": 2,
        "type": "SUPPORT",
        "amount": -100000,
        "balance": 400000,
        "description": "책벌레들 서포트 납입",
        "relatedChallenge": {
          "challengeId": 1,
          "name": "책벌레들"
        },
        "createdAt": "2026-01-14T11:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 2,
      "totalPages": 1
    },
    "summary": {
      "totalIncome": 100000,
      "totalExpense": 100000,
      "period": {
        "startDate": "2026-01-01",
        "endDate": "2026-01-14"
      }
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 017 POST /accounts/charge
크레딧 충전
기본 정보
우선순위    P0
인증        필요

Request Body

필드            타입      필수    제약조건                    설명
──────────────  ───────   ─────   ─────────────────────────   ──────────────────
amount          Long      Y       10,000원 이상, 10,000원 단위  충전 금액
paymentMethod   String    Y       CARD | BANK_TRANSFER        결제 수단
returnUrl       String    Y       URL 형식                    결제 완료 후 리턴 URL

Request 예시

Copy{
  "amount": 100000,
  "paymentMethod": "CARD",
  "returnUrl": "https://woorido.com/payment/complete"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "orderId": "ORD20260114103000001",
    "amount": 100000,
    "fee": 3000,
    "totalPaymentAmount": 103000,
    "paymentUrl": "https://pay.woorido.com/checkout/ORD20260114103000001",
    "expiresAt": "2026-01-14T10:45:00Z"
  },
  "message": "수수료 포함 103,000원 결제 페이지로 이동합니다",
  "timestamp": "2026-01-14T10:30:00Z"
}
```

### 수수료 정책 (P-011)
- 10,000 ~ 200,000원: 3% 부과
- 예: 100,000원 충전 시 103,000원 결제

Errors

HTTP    코드           메시지
─────   ────────────   ─────────────────────────────────────
400     ACCOUNT_002    충전 금액은 10,000원 이상이어야 합니다
400     ACCOUNT_007    충전 금액은 10,000원 단위여야 합니다
400     ACCOUNT_008    결제 수단은 CARD 또는 BANK_TRANSFER 만 가능합니다

## 018 POST /accounts/charge/callback
충전 콜백 (내부 API)
기본 정보
우선순위    P0
인증        불필요 (PG 서명 검증)

Request Body

필드          타입      필수    설명
────────────  ───────   ─────   ─────────────────
orderId       String    Y       주문 ID
paymentKey    String    Y       PG 결제 키
amount        Long      Y       결제 금액
status        String    Y       SUCCESS | FAILED

Response 200 OK

Copy{
  "success": true,
  "data": {
    "transactionId": 1,
    "orderId": "ORD20260114103000001",
    "amount": 100000,
    "newBalance": 600000,
    "completedAt": "2026-01-14T10:35:00Z"
  },
  "timestamp": "2026-01-14T10:35:00Z"
}

## 019 POST /accounts/withdraw
출금
기본 정보
우선순위    P0
인증        필요

Request Body

필드            타입      필수    제약조건                설명
──────────────  ───────   ─────   ────────────────────    ─────────────────
amount          Long      Y       1원 이상, 가용액 이하   출금 금액
bankCode        String    Y       3자리                   은행 코드
accountNumber   String    Y       -                       계좌 번호
accountHolder   String    Y       -                       예금주명

Request 예시

Copy{
  "amount": 100000,
  "bankCode": "088",
  "accountNumber": "110-123-456789",
  "accountHolder": "홍길동"
}

Response 200 OK

필드                     타입      설명
───────────────────────  ───────   ──────────────────────
data.withdrawId          Long      출금 ID
data.amount              Long      출금 금액
data.fee                 Long      수수료 (P-007 정책)
data.netAmount           Long      실 수령액
data.newBalance          Long      출금 후 잔액
data.bankInfo            Object    은행 정보
data.estimatedArrival    String    예상 입금 시간
data.createdAt           String    요청 시간

Copy{
  "success": true,
  "data": {
    "withdrawId": 1,
    "amount": 100000,
    "fee": 0,
    "netAmount": 100000,
    "newBalance": 400000,
    "bankInfo": {
      "bankCode": "088",
      "bankName": "신한은행",
      "accountNumber": "110-***-***789"
    },
    "estimatedArrival": "2026-01-14T12:00:00Z",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "출금이 요청되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

### 수수료 정보
- 출금 수수료 무료 (충전 시 부과됨)
Errors

HTTP    코드           메시지
─────   ────────────   ───────────────────────────────
400     ACCOUNT_003    출금 가능 금액을 초과했습니다
400     ACCOUNT_004    잔액이 부족합니다
400     ACCOUNT_005    일일 출금 한도를 초과했습니다
400     ACCOUNT_006    월간 출금 한도를 초과했습니다

## 020 POST /accounts/support
서포트 수동 납입
기본 정보
우선순위    P0
인증        필요

Request Body

필드          타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Request 예시

Copy{
  "challengeId": 1
}
Response 200 OK

Copy{
  "success": true,
  "data": {
    "transactionId": 1,
    "challengeId": 1,
    "challengeName": "책벌레들",
    "amount": 100000,
    "newBalance": 400000,
    "newChallengeBalance": 1100000,
    "isFirstSupport": false,
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "서포트가 납입되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────────────────
400     ACCOUNT_004      잔액이 부족합니다
400     SUPPORT_001      이미 이번 달 서포트를 납입했습니다
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 021 GET /accounts/fee-policy
수수료 정책 조회
기본 정보
우선순위    P2
인증        필요

Response 200 OK

Copy{
  "success": true,
  "data": {
    "withdrawFee": {
      "rate": 0,
      "minAmount": 0,
      "maxAmount": null
    },
    "chargeFee": {
      "tiers": [
        {
          "name": "소액",
          "minAmount": 0,
          "maxAmount": 9999,
          "rate": 1.0
        },
        {
          "name": "일반",
          "minAmount": 10000,
          "maxAmount": 200000,
          "rate": 3.0
        },
        {
          "name": "고액",
          "minAmount": 200001,
          "maxAmount": null,
          "rate": 1.5
        }
      ]
    },
    "updatedAt": "2026-01-01T00:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 5. CHALLENGE (8개)
## 022 POST /challenges
챌린지 생성
기본 정보
우선순위    P0
인증        필요

Request Body

필드             타입      필수    제약조건                          설명
───────────────  ───────   ─────   ──────────────────────────────    ─────────────────
name             String    Y       2-50자                            챌린지 이름
description      String    Y       최대 500자                        챌린지 설명
category         String    Y       ChallengeCategory Enum            카테고리
maxMembers       Integer   Y       3-30명                            최대 인원
supportAmount    Long      Y       10,000원 이상, 10,000원 단위      월 서포트 금액
depositAmount    Long      Y       서포트 금액의 1-3배               보증금
supportDay       Integer   Y       1-28                              월 납입일
startDate        String    Y       YYYY-MM-DD, 최소 7일 후           시작 예정일
thumbnailImage   String    N       URL 형식                          썸네일 이미지
rules            String    N       최대 1000자                       챌린지 규칙

ChallengeCategory Enum

STUDY       학습
FITNESS     운동
HOBBY       취미
FINANCE     재테크
LIFESTYLE   생활습관
OTHER       기타

Request 예시

Copy{
  "name": "책벌레들",
  "description": "매월 책 1권 완독하는 독서 모임입니다",
  "category": "HOBBY",
  "maxMembers": 10,
  "supportAmount": 100000,
  "depositAmount": 200000,
  "supportDay": 1,
  "startDate": "2026-02-01",
  "thumbnailImage": "https://cdn.woorido.com/challenges/book.jpg",
  "rules": "1. 매월 1권 이상 완독\n2. 독서 인증 필수"
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "name": "책벌레들",
    "status": "RECRUITING",
    "memberCount": {
      "current": 1,
      "max": 10
    },
    "myRole": "LEADER",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "챌린지가 생성되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 규칙

- 생성자는 자동으로 리더가 됨
- 리더당 최대 3개 챌린지 생성 가능

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────────
400     CHALLENGE_007    리더당 챌린지 생성 한도(3개)를 초과했습니다
400     VALIDATION_001   유효성 검증 실패

## 023 GET /challenges
챌린지 목록 조회
기본 정보
우선순위    P0
인증        필요

Query Parameters

파라미터   타입      필수    기본값           설명
─────────  ───────   ─────   ──────────────   ──────────────────────────
status     String    N       -                RECRUITING | ACTIVE | CLOSED
category   String    N       -                카테고리 필터
sort       String    N       createdAt,desc   정렬 기준
page       Integer   N       0                페이지 번호
size       Integer   N       20               페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "challengeId": 1,
        "name": "책벌레들",
        "description": "매월 책 1권 완독하는 독서 모임",
        "category": "HOBBY",
        "status": "RECRUITING",
        "memberCount": {
          "current": 8,
          "max": 10
        },
        "supportAmount": 100000,
        "thumbnailImage": "https://cdn.woorido.com/challenges/1.jpg",
        "isVerified": true,
        "leader": {
          "userId": 1,
          "nickname": "홍길동"
        },
        "createdAt": "2025-12-01T10:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 50,
      "totalPages": 3
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 024 GET /challenges/{challengeId}
챌린지 상세 조회

기본 정보

우선순위    P0
인증        필요

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "name": "책벌레들",
    "description": "매월 책 1권 완독하는 독서 모임입니다",
    "category": "HOBBY",
    "status": "ACTIVE",
    "memberCount": {
      "current": 10,
      "max": 10
    },
    "supportAmount": 100000,
    "depositAmount": 200000,
    "supportDay": 1,
    "thumbnailImage": "https://cdn.woorido.com/challenges/1.jpg",
    "rules": "1. 매월 1권 이상 완독\n2. 독서 인증 필수",
    "isVerified": true,
    "leader": {
      "userId": 1,
      "nickname": "홍길동",
      "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
    },
    "account": {
      "balance": 5000000,
      "totalSupport": 10000000,
      "totalExpense": 5000000
    },
    "stats": {
      "totalMeetings": 12,
      "completedMeetings": 10,
      "averageAttendance": 85.0
    },
    "isMember": true,
    "myMembership": {
      "memberId": 5,
      "role": "FOLLOWER",
      "status": "ACTIVE",
      "joinedAt": "2025-12-15T10:00:00Z"
    },
    "startedAt": "2026-01-01T00:00:00Z",
    "createdAt": "2025-12-01T10:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────────
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 025 PUT /challenges/{challengeId}
챌린지 수정 (리더만)
기본 정보
우선순위    P0
인증        필요 (리더)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Request Body

필드             타입      필수    제약조건          설명
───────────────  ───────   ─────   ────────────────  ────────────────────────────
name             String    N       2-50자            챌린지 이름
description      String    N       최대 500자        챌린지 설명
thumbnailImage   String    N       URL 형식          썸네일 이미지
rules            String    N       최대 1000자       챌린지 규칙
maxMembers       Integer   N       현재 인원 이상    최대 인원 (증가만 가능)
주의: supportAmount, depositAmount, supportDay는 활성화 후 변경 불가

Request 예시

Copy{
  "description": "매월 책 2권 완독하는 독서 모임입니다 (수정)",
  "maxMembers": 15
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "name": "책벌레들",
    "description": "매월 책 2권 완독하는 독서 모임입니다 (수정)",
    "maxMembers": 15,
    "updatedAt": "2026-01-14T10:30:00Z"
  },
  "message": "챌린지 정보가 수정되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_004    리더만 수정할 수 있습니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 026 DELETE /challenges/{challengeId}
챌린지 삭제 (모집 중 상태에서만)
기본 정보
우선순위    P1
인증        필요 (리더)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "deleted": true
  },
  "message": "챌린지가 삭제되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────
400     CHALLENGE_010    활성화된 챌린지는 삭제할 수 없습니다
403     CHALLENGE_004    리더만 삭제할 수 있습니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 027 GET /challenges/me
내 챌린지 목록
기본 정보
우선순위    P0
인증        필요

Query Parameters

파라미터   타입      필수    기본값    설명
─────────  ───────   ─────   ───────   ──────────────────
role       String    N       -         LEADER | FOLLOWER
status     String    N       -         ACTIVE | CLOSED

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challenges": [
      {
        "challengeId": 1,
        "name": "책벌레들",
        "status": "ACTIVE",
        "myRole": "FOLLOWER",
        "myStatus": "ACTIVE",
        "memberCount": {
          "current": 10,
          "max": 10
        },
        "supportAmount": 100000,
        "nextSupportDate": "2026-02-01",
        "thumbnailImage": "https://cdn.woorido.com/challenges/1.jpg",
        "upcomingMeeting": {
          "meetingId": 5,
          "title": "2월 정기모임",
          "scheduledAt": "2026-02-15T14:00:00Z"
        }
      }
    ],
    "summary": {
      "totalChallenges": 3,
      "asLeader": 1,
      "asFollower": 2,
      "monthlySupport": 300000
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 028 GET /challenges/{challengeId}/account
챌린지 어카운트 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "balance": 5000000,
    "lockedDeposits": 2000000,
    "availableBalance": 5000000,
    "stats": {
      "totalSupport": 10000000,
      "totalExpense": 5000000,
      "totalFee": 150000,
      "monthlyAverage": {
        "support": 1000000,
        "expense": 500000
      }
    },
    "recentTransactions": [
      {
        "transactionId": 100,
        "type": "SUPPORT",
        "amount": 100000,
        "description": "홍길동 서포트 납입",
        "createdAt": "2026-01-01T10:00:00Z"
      }
    ],
    "supportStatus": {
      "thisMonth": {
        "paid": 9,
        "unpaid": 1,
        "total": 10
      }
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 029 PUT /challenges/{challengeId}/support/settings
자동 납입 설정
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Request Body

필드             타입      필수    설명
───────────────  ───────   ─────   ──────────────────────
autoPayEnabled   Boolean   Y       자동 납입 활성화 여부

Request 예시

Copy{
  "autoPayEnabled": true
}
Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "autoPayEnabled": true,
    "nextPaymentDate": "2026-02-01",
    "amount": 100000
  },
  "message": "자동 납입이 설정되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

### 6. CHALLENGE MEMBER (5개)
## 030 POST /challenges/{challengeId}/join
챌린지 가입
기본 정보
우선순위    P0
인증        필요

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Response 201 Created

필드                       타입      설명
─────────────────────────  ───────   ──────────────────────────────
data.memberId              Long      멤버 ID
data.challengeId           Long      챌린지 ID
data.challengeName         String    챌린지 이름
data.role                  String    역할 (FOLLOWER)
data.status                String    상태 (ACTIVE)
data.breakdown.entryFee    Long      입회비 (잔액 / (멤버수-1))
data.breakdown.deposit     Long      보증금
data.breakdown.firstSupport Long     첫 서포트 (납입일 7일 전 이내 가입 시)
data.breakdown.total       Long      총 차감 금액
data.newBalance            Long      차감 후 잔액
data.joinedAt              String    가입일시

Copy{
  "success": true,
  "data": {
    "memberId": 10,
    "challengeId": 1,
    "challengeName": "책벌레들",
    "role": "FOLLOWER",
    "status": "ACTIVE",
    "breakdown": {
      "entryFee": 125000,
      "deposit": 200000,
      "firstSupport": 100000,
      "total": 425000
    },
    "newBalance": 75000,
    "joinedAt": "2026-01-14T10:30:00Z"
  },
  "message": "챌린지에 가입되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 규칙

입회비 계산    balance / (memberCount - 1)
첫 서포트      납입일 7일 전 이내 가입 시 첫 달 서포트 포함
당도 제한      당도(Brix)가 음수인 사용자는 가입 불가

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────────────
400     ACCOUNT_004      잔액이 부족합니다
400     CHALLENGE_002    이미 가입한 챌린지입니다
400     CHALLENGE_005    챌린지 정원이 초과되었습니다
400     CHALLENGE_006    모집 중인 챌린지가 아닙니다
400     USER_004         당도가 음수인 사용자는 가입할 수 없습니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 031 DELETE /challenges/{challengeId}/leave
챌린지 탈퇴
기본 정보
우선순위    P0
인증        필요

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Response 200 OK

필드                    타입      설명
──────────────────────  ───────   ─────────────────────
data.challengeId        Long      챌린지 ID
data.challengeName      String    챌린지 이름
data.refund.deposit     Long      원래 보증금
data.refund.deducted    Long      미납으로 차감된 금액
data.refund.netRefund   Long      실제 반환 금액
data.newBalance         Long      반환 후 잔액
data.leftAt             String    탈퇴일시

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "challengeName": "책벌레들",
    "refund": {
      "deposit": 200000,
      "deducted": 0,
      "netRefund": 200000
    },
    "newBalance": 700000,
    "leftAt": "2026-01-14T10:30:00Z"
  },
  "message": "챌린지에서 탈퇴했습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ─────────────────────────────────────
400     MEMBER_002       리더는 탈퇴할 수 없습니다 (위임 후 탈퇴)
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 032 GET /challenges/{challengeId}/members
멤버 목록 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Query Parameters

파라미터   타입      필수    기본값    설명
─────────  ───────   ─────   ───────   ──────────────────────────────
status     String    N       -         ACTIVE | OVERDUE | GRACE_PERIOD

Response 200 OK

Copy{
  "success": true,
  "data": {
    "members": [
      {
        "memberId": 1,
        "user": {
          "userId": 1,
          "nickname": "홍길동",
          "profileImage": "https://cdn.woorido.com/profiles/1.jpg",
          "brix": 85.5
        },
        "role": "LEADER",
        "status": "ACTIVE",
        "supportStatus": {
          "thisMonth": "PAID",
          "consecutivePaid": 12
        },
        "attendanceRate": 95.0,
        "joinedAt": "2025-12-01T10:00:00Z"
      },
      {
        "memberId": 2,
        "user": {
          "userId": 2,
          "nickname": "김철수",
          "profileImage": "https://cdn.woorido.com/profiles/2.jpg",
          "brix": 72.0
        },
        "role": "FOLLOWER",
        "status": "OVERDUE",
        "supportStatus": {
          "thisMonth": "UNPAID",
          "consecutivePaid": 0,
          "overdueCount": 2
        },
        "attendanceRate": 60.0,
        "joinedAt": "2025-12-15T10:00:00Z"
      }
    ],
    "summary": {
      "total": 10,
      "active": 8,
      "overdue": 1,
      "gracePeriod": 1
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 033 GET /challenges/{challengeId}/members/{memberId}
멤버 상세 조회
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID
memberId      Long    Y       멤버 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "memberId": 2,
    "user": {
      "userId": 2,
      "nickname": "김철수",
      "profileImage": "https://cdn.woorido.com/profiles/2.jpg",
      "brix": 72.0
    },
    "role": "FOLLOWER",
    "status": "ACTIVE",
    "stats": {
      "totalSupport": 1200000,
      "supportRate": 100.0,
      "attendanceRate": 85.0,
      "meetingsAttended": 10,
      "meetingsTotal": 12
    },
    "supportHistory": [
      {
        "month": "2026-01",
        "amount": 100000,
        "paidAt": "2026-01-01T10:00:00Z"
      }
    ],
    "joinedAt": "2025-12-15T10:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     MEMBER_001       멤버를 찾을 수 없습니다

## 034 POST /challenges/{challengeId}/delegate
리더 위임
기본 정보
우선순위    P1
인증        필요 (리더)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Request Body

필드             타입    필수    설명
───────────────  ──────  ─────   ──────────────────
targetMemberId   Long    Y       위임받을 멤버 ID

Request 예시

Copy{
  "targetMemberId": 5
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "previousLeader": {
      "memberId": 1,
      "userId": 1,
      "nickname": "홍길동",
      "newRole": "FOLLOWER"
    },
    "newLeader": {
      "memberId": 5,
      "userId": 5,
      "nickname": "이영희",
      "newRole": "LEADER"
    },
    "delegatedAt": "2026-01-14T10:30:00Z"
  },
  "message": "리더 권한이 위임되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────────────────
400     MEMBER_004       자신에게 위임할 수 없습니다
400     MEMBER_005       정지된 멤버에게 위임할 수 없습니다
403     CHALLENGE_004    리더만 위임할 수 있습니다
404     MEMBER_001       멤버를 찾을 수 없습니다

### 7. MEETING (6개)
## 035 GET /challenges/{challengeId}/meetings
모임 목록 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Query Parameters

파라미터   타입      필수    기본값    설명
─────────  ───────   ─────   ───────   ──────────────────
status     String    N       -         MeetingStatus Enum
page       Integer   N       0         페이지 번호
size       Integer   N       20        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "meetingId": 1,
        "title": "1월 정기모임",
        "description": "신년 계획 공유",
        "status": "COMPLETED",
        "scheduledAt": "2026-01-15T14:00:00Z",
        "location": "강남역 스타벅스",
        "attendance": {
          "confirmed": 8,
          "total": 10
        },
        "beneficiary": {
          "userId": 3,
          "nickname": "박영수"
        },
        "createdAt": "2026-01-01T10:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 12,
      "totalPages": 1
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 036 GET /meetings/{meetingId}
모임 상세 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터    타입    필수    설명
──────────  ──────  ─────   ────────────
meetingId   Long    Y       모임 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "meetingId": 1,
    "challengeId": 1,
    "title": "1월 정기모임",
    "description": "신년 계획 공유 및 독서 목표 설정",
    "status": "SCHEDULED",
    "scheduledAt": "2026-01-15T14:00:00Z",
    "location": "강남역 스타벅스",
    "locationDetail": "2층 세미나룸",
    "agenda": "1. 신년 인사\n2. 독서 목표 공유\n3. 다음 모임 일정",
    "attendance": {
      "confirmed": 8,
      "declined": 1,
      "pending": 1,
      "total": 10
    },
    "myAttendance": {
      "status": "CONFIRMED",
      "respondedAt": "2026-01-10T10:00:00Z"
    },
    "beneficiary": {
      "userId": 3,
      "nickname": "박영수",
      "order": 3
    },
    "benefitAmount": 500000,
    "createdBy": {
      "userId": 1,
      "nickname": "홍길동"
    },
    "createdAt": "2026-01-01T10:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     MEETING_001      모임을 찾을 수 없습니다

## 037 POST /challenges/{challengeId}/meetings
모임 생성 (리더만)
기본 정보
우선순위    P0
인증        필요 (리더)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Request Body

필드             타입      필수    제약조건                    설명
───────────────  ───────   ─────   ─────────────────────────   ──────────────
title            String    Y       최대 100자                  모임 제목
description      String    N       최대 500자                  모임 설명
scheduledAt      String    Y       ISO 8601, 최소 24시간 후    예정 일시
location         String    Y       최대 200자                  장소
locationDetail   String    N       최대 200자                  상세 위치
agenda           String    N       최대 1000자                 안건

Request 예시

Copy{
  "title": "2월 정기모임",
  "description": "2월 독서 결산 및 공유",
  "scheduledAt": "2026-02-15T14:00:00Z",
  "location": "강남역 스타벅스",
  "locationDetail": "2층 세미나룸",
  "agenda": "1. 2월 독서 결산\n2. 베스트 도서 선정\n3. 3월 계획"
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "meetingId": 2,
    "title": "2월 정기모임",
    "status": "SCHEDULED",
    "scheduledAt": "2026-02-15T14:00:00Z",
    "beneficiary": {
      "userId": 4,
      "nickname": "최민수",
      "order": 4
    },
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "모임이 생성되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 규칙

- 베네핏 수령자는 순번에 따라 자동 지정
- 모임 생성 시 참석 투표가 자동 시작

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────────
400     MEETING_004      예정 일시는 최소 24시간 이후여야 합니다
403     CHALLENGE_004    리더만 모임을 생성할 수 있습니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 038 PUT /meetings/{meetingId}
모임 수정 (리더만)
기본 정보
우선순위    P1
인증        필요 (리더)

Path Parameters

파라미터    타입    필수    설명
──────────  ──────  ─────   ────────────
meetingId   Long    Y       모임 ID

Request Body

필드             타입      필수    설명
───────────────  ───────   ─────   ────────────────
title            String    N       모임 제목
description      String    N       모임 설명
scheduledAt      String    N       예정 일시
location         String    N       장소
locationDetail   String    N       상세 위치
agenda           String    N       안건

Response 200 OK

Copy{
  "success": true,
  "data": {
    "meetingId": 2,
    "title": "2월 정기모임 (수정)",
    "scheduledAt": "2026-02-16T14:00:00Z",
    "updatedAt": "2026-01-14T10:30:00Z"
  },
  "message": "모임 정보가 수정되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────
400     MEETING_002      이미 지난 모임은 수정할 수 없습니다
403     CHALLENGE_004    리더만 모임을 수정할 수 있습니다
404     MEETING_001      모임을 찾을 수 없습니다

## 039 POST /meetings/{meetingId}/attendance
참석 의사 표시
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터    타입    필수    설명
──────────  ──────  ─────   ────────────
meetingId   Long    Y       모임 ID

Request Body

필드     타입      필수    제약조건                  설명
───────  ───────   ─────   ───────────────────────   ────────────────
status   String    Y       CONFIRMED | DECLINED      참석 여부
reason   String    N       최대 200자                불참 사유 (불참 시)

Request 예시

Copy{
  "status": "CONFIRMED"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "meetingId": 2,
    "myAttendance": {
      "status": "CONFIRMED",
      "respondedAt": "2026-01-14T10:30:00Z"
    },
    "attendance": {
      "confirmed": 9,
      "declined": 0,
      "pending": 1,
      "total": 10
    }
  },
  "message": "참석 의사가 등록되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드           메시지
─────   ────────────   ──────────────────────────────
400     MEETING_002    이미 지난 모임입니다
400     MEETING_003    이미 참석 의사를 표시했습니다
404     MEETING_001    모임을 찾을 수 없습니다

## 040 POST /meetings/{meetingId}/complete
모임 완료 처리 (리더만)
기본 정보
우선순위    P0
인증        필요 (리더)

Path Parameters

파라미터    타입    필수    설명
──────────  ──────  ─────   ────────────
meetingId   Long    Y       모임 ID

Request Body

필드              타입      필수    설명
────────────────  ───────   ─────   ──────────────────────
actualAttendees   Long[]    Y       실제 참석자 userId 배열
notes             String    N       모임 메모

Request 예시

Copy{
  "actualAttendees": [1, 2, 3, 4, 5, 6, 7, 8],
  "notes": "성공적인 모임이었습니다."
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "meetingId": 1,
    "status": "COMPLETED",
    "attendance": {
      "actual": 8,
      "total": 10,
      "rate": 80.0
    },
    "benefit": {
      "beneficiary": {
        "userId": 3,
        "nickname": "박영수"
      },
      "amount": 500000,
      "transferredAt": "2026-01-14T10:30:00Z"
    },
    "completedAt": "2026-01-14T10:30:00Z"
  },
  "message": "모임이 완료 처리되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────
400     MEETING_005      이미 완료된 모임입니다
400     ACCOUNT_004      챌린지 잔액이 부족합니다
403     CHALLENGE_004    리더만 완료 처리할 수 있습니다
404     MEETING_001      모임을 찾을 수 없습니다

### 8. VOTE (5개)
## 041 GET /challenges/{challengeId}/votes
투표 목록 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Query Parameters

파라미터   타입      필수    기본값    설명
─────────  ───────   ─────   ───────   ──────────────────
status     String    N       -         VoteStatus Enum
type       String    N       -         VoteType Enum
page       Integer   N       0         페이지 번호
size       Integer   N       20        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "voteId": 1,
        "type": "EXPENSE",
        "title": "회식비 30만원 지출 승인",
        "status": "IN_PROGRESS",
        "createdBy": {
          "userId": 1,
          "nickname": "홍길동"
        },
        "voteCount": {
          "agree": 5,
          "disagree": 2,
          "total": 10
        },
        "deadline": "2026-01-15T23:59:59Z",
        "createdAt": "2026-01-14T10:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 1,
      "totalPages": 1
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ────────────────────────
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

## 042 GET /votes/{voteId}
투표 상세 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터   타입    필수    설명
─────────  ──────  ─────   ────────────
voteId     Long    Y       투표 ID

Response 200 OK

필드                     타입      설명
───────────────────────  ───────   ─────────────────────────────
data.voteId              Long      투표 ID
data.challengeId         Long      챌린지 ID
data.type                String    투표 유형 (VoteType)
data.title               String    투표 제목
data.description         String    투표 설명
data.status              String    상태 (VoteStatus)
data.createdBy           Object    생성자 정보
data.targetInfo          Object    대상 정보 (지출/멤버 등)
data.voteCount           Object    투표 현황
data.myVote              String    내 투표 선택 (미투표 시 null)
data.eligibleVoters      Integer   투표 가능 인원
data.requiredApproval    Integer   승인 필요 인원 (70%)
data.deadline            String    마감 시간
data.createdAt           String    생성일

Copy{
  "success": true,
  "data": {
    "voteId": 1,
    "challengeId": 1,
    "type": "EXPENSE",
    "title": "회식비 30만원 지출 승인",
    "description": "1월 정기모임 회식비입니다",
    "status": "IN_PROGRESS",
    "createdBy": {
      "userId": 1,
      "nickname": "홍길동",
      "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
    },
    "targetInfo": {
      "expenseId": 5,
      "amount": 300000,
      "category": "FOOD"
    },
    "voteCount": {
      "agree": 5,
      "disagree": 2,
      "abstain": 1,
      "notVoted": 2,
      "total": 10
    },
    "myVote": "AGREE",
    "eligibleVoters": 10,
    "requiredApproval": 7,
    "deadline": "2026-01-15T23:59:59Z",
    "createdAt": "2026-01-14T10:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ─────────────────────────
403     VOTE_003    투표 조회 권한이 없습니다
404     VOTE_001    투표를 찾을 수 없습니다

## 043 POST /challenges/{challengeId}/votes
투표 생성
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터      타입    필수    설명
────────────  ──────  ─────   ────────────
challengeId   Long    Y       챌린지 ID

Request Body

필드          타입      필수    제약조건                    설명
────────────  ───────   ─────   ─────────────────────────   ─────────────────────────────
type          String    Y       VoteType Enum               투표 유형
title         String    Y       최대 100자                  투표 제목
description   String    N       최대 500자                  투표 설명
targetId      Long      N       -                           대상 ID (지출ID/멤버ID)
deadline      String    Y       ISO 8601, 최소 24시간 후    마감 시간

VoteType 별 용도

타입          용도                   targetId
───────────   ────────────────────   ───────────────
EXPENSE       지출 승인 투표         expenseId
KICK          멤버 강퇴 투표         memberId
LEADER_KICK   리더 강퇴 투표         leaderId (팔로워만 투표)
DISSOLVE      챌린지 해산 투표       없음

Request 예시

Copy{
  "type": "EXPENSE",
  "title": "회식비 30만원 지출 승인",
  "description": "1월 정기모임 회식비입니다",
  "targetId": 5,
  "deadline": "2026-01-15T23:59:59Z"
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "voteId": 1,
    "type": "EXPENSE",
    "title": "회식비 30만원 지출 승인",
    "status": "IN_PROGRESS",
    "deadline": "2026-01-15T23:59:59Z",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "투표가 생성되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
─────   ──────────────   ──────────────────────────────────────────
400     VOTE_002         마감 시간은 최소 24시간 이후여야 합니다
403     CHALLENGE_003    챌린지 멤버가 아닙니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다
409     VOTE_004         이미 진행 중인 동일 유형의 투표가 있습니다

## 044 PUT /votes/{voteId}/cast
투표하기
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터   타입    필수    설명
─────────  ──────  ─────   ────────────
voteId     Long    Y       투표 ID

Request Body

필드     타입      필수    제약조건                      설명
───────  ───────   ─────   ────────────────────────────  ──────────
choice   String    Y       AGREE | DISAGREE | ABSTAIN    투표 선택

Request 예시

Copy{
  "choice": "AGREE"
}
Response 200 OK

Copy{
  "success": true,
  "data": {
    "voteId": 1,
    "myVote": "AGREE",
    "voteCount": {
      "agree": 6,
      "disagree": 2,
      "abstain": 1,
      "notVoted": 1,
      "total": 10
    },
    "votedAt": "2026-01-14T10:30:00Z"
  },
  "message": "투표가 완료되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드           메시지
─────   ────────────   ──────────────────────────────────
400     VOTE_005       투표가 마감되었습니다
403     VOTE_003       투표 권한이 없습니다
403     MEMBER_003     정지된 멤버는 투표할 수 없습니다
404     VOTE_001       투표를 찾을 수 없습니다
409     VOTE_006       이미 투표하셨습니다

## 045 GET /votes/{voteId}/result
투표 결과 조회
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터   타입    필수    설명
─────────  ──────  ─────   ────────────
voteId     Long    Y       투표 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "voteId": 1,
    "type": "EXPENSE",
    "title": "회식비 30만원 지출 승인",
    "status": "APPROVED",
    "result": {
      "passed": true,
      "agree": 8,
      "disagree": 1,
      "abstain": 1,
      "notVoted": 0,
      "total": 10,
      "requiredApproval": 7,
      "approvalRate": 80.0
    },
    "voters": [
      {
        "userId": 1,
        "nickname": "홍길동",
        "choice": "AGREE",
        "votedAt": "2026-01-14T11:00:00Z"
      }
    ],
    "completedAt": "2026-01-15T23:59:59Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드        메시지
─────   ─────────   ────────────────────────────
400     VOTE_007    아직 진행 중인 투표입니다
403     VOTE_003    투표 조회 권한이 없습니다
404     VOTE_001    투표를 찾을 수 없습니다

### 8. EXPENSE (6개)
## 046 GET /challenges/{challengeId}/expenses
지출 내역 목록 조회
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기
status         String    N       -         ExpenseStatus Enum
category       String    N       -         ExpenseCategory Enum
startDate      String    N       -         조회 시작일 (YYYY-MM-DD)
endDate        String    N       -         조회 종료일 (YYYY-MM-DD)

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "expenseId": 1,
        "title": "1월 정기모임 장소 대여비",
        "amount": 50000,
        "category": "MEETING",
        "status": "APPROVED",
        "requestedBy": {
          "userId": 2,
          "nickname": "김모임"
        },
        "receiptUrl": "https://cdn.woorido.com/receipts/exp_001.jpg",
        "createdAt": "2026-01-10T14:00:00Z"
      }
    ],
    "totalElements": 15,
    "totalPages": 1,
    "number": 0,
    "size": 20,
    "totalAmount": 320000
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 047 GET /challenges/{challengeId}/expenses/{expenseId}
지출 내역 상세 조회
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
expenseId      Long      Y       지출 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "expenseId": 1,
    "title": "1월 정기모임 장소 대여비",
    "description": "강남역 스터디카페 3시간 대여",
    "amount": 50000,
    "category": "MEETING",
    "status": "APPROVED",
    "requestedBy": {
      "userId": 2,
      "nickname": "김모임",
      "profileImage": "https://cdn.woorido.com/profiles/2.jpg"
    },
    "receiptUrl": "https://cdn.woorido.com/receipts/exp_001.jpg",
    "approvedBy": {
      "userId": 1,
      "nickname": "홍길동"
    },
    "approvedAt": "2026-01-11T10:00:00Z",
    "paidAt": "2026-01-12T15:00:00Z",
    "createdAt": "2026-01-10T14:00:00Z",
    "updatedAt": "2026-01-12T15:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     EXPENSE_001     지출 내역을 찾을 수 없습니다

## 048 POST /challenges/{challengeId}/expenses
지출 내역 등록
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
title          String    Y       2~100자                           지출 제목
description    String    N       최대 1000자                       지출 설명
amount         Long      Y       1원 이상                          지출 금액
category       String    Y       MEETING|FOOD|SUPPLIES|OTHER       카테고리
receiptUrl     String    N       URL 형식                          영수증 이미지 URL

Request 예시

Copy{
  "title": "2월 정기모임 다과비",
  "description": "커피 10잔, 케이크 2개",
  "amount": 45000,
  "category": "FOOD",
  "receiptUrl": "https://cdn.woorido.com/receipts/exp_002.jpg"
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "expenseId": 2,
    "title": "2월 정기모임 다과비",
    "amount": 45000,
    "category": "FOOD",
    "status": "PENDING",
    "requestedBy": {
      "userId": 3,
      "nickname": "박저축"
    },
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "지출 내역이 등록되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     EXPENSE_002     유효하지 않은 금액입니다
400     EXPENSE_003     유효하지 않은 카테고리입니다
403     MEMBER_001      챌린지에 참여하지 않았습니다

## 049 PUT /challenges/{challengeId}/expenses/{expenseId}/approve
지출 승인/거절
기본 정보
우선순위    P1
인증        필요 (모임장)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
expenseId      Long      Y       지출 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
approved       Boolean   Y       -                                 승인/거절 여부
reason         String    조건부  최대 500자                        거절 시 필수

Request 예시 (승인)

Copy{
  "approved": true
}
Request 예시 (거절)

Copy{
  "approved": false,
  "reason": "영수증이 불명확합니다. 다시 첨부해주세요."
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "expenseId": 2,
    "status": "APPROVED",
    "processedBy": {
      "userId": 1,
      "nickname": "홍길동"
    },
    "processedAt": "2026-01-14T11:00:00Z"
  },
  "message": "지출이 승인되었습니다",
  "timestamp": "2026-01-14T11:00:00Z"
}

Errors

HTTP    코드             메시지
──────  ───────────────  ─────────────────────────────────
400     EXPENSE_004      이미 처리된 지출입니다
400     VALIDATION_001   거절 사유를 입력해주세요
403     CHALLENGE_004    모임장 권한이 필요합니다
404     EXPENSE_001      지출 내역을 찾을 수 없습니다

## 050 PUT /challenges/{challengeId}/expenses/{expenseId}
지출 수정
기본 정보
우선순위    P2
인증        필요 (요청자 본인)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
expenseId      Long      Y       지출 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
title          String    N       2~100자                           지출 제목
description    String    N       최대 1000자                       지출 설명
amount         Long      N       1원 이상                          지출 금액
category       String    N       유효한 카테고리                   카테고리
receiptUrl     String    N       URL 형식                          영수증 URL

Request 예시

Copy{
  "amount": 48000,
  "description": "커피 10잔, 케이크 3개 (수정)"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "expenseId": 2,
    "title": "2월 정기모임 다과비",
    "amount": 48000,
    "description": "커피 10잔, 케이크 3개 (수정)",
    "status": "PENDING",
    "updatedAt": "2026-01-14T12:00:00Z"
  },
  "message": "지출 내역이 수정되었습니다",
  "timestamp": "2026-01-14T12:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     EXPENSE_006     승인 후에는 수정할 수 없습니다
403     EXPENSE_005     수정 권한이 없습니다
404     EXPENSE_001     지출 내역을 찾을 수 없습니다

## 051 DELETE /challenges/{challengeId}/expenses/{expenseId}
지출 삭제
기본 정보
우선순위    P2
인증        필요 (요청자 또는 모임장)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
expenseId      Long      Y       지출 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "expenseId": 2,
    "deletedAt": "2026-01-14T13:00:00Z"
  },
  "message": "지출 내역이 삭제되었습니다",
  "timestamp": "2026-01-14T13:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     EXPENSE_006     지급 완료 후에는 삭제할 수 없습니다
403     EXPENSE_005     삭제 권한이 없습니다
404     EXPENSE_001     지출 내역을 찾을 수 없습니다

### 9. LEDGER (2개)
## 052 GET /challenges/{challengeId}/ledger
장부 조회
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       50        페이지 크기
type           String    N       -         ALL | INCOME | EXPENSE
startDate      String    N       -         조회 시작일 (YYYY-MM-DD)
endDate        String    N       -         조회 종료일 (YYYY-MM-DD)

Response 200 OK

Copy{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 1500000,
      "totalExpense": 320000,
      "balance": 1180000,
      "memberCount": 10
    },
    "entries": [
      {
        "entryId": 1,
        "type": "INCOME",
        "category": "MONTHLY_DEPOSIT",
        "amount": 50000,
        "description": "1월 정기 납입금",
        "relatedUser": {
          "userId": 2,
          "nickname": "김모임"
        },
        "createdAt": "2026-01-05T00:00:00Z"
      },
      {
        "entryId": 2,
        "type": "EXPENSE",
        "category": "MEETING",
        "amount": 50000,
        "description": "1월 정기모임 장소 대여비",
        "relatedUser": {
          "userId": 2,
          "nickname": "김모임"
        },
        "createdAt": "2026-01-10T14:00:00Z"
      }
    ],
    "totalElements": 25,
    "totalPages": 1,
    "number": 0,
    "size": 50
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 053 GET /challenges/{challengeId}/ledger/export
장부 내보내기
기본 정보
우선순위    P2
인증        필요 (모임장)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
format         String    N       CSV       CSV | EXCEL | PDF
startDate      String    N       -         조회 시작일 (YYYY-MM-DD)
endDate        String    N       -         조회 종료일 (YYYY-MM-DD)

Response 200 OK

Copy{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.woorido.com/exports/ledger_challenge_1_20260114.csv",
    "fileName": "우리동네_저축모임_장부_20260114.csv",
    "fileSize": 15360,
    "expiresAt": "2026-01-15T10:30:00Z"
  },
  "message": "장부 내보내기가 완료되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     CHALLENGE_004   모임장 권한이 필요합니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 089 GET /challenges/{challengeId}/ledger/summary
장부 요약
기본 정보
우선순위    P1
인증        필요 (멤버)

Request Syntax

Copycurl -X GET "https://api.woorido.com/api/v1/challenges/1/ledger/summary?period=MONTH" \
  -H "Authorization: Bearer {accessToken}"

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
period         String    N       MONTH     WEEK | MONTH | YEAR | ALL

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "period": "MONTH",
    "periodRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "balance": {
      "current": 850000,
      "lockedDeposit": 200000,
      "available": 650000
    },
    "summary": {
      "totalIncome": 1000000,
      "totalExpense": 150000,
      "netAmount": 850000
    },
    "breakdown": {
      "income": {
        "support": 900000,
        "entryFee": 100000,
        "other": 0
      },
      "expense": {
        "meeting": 80000,
        "food": 50000,
        "supplies": 20000,
        "other": 0
      }
    },
    "memberStats": {
      "paidCount": 9,
      "unpaidCount": 1,
      "totalMembers": 10,
      "paymentRate": 90.0
    },
    "trends": {
      "incomeChange": 5.5,
      "expenseChange": -2.3
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     CHALLENGE_003   챌린지 멤버가 아닙니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 090 POST /challenges/{challengeId}/ledger
장부 등록
기본 정보
우선순위    P1
인증        필요 (리더)

Request Syntax

Copycurl -X POST https://api.woorido.com/api/v1/challenges/1/ledger \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EXPENSE",
    "category": "MEETING",
    "amount": 50000,
    "description": "2월 모임 장소 대여비",
    "transactionDate": "2026-02-15"
  }'

Request Body

필드             타입      필수    제약조건                          설명
───────────────  ────────  ──────  ──────────────────────────────    ─────────────
type             String    Y       INCOME|EXPENSE                    장부 유형
category         String    Y       LedgerCategory                    카테고리
amount           Long      Y       1원 이상                          금액
description      String    Y       최대 200자                        설명
transactionDate  String    N       YYYY-MM-DD                        거래일 (미입력 시 오늘)

Response 201 Created

Copy{
  "success": true,
  "data": {
    "entryId": 51,
    "type": "EXPENSE",
    "category": "MEETING",
    "amount": 50000,
    "description": "2월 모임 장소 대여비",
    "newBalance": 800000,
    "createdBy": {
      "userId": 1,
      "nickname": "홍길동"
    },
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "장부가 등록되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     LEDGER_001      금액은 1원 이상이어야 합니다
400     LEDGER_002      챌린지 잔액이 부족합니다 (지출 시)
403     CHALLENGE_004   리더만 장부를 등록할 수 있습니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 091 PUT /ledger/{entryId}
장부 수정
기본 정보
우선순위    P1
인증        필요 (리더)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
entryId        Long      Y       장부 항목 ID

Request Syntax

Copycurl -X PUT https://api.woorido.com/api/v1/ledger/51 \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "FOOD",
    "amount": 45000,
    "description": "2월 모임 다과비 (수정)"
  }'

Request Body

필드             타입      필수    제약조건                          설명
───────────────  ────────  ──────  ──────────────────────────────    ─────────────
category         String    N       LedgerCategory                    카테고리
amount           Long      N       1원 이상                          금액
description      String    N       최대 200자                        설명
transactionDate  String    N       YYYY-MM-DD                        거래일

Response 200 OK

Copy{
  "success": true,
  "data": {
    "entryId": 51,
    "type": "EXPENSE",
    "category": "FOOD",
    "amount": 45000,
    "description": "2월 모임 다과비 (수정)",
    "previousAmount": 50000,
    "amountDiff": -5000,
    "newBalance": 805000,
    "updatedBy": {
      "userId": 1,
      "nickname": "홍길동"
    },
    "updatedAt": "2026-01-14T11:00:00Z"
  },
  "message": "장부가 수정되었습니다",
  "timestamp": "2026-01-14T11:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     LEDGER_001      금액은 1원 이상이어야 합니다
400     LEDGER_002      챌린지 잔액이 부족합니다
400     LEDGER_003      정산 완료된 항목은 수정할 수 없습니다
403     CHALLENGE_004   리더만 장부를 수정할 수 있습니다
404     LEDGER_004      장부 항목을 찾을 수 없습니다


### 10. POST (9개)
## 054 GET /challenges/{challengeId}/posts
게시글 목록 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기
category       String    N       -         ALL | NOTICE | GENERAL | QUESTION
sortBy         String    N       -         CREATED_AT | LIKES | COMMENTS
order          String    N       DESC      DESC | ASC

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "postId": 1,
        "title": "[공지] 2월 정기모임 안내",
        "content": "2월 정기모임은 2월 15일 토요일 오후 2시에...",
        "category": "NOTICE",
        "author": {
          "userId": 1,
          "nickname": "홍길동",
          "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
        },
        "likeCount": 8,
        "commentCount": 5,
        "viewCount": 45,
        "isPinned": true,
        "createdAt": "2026-01-10T09:00:00Z"
      }
    ],
    "totalElements": 23,
    "totalPages": 2,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 055 GET /challenges/{challengeId}/posts/{postId}
게시글 상세 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "postId": 1,
    "title": "[공지] 2월 정기모임 안내",
    "content": "2월 정기모임은 2월 15일 토요일 오후 2시에 강남역 스터디카페에서 진행됩니다.\n\n참석 여부를 댓글로 알려주세요!",
    "category": "NOTICE",
    "author": {
      "userId": 1,
      "nickname": "홍길동",
      "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
    },
    "attachments": [
      {
        "fileId": 1,
        "fileName": "모임장소_안내.jpg",
        "fileUrl": "https://cdn.woorido.com/attachments/1.jpg",
        "fileSize": 245000
      }
    ],
    "likeCount": 8,
    "commentCount": 5,
    "viewCount": 46,
    "isLiked": false,
    "isPinned": true,
    "createdAt": "2026-01-10T09:00:00Z",
    "updatedAt": "2026-01-10T09:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     POST_001        게시글을 찾을 수 없습니다

## 056 POST /challenges/{challengeId}/posts
게시글 작성
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
title          String    Y       2~100자                           게시글 제목
content        String    Y       1~10000자                         게시글 내용
category       String    Y       NOTICE|GENERAL|QUESTION           카테고리
attachmentIds  Array     N       최대 10개                         첨부파일 ID 목록

Request 예시

Copy{
  "title": "저축 꿀팁 공유합니다!",
  "content": "제가 사용하는 저축 방법을 공유드려요.\n\n1. 월급 받으면 바로 저축\n2. 고정 지출 먼저 빼기\n3. 남은 금액으로 생활하기",
  "category": "GENERAL",
  "attachmentIds": []
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "postId": 24,
    "title": "저축 꿀팁 공유합니다!",
    "category": "GENERAL",
    "author": {
      "userId": 3,
      "nickname": "박저축"
    },
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "게시글이 작성되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     POST_003        유효하지 않은 첨부파일입니다
403     MEMBER_001      챌린지에 참여하지 않았습니다
403     POST_002        공지사항은 모임장만 작성할 수 있습니다

## 057 PUT /challenges/{challengeId}/posts/{postId}
게시글 수정
기본 정보
우선순위    P1
인증        필요 (작성자)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
title          String    N       2~100자                           게시글 제목
content        String    N       1~10000자                         게시글 내용
category       String    N       GENERAL|QUESTION                  카테고리
attachmentIds  Array     N       최대 10개                         첨부파일 ID 목록

Request 예시

Copy{
  "content": "제가 사용하는 저축 방법을 공유드려요.\n\n1. 월급 받으면 바로 저축\n2. 고정 지출 먼저 빼기\n3. 남은 금액으로 생활하기\n\n(추가) 4. 소비 기록하기"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "postId": 24,
    "title": "저축 꿀팁 공유합니다!",
    "content": "제가 사용하는 저축 방법을 공유드려요...(수정됨)",
    "updatedAt": "2026-01-14T11:00:00Z"
  },
  "message": "게시글이 수정되었습니다",
  "timestamp": "2026-01-14T11:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     POST_004        수정 권한이 없습니다
404     POST_001        게시글을 찾을 수 없습니다

## 058 DELETE /challenges/{challengeId}/posts/{postId}
게시글 삭제
기본 정보
우선순위    P1
인증        필요 (작성자 또는 모임장)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "postId": 24,
    "deletedAt": "2026-01-14T12:00:00Z"
  },
  "message": "게시글이 삭제되었습니다",
  "timestamp": "2026-01-14T12:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     POST_004        삭제 권한이 없습니다
404     POST_001        게시글을 찾을 수 없습니다

## 059 POST /challenges/{challengeId}/posts/{postId}/like
게시글 좋아요
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "postId": 24,
    "liked": true,
    "likeCount": 5
  },
  "message": "좋아요를 눌렀습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 로직

이미 좋아요한 경우 토글 (좋아요 취소)
취소 시 liked: false, 메시지: "좋아요를 취소했습니다"

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     POST_001        게시글을 찾을 수 없습니다

## 060 PUT /challenges/{challengeId}/posts/{postId}/pin
게시글 상단 고정/해제
기본 정보
우선순위    P2
인증        필요 (모임장)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
pinned         Boolean   Y       -                                 고정/해제 여부

Request 예시

Copy{
  "pinned": true
}
Response 200 OK

Copy{
  "success": true,
  "data": {
    "postId": 1,
    "isPinned": true,
    "pinnedAt": "2026-01-14T10:30:00Z"
  },
  "message": "게시글이 상단에 고정되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     POST_005        최대 고정 게시글 수(3개)를 초과했습니다
403     CHALLENGE_004   모임장 권한이 필요합니다
404     POST_001        게시글을 찾을 수 없습니다

## 061 POST /challenges/{challengeId}/posts/upload
파일 업로드
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Request Body (multipart/form-data)

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
file           File      Y       최대 10MB                         업로드할 파일

지원 형식

이미지: jpg, jpeg, png, gif, webp
문서: pdf, doc, docx, xls, xlsx, ppt, pptx

Response 200 OK

Copy{
  "success": true,
  "data": {
    "fileId": 15,
    "fileName": "저축계획표.xlsx",
    "fileUrl": "https://cdn.woorido.com/attachments/15.xlsx",
    "fileSize": 25600,
    "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  },
  "message": "파일이 업로드되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     POST_006        파일 크기가 10MB를 초과합니다
400     POST_007        지원하지 않는 파일 형식입니다
403     MEMBER_001      챌린지에 참여하지 않았습니다

## 062 GET /posts/my
내 게시글 목록 조회
기본 정보
우선순위    P2
인증        필요

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기
challengeId    Long      N       -         특정 챌린지 필터

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "postId": 24,
        "challengeId": 1,
        "challengeTitle": "2026 저축 챌린지",
        "title": "저축 꿀팁 공유합니다!",
        "likeCount": 5,
        "commentCount": 3,
        "createdAt": "2026-01-14T10:30:00Z"
      }
    ],
    "totalElements": 8,
    "totalPages": 1,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 11. COMMENT (6개)
## 063 GET /challenges/{challengeId}/posts/{postId}/comments
댓글 목록 조회
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       50        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "commentId": 1,
        "content": "좋은 정보 감사합니다!",
        "author": {
          "userId": 2,
          "nickname": "김모임",
          "profileImage": "https://cdn.woorido.com/profiles/2.jpg"
        },
        "likeCount": 2,
        "isLiked": false,
        "replies": [
          {
            "commentId": 3,
            "content": "저도 동의해요~",
            "author": {
              "userId": 4,
              "nickname": "이절약"
            },
            "likeCount": 0,
            "isLiked": false,
            "createdAt": "2026-01-14T11:00:00Z"
          }
        ],
        "replyCount": 1,
        "createdAt": "2026-01-14T10:35:00Z",
        "updatedAt": "2026-01-14T10:35:00Z",
        "isDeleted": false
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "number": 0,
    "size": 50
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     POST_001        게시글을 찾을 수 없습니다

## 064 POST /challenges/{challengeId}/posts/{postId}/comments
댓글 작성
기본 정보
우선순위    P0
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID

Request Body

필드              타입      필수    제약조건                          설명
────────────────  ────────  ──────  ──────────────────────────────    ─────────────
content           String    Y       1~1000자                          댓글 내용
parentCommentId   Long      N       -                                 대댓글인 경우 부모 댓글 ID

Request 예시 (일반 댓글)

Copy{
  "content": "좋은 정보 감사합니다!"
}

Request 예시 (대댓글)

Copy{
  "content": "저도 동의해요~",
  "parentCommentId": 1
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "commentId": 6,
    "content": "좋은 정보 감사합니다!",
    "author": {
      "userId": 3,
      "nickname": "박저축"
    },
    "parentCommentId": null,
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "댓글이 작성되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     POST_001        게시글을 찾을 수 없습니다
404     COMMENT_001     부모 댓글을 찾을 수 없습니다

## 065 PUT /challenges/{challengeId}/posts/{postId}/comments/{commentId}
댓글 수정
기본 정보
우선순위    P1
인증        필요 (작성자)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID
commentId      Long      Y       댓글 ID

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
content        String    Y       1~1000자                          수정할 내용

Request 예시

Copy{
  "content": "좋은 정보 감사합니다! (수정)"
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "commentId": 6,
    "content": "좋은 정보 감사합니다! (수정)",
    "updatedAt": "2026-01-14T11:00:00Z"
  },
  "message": "댓글이 수정되었습니다",
  "timestamp": "2026-01-14T11:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     COMMENT_003     수정 권한이 없습니다
404     COMMENT_002     댓글을 찾을 수 없습니다

## 066 DELETE /challenges/{challengeId}/posts/{postId}/comments/{commentId}
댓글 삭제
기본 정보
우선순위    P1
인증        필요 (작성자 또는 모임장)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID
commentId      Long      Y       댓글 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "commentId": 6,
    "deletedAt": "2026-01-14T12:00:00Z"
  },
  "message": "댓글이 삭제되었습니다",
  "timestamp": "2026-01-14T12:00:00Z"
}

비즈니스 로직

대댓글이 있는 댓글 삭제 시: 내용만 "삭제된 댓글입니다"로 변경, isDeleted: true
대댓글이 없는 경우: 완전 삭제

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     COMMENT_003     삭제 권한이 없습니다
404     COMMENT_002     댓글을 찾을 수 없습니다

## 067 POST /challenges/{challengeId}/posts/{postId}/comments/{commentId}/like
댓글 좋아요
기본 정보
우선순위    P2
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID
postId         Long      Y       게시글 ID
commentId      Long      Y       댓글 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "commentId": 1,
    "liked": true,
    "likeCount": 3
  },
  "message": "좋아요를 눌렀습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     COMMENT_002     댓글을 찾을 수 없습니다

## 068 GET /comments/my
내 댓글 목록 조회
기본 정보
우선순위    P2
인증        필요

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "commentId": 6,
        "content": "좋은 정보 감사합니다!",
        "postId": 24,
        "postTitle": "저축 꿀팁 공유합니다!",
        "challengeId": 1,
        "challengeTitle": "2026 저축 챌린지",
        "likeCount": 2,
        "createdAt": "2026-01-14T10:30:00Z"
      }
    ],
    "totalElements": 15,
    "totalPages": 1,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 12. REPORT (2개)
## 069 POST /reports
신고하기
기본 정보
우선순위    P1
인증        필요

Request Body

필드           타입      필수    제약조건                                  설명
─────────────  ────────  ──────  ──────────────────────────────────────    ─────────────
targetType     String    Y       USER|POST|COMMENT                         신고 대상 유형
targetId       Long      Y       -                                         신고 대상 ID
reason         String    Y       SPAM|ABUSE|FRAUD|INAPPROPRIATE|OTHER      신고 사유
description    String    Y       10~1000자                                 상세 설명
evidenceUrls   Array     N       최대 5개                                  증거 이미지 URL 목록

Request 예시

Copy{
  "targetType": "COMMENT",
  "targetId": 15,
  "reason": "ABUSE",
  "description": "욕설과 비방이 포함된 댓글입니다. 모임 분위기를 해치고 있습니다.",
  "evidenceUrls": [
    "https://cdn.woorido.com/evidence/screenshot1.jpg"
  ]
}

Response 201 Created

Copy{
  "success": true,
  "data": {
    "reportId": 5,
    "targetType": "COMMENT",
    "targetId": 15,
    "status": "PENDING",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "신고가 접수되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     VALIDATION_001  상세 설명은 10자 이상 입력해주세요
404     REPORT_002      신고 대상을 찾을 수 없습니다
409     REPORT_001      이미 신고한 대상입니다

## 070 GET /reports/my
내 신고 목록 조회
기본 정보
우선순위    P2
인증        필요

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기
status         String    N       -         ALL | PENDING | REVIEWED | RESOLVED

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "reportId": 5,
        "targetType": "COMMENT",
        "reason": "ABUSE",
        "status": "RESOLVED",
        "result": "해당 댓글이 삭제 처리되었습니다",
        "createdAt": "2026-01-14T10:30:00Z",
        "resolvedAt": "2026-01-15T14:00:00Z"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 13. NOTIFICATION (5개)
## 071 GET /notifications
알림 목록 조회
기본 정보
우선순위    P0
인증        필요

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기
type           String    N       -         ALL|CHALLENGE|PAYMENT|SOCIAL|SYSTEM
isRead         Boolean   N       -         읽음 여부 필터

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "notificationId": 101,
        "type": "PAYMENT",
        "title": "납입일 알림",
        "message": "내일은 '2026 저축 챌린지'의 납입일입니다. 잔액을 확인해주세요.",
        "isRead": false,
        "data": {
          "challengeId": 1,
          "actionUrl": "/challenges/1"
        },
        "createdAt": "2026-01-14T09:00:00Z"
      },
      {
        "notificationId": 100,
        "type": "SOCIAL",
        "title": "새 댓글",
        "message": "김모임님이 회원님의 게시글에 댓글을 남겼습니다.",
        "isRead": true,
        "data": {
          "postId": 24,
          "commentId": 6,
          "actionUrl": "/challenges/1/posts/24"
        },
        "createdAt": "2026-01-13T15:00:00Z"
      }
    ],
    "totalElements": 45,
    "totalPages": 3,
    "number": 0,
    "size": 20,
    "unreadCount": 12
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 072 GET /notifications/{notificationId}
알림 상세 조회
기본 정보
우선순위    P1
인증        필요

Path Parameters

파라미터          타입      필수    설명
────────────────  ────────  ──────  ─────────────
notificationId    Long      Y       알림 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "notificationId": 101,
    "type": "PAYMENT",
    "title": "납입일 알림",
    "message": "내일은 '2026 저축 챌린지'의 납입일입니다. 잔액을 확인해주세요.",
    "isRead": true,
    "data": {
      "challengeId": 1,
      "challengeTitle": "2026 저축 챌린지",
      "paymentAmount": 50000,
      "paymentDate": "2026-01-15",
      "actionUrl": "/challenges/1"
    },
    "createdAt": "2026-01-14T09:00:00Z",
    "readAt": "2026-01-14T10:30:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드               메시지
──────  ─────────────────  ─────────────────────────────────
404     NOTIFICATION_001   알림을 찾을 수 없습니다

## 073 PUT /notifications/{notificationId}/read
알림 읽음 처리
기본 정보
우선순위    P0
인증        필요

Path Parameters

파라미터          타입      필수    설명
────────────────  ────────  ──────  ─────────────
notificationId    Long      Y       알림 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "notificationId": 101,
    "isRead": true,
    "readAt": "2026-01-14T10:30:00Z"
  },
  "message": "알림을 읽음 처리했습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드               메시지
──────  ─────────────────  ─────────────────────────────────
404     NOTIFICATION_001   알림을 찾을 수 없습니다

## 074 PUT /notifications/read-all
전체 알림 읽음 처리
기본 정보
우선순위    P1
인증        필요

Response 200 OK

Copy{
  "success": true,
  "data": {
    "readCount": 12
  },
  "message": "12개의 알림을 읽음 처리했습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

## 075 GET/PUT /notifications/settings
알림 설정 조회/수정
기본 정보
우선순위    P2
인증        필요

Request Body (PUT)

필드              타입      필수    제약조건    설명
────────────────  ────────  ──────  ──────────  ─────────────
pushEnabled       Boolean   N       -           푸시 알림 활성화
emailEnabled      Boolean   N       -           이메일 알림 활성화
challengeAlerts   Boolean   N       -           챌린지 관련 알림
paymentAlerts     Boolean   N       -           결제 관련 알림
socialAlerts      Boolean   N       -           소셜 활동 알림
marketingAlerts   Boolean   N       -           마케팅 알림

Request 예시 (PUT)

Copy{
  "pushEnabled": true,
  "emailEnabled": false,
  "marketingAlerts": false
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "pushEnabled": true,
    "emailEnabled": false,
    "challengeAlerts": true,
    "paymentAlerts": true,
    "socialAlerts": true,
    "marketingAlerts": false
  },
  "message": "알림 설정이 변경되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

### 14. REFUND (2개)
## 076 POST /refunds
환불 요청
기본 정보
우선순위    P1
인증        필요

Request Body

필드           타입      필수    제약조건                          설명
─────────────  ────────  ──────  ──────────────────────────────    ─────────────
challengeId    Long      Y       -                                 챌린지 ID
reason         String    Y       10~500자                          환불 사유
amount         Long      N       -                                 부분 환불 금액 (미입력 시 전액)

Request 예시

Copy{
  "challengeId": 1,
  "reason": "개인 사정으로 인해 챌린지에 더 이상 참여하기 어렵습니다."
}

Response 200 OK

Copy{
  "success": true,
  "data": {
    "refundId": 10,
    "challengeId": 1,
    "requestedAmount": 50000,
    "estimatedAmount": 50000,
    "fee": 0,
    "status": "PENDING",
    "reason": "개인 사정으로 인해 챌린지에 더 이상 참여하기 어렵습니다.",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "message": "환불 요청이 접수되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 로직

모집 중 탈퇴: 입회비 전액 환불
진행 중: 환불 불가 (탈퇴 불가 정책)
완료 후: 정산 후 자동 환급 (별도 환불 요청 불필요)

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     REFUND_001      현재 상태에서는 환불이 불가합니다
400     REFUND_002      환불 금액이 납입 금액을 초과합니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 077 GET /refunds/{refundId}
환불 상태 조회
기본 정보
우선순위    P2
인증        필요

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
refundId       Long      Y       환불 요청 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "refundId": 10,
    "challengeId": 1,
    "challengeTitle": "2026 저축 챌린지",
    "requestedAmount": 50000,
    "approvedAmount": 50000,
    "fee": 0,
    "netAmount": 50000,
    "status": "COMPLETED",
    "reason": "개인 사정으로 인해 챌린지에 더 이상 참여하기 어렵습니다.",
    "processedAt": "2026-01-14T14:00:00Z",
    "completedAt": "2026-01-14T15:00:00Z",
    "createdAt": "2026-01-14T10:30:00Z"
  },
  "timestamp": "2026-01-14T16:00:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
404     REFUND_003      환불 요청을 찾을 수 없습니다

### 15. SETTLEMENT (2개)
## 078 GET /challenges/{challengeId}/settlement
정산 내역 조회
기본 정보
우선순위    P1
인증        필요 (멤버)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "settlementId": 1,
    "challengeId": 1,
    "challengeTitle": "2026 저축 챌린지",
    "status": "COMPLETED",
    "totalPool": 6000000,
    "totalExpense": 320000,
    "netPool": 5680000,
    "memberCount": 10,
    "memberSettlements": [
      {
        "userId": 1,
        "nickname": "홍길동",
        "totalDeposit": 600000,
        "shareRatio": 10.56,
        "settlementAmount": 600000,
        "penaltyAmount": 0,
        "netAmount": 600000,
        "status": "COMPLETED"
      },
      {
        "userId": 2,
        "nickname": "김모임",
        "totalDeposit": 550000,
        "shareRatio": 9.68,
        "settlementAmount": 550000,
        "penaltyAmount": 50000,
        "netAmount": 500000,
        "status": "COMPLETED"
      }
    ],
    "processedAt": "2026-12-31T00:00:00Z",
    "completedAt": "2026-12-31T12:00:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드             메시지
──────  ───────────────  ─────────────────────────────────
403     MEMBER_001       챌린지에 참여하지 않았습니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다
404     SETTLEMENT_001   정산 정보가 없습니다

## 079 POST /challenges/{challengeId}/settlement/process
정산 실행 (시스템/관리자)
기본 정보
우선순위    P1
인증        필요 (시스템/관리자)

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "settlementId": 1,
    "challengeId": 1,
    "status": "IN_PROGRESS",
    "totalPool": 6000000,
    "memberCount": 10,
    "estimatedCompletion": "2026-01-14T12:00:00Z"
  },
  "message": "정산 처리가 시작되었습니다",
  "timestamp": "2026-01-14T10:30:00Z"
}

비즈니스 로직 - 정산 규칙

챌린지 완료 후 자동 정산 시작
기본 배분: 납입 비율에 따른 배분
패널티 적용: 미납 시 패널티율만큼 차감
지출 차감: 승인된 지출 금액 차감
수수료 적용: 정산 금액의 수수료 차감 (P-007 정책)
계좌 입금: 최종 금액 사용자 계좌 입금

Errors

HTTP    코드             메시지
──────  ───────────────  ─────────────────────────────────
400     CHALLENGE_010    진행 중인 챌린지는 정산할 수 없습니다
400     SETTLEMENT_002   이미 정산이 완료되었습니다
403     AUTH_015         관리자 권한이 필요합니다
404     CHALLENGE_001    챌린지를 찾을 수 없습니다

### 16. SEARCH - Django (3개)
## 080 GET /search
통합 검색
기본 정보
우선순위    P1
인증        필요
서버        Django

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
q              String    Y       -         검색어 (2자 이상)
type           String    N       -         ALL | CHALLENGE | POST | USER
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "query": "저축",
    "totalResults": 35,
    "challenges": {
      "items": [
        {
          "challengeId": 1,
          "title": "2026 저축 챌린지",
          "description": "함께 저축하는 모임입니다...",
          "status": "IN_PROGRESS",
          "currentMembers": 10
        }
      ],
      "total": 5
    },
    "posts": {
      "items": [
        {
          "postId": 24,
          "title": "저축 꿀팁 공유합니다!",
          "challengeTitle": "2026 저축 챌린지",
          "author": "박저축"
        }
      ],
      "total": 25
    },
    "users": {
      "items": [
        {
          "userId": 3,
          "nickname": "박저축",
          "profileImage": "https://cdn.woorido.com/profiles/3.jpg"
        }
      ],
      "total": 5
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
400     SEARCH_001      검색어는 2자 이상 입력해주세요

## 081 GET /search/challenges
챌린지 검색
기본 정보
우선순위    P1
인증        필요
서버        Django

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
q              String    Y       -         검색어
category       String    N       -         SAVING|INVESTMENT|EXPENSE_CUT|CUSTOM
status         String    N       -         RECRUITING|IN_PROGRESS|COMPLETED
minDeposit     Long      N       -         최소 월 납입금
maxDeposit     Long      N       -         최대 월 납입금
minMembers     Integer   N       -         최소 인원
maxMembers     Integer   N       -         최대 인원
page           Integer   N       0         페이지 번호
size           Integer   N       20        페이지 크기

Response 200 OK

Copy{
  "success": true,
  "data": {
    "content": [
      {
        "challengeId": 1,
        "title": "2026 저축 챌린지",
        "description": "함께 저축하는 모임입니다. 매달 5만원씩 저축해요!",
        "category": "SAVING",
        "status": "IN_PROGRESS",
        "leaderNickname": "홍길동",
        "currentMembers": 10,
        "maxMembers": 20,
        "monthlyDeposit": 50000,
        "startDate": "2026-01-01",
        "endDate": "2026-12-31",
        "relevanceScore": 95.5
      }
    ],
    "totalElements": 12,
    "totalPages": 1,
    "number": 0,
    "size": 20
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 082 GET /search/autocomplete
검색어 자동완성
기본 정보
우선순위    P2
인증        필요
서버        Django

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
q              String    Y       -         검색어 (1자 이상)
type           String    N       -         CHALLENGE | POST | USER
limit          Integer   N       10        결과 수 (최대 20)

Response 200 OK

Copy{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "저축 챌린지",
        "type": "CHALLENGE",
        "id": 1,
        "score": 98.5
      },
      {
        "text": "저축 꿀팁",
        "type": "POST",
        "id": 24,
        "score": 85.2
      },
      {
        "text": "박저축",
        "type": "USER",
        "id": 3,
        "score": 72.0
      }
    ]
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 17. ANALYTICS - Django (4개)
## 083 GET /analytics/user/activity
사용자 활동 통계
기본 정보
우선순위    P2
인증        필요
서버        Django

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
period         String    N       MONTH     WEEK | MONTH | YEAR

Response 200 OK

Copy{
  "success": true,
  "data": {
    "userId": 3,
    "period": "MONTH",
    "summary": {
      "totalDeposit": 150000,
      "challengeCount": 2,
      "completionRate": 100.0,
      "postCount": 5,
      "commentCount": 12
    },
    "dailyTrend": [
      {
        "date": "2026-01-01",
        "depositAmount": 50000,
        "activityScore": 85.0
      },
      {
        "date": "2026-01-05",
        "depositAmount": 0,
        "activityScore": 45.0
      }
    ],
    "ranking": {
      "depositRank": 15,
      "activityRank": 8,
      "totalUsers": 1500
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 084 GET /analytics/challenge/{challengeId}
챌린지 분석
기본 정보
우선순위    P2
인증        필요 (멤버)
서버        Django

Path Parameters

파라미터       타입      필수    설명
─────────────  ────────  ──────  ─────────────
challengeId    Long      Y       챌린지 ID

Response 200 OK

Copy{
  "success": true,
  "data": {
    "challengeId": 1,
    "overview": {
      "totalDeposit": 1500000,
      "averageDeposit": 150000,
      "completionRate": 85.5,
      "activeMembers": 10
    },
    "trends": {
      "depositTrend": [
        {"month": "2026-01", "amount": 500000},
        {"month": "2026-02", "amount": 520000}
      ],
      "memberTrend": [
        {"month": "2026-01", "joined": 10, "left": 0},
        {"month": "2026-02", "joined": 2, "left": 1}
      ]
    },
    "memberAnalysis": [
      {
        "userId": 1,
        "nickname": "홍길동",
        "depositRate": 100.0,
        "activityScore": 95.0,
        "rank": 1
      }
    ],
    "predictions": {
      "expectedTotal": 6000000,
      "successProbability": 92.5
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

Errors

HTTP    코드            메시지
──────  ──────────────  ─────────────────────────────────
403     MEMBER_001      챌린지에 참여하지 않았습니다
404     CHALLENGE_001   챌린지를 찾을 수 없습니다

## 085 GET /analytics/dashboard
전체 통계 대시보드
기본 정보
우선순위    P2
인증        필요
서버        Django

Response 200 OK

Copy{
  "success": true,
  "data": {
    "userStats": {
      "totalUsers": 15000,
      "activeUsers": 8500,
      "newUsers": 320
    },
    "challengeStats": {
      "totalChallenges": 850,
      "activeChallenges": 420,
      "completedRate": 78.5
    },
    "financialStats": {
      "totalDeposit": 2500000000,
      "averageDeposit": 165000,
      "totalSettled": 1800000000
    },
    "topChallenges": [
      {
        "challengeId": 1,
        "title": "2026 저축 챌린지",
        "memberCount": 45,
        "totalDeposit": 25000000
      }
    ],
    "recentActivity": [
      {
        "type": "CHALLENGE_CREATED",
        "title": "새해 다이어트 저축",
        "timestamp": "2026-01-14T09:00:00Z"
      }
    ]
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 086 GET /analytics/user/report
개인 리포트 생성
기본 정보
우선순위    P3
인증        필요
서버        Django

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
period         String    N       MONTH     MONTH | QUARTER | YEAR
format         String    N       JSON      JSON | PDF

Response 200 OK

Copy{
  "success": true,
  "data": {
    "reportId": "RPT_20260114_003",
    "period": "MONTH",
    "periodRange": {
      "start": "2026-01-01",
      "end": "2026-01-31"
    },
    "summary": {
      "totalDeposit": 150000,
      "totalChallenges": 2,
      "completionRate": 100.0,
      "savingsGrowth": 15.5
    },
    "achievements": [
      {
        "type": "STREAK",
        "title": "연속 납입 달성",
        "description": "3개월 연속 납입을 달성했습니다!",
        "achievedAt": "2026-01-05"
      }
    ],
    "recommendations": [
      {
        "type": "INCREASE_SAVINGS",
        "title": "저축액 증가 제안",
        "description": "현재 저축률이 좋습니다. 월 5만원 추가 저축을 고려해보세요."
      }
    ],
    "downloadUrl": "https://cdn.woorido.com/reports/RPT_20260114_003.pdf",
    "generatedAt": "2026-01-14T10:30:00Z"
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 18. RECOMMENDATION - Django (2개)
## 087 GET /recommendations/challenges
챌린지 추천
기본 정보
우선순위    P2
인증        필요
서버        Django

Query Parameters

파라미터       타입      필수    기본값    설명
─────────────  ────────  ──────  ────────  ─────────────────────────────────
limit          Integer   N       10        결과 수 (최대 20)

Response 200 OK

Copy{
  "success": true,
  "data": {
    "recommendations": [
      {
        "challengeId": 15,
        "title": "직장인 점심값 아끼기",
        "category": "EXPENSE_CUT",
        "matchScore": 95.5,
        "reason": "회원님의 지출 패턴과 유사한 사용자들이 많이 참여하고 있습니다",
        "currentMembers": 23,
        "maxMembers": 30,
        "monthlyDeposit": 30000,
        "startDate": "2026-02-01"
      },
      {
        "challengeId": 8,
        "title": "2026 여행 저축 모임",
        "category": "SAVING",
        "matchScore": 88.2,
        "reason": "회원님이 관심 있어하는 여행 카테고리입니다",
        "currentMembers": 15,
        "maxMembers": 20,
        "monthlyDeposit": 100000,
        "startDate": "2026-01-15"
      }
    ],
    "basedOn": {
      "userPreferences": ["SAVING", "TRAVEL", "EXPENSE_CUT"],
      "similarUsers": 245,
      "algorithm": "collaborative_filtering_v2"
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

## 088 GET /recommendations/savings-plan
맞춤형 저축 플랜 추천
기본 정보
우선순위    P3
인증        필요
서버        Django

Query Parameters

파라미터         타입      필수    기본값    설명
───────────────  ────────  ──────  ────────  ─────────────────────────────────
monthlyBudget    Long      N       -         월 가용 예산
goalAmount       Long      N       -         목표 금액
goalPeriod       Integer   N       -         목표 기간 (개월)

Response 200 OK

Copy{
  "success": true,
  "data": {
    "plans": [
      {
        "planId": "PLAN_A",
        "name": "안정형 저축 플랜",
        "description": "낮은 리스크로 꾸준히 저축하는 플랜입니다",
        "monthlyDeposit": 50000,
        "expectedReturn": 630000,
        "duration": 12,
        "riskLevel": "LOW",
        "matchedChallenges": [
          {
            "challengeId": 1,
            "title": "2026 저축 챌린지",
            "monthlyDeposit": 50000
          }
        ]
      },
      {
        "planId": "PLAN_B",
        "name": "적극형 저축 플랜",
        "description": "더 높은 목표를 위한 적극적인 저축 플랜입니다",
        "monthlyDeposit": 100000,
        "expectedReturn": 1320000,
        "duration": 12,
        "riskLevel": "MEDIUM",
        "matchedChallenges": [
          {
            "challengeId": 8,
            "title": "2026 여행 저축 모임",
            "monthlyDeposit": 100000
          }
        ]
      }
    ],
    "analysis": {
      "currentSavingRate": 15.5,
      "recommendedRate": 20.0,
      "projectedGoal": 1200000
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

### 부록
## A. API 통계 요약
도메인                 API 수    서버
───────────────────    ──────    ──────
AUTH                   8         Spring
USER                   6         Spring
ACCOUNT                7         Spring
CHALLENGE              8         Spring
CHALLENGE MEMBER       5         Spring
MEETING                6         Spring
VOTE                   5         Spring
EXPENSE                6         Spring
LEDGER                 2         Spring
POST                   9         Spring
COMMENT                6         Spring
REPORT                 2         Spring
NOTIFICATION           5         Spring
REFUND                 2         Spring
SETTLEMENT             2         Spring
───────────────────    ──────    ──────
Spring 소계            79

───────────────────    ──────    ──────
SEARCH                 3         Django
ANALYTICS              4         Django
RECOMMENDATION         2         Django
───────────────────    ──────    ──────
Django 소계            9
───────────────────    ──────    ──────
총계                   88

## B. 인증 불필요 API 목록 (9개)
NO    Method    Endpoint                              설명
────  ────────  ────────────────────────────────────  ─────────────────
001   POST      /api/v1/auth/signup                   회원가입
002   POST      /api/v1/auth/login                    로그인
004   POST      /api/v1/auth/refresh                  토큰 갱신
005   POST      /api/v1/auth/email/verify             이메일 인증 요청
006   POST      /api/v1/auth/email/confirm            이메일 인증 확인
007   POST      /api/v1/auth/password/reset           비밀번호 재설정 요청
008   PUT       /api/v1/auth/password/reset           비밀번호 재설정 확인
014   GET       /api/v1/users/check-nickname          닉네임 중복 확인
017   POST      /api/v1/accounts/charge/callback      충전 콜백

## C. 수수료 정책 (P-007)
충전 수수료

수수료율      0%
최소 충전     10,000원
충전 단위     10,000원

출금 수수료

구간      금액 범위                수수료율
──────    ─────────────────────    ────────
소액      10,000원 미만            1%
일반      10,000 ~ 200,000원       3%
고액      200,000원 초과           1.5%

## D. 문서 정보
문서명       WOORIDO API 명세서
버전         v1.0.0
작성일       2026-01-14
총 API 수    91개 (Spring 82 + Django 9)
기준 문서    PRODUCT_AGENDA.md
             POLICY_DEFINITION.md
             DB_Schema_1.0.0.md
             TERMINOLOGY.md

## E. 전체 에러 코드 목록
AUTH 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
AUTH_001      409     이미 사용 중인 이메일입니다
AUTH_002      409     이미 사용 중인 닉네임입니다
AUTH_003      400     비밀번호 형식이 올바르지 않습니다
AUTH_004      401     이메일 또는 비밀번호가 일치하지 않습니다
AUTH_005      403     탈퇴한 계정입니다
AUTH_006      403     정지된 계정입니다
AUTH_007      401     유효하지 않은 토큰입니다
AUTH_008      401     만료된 리프레시 토큰입니다
AUTH_009      401     유효하지 않은 리프레시 토큰입니다
AUTH_010      500     메일 발송에 실패했습니다
AUTH_011      400     잘못된 인증 코드입니다
AUTH_012      400     만료된 인증 코드입니다
AUTH_013      404     존재하지 않는 이메일입니다
AUTH_014      400     유효하지 않은 재설정 토큰입니다
AUTH_015      403     관리자 권한이 필요합니다

USER 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
USER_001      400     유효하지 않은 전화번호 형식입니다
USER_002      400     진행 중인 챌린지가 있어 탈퇴할 수 없습니다
USER_003      400     미정산 금액이 있어 탈퇴할 수 없습니다
USER_004      400     이전 비밀번호와 동일합니다
USER_005      404     존재하지 않는 사용자입니다
USER_006      400     프로필 이미지 크기가 초과되었습니다

ACCOUNT 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
ACCOUNT_001   400     최소 충전 금액은 10,000원입니다
ACCOUNT_002   400     충전 금액은 10,000원 단위여야 합니다
ACCOUNT_003   401     유효하지 않은 PG 서명입니다
ACCOUNT_004   404     존재하지 않는 충전 요청입니다
ACCOUNT_005   400     잔액이 부족합니다
ACCOUNT_006   400     일일 출금 한도를 초과했습니다
ACCOUNT_007   404     존재하지 않는 거래입니다
ACCOUNT_008   400     월간 출금 한도를 초과했습니다
ACCOUNT_009   400     결제 수단은 CARD 또는 BANK_TRANSFER 만 가능합니다

CHALLENGE 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
CHALLENGE_001 404     챌린지를 찾을 수 없습니다
CHALLENGE_002 400     유효하지 않은 기간입니다
CHALLENGE_003 400     유효하지 않은 금액입니다
CHALLENGE_004 403     모임장 권한이 필요합니다
CHALLENGE_005 400     모집 중인 챌린지만 수정할 수 있습니다
CHALLENGE_006 400     진행 중인 챌린지는 삭제할 수 없습니다
CHALLENGE_007 400     모집 기간이 아닙니다
CHALLENGE_008 400     정원이 초과되었습니다
CHALLENGE_009 400     진행 중인 챌린지는 탈퇴할 수 없습니다
CHALLENGE_010 400     진행 중인 챌린지는 정산할 수 없습니다

MEMBER 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
MEMBER_001    403     챌린지에 참여하지 않았습니다
MEMBER_002    409     이미 참여 중인 챌린지입니다
MEMBER_003    400     모임장은 탈퇴할 수 없습니다 (위임 필요)
MEMBER_004    400     자기 자신을 퇴장시킬 수 없습니다
MEMBER_005    403     정지된 멤버입니다

MEETING 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
MEETING_001   404     모임을 찾을 수 없습니다
MEETING_002   400     유효하지 않은 일시입니다
MEETING_003   400     이미 완료된 모임입니다
MEETING_004   400     참석 정원이 초과되었습니다

VOTE 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
VOTE_001      404     투표를 찾을 수 없습니다
VOTE_002      409     이미 진행 중인 투표가 있습니다
VOTE_003      403     투표 권한이 없습니다
VOTE_004      400     유효하지 않은 투표 옵션입니다
VOTE_005      400     투표가 마감되었습니다
VOTE_006      409     이미 투표하셨습니다
VOTE_007      400     아직 진행 중인 투표입니다

EXPENSE 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
EXPENSE_001   404     지출 내역을 찾을 수 없습니다
EXPENSE_002   400     유효하지 않은 금액입니다
EXPENSE_003   400     유효하지 않은 카테고리입니다
EXPENSE_004   400     이미 처리된 지출입니다
EXPENSE_005   403     수정/삭제 권한이 없습니다
EXPENSE_006   400     승인/지급 후에는 변경할 수 없습니다

POST 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
POST_001      404     게시글을 찾을 수 없습니다
POST_002      403     공지사항은 모임장만 작성할 수 있습니다
POST_003      400     유효하지 않은 첨부파일입니다
POST_004      403     수정/삭제 권한이 없습니다
POST_005      400     최대 고정 게시글 수(3개)를 초과했습니다
POST_006      400     파일 크기가 10MB를 초과합니다
POST_007      400     지원하지 않는 파일 형식입니다

COMMENT 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
COMMENT_001   404     부모 댓글을 찾을 수 없습니다
COMMENT_002   404     댓글을 찾을 수 없습니다
COMMENT_003   403     수정/삭제 권한이 없습니다

REPORT 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
REPORT_001    409     이미 신고한 대상입니다
REPORT_002    404     신고 대상을 찾을 수 없습니다

NOTIFICATION 에러
코드             HTTP    메시지
───────────────  ──────  ─────────────────────────────────────────
NOTIFICATION_001 404     알림을 찾을 수 없습니다

REFUND 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
REFUND_001    400     현재 상태에서는 환불이 불가합니다
REFUND_002    400     환불 금액이 납입 금액을 초과합니다
REFUND_003    404     환불 요청을 찾을 수 없습니다

SETTLEMENT 에러
코드            HTTP    메시지
──────────────  ──────  ─────────────────────────────────────────
SETTLEMENT_001  404     정산 정보가 없습니다
SETTLEMENT_002  400     이미 정산이 완료되었습니다

SEARCH 에러
코드          HTTP    메시지
────────────  ──────  ─────────────────────────────────────────
SEARCH_001    400     검색어는 2자 이상 입력해주세요

VALIDATION 에러 (공통)
코드            HTTP    메시지
──────────────  ──────  ─────────────────────────────────────────
VALIDATION_001  400     필수 필드가 누락되었습니다
VALIDATION_002  400     필드 형식이 올바르지 않습니다
VALIDATION_003  400     필드 길이가 초과되었습니다
VALIDATION_004  400     유효하지 않은 값입니다

## F. Enum 정의
MemberRole (멤버 역할)
값          설명
──────────  ─────────────────────────────────
LEADER      모임장 - 챌린지 생성자, 관리 권한
MEMBER      일반 멤버 - 참여자

MemberStatus (멤버 상태)
값              설명
──────────────  ─────────────────────────────────
ACTIVE          활성 - 정상 참여 중
GRACE_PERIOD    유예 기간 - 미납 후 7일 유예
KICKED          강제 퇴장 - 투표로 퇴장됨
LEFT            자진 탈퇴 - 모집 중 탈퇴

ChallengeStatus (챌린지 상태)
값              설명
──────────────  ─────────────────────────────────
RECRUITING      모집 중 - 멤버 모집 기간
ACTIVE          진행 중 - 챌린지 진행 기간
PAUSED          일시 정지 - 리더 요청 또는 시스템 정지
CLOSED          종료 - 정상 종료 또는 해산

ChallengeCategory (챌린지 카테고리)
값              설명
──────────────  ─────────────────────────────────
HOBBY           취미 - 취미 관련 목표
STUDY           학습 - 학습/공부 목표
EXERCISE        운동 - 운동/건강 목표
SAVINGS         저축 - 일반 저축 목표
TRAVEL          여행 - 여행 모임
FOOD            음식 - 음식/맛집 탐방
CULTURE         문화 - 문화/예술 활동
OTHER           기타 - 분류되지 않은 목표

TransactionType (거래 유형)
값          설명
──────────  ─────────────────────────────────
CHARGE      충전 - 계좌로 충전
WITHDRAW    출금 - 계좌에서 출금
DEPOSIT     입금 - 챌린지 납입금
REFUND      환불 - 탈퇴/해산 시 환불
FEE         수수료 - 플랫폼 수수료
SETTLEMENT  정산 - 챌린지 종료 정산

ExpenseStatus (지출 상태)
값          설명
──────────  ─────────────────────────────────
PENDING     대기 - 승인 대기 중
APPROVED    승인 - 모임장 승인 완료
REJECTED    거절 - 모임장 거절
PAID        지급 - 지급 완료

ExpenseCategory (지출 카테고리)
값          설명
──────────  ─────────────────────────────────
MEETING     모임비 - 장소 대여 등
FOOD        식비 - 다과, 식사
SUPPLIES    물품 - 소모품 구매
OTHER       기타 - 분류되지 않은 지출

VoteType (투표 유형)
값                    설명
────────────────────  ─────────────────────────────────
EXPENSE             지출 승인 - 지출 승인 투표
KICK                멤버 퇴장 - 일반 멤버 강제 퇴장
LEADER_KICK         리더 퇴장 - 리더 강제 퇴장
DISSOLVE            해산 투표 - 챌린지 해산
MEETING_ATTENDANCE  모임 참석 - 정기 모임 참석 투표

VoteStatus (투표 상태)
값          설명
──────────  ─────────────────────────────────
IN_PROGRESS 진행 중 - 투표 진행 중
APPROVED    가결 - 투표 통과
REJECTED    부결 - 투표 미통과
CANCELLED   취소 - 투표 취소됨
EXPIRED     만료 - 기한 내 미완료

VoteChoice (투표 선택)
값          설명
──────────  ─────────────────────────────────
AGREE       찬성
DISAGREE    반대
ABSTAIN     기권

PostCategory (게시글 카테고리)
값          설명
──────────  ─────────────────────────────────
NOTICE      공지사항 - 모임장만 작성 가능
GENERAL     일반 - 자유 게시글
QUESTION    질문 - Q&A

ReportReason (신고 사유)
값              설명
──────────────  ─────────────────────────────────
SPAM            스팸/광고
ABUSE           욕설/비방
FRAUD           사기/허위 정보
INAPPROPRIATE   부적절한 콘텐츠
OTHER           기타

ReportStatus (신고 상태)
값          설명
──────────  ─────────────────────────────────
PENDING     대기 - 검토 대기
REVIEWED    검토 중 - 관리자 검토 중
RESOLVED    처리 완료 - 조치 완료
DISMISSED   기각 - 신고 기각

NotificationType (알림 유형)
값          설명
──────────  ─────────────────────────────────
CHALLENGE   챌린지 - 챌린지 관련 알림
PAYMENT     결제 - 납입/충전/출금 알림
SOCIAL      소셜 - 댓글/좋아요 알림
SYSTEM      시스템 - 공지/업데이트 알림

RefundStatus (환불 상태)
값          설명
──────────  ─────────────────────────────────
PENDING     대기 - 환불 요청됨
APPROVED    승인 - 환불 승인
REJECTED    거절 - 환불 거절
COMPLETED   완료 - 환불 완료

SettlementStatus (정산 상태)
값            설명
────────────  ─────────────────────────────────
PENDING       대기 - 정산 예정
IN_PROGRESS   진행 중 - 정산 처리 중
COMPLETED     완료 - 정산 완료
FAILED        실패 - 정산 실패

Gender (성별)
값          설명
──────────  ─────────────────────────────────
MALE        남성
FEMALE      여성

MeetingStatus (모임 상태)
값          설명
──────────  ─────────────────────────────────
SCHEDULED   예정 - 모임 예정
COMPLETED   완료 - 모임 완료
CANCELLED   취소 - 모임 취소

AttendStatus (참석 상태)
값              설명
──────────────  ─────────────────────────────────
ATTENDING       참석 예정
NOT_ATTENDING   불참석
PENDING         미응답

PaymentMethod (결제 수단)
값 설명
────────────── ─────────────────────────────────
CARD            신용/체크카드
BANK_TRANSFER   계좌이체


BankCode (은행 코드)
코드 은행명
────── ─────────────────────────────────
004     KB국민은행
088     신한은행
020     우리은행
081     하나은행
011     NH농협은행
003     IBK기업은행
023     SC제일은행
027     한국씨티은행
071     우체국
031     대구은행
032     부산은행
034     광주은행
035     제주은행
037     전북은행
039     경남은행
045     새마을금고
048     신협
050     저축은행
089     케이뱅크
090     카카오뱅크
092     토스뱅크


FileType (파일 유형)
값 설명
────────── ─────────────────────────────────
IMAGE 이미지 (jpg, jpeg, png, gif, webp)
DOCUMENT 문서 (pdf, doc, docx, xls, xlsx, ppt, pptx)


LedgerType (장부 유형)
값 설명
────────── ─────────────────────────────────
INCOME      수입 - 납입금, 입회비 등
EXPENSE     지출 - 모임비, 다과비 등

## G. 공통 응답 형식
성공 응답
Copy{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "message": "처리 완료 메시지 (선택)",
  "timestamp": "2026-01-14T10:30:00Z"
}

에러 응답
Copy{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "이미 사용 중인 이메일입니다",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

페이지네이션 응답
Copy{
  "success": true,
  "data": {
    "content": [
      // 목록 데이터
    ],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20,
    "first": true,
    "last": false,
    "empty": false
  },
  "timestamp": "2026-01-14T10:30:00Z"
}

페이지네이션 파라미터
파라미터       타입      기본값    최대값    설명
─────────────  ────────  ────────  ────────  ─────────────────────────────
page           Integer   0         -         페이지 번호 (0부터 시작)
size           Integer   20        100       페이지당 항목 수
sort           String    -         -         정렬 기준 (예: createdAt,desc)

## H. 상태 전이 다이어그램
챌린지 상태 전이
                    ┌─────────────┐
                    │  RECRUITING │ (모집 중)
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ IN_PROGRESS│  │  DISSOLVED │  │ (삭제됨)   │
    │  (진행 중) │  │  (해산됨)  │  │            │
    └──────┬─────┘  └────────────┘  └────────────┘
           │
           │
           ▼
    ┌────────────┐
    │ COMPLETED  │ (완료)
    └────────────┘


전이 조건:
─────────────────────────────────────────────────────────────────────────
RECRUITING → IN_PROGRESS    모집 마감일 도달 + 최소 인원 충족
RECRUITING → DISSOLVED      모임장이 삭제 (참여자 있으면 환불 후)
RECRUITING → (삭제됨)       모임장이 삭제 (참여자 없는 경우)
IN_PROGRESS → COMPLETED     종료일 도달 → 자동 정산
IN_PROGRESS → DISSOLVED     해산 투표 가결 → 보증금 환불

멤버 상태 전이
                    ┌─────────────┐
                    │   ACTIVE    │ (활성)
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │GRACE_PERIOD│  │   KICKED   │  │    LEFT    │
    │ (유예 기간)│  │ (강제 퇴장)│  │ (자진 탈퇴)│
    └──────┬─────┘  └────────────┘  └────────────┘
           │
           │ (납입 완료)
           ▼
    ┌────────────┐
    │   ACTIVE   │
    └────────────┘


전이 조건:
─────────────────────────────────────────────────────────────────────────
ACTIVE → GRACE_PERIOD       납입일 미납 시 자동 전환 (7일 유예)
GRACE_PERIOD → ACTIVE       유예 기간 내 납입 완료
GRACE_PERIOD → KICKED       유예 기간 만료 시 자동 퇴장 + 보증금 차감
ACTIVE → KICKED             강제 퇴장 투표 가결
ACTIVE → LEFT               모집 중 자진 탈퇴 (진행 중엔 불가)

투표 상태 전이
                    ┌─────────────┐
                    │ IN_PROGRESS │ (진행 중)
                    └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│  APPROVED  │      │  REJECTED  │      │  EXPIRED   │
│   (가결)   │      │   (부결)   │      │   (만료)   │
└────────────┘      └────────────┘      └────────────┘

       │
       ▼
┌────────────┐
│ CANCELLED  │ (취소 - 발의자/모임장이 취소)
└────────────┘


전이 조건:
─────────────────────────────────────────────────────────────────────────
IN_PROGRESS → APPROVED      정족수 충족 + 찬성 비율 충족
IN_PROGRESS → REJECTED      정족수 충족 + 찬성 비율 미충족
IN_PROGRESS → EXPIRED       마감 시간 도달 + 정족수 미충족
IN_PROGRESS → CANCELLED     발의자 또는 모임장이 취소

지출 상태 전이
                    ┌─────────────┐
                    │   PENDING   │ (대기)
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
         ┌────────────┐        ┌────────────┐
         │  APPROVED  │        │  REJECTED  │
         │   (승인)   │        │   (거절)   │
         └──────┬─────┘        └────────────┘
                │
                ▼
         ┌────────────┐
         │    PAID    │ (지급 완료)
         └────────────┘


전이 조건:
─────────────────────────────────────────────────────────────────────────
PENDING → APPROVED          모임장이 승인
PENDING → REJECTED          모임장이 거절
APPROVED → PAID             정산 시 자동 지급 또는 수동 지급

I. 비즈니스 로직 요약
입회비 계산 (P-003)
공식:
입회비 = 월 납입금 × 기간(월) × 10%
최소 입회비 = 10,000원

예시:
월 납입금: 50,000원
기간: 12개월
입회비 = 50,000 × 12 × 0.1 = 60,000원
보증금 운영 (P-004)
보증금 = 월 납입금 × 2

미납 시 처리:
1. 납입일 D-day: 자동 납입 시도
2. 납입 실패: GRACE_PERIOD 상태 전환 (7일 유예)
3. 유예 기간 내 납입: ACTIVE 복귀
4. 유예 기간 만료: 보증금에서 미납금 차감 + KICKED 상태

보증금 부족 시:
- 보증금 잔액 < 미납금: 잔액만 차감 후 퇴장
- 퇴장 후 정산에서 제외

투표 정족수 (P-005)
투표 유형          참여 정족수    가결 조건
────────────────   ────────────   ────────────────────
일반 투표          과반수 (50%)   참여자 중 과반수 찬성
지출 승인          과반수 (50%)   참여자 중 과반수 찬성
멤버 강제 퇴장     2/3 이상       참여자 중 2/3 이상 찬성
모임장 퇴장        2/3 이상       참여자 중 2/3 이상 찬성
해산 투표          전원 참여      참여자 중 2/3 이상 찬성

투표 기간: 기본 48시간 (설정 가능: 24~168시간)
정산 규칙 (P-006)
정산 시점: 챌린지 종료일 익일 자정

정산 계산:
1. 총 적립금 = Σ(멤버별 납입 총액)
2. 총 지출 = Σ(승인된 지출)
3. 순 적립금 = 총 적립금 - 총 지출
4. 멤버별 배분 = 순 적립금 × (개인 납입액 / 총 적립금)
5. 패널티 차감 = 미납 횟수 × 패널티율 × 월 납입금
6. 최종 정산액 = 멤버별 배분 - 패널티 - 수수료

패널티율: 기본 10% (챌린지 생성 시 설정: 0~30%)

수수료 정책 (P-007)
충전 수수료:
- 수수료율: 0%
- 최소 충전: 10,000원
- 충전 단위: 10,000원

충전 수수료:
구간              금액 범위              수수료율
────────────────  ─────────────────────  ────────
소액              10,000원 미만          1%
일반              10,000 ~ 200,000원     3%
고액              200,000원 초과         1.5%
최소 수수료: 500원

알림 발송 규칙
알림 유형              발송 시점                          채널
────────────────────   ─────────────────────────────────  ──────────
납입일 리마인더        D-3, D-1, D-day                    Push, Email
납입 완료              즉시                               Push
납입 실패              즉시                               Push, Email
유예 기간 경고         유예 시작, D-3, D-1                Push, Email
강제 퇴장              즉시                               Push, Email
새 댓글/좋아요         즉시 (설정에 따라)                 Push
투표 시작              즉시                               Push
투표 마감 리마인더     D-1, 마감 1시간 전                 Push
정산 완료              즉시                               Push, Email

자동 배치 작업
작업명                실행 시간              설명
────────────────────  ─────────────────────  ─────────────────────────
자동 납입             매일 00:00             납입일인 챌린지 자동 납입 처리
유예 기간 확인        매일 00:00             유예 기간 만료 멤버 퇴장 처리
챌린지 상태 변경      매일 00:00             모집 마감/종료일 상태 변경
정산 처리             매일 01:00             종료된 챌린지 정산 실행
알림 발송             매 시간                예약된 알림 발송
투표 마감 처리        매 시간                마감된 투표 결과 처리

## J. API 우선순위 정의
우선순위    설명                              예시
──────────  ──────────────────────────────    ─────────────────────────────
P0          MVP 필수 기능                     회원가입, 로그인, 챌린지 CRUD
            서비스 핵심 동작에 필수           결제, 게시판 기본 기능

P1          핵심 부가 기능                    투표, 지출 관리, 알림
            사용자 경험 향상에 중요           검색, 통계

P2          편의 기능                         파일 업로드, 장부 내보내기
            없어도 서비스 이용 가능           프로필 수정, 설정

P3          고급 기능                         AI 추천, 리포트 생성
            차후 개발 예정                    분석 대시보드

## K. 보안 요구사항
인증 방식
방식: JWT (JSON Web Token)
Access Token 만료: 1시간
Refresh Token 만료: 14일

헤더 형식:
Authorization: Bearer {accessToken}
비밀번호 정책
최소 길이: 8자
최대 길이: 20자
필수 조합: 영문 + 숫자 + 특수문자
특수문자: !@#$%^&*()_+-=[]{}|;:,.<>?

API Rate Limiting
구분              제한                  기준
────────────────  ────────────────────  ──────────────
일반 API          100 요청/분           IP 기준
인증 API          10 요청/분            IP 기준
검색 API          30 요청/분            사용자 기준
파일 업로드       10 요청/시간          사용자 기준

민감 정보 처리
항목              처리 방식
────────────────  ─────────────────────────────────────
비밀번호          BCrypt 해싱 (cost factor: 12)
주민번호          수집 안 함
전화번호          AES-256 암호화 저장
계좌번호          AES-256 암호화 저장, 마스킹 표시
문서 종료
문서명       WOORIDO API 명세서
버전         v1.0.0
작성일       2026-01-14
총 API 수    88개 (Spring 79 + Django 9)
총 페이지    부록 포함 전체

변경 이력:
──────────────────────────────────────────────────────────────
v1.0.0    2026-01-14    최초 작성