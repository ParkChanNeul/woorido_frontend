# WOORIDO 프로젝트 WBS (Work Breakdown Structure) - Master Document

> **프로젝트명**: WOORIDO (우리두) - 커뮤니티 기반 저축 모임 플랫폼
> **Demo Day**: 2026-02-25
> **전체 기간**: 57일 (8주)
> **작성일**: 2026-01-06
> **버전**: v1.0 Final

---

## Executive Summary

### 프로젝트 개요
- **목표**: 커뮤니티(SNS) + 금융(계모임) 통합 플랫폼 Demo Day 시연
- **핵심 차별화**: Trust Triangle (선충전 락 + 투표 승인 + 장부 투명화)
- **기술 스택**: React 18.3.1 + Spring Boot 3.1.18 + Django 5.1 + Oracle 21c
- **총 API**: 48개 (Spring Boot 44개 + Django 4개)

### 팀 구성
| 역할 | 인원 | 담당 업무 |
|------|------|----------|
| Frontend | 1명 | React 컴포넌트, API 연동, UX 구현 |
| Backend (Spring) | 1명 | REST API, MyBatis Mapper, 트랜잭션 |
| Backend (Django) | 1명 | pandas 분석 API, 재정 통계 |
| PM/QA | 1명 | 일정 관리, 테스트, 문서화 |

### Critical Path 요약
```
Week 1 (환경 세팅) → Week 2-3 (SNS 개발, Critical Path)
  → Week 4 (가입 플로우) → Week 5 (장부+Django 분석)
  → Week 6-7 (투표 시스템) → Week 8 (통합 테스트)
  → Week 9 (리허설) → Demo Day
```

**⚠️ 가장 리스크 높은 구간: Week 2-3 (SNS 18개 API)**

---

## Phase 1: 환경 세팅 및 기초 구축 (Week 1: 12/30-1/5)

### 목표
- 개발 환경 100% 작동 (Spring + Django + Oracle)
- JWT 인증 기본 구현
- Spring ↔ Django HTTP 통신 테스트 성공
- 테스트용 Seed 데이터 생성

### 주요 작업

#### 1.1 로컬 환경 구축 (DevOps)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| ENV-001 | Oracle 21c Docker 설치 및 실행 | DevOps | 0.5일 | - | ⬜ Pending |
| ENV-002 | Spring Boot 3.1.18 프로젝트 초기화 | Backend | 0.5일 | ENV-001 | ⬜ Pending |
| ENV-003 | React 18.3.1 + Vite 프로젝트 세팅 | Frontend | 0.5일 | - | ⬜ Pending |
| ENV-004 | Django 5.1 프로젝트 초기화 + pandas | Backend | 0.5일 | - | ⬜ Pending |
| ENV-005 | Spring → Django HTTP 통신 테스트 | Backend | 0.5일 | ENV-002, ENV-004 | ⬜ Pending |

**Checkpoint (1/5):**
- ✅ `curl http://localhost:8080/api/health` 정상 응답
- ✅ `curl http://localhost:8000/health` 정상 응답
- ✅ Spring → Django 통신 200 OK

#### 1.2 인증 시스템 (Backend + Frontend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| AUTH-001 | Spring Security + JWT 설정 | Backend | 1일 | ENV-002 | ⬜ Pending |
| AUTH-002 | 회원가입 API (POST /api/auth/signup) | Backend | 0.5일 | AUTH-001 | ⬜ Pending |
| AUTH-003 | 로그인 API (POST /api/auth/login) | Backend | 0.5일 | AUTH-001 | ⬜ Pending |
| AUTH-004 | 로그인 페이지 UI | Frontend | 1일 | ENV-003 | ⬜ Pending |
| AUTH-005 | 로그인 API 연동 | Frontend | 0.5일 | AUTH-003, AUTH-004 | ⬜ Pending |
| AUTH-006 | JWT 토큰 저장 (httpOnly Cookie) | Frontend | 0.5일 | AUTH-005 | ⬜ Pending |

**Checkpoint (1/5):**
- ✅ 로그인 성공 시 JWT 토큰 발급
- ✅ Protected Route 접근 제어 동작

#### 1.3 Seed 데이터 (Backend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| SEED-001 | 테스트 유저 5명 생성 SQL | Backend | 0.25일 | ENV-001 | ⬜ Pending |
| SEED-002 | 테스트 모임 2개 생성 (책벌레들, 영화광들) | Backend | 0.25일 | SEED-001 | ⬜ Pending |
| SEED-003 | 테스트 피드 10개 생성 | Backend | 0.25일 | SEED-002 | ⬜ Pending |
| SEED-004 | 테스트 장부 내역 5개 생성 | Backend | 0.25일 | SEED-002 | ⬜ Pending |

**Checkpoint (1/5):**
- ✅ 테스트 모임 2개 DB 존재
- ✅ 피드 조회 시 10개 데이터 반환

#### 1.4 공통 컴포넌트 (Frontend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| UI-001 | Tailwind CSS 설정 (디자인 토큰) | Frontend | 0.5일 | ENV-003 | ⬜ Pending |
| UI-002 | Radix UI 설치 및 기본 설정 | Frontend | 0.25일 | UI-001 | ⬜ Pending |
| UI-003 | Skeleton 컴포넌트 (Card/List/Page) | Frontend | 0.5일 | UI-001 | ⬜ Pending |
| UI-004 | Toast 시스템 (sonner) | Frontend | 0.25일 | UI-002 | ⬜ Pending |
| UI-005 | Header + BottomNav 레이아웃 | Frontend | 0.5일 | UI-001 | ⬜ Pending |

