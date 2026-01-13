# WOORIDO 유스케이스 명세서 (Use Cases) - 개요

**작성일**: 2026-01-13
**버전**: v3.2 - DB_Schema 동기화
**목적**: 데이터베이스 스키마 기반 사용자 시나리오 정의

> 📖 정책 기준: [POLICY_DEFINITION.md](../../Product/POLICY_DEFINITION.md)
> 📋 프로덕트 아젠다: [PRODUCT_AGENDA.md](../../Product/PRODUCT_AGENDA.md)
> 🗄️ ERD 문서: [00_ERD_OVERVIEW.md](../../../02_ENGINEERING/Database/00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../../../02_ENGINEERING/DB_Schema_1.0.0.md)

---

## 📋 도메인별 문서 목록

| 문서 | 도메인 | 유스케이스 수 | 설명 |
|------|--------|-------------|------|
| [01_USE_CASE_USER.md](./01_USE_CASE_USER.md) | 사용자 | 5개 | 회원가입, 로그인, 충전, 출금, 당도 |
| [02_USE_CASE_CHALLENGE.md](./02_USE_CASE_CHALLENGE.md) | 챌린지 | 6개 | 생성, 가입, 탈퇴, 장부, 완주 인증 |
| [03_USE_CASE_MEETING.md](./03_USE_CASE_MEETING.md) | 정기 모임 | 9개 | 모임 투표, 지출 투표, 퇴출, 종료 |
| [04_USE_CASE_SNS.md](./04_USE_CASE_SNS.md) | SNS | 3개 | 피드, 좋아요, 댓글 |
| [05_USE_CASE_SYSTEM.md](./05_USE_CASE_SYSTEM.md) | 시스템 | 5개 | 자동 납입, 보증금 충당, 신고 |
| [06_USE_CASE_ADMIN.md](./06_USE_CASE_ADMIN.md) | 관리자 | 3개 | 신고 처리, 수수료, 유저 관리 |

---

## 1. 액터 정의

### 1.1 주요 액터 (Actors)

| 액터 | 영문 | 설명 | DB 테이블 |
|------|------|------|----------|
| **리더** | Leader | 챌린지 생성자 및 운영자 | users, challenge_members (role='LEADER') |
| **팔로워** | Follower | 챌린지 참여자 | users, challenge_members (role='FOLLOWER') |
| **미가입 유저** | Guest User | 로그인만 한 상태 | users |
| **관리자** | Admin | 플랫폼 운영자 | admins |
| **시스템** | System | 자동화 배치/스케줄러 | - |

### 1.2 액터 권한 매트릭스

| 기능 | 리더 | 팔로워 | 미가입 유저 | 관리자 |
|------|:----:|:------:|:----------:|:------:|
| 챌린지 생성 | ✅ | ✅ | ❌ | ✅ |
| 챌린지 정보 수정 | ✅ | ❌ | ❌ | ✅ |
| 정기 모임 투표 발의 | ✅ | ❌ | ❌ | ❌ |
| 지출 투표 발의 | ✅ | ❌ | ❌ | ❌ |
| 멤버 퇴출 투표 발의 | ✅ | ✅ | ❌ | ❌ |
| 투표 참여 | ✅ | ✅ | ❌ | ❌ |
| 피드 작성 | ✅ | ✅ | ❌ | ❌ |
| 댓글/좋아요 | ✅ | ✅ | ❌ | ❌ |
| 장부 조회 | ✅ | ✅ | ❌ | ✅ |
| 신고 처리 | ❌ | ❌ | ❌ | ✅ |

---

## 2. 유스케이스 매트릭스

### 2.1 Demo Day 우선순위

