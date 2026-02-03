================================================================================
WOORIDO Database Schema Document (Oracle)
================================================================================

Version         : 1.0.0
Last Updated    : 2026-01-15
Database        : Oracle 21c XE
ORM             : MyBatis 3.0.3
Transaction     : Spring Boot 3.2.3 (@Transactional)
Total Tables    : 32

================================================================================
목차
================================================================================

1. 사용자 도메인 (User Domain)
2. 챌린지 도메인 (Challenge Domain)
3. 모임 도메인 (Meeting Domain)
4. 지출 도메인 (Expense Domain)
5. 일반 투표 도메인 (General Vote Domain)
6. SNS 도메인 (SNS Domain)
7. 시스템 도메인 (System Domain)
8. 관리자 도메인 (Admin Domain)
9. 부록

================================================================================
중요 공지 (Important Notice)
================================================================================

※ 용어 변경 1: "gye" → "challenges"
  - 테이블명 "gye"는 레거시 용어입니다.
  - 실제 DB 스키마에서는 "challenges" 테이블명을 사용합니다.
  - 이 문서의 모든 스키마는 "challenges" 기준으로 작성되었습니다.
  - View 별칭 없이 실제 테이블명이 "challenges"입니다.

※ 용어 정의 2: "member" vs "follower" vs "leader"
  - 멤버(member): 챌린지(계) 내 전체 인원 (계주 + 계원)
  - 리더(leader): 계주 - 챌린지를 생성하고 관리하는 멤버
  - 팔로워(follower): 계원 - 리더가 아닌 일반 멤버
  - 테이블명 "challenge_members"는 전체 멤버(리더 포함)를 저장합니다.
  - 컬럼명: current_members, min_members, max_members는 전체 인원 수입니다.
  - role 컬럼으로 LEADER(계주)/FOLLOWER(계원)를 구분합니다.


################################################################################
#                                                                              #
#   1. 사용자 도메인 (User Domain)                                              #
#                                                                              #
#   사용자 계정, 계좌, 거래 내역, 당도 점수 관리                                   #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
1.1 users (사용자)
--------------------------------------------------------------------------------

컬럼명                        데이터타입        제약조건      기본값       설명
------------------------------------------------------------------------------------------
id                           VARCHAR2(36)     PK                        사용자 ID (UUID)
email                        VARCHAR2(100)    UK, NN                    이메일
password_hash                VARCHAR2(255)                              비밀번호 해시
name                         VARCHAR2(50)     NN                        이름
nickname                     VARCHAR2(50)                               닉네임 (표시명)
phone                        VARCHAR2(20)                               전화번호
profile_image_url            VARCHAR2(500)                              프로필 이미지 URL
birth_date                   DATE                                       생년월일
gender                       CHAR(1)                                    성별
bio                          VARCHAR2(500)                              자기소개
is_verified                  CHAR(1)                        'N'         이메일 인증 여부
verification_token           VARCHAR2(100)                              인증 토큰
verification_token_expires   TIMESTAMP                                  인증 토큰 만료
social_provider              VARCHAR2(20)                               소셜 제공자
social_id                    VARCHAR2(100)                              소셜 ID
password_reset_token         VARCHAR2(100)                              비밀번호 재설정 토큰
password_reset_expires       TIMESTAMP                                  재설정 토큰 만료
failed_login_attempts        NUMBER(10)                     0           로그인 실패 횟수
locked_until                 TIMESTAMP                                  계정 잠금 해제 시간
account_status               VARCHAR2(20)                   'ACTIVE'    계정 상태
suspended_at                 TIMESTAMP                                  정지 시작일
suspended_until              TIMESTAMP                                  정지 종료일
suspension_reason            VARCHAR2(500)                              정지 사유
created_at                   TIMESTAMP        NN                        생성일
updated_at                   TIMESTAMP        NN                        수정일
last_login_at                TIMESTAMP                                  마지막 로그인
agreed_terms                 CHAR(1)                        'N'         이용약관 동의
agreed_privacy               CHAR(1)                        'N'         개인정보 동의
agreed_marketing             CHAR(1)                        'N'         마케팅 동의
terms_agreed_at              TIMESTAMP                                  약관 동의 시점

[컬럼값 정의]
  - gender          : M(남성), F(여성), O(기타)
  - social_provider : GOOGLE, KAKAO, NAVER
  - account_status  : ACTIVE(활성), SUSPENDED(정지), BANNED(차단), WITHDRAWN(탈퇴)
  - is_verified     : Y(인증완료), N(미인증)
  - agreed_terms    : Y(동의), N(미동의)
  - agreed_privacy  : Y(동의), N(미동의)
  - agreed_marketing: Y(동의), N(미동의)

[Indexes]
  - UK_users_email (email)
  - UK_users_nickname (nickname)
  - IDX_users_social (social_provider, social_id)
  - IDX_users_account_status (account_status)


--------------------------------------------------------------------------------
1.2 accounts (사용자 계좌)
--------------------------------------------------------------------------------

컬럼명              데이터타입        제약조건        기본값    설명
------------------------------------------------------------------------------------------
id                 VARCHAR2(36)     PK                       계좌 ID (UUID)
user_id            VARCHAR2(36)     FK, UK, NN               사용자 ID
balance            NUMBER(19)       NN             0         가용 잔액
locked_balance     NUMBER(19)       NN             0         보증금 락
bank_code          VARCHAR2(10)                              출금 은행 코드
account_number     VARCHAR2(50)                              출금 계좌번호
account_holder     VARCHAR2(50)                              예금주
version            NUMBER(10)       NN             0         동시성 제어
created_at         TIMESTAMP        NN                       생성일
updated_at         TIMESTAMP        NN                       수정일

[Indexes]
  - UK_accounts_user_id (user_id)

[Foreign Keys]
  - user_id → users.id


--------------------------------------------------------------------------------
1.3 account_transactions (계좌 거래 내역)
--------------------------------------------------------------------------------

컬럼명              데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id                 VARCHAR2(36)     PK                      거래 ID (UUID)
account_id         VARCHAR2(36)     FK, NN                  계좌 ID
type               VARCHAR2(20)     NN                      거래 유형
amount             NUMBER(19)       NN                      금액
balance_before     NUMBER(19)       NN                      거래 전 잔액
balance_after      NUMBER(19)       NN                      거래 후 잔액
locked_before      NUMBER(19)       NN                      거래 전 락 잔액
locked_after       NUMBER(19)       NN                      거래 후 락 잔액
idempotency_key    VARCHAR2(100)    UK                      중복 방지 키
related_challenge_id     VARCHAR2(36)     FK                      관련 챌린지 ID
related_user_id    VARCHAR2(36)     FK                      관련 사용자 ID
description        VARCHAR2(500)                            설명
pg_provider        VARCHAR2(30)                             PG사
pg_tx_id           VARCHAR2(100)                            PG 거래 ID
created_at         TIMESTAMP        NN                      생성일