**Checkpoint (1/5):**
- ✅ Skeleton 컴포넌트 3종 Storybook 확인
- ✅ Toast 정상 작동

### 주차 마일스톤
| 항목 | 완료 기준 |
|------|----------|
| 환경 세팅 | 모든 서버 정상 작동 (Spring, Django, Oracle, React) |
| 인증 | 로그인 가능 + JWT 보호 라우트 동작 |
| Seed 데이터 | 테스트 모임 2개, 유저 5명, 피드 10개 존재 |
| Spring-Django 통신 | Hello World API 호출 성공 |

### 리스크 및 대응
| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| Oracle Docker 설치 실패 | Medium | High | Docker Desktop 사전 설치 + 포트 충돌 확인 |
| Spring-Django 통신 실패 | Medium | High | Week 1 우선 검증, Postman 테스트 |
| JWT 구현 복잡도 | Low | Medium | Spring Security 템플릿 활용 |

**버퍼 타임**: 1일 (1/5 오후)

---

## Phase 2-3: SNS 기능 완성 (Week 2-3: 1/6-1/19) ⚠️ **Critical Path**

### 목표
- 피드 작성 → 댓글 → 좋아요 Full Flow 작동
- 이미지 업로드 (S3) 성공
- 페이지네이션 20개씩 정상 작동
- 공지사항 핀 고정 기능

### 주요 작업

#### 2.1 피드 CRUD (Backend + Frontend) - Week 2 전반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| POST-001 | 피드 DB 스키마 설계 (posts 테이블) | Backend | 0.5일 | ENV-001 | ⬜ Pending |
| POST-002 | 피드 목록 API (GET /api/groups/:id/posts) | Backend | 1일 | POST-001 | ⬜ Pending |
| POST-003 | 피드 작성 API (POST /api/groups/:id/posts) | Backend | 1일 | POST-001 | ⬜ Pending |
| POST-004 | 피드 수정/삭제 API | Backend | 0.5일 | POST-003 | ⬜ Pending |
| POST-005 | 공지사항 핀 고정 API (PUT /api/posts/:id/pin) | Backend | 0.5일 | POST-003 | ⬜ Pending |
| POST-006 | 피드 목록 UI + Skeleton | Frontend | 1일 | UI-003 | ⬜ Pending |
| POST-007 | 피드 작성 폼 UI | Frontend | 1일 | POST-006 | ⬜ Pending |
| POST-008 | 피드 API 연동 | Frontend | 1일 | POST-002, POST-006 | ⬜ Pending |

**Checkpoint (1/12):**
- ✅ 피드 목록 조회 성공 (페이지네이션 20개)
- ✅ 피드 작성 → 목록 갱신 확인
- ✅ CP 계정으로 공지 핀 고정 확인

#### 2.2 댓글 시스템 (Backend + Frontend) - Week 2 후반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| COMMENT-001 | 댓글 DB 스키마 설계 (comments 테이블) | Backend | 0.25일 | POST-001 | ⬜ Pending |
| COMMENT-002 | 댓글 목록 API (GET /api/posts/:id/comments) | Backend | 0.5일 | COMMENT-001 | ⬜ Pending |
| COMMENT-003 | 댓글 작성 API (POST /api/posts/:id/comments) | Backend | 0.5일 | COMMENT-001 | ⬜ Pending |
| COMMENT-004 | 대댓글 작성 API (parentId 지원) | Backend | 0.5일 | COMMENT-003 | ⬜ Pending |
| COMMENT-005 | 댓글 수정/삭제 API | Backend | 0.25일 | COMMENT-003 | ⬜ Pending |
| COMMENT-006 | 댓글 목록 UI (2단계 depth) | Frontend | 1일 | POST-006 | ⬜ Pending |
| COMMENT-007 | 댓글 작성 폼 | Frontend | 0.5일 | COMMENT-006 | ⬜ Pending |
| COMMENT-008 | 댓글 API 연동 | Frontend | 1일 | COMMENT-002, COMMENT-006 | ⬜ Pending |

**Checkpoint (1/15):**
- ✅ 댓글 작성 → 목록 갱신 확인
- ✅ 대댓글 2단계 렌더링 확인

#### 2.3 좋아요 시스템 (Backend + Frontend) - Week 3 전반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| LIKE-001 | 좋아요 DB 스키마 (post_likes, comment_likes) | Backend | 0.25일 | POST-001, COMMENT-001 | ⬜ Pending |
| LIKE-002 | 피드 좋아요 토글 API (POST /api/posts/:id/like) | Backend | 0.5일 | LIKE-001 | ⬜ Pending |
| LIKE-003 | 댓글 좋아요 토글 API (POST /api/comments/:id/like) | Backend | 0.5일 | LIKE-001 | ⬜ Pending |
| LIKE-004 | 좋아요 버튼 UI (44px 터치 타겟) | Frontend | 0.5일 | POST-006 | ⬜ Pending |
| LIKE-005 | Optimistic Update 구현 | Frontend | 1일 | LIKE-002, LIKE-004 | ⬜ Pending |
| LIKE-006 | 좋아요 애니메이션 (Framer Motion) | Frontend | 0.5일 | LIKE-004 | ⬜ Pending |

