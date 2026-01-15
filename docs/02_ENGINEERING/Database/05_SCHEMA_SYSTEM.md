# WOORIDO ERD - 시스템 도메인
**notifications, notification_settings, reports, sessions, webhook_logs**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)

---

## 1. 알림 (notifications)

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

---

## 2. 알림 설정 (notification_settings)

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

---

## 3. 신고 (reports)

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

---

## 4. 세션 (sessions)

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

---

## 5. Webhook 로그 (webhook_logs)

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

**최종 수정**: 2026-01-15
**기준 문서**: DB_Schema_1.0.0.md