[컬럼값 정의]
  - type : CHARGE(충전), WITHDRAW(출금), LOCK(보증금락), UNLOCK(보증금해제),
           SUPPORT(서포트납입), ENTRY_FEE(입회비), REFUND(환불)

[Indexes]
  - UK_account_tx_idempotency (idempotency_key)
  - IDX_account_tx_account_id (account_id)
  - IDX_account_tx_type (type)
  - IDX_account_tx_created_at (created_at)

[Foreign Keys]
  - account_id → accounts.id
  - related_challenge_id → challenges.id
  - related_user_id → users.id


--------------------------------------------------------------------------------
1.4 user_scores (사용자 당도 점수)
--------------------------------------------------------------------------------

컬럼명                       데이터타입        제약조건        기본값    설명
------------------------------------------------------------------------------------------
id                          VARCHAR2(36)     PK                        점수 ID (UUID)
user_id                     VARCHAR2(36)     FK, UK, NN                사용자 ID
total_attendance_count      NUMBER(10)                      0          모임 참석 횟수
total_payment_months        NUMBER(10)                      0          납입 개월 수
total_overdue_count         NUMBER(10)                      0          연체 횟수
consecutive_overdue_count   NUMBER(10)                      0          연속 연체 횟수
total_feed_count            NUMBER(10)                      0          피드 작성 수
total_comment_count         NUMBER(10)                      0          댓글 작성 수
total_like_given_count      NUMBER(10)                      0          좋아요 수
total_leader_months         NUMBER(10)                      0          리더 경험 개월
total_vote_absence_count    NUMBER(10)                      0          투표 불참 횟수
total_report_received_count NUMBER(10)                      0          신고 당한 횟수
total_kick_count            NUMBER(10)                      0          강퇴 당한 횟수
payment_score               NUMBER(10,4)                    0          납입 점수
activity_score              NUMBER(10,4)                    0          활동 점수
total_score                 NUMBER(10,4)                    12         최종 당도
calculated_at               TIMESTAMP                                  계산 시점
calculated_month            VARCHAR2(7)                                계산 기준월 (YYYY-MM)
created_at                  TIMESTAMP        NN                        생성일
updated_at                  TIMESTAMP        NN                        수정일

[Indexes]
  - UK_user_scores_user_id (user_id)
  - IDX_user_scores_total_score (total_score)

[Foreign Keys]
  - user_id → users.id


--------------------------------------------------------------------------------
1.5 refresh_tokens (리프레시 토큰)
--------------------------------------------------------------------------------

※ 보안 권장: users 테이블 분리로 토큰 노출 방지, 빈번한 토큰 갱신 시 users 테이블 락 방지

컬럼명              데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id                 VARCHAR2(36)     PK                      토큰 ID (UUID)
user_id            VARCHAR2(36)     FK, NN                  사용자 ID
token              VARCHAR2(500)    UK, NN                  리프레시 토큰 (해시 저장 권장)
device_info        VARCHAR2(500)                            디바이스 정보 (User-Agent)
ip_address         VARCHAR2(45)                             발급 시 IP 주소
expires_at         TIMESTAMP        NN                      만료 시간 (14일)
created_at         TIMESTAMP        NN                      생성일
last_used_at       TIMESTAMP                                마지막 사용 시간
is_revoked         CHAR(1)                        'N'       수동 무효화 여부

[컬럼값 정의]
  - is_revoked : Y(무효화됨), N(유효)

[Indexes]
  - UK_refresh_tokens_token (token)
  - IDX_refresh_tokens_user_id (user_id)
  - IDX_refresh_tokens_expires_at (expires_at)

[Foreign Keys]
  - user_id → users.id


################################################################################
#                                                                              #
#   2. 챌린지 도메인 (Challenge Domain)                                         #
#                                                                              #
#   챌린지 생성, 멤버 관리                                                        #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
2.1 challenges (챌린지)
--------------------------------------------------------------------------------
※ 주의:
  - 테이블명은 "challenges"입니다. "gye"는 레거시 용어입니다.
  - 컬럼명은 "current_members", "min_members", "max_members"입니다.
    (전체 인원 수 = 리더 + 팔로워)

컬럼명                  데이터타입        제약조건      기본값          설명
------------------------------------------------------------------------------------------
id                     VARCHAR2(36)     PK                           챌린지 ID (UUID)
name                   VARCHAR2(100)    NN                           챌린지명
description            VARCHAR2(2000)                                설명
category               VARCHAR2(50)     NN                           카테고리
creator_id             VARCHAR2(36)     FK, NN                       리더 ID
leader_last_active_at  TIMESTAMP                                     리더 마지막 활동일
leader_benefit_rate    NUMBER(5,4)                    0              리더 혜택 비율 (0.0500 = 5%)
current_members        NUMBER(10)       NN            1              현재 멤버 수
min_members            NUMBER(10)       NN            3              최소 멤버 수
max_members            NUMBER(10)       NN                           최대 멤버 수
balance                NUMBER(19)       NN            0              챌린지 금고 잔액
monthly_fee            NUMBER(19)       NN                           월 서포트 금액
deposit_amount         NUMBER(19)       NN                           보증금
status                 VARCHAR2(20)                   'RECRUITING'   상태
activated_at           TIMESTAMP                                     ACTIVE 전환 시점
is_verified            CHAR(1)                        'N'            완주 인증 여부
verified_at            TIMESTAMP                                     인증 시점
is_public              CHAR(1)                        'Y'            공개 여부
thumbnail_url          VARCHAR2(500)                                 썸네일
banner_url             VARCHAR2(500)                                 배너
deleted_at             TIMESTAMP                                     삭제일 (Soft Delete)
dissolution_reason     VARCHAR2(500)                                 해산 사유
version                NUMBER(10)       NN            0              동시성 제어
created_at             TIMESTAMP        NN                           생성일
updated_at             TIMESTAMP        NN                           수정일

[컬럼값 정의]
  - category    : HOBBY(취미), STUDY(학습), EXERCISE(운동), SAVINGS(저축),
                  TRAVEL(여행), FOOD(음식), CULTURE(문화), OTHER(기타)
  - status      : RECRUITING(모집중), IN_PROGRESS(진행중), COMPLETED(완료)
  - is_verified : Y(인증완료), N(미인증)
  - is_public   : Y(공개), N(비공개)

[Indexes]
  - IDX_challenges_creator_id (creator_id)
  - IDX_challenges_status (status)
  - IDX_challenges_category (category)
  - IDX_challenges_is_public (is_public)

[Foreign Keys]
  - creator_id → users.id


--------------------------------------------------------------------------------
2.2 challenge_members (챌린지 멤버)
--------------------------------------------------------------------------------
※ 주의:
  - 테이블명은 "challenge_members"입니다. 전체 멤버(리더 + 팔로워)를 저장합니다.
  - role 컬럼으로 LEADER/FOLLOWER를 구분합니다.