**Checkpoint (1/17):**
- ✅ 좋아요 클릭 시 즉시 반영 (Optimistic UI)
- ✅ 실패 시 롤백 동작 확인

#### 2.4 이미지 업로드 (Backend + Frontend) - Week 3 후반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| MEDIA-001 | S3 Bucket 생성 및 IAM 설정 | DevOps | 0.5일 | - | ⬜ Pending |
| MEDIA-002 | 이미지 업로드 API (POST /api/groups/:id/media) | Backend | 1일 | MEDIA-001 | ⬜ Pending |
| MEDIA-003 | 이미지 삭제 API (DELETE /api/media/:id) | Backend | 0.25일 | MEDIA-002 | ⬜ Pending |
| MEDIA-004 | 이미지 업로드 UI (드래그앤드롭) | Frontend | 1일 | POST-007 | ⬜ Pending |
| MEDIA-005 | Progress Bar 구현 | Frontend | 0.5일 | MEDIA-004 | ⬜ Pending |
| MEDIA-006 | 업로드 실패 Fallback (텍스트만 게시) | Frontend | 0.5일 | MEDIA-002, MEDIA-004 | ⬜ Pending |

**Checkpoint (1/19):**
- ✅ 이미지 업로드 성공 (최대 10장)
- ✅ 업로드 실패 시 텍스트만 게시 가능

### 주차 마일스톤 (Week 2-3 종합)
| 항목 | 완료 기준 |
|------|----------|
| SNS Full Flow | 피드 작성 → 댓글 → 좋아요 → 이미지 업로드 전체 동작 |
| 성능 | 피드 목록 로딩 < 2초 |
| UX | Skeleton UI 모든 로딩 상태에 적용 |
| 안정성 | API 실패 시 Toast 메시지 + 재시도 가능 |

### 리스크 및 대응
| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| **API 18개 개발 지연** | **High** | **Critical** | Week 2 중간 점검, 50% 미달 시 이미지 업로드 Post-Demo 이동 |
| S3 연동 실패 | Medium | Medium | 로컬 파일 저장 Fallback 준비 |
| 페이지네이션 성능 문제 | Low | Medium | Oracle Pagination 최적화 (OFFSET 대신 CURSOR) |
| Optimistic Update 버그 | Medium | Low | 실패 시 전체 새로고침 Fallback |

**버퍼 타임**: 1일 (1/19 오후) - Week 2 목표 미달 시 사용

---

## Phase 3: 가입 플로우 및 가상머니 (Week 4: 1/20-1/26)

### 목표
- 충전 → 가입 → 보증금 락 Full Flow 작동
- 충전 후 자동 복귀 (returnUrl) 검증
- 잔액 표시 (가용/락 분리) 정상 작동

### 주요 작업

#### 3.1 어카운트 시스템 (Backend + Frontend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| ACCOUNT-001 | 어카운트 DB 스키마 (accounts 테이블) | Backend | 0.25일 | ENV-001 | ⬜ Pending |
| ACCOUNT-002 | 잔액 조회 API (GET /api/users/me/account) | Backend | 0.5일 | ACCOUNT-001 | ⬜ Pending |
| ACCOUNT-003 | 충전 API (POST /api/users/me/account/charge) | Backend | 1일 | ACCOUNT-001 | ⬜ Pending |
| ACCOUNT-004 | 토스페이 Mock 연동 | Backend | 1일 | ACCOUNT-003 | ⬜ Pending |
| ACCOUNT-005 | 거래 내역 API (GET /api/account/transactions) | Backend | 0.5일 | ACCOUNT-001 | ⬜ Pending |
| ACCOUNT-006 | 잔액 카드 UI (가용/락 분리) | Frontend | 1일 | UI-001 | ⬜ Pending |
| ACCOUNT-007 | 충전 폼 UI (프리셋 버튼) | Frontend | 1일 | ACCOUNT-006 | ⬜ Pending |
| ACCOUNT-008 | 충전 API 연동 + returnUrl | Frontend | 1일 | ACCOUNT-003, ACCOUNT-007 | ⬜ Pending |
| ACCOUNT-009 | 거래 내역 UI (타임라인) | Frontend | 0.5일 | ACCOUNT-005 | ⬜ Pending |

**Checkpoint (1/23):**
- ✅ 충전 성공 시 토스페이 Mock 화면 진입
- ✅ 충전 후 returnUrl로 자동 복귀

#### 3.2 모임 생성 (Backend + Frontend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| GROUP-001 | 모임 DB 스키마 (gye 테이블) | Backend | 0.25일 | ENV-001 | ⬜ Pending |
| GROUP-002 | 모임 생성 API (POST /api/groups) | Backend | 1일 | GROUP-001 | ⬜ Pending |
| GROUP-003 | 모임 상세 API (GET /api/groups/:id) | Backend | 0.5일 | GROUP-001 | ⬜ Pending |
| GROUP-004 | 모임 수정 API (PUT /api/groups/:id, CP 전용) | Backend | 0.5일 | GROUP-002 | ⬜ Pending |
| GROUP-005 | 모임 생성 폼 UI (3단계 Step) | Frontend | 1.5일 | UI-001 | ⬜ Pending |
| GROUP-006 | 보증금 미리보기 계산 | Frontend | 0.5일 | GROUP-005 | ⬜ Pending |
| GROUP-007 | 모임 생성 API 연동 | Frontend | 0.5일 | GROUP-002, GROUP-005 | ⬜ Pending |

