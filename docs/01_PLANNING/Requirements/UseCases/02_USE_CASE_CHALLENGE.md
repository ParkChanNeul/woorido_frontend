# 챌린지 도메인 유스케이스

> 관련 테이블: `challenges`, `challenge_members`, `ledger_entries`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)
> 기준 문서: [DB_Schema_1.0.0.md](../../../02_ENGINEERING/DB_Schema_1.0.0.md)

---

## UC-CHALLENGE-01: 챌린지 생성

**액터**: 로그인 유저 (리더가 되려는 자)
**전제조건**: accounts 잔액 충분 (보증금)
**관련 테이블**: `challenges`, `challenge_members`

**성공 시나리오**:
1. 유저가 "챌린지 만들기" 클릭
2. 챌린지 정보 입력
   - name: 챌린지명
   - description: 설명
   - category: 카테고리 (HOBBY, STUDY, EXERCISE, SAVINGS, TRAVEL, FOOD, CULTURE, OTHER)
   - min_members: 최소 인원 (최소 3명)
   - monthly_fee: 월 서포트 (최소 10,000원)
   - deposit_amount: 보증금 (= monthly_fee)
   - max_members: 최대 인원 (최소 3명)
   - is_public: 공개 여부
   - rules: 챌린지 규칙
   - thumbnail_image: 썸네일 이미지 URL
3. 시스템이 유효성 검증
4. challenges 레코드 생성
   - status: 'RECRUITING' (모집 중)
   - current_members: 1 (리더 포함)
   - balance: 0
   - version: 0
5. challenge_members 레코드 생성
   - role: 'LEADER'
   - deposit_status: 'NONE' (RECRUITING 상태에서는 보증금 없음)
   - privilege_status: 'ACTIVE'
6. 챌린지 홈으로 이동

**사후조건**:
- `challenges` 레코드 생성 (status: RECRUITING)
- `challenge_members` 레코드 생성 (role: LEADER)
- 리더의 보증금 락 없음 (RECRUITING 상태)

**상태 전환 조건** (P-047):
- 3번째 멤버 가입 시 → 자동 ACTIVE 전환
- activated_at 기록, 전체 멤버 보증금 락 처리

---

## UC-CHALLENGE-02: 챌린지 가입 (RECRUITING 상태)

**액터**: 로그인 유저
**전제조건**: challenges.status = 'RECRUITING'
**관련 테이블**: `challenges`, `challenge_members`

**성공 시나리오**:
1. 유저가 챌린지 상세 → "참여하기" 클릭
2. 시스템이 상태 확인 → RECRUITING
3. 가입 확인 모달 표시
   - 보증금: 없음 (RECRUITING 상태)
   - 입회비: 없음
4. "확인" 클릭
5. 트랜잭션 처리
   - challenges.current_members 증가 (Optimistic Lock + version)
   - challenge_members 레코드 생성 (role: 'FOLLOWER')
6. **3명 달성 시** (min_members 충족)
   - challenges.status → 'ACTIVE'
   - challenges.activated_at 기록
   - 전체 멤버 보증금 락 처리

**사후조건**:
- `challenges.current_members` 증가
- `challenge_members` 레코드 생성
- (3명 달성 시) `challenges.status = 'ACTIVE'`

---

## UC-CHALLENGE-03: 챌린지 가입 (ACTIVE 상태 - 입회비 존재)

**액터**: 로그인 유저
**전제조건**: challenges.status = 'ACTIVE', challenges.balance > 0
**관련 테이블**: `challenges`, `challenge_members`, `accounts`, `account_transactions`, `ledger_entries`

**입회비 계산 공식**:
```
입회비 = 챌린지 금고 잔액 / (현재 멤버 수 - 1)
       = challenges.balance / (challenges.current_members - 1)
```

**성공 시나리오**:
1. 유저가 "참여하기" 클릭
2. 시스템이 입회비 계산
   - 예: balance=3,000,000 / (8-1) = 428,571원
3. 가입 확인 모달 표시
   - 보증금 락: 100,000원
   - 입회비: 428,571원
   - 총 필요 금액: 528,571원
