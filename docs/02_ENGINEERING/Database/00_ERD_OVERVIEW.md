# WOORIDO ERD 개요
**데이터베이스 설계 명세서 - 개요 및 아키텍처**

**작성일**: 2026-01-13
**대상 DBMS**: Oracle 21c XE
**ORM**: mybatis-spring-boot-starter 3.0.3
**트랜잭션 관리**: Spring Boot 3.2.3 (@Transactional)
**총 테이블**: 32개

> 📖 정책 기준: [POLICY_DEFINITION.md](../../01_PLANNING/Product/POLICY_DEFINITION.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)
> 📋 변경 이력: [BACKLOG.md](../../BACKLOG.md)

---

## 📋 문서 구조

ERD 문서는 도메인별로 분할되어 관리됩니다.

| 문서 | 설명 | 테이블 |
|------|------|--------|
| [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md) | 아키텍처 개요, 결정사항 | - |
| [01_SCHEMA_USER.md](./01_SCHEMA_USER.md) | 사용자 도메인 | users, accounts, account_transactions, user_scores, refresh_tokens |
| [02_SCHEMA_CHALLENGE.md](./02_SCHEMA_CHALLENGE.md) | 챌린지 도메인 | challenges, challenge_members |
| [03_SCHEMA_MEETING.md](./03_SCHEMA_MEETING.md) | 정기 모임 도메인 | meetings, meeting_votes, meeting_vote_records |
| [04_SCHEMA_SNS.md](./04_SCHEMA_SNS.md) | SNS 도메인 | posts, post_images, post_likes, comments, comment_likes |
| [05_SCHEMA_SYSTEM.md](./05_SCHEMA_SYSTEM.md) | 시스템 도메인 | sessions, notifications, reports, webhook_logs |
| [06_SCHEMA_ADMIN.md](./06_SCHEMA_ADMIN.md) | 관리자 도메인 | admins, fee_policies, admin_logs, settlements, refunds |
| [07_IMPLEMENTATION_PATTERNS.md](./07_IMPLEMENTATION_PATTERNS.md) | 구현 패턴 | MyBatis, Spring Boot 패턴 |
| [08_INDEX_STRATEGY.md](./08_INDEX_STRATEGY.md) | 인덱스 전략 | 인덱스 정의, 체크리스트 |

> 📄 **전체 통합 문서**: [ERD_SPECIFICATION.md](./ERD_SPECIFICATION.md)

---

## 중요 공지

> **용어 변경 1**: `gye` → `challenges`
> - 테이블명 `gye`는 레거시 용어입니다.
> - 실제 DB 스키마에서는 `challenges` 테이블명을 사용합니다.

> **용어 정의 2**: `member` vs `follower` vs `leader`
> - 멤버(member): 챌린지 내 전체 인원 (리더 + 팔로워)
> - 리더(leader): 챌린지를 생성하고 관리하는 멤버
> - 팔로워(follower): 리더가 아닌 일반 멤버

---

## 1. 아키텍처 개요

### 1.1 트랜잭션 관리 계층

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                 - API 호출만 담당                         │
│                 - 로컬 상태 관리 (의견 데이터)            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST API
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Spring Boot (Transaction Manager)           │
│  ✅ 모든 트랜잭션 처리 (ACID 보장)                        │
│  ✅ MyBatis로 Oracle DB 직접 제어                        │
│  ✅ 동시성 제어 (Optimistic/Pessimistic Lock)            │
│  ✅ Idempotency 검증                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │ Oracle  │   │ Django  │   │  Redis  │
   │   DB    │   │(분석 전용)│   │ (Cache) │
   │         │   │❌ No DB  │   │         │
   │✅ 트랜잭션│   │❌ No Tx  │   │         │
   └─────────┘   └─────────┘   └─────────┘
```

### 1.2 Django의 역할 (트랜잭션 없음)

Django는 **순수 데이터 분석/알고리즘 실행 엔진**으로만 사용:

**Django가 하는 것:**
- ✅ 모임 추천 알고리즘 (협업 필터링)
- ✅ 이상 거래 탐지 (통계 분석)
- ✅ 위험도 계산 (ML 모델)
- ✅ 데이터 집계/변환 (pandas)

**Django가 하지 않는 것:**
- ❌ DB 직접 연결
- ❌ 트랜잭션 처리
- ❌ CRUD 작업
- ❌ 동시성 제어

---

## 2. 사용자 결정사항 (User Decisions)

### ✅ 온보딩 분기 처리: 로직 기반 (옵션 B)

**DB 컬럼 추가 없음.** 애플리케이션 레벨에서 판단:

```java
// Spring Boot Service
public boolean isNewUser(User user) {
    LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
    return user.getCreatedAt().isAfter(sevenDaysAgo);
}
```

### ✅ returnUrl 저장: 하이브리드 방식

| 유형 | 저장 위치 | 적용 대상 |
|------|----------|----------|
| 돈 관련 | DB Session 테이블 | 충전, 가입, 출금 |
| 의견 관련 | Frontend localStorage | 투표, 게시글, 댓글 |

### ✅ 챌린지 삭제: Soft Delete (옵션 A)

```sql
-- challenges 테이블에 deleted_at, dissolution_reason 컬럼 포함
```

**API 동작:**
- 개별 조회 시: 404 + 삭제 정보 반환
- 내 모임 목록: `includeDeleted=true` 옵션으로 표시

---

## 3. 트랜잭션 오류 해결 전략 요약

| 오류 유형 | 해결 방법 | 적용 테이블 |
|----------|----------|-----------|
| Race Condition | Optimistic Lock + Version | challenges, accounts |
| Lost Update | Pessimistic Lock (FOR UPDATE) | accounts |
| Atomicity Violation | Single @Transactional | votes, ledger_entries |
| Counter Drift | Atomic Operations + Reconciliation | posts |
| Missing CASCADE | Explicit ON DELETE | 모든 FK |

> 상세 구현은 [07_IMPLEMENTATION_PATTERNS.md](./07_IMPLEMENTATION_PATTERNS.md) 참조

---

## 4. 설계 원칙

1. **모든 트랜잭션**: Spring Boot에서만 처리
2. **Django**: 분석 전용 (DB 연결 없음)
3. **동시성 제어**: Optimistic + Pessimistic Lock 조합
4. **Idempotency**: 모든 금융 트랜잭션에 적용
5. **Soft Delete**: 챌린지(challenges) 테이블에 적용
6. **CASCADE 정책**: 명시적 정의

---

**최종 수정**: 2026-01-20
**작성자**: AI-Assisted Development Team