**Checkpoint (1/24):**
- ✅ 모임 생성 성공 → 상세 페이지 이동
- ✅ 보증금 미리보기 자동 계산 확인

#### 3.3 가입 플로우 (Backend + Frontend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| JOIN-001 | 멤버 DB 스키마 (gye_members 테이블) | Backend | 0.25일 | GROUP-001 | ⬜ Pending |
| JOIN-002 | 가입 API (POST /api/groups/:id/join) | Backend | 1.5일 | JOIN-001, ACCOUNT-001 | ⬜ Pending |
| JOIN-003 | 보증금 락 로직 (트랜잭션) | Backend | 1일 | JOIN-002 | ⬜ Pending |
| JOIN-004 | 멤버 목록 API (GET /api/groups/:id/members) | Backend | 0.5일 | JOIN-001 | ⬜ Pending |
| JOIN-005 | 모임 상세 페이지 (공개) UI | Frontend | 1일 | GROUP-005 | ⬜ Pending |
| JOIN-006 | 가입 확인 모달 (비용 계산) | Frontend | 1일 | JOIN-005 | ⬜ Pending |
| JOIN-007 | 잔액 부족 분기 (충전 유도) | Frontend | 0.5일 | JOIN-006, ACCOUNT-007 | ⬜ Pending |
| JOIN-008 | 가입 API 연동 | Frontend | 1日 | JOIN-002, JOIN-006 | ⬜ Pending |

**Checkpoint (1/26):**
- ✅ 충전 → 가입 → 보증금 락 Full Flow 성공
- ✅ 잔액 부족 시 충전 유도 → returnUrl 복귀

#### 3.4 온보딩 (Frontend)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| ONBOARD-001 | 신규 유저 웰컴 카드 | Frontend | 0.5일 | AUTH-006 | ⬜ Pending |
| ONBOARD-002 | 인기 모임 추천 API (GET /api/groups/popular) | Backend | 0.5일 | GROUP-001 | ⬜ Pending |
| ONBOARD-003 | 인기 모임 추천 UI | Frontend | 0.5일 | ONBOARD-002 | ⬜ Pending |
| ONBOARD-004 | 빈 상태 CTA (모임 없음) | Frontend | 0.5일 | UI-001 | ⬜ Pending |

**Checkpoint (1/26):**
- ✅ 신규 유저 첫 접속 시 웰컴 카드 표시
- ✅ 모임 없을 때 인기 모임 추천

### 주차 마일스톤
| 항목 | 완료 기준 |
|------|----------|
| 가입 Flow | 충전 → 가입 → 보증금 락 전체 동작 |
| 충전 복귀 | returnUrl 정상 작동 (이탈 방지) |
| 온보딩 | 신규 유저 이탈 방지 UX 완성 |

### 리스크 및 대응
| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| 보증금 락 트랜잭션 복잡도 | Medium | High | Week 4 초반 집중 개발, 단위 테스트 철저히 |
| 토스페이 Mock 연동 실패 | Low | Medium | 로컬 시뮬레이션으로 대체 |
| returnUrl 분기 처리 누락 | Medium | High | 시나리오별 테스트 케이스 작성 |

**버퍼 타임**: 0.5일 (1/26 오후)

---

## Phase 4: 장부 시각화 및 Django 분석 (Week 5: 1/27-2/5)

### 목표
- 장부 차트 정상 렌더링 (Recharts Line + Pie)
- Django 분석 API 3초 이내 응답
- 분석 실패 시 Fallback UI 표시
- 투표 → 장부 자동 기록 테스트 성공

### 주요 작업

#### 4.1 투표 API (Backend) - Week 5 전반 (선행 작업)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| VOTE-001 | 투표 DB 스키마 (votes, vote_casts 테이블) | Backend | 0.25일 | GROUP-001 | ⬜ Pending |
| VOTE-002 | 투표 생성 API (POST /api/groups/:id/votes) | Backend | 1일 | VOTE-001 | ⬜ Pending |
| VOTE-003 | 투표 참여 API (POST /api/votes/:id/cast) | Backend | 1일 | VOTE-001 | ⬜ Pending |
| VOTE-004 | 과반수 판정 로직 | Backend | 0.5일 | VOTE-003 | ⬜ Pending |
| VOTE-005 | 투표 결과 API (GET /api/votes/:id/result) | Backend | 0.5일 | VOTE-003 | ⬜ Pending |

**Checkpoint (1/31):**
- ✅ 투표 생성 → 참여 → 결과 조회 성공
- ✅ 과반수 판정 로직 테스트 통과

#### 4.2 장부 시스템 (Backend) - Week 5 전반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| LEDGER-001 | 장부 DB 스키마 (ledger_entries 테이블) | Backend | 0.25일 | GROUP-001 | ⬜ Pending |
| LEDGER-002 | 장부 타임라인 API (GET /api/groups/:id/ledger) | Backend | 1일 | LEDGER-001 | ⬜ Pending |
| LEDGER-003 | 장부 요약 API (GET /api/groups/:id/ledger/summary) | Backend | 1일 | LEDGER-001 | ⬜ Pending |
| LEDGER-004 | 투표 승인 → 장부 기록 연동 | Backend | 1.5일 | VOTE-004, LEDGER-001 | ⬜ Pending |
| LEDGER-005 | 장부 메모 수정 API (PUT /api/ledger/:id, CP 전용) | Backend | 0.5일 | LEDGER-002 | ⬜ Pending |

