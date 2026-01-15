# WOORIDO ERD - 정기 모임 도메인
**meetings, meeting_attendees, votes, vote_records**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)

---

## 1. 정기 모임 (meetings)

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

**모임 상태:**
| 상태 | 설명 |
|------|------|
| `PLANNED` | 투표 진행 중 |
| `CONFIRMED` | 과반수 참석 → 모임 확정 |
| `COMPLETED` | 모임 완료 |
| `CANCELLED` | 과반수 미달 → 자동 취소 |

---

## 2. 모임 참석자 (meeting_attendees)

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

**참석 상태:**
| 상태 | 설명 | 점수 반영 |
|------|------|----------|
| `REGISTERED` | 참석 등록만 함 | ❌ |
| `ATTENDED` | 실제 참석 완료 | ✅ +0.09점 |
| `NO_SHOW` | 등록 후 불참 | ❌ |

---

## 3. 투표 (votes)

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

**투표 타입 및 승인 조건:**
| 타입 | 설명 | 발의자 | 승인 조건 |
|------|------|--------|----------|
| `EXPENSE` | 지출 요청 | 리더 | 과반수 (50%+1) |
| `KICK` | 멤버 강제 퇴출 | 모두 | 70% 이상 |
| `MEETING_ATTENDANCE` | 정기 모임 참석 | 리더 | 과반수 (50%+1) |
| `LEADER_KICK` | 리더 강퇴 | 팔로워 | 70% 이상 |
| `DISSOLVE` | 챌린지 종료 | 리더 | 전원 (100%) |

---

## 4. 투표 기록 (vote_records)

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

**투표 선택:**
| 선택 | 설명 | 사용처 |
|------|------|--------|
| `APPROVE` | 찬성 | EXPENSE, KICK, LEADER_KICK, DISSOLVE |
| `REJECT` | 반대 | EXPENSE, KICK, LEADER_KICK, DISSOLVE |
| `ATTEND` | 참석 | MEETING_ATTENDANCE |
| `ABSENT` | 불참 | MEETING_ATTENDANCE |

---

**최종 수정**: 2026-01-09
