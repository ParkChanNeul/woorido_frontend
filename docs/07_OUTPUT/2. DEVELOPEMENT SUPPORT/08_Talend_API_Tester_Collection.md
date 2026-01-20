================================================================================
WOORIDO Talend API Tester Collection
================================================================================
버전: 1.0.1
생성일: 2026-01-16
API 수: 92개 (Spring 83 + Django 9)
Base URL: https://api.woorido.com/api/v1
기준 문서: API_SCHEMA_1.0.0.md, API_SPECIFICATION_1.0.0.md, BACKLOG.md
================================================================================


################################################################################
#                                                                              #
#   사용 방법                                                                   #
#                                                                              #
#   1. Talend API Tester (Chrome 확장) 설치                                     #
#   2. 이 문서의 각 요청을 복사하여 Talend에 붙여넣기                            #
#   3. 환경 변수 설정:                                                          #
#      - {{BASE_URL}} = https://api.woorido.com/api/v1                         #
#      - {{ACCESS_TOKEN}} = 로그인 후 발급받은 토큰                             #
#      - {{REFRESH_TOKEN}} = 로그인 후 발급받은 리프레시 토큰                    #
#      - {{CHALLENGE_ID}} = 테스트할 챌린지 ID                                  #
#      - {{USER_ID}} = 테스트할 사용자 ID                                       #
#      - {{MEMBER_ID}} = 테스트할 팔로워 ID                                     #
#      - {{MEETING_ID}} = 테스트할 모임 ID                                      #
#      - {{VOTE_ID}} = 테스트할 투표 ID                                         #
#      - {{EXPENSE_ID}} = 테스트할 지출 ID                                      #
#      - {{POST_ID}} = 테스트할 게시글 ID                                       #
#      - {{COMMENT_ID}} = 테스트할 댓글 ID                                      #
#      - {{ENTRY_ID}} = 테스트할 장부 항목 ID                                   #
#      - {{NOTIFICATION_ID}} = 테스트할 알림 ID                                 #
#      - {{REFUND_ID}} = 테스트할 환불 ID                                       #
#                                                                              #
################################################################################


################################################################################
#                                                                              #
#   API 통계                                                                    #
#                                                                              #
#   도메인                API 수    번호 범위     인증 불필요                    #
#   ────────────────────  ────────  ────────────  ────────────                  #
#   AUTH                  8         001-008       6개                           #
#   USER                  6         009-014       1개                           #
#   ACCOUNT               7         015-021       1개                           #
#   CHALLENGE             8         022-029       0개                           #
#   CHALLENGE FOLLOWER    5         030-034       0개                           #
#   MEETING               6         035-040       0개                           #
#   VOTE                  5         041-045       0개                           #
#   EXPENSE               6         046-051       0개                           #
#   LEDGER                5         052-056       0개                           #
#   POST                  9         057-065       0개                           #
#   COMMENT               6         066-071       0개                           #
#   REPORT                2         072-073       0개                           #
#   NOTIFICATION          5         074-078       0개                           #
#   REFUND                2         079-080       0개                           #
#   SETTLEMENT            2         081-082       0개                           #
#   SEARCH (Django)       3         083-085       0개                           #
#   ANALYTICS (Django)    4         086-089       0개                           #
#   RECOMMENDATION        2         090-091       0개                           #
#   ────────────────────  ────────  ────────────  ────────────                  #
#   합계                  92                      9개                           #
#                                                                              #
################################################################################


################################################################################
#                                                                              #
#   1. AUTH API (8개)                                                          #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
001. 회원가입
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/signup
Auth: 불필요
Priority: P0
Headers:
    Content-Type: application/json
