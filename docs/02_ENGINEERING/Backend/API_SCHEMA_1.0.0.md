작성일      2026-01-15
버전        1.0.0
기준 문서   PRODUCT_AGENDA.md, POLICY_DEFINITION.md, DB_Schema_1.0.0.md

### 1. 기본 정보
Base URL        https://api.woorido.com/api/v1
Content-Type    application/json
Encoding        UTF-8

### 2. API 목록
2.1 AUTH (8개)
NO   METHOD   ENDPOINT                    설명                  우선순위  인증
───  ──────   ─────────────────────────   ──────────────────    ────────  ────
001  POST     /auth/signup                회원가입               P0        N
002  POST     /auth/login                 로그인                 P0        N
003  POST     /auth/logout                로그아웃               P0        Y
004  POST     /auth/refresh               토큰 갱신              P0        N
005  POST     /auth/email/verify          인증 코드 발송         P1        N
006  POST     /auth/email/confirm         인증 코드 확인         P1        N
007  POST     /auth/password/reset        비밀번호 재설정 요청   P0        N
008  PUT      /auth/password/reset        비밀번호 재설정 실행   P1        N

2.2 USER (6개)
NO   METHOD   ENDPOINT                    설명                  우선순위  인증
───  ──────   ─────────────────────────   ──────────────────    ────────  ────
009  GET      /users/me                   내 정보 조회           P0        Y
010  PUT      /users/me                   내 정보 수정           P0        Y
011  PUT      /users/me/password          비밀번호 변경          P1        Y
012  DELETE   /users/me                   회원 탈퇴              P1        Y
013  GET      /users/{userId}             사용자 조회            P1        Y
014  GET      /users/check-nickname       닉네임 중복 체크       P0        N

2.3 ACCOUNT (7개)
NO   METHOD   ENDPOINT                    설명                  우선순위  인증
───  ──────   ─────────────────────────   ──────────────────    ────────  ────
015  GET      /accounts/me                내 어카운트 조회       P0        Y
016  GET      /accounts/me/transactions   거래 내역 조회         P0        Y
017  POST     /accounts/charge            크레딧 충전            P0        Y
018  POST     /accounts/charge/callback   충전 콜백 (내부)       P0        N
019  POST     /accounts/withdraw          출금                   P0        Y
020  POST     /accounts/support           서포트 수동 납입       P0        Y
021  GET      /accounts/fee-policy        수수료 정책 조회       P2        Y

2.4 CHALLENGE (8개)
NO   METHOD   ENDPOINT                                 설명                  우선순위  인증
───  ──────   ───────────────────────────────────────  ──────────────────    ────────  ────
022  POST     /challenges                              챌린지 생성            P0        Y
023  GET      /challenges                              챌린지 목록 조회       P0        Y
024  GET      /challenges/{challengeId}                챌린지 상세 조회       P0        Y
025  PUT      /challenges/{challengeId}                챌린지 수정            P0        Y
026  DELETE   /challenges/{challengeId}                챌린지 삭제            P1        Y
027  GET      /challenges/me                           내 챌린지 목록         P0        Y
028  GET      /challenges/{challengeId}/account        챌린지 어카운트 조회   P0        Y
029  PUT      /challenges/{challengeId}/support/settings  자동 납입 설정      P1        Y

2.5 CHALLENGE MEMBER (5개)
NO   METHOD   ENDPOINT                                      설명              우선순위  인증
───  ──────   ────────────────────────────────────────────  ────────────────  ────────  ────
030  POST     /challenges/{challengeId}/join                챌린지 가입        P0        Y
031  DELETE   /challenges/{challengeId}/leave               챌린지 탈퇴        P0        Y
032  GET      /challenges/{challengeId}/members             멤버 목록 조회     P0        Y
033  GET      /challenges/{challengeId}/members/{memberId}  멤버 상세 조회     P1        Y
034  POST     /challenges/{challengeId}/delegate            리더 위임          P1        Y