**Checkpoint (1/31):**
- ✅ 투표 승인 → 장부 자동 기록 테스트 통과

#### 4.3 Django 분석 API (Backend) - Week 5 후반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| DJANGO-001 | Django 분석 API 구조 설계 | Backend | 0.25일 | ENV-004 | ⬜ Pending |
| DJANGO-002 | POST /api/analyze/monthly-stats (월별 통계) | Backend | 1일 | DJANGO-001 | ⬜ Pending |
| DJANGO-003 | POST /api/analyze/category-ratio (카테고리 비율) | Backend | 1일 | DJANGO-001 | ⬜ Pending |
| DJANGO-004 | POST /api/analyze/trend (지출 트렌드) | Backend | 1일 | DJANGO-001 | ⬜ Pending |
| DJANGO-005 | pandas 집계 로직 구현 | Backend | 1.5일 | DJANGO-002 | ⬜ Pending |
| DJANGO-006 | Spring → Django 프록시 API | Backend | 1일 | LEDGER-003, DJANGO-002 | ⬜ Pending |

**Checkpoint (2/3):**
- ✅ Django 분석 API 3초 이내 응답
- ✅ Spring → Django 프록시 정상 작동

#### 4.4 차트 시각화 (Frontend) - Week 5 후반
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| CHART-001 | Recharts Line Chart (월별 추이) | Frontend | 1일 | DJANGO-004 | ⬜ Pending |
| CHART-002 | Recharts Pie Chart (카테고리 비율) | Frontend | 1일 | DJANGO-003 | ⬜ Pending |
| CHART-003 | 분석 요약 카드 UI | Frontend | 0.5일 | DJANGO-002 | ⬜ Pending |
| CHART-004 | 차트 Skeleton UI | Frontend | 0.25일 | UI-003 | ⬜ Pending |
| CHART-005 | 분석 실패 Fallback UI (기본 통계) | Frontend | 1일 | CHART-001 | ⬜ Pending |
| CHART-006 | 장부 타임라인 UI (무한스크롤) | Frontend | 1일 | LEDGER-002 | ⬜ Pending |
| CHART-007 | 빈 장부 Empty State CTA | Frontend | 0.5일 | CHART-006 | ⬜ Pending |

**Checkpoint (2/5):**
- ✅ 차트 정상 렌더링 (Line + Pie)
- ✅ Django 실패 시 Fallback UI 표시

### 주차 마일스톤
| 항목 | 완료 기준 |
|------|----------|
| 투표-장부 연동 | 투표 승인 → 장부 자동 기록 동작 |
| Django 분석 | 3초 이내 응답 + Fallback 정상 |
| 차트 | Recharts 2종 렌더링 성공 |

### 리스크 및 대응
| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| Django 분석 성능 문제 | Medium | High | pandas 집계 최적화, 캐싱 도입 |
| Spring-Django 통신 실패 | Medium | Critical | Fallback UI 필수 구현 |
| 투표-장부 트랜잭션 복잡도 | High | Critical | Week 5 전반 집중 개발, 단위 테스트 |

**버퍼 타임**: 1일 (2/5 오후)

---

## Phase 5: 투표 시스템 UI 및 Full Flow (Week 6-7: 2/6-2/14)

### 목표
- 지출 요청 → 투표 → 승인 → 장부 기록 Full Flow 작동
- 투표 UI 정상 렌더링 (Progress Bar + Optimistic UI)
- 빈 투표 Empty State CTA 표시

### 주요 작업

#### 5.1 투표 UI (Frontend) - Week 6
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| VOTE-UI-001 | 진행 중 투표 리스트 UI | Frontend | 1일 | VOTE-002 | ⬜ Pending |
| VOTE-UI-002 | 빈 투표 Empty State (CP 권한 안내) | Frontend | 0.5일 | VOTE-UI-001 | ⬜ Pending |
| VOTE-UI-003 | 투표 상세 모달 (Skeleton) | Frontend | 1일 | VOTE-UI-001 | ⬜ Pending |
| VOTE-UI-004 | 찬성/반대 버튼 (56px, Optimistic UI) | Frontend | 1일 | VOTE-003, VOTE-UI-003 | ⬜ Pending |
| VOTE-UI-005 | Progress Bar (진행률 표시) | Frontend | 0.5일 | VOTE-UI-004 | ⬜ Pending |
| VOTE-UI-006 | 마감 임박 강조 UI | Frontend | 0.5일 | VOTE-UI-001 | ⬜ Pending |

**Checkpoint (2/9):**
- ✅ 투표 목록 → 상세 → 참여 동작 확인
- ✅ Optimistic UI 정상 작동