Body:
{
    "email": "test@example.com",
    "password": "Test1234!@",
    "passwordConfirm": "Test1234!@",
    "nickname": "테스트유저",
    "phone": "010-1234-5678",
    "birthDate": "1990-01-15",
    "agreedTerms": true,
    "agreedPrivacy": true,
    "agreedMarketing": false
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "userId": 1,
        "email": "test@example.com",
        "nickname": "테스트유저",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "회원가입이 완료되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    VALIDATION_001 (400) - 비밀번호는 8-20자, 영문+숫자+특수문자 포함
    USER_002 (409) - 이미 존재하는 이메일입니다
    USER_006 (400) - 닉네임은 2-20자여야 합니다


--------------------------------------------------------------------------------
002. 로그인
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/login
Auth: 불필요
Priority: P0
Headers:
    Content-Type: application/json
Body:
{
    "email": "test@example.com",
    "password": "Test1234!@"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
        "tokenType": "Bearer",
        "expiresIn": 3600,
        "user": {
            "userId": 1,
            "email": "test@example.com",
            "nickname": "테스트유저",
            "profileImage": null,
            "status": "ACTIVE",
            "isNewUser": true
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: accessToken을 {{ACCESS_TOKEN}}, refreshToken을 {{REFRESH_TOKEN}} 변수에 저장
Error Codes:
    AUTH_001 (401) - 이메일 또는 비밀번호가 일치하지 않습니다
    USER_005 (403) - 탈퇴 대기 상태입니다


--------------------------------------------------------------------------------
003. 로그아웃
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/logout
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "refreshToken": "{{REFRESH_TOKEN}}"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "loggedOut": true
    },
    "message": "로그아웃되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


--------------------------------------------------------------------------------
004. 토큰 갱신
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/refresh
Auth: 불필요
Priority: P0
Headers:
    Content-Type: application/json
Body:
{
    "refreshToken": "{{REFRESH_TOKEN}}"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
        "tokenType": "Bearer",
        "expiresIn": 3600
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    AUTH_004 (401) - 리프레시 토큰이 만료되었습니다


--------------------------------------------------------------------------------
005. 인증 코드 발송
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/email/verify
Auth: 불필요
Priority: P1
Headers:
    Content-Type: application/json
Body:
{
    "email": "test@example.com",
    "type": "SIGNUP"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "email": "test@example.com",
        "expiresIn": 300,
        "retryAfter": 60
    },
    "message": "인증 코드가 발송되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: type = SIGNUP | PASSWORD_RESET
Error Codes:
    AUTH_007 (400) - 잠시 후 다시 시도해주세요
    USER_002 (409) - 이미 존재하는 이메일입니다


--------------------------------------------------------------------------------
006. 인증 코드 확인
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/email/confirm
Auth: 불필요
Priority: P1
Headers:
    Content-Type: application/json
Body:
{
    "email": "test@example.com",
    "code": "123456"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "email": "test@example.com",
        "verified": true,
        "verificationToken": "temp_token_for_signup_or_reset"
    },
    "message": "이메일이 인증되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    AUTH_006 (400) - 인증 코드가 일치하지 않습니다
    AUTH_008 (400) - 인증 코드가 만료되었습니다


--------------------------------------------------------------------------------
007. 비밀번호 재설정 요청
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/auth/password/reset
Auth: 불필요
Priority: P0
Headers:
    Content-Type: application/json
Body:
{
    "email": "test@example.com"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "email": "test@example.com",
        "expiresIn": 1800
    },
    "message": "비밀번호 재설정 링크가 발송되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    USER_001 (404) - 사용자를 찾을 수 없습니다


--------------------------------------------------------------------------------
008. 비밀번호 재설정 실행
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/auth/password/reset
Auth: 불필요
Priority: P1
Headers:
    Content-Type: application/json
Body:
{
    "token": "reset_token_from_email",
    "newPassword": "NewPass1234!@",
    "newPasswordConfirm": "NewPass1234!@"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "passwordReset": true
    },
    "message": "비밀번호가 재설정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    AUTH_009 (400) - 재설정 토큰이 만료되었습니다
    VALIDATION_001 (400) - 비밀번호 형식이 올바르지 않습니다


################################################################################
#                                                                              #
#   2. USER API (6개)                                                          #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
009. 내 정보 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/users/me
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "userId": 1,
        "email": "test@example.com",
        "nickname": "테스트유저",
        "phone": "010-1234-5678",
        "birthDate": "1990-01-15",
        "profileImage": null,
        "status": "ACTIVE",
        "brix": 12.0,
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
        "createdAt": "2026-01-01T10:00:00Z",
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


--------------------------------------------------------------------------------
010. 내 정보 수정
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/users/me
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "nickname": "새닉네임",
    "phone": "010-9876-5432",
    "profileImage": "https://cdn.woorido.com/profiles/new.jpg"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "userId": 1,
        "nickname": "새닉네임",
        "phone": "010-9876-5432",
        "profileImage": "https://cdn.woorido.com/profiles/new.jpg",
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "정보가 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    USER_006 (400) - 닉네임은 2-20자여야 합니다
    USER_007 (409) - 이미 사용 중인 닉네임입니다


--------------------------------------------------------------------------------
011. 비밀번호 변경
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/users/me/password
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "currentPassword": "Test1234!@",
    "newPassword": "NewPass1234!@",
    "newPasswordConfirm": "NewPass1234!@"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "passwordChanged": true
    },
    "message": "비밀번호가 변경되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    USER_003 (400) - 현재 비밀번호가 일치하지 않습니다
    VALIDATION_001 (400) - 비밀번호 형식이 올바르지 않습니다


--------------------------------------------------------------------------------
012. 회원 탈퇴
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/users/me
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "password": "Test1234!@",
    "reason": "서비스 이용을 더 이상 하지 않습니다"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "userId": 1,
        "status": "WITHDRAWN",
        "withdrawnAt": "2026-01-16T10:30:00Z",
        "dataDeletedAt": "2026-02-16T10:30:00Z"
    },
    "message": "탈퇴 처리되었습니다. 30일 내 재가입 시 데이터가 복구됩니다.",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 활성 챌린지 참여 중인 경우 먼저 탈퇴 필요
Error Codes:
    USER_003 (400) - 비밀번호가 일치하지 않습니다
    USER_008 (400) - 활성 챌린지에서 먼저 탈퇴해주세요
    USER_009 (400) - 미정산 크레딧이 있습니다


--------------------------------------------------------------------------------
013. 사용자 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/users/{{USER_ID}}
Auth: 필요
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "userId": 2,
        "nickname": "김철수",
        "profileImage": "https://cdn.woorido.com/profiles/2.jpg",
        "brix": 45.5,
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    USER_001 (404) - 사용자를 찾을 수 없습니다


--------------------------------------------------------------------------------
014. 닉네임 중복 체크
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/users/check-nickname?nickname=테스트닉네임
Auth: 불필요
Priority: P0
Headers:
    (없음)
Expected: 200 OK
Response (사용 가능):
{
    "success": true,
    "data": {
        "nickname": "테스트닉네임",
        "available": true
    },
    "message": "사용 가능한 닉네임입니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Response (사용 불가):
{
    "success": true,
    "data": {
        "nickname": "홍길동",
        "available": false
    },
    "message": "이미 사용 중인 닉네임입니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    USER_006 (400) - 닉네임은 2-20자여야 합니다


################################################################################
#                                                                              #
#   3. ACCOUNT API (7개)                                                       #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
015. 내 어카운트 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/accounts/me
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


--------------------------------------------------------------------------------
016. 거래 내역 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/accounts/me/transactions?type=ALL&startDate=2026-01-01&endDate=2026-01-31&page=0&size=20
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
                "endDate": "2026-01-31"
            }
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: type = ALL | CHARGE | WITHDRAW | SUPPORT | BENEFIT | ENTRY_FEE | DEPOSIT_LOCK | DEPOSIT_UNLOCK | DEPOSIT_DEDUCT | EXPENSE | REFUND | FEE | SETTLEMENT


--------------------------------------------------------------------------------
017. 크레딧 충전
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/accounts/charge
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "amount": 100000,
    "paymentMethod": "CARD",
    "returnUrl": "https://woorido.com/payment/complete"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "orderId": "ORD20260116103000001",
        "amount": 100000,
        "fee": 3000,
        "totalPaymentAmount": 103000,
        "paymentUrl": "https://pay.woorido.com/checkout/ORD20260116103000001",
        "expiresAt": "2026-01-16T10:45:00Z"
    },
    "message": "수수료 포함 103,000원 결제 페이지로 이동합니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 최소 충전: 10,000원
    - 충전 단위: 10,000원
    - 수수료: 10,000 ~ 200,000원 → 3%
Error Codes:
    ACCOUNT_002 (400) - 충전 금액은 10,000원 이상이어야 합니다
    ACCOUNT_007 (400) - 충전 금액은 10,000원 단위여야 합니다
    ACCOUNT_008 (400) - 결제 수단은 CARD 또는 BANK_TRANSFER 만 가능합니다


--------------------------------------------------------------------------------
018. 충전 콜백 (내부 API)
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/accounts/charge/callback
Auth: 불필요 (PG 서명 검증)
Priority: P0
Headers:
    Content-Type: application/json
Body:
{
    "orderId": "ORD20260116103000001",
    "paymentKey": "toss_payment_key_12345",
    "amount": 103000,
    "status": "SUCCESS"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "transactionId": 1,
        "orderId": "ORD20260116103000001",
        "amount": 100000,
        "newBalance": 600000,
        "completedAt": "2026-01-16T10:35:00Z"
    },
    "timestamp": "2026-01-16T10:35:00Z"
}
Note: PG사(TossPay)에서 호출하는 내부 API


--------------------------------------------------------------------------------
019. 출금
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/accounts/withdraw
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "amount": 100000,
    "bankCode": "088",
    "accountNumber": "110-123-456789",
    "accountHolder": "홍길동"
}
Expected: 200 OK
Response:
{
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
        "estimatedArrival": "2026-01-16T12:00:00Z",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "출금이 요청되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 출금 수수료 무료 (충전 시 수수료 부과)
Error Codes:
    ACCOUNT_003 (400) - 출금 가능 금액을 초과했습니다
    ACCOUNT_004 (400) - 잔액이 부족합니다
    ACCOUNT_005 (400) - 일일 출금 한도를 초과했습니다
    ACCOUNT_006 (400) - 월간 출금 한도를 초과했습니다


--------------------------------------------------------------------------------
020. 서포트 수동 납입
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/accounts/support
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "challengeId": "{{CHALLENGE_ID}}"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "transactionId": 1,
        "challengeId": "{{CHALLENGE_ID}}",
        "challengeName": "책벌레들",
        "amount": 100000,
        "newBalance": 400000,
        "newChallengeBalance": 1100000,
        "isFirstSupport": false,
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "서포트가 납입되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    ACCOUNT_004 (400) - 잔액이 부족합니다
    SUPPORT_001 (400) - 이미 이번 달 서포트를 납입했습니다
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
021. 수수료 정책 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/accounts/fee-policy
Auth: 필요
Priority: P2
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
    "timestamp": "2026-01-16T10:30:00Z"
}


################################################################################
#                                                                              #
#   4. CHALLENGE API (8개)                                                     #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
022. 챌린지 생성
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "name": "책벌레들",
    "description": "매월 책 1권 완독하는 독서 모임입니다",
    "category": "HOBBY",
    "maxFollowers": 10,
    "supportAmount": 100000,
    "depositAmount": 200000,
    "supportDay": 1,
    "startDate": "2026-02-01",
    "thumbnailImage": "https://cdn.woorido.com/challenges/book.jpg",
    "rules": "1. 매월 1권 이상 완독\n2. 독서 인증 필수"
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "challengeId": 1,
        "name": "책벌레들",
        "status": "RECRUITING",
        "followerCount": {
            "current": 1,
            "max": 10
        },
        "myRole": "LEADER",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "챌린지가 생성되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 생성자는 자동으로 리더가 됨
    - 리더당 최대 3개 챌린지 생성 가능
    - category: HOBBY | STUDY | EXERCISE | SAVINGS | TRAVEL | FOOD | CULTURE | OTHER
Error Codes:
    CHALLENGE_007 (400) - 리더당 챌린지 생성 한도(3개)를 초과했습니다
    VALIDATION_001 (400) - 유효성 검증 실패


