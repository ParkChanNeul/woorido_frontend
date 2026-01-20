# WOORIDO 에러 코드 통합표

## 문서 정보

| 항목           | 내용                                                                      |
|----------------|---------------------------------------------------------------------------|
| 작성일         | 2026-01-16                                                                |
| 버전           | 1.0.0                                                                     |
| 기준 문서      | 01~10_API_*.md, 00_API_OVERVIEW.md                                        |
| 총 에러 코드   | 73개                                                                      |
| 도메인         | 15개 (AUTH, USER, ACCOUNT, CHALLENGE, MEMBER, MEETING, VOTE, POST, COMMENT, REPORT, NOTIFICATION, REFUND, SETTLEMENT, LEDGER, SEARCH, SUPPORT, VALIDATION) |

---

## 1. HTTP 상태 코드 정의

| 코드 | 설명                  | 사용 상황              |
|------|-----------------------|------------------------|
| 200  | OK                    | 조회/수정 성공         |
| 201  | Created               | 생성 성공              |
| 204  | No Content            | 삭제 성공              |
| 400  | Bad Request           | 유효성 검증 실패       |
| 401  | Unauthorized          | 인증 필요/실패         |
| 403  | Forbidden             | 권한 없음              |
| 404  | Not Found             | 리소스 없음            |
| 409  | Conflict              | 중복/충돌              |
| 500  | Internal Server Error | 서버 오류              |

---

## 2. 도메인별 에러 코드

### 2.1 인증 (AUTH)

| HTTP | 코드     | 메시지                                   | 발생 API                    |
|------|----------|------------------------------------------|-----------------------------|
| 401  | AUTH_001 | 이메일 또는 비밀번호가 일치하지 않습니다 | POST /auth/login            |
| 401  | AUTH_001 | 인증이 필요합니다                        | POST /auth/logout, 인증 필요 API 전체 |
| 401  | AUTH_004 | 리프레시 토큰이 만료되었습니다           | POST /auth/refresh          |
| 400  | AUTH_006 | 인증 코드가 일치하지 않습니다            | POST /auth/email/confirm    |
| 400  | AUTH_007 | 잠시 후 다시 시도해주세요                | POST /auth/email/verify     |
| 400  | AUTH_008 | 인증 코드가 만료되었습니다               | POST /auth/email/confirm    |
| 400  | AUTH_009 | 재설정 토큰이 만료되었습니다             | PUT /auth/password/reset    |
| 403  | AUTH_015 | 관리자 권한이 필요합니다                 | POST /challenges/{id}/settlement/process |

### 2.2 사용자 (USER)

| HTTP | 코드     | 메시지                                   | 발생 API                    |
|------|----------|------------------------------------------|-----------------------------|
| 404  | USER_001 | 사용자를 찾을 수 없습니다                | POST /auth/password/reset, GET /users/{userId} |
| 409  | USER_002 | 이미 존재하는 이메일입니다               | POST /auth/signup, POST /auth/email/verify |
| 400  | USER_003 | 현재 비밀번호가 일치하지 않습니다        | PUT /users/me/password      |
| 400  | USER_003 | 비밀번호가 일치하지 않습니다             | DELETE /users/me            |
| 400  | USER_004 | 당도가 음수인 사용자는 가입할 수 없습니다 | POST /challenges/{id}/join  |
| 403  | USER_005 | 탈퇴 대기 상태입니다                     | POST /auth/login            |
| 400  | USER_006 | 닉네임은 2-20자여야 합니다               | PUT /users/me, GET /users/check-nickname |
| 409  | USER_007 | 이미 사용 중인 닉네임입니다              | PUT /users/me               |
| 400  | USER_008 | 활성 챌린지에서 먼저 탈퇴해주세요        | DELETE /users/me            |
| 400  | USER_009 | 미정산 크레딧이 있습니다                 | DELETE /users/me            |

### 2.3 어카운트 (ACCOUNT)

