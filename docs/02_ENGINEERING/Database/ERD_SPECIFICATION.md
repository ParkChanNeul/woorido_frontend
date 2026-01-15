# WOORIDO ERD Specification
**백엔드 개발자용 데이터베이스 설계 명세서**

**작성일**: 2026-01-13
**대상 DBMS**: Oracle 21c XE
**ORM**: mybatis-spring-boot-starter 3.0.3
**트랜잭션 관리**: Spring Boot 3.2.3 (@Transactional)
**총 테이블**: 31개

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

### 3.1 사용자 (users)

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

### 3.2 계좌 (accounts)

```sql
CREATE TABLE accounts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 계좌 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 잔액 (동시성 제어 필수)
  balance NUMBER(19) DEFAULT 0 NOT NULL,
  locked_balance NUMBER(19) DEFAULT 0 NOT NULL,

  -- 동시성 제어
  version NUMBER(19) DEFAULT 0 NOT NULL,  -- Optimistic Lock

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

### 3.3 계좌 트랜잭션 (account_transactions)

```sql
CREATE TABLE account_transactions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 거래 ID (UUID)
  account_id VARCHAR2(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- 트랜잭션 정보
  type VARCHAR2(20) NOT NULL CHECK (type IN ('CHARGE', 'WITHDRAW', 'LOCK', 'UNLOCK', 'TRANSFER', 'ENTRY_FEE', 'SUPPORT')),  -- ENTRY_FEE, SUPPORT 추가
  amount NUMBER(19) NOT NULL,

  -- 잔액 스냅샷 (감사 추적)
  balance_before NUMBER(19) NOT NULL,
  balance_after NUMBER(19) NOT NULL,
  locked_before NUMBER(19) NOT NULL,
  locked_after NUMBER(19) NOT NULL,

  -- 중복 방지 (Idempotency)
  idempotency_key VARCHAR2(100) UNIQUE,  -- 중복 요청 검증

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

### 3.4 유저 점수 (user_scores)

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

> **P-046 참조**: 완주 인증(is_verified) 추가, 용어 매핑 주석 추가

```sql
CREATE TABLE challenges (
  id VARCHAR2(36) PRIMARY KEY,                    -- 챌린지 ID (UUID)
  name VARCHAR2(100) NOT NULL,
  description VARCHAR2(2000),
  category VARCHAR2(50) NOT NULL,

  -- 리더 (creator_id -> leaderId 용어 매핑)
  creator_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- 리더 활동 추적
  leader_last_active_at TIMESTAMP DEFAULT SYSTIMESTAMP,  -- 리더 최근 활동일
  leader_benefit_rate NUMBER(5,4) DEFAULT 0,  -- 리더 혜택 비율 (0.0500 = 5%)

  -- 멤버 관리 (동시성 제어) (멤버 = 리더 + 팔로워)
  current_members NUMBER(10) DEFAULT 1 NOT NULL,  -- -> currentMembers (전체 인원)
  min_members NUMBER(10) DEFAULT 3 NOT NULL,  -- P-046: 최소 인원 (기본 3명)
  max_members NUMBER(10) NOT NULL,  -- -> maxMembers
  version NUMBER(19) DEFAULT 0 NOT NULL,  -- Optimistic Lock

  -- P-046 ~ P-050: 챌린지 상태 (모집 중 -> 진행 중 자동 전환)
  status VARCHAR2(20) DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'ACTIVE', 'PAUSED', 'CLOSED')),
  activated_at TIMESTAMP,  -- ACTIVE 상태 전환 시점

  -- 재무 정보 (용어 매핑)
  balance NUMBER(19) DEFAULT 0 NOT NULL,  -- -> challengeAccountBalance (챌린지 금고 잔액)
  monthly_fee NUMBER(19) NOT NULL,  -- -> supportAmount (월 서포트)
  deposit_amount NUMBER(19) NOT NULL,  -- -> depositLock (보증금 락)

  -- 챌린지 설정
  is_public CHAR(1) DEFAULT 'Y' CHECK (is_public IN ('Y', 'N')),

  -- P-026 ~ P-028: 완주 인증 시스템 (1년 운영 시 부여)
  is_verified CHAR(1) DEFAULT 'N' CHECK (is_verified IN ('Y', 'N')),
  verified_at TIMESTAMP,  -- 완주 인증 시점

  -- 이미지
  thumbnail_url VARCHAR2(500),
  banner_url VARCHAR2(500),

  -- Soft Delete
  deleted_at TIMESTAMP,
  dissolution_reason VARCHAR2(500),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_members_capacity CHECK (current_members <= max_members),
  CONSTRAINT chk_challenge_balance CHECK (balance >= 0),
  CONSTRAINT chk_monthly_fee CHECK (monthly_fee >= 0),
  CONSTRAINT chk_deposit CHECK (deposit_amount >= 0)
);

-- 인덱스
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_category ON challenges(category, created_at DESC);
CREATE INDEX idx_challenges_public ON challenges(is_public, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_challenges_deleted ON challenges(deleted_at DESC);
CREATE INDEX idx_challenges_verified ON challenges(is_verified, created_at DESC);  -- 완주 인증 챌린지 조회용
CREATE INDEX idx_challenges_inactive_leader ON challenges(leader_last_active_at) WHERE deleted_at IS NULL;  -- 리더 미활동 조회용
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `creator_id` | `leaderId` (리더 ID) |
| `leader_last_active_at` | `leaderLastActiveAt` (리더 최근 활동일) |
| `leader_benefit_rate` | `leaderBenefitRate` (리더 혜택 비율) |
| `current_members` | `currentMembers` (현재 멤버 수, 리더+팔로워) |
| `balance` | `challengeAccountBalance` (챌린지 금고 잔액) |
| `monthly_fee` | `supportAmount` (월 서포트) |
| `deposit_amount` | `depositLock` (보증금 락) |
| `is_verified` | `isVerified` (완주 인증) |

### 3.5 챌린지 멤버 (challenge_members)

> **P-018 ~ P-021 참조**: 권한 박탈/복구 기능

```sql
CREATE TABLE challenge_members (
  id VARCHAR2(36) PRIMARY KEY,                    -- 멤버십 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- 역할 (MEMBER -> FOLLOWER 용어 변경)
  role VARCHAR2(20) DEFAULT 'FOLLOWER' CHECK (role IN ('LEADER', 'FOLLOWER')),

  -- 보증금 상태
  deposit_status VARCHAR2(20) DEFAULT 'NONE' CHECK (deposit_status IN ('NONE', 'LOCKED', 'USED', 'UNLOCKED')),
  deposit_locked_at TIMESTAMP,  -- 보증금 락 시점
  deposit_unlocked_at TIMESTAMP,  -- 보증금 락 해제 시점

  -- 입회비 정보
  entry_fee_amount NUMBER(19) DEFAULT 0,  -- 입회비 금액
  entry_fee_paid_at TIMESTAMP,  -- 입회비 납부일

  -- P-018 ~ P-021: 권한 박탈 시스템 (보증금 충당 시)
  privilege_status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (privilege_status IN ('ACTIVE', 'REVOKED')),
  privilege_revoked_at TIMESTAMP,  -- 권한 박탈 시점 (자동 탈퇴 60일 카운트 기준)

  -- 서포트 납부 상태
  last_support_paid_at TIMESTAMP,  -- 마지막 서포트 납입일
  total_support_paid NUMBER(19) DEFAULT 0 NOT NULL,  -- 총 서포트 납입액

  -- 타임스탬프
  joined_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  left_at TIMESTAMP,
  leave_reason VARCHAR2(50),  -- 탈퇴 사유 (NORMAL, KICKED, AUTO_LEAVE, CHALLENGE_CLOSED)

  -- 제약조건
  CONSTRAINT uk_challenge_user UNIQUE (challenge_id, user_id)
);

-- 인덱스
CREATE INDEX idx_challenge_members_challenge ON challenge_members(challenge_id, joined_at DESC);
CREATE INDEX idx_challenge_members_user ON challenge_members(user_id, joined_at DESC);
CREATE INDEX idx_challenge_members_active ON challenge_members(challenge_id) WHERE left_at IS NULL;
CREATE INDEX idx_challenge_members_revoked ON challenge_members(privilege_status, privilege_revoked_at) 
  WHERE privilege_status = 'REVOKED';  -- P-022: 자동 탈퇴 대상 조회용
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `deposit_status` | `depositStatus` (보증금 상태) |
| `entry_fee_amount` | `entryFeeAmount` (입회비 금액) |
| `last_support_paid_at` | `lastSupportPaidAt` (최근 서포트 납입) |
| `privilege_status` | `privilegeStatus` (권한 상태) |

### 3.6 장부 (ledger_entries)

> **P-029 참조**: PG 연동 사용처 자동 기록

```sql
CREATE TABLE ledger_entries (
  id VARCHAR2(36) PRIMARY KEY,                    -- 장부 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,

  -- 거래 정보
  type VARCHAR2(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'FEE_COLLECTION', 'DEPOSIT_LOCK', 'DEPOSIT_UNLOCK')),
  amount NUMBER(19) NOT NULL,
  description VARCHAR2(500) NOT NULL,

  -- 결재 정보
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  approved_by VARCHAR2(36) REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,

  -- 증빙 자료
  receipt_url VARCHAR2(500),

  -- P-029: 사용처 자동 기록 (PG 영수증 파싱, 토스페이/카카오페이 등 확장 가능)
  merchant_name VARCHAR2(100),       -- 상호명 (PG에서 자동 파싱, 수동 입력 불가)
  merchant_category VARCHAR2(50),    -- 업종 (식당, 카페, 숙박 등)
  pg_provider VARCHAR2(30),          -- PG사 (TOSSPAY, KAKAOPAY, NAVERPAY 등)
  pg_approval_number VARCHAR2(50),   -- PG 승인번호

  -- 리더 메모 (수정 가능)
  memo VARCHAR2(500),
  memo_updated_at TIMESTAMP,
  memo_updated_by VARCHAR2(36) REFERENCES users(id),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_ledger_amount CHECK (amount > 0)
);

CREATE INDEX idx_ledger_challenge_created ON ledger_entries(challenge_id, created_at DESC);
CREATE INDEX idx_ledger_type ON ledger_entries(type, created_at DESC);
CREATE INDEX idx_ledger_creator ON ledger_entries(created_by);
CREATE INDEX idx_ledger_merchant ON ledger_entries(merchant_name);  -- 사용처 검색용
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `merchant_name` | `merchantName` (상호명, PG 자동 입력) |
| `merchant_category` | `merchantCategory` (업종) |
| `pg_provider` | `pgProvider` (PG사) |
| `memo` | `memo` (리더 메모, 수정 가능) |

### 3.7 정기 모임 (meetings)

> **핵심 규칙**: 과반수 이상 참석해야만 모임 개최 (계주 먹튀 방지)
> 
> 정기 모임 투표는 **참석/불참 여부만** 투표합니다. 예상 비용은 기재하지 않습니다.

```sql
CREATE TABLE meetings (
  id VARCHAR2(36) PRIMARY KEY,                    -- 모임 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 모임 정보 (예상 비용 없음 - 지출은 건별 별도 투표)
  title VARCHAR2(200) NOT NULL,
  description VARCHAR2(2000),
  meeting_date TIMESTAMP NOT NULL,
  location VARCHAR2(500),

  -- 연결된 투표 (참석/불참 투표)
  vote_id VARCHAR2(36) REFERENCES votes(id),

  -- 상태 관리
  status VARCHAR2(20) DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_meeting_date CHECK (meeting_date > created_at)
);

CREATE INDEX idx_meetings_challenge_date ON meetings(challenge_id, meeting_date DESC);
CREATE INDEX idx_meetings_vote ON meetings(vote_id);
CREATE INDEX idx_meetings_status ON meetings(status, meeting_date);
```

### 3.8 모임 참석자 (meeting_attendees)

> **핵심 규칙**: 해당 모임에 참석한 멤버만 모임 관련 지출 투표에 참여 가능

```sql
CREATE TABLE meeting_attendees (
  id VARCHAR2(36) PRIMARY KEY,                    -- 참석자 ID (UUID)
  meeting_id VARCHAR2(36) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 참석 상태
  status VARCHAR2(20) DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'ATTENDED', 'NO_SHOW')),

  -- 타임스탬프
  registered_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  attended_at TIMESTAMP,

  -- 제약조건
  CONSTRAINT uk_meeting_user UNIQUE (meeting_id, user_id)
);

