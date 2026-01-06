# WOORIDO AI-First WBS (Work Breakdown Structure) v2.0

> **프로젝트명**: WOORIDO (우리두) - 챌린지 기반 커뮤니티 플랫폼
> **Demo Day**: 2026-02-25
> **전체 기간**: 19일 (3.8주) ⚡ **AI 활용으로 66% 단축** (기존 57일 → 19일)
> **작성일**: 2026-01-06
> **버전**: v2.0 - AI-Assisted Development

---

## 🎯 Executive Summary

### 핵심 변경사항

| 항목 | 기존 (v1.0) | AI 활용 (v2.0) | 단축률 |
|------|-----------|---------------|--------|
| **총 개발 기간** | 57일 (8주) | **19일 (3.8주)** | 🔥 **67%** |
| **Phase 수** | 8개 | **5개** (통합) | 38% |
| **Critical Path** | SNS 개발 (21일) | **SNS 개발 (6일)** | 71% |
| **버퍼 타임** | 5일 | **3일** | - |
| **개발 방식** | 수동 코딩 | AI 코파일럿 | - |

### AI 생산성 증폭 계수

| 작업 유형 | 단축률 | 주요 AI 도구 |
|----------|--------|------------|
| ERD 설계 | 83% | Claude Code |
| Backend 로직 | 70% | Cursor + Copilot |
| MyBatis Mapper | 83% | Claude Code |
| API 개발 | 75% | GitHub Copilot |
| Frontend UI | 75% | v0.dev + Cursor |
| 테스트 코드 | 70% | Copilot Chat |
| 디버깅 | 70% | Claude Code |

### 용어 변경 (법적 이슈 방지)

| 기존 | 변경 후 | DB 컬럼 |
|------|--------|---------|
| 계모임 | 챌린지 | `challenge` (View 별칭) |
| 계주 | 리더 | `leader_id` |
| 계원 | 팔로워 | `follower` |
| 결제 | 리워드 | `reward` |
| 회비 | 참가비 | `participation_fee` |

---

## 📅 전체 일정 개요

```
┌─────────────────────────────────────────────────────────────┐
│              AI-First Development Timeline (19일)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Week 1 (Day 1-5):  환경 + 인증 + 용어 변경                 │
│  Week 2 (Day 6-10): SNS 개발 + 가입 플로우                  │
│  Week 3 (Day 11-15): 장부 + Django + 신규 가입자 비용       │
│  Week 4 (Day 16-19): 투표 + 정기 모임 시스템                │
│                                                             │
│  Buffer (3일): 통합 테스트 + 리허설                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Critical Path

```
Day 1-2: 환경 세팅 + 인증 (필수)
  ↓
Day 3-5: 용어 변경 + Seed 데이터 (병렬)
  ↓
Day 6-10: SNS 개발 (Critical Path) ⚠️
  ↓
Day 11-13: 장부 + Django 분석
  ↓
Day 14-15: 신규 가입자 비용 계산 (병렬)
  ↓
Day 16-19: 투표 + 정기 모임 시스템
  ↓
