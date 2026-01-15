# 사용자 도메인 유스케이스

> 관련 테이블: `users`, `accounts`, `account_transactions`, `user_scores`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)

---

## UC-USER-01: 회원가입

**액터**: 비회원
**전제조건**: 미가입 상태
**관련 테이블**: `users`, `accounts`

**성공 시나리오**:
1. 비회원이 "회원가입" 클릭
2. 회원 정보 입력
   - 이메일 (email)
   - 비밀번호 (password)
   - 이름 (name)
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

## UC-USER-02: 소셜 로그인

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

## UC-USER-03: 크레딧 충전

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

## UC-USER-04: 크레딧 출금

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

## UC-USER-05: 유저 당도 조회

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

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [01_SCHEMA_USER.md](../../../02_ENGINEERING/Database/01_SCHEMA_USER.md) - ERD
