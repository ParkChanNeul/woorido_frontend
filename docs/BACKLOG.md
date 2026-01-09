# WOORIDO 백로그

> 기능 변경 이력 및 신규 추가 항목

---

## 기능 백로그

### 챌린지 시스템

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 챌린지 상태 시스템 | RECRUITING → ACTIVE → CLOSED 상태 흐름 | P-046 ~ P-050 |
| 입회비 계산 공식 | 챌린지 어카운트 잔액 / (현재 멤버 수 - 1) | P-015 |

### 유저 시스템

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 유저 점수 시스템 | WRD-105 기반 점수 공식: 36.5 + (납입×0.7) + (활동×0.15) | P-051 |
| 리더 승계 시스템 | 리더 30일 미활동 시 팔로워 강퇴 요청 가능, 점수 최고자 승계 | P-033 ~ P-035 |

### 정기 모임

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 정기 모임 기능 | 오프라인 만남 이벤트, 과반수 참석 필수 | P-043 ~ P-045 |
| 모임 관련 지출 투표 | 참석자만 투표 가능, 건별 승인 | P-042 |

### 장부 시스템

| 항목 | 설명 | 관련 정책 |
|------|------|----------|
| 사용처 자동 기록 | PG 결제 시 상호명/업종 자동 파싱 (조작 불가) | P-029 |

---

## ERD 변경 이력

### 신규 테이블

| 테이블 | 설명 |
|--------|------|
| `user_scores` | 유저 점수 저장 (WRD-105) |
| `meetings` | 정기 모임 |
| `meeting_attendees` | 모임 참석자 |
| `reports` | 신고 시스템 |
| `admins` | 관리자 계정 |
| `fee_policies` | 수수료 정책 |
| `admin_logs` | 감사 추적 |

### 컬럼 추가

| 테이블 | 컬럼 | 설명 |
|--------|------|------|
| `gye` | `sub_leader_id` | 부리더 (점수 2위 자동 지정) |
| `gye` | `leader_last_active_at` | 리더 최근 활동일 |
| `gye` | `is_verified` | 완주 인증 (1년 운영) |
| `gye` | `status` | 챌린지 상태 (RECRUITING/ACTIVE/CLOSED) |
| `gye` | `activated_at` | ACTIVE 전환 시점 |
| `gye_members` | `privilege_status` | 권한 상태 (ACTIVE/REVOKED) |
| `gye_members` | `privilege_revoked_at` | 권한 박탈 시점 |
| `ledger_entries` | `merchant_name` | 상호명 (PG 자동 입력) |
| `ledger_entries` | `merchant_category` | 업종 |
| `ledger_entries` | `pg_provider` | PG사 |
| `votes` | `meeting_id` | 모임 관련 지출용 |
| `votes` | `meeting_title/date/location` | 모임 참석 투표용 |
| `votes` | `ledger_entry_id` | 투표-장부 연결 |
| `vote_records` | `choice` 확장 | ATTEND/ABSENT 추가 (정기 모임 참석 투표용) |
| `users` | `account_status` | 계정 상태 (ACTIVE/SUSPENDED/BANNED) |
| `users` | `suspended_at/until` | 정지 시점/해제 시점 |
| `users` | `warning_count` | 경고 횟수 |
| `users` | `report_received_count` | 신고 당한 횟수 |
| `accounts` | `version` | Optimistic Lock |
| `account_transactions` | `type` 확장 | ENTRY_FEE, SUPPORT 추가 |
| `account_transactions` | `idempotency_key` | 중복 요청 검증 |
| `gye_members` | `leave_reason` | 탈퇴 사유 |

### 인덱스 추가

| 테이블 | 인덱스 | 설명 |
|--------|--------|------|
| `gye` | `idx_gye_verified` | 완주 인증 챌린지 조회용 |
| `gye` | `idx_gye_inactive_leader` | 리더 미활동 조회용 |
| `votes` | `idx_votes_ledger` | 장부 연결 조회용 |
| `votes` | `idx_votes_meeting` | 모임 관련 지출 조회용 |
| `gye_members` | `idx_members_revoked` | 자동 탈퇴 대상 조회용 |
| `ledger_entries` | `idx_ledger_merchant` | 사용처 검색용 |
| `users` | `idx_users_status` | 계정 상태 조회용 |
| `users` | `idx_users_suspended` | 정지 해제 예정 조회용 |

---

## ERD 스키마 변경사항 (v2.1 통합)

