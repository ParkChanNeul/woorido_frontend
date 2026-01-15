# 정기 모임 도메인 유스케이스

> 관련 테이블: `meetings`, `meeting_votes`, `meeting_vote_records`, `expense_votes`, `expense_vote_records`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)
> 기준 문서: [DB_Schema_1.0.0.md](../../../02_ENGINEERING/DB_Schema_1.0.0.md)

---

## UC-MEETING-01: 정기 모임 개최 투표 발의

**액터**: 리더
**전제조건**: challenges.status = 'ACTIVE'
**관련 테이블**: `meeting_votes`, `meeting_vote_records`

**성공 시나리오**:
1. 리더가 "정기 모임 만들기" 클릭
2. 모임 정보 입력
   - 제목 (meeting_title)
   - 날짜/시간 (meeting_date)
   - 장소 (meeting_location)
   - ❌ 예상 비용 없음 (건별 지출 투표로 처리)
3. "투표 시작" 클릭
4. votes 레코드 생성
   - type: 'MEETING_ATTENDANCE'
   - required_approval_count: 과반수
   - expires_at: 모임 날짜 1일 전
5. 전체 팔로워에게 알림

**사후조건**:
- `votes` 레코드 생성 (type: MEETING_ATTENDANCE)
- 알림 발송

---

## UC-MEETING-02: 정기 모임 참석 투표

**액터**: 팔로워
**전제조건**: votes.status = 'PENDING'
**관련 테이블**: `vote_records`, `meetings`, `meeting_attendees`

**성공 시나리오**:
1. 팔로워가 투표 알림 클릭
2. 투표 상세 확인
   - 모임 제목, 날짜, 장소
3. "참석" 또는 "불참" 선택
4. vote_records 레코드 생성
   - choice: 'ATTEND' 또는 'ABSENT'
5. 과반수 참석 달성 시
   - votes.status → 'APPROVED'
   - meetings 레코드 생성 (status: 'CONFIRMED')
   - 참석 투표한 멤버들 → meeting_attendees 레코드 생성
6. 과반수 미달 시
   - votes.status → 'REJECTED'
   - 모임 취소 알림

**핵심 규칙**: 과반수 이상 참석해야만 모임 개최 (계주 먹튀 방지)

**사후조건**:
- `vote_records` 레코드 생성
- (승인 시) `meetings`, `meeting_attendees` 레코드 생성

---

## UC-MEETING-03: 정기 모임 참석 신청

**액터**: 팔로워
**전제조건**: meetings.status = 'CONFIRMED', challenge_members.privilege_status = 'ACTIVE'
**관련 테이블**: `meeting_vote_records`
**관련 테이블**: `meeting_attendees`

**성공 시나리오**:
1. 팔로워가 모임 상세 → "참석하기" 클릭
2. 시스템이 권한 확인
   - 챌린지 멤버 여부
   - privilege_status = 'ACTIVE' (권한 박탈 상태 아님)
3. meeting_attendees 레코드 생성
   - status: 'REGISTERED'
4. 모임 당일 알림 예약

**사후조건**:
- `meeting_attendees` 레코드 생성

**대안 시나리오**:
- 2a. privilege_status = 'REVOKED' → "보증금 충전이 필요합니다" 에러

---

## UC-MEETING-04: 지출 투표 발의 (모임 관련)

**액터**: 리더
**전제조건**: meetings.status = 'CONFIRMED'
**관련 테이블**: `votes`, `ledger_entries`

**성공 시나리오**:
1. 리더가 "지출 요청하기" 클릭
2. 지출 정보 입력
   - 제목 (title)
   - 금액 (amount)
   - 영수증 첨부 (receipt_url)
   - 관련 모임 선택 (meeting_id) ⭐
3. votes 레코드 생성
   - type: 'EXPENSE'
   - meeting_id: 연결된 모임 ID ⭐
   - required_approval_count: **모임 참석자 과반수**
4. **해당 모임 참석자에게만 알림**

**핵심 규칙**: 모임 관련 지출은 해당 모임 참석자만 투표 가능 (P-042)

**사후조건**:
- `votes` 레코드 생성 (meeting_id 연결)

---

## UC-MEETING-05: 지출 투표 참여

**액터**: 팔로워 (모임 참석자)
**전제조건**:
- votes.status = 'PENDING'
- votes.meeting_id가 있으면 meeting_attendees에 존재해야 함
**관련 테이블**: `expense_vote_records`, `expense_votes`, `ledger_entries`, `challenges`

**성공 시나리오**:
1. 팔로워가 투표 알림 클릭
2. 시스템이 투표 자격 확인
   - (모임 관련 지출) meeting_attendees에 존재 확인
3. 지출 상세 확인 (금액, 영수증)
4. "찬성" 또는 "반대" 선택
5. vote_records 레코드 생성
   - choice: 'APPROVE' 또는 'REJECT'