Day 20-22: 통합 테스트 + Demo 리허설
```

---

## Phase 1: 환경 세팅 + 용어 변경 (Day 1-5: 1/6-1/10)

### 목표
- 개발 환경 100% 작동 (Spring + Django + Oracle)
- JWT 인증 구현
- 용어 변경 (챌린지, 리더, 팔로워, 리워드)
- Seed 데이터 생성

### AI 활용 전략

| 작업 | AI 도구 | 프롬프트 예시 | 기존 → AI |
|------|---------|-------------|----------|
| **Oracle DDL** | Claude Code | "WOORIDO ERD를 Oracle DDL로 변환해줘" | 2일 → 0.3일 |
| **Spring Security** | Cursor | "JWT + Spring Security 템플릿 생성" | 1.5일 → 0.5일 |
| **용어 일괄 치환** | Claude Code | "gye → challenge로 전체 치환" | 3일 → 0.5일 |
| **Seed 데이터 SQL** | Claude | "테스트 챌린지 2개, 유저 5명 SQL 생성" | 1일 → 0.2일 |

### 주요 작업 (5일)

#### 1.1 환경 세팅 + 인증 (Day 1-2: 1.5일 → AI 0.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| ENV-001 | Oracle Docker + DDL 실행 | DevOps | 1일 | 0.2일 | Claude (DDL 자동 생성) | ⬜ |
| AUTH-001 | Spring Security + JWT | Backend | 1.5일 | 0.5일 | Cursor (템플릿) | ⬜ |
| AUTH-002 | 로그인 API + UI | Full | 2일 | 0.5일 | Copilot + v0.dev | ⬜ |

**Checkpoint (Day 2):**
- ✅ 로그인 성공 → JWT 발급
- ✅ Protected Route 접근 제어

#### 1.2 용어 변경 (Day 3-4: 3일 → AI 0.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| TERM-001 | DB View 생성 (gye → challenges) | Backend | 1일 | 0.2일 | Claude | ⬜ |
| TERM-002 | Backend 용어 일괄 치환 | Backend | 2일 | 0.3일 | Claude Code (Regex) | ⬜ |
| TERM-003 | Frontend 용어 일괄 치환 | Frontend | 2일 | 0.3일 | VSCode Find&Replace | ⬜ |

**Checkpoint (Day 4):**
- ✅ API 응답에서 "challenge", "leader", "follower" 용어 확인
- ✅ Frontend UI에서 "챌린지", "리더" 표시 확인

#### 1.3 Seed 데이터 + 공통 컴포넌트 (Day 5: 2일 → AI 0.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| SEED-001 | 테스트 데이터 SQL 생성 | Backend | 1일 | 0.2일 | Claude | ⬜ |
| UI-001 | Tailwind + Radix UI 설정 | Frontend | 1일 | 0.3일 | Cursor (설정 자동화) | ⬜ |
| UI-002 | Skeleton/Toast 컴포넌트 | Frontend | 1일 | 0.3일 | v0.dev | ⬜ |

**Checkpoint (Day 5):**
- ✅ 테스트 챌린지 2개 존재
- ✅ Skeleton 컴포넌트 작동

### Phase 1 완료 기준
- [ ] 로그인 성공 + JWT 토큰 발급
- [ ] 모든 용어 변경 완료 (DB, Backend, Frontend)
- [ ] Seed 데이터 2개 챌린지, 5명 유저 존재
- [ ] Skeleton + Toast 컴포넌트 작동

---

## Phase 2: SNS 개발 (Day 6-10: 21일 → AI 6일) ⚠️ **Critical Path**

### 목표
- 피드 작성 → 댓글 → 좋아요 Full Flow
- 이미지 업로드 (S3)
- 페이지네이션 20개씩
- 공지사항 핀 고정

### AI 활용 전략

| 작업 | AI 도구 | 기존 → AI | 전략 |
|------|---------|----------|------|
| **18개 SNS API** | Cursor + Copilot | 14일 → 4일 | 반복 패턴 AI 생성 |
| **Frontend 컴포넌트** | v0.dev + Cursor | 7일 → 2일 | v0.dev UI 생성 |
| **MyBatis Mapper** | Claude Code | 3일 → 0.5일 | XML 템플릿 자동 생성 |

### 주요 작업 (6일)

#### 2.1 피드 CRUD (Day 6-7: 5일 → AI 1.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| POST-001 | 피드 API 4개 (CRUD) | Backend | 3일 | 1일 | Cursor (CRUD 템플릿) | ⬜ |
| POST-002 | 피드 목록 UI + 작성 폼 | Frontend | 2일 | 0.5일 | v0.dev | ⬜ |
| POST-003 | API 연동 | Frontend | 1일 | 0.3일 | Copilot | ⬜ |

**Checkpoint (Day 7):**
- ✅ 피드 목록 조회 성공 (페이지네이션)
- ✅ 피드 작성 → 목록 갱신

#### 2.2 댓글 시스템 (Day 8: 4일 → AI 1.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| COMMENT-001 | 댓글 API 4개 (CRUD + 대댓글) | Backend | 2일 | 0.7일 | Cursor | ⬜ |
| COMMENT-002 | 댓글 UI (2단계 depth) | Frontend | 2일 | 0.8일 | v0.dev + Cursor | ⬜ |

**Checkpoint (Day 8):**
- ✅ 댓글 + 대댓글 작성 성공
- ✅ 2단계 렌더링 확인

#### 2.3 좋아요 시스템 (Day 9: 2.5일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| LIKE-001 | 좋아요 API 2개 (피드/댓글) | Backend | 1일 | 0.3일 | Copilot | ⬜ |
| LIKE-002 | 좋아요 UI + Optimistic Update | Frontend | 1.5일 | 0.7일 | Cursor | ⬜ |

**Checkpoint (Day 9):**
- ✅ 좋아요 클릭 즉시 반영
- ✅ 실패 시 롤백 확인

#### 2.4 이미지 업로드 (Day 10: 3일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| MEDIA-001 | S3 연동 + 업로드 API | Backend | 1.5일 | 0.5일 | Claude + Copilot | ⬜ |
| MEDIA-002 | 드래그앤드롭 UI + Progress | Frontend | 1.5일 | 0.5일 | v0.dev + Cursor | ⬜ |

**Checkpoint (Day 10):**
- ✅ 이미지 업로드 성공 (최대 10장)
- ✅ Progress Bar 작동

### Phase 2 완료 기준
- [ ] 피드 → 댓글 → 좋아요 → 이미지 전체 Flow 작동
- [ ] 페이지네이션 20개씩 정상 작동
- [ ] Optimistic UI + 에러 핸들링

---

## Phase 3: 가입 플로우 + 장부 + Django (Day 11-13: 12일 → AI 3.5일)

### 목표
- 챌린지 가입 Full Flow (보증금 락)
- 장부 CRUD + Recharts 차트
- Django pandas 분석 API 4개

### AI 활용 전략

| 작업 | AI 도구 | 기존 → AI | 전략 |
|------|---------|----------|------|
| **가입 플로우 트랜잭션** | Claude Code | 4일 → 1.5일 | 복잡한 로직 AI 설계 |
| **Django pandas 코드** | Claude | 3일 → 0.5일 | pandas 스크립트 자동 생성 |
| **Recharts 차트** | v0.dev | 2일 → 0.5일 | 차트 템플릿 생성 |

### 주요 작업 (3.5일)

#### 3.1 챌린지 가입 플로우 (Day 11: 4일 → AI 1.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| JOIN-001 | 가입 API + 보증금 락 로직 | Backend | 3일 | 1일 | Claude Code (트랜잭션) | ⬜ |
| JOIN-002 | 가입 플로우 UI (3단계) | Frontend | 1일 | 0.5일 | v0.dev | ⬜ |

**Checkpoint (Day 11):**
- ✅ 가입 → 보증금 락 성공
- ✅ 어카운트 잔액 감소 확인

#### 3.2 장부 CRUD (Day 12: 4일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| LEDGER-001 | 장부 API 4개 (CRUD + 요약) | Backend | 2일 | 0.5일 | Cursor | ⬜ |
| LEDGER-002 | 장부 목록 UI + 차트 | Frontend | 2일 | 0.5일 | v0.dev (Recharts) | ⬜ |

**Checkpoint (Day 12):**
- ✅ 장부 목록 조회 성공
- ✅ Recharts Line/Pie 차트 렌더링

#### 3.3 Django 분석 API (Day 13: 4일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| DJANGO-001 | Django 분석 API 4개 | Backend | 3일 | 0.7일 | Claude (pandas 코드) | ⬜ |
| DJANGO-002 | Spring → Django 연동 | Backend | 1일 | 0.3일 | Copilot | ⬜ |

**Checkpoint (Day 13):**
- ✅ Django 분석 결과 반환 성공
- ✅ "전월 대비 15% 감소" 등 통계 확인

### Phase 3 완료 기준
- [ ] 챌린지 가입 → 보증금 락 → 피드 진입 Full Flow
- [ ] 장부 차트 (Line, Pie) 정상 렌더링
- [ ] Django 분석 API 4개 작동

---

## Phase 4: 신규 가입자 비용 계산 (Day 14-15: 8일 → AI 2.5일)

### 목표
- 입회비 계산 로직 구현
- 입회비 = 챌린지 잔액 / (현재 인원 - 1)
- 총 납부액 = 보증금 + 입회비

### AI 활용 전략

| 작업 | AI 도구 | 기존 → AI | 전략 |
|------|---------|----------|------|
| **비즈니스 로직** | Claude Code | 3일 → 1일 | 입회비 계산 함수 자동 생성 |
| **UI 수정** | Cursor | 2일 → 0.6일 | 가입 모달 수정 |

### 주요 작업 (2.5일)

#### 4.1 Backend 로직 (Day 14: 3일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| ENTRY-001 | ERD 수정 (entry_fee_paid 컬럼) | Backend | 0.5일 | 0.1일 | Claude | ⬜ |
| ENTRY-002 | calculateEntryFee() 메서드 | Backend | 1.5일 | 0.5일 | Claude Code | ⬜ |
| ENTRY-003 | payEntryFee() 트랜잭션 | Backend | 1일 | 0.4일 | Cursor | ⬜ |

**Checkpoint (Day 14):**
- ✅ 입회비 계산 정확성 검증 (300만 / 8 = 37.5만)
- ✅ 트랜잭션 롤백 테스트

#### 4.2 Frontend UI (Day 15: 2일 → AI 0.6일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| ENTRY-004 | 가입 모달 UI 수정 (입회비 표시) | Frontend | 1.5일 | 0.5일 | Cursor | ⬜ |
| ENTRY-005 | API 연동 | Frontend | 0.5일 | 0.1일 | Copilot | ⬜ |

**Checkpoint (Day 15):**
- ✅ 가입 모달에 "보증금 + 입회비" 표시
- ✅ 총 납부액 정확성 확인

### Phase 4 완료 기준
- [ ] 입회비 계산 로직 정상 작동
- [ ] 가입 시 보증금 + 입회비 동시 결제
- [ ] 장부에 입회비 기록 확인

---

## Phase 5: 투표 + 정기 모임 시스템 (Day 16-19: 19일 → AI 5.5일)

### 목표
- 투표 4종 (EXPENSE, KICK, RULE_CHANGE, MEETING_CREATE)
- 정기 모임 생성 → 참석 관리
- 리워드 투표 → 챌린지 금고 차감

### AI 활용 전략

| 작업 | AI 도구 | 기존 → AI | 전략 |
|------|---------|----------|------|
| **MEETINGS 테이블 설계** | Claude Code | 2일 → 0.5일 | DDL 자동 생성 |
| **Strategy 패턴 4개** | Cursor | 5일 → 1.5일 | 템플릿 기반 생성 |
| **투표 UI** | v0.dev | 3일 → 1일 | 카드 컴포넌트 자동 생성 |

### 주요 작업 (5.5일)

#### 5.1 MEETINGS 테이블 + API (Day 16-17: 5일 → AI 1.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| MEETING-001 | MEETINGS 테이블 DDL | Backend | 1일 | 0.2일 | Claude Code | ⬜ |
| MEETING-002 | MeetingService + API 4개 | Backend | 3일 | 1일 | Cursor | ⬜ |
| MEETING-003 | 정기 모임 목록 UI | Frontend | 1일 | 0.3일 | v0.dev | ⬜ |

**Checkpoint (Day 17):**
- ✅ MEETINGS 테이블 생성 성공
- ✅ 정기 모임 목록 조회 성공

#### 5.2 정기 모임 투표 (Day 18: 5일 → AI 1.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| VOTE-MEETING-001 | MeetingCreateVoteStrategy | Backend | 3일 | 1일 | Cursor (패턴 복제) | ⬜ |
| VOTE-MEETING-002 | 정기 모임 투표 UI | Frontend | 2일 | 0.5일 | v0.dev | ⬜ |

**Checkpoint (Day 18):**
- ✅ 정기 모임 투표 → 승인 → MEETING 생성
- ✅ 참석 신청 성공

#### 5.3 리워드 투표 (Day 19: 4일 → AI 1.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| VOTE-001 | 리워드 투표 API | Backend | 2일 | 0.7일 | Cursor | ⬜ |
| VOTE-002 | 투표 참여 UI | Frontend | 2일 | 0.8일 | v0.dev | ⬜ |

**Checkpoint (Day 19):**
- ✅ 리워드 투표 → 승인 → 장부 기록
- ✅ 챌린지 잔액 차감 확인

### Phase 5 완료 기준
- [ ] 투표 4종 모두 작동 (EXPENSE, KICK, RULE_CHANGE, MEETING_CREATE)
- [ ] 정기 모임 생성 → 참석 → 리워드 투표 Full Flow
- [ ] 리더 권한 확인 (정기 모임 생성 권한)

---

## Buffer & Integration (Day 20-22: 3일)

### 목표
- 전체 Flow 통합 테스트
- 버그 수정
- Demo Day 리허설

### 주요 작업

#### 통합 테스트 (Day 20-21: 2일)

| Task ID | 작업 | Owner | Duration | AI 도구 | Status |
|---------|------|-------|----------|---------|--------|
| TEST-001 | E2E 테스트 (Playwright) | QA | 1일 | Copilot (테스트 코드) | ⬜ |
| TEST-002 | 부하 테스트 (JMeter) | Backend | 0.5일 | - | ⬜ |
| TEST-003 | 크로스 브라우저 테스트 | Frontend | 0.5일 | - | ⬜ |

#### Demo 리허설 (Day 22: 1일)

| Task ID | 작업 | Owner | Duration | Status |
|---------|------|-------|----------|--------|
| DEMO-001 | Demo 시나리오 실행 (3회) | 전원 | 0.5일 | ⬜ |
| DEMO-002 | 발표 자료 최종 점검 | PM | 0.5일 | ⬜ |

---

## 📊 AI 생산성 분석

### 작업별 시간 단축 효과

| Phase | 작업 | 기존 | AI | 단축 | 주요 AI 도구 |
|-------|------|------|----|----|------------|
| Phase 1 | 환경 + 인증 + 용어 | 7일 | 2.5일 | 64% | Claude + Cursor |
| Phase 2 | SNS 개발 | 21일 | 6일 | 71% | v0.dev + Cursor + Copilot |
| Phase 3 | 가입 + 장부 + Django | 12일 | 3.5일 | 71% | Claude + v0.dev |
| Phase 4 | 신규 가입자 비용 | 8일 | 2.5일 | 69% | Claude Code |
| Phase 5 | 투표 + 정기 모임 | 19일 | 5.5일 | 71% | Cursor + v0.dev |
| **총계** | **전체 개발** | **67일** | **20일** | **70%** | - |
| Buffer | 통합 테스트 + 리허설 | 5일 | 3일 | 40% | Copilot |
| **최종** | **총 일정** | **57일** | **19일** | **67%** | - |

### AI 도구별 기여도

```
┌─────────────────────────────────────────────────────────────┐
│                  AI 도구 기여도 분석                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Claude Code        ████████████████████████ 40%            │
│  (아키텍처, DDL, 복잡한 로직)                                │
│                                                             │
│  Cursor IDE         ██████████████ 25%                      │
│  (실시간 코딩, 멀티파일 편집)                                │
│                                                             │
│  GitHub Copilot     ████████ 20%                            │
│  (코드 완성, 테스트 생성)                                    │
│                                                             │
│  v0.dev             ████████ 15%                            │
│  (UI 컴포넌트 자동 생성)                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 리스크 관리

