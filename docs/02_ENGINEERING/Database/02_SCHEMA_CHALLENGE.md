# WOORIDO ERD - 챌린지 도메인
**challenges, challenge_members**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)

---

## 1. 챌린지 (challenges)

> **용어 변경**: `gye` → `challenges` (테이블명 변경)
> **P-046 참조**: 완주 인증(is_verified), 용어 매핑 주석 추가

```sql
CREATE TABLE challenges (
  id VARCHAR2(36) PRIMARY KEY,                    -- 챌린지 ID (UUID)
  name VARCHAR2(100) NOT NULL,                    -- 챌린지명
  description VARCHAR2(2000),                     -- 설명
  category VARCHAR2(50) NOT NULL,                 -- 카테고리

  -- 리더 정보 (creator_id → leaderId 용어 매핑)
  creator_id VARCHAR2(36) NOT NULL REFERENCES users(id),
  leader_last_active_at TIMESTAMP,                -- 리더 마지막 활동일
  leader_benefit_rate NUMBER(5,4) DEFAULT 0,      -- 리더 혜택 비율 (0.0500 = 5%)

  -- 멤버 관리 (동시성 제어)
  current_members NUMBER(10) NOT NULL DEFAULT 1,  -- 현재 멤버 수 (리더 포함)
  min_members NUMBER(10) NOT NULL DEFAULT 3,      -- 최소 멤버 수
  max_members NUMBER(10) NOT NULL,                -- 최대 멤버 수

  -- 재무 정보
  balance NUMBER(19) NOT NULL DEFAULT 0,          -- 챌린지 금고 잔액
  monthly_fee NUMBER(19) NOT NULL,                -- 월 서포트 금액
  deposit_amount NUMBER(19) NOT NULL,             -- 보증금

  -- 챌린지 상태
  status VARCHAR2(20) DEFAULT 'RECRUITING',       -- 상태
  activated_at TIMESTAMP,                         -- ACTIVE 전환 시점

  -- 완주 인증 (P-026 ~ P-028)
  is_verified CHAR(1) DEFAULT 'N',                -- 완주 인증 여부
  verified_at TIMESTAMP,                          -- 인증 시점

  -- 공개 설정
  is_public CHAR(1) DEFAULT 'Y',                  -- 공개 여부

  -- 이미지
  thumbnail_url VARCHAR2(500),
  banner_url VARCHAR2(500),

  -- Soft Delete
  deleted_at TIMESTAMP,
  dissolution_reason VARCHAR2(500),

  -- 동시성 제어
  version NUMBER(10) NOT NULL DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 인덱스
CREATE INDEX idx_challenges_creator_id ON challenges(creator_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_category ON challenges(category);
CREATE INDEX idx_challenges_is_public ON challenges(is_public);
```

**컬럼값 정의:**
| 컬럼 | 값 |
|------|-----|
| `category` | HOBBY, STUDY, EXERCISE, SAVINGS, TRAVEL, FOOD, CULTURE, OTHER |
| `status` | RECRUITING(모집중), IN_PROGRESS(진행중), COMPLETED(종료) |
| `is_verified` | Y(인증완료), N(미인증) |
| `is_public` | Y(공개), N(비공개) |

**컬럼 용어 매핑:**
| ERD 컬럼명 | API 용어 |
|-----------|----------|
| `creator_id` | `leaderId` |
| `current_members` | `currentMembers` |
| `balance` | `challengeAccountBalance` |
| `monthly_fee` | `supportAmount` |
| `deposit_amount` | `depositLock` |

---

## 2. 챌린지 멤버 (challenge_members)

> **용어 변경**: `gye_members` → `challenge_members`
> **P-018 ~ P-021 참조**: 권한 박탈/복구 기능

```sql
CREATE TABLE challenge_members (
  id VARCHAR2(36) PRIMARY KEY,                    -- 멤버십 ID (UUID)
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id),
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),

  -- 역할
  role VARCHAR2(20) DEFAULT 'FOLLOWER',           -- LEADER, FOLLOWER

  -- 보증금 상태
  deposit_status VARCHAR2(20) DEFAULT 'NONE',     -- 보증금 상태
  deposit_locked_at TIMESTAMP,                    -- 보증금 락 시점
  deposit_unlocked_at TIMESTAMP,                  -- 보증금 해제 시점

  -- 입회비
  entry_fee_amount NUMBER(19) DEFAULT 0,          -- 입회비 금액
  entry_fee_paid_at TIMESTAMP,                    -- 입회비 납부일

  -- 권한 상태 (P-018 ~ P-021)
  privilege_status VARCHAR2(20) DEFAULT 'ACTIVE', -- 권한 상태
  privilege_revoked_at TIMESTAMP,                 -- 권한 박탈 시점

  -- 서포트 납부 상태
  last_support_paid_at TIMESTAMP,                 -- 마지막 서포트 납입일
  total_support_paid NUMBER(19) DEFAULT 0,        -- 총 서포트 납입액

  -- 가입/탈퇴
  joined_at TIMESTAMP NOT NULL,                   -- 가입일
  left_at TIMESTAMP,                              -- 탈퇴일
  leave_reason VARCHAR2(50),                      -- 탈퇴 사유

  -- 제약조건
  CONSTRAINT uk_challenge_members_challenge_user UNIQUE (challenge_id, user_id)
);

-- 인덱스
CREATE INDEX idx_challenge_members_user_id ON challenge_members(user_id);
CREATE INDEX idx_challenge_members_role ON challenge_members(role);
```

**컬럼값 정의:**
| 컬럼 | 값 |
|------|-----|
| `role` | LEADER(리더), FOLLOWER(팔로워) |
| `deposit_status` | NONE(없음), LOCKED(락됨), USED(사용됨), UNLOCKED(해제됨) |
| `privilege_status` | ACTIVE(활성), REVOKED(박탈) |
| `leave_reason` | NORMAL(정상탈퇴), KICKED(강퇴), AUTO_LEAVE(자동탈퇴), CHALLENGE_CLOSED(챌린지종료) |

---

**최종 수정**: 2026-01-13
**기준 문서**: DB_Schema_1.0.0.md