CREATE INDEX idx_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX idx_attendees_user ON meeting_attendees(user_id, registered_at DESC);
```

### 3.9 투표 (votes)

```sql
CREATE TABLE votes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 투표 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 투표 유형 (P-037 ~ P-041: RULE_CHANGE 제거 - MVP 범위 외)
  type VARCHAR2(30) NOT NULL CHECK (type IN ('EXPENSE', 'KICK', 'MEETING_ATTENDANCE', 'LEADER_KICK', 'DISSOLVE')),

  -- 투표 내용
  title VARCHAR2(200) NOT NULL,
  description VARCHAR2(2000),
  amount NUMBER(19),  -- EXPENSE 타입인 경우 필수
  target_user_id VARCHAR2(36) REFERENCES users(id),  -- KICK 타입인 경우 필수

  -- 정기 모임 관련 (P-042: 모임 관련 지출)
  meeting_id VARCHAR2(36) REFERENCES meetings(id),  -- EXPENSE일 때 모임 관련 지출인 경우: 참석자만 투표 가능
  meeting_title VARCHAR2(200),  -- MEETING_ATTENDANCE일 때 모임 제목
  meeting_date TIMESTAMP,  -- MEETING_ATTENDANCE일 때 모임 날짜
  meeting_location VARCHAR2(500),  -- MEETING_ATTENDANCE일 때 모임 장소

  -- 투표 설정
  required_approval_count NUMBER(10) NOT NULL,

  -- 투표 상태
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
  approved_at TIMESTAMP,

  -- 장부 연동 (원자성 보장, EXPENSE 타입만 사용)
  ledger_entry_id VARCHAR2(36) REFERENCES ledger_entries(id),  -- 투표-장부 연결
  ledger_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (ledger_status IN ('PENDING', 'RECORDED', 'FAILED')),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_vote_amount CHECK (
    (type = 'EXPENSE' AND amount IS NOT NULL AND amount > 0) OR
    (type != 'EXPENSE' AND amount IS NULL)
  ),
  CONSTRAINT chk_vote_target_user CHECK (
    (type = 'KICK' AND target_user_id IS NOT NULL) OR
    (type != 'KICK' AND target_user_id IS NULL)
  ),
  CONSTRAINT chk_vote_meeting CHECK (
    (type = 'MEETING_ATTENDANCE' AND meeting_title IS NOT NULL AND meeting_date IS NOT NULL) OR
    (type != 'MEETING_ATTENDANCE' AND meeting_title IS NULL)
  ),
  CONSTRAINT chk_approval_count CHECK (required_approval_count > 0)
);