| HTTP | 코드        | 메시지                                | 발생 API                          |
|------|-------------|---------------------------------------|-----------------------------------|
| 400  | ACCOUNT_002 | 충전 금액은 10,000원 이상이어야 합니다 | POST /accounts/charge             |
| 400  | ACCOUNT_003 | 출금 가능 금액을 초과했습니다         | POST /accounts/withdraw           |
| 400  | ACCOUNT_004 | 잔액이 부족합니다                     | POST /accounts/withdraw, POST /accounts/support, POST /challenges/{id}/join, POST /meetings/{id}/complete |
| 400  | ACCOUNT_005 | 일일 출금 한도를 초과했습니다         | POST /accounts/withdraw           |
| 400  | ACCOUNT_006 | 월간 출금 한도를 초과했습니다         | POST /accounts/withdraw           |
| 400  | ACCOUNT_007 | 충전 금액은 10,000원 단위여야 합니다  | POST /accounts/charge             |
| 400  | ACCOUNT_008 | 결제 수단은 CARD 또는 BANK_TRANSFER 만 가능합니다.  | POST /accounts/charge             |

### 2.4 챌린지 (CHALLENGE)

| HTTP | 코드          | 메시지                                   | 발생 API                                      |
|------|---------------|------------------------------------------|-----------------------------------------------|
| 404  | CHALLENGE_001 | 챌린지를 찾을 수 없습니다                | GET/PUT/DELETE /challenges/{id}, 챌린지 관련 전체 |
| 400  | CHALLENGE_002 | 이미 가입한 챌린지입니다                 | POST /challenges/{id}/join                    |
| 403  | CHALLENGE_003 | 챌린지 멤버가 아닙니다                   | GET /challenges/{id}/account, POST /accounts/support, 멤버 전용 API 전체 |
| 403  | CHALLENGE_004 | 리더만 수정할 수 있습니다                | PUT /challenges/{id}                          |
| 403  | CHALLENGE_004 | 리더만 삭제할 수 있습니다                | DELETE /challenges/{id}                       |
| 403  | CHALLENGE_004 | 리더만 모임을 생성할 수 있습니다         | POST /challenges/{id}/meetings                |
| 403  | CHALLENGE_004 | 리더만 모임을 수정할 수 있습니다         | PUT /meetings/{id}                            |
| 403  | CHALLENGE_004 | 리더만 완료 처리할 수 있습니다           | POST /meetings/{id}/complete                  |
| 403  | CHALLENGE_004 | 리더만 장부를 등록할 수 있습니다         | POST /challenges/{id}/ledger                  |
| 403  | CHALLENGE_004 | 리더만 장부를 수정할 수 있습니다         | PUT /ledger/{id}                              |
| 400  | CHALLENGE_005 | 챌린지 정원이 초과되었습니다             | POST /challenges/{id}/join                    |
| 400  | CHALLENGE_006 | 모집 중인 챌린지가 아닙니다              | POST /challenges/{id}/join                    |
| 400  | CHALLENGE_007 | 리더당 챌린지 생성 한도(3개)를 초과했습니다 | POST /challenges                             |
| 400  | CHALLENGE_010 | 활성화된 챌린지는 삭제할 수 없습니다     | DELETE /challenges/{id}                       |
| 400  | CHALLENGE_010 | 진행 중인 챌린지는 정산할 수 없습니다    | POST /challenges/{id}/settlement/process      |

### 2.5 멤버 (MEMBER)

| HTTP | 코드       | 메시지                                   | 발생 API                          |
|------|------------|------------------------------------------|-----------------------------------|
| 404  | MEMBER_001 | 멤버를 찾을 수 없습니다                  | GET /challenges/{id}/members/{memberId}, POST /challenges/{id}/delegate |
| 403  | MEMBER_001 | 챌린지에 참여하지 않았습니다             | GET /challenges/{id}/posts, GET /analytics/challenge/{id} |
| 400  | MEMBER_002 | 리더는 탈퇴할 수 없습니다 (위임 후 탈퇴) | DELETE /challenges/{id}/leave     |
| 403  | MEMBER_003 | 정지된 멤버는 투표할 수 없습니다         | PUT /votes/{id}/cast              |
| 400  | MEMBER_004 | 자신에게 위임할 수 없습니다              | POST /challenges/{id}/delegate    |
| 400  | MEMBER_005 | 정지된 멤버에게 위임할 수 없습니다       | POST /challenges/{id}/delegate    |

### 2.6 모임 (MEETING)