컬럼명                데이터타입        제약조건      기본값       설명
------------------------------------------------------------------------------------------
id                   VARCHAR2(36)     PK                        멤버십 ID (UUID)
challenge_id               VARCHAR2(36)     FK, NN                    챌린지 ID
user_id              VARCHAR2(36)     FK, NN                    사용자 ID
role                 VARCHAR2(20)                  'FOLLOWER'   역할
deposit_status       VARCHAR2(20)                  'NONE'       보증금 상태
deposit_locked_at    TIMESTAMP                                  보증금 락 시점
deposit_unlocked_at  TIMESTAMP                                  보증금 해제 시점
entry_fee_amount     NUMBER(19)                    0            입회비 금액
entry_fee_paid_at    TIMESTAMP                                  입회비 납부일
privilege_status     VARCHAR2(20)                  'ACTIVE'     권한 상태
privilege_revoked_at TIMESTAMP                                  권한 박탈 시점
last_support_paid_at TIMESTAMP                                  마지막 서포트 납입일
total_support_paid   NUMBER(19)                    0            총 서포트 납입액
auto_pay_enabled     CHAR(1)                       'Y'          자동 납입 설정
joined_at            TIMESTAMP        NN                        가입일
left_at              TIMESTAMP                                  탈퇴일
leave_reason         VARCHAR2(50)                               탈퇴 사유

[컬럼값 정의]
  - role             : LEADER(리더), FOLLOWER(팔로워)
  - deposit_status   : NONE(없음), LOCKED(락됨), USED(사용됨), UNLOCKED(해제됨)
  - privilege_status : ACTIVE(활성), REVOKED(박탈)
  - leave_reason     : NORMAL(정상탈퇴), KICKED(강퇴), AUTO_LEAVE(자동탈퇴), 
                       CHALLENGE_CLOSED(챌린지종료)

[Indexes]
  - UK_challenge_members_challenge_user (challenge_id, user_id)
  - IDX_challenge_members_user_id (user_id)
  - IDX_challenge_members_role (role)

[Foreign Keys]
  - challenge_id → challenges.id
  - user_id → users.id


################################################################################
#                                                                              #
#   3. 모임 도메인 (Meeting Domain)                                             #
#                                                                              #
#   모임 생성, 참석 투표 관리                                                    #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
3.1 meetings (모임)
--------------------------------------------------------------------------------

컬럼명          데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id             VARCHAR2(36)     PK                       모임 ID (UUID)
challenge_id         VARCHAR2(36)     FK, NN                   챌린지 ID
created_by     VARCHAR2(36)     FK, NN                   생성자 ID
title          VARCHAR2(200)    NN                       모임 제목
description    VARCHAR2(2000)                            모임 설명
meeting_date   TIMESTAMP        NN                       모임 일시
location       VARCHAR2(500)                             모임 장소
status         VARCHAR2(20)                  'VOTING'    상태
created_at     TIMESTAMP        NN                       생성일
updated_at     TIMESTAMP        NN                       수정일
confirmed_at   TIMESTAMP                                 확정 시점
completed_at   TIMESTAMP                                 완료 시점

[컬럼값 정의]
  - status : VOTING(투표중), CONFIRMED(확정), COMPLETED(완료), CANCELLED(취소)

[Indexes]
  - IDX_meetings_challenge_id (challenge_id)
  - IDX_meetings_status (status)
  - IDX_meetings_meeting_date (meeting_date)

[Foreign Keys]
  - challenge_id → challenges.id
  - created_by → users.id


--------------------------------------------------------------------------------
3.2 meeting_votes (모임 참석 투표)
--------------------------------------------------------------------------------

컬럼명          데이터타입        제약조건        기본값      설명
------------------------------------------------------------------------------------------
id             VARCHAR2(36)     PK                        투표 ID (UUID)
meeting_id     VARCHAR2(36)     FK, UK, NN                모임 ID
required_count NUMBER(10)       NN                        필요 투표 수
attend_count   NUMBER(10)                      0          참석 투표 수
absent_count   NUMBER(10)                      0          불참 투표 수
status         VARCHAR2(20)                    'PENDING'  상태
version        NUMBER(10)       NN             0          동시성 제어
created_at     TIMESTAMP        NN                        생성일
expires_at     TIMESTAMP        NN                        만료 시간
closed_at      TIMESTAMP                                  종료 시점

[컬럼값 정의]
  - status : PENDING(진행중), APPROVED(승인), REJECTED(거절), EXPIRED(만료)

[Indexes]
  - UK_meeting_votes_meeting_id (meeting_id)
  - IDX_meeting_votes_status (status)
  - IDX_meeting_votes_expires_at (expires_at)

[Foreign Keys]
  - meeting_id → meetings.id


--------------------------------------------------------------------------------
3.3 meeting_vote_records (모임 투표 기록)
--------------------------------------------------------------------------------

컬럼명                   데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id                      VARCHAR2(36)     PK                       기록 ID (UUID)
meeting_vote_id         VARCHAR2(36)     FK, NN                   투표 ID
user_id                 VARCHAR2(36)     FK, NN                   사용자 ID
choice                  VARCHAR2(10)     NN                       투표 선택
actual_attendance       VARCHAR2(20)                  'PENDING'   실제 참석 여부
attendance_confirmed_at TIMESTAMP                                 참석 확인 시점
created_at              TIMESTAMP        NN                       생성일

[컬럼값 정의]
  - choice            : AGREE(참석), DISAGREE(불참)
  - actual_attendance : PENDING(대기중), ATTENDED(참석함)

[Indexes]
  - UK_meeting_vote_records_vote_user (meeting_vote_id, user_id)
  - IDX_meeting_vote_records_user_id (user_id)

[Foreign Keys]
  - meeting_vote_id → meeting_votes.id
  - user_id → users.id


################################################################################
#                                                                              #
#   4. 지출 도메인 (Expense Domain)                                            #
#                                                                              #
#   지출 요청, 지출 투표, 바코드 결제, 장부 관리                                #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
4.1 expense_requests (지출 요청)
--------------------------------------------------------------------------------

컬럼명        데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id           VARCHAR2(36)     PK                       요청 ID (UUID)
meeting_id   VARCHAR2(36)     FK, NN                   모임 ID
created_by   VARCHAR2(36)     FK, NN                   생성자 ID
title        VARCHAR2(200)    NN                       지출 제목
amount       NUMBER(19)       NN                       지출 금액
description  VARCHAR2(2000)                            지출 설명
receipt_url  VARCHAR2(500)                             영수증 URL
status       VARCHAR2(20)                  'VOTING'    상태
created_at   TIMESTAMP        NN                       생성일
approved_at  TIMESTAMP                                 승인 시점

[컬럼값 정의]
  - status : VOTING(투표중), APPROVED(승인), REJECTED(거절), 
             USED(사용됨), EXPIRED(만료), CANCELLED(취소)