CREATE INDEX idx_votes_challenge_created ON votes(challenge_id, created_at DESC);
CREATE INDEX idx_votes_status ON votes(status, created_at DESC);
CREATE INDEX idx_votes_creator ON votes(created_by);
CREATE INDEX idx_votes_ledger ON votes(ledger_entry_id);  -- 장부 연결 조회용
CREATE INDEX idx_votes_meeting ON votes(meeting_id);  -- 모임 관련 지출 조회용
```

### 3.8 투표 기록 (vote_records)

```sql
CREATE TABLE vote_records (
  id VARCHAR2(36) PRIMARY KEY,                    -- 기록 ID (UUID)
  vote_id VARCHAR2(36) NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 투표 선택 (P-039: ATTEND/ABSENT 추가 - 정기 모임 참석 투표용)
  choice VARCHAR2(20) NOT NULL CHECK (choice IN ('APPROVE', 'REJECT', 'ATTEND', 'ABSENT')),
  comment VARCHAR2(500),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT uk_vote_user UNIQUE (vote_id, user_id)
);

CREATE INDEX idx_vote_records_vote ON vote_records(vote_id, created_at DESC);
CREATE INDEX idx_vote_records_user ON vote_records(user_id, created_at DESC);
```

### 3.9 게시글 (posts)

```sql
CREATE TABLE posts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 게시글 ID (UUID)
  challenge_id VARCHAR2(36) REFERENCES challenges(id) ON DELETE CASCADE,  -- NULL이면 공개 피드
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 내용
  content VARCHAR2(4000) NOT NULL,

  -- 비정규화 카운터 (Atomic Operations)
  like_count NUMBER(10) DEFAULT 0 NOT NULL,
  comment_count NUMBER(10) DEFAULT 0 NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_like_count CHECK (like_count >= 0),
  CONSTRAINT chk_comment_count CHECK (comment_count >= 0)
);