6. 과반수 달성 시 (@Transactional)
   - votes.status → 'APPROVED'
   - ledger_entries 레코드 생성 (type: 'EXPENSE')
   - votes.ledger_entry_id 연결
   - votes.ledger_status → 'RECORDED'
   - challenges.balance 차감 (Pessimistic Lock)

**사후조건**:
- `expense_votes.status = 'APPROVED'`
- `ledger_entries` 레코드 생성
- `challenges.balance` 감소

**대안 시나리오**:
- 2a. 모임 참석자 아님 → "모임 참석자만 투표할 수 있습니다" 에러
- 6a. 반대 다수 → votes.status = 'REJECTED'

---

## UC-MEETING-06: 모임 참석 완료 처리

**액터**: 리더
**트리거**: 모임 완료 후
**관련 테이블**: `meeting_attendees`, `user_scores`

**성공 시나리오**:
1. 리더가 모임 완료 후 참석 확인
2. 각 참석자의 상태 변경
   - meeting_attendees.status: 'REGISTERED' → 'ATTENDED'
   - meeting_attendees.attended_at 기록
3. 미참석자 처리
   - meeting_attendees.status → 'NO_SHOW'
4. 점수 반영 (다음 월 1일 배치)
   - meeting_attendees.status == 'ATTENDED': user_scores.total_attendance_count 증가
   - meeting_attendees.status == 'NO_SHOW': **패널티 -0.09점 차감** (P-054)

**사후조건**:
- `meeting_attendees.status` 갱신
- (ATTENDED만) 점수 반영 대상

---

## UC-MEETING-07: 멤버 퇴출 투표 (KICK)

**액터**: 리더 또는 팔로워 (발의자)
**전제조건**: challenges.status = 'ACTIVE'
**관련 테이블**: `general_votes`, `general_vote_records`, `challenge_members`

**성공 시나리오**:
1. 발의자가 "멤버 퇴출 투표" 클릭
2. 퇴출 대상 멤버 선택 (본인/리더 제외)
3. 퇴출 사유 입력 (최소 20자)
4. votes 레코드 생성
   - type: 'KICK'
   - target_user_id: 퇴출 대상
   - required_approval_count: 70% 이상
   - expires_at: 7일 후
5. 전체 멤버에게 알림 (대상 포함)
6. 투표 진행 (대상 멤버는 투표 불가)
7. 70% 이상 찬성 시 (@Transactional)
   - votes.status → 'APPROVED'
   - 대상 멤버 탈퇴 처리
     - challenge_members.left_at 기록
     - challenge_members.leave_reason = 'KICKED'
   - 보증금 반환 처리
   - challenges.current_members 감소
   - user_scores.total_kick_count 증가

**사후조건**:
- `general_votes.status = 'APPROVED'`
- `challenge_members.leave_reason = 'KICKED'`
- `user_scores.total_kick_count` 증가 (-4.0 당도)

**대안 시나리오**:
- 7a. 70% 미만 → votes.status = 'REJECTED'
- 2a. 리더 선택 → "리더는 퇴출 대상이 될 수 없습니다" 에러

---

## UC-MEETING-08: 리더 강퇴 투표 (LEADER_KICK)

**액터**: 팔로워
**전제조건**: challenges.leader_last_active_at 기준 30일 이상 미활동
**관련 테이블**: `general_votes`, `general_vote_records`, `challenges`, `challenge_members`, `user_scores`

**성공 시나리오**:
1. 시스템이 리더 30일 미활동 감지
2. 팔로워 화면에 "리더 강퇴 요청" 버튼 활성화
3. 팔로워가 버튼 클릭
4. 강퇴 사유 입력 (최소 20자)
5. votes 레코드 생성
   - type: 'LEADER_KICK'
   - target_user_id: 현재 리더
   - required_approval_count: 70% 이상
   - expires_at: 7일 후
6. 전체 팔로워에게 알림 (리더 포함)
7. 투표 진행 (팔로워만 투표 가능)
8. 70% 이상 찬성 시 (@Transactional)
   - general_votes.status → 'APPROVED'
   - 리더 승계 처리
     - user_scores.total_score (당도) 최고자에게 양도
   - 기존 리더 → FOLLOWER로 전환
     - challenge_members.role = 'FOLLOWER'
   - 새 리더 설정
     - challenges.creator_id 변경
     - challenge_members.role = 'LEADER'

**사후조건**:
- `challenges.creator_id` 변경 (새 리더)
- `challenge_members.role` 변경
- 리더 승계 완료

**대안 시나리오**:
- 3a. 리더 30일 미만 활동 → 버튼 미표시
- 8a. 70% 미만 → votes.status = 'REJECTED'

---

## UC-MEETING-09: 챌린지 종료 투표 (DISSOLVE)