[Indexes]
  - IDX_expense_requests_meeting_id (meeting_id)
  - IDX_expense_requests_status (status)

[Foreign Keys]
  - meeting_id → meetings.id
  - created_by → users.id


--------------------------------------------------------------------------------
4.2 expense_votes (지출 투표)
--------------------------------------------------------------------------------

컬럼명              데이터타입        제약조건        기본값      설명
------------------------------------------------------------------------------------------
id                 VARCHAR2(36)     PK                        투표 ID (UUID)
expense_request_id VARCHAR2(36)     FK, UK, NN                지출 요청 ID
eligible_count     NUMBER(10)       NN                        투표 자격자 수 (참석자만)
required_count     NUMBER(10)       NN                        필요 투표 수
approve_count      NUMBER(10)                      0          찬성 수
reject_count       NUMBER(10)                      0          반대 수
status             VARCHAR2(20)                    'PENDING'  상태
version            NUMBER(10)       NN             0          동시성 제어
created_at         TIMESTAMP        NN                        생성일
expires_at         TIMESTAMP        NN                        만료 시간
closed_at          TIMESTAMP                                  종료 시점

[컬럼값 정의]
  - status : PENDING(진행중), APPROVED(승인), REJECTED(거절), EXPIRED(만료)

[Indexes]
  - UK_expense_votes_expense_request_id (expense_request_id)
  - IDX_expense_votes_status (status)
  - IDX_expense_votes_expires_at (expires_at)

[Foreign Keys]
  - expense_request_id → expense_requests.id


--------------------------------------------------------------------------------
4.3 expense_vote_records (지출 투표 기록)
--------------------------------------------------------------------------------

컬럼명            데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id               VARCHAR2(36)     PK                     기록 ID (UUID)
expense_vote_id  VARCHAR2(36)     FK, NN                 투표 ID
user_id          VARCHAR2(36)     FK, NN                 사용자 ID
choice           VARCHAR2(10)     NN                     투표 선택
comment          VARCHAR2(500)                           의견
created_at       TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - choice : APPROVE(찬성), REJECT(반대)

[Indexes]
  - UK_expense_vote_records_vote_user (expense_vote_id, user_id)
  - IDX_expense_vote_records_user_id (user_id)

[Foreign Keys]
  - expense_vote_id → expense_votes.id
  - user_id → users.id


--------------------------------------------------------------------------------
4.4 payment_barcodes (결제 바코드)
--------------------------------------------------------------------------------

컬럼명                  데이터타입        제약조건        기본값     설명
------------------------------------------------------------------------------------------
id                     VARCHAR2(36)     PK                        바코드 ID (UUID)
expense_request_id     VARCHAR2(36)     FK, UK, NN                지출 요청 ID
challenge_id                 VARCHAR2(36)     FK, NN                    챌린지 ID
barcode_number         VARCHAR2(50)     UK, NN                    바코드 번호
amount                 NUMBER(19)       NN                        결제 금액
status                 VARCHAR2(20)                    'ACTIVE'   상태
used_at                TIMESTAMP                                  사용 시점
used_merchant_name     VARCHAR2(100)                              사용 상호명
used_merchant_category VARCHAR2(50)                               사용 업종
pg_tx_id               VARCHAR2(100)                              PG 거래 ID
expires_at             TIMESTAMP        NN                        만료 시간 (발급 후 10분, P-053)
created_at             TIMESTAMP        NN                        생성일

[컬럼값 정의]
  - status : ACTIVE(활성), USED(사용됨), EXPIRED(만료), CANCELLED(취소)

[Indexes]
  - UK_payment_barcodes_expense_request_id (expense_request_id)
  - UK_payment_barcodes_barcode_number (barcode_number)
  - IDX_payment_barcodes_challenge_id (challenge_id)
  - IDX_payment_barcodes_status (status)
  - IDX_payment_barcodes_expires_at (expires_at)

[Foreign Keys]
  - expense_request_id → expense_requests.id
  - challenge_id → challenges.id


--------------------------------------------------------------------------------
4.5 ledger_entries (챌린지 장부)
--------------------------------------------------------------------------------

컬럼명                       데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id                          VARCHAR2(36)     PK                     장부 ID (UUID)
challenge_id                      VARCHAR2(36)     FK, NN                 챌린지 ID
type                        VARCHAR2(20)     NN                     거래 유형
amount                      NUMBER(19)       NN                     금액
description                 VARCHAR2(500)                           설명
balance_before              NUMBER(19)       NN                     거래 전 잔액
balance_after               NUMBER(19)       NN                     거래 후 잔액
related_user_id             VARCHAR2(36)     FK                     관련 사용자 ID
related_meeting_id          VARCHAR2(36)     FK                     관련 모임 ID
related_expense_request_id  VARCHAR2(36)     FK                     관련 지출 요청 ID
related_barcode_id          VARCHAR2(36)     FK                     관련 바코드 ID
merchant_name               VARCHAR2(100)                           상호명 (PG 파싱)
merchant_category           VARCHAR2(50)                            업종
pg_provider                 VARCHAR2(30)                            PG사
pg_approval_number          VARCHAR2(50)                            PG 승인번호
memo                        VARCHAR2(500)                           리더 메모
memo_updated_at             TIMESTAMP                               메모 수정일
memo_updated_by             VARCHAR2(36)     FK                     메모 수정자 ID
created_at                  TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - type : SUPPORT(서포트입금), ENTRY_FEE(입회비입금), EXPENSE(지출), REFUND(환불)

[Indexes]
  - IDX_ledger_entries_challenge_id (challenge_id)
  - IDX_ledger_entries_type (type)
  - IDX_ledger_entries_created_at (created_at)
  - IDX_ledger_entries_related_user_id (related_user_id)

[Foreign Keys]
  - challenge_id → challenges.id
  - related_user_id → users.id
  - related_meeting_id → meetings.id
  - related_expense_request_id → expense_requests.id
  - related_barcode_id → payment_barcodes.id
  - memo_updated_by → users.id


--------------------------------------------------------------------------------
4.6 payment_logs (결제 시도/실패 이력)
--------------------------------------------------------------------------------

컬럼명              데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id                 VARCHAR2(36)     PK                     로그 ID (UUID)
payment_barcode_id VARCHAR2(36)     FK, NN                 바코드 ID
action             VARCHAR2(20)     NN                     액션 유형
request_data       CLOB                                    요청 데이터 (JSON)
response_data      CLOB                                    응답 데이터 (JSON)
error_code         VARCHAR2(50)                            에러 코드
error_message      VARCHAR2(500)                           에러 메시지
created_at         TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - action : REQUEST(요청), SUCCESS(성공), FAIL(실패), RETRY(재시도)

[Indexes]
  - IDX_payment_logs_barcode_id (payment_barcode_id)
  - IDX_payment_logs_action (action)
  - IDX_payment_logs_created_at (created_at)

[Foreign Keys]
  - payment_barcode_id → payment_barcodes.id