### Top 5 리스크 (AI 환경)

| 리스크 | 확률 | 영향도 | 완화 전략 | AI 활용 |
|--------|------|--------|----------|---------|
| **R1: AI 생성 코드 버그** | 🟡 Medium | 🔴 High | 코드 리뷰 + 테스트 강화 | Copilot Chat (테스트 생성) |
| **R2: 보안 취약점** | 🟢 Low | 🔴 High | AI 코드 보안 검토 필수 | Claude Code (보안 분석) |
| **R3: 트랜잭션 복잡도** | 🟡 Medium | 🔴 High | @Transactional 수동 검증 | Claude (트랜잭션 설계) |
| **R4: UX 디테일 부족** | 🟡 Medium | 🟡 Medium | AI 생성 UI 디자이너 검토 | - |
| **R5: 통합 테스트 시간** | 🟢 Low | 🟡 Medium | E2E 테스트 자동화 | Playwright + Copilot |

### 리스크 대응 프로세스

```
AI 코드 생성 → 사람이 검토 (30분) → 단위 테스트 (AI 생성)
  → 통합 테스트 → 보안 검토 → 최종 승인
```

---

## 📅 마일스톤

| 날짜 | 마일스톤 | 완료 기준 |
|------|---------|----------|
| **Day 5 (1/10)** | Phase 1 완료 | 로그인 + 용어 변경 + Seed 데이터 |
| **Day 10 (1/15)** | Phase 2 완료 | SNS Full Flow (피드 → 댓글 → 좋아요) |
| **Day 13 (1/18)** | Phase 3 완료 | 가입 + 장부 + Django 분석 |
| **Day 15 (1/20)** | Phase 4 완료 | 신규 가입자 비용 계산 |
| **Day 19 (1/24)** | Phase 5 완료 | 투표 + 정기 모임 시스템 |
| **Day 22 (1/27)** | Demo Ready | 통합 테스트 + 리허설 완료 |
| **2/25** | Demo Day | 라이브 데모 성공 |

