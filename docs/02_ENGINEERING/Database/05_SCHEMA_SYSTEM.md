# WOORIDO ERD - 시스템 도메인
**sessions, notifications, reports**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)

---

## 1. 세션 (sessions) - 돈 관련 returnUrl 저장

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 세션 정보
  return_url VARCHAR(500) NOT NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('CHARGE', 'JOIN', 'WITHDRAW')),

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

**세션 타입:**
| 타입 | 설명 | 사용처 |
|------|------|--------|
| `CHARGE` | 충전 플로우 | `/charge` → 결제 게이트웨이 → `/charge/callback` |
| `JOIN` | 모임 가입 | `/challenge/:id` → 보증금 결제 → `/challenge/:id/detail` |
| `WITHDRAW` | 출금 요청 | `/account` → 인증 → `/account` |

---

## 2. 알림 (notifications)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 알림 내용
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content VARCHAR(500) NOT NULL,

  -- 링크
  link_url VARCHAR(500),

  -- 상태
  is_read CHAR(1) DEFAULT 'N' CHECK (is_read IN ('Y', 'N')),
  read_at TIMESTAMP,

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
```

**알림 타입 예시:**
| 타입 | 설명 |
|------|------|
| `VOTE_CREATED` | 새 투표 생성됨 |
| `VOTE_APPROVED` | 투표 승인됨 |
| `SUPPORT_DUE` | 서포트 납입일 안내 |
| `DEPOSIT_USED` | 보증금 충당됨 (권한 박탈) |
| `MEETING_CONFIRMED` | 정기 모임 확정됨 |

---

## 3. 신고 (reports)

> **P-031, P-032 정책 지원**: 신고 누적 시스템 및 허위 신고 처리
> - 1계정 1회 카운팅 (uk_reporter_entity 제약조건)
> - 20회 누적 시 자동 일시정지 (스프링 배치에서 처리)

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 신고 대상 (다형성 참조)
  reported_entity_type VARCHAR(20) NOT NULL CHECK (reported_entity_type IN ('USER', 'POST', 'COMMENT')),
  reported_entity_id UUID,  -- POST/COMMENT ID (USER 신고 시 NULL)

  -- 신고 내용
  reason_category VARCHAR(50) NOT NULL,  -- SPAM, ABUSE, FRAUD, INAPPROPRIATE 등
  reason_detail VARCHAR(500),

  -- 처리 상태
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED', 'FALSE_REPORT')),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  admin_note VARCHAR(500),

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

**신고 카테고리:**
| 카테고리 | 설명 |
|----------|------|
| `SPAM` | 스팸/광고 |
| `ABUSE` | 욕설/비방 |
| `FRAUD` | 사기/허위 정보 |
| `INAPPROPRIATE` | 부적절한 콘텐츠 |

**신고 처리 상태:**
| 상태 | 설명 |
|------|------|
| `PENDING` | 검토 대기 |
| `CONFIRMED` | 위반 확인됨 |
| `REJECTED` | 신고 기각 |
| `FALSE_REPORT` | 허위 신고 (신고자 1회 경고, 3회 7일 정지, 5회 영구 정지, P-055) |

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

**최종 수정**: 2026-01-09