2.6 MEETING (6개)
NO   METHOD   ENDPOINT                                 설명              우선순위  인증
───  ──────   ───────────────────────────────────────  ────────────────  ────────  ────
035  GET      /challenges/{challengeId}/meetings       모임 목록 조회     P0        Y
036  GET      /meetings/{meetingId}                    모임 상세 조회     P0        Y
037  POST     /challenges/{challengeId}/meetings       모임 생성          P0        Y
038  PUT      /meetings/{meetingId}                    모임 수정          P1        Y
039  POST     /meetings/{meetingId}/attendance         참석 의사 표시     P0        Y
040  POST     /meetings/{meetingId}/complete           모임 완료 처리     P0        Y

2.7 VOTE (5개)
NO   METHOD   ENDPOINT                                 설명              우선순위  인증
───  ──────   ───────────────────────────────────────  ────────────────  ────────  ────
041  GET      /challenges/{challengeId}/votes          투표 목록 조회     P0        Y
042  GET      /votes/{voteId}                          투표 상세 조회     P0        Y
043  POST     /challenges/{challengeId}/votes          투표 생성          P0        Y
044  PUT      /votes/{voteId}/cast                     투표하기           P0        Y
045  GET      /votes/{voteId}/result                   투표 결과 조회     P1        Y

2.8 EXPENSE (6개)
NO   METHOD   ENDPOINT                                 설명              우선순위  인증
───  ──────   ───────────────────────────────────────  ────────────────  ────────  ────
046  GET      /challenges/{challengeId}/expenses       지출 목록 조회     P0        Y
047  GET      /expenses/{expenseId}                    지출 상세 조회     P0        Y
048  POST     /challenges/{challengeId}/expenses       지출 요청          P0        Y
049  PUT      /expenses/{expenseId}                    지출 요청 수정     P1        Y
050  DELETE   /expenses/{expenseId}                    지출 요청 취소     P1        Y
051  POST     /expenses/{expenseId}/execute            지출 실행          P0        Y

2.9 LEDGER (5개)
NO   METHOD   ENDPOINT                                 설명              우선순위  인증
───  ──────   ───────────────────────────────────────  ────────────────  ────────  ────
052  GET      /challenges/{challengeId}/ledger         장부 조회          P0        Y
053  GET      /challenges/{challengeId}/ledger/export  장부 내보내기      P2        Y
054  GET      /challenges/{challengeId}/ledger/summary 장부 요약          P1        Y
055  POST     /challenges/{challengeId}/ledger         장부 등록          P1        Y
056  PUT      /ledger/{entryId}                        장부 수정          P1        Y