################################################################################
#                                                                              #
#   5. 일반 투표 도메인 (General Vote Domain)                                    #
#                                                                              #
#   팔로워 강퇴, 리더 탄핵, 챌린지 해산 투표 관리                                  #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
5.1 general_votes (일반 투표)
--------------------------------------------------------------------------------

컬럼명          데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id             VARCHAR2(36)     PK                       투표 ID (UUID)
challenge_id         VARCHAR2(36)     FK, NN                   챌린지 ID
created_by     VARCHAR2(36)     FK, NN                   생성자 ID
type           VARCHAR2(20)     NN                       투표 유형
title          VARCHAR2(200)    NN                       제목
description    VARCHAR2(2000)                            설명
target_user_id VARCHAR2(36)     FK                       퇴출 대상 ID
eligible_count NUMBER(10)       NN                       투표 자격자 수
required_count NUMBER(10)       NN                       필요 투표 수
approve_count  NUMBER(10)                    0           찬성 수
reject_count   NUMBER(10)                    0           반대 수
status         VARCHAR2(20)                  'PENDING'   상태
version        NUMBER(10)       NN           0           동시성 제어
created_at     TIMESTAMP        NN                       생성일
expires_at     TIMESTAMP        NN                       만료 시간
closed_at      TIMESTAMP                                 종료 시점

[컬럼값 정의]
  - type   : KICK(팔로워 강퇴), LEADER_KICK(리더 탄핵), DISSOLVE(챌린지 해산)
  - status : PENDING(진행중), APPROVED(승인), REJECTED(거절), EXPIRED(만료)

[Indexes]
  - IDX_general_votes_challenge_id (challenge_id)
  - IDX_general_votes_type (type)
  - IDX_general_votes_status (status)
  - IDX_general_votes_expires_at (expires_at)

[Foreign Keys]
  - challenge_id → challenges.id
  - created_by → users.id
  - target_user_id → users.id


--------------------------------------------------------------------------------
5.2 general_vote_records (일반 투표 기록)
--------------------------------------------------------------------------------

컬럼명            데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id               VARCHAR2(36)     PK                     기록 ID (UUID)
general_vote_id  VARCHAR2(36)     FK, NN                 투표 ID
user_id          VARCHAR2(36)     FK, NN                 사용자 ID
choice           VARCHAR2(10)     NN                     투표 선택
comment          VARCHAR2(500)                           의견
created_at       TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - choice : APPROVE(찬성), REJECT(반대)

[Indexes]
  - UK_general_vote_records_vote_user (general_vote_id, user_id)
  - IDX_general_vote_records_user_id (user_id)

[Foreign Keys]
  - general_vote_id → general_votes.id
  - user_id → users.id


################################################################################
#                                                                              #
#   6. SNS 도메인 (SNS Domain)                                                  #
#                                                                              #
#   피드, 이미지, 좋아요, 댓글 관리                                               #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
6.1 posts (피드)
--------------------------------------------------------------------------------

컬럼명         데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id            VARCHAR2(36)     PK                     피드 ID (UUID)
challenge_id        VARCHAR2(36)     FK                     챌린지 ID (NULL이면 공개)
created_by    VARCHAR2(36)     FK, NN                 작성자 ID
title         VARCHAR2(100)                           제목
content       VARCHAR2(4000)   NN                     내용
category      VARCHAR2(20)                  'GENERAL' 카테고리
is_notice     CHAR(1)                       'N'       공지사항 여부
is_pinned     CHAR(1)                       'N'       상단 고정 여부
like_count    NUMBER(10)                    0         좋아요 수
comment_count NUMBER(10)                    0         댓글 수
view_count    NUMBER(10)                    0         조회 수
created_at    TIMESTAMP        NN                     생성일
updated_at    TIMESTAMP        NN                     수정일
deleted_at    TIMESTAMP                               삭제일 (Soft Delete)

[컬럼값 정의]
  - category  : NOTICE(공지), GENERAL(일반), QUESTION(질문)
  - is_notice : Y(공지사항), N(일반 피드)
  - is_pinned : Y(상단고정), N(일반)

[Indexes]
  - IDX_posts_challenge_id (challenge_id)
  - IDX_posts_created_by (created_by)
  - IDX_posts_created_at (created_at)
  - IDX_posts_is_notice (is_notice)
  - IDX_posts_is_pinned (is_pinned)

[Foreign Keys]
  - challenge_id → challenges.id
  - created_by → users.id


--------------------------------------------------------------------------------
6.2 post_images (피드 이미지)
--------------------------------------------------------------------------------

컬럼명         데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id            VARCHAR2(36)     PK                     이미지 ID (UUID)
post_id       VARCHAR2(36)     FK, NN                 피드 ID
image_url     VARCHAR2(500)    NN                     이미지 URL
display_order NUMBER(10)       NN                     순서
created_at    TIMESTAMP        NN                     생성일

[Indexes]
  - IDX_post_images_post_id (post_id)

[Foreign Keys]
  - post_id → posts.id


--------------------------------------------------------------------------------
6.3 post_likes (좋아요)
--------------------------------------------------------------------------------

컬럼명       데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id          VARCHAR2(36)     PK                     좋아요 ID (UUID)
post_id     VARCHAR2(36)     FK, NN                 피드 ID
user_id     VARCHAR2(36)     FK, NN                 사용자 ID
created_at  TIMESTAMP        NN                     생성일

[Indexes]
  - UK_post_likes_post_user (post_id, user_id)
  - IDX_post_likes_user_id (user_id)

[Foreign Keys]
  - post_id → posts.id
  - user_id → users.id


--------------------------------------------------------------------------------
6.4 comments (댓글)
--------------------------------------------------------------------------------

컬럼명       데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id          VARCHAR2(36)     PK                     댓글 ID (UUID)
post_id     VARCHAR2(36)     FK, NN                 피드 ID
parent_id   VARCHAR2(36)     FK                     부모 댓글 ID (대댓글용)
created_by  VARCHAR2(36)     FK, NN                 작성자 ID
content     VARCHAR2(1000)   NN                     내용
like_count  NUMBER(10)                    0         좋아요 수
created_at  TIMESTAMP        NN                     생성일
updated_at  TIMESTAMP        NN                     수정일
deleted_at  TIMESTAMP                               삭제일 (Soft Delete)

[Indexes]
  - IDX_comments_post_id (post_id)
  - IDX_comments_parent_id (parent_id)
  - IDX_comments_created_by (created_by)

[Foreign Keys]
  - post_id → posts.id
  - parent_id → comments.id
  - created_by → users.id


--------------------------------------------------------------------------------
6.5 comment_likes (댓글 좋아요)
--------------------------------------------------------------------------------

컬럼명       데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id          VARCHAR2(36)     PK                     좋아요 ID (UUID)
comment_id  VARCHAR2(36)     FK, NN                 댓글 ID
user_id     VARCHAR2(36)     FK, NN                 사용자 ID
created_at  TIMESTAMP        NN                     생성일