4. 시스템이 accounts.balance 확인
5. "확인" 클릭
6. 트랜잭션 처리 (@Transactional)
   - 보증금 락 처리
     - accounts.balance 차감
     - accounts.locked_balance 증가
     - account_transactions (type: 'LOCK')
   - 입회비 처리
     - accounts.balance 차감
     - account_transactions (type: 'ENTRY_FEE')
     - challenges.balance 증가
     - ledger_entries 기록 (type: 'ENTRY_FEE')
   - challenges.current_members 증가 (Optimistic Lock)
   - challenge_members 레코드 생성 (entry_fee_amount 기록)

**사후조건**:
- 개인 `accounts.balance` 감소
- 개인 `accounts.locked_balance` 증가 (보증금)
- 챌린지 `challenges.balance` 증가 (입회비)
- `challenge_members.entry_fee_amount` 기록
- `ledger_entries` 입회비 기록

**대안 시나리오**:
- 4a. 잔액 부족 → 충전 플로우 안내
- 6a. 최대 인원 초과 (Race Condition) → "인원이 마감되었습니다"

---

## UC-CHALLENGE-04: 챌린지 탈퇴

**액터**: 팔로워
**전제조건**: challenge_members.left_at IS NULL
**관련 테이블**: `challenges`, `challenge_members`, `accounts`, `account_transactions`

**성공 시나리오**:
1. 팔로워가 "챌린지 나가기" 클릭
2. 탈퇴 확인 모달 표시
   - 보증금 반환 여부 표시
   - 입회비 미반환 안내
3. "탈퇴" 확인
4. 트랜잭션 처리
   - 보증금 락 해제
     - accounts.locked_balance 감소
     - accounts.balance 증가
     - account_transactions (type: 'UNLOCK')
   - challenge_members.left_at 기록
   - challenge_members.leave_reason = 'NORMAL'
   - challenges.current_members 감소

**사후조건**:
- `challenge_members.left_at` 기록
- `challenge_members.leave_reason` = 'NORMAL'
- `accounts.locked_balance` 감소
- `accounts.balance` 증가 (보증금 복귀)

**탈퇴 사유 (leave_reason)**:
| 값 | 설명 |
|----|------|
| NORMAL | 정상 탈퇴 |
| KICKED | 강퇴 투표로 퇴출 |
| AUTO_LEAVE | 보증금 미충전 60일 경과 자동 탈퇴 |
| CHALLENGE_CLOSED | 챌린지 종료로 인한 탈퇴 |

---

## UC-CHALLENGE-05: 장부 조회 (Django 분석 연동)

**액터**: 리더 또는 팔로워
**전제조건**: 챌린지 멤버
**관련 테이블**: `ledger_entries`

**성공 시나리오**:
1. 멤버가 "거래 내역" 탭 클릭
2. Spring Boot가 ledger_entries 조회
3. **자동 Django 분석 트리거** (<<include>> 관계)
   - Spring Boot → Django REST API 호출
   - Django pandas로 데이터 분석
   - 분석 결과 캐싱 (TTL: 5분)
4. 분석 결과 + 차트 표시
   - 월별 지출 통계
   - 카테고리별 비율
   - 전월 대비 트렌드
5. 장부 타임라인 렌더링
   - type: SUPPORT, ENTRY_FEE, EXPENSE, REFUND
   - merchant_name (PG 자동 파싱)
   - memo (리더 수정 가능)

**사후조건**:
- Django 분석 결과 캐시 저장

---

## UC-CHALLENGE-06: 챌린지 완주 인증 (자동)

**액터**: 시스템 (배치)
**트리거**: activated_at 기준 365일 경과
**관련 테이블**: `challenges`

**성공 시나리오**:
1. 시스템이 매일 자정 배치 실행
2. activated_at 기준 1년 경과 챌린지 조회
3. 조건 확인
   - status: ACTIVE 또는 PAUSED
   - deleted_at IS NULL
4. 인증 마크 부여
   - challenges.is_verified = 'Y'
   - challenges.verified_at 기록
5. 전체 멤버에게 알림

**사후조건**:
- `challenges.is_verified = 'Y'`
- `challenges.verified_at` 기록

---

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [02_SCHEMA_CHALLENGE.md](../../../02_ENGINEERING/Database/02_SCHEMA_CHALLENGE.md) - ERD

**최종 수정**: 2026-01-13