| 테이블 | 변경 내용 |
|--------|---------|
| **gye** | `is_verified`, `verified_at` 추가, 용어 매핑 주석 |
| **gye_members** | `privilege_status`, `privilege_revoked_at`, `leave_reason` 추가, 역할 FOLLOWER로 변경 |
| **admins** | 신규 - 관리자 계정 |
| **fee_policies** | 신규 - 수수료 정책 |
| **reports** | 신규 - 신고 관리 |
| **admin_logs** | 신규 - 감사 추적 |

---

## ERD 문서 버전 변경 이력 (2026-01-09)

| 문서 | 변경 전 | 변경 후 | 사유 |
|------|---------|---------|------|
| 00_ERD_OVERVIEW.md | MyBatis 3.5.16, Spring Boot 3.1.18 | mybatis-spring-boot-starter 3.0.3, Spring Boot 3.2.3 | 팀 확정 기술 스택 반영 |
| ERD_SPECIFICATION.md | MyBatis 3.5.16, Spring Boot 3.1.18 | mybatis-spring-boot-starter 3.0.3, Spring Boot 3.2.3 | 팀 확정 기술 스택 반영 |

> **참고**: 테이블 스키마 변경 없음 (버전 업그레이드만 반영, 기존 MyBatis/Spring Boot 패턴 호환)

---

## PRODUCT_AGENDA.md 기술 스택 변경 이력 (2026-01-09)

| 항목 | 변경 전 | 변경 후 | 사유 |
|------|---------|---------|------|
| Spring Boot | 3.2 | 3.2.3 | ToT 검증 구체화 |
| Django | 5.0 | 5.0.1 | ToT 검증 구체화 |
| Elasticsearch | 8.x | 8.11.3 | ToT 검증 구체화 |
| pandas | 2.1 | 2.1.4 | ToT 검증 구체화 |
| 동시성 전략 | 미명시 | Hybrid High-End (Virtual Threads + Pessimistic Lock) | 팀 확정 |

> **참고**: Document Version 4.0 → 4.1 업그레이드

---

## 정책 변경 이력

| 정책 코드 | 변경 내용 |
|----------|----------|
| P-015 | 입회비 계산 공식 추가 |
| P-021 | 권한 박탈 및 유예 기간 상세화 |
| P-033 ~ P-035 | 리더 활동/승계/부리더 정책 추가 |
| P-043 ~ P-045 | 정기 모임 정책 추가 |
| P-046 ~ P-050 | 챌린지 상태 정책 추가 |
| P-051 | 모임 참석 점수 정책 추가 |
| P-030 | PRODUCT_AGENDA 신고 누적 횟수 동기화 (3건 → 20회, 2026-01-09) |

---

## 개발 환경 문서 이관 항목 (2026-01-09)

> ENVIRONMENT_SETUP.md v2.0 → v3.0 전환 시 이관된 내용

### React2Shell 보안 분석 (CVE-2025-55182)

**심각도:** Critical (CVSS 10.0)

**영향 범위:**
- React 19.x (Server Components 사용 시)
- Next.js 15.x, 16.x (App Router 사용 시)

**취약점 설명:**
- React Server Components(RSC)의 **비안전한 역직렬화** 문제
- 공격자가 조작된 HTTP 요청으로 **원격 코드 실행(RCE)** 가능
- 인증 없이 공격 가능 (Pre-authentication)
- 2025년 12월 3일 공개

**안전한 버전:**
- React: 19.0.3, 19.1.4, 19.2.3
- Next.js: 14.2.35, 15.0.7, 15.1.11

**WOORIDO 프로젝트 영향:** React 18.2.0 사용으로 **영향 없음**