**액터**: 리더
**전제조건**: challenges.status = 'ACTIVE'
**관련 테이블**: `general_votes`, `general_vote_records`, `challenges`, `challenge_members`, `accounts`, `account_transactions`

**성공 시나리오**:
1. 리더가 "챌린지 종료 투표" 클릭
2. 종료 사유 입력 (최소 20자)
3. votes 레코드 생성
   - type: 'DISSOLVE'
   - required_approval_count: **전원 (100%)**
   - expires_at: 7일 후
4. 전체 멤버에게 알림
5. 투표 진행
6. **전원 동의** 시 (@Transactional)
   - general_votes.status → 'APPROVED'
   - challenges.status → 'CLOSED'
   - challenges.deleted_at 기록
   - challenges.dissolution_reason 기록
   - 잔액 분배 처리
     - 1인당 분배액 = challenges.balance / current_members
     - 각 멤버 accounts.balance 증가
     - account_transactions (type: 'REFUND')
   - 전체 보증금 해제
     - accounts.locked_balance 감소
     - accounts.balance 증가

**사후조건**:
- `challenges.status = 'CLOSED'`
- `challenges.balance = 0` (전액 분배)
- 모든 멤버 보증금 해제

**대안 시나리오**:
- 6a. 1명이라도 반대 → votes.status = 'REJECTED'
  - "전원 동의가 필요합니다. 1명이 반대했습니다."
- 1a. 팔로워가 발의 시도 → "리더만 종료 투표를 발의할 수 있습니다" 에러

**특수 케이스** (P-035):
```
[전원 자동 탈퇴로 종료]
- 모든 멤버가 자동 탈퇴 (보증금 미충전 60일) 시
- challenges.status → 'CLOSED'
- 잔액: 우리두 귀속 (분배 없음)
```

---

## UC-MEETING-10: 바코드 결제 흐름 (EXPENSE 투표 승인 후)

**액터**: 리더
**전제조건**: votes.type = 'EXPENSE' 투표 승인 완료 (status = 'APPROVED')
**관련 테이블**: `payment_barcodes`, `votes`, `ledger_entries`, `challenges`, `account_transactions`

**성공 시나리오**:
1. 리더가 승인된 지출 항목 클릭
2. "바코드 발급" 버튼 클릭
3. 시스템이 payment_barcodes 생성 (@Transactional)
   - barcode_number: UUID 기반 고유 번호
   - amount: 투표 승인 금액 (votes.amount)
   - status: 'ACTIVE'
   - expires_at: NOW + 10분 (P-053)
   - expense_request_id: 연결
   - challenge_id: 챌린지 ID
4. 바코드 화면 표시
   - QR 코드 / 바코드 이미지
   - 금액, 만료 시간 표시
   - "10분 내 결제 완료해주세요" 안내
5. 가맹점에서 바코드 스캔
6. PG 결제 처리 (토스페이)
7. 시스템이 PG Webhook 수신 (@Transactional)
   - payment_barcodes.status → 'USED'
   - payment_barcodes.used_at 기록
   - payment_barcodes.used_merchant_name 자동 파싱 (P-029)
   - payment_barcodes.used_merchant_category 자동 파싱
   - ledger_entries 자동 생성
     - type: 'EXPENSE'
     - amount: payment_barcodes.amount
     - merchant_name: PG에서 파싱
     - merchant_category: 업종 자동 분류
   - challenges.balance 차감 (Optimistic Lock)
8. 리더에게 결제 완료 알림

**사후조건**:
- `payment_barcodes.status = 'USED'`
- `ledger_entries` 거래 기록 생성
- `challenges.balance` 감소
- PG 결제 내역 연동 완료

**대안 시나리오**:
- 5a. 10분 경과 → status = 'EXPIRED'
  - 배치가 만료된 바코드 자동 처리
  - "바코드가 만료되었습니다. 재발급해주세요" 메시지
- 5b. 재발급 요청
  - 기존 바코드 status = 'CANCELLED'
  - 새 바코드 생성 (Step 3 반복)
- 7a. PG 결제 실패
  - payment_barcodes.status = 'ACTIVE' 유지
  - payment_logs 실패 기록
  - 재시도 가능

**바코드 상태 전환**:
```
[ACTIVE] 발급 후 10분
   ↓
   ├→ [USED] 결제 완료
   ├→ [EXPIRED] 10분 경과
   └→ [CANCELLED] 재발급 시 취소
```

**관련 정책**:
- P-053: 바코드 유효 기간 정책 (10분)
- P-029: 장부 정책 (사용처 자동 기록)
- P-037: 지출 투표 정책 (전제 조건)

---

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [03_SCHEMA_MEETING.md](../../../02_ENGINEERING/Database/03_SCHEMA_MEETING.md) - ERD

**최종 수정**: 2026-01-13 (UC-MEETING-10 바코드 흐름 추가)
