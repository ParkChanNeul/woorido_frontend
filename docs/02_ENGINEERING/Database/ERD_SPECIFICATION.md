# WOORIDO ERD Specification
**백엔드 개발자용 데이터베이스 설계 명세서**

**작성일**: 2026-01-15
**대상 DBMS**: Oracle 21c XE
**ORM**: mybatis-spring-boot-starter 3.0.3
**트랜잭션 관리**: Spring Boot 3.2.3 (@Transactional)
**총 테이블**: 32개

> 📖 정책 기준: [POLICY_DEFINITION.md](../../01_PLANNING/Product/POLICY_DEFINITION.md)
> 📖 **기준 문서**: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)
> 📋 변경 이력: [BACKLOG.md](../../BACKLOG.md)

---

## 중요 공지

> **용어 변경 1**: `gye` → `challenges`
> - 테이블명 `gye`는 레거시 용어입니다.
> - 실제 DB 스키마에서는 `challenges` 테이블명을 사용합니다.

> **용어 정의 2**: `member` vs `follower` vs `leader`
> - 멤버(member): 챌린지 내 전체 인원 (리더 + 팔로워)
> - 리더(leader): 챌린지를 생성하고 관리하는 멤버
> - 팔로워(follower): 리더가 아닌 일반 멤버
> - 컬럼명: `current_members`, `min_members`, `max_members`는 전체 인원 수입니다.

---

## 📋 목차