#### 5.2 지출 요청 (Frontend + Backend) - Week 7
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| EXPENSE-001 | 지출 요청 폼 UI (CP 전용) | Frontend | 1일 | VOTE-UI-001 | ⬜ Pending |
| EXPENSE-002 | 멤버 권한 안내 모달 | Frontend | 0.5일 | EXPENSE-001 | ⬜ Pending |
| EXPENSE-003 | 지출 요청 API 연동 | Frontend | 0.5일 | VOTE-002, EXPENSE-001 | ⬜ Pending |
| EXPENSE-004 | 완료된 투표 이력 UI | Frontend | 1일 | VOTE-005 | ⬜ Pending |
| EXPENSE-005 | 장부 연결 링크 (투표 → 장부) | Frontend | 0.5일 | CHART-006, EXPENSE-004 | ⬜ Pending |

**Checkpoint (2/12):**
- ✅ CP 계정으로 지출 요청 생성 성공
- ✅ 투표 → 장부 연결 링크 동작

#### 5.3 Full Flow 통합 테스트 (PM/QA) - Week 7
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| FLOW-001 | 지출 요청 시나리오 테스트 | PM | 0.5일 | EXPENSE-003 | ⬜ Pending |
| FLOW-002 | 투표 참여 시나리오 테스트 | PM | 0.5일 | VOTE-UI-004 | ⬜ Pending |
| FLOW-003 | 장부 기록 검증 | PM | 0.5일 | LEDGER-004, FLOW-002 | ⬜ Pending |
| FLOW-004 | 버그 수정 (Backend + Frontend) | All | 2일 | FLOW-001, FLOW-002, FLOW-003 | ⬜ Pending |

**Checkpoint (2/14):**
- ✅ 지출 요청 → 투표 → 승인 → 장부 Full Flow 성공

### 주차 마일스톤
| 항목 | 완료 기준 |
|------|----------|
| 투표 UI | 목록 → 상세 → 참여 전체 동작 |
| Full Flow | 지출 요청 → 투표 → 승인 → 장부 기록 검증 |
| Empty State | 빈 투표 CTA 표시 |

### 리스크 및 대응
| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| Full Flow 통합 버그 | High | Critical | Week 7 전체를 테스트에 할애 |
| Optimistic UI 롤백 실패 | Medium | Medium | 실패 시 전체 새로고침 Fallback |

**버퍼 타임**: 1일 (2/14 오후)

---

## Phase 6: 통합 테스트 및 안정화 (Week 8: 2/15-2/20)

### 목표
- 시연 시나리오 성공률 100%
- Spring ↔ Django 통신 안정성 확인
- 모든 Empty State CTA 검증
- 에러 복구 경로 검증

### 주요 작업

#### 6.1 시나리오 테스트 (PM/QA)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| TEST-001 | SNS 시연 테스트 (10회 반복) | PM | 1일 | POST-008, COMMENT-008, LIKE-005 | ⬜ Pending |
| TEST-002 | 온보딩 시연 테스트 | PM | 0.5일 | ONBOARD-001, ONBOARD-003 | ⬜ Pending |
| TEST-003 | 가입 시연 테스트 | PM | 1일 | JOIN-008, ACCOUNT-008 | ⬜ Pending |
| TEST-004 | 장부 시연 테스트 | PM | 1일 | CHART-001, DJANGO-006 | ⬜ Pending |
| TEST-005 | 투표 시연 테스트 | PM | 1일 | EXPENSE-003, FLOW-003 | ⬜ Pending |
| TEST-006 | 모든 Empty State 검증 | PM | 0.5일 | All Empty State Tasks | ⬜ Pending |

**Checkpoint (2/18):**
- ✅ 모든 시연 시나리오 10회 성공

#### 6.2 에러 복구 테스트 (PM/QA)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| ERROR-001 | 네트워크 에러 복구 | PM | 0.5일 | All API Tasks | ⬜ Pending |
| ERROR-002 | Spring-Django 통신 실패 Fallback | PM | 0.5일 | DJANGO-006, CHART-005 | ⬜ Pending |
| ERROR-003 | 충전 실패 복구 | PM | 0.25일 | ACCOUNT-008 | ⬜ Pending |
| ERROR-004 | 이미지 업로드 실패 Fallback | PM | 0.25일 | MEDIA-006 | ⬜ Pending |
| ERROR-005 | 토스트 메시지 구체성 검증 | PM | 0.5일 | All Tasks | ⬜ Pending |

**Checkpoint (2/19):**
- ✅ 모든 에러 경로 복구 가능

#### 6.3 버그 수정 (All)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| BUG-001 | Critical 버그 수정 | All | 2일 | TEST-001~006, ERROR-001~005 | ⬜ Pending |
| BUG-002 | UI 버그 수정 (반응형) | Frontend | 1일 | BUG-001 | ⬜ Pending |
| BUG-003 | 성능 최적화 | Backend | 0.5일 | BUG-001 | ⬜ Pending |

**Checkpoint (2/20):**
- ✅ Critical 버그 0건
- ✅ 시연 성공률 100%

### 주차 마일스톤
| 항목 | 완료 기준 |
|------|----------|
| 시연 성공률 | 10회 반복 100% 성공 |
| 에러 복구 | 모든 에러 경로 검증 완료 |
| 안정성 | Spring-Django 통신 안정 |

### 리스크 및 대응
| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| Critical 버그 발견 | Medium | Critical | Week 8 전체를 버그 수정에 할애 |
| 성능 문제 | Low | Medium | 성능 최적화 우선순위 조정 |

**버퍼 타임**: 0.5일 (2/20 오후)

---

## Phase 7: Demo Day 리허설 (Week 9: 2/21-2/25)