CREATE INDEX idx_posts_challenge_created ON posts(challenge_id, created_at DESC);
CREATE INDEX idx_posts_creator ON posts(created_by, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);  -- 전체 피드용
```

### 3.10 게시글 이미지 (post_images)

```sql
CREATE TABLE post_images (
  id VARCHAR2(36) PRIMARY KEY,                    -- 이미지 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url VARCHAR2(500) NOT NULL,
  display_order NUMBER(10) NOT NULL,

  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  CONSTRAINT uk_post_image_order UNIQUE (post_id, display_order)
);

CREATE INDEX idx_post_images_post ON post_images(post_id, display_order);
```

### 3.11 좋아요 (post_likes)

```sql
CREATE TABLE post_likes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 좋아요 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  CONSTRAINT uk_post_user_like UNIQUE (post_id, user_id)
);

CREATE INDEX idx_likes_post ON post_likes(post_id, created_at DESC);
CREATE INDEX idx_likes_user ON post_likes(user_id, created_at DESC);
```

### 3.12 댓글 (comments)

```sql
CREATE TABLE comments (
  id VARCHAR2(36) PRIMARY KEY,                    -- 댓글 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL,

  -- 내용
  content VARCHAR2(1000) NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_creator ON comments(created_by, created_at DESC);
```

### 3.13 세션 (sessions) - 돈 관련 returnUrl 저장

```sql
CREATE TABLE sessions (
  id VARCHAR2(36) PRIMARY KEY,                    -- 세션 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 세션 정보
  return_url VARCHAR2(500) NOT NULL,
  session_type VARCHAR2(20) NOT NULL CHECK (session_type IN ('CHARGE', 'JOIN', 'WITHDRAW')),

  -- 상태 관리
  is_used CHAR(1) DEFAULT 'N' CHECK (is_used IN ('Y', 'N')),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,

  -- 인덱스
  CONSTRAINT chk_expires_after_created CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);  -- 만료 세션 정리용
```

### 3.14 알림 (notifications)

```sql
CREATE TABLE notifications (
  id VARCHAR2(36) PRIMARY KEY,                    -- 알림 ID (UUID)
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 알림 내용
  type VARCHAR2(50) NOT NULL,
  title VARCHAR2(200) NOT NULL,
  content VARCHAR2(500) NOT NULL,

  -- 링크
  link_url VARCHAR2(500),

  -- 상태
  is_read CHAR(1) DEFAULT 'N' CHECK (is_read IN ('Y', 'N')),
  read_at TIMESTAMP,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
```

### 3.15 신고 (reports)

> **P-031, P-032 정책 지원**: 신고 누적 시스템 및 허위 신고 처리
> - 1계정 1회 카운팅 (uk_reporter_entity 제약조건)
> - 20회 누적 시 자동 일시정지 (스프링 배치에서 처리)

```sql
CREATE TABLE reports (
  id VARCHAR2(36) PRIMARY KEY,                    -- 신고 ID (UUID)
  reporter_user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 신고 대상 (다형성 참조)
  reported_entity_type VARCHAR2(20) NOT NULL CHECK (reported_entity_type IN ('USER', 'POST', 'COMMENT')),
  reported_entity_id VARCHAR2(36),  -- POST/COMMENT ID (USER 신고 시 NULL)

  -- 신고 내용
  reason_category VARCHAR2(50) NOT NULL,  -- SPAM, ABUSE, FRAUD, INAPPROPRIATE 등
  reason_detail VARCHAR2(500),

  -- 처리 상태
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'FALSE_REPORT')),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR2(36) REFERENCES users(id),
  admin_note VARCHAR2(500),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건: 동일 신고자가 동일 대상을 중복 신고 불가
  CONSTRAINT uk_reporter_entity UNIQUE (reporter_user_id, reported_entity_type, COALESCE(reported_entity_id, reported_user_id))
);

