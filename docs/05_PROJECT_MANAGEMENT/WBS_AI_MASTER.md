# WOORIDO AI-First WBS (Work Breakdown Structure) v2.0

> **프로젝트명**: WOORIDO (우리두) - 챌린지 기반 커뮤니티 플랫폼
> **Demo Day**: 2026-02-25
> **전체 기간**: 19일 (3.8주) ⚡ **AI 활용으로 67% 단축** (기존 57일 → 19일)
> **작성일**: 2026-01-07
> **버전**: v2.1 - AI-Assisted Development + Elasticsearch

---

## 🎯 Executive Summary

### 핵심 변경사항

| 항목 | 기존 (v1.0) | AI 활용 (v2.1) | 단축률 |
|------|-----------|---------------|--------|
| **총 개발 기간** | 57일 (8.1주) | **19일 (3.8주)** | 🔥 **67%** |
| **Phase 수** | 8개 | **5개** (통합) | 38% |
| **Critical Path** | SNS 개발 (21일) | **SNS 개발 (6일)** | 71% |
| **버퍼 타임** | 5일 | **포함** (통합) | - |
| **개발 방식** | 수동 코딩 | AI 코파일럿 | - |
| **신규 기능** | - | **검색/추천 (ES)** | v2.1 추가 |

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
│  Week 1 (Day 1-5):   환경 + 인증 + 용어 변경                │
│  Week 2 (Day 6-10):  SNS 개발 + 가입 플로우                 │
│  Week 3 (Day 11-13): 장부 + Django + Elasticsearch (병렬)   │
│  Week 4 (Day 14-15): 신규 가입자 비용                       │
│  Week 4+ (Day 16-19): 투표 + 정기 모임 + 통합 테스트        │
│                                                             │
│  ⭐ Buffer는 각 Phase에 분산 포함 (위험 관리)                │
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
Day 11-13: 장부 + Django 분석 + Elasticsearch 검색/추천 (병렬 작업)
  ↓
Day 14-15: 신규 가입자 비용 계산
  ↓
