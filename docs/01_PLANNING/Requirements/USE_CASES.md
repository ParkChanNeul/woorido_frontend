# WOORIDO 유스케이스 명세서 (Use Cases)

**작성일**: 2026-01-09
**버전**: v3.1 - 도메인별 분배 완료
**목적**: 데이터베이스 스키마 기반 사용자 시나리오 정의

> [!IMPORTANT]
> **도메인별 문서 분배 완료 (2026-01-09)**
> 
> 이 문서는 도메인별로 분배되었습니다. 최신 내용은 아래 문서들을 참조하세요:
> - [00_USE_CASES_OVERVIEW.md](./UseCases/00_USE_CASES_OVERVIEW.md) - 개요, 액터 정의, 매트릭스
> - [01_USE_CASE_USER.md](./UseCases/01_USE_CASE_USER.md) - 사용자 도메인
> - [02_USE_CASE_CHALLENGE.md](./UseCases/02_USE_CASE_CHALLENGE.md) - 챌린지 도메인
> - [03_USE_CASE_MEETING.md](./UseCases/03_USE_CASE_MEETING.md) - 정기 모임 도메인
> - [04_USE_CASE_SNS.md](./UseCases/04_USE_CASE_SNS.md) - SNS 도메인
> - [05_USE_CASE_SYSTEM.md](./UseCases/05_USE_CASE_SYSTEM.md) - 시스템 도메인
> - [06_USE_CASE_ADMIN.md](./UseCases/06_USE_CASE_ADMIN.md) - 관리자 도메인

> 📖 정책 기준: [POLICY_DEFINITION.md](../Product/POLICY_DEFINITION.md)
> 📋 프로덕트 아젠다: [PRODUCT_AGENDA.md](../Product/PRODUCT_AGENDA.md)
> 🗄️ ERD 문서: [00_ERD_OVERVIEW.md](../../02_ENGINEERING/Database/00_ERD_OVERVIEW.md)

---

## 📋 목차