-- 인덱스 (JOIN/GROUP BY 최적화)
CREATE INDEX idx_reports_reporter ON reports(reporter_user_id, created_at DESC);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id, status);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_entity ON reports(reported_entity_type, reported_entity_id);
```

**REST API 쿼리 예시:**
```sql
-- 특정 유저에 대한 신고 횟수 (GROUP BY)
SELECT reported_user_id, COUNT(*) as report_count
FROM reports
WHERE status = 'CONFIRMED'
GROUP BY reported_user_id
HAVING COUNT(*) >= 20;

-- 내가 한 신고 목록 (JOIN)
SELECT r.*, u.name as reported_user_name
FROM reports r
JOIN users u ON r.reported_user_id = u.id
WHERE r.reporter_user_id = #{userId}
ORDER BY r.created_at DESC;
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

### 핵심 변경사항

1. **Optimistic Locking**: `challenges.version`, `accounts.version` 추가
2. **Pessimistic Locking**: `FOR UPDATE WAIT 3` 적용
3. **Idempotency**: `account_transactions.idempotency_key` 추가
4. **Atomic Counters**: `like_count`, `comment_count` 직접 증감
5. **Soft Delete**: `challenges.deleted_at` 추가 + 404 처리
6. **CASCADE 정책**: 명시적 정의
7. **Hybrid returnUrl**: 돈은 DB Session, 의견은 Frontend
8. **Django 역할**: 순수 분석 엔진 (DB 연결 없음)