--------------------------------------------------------------------------------
023. 챌린지 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges?status=RECRUITING&category=HOBBY&sort=createdAt,desc&page=0&size=20
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "challengeId": 1,
                "name": "책벌레들",
                "description": "매월 책 1권 완독하는 독서 모임",
                "category": "HOBBY",
                "status": "RECRUITING",
                "followerCount": {
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: status = RECRUITING | IN_PROGRESS | COMPLETED


--------------------------------------------------------------------------------
024. 챌린지 상세 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "challengeId": 1,
        "name": "책벌레들",
        "description": "매월 책 1권 완독하는 독서 모임입니다",
        "category": "HOBBY",
        "status": "IN_PROGRESS",
        "followerCount": {
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
        "isFollower": true,
        "myMembership": {
            "memberId": 5,
            "role": "FOLLOWER",
            "status": "ACTIVE",
            "joinedAt": "2025-12-15T10:00:00Z"
        },
        "startedAt": "2026-01-01T00:00:00Z",
        "createdAt": "2025-12-01T10:00:00Z"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
025. 챌린지 수정 (리더)
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}
Auth: 필요 (리더)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "description": "매월 책 2권 완독하는 독서 모임입니다 (수정)",
    "maxFollowers": 15
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "challengeId": 1,
        "name": "책벌레들",
        "description": "매월 책 2권 완독하는 독서 모임입니다 (수정)",
        "maxFollowers": 15,
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "챌린지 정보가 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: supportAmount, depositAmount, supportDay는 활성화 후 변경 불가
Error Codes:
    CHALLENGE_004 (403) - 리더만 수정할 수 있습니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
026. 챌린지 삭제 (리더)
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}
Auth: 필요 (리더)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "challengeId": 1,
        "deleted": true
    },
    "message": "챌린지가 삭제되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: RECRUITING 상태에서만 삭제 가능
Error Codes:
    CHALLENGE_010 (400) - 활성화된 챌린지는 삭제할 수 없습니다
    CHALLENGE_004 (403) - 리더만 삭제할 수 있습니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
027. 내 챌린지 목록
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/me?role=ALL&status=ALL
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "challenges": [
            {
                "challengeId": 1,
                "name": "책벌레들",
                "status": "IN_PROGRESS",
                "myRole": "FOLLOWER",
                "myStatus": "ACTIVE",
                "followerCount": {
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: role = ALL | LEADER | FOLLOWER


--------------------------------------------------------------------------------
028. 챌린지 어카운트 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/account
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
029. 자동 납입 설정
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/support/settings
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "autoPayEnabled": true
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "challengeId": 1,
        "autoPayEnabled": true,
        "nextPaymentDate": "2026-02-01",
        "amount": 100000
    },
    "message": "자동 납입이 설정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


################################################################################
#                                                                              #
#   5. CHALLENGE FOLLOWER API (5개)                                            #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
030. 챌린지 가입
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/join
Auth: 필요
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{}
Expected: 201 Created
Response:
{
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
        "joinedAt": "2026-01-16T10:30:00Z"
    },
    "message": "챌린지에 가입되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 입회비 = 챌린지잔액 / (팔로워수 - 1)
    - 첫 서포트 = 납입일 7일 전 이내 가입 시 포함
    - 당도(Brix) 음수인 사용자는 가입 불가
Error Codes:
    ACCOUNT_004 (400) - 잔액이 부족합니다
    CHALLENGE_002 (400) - 이미 가입한 챌린지입니다
    CHALLENGE_005 (400) - 챌린지 정원이 초과되었습니다
    CHALLENGE_006 (400) - 모집 중인 챌린지가 아닙니다
    USER_004 (400) - 당도가 음수인 사용자는 가입할 수 없습니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
031. 챌린지 탈퇴
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/leave
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
        "leftAt": "2026-01-16T10:30:00Z"
    },
    "message": "챌린지에서 탈퇴했습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 리더는 위임 후 탈퇴 가능
Error Codes:
    MEMBER_002 (400) - 리더는 탈퇴할 수 없습니다 (위임 후 탈퇴)
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
032. 팔로워 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/members?status=ACTIVE
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "members": [
            {
                "memberId": 1,
                "user": {
                    "userId": 1,
                    "nickname": "홍길동",
                    "profileImage": "https://cdn.woorido.com/profiles/1.jpg",
                    "brix": 65.5
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
                    "brix": 42.0
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: status = ALL | ACTIVE | OVERDUE | GRACE_PERIOD
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
033. 팔로워 상세 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/members/{{MEMBER_ID}}
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "memberId": 2,
        "user": {
            "userId": 2,
            "nickname": "김철수",
            "profileImage": "https://cdn.woorido.com/profiles/2.jpg",
            "brix": 42.0
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    MEMBER_001 (404) - 팔로워를 찾을 수 없습니다


--------------------------------------------------------------------------------
034. 리더 위임
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/delegate
Auth: 필요 (리더)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "targetMemberId": 5
}
Expected: 200 OK
Response:
{
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
        "delegatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "리더 권한이 위임되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    MEMBER_004 (400) - 자신에게 위임할 수 없습니다
    MEMBER_005 (400) - 정지된 팔로워에게 위임할 수 없습니다
    CHALLENGE_004 (403) - 리더만 위임할 수 있습니다
    MEMBER_001 (404) - 팔로워를 찾을 수 없습니다


################################################################################
#                                                                              #
#   6. MEETING API (6개)                                                       #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
035. 모임 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/meetings?status=ALL&page=0&size=20
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: status = ALL | VOTING | CONFIRMED | COMPLETED | CANCELLED
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
036. 모임 상세 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/meetings/{{MEETING_ID}}
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "meetingId": 1,
        "challengeId": 1,
        "title": "1월 정기모임",
        "description": "신년 계획 공유 및 독서 목표 설정",
        "status": "VOTING",
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    MEETING_001 (404) - 모임을 찾을 수 없습니다


--------------------------------------------------------------------------------
037. 모임 생성 (리더)
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/meetings
Auth: 필요 (리더)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "title": "2월 정기모임",
    "description": "2월 독서 결산 및 공유",
    "scheduledAt": "2026-02-15T14:00:00Z",
    "location": "강남역 스타벅스",
    "locationDetail": "2층 세미나룸",
    "agenda": "1. 2월 독서 결산\n2. 베스트 도서 선정\n3. 3월 계획"
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "meetingId": 2,
        "title": "2월 정기모임",
        "status": "VOTING",
        "scheduledAt": "2026-02-15T14:00:00Z",
        "beneficiary": {
            "userId": 4,
            "nickname": "최민수",
            "order": 4
        },
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "모임이 생성되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 베네핏 수령자는 순번에 따라 자동 지정
    - 모임 생성 시 참석 투표가 자동 시작
    - 예정일시는 최소 24시간 이후
Error Codes:
    MEETING_004 (400) - 예정 일시는 최소 24시간 이후여야 합니다
    CHALLENGE_004 (403) - 리더만 모임을 생성할 수 있습니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
038. 모임 수정 (리더)
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/meetings/{{MEETING_ID}}
Auth: 필요 (리더)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "title": "2월 정기모임 (수정)",
    "scheduledAt": "2026-02-16T14:00:00Z",
    "location": "역삼역 투썸플레이스"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "meetingId": 2,
        "title": "2월 정기모임 (수정)",
        "scheduledAt": "2026-02-16T14:00:00Z",
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "모임 정보가 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    MEETING_002 (400) - 이미 지난 모임은 수정할 수 없습니다
    CHALLENGE_004 (403) - 리더만 모임을 수정할 수 있습니다
    MEETING_001 (404) - 모임을 찾을 수 없습니다


--------------------------------------------------------------------------------
039. 참석 의사 표시
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/meetings/{{MEETING_ID}}/attendance
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "status": "CONFIRMED",
    "reason": ""
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "meetingId": 2,
        "myAttendance": {
            "status": "CONFIRMED",
            "respondedAt": "2026-01-16T10:30:00Z"
        },
        "attendance": {
            "confirmed": 9,
            "declined": 0,
            "pending": 1,
            "total": 10
        }
    },
    "message": "참석 의사가 등록되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: status = CONFIRMED | DECLINED, 불참 시 reason 필수
Error Codes:
    MEETING_002 (400) - 이미 지난 모임입니다
    MEETING_003 (400) - 이미 참석 의사를 표시했습니다
    MEETING_001 (404) - 모임을 찾을 수 없습니다


--------------------------------------------------------------------------------
040. 모임 완료 처리 (리더)
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/meetings/{{MEETING_ID}}/complete
Auth: 필요 (리더)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "actualAttendees": [1, 2, 3, 4, 5, 6, 7, 8],
    "notes": "성공적인 모임이었습니다."
}
Expected: 200 OK
Response:
{
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
            "transferredAt": "2026-01-16T10:30:00Z"
        },
        "completedAt": "2026-01-16T10:30:00Z"
    },
    "message": "모임이 완료 처리되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: actualAttendees에 실제 참석자 userId 배열
Error Codes:
    MEETING_005 (400) - 이미 완료된 모임입니다
    ACCOUNT_004 (400) - 챌린지 잔액이 부족합니다
    CHALLENGE_004 (403) - 리더만 완료 처리할 수 있습니다
    MEETING_001 (404) - 모임을 찾을 수 없습니다


################################################################################
#                                                                              #
#   7. VOTE API (5개)                                                          #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
041. 투표 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/votes?status=ALL&type=ALL&page=0&size=20
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
                    "approve": 5,
                    "reject": 2,
                    "total": 10
                },
                "deadline": "2026-01-17T23:59:59Z",
                "createdAt": "2026-01-16T10:00:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 1,
            "totalPages": 1
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - status = ALL | IN_PROGRESS | APPROVED | REJECTED | EXPIRED
    - type = ALL | EXPENSE | KICK | LEADER_KICK | DISSOLVE | MEETING_ATTENDANCE
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
042. 투표 상세 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/votes/{{VOTE_ID}}
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
            "approve": 5,
            "reject": 2,
            "abstain": 1,
            "notVoted": 2,
            "total": 10
        },
        "myVote": "APPROVE",
        "eligibleVoters": 10,
        "requiredApproval": 7,
        "deadline": "2026-01-17T23:59:59Z",
        "createdAt": "2026-01-16T10:00:00Z"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    VOTE_003 (403) - 투표 조회 권한이 없습니다
    VOTE_001 (404) - 투표를 찾을 수 없습니다


