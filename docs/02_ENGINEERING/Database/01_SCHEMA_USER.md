# WOORIDO ERD - 사용자 도메인
**users, accounts, account_transactions, user_scores**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)

---

## 1. 사용자 (users)

```sql
CREATE TABLE users (
  id VARCHAR2(36) PRIMARY KEY,                    -- 사용자 ID (UUID)
  email VARCHAR2(100) UNIQUE NOT NULL,
  password_hash VARCHAR2(255) NOT NULL,
  name VARCHAR2(50) NOT NULL,
  profile_image_url VARCHAR2(500),
  phone VARCHAR2(20),
  birth_date DATE,
  gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
  bio VARCHAR2(500),

  -- 인증 정보
  is_verified CHAR(1) DEFAULT 'N' CHECK (is_verified IN ('Y', 'N')),
  verification_token VARCHAR2(100),
  verification_token_expires TIMESTAMP,

  -- 소셜 로그인
  social_provider VARCHAR2(20) CHECK (social_provider IN ('GOOGLE', 'KAKAO', 'NAVER')),
  social_id VARCHAR2(100),

  -- 보안
  password_reset_token VARCHAR2(100),
  password_reset_expires TIMESTAMP,
  failed_login_attempts NUMBER(10) DEFAULT 0,
  locked_until TIMESTAMP,

  -- P-030 ~ P-031: 계정 상태 관리 (신고/정지 시스템)
  account_status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
  suspended_at TIMESTAMP,
  suspended_until TIMESTAMP,
  suspension_reason VARCHAR2(500),
  warning_count NUMBER(10) DEFAULT 0,
  report_received_count NUMBER(10) DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  last_login_at TIMESTAMP,

  -- 인덱스
  CONSTRAINT uk_social_provider_id UNIQUE (social_provider, social_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_suspended ON users(suspended_until);
```

---

## 2. 계좌 (accounts)