### 트랜잭션 오류 해결

| 오류 유형 | 해결 방법 | 적용 테이블 |
|----------|----------|-----------|
| Race Condition | Optimistic Lock | challenges, accounts |
| Lost Update | Pessimistic Lock | accounts |
| Atomicity Violation | Single @Transactional | votes, ledger_entries |
| Counter Drift | Atomic Operations | posts |
| Missing CASCADE | Explicit ON DELETE | 모든 FK |

---

## 7. 관리자 CMS 테이블

> 플랫폼 운영을 위한 관리자 전용 테이블

### 7.1 관리자 계정 (admins)

```sql
CREATE TABLE admins (
  id VARCHAR2(36) PRIMARY KEY,                    -- 관리자 ID (UUID)
  email VARCHAR2(100) UNIQUE NOT NULL,
  password_hash VARCHAR2(255) NOT NULL,
  name VARCHAR2(50) NOT NULL,
  
  -- 권한
  role VARCHAR2(20) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SUPPORT')),
  
  -- 상태
  is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  last_login_at TIMESTAMP,
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role, is_active);
```

### 7.2 수수료 정책 (fee_policies)

> 동적 수수료율 관리 (1%/3%/1.5% 등)

```sql
CREATE TABLE fee_policies (
  id VARCHAR2(36) PRIMARY KEY,                    -- 정책 ID (UUID)
  
  -- 금액 범위
  min_amount NUMBER(19) NOT NULL,  -- 최소 금액 (이상)
  max_amount NUMBER(19),           -- 최대 금액 (이하), NULL이면 상한 없음
  
  -- 수수료율 (소수점 4자리까지, 0.0300 = 3%)
  rate NUMBER(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  
  -- 상태
  is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  
  -- 감사
  created_by VARCHAR2(36) REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  
  -- 제약조건
  CONSTRAINT chk_fee_amount_range CHECK (min_amount >= 0 AND (max_amount IS NULL OR max_amount > min_amount))
);

CREATE INDEX idx_fee_policies_active ON fee_policies(is_active, min_amount);
```