[Indexes]
  - UK_comment_likes_comment_user (comment_id, user_id)
  - IDX_comment_likes_user_id (user_id)

[Foreign Keys]
  - comment_id → comments.id
  - user_id → users.id


################################################################################
#                                                                              #
#   7. 시스템 도메인 (System Domain)                                            #
#                                                                              #
#   알림, 신고, 세션 관리                                                        #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
7.1 notifications (알림)
--------------------------------------------------------------------------------

컬럼명               데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id                  VARCHAR2(36)     PK                     알림 ID (UUID)
user_id             VARCHAR2(36)     FK, NN                 사용자 ID
type                VARCHAR2(50)     NN                     알림 유형
title               VARCHAR2(200)    NN                     제목
content             VARCHAR2(500)    NN                     내용
link_url            VARCHAR2(500)                           이동 링크
related_entity_type VARCHAR2(20)                            관련 엔티티 타입
related_entity_id   VARCHAR2(36)                            관련 엔티티 ID
is_read             CHAR(1)                       'N'       읽음 여부
read_at             TIMESTAMP                               읽은 시간
created_at          TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - type :
    [챌린지 관련]
    CHALLENGE_JOINED(챌린지 가입 완료), CHALLENGE_LEFT(챌린지 탈퇴),
    CHALLENGE_ACTIVATED(챌린지 활성화), CHALLENGE_CLOSED(챌린지 종료),
    [서포트/납입 관련]
    SUPPORT_REMINDER(서포트 납입 알림), SUPPORT_PAID(서포트 납입 완료),
    SUPPORT_OVERDUE(서포트 연체 알림),
    [모임 관련]
    MEETING_CREATED(모임 생성), MEETING_VOTE_STARTED(모임 투표 시작),
    MEETING_CONFIRMED(모임 확정), MEETING_CANCELLED(모임 취소),
    MEETING_REMINDER(모임 일정 알림),
    [지출 관련]
    EXPENSE_VOTE_STARTED(지출 투표 시작), EXPENSE_APPROVED(지출 승인),
    EXPENSE_REJECTED(지출 거절), BARCODE_ISSUED(바코드 발급),
    [투표 관련]
    VOTE_STARTED(일반 투표 시작), VOTE_CLOSED(투표 종료),
    KICK_APPROVED(강퇴 승인), LEADER_KICKED(리더 탄핵),
    [SNS 관련]
    POST_LIKED(피드 좋아요), POST_COMMENTED(피드 댓글),
    COMMENT_LIKED(댓글 좋아요), COMMENT_REPLIED(대댓글),
    [시스템 관련]
    SYSTEM_NOTICE(시스템 공지), ACCOUNT_CHARGED(계좌 충전),
    ACCOUNT_WITHDRAWN(계좌 출금), REPORT_RESULT(신고 처리 결과)
  - is_read : Y(읽음), N(안읽음)

[Indexes]
  - IDX_notifications_user_id (user_id)
  - IDX_notifications_type (type)
  - IDX_notifications_is_read (is_read)
  - IDX_notifications_created_at (created_at)

[Foreign Keys]
  - user_id → users.id


--------------------------------------------------------------------------------
7.2 notification_settings (알림 설정)
--------------------------------------------------------------------------------

컬럼명                  데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id                     VARCHAR2(36)     PK                     설정 ID (UUID)
user_id                VARCHAR2(36)     FK, UK, NN             사용자 ID
push_enabled           CHAR(1)                       'Y'       푸시 알림 사용
email_enabled          CHAR(1)                       'N'       이메일 알림 사용
sms_enabled            CHAR(1)                       'N'       SMS 알림 사용
vote_notification      CHAR(1)                       'Y'       투표 알림
meeting_notification   CHAR(1)                       'Y'       모임 알림
expense_notification   CHAR(1)                       'Y'       지출 알림
sns_notification       CHAR(1)                       'Y'       SNS 알림
system_notification    CHAR(1)                       'Y'       시스템 알림
quiet_hours_enabled    CHAR(1)                       'N'       방해금지 시간 사용
quiet_hours_start      VARCHAR2(5)                             방해금지 시작(HH:MM)
quiet_hours_end        VARCHAR2(5)                             방해금지 종료(HH:MM)
created_at             TIMESTAMP        NN                     생성일
updated_at             TIMESTAMP        NN                     수정일

[컬럼값 정의]
  - *_enabled : Y(사용), N(미사용)

[Indexes]
  - UK_notification_settings_user_id (user_id)

[Foreign Keys]
  - user_id → users.id


--------------------------------------------------------------------------------
7.3 reports (신고)
--------------------------------------------------------------------------------

컬럼명                데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id                   VARCHAR2(36)     PK                       신고 ID (UUID)
reporter_user_id     VARCHAR2(36)     FK, NN                   신고자 ID
reported_user_id     VARCHAR2(36)     FK, NN                   피신고자 ID
reported_entity_type VARCHAR2(20)     NN                       신고 대상 타입
reported_entity_id   VARCHAR2(36)                              신고 대상 ID
reason_category      VARCHAR2(50)     NN                       신고 카테고리
reason_detail        VARCHAR2(500)                             상세 사유
status               VARCHAR2(20)                  'PENDING'   상태
reviewed_at          TIMESTAMP                                 검토 시점
reviewed_by          VARCHAR2(36)     FK                       검토자 ID
admin_note           VARCHAR2(500)                             관리자 메모
created_at           TIMESTAMP        NN                       생성일

[컬럼값 정의]
  - reported_entity_type : USER(사용자), POST(피드), COMMENT(댓글), CHALLENGE(챌린지)
  - reason_category      : SPAM(스팸/광고), ABUSE(욕설/비방), FRAUD(사기/허위정보),
                           INAPPROPRIATE(부적절한 콘텐츠), OTHER(기타)
  - status               : PENDING(대기중), CONFIRMED(확인됨),
                           REJECTED(기각), FALSE_REPORT(허위신고)

[Indexes]
  - IDX_reports_reporter_user_id (reporter_user_id)
  - IDX_reports_reported_user_id (reported_user_id)
  - IDX_reports_status (status)
  - IDX_reports_created_at (created_at)

[Foreign Keys]
  - reporter_user_id → users.id
  - reported_user_id → users.id
  - reviewed_by → admins.id


--------------------------------------------------------------------------------
7.4 sessions (세션)
--------------------------------------------------------------------------------

컬럼명        데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id           VARCHAR2(36)     PK                     세션 ID (UUID)
user_id      VARCHAR2(36)     FK, NN                 사용자 ID
session_type VARCHAR2(20)     NN                     세션 유형
return_url   VARCHAR2(500)    NN                     복귀 URL
is_used      CHAR(1)                       'N'       사용 여부
created_at   TIMESTAMP        NN                     생성일
expires_at   TIMESTAMP        NN                     만료 시간