1. [아키텍처 개요](#1-아키텍처-개요)
2. [트랜잭션 오류 해결 전략](#2-트랜잭션-오류-해결-전략)
3. [완전한 스키마 정의](#3-완전한-스키마-정의)
4. [MyBatis 구현 예제](#4-mybatis-구현-예제)
5. [Spring Boot 서비스 패턴](#5-spring-boot-서비스-패턴)
6. [인덱스 전략](#6-인덱스-전략)

---

## 1. 아키텍처 개요

### 1.1 트랜잭션 관리 계층

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                 - API 호출만 담당                         │
│                 - 로컬 상태 관리 (의견 데이터)            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot (Transaction Manager)           │
│  ✅ 모든 트랜잭션 처리 (ACID 보장)                        │
│  ✅ MyBatis로 Oracle DB 직접 제어                        │
│  ✅ 동시성 제어 (Optimistic/Pessimistic Lock)            │
│  ✅ Idempotency 검증                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Oracle  │   │ Django  │   │  Redis  │
   │   DB    │   │(분석 전용)│   │ (Cache) │
   │         │   │❌ No DB  │   │         │
   │✅ 트랜잭션│   │❌ No Tx  │   │         │
   └─────────┘   └─────────┘   └─────────┘
```

### 1.2 Django의 역할 (트랜잭션 없음)

Django는 **순수 데이터 분석/알고리즘 실행 엔진**으로만 사용:

```python
# Django 서비스 예제 (DB 연결 없음)
@api_view(['POST'])
def recommend_challenge(request):
    user_data = request.data  # Spring Boot가 보낸 JSON

    # pandas/numpy로 분석
    df = pd.DataFrame(user_data['user_history'])
    recommendations = collaborative_filtering(df)
    risk_score = calculate_risk(user_data['transactions'])

    return Response({
        'recommended_challenge_ids': recommendations,
        'risk_level': risk_score
    })
```

**Django가 하는 것:**
- ✅ 챌린지 추천 알고리즘 (협업 필터링)
- ✅ 이상 거래 탐지 (통계 분석)
- ✅ 위험도 계산 (ML 모델)
- ✅ 데이터 집계/변환 (pandas)

**Django가 하지 않는 것:**
- ❌ DB 직접 연결
- ❌ 트랜잭션 처리
- ❌ CRUD 작업
- ❌ 동시성 제어

### 1.3 사용자 결정사항 (User Decisions)

#### ✅ 온보딩 분기 처리: 로직 기반 (옵션 B)

**DB 컬럼 추가 없음.** 애플리케이션 레벨에서 판단:

```java
// Spring Boot Service
public boolean isNewUser(User user) {
    LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
    return user.getCreatedAt().isAfter(sevenDaysAgo);
}
```

#### ✅ returnUrl 저장: 하이브리드 방식

**돈 관련 (Option A - DB Session):**
```sql
CREATE TABLE sessions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 세션 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  return_url VARCHAR2(500) NOT NULL,
  session_type VARCHAR2(20) NOT NULL CHECK (session_type IN ('CHARGE', 'JOIN', 'WITHDRAW')),
  created_at TIMESTAMP NOT NULL DEFAULT SYSTIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_used CHAR(1) DEFAULT 'N' CHECK (is_used IN ('Y', 'N'))
);
```

**적용 대상:**
- 충전 플로우 (`/charge` → 결제 게이트웨이 → `/charge/callback`)
- 모임 가입 (`/challenge/:id` → 보증금 결제 → `/challenge/:id/detail`)
- 출금 요청 (`/account` → 인증 → `/account`)

**의견 관련 (Option B - Frontend localStorage):**

Frontend에서 직접 관리:
```typescript
// React - 투표/게시글/댓글 작성 시
const returnUrl = location.pathname;
localStorage.setItem('returnUrl', returnUrl);

// 완료 후
const savedUrl = localStorage.getItem('returnUrl');
navigate(savedUrl || '/feed');
```

**적용 대상:**
- 투표 참여
- 게시글 작성/수정
- 댓글 작성
- SNS 활동

#### ✅ 모임 삭제: Soft Delete (옵션 A)

**404 처리 + 유저 목록에서 보기:**

```sql
ALTER TABLE challenges ADD deleted_at TIMESTAMP;
ALTER TABLE challenges ADD dissolution_reason VARCHAR2(500);
```

**API 동작:**

1. **개별 조회 시 404 반환:**
```json
GET /api/challenges/abc123
HTTP/1.1 404 Not Found
{
  "error": "CHALLENGE_DELETED",
  "message": "이 챌린지는 2026년 1월 3일에 해산되었습니다.",
  "deletedAt": "2026-01-03T10:30:00Z",
  "dissolutionReason": "리더 요청"
}
```

2. **내 챌린지 목록에서는 표시:**
```json
GET /api/challenges/my-challenges?includeDeleted=true
[
  {
    "id": "abc123",
    "name": "강남 맛집 챌린지",
    "status": "dissolved",
    "deletedAt": "2026-01-03T10:30:00Z"
  }
]
```

---

## 2. 트랜잭션 오류 해결 전략

### 2.1 Race Condition (경쟁 조건)

**문제:** 여러 유저가 동시에 챌린지 가입 시 `current_members` 카운트 오류

**해결:** Optimistic Locking + Version Column

```sql
ALTER TABLE challenges ADD version NUMBER(19) DEFAULT 0 NOT NULL;
```

```xml
<!-- MyBatis Mapper -->
<update id="incrementMembers">
  UPDATE challenges
  SET current_members = current_members + 1,
      version = version + 1
  WHERE id = #{challengeId}
    AND version = #{version}
    AND current_members < max_members
</update>
```

```java
@Service
@Transactional
public class ChallengeService {

    @Retryable(
        value = {OptimisticLockException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100)
    )
    public void joinChallenge(String userId, String challengeId) {
        Challenge challenge = challengeMapper.selectByIdWithVersion(challengeId);

        int updated = challengeMapper.incrementMembers(challengeId, challenge.getVersion());
        if (updated == 0) {
            throw new OptimisticLockException("동시 가입 발생");
        }

        challengeMemberMapper.insert(new ChallengeMember(challengeId, userId));
    }
}
```

### 2.2 Lost Update (갱신 손실)

**문제:** 동시 충전/출금으로 인한 잔액 불일치

**해결:** Pessimistic Locking (SELECT FOR UPDATE) + 트랜잭션 로그

```xml
<!-- MyBatis Mapper -->
<select id="selectAccountForUpdate" resultType="Account">
  SELECT * FROM accounts
  WHERE id = #{accountId}
  FOR UPDATE WAIT 3  <!-- 3초 대기 후 실패 -->
</select>
```

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void charge(String accountId, long amount, String idempotencyKey) {
    // 1. 중복 요청 검증
    if (accountTransactionMapper.existsByIdempotencyKey(idempotencyKey)) {
        throw new DuplicateTransactionException();
    }

    // 2. Pessimistic Lock
    Account account = accountMapper.selectAccountForUpdate(accountId);

    long balanceBefore = account.getBalance();
    long balanceAfter = balanceBefore + amount;

    // 3. 잔액 업데이트
    accountMapper.updateBalance(accountId, balanceAfter);

    // 4. 트랜잭션 로그 저장
    accountTransactionMapper.insert(AccountTransaction.builder()
        .accountId(accountId)
        .type("CHARGE")
        .amount(amount)
        .balanceBefore(balanceBefore)
        .balanceAfter(balanceAfter)
        .idempotencyKey(idempotencyKey)
        .build());
}
```

### 2.3 Atomicity Violation (원자성 위반)

**문제:** 투표 승인 후 장부 기록 실패 시 불일치

**해결:** Single Transaction + 롤백 보장

```java
@Transactional(rollbackFor = Exception.class)
public void approveVote(String voteId) {
    Vote vote = voteMapper.selectById(voteId);

    // 1. 투표 상태 변경
    vote.setStatus("APPROVED");
    vote.setApprovedAt(LocalDateTime.now());
    voteMapper.update(vote);

    // 2. 장부 기록 생성
    LedgerEntry ledger = LedgerEntry.builder()
        .challengeId(vote.getChallengeId())
        .amount(vote.getAmount())
        .description(vote.getDescription())
        .type("EXPENSE")
        .createdBy(vote.getCreatedBy())
        .build();

    UUID ledgerId = ledgerEntryMapper.insert(ledger);

    // 3. 투표-장부 연결
    vote.setLedgerEntryId(ledgerId);
    vote.setLedgerStatus("RECORDED");
    voteMapper.update(vote);

    // 4. 챌린지 잔액 차감 (Pessimistic Lock)
    Challenge challenge = challengeMapper.selectByIdForUpdate(vote.getChallengeId());
    challengeMapper.updateBalance(challenge.getId(), challenge.getBalance() - vote.getAmount());
}
```

### 2.4 Denormalized Counter Drift (비정규화 카운터 오류)

**문제:** `like_count`, `comment_count` 실제값과 불일치

**해결:** Atomic Operations + Scheduled Reconciliation

```xml
<!-- Atomic Increment -->
<update id="incrementLikeCount">
  UPDATE posts
  SET like_count = like_count + 1
  WHERE id = #{postId}
</update>

<update id="decrementLikeCount">
  UPDATE posts
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = #{postId}
</update>
```

```java
// Scheduled Job - 매일 새벽 3시 정합성 검증
@Scheduled(cron = "0 0 3 * * *")
public void reconcileCounts() {
    jdbcTemplate.execute("""
        UPDATE posts p
        SET like_count = (
            SELECT COUNT(*) FROM post_likes pl
            WHERE pl.post_id = p.id
        )
        WHERE like_count != (
            SELECT COUNT(*) FROM post_likes pl
            WHERE pl.post_id = p.id
        )
    """);
}
```

### 2.5 Missing CASCADE Policies

**해결:** 명시적 CASCADE 정의

```sql
-- 챌린지 삭제 시 연관 데이터 처리
CREATE TABLE challenge_members (
  ...
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE ledger_entries (
  ...
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE
);

-- 유저 삭제 시 연관 데이터 처리
CREATE TABLE posts (
  ...
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 3. 완전한 스키마 정의

> 📖 **기준 문서**: [DB_Schema_1.0.0.md](./DB_Schema_1.0.0.md)
> 📋 **변경 이력**: [ERD_UPDATE_BACKLOG.md](./ERD_UPDATE_BACKLOG.md)

---

### 3.1 사용자 도메인 (User Domain)

#### 3.1.1 users (사용자)

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
  is_verified CHAR(1) DEFAULT 'N' CHECK (is_verified IN ('Y', 'N')),
  verification_token VARCHAR2(100),
  verification_token_expires TIMESTAMP,
  social_provider VARCHAR2(20) CHECK (social_provider IN ('GOOGLE', 'KAKAO', 'NAVER')),
  social_id VARCHAR2(100),
  password_reset_token VARCHAR2(100),
  password_reset_expires TIMESTAMP,
  failed_login_attempts NUMBER(10) DEFAULT 0,
  locked_until TIMESTAMP,
  account_status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'WITHDRAWN')),
  suspended_at TIMESTAMP,
  suspended_until TIMESTAMP,
  suspension_reason VARCHAR2(500),
  
  -- 약관 동의 (P-001, P-002)
  agreed_terms CHAR(1) DEFAULT 'N' CHECK (agreed_terms IN ('Y', 'N')),
  agreed_privacy CHAR(1) DEFAULT 'N' CHECK (agreed_privacy IN ('Y', 'N')),
  agreed_marketing CHAR(1) DEFAULT 'N' CHECK (agreed_marketing IN ('Y', 'N')),
  terms_agreed_at TIMESTAMP,                      -- 약관 동의 시점
  
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  last_login_at TIMESTAMP,
  CONSTRAINT uk_social_provider_id UNIQUE (social_provider, social_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_social ON users(social_provider, social_id);
CREATE INDEX idx_users_account_status ON users(account_status);
```

#### 3.1.2 accounts (사용자 계좌)

```sql
CREATE TABLE accounts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 계좌 ID (UUID)
  user_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance NUMBER(19) DEFAULT 0 NOT NULL,
  locked_balance NUMBER(19) DEFAULT 0 NOT NULL,
  bank_code VARCHAR2(10),
  account_number VARCHAR2(50),
  account_holder VARCHAR2(50),
  version NUMBER(10) DEFAULT 0 NOT NULL,          -- 동시성 제어
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
```

#### 3.1.3 account_transactions (계좌 거래 내역)

```sql
CREATE TABLE account_transactions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 거래 ID (UUID)
  account_id VARCHAR2(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type VARCHAR2(20) NOT NULL CHECK (type IN ('CHARGE', 'WITHDRAW', 'LOCK', 'UNLOCK', 'SUPPORT', 'ENTRY_FEE', 'REFUND')),
  amount NUMBER(19) NOT NULL,
  balance_before NUMBER(19) NOT NULL,
  balance_after NUMBER(19) NOT NULL,
  locked_before NUMBER(19) NOT NULL,
  locked_after NUMBER(19) NOT NULL,
  idempotency_key VARCHAR2(100) UNIQUE,           -- 중복 방지
  related_challenge_id VARCHAR2(36) REFERENCES challenges(id),
  related_user_id VARCHAR2(36) REFERENCES users(id),
  description VARCHAR2(500),
  pg_provider VARCHAR2(30),
  pg_tx_id VARCHAR2(100),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_account_tx_account_id ON account_transactions(account_id);
CREATE INDEX idx_account_tx_type ON account_transactions(type);
CREATE INDEX idx_account_tx_created_at ON account_transactions(created_at);
```

#### 3.1.4 user_scores (사용자 당도 점수)

```sql
CREATE TABLE user_scores (
  id VARCHAR2(36) PRIMARY KEY,                    -- 점수 ID (UUID)
  user_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
  payment_score NUMBER(10,4) DEFAULT 0,
  activity_score NUMBER(10,4) DEFAULT 0,
  total_score NUMBER(10,4) DEFAULT 12,
  calculated_at TIMESTAMP,
  calculated_month VARCHAR2(7),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_user_scores_total_score ON user_scores(total_score);
```

#### 3.1.5 refresh_tokens (리프레시 토큰)

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

### 3.2 챌린지 도메인 (Challenge Domain)

#### 3.2.1 challenges (챌린지)

```sql
CREATE TABLE challenges (
  id VARCHAR2(36) PRIMARY KEY,                    -- 챌린지 ID (UUID)
  name VARCHAR2(100) NOT NULL,
  description VARCHAR2(2000),
  category VARCHAR2(50) NOT NULL CHECK (category IN ('HOBBY', 'STUDY', 'EXERCISE', 'SAVINGS', 'TRAVEL', 'FOOD', 'CULTURE', 'OTHER')),
  creator_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  leader_last_active_at TIMESTAMP,
  leader_benefit_rate NUMBER(5,4) DEFAULT 0,
  current_members NUMBER(10) DEFAULT 1 NOT NULL,
  min_members NUMBER(10) DEFAULT 3 NOT NULL,
  max_members NUMBER(10) NOT NULL,
  balance NUMBER(19) DEFAULT 0 NOT NULL,
  monthly_fee NUMBER(19) NOT NULL,
  deposit_amount NUMBER(19) NOT NULL,
  status VARCHAR2(20) DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'IN_PROGRESS', 'COMPLETED')),
  activated_at TIMESTAMP,
  is_verified CHAR(1) DEFAULT 'N' CHECK (is_verified IN ('Y', 'N')),
  verified_at TIMESTAMP,
  is_public CHAR(1) DEFAULT 'Y' CHECK (is_public IN ('Y', 'N')),
  thumbnail_url VARCHAR2(500),
  banner_url VARCHAR2(500),
  deleted_at TIMESTAMP,
  dissolution_reason VARCHAR2(500),
  version NUMBER(10) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_challenges_creator_id ON challenges(creator_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_is_public ON challenges(is_public);
```

#### 3.2.2 challenge_members (챌린지 멤버)

```sql
CREATE TABLE challenge_members (
  id VARCHAR2(36) PRIMARY KEY,                    -- 멤버십 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role VARCHAR2(20) DEFAULT 'FOLLOWER' CHECK (role IN ('LEADER', 'FOLLOWER')),
  deposit_status VARCHAR2(20) DEFAULT 'NONE' CHECK (deposit_status IN ('NONE', 'LOCKED', 'USED', 'UNLOCKED')),
  deposit_locked_at TIMESTAMP,
  deposit_unlocked_at TIMESTAMP,
  entry_fee_amount NUMBER(19) DEFAULT 0,
  entry_fee_paid_at TIMESTAMP,
  privilege_status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (privilege_status IN ('ACTIVE', 'REVOKED')),
  privilege_revoked_at TIMESTAMP,
  last_support_paid_at TIMESTAMP,
  total_support_paid NUMBER(19) DEFAULT 0 NOT NULL,
  joined_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  left_at TIMESTAMP,
  leave_reason VARCHAR2(50) CHECK (leave_reason IN ('NORMAL', 'KICKED', 'AUTO_LEAVE', 'CHALLENGE_CLOSED')),
  CONSTRAINT uk_challenge_user UNIQUE (challenge_id, user_id)
);

CREATE INDEX idx_challenge_members_user_id ON challenge_members(user_id);
CREATE INDEX idx_challenge_members_role ON challenge_members(role);
```

---

### 3.3 모임 도메인 (Meeting Domain)

#### 3.3.1 meetings (모임)

```sql
CREATE TABLE meetings (
  id VARCHAR2(36) PRIMARY KEY,                    -- 모임 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR2(200) NOT NULL,
  description VARCHAR2(2000),
  meeting_date TIMESTAMP NOT NULL,
  location VARCHAR2(500),
  status VARCHAR2(20) DEFAULT 'VOTING' CHECK (status IN ('VOTING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_meetings_challenge_id ON meetings(challenge_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_meeting_date ON meetings(meeting_date);
```

#### 3.3.2 meeting_votes (모임 참석 투표)

```sql
CREATE TABLE meeting_votes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 투표 ID (UUID)
  meeting_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES meetings(id) ON DELETE CASCADE,
  required_count NUMBER(10) NOT NULL,
  attend_count NUMBER(10) DEFAULT 0,
  absent_count NUMBER(10) DEFAULT 0,
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  version NUMBER(10) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP
);

CREATE INDEX idx_meeting_votes_status ON meeting_votes(status);
CREATE INDEX idx_meeting_votes_expires_at ON meeting_votes(expires_at);
```

#### 3.3.3 meeting_vote_records (모임 투표 기록)

```sql
CREATE TABLE meeting_vote_records (
  id VARCHAR2(36) PRIMARY KEY,                    -- 기록 ID (UUID)
  meeting_vote_id VARCHAR2(36) NOT NULL REFERENCES meeting_votes(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  choice VARCHAR2(10) NOT NULL CHECK (choice IN ('ATTEND', 'ABSENT')),
  actual_attendance VARCHAR2(20) DEFAULT 'PENDING' CHECK (actual_attendance IN ('PENDING', 'ATTENDED', 'NO_SHOW')),
  attendance_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uk_meeting_vote_user UNIQUE (meeting_vote_id, user_id)
);

CREATE INDEX idx_meeting_vote_records_user_id ON meeting_vote_records(user_id);
```

---

### 3.4 지출 도메인 (Expense Domain)

#### 3.4.1 expense_requests (지출 요청)

```sql
CREATE TABLE expense_requests (
  id VARCHAR2(36) PRIMARY KEY,                    -- 요청 ID (UUID)
  meeting_id VARCHAR2(36) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR2(200) NOT NULL,
  amount NUMBER(19) NOT NULL,
  description VARCHAR2(2000),
  receipt_url VARCHAR2(500),
  status VARCHAR2(20) DEFAULT 'VOTING' CHECK (status IN ('VOTING', 'APPROVED', 'REJECTED', 'USED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  approved_at TIMESTAMP
);

CREATE INDEX idx_expense_requests_meeting_id ON expense_requests(meeting_id);
CREATE INDEX idx_expense_requests_status ON expense_requests(status);
```

#### 3.4.2 expense_votes (지출 투표)

```sql
CREATE TABLE expense_votes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 투표 ID (UUID)
  expense_request_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES expense_requests(id) ON DELETE CASCADE,
  eligible_count NUMBER(10) NOT NULL,             -- 투표 자격자 수 (참석자만)
  required_count NUMBER(10) NOT NULL,
  approve_count NUMBER(10) DEFAULT 0,
  reject_count NUMBER(10) DEFAULT 0,
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  version NUMBER(10) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP
);

CREATE INDEX idx_expense_votes_status ON expense_votes(status);
CREATE INDEX idx_expense_votes_expires_at ON expense_votes(expires_at);
```

#### 3.4.3 expense_vote_records (지출 투표 기록)

```sql
CREATE TABLE expense_vote_records (
  id VARCHAR2(36) PRIMARY KEY,                    -- 기록 ID (UUID)
  expense_vote_id VARCHAR2(36) NOT NULL REFERENCES expense_votes(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  choice VARCHAR2(10) NOT NULL CHECK (choice IN ('APPROVE', 'REJECT')),
  comment VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uk_expense_vote_user UNIQUE (expense_vote_id, user_id)
);

CREATE INDEX idx_expense_vote_records_user_id ON expense_vote_records(user_id);
```

#### 3.4.4 payment_barcodes (결제 바코드)

```sql
CREATE TABLE payment_barcodes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 바코드 ID (UUID)
  expense_request_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES expense_requests(id) ON DELETE CASCADE,
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  barcode_number VARCHAR2(50) NOT NULL UNIQUE,
  amount NUMBER(19) NOT NULL,
  status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
  used_at TIMESTAMP,
  used_merchant_name VARCHAR2(100),
  used_merchant_category VARCHAR2(50),
  pg_tx_id VARCHAR2(100),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_payment_barcodes_challenge_id ON payment_barcodes(challenge_id);
CREATE INDEX idx_payment_barcodes_status ON payment_barcodes(status);
CREATE INDEX idx_payment_barcodes_expires_at ON payment_barcodes(expires_at);
```

#### 3.4.5 ledger_entries (챌린지 장부)

```sql
CREATE TABLE ledger_entries (
  id VARCHAR2(36) PRIMARY KEY,                    -- 장부 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  type VARCHAR2(20) NOT NULL CHECK (type IN ('SUPPORT', 'ENTRY_FEE', 'EXPENSE', 'REFUND')),
  amount NUMBER(19) NOT NULL,
  description VARCHAR2(500),
  balance_before NUMBER(19) NOT NULL,
  balance_after NUMBER(19) NOT NULL,
  related_user_id VARCHAR2(36) REFERENCES users(id) ON DELETE SET NULL,
  related_meeting_id VARCHAR2(36) REFERENCES meetings(id) ON DELETE SET NULL,
  related_expense_request_id VARCHAR2(36) REFERENCES expense_requests(id) ON DELETE SET NULL,
  related_barcode_id VARCHAR2(36) REFERENCES payment_barcodes(id) ON DELETE SET NULL,
  merchant_name VARCHAR2(100),
  merchant_category VARCHAR2(50),
  pg_provider VARCHAR2(30),
  pg_approval_number VARCHAR2(50),
  memo VARCHAR2(500),
  memo_updated_at TIMESTAMP,
  memo_updated_by VARCHAR2(36) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_ledger_entries_challenge_id ON ledger_entries(challenge_id);
CREATE INDEX idx_ledger_entries_type ON ledger_entries(type);
CREATE INDEX idx_ledger_entries_created_at ON ledger_entries(created_at);
CREATE INDEX idx_ledger_entries_related_user_id ON ledger_entries(related_user_id);
```

#### 3.4.6 payment_logs (결제 시도/실패 이력)

```sql
CREATE TABLE payment_logs (
  id VARCHAR2(36) PRIMARY KEY,                    -- 로그 ID (UUID)
  payment_barcode_id VARCHAR2(36) NOT NULL REFERENCES payment_barcodes(id) ON DELETE CASCADE,
  action VARCHAR2(20) NOT NULL CHECK (action IN ('REQUEST', 'SUCCESS', 'FAIL', 'RETRY')),
  request_data CLOB,
  response_data CLOB,
  error_code VARCHAR2(50),
  error_message VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_payment_logs_barcode_id ON payment_logs(payment_barcode_id);
CREATE INDEX idx_payment_logs_action ON payment_logs(action);
CREATE INDEX idx_payment_logs_created_at ON payment_logs(created_at);
```

---

### 3.5 일반 투표 도메인 (General Vote Domain)

#### 3.5.1 general_votes (일반 투표)

> 팔로워 강퇴, 리더 탄핵, 챌린지 해산 투표 관리

```sql
CREATE TABLE general_votes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 투표 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR2(20) NOT NULL CHECK (type IN ('KICK', 'LEADER_KICK', 'DISSOLVE')),
  title VARCHAR2(200) NOT NULL,
  description VARCHAR2(2000),
  target_user_id VARCHAR2(36) REFERENCES users(id) ON DELETE SET NULL,
  eligible_count NUMBER(10) NOT NULL,
  required_count NUMBER(10) NOT NULL,
  approve_count NUMBER(10) DEFAULT 0,
  reject_count NUMBER(10) DEFAULT 0,
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  version NUMBER(10) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  closed_at TIMESTAMP
);

CREATE INDEX idx_general_votes_challenge_id ON general_votes(challenge_id);
CREATE INDEX idx_general_votes_type ON general_votes(type);
CREATE INDEX idx_general_votes_status ON general_votes(status);
CREATE INDEX idx_general_votes_expires_at ON general_votes(expires_at);
```

#### 3.5.2 general_vote_records (일반 투표 기록)

```sql
CREATE TABLE general_vote_records (
  id VARCHAR2(36) PRIMARY KEY,                    -- 기록 ID (UUID)
  general_vote_id VARCHAR2(36) NOT NULL REFERENCES general_votes(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  choice VARCHAR2(10) NOT NULL CHECK (choice IN ('APPROVE', 'REJECT')),
  comment VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uk_general_vote_user UNIQUE (general_vote_id, user_id)
);

CREATE INDEX idx_general_vote_records_user_id ON general_vote_records(user_id);
```

---

### 3.6 SNS 도메인 (SNS Domain)

#### 3.6.1 posts (피드)

```sql
CREATE TABLE posts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 피드 ID (UUID)
  challenge_id VARCHAR2(36) REFERENCES challenges(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content VARCHAR2(4000) NOT NULL,
  is_notice CHAR(1) DEFAULT 'N' CHECK (is_notice IN ('Y', 'N')),
  is_pinned CHAR(1) DEFAULT 'N' CHECK (is_pinned IN ('Y', 'N')),
  like_count NUMBER(10) DEFAULT 0,
  comment_count NUMBER(10) DEFAULT 0,
  view_count NUMBER(10) DEFAULT 0,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_posts_challenge_id ON posts(challenge_id);
CREATE INDEX idx_posts_created_by ON posts(created_by);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_notice ON posts(is_notice);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
```

#### 3.6.2 post_images (피드 이미지)

```sql
CREATE TABLE post_images (
  id VARCHAR2(36) PRIMARY KEY,                    -- 이미지 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url VARCHAR2(500) NOT NULL,
  display_order NUMBER(10) NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_post_images_post_id ON post_images(post_id);
```

#### 3.6.3 post_likes (피드 좋아요)

```sql
CREATE TABLE post_likes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 좋아요 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uk_post_user_like UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
```

#### 3.6.4 comments (댓글)

```sql
CREATE TABLE comments (
  id VARCHAR2(36) PRIMARY KEY,                    -- 댓글 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id VARCHAR2(36) REFERENCES comments(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content VARCHAR2(1000) NOT NULL,
  like_count NUMBER(10) DEFAULT 0,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_by ON comments(created_by);
```

#### 3.6.5 comment_likes (댓글 좋아요)

```sql
CREATE TABLE comment_likes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 좋아요 ID (UUID)
  comment_id VARCHAR2(36) NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uk_comment_user_like UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
```

---

### 3.7 시스템 도메인 (System Domain)

#### 3.7.1 notifications (알림)

```sql
CREATE TABLE notifications (
  id VARCHAR2(36) PRIMARY KEY,                    -- 알림 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR2(50) NOT NULL,
  title VARCHAR2(200) NOT NULL,
  content VARCHAR2(500) NOT NULL,
  link_url VARCHAR2(500),
  related_entity_type VARCHAR2(20),
  related_entity_id VARCHAR2(36),
  is_read CHAR(1) DEFAULT 'N' CHECK (is_read IN ('Y', 'N')),
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### 3.7.2 notification_settings (알림 설정)

> 사용자별 알림 수신 설정 관리

```sql
CREATE TABLE notification_settings (
  id VARCHAR2(36) PRIMARY KEY,                    -- 설정 ID (UUID)
  user_id VARCHAR2(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- 알림 채널 설정
  push_enabled CHAR(1) DEFAULT 'Y' CHECK (push_enabled IN ('Y', 'N')),
  email_enabled CHAR(1) DEFAULT 'N' CHECK (email_enabled IN ('Y', 'N')),
  sms_enabled CHAR(1) DEFAULT 'N' CHECK (sms_enabled IN ('Y', 'N')),
  
  -- 알림 유형별 설정
  vote_notification CHAR(1) DEFAULT 'Y' CHECK (vote_notification IN ('Y', 'N')),
  meeting_notification CHAR(1) DEFAULT 'Y' CHECK (meeting_notification IN ('Y', 'N')),
  expense_notification CHAR(1) DEFAULT 'Y' CHECK (expense_notification IN ('Y', 'N')),
  sns_notification CHAR(1) DEFAULT 'Y' CHECK (sns_notification IN ('Y', 'N')),
  system_notification CHAR(1) DEFAULT 'Y' CHECK (system_notification IN ('Y', 'N')),
  
  -- 방해금지 시간
  quiet_hours_enabled CHAR(1) DEFAULT 'N' CHECK (quiet_hours_enabled IN ('Y', 'N')),
  quiet_hours_start VARCHAR2(5),                  -- HH:MM 형식
  quiet_hours_end VARCHAR2(5),                    -- HH:MM 형식
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
```

#### 3.7.3 reports (신고)

```sql
CREATE TABLE reports (
  id VARCHAR2(36) PRIMARY KEY,                    -- 신고 ID (UUID)
  reporter_user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_entity_type VARCHAR2(20) NOT NULL CHECK (reported_entity_type IN ('USER', 'POST', 'COMMENT', 'CHALLENGE')),
  reported_entity_id VARCHAR2(36),
  reason_category VARCHAR2(50) NOT NULL CHECK (reason_category IN ('SPAM', 'ABUSE', 'FRAUD', 'INAPPROPRIATE', 'OTHER')),
  reason_detail VARCHAR2(500),
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'FALSE_REPORT')),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  admin_note VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_reports_reporter_user_id ON reports(reporter_user_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
```

#### 3.7.4 sessions (세션)

```sql
CREATE TABLE sessions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 세션 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR2(20) NOT NULL CHECK (session_type IN ('LOGIN', 'CHARGE', 'JOIN', 'WITHDRAW')),
  return_url VARCHAR2(500) NOT NULL,
  is_used CHAR(1) DEFAULT 'N' CHECK (is_used IN ('Y', 'N')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

#### 3.7.5 webhook_logs (Webhook 수신 로그)

```sql
CREATE TABLE webhook_logs (
  id VARCHAR2(36) PRIMARY KEY,                    -- 로그 ID (UUID)
  source VARCHAR2(30) NOT NULL CHECK (source IN ('TOSS', 'KAKAO', 'NAVER')),
  event_type VARCHAR2(50) NOT NULL,
  event_id VARCHAR2(100) UNIQUE,
  payload CLOB NOT NULL,
  is_processed CHAR(1) DEFAULT 'N' CHECK (is_processed IN ('Y', 'N', 'F')),
  processed_at TIMESTAMP,
  error_message VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_webhook_logs_source ON webhook_logs(source);
CREATE INDEX idx_webhook_logs_is_processed ON webhook_logs(is_processed);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at);
```

---

### 3.8 관리자 도메인 (Admin Domain)

#### 3.8.1 admins (관리자)

```sql
CREATE TABLE admins (
  id VARCHAR2(36) PRIMARY KEY,                    -- 관리자 ID (UUID)
  email VARCHAR2(100) NOT NULL UNIQUE,
  password_hash VARCHAR2(255) NOT NULL,
  name VARCHAR2(50) NOT NULL,
  role VARCHAR2(20) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SUPPORT')),
  is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_admins_role ON admins(role);
CREATE INDEX idx_admins_is_active ON admins(is_active);
```

#### 3.8.2 fee_policies (수수료 정책)

```sql
CREATE TABLE fee_policies (
  id VARCHAR2(36) PRIMARY KEY,                    -- 정책 ID (UUID)
  min_amount NUMBER(19) NOT NULL,
  max_amount NUMBER(19),
  rate NUMBER(5,4) NOT NULL,
  is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  created_by VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_fee_policies_is_active ON fee_policies(is_active);
```

#### 3.8.3 admin_logs (관리자 활동 로그)

```sql
CREATE TABLE admin_logs (
  id VARCHAR2(36) PRIMARY KEY,                    -- 로그 ID (UUID)
  admin_id VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  action VARCHAR2(50) NOT NULL,
  target_type VARCHAR2(20),
  target_id VARCHAR2(36),
  details CLOB,
  ip_address VARCHAR2(50),
  user_agent VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
```

#### 3.8.4 settlements (정산 관리)

```sql
CREATE TABLE settlements (
  id VARCHAR2(36) PRIMARY KEY,                    -- 정산 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  settlement_month VARCHAR2(7) NOT NULL,
  total_support NUMBER(19) NOT NULL,
  total_expense NUMBER(19) NOT NULL,
  total_fee NUMBER(19) NOT NULL,
  net_amount NUMBER(19) NOT NULL,
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  settled_at TIMESTAMP,
  settled_by VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT uk_settlement_challenge_month UNIQUE (challenge_id, settlement_month)
);

CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_settlement_month ON settlements(settlement_month);
```

#### 3.8.5 refunds (환불 관리)

```sql
CREATE TABLE refunds (
  id VARCHAR2(36) PRIMARY KEY,                    -- 환불 ID (UUID)
  account_id VARCHAR2(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  original_tx_id VARCHAR2(36) REFERENCES account_transactions(id) ON DELETE SET NULL,
  amount NUMBER(19) NOT NULL,
  reason_category VARCHAR2(50) NOT NULL CHECK (reason_category IN ('USER_REQUEST', 'OVERCHARGE', 'SERVICE_ERROR', 'CHALLENGE_CLOSED')),
  reason_detail VARCHAR2(500),
  status VARCHAR2(20) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED')),
  requested_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  rejected_by VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  rejected_at TIMESTAMP,
  reject_reason VARCHAR2(500),
  pg_refund_id VARCHAR2(100),
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_refunds_account_id ON refunds(account_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_created_at ON refunds(created_at);
```

---

## 4. MyBatis 구현 예제

### 4.1 Optimistic Lock 패턴

```xml
<!-- ChallengeMapper.xml -->
<mapper namespace="com.woorido.mapper.ChallengeMapper">

  <!-- Version과 함께 조회 -->
  <select id="selectByIdWithVersion" resultType="Challenge">
    SELECT id, name, current_members, max_members, version, balance
    FROM challenges
    WHERE id = #{id}
      AND deleted_at IS NULL
  </select>

  <!-- Version 검증하며 회원 수 증가 -->
  <update id="incrementMembers">
    UPDATE challenges
    SET current_members = current_members + 1,
        version = version + 1,
        updated_at = SYSTIMESTAMP
    WHERE id = #{challengeId}
      AND version = #{version}
      AND current_members < max_members
      AND deleted_at IS NULL
  </update>

  <!-- 실패 시 affected rows = 0 -->

</mapper>
```

```java
@Mapper
public interface ChallengeMapper {
    Challenge selectByIdWithVersion(@Param("id") String id);
    int incrementMembers(@Param("challengeId") String challengeId, @Param("version") Long version);
}
```

### 4.2 Pessimistic Lock 패턴

```xml
<!-- AccountMapper.xml -->
<mapper namespace="com.woorido.mapper.AccountMapper">

  <!-- FOR UPDATE로 Row Lock 획득 -->
  <select id="selectAccountForUpdate" resultType="Account">
    SELECT id, user_id, balance, locked_balance, version
    FROM accounts
    WHERE id = #{accountId}
    FOR UPDATE WAIT 3  <!-- 3초 대기 후 ORA-00054 발생 -->
  </select>

  <!-- 잔액 업데이트 -->
  <update id="updateBalance">
    UPDATE accounts
    SET balance = #{newBalance},
        version = version + 1,
        updated_at = SYSTIMESTAMP
    WHERE id = #{accountId}
  </update>

  <!-- 락 잔액 업데이트 -->
  <update id="updateLockedBalance">
    UPDATE accounts
    SET locked_balance = #{newLockedBalance},
        version = version + 1,
        updated_at = SYSTIMESTAMP
    WHERE id = #{accountId}
  </update>

</mapper>
```

### 4.3 Idempotency 검증

```xml
<!-- AccountTransactionMapper.xml -->
<mapper namespace="com.woorido.mapper.AccountTransactionMapper">

  <!-- 중복 요청 검사 -->
  <select id="existsByIdempotencyKey" resultType="boolean">
    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM account_transactions
    WHERE idempotency_key = #{idempotencyKey}
  </select>

  <!-- 트랜잭션 기록 삽입 -->
  <insert id="insert">
    INSERT INTO account_transactions (
      id, account_id, type, amount,
      balance_before, balance_after,
      locked_before, locked_after,
      idempotency_key, description,
      payment_method, payment_gateway_tx_id,
      created_at
    ) VALUES (
      SYS_GUID(), #{accountId}, #{type}, #{amount},
      #{balanceBefore}, #{balanceAfter},
      #{lockedBefore}, #{lockedAfter},
      #{idempotencyKey}, #{description},
      #{paymentMethod}, #{paymentGatewayTxId},
      SYSTIMESTAMP
    )
  </insert>

</mapper>
```

### 4.4 Atomic Counter Operations

```xml
<!-- PostMapper.xml -->
<mapper namespace="com.woorido.mapper.PostMapper">

  <!-- 좋아요 수 증가 -->
  <update id="incrementLikeCount">
    UPDATE posts
    SET like_count = like_count + 1
    WHERE id = #{postId}
  </update>

  <!-- 좋아요 수 감소 (최소 0) -->
  <update id="decrementLikeCount">
    UPDATE posts
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = #{postId}
  </update>

  <!-- 댓글 수 증가 -->
  <update id="incrementCommentCount">
    UPDATE posts
    SET comment_count = comment_count + 1
    WHERE id = #{postId}
  </update>

  <!-- 댓글 수 감소 -->
  <update id="decrementCommentCount">
    UPDATE posts
    SET comment_count = GREATEST(comment_count - 1, 0)
    WHERE id = #{postId}
  </update>

</mapper>
```

### 4.5 Soft Delete 조회

```xml
<!-- ChallengeMapper.xml -->
<mapper namespace="com.woorido.mapper.ChallengeMapper">

  <!-- 활성 챌린지만 조회 -->
  <select id="selectActiveById" resultType="Challenge">
    SELECT * FROM challenges
    WHERE id = #{id}
      AND deleted_at IS NULL
  </select>

  <!-- 삭제된 챌린지 정보 조회 (404 응답용) -->
  <select id="selectDeletedInfo" resultType="DeletedChallengeInfo">
    SELECT id, name, deleted_at, dissolution_reason
    FROM challenges
    WHERE id = #{id}
      AND deleted_at IS NOT NULL
  </select>

  <!-- 내 챌린지 목록 (삭제 포함 옵션) -->
  <select id="selectMyChallengeList" resultType="Challenge">
    SELECT c.*
    FROM challenges c
    INNER JOIN challenge_members cm ON c.id = cm.challenge_id
    WHERE cm.user_id = #{userId}
      AND cm.left_at IS NULL
      <if test="includeDeleted == false">
        AND c.deleted_at IS NULL
      </if>
    ORDER BY c.created_at DESC
  </select>

  <!-- Soft Delete 실행 -->
  <update id="softDelete">
    UPDATE challenges
    SET deleted_at = SYSTIMESTAMP,
        dissolution_reason = #{reason},
        updated_at = SYSTIMESTAMP
    WHERE id = #{challengeId}
      AND deleted_at IS NULL
  </update>

</mapper>
```

---

## 5. Spring Boot 서비스 패턴

### 5.1 Optimistic Lock 재시도 패턴

```java
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;
    private final ChallengeMemberMapper challengeMemberMapper;
    private final AccountService accountService;

    @Transactional
    @Retryable(
        value = {OptimisticLockException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public void joinChallenge(String userId, String challengeId) {
        // 1. Version과 함께 챌린지 조회
        Challenge challenge = challengeMapper.selectByIdWithVersion(challengeId);

        if (challenge == null) {
            throw new ChallengeNotFoundException("챌린지를 찾을 수 없습니다.");
        }

        // 2. 이미 가입했는지 확인
        if (challengeMemberMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new AlreadyJoinedException("이미 가입한 챌린지입니다.");
        }

        // 3. 보증금 차감 (Pessimistic Lock)
        accountService.lockDeposit(userId, challenge.getDepositAmount());

        // 4. 챌린지 회원 수 증가 (Optimistic Lock)
        int updated = challengeMapper.incrementMembers(challengeId, challenge.getVersion());

        if (updated == 0) {
            // Version 충돌 발생 → 재시도
            throw new OptimisticLockException("동시 가입이 발생했습니다. 재시도 중...");
        }

        // 5. 회원 추가
        ChallengeMember member = ChallengeMember.builder()
            .challengeId(challengeId)
            .userId(userId)
            .role("FOLLOWER")
            .depositStatus("LOCKED")
            .depositLockedAt(LocalDateTime.now())
            .build();

        challengeMemberMapper.insert(member);
    }
}
```

### 5.2 Pessimistic Lock + Idempotency 패턴

```java
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountMapper accountMapper;
    private final AccountTransactionMapper accountTransactionMapper;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AccountTransaction charge(
        String accountId,
        long amount,
        String idempotencyKey,
        String paymentMethod,
        String gatewayTxId
    ) {
        // 1. 중복 요청 검증
        if (accountTransactionMapper.existsByIdempotencyKey(idempotencyKey)) {
            throw new DuplicateTransactionException("이미 처리된 요청입니다.");
        }

        // 2. Pessimistic Lock으로 계좌 조회
        Account account = accountMapper.selectAccountForUpdate(accountId);

        if (account == null) {
            throw new AccountNotFoundException("계좌를 찾을 수 없습니다.");
        }

        // 3. 잔액 계산
        long balanceBefore = account.getBalance();
        long balanceAfter = balanceBefore + amount;

        // 4. 잔액 업데이트
        accountMapper.updateBalance(accountId, balanceAfter);

        // 5. 트랜잭션 기록 저장
        AccountTransaction transaction = AccountTransaction.builder()
            .accountId(accountId)
            .type("CHARGE")
            .amount(amount)
            .balanceBefore(balanceBefore)
            .balanceAfter(balanceAfter)
            .lockedBefore(account.getLockedBalance())
            .lockedAfter(account.getLockedBalance())
            .idempotencyKey(idempotencyKey)
            .description("계좌 충전")
            .paymentMethod(paymentMethod)
            .paymentGatewayTxId(gatewayTxId)
            .build();

        accountTransactionMapper.insert(transaction);

        return transaction;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void lockDeposit(String userId, long depositAmount) {
        Account account = accountMapper.selectByUserIdForUpdate(userId);

        if (account.getBalance() < depositAmount) {
            throw new InsufficientBalanceException("잔액이 부족합니다.");
        }

        long newBalance = account.getBalance() - depositAmount;
        long newLockedBalance = account.getLockedBalance() + depositAmount;

        accountMapper.updateBalance(account.getId(), newBalance);
        accountMapper.updateLockedBalance(account.getId(), newLockedBalance);

        accountTransactionMapper.insert(AccountTransaction.builder()
            .accountId(account.getId())
            .type("LOCK")
            .amount(depositAmount)
            .balanceBefore(account.getBalance())
            .balanceAfter(newBalance)
            .lockedBefore(account.getLockedBalance())
            .lockedAfter(newLockedBalance)
            .description("보증금 락")
            .build());
    }
}
```

### 5.3 원자성 보장 - 투표 승인 + 장부 기록

```java
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteMapper voteMapper;
    private final LedgerEntryMapper ledgerEntryMapper;
    private final ChallengeMapper challengeMapper;

    @Transactional(rollbackFor = Exception.class)
    public void approveVote(String voteId, String approverId) {
        // 1. 투표 조회
        Vote vote = voteMapper.selectById(voteId);

        if (vote == null) {
            throw new VoteNotFoundException("투표를 찾을 수 없습니다.");
        }

        if (!"PENDING".equals(vote.getStatus())) {
            throw new InvalidVoteStatusException("이미 처리된 투표입니다.");
        }

        // 2. 찬성 수 확인
        long approvalCount = voteMapper.countApprovals(voteId);

        if (approvalCount < vote.getRequiredApprovalCount()) {
            throw new InsufficientApprovalsException("필요한 찬성 수가 부족합니다.");
        }

        try {
            // 3. 투표 상태 변경
            vote.setStatus("APPROVED");
            vote.setApprovedAt(LocalDateTime.now());
            vote.setLedgerStatus("PENDING");
            voteMapper.update(vote);

            // 4. 장부 기록 생성
            LedgerEntry ledger = LedgerEntry.builder()
                .challengeId(vote.getChallengeId())
                .type("EXPENSE")
                .amount(vote.getAmount())
                .description(vote.getTitle())
                .createdBy(vote.getCreatedBy())
                .approvedBy(approverId)
                .approvedAt(LocalDateTime.now())
                .build();

            String ledgerId = ledgerEntryMapper.insert(ledger);

            // 5. 투표-장부 연결
            vote.setLedgerEntryId(ledgerId);
            vote.setLedgerStatus("RECORDED");
            voteMapper.update(vote);

            // 6. 챌린지 잔액 차감 (Pessimistic Lock)
            Challenge challenge = challengeMapper.selectByIdForUpdate(vote.getChallengeId());

            if (challenge.getBalance() < vote.getAmount()) {
                throw new InsufficientChallengeBalanceException("챌린지 잔액이 부족합니다.");
            }

            long newBalance = challenge.getBalance() - vote.getAmount();
            challengeMapper.updateBalance(challenge.getId(), newBalance);

        } catch (Exception e) {
            // 예외 발생 시 전체 롤백
            vote.setLedgerStatus("FAILED");
            voteMapper.update(vote);
            throw e;
        }
    }
}
```

### 5.4 Atomic Counter 패턴

```java
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;
    private final PostLikeMapper postLikeMapper;

    @Transactional
    public void toggleLike(String postId, String userId) {
        // 1. 이미 좋아요 했는지 확인
        boolean alreadyLiked = postLikeMapper.existsByPostAndUser(postId, userId);

        if (alreadyLiked) {
            // 좋아요 취소
            postLikeMapper.delete(postId, userId);
            postMapper.decrementLikeCount(postId);  // Atomic -1
        } else {
            // 좋아요 추가
            postLikeMapper.insert(PostLike.builder()
                .postId(postId)
                .userId(userId)
                .build());
            postMapper.incrementLikeCount(postId);  // Atomic +1
        }
    }

    @Transactional
    public void deletePost(String postId) {
        // 게시글 삭제 시 CASCADE로 좋아요/댓글 자동 삭제됨
        postMapper.deleteById(postId);
    }
}

// Scheduled Job - 매일 새벽 3시 카운터 정합성 검증
@Component
@RequiredArgsConstructor
public class CounterReconciliationJob {

    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void reconcileLikeCounts() {
        jdbcTemplate.execute("""
            UPDATE posts p
            SET like_count = (
                SELECT COUNT(*) FROM post_likes pl
                WHERE pl.post_id = p.id
            )
            WHERE like_count != (
                SELECT COUNT(*) FROM post_likes pl
                WHERE pl.post_id = p.id
            )
        """);
    }

    @Scheduled(cron = "0 10 3 * * *")
    @Transactional
    public void reconcileCommentCounts() {
        jdbcTemplate.execute("""
            UPDATE posts p
            SET comment_count = (
                SELECT COUNT(*) FROM comments c
                WHERE c.post_id = p.id
            )
            WHERE comment_count != (
                SELECT COUNT(*) FROM comments c
                WHERE c.post_id = p.id
            )
        """);
    }
}
```

### 5.5 Soft Delete 처리

```java
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;

    public ChallengeDetailResponse getChallengeDetail(String challengeId) {
        // 1. 활성 챌린지 조회
        Challenge challenge = challengeMapper.selectActiveById(challengeId);

        if (challenge != null) {
            return ChallengeDetailResponse.from(challenge);
        }

        // 2. 삭제된 챌린지인지 확인
        DeletedChallengeInfo deletedInfo = challengeMapper.selectDeletedInfo(challengeId);

        if (deletedInfo != null) {
            // HTTP 404 + 삭제 정보 반환
            throw new ChallengeDeletedException(
                "이 챌린지는 " + deletedInfo.getDeletedAt() + "에 해산되었습니다.",
                deletedInfo
            );
        }

        // 3. 존재하지 않는 챌린지
        throw new ChallengeNotFoundException("챌린지를 찾을 수 없습니다.");
    }

    public List<ChallengeListItem> getMyChallengeList(String userId, boolean includeDeleted) {
        return challengeMapper.selectMyChallengeList(userId, includeDeleted)
            .stream()
            .map(challenge -> ChallengeListItem.builder()
                .id(challenge.getId())
                .name(challenge.getName())
                .status(challenge.getDeletedAt() != null ? "dissolved" : "active")
                .deletedAt(challenge.getDeletedAt())
                .build())
            .collect(Collectors.toList());
    }

    @Transactional
    public void dissolveChallenge(String challengeId, String reason) {
        Challenge challenge = challengeMapper.selectActiveById(challengeId);

        if (challenge == null) {
            throw new ChallengeNotFoundException("챌린지를 찾을 수 없습니다.");
        }

        // Soft Delete 실행
        challengeMapper.softDelete(challengeId, reason);
    }
}

// Exception Handler
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ChallengeDeletedException.class)
    public ResponseEntity<ErrorResponse> handleChallengeDeleted(ChallengeDeletedException e) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.builder()
                .error("CHALLENGE_DELETED")
                .message(e.getMessage())
                .deletedAt(e.getDeletedInfo().getDeletedAt())
                .dissolutionReason(e.getDeletedInfo().getDissolutionReason())
                .build());
    }
}
```

---

## 6. 인덱스 전략

### 6.1 조회 성능 최적화

```sql
-- 사용자 조회
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 계좌 조회
CREATE INDEX idx_accounts_user ON accounts(user_id);

-- 계좌 트랜잭션 조회 (최신순)
CREATE INDEX idx_acct_tx_account_created ON account_transactions(account_id, created_at DESC);
CREATE INDEX idx_acct_tx_type ON account_transactions(type, created_at DESC);
CREATE INDEX idx_acct_tx_idempotency ON account_transactions(idempotency_key);

-- 챌린지 조회
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_category ON challenges(category, created_at DESC);
CREATE INDEX idx_challenges_public ON challenges(is_public, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_challenges_deleted ON challenges(deleted_at DESC);

-- 챌린지 멤버 조회
CREATE INDEX idx_challenge_members_challenge ON challenge_members(challenge_id, joined_at DESC);
CREATE INDEX idx_challenge_members_user ON challenge_members(user_id, joined_at DESC);
CREATE INDEX idx_challenge_members_active ON challenge_members(challenge_id) WHERE left_at IS NULL;

-- 장부 조회
CREATE INDEX idx_ledger_challenge_created ON ledger_entries(challenge_id, created_at DESC);
CREATE INDEX idx_ledger_type ON ledger_entries(type, created_at DESC);

-- 투표 조회
CREATE INDEX idx_votes_challenge_created ON votes(challenge_id, created_at DESC);
CREATE INDEX idx_votes_status ON votes(status, created_at DESC);
CREATE INDEX idx_votes_ledger ON votes(ledger_entry_id);

-- 게시글 조회
CREATE INDEX idx_posts_challenge_created ON posts(challenge_id, created_at DESC);
CREATE INDEX idx_posts_creator ON posts(created_by, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- 좋아요 조회
CREATE INDEX idx_likes_post ON post_likes(post_id, created_at DESC);
CREATE INDEX idx_likes_user ON post_likes(user_id, created_at DESC);

-- 댓글 조회
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);

-- 알림 조회
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);

-- 세션 조회
CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);  -- Cleanup job용
```

### 6.2 복합 인덱스 활용

```sql
-- 활성 공개 챌린지 검색
CREATE INDEX idx_challenges_public_active ON challenges(is_public, deleted_at, created_at DESC);

-- 내 활성 챌린지 목록
CREATE INDEX idx_challenge_members_user_active ON challenge_members(user_id, left_at, joined_at DESC);

-- 미읽은 알림 조회
CREATE INDEX idx_notifications_unread_created ON notifications(user_id, is_read, created_at DESC);
```

---

## 7. 적용 체크리스트

### 백엔드 개발자가 확인해야 할 사항:

#### ✅ 스키마 생성
- [ ] 모든 테이블 생성 (users, accounts, challenges, posts 등)
- [ ] `version` 컬럼 추가 (challenges, accounts)
- [ ] `deleted_at` 컬럼 추가 (challenges - Soft Delete)
- [ ] `account_transactions` 테이블 생성 (idempotency_key 포함)
- [ ] `sessions` 테이블 생성 (returnUrl 저장용)
- [ ] `ledger_entry_id`, `ledger_status` 컬럼 추가 (votes)

#### ✅ 제약조건 설정
- [ ] CHECK 제약조건 추가 (balance >= 0, current_members <= max_members 등)
- [ ] CASCADE 정책 설정 (ON DELETE CASCADE/RESTRICT/SET NULL)
- [ ] UNIQUE 제약조건 검증

#### ✅ 인덱스 생성
- [ ] 조회용 인덱스 생성 (created_at DESC)
- [ ] 복합 인덱스 생성 (user_id, created_at)
- [ ] Partial Index 생성 (WHERE deleted_at IS NULL)

#### ✅ MyBatis 구현
- [ ] Optimistic Lock 쿼리 작성 (WHERE version = #{version})
- [ ] Pessimistic Lock 쿼리 작성 (FOR UPDATE WAIT 3)
- [ ] Atomic Operations 쿼리 작성 (INCREMENT/DECREMENT)
- [ ] Idempotency 검증 쿼리 작성

#### ✅ Spring Boot 서비스
- [ ] @Transactional 어노테이션 추가
- [ ] @Retryable 어노테이션 추가 (Optimistic Lock)
- [ ] Isolation Level 설정 (READ_COMMITTED)
- [ ] 예외 처리 (@ControllerAdvice)

#### ✅ Scheduled Job
- [ ] 카운터 정합성 검증 Job 구현 (매일 새벽 3시)
- [ ] 만료 세션 삭제 Job 구현

#### ✅ 테스트
- [ ] 동시성 테스트 (JMeter/Gatling)
- [ ] Optimistic Lock 재시도 테스트
- [ ] Pessimistic Lock 대기 테스트
- [ ] Idempotency 중복 방지 테스트
- [ ] Soft Delete 404 응답 테스트

---

## 8. Django 연동 (트랜잭션 없음)

### 8.1 Spring Boot → Django 데이터 전송

```java
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final ChallengeMapper challengeMapper;
    private final UserMapper userMapper;

    public List<String> getRecommendedChallenges(String userId) {
        // 1. Spring Boot가 Oracle DB에서 데이터 조회
        User user = userMapper.selectById(userId);
        List<Challenge> userHistory = challengeMapper.selectUserHistory(userId);

        // 2. Django로 전송할 JSON 생성
        Map<String, Object> requestData = Map.of(
            "user_id", userId,
            "user_history", userHistory.stream()
                .map(challenge -> Map.of(
                    "challenge_id", challenge.getId(),
                    "category", challenge.getCategory(),
                    "monthly_fee", challenge.getMonthlyFee()
                ))
                .collect(Collectors.toList())
        );

        // 3. Django API 호출 (HTTP POST)
        RecommendationResponse response = restTemplate.postForObject(
            "http://django-service:8001/api/recommend",
            requestData,
            RecommendationResponse.class
        );

        // 4. Django 분석 결과 반환
        return response.getRecommendedChallengeIds();
    }
}
```

### 8.2 Django 서비스 (DB 연결 없음)

```python
# Django views.py (DB 연결 없음)
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np

@api_view(['POST'])
def recommend_challenge(request):
    """
    챌린지 추천 알고리즘 (DB 연결 없음)
    Spring Boot가 보낸 JSON 데이터만 처리
    """
    user_data = request.data

    # pandas DataFrame 생성
    df = pd.DataFrame(user_data['user_history'])

    # 협업 필터링 알고리즘 실행
    recommendations = collaborative_filtering(df)

    # Spring Boot로 결과 반환
    return Response({
        'recommended_challenge_ids': recommendations.tolist(),
        'confidence_score': 0.85
    })

@api_view(['POST'])
def detect_anomaly(request):
    """
    이상 거래 탐지 (통계 분석만)
    """
    transactions = pd.DataFrame(request.data['transactions'])

    # Z-Score 기반 이상치 탐지
    mean = transactions['amount'].mean()
    std = transactions['amount'].std()
    transactions['z_score'] = (transactions['amount'] - mean) / std

    anomalies = transactions[transactions['z_score'].abs() > 3]

    return Response({
        'anomaly_count': len(anomalies),
        'anomaly_ids': anomalies['id'].tolist(),
        'risk_level': 'HIGH' if len(anomalies) > 5 else 'LOW'
    })
```

---

## 9. 요약

### 설계 원칙

1. **모든 트랜잭션**: Spring Boot에서만 처리
2. **Django**: 분석 전용 (DB 연결 없음)
3. **동시성 제어**: Optimistic + Pessimistic Lock 조합
4. **Idempotency**: 모든 금융 트랜잭션에 적용
5. **Soft Delete**: 챌린지(challenges) 테이블에 적용
6. **CASCADE 정책**: 명시적 정의
7. **Hybrid returnUrl**: 돈은 DB Session, 의견은 Frontend
8. **Django 역할**: 순수 분석 엔진 (DB 연결 없음)

### 테이블 요약 (총 32개)

| 도메인 | 테이블 수 | 테이블명 |
|--------|----------|----------|
| 사용자 | 4 | users, accounts, account_transactions, user_scores |
| 챌린지 | 2 | challenges, challenge_members |
| 모임 | 3 | meetings, meeting_votes, meeting_vote_records |
| 지출 | 6 | expense_requests, expense_votes, expense_vote_records, payment_barcodes, ledger_entries, payment_logs |
| 일반 투표 | 2 | general_votes, general_vote_records |
| SNS | 5 | posts, post_images, post_likes, comments, comment_likes |
| 시스템 | 5 | notifications, notification_settings, reports, sessions, webhook_logs |
| 관리자 | 5 | admins, fee_policies, admin_logs, settlements, refunds |

### 트랜잭션 오류 해결

| 오류 유형 | 해결 방법 | 적용 테이블 |
|----------|----------|-------------|
| Race Condition | Optimistic Lock | challenges, accounts |
| Lost Update | Pessimistic Lock | accounts |
| Atomicity Violation | Single @Transactional | expense_votes, ledger_entries |
| Counter Drift | Atomic Operations | posts |
| Missing CASCADE | Explicit ON DELETE | 모든 FK |

---

**최종 수정**: 2026-01-15
**기준 문서**: [DB_Schema_1.0.0.md](./DB_Schema_1.0.0.md)
**변경 이력**: [ERD_UPDATE_BACKLOG.md](./ERD_UPDATE_BACKLOG.md)
**검토 필요**: Spring Boot 팀, Oracle DBA