### 목표
- 시연 대본 작성 (6분)
- 리허설 5회 이상
- 백업 시연 영상 준비
- 예상 질문 답변 준비

### 주요 작업

#### 7.1 시연 준비 (PM)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| DEMO-001 | 시연 대본 작성 (6분) | PM | 0.5일 | - | ⬜ Pending |
| DEMO-002 | PPT 발표 자료 준비 | PM | 1일 | DEMO-001 | ⬜ Pending |
| DEMO-003 | 리허설 1차 (팀 내부) | All | 0.25일 | DEMO-001 | ⬜ Pending |
| DEMO-004 | 리허설 2-5차 | All | 2일 | DEMO-003 | ⬜ Pending |
| DEMO-005 | 백업 시연 영상 녹화 | PM | 0.5일 | DEMO-004 | ⬜ Pending |
| DEMO-006 | 예상 질문 답변 준비 | All | 0.5일 | DEMO-002 | ⬜ Pending |

**Checkpoint (2/24):**
- ✅ 리허설 5회 완료
- ✅ 백업 영상 준비 완료

#### 7.2 최종 점검 (All)
| Task ID | 작업 내용 | Owner | Duration | Dependencies | Status |
|---------|----------|-------|----------|--------------|--------|
| FINAL-001 | 서버 안정성 점검 | DevOps | 0.25일 | - | ⬜ Pending |
| FINAL-002 | DB 백업 | DevOps | 0.25일 | - | ⬜ Pending |
| FINAL-003 | Demo Day 당일 체크리스트 | PM | 0.25일 | DEMO-006 | ⬜ Pending |

**Checkpoint (2/25 오전):**
- ✅ 모든 서버 정상 작동
- ✅ Demo Day 준비 완료

### Demo Day (2/25)
- 오전: 최종 점검
- 오후: 시연 발표

---

## 종합 마일스톤

| Phase | Week | 마일스톤 | 검증 기준 |
|-------|------|----------|----------|
| Phase 1 | Week 1 | 개발 환경 100% 작동 | Spring + Django + Oracle + React 정상, JWT 인증 작동 |
| Phase 2-3 | Week 2-3 | SNS 기능 완성 | 피드 → 댓글 → 좋아요 → 이미지 Full Flow |
| Phase 3 | Week 4 | 가입 플로우 완성 | 충전 → 가입 → 보증금 락 Full Flow |
| Phase 4 | Week 5 | 장부 + Django 분석 완성 | 차트 렌더링 + 분석 3초 이내 + Fallback |
| Phase 5 | Week 6-7 | 투표 시스템 완성 | 지출 요청 → 투표 → 승인 → 장부 Full Flow |
| Phase 6 | Week 8 | 통합 테스트 완료 | 시연 성공률 100%, Critical 버그 0건 |
| Phase 7 | Week 9 | Demo Day 준비 | 리허설 5회 완료, 백업 영상 준비 |

---

## 팀별 작업 분배 요약

### Frontend Team
- **주요 책임**: React 컴포넌트, UX 구현, API 연동
- **총 작업**: 약 40개 Task
- **Critical Path**: Week 2-3 (SNS UI), Week 5 (차트), Week 6-7 (투표 UI)
- **부하 분포**: Week 2-3 집중 (18개 API), 이후 분산

### Backend (Spring Boot) Team
- **주요 책임**: REST API, MyBatis Mapper, 트랜잭션
- **총 작업**: 약 50개 Task
- **Critical Path**: Week 2-3 (SNS API), Week 4 (보증금 락), Week 5 (투표-장부 연동)
- **부하 분포**: Week 2-3, Week 5 집중

### Backend (Django) Team
- **주요 책임**: pandas 분석 API, 재정 통계
- **총 작업**: 약 10개 Task
- **Critical Path**: Week 5 (분석 API 4개)
- **부하 분포**: Week 5 집중, 이후 성능 최적화

### PM/QA Team
- **주요 책임**: 일정 관리, 테스트, 문서화
- **총 작업**: 약 20개 Task
- **Critical Path**: Week 8 (통합 테스트), Week 9 (리허설)
- **부하 분포**: Week 8-9 집중

---

## Critical Path 분석

### 1순위 Critical Path: SNS 개발 (Week 2-3)
- **영향도**: 전체 일정 지연 직결
- **병목점**: Backend API 18개 + Frontend 컴포넌트
- **완화 전략**:
  - Week 2 중간 점검 (50% 진척도 확인)
  - 미달 시 이미지 업로드 Post-Demo 이동
  - MSW 활용 Frontend-First 개발

### 2순위 Critical Path: 투표-장부 연동 (Week 5)
- **영향도**: 핵심 차별화 기능
- **병목점**: 트랜잭션 복잡도, Django 통신
- **완화 전략**:
  - Week 5 전반에 투표 API 선행 개발
  - Django Fallback UI 필수 구현
  - 단위 테스트 철저히

### 3순위 Critical Path: 통합 테스트 (Week 8)
- **영향도**: Demo Day 성공 여부
- **병목점**: 버그 수정 시간 부족
- **완화 전략**:
  - Week 7까지 Critical 버그 0건 목표
  - Week 8 전체를 테스트에 할애

---

## 리스크 관리 종합

### High Priority 리스크

