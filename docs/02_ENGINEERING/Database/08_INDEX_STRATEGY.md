# WOORIDO ERD - 인덱스 전략
**인덱스 정의 및 적용 체크리스트**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)

---

## 1. 조회 성능 최적화

### 1.1 사용자 도메인

```sql
-- 사용자 조회
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_suspended ON users(suspended_until);

-- 계좌 조회
CREATE INDEX idx_accounts_user ON accounts(user_id);

-- 계좌 트랜잭션 조회 (최신순)
CREATE INDEX idx_acct_tx_account_created ON account_transactions(account_id, created_at DESC);
CREATE INDEX idx_acct_tx_type ON account_transactions(type, created_at DESC);
CREATE INDEX idx_acct_tx_idempotency ON account_transactions(idempotency_key);

-- 유저 점수 조회
CREATE INDEX idx_user_scores_total ON user_scores(total_score DESC);
CREATE INDEX idx_user_scores_month ON user_scores(calculated_month);
```

### 1.2 챌린지 도메인

```sql
-- 챌린지 조회
CREATE INDEX idx_challenges_creator ON challenges(creator_id);
CREATE INDEX idx_challenges_category ON challenges(category, created_at DESC);
CREATE INDEX idx_challenges_public ON challenges(is_public, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_challenges_deleted ON challenges(deleted_at DESC);
CREATE INDEX idx_challenges_verified ON challenges(is_verified, created_at DESC);
CREATE INDEX idx_challenges_inactive_leader ON challenges(leader_last_active_at) WHERE deleted_at IS NULL;

-- 챌린지 멤버 조회
CREATE INDEX idx_challenge_members_challenge ON challenge_members(challenge_id, joined_at DESC);
CREATE INDEX idx_challenge_members_user ON challenge_members(user_id, joined_at DESC);
CREATE INDEX idx_challenge_members_active ON challenge_members(challenge_id) WHERE left_at IS NULL;
CREATE INDEX idx_challenge_members_revoked ON challenge_members(privilege_status, privilege_revoked_at) 
  WHERE privilege_status = 'REVOKED';

-- 장부 조회
CREATE INDEX idx_ledger_challenge_created ON ledger_entries(challenge_id, created_at DESC);
CREATE INDEX idx_ledger_type ON ledger_entries(type, created_at DESC);
CREATE INDEX idx_ledger_creator ON ledger_entries(created_by);
CREATE INDEX idx_ledger_merchant ON ledger_entries(merchant_name);
```

### 1.3 정기 모임 도메인

```sql
-- 모임 조회
CREATE INDEX idx_meetings_challenge_date ON meetings(challenge_id, meeting_date DESC);
CREATE INDEX idx_meetings_vote ON meetings(vote_id);
CREATE INDEX idx_meetings_status ON meetings(status, meeting_date);

-- 참석자 조회
CREATE INDEX idx_meeting_vote_records_vote ON meeting_vote_records(meeting_vote_id);
CREATE INDEX idx_meeting_vote_records_user ON meeting_vote_records(user_id, created_at DESC);

-- 지출 투표 조회
CREATE INDEX idx_expense_votes_request ON expense_votes(expense_request_id);
CREATE INDEX idx_expense_votes_status ON expense_votes(status, created_at DESC);

-- 투표 기록 조회
CREATE INDEX idx_expense_vote_records_vote ON expense_vote_records(expense_vote_id, created_at DESC);
CREATE INDEX idx_expense_vote_records_user ON expense_vote_records(user_id, created_at DESC);
```

### 1.4 SNS 도메인

```sql
-- 게시글 조회
CREATE INDEX idx_posts_challenge_created ON posts(challenge_id, created_at DESC);
CREATE INDEX idx_posts_creator ON posts(created_by, created_at DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- 이미지 조회
CREATE INDEX idx_post_images_post ON post_images(post_id, display_order);

-- 좋아요 조회
CREATE INDEX idx_likes_post ON post_likes(post_id, created_at DESC);
CREATE INDEX idx_likes_user ON post_likes(user_id, created_at DESC);

-- 댓글 조회
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_creator ON comments(created_by, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- 댓글 좋아요 조회
CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);
```

### 1.5 시스템 도메인

```sql
-- 알림 조회
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);

-- 세션 조회
CREATE INDEX idx_sessions_user ON sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);  -- Cleanup job용

-- 신고 조회
CREATE INDEX idx_reports_reporter ON reports(reporter_user_id, created_at DESC);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id, status);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_reports_entity ON reports(reported_entity_type, reported_entity_id);
```

### 1.6 관리자 도메인

```sql
-- 관리자 조회
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role, is_active);

-- 수수료 정책 조회
CREATE INDEX idx_fee_policies_active ON fee_policies(is_active, min_amount);

-- 관리자 로그 조회
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action, created_at DESC);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);
```

---

## 2. 복합 인덱스 활용

```sql
-- 활성 공개 챌린지 검색
CREATE INDEX idx_challenges_public_active ON challenges(is_public, deleted_at, created_at DESC);

-- 내 활성 챌린지 목록
CREATE INDEX idx_challenge_members_user_active ON challenge_members(user_id, left_at, joined_at DESC);

-- 미읽은 알림 조회
CREATE INDEX idx_notifications_unread_created ON notifications(user_id, is_read, created_at DESC);
```

---

## 3. 적용 체크리스트

### ✅ 스키마 생성
- [ ] 모든 테이블 생성 (users, accounts, challenges, posts 등)
- [ ] `version` 컬럼 추가 (challenges, accounts)
- [ ] `deleted_at` 컬럼 추가 (challenges - Soft Delete)
- [ ] `account_transactions` 테이블 생성 (idempotency_key 포함)
- [ ] `sessions` 테이블 생성 (returnUrl 저장용)
- [ ] `comment_likes` 테이블 생성 (댓글 좋아요)

### ✅ 제약조건 설정
- [ ] CHECK 제약조건 추가 (balance >= 0, current_members <= max_members 등)
- [ ] CASCADE 정책 설정 (ON DELETE CASCADE/RESTRICT/SET NULL)
- [ ] UNIQUE 제약조건 검증

### ✅ 인덱스 생성
- [ ] 조회용 인덱스 생성 (created_at DESC)
- [ ] 복합 인덱스 생성 (user_id, created_at)
- [ ] Partial Index 생성 (WHERE deleted_at IS NULL)

### ✅ MyBatis 구현
- [ ] Optimistic Lock 쿼리 작성 (WHERE version = #{version})
- [ ] Pessimistic Lock 쿼리 작성 (FOR UPDATE WAIT 3)
- [ ] Atomic Operations 쿼리 작성 (INCREMENT/DECREMENT)
- [ ] Idempotency 검증 쿼리 작성

### ✅ Spring Boot 서비스
- [ ] @Transactional 어노테이션 추가
- [ ] @Retryable 어노테이션 추가 (Optimistic Lock)
- [ ] Isolation Level 설정 (READ_COMMITTED)
- [ ] 예외 처리 (@ControllerAdvice)

### ✅ Scheduled Job
- [ ] 카운터 정합성 검증 Job 구현 (매일 새벽 3시)
- [ ] 만료 세션 삭제 Job 구현

### ✅ 테스트
- [ ] 동시성 테스트 (JMeter/Gatling)
- [ ] Optimistic Lock 재시도 테스트
- [ ] Pessimistic Lock 대기 테스트
- [ ] Idempotency 중복 방지 테스트
- [ ] Soft Delete 404 응답 테스트

---

**최종 수정**: 2026-01-13
**기준 문서**: DB_Schema_1.0.0.md

