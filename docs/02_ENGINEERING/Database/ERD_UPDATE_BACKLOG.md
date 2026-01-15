# ERD_SPECIFICATION 업데이트 백로그

**생성일**: 2026-01-15
**기준 문서**: DB_Schema_1.0.0.md (v1.0.0)
**대상 문서**: ERD_SPECIFICATION.md

---

## 변경 요약

| 구분 | 항목 수 |
|------|--------|
| 신규 추가 테이블 | 14개 |
| 수정 테이블 | 6개 |
| 삭제 테이블 | 3개 |
| 총 테이블 수 | 31개 |

---

## 1. 삭제된 테이블 (통합 → 분리 구조 전환)

### 1.1 votes (통합 투표)
- **사유**: 도메인별 분리 설계로 전환
- **대체**: `expense_votes`, `general_votes`, `meeting_votes`

### 1.2 vote_records (통합 투표 기록)
- **사유**: 도메인별 분리 설계로 전환
- **대체**: `expense_vote_records`, `general_vote_records`, `meeting_vote_records`

### 1.3 meeting_attendees (모임 참석자)
- **사유**: 투표 기반 참석 시스템으로 전환
- **대체**: `meeting_votes`, `meeting_vote_records`

---

## 2. 신규 추가 테이블

### 2.1 모임 도메인
| 테이블명 | 설명 | DB_Schema 참조 |
|----------|------|----------------|
| meeting_votes | 모임 참석 투표 | 3.2 |
| meeting_vote_records | 모임 투표 기록 | 3.3 |

### 2.2 지출 도메인
| 테이블명 | 설명 | DB_Schema 참조 |
|----------|------|----------------|
| expense_requests | 지출 요청 | 4.1 |
| expense_votes | 지출 투표 | 4.2 |
| expense_vote_records | 지출 투표 기록 | 4.3 |
| payment_barcodes | 결제 바코드 | 4.4 |
| payment_logs | 결제 시도/실패 이력 | 4.6 |

### 2.3 일반 투표 도메인
| 테이블명 | 설명 | DB_Schema 참조 |
|----------|------|----------------|
| general_votes | 일반 투표 (강퇴/탄핵/해산) | 5.1 |
| general_vote_records | 일반 투표 기록 | 5.2 |

### 2.4 SNS 도메인
| 테이블명 | 설명 | DB_Schema 참조 |
|----------|------|----------------|
| comment_likes | 댓글 좋아요 | 6.5 |

### 2.5 시스템 도메인
| 테이블명 | 설명 | DB_Schema 참조 |
|----------|------|----------------|
| webhook_logs | Webhook 수신 로그 | 7.4 |

### 2.6 관리자 도메인
| 테이블명 | 설명 | DB_Schema 참조 |
|----------|------|----------------|
| admins | 관리자 | 8.1 |
| fee_policies | 수수료 정책 | 8.2 |
| admin_logs | 관리자 활동 로그 | 8.3 |
| settlements | 정산 관리 | 8.4 |
| refunds | 환불 관리 | 8.5 |

---

## 3. 수정된 테이블

### 3.1 meetings
| 변경 유형 | 내용 |
|-----------|------|
| 컬럼 제거 | `vote_id` (분리 구조로 전환) |

### 3.2 ledger_entries
| 변경 유형 | 내용 |
|-----------|------|
| 컬럼 추가 | `balance_before`, `balance_after` |
| 컬럼 추가 | `related_meeting_id`, `related_expense_request_id`, `related_barcode_id` |

### 3.3 posts
| 변경 유형 | 내용 |
|-----------|------|
| 컬럼 추가 | `is_notice`, `is_pinned`, `deleted_at` |

### 3.4 comments
| 변경 유형 | 내용 |
|-----------|------|
| 컬럼 추가 | `parent_id`, `like_count`, `deleted_at` |

### 3.5 notifications
| 변경 유형 | 내용 |
|-----------|------|
| 컬럼 추가 | `related_entity_type`, `related_entity_id` |

### 3.6 sessions
| 변경 유형 | 내용 |
|-----------|------|
| 컬럼값 추가 | `session_type`에 `LOGIN` 추가 |

---

## 4. 섹션 번호 변경

| 기존 | 변경 후 | 테이블명 |
|------|---------|----------|
| 3.1 | 3.1 | users |
| 3.2 | 3.2 | accounts |
| 3.3 | 3.3 | account_transactions |
| 3.4 | 3.4 | user_scores |
| 3.5 | 3.5 | challenges |
| 3.6 | 3.6 | challenge_members |
| 3.7 | 3.7 | meetings |
| 3.8 (meeting_attendees) | 삭제 | - |
| 3.9 (votes) | 삭제 | - |
| 3.10 (vote_records) | 삭제 | - |
| - | 3.8 | meeting_votes (신규) |
| - | 3.9 | meeting_vote_records (신규) |
| - | 3.10 | expense_requests (신규) |
| - | 3.11 | expense_votes (신규) |
| - | 3.12 | expense_vote_records (신규) |
| - | 3.13 | payment_barcodes (신규) |
| 3.6 (ledger_entries) | 3.14 | ledger_entries (수정) |
| - | 3.15 | payment_logs (신규) |
| - | 3.16 | general_votes (신규) |
| - | 3.17 | general_vote_records (신규) |
| 3.11 (posts) | 3.18 | posts (수정) |
| 3.12 (post_images) | 3.19 | post_images |
| 3.13 (post_likes) | 3.20 | post_likes |
| 3.14 (comments) | 3.21 | comments (수정) |
| - | 3.22 | comment_likes (신규) |
| 3.15 (notifications) | 3.23 | notifications (수정) |
| 3.16 (reports) | 3.24 | reports |
| 3.17 (sessions) | 3.25 | sessions (수정) |
| - | 3.26 | webhook_logs (신규) |
| - | 3.27 | admins (신규) |
| - | 3.28 | fee_policies (신규) |
| - | 3.29 | admin_logs (신규) |
| - | 3.30 | settlements (신규) |
| - | 3.31 | refunds (신규) |

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작업자 |
|------|------|-----------|--------|
| 2026-01-15 | 1.0.0 | DB_Schema_1.0.0.md 기준 전면 동기화 | AI |