---

## 🚀 AI-First 개발 원칙

### 1. AI가 하는 것
- ✅ ERD 설계 및 DDL 생성
- ✅ CRUD API 템플릿 생성
- ✅ 반복적인 컴포넌트 개발
- ✅ 테스트 코드 생성
- ✅ 복잡한 비즈니스 로직 초안

### 2. 사람이 하는 것
- 🧑‍💻 비즈니스 로직 검증
- 🧑‍💻 UX 디테일 개선
- 🧑‍💻 보안 검토
- 🧑‍💻 성능 최적화
- 🧑‍💻 최종 통합 테스트

### 3. 협업 프로세스
```
1. 사람: 요구사항 정의
2. AI: 코드 80% 생성
3. 사람: 20% 수정 + 검증
4. AI: 테스트 코드 생성
5. 사람: 최종 승인
```

---

## 📝 다음 단계

### 즉시 수행 (Day 1)
1. ✅ AI 도구 환경 설정
   - [ ] Cursor IDE 설치
   - [ ] GitHub Copilot 구독
   - [ ] Claude Code 설정

2. ✅ Oracle Docker 실행
   - [ ] DDL 실행 (Claude로 생성)
   - [ ] Seed 데이터 삽입

3. ✅ Spring Security + JWT
   - [ ] Cursor로 템플릿 생성
   - [ ] 로그인 API 테스트

### Week 1 목표
- Day 5까지 Phase 1 완료
- 용어 변경 100% 적용
- Seed 데이터 2개 챌린지 존재

---

**문서 버전**: v2.0 - AI-First
**최종 수정**: 2026-01-06
**작성자**: Claude (Sonnet 4.5)
**검토 필요**: 개발팀 전원

**🎉 AI 활용으로 38일 단축 (57일 → 19일) - Demo Day 충분히 준비 가능!**