--------------------------------------------------------------------------------
043. 투표 생성
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/votes
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "type": "KICK",
    "title": "규칙 위반 팔로워 강퇴 투표",
    "description": "3회 연속 미납으로 인한 강퇴 투표입니다",
    "targetId": 5,
    "deadline": "2026-01-18T23:59:59Z"
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "voteId": 2,
        "type": "KICK",
        "title": "규칙 위반 팔로워 강퇴 투표",
        "status": "IN_PROGRESS",
        "deadline": "2026-01-18T23:59:59Z",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "투표가 생성되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - type: EXPENSE (지출 승인), KICK (팔로워 강퇴), LEADER_KICK (리더 탄핵), DISSOLVE (해산)
    - KICK: targetId = memberId
    - EXPENSE: targetId = expenseId
    - 마감 시간은 최소 24시간 이후
Error Codes:
    VOTE_002 (400) - 마감 시간은 최소 24시간 이후여야 합니다
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다
    VOTE_004 (409) - 이미 진행 중인 동일 유형의 투표가 있습니다


--------------------------------------------------------------------------------
044. 투표하기
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/votes/{{VOTE_ID}}/cast
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "choice": "APPROVE"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "voteId": 1,
        "myVote": "APPROVE",
        "voteCount": {
            "approve": 6,
            "reject": 2,
            "abstain": 1,
            "notVoted": 1,
            "total": 10
        },
        "votedAt": "2026-01-16T10:30:00Z"
    },
    "message": "투표가 완료되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 지출/일반 투표: choice = APPROVE | REJECT
    - 모임 참석 투표: choice = AGREE | DISAGREE
Error Codes:
    VOTE_005 (400) - 투표가 마감되었습니다
    VOTE_003 (403) - 투표 권한이 없습니다
    MEMBER_003 (403) - 정지된 팔로워는 투표할 수 없습니다
    VOTE_001 (404) - 투표를 찾을 수 없습니다
    VOTE_006 (409) - 이미 투표하셨습니다


--------------------------------------------------------------------------------
045. 투표 결과 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/votes/{{VOTE_ID}}/result
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "voteId": 1,
        "type": "EXPENSE",
        "title": "회식비 30만원 지출 승인",
        "status": "APPROVED",
        "result": {
            "passed": true,
            "approve": 8,
            "reject": 1,
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
                "choice": "APPROVE",
                "votedAt": "2026-01-16T11:00:00Z"
            }
        ],
        "completedAt": "2026-01-17T23:59:59Z"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    VOTE_007 (400) - 아직 진행 중인 투표입니다
    VOTE_003 (403) - 투표 조회 권한이 없습니다
    VOTE_001 (404) - 투표를 찾을 수 없습니다


################################################################################
#                                                                              #
#   8. EXPENSE API (6개)                                                       #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
046. 지출 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/expenses?status=ALL&category=ALL&startDate=2026-01-01&endDate=2026-01-31&page=0&size=20
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "expenseId": 1,
                "title": "1월 모임 장소 대여비",
                "amount": 50000,
                "category": "EVENT",
                "status": "COMPLETED",
                "requestedBy": {
                    "userId": 1,
                    "nickname": "홍길동"
                },
                "createdAt": "2026-01-10T10:00:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 5,
            "totalPages": 1
        },
        "totalAmount": 250000
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - status = ALL | PENDING | VOTING | APPROVED | REJECTED | EXECUTING | COMPLETED | CANCELLED
    - category = ALL | FOOD | TRANSPORT | SUPPLIES | EVENT | OTHER
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
047. 지출 상세 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/expenses/{{EXPENSE_ID}}
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "expenseId": 1,
        "challengeId": 1,
        "title": "1월 모임 장소 대여비",
        "description": "스터디카페 3시간 대여",
        "amount": 50000,
        "category": "EVENT",
        "status": "COMPLETED",
        "requestedBy": {
            "userId": 1,
            "nickname": "홍길동",
            "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
        },
        "meetingId": 1,
        "receiptUrl": "https://cdn.woorido.com/receipts/1.jpg",
        "vote": {
            "voteId": 3,
            "status": "APPROVED",
            "approveCount": 8,
            "rejectCount": 1
        },
        "barcode": {
            "barcodeNumber": "WRD1705123456001234",
            "status": "USED",
            "usedAt": "2026-01-15T14:30:00Z"
        },
        "createdAt": "2026-01-10T10:00:00Z",
        "completedAt": "2026-01-15T14:30:00Z"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    EXPENSE_003 (403) - 지출 조회 권한이 없습니다
    EXPENSE_001 (404) - 지출을 찾을 수 없습니다


--------------------------------------------------------------------------------
048. 지출 요청
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/expenses
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "title": "2월 모임 다과비",
    "description": "커피 10잔, 케이크 2개",
    "amount": 45000,
    "category": "FOOD",
    "meetingId": 2,
    "receiptUrl": "https://cdn.woorido.com/receipts/2.jpg"
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "expenseId": 2,
        "title": "2월 모임 다과비",
        "amount": 45000,
        "category": "FOOD",
        "status": "PENDING",
        "requestedBy": {
            "userId": 1,
            "nickname": "홍길동"
        },
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "지출이 요청되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: category = FOOD | TRANSPORT | SUPPLIES | EVENT | OTHER
Error Codes:
    EXPENSE_004 (400) - 지출 금액이 잔액을 초과합니다
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
049. 지출 요청 수정
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/expenses/{{EXPENSE_ID}}
Auth: 필요 (요청자)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "title": "2월 모임 다과비 (수정)",
    "amount": 48000,
    "description": "커피 10잔, 케이크 3개"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "expenseId": 2,
        "title": "2월 모임 다과비 (수정)",
        "amount": 48000,
        "status": "PENDING",
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "지출 요청이 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: PENDING 상태에서만 수정 가능
Error Codes:
    EXPENSE_005 (400) - PENDING 상태에서만 수정 가능합니다
    EXPENSE_006 (403) - 지출 요청자만 수정 가능합니다
    EXPENSE_001 (404) - 지출을 찾을 수 없습니다


