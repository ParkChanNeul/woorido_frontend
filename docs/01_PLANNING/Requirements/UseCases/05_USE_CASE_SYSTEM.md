# 시스템 도메인 유스케이스

> 관련 테이블: `sessions`, `notifications`, `reports`, `webhook_logs`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)
> 기준 문서: [DB_Schema_1.0.0.md](../../../02_ENGINEERING/DB_Schema_1.0.0.md)

---

## UC-SYSTEM-01: 서포트 자동 납입 (월 1일)

**액터**: 시스템 (배치)
**트리거**: 매월 1일 00:00
**관련 테이블**: `accounts`, `account_transactions`, `challenges`, `challenge_members`, `ledger_entries`

**성공 시나리오**:
1. 배치가 ACTIVE 상태 챌린지 조회
2. 각 챌린지별 멤버 순회
3. 멤버별 서포트 납입 시도
   - accounts.balance 확인
   - balance >= monthly_fee → 정상 납입
   - balance < monthly_fee → 보증금 충당
4. 정상 납입 처리
   - accounts.balance 차감
   - account_transactions (type: 'SUPPORT')
   - challenges.balance 증가
   - ledger_entries (type: 'SUPPORT')
   - challenge_members.last_support_paid_at 갱신
5. user_scores 갱신 (납입 개월 +1)

**사후조건**:
- `challenges.balance` 증가
- `challenge_members.last_support_paid_at` 갱신
- `user_scores.total_payment_months` 증가

---

## UC-SYSTEM-02: 보증금 충당 및 권한 박탈

**액터**: 시스템 (배치)
**트리거**: UC-SYSTEM-01에서 잔액 부족 감지
**관련 테이블**: `accounts`, `challenge_members`

**성공 시나리오**:
1. 잔액 부족 감지 (balance < monthly_fee)
2. 보증금 충당 (안심결제)
   - accounts.locked_balance에서 차감
   - 서포트 납입 완료
3. 권한 박탈 처리
   - challenge_members.privilege_status → 'REVOKED'
   - challenge_members.privilege_revoked_at 기록
4. 알림 발송 (notifications)
   - type: 'SUPPORT_OVERDUE'
   - "보증금 충전이 필요합니다"

**사후조건**:
- `accounts.locked_balance` 감소
- `challenge_members.privilege_status = 'REVOKED'`

**권한 박탈 상태 제한**:
- ❌ 정기 모임 참석 투표 불가
- ❌ 정기 모임 관련 지출 투표 불가
- ✅ 피드/댓글 가능
- ✅ 일반 투표 참여 가능

---

## UC-SYSTEM-03: 자동 탈퇴 처리

**액터**: 시스템 (배치)
**트리거**: privilege_revoked_at 기준 60일 경과
**관련 테이블**: `challenge_members`, `challenges`

**성공 시나리오**:
1. 배치가 60일 경과 멤버 조회
   - privilege_status = 'REVOKED'
   - privilege_revoked_at + 60일 < NOW
2. 자동 탈퇴 처리
   - challenge_members.left_at 기록
   - challenge_members.leave_reason = 'AUTO_LEAVE'
   - challenges.current_members 감소
   - **보증금 몰수 처리** (P-052):
     - locked_balance 해제 없이 차감 (우리두 수익 귀속)
     - ledger_entries (type: 'CONFISCATION')
3. 리더에게만 알림

**사후조건**:
- `challenge_members.left_at` 기록
- `challenges.current_members` 감소

---

## UC-SYSTEM-04: 신고 접수

**액터**: 리더 또는 팔로워
**관련 테이블**: `reports`, `users`

**성공 시나리오**:
1. 멤버가 "신고하기" 클릭
2. 신고 정보 입력
   - reported_entity_type: USER, POST, COMMENT, CHALLENGE
   - reason_category: SPAM, ABUSE, FRAUD, INAPPROPRIATE, OTHER
   - reason_detail: 상세 사유
3. reports 레코드 생성 (status: 'PENDING')
4. 중복 신고 검증 (uk_reporter_entity)

**사후조건**:
- `reports` 레코드 생성
- 관리자 검토 대기 상태

---

## UC-SYSTEM-05: 신고 누적 자동 정지

**액터**: 시스템 (배치)
**트리거**: reports.status = 'CONFIRMED' 20회 누적
**관련 테이블**: `reports`, `users`

**성공 시나리오**:
1. 배치가 신고 20회 이상 유저 조회
2. 자동 일시정지 처리
   - users.account_status → 'SUSPENDED'
   - users.suspended_at 기록
   - users.suspended_until = NOW + 7일
3. 알림 발송

**사후조건**:
- `users.account_status = 'SUSPENDED'`

---

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [05_SCHEMA_SYSTEM.md](../../../02_ENGINEERING/Database/05_SCHEMA_SYSTEM.md) - ERD