**참고 자료:**
- [Resecurity - React2Shell Explained](https://www.resecurity.com/blog/article/react2shell-explained-cve-2025-55182-from-vulnerability-discovery-to-exploitation)
- [Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)

---

### 2026 UI/UX 트렌드 적용 계획

| 트렌드 | 적용 영역 | 구현 라이브러리 | 우선순위 |
|--------|----------|---------------|---------|
| **Skeleton UI** | 모든 로딩 상태 | Tailwind CSS + Framer Motion | P0 |
| **Glassmorphism** | Modal, Card | backdrop-filter CSS | P1 |
| **Micro-interactions** | 투표, 좋아요, 충전 | Framer Motion | P1 |
| **Progressive Disclosure** | 가입 플로우, 장부 상세 | React State | P1 |
| **Minimalist Design** | 전체 UI | Tailwind CSS | P0 |
| **Dark Mode** | 전체 | Tailwind dark: variants | P2 (Post-Demo) |

---

### 개발 일정 (Demo Day 역산)

**전체 기간: 2025-12-30 ~ 2026-02-25 (57일, 8주)**

| Phase | 기간 | 주요 기능 | API 수 |
|-------|------|----------|--------|
| Phase 1 | Week 1 | 환경 세팅 + 로그인 + Seed 데이터 | 2개 |
| Phase 2 | Week 2-3 | SNS 완성 (피드/댓글/좋아요/이미지) | 18개 |
| Phase 3 | Week 4 | 가입 플로우 + 가상머니 + 모임 생성 | 14개 |
| Phase 4 | Week 5 | 장부 + Django 분석 + 투표 API | 8개 |
| Phase 5 | Week 6-7 | 투표 시스템 (UI + Full Flow) | 5개 |
| Phase 6 | Week 8 | 통합 테스트 + 버그 수정 | 0개 |
| Phase 7 | Week 9 | 시연 리허설 | 0개 |

**총 API: Spring Boot 44개 + Django 4개 = 48개**

---

### SNS-First 개발 우선순위

**1순위 (P0): Demo Day 필수**
- Week 2-3: SNS (피드/댓글/좋아요/이미지) - 18 API
- 이미지 업로드 (S3), 페이지네이션 (20개씩), 공지사항 핀 고정

**2순위 (P0): 신뢰 구축**
- Week 4: 가입 플로우 + 가상머니
- 충전 (토스페이 Mock), 가입 시 보증금 락 (2개월치)

**3순위 (P0): 투명성**
- Week 5: 장부 + Django 분석
- Recharts Line/Pie Chart, Django 분석 3초 이내

**4순위 (P1): 있으면 좋음**
- 반응형 (Mobile + Desktop), 재정 프로필 입력

**5순위 (P2): Post-Demo**
- Elasticsearch 검색, 실시간 알림 (WebSocket), 무한 스크롤, Dark Mode

---

### IA v2.1 신규 기능 계획

**온보딩 플로우:**
- 웰컴 카드 (첫 방문 유저)
- 첫 충전 유도 CTA (잔액 0원 시)
- 인기 모임 추천 (가입 모임 없을 때)

**보증금 해제 플로우:**
- `/groups/:id/complete` - 완주 축하 (보증금 → 가용 잔액)
- `/groups/:id/leave` - 정상 탈퇴 확인
- 강제 퇴출 Toast (보증금 몰수 알림)

**Empty State CTA:**
- 빈 피드 → "첫 글 작성 유도"
- 빈 투표 → "CP만 생성 가능 안내"
- 빈 장부 → "첫 지출 요청 안내"
- 빈 모임 → "모임 찾기 CTA"

**로딩 UX:**
- Skeleton UI (Card/List/Page 3종)
- Progress Bar (이미지 업로드, 충전)
- Optimistic UI (좋아요, 댓글)

---

### 의존성 업데이트 계획

**Phase별 업데이트:**
- Phase 1: Storybook 최신화, Vite 최신화, ESLint/Prettier 설정
- Phase 2-3: 메이저 업데이트 금지, 보안 패치만 적용
- Demo Day 이후: React 19.x 검토, zustand 5.x, recharts 3.x 검토

**업데이트 금지 목록 (Demo Day 전):**

| 패키지 | 현재 버전 | Latest | 사유 |
|--------|----------|--------|------|
| react | 18.2.0 | 19.x | Breaking Changes |
| react-router-dom | 6.x | 7.x | Layout Routes 변경 |
| recharts | 2.x | 3.x | API 변경 |
| tailwindcss | 3.x | 4.x | CSS 엔진 변경 |
| zod | 3.x | 4.x | 스키마 검증 로직 변경 |

---

### Radix UI 컴포넌트 매핑 (IA v2.1)

```typescript
// IA Type → Radix UI 매핑
Modal      → @radix-ui/react-dialog        // 가입 신청, 충전, 보증금 해제 확인
BottomSheet→ @radix-ui/react-sheet         // 락 상세, 필터
Tab        → @radix-ui/react-tabs          // 피드/장부/투표/멤버
Toast      → sonner (Radix-based)          // 성공/에러 메시지
Dropdown   → @radix-ui/react-dropdown-menu // 사용자 메뉴
Select     → @radix-ui/react-select        // 카테고리 선택
Avatar     → @radix-ui/react-avatar        // 프로필 이미지
Progress   → @radix-ui/react-progress      // 투표 진행률, 충전 Progress Bar
Skeleton   → Custom (Tailwind + Framer)    // 로딩 UX
EmptyState → Custom Component              // 빈 상태 CTA
```