--------------------------------------------------------------------------------
050. 지출 요청 취소
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/expenses/{{EXPENSE_ID}}
Auth: 필요 (요청자)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "expenseId": 2,
        "status": "CANCELLED",
        "cancelledAt": "2026-01-16T10:30:00Z"
    },
    "message": "지출 요청이 취소되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: PENDING 또는 VOTING 상태에서만 취소 가능
Error Codes:
    EXPENSE_005 (400) - 승인된 지출은 취소할 수 없습니다
    EXPENSE_006 (403) - 지출 요청자만 취소 가능합니다
    EXPENSE_001 (404) - 지출을 찾을 수 없습니다


--------------------------------------------------------------------------------
051. 지출 실행
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/expenses/{{EXPENSE_ID}}/execute
Auth: 필요 (리더)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "expenseId": 2,
        "status": "EXECUTING",
        "barcode": {
            "barcodeNumber": "WRD1705123456002345",
            "amount": 48000,
            "expiresAt": "2026-01-16T10:40:00Z"
        },
        "executedAt": "2026-01-16T10:30:00Z"
    },
    "message": "바코드가 발급되었습니다. 10분 내 결제해주세요.",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 바코드 유효시간 10분 (P-053)
    - APPROVED 상태에서만 실행 가능
Error Codes:
    EXPENSE_005 (400) - APPROVED 상태에서만 실행 가능합니다
    ACCOUNT_004 (400) - 챌린지 잔액이 부족합니다
    CHALLENGE_004 (403) - 리더만 실행할 수 있습니다
    EXPENSE_001 (404) - 지출을 찾을 수 없습니다


################################################################################
#                                                                              #
#   9. LEDGER API (5개)                                                        #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
052. 장부 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/ledger?type=ALL&startDate=2026-01-01&endDate=2026-01-31&page=0&size=20
Auth: 필요 (팔로워)
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "entryId": 1,
                "type": "INCOME",
                "category": "SUPPORT",
                "amount": 100000,
                "description": "홍길동 서포트 납입",
                "transactionDate": "2026-01-01",
                "relatedUser": {
                    "userId": 1,
                    "nickname": "홍길동"
                },
                "createdAt": "2026-01-01T10:00:00Z"
            },
            {
                "entryId": 2,
                "type": "EXPENSE",
                "category": "EVENT",
                "amount": 50000,
                "description": "1월 모임 장소 대여비",
                "transactionDate": "2026-01-15",
                "merchantName": "스터디카페 강남점",
                "merchantCategory": "서비스",
                "createdAt": "2026-01-15T14:30:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 20,
            "totalPages": 1
        },
        "summary": {
            "totalIncome": 1000000,
            "totalExpense": 150000,
            "balance": 850000
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: type = ALL | INCOME | EXPENSE
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
053. 장부 내보내기
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/ledger/export?format=EXCEL&startDate=2026-01-01&endDate=2026-01-31
Auth: 필요 (팔로워)
Priority: P2
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "downloadUrl": "https://cdn.woorido.com/exports/ledger_challenge_1_202601.xlsx",
        "fileName": "책벌레들_장부_2026년01월.xlsx",
        "fileSize": 15360,
        "expiresAt": "2026-01-17T10:30:00Z"
    },
    "message": "장부 내보내기가 완료되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: format = CSV | EXCEL | PDF
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
054. 장부 요약
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/ledger/summary?period=MONTH
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
                "event": 80000,
                "food": 50000,
                "supplies": 20000,
                "other": 0
            }
        },
        "followerStats": {
            "paidCount": 9,
            "unpaidCount": 1,
            "totalFollowers": 10,
            "paymentRate": 90.0
        },
        "trends": {
            "incomeChange": 5.5,
            "expenseChange": -2.3
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: period = WEEK | MONTH | YEAR | ALL
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
055. 장부 등록 (리더)
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/ledger
Auth: 필요 (리더)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "type": "EXPENSE",
    "category": "SUPPLIES",
    "amount": 30000,
    "description": "사무용품 구매",
    "transactionDate": "2026-01-15"
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "entryId": 21,
        "type": "EXPENSE",
        "category": "SUPPLIES",
        "amount": 30000,
        "description": "사무용품 구매",
        "newBalance": 820000,
        "createdBy": {
            "userId": 1,
            "nickname": "홍길동"
        },
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "장부가 등록되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - type: INCOME | EXPENSE
    - INCOME category: SUPPORT | ENTRY_FEE | OTHER
    - EXPENSE category: EVENT | FOOD | SUPPLIES | TRANSPORT | OTHER
Error Codes:
    LEDGER_001 (400) - 금액은 1원 이상이어야 합니다
    LEDGER_002 (400) - 챌린지 잔액이 부족합니다 (지출 시)
    CHALLENGE_004 (403) - 리더만 장부를 등록할 수 있습니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
056. 장부 수정 (리더)
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/ledger/{{ENTRY_ID}}
Auth: 필요 (리더)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "category": "FOOD",
    "amount": 35000,
    "description": "사무용품 및 다과 구매"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "entryId": 21,
        "type": "EXPENSE",
        "category": "FOOD",
        "amount": 35000,
        "description": "사무용품 및 다과 구매",
        "previousAmount": 30000,
        "amountDiff": 5000,
        "newBalance": 815000,
        "updatedBy": {
            "userId": 1,
            "nickname": "홍길동"
        },
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "장부가 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    LEDGER_001 (400) - 금액은 1원 이상이어야 합니다
    LEDGER_002 (400) - 챌린지 잔액이 부족합니다
    LEDGER_003 (400) - 정산 완료된 항목은 수정할 수 없습니다
    CHALLENGE_004 (403) - 리더만 장부를 수정할 수 있습니다
    LEDGER_004 (404) - 장부 항목을 찾을 수 없습니다


################################################################################
#                                                                              #
#   10. POST API (9개)                                                         #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
057. 피드 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/posts/feed?page=0&size=20
Auth: 필요
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "postId": 1,
                "challengeId": 1,
                "challengeName": "책벌레들",
                "title": "[공지] 2월 정기모임 안내",
                "content": "2월 정기모임은 2월 15일 토요일 오후 2시에...",
                "category": "NOTICE",
                "author": {
                    "userId": 1,
                    "nickname": "홍길동",
                    "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
                },
                "images": [
                    "https://cdn.woorido.com/posts/1_1.jpg"
                ],
                "likeCount": 8,
                "commentCount": 5,
                "isLiked": false,
                "isPinned": true,
                "createdAt": "2026-01-10T09:00:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 50,
            "totalPages": 3
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}


--------------------------------------------------------------------------------
058. 게시글 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/posts?category=ALL&page=0&size=20
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "postId": 1,
                "title": "[공지] 2월 정기모임 안내",
                "content": "2월 정기모임은 2월 15일...",
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
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 23,
            "totalPages": 2
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: category = ALL | NOTICE | GENERAL | QUESTION
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
059. 게시글 상세 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/posts/{{POST_ID}}
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "postId": 1,
        "challengeId": 1,
        "title": "[공지] 2월 정기모임 안내",
        "content": "2월 정기모임은 2월 15일 토요일 오후 2시에 강남역 스터디카페에서 진행됩니다.\n\n참석 여부를 댓글로 알려주세요!",
        "category": "NOTICE",
        "author": {
            "userId": 1,
            "nickname": "홍길동",
            "profileImage": "https://cdn.woorido.com/profiles/1.jpg"
        },
        "images": [
            "https://cdn.woorido.com/posts/1_1.jpg",
            "https://cdn.woorido.com/posts/1_2.jpg"
        ],
        "likeCount": 8,
        "commentCount": 5,
        "viewCount": 46,
        "isLiked": false,
        "isPinned": true,
        "createdAt": "2026-01-10T09:00:00Z",
        "updatedAt": "2026-01-10T09:00:00Z"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    POST_002 (403) - 게시글 조회 권한이 없습니다
    POST_001 (404) - 게시글을 찾을 수 없습니다


