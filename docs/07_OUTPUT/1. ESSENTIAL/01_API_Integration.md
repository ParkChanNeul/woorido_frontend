================================================================================
                    WOORIDO API 엔드포인트 통합표 v2.0.0
================================================================================

작성일      2026-01-16
버전        2.0.0
기준 문서   API_SCHEMA_1.0.0.md, BACKLOG.md, POLICY_DEFINITION.md

================================================================================
1. 기본 정보
================================================================================
Base URL        https://api.woorido.com/api/v1
Content-Type    application/json
Encoding        UTF-8
인증 방식       Bearer JWT

================================================================================
2. API 목록 (총 92개: Spring 83 + Django 9)
================================================================================

────────────────────────────────────────────────────────────────────────────────
2.1 AUTH (8개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                     설명                   우선순위  인증
───  ──────  ───────────────────────────  ─────────────────────  ────────  ────
001  POST    /auth/signup                 회원가입                P0        N
002  POST    /auth/login                  로그인                  P0        N
003  POST    /auth/logout                 로그아웃                P0        Y
004  POST    /auth/refresh                토큰 갱신               P0        N
005  POST    /auth/email/verify           인증 코드 발송          P1        N
006  POST    /auth/email/confirm          인증 코드 확인          P1        N
007  POST    /auth/password/reset         비밀번호 재설정 요청    P0        N
008  PUT     /auth/password/reset         비밀번호 재설정 실행    P1        N

────────────────────────────────────────────────────────────────────────────────
2.2 USER (6개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                     설명                   우선순위  인증
───  ──────  ───────────────────────────  ─────────────────────  ────────  ────
009  GET     /users/me                    내 정보 조회            P0        Y
010  PUT     /users/me                    내 정보 수정            P0        Y
011  PUT     /users/me/password           비밀번호 변경           P1        Y
012  DELETE  /users/me                    회원 탈퇴               P1        Y
013  GET     /users/{userId}              사용자 조회             P1        Y
014  GET     /users/check-nickname        닉네임 중복 체크        P0        N

────────────────────────────────────────────────────────────────────────────────
2.3 ACCOUNT (7개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                     설명                   우선순위  인증
───  ──────  ───────────────────────────  ─────────────────────  ────────  ────
015  GET     /accounts/me                 내 어카운트 조회        P0        Y
016  GET     /accounts/me/transactions    거래 내역 조회          P0        Y
017  POST    /accounts/charge             크레딧 충전             P0        Y
018  POST    /accounts/charge/callback    충전 콜백 (내부)        P0        N
019  POST    /accounts/withdraw           출금                    P0        Y
020  POST    /accounts/support            서포트 수동 납입        P0        Y
021  GET     /accounts/fee-policy         수수료 정책 조회        P2        Y

────────────────────────────────────────────────────────────────────────────────
2.4 CHALLENGE (8개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명                  우선순위  인증
───  ──────  ────────────────────────────────────────  ────────────────────  ────────  ────
022  POST    /challenges                               챌린지 생성            P0        Y
023  GET     /challenges                               챌린지 목록 조회       P0        Y
024  GET     /challenges/{challengeId}                 챌린지 상세 조회       P0        Y
025  PUT     /challenges/{challengeId}                 챌린지 수정            P0        Y
026  DELETE  /challenges/{challengeId}                 챌린지 삭제            P1        Y
027  GET     /challenges/me                            내 챌린지 목록         P0        Y
028  GET     /challenges/{challengeId}/account         챌린지 어카운트 조회   P0        Y
029  PUT     /challenges/{challengeId}/support/settings  자동 납입 설정       P1        Y

────────────────────────────────────────────────────────────────────────────────
2.5 CHALLENGE FOLLOWER (5개) - Spring
    * BACKLOG 기준: member → follower 용어 변경 완료
    * 엔드포인트 경로는 /members 유지 (하위 호환성)
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                       설명              우선순위  인증
───  ──────  ─────────────────────────────────────────────  ────────────────  ────────  ────
030  POST    /challenges/{challengeId}/join                 챌린지 가입        P0        Y
031  DELETE  /challenges/{challengeId}/leave                챌린지 탈퇴        P0        Y
032  GET     /challenges/{challengeId}/followers            팔로워 목록 조회   P0        Y
033  GET     /challenges/{challengeId}/followers/{oderwId}  팔로워 상세 조회   P1        Y
034  POST    /challenges/{challengeId}/delegate             리더 위임          P1        Y

────────────────────────────────────────────────────────────────────────────────
2.6 MEETING (7개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명              우선순위  인증
───  ──────  ────────────────────────────────────────  ────────────────  ────────  ────
035  GET     /challenges/{challengeId}/meetings        모임 목록 조회     P0        Y
036  GET     /meetings/{meetingId}                     모임 상세 조회     P0        Y
037  POST    /challenges/{challengeId}/meetings        모임 생성          P0        Y
038  PUT     /meetings/{meetingId}                     모임 수정          P1        Y
039  POST    /meetings/{meetingId}/attendance          참석 의사 표시     P0        Y
040  POST    /meetings/{meetingId}/complete            모임 완료 처리     P0        Y
092  DELETE  /meetings/{meetingId}/attendance          참석 취소          P1        Y

────────────────────────────────────────────────────────────────────────────────
2.7 VOTE (5개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명              우선순위  인증
───  ──────  ────────────────────────────────────────  ────────────────  ────────  ────
041  GET     /challenges/{challengeId}/votes           투표 목록 조회     P0        Y
042  GET     /votes/{voteId}                           투표 상세 조회     P0        Y
043  POST    /challenges/{challengeId}/votes           투표 생성          P0        Y
044  PUT     /votes/{voteId}/cast                      투표하기           P0        Y
045  GET     /votes/{voteId}/result                    투표 결과 조회     P1        Y

────────────────────────────────────────────────────────────────────────────────
2.8 EXPENSE (6개) - Spring
    * // TODO: 05_API_EXPENSE.md 상세 문서 필요
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명              우선순위  인증
───  ──────  ────────────────────────────────────────  ────────────────  ────────  ────
046  GET     /challenges/{challengeId}/expenses        지출 목록 조회     P0        Y
047  GET     /expenses/{expenseId}                     지출 상세 조회     P0        Y
048  POST    /challenges/{challengeId}/expenses        지출 요청          P0        Y
049  PUT     /expenses/{expenseId}                     지출 요청 수정     P1        Y
050  DELETE  /expenses/{expenseId}                     지출 요청 취소     P1        Y
051  POST    /expenses/{expenseId}/execute             지출 실행          P0        Y

────────────────────────────────────────────────────────────────────────────────
2.9 LEDGER (5개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명              우선순위  인증
───  ──────  ────────────────────────────────────────  ────────────────  ────────  ────
052  GET     /challenges/{challengeId}/ledger          장부 조회          P0        Y
053  GET     /challenges/{challengeId}/ledger/export   장부 내보내기      P2        Y
054  GET     /challenges/{challengeId}/ledger/summary  장부 요약          P1        Y
055  POST    /challenges/{challengeId}/ledger          장부 등록          P1        Y
056  PUT     /ledger/{entryId}                         장부 수정          P1        Y

────────────────────────────────────────────────────────────────────────────────
2.10 POST (9개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
057  GET     /posts/feed                               피드 조회           P1        Y
058  GET     /challenges/{challengeId}/posts           게시글 목록 조회    P1        Y
059  GET     /posts/{postId}                           게시글 상세 조회    P1        Y
060  POST    /challenges/{challengeId}/posts           게시글 작성         P1        Y
061  PUT     /posts/{postId}                           게시글 수정         P1        Y
062  DELETE  /posts/{postId}                           게시글 삭제         P1        Y
063  POST    /posts/{postId}/like                      게시글 좋아요       P1        Y
064  DELETE  /posts/{postId}/like                      게시글 좋아요 취소  P1        Y
065  POST    /upload/image                             이미지 업로드       P0        Y

────────────────────────────────────────────────────────────────────────────────
2.11 COMMENT (6개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
066  GET     /posts/{postId}/comments                  댓글 목록 조회      P1        Y
067  POST    /posts/{postId}/comments                  댓글 작성           P1        Y
068  PUT     /comments/{commentId}                     댓글 수정           P1        Y
069  DELETE  /comments/{commentId}                     댓글 삭제           P1        Y
070  POST    /comments/{commentId}/like                댓글 좋아요         P2        Y
071  DELETE  /comments/{commentId}/like                댓글 좋아요 취소    P2        Y

────────────────────────────────────────────────────────────────────────────────
2.12 REPORT (2개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
072  POST    /reports                                  신고 접수           P1        Y
073  GET     /reports/me                               내 신고 내역 조회   P2        Y

────────────────────────────────────────────────────────────────────────────────
2.13 NOTIFICATION (5개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
074  GET     /notifications                            알림 목록 조회      P0        Y
075  PUT     /notifications/{notificationId}/read      알림 읽음 처리      P1        Y
076  PUT     /notifications/read-all                   전체 읽음 처리      P1        Y
077  GET     /notifications/settings                   알림 설정 조회      P1        Y
078  PUT     /notifications/settings                   알림 설정 변경      P1        Y

────────────────────────────────────────────────────────────────────────────────
2.14 REFUND (2개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
079  POST    /refunds                                  환불 요청           P1        Y
080  GET     /refunds/{refundId}                       환불 상태 조회      P1        Y

────────────────────────────────────────────────────────────────────────────────
2.15 SETTLEMENT (2개) - Spring
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
081  POST    /challenges/{challengeId}/settle          챌린지 정산         P0        Y
082  GET     /challenges/{challengeId}/settlement      정산 내역 조회      P1        Y

────────────────────────────────────────────────────────────────────────────────
2.16 SEARCH (3개) - Django
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
083  GET     /search                                   통합 검색           P1        Y
084  GET     /search/challenges                        챌린지 상세 검색    P2        Y
085  GET     /search/autocomplete                      검색어 자동완성     P2        Y

────────────────────────────────────────────────────────────────────────────────
2.17 ANALYTICS (4개) - Django
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
086  GET     /analytics/user/activity                  내 활동 통계        P1        Y
087  GET     /analytics/challenge/{challengeId}        챌린지 분석         P1        Y
088  GET     /analytics/dashboard                      대시보드 데이터     P2        Y
089  GET     /analytics/user/report                    월간 리포트         P2        Y

────────────────────────────────────────────────────────────────────────────────
2.18 RECOMMENDATION (2개) - Django
────────────────────────────────────────────────────────────────────────────────
NO   METHOD  ENDPOINT                                  설명               우선순위  인증
───  ──────  ────────────────────────────────────────  ─────────────────  ────────  ────
090  GET     /recommendations/challenges               챌린지 추천         P1        Y
091  GET     /recommendations/users                    유사 사용자 추천    P2        Y

================================================================================
3. API 통계
================================================================================
도메인             API 수    서버      비고
─────────────────  ──────    ──────    ────────────────────────────
AUTH               8         Spring
USER               6         Spring
ACCOUNT            7         Spring
CHALLENGE          8         Spring
FOLLOWER           5         Spring    // BACKLOG: member→follower
MEETING            7         Spring    // 092 참석취소 포함
VOTE               5         Spring
EXPENSE            6         Spring    // TODO: 상세 문서 필요
LEDGER             5         Spring
POST               9         Spring
COMMENT            6         Spring
REPORT             2         Spring
NOTIFICATION       5         Spring
REFUND             2         Spring
SETTLEMENT         2         Spring
─────────────────  ──────    ──────
Spring 소계        83
─────────────────  ──────    ──────
SEARCH             3         Django
ANALYTICS          4         Django
RECOMMENDATION     2         Django
─────────────────  ──────    ──────
Django 소계        9
─────────────────  ──────    ──────
총 합계            92

================================================================================
4. 인증 불필요 API (9개)
================================================================================
NO    METHOD  ENDPOINT                      설명
────  ──────  ────────────────────────────  ────────────────────────
001   POST    /auth/signup                  회원가입
002   POST    /auth/login                   로그인
004   POST    /auth/refresh                 토큰 갱신
005   POST    /auth/email/verify            인증 코드 발송
006   POST    /auth/email/confirm           인증 코드 확인
007   POST    /auth/password/reset          비밀번호 재설정 요청
008   PUT     /auth/password/reset          비밀번호 재설정 실행
014   GET     /users/check-nickname         닉네임 중복 체크
018   POST    /accounts/charge/callback     충전 콜백 (내부/PG 서명)

================================================================================
5. 우선순위별 API 수
================================================================================
우선순위    API 수    비율
──────────  ──────    ──────
P0          42        45.7%
P1          38        41.3%
P2          12        13.0%
──────────  ──────    ──────
합계        92        100%

================================================================================
6. 문서 미비 사항 (TODO)
================================================================================
항목                              상태        비고
────────────────────────────────  ──────────  ────────────────────────
05_API_EXPENSE.md                 미작성      상세 API 문서 필요
엔드포인트 경로 용어 통일         미완료      /members → /followers 변경 검토
API_SCHEMA 하단 총계 오류         수정 필요   Spring 82+Django 10 → 83+9

================================================================================
                         문서 종료
================================================================================
작성일          2026-01-16
버전            2.0.0
총 API 수       92개 (Spring 83 + Django 9)
인증 불필요     9개
인증 필요       83개