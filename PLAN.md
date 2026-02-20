## DB 스키마 기준 통합 실행 계획 (백엔드 구현 + 프론트 계약/계층 반영)

### 요약
기준을 `frontend/db 전체 스키마.txt`로 고정하고, `테이블 추가 없이` 백엔드 미구현 기능을 구현한다.  
프론트는 백엔드 계약에 맞춰 API/타입을 재정렬하고, 페이지·도메인 컴포넌트·모달/오버레이 계층까지 포함해 기능을 활성화한다.  
확정된 운영 정책은 `기존 관례 유지 + ApiResponse 우선`, `Capability 점진 활성화`이다.

### 확정된 기준
1. DB 스키마가 1차 기준이다.
2. 백엔드는 스키마 내 테이블만 사용하고 신규 테이블은 만들지 않는다.
3. Expense API는 `Challenge 하위 리소스`로 고정한다.
4. 신규 API는 가능하면 `ApiResponse`를 사용하고, 예외는 명시적으로 관리한다.
5. 프론트는 기능별 capability를 켜면서 순차 배포한다.

### 백엔드 구현 범위(테이블 추가 없음)
1. Expense API 구현 (`EXPENSE_REQUESTS`, `EXPENSE_VOTES`, `EXPENSE_VOTE_RECORDS`, `PAYMENT_BARCODES`, `LEDGER_ENTRIES` 사용).
2. Vote result API 구현.
3. Notification 확장 API 구현 (`NOTIFICATIONS`, `NOTIFICATION_SETTINGS` 사용).
4. 기존 endpoint와 충돌 없이 컨트롤러 관례 유지.

### 공개 API/인터페이스 변경(최종 계약)
1. `GET /challenges/{challengeId}/expenses`
2. `GET /challenges/{challengeId}/expenses/{expenseId}`
3. `POST /challenges/{challengeId}/expenses`
4. `PUT /challenges/{challengeId}/expenses/{expenseId}/approve`
5. `PUT /challenges/{challengeId}/expenses/{expenseId}`
6. `DELETE /challenges/{challengeId}/expenses/{expenseId}`
7. `GET /votes/{voteId}/result`
8. `GET /notifications/{id}`
9. `PUT /notifications/read-all`
10. `GET /notifications/settings`
11. `PUT /notifications/settings`

### 프론트 서비스 계층 변경
1. `src/lib/api/expense.ts`를 위 계약에 맞춰 유지하고 응답 어댑터 추가.
2. `src/lib/api/vote.ts`에 `getVoteResult` 추가.
3. `src/lib/api/notification.ts`에 detail/read-all/settings API 추가.
4. `src/lib/api/client.ts`에 에러 정규화 적용.
5. `src/lib/api/errorNormalizer.ts` 신규 도입.
6. `src/types/api.ts`는 `message` 기반 계약으로 단순화.
7. `src/lib/api/capabilities.ts`에서 기능별 on/off 관리.

### 프론트 페이지/도메인 컴포넌트/모달·오버레이 계층 계획
1. 페이지 계층
- `src/components/domain/Challenge/Ledger/ChallengeLedgerPage.tsx`: 지출 액션 진입점 추가.
- `src/components/domain/Challenge/Vote/VoteList.tsx`, `VoteDetail.tsx`: 결과 API 연동.
- `src/pages/SettingsPage.tsx`, `src/components/domain/Notification/NotificationOverlay.tsx`: 알림 설정 진입 연결.

2. 도메인 컴포넌트 계층
- `src/components/domain/Challenge/Ledger/ExpenseList.tsx`: 목록/상세/상태 표시를 백엔드 필드 기준으로 정렬.
- `src/components/domain/Notification/NotificationItem.tsx`: 현재 stub 액션을 실제 API로 연결.
- `src/components/domain/Challenge/Member/MemberDetail.tsx`: 위임 API 파라미터(`targetUserId`) 정렬 유지.

3. 모달/오버레이 계층
- 신규 모달: `ExpenseCreateModal`, `ExpenseDetailModal`, `ExpenseApproveModal`(또는 통합 `ExpenseActionModal`).
- 기존 모달 유지: `SupportSettingsModal`, `WithdrawAccountModal`, `PostDetailModal` 등.
- `src/store/modal/useModalStore.ts`에 expense 관련 slice 추가.
- `src/App.tsx`의 모달 나열을 `ModalHost` 컴포넌트로 통합.
- `ResponsiveOverlay`는 non-blocking 패널, `Modal`은 blocking 입력 플로우로 역할 고정.

### 상태/타입 정렬 규칙
1. Expense status는 백엔드 원본 상태를 우선 사용하고 UI 라벨만 매핑한다.
2. 서버 에러는 코드 prefix 우선 파싱(`EXPENSE_001` 등) 후 사용자 문구를 렌더한다.
3. 깨진 서버 메시지는 raw 로그로만 남기고 UI 노출 금지.

### 테스트 케이스
1. 계약 테스트: Expense/VoteResult/Notification 신규 endpoint 요청·응답 스키마 검증.
2. 단위 테스트: 에러 정규화(`code 파싱`, `깨진 메시지 fallback`).
3. 컴포넌트 테스트: Expense 목록/상세/승인 모달 상태 전이.
4. 통합 테스트: Ledger -> Expense 생성 -> Vote 반영 -> Result 조회 흐름.
5. 통합 테스트: Notification 목록 -> 단건 읽음 -> 전체 읽음 -> 설정 수정.
6. 회귀 테스트: 인증/리프레시/로그아웃, 기존 챌린지·모임·게시글 플로우.

### 수용 기준
1. DB 스키마 변경 없이 신규 기능이 동작한다.
2. 프론트에서 미구현 placeholder가 실제 API 호출로 대체된다.
3. 페이지/모달/오버레이 계층에서 기능 진입과 오류 처리가 일관된다.
4. 사용자에게 깨진 인코딩 메시지가 노출되지 않는다.
5. Capability 점진 활성화로 기능별 배포가 가능하다.

### 가정 및 기본값
1. `frontend/API 정의서.tsv`는 최신성 낮아 참고만 하고, 실제 계약은 백엔드 구현 코드로 확정한다.
2. 기존 raw 응답 예외 endpoint는 당장 유지하고, 프론트 어댑터에서 흡수한다.
3. 백엔드 구현 완료 순서에 따라 프론트 capability를 순차 on 한다.