--------------------------------------------------------------------------------
060. 게시글 작성
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/posts
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "title": "이번 달 독서 후기",
    "content": "이번 달에 읽은 책 후기입니다.\n\n정말 좋은 책이었어요!",
    "category": "GENERAL",
    "images": [
        "https://cdn.woorido.com/uploads/temp_1.jpg"
    ]
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "postId": 24,
        "title": "이번 달 독서 후기",
        "category": "GENERAL",
        "author": {
            "userId": 2,
            "nickname": "김철수"
        },
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "게시글이 작성되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - category: NOTICE (리더만) | GENERAL | QUESTION
    - images: 최대 10개
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    CHALLENGE_004 (403) - 공지사항은 리더만 작성 가능합니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
061. 게시글 수정
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/posts/{{POST_ID}}
Auth: 필요 (작성자)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "title": "이번 달 독서 후기 (수정)",
    "content": "수정된 내용입니다."
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "postId": 24,
        "title": "이번 달 독서 후기 (수정)",
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "게시글이 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    POST_003 (403) - 게시글 작성자만 가능합니다
    POST_001 (404) - 게시글을 찾을 수 없습니다


--------------------------------------------------------------------------------
062. 게시글 삭제
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/posts/{{POST_ID}}
Auth: 필요 (작성자 또는 리더)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "postId": 24,
        "deleted": true,
        "deletedAt": "2026-01-16T10:30:00Z"
    },
    "message": "게시글이 삭제되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    POST_003 (403) - 게시글 작성자만 가능합니다
    POST_001 (404) - 게시글을 찾을 수 없습니다


--------------------------------------------------------------------------------
063. 게시글 좋아요
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/posts/{{POST_ID}}/like
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "postId": 24,
        "liked": true,
        "likeCount": 9
    },
    "message": "좋아요를 눌렀습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    POST_001 (404) - 게시글을 찾을 수 없습니다


--------------------------------------------------------------------------------
064. 게시글 좋아요 취소
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/posts/{{POST_ID}}/like
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "postId": 24,
        "liked": false,
        "likeCount": 8
    },
    "message": "좋아요를 취소했습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    POST_001 (404) - 게시글을 찾을 수 없습니다


--------------------------------------------------------------------------------
065. 이미지 업로드
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/upload/image
Auth: 필요
Priority: P0
Headers:
    Content-Type: multipart/form-data
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
    file: (이미지 파일, 최대 10MB)
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "imageUrl": "https://cdn.woorido.com/uploads/img_20260116_103000_abc123.jpg",
        "fileName": "img_20260116_103000_abc123.jpg",
        "fileSize": 245000
    },
    "message": "이미지가 업로드되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 지원 형식 - jpg, jpeg, png, gif, webp
Error Codes:
    FILE_001 (400) - 지원하지 않는 파일 형식입니다
    FILE_002 (400) - 파일 크기 초과 (최대 10MB)


################################################################################
#                                                                              #
#   11. COMMENT API (6개)                                                      #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
066. 댓글 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/posts/{{POST_ID}}/comments?page=0&size=50
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "commentId": 1,
                "content": "좋은 정보 감사합니다!",
                "author": {
                    "userId": 2,
                    "nickname": "김철수",
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
                            "nickname": "이영희"
                        },
                        "likeCount": 0,
                        "isLiked": false,
                        "createdAt": "2026-01-14T11:00:00Z"
                    }
                ],
                "replyCount": 1,
                "createdAt": "2026-01-14T10:35:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 50,
            "totalElements": 5,
            "totalPages": 1
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    POST_001 (404) - 게시글을 찾을 수 없습니다


--------------------------------------------------------------------------------
067. 댓글 작성
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/posts/{{POST_ID}}/comments
Auth: 필요 (팔로워)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "content": "좋은 글이네요!",
    "parentId": null
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "commentId": 6,
        "content": "좋은 글이네요!",
        "author": {
            "userId": 3,
            "nickname": "박영수"
        },
        "parentId": null,
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "댓글이 작성되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: parentId에 값 넣으면 대댓글
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    POST_001 (404) - 게시글을 찾을 수 없습니다
    COMMENT_001 (404) - 부모 댓글을 찾을 수 없습니다


--------------------------------------------------------------------------------
068. 댓글 수정
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/comments/{{COMMENT_ID}}
Auth: 필요 (작성자)
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "content": "수정된 댓글입니다"
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "commentId": 6,
        "content": "수정된 댓글입니다",
        "updatedAt": "2026-01-16T10:30:00Z"
    },
    "message": "댓글이 수정되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    COMMENT_002 (403) - 댓글 작성자만 가능합니다
    COMMENT_001 (404) - 댓글을 찾을 수 없습니다


--------------------------------------------------------------------------------
069. 댓글 삭제
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/comments/{{COMMENT_ID}}
Auth: 필요 (작성자 또는 리더)
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "commentId": 6,
        "deleted": true,
        "deletedAt": "2026-01-16T10:30:00Z"
    },
    "message": "댓글이 삭제되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 대댓글이 있는 댓글 삭제 시 "삭제된 댓글입니다"로 표시
Error Codes:
    COMMENT_002 (403) - 댓글 작성자만 가능합니다
    COMMENT_001 (404) - 댓글을 찾을 수 없습니다


--------------------------------------------------------------------------------
070. 댓글 좋아요
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/comments/{{COMMENT_ID}}/like
Auth: 필요 (팔로워)
Priority: P2
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "commentId": 1,
        "liked": true,
        "likeCount": 3
    },
    "message": "좋아요를 눌렀습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    COMMENT_001 (404) - 댓글을 찾을 수 없습니다


--------------------------------------------------------------------------------
071. 댓글 좋아요 취소
--------------------------------------------------------------------------------
Method: DELETE
URL: {{BASE_URL}}/comments/{{COMMENT_ID}}/like
Auth: 필요 (팔로워)
Priority: P2
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "commentId": 1,
        "liked": false,
        "likeCount": 2
    },
    "message": "좋아요를 취소했습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    CHALLENGE_003 (403) - 챌린지 팔로워가 아닙니다
    COMMENT_001 (404) - 댓글을 찾을 수 없습니다