| HTTP | 코드        | 메시지                                   | 발생 API                          |
|------|-------------|------------------------------------------|-----------------------------------|
| 404  | MEETING_001 | 모임을 찾을 수 없습니다                  | GET/PUT /meetings/{id}, 모임 관련 전체 |
| 400  | MEETING_002 | 이미 지난 모임은 수정할 수 없습니다      | PUT /meetings/{id}                |
| 400  | MEETING_002 | 이미 지난 모임입니다                     | POST /meetings/{id}/attendance, DELETE /meetings/{id}/attendance |
| 400  | MEETING_003 | 이미 참석 의사를 표시했습니다            | POST /meetings/{id}/attendance    |
| 400  | MEETING_004 | 예정 일시는 최소 24시간 이후여야 합니다  | POST /challenges/{id}/meetings    |
| 400  | MEETING_005 | 이미 완료된 모임입니다                   | POST /meetings/{id}/complete      |
| 400  | MEETING_006 | 참석 의사를 표시하지 않았습니다          | DELETE /meetings/{id}/attendance  |

### 2.7 투표 (VOTE)

| HTTP | 코드     | 메시지                                       | 발생 API                          |
|------|----------|----------------------------------------------|-----------------------------------|
| 404  | VOTE_001 | 투표를 찾을 수 없습니다                      | GET /votes/{id}, PUT /votes/{id}/cast, GET /votes/{id}/result |
| 400  | VOTE_002 | 마감 시간은 최소 24시간 이후여야 합니다      | POST /challenges/{id}/votes       |
| 403  | VOTE_003 | 투표 조회 권한이 없습니다                    | GET /votes/{id}                   |
| 403  | VOTE_003 | 투표 권한이 없습니다                         | PUT /votes/{id}/cast              |
| 409  | VOTE_004 | 이미 진행 중인 동일 유형의 투표가 있습니다   | POST /challenges/{id}/votes       |
| 400  | VOTE_005 | 투표가 마감되었습니다                        | PUT /votes/{id}/cast              |
| 409  | VOTE_006 | 이미 투표하셨습니다                          | PUT /votes/{id}/cast              |
| 400  | VOTE_007 | 아직 진행 중인 투표입니다                    | GET /votes/{id}/result            |

### 2.8 게시글 (POST)

| HTTP | 코드     | 메시지                                   | 발생 API                          |
|------|----------|------------------------------------------|-----------------------------------|
| 403  | POST_002 | 공지사항은 모임장만 작성할 수 있습니다   | POST /challenges/{id}/posts       |
| 400  | POST_003 | 유효하지 않은 첨부파일입니다             | POST /challenges/{id}/posts       |
| 400  | POST_006 | 파일 크기가 10MB를 초과합니다            | POST /challenges/{id}/posts/upload |
| 400  | POST_007 | 지원하지 않는 파일 형식입니다            | POST /challenges/{id}/posts/upload |

### 2.9 신고 (REPORT)

| HTTP | 코드       | 메시지                     | 발생 API       |
|------|------------|----------------------------|----------------|
| 409  | REPORT_001 | 이미 신고한 대상입니다     | POST /reports  |
| 404  | REPORT_002 | 신고 대상을 찾을 수 없습니다 | POST /reports |

### 2.10 알림 (NOTIFICATION)

| HTTP | 코드              | 메시지                  | 발생 API                          |
|------|-------------------|-------------------------|-----------------------------------|
| 404  | NOTIFICATION_001  | 알림을 찾을 수 없습니다 | PUT /notifications/{id}/read      |

### 2.11 환불 (REFUND)

| HTTP | 코드       | 메시지                              | 발생 API      |
|------|------------|-------------------------------------|---------------|
| 400  | REFUND_001 | 현재 상태에서는 환불이 불가합니다   | POST /refunds |
| 400  | REFUND_002 | 환불 금액이 납입 금액을 초과합니다  | POST /refunds |

### 2.12 정산 (SETTLEMENT)

| HTTP | 코드           | 메시지                    | 발생 API                          |
|------|----------------|---------------------------|-----------------------------------|
| 404  | SETTLEMENT_001 | 정산 정보가 없습니다      | GET /challenges/{id}/settlement   |
| 400  | SETTLEMENT_002 | 이미 정산이 완료되었습니다 | POST /challenges/{id}/settlement/process |