[컬럼값 정의]
  - session_type : LOGIN(로그인), CHARGE(충전), JOIN(가입), WITHDRAW(출금)
  - is_used      : Y(사용됨), N(미사용)

[Indexes]
  - IDX_sessions_user_id (user_id)
  - IDX_sessions_expires_at (expires_at)

[Foreign Keys]
  - user_id → users.id


--------------------------------------------------------------------------------
7.5 webhook_logs (Webhook 수신 로그)
--------------------------------------------------------------------------------

컬럼명         데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id            VARCHAR2(36)     PK                     로그 ID (UUID)
source        VARCHAR2(30)     NN                     수신 출처
event_type    VARCHAR2(50)     NN                     이벤트 유형
event_id      VARCHAR2(100)    UK                     이벤트 ID (중복 방지)
payload       CLOB             NN                     수신 데이터 (JSON)
is_processed  CHAR(1)                       'N'       처리 여부
processed_at  TIMESTAMP                               처리 시점
error_message VARCHAR2(500)                           처리 실패 사유
created_at    TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - source       : TOSS(토스페이먼츠), KAKAO(카카오), NAVER(네이버) 등
  - is_processed : Y(처리완료), N(미처리), F(실패)

[Indexes]
  - UK_webhook_logs_event_id (event_id)
  - IDX_webhook_logs_source (source)
  - IDX_webhook_logs_is_processed (is_processed)
  - IDX_webhook_logs_created_at (created_at)

[Foreign Keys]
  - 없음


################################################################################
#                                                                              #
#   8. 관리자 도메인 (Admin Domain)                                             #
#                                                                              #
#   관리자 계정, 수수료 정책, 활동 로그 관리                                    #
#                                                                              #
################################################################################


--------------------------------------------------------------------------------
8.1 admins (관리자)
--------------------------------------------------------------------------------

컬럼명         데이터타입        제약조건      기본값     설명
------------------------------------------------------------------------------------------
id            VARCHAR2(36)     PK                      관리자 ID (UUID)
email         VARCHAR2(100)    UK, NN                  이메일
password_hash VARCHAR2(255)    NN                      비밀번호 해시
name          VARCHAR2(50)     NN                      이름
role          VARCHAR2(20)                  'ADMIN'    권한
is_active     CHAR(1)                       'Y'        활성 여부
last_login_at TIMESTAMP                                마지막 로그인
created_at    TIMESTAMP        NN                      생성일
updated_at    TIMESTAMP        NN                      수정일

[컬럼값 정의]
  - role      : SUPER_ADMIN(슈퍼관리자), ADMIN(관리자), SUPPORT(고객지원)
  - is_active : Y(활성), N(비활성)

[Indexes]
  - UK_admins_email (email)
  - IDX_admins_role (role)
  - IDX_admins_is_active (is_active)


--------------------------------------------------------------------------------
8.2 fee_policies (수수료 정책)
--------------------------------------------------------------------------------

컬럼명       데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id          VARCHAR2(36)     PK                     정책 ID (UUID)
min_amount  NUMBER(19)       NN                     최소 금액
max_amount  NUMBER(19)                              최대 금액 (NULL이면 상한 없음)
rate        NUMBER(5,4)      NN                     수수료율 (0.0300 = 3%)
is_active   CHAR(1)                       'Y'       활성 여부
created_by  VARCHAR2(36)     FK                     생성자 ID
created_at  TIMESTAMP        NN                     생성일
updated_at  TIMESTAMP        NN                     수정일

[컬럼값 정의]
  - is_active : Y(활성), N(비활성)

[Indexes]
  - IDX_fee_policies_is_active (is_active)

[Foreign Keys]
  - created_by → admins.id


--------------------------------------------------------------------------------
8.3 admin_logs (관리자 활동 로그)
--------------------------------------------------------------------------------

컬럼명       데이터타입        제약조건      기본값    설명
------------------------------------------------------------------------------------------
id          VARCHAR2(36)     PK                     로그 ID (UUID)
admin_id    VARCHAR2(36)     FK                     관리자 ID
action      VARCHAR2(50)     NN                     활동 유형
target_type VARCHAR2(20)                            대상 타입
target_id   VARCHAR2(36)                            대상 ID
details     CLOB                                    상세 정보 (JSON)
ip_address  VARCHAR2(50)                            IP 주소
user_agent  VARCHAR2(500)                           User Agent
created_at  TIMESTAMP        NN                     생성일

[컬럼값 정의]
  - action      :
    [사용자 관리]
    USER_SUSPEND(사용자 정지), USER_BAN(사용자 차단), USER_RESTORE(사용자 복구),
    [챌린지 관리]
    CHALLENGE_CLOSE(챌린지 강제 종료), CHALLENGE_RESTORE(챌린지 복구),
    [신고 처리]
    REPORT_CONFIRM(신고 확인), REPORT_REJECT(신고 기각),
    [환불 처리]
    REFUND_APPROVE(환불 승인), REFUND_REJECT(환불 거절),
    [정산 처리]
    SETTLEMENT_PROCESS(정산 처리), SETTLEMENT_COMPLETE(정산 완료),
    [정책 관리]
    FEE_POLICY_CREATE(수수료 정책 생성), FEE_POLICY_UPDATE(수수료 정책 수정),
    [시스템]
    SYSTEM_CONFIG_UPDATE(시스템 설정 변경), ADMIN_LOGIN(관리자 로그인)
  - target_type : USER(사용자), CHALLENGE(챌린지), REPORT(신고),
                  REFUND(환불), SETTLEMENT(정산), FEE_POLICY(수수료정책)

[Indexes]
  - IDX_admin_logs_admin_id (admin_id)
  - IDX_admin_logs_action (action)
  - IDX_admin_logs_created_at (created_at)

[Foreign Keys]
  - admin_id → admins.id


--------------------------------------------------------------------------------
8.4 settlements (정산 관리)
--------------------------------------------------------------------------------

컬럼명              데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id                 VARCHAR2(36)     PK                       정산 ID (UUID)
challenge_id             VARCHAR2(36)     FK, NN                   챌린지 ID
settlement_month   VARCHAR2(7)      NN                       정산월 (YYYY-MM)
total_support      NUMBER(19)       NN                       총 서포트 금액
total_expense      NUMBER(19)       NN                       총 지출 금액
total_fee          NUMBER(19)       NN                       총 수수료
net_amount         NUMBER(19)       NN                       정산 금액
status             VARCHAR2(20)                  'PENDING'   상태
settled_at         TIMESTAMP                                 정산 완료 시점
settled_by         VARCHAR2(36)     FK                       정산 처리자 ID
created_at         TIMESTAMP        NN                       생성일
updated_at         TIMESTAMP        NN                       수정일

[컬럼값 정의]
  - status : PENDING(대기), PROCESSING(처리중), COMPLETED(완료), FAILED(실패)

