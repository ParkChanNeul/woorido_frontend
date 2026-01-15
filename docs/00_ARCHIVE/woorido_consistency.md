WOORIDO 프로젝트 정합성 검사 결과 보고서
검사일: 2026-01-15 검사 대상 문서: ERD 문서 9개, DB 스키마 1개, API 문서 12개, 기획 문서 2개 발견된 이슈: 총 30건

## 이슈 #1: 비밀번호 정책 불일치
심각도: Medium 분류: Enum/정책 불일치

현황 설명: 회원가입 및 비밀번호 변경 시 적용되는 비밀번호 정책이 문서 간에 다르게 정의되어 있습니다. 정책정의서에서는 특수문자를 선택사항으로 명시하고 있으나, API 명세서에서는 특수문자를 필수로 요구하고 있습니다.

문서별 정의:

정책정의서 P-005:

비밀번호 정책:
1. 8자 이상
2. 영문+숫자 조합 필수
3. 특수문자 허용
API 명세서 AUTH/USER:

비밀번호 정책:
- 8-20자
- 영문+숫자+특수문자 필수
영향 범위:

001번 POST /auth/signup (회원가입)
008번 PUT /auth/password/reset (비밀번호 재설정)
011번 PUT /users/me/password (비밀번호 변경)
권장 조치: 정책정의서와 API 명세서 중 하나로 통일 필요합니다. 보안 강화를 위해 "특수문자 필수"로 통일하고 정책정의서 P-005를 수정하거나, 사용자 편의를 위해 "특수문자 허용(선택)"으로 통일하고 API 명세서를 수정해야 합니다.

## 이슈 #2: 테이블 수 불일치
심각도: Low 분류: 문서 관리

현황 설명: 프로젝트의 총 테이블 수가 문서마다 다르게 표기되어 있습니다. 실제 테이블을 카운팅하면 32개가 정확하나, 일부 문서에서 31개로 표기되어 있어 혼란을 야기합니다.

문서별 표기:

문서	표기된 테이블 수
ERD 명세서	32개
ERD 개요	31개
DB 스키마 상단	32개
DB 스키마 하단 요약	31개
실제 테이블 목록 (32개):

사용자 도메인 4개: users, accounts, account_transactions, user_scores
챌린지 도메인 2개: challenges, challenge_members
모임 도메인 3개: meetings, meeting_votes, meeting_vote_records
지출 도메인 6개: expense_requests, expense_votes, expense_vote_records, payment_barcodes, ledger_entries, payment_logs
일반 투표 도메인 2개: general_votes, general_vote_records
SNS 도메인 5개: posts, post_images, post_likes, comments, comment_likes
시스템 도메인 5개: notifications, notification_settings, reports, sessions, webhook_logs
관리자 도메인 5개: admins, fee_policies, admin_logs, settlements, refunds
원인 분석: notification_settings 테이블이 일부 문서에서 카운팅에서 누락된 것으로 추정됩니다.

권장 조치: 모든 문서에서 테이블 수를 32개로 통일하고, 도메인별 테이블 목록을 명확히 기재해야 합니다.

## 이슈 #3: ChallengeCategory Enum 불일치
심각도: High 분류: Enum 불일치

현황 설명: 챌린지 카테고리를 정의하는 Enum 값이 DB 스키마와 API 명세서 간에 크게 다릅니다. DB에는 8종의 카테고리가 정의되어 있으나 API에서는 6종만 사용하고 있으며, 일부 값은 이름만 다르고 일부는 완전히 누락되어 있습니다.

DB 스키마 challenges.category:

HOBBY, STUDY, EXERCISE, SAVINGS, TRAVEL, FOOD, CULTURE, OTHER (8종)
API CHALLENGE 022번 ChallengeCategory Enum:

STUDY, FITNESS, HOBBY, FINANCE, LIFESTYLE, OTHER (6종)
상세 비교:

DB 스키마	API 명세서	비고
HOBBY	HOBBY	일치
STUDY	STUDY	일치
EXERCISE	FITNESS	용어 불일치 (동일 의미 추정)
SAVINGS	FINANCE	용어 불일치 (동일 의미 추정)
TRAVEL	-	API에 누락
FOOD	-	API에 누락
CULTURE	-	API에 누락
OTHER	OTHER	일치
-	LIFESTYLE	DB에 누락
영향 범위:

022번 POST /challenges (챌린지 생성)
023번 GET /challenges (챌린지 목록 조회)
081번 GET /search/challenges (챌린지 검색)
권장 조치: DB 스키마의 8종 카테고리를 기준으로 API 명세서를 수정하거나, 비즈니스 요구사항에 맞게 카테고리를 재정의하고 양쪽 문서를 동기화해야 합니다.

## 이슈 #4: ChallengeStatus Enum 불일치 (Spring vs Django)
심각도: High 분류: Enum 불일치

현황 설명: 챌린지 상태를 나타내는 Enum 값이 DB 스키마/Spring API와 Django API 간에 다르게 정의되어 있습니다. 같은 상태를 다른 용어로 표현하고 있어 프론트엔드 개발 및 API 연동 시 혼란이 발생할 수 있습니다.

DB 스키마 challenges.status:

RECRUITING, ACTIVE, PAUSED, CLOSED (4종)
정책정의서 P-046~P-050, P-057:

RECRUITING(모집 중), ACTIVE(진행 중), PAUSED(일시정지), CLOSED(종료) (4종)
Django API 081번 검색 필터:

RECRUITING, IN_PROGRESS, COMPLETED (3종)
매핑 분석:

DB/Spring	Django	비고
RECRUITING	RECRUITING	일치
ACTIVE	IN_PROGRESS	용어 불일치
PAUSED	-	Django에 누락
CLOSED	COMPLETED	용어 불일치
영향 범위:

Django 검색 API에서 PAUSED 상태 챌린지 검색 불가
프론트엔드에서 상태값 변환 로직 필요
권장 조치: Django API의 status 파라미터를 DB 스키마 기준으로 수정하여 RECRUITING, ACTIVE, PAUSED, CLOSED로 통일해야 합니다.

## 이슈 #5: VoteChoice Enum 불일치
심각도: High 분류: Enum 불일치

현황 설명: 투표 시 선택하는 옵션 값이 API와 DB 간에 다르게 정의되어 있습니다. API에서는 모든 투표 유형에 통합된 용어를 사용하지만, DB에서는 투표 유형별로 다른 용어를 사용합니다.

API VOTE 044번 choice 값:

AGREE (찬성)
DISAGREE (반대)
ABSTAIN (기권)
DB 스키마 투표 유형별 choice 값:

meeting_vote_records.choice:

ATTEND (참석)
ABSENT (불참)
expense_vote_records.choice, general_vote_records.choice:

APPROVE (승인)
REJECT (거절)
문제점:

API는 통합 용어(AGREE/DISAGREE/ABSTAIN)를 사용하지만 DB는 유형별 용어를 사용
API의 ABSTAIN(기권)에 해당하는 값이 DB에 없음
모임 투표는 찬반이 아닌 참석/불참 개념인데 API에서 이를 구분하지 않음
영향 범위:

044번 PUT /votes/{voteId}/cast (투표하기)
045번 GET /votes/{voteId}/result (투표 결과 조회)
모든 투표 관련 기능
권장 조치: 두 가지 방안 중 선택이 필요합니다.

방안 A - DB 기준 유지: API에서 투표 유형별로 다른 choice 값을 받도록 수정합니다. 모임 투표는 ATTEND/ABSENT, 일반/지출 투표는 APPROVE/REJECT를 사용합니다.

방안 B - API 기준 통일: DB 스키마를 수정하여 모든 투표 테이블에서 AGREE/DISAGREE/ABSTAIN을 사용합니다.

## 이슈 #6: MeetingStatus Enum 불일치
심각도: High 분류: Enum 불일치

현황 설명: 모임 상태를 나타내는 Enum 값이 API, DB 스키마, ERD 세 문서에서 모두 다르게 정의되어 있습니다.

API MEETING 035번, 036번 응답:

SCHEDULED, COMPLETED (일부만 노출)
DB 스키마 meetings.status:

VOTING, CONFIRMED, COMPLETED, CANCELLED (4종)
ERD 정기 모임 도메인:

PLANNED, CONFIRMED, COMPLETED, CANCELLED (4종)
비교 분석:

API	DB 스키마	ERD	의미
SCHEDULED	VOTING	PLANNED	예정/투표 중
-	CONFIRMED	CONFIRMED	확정
COMPLETED	COMPLETED	COMPLETED	완료
-	CANCELLED	CANCELLED	취소
문제점:

같은 상태를 3가지 다른 용어로 표현 (SCHEDULED vs VOTING vs PLANNED)
API에서 CONFIRMED, CANCELLED 상태가 노출되지 않음
ERD와 DB 스키마 간에도 PLANNED vs VOTING 차이 존재
권장 조치: DB 스키마의 VOTING, CONFIRMED, COMPLETED, CANCELLED를 기준으로 통일하고, API 응답과 ERD를 수정해야 합니다.

## 이슈 #7: 투표 테이블 구조 불일치 (통합 vs 분리)
심각도: Critical 분류: 테이블 구조 불일치

현황 설명: 투표 관련 테이블 구조가 API/ERD와 DB 스키마 간에 근본적으로 다릅니다. API와 ERD는 통합 테이블 구조를 가정하고 있으나, DB 스키마는 투표 유형별로 분리된 테이블 구조를 사용합니다.

API VOTE 관련 테이블 (문서 상단 명시):

votes, vote_records (2개 테이블)
ERD 정기 모임 도메인 테이블:

votes, vote_records (2개 테이블, 통합 구조)
- votes.type으로 EXPENSE, KICK, MEETING_ATTENDANCE, LEADER_KICK, DISSOLVE 구분
DB 스키마 실제 테이블:

meeting_votes, meeting_vote_records (모임 투표)
expense_votes, expense_vote_records (지출 투표)
general_votes, general_vote_records (일반 투표: KICK, LEADER_KICK, DISSOLVE)
총 6개 테이블
구조 비교:

구분	API/ERD (통합)	DB 스키마 (분리)
모임 참석 투표	votes (type=MEETING_ATTENDANCE)	meeting_votes
지출 승인 투표	votes (type=EXPENSE)	expense_votes
멤버 강퇴 투표	votes (type=KICK)	general_votes
리더 강퇴 투표	votes (type=LEADER_KICK)	general_votes
챌린지 해산 투표	votes (type=DISSOLVE)	general_votes
영향 범위:

041~045번 모든 VOTE API
MyBatis 매퍼 구현
투표 생성, 조회, 투표하기, 결과 조회 전체 기능
권장 조치: 두 가지 방안 중 선택이 필요합니다.

방안 A - DB 스키마 기준 유지: API 구현 시 투표 유형에 따라 다른 테이블에 접근하는 로직을 구현합니다. Service 레이어에서 type 파라미터를 보고 적절한 Repository/Mapper를 호출합니다.

방안 B - 통합 테이블로 변경: DB 스키마를 수정하여 votes, vote_records 2개 테이블로 통합하고, type 컬럼으로 투표 유형을 구분합니다.

## 이슈 #8: 알림 설정 필드 불일치
심각도: High 분류: 컬럼/필드 불일치

현황 설명: 알림 설정 API의 요청/응답 필드와 DB 테이블의 컬럼명이 완전히 다릅니다. 필드 수도 다르고, 알림 유형 분류 체계도 다릅니다.

API SYSTEM 075번 알림 설정 필드:

Copy{
  "pushEnabled": true,
  "emailEnabled": false,
  "challengeAlerts": true,
  "paymentAlerts": true,
  "socialAlerts": true,
  "marketingAlerts": false
}
DB 스키마 notification_settings 컬럼:

Copypush_enabled CHAR(1) DEFAULT 'Y'
email_enabled CHAR(1) DEFAULT 'N'
sms_enabled CHAR(1) DEFAULT 'N'
vote_notification CHAR(1) DEFAULT 'Y'
meeting_notification CHAR(1) DEFAULT 'Y'
expense_notification CHAR(1) DEFAULT 'Y'
sns_notification CHAR(1) DEFAULT 'Y'
system_notification CHAR(1) DEFAULT 'Y'
quiet_hours_enabled CHAR(1) DEFAULT 'N'
quiet_hours_start VARCHAR2(5)
quiet_hours_end VARCHAR2(5)
상세 비교:

API 필드	DB 컬럼	비고
pushEnabled	push_enabled	일치 (이름만 다름)
emailEnabled	email_enabled	일치 (이름만 다름)
-	sms_enabled	API에 누락
challengeAlerts	-	DB에 직접 매핑 없음
paymentAlerts	-	DB에 직접 매핑 없음
socialAlerts	sns_notification	매핑 추정
marketingAlerts	-	DB에 누락
-	vote_notification	API에 누락
-	meeting_notification	API에 누락
-	expense_notification	API에 누락
-	system_notification	API에 누락
-	quiet_hours_*	API에 누락 (방해금지 시간)
영향 범위:

075번 GET/PUT /notifications/settings
권장 조치: API와 DB 중 하나를 기준으로 통일해야 합니다. DB 스키마가 더 세분화되어 있으므로 API를 DB 기준으로 수정하는 것을 권장합니다. 또는 비즈니스 요구사항을 재검토하여 필요한 알림 유형을 정의하고 양쪽을 수정합니다.

## 이슈 #9: 신고 대상 유형 불일치
심각도: Medium 분류: Enum 불일치

현황 설명: 신고 기능에서 신고할 수 있는 대상 유형이 API와 DB 간에 다릅니다. DB에는 챌린지 자체를 신고할 수 있는 옵션이 있으나 API에서는 누락되어 있습니다.

API SYSTEM 069번 targetType:

USER (사용자)
POST (게시글)
COMMENT (댓글)
DB 스키마 reports.reported_entity_type:

USER (사용자)
POST (게시글)
COMMENT (댓글)
CHALLENGE (챌린지)
문제점: 사용자가 부적절한 챌린지(사기성 챌린지, 불법 활동 챌린지 등)를 신고하고 싶어도 API에서 CHALLENGE 타입을 지원하지 않아 신고가 불가능합니다.

영향 범위:

069번 POST /reports (신고하기)
권장 조치: API 069번의 targetType에 CHALLENGE를 추가해야 합니다.

## 이슈 #10: posts 테이블 title, category 컬럼 누락
심각도: Critical 분류: 컬럼 누락

현황 설명: SNS 게시글 API에서 사용하는 title(제목)과 category(카테고리) 필드가 DB 스키마의 posts 테이블에 존재하지 않습니다. API 구현이 불가능한 상태입니다.

API SNS 054~056번 요청/응답 필드:

Copy{
  "postId": 1,
  "title": "[공지] 2월 정기모임 안내",
  "content": "2월 정기모임은...",
  "category": "NOTICE",
  ...
}
DB 스키마 posts 테이블 컬럼:

Copyid VARCHAR2(36) PRIMARY KEY
challenge_id VARCHAR2(36)
created_by VARCHAR2(36) NOT NULL
content VARCHAR2(4000) NOT NULL
is_notice CHAR(1) DEFAULT 'N'
is_pinned CHAR(1) DEFAULT 'N'
like_count NUMBER(10) DEFAULT 0
comment_count NUMBER(10) DEFAULT 0
view_count NUMBER(10) DEFAULT 0
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
deleted_at TIMESTAMP
누락된 컬럼:

title VARCHAR2(100) - 게시글 제목
category VARCHAR2(20) - 게시글 카테고리 (NOTICE/GENERAL/QUESTION)
영향 범위:

054번 GET /challenges/{challengeId}/posts (게시글 목록)
055번 GET /challenges/{challengeId}/posts/{postId} (게시글 상세)
056번 POST /challenges/{challengeId}/posts (게시글 작성)
057번 PUT /challenges/{challengeId}/posts/{postId} (게시글 수정)
권장 조치: DB 스키마에 다음 컬럼을 추가해야 합니다:

CopyALTER TABLE posts ADD (
  title VARCHAR2(100),
  category VARCHAR2(20) DEFAULT 'GENERAL' CHECK (category IN ('NOTICE', 'GENERAL', 'QUESTION'))
);
또는 API 설계를 변경하여 title 없이 content만 사용하고, category 대신 is_notice 컬럼만 사용하도록 수정합니다.

## 이슈 #11: users 테이블 nickname 컬럼 불일치
심각도: High 분류: 컬럼 불일치

현황 설명: API 전반에서 사용자의 표시 이름으로 nickname 필드를 사용하고 있으나, DB 스키마의 users 테이블에는 name 컬럼만 존재합니다. nickname과 name이 동일한 필드인지, 별도 필드인지 명확하지 않습니다.

API USER 009~014번 등에서 사용하는 필드:

Copy{
  "userId": 1,
  "nickname": "홍길동",
  "email": "user@example.com",
  ...
}
DB 스키마 users 테이블 관련 컬럼:

Copyname VARCHAR2(50) NOT NULL  -- 이름
-- nickname 컬럼 없음
문제점:

API에서 nickname을 반환하려면 DB에 nickname 컬럼이 있어야 함
name과 nickname이 같은 값이라면 API에서 필드명을 name으로 변경해야 함
name은 실명, nickname은 별명으로 구분한다면 DB에 nickname 컬럼 추가 필요
영향 범위:

009번 GET /users/me
010번 PUT /users/me
013번 GET /users/{userId}
014번 GET /users/check-nickname
그 외 사용자 정보를 반환하는 모든 API
권장 조치: 비즈니스 요구사항을 확인하여 다음 중 하나를 선택해야 합니다.

방안 A - nickname = name 동일 필드: API 응답에서 nickname을 name으로 변경하고, 014번 API도 check-name으로 수정합니다.

방안 B - nickname 별도 필드: DB 스키마에 nickname 컬럼을 추가합니다.

CopyALTER TABLE users ADD nickname VARCHAR2(50);
CREATE UNIQUE INDEX idx_users_nickname ON users(nickname);
## 이슈 #12: 모임 참석 테이블명 불일치
심각도: High 분류: 테이블명 불일치

현황 설명: 모임 참석 정보를 저장하는 테이블의 이름이 API, ERD, DB 스키마에서 모두 다르게 표기되어 있습니다.

API MEETING 관련 테이블 (문서 상단):

meetings, meeting_attendance
ERD 정기 모임 도메인:

meetings, meeting_attendees, votes, vote_records
DB 스키마 실제 테이블:

meetings, meeting_votes, meeting_vote_records
테이블 용도 비교:

용도	API	ERD	DB 스키마
모임 기본 정보	meetings	meetings	meetings
참석 의사 기록	meeting_attendance	meeting_attendees	meeting_vote_records
투표 정보	-	votes	meeting_votes
문제점:

동일한 목적의 테이블이 3가지 다른 이름으로 표기됨
개발 시 어떤 테이블명을 사용해야 하는지 혼란
ERD와 DB 스키마 간 불일치로 문서 신뢰도 저하
권장 조치: DB 스키마의 테이블명(meetings, meeting_votes, meeting_vote_records)을 기준으로 API 문서와 ERD를 수정해야 합니다.

## 이슈 #13: 수수료 정책 부록 불일치
심각도: Medium 분류: 정책 불일치

현황 설명: 충전 수수료 정책이 API 명세서 본문과 부록에서 다르게 기재되어 있습니다. 본문은 정책정의서/DB 스키마와 일치하나, 부록 C는 완전히 다른 금액 구간을 사용합니다.

정책정의서 P-010~P-012:

소액: 10,000원 미만 → 1%
일반: 10,000~200,000원 → 3%
고액: 200,000원 초과 → 1.5%
DB 스키마 fee_policies 초기 데이터:

Copy(0, 9999, 0.0100)      -- 소액 1%
(10000, 200000, 0.0300) -- 일반 3%
(200001, NULL, 0.0150)  -- 고액 1.5%
API 명세서 021번 응답 (본문):

Copy{
  "tiers": [
    {"name": "소액", "minAmount": 0, "maxAmount": 9999, "rate": 1.0},
    {"name": "일반", "minAmount": 10000, "maxAmount": 200000, "rate": 3.0},
    {"name": "고액", "minAmount": 200001, "maxAmount": null, "rate": 1.5}
  ]
}
API 명세서 부록 C (오류):

소액: 50,000원 이하 → 1%
일반: 50,001~500,000원 → 3%
고액: 500,001원 이상 → 1.5%
권장 조치: API 명세서 부록 C의 수수료 정책을 정책정의서/DB 스키마 기준으로 수정해야 합니다.

## 이슈 #14: challenge_accounts 테이블 미존재
심각도: Medium 분류: 테이블 참조 오류

현황 설명: API 문서에서 챌린지 계좌 정보를 저장하는 challenge_accounts 테이블을 참조하고 있으나, 실제 DB 스키마에는 해당 테이블이 존재하지 않습니다.

API 문서에서 참조하는 테이블:

API ACCOUNT 015번 관련 테이블:

accounts, transactions, challenge_accounts
API CHALLENGE 관련 테이블:

challenges, challenge_members, challenge_accounts
DB 스키마 실제 구조: challenge_accounts 테이블 없음. 대신 challenges 테이블에 balance 컬럼 존재:

CopyCREATE TABLE challenges (
  ...
  balance NUMBER(19) NOT NULL DEFAULT 0,  -- challengeAccountBalance 매핑
  ...
);
설계 의도 분석: 별도의 챌린지 계좌 테이블을 두지 않고, challenges 테이블의 balance 컬럼으로 챌린지 잔액을 관리하는 구조입니다.

권장 조치: API 문서의 관련 테이블 섹션에서 challenge_accounts를 제거하고, "챌린지 잔액은 challenges.balance 컬럼에서 관리"라고 명시해야 합니다.

## 이슈 #15: 출금 한도 컬럼 누락
심각도: Critical 분류: 컬럼 누락

현황 설명: 내 어카운트 조회 API 응답에 출금 한도 관련 필드가 포함되어 있으나, DB 스키마의 accounts 테이블에는 해당 컬럼이 존재하지 않습니다.

API ACCOUNT 015번 응답:

Copy{
  "data": {
    "accountId": 1,
    "balance": 500000,
    "availableBalance": 450000,
    "lockedBalance": 50000,
    "limits": {
      "dailyWithdrawLimit": 1000000,
      "monthlyWithdrawLimit": 5000000,
      "usedToday": 100000,
      "usedThisMonth": 500000
    },
    ...
  }
}
DB 스키마 accounts 테이블:

CopyCREATE TABLE accounts (
  id VARCHAR2(36) PRIMARY KEY,
  user_id VARCHAR2(36) NOT NULL UNIQUE,
  balance NUMBER(19) DEFAULT 0,
  locked_balance NUMBER(19) DEFAULT 0,
  bank_code VARCHAR2(10),
  account_number VARCHAR2(50),
  account_holder VARCHAR2(50),
  version NUMBER(10) DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
누락된 컬럼:

daily_withdraw_limit NUMBER(19) - 일일 출금 한도
monthly_withdraw_limit NUMBER(19) - 월간 출금 한도
used_today NUMBER(19) - 오늘 사용 금액
used_this_month NUMBER(19) - 이번 달 사용 금액
last_withdraw_date DATE - 마지막 출금일 (일일 리셋용)
영향 범위:

015번 GET /accounts/me
019번 POST /accounts/withdraw (출금 한도 검증 불가)
권장 조치: 두 가지 방안 중 선택이 필요합니다.

방안 A - DB 컬럼 추가:

CopyALTER TABLE accounts ADD (
  daily_withdraw_limit NUMBER(19) DEFAULT 1000000,
  monthly_withdraw_limit NUMBER(19) DEFAULT 5000000,
  used_today NUMBER(19) DEFAULT 0,
  used_this_month NUMBER(19) DEFAULT 0,
  last_withdraw_date DATE
);
방안 B - 고정 한도 사용: 출금 한도를 애플리케이션 설정값으로 관리하고, 사용 금액은 account_transactions 테이블에서 집계합니다.

## 이슈 #16: 자동 납입 설정 컬럼 누락
심각도: Critical 분류: 컬럼 누락

현황 설명: 챌린지 자동 납입 설정 API가 존재하나, 해당 설정을 저장할 컬럼이 DB 스키마에 없습니다.

API CHALLENGE 029번:

PUT /challenges/{challengeId}/support/settings

Request Body:
{
  "autoPayEnabled": true
}

Response:
{
  "challengeId": 1,
  "autoPayEnabled": true,
  "nextPaymentDate": "2026-02-01",
  "amount": 100000
}
DB 스키마 challenge_members 테이블:

CopyCREATE TABLE challenge_members (
  id VARCHAR2(36) PRIMARY KEY,
  challenge_id VARCHAR2(36) NOT NULL,
  user_id VARCHAR2(36) NOT NULL,
  role VARCHAR2(20) DEFAULT 'FOLLOWER',
  deposit_status VARCHAR2(20) DEFAULT 'NONE',
  deposit_locked_at TIMESTAMP,
  deposit_unlocked_at TIMESTAMP,
  entry_fee_amount NUMBER(19) DEFAULT 0,
  entry_fee_paid_at TIMESTAMP,
  privilege_status VARCHAR2(20) DEFAULT 'ACTIVE',
  privilege_revoked_at TIMESTAMP,
  last_support_paid_at TIMESTAMP,
  total_support_paid NUMBER(19) DEFAULT 0,
  joined_at TIMESTAMP NOT NULL,
  left_at TIMESTAMP,
  leave_reason VARCHAR2(50)
  -- auto_pay_enabled 컬럼 없음
);
영향 범위:

029번 PUT /challenges/{challengeId}/support/settings
매월 1일 자동 납입 배치 처리
권장 조치: DB 스키마에 자동 납입 설정 컬럼을 추가해야 합니다:

CopyALTER TABLE challenge_members ADD (
  auto_pay_enabled CHAR(1) DEFAULT 'Y' CHECK (auto_pay_enabled IN ('Y', 'N'))
);
## 이슈 #17: TransactionType Enum 정의 누락
심각도: Medium 분류: 문서 누락

현황 설명: 거래 내역 조회 API에서 type 파라미터로 TransactionType Enum을 사용한다고 명시되어 있으나, 해당 Enum의 값 목록이 API 문서에 정의되어 있지 않습니다.

API ACCOUNT 016번:

GET /accounts/me/transactions

Query Parameters:
- type: String (N) - TransactionType Enum
TransactionType Enum 값 (API 문서에 미정의): DB 스키마 account_transactions.type을 참조하면:

CHARGE (충전)
WITHDRAW (출금)
LOCK (잠금)
UNLOCK (잠금 해제)
SUPPORT (서포트 납입)
ENTRY_FEE (입회비)
REFUND (환불)
권장 조치: API 문서에 TransactionType Enum 정의를 추가해야 합니다:

#### TransactionType Enum
| 값 | 설명 |
|----|------|
| CHARGE | 크레딧 충전 |
| WITHDRAW | 출금 |
| LOCK | 보증금 잠금 |
| UNLOCK | 보증금 해제 |
| SUPPORT | 서포트 납입 |
| ENTRY_FEE | 입회비 |
| REFUND | 환불 |
## 이슈 #18: ledger_entries 테이블 상세 미확인
심각도: Medium 분류: 문서 누락

현황 설명: 장부 API에서 사용하는 필드들이 DB 스키마의 ledger_entries 테이블에 존재하는지 확인할 수 없습니다. ledger_entries 테이블의 상세 컬럼 정의가 제공된 문서에 포함되어 있지 않습니다.

API LEDGER 089~091번 요청/응답 필드:

Copy{
  "entryId": 1,
  "type": "EXPENSE",
  "category": "MEETING",
  "amount": 50000,
  "description": "2월 모임 장소 대여비",
  "transactionDate": "2026-02-15",
  "relatedUser": {...},
  "approvedBy": {...},
  "createdAt": "..."
}
DB 스키마에서 확인 필요한 컬럼:

type (INCOME/EXPENSE)
category (LedgerCategory Enum)
amount
description
transaction_date
related_user_id
approved_by
영향 범위:

052번 GET /challenges/{challengeId}/ledger
089번 GET /challenges/{challengeId}/ledger/summary
090번 POST /challenges/{challengeId}/ledger
091번 PUT /ledger/{entryId}
권장 조치: ledger_entries 테이블의 상세 DDL을 확인하고, API 필드와 DB 컬럼 매핑을 검증해야 합니다. 필요 시 DB 스키마 문서에 ledger_entries 테이블 상세를 추가해야 합니다.

## 이슈 #19: API 번호 체계 불연속
심각도: Low 분류: 문서 관리

현황 설명: API 번호가 도메인 내에서 연속적이지 않고 불규칙하게 배정되어 있어 문서 관리와 커뮤니케이션에 혼란을 야기합니다.

불연속 API 번호:

MEETING 도메인:

035, 036, 037, 038, 039, 040 (연속)
092 (불연속 - 신규 추가)
LEDGER 도메인:

052, 053 (연속)
089, 090, 091 (불연속 - 신규 추가)
문제점:

새 API 추가 시 번호 부여 규칙이 불명확
"MEETING API는 몇 번부터 몇 번까지" 라고 말할 수 없음
문서 검색 및 참조 시 혼란
권장 조치: 두 가지 방안 중 선택이 필요합니다.

방안 A - 번호 재정렬: 모든 API 번호를 도메인별로 연속되게 재정렬합니다. 예: MEETING 035-041, LEDGER 052-056

방안 B - 현행 유지 + 문서화: 현재 번호 체계를 유지하되, API Overview에 도메인별 번호 범위를 명확히 문서화합니다.

## 이슈 #20: API 총 개수 불일치
심각도: Low 분류: 문서 관리

현황 설명: 프로젝트의 총 API 개수가 문서마다 다르게 표기되어 있습니다.

문서별 API 개수 표기:

문서	표기된 API 수	상세
API Overview	92개	Spring 83 + Django 9
API 스키마	91개	Spring 82 + Django 9
API 명세서 상단	91개	Spring 82 + Django 9
API 명세서 부록 A	88개	Spring 79 + Django 9
API 명세서 부록 D	88개	Spring 79 + Django 9
PRODUCT_AGENDA	56개	MVP 핵심 기능만
실제 확인된 API 번호 범위: 001~092번 (단, 중간에 사용되지 않는 번호 존재 가능)

권장 조치: 모든 API를 목록화하여 정확한 개수를 파악하고, 모든 문서의 API 개수 표기를 통일해야 합니다.

## 이슈 #21: 탈퇴 사유 Enum 불일치
심각도: Medium 분류: Enum 불일치

현황 설명: 챌린지 멤버 탈퇴 사유를 나타내는 Enum 값이 정책정의서와 DB 스키마 간에 다릅니다.

정책정의서 P-052:

NORMAL (정상 탈퇴) - 보증금 반환
KICKED (강퇴) - 보증금 반환
AUTO_LEAVE (60일 미충전 자동 탈퇴) - 보증금 몰수
DB 스키마 challenge_members.leave_reason:

NORMAL (정상 탈퇴)
KICKED (강퇴)
AUTO_LEAVE (자동 탈퇴)
CHALLENGE_CLOSED (챌린지 종료로 인한 탈퇴)
누락된 정책: CHALLENGE_CLOSED 타입에 대한 보증금 처리 정책이 정책정의서에 정의되어 있지 않습니다.

권장 조치: 정책정의서에 CHALLENGE_CLOSED 탈퇴 유형을 추가하고 보증금 처리 정책을 명시해야 합니다:

CHALLENGE_CLOSED (챌린지 종료) - P-050에 따라 잔액 N분의 1 분배 후 탈퇴, 보증금 반환
## 이슈 #22: 점수 산정 로직 위치 불명확
심각도: Medium 분류: 로직 미정의

현황 설명: 사용자 당도(Brix) 점수 계산 공식이 정책정의서와 PRODUCT_AGENDA에 정의되어 있으나, 이 계산이 어디서 수행되는지(실시간 vs 배치), 어떤 시점에 갱신되는지 명확하지 않습니다.

정책정의서/PRODUCT_AGENDA 점수 공식:

최종 당도 = 기본 당도(12) + (납입 당도 × 0.7) + (활동 당도 × 0.15)

납입 당도:
- 모임 참석: +0.09/회
- 납입 개월: +0.32/월
- 연체: -1.5/회
- 연속 연체: -1.0/회

활동 당도:
- 피드 작성: +0.05/개 (일 1개, 월 30개 제한)
- 댓글 작성: +0.025/개 (일 3개, 월 90개 제한)
- 좋아요: +0.006/개 (일 5개, 월 150개 제한)
- 리더 경험: +0.45/월
- 투표 불참: -0.1/회
- 신고 당함: -0.6/회
- 강퇴 당함: -4.0/회
DB 스키마 user_scores 테이블:

Copy-- 카운트 컬럼
total_attendance_count NUMBER(10) DEFAULT 0
total_payment_months NUMBER(10) DEFAULT 0
total_overdue_count NUMBER(10) DEFAULT 0
consecutive_overdue_count NUMBER(10) DEFAULT 0
total_feed_count NUMBER(10) DEFAULT 0
total_comment_count NUMBER(10) DEFAULT 0
total_like_given_count NUMBER(10) DEFAULT 0
total_leader_months NUMBER(10) DEFAULT 0
total_vote_absence_count NUMBER(10) DEFAULT 0
total_report_received_count NUMBER(10) DEFAULT 0
total_kick_count NUMBER(10) DEFAULT 0

-- 계산된 점수 컬럼
payment_score NUMBER(5,2) DEFAULT 0
activity_score NUMBER(5,2) DEFAULT 0
total_score NUMBER(5,2) DEFAULT 12

-- 갱신 시점
calculated_at TIMESTAMP
calculated_month VARCHAR2(7)
불명확한 사항:

점수 계산 시점: 실시간? 배치(매월 1일)?
계산 주체: Spring Boot? Django?
일일 제한 카운팅 방식: 별도 테이블? Redis?
권장 조치: 점수 산정 로직의 구현 위치와 시점을 명확히 문서화해야 합니다. 예:

- 카운트 갱신: 각 액션 발생 시 실시간 증가 (Spring Boot)
- 점수 계산: 매월 1일 00:00 배치 작업으로 재계산 (Spring Scheduler)
- 일일 제한: Redis에 일별 카운트 저장, 자정 리셋
## 이슈 #23: Django 검색 카테고리 불일치
심각도: High 분류: Enum 불일치

현황 설명: Django 검색 API에서 사용하는 챌린지 카테고리가 DB 스키마 및 Spring API와 완전히 다른 체계를 사용합니다.

Django API 081번 category 파라미터:

SAVING (저축)
INVESTMENT (투자)
EXPENSE_CUT (지출 절감)
CUSTOM (사용자 정의)
DB 스키마/Spring API category:

HOBBY (취미)
STUDY (학습)
EXERCISE (운동)
SAVINGS (저축)
TRAVEL (여행)
FOOD (음식)
CULTURE (문화)
OTHER (기타)
문제점:

Django 검색에서 DB에 없는 카테고리로 필터링 시 결과 없음
HOBBY, STUDY, EXERCISE 등 주요 카테고리가 Django에서 검색 불가
프론트엔드에서 카테고리 필터 UI 구현 시 혼란
권장 조치: Django API 081번의 category 파라미터를 DB 스키마 기준으로 수정해야 합니다:

category: HOBBY / STUDY / EXERCISE / SAVINGS / TRAVEL / FOOD / CULTURE / OTHER
## 이슈 #24: expenses 테이블명 불일치
심각도: Medium 분류: 테이블명 불일치

현황 설명: API 문서에서 참조하는 expenses 테이블이 DB 스키마에는 expense_requests라는 이름으로 존재합니다.

API SNS 문서 관련 테이블:

posts, comments, post_likes, expenses, ledger_entries
DB 스키마 지출 도메인 테이블:

expense_requests (지출 요청)
expense_votes (지출 투표)
expense_vote_records (지출 투표 기록)
payment_barcodes (결제 바코드)
ledger_entries (장부 항목)
payment_logs (결제 로그)
권장 조치: API 문서의 관련 테이블 섹션에서 expenses를 expense_requests로 수정해야 합니다.

## 이슈 #25: transactions 테이블명 불일치
심각도: Medium 분류: 테이블명 불일치

현황 설명: API 문서에서 참조하는 transactions 테이블이 DB 스키마에는 account_transactions라는 이름으로 존재합니다.

API LEDGER 문서 관련 테이블:

ledger_entries, expenses, transactions

DB 스키마 실제 테이블:

account_transactions (계좌 거래 내역)

권장 조치: API 문서의 관련 테이블 섹션에서 transactions를 account_transactions로 수정해야 합니다.

## 이슈 #26: sessions.session_type 용도 불명확
심각도: Low 분류: 정책 미정의

현황 설명: DB 스키마의 sessions 테이블에 session_type 컬럼이 있으나, 일부 타입의 정확한 용도가 명확하지 않습니다.

DB 스키마 sessions.session_type:

LOGIN (로그인)
CHARGE (충전)
JOIN (?)
WITHDRAW (?)

ERD 개요 설명:

"돈 관련 작업의 returnUrl은 DB Session 테이블에 저장"


불명확한 사항:

JOIN: 챌린지 가입(Challenge Join)인지, 회원가입(User Join)인지?
WITHDRAW: 출금(Money Withdraw)인지, 챌린지 탈퇴(Challenge Withdraw/Leave)인지?
권장 조치: 각 session_type의 정확한 용도와 사용 시나리오를 문서화해야 합니다:

LOGIN: 로그인 시 세션 생성, returnUrl = 로그인 전 페이지
CHARGE: 크레딧 충전 시 PG 연동용, returnUrl = 결제 완료 후 이동 페이지
JOIN: 챌린지 가입 시 결제 연동용, returnUrl = 가입 완료 후 챌린지 페이지
WITHDRAW: 출금 요청 시 본인 인증용, returnUrl = 출금 완료 후 어카운트 페이지


## 이슈 #27: webhook_logs.is_processed 정책 미정의
심각도: Low 분류: 정책 미정의

현황 설명: webhook_logs 테이블의 is_processed 컬럼이 일반적인 Y/N 불리언이 아닌 3가지 상태(Y/N/F)를 가지나, F(실패) 상태에 대한 처리 정책이 정의되어 있지 않습니다.

DB 스키마 webhook_logs.is_processed:

Y (처리 완료)
N (미처리)
F (처리 실패)
미정의 사항:

F(실패) 상태 webhook의 재처리 정책
재처리 시도 횟수 제한
최종 실패 시 알림/에스컬레이션 정책
실패 원인별 처리 방식 (네트워크 오류 vs 비즈니스 오류)
권장 조치: webhook 실패 처리 정책을 정의하고 문서화해야 합니다:

P-XXX Webhook 실패 처리 정책:
- 재처리 시도: 최대 3회 (1분, 5분, 30분 간격)
- 3회 실패 시: 관리자 알림 발송
- 실패 로그: error_message 컬럼에 상세 기록
- 수동 처리: 관리자 콘솔에서 재처리 버튼 제공
## 이슈 #28: 문서 최종 수정일 불일치
심각도: Low 분류: 문서 관리

현황 설명: 각 문서의 최종 수정일이 다르게 표기되어 있어, 문서 간 충돌 시 어느 문서가 최신 정보인지 판단하기 어렵습니다.

문서별 최종 수정일:

문서	최종 수정일
ERD 명세서	2026-01-15
ERD 개요	2026-01-13
사용자 도메인 ERD	2026-01-15
챌린지 도메인 ERD	2026-01-13
정기 모임 도메인 ERD	2026-01-09
SNS 도메인 ERD	2026-01-15
시스템 도메인 ERD	2026-01-15
관리자 도메인 ERD	2026-01-09
DB 스키마	2026-01-15
API 명세서	2026-01-14~15
정책정의서	2026-01-13
PRODUCT_AGENDA	2026-01-13
문제점:

정책정의서(2026-01-13)와 DB 스키마(2026-01-15) 간 2일 차이
최신 DB 스키마에 반영된 변경사항이 정책정의서에 미반영 가능성
문서 간 충돌 시 기준 문서 판단 어려움
권장 조치:

모든 문서의 최종 수정일을 동기화
변경 발생 시 관련 문서 일괄 업데이트
BACKLOG.md에 문서별 변경 이력 상세 기록
## 이슈 #29: EXPENSE API 상세 문서 미수신
심각도: High 분류: 문서 누락

현황 설명: API 046-051번에 해당하는 EXPENSE(지출) API의 상세 문서가 수신되지 않아, 지출 도메인의 API-DB 정합성 검증이 불가능합니다.

API 스키마에 명시된 EXPENSE API (6개):

046 GET /challenges/{challengeId}/expenses - 지출 목록 조회
047 GET /expenses/{expenseId} - 지출 상세 조회
048 POST /challenges/{challengeId}/expenses - 지출 요청 생성
049 PUT /expenses/{expenseId} - 지출 요청 수정 (또는 승인/거절)
050 DELETE /expenses/{expenseId} - 지출 요청 취소/삭제
051 POST /expenses/{expenseId}/barcode - 바코드 발급
검증 불가 항목:

expense_requests 테이블 컬럼과 API 필드 매핑
expense_votes, expense_vote_records 연동 방식
payment_barcodes 발급 및 사용 프로세스
지출 상태(status) Enum 값
지출 카테고리(category) Enum 값

권장 조치: EXPENSE API 상세 문서(046-051번)를 수신하여 정합성 검증을 완료해야 합니다.

## 이슈 #30: 참석 상태 Enum 불일치
심각도: High 분류: Enum 불일치

현황 설명: 모임 참석 상태를 나타내는 Enum 값이 API, DB 스키마, ERD 세 문서에서 모두 다르게 정의되어 있습니다.

API MEETING 039번 status 값:

CONFIRMED (참석 확정)
DECLINED (불참)
PENDING (미응답) - 취소 시 이 상태로 변경
DB 스키마 meeting_vote_records.choice 값:

ATTEND (참석)
ABSENT (불참)
ERD 정기 모임 도메인 meeting_attendees.status 값:

REGISTERED (등록됨)
ATTENDED (실제 참석)
NO_SHOW (불참/노쇼)
용도 분석:

API의 CONFIRMED/DECLINED: 모임 전 참석 의사 표시
DB meeting_vote_records의 ATTEND/ABSENT: 모임 투표 시 선택
ERD meeting_attendees의 REGISTERED/ATTENDED/NO_SHOW: 실제 참석 여부 기록
문제점:

같은 개념에 대해 3가지 다른 용어 체계 사용
"참석 의사"와 "실제 참석"이 혼재
구현 시 어떤 상태값을 사용해야 하는지 불명확
권장 조치: 참석 관련 상태를 명확히 구분하고 통일해야 합니다:

1. 참석 의사 (모임 전):
   - API/DB 통일: ATTEND(참석 예정), ABSENT(불참 예정), PENDING(미응답)

2. 실제 참석 (모임 후):
   - API/DB 통일: ATTENDED(실제 참석), NO_SHOW(노쇼), CANCELLED(취소)
요약 및 권장 조치 우선순위
Critical (즉시 해결 필요 - 4건)
#	이슈	영향	권장 조치
7	투표 테이블 구조 불일치	모든 투표 API 구현 차단	통합/분리 구조 결정 후 문서 통일
10	posts.title, category 누락	SNS 게시글 API 구현 차단	DB 컬럼 추가 또는 API 설계 변경
15	출금 한도 컬럼 누락	출금 한도 기능 구현 차단	DB 컬럼 추가 또는 설정값 관리 방식 결정
16	autoPayEnabled 컬럼 누락	자동 납입 설정 구현 차단	DB 컬럼 추가
High (조속한 해결 필요 - 11건)
#	이슈	영향	권장 조치
3	ChallengeCategory 불일치	챌린지 생성/검색 오류	Enum 값 통일
4	ChallengeStatus 불일치	Django 검색 오류	Django API Enum 수정
5	VoteChoice 불일치	투표 기능 오류	통합 용어 또는 유형별 용어 결정
6	MeetingStatus 불일치	모임 상태 관리 오류	3개 문서 Enum 통일
8	알림 설정 필드 불일치	알림 설정 API 구현 오류	필드명 및 유형 통일
11	nickname vs name 불일치	사용자 정보 API 오류	동일 필드 여부 확인 후 통일
12	모임 참석 테이블명 불일치	개발 혼란	테이블명 통일
23	Django 카테고리 불일치	검색 기능 오류	Django API Enum 수정
29	EXPENSE API 문서 미수신	지출 도메인 검증 불가	문서 수신 필요
30	참석 상태 Enum 불일치	모임 참석 기능 오류	상태값 체계 정립 및 통일
Medium (일정 내 해결 - 10건)
#	이슈	권장 조치
1	비밀번호 정책 불일치	정책정의서 또는 API 명세서 수정
9	신고 대상 CHALLENGE 누락	API에 CHALLENGE 타입 추가
13	수수료 정책 부록 오류	부록 C 수정
14	challenge_accounts 참조 오류	API 문서 테이블 참조 수정
17	TransactionType 정의 누락	API 문서에 Enum 정의 추가
18	ledger_entries 상세 미확인	테이블 DDL 확인 및 문서화
21	CHALLENGE_CLOSED 정책 누락	정책정의서에 추가
22	점수 산정 로직 미정의	계산 시점/주체 문서화
24	expenses 테이블명 오류	expense_requests로 수정
25	transactions 테이블명 오류	account_transactions로 수정
Low (여유 시 해결 - 5건)
#	이슈	권장 조치
2	테이블 수 표기 불일치	모든 문서 32개로 통일
19	API 번호 불연속	번호 재정렬 또는 범위 문서화
20	API 개수 불일치	정확한 개수 파악 후 통일
26	session_type 용도 불명확	각 타입 용도 문서화
27	webhook 실패 정책 미정의	재처리 정책 정의
28	문서 수정일 불일치	문서 버전 동기화
검사 완료: 2026-01-15 총 발견 이슈: 30건 (Critical 4, High 11, Medium 10, Low 5) 다음 단계: 우선순위에 따라 이슈 해결 후 재검증 필요