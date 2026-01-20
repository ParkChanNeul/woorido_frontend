# WOORIDO ERD - 사용자 도메인
**users, accounts, account_transactions, user_scores**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)

---

## 1. 사용자 (users)

```sql
CREATE TABLE users (
  id VARCHAR2(36) PRIMARY KEY,                    -- 사용자 ID (UUID)
  email VARCHAR2(100) UNIQUE NOT NULL,
  password_hash VARCHAR2(255),
  name VARCHAR2(50) NOT NULL,
  nickname VARCHAR2(50),                          -- 닉네임 (표시명)
  phone VARCHAR2(20),
  profile_image_url VARCHAR2(500),
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
  
  -- 계정 상태 (P-030 ~ P-031)
  account_status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'WITHDRAWN')),
  suspended_at TIMESTAMP,
  suspended_until TIMESTAMP,
  suspension_reason VARCHAR2(500),
  
  -- 약관 동의 (P-001, P-002)
  agreed_terms CHAR(1) DEFAULT 'N' CHECK (agreed_terms IN ('Y', 'N')),
  agreed_privacy CHAR(1) DEFAULT 'N' CHECK (agreed_privacy IN ('Y', 'N')),
  agreed_marketing CHAR(1) DEFAULT 'N' CHECK (agreed_marketing IN ('Y', 'N')),
  terms_agreed_at TIMESTAMP,                      -- 약관 동의 시점
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  last_login_at TIMESTAMP,
  
  -- 인덱스
  CONSTRAINT uk_social_provider_id UNIQUE (social_provider, social_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_social ON users(social_provider, social_id);
CREATE INDEX idx_users_account_status ON users(account_status);
```

---

## 2. 계좌 (accounts)

```sql
CREATE TABLE accounts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 계좌 ID (UUID)
  user_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- 잔액 (동시성 제어 필수)
  balance NUMBER(19) DEFAULT 0 NOT NULL,
  locked_balance NUMBER(19) DEFAULT 0 NOT NULL,
  
  -- 계좌 정보
  bank_code VARCHAR2(10),
  account_number VARCHAR2(50),
  account_holder VARCHAR2(50),
  
  -- 동시성 제어
  version NUMBER(10) DEFAULT 0 NOT NULL,
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
```

---

## 3. 계좌 거래 내역 (account_transactions)

```sql
CREATE TABLE account_transactions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 거래 ID (UUID)
  account_id VARCHAR2(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- 트랜잭션 정보
  type VARCHAR2(20) NOT NULL CHECK (type IN ('CHARGE', 'WITHDRAW', 'LOCK', 'UNLOCK', 'SUPPORT', 'ENTRY_FEE', 'REFUND')),
  amount NUMBER(19) NOT NULL,
  
  -- 잔액 스냅샷
  balance_before NUMBER(19) NOT NULL,
  balance_after NUMBER(19) NOT NULL,
  locked_before NUMBER(19) NOT NULL,
  locked_after NUMBER(19) NOT NULL,
  
  -- 중복 방지 & 메타데이터
  idempotency_key VARCHAR2(100) UNIQUE,
  related_challenge_id VARCHAR2(36) REFERENCES challenges(id),
  related_user_id VARCHAR2(36) REFERENCES users(id),
  description VARCHAR2(500),
  pg_provider VARCHAR2(30),
  pg_tx_id VARCHAR2(100),
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_account_tx_account_id ON account_transactions(account_id);
CREATE INDEX idx_account_tx_type ON account_transactions(type);
CREATE INDEX idx_account_tx_created_at ON account_transactions(created_at);
```

---

## 4. 사용자 당도 점수 (user_scores)

```sql
CREATE TABLE user_scores (
  id VARCHAR2(36) PRIMARY KEY,                    -- 점수 ID (UUID)
  user_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- 집계 데이터
  total_attendance_count NUMBER(10) DEFAULT 0,
  total_payment_months NUMBER(10) DEFAULT 0,
  total_overdue_count NUMBER(10) DEFAULT 0,
  consecutive_overdue_count NUMBER(10) DEFAULT 0,
  total_feed_count NUMBER(10) DEFAULT 0,
  total_comment_count NUMBER(10) DEFAULT 0,
  total_like_given_count NUMBER(10) DEFAULT 0,
  total_leader_months NUMBER(10) DEFAULT 0,
  total_vote_absence_count NUMBER(10) DEFAULT 0,
  total_report_received_count NUMBER(10) DEFAULT 0,
  total_kick_count NUMBER(10) DEFAULT 0,
  
  -- 점수
  payment_score NUMBER(10,4) DEFAULT 0,
  activity_score NUMBER(10,4) DEFAULT 0,
  total_score NUMBER(10,4) DEFAULT 12,
  
  -- 갱신 정보
  calculated_at TIMESTAMP,
  calculated_month VARCHAR2(7),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_user_scores_total_score ON user_scores(total_score);
```

---

## 5. 리프레시 토큰 (refresh_tokens)

> 보안 권장: users 테이블 분리로 토큰 노출 방지, 빈번한 토큰 갱신 시 users 테이블 락 방지

```sql
CREATE TABLE refresh_tokens (
  id VARCHAR2(36) PRIMARY KEY,                    -- 토큰 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR2(500) NOT NULL,                   -- 리프레시 토큰 (해시 저장 권장)
  device_info VARCHAR2(500),                      -- 디바이스 정보 (User-Agent 등)
  ip_address VARCHAR2(45),                        -- 발급 시 IP 주소
  expires_at TIMESTAMP NOT NULL,                  -- 만료 시간 (14일)
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  last_used_at TIMESTAMP,                         -- 마지막 사용 시간
  is_revoked CHAR(1) DEFAULT 'N' CHECK (is_revoked IN ('Y', 'N'))  -- 수동 무효화 여부
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE UNIQUE INDEX uk_refresh_tokens_token ON refresh_tokens(token);
```

---

**최종 수정**: 2026-01-20
**기준 문서**: DB_Schema_1.0.0.md
