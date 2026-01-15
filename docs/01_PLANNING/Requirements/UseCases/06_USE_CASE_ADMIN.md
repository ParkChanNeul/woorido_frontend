# 관리자 도메인 유스케이스

> 관련 테이블: `admins`, `fee_policies`, `admin_logs`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)

---

## UC-ADMIN-01: 신고 처리

**액터**: 관리자 (ADMIN, SUPPORT)
**전제조건**: reports.status = 'PENDING'
**관련 테이블**: `reports`, `users`, `admin_logs`

**성공 시나리오**:
1. 관리자가 신고 목록 조회
2. 신고 상세 확인
3. 처리 결정
   - CONFIRMED: 위반 확인 → 피신고자 경고
   - REJECTED: 신고 기각
   - FALSE_REPORT: 허위 신고 → 신고자 경고
4. reports 상태 변경
   - status: 처리 결과
   - reviewed_at: 현재 시간
   - reviewed_by: 관리자 ID
   - admin_note: 처리 메모
5. admin_logs 기록
   - action: 'RESOLVE_REPORT'

**사후조건**:
- `reports.status` 변경
- `admin_logs` 기록 생성

---

## UC-ADMIN-02: 수수료 정책 관리

**액터**: 관리자 (SUPER_ADMIN)
**관련 테이블**: `fee_policies`, `admin_logs`

**성공 시나리오**:
1. 관리자가 "수수료 정책 관리" 접근
2. 현재 정책 목록 확인
   - min_amount, max_amount, rate
3. 정책 수정/추가
4. fee_policies 레코드 생성/수정
5. admin_logs 기록
   - action: 'CREATE_FEE_POLICY' 또는 'UPDATE_FEE_POLICY'

**사후조건**:
- `fee_policies` 레코드 변경
- `admin_logs` 기록 생성

---

## UC-ADMIN-03: 유저 정지/해제

**액터**: 관리자 (ADMIN)
**관련 테이블**: `users`, `admin_logs`

**성공 시나리오**:
1. 관리자가 유저 상세 조회
2. 정지 처리
   - users.account_status → 'SUSPENDED' 또는 'BANNED'
   - users.suspension_reason 기록
3. 또는 해제 처리
   - users.account_status → 'ACTIVE'
4. admin_logs 기록
   - action: 'SUSPEND_USER' 또는 'UNSUSPEND_USER'

**사후조건**:
- `users.account_status` 변경
- `admin_logs` 기록 생성

---

## UC-ADMIN-04: 챌린지 정산 실행 (강제/수동)

**액터**: 관리자 (ADMIN)
**관련 테이블**: `challenges`, `settlements`, `admin_logs`
**참조 API**: `POST /challenges/{challengeId}/settlement/process` (079)

**성공 시나리오**:
1. 관리자가 "정산 대기" 챌린지 조회
2. 정산 미리보기 확인 (예상 정산액)
3. "정산 실행" 클릭
4. 시스템이 정산 프로세스 수행 (@Transactional)
   - 지출 차감 (순 적립금 산정)
   - 멤버별 배분 계산
   - 패널티 차감 (미납/결석)
   - 수수료 차감 (P-021)
   - 최종 입금 처리
5. admin_logs 기록
   - action: 'PROCESS_SETTLEMENT'

**사후조건**:
- `settlements` 레코드 생성
- `accounts` 잔액 입금 완료
- `challenges.status` = 'CLOSED' (정산 후 종료)

---

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [06_SCHEMA_ADMIN.md](../../../02_ENGINEERING/Database/06_SCHEMA_ADMIN.md) - ERD