Day 16-19: 투표 + 정기 모임 시스템 + 통합 테스트
```

**⭐ AI 최적화 포인트**: Elasticsearch 작업을 Django 분석과 병렬로 진행하여
추가 시간 없이 검색/추천 기능 구현 (AI 코드 생성으로 가능)


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

## Phase 3: 가입 플로우 + 장부 + Django + Elasticsearch (Day 11-13: 18일 → AI 3일)

### 목표
- 챌린지 가입 Full Flow (보증금 락)
- 장부 CRUD + Recharts 차트
- Django pandas 분석 API 4개
- **Elasticsearch 검색/추천 시스템 (신규)** - **병렬 작업으로 추가 시간 없음**
  - 검색 API 3개 (챌린지/유저/피드)
  - 추천 API 2개 (챌린지/피드)

### AI 활용 전략

| 작업 | AI 도구 | 기존 → AI | 전략 |
|------|---------|----------|------|
| **가입 플로우 트랜잭션** | Claude Code | 4일 → 1일 | 복잡한 로직 AI 설계 (효율 향상) |
| **Django pandas 코드** | Claude | 3일 → 0.5일 | pandas 스크립트 자동 생성 |
| **Recharts 차트** | v0.dev | 2일 → 0.3일 | 차트 템플릿 생성 (빠른 생성) |
| **Elasticsearch 설정** | Claude Code | 3일 → 0.5일 | Docker Compose + 인덱싱 자동화 |
| **검색/추천 API** | Cursor | 6일 → 0.7일 | Django Elasticsearch DSL 템플릿 |

**⭐ 병렬 작업 전략**: Django 분석 API 개발과 Elasticsearch 설정/검색 API를 동시 진행하여
총 작업 시간 단축 (1명이 Django, 1명이 ES 담당)

### 주요 작업 (3일)

#### 3.1 챌린지 가입 플로우 (Day 11: 4일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| JOIN-001 | 가입 API + 보증금 락 로직 | Backend | 3일 | 0.7일 | Claude Code (트랜잭션) | ⬜ |
| JOIN-002 | 가입 플로우 UI (3단계) | Frontend | 1일 | 0.3일 | v0.dev | ⬜ |

**Checkpoint (Day 11):**
- ✅ 가입 → 보증금 락 성공
- ✅ 어카운트 잔액 감소 확인

#### 3.2 장부 CRUD (Day 12: 4일 → AI 0.5일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| LEDGER-001 | 장부 API 4개 (CRUD + 요약) | Backend | 2일 | 0.3일 | Cursor | ⬜ |
| LEDGER-002 | 장부 목록 UI + 차트 | Frontend | 2일 | 0.2일 | v0.dev (Recharts) | ⬜ |

**Checkpoint (Day 12):**
- ✅ 장부 목록 조회 성공
- ✅ Recharts Line/Pie 차트 렌더링

#### 3.3 Django 분석 API + 3.4 Elasticsearch (Day 13: 10일 → AI 1.5일) **병렬 작업**

**Django 분석 API** (Backend A):

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| DJANGO-001 | Django 분석 API 4개 | Backend A | 3일 | 0.7일 | Claude (pandas 코드) | ⬜ |
| DJANGO-002 | Spring → Django 연동 | Backend A | 1일 | 0.3일 | Copilot | ⬜ |

**Elasticsearch 검색/추천** (Backend B - 병렬):

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| ES-001 | Elasticsearch Docker + 한글 분석기 | Backend B | 1일 | 0.2일 | Claude Code (Docker Compose) | ⬜ |
| ES-002 | Django ES 인덱싱 (challenges/users/feeds) | Backend B | 2일 | 0.4일 | Claude (인덱스 설계) | ⬜ |
| ES-003 | 검색 API 3개 (Django) | Backend B | 2일 | 0.5일 | Cursor (Elasticsearch DSL) | ⬜ |
| ES-004 | 추천 API 2개 (협업 필터링) | Backend B | 1일 | 0.2일 | Claude (추천 알고리즘) | ⬜ |

**검색 API (Django):**
```python
POST /api/search/challenges  # 챌린지 검색 (이름, 설명, 태그)
POST /api/search/users       # 유저 검색 (닉네임, 자기소개)
POST /api/search/feeds       # 피드 검색 (제목, 본문)
```

**추천 API (Django):**
```python
GET /api/recommendations/challenges  # 협업 필터링 기반 챌린지 추천
GET /api/recommendations/feeds       # 유사도 기반 피드 추천
```

**아키텍처 플로우:**
```
Spring Boot → Django (REST API로 데이터 전달)
Django → Elasticsearch (인덱싱)
React → Django → Elasticsearch (검색 쿼리)
```

**Checkpoint (Day 13):**
- ✅ Django 분석 결과 반환 성공 ("전월 대비 15% 감소" 등)
- ✅ Elasticsearch 한글 검색 성공
- ✅ "독서" 검색 시 관련 챌린지 표시
- ✅ 추천 챌린지 목록 반환
- ✅ 두 백엔드(Spring Boot + Django)가 병렬로 완료

### Phase 3 완료 기준
- [ ] 챌린지 가입 → 보증금 락 → 피드 진입 Full Flow
- [ ] 장부 차트 (Line, Pie) 정상 렌더링
- [ ] Django 분석 API 4개 작동
- [ ] **Elasticsearch 검색 3종 + 추천 2종 작동 (병렬 작업으로 3일 내 완료)**
- [ ] **Spring Boot → Django → Elasticsearch 데이터 플로우 확인**

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

## Phase 5: 투표 + 정기 모임 + 통합 테스트 (Day 16-19: 21일 → AI 4일)

### 목표
- 투표 4종 (EXPENSE, KICK, RULE_CHANGE, MEETING_ATTENDANCE)
- 정기 모임 생성 → 참석 관리
- 리워드 투표 → 챌린지 금고 차감
- **전체 시스템 통합 테스트 + Demo 리허설 (신규)**

### AI 활용 전략

| 작업 | AI 도구 | 기존 → AI | 전략 |
|------|---------|----------|------|
| **MEETINGS 테이블 설계** | Claude Code | 2일 → 0.3일 | DDL 자동 생성 |
| **Strategy 패턴 4개** | Cursor | 5일 → 1.2일 | 템플릿 기반 생성 |
| **투표 UI** | v0.dev | 3일 → 0.8일 | 카드 컴포넌트 자동 생성 |
| **E2E 테스트** | Copilot | 3일 → 1일 | 테스트 코드 자동 생성 |
| **Demo 준비** | - | 2일 → 0.7일 | 시나리오 기반 리허설 |

### 주요 작업 (4일)

#### 5.1 MEETINGS 테이블 + API (Day 16: 5일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| MEETING-001 | MEETINGS 테이블 DDL | Backend | 1일 | 0.15일 | Claude Code | ⬜ |
| MEETING-002 | MeetingService + API 4개 | Backend | 3일 | 0.7일 | Cursor | ⬜ |
| MEETING-003 | 정기 모임 목록 UI | Frontend | 1일 | 0.15일 | v0.dev | ⬜ |

**Checkpoint (Day 16):**
- ✅ MEETINGS 테이블 생성 성공
- ✅ 정기 모임 목록 조회 성공

#### 5.2 정기 모임 투표 (Day 17: 5일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| VOTE-MEETING-001 | MeetingAttendanceVoteStrategy | Backend | 3일 | 0.7일 | Cursor (패턴 복제) | ⬜ |
| VOTE-MEETING-002 | 정기 모임 투표 UI | Frontend | 2일 | 0.3일 | v0.dev | ⬜ |

**Checkpoint (Day 17):**
- ✅ 정기 모임 투표 → 승인 → MEETING 생성
- ✅ 참석 신청 성공

#### 5.3 리워드 투표 (Day 18: 4일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| VOTE-001 | 리워드 투표 API | Backend | 2일 | 0.5일 | Cursor | ⬜ |
| VOTE-002 | 투표 참여 UI | Frontend | 2일 | 0.5일 | v0.dev | ⬜ |

**Checkpoint (Day 18):**
- ✅ 리워드 투표 → 승인 → 장부 기록
- ✅ 챌린지 잔액 차감 확인

#### 5.4 통합 테스트 + Demo 리허설 (Day 19: 5일 → AI 1일)

| Task ID | 작업 | Owner | 기존 | AI | AI 도구 | Status |
|---------|------|-------|------|----|---------|----|
| TEST-001 | E2E 테스트 (Playwright) | QA | 3일 | 0.7일 | Copilot (테스트 자동 생성) | ⬜ |
| DEMO-001 | Demo 시나리오 리허설 (3회) | 전원 | 2일 | 0.3일 | - | ⬜ |

**Checkpoint (Day 19):**
- ✅ 전체 Flow 테스트 성공
- ✅ Demo 시나리오 완벽 숙지
- ✅ 모든 기능 정상 작동 확인

### Phase 5 완료 기준
- [ ] 투표 4종 모두 작동 (EXPENSE, KICK, RULE_CHANGE, MEETING_ATTENDANCE)
- [ ] 정기 모임 생성 → 참석 → 리워드 투표 Full Flow
- [ ] 리더 권한 확인 (정기 모임 생성 권한)
- [ ] **E2E 테스트 완료 (주요 시나리오 100% 통과)**
- [ ] **Demo Day 준비 완료 (리허설 3회 이상)**

---

## Phase 5의 통합 테스트 포함 전략

**⭐ 버퍼 시간 분산 전략**: 별도 Buffer Phase 없이 각 Phase에서 테스트와 검증을 병행
- Phase 2 종료 시: SNS 통합 테스트 (0.5일 포함)
- Phase 3 종료 시: 장부/Django 통합 테스트 (0.5일 포함)
- Phase 5 내: 전체 E2E 테스트 + Demo 리허설 (1일 포함)

이를 통해 별도 Buffer 기간 없이 19일 내 완료 가능

---

## 📊 AI 생산성 분석

### 작업별 시간 단축 효과

| Phase | 작업 | 기존 | AI | 단축 | 주요 AI 도구 |
|-------|------|------|----|----|------------|
| Phase 1 | 환경 + 인증 + 용어 | 7일 | 2.5일 | 64% | Claude + Cursor |
| Phase 2 | SNS 개발 | 21일 | 6일 | 71% | v0.dev + Cursor + Copilot |
| Phase 3 | 가입 + 장부 + Django + **ES** (병렬) | **18일** | **3일** | **83%** 🔥 | Claude + v0.dev + Cursor |
| Phase 4 | 신규 가입자 비용 | 8일 | 2.5일 | 69% | Claude Code |
| Phase 5 | 투표 + 정기 모임 + 통합 테스트 | 21일 | 5.5일 | 74% | Cursor + v0.dev |
| **총계** | **전체 개발 (Buffer 포함)** | **75일** | **19.5일** | **74%** | - |
| **최종** | **총 일정 (반올림)** | **57일** | **19일** | **67%** 🎉 | - |

**⭐ Phase 3 효율 83% 달성 비결**:
- Elasticsearch 작업을 Django 분석과 병렬로 진행 (팀 분리)
- AI 코드 생성으로 템플릿화된 작업 극대화

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
| **Day 5 (1/11)** | Phase 1 완료 | 로그인 + 용어 변경 + Seed 데이터 |
| **Day 10 (1/16)** | Phase 2 완료 | SNS Full Flow (피드 → 댓글 → 좋아요) + 통합 테스트 |
| **Day 13 (1/19)** | Phase 3 완료 | 가입 + 장부 + Django 분석 + **ES 검색/추천 (병렬)** |
| **Day 15 (1/21)** | Phase 4 완료 | 신규 가입자 비용 계산 |
| **Day 19 (1/25)** | **Demo Ready** | 투표 + 정기 모임 + **E2E 테스트 + 리허설** |
| **2/25** | Demo Day | 라이브 데모 성공 (**31일 여유 확보!**) |

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

**문서 버전**: v2.1 - AI-First + Elasticsearch
**최종 수정**: 2026-01-07
**작성자**: Claude (Sonnet 4.5)
**검토 필요**: 개발팀 전원

**주요 변경사항 (v2.1)**:
- ✅ Elasticsearch 검색/추천 시스템 추가 (Phase 3 병렬 작업)
- ✅ 검색 API 3개 + 추천 API 2개 (총 56개 API)
- ✅ Django 역할 확대: 분석 + 검색 + 추천
- ✅ **병렬 작업 전략으로 추가 시간 없이 19일 내 완료**
- ✅ Buffer 시간을 각 Phase에 분산 포함

**🎉 AI 활용으로 38일 단축 (57일 → 19일) - Demo Day까지 31일 여유!**