**기본 데이터:**
```sql
-- 초기 수수료 정책 (PRODUCT_AGENDA 기준)
INSERT INTO fee_policies (id, min_amount, max_amount, rate, is_active) VALUES
  (SYS_GUID(), 0, 9999, 0.0100, 'Y'),        -- 소액: 1%
  (SYS_GUID(), 10000, 200000, 0.0300, 'Y'),  -- 일반: 3%
  (SYS_GUID(), 200001, NULL, 0.0150, 'Y');   -- 고액: 1.5%
```

### 7.3 신고 관리 (reports)

```sql
CREATE TABLE reports (
  id VARCHAR2(36) PRIMARY KEY,                    -- 신고 ID (UUID)
  
  -- 신고자
  reporter_id VARCHAR2(36) REFERENCES users(id) ON DELETE SET NULL,
  
  -- 신고 대상
  target_type VARCHAR2(20) NOT NULL CHECK (target_type IN ('USER', 'CHALLENGE', 'POST', 'COMMENT')),
  target_id VARCHAR2(36) NOT NULL,
  
  -- 신고 내용
  reason VARCHAR2(500) NOT NULL,
  evidence_url VARCHAR2(500),  -- 증거 첨부
  
  -- 처리 상태
  status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED')),
  
  -- 처리 결과
  handled_by VARCHAR2(36) REFERENCES admins(id),
  handled_at TIMESTAMP,
  action_taken VARCHAR2(500),  -- 조치 내용
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
```

### 7.4 관리자 활동 로그 (admin_logs)

> 감사 추적용 (누가 무엇을 언제 했는지)

```sql
CREATE TABLE admin_logs (
  id VARCHAR2(36) PRIMARY KEY,                    -- 로그 ID (UUID)
  
  -- 관리자
  admin_id VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  
  -- 활동 정보
  action VARCHAR2(50) NOT NULL,  -- CREATE_FEE_POLICY, RESOLVE_REPORT, VERIFY_CHALLENGE 등
  target_type VARCHAR2(20),
  target_id VARCHAR2(36),
  
  -- 상세 내용 (JSON)
  details CLOB,
  
  -- 접속 정보
  ip_address VARCHAR2(50),
  user_agent VARCHAR2(500),
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action, created_at DESC);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);
```

---

## 8. 요약

### 설계 원칙

1. **모든 트랜잭션**: Spring Boot에서만 처리
2. **Django**: 분석 전용 (DB 연결 없음)
3. **동시성 제어**: Optimistic + Pessimistic Lock 조합
4. **Idempotency**: 모든 금융 트랜잭션에 적용
5. **Soft Delete**: 챌린지(challenges) 테이블에 적용
6. **CASCADE 정책**: 명시적 정의
7. **Hybrid returnUrl**: 돈은 DB Session, 의견은 Frontend
8. **Django 역할**: 순수 분석 엔진 (DB 연결 없음)

### 트랜잭션 오류 해결

| 오류 유형 | 해결 방법 | 적용 테이블 |
|----------|----------|-----------|
| Race Condition | Optimistic Lock | challenges, accounts |
| Lost Update | Pessimistic Lock | accounts |
| Atomicity Violation | Single @Transactional | votes, ledger_entries |
| Counter Drift | Atomic Operations | posts |
| Missing CASCADE | Explicit ON DELETE | 모든 FK |


**최종 수정**: 2026-01-13
**작성자**: AI-Assisted Development Team
**검토 필요**: Spring Boot 팀, Oracle DBA