[Indexes]
  - UK_settlements_challenge_month (challenge_id, settlement_month)
  - IDX_settlements_status (status)
  - IDX_settlements_settlement_month (settlement_month)

[Foreign Keys]
  - challenge_id → challenges.id
  - settled_by → admins.id


--------------------------------------------------------------------------------
8.5 refunds (환불 관리)
--------------------------------------------------------------------------------

컬럼명                데이터타입        제약조건      기본값      설명
------------------------------------------------------------------------------------------
id                   VARCHAR2(36)     PK                       환불 ID (UUID)
account_id           VARCHAR2(36)     FK, NN                   계좌 ID
original_tx_id       VARCHAR2(36)     FK                       원거래 ID
amount               NUMBER(19)       NN                       환불 금액
reason_category      VARCHAR2(50)     NN                       환불 사유 카테고리
reason_detail        VARCHAR2(500)                             상세 사유
status               VARCHAR2(20)                  'REQUESTED' 상태
requested_by         VARCHAR2(36)     FK, NN                   요청자 ID
approved_by          VARCHAR2(36)     FK                       승인자 ID
approved_at          TIMESTAMP                                 승인 시점
rejected_by          VARCHAR2(36)     FK                       거절자 ID
rejected_at          TIMESTAMP                                 거절 시점
reject_reason        VARCHAR2(500)                             거절 사유
pg_refund_id         VARCHAR2(100)                             PG 환불 ID
refunded_at          TIMESTAMP                                 환불 완료 시점
created_at           TIMESTAMP        NN                       생성일
updated_at           TIMESTAMP        NN                       수정일

[컬럼값 정의]
  - reason_category : USER_REQUEST(사용자요청), OVERCHARGE(과충전), 
                      SERVICE_ERROR(서비스오류), CHALLENGE_CLOSED(챌린지종료)
  - status          : REQUESTED(요청됨), APPROVED(승인), REJECTED(거절), 
                      PROCESSING(처리중), COMPLETED(완료), FAILED(실패)

[Indexes]
  - IDX_refunds_account_id (account_id)
  - IDX_refunds_status (status)
  - IDX_refunds_created_at (created_at)

[Foreign Keys]
  - account_id → accounts.id
  - original_tx_id → account_transactions.id
  - requested_by → users.id
  - approved_by → admins.id
  - rejected_by → admins.id


################################################################################
#                                                                              #
#   9. 부록                                                                     #
#                                                                              #
################################################################################


================================================================================
9.1 제약조건 약어
================================================================================

약어    의미
----    ----
PK      Primary Key
FK      Foreign Key
UK      Unique Key
NN      Not Null


================================================================================
9.2 테이블 요약
================================================================================

도메인              테이블명              설명
-----------------------------------------------------------------
사용자 (4)          users                사용자
                    accounts             사용자 계좌
                    account_transactions 계좌 거래 내역
                    user_scores          사용자 당도 점수

챌린지 (2)          challenges           챌린지
                    challenge_members    챌린지 멤버

모임 (3)            meetings             모임
                    meeting_votes        모임 참석 투표
                    meeting_vote_records 모임 투표 기록

지출 (6)            expense_requests     지출 요청
                    expense_votes        지출 투표
                    expense_vote_records 지출 투표 기록
                    payment_barcodes     결제 바코드
                    ledger_entries       챌린지 장부
                    payment_logs         결제 시도/실패 이력

일반 투표 (2)       general_votes        일반 투표
                    general_vote_records 일반 투표 기록

SNS (5)             posts                피드
                    post_images          피드 이미지
                    post_likes           피드 좋아요
                    comments             댓글
                    comment_likes        댓글 좋아요

시스템 (5)          notifications        알림
                    notification_settings 알림 설정
                    reports              신고
                    sessions             세션
                    webhook_logs         Webhook 수신 로그

관리자 (5)          admins               관리자
                    fee_policies         수수료 정책
                    admin_logs           관리자 활동 로그
                    settlements          정산 관리
                    refunds              환불 관리


================================================================================
9.3 Foreign Key 전체 목록
================================================================================

#   소스 테이블.컬럼                          대상 테이블.컬럼
--  ----------------------------------------  ----------------------
1   accounts.user_id                          users.id
2   account_transactions.account_id           accounts.id
3   account_transactions.related_challenge_id       challenges.id
4   account_transactions.related_user_id      users.id
5   user_scores.user_id                       users.id
6   challenges.creator_id                            users.id
7   challenge_members.challenge_id            challenges.id
8   challenge_members.user_id                 users.id
9   meetings.challenge_id                     challenges.id
10  meetings.created_by                       users.id
11  meeting_votes.meeting_id                  meetings.id
12  meeting_vote_records.meeting_vote_id      meeting_votes.id
13  meeting_vote_records.user_id              users.id
14  expense_requests.meeting_id               meetings.id
15  expense_requests.created_by               users.id
16  expense_votes.expense_request_id          expense_requests.id
17  expense_vote_records.expense_vote_id      expense_votes.id
18  expense_vote_records.user_id              users.id
19  payment_barcodes.expense_request_id       expense_requests.id
20  payment_barcodes.challenge_id             challenges.id
21  ledger_entries.challenge_id               challenges.id
22  ledger_entries.related_user_id            users.id
23  ledger_entries.related_meeting_id         meetings.id
24  ledger_entries.related_expense_request_id expense_requests.id
25  ledger_entries.related_barcode_id         payment_barcodes.id
26  ledger_entries.memo_updated_by            users.id
27  general_votes.challenge_id                challenges.id
28  general_votes.created_by                  users.id
29  general_votes.target_user_id              users.id
30  general_vote_records.general_vote_id      general_votes.id
31  general_vote_records.user_id              users.id
32  posts.challenge_id                        challenges.id
33  posts.created_by                          users.id
34  post_images.post_id                       posts.id
35  post_likes.post_id                        posts.id
36  post_likes.user_id                        users.id
37  comments.post_id                          posts.id
38  comments.parent_id                        comments.id
39  comments.created_by                       users.id
40  comment_likes.comment_id                  comments.id
41  comment_likes.user_id                     users.id
42  notifications.user_id                     users.id
43  reports.reporter_user_id                  users.id
44  reports.reported_user_id                  users.id
45  reports.reviewed_by                       admins.id
46  sessions.user_id                          users.id
47  fee_policies.created_by                   admins.id
48  admin_logs.admin_id                       admins.id
49  payment_logs.payment_barcode_id           payment_barcodes.id
50  settlements.challenge_id                  challenges.id
51  settlements.settled_by                    admins.id
52  refunds.account_id                        accounts.id
53  refunds.original_tx_id                    account_transactions.id
54  refunds.requested_by                      users.id
55  refunds.approved_by                       admins.id
56  refunds.rejected_by                       admins.id


================================================================================
END OF DOCUMENT
================================================================================

총 32개 테이블 | 56개 Foreign Keys | Oracle 21c XE