1. [액터 정의](#1-액터-정의)
2. [사용자 도메인 유스케이스](#2-사용자-도메인-유스케이스)
3. [챌린지 도메인 유스케이스](#3-챌린지-도메인-유스케이스)
4. [정기 모임 도메인 유스케이스](#4-정기-모임-도메인-유스케이스)
5. [SNS 도메인 유스케이스](#5-sns-도메인-유스케이스)
6. [시스템 도메인 유스케이스](#6-시스템-도메인-유스케이스)
7. [관리자 도메인 유스케이스](#7-관리자-도메인-유스케이스)
8. [유스케이스 매트릭스](#8-유스케이스-매트릭스)

---

## 1. 액터 정의

### 1.1 주요 액터 (Actors)

| 액터 | 영문 | 설명 | DB 테이블 |
|------|------|------|----------|
| **리더** | Leader | 챌린지 생성자 및 운영자 | users, challenges (role='LEADER') |
| **팔로워** | Follower | 챌린지 참여자 | users, challenges (role='FOLLOWER') |
| **미가입 유저** | Guest User | 로그인만 한 상태 | users |
| **관리자** | Admin | 플랫폼 운영자 | admins |
| **시스템** | System | 자동화 배치/스케줄러 | - |

### 1.2 액터 권한 매트릭스

| 기능 | 리더 | 팔로워 | 미가입 유저 | 관리자 |
|------|:----:|:------:|:----------:|:------:|
| 챌린지 생성 | ✅ | ✅ | ❌ | ✅ |
| 챌린지 정보 수정 | ✅ | ❌ | ❌ | ✅ |
| 정기 모임 투표 발의 | ✅ | ❌ | ❌ | ❌ |
| 지출 투표 발의 | ✅ | ❌ | ❌ | ❌ |
| 멤버 퇴출 투표 발의 | ✅ | ✅ | ❌ | ❌ |
| 투표 참여 | ✅ | ✅ | ❌ | ❌ |
| 피드 작성 | ✅ | ✅ | ❌ | ❌ |
| 댓글/좋아요 | ✅ | ✅ | ❌ | ❌ |
| 장부 조회 | ✅ | ✅ | ❌ | ✅ |
| 신고 처리 | ❌ | ❌ | ❌ | ✅ |

---

## 2. 사용자 도메인 유스케이스

> 관련 테이블: `users`, `accounts`, `account_transactions`, `user_scores`

### UC-USER-01: 회원가입

**액터**: 비회원
**전제조건**: 미가입 상태
**관련 테이블**: `users`, `accounts`

**성공 시나리오**:
1. 비회원이 "회원가입" 클릭
2. 회원 정보 입력
   - 이메일 (email)
   - 비밀번호 (password)
   - 이름 (name)
   - 닉네임 (nickname)
   - 휴대폰 번호 (phone)
   - 생년월일 (birthDate)
   - 약관 동의 (agreedTerms, agreedPrivacy)
3. 시스템이 유효성 검증
   - 이메일 중복 확인 (UNIQUE)
   - 비밀번호 규칙 검증
4. 이메일 인증 토큰 발송 (verification_token)
5. 이메일 인증 완료 → is_verified = 'Y'
6. 자동으로 계좌 생성 (accounts 테이블)
   - balance: 0
   - locked_balance: 0
7. user_scores 레코드 생성 (초기 당도: 12)

**사후조건**:
- `users` 레코드 생성
- `accounts` 레코드 생성 (1:1 관계)
- `user_scores` 레코드 생성

**대안 시나리오**:
- 3a. 이메일 중복 → "이미 가입된 이메일입니다" 에러
- 4a. 소셜 로그인 선택 → social_provider, social_id 저장

---

### UC-USER-02: 소셜 로그인

**액터**: 비회원 또는 기존 회원
**관련 테이블**: `users`

**성공 시나리오**:
1. 사용자가 소셜 로그인 버튼 클릭 (GOOGLE, KAKAO, NAVER)
2. 소셜 제공자 인증 완료
3. 시스템이 social_provider + social_id로 기존 계정 조회
   - 기존 계정 있음 → 로그인 처리
   - 신규 → 자동 회원가입 (is_verified = 'Y')
4. last_login_at 갱신
5. JWT 토큰 발급

**사후조건**:
- `users.social_provider`, `users.social_id` 저장
- `users.last_login_at` 갱신

---

### UC-USER-03: 크레딧 충전

**액터**: 로그인 유저
**전제조건**: accounts 레코드 존재
**관련 테이블**: `accounts`, `account_transactions`, `sessions`

**성공 시나리오**:
1. 유저가 "충전하기" 클릭
2. 충전 금액 입력 (최소 10,000원)
3. 수수료 계산 (fee_policies 테이블 참조)
   - 10,000원 미만: 1%
   - 10,000~200,000원: 3%
   - 200,000원 초과: 1.5%
4. 세션 생성 (sessions 테이블)
   - session_type: 'CHARGE'
   - return_url: 현재 페이지
5. PG 결제 게이트웨이 이동 (토스페이)
6. 결제 완료 → 콜백 수신
7. 트랜잭션 처리 (@Transactional)
   - account_transactions 기록 생성
     - type: 'CHARGE'
     - idempotency_key: PG 승인번호
     - balance_before/after 스냅샷
   - accounts.balance 증가
8. 세션 사용 처리 (is_used = 'Y')
9. return_url로 리다이렉트

**사후조건**:
- `accounts.balance` 증가
- `account_transactions` 기록 생성
- `sessions.is_used = 'Y'`

**트랜잭션 보장**:
- Pessimistic Lock (`SELECT FOR UPDATE WAIT 3`)
- Idempotency 검증 (idempotency_key UNIQUE)

---

### UC-USER-04: 크레딧 출금

**액터**: 로그인 유저
**전제조건**: accounts.balance > 0
**관련 테이블**: `accounts`, `account_transactions`

**성공 시나리오**:
1. 유저가 "출금하기" 클릭
2. 출금 계좌 정보 입력/확인
   - bank_code
   - account_number
   - account_holder
3. 출금 금액 입력 (가용 잔액 한도)
   - **수수료**: 무료 (P-009)
4. 시스템이 잔액 확인 (locked_balance 제외)
5. 트랜잭션 처리
   - account_transactions 기록 생성 (type: 'WITHDRAW')
   - accounts.balance 차감
6. 실제 이체 처리 (PG/뱅킹 API)
7. 출금 완료 알림

**사후조건**:
- `accounts.balance` 감소
- `account_transactions` 기록 생성

**대안 시나리오**:
- 4a. 잔액 부족 → "가용 잔액이 부족합니다" 에러
- 6a. 이체 실패 → 트랜잭션 롤백

---

### UC-USER-05: 유저 당도 조회

**액터**: 로그인 유저
**관련 테이블**: `user_scores`

**성공 시나리오**:
1. 유저가 "내 프로필" → "당도 상세" 클릭
2. 시스템이 user_scores 조회
3. 당도 정보 표시
   - total_score (최종 당도)
   - payment_score (납입 당도)
   - activity_score (활동 당도)
   - 등급 (🍯꿀/🍇포도/🍎사과/🍊귤/🍅토마토/🥒쓴맛)
   - 세부 항목별 원본 데이터

**당도 공식** (WRD-105 v3.0):
```
최종 당도 = 12 + (납입 당도 × 0.7) + (활동 당도 × 0.15)
당도 범위: 하한 없음 (마이너스 가능) ~ 상한 80

납입 당도 = (모임 참석 × 0.09) + (납입 개월 × 0.32) + (연체 × -1.5) + (연속 연체 × -1.0)
활동 당도 = (피드 × 0.05) + (댓글 × 0.025) + (좋아요 × 0.006)
          + (리더 개월 × 0.45) + (투표 불참 × -0.1) + (신고 당함 × -0.6) + (강퇴 당함 × -4.0)
```

---

## 3. 챌린지 도메인 유스케이스

> 관련 테이블: `challenges`, `challenge_members`, `ledger_entries`

### UC-CHALLENGE-01: 챌린지 생성

**액터**: 로그인 유저 (리더가 되려는 자)
**전제조건**: accounts 잔액 충분 (보증금)
**관련 테이블**: `challenges`, `challenge_members`

**성공 시나리오**:
1. 유저가 "챌린지 만들기" 클릭
2. 챌린지 정보 입력
   - name: 챌린지명
   - description: 설명
   - category: 카테고리
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
   - deposit_paid: 'N' (RECRUITING 상태에서는 보증금 없음)
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

### UC-CHALLENGE-02: 챌린지 가입 (RECRUITING 상태)

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

### UC-CHALLENGE-03: 챌린지 가입 (ACTIVE 상태 - 입회비 존재)

**액터**: 로그인 유저
**전제조건**: challenges.status = 'ACTIVE', challenges.balance > 0 (기존 팔로워 매몰 비용 존재)
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
     - ledger_entries 기록 (type: 'INCOME')
   - challenges.current_members 증가 (Optimistic Lock)
   - challenge_members 레코드 생성

**사후조건**:
- 개인 `accounts.balance` 감소
- 개인 `accounts.locked_balance` 증가 (보증금)
- 챌린지 `challenges.balance` 증가 (입회비)
- `ledger_entries` 입회비 기록

**대안 시나리오**:
- 4a. 잔액 부족 → 충전 플로우 안내
- 6a. 최대 인원 초과 (Race Condition) → "인원이 마감되었습니다"

---

### UC-CHALLENGE-04: 챌린지 탈퇴

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
- `accounts.locked_balance` 감소
- `accounts.balance` 증가 (보증금 복귀)

---

### UC-CHALLENGE-05: 장부 조회 (Django 분석 연동)

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
   - type: INCOME, EXPENSE, FEE_COLLECTION 등
   - merchant_name (PG 자동 파싱)
   - memo (리더 수정 가능)

**사후조건**:
- Django 분석 결과 캐시 저장

---

### UC-CHALLENGE-06: 챌린지 완주 인증 (자동)

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

## 4. 정기 모임 도메인 유스케이스

> 관련 테이블: `meetings`, `meeting_attendees`, `votes`, `vote_records`

### UC-MEETING-01: 정기 모임 개최 투표 발의

**액터**: 리더
**전제조건**: challenges.status = 'ACTIVE'
**관련 테이블**: `votes`, `vote_records`

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

### UC-MEETING-02: 정기 모임 참석 투표

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

### UC-MEETING-03: 정기 모임 참석 신청

**액터**: 팔로워
**전제조건**: meetings.status = 'CONFIRMED', challenge_members.privilege_status = 'ACTIVE'
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

### UC-MEETING-04: 지출 투표 발의 (모임 관련)

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

### UC-MEETING-05: 지출 투표 참여

**액터**: 팔로워 (모임 참석자)
**전제조건**:
- votes.status = 'PENDING'
- votes.meeting_id가 있으면 meeting_attendees에 존재해야 함
**관련 테이블**: `vote_records`, `votes`, `ledger_entries`, `challenge_members`

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
   - challenge_members.balance 차감 (Pessimistic Lock)

**사후조건**:
- `votes.status = 'APPROVED'`
- `ledger_entries` 레코드 생성
- `challenge_members.balance` 감소

**대안 시나리오**:
- 2a. 모임 참석자 아님 → "모임 참석자만 투표할 수 있습니다" 에러
- 6a. 반대 다수 → votes.status = 'REJECTED'

---

### UC-MEETING-06: 모임 참석 완료 처리

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

## 5. SNS 도메인 유스케이스

> 관련 테이블: `posts`, `post_images`, `post_likes`, `comments`

### UC-SNS-01: 피드 작성

**액터**: 리더 또는 팔로워
**전제조건**: 챌린지 멤버
**관련 테이블**: `posts`, `post_images`

**성공 시나리오**:
1. 멤버가 "피드 작성" 클릭
2. 내용 입력
   - content: 텍스트 (최대 4000자)
   - 이미지: 최대 10장
3. "게시" 클릭
4. 이미지 S3 업로드
5. posts 레코드 생성
   - challenge_id: 챌린지 ID (NULL이면 공개 피드)
   - like_count: 0
   - comment_count: 0
6. post_images 레코드 생성 (이미지별)
   - display_order: 순서
7. 피드 목록 최상단 표시

**사후조건**:
- `posts` 레코드 생성
- `post_images` 레코드 생성 (이미지 있으면)

---

### UC-SNS-02: 좋아요

**액터**: 리더 또는 팔로워
**관련 테이블**: `post_likes`, `posts`

**성공 시나리오**:
1. 멤버가 피드 "좋아요" 클릭
2. 시스템이 기존 좋아요 확인 (uk_post_user_like)
3. 좋아요 토글
   - 없으면: post_likes 생성, posts.like_count +1
   - 있으면: post_likes 삭제, posts.like_count -1 (GREATEST 0)
4. UI 즉시 반영

**사후조건**:
- `post_likes` 생성/삭제
- `posts.like_count` 증감 (Atomic Operations)

**정합성 보장**:
- 매일 새벽 3시 Scheduled Job으로 카운터 정합성 검증

---

### UC-SNS-03: 댓글 작성

**액터**: 리더 또는 팔로워
**관련 테이블**: `comments`, `posts`

**성공 시나리오**:
1. 멤버가 피드 "댓글" 영역 클릭
2. 댓글 입력 (최대 1000자)
3. "작성" 클릭
4. comments 레코드 생성
5. posts.comment_count +1 (Atomic)
6. 피드 작성자에게 알림

**사후조건**:
- `comments` 레코드 생성
- `posts.comment_count` 증가

---

## 6. 시스템 도메인 유스케이스

> 관련 테이블: `sessions`, `notifications`, `reports`

### UC-SYSTEM-01: 서포트 자동 납입 (월 1일)

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
   - challenge_members.balance 증가
   - ledger_entries (type: 'INCOME')
   - challenge_members.last_support_paid_at 갱신
5. user_scores 갱신 (납입 개월 +1)

**사후조건**:
- `challenge_members.balance` 증가
- `challenge_members.last_support_paid_at` 갱신
- `user_scores.total_payment_months` 증가

---

### UC-SYSTEM-02: 보증금 충당 및 권한 박탈

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
   - type: 'DEPOSIT_USED'
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

### UC-SYSTEM-03: 자동 탈퇴 처리

**액터**: 시스템 (배치)
**트리거**: privilege_revoked_at 기준 60일 경과
**관련 테이블**: `challenge_members`, `challenges`

**성공 시나리오**:
1. 배치가 60일 경과 멤버 조회
   - privilege_status = 'REVOKED'
   - privilege_revoked_at + 60일 < NOW
2. 자동 탈퇴 처리
   - challenge_members.left_at 기록
   - challenge_members.leave_reason = 'AUTO_LEAVE_DEPOSIT_NOT_RECHARGED'
   - challenges.current_members 감소
3. 리더에게만 알림
   - "김철수님이 미납으로 탈퇴 처리되었습니다"

**사후조건**:
- `challenge_members.left_at` 기록
- `challenges.current_members` 감소

---

### UC-SYSTEM-04: 신고 접수

**액터**: 리더 또는 팔로워
**관련 테이블**: `reports`, `users`

**성공 시나리오**:
1. 멤버가 "신고하기" 클릭
2. 신고 정보 입력
   - reported_entity_type: USER, POST, COMMENT
   - reason_category: SPAM, ABUSE, FRAUD, INAPPROPRIATE
   - reason_detail: 상세 사유
3. reports 레코드 생성 (status: 'PENDING')
4. 중복 신고 검증 (uk_reporter_entity)

**사후조건**:
- `reports` 레코드 생성
- 관리자 검토 대기 상태

**대안 시나리오**:
- 4a. 이미 신고함 → "이미 신고한 대상입니다" 에러

---

### UC-SYSTEM-05: 신고 누적 자동 정지

**액터**: 시스템 (배치)
**트리거**: reports.status = 'CONFIRMED' 20회 누적
**관련 테이블**: `reports`, `users`

**성공 시나리오**:
1. 배치가 신고 20회 이상 유저 조회
2. 자동 일시정지 처리
   - users.account_status → 'SUSPENDED'
   - users.suspended_at 기록
   - users.suspended_until = NOW + 7일
   - users.suspension_reason = '신고 누적으로 인한 자동 정지'
3. 알림 발송

**사후조건**:
- `users.account_status = 'SUSPENDED'`

---

## 7. 관리자 도메인 유스케이스

> 관련 테이블: `admins`, `fee_policies`, `admin_logs`

### UC-ADMIN-01: 신고 처리

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

### UC-ADMIN-02: 수수료 정책 관리

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

### UC-ADMIN-03: 유저 정지/해제

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

### UC-ADMIN-04: 챌린지 정산 실행 (강제/수동)

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

### UC-MEETING-07: 멤버 퇴출 투표 (KICK)

**액터**: 리더 또는 팔로워 (발의자)
**전제조건**: challenge.status = 'ACTIVE'
**관련 테이블**: `votes`, `vote_records`, `challenge_members`

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
   - challenge.current_members 감소
   - user_scores.total_kick_count 증가

**사후조건**:
- `votes.status = 'APPROVED'`
- `challenge_members.leave_reason = 'KICKED'`
- `user_scores.total_kick_count` 증가 (-4.0 당도)

**대안 시나리오**:
- 7a. 70% 미만 → votes.status = 'REJECTED'
- 2a. 리더 선택 → "리더는 퇴출 대상이 될 수 없습니다" 에러

---

### UC-MEETING-08: 리더 강퇴 투표 (LEADER_KICK)

**액터**: 팔로워
**전제조건**: challenge.leader_last_active_at 기준 30일 이상 미활동
**관련 테이블**: `votes`, `vote_records`, `challenge`, `challenge_members`, `user_scores`

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
   - votes.status → 'APPROVED'
   - 리더 승계 처리
     - 부리더(sub_leader_id) 있으면 → 부리더에게 양도
     - 없으면 → user_scores.total_score (당도) 최고자에게 양도
   - 기존 리더 → FOLLOWER로 전환
     - challenge_members.role = 'FOLLOWER'
   - 새 리더 설정
     - challenge.creator_id 변경
     - challenge_members.role = 'LEADER'

**사후조건**:
- `challenge.creator_id` 변경 (새 리더)
- `challenge_members.role` 변경
- 리더 승계 완료

**대안 시나리오**:
- 3a. 리더 30일 미만 활동 → 버튼 미표시
- 8a. 70% 미만 → votes.status = 'REJECTED'

---

### UC-MEETING-09: 챌린지 종료 투표 (DISSOLVE)

**액터**: 리더
**전제조건**: challenge.status = 'ACTIVE'
**관련 테이블**: `votes`, `vote_records`, `challenge`, `challenge_members`, `accounts`, `account_transactions`

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
   - votes.status → 'APPROVED'
   - challenge.status → 'CLOSED'
   - challenge.deleted_at 기록
   - challenge.dissolution_reason 기록
   - 잔액 분배 처리
     - 1인당 분배액 = challenge.balance / current_members
     - 각 멤버 accounts.balance 증가
     - account_transactions (type: 'TRANSFER')
   - 전체 보증금 해제
     - accounts.locked_balance 감소
     - accounts.balance 증가

**사후조건**:
- `challenge.status = 'CLOSED'`
- `challenge.balance = 0` (전액 분배)
- 모든 멤버 보증금 해제

**대안 시나리오**:
- 6a. 1명이라도 반대 → votes.status = 'REJECTED'
  - "전원 동의가 필요합니다. 1명이 반대했습니다."
- 1a. 팔로워가 발의 시도 → "리더만 종료 투표를 발의할 수 있습니다" 에러

**특수 케이스** (P-035):
```
[전원 자동 탈퇴로 종료]
- 모든 멤버가 자동 탈퇴 (보증금 미충전 60일) 시
- challenge.status → 'CLOSED'
- 잔액: 우리두 귀속 (분배 없음)
```

---

## 8. 유스케이스 매트릭스

### 8.1 Demo Day 우선순위

| UC ID | 유스케이스 | 도메인 | 우선순위 | Demo Day |
|-------|----------|--------|---------|----------|
| UC-USER-03 | 크레딧 충전 | USER | P0 | ✅ 필수 |
| UC-CHALLENGE-01 | 챌린지 생성 | CHALLENGE | P0 | ✅ 필수 |
| UC-CHALLENGE-02 | 챌린지 가입 (RECRUITING) | CHALLENGE | P0 | ✅ 필수 |
| UC-CHALLENGE-03 | 챌린지 가입 (ACTIVE) | CHALLENGE | P0 | ✅ 필수 |
| UC-CHALLENGE-05 | 장부 조회 (Django 분석) | CHALLENGE | P0 | ✅ 필수 |
| UC-MEETING-01 | 정기 모임 투표 발의 | MEETING | P1 | ✅ 필수 |
| UC-MEETING-02 | 정기 모임 참석 투표 | MEETING | P1 | ✅ 필수 |
| UC-MEETING-04 | 지출 투표 발의 | MEETING | P0 | ✅ 필수 |
| UC-MEETING-05 | 지출 투표 참여 | MEETING | P0 | ✅ 필수 |
| UC-SNS-01 | 피드 작성 | SNS | P0 | ✅ 필수 |
| UC-SNS-02 | 좋아요 | SNS | P0 | ✅ 필수 |
| UC-SNS-03 | 댓글 작성 | SNS | P0 | ✅ 필수 |
| UC-SYSTEM-01 | 서포트 자동 납입 | SYSTEM | P1 | ⏳ 선택 |
| UC-SYSTEM-02 | 보증금 충당/권한 박탈 | SYSTEM | P1 | ⏳ 선택 |
| UC-MEETING-07 | 멤버 퇴출 투표 (KICK) | MEETING | P2 | ⏳ 선택 |
| UC-MEETING-08 | 리더 강퇴 투표 (LEADER_KICK) | MEETING | P2 | ⏳ 선택 |
| UC-MEETING-09 | 챌린지 종료 투표 (DISSOLVE) | MEETING | P2 | ⏳ 선택 |
| UC-CHALLENGE-06 | 챌린지 완주 인증 | CHALLENGE | P2 | ⏳ 선택 |

### 8.2 투표 타입별 승인 조건

| 투표 타입 | 발의자 | 투표 대상 | 승인 조건 | DB 컬럼 |
|----------|--------|----------|----------|---------|
| EXPENSE | 리더 | 전체 멤버 또는 모임 참석자 | 과반수 (50%+1) | votes.type |
| KICK | 모두 | 전체 멤버 (대상 제외) | 70% 이상 | votes.target_user_id |
| MEETING_ATTENDANCE | 리더 | 전체 멤버 | 과반수 (50%+1) | votes.meeting_* |
| LEADER_KICK | 팔로워 | 전체 팔로워 | 70% 이상 | votes.target_user_id |
| DISSOLVE | 리더 | 전체 멤버 | 전원 (100%) | challenge.deleted_at |

### 8.3 트랜잭션 패턴 매핑

| 유스케이스 | Lock 타입 | 테이블 | 패턴 |
|-----------|----------|--------|------|
| UC-USER-03 | Pessimistic | accounts | FOR UPDATE WAIT 3 |
| UC-CHALLENGE-02/03 | Optimistic | challenge | version 컬럼 |
| UC-MEETING-05 | Both | challenge, ledger_entries | @Transactional + Lock |
| UC-SNS-02 | Atomic | posts | INCREMENT/DECREMENT |

---

## 부록: 용어 매핑

### ERD ↔ API 용어 매핑

| ERD 컬럼 | API/프론트엔드 용어 |
|----------|-------------------|
| `challenges` | `challenge` |
| `challenge_members` | `challengeMembers` |
| `creator_id` | `leaderId` |
| `current_members` | `currentMembers` (전체 인원) |
| `monthly_fee` | `supportAmount` |
| `deposit_amount` | `depositLock` |
| `balance` (accounts) | `availableBalance` |
| `locked_balance` | `depositLock` |
| `balance` (challenges) | `challengeAccountBalance` |

---

**문서 버전**: v3.1 DB_Schema Sync
**최종 수정**: 2026-01-13
**작성자**: AI-Assisted Development Team
**관련 문서**:
- [00_ERD_OVERVIEW.md](../../02_ENGINEERING/Database/00_ERD_OVERVIEW.md)
- [PRODUCT_AGENDA.md](../Product/PRODUCT_AGENDA.md)
- [POLICY_DEFINITION.md](../Product/POLICY_DEFINITION.md)