2.10 POST (9개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
057  GET      /posts/feed                              피드 조회           P1        Y
058  GET      /challenges/{challengeId}/posts          게시글 목록 조회    P1        Y
059  GET      /posts/{postId}                          게시글 상세 조회    P1        Y
060  POST     /challenges/{challengeId}/posts          게시글 작성         P1        Y
061  PUT      /posts/{postId}                          게시글 수정         P1        Y
062  DELETE   /posts/{postId}                          게시글 삭제         P1        Y
063  POST     /posts/{postId}/like                     게시글 좋아요       P1        Y
064  DELETE   /posts/{postId}/like                     게시글 좋아요 취소  P1        Y
065  POST     /upload/image                            이미지 업로드       P0        Y

2.11 COMMENT (6개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
066  GET      /posts/{postId}/comments                 댓글 목록 조회      P1        Y
067  POST     /posts/{postId}/comments                 댓글 작성           P1        Y
068  PUT      /comments/{commentId}                    댓글 수정           P1        Y
069  DELETE   /comments/{commentId}                    댓글 삭제           P1        Y
070  POST     /comments/{commentId}/like               댓글 좋아요         P2        Y
071  DELETE   /comments/{commentId}/like               댓글 좋아요 취소    P2        Y

2.12 REPORT (2개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
072  POST     /reports                                 신고 접수           P1        Y
073  GET      /reports/me                              내 신고 내역 조회   P2        Y

2.13 NOTIFICATION (5개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
074  GET      /notifications                           알림 목록 조회      P0        Y
075  PUT      /notifications/{notificationId}/read     알림 읽음 처리      P1        Y
076  PUT      /notifications/read-all                  전체 읽음 처리      P1        Y
077  GET      /notifications/settings                  알림 설정 조회      P1        Y
078  PUT      /notifications/settings                  알림 설정 변경      P1        Y

2.14 REFUND (2개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
079  POST     /refunds                                 환불 요청           P1        Y
080  GET      /refunds/{refundId}                      환불 상태 조회      P1        Y

2.15 SETTLEMENT (2개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
081  POST     /challenges/{challengeId}/settle         챌린지 정산         P0        Y
082  GET      /challenges/{challengeId}/settlement     정산 내역 조회      P1        Y

2.16 SEARCH - Django (3개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
083  GET      /search                                  통합 검색           P1        Y
084  GET      /search/challenges                       챌린지 상세 검색    P2        Y
085  GET      /search/autocomplete                     검색어 자동완성     P2        Y

2.17 ANALYTICS - Django (4개)
NO   METHOD   ENDPOINT                                      설명               우선순위  인증
───  ──────   ────────────────────────────────────────────  ─────────────────  ────────  ────
086  GET      /analytics/user/activity                      내 활동 통계        P1        Y
087  GET      /analytics/challenge/{challengeId}            챌린지 분석         P1        Y
088  GET      /analytics/dashboard                          대시보드 데이터     P2        Y
089  GET      /analytics/user/report                        월간 리포트         P2        Y

2.18 RECOMMENDATION - Django (2개)
NO   METHOD   ENDPOINT                                 설명               우선순위  인증
───  ──────   ───────────────────────────────────────  ─────────────────  ────────  ────
090  GET      /recommendations/challenges              챌린지 추천         P1        Y
091  GET      /recommendations/users                   유사 사용자 추천    P2        Y

### 3. Enum 정의
3.1 사용자
UserStatus              ACTIVE | SUSPENDED | WITHDRAWN

3.2 챌린지
ChallengeStatus         RECRUITING | IN_PROGRESS | COMPLETED
ChallengeCategory       HOBBY | STUDY | EXERCISE | SAVINGS | TRAVEL | FOOD | CULTURE | OTHER

3.3 멤버
MemberRole              LEADER | FOLLOWER
MemberStatus            ACTIVE | OVERDUE | GRACE_PERIOD | SUSPENDED | WITHDRAWN

3.4 투표
VoteType                EXPENSE | KICK | LEADER_KICK | DISSOLVE | MEETING_ATTENDANCE
VoteStatus              IN_PROGRESS | APPROVED | REJECTED | EXPIRED
MeetingVoteChoice       AGREE | DISAGREE
ExpenseVoteChoice       APPROVE | REJECT
GeneralVoteChoice       APPROVE | REJECT

3.5 지출
ExpenseStatus           PENDING | VOTING | APPROVED | REJECTED | EXECUTING | COMPLETED | CANCELLED
ExpenseCategory         FOOD | TRANSPORT | SUPPLIES | EVENT | OTHER

3.6 모임
MeetingStatus           VOTING | CONFIRMED | COMPLETED | CANCELLED
AttendanceStatus        CONFIRMED | DECLINED | PENDING

3.7 거래
TransactionType         CHARGE | WITHDRAW | SUPPORT | BENEFIT | ENTRY_FEE |
                        DEPOSIT_LOCK | DEPOSIT_UNLOCK | DEPOSIT_DEDUCT |
                        EXPENSE | REFUND | FEE | SETTLEMENT

3.8 알림
NotificationType        CHALLENGE | VOTE | MEETING | SUPPORT | SNS | SYSTEM

3.9 신고
ReportReason            SPAM | HARASSMENT | INAPPROPRIATE | FRAUD | OTHER
ReportStatus            PENDING | REVIEWING | RESOLVED | REJECTED

3.10 환불
RefundStatus            PENDING | PROCESSING | COMPLETED | REJECTED

### 4. 에러 코드
4.1 AUTH
코드         HTTP    메시지
──────────   ─────   ─────────────────────────────────
AUTH_001     401     인증이 필요합니다
AUTH_002     401     액세스 토큰이 만료되었습니다
AUTH_003     403     권한이 없습니다
AUTH_004     401     리프레시 토큰이 만료되었습니다
AUTH_005     400     이메일 인증이 필요합니다
AUTH_006     400     인증 코드가 일치하지 않습니다
AUTH_007     400     잠시 후 다시 시도해주세요
AUTH_008     400     인증 코드가 만료되었습니다
AUTH_009     400     재설정 토큰이 만료되었습니다
AUTH_015     403     관리자 권한이 필요합니다

4.2 USER
코드         HTTP    메시지
──────────   ─────   ─────────────────────────────────
USER_001     404     사용자를 찾을 수 없습니다
USER_002     409     이미 존재하는 이메일입니다
USER_003     400     현재 비밀번호가 일치하지 않습니다
USER_004     400     당도가 음수인 사용자는 가입할 수 없습니다
USER_005     400     탈퇴 대기 상태입니다
USER_006     400     닉네임 형식 오류 (2-20자)

4.3 ACCOUNT
코드           HTTP    메시지
────────────   ─────   ─────────────────────────────────
ACCOUNT_001    404     어카운트를 찾을 수 없습니다
ACCOUNT_002    400     충전 금액은 10,000원 이상이어야 합니다
ACCOUNT_003    400     출금 가능 금액을 초과했습니다
ACCOUNT_004    400     잔액이 부족합니다
ACCOUNT_005    400     일일 출금 한도를 초과했습니다
ACCOUNT_006    400     월간 출금 한도를 초과했습니다

4.4 CHALLENGE
코드             HTTP    메시지
──────────────   ─────   ─────────────────────────────────
CHALLENGE_001    404     챌린지를 찾을 수 없습니다
CHALLENGE_002    400     이미 가입한 챌린지입니다
CHALLENGE_003    403     챌린지 멤버가 아닙니다
CHALLENGE_004    403     리더만 수행할 수 있습니다
CHALLENGE_005    400     챌린지 정원이 초과되었습니다
CHALLENGE_006    400     모집 중인 챌린지가 아닙니다
CHALLENGE_007    400     리더당 챌린지 생성 한도(3개) 초과
CHALLENGE_010    400     활성화된 챌린지는 삭제할 수 없습니다

4.5 MEMBER
코드           HTTP    메시지
────────────   ─────   ─────────────────────────────────
MEMBER_001     404     멤버를 찾을 수 없습니다
MEMBER_002     400     리더는 탈퇴할 수 없습니다
MEMBER_003     403     정지된 멤버입니다
MEMBER_004     400     자신에게 위임할 수 없습니다

4.6 MEETING
코드           HTTP    메시지
────────────   ─────   ─────────────────────────────────
MEETING_001    404     모임을 찾을 수 없습니다
MEETING_002    400     이미 지난 모임입니다
MEETING_003    400     이미 참석 의사를 표시했습니다

4.7 VOTE
코드         HTTP    메시지
──────────   ─────   ─────────────────────────────────
VOTE_001     404     투표를 찾을 수 없습니다
VOTE_002     400     마감 시간은 최소 24시간 이후여야 합니다
VOTE_003     403     투표 권한이 없습니다
VOTE_004     409     이미 진행 중인 동일 유형의 투표가 있습니다
VOTE_005     400     투표가 마감되었습니다
VOTE_006     409     이미 투표하셨습니다
VOTE_007     400     아직 진행 중인 투표입니다

4.8 EXPENSE
코드           HTTP    메시지
────────────   ─────   ─────────────────────────────────
EXPENSE_001    404     지출을 찾을 수 없습니다
EXPENSE_003    403     지출 조회 권한이 없습니다
EXPENSE_004    400     지출 금액이 잔액을 초과합니다
EXPENSE_005    400     PENDING 상태에서만 수정 가능합니다
EXPENSE_006    403     지출 요청자만 수정/취소 가능합니다

4.9 POST / COMMENT
코드           HTTP    메시지
────────────   ─────   ─────────────────────────────────
POST_001       404     게시글을 찾을 수 없습니다
POST_002       403     게시글 조회 권한이 없습니다
POST_003       403     게시글 작성자만 가능합니다
COMMENT_001    404     댓글을 찾을 수 없습니다
COMMENT_002    403     댓글 작성자만 가능합니다

4.10 LEDGER
코드           HTTP    메시지
────────────   ─────   ─────────────────────────────────
LEDGER_001     400     금액은 1원 이상이어야 합니다
LEDGER_002     400     챌린지 잔액이 부족합니다
LEDGER_003     400     정산 완료된 항목은 수정할 수 없습니다
LEDGER_004     404     장부 항목을 찾을 수 없습니다

4.11 기타
코드               HTTP    메시지
────────────────   ─────   ─────────────────────────────────
REPORT_001         404     신고를 찾을 수 없습니다
REPORT_002         404     신고 대상을 찾을 수 없습니다
NOTIFICATION_001   404     알림을 찾을 수 없습니다
REFUND_001         400     환불 가능 금액을 초과했습니다
REFUND_002         400     환불 금액이 납입 금액을 초과합니다
SETTLEMENT_001     400     이미 정산이 진행 중입니다
SETTLEMENT_002     400     이미 정산이 완료되었습니다
FILE_001           400     지원하지 않는 파일 형식입니다
FILE_002           400     파일 크기 초과 (최대 10MB)
SEARCH_001         400     검색어는 2자 이상이어야 합니다
VALIDATION_001     400     유효성 검증 실패

### 5. 수수료 정책
구간     금액 범위              수수료율
─────    ───────────────────    ────────
소액     0 ~ 9,999원            1%
일반     10,000 ~ 200,000원     3%
고액     200,001원 이상         1.5%

충전 수수료    0%
최소 충전      10,000원
충전 단위      10,000원

### 6. API 통계
도메인           API 수    서버
─────────────    ──────    ──────
AUTH             8         Spring
USER             6         Spring
ACCOUNT          7         Spring
CHALLENGE        8         Spring
MEMBER           5         Spring
MEETING          6         Spring
VOTE             5         Spring
EXPENSE          6         Spring
LEDGER           5         Spring
POST             9         Spring
COMMENT          6         Spring
REPORT           2         Spring
NOTIFICATION     5         Spring
REFUND           2         Spring
SETTLEMENT       2         Spring
SEARCH           3         Django
ANALYTICS        4         Django
RECOMMENDATION   2         Django
─────────────    ──────    ──────
검색/분석/추천 3개 도메인 (Django)
─────────────    ──────    ──────
합계             92        Spring 83 / Django 9

### 7. 인증 불필요 API
NO    ENDPOINT                    설명
────  ─────────────────────────   ──────────────────
001   POST /auth/signup           회원가입
002   POST /auth/login            로그인
004   POST /auth/refresh          토큰 갱신
005   POST /auth/email/verify     인증 코드 발송
006   POST /auth/email/confirm    인증 코드 확인
007   POST /auth/password/reset   비밀번호 재설정 요청
008   PUT  /auth/password/reset   비밀번호 재설정 실행
014   GET  /users/check-nickname  닉네임 중복 체크
018   POST /accounts/charge/callback  충전 콜백 (내부)

================================================================================
                         WOORIDO API 스키마 v1.0.0
                              문서 종료
================================================================================

작성일          2026-01-15
버전            1.0.0
총 API 수       92개 (Spring 83 + Django 9)
인증 불필요     9개
인증 필요       83개