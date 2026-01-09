# WOORIDO ERD - 챌린지 도메인
**gye, gye_members, ledger_entries**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)

---

## 1. 챌린지 (gye)

> **P-046 참조**: 완주 인증(is_verified) 추가, 용어 매핑 주석 추가

```sql
CREATE TABLE gye (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(2000),
  category VARCHAR(50) NOT NULL,

  -- 모임장 (creator_id → leaderId 용어 매핑)
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- P-033 ~ P-035: 부리더 및 리더 활동 추적 (리더 승계 시스템)
  sub_leader_id UUID REFERENCES users(id),  -- 부리더 (점수 2위 자동 지정)
  leader_last_active_at TIMESTAMP DEFAULT SYSTIMESTAMP,  -- 리더 최근 활동일

  -- 팔로워 관리 (동시성 제어) (members → followers 용어 매핑)
  current_members NUMBER DEFAULT 1 NOT NULL,  -- → currentFollowers (리더 포함)
  min_members NUMBER DEFAULT 3 NOT NULL,  -- P-046: 최소 인원 (기본 3명)
  max_members NUMBER NOT NULL,  -- → maxFollowers
  version BIGINT DEFAULT 0 NOT NULL,  -- Optimistic Lock

  -- P-046 ~ P-050: 챌린지 상태 (모집 중 → 진행 중 자동 전환)
  status VARCHAR(20) DEFAULT 'RECRUITING' CHECK (status IN ('RECRUITING', 'ACTIVE', 'PAUSED', 'CLOSED')),
  activated_at TIMESTAMP,  -- ACTIVE 상태 전환 시점

  -- 재무 정보 (용어 매핑)
  balance BIGINT DEFAULT 0 NOT NULL,  -- → openBalance (오픈 잔액)
  monthly_fee BIGINT NOT NULL,  -- → supportAmount (월 서포트)
  deposit_amount BIGINT NOT NULL,  -- → depositLock (보증금 락)

  -- 모임 설정
  is_public CHAR(1) DEFAULT 'Y' CHECK (is_public IN ('Y', 'N')),
  join_approval_required CHAR(1) DEFAULT 'N' CHECK (join_approval_required IN ('Y', 'N')),

  -- P-026 ~ P-028: 완주 인증 시스템 (1년 운영 시 부여)
  is_verified CHAR(1) DEFAULT 'N' CHECK (is_verified IN ('Y', 'N')),
  verified_at TIMESTAMP,  -- 완주 인증 시점

  -- 이미지
  thumbnail_url VARCHAR(500),
  banner_url VARCHAR(500),

  -- Soft Delete
  deleted_at TIMESTAMP,
  dissolution_reason VARCHAR(500),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_members_capacity CHECK (current_members <= max_members),
  CONSTRAINT chk_gye_balance CHECK (balance >= 0),
  CONSTRAINT chk_monthly_fee CHECK (monthly_fee >= 0),
  CONSTRAINT chk_deposit CHECK (deposit_amount >= 0)
);

-- 인덱스
CREATE INDEX idx_gye_creator ON gye(creator_id);
CREATE INDEX idx_gye_category ON gye(category, created_at DESC);
CREATE INDEX idx_gye_public ON gye(is_public, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_gye_deleted ON gye(deleted_at DESC);
CREATE INDEX idx_gye_verified ON gye(is_verified, created_at DESC);  -- 완주 인증 챌린지 조회용
CREATE INDEX idx_gye_inactive_leader ON gye(leader_last_active_at) WHERE deleted_at IS NULL;  -- 리더 미활동 조회용
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `creator_id` | `leaderId` (리더 ID) |
| `sub_leader_id` | `subLeaderId` (부리더 ID, 점수 2위 자동 지정) |
| `leader_last_active_at` | `leaderLastActiveAt` (리더 최근 활동일) |
| `current_members` | `currentFollowers` (현재 팔로워 수) |
| `balance` | `challengeAccountBalance` (챌린지 어카운트 잔액) |
| `monthly_fee` | `supportAmount` (월 서포트) |
| `deposit_amount` | `depositLock` (보증금 락) |
| `is_verified` | `isVerified` (완주 인증) |

**챌린지 상태:**
| 상태 | 설명 |
|------|------|
| `RECRUITING` | 모집 중 - 최소 인원(3명) 충족 전 |
| `ACTIVE` | 진행 중 - 서포트 납입 시작 |
| `PAUSED` | 일시 중지 |
| `CLOSED` | 종료 |

---

## 2. 챌린지 멤버 (gye_members)

> **P-018 ~ P-021 참조**: 권한 박탈/복구 기능

```sql
CREATE TABLE gye_members (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  gye_id UUID NOT NULL REFERENCES gye(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- 역할 (MEMBER → FOLLOWER 용어 변경)
  role VARCHAR(20) DEFAULT 'FOLLOWER' CHECK (role IN ('LEADER', 'MANAGER', 'FOLLOWER')),

  -- 보증금 락 정보 (deposit → depositLock 용어 매핑)
  deposit_paid CHAR(1) DEFAULT 'N' CHECK (deposit_paid IN ('Y', 'N')),
  deposit_paid_at TIMESTAMP,
  deposit_locked_at TIMESTAMP,  -- 보증금 락 시점
  deposit_unlocked_at TIMESTAMP,  -- 보증금 락 해제 시점

  -- P-018 ~ P-021: 권한 박탈 시스템 (보증금 충당 시)
  privilege_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (privilege_status IN ('ACTIVE', 'REVOKED')),
  privilege_revoked_at TIMESTAMP,  -- 권한 박탈 시점 (자동 탈퇴 60일 카운트 기준)

  -- 서포트 납부 상태 (fee → support 용어 매핑)
  last_support_paid_at TIMESTAMP,  -- last_fee_paid_at → last_support_paid_at
  total_support_paid BIGINT DEFAULT 0 NOT NULL,  -- total_fees_paid → total_support_paid

  -- 타임스탬프
  joined_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  left_at TIMESTAMP,
  leave_reason VARCHAR(50),  -- 탈퇴 사유 (NORMAL, AUTO_LEAVE_DEPOSIT_NOT_RECHARGED, KICKED)

  -- 제약조건
  CONSTRAINT uk_gye_user UNIQUE (gye_id, user_id)
);

-- 인덱스
CREATE INDEX idx_members_gye ON gye_members(gye_id, joined_at DESC);
CREATE INDEX idx_members_user ON gye_members(user_id, joined_at DESC);
CREATE INDEX idx_members_active ON gye_members(gye_id) WHERE left_at IS NULL;
CREATE INDEX idx_members_revoked ON gye_members(privilege_status, privilege_revoked_at) 
  WHERE privilege_status = 'REVOKED';  -- P-022: 자동 탈퇴 대상 조회용
```

**컬럼 용어 매핑:**
| ERD 컬럼명 | 프론트엔드/API 용어 |
|-----------|-------------------|
| `deposit_*` | `depositLock` (보증금 락) |
| `last_support_paid_at` | `lastSupportPaidAt` (최근 서포트 납입) |
| `privilege_status` | `privilegeStatus` (권한 상태) |

**탈퇴 사유:**
| 값 | 설명 |
|----|------|
| `NORMAL` | 정상 탈퇴 |
| `AUTO_LEAVE_DEPOSIT_NOT_RECHARGED` | 보증금 미충전 60일 경과 자동 탈퇴 |
| `KICKED` | 강퇴 투표로 퇴출 |

---

## 3. 장부 (ledger_entries)

> **P-029 참조**: PG 연동 사용처 자동 기록

```sql
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  gye_id UUID NOT NULL REFERENCES gye(id) ON DELETE CASCADE,

  -- 거래 정보
  type VARCHAR(20) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'FEE_COLLECTION', 'DEPOSIT_LOCK', 'DEPOSIT_UNLOCK')),
  amount BIGINT NOT NULL,
  description VARCHAR(500) NOT NULL,

  -- 결재 정보
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,

  -- 증빙 자료
  receipt_url VARCHAR(500),

  -- P-029: 사용처 자동 기록 (PG 영수증 파싱, 토스페이/카카오페이 등 확장 가능)
  merchant_name VARCHAR(100),       -- 상호명 (PG에서 자동 파싱, 수동 입력 불가)
  merchant_category VARCHAR(50),    -- 업종 (식당, 카페, 숙박 등)
  pg_provider VARCHAR(30),          -- PG사 (TOSSPAY, KAKAOPAY, NAVERPAY 등)
  pg_approval_number VARCHAR(50),   -- PG 승인번호

  -- 리더 메모 (수정 가능)
  memo VARCHAR(500),
  memo_updated_at TIMESTAMP,
  memo_updated_by UUID REFERENCES users(id),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_ledger_amount CHECK (amount > 0)
);

CREATE INDEX idx_ledger_gye_created ON ledger_entries(gye_id, created_at DESC);
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

**장부 타입:**
| 타입 | 설명 |
|------|------|
| `INCOME` | 수입 (서포트 납입, 입회비 등) |
| `EXPENSE` | 지출 (모임 비용 등) |
| `FEE_COLLECTION` | 수수료 징수 |
| `DEPOSIT_LOCK` | 보증금 락 |
| `DEPOSIT_UNLOCK` | 보증금 해제 |

---

**최종 수정**: 2026-01-09