```sql
CREATE TABLE accounts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 계좌 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 잔액 (동시성 제어 필수)
  balance NUMBER(19) DEFAULT 0 NOT NULL,
  locked_balance NUMBER(19) DEFAULT 0 NOT NULL,

  -- 동시성 제어
  version NUMBER(10) DEFAULT 0 NOT NULL,  -- Optimistic Lock

  -- 계좌 정보
  bank_code VARCHAR2(10),
  account_number VARCHAR2(50),
  account_holder VARCHAR2(50),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_balance_positive CHECK (balance >= 0),
  CONSTRAINT chk_locked_positive CHECK (locked_balance >= 0),
  CONSTRAINT chk_total_balance CHECK (balance + locked_balance >= 0),
  CONSTRAINT uk_user_account UNIQUE (user_id)
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `balance` | `availableBalance` (가용 잔액) |
| `locked_balance` | `depositLock` (보증금 락) |

---

## 3. 계좌 트랜잭션 (account_transactions)

```sql
CREATE TABLE account_transactions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 거래 ID (UUID)
  account_id VARCHAR2(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- 트랜잭션 정보
  type VARCHAR2(20) NOT NULL CHECK (type IN ('CHARGE', 'WITHDRAW', 'LOCK', 'UNLOCK', 'TRANSFER', 'ENTRY_FEE', 'SUPPORT')),
  amount NUMBER(19) NOT NULL,

  -- 잔액 스냅샷 (감사 추적)
  balance_before NUMBER(19) NOT NULL,
  balance_after NUMBER(19) NOT NULL,
  locked_before NUMBER(19) NOT NULL,
  locked_after NUMBER(19) NOT NULL,

  -- 중복 방지 (Idempotency)
  idempotency_key VARCHAR2(100) UNIQUE,

  -- 관련 엔티티
  related_challenge_id VARCHAR2(36) REFERENCES challenges(id),
  related_user_id VARCHAR2(36) REFERENCES users(id),

  -- 메타데이터
  description VARCHAR2(500),
  payment_method VARCHAR2(20),
  payment_gateway_tx_id VARCHAR2(100),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_acct_tx_account_created ON account_transactions(account_id, created_at DESC);
CREATE INDEX idx_acct_tx_idempotency ON account_transactions(idempotency_key);
CREATE INDEX idx_acct_tx_type ON account_transactions(type, created_at DESC);
```

**트랜잭션 타입:**
| 타입 | 설명 |
|------|------|
| `CHARGE` | 크레딧 충전 |
| `WITHDRAW` | 크레딧 출금 |
| `LOCK` | 보증금 락 |
| `UNLOCK` | 보증금 해제 |
| `TRANSFER` | 이체 |
| `ENTRY_FEE` | 입회비 |
| `SUPPORT` | 월 서포트 납입 |

---

## 4. 유저 점수 (user_scores)

> **WRD-105 기반**: 점수 시스템 v2.0 Final
> - 갱신 시점: 매월 1일 서포트 납입 시
> - 점수 범위: 유저 전체 통합 점수 (챌린지별 분리 X)
> - 연산: Django에서 계산 후 Spring Boot가 저장

```sql
CREATE TABLE user_scores (
  id VARCHAR2(36) PRIMARY KEY,                    -- 점수 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 납입 관련 원본 데이터 (Spring에서 집계)
  total_attendance_count NUMBER(10) DEFAULT 0,       -- 총 모임 참석 횟수
  total_payment_months NUMBER(10) DEFAULT 0,         -- 총 납입 개월수 (모든 챌린지 합산)
  total_overdue_count NUMBER(10) DEFAULT 0,          -- 총 연체 횟수

  -- 활동 관련 원본 데이터 (Spring에서 집계)
  total_feed_count NUMBER(10) DEFAULT 0,             -- 총 피드 작성 수
  total_comment_count NUMBER(10) DEFAULT 0,          -- 총 댓글 작성 수
  total_like_count NUMBER(10) DEFAULT 0,             -- 총 좋아요 수
  total_leader_months NUMBER(10) DEFAULT 0,          -- 총 리더 경험 개월수
  total_report_received_count NUMBER(10) DEFAULT 0,  -- 총 신고 당한 횟수
  total_kick_count NUMBER(10) DEFAULT 0,             -- 총 강퇴 당한 횟수

  -- Django 연산 결과
  payment_score NUMBER(10,4) DEFAULT 0,         -- 납입 점수 (원본)
  activity_score NUMBER(10,4) DEFAULT 0,        -- 활동 점수 (원본)
  total_score NUMBER(10,4) DEFAULT 36.5,        -- 최종 점수

  -- 갱신 정보
  calculated_at TIMESTAMP DEFAULT SYSTIMESTAMP,  -- 마지막 연산 시점
  calculated_month VARCHAR2(7),                   -- 연산 기준월 (YYYY-MM)

  -- 제약조건
  CONSTRAINT uk_user_score UNIQUE (user_id),
  CONSTRAINT chk_score_max CHECK (total_score <= 100)
);

CREATE INDEX idx_user_scores_total ON user_scores(total_score DESC);
CREATE INDEX idx_user_scores_month ON user_scores(calculated_month);
```

**WRD-105 점수 공식:**
```
최종 점수 = 36.5 + (납입 점수 × 0.7) + (활동 점수 × 0.15)

납입 점수 = (모임 참석 × 0.09) + (납입 개월 × 0.32) + (연체 × -1.5)
활동 점수 = (피드 × 0.05) + (댓글 × 0.025) + (좋아요 × 0.006) 
          + (리더 개월 × 0.45) + (신고 당함 × -0.6) + (강퇴 당함 × -4.0)
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `total_score` | `userScore` (유저 점수) |
| `payment_score` | `paymentScore` (납입 점수 원본) |
| `activity_score` | `activityScore` (활동 점수 원본) |

---

**최종 수정**: 2026-01-09