| UC ID | 유스케이스 | 도메인 | 우선순위 | Demo Day |
|-------|----------|--------|---------|----------|
| UC-USER-03 | 크레딧 충전 | USER | P0 | ✅ 필수 |
| UC-CHALLENGE-01 | 챌린지 생성 | CHALLENGE | P0 | ✅ 필수 |
| UC-CHALLENGE-02 | 챌린지 가입 (RECRUITING) | CHALLENGE | P0 | ✅ 필수 |
| UC-CHALLENGE-03 | 챌린지 가입 (ACTIVE) | CHALLENGE | P0 | ✅ 필수 |
| UC-CHALLENGE-05 | 장부 조회 (Django 분석) | CHALLENGE | P0 | ✅ 필수 |
| UC-MEETING-01 | 정기 모임 투표 발의 | MEETING | P1 | ✅ 필수 |
| UC-MEETING-02 | 정기 모임 참석 투표 | MEETING | P1 | ✅ 필수 |
| UC-MEETING-04 | 지출 투표 발의 | MEETING | P0 | ✅ 필수 |
| UC-MEETING-05 | 지출 투표 참여 | MEETING | P0 | ✅ 필수 |
| UC-SNS-01 | 피드 작성 | SNS | P0 | ✅ 필수 |
| UC-SNS-02 | 좋아요 | SNS | P0 | ✅ 필수 |
| UC-SNS-03 | 댓글 작성 | SNS | P0 | ✅ 필수 |
| UC-SYSTEM-01 | 서포트 자동 납입 | SYSTEM | P1 | ⏳ 선택 |
| UC-SYSTEM-02 | 보증금 충당/권한 박탈 | SYSTEM | P1 | ⏳ 선택 |
| UC-MEETING-07 | 멤버 퇴출 투표 (KICK) | MEETING | P2 | ⏳ 선택 |
| UC-MEETING-08 | 리더 강퇴 투표 (LEADER_KICK) | MEETING | P2 | ⏳ 선택 |
| UC-MEETING-09 | 챌린지 종료 투표 (DISSOLVE) | MEETING | P2 | ⏳ 선택 |
| UC-CHALLENGE-06 | 챌린지 완주 인증 | CHALLENGE | P2 | ⏳ 선택 |

### 2.2 투표 타입별 승인 조건

| 투표 타입 | 발의자 | 투표 대상 | 승인 조건 | DB 컬럼 |
|----------|--------|----------|----------|---------|
| EXPENSE | 리더 | 전체 멤버 또는 모임 참석자 | 과반수 (50%+1) | votes.type |
| KICK | 모두 | 전체 멤버 (대상 제외) | 70% 이상 | votes.target_user_id |
| MEETING_ATTENDANCE | 리더 | 전체 멤버 | 과반수 (50%+1) | votes.meeting_* |
| LEADER_KICK | 팔로워 | 전체 팔로워 | 70% 이상 | votes.target_user_id |
| DISSOLVE | 리더 | 전체 멤버 | 전원 (100%) | challenges.deleted_at |

### 2.3 트랜잭션 패턴 매핑

| 유스케이스 | Lock 타입 | 테이블 | 패턴 |
|-----------|----------|--------|------|
| UC-USER-03 | Pessimistic | accounts | FOR UPDATE WAIT 3 |
| UC-CHALLENGE-02/03 | Optimistic | challenges | version 컬럼 |
| UC-MEETING-05 | Both | challenges, ledger_entries | @Transactional + Lock |
| UC-SNS-02 | Atomic | posts | INCREMENT/DECREMENT |

---

## 부록: 용어 매핑

### ERD ↔ API 용어 매핑

| ERD 테이블/컬럼 | API/프론트엔드 용어 |
|----------------|-------------------|
| `challenges` | `challenge` |
| `challenge_members` | `challengeMembers` |
| `challenge_id` | `challengeId` |
| `creator_id` | `leaderId` |
| `current_members` | `currentMembers` |
| `monthly_fee` | `supportAmount` |
| `deposit_amount` | `depositLock` |
| `balance` (accounts) | `availableBalance` |
| `locked_balance` | `depositLock` |
| `balance` (challenges) | `challengeAccountBalance` |

---

**문서 버전**: v3.2
**최종 수정**: 2026-01-13
**작성자**: AI-Assisted Development Team
**관련 문서**:
- [00_ERD_OVERVIEW.md](../../../02_ENGINEERING/Database/00_ERD_OVERVIEW.md)
- [PRODUCT_AGENDA.md](../../Product/PRODUCT_AGENDA.md)
- [POLICY_DEFINITION.md](../../Product/POLICY_DEFINITION.md)