#### 1. SNS API 18개 개발 지연
- **확률**: High
- **영향도**: Critical
- **완화 전략**:
  - Week 2 중간 점검 (1/12)
  - 50% 미달 시 이미지 업로드 Post-Demo 이동
  - MSW 활용 Frontend-First 개발
- **대체 계획**: 이미지 없이 텍스트만 게시 가능

#### 2. Spring-Django 통신 실패
- **확률**: Medium
- **영향도**: High
- **완화 전략**:
  - Week 1에 통신 우선 검증
  - Fallback UI 필수 구현 (기본 통계만 표시)
- **대체 계획**: Django 분석 간소화 (Spring에서 간단한 집계만)

#### 3. 보증금 락 트랜잭션 복잡도
- **확률**: High
- **영향도**: Critical
- **완화 전략**:
  - Week 4 초반 집중 개발
  - 단위 테스트 철저히
  - 트랜잭션 롤백 시나리오 검증
- **대체 계획**: 없음 (핵심 차별화 기능)

#### 4. 통합 테스트 시간 부족
- **확률**: Medium
- **영향도**: Critical
- **완화 전략**:
  - Week 7까지 Critical 버그 최소화
  - Week 8 전체를 테스트에 할애
- **대체 계획**: Week 9 리허설 시간 일부 할애

### Medium Priority 리스크

#### 5. 토스페이 Mock 연동 실패
- **확률**: Low
- **영향도**: Medium
- **완화 전략**: 로컬 시뮬레이션으로 대체

#### 6. S3 연동 실패
- **확률**: Medium
- **영향도**: Medium
- **완화 전략**: 로컬 파일 저장 Fallback

#### 7. 성능 문제
- **확률**: Medium
- **영향도**: Medium
- **완화 전략**: Week 8 성능 최적화 시간 확보

---

## 일정 최적화 체크리스트

### 병렬 처리 가능 작업
- ✅ Week 1: Frontend 환경 세팅 || Backend 환경 세팅
- ✅ Week 2-3: Frontend SNS UI || Backend SNS API (MSW 활용)
- ✅ Week 4: Frontend 가입 UI || Backend 가입 API
- ✅ Week 5: Frontend 차트 UI || Django 분석 API

### 순차 필수 작업
- 🔗 Week 1: Oracle 설치 → Spring Boot 연결
- 🔗 Week 2: 피드 API → 댓글 API → 좋아요 API
- 🔗 Week 4: 충전 API → 가입 API → 보증금 락
- 🔗 Week 5: 투표 API → 장부 API → Django 분석 연동

### 우선순위 검증
- ✅ P0 (필수): SNS, 가입, 장부, 투표, Django 분석
- ✅ P1 (중요): 이미지 업로드, 온보딩, 반응형
- ✅ P2 (선택): Elasticsearch, 무한스크롤, Dark Mode → Post-Demo

### 버퍼 타임 확보
- ✅ Week 1: 1일 (1/5 오후)
- ✅ Week 2-3: 1일 (1/19 오후)
- ✅ Week 4: 0.5일 (1/26 오후)
- ✅ Week 5: 1일 (2/5 오후)
- ✅ Week 6-7: 1일 (2/14 오후)
- ✅ Week 8: 0.5일 (2/20 오후)

### 조기 통합 시작
- ✅ Week 2부터 MSW 활용 Frontend-First 개발
- ✅ Week 3부터 실제 API 통합 시작
- ✅ Week 5부터 Spring-Django 통합

---

## 주간 보고 지표

### 진행률 측정 기준
| Week | 목표 진척도 | 측정 방식 |
|------|------------|----------|
| Week 1 | 10% | 환경 세팅 완료 Task 수 / 전체 Task 수 |
| Week 2-3 | 40% | SNS API 완료 Task 수 / 전체 Task 수 |
| Week 4 | 55% | 가입 Flow 완료 Task 수 / 전체 Task 수 |
| Week 5 | 70% | 장부+Django 완료 Task 수 / 전체 Task 수 |
| Week 6-7 | 85% | 투표 Full Flow 완료 Task 수 / 전체 Task 수 |
| Week 8 | 95% | 통합 테스트 통과율 |
| Week 9 | 100% | 리허설 완료 + 백업 영상 준비 |

### 일정 준수율 계산
```
일정 준수율 = (완료된 Task 수 / 계획된 Task 수) × 100%

⚠️ 50% 미만 시 범위 축소 결정
✅ 90% 이상 시 정상 진행
```

---

## 문서 버전 관리

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-01-06 | v1.0 | WBS 초안 작성 | PM Team |

---

## 관련 문서

- [PRODUCT_AGENDA.md](./PRODUCT_AGENDA.md) - 프로젝트 아젠다
- [WOORIDO_FINAL_SPECIFICATION.md](./WOORIDO_FINAL_SPECIFICATION.md) - 최종 설계 명세서
- [DEVELOPMENT_ENVIRONMENT.md](./DEVELOPMENT_ENVIRONMENT.md) - 개발 환경 명세서
- [WBS_GANTT.md](./WBS_GANTT.md) - Gantt Chart
- [WBS_RISK_ANALYSIS.md](./WBS_RISK_ANALYSIS.md) - 리스크 분석
- [WEEKLY_REPORT_TEMPLATE.md](./WEEKLY_REPORT_TEMPLATE.md) - 주간 보고 양식

---

**이 문서는 프로젝트 진행 상황에 따라 지속적으로 업데이트됩니다.**