### 2.13 장부 (LEDGER)

| HTTP | 코드       | 메시지                                | 발생 API                   |
|------|------------|---------------------------------------|----------------------------|
| 400  | LEDGER_001 | 금액은 1원 이상이어야 합니다          | POST /challenges/{id}/ledger, PUT /ledger/{id} |
| 400  | LEDGER_002 | 챌린지 잔액이 부족합니다              | POST /challenges/{id}/ledger, PUT /ledger/{id} |
| 400  | LEDGER_003 | 정산 완료된 항목은 수정할 수 없습니다 | PUT /ledger/{id}           |
| 404  | LEDGER_004 | 장부 항목을 찾을 수 없습니다          | PUT /ledger/{id}           |

### 2.14 검색 (SEARCH)

| HTTP | 코드       | 메시지                           | 발생 API    |
|------|------------|----------------------------------|-------------|
| 400  | SEARCH_001 | 검색어는 2자 이상 입력해주세요   | GET /search |

### 2.15 서포트 (SUPPORT)

| HTTP | 코드        | 메시지                             | 발생 API              |
|------|-------------|------------------------------------|-----------------------|
| 400  | SUPPORT_001 | 이미 이번 달 서포트를 납입했습니다 | POST /accounts/support |

### 2.16 유효성 검증 (VALIDATION)

| HTTP | 코드           | 메시지                                         | 발생 API                          |
|------|----------------|------------------------------------------------|-----------------------------------|
| 400  | VALIDATION_001 | 비밀번호는 8-20자, 영문+숫자+특수문자 포함     | POST /auth/signup                 |
| 400  | VALIDATION_001 | 비밀번호 형식이 올바르지 않습니다              | PUT /users/me/password, PUT /auth/password/reset |
| 400  | VALIDATION_001 | 유효성 검증 실패                               | POST /challenges                  |
| 400  | VALIDATION_001 | 상세 설명은 10자 이상 입력해주세요             | POST /reports                     |

---

## 3. 에러 코드 통계

### 3.1 도메인별 에러 코드 수

| 도메인       | 에러 코드 수 |
|--------------|--------------|
| AUTH         | 8            |
| USER         | 10           |
| ACCOUNT      | 7            |
| CHALLENGE    | 11           |
| MEMBER       | 6            |
| MEETING      | 7            |
| VOTE         | 8            |
| POST         | 4            |
| REPORT       | 2            |
| NOTIFICATION | 1            |
| REFUND       | 2            |
| SETTLEMENT   | 2            |
| LEDGER       | 4            |
| SEARCH       | 1            |
| SUPPORT      | 1            |
| VALIDATION   | 4            |
| **합계**     | **78**       |

### 3.2 HTTP 상태 코드별 분포

| HTTP 코드 | 에러 수 | 비율   |
|-----------|---------|--------|
| 400       | 46      | 59.0%  |
| 401       | 4       | 5.2%   |
| 403       | 15      | 19.5%  |
| 404       | 10      | 13.0%  |
| 409       | 5       | 6.5%   |
| **합계**  | **78**  | 100%   |

---

## 4. 에러 응답 형식

### 4.1 표준 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": { }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}
4.2 유효성 검증 에러 응답
Copy{
  "success": false,
  "error": {
    "code": "VALIDATION_001",
    "message": "유효성 검증 실패",
    "details": {
      "field": "email",
      "rejectedValue": "invalid-email",
      "reason": "올바른 이메일 형식이 아닙니다"
    }
  },
  "timestamp": "2026-01-14T10:30:00Z"
}
5. TODO / 미비 사항
항목	설명	우선순위
EXPENSE 에러 코드	05_API_EXPENSE.md 미작성으로 누락	High
에러 코드 번호 정리	일부 도메인 번호 불연속 (AUTH 002, 003, 005 누락)	Low
관련 문서
00_API_OVERVIEW.md
01_API_AUTH.md
02_API_USER.md
03_API_ACCOUNT.md
04_API_CHALLENGE.md
05_API_MEETING.md
06_API_VOTE.md
07_API_SNS.md
08_API_SYSTEM.md
09_API_LEDGER.md
10_API_DJANGO.md