################################################################################
#                                                                              #
#   12. REPORT API (2개)                                                       #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
072. 신고 접수
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/reports
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "targetType": "POST",
    "targetId": 15,
    "reason": "INAPPROPRIATE",
    "description": "부적절한 내용이 포함되어 있습니다.",
    "evidenceUrls": [
        "https://cdn.woorido.com/evidence/screenshot1.jpg"
    ]
}
Expected: 201 Created
Response:
{
    "success": true,
    "data": {
        "reportId": 5,
        "targetType": "POST",
        "targetId": 15,
        "status": "PENDING",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "신고가 접수되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - targetType: USER | POST | COMMENT | CHALLENGE
    - reason: SPAM | HARASSMENT | INAPPROPRIATE | FRAUD | OTHER
    - evidenceUrls: 최대 5개
Error Codes:
    VALIDATION_001 (400) - 상세 설명은 10자 이상 입력해주세요
    REPORT_002 (404) - 신고 대상을 찾을 수 없습니다
    REPORT_001 (409) - 이미 신고한 대상입니다


--------------------------------------------------------------------------------
073. 내 신고 내역 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/reports/me?status=ALL&page=0&size=20
Auth: 필요
Priority: P2
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "reportId": 5,
                "targetType": "POST",
                "targetId": 15,
                "reason": "INAPPROPRIATE",
                "status": "RESOLVED",
                "result": "해당 게시글이 삭제 처리되었습니다",
                "createdAt": "2026-01-14T10:30:00Z",
                "resolvedAt": "2026-01-15T14:00:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 3,
            "totalPages": 1
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: status = ALL | PENDING | REVIEWING | RESOLVED | REJECTED


################################################################################
#                                                                              #
#   13. NOTIFICATION API (5개)                                                 #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
074. 알림 목록 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/notifications?type=ALL&isRead=false&page=0&size=20
Auth: 필요
Priority: P0
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "notificationId": 101,
                "type": "SUPPORT",
                "title": "납입일 알림",
                "message": "내일은 '책벌레들'의 납입일입니다. 잔액을 확인해주세요.",
                "isRead": false,
                "data": {
                    "challengeId": 1,
                    "actionUrl": "/challenges/1"
                },
                "createdAt": "2026-01-16T09:00:00Z"
            },
            {
                "notificationId": 100,
                "type": "SNS",
                "title": "새 댓글",
                "message": "김철수님이 회원님의 게시글에 댓글을 남겼습니다.",
                "isRead": true,
                "data": {
                    "postId": 24,
                    "commentId": 6,
                    "actionUrl": "/posts/24"
                },
                "createdAt": "2026-01-15T15:00:00Z"
            }
        ],
        "page": {
            "number": 0,
            "size": 20,
            "totalElements": 45,
            "totalPages": 3
        },
        "unreadCount": 12
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: type = ALL | CHALLENGE | VOTE | MEETING | SUPPORT | SNS | SYSTEM


--------------------------------------------------------------------------------
075. 알림 읽음 처리
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/notifications/{{NOTIFICATION_ID}}/read
Auth: 필요
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "notificationId": 101,
        "isRead": true,
        "readAt": "2026-01-16T10:30:00Z"
    },
    "message": "알림을 읽음 처리했습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Error Codes:
    NOTIFICATION_001 (404) - 알림을 찾을 수 없습니다


--------------------------------------------------------------------------------
076. 전체 읽음 처리
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/notifications/read-all
Auth: 필요
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "readCount": 12
    },
    "message": "12개의 알림을 읽음 처리했습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}


--------------------------------------------------------------------------------
077. 알림 설정 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/notifications/settings
Auth: 필요
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "pushEnabled": true,
        "emailEnabled": false,
        "challengeAlerts": true,
        "supportAlerts": true,
        "voteAlerts": true,
        "meetingAlerts": true,
        "snsAlerts": true,
        "systemAlerts": true,
        "marketingAlerts": false
    },
    "timestamp": "2026-01-16T10:30:00Z"
}


--------------------------------------------------------------------------------
078. 알림 설정 변경
--------------------------------------------------------------------------------
Method: PUT
URL: {{BASE_URL}}/notifications/settings
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "pushEnabled": true,
    "emailEnabled": false,
    "snsAlerts": false,
    "marketingAlerts": false
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "pushEnabled": true,
        "emailEnabled": false,
        "challengeAlerts": true,
        "supportAlerts": true,
        "voteAlerts": true,
        "meetingAlerts": true,
        "snsAlerts": false,
        "systemAlerts": true,
        "marketingAlerts": false
    },
    "message": "알림 설정이 변경되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}


################################################################################
#                                                                              #
#   14. REFUND API (2개)                                                       #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
079. 환불 요청
--------------------------------------------------------------------------------
Method: POST
URL: {{BASE_URL}}/refunds
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Body:
{
    "challengeId": 1,
    "reason": "개인 사정으로 인해 챌린지에 더 이상 참여하기 어렵습니다."
}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "refundId": 10,
        "challengeId": 1,
        "requestedAmount": 200000,
        "estimatedAmount": 200000,
        "fee": 0,
        "status": "PENDING",
        "reason": "개인 사정으로 인해 챌린지에 더 이상 참여하기 어렵습니다.",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "message": "환불 요청이 접수되었습니다",
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 
    - 모집 중 탈퇴: 입회비 전액 환불
    - 진행 중: 환불 불가 (탈퇴 불가 정책)
    - 완료 후: 정산 후 자동 환급
Error Codes:
    REFUND_001 (400) - 환불 가능 금액을 초과했습니다
    REFUND_002 (400) - 환불 금액이 납입 금액을 초과합니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
080. 환불 상태 조회
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/refunds/{{REFUND_ID}}
Auth: 필요
Priority: P1
Headers:
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "refundId": 10,
        "challengeId": 1,
        "challengeName": "책벌레들",
        "requestedAmount": 200000,
        "approvedAmount": 200000,
        "fee": 0,
        "netAmount": 200000,
        "status": "COMPLETED",
        "reason": "개인 사정으로 인해 챌린지에 더 이상 참여하기 어렵습니다.",
        "processedAt": "2026-01-16T14:00:00Z",
        "completedAt": "2026-01-16T15:00:00Z",
        "createdAt": "2026-01-16T10:30:00Z"
    },
    "timestamp": "2026-01-16T16:00:00Z"
}
Note: status = PENDING | PROCESSING | COMPLETED | REJECTED
Error Codes:
    REFUND_003 (404) - 환불 요청을 찾을 수 없습니다

################################################################################
#                                                                              #
#   16. SEARCH API - Django (3개)                                              #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
083. 통합 검색
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/search
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    q: 저축 (필수, 2자 이상)
    type: ALL (선택: ALL/CHALLENGE/POST/USER)
    page: 0
    size: 20
Expected: 200 OK
Response:
{
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
                    "currentFollowers": 10
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: Django Elasticsearch 기반 통합 검색, Spring Gateway 경유
Error Codes:
    SEARCH_001 (400) - 검색어는 2자 이상 입력해주세요


--------------------------------------------------------------------------------
084. 챌린지 검색
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/search/challenges
Auth: 필요
Priority: P1
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    q: 저축 (필수)
    category: SAVINGS (선택: HOBBY/STUDY/EXERCISE/SAVINGS/TRAVEL/FOOD/CULTURE/OTHER)
    status: IN_PROGRESS (선택: RECRUITING/IN_PROGRESS/COMPLETED)
    minDeposit: 0 (선택)
    maxDeposit: 100000 (선택)
    minFollowers: 5 (선택)
    maxFollowers: 20 (선택)
    page: 0
    size: 20
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "content": [
            {
                "challengeId": 1,
                "title": "2026 저축 챌린지",
                "description": "함께 저축하는 모임입니다. 매달 5만원씩 저축해요!",
                "category": "SAVINGS",
                "status": "IN_PROGRESS",
                "leaderNickname": "홍길동",
                "currentFollowers": 10,
                "maxFollowers": 20,
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 카테고리, 상태, 보증금 범위, 인원 범위 필터링 지원
Error Codes:
    SEARCH_001 (400) - 검색어는 2자 이상 입력해주세요


--------------------------------------------------------------------------------
085. 검색어 자동완성
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/search/autocomplete
Auth: 필요
Priority: P2
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    q: 저 (필수, 1자 이상)
    type: CHALLENGE (선택: CHALLENGE/POST/USER)
    limit: 10 (선택, 최대 20)
Expected: 200 OK
Response:
{
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 실시간 자동완성, 1자 이상부터 검색 가능
Error Codes:
    SEARCH_001 (400) - 검색어를 입력해주세요


################################################################################
#                                                                              #
#   17. ANALYTICS API - Django (4개)                                           #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
086. 사용자 활동 통계
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/analytics/user/activity
Auth: 필요
Priority: P2
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    period: MONTH (선택: WEEK/MONTH/YEAR)
Expected: 200 OK
Response:
{
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
                "date": "2026-01-02",
                "depositAmount": 0,
                "activityScore": 60.0
            }
        ],
        "ranking": {
            "depositRank": 15,
            "activityRank": 8,
            "totalUsers": 1500
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 본인 활동 통계만 조회 가능, 기간별 트렌드 및 랭킹 제공
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


--------------------------------------------------------------------------------
087. 챌린지 분석
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/analytics/challenge/{{CHALLENGE_ID}}
Auth: 필요 (챌린지 팔로워만)
Priority: P2
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "challengeId": 1,
        "overview": {
            "totalDeposit": 1500000,
            "averageDeposit": 150000,
            "completionRate": 85.5,
            "activeFollowers": 10
        },
        "trends": {
            "depositTrend": [
                {"month": "2026-01", "amount": 500000},
                {"month": "2026-02", "amount": 520000}
            ],
            "followerTrend": [
                {"month": "2026-01", "joined": 10, "left": 0}
            ]
        },
        "followerAnalysis": [
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 챌린지 팔로워만 조회 가능, AI 기반 성공 확률 예측 포함
Error Codes:
    FOLLOWER_001 (403) - 챌린지에 참여하지 않았습니다
    CHALLENGE_001 (404) - 챌린지를 찾을 수 없습니다


--------------------------------------------------------------------------------
088. 전체 통계 대시보드
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/analytics/dashboard
Auth: 필요
Priority: P2
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Expected: 200 OK
Response:
{
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
                "followerCount": 45,
                "totalDeposit": 25000000
            },
            {
                "challengeId": 5,
                "title": "직장인 점심값 아끼기",
                "followerCount": 38,
                "totalDeposit": 19000000
            }
        ]
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 플랫폼 전체 통계, 모든 인증된 사용자 조회 가능
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


--------------------------------------------------------------------------------
089. 개인 리포트 생성
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/analytics/user/report
Auth: 필요
Priority: P3
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    period: MONTH (선택: MONTH/QUARTER/YEAR)
    format: JSON (선택: JSON/PDF)
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "reportId": "RPT_20260116_003",
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
        "downloadUrl": "https://cdn.woorido.com/reports/RPT_20260116_003.pdf"
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: PDF 형식 선택 시 downloadUrl 제공, 분기/연간 리포트 지원
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


################################################################################
#                                                                              #
#   18. RECOMMENDATION API - Django (2개)                                      #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
090. 챌린지 추천
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/recommendations/challenges
Auth: 필요
Priority: P2
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    limit: 10 (선택, 최대 20)
Expected: 200 OK
Response:
{
    "success": true,
    "data": {
        "recommendations": [
            {
                "challengeId": 15,
                "title": "직장인 점심값 아끼기",
                "category": "SAVINGS",
                "matchScore": 95.5,
                "reason": "회원님의 지출 패턴과 유사한 사용자들이 많이 참여하고 있습니다",
                "currentFollowers": 23,
                "maxFollowers": 30,
                "monthlyDeposit": 30000,
                "startDate": "2026-02-01"
            },
            {
                "challengeId": 22,
                "title": "주말 독서 모임",
                "category": "STUDY",
                "matchScore": 88.0,
                "reason": "관심 카테고리와 일치합니다",
                "currentFollowers": 12,
                "maxFollowers": 20,
                "monthlyDeposit": 20000,
                "startDate": "2026-02-01"
            }
        ],
        "basedOn": {
            "userPreferences": ["SAVINGS", "TRAVEL", "STUDY"],
            "similarUsers": 245,
            "algorithm": "collaborative_filtering_v2"
        }
    },
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: 협업 필터링 기반 ML 추천, 사용자 활동 패턴 분석
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다


--------------------------------------------------------------------------------
091. 맞춤형 저축 플랜 추천
--------------------------------------------------------------------------------
Method: GET
URL: {{BASE_URL}}/recommendations/savings-plan
Auth: 필요
Priority: P3
Headers:
    Content-Type: application/json
    Authorization: Bearer {{ACCESS_TOKEN}}
Query Parameters:
    monthlyBudget: 200000 (선택, 월 가용 예산)
    goalAmount: 1200000 (선택, 목표 금액)
    goalPeriod: 12 (선택, 목표 기간 - 개월)
Expected: 200 OK
Response:
{
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
                        "title": "고액 저축 도전",
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
    "timestamp": "2026-01-16T10:30:00Z"
}
Note: AI 기반 맞춤형 저축 플랜 추천, 리스크 수준별 플랜 제공
Error Codes:
    AUTH_001 (401) - 인증이 필요합니다
    VALIDATION_001 (400) - 목표 금액은 0보다 커야 합니다


################################################################################
#                                                                              #
#   테스트 시나리오 4: 검색 → 추천 → 가입 플로우                                #
#                                                                              #
################################################################################

Step 1: 로그인 (002)
    POST {{BASE_URL}}/auth/login
    → accessToken 저장

Step 2: 통합 검색 (083)
    GET {{BASE_URL}}/search?q=저축&type=ALL
    → 챌린지, 게시글, 사용자 통합 검색 결과 확인

Step 3: 챌린지 검색 (084)
    GET {{BASE_URL}}/search/challenges?q=저축&category=SAVINGS
    → 상세 필터링된 챌린지 목록 확인

Step 4: 챌린지 추천 조회 (090)
    GET {{BASE_URL}}/recommendations/challenges?limit=10
    → AI 기반 맞춤 추천 챌린지 확인

Step 5: 챌린지 상세 조회 (023)
    GET {{BASE_URL}}/challenges/{{CHALLENGE_ID}}
    → 보증금, 참여 조건 확인

Step 6: 챌린지 가입 (030)
    POST {{BASE_URL}}/challenges/{{CHALLENGE_ID}}/followers
    → 가입 완료


################################################################################
#                                                                              #
#   테스트 시나리오 5: 분석 리포트 조회 플로우                                   #
#                                                                              #
################################################################################

Step 1: 로그인 (002)
    POST {{BASE_URL}}/auth/login
    → accessToken 저장

Step 2: 사용자 활동 통계 조회 (086)
    GET {{BASE_URL}}/analytics/user/activity?period=MONTH
    → 월간 활동 통계 및 랭킹 확인

Step 3: 챌린지 분석 조회 (087)
    GET {{BASE_URL}}/analytics/challenge/{{CHALLENGE_ID}}
    → 챌린지 성과 분석 및 예측 확인

Step 4: 전체 대시보드 조회 (088)
    GET {{BASE_URL}}/analytics/dashboard
    → 플랫폼 전체 통계 확인

Step 5: 개인 리포트 생성 (089)
    GET {{BASE_URL}}/analytics/user/report?period=MONTH&format=PDF
    → PDF 리포트 다운로드 URL 수신

Step 6: 맞춤 저축 플랜 조회 (091)
    GET {{BASE_URL}}/recommendations/savings-plan?goalAmount=1200000&goalPeriod=12
    → AI 기반 저축 플랜 추천 확인


################################################################################
#                                                                              #
#   변경 이력                                                                   #
#                                                                              #
################################################################################

--------------------------------------------------------------------------------
v1.0.1 (2026-01-16)
--------------------------------------------------------------------------------
- 용어 변경 반영: member → follower (BACKLOG 2026-01-12)
  - currentMembers → currentFollowers
  - maxMembers → maxFollowers
  - minMembers → minFollowers
  - memberCount → followerCount
  - memberTrend → followerTrend
  - memberAnalysis → followerAnalysis
  - activeMembers → activeFollowers
- API 번호 재정렬 반영 (#19): 10_API_DJANGO.md 기준
- Django API 9개 추가:
  - SEARCH: 083 통합 검색, 084 챌린지 검색, 085 자동완성
  - ANALYTICS: 086 사용자 활동, 087 챌린지 분석, 088 대시보드, 089 개인 리포트
  - RECOMMENDATION: 090 챌린지 추천, 091 저축 플랜 추천
- 테스트 시나리오 추가: 시나리오 4 (검색→추천→가입), 시나리오 5 (분석 리포트)
- 에러 코드 추가: SEARCH_001, FOLLOWER_001

--------------------------------------------------------------------------------
v1.0.0 (2026-01-15)
--------------------------------------------------------------------------------
- 초기 버전 생성
- Spring API 83개 정의
- 테스트 시나리오 3개 정의


================================================================================
                              END OF DOCUMENT
================================================================================