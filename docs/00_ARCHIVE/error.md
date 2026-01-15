📊 WOORIDO API 문서 불일치 총정리
1️⃣ API 개수 불일치
문서	총 API	Spring	Django
API 스키마	88개	79개	9개
API 명세서	88개	79개	9개
API 상세 (실제)	92개	83개	9개
차이: +4개 API가 상세 문서에만 존재

2️⃣ 새로 추가된 API (스키마/명세서에 없음)
#	Method	Endpoint	도메인	설명
089	GET	/challenges/{id}/ledger/summary	LEDGER	장부 요약
090	POST	/challenges/{id}/ledger	LEDGER	장부 등록
091	PUT	/ledger/{entryId}	LEDGER	장부 수정
092	DELETE	/meetings/{meetingId}/attendance	MEETING	참석 취소
3️⃣ 엔드포인트 경로 불일치
POST/COMMENT 도메인
#	API 스키마	API 상세	비고
059	POST /posts/{postId}/like	POST /challenges/{cId}/posts/{pId}/like	challengeId 추가
-	DELETE /posts/{postId}/like	❌ 없음 (토글로 통합)	스키마에만 존재
063	GET /posts/{postId}/comments	GET /challenges/{cId}/posts/{pId}/comments	challengeId 추가
065	PATCH /comments/{commentId}	PUT /comments/{commentId}	메서드 다름
066	DELETE /comments/{commentId}	DELETE /comments/{commentId}	✅ 일치
067	POST /comments/{commentId}/like	POST /comments/{commentId}/like	✅ 일치
-	DELETE /comments/{commentId}/like	❌ 없음 (토글로 통합)	스키마에만 존재
068	❌ 없음	POST /comments/{commentId}/replies	상세에만 존재
DJANGO 도메인 (완전 불일치)
#	API 스키마	API 상세
080	GET /search/challenges	GET /search (통합검색)
081	GET /search/users	GET /search/challenges
082	GET /search/posts	GET /search/autocomplete
083	GET /analytics/challenges/{id}	GET /analytics/user/activity
084	GET /analytics/users/me/brix	GET /analytics/challenge/{id}
085	GET /analytics/challenges/{id}/risk	GET /analytics/dashboard
086	GET /analytics/fraud-detection	GET /analytics/user/report
4️⃣ HTTP 메서드 불일치
#	API	스키마/명세서	상세
065	댓글 수정	PATCH	PUT
073	알림 읽음	PATCH	PUT
074	전체 읽음	PATCH	PUT
075	알림 설정	PATCH	GET/PUT
5️⃣ EXPENSE 도메인 누락/통합
API 스키마에 있는 EXPENSE API (6개)
#	Method	Endpoint	상세 문서
046	GET	/challenges/{id}/expenses	❌ 없음
047	GET	/expenses/{expenseId}	❌ 없음
048	POST	/challenges/{id}/expenses	❌ 없음
049	PATCH	/expenses/{expenseId}	❌ 없음
050	DELETE	/expenses/{expenseId}	❌ 없음
051	POST	/expenses/{expenseId}/execute	❌ 없음
→ EXPENSE 6개 API가 상세 문서에서 누락됨 (LEDGER로 통합 추정)

6️⃣ Enum 불일치 총괄
ChallengeCategory
API 스키마	API 상세	DB 세부문서
❌ 없음	STUDY	STUDY
❌ 없음	FITNESS	EXERCISE
❌ 없음	HOBBY	HOBBY
❌ 없음	FINANCE	SAVINGS
❌ 없음	LIFESTYLE	❌ 없음
❌ 없음	OTHER	OTHER
❌ 없음	❌ 없음	TRAVEL
❌ 없음	❌ 없음	FOOD
❌ 없음	❌ 없음	CULTURE
ChallengeStatus
API 스키마	API 명세서	API 상세	DB
RECRUITING	RECRUITING	RECRUITING	RECRUITING
ACTIVE	IN_PROGRESS	IN_PROGRESS	ACTIVE
CLOSED	COMPLETED	COMPLETED	CLOSED
❌ 없음	DISSOLVED	❌ 없음	PAUSED
VoteChoice
API 스키마	API 명세서	API 상세	DB
AGREE	AGREE	AGREE	APPROVE
DISAGREE	DISAGREE	DISAGREE	REJECT
ABSTAIN	ABSTAIN	ABSTAIN	❌ 없음
❌ 없음	❌ 없음	❌ 없음	ATTEND
❌ 없음	❌ 없음	❌ 없음	ABSENT
VoteType
API 스키마	API 상세	DB
EXPENSE	EXPENSE	EXPENSE
KICK	KICK	KICK
LEADER_KICK	LEADER_KICK	LEADER_KICK
DISSOLVE	DISSOLVE	DISSOLVE
❌ 없음	❌ 없음	MEETING_ATTENDANCE
VoteStatus
API 스키마	API 상세	DB
IN_PROGRESS	IN_PROGRESS	PENDING
APPROVED	APPROVED	APPROVED
REJECTED	REJECTED	REJECTED
CANCELLED	❌ 없음	❌ 없음
EXPIRED	❌ 없음	EXPIRED
MeetingAttendance Status
API 상세	DB
CONFIRMED	REGISTERED
DECLINED	❌ 없음
PENDING	❌ 없음
❌ 없음	ATTENDED
❌ 없음	NO_SHOW
MemberRole
API 명세서	API 상세	DB
LEADER	LEADER	LEADER
MEMBER	FOLLOWER	FOLLOWER
7️⃣ 수수료 정책 불일치
구분	API (스키마/명세서/상세)	DB 세부문서
소액	0 ~ 50,000원 / 1%	0 ~ 9,999원 / 1%
일반	50,001 ~ 500,000원 / 3%	10,000 ~ 200,000원 / 3%
고액	500,001원 이상 / 1.5%	200,001원 이상 / 1.5%
8️⃣ DB 테이블 누락 (API에 있으나 DB에 없음)
API 도메인	필요 테이블	DB 존재 여부
REFUND	refunds	❌ 없음
SETTLEMENT	settlements	❌ 없음
EXPENSE	expenses	❌ 없음
NOTIFICATION	notification_settings	❌ 없음
POST	(title 컬럼)	❌ 없음
POST	(viewCount 컬럼)	❌ 없음
POST	(category 컬럼)	❌ 없음
9️⃣ 에러 코드 불일치 (샘플)
API	명세서	상세
001 회원가입	AUTH_001, AUTH_002	VALIDATION_001, USER_002
002 로그인	AUTH_004	AUTH_001, USER_005
004 토큰갱신	AUTH_008, AUTH_009	AUTH_004
🔴 심각도별 요약
🔴 높음 (즉시 수정 필요)
항목	내용
DB 테이블 누락	refunds, settlements, expenses, notification_settings
EXPENSE API 누락	6개 API가 상세 문서에 없음
DJANGO 엔드포인트	스키마와 상세가 완전히 다름
Enum 불일치	VoteChoice, ChallengeStatus, MeetingAttendance
수수료 정책	API vs DB 금액 구간 완전히 다름
🟡 중간 (조율 필요)
항목	내용
HTTP 메서드	PATCH vs PUT (4개 API)
경로 패턴	challengeId 포함 여부
새 API 추가	스키마/명세서 업데이트 필요 (4개)
ChallengeCategory	API vs DB 값 불일치
🟢 낮음 (문서 정리)
항목	내용
에러 코드	코드 체계 통일 필요
테이블명	meeting_attendance vs meeting_attendees
API 번호	046-053 건너뜀