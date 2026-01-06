# WOORIDO 프로젝트 리스크 분석 및 대응 방안

> **Demo Day**: 2026-02-25
> **전체 기간**: 57일 (8주)
> **작성일**: 2026-01-06
> **버전**: v1.0

---

## Executive Summary

### 리스크 개요
- **Total 리스크**: 15개
- **Critical 리스크**: 5개
- **High 리스크**: 4개
- **Medium 리스크**: 4개
- **Low 리스크**: 2개

### 가장 치명적인 리스크 Top 3
1. **SNS API 18개 개발 지연** (확률: High, 영향도: Critical)
2. **보증금 락 트랜잭션 복잡도** (확률: High, 영향도: Critical)
3. **Spring-Django 통신 실패** (확률: Medium, 영향도: Critical)

---

## 리스크 매트릭스

### 확률 × 영향도 매트릭스

```
영향도 ↑
Critical │ R3             │ R1, R2         │                │
         │                │                │                │
High     │                │ R4             │                │
         │                │                │                │
Medium   │ R5, R6         │ R7, R8         │                │
         │                │                │                │
Low      │ R9, R10        │                │                │
         └────────────────┴────────────────┴────────────────┘
           Low            Medium           High     → 확률

R1: SNS API 18개 개발 지연
R2: 보증금 락 트랜잭션 복잡도
R3: Spring-Django 통신 실패
R4: 통합 테스트 시간 부족
R5: 토스페이 Mock 연동 실패
R6: S3 연동 실패
R7: 페이지네이션 성능 문제
R8: Optimistic Update 버그
R9: React2Shell 취약점 (영향 없음)
R10: Oracle Docker 설치 실패
```

---

## Critical 리스크 (5개)

### R1: SNS API 18개 개발 지연 ⚠️ **최우선 관리 대상**

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | **High (70%)** |
| 영향도 | **Critical** |
| 발생 시점 | Week 2-3 (1/6-1/19) |
| 영향 범위 | 전체 일정 2주 지연 가능 |
| 책임자 | Backend Team Lead |

#### 리스크 상세
**원인:**
- Backend 개발자 1명이 18개 API 담당
- 피드(5개) + 댓글(5개) + 좋아요(2개) + 이미지(2개) + 공지(2개) + 목록(2개)
- DB 스키마 설계 복잡도 (posts, comments, likes, media 4개 테이블)
- 페이지네이션, 정렬, 필터링 로직 추가

**영향:**
- Week 3 종료 시 SNS 미완성 → 가입 플로우 지연
- Critical Path 지연 → Demo Day 일정 압박
- 프론트엔드 팀 대기 시간 발생 → 생산성 저하

#### 완화 전략 (Mitigation)
**1. Week 2 중간 점검 (1/12 금요일)**
```
목표 진척도: 50% (9개 API 완료)
- 피드 CRUD 5개 ✅
- 댓글 목록/작성 2개 ✅
- 좋아요 토글 2개 ✅

📊 진척도 측정:
완료 API 수 / 18 × 100% = 진척률

⚠️ 50% 미달 시 즉시 범위 축소 결정
```

**2. MSW 활용 Frontend-First 개발**
```typescript
// 프론트엔드가 Backend 대기 없이 개발 진행
// src/mocks/handlers/posts.ts
export const postHandlers = [
  http.get('/api/groups/:groupId/posts', () => {
    return HttpResponse.json({
      posts: mockPosts, // 목 데이터
      totalPages: 5,
    });
  }),
];
```
- Frontend는 MSW로 Week 2 전체 UI 개발 완료
- Week 3에 실제 API 통합만 진행

**3. 우선순위 재조정**
```
P0 (필수): 피드 CRUD + 댓글 + 좋아요 (12개 API)
P1 (중요): 이미지 업로드 (2개 API)
P2 (선택): 공지사항 핀 고정 (2개 API)

50% 미달 시: P2 → Post-Demo 이동
```

#### 대체 계획 (Contingency)
**시나리오 1: Week 2 종료 시 60% 미만**
- 이미지 업로드 Post-Demo 이동
- 텍스트만 게시 가능하도록 간소화
- Week 3 전체를 API 완성에 집중

**시나리오 2: Week 3 종료 시 80% 미만**
- 공지사항 핀 기능 제거
- CP가 일반 글에 "[공지]" 텍스트 추가로 대체
- Buffer 타임 1일 사용

**시나리오 3: 완전 실패 (70% 미만)**
- Week 4 일정 1주 연기
- 가입 플로우 간소화 (보증금 락 제거)
- PM과 범위 재협의

#### 모니터링 지표
| 날짜 | 목표 | 측정 방식 |
|------|------|----------|
| 1/8 (화) | 20% | 피드 DB 스키마 + 목록 API 완료 |
| 1/10 (목) | 35% | 피드 CRUD 5개 + 댓글 DB 완료 |
| 1/12 (토) | 50% | 댓글 + 좋아요 완료 (Checkpoint) |
| 1/15 (화) | 70% | 이미지 업로드 API 완료 |
| 1/17 (목) | 90% | 공지사항 핀 완료 |
| 1/19 (일) | 100% | SNS Full Flow 테스트 통과 |

#### 조기 경보 신호 (Early Warning)
- ⚠️ 1/8까지 피드 목록 API 미완성
- ⚠️ 1/12 진척도 40% 미만
- ⚠️ 1/15 이미지 업로드 착수 불가

---

### R2: 보증금 락 트랜잭션 복잡도

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | **High (60%)** |
| 영향도 | **Critical** |
| 발생 시점 | Week 4 (1/23-1/25) |
| 영향 범위 | 핵심 차별화 기능 실패 |
| 책임자 | Backend Team Lead |

#### 리스크 상세
**원인:**
- 다중 테이블 트랜잭션 (accounts, gye, gye_members, ledger_entries)
- 동시성 제어 필요 (여러 유저 동시 가입 시)
- 롤백 시나리오 복잡 (잔액 부족, 중복 가입 등)

**복잡한 트랜잭션 예시:**
```sql
BEGIN TRANSACTION;

-- 1. 잔액 확인
SELECT available FROM accounts WHERE user_id = ? FOR UPDATE;
-- 잔액 부족 시 ROLLBACK

-- 2. 가용 잔액 차감
UPDATE accounts SET available = available - ? WHERE user_id = ?;

-- 3. 락 잔액 증가
UPDATE accounts SET locked = locked + ? WHERE user_id = ?;

-- 4. 멤버 추가
INSERT INTO gye_members (gye_id, user_id, deposit_locked, ...) VALUES (...);

-- 5. 장부 기록 (입금)
INSERT INTO ledger_entries (gye_id, type, amount, ...) VALUES (...);

-- 6. 모임 금고 증가
UPDATE gye SET balance = balance + ? WHERE id = ?;

COMMIT;
-- 어느 단계든 실패 시 전체 ROLLBACK
```

#### 완화 전략
**1. Week 4 초반 집중 개발 (1/20-1/22)**
- 다른 작업 최소화
- 트랜잭션 로직 우선 구현

**2. 단위 테스트 철저히**
```java
@Test
@Transactional
public void testJoinGroupWithInsufficientBalance() {
    // Given: 잔액 부족 상황
    // When: 가입 시도
    // Then: 예외 발생 + 롤백 확인
}

@Test
@Transactional
public void testConcurrentJoin() {
    // Given: 동일 유저 동시 가입
    // When: 2개 스레드 동시 실행
    // Then: 1개만 성공, 1개 실패
}
```

**3. 트랜잭션 격리 수준 설정**
```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void joinGroup(Long userId, Long groupId) {
    // SERIALIZABLE: 가장 높은 격리 수준
    // 동시성 문제 원천 차단
}
```

#### 대체 계획
**시나리오 1: 트랜잭션 구현 실패**
- 보증금 락 기능 간소화
- 가입 시 보증금만 차감, 락 없이 관리
- "신뢰 기반" 방식으로 전환 (Demo Day용)

**시나리오 2: 롤백 로직 버그**
- 수동 롤백 관리
- 실패 시 관리자 페이지에서 수동 처리

#### 모니터링 지표
| 날짜 | 목표 | 검증 방법 |
|------|------|----------|
| 1/22 | 트랜잭션 로직 완료 | 단위 테스트 100% 통과 |
| 1/24 | 동시성 테스트 통과 | JMeter 10명 동시 가입 성공 |
| 1/26 | Full Flow 테스트 | 충전 → 가입 → 보증금 락 10회 성공 |

---

### R3: Spring-Django 통신 실패

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | **Medium (40%)** |
| 영향도 | **Critical** |
| 발생 시점 | Week 1, Week 5 (2/1-2/3) |
| 영향 범위 | Django 분석 기능 미작동 |
| 책임자 | Backend (Spring) Team |

#### 리스크 상세
**원인:**
- 네트워크 타임아웃 (Django 분석 3초 초과)
- 데이터 직렬화 오류 (JSON 변환 실패)
- Django 서버 다운 (메모리 부족)

**통신 흐름:**
```
Spring Boot → HTTP POST → Django
  ↓ 요청 데이터 (JSON)
  [{date: "2026-01-01", amount: 50000, category: "식비"}, ...]

Django → pandas 분석 → 결과 반환
  ↓ 응답 데이터 (JSON)
  {total: 500000, avgPerDay: 16666, trend: "increasing"}

Spring Boot → Frontend
```

#### 완화 전략
**1. Week 1 통신 우선 검증**
```bash
# Week 1 (1/3) 테스트
curl -X POST http://localhost:8000/health \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 응답: {"status": "ok", "timestamp": "..."}
```

**2. Fallback UI 필수 구현**
```typescript
// Frontend: Django 실패 시 기본 통계만 표시
try {
  const analysis = await fetchDjangoAnalysis(groupId);
  return <RechartsLineChart data={analysis.trend} />;
} catch (error) {
  console.error('Django 분석 실패:', error);
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200">
      <p>분석 서비스 일시 중단</p>
      <p>총 지출: {basicStats.total.toLocaleString()}원</p>
      <p>평균 지출: {basicStats.avg.toLocaleString()}원/일</p>
    </div>
  );
}
```

**3. Spring Boot 프록시 타임아웃 설정**
```java
@Bean
public RestTemplate restTemplate() {
    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
    factory.setConnectTimeout(3000); // 3초
    factory.setReadTimeout(5000);    // 5초
    return new RestTemplate(factory);
}
```

**4. Django 성능 최적화**
```python
# pandas 연산 최적화
import pandas as pd
from functools import lru_cache

@lru_cache(maxsize=128)
def analyze_monthly_stats(transactions_json):
    df = pd.DataFrame(json.loads(transactions_json))
    # 캐시로 반복 요청 최적화
    return df.groupby('category')['amount'].sum().to_dict()
```

#### 대체 계획
**시나리오 1: Django 완전 실패**
- Django 분석 기능 제거
- Spring Boot에서 간단한 SQL 집계로 대체
```sql
-- Spring Boot에서 직접 집계
SELECT
  SUM(amount) as total,
  AVG(amount) as avg_per_day,
  category,
  COUNT(*) as count
FROM ledger_entries
WHERE gye_id = ?
GROUP BY category;
```

**시나리오 2: 부분 실패 (타임아웃)**
- 타임아웃 10초로 연장
- 분석 결과 캐싱 (Redis)

#### 모니터링 지표
| 날짜 | 목표 | 검증 방법 |
|------|------|----------|
| 1/3 | 통신 테스트 성공 | Hello World API 200 OK |
| 2/3 | 분석 API 3초 이내 | 장부 100건 기준 분석 < 3초 |
| 2/5 | Fallback UI 작동 | Django 다운 시 기본 통계 표시 |

---

### R4: 통합 테스트 시간 부족

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | **Medium (50%)** |
| 영향도 | **High** |
| 발생 시점 | Week 8 (2/15-2/20) |
| 영향 범위 | Demo Day 시연 실패 |
| 책임자 | PM/QA Team |

#### 리스크 상세
**원인:**
- Week 7까지 Critical 버그 누적
- E2E 테스트 작성 시간 부족
- 시연 시나리오별 테스트 미흡

**필요한 테스트:**
- SNS 시연 (10회 반복)
- 온보딩 시연 (5회)
- 가입 시연 (10회)
- 장부 시연 (5회)
- 투표 시연 (10회)
- **총 40회 시연 반복 필요**

#### 완화 전략
**1. Week 7까지 Critical 버그 최소화**
- 각 Phase 종료 시 Unit Test 100% 통과
- Integration Test 매 주 금요일 실행

**2. Week 8 전체를 테스트에 할애**
```
2/15 (월): SNS 시연 테스트 (10회)
2/16 (화): 온보딩 + 가입 시연 (15회)
2/17 (수): 장부 + 투표 시연 (15회)
2/18 (목): 에러 복구 경로 검증
2/19-20 (금-토): 버그 수정 + 재테스트
```

**3. 자동화된 E2E 테스트 (Playwright)**
```typescript
// tests/e2e/demo-day-scenario.spec.ts
test('Demo Day 시연 시나리오', async ({ page }) => {
  // 1. 로그인
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@woorido.com');
  await page.fill('[name="password"]', 'Test1234!');
  await page.click('button[type="submit"]');

  // 2. 피드 작성
  await page.click('button:has-text("새 글 작성")');
  await page.fill('textarea', '테스트 피드 내용');
  await page.click('button:has-text("게시")');

  // 3. 댓글 작성
  await page.click('button:has-text("댓글")');
  await page.fill('input[placeholder="댓글 입력"]', '테스트 댓글');
  await page.press('input[placeholder="댓글 입력"]', 'Enter');

  // 4. 검증
  await expect(page.locator('text=테스트 댓글')).toBeVisible();
});
```

#### 대체 계획
**시나리오 1: Week 8 시간 부족**
- Week 9 리허설 시간 일부 할애 (2일)
- Demo Day 1일 전까지 테스트 계속

**시나리오 2: Critical 버그 발견**
- 해당 기능 비활성화
- 시연 시나리오 조정

#### 모니터링 지표
| 날짜 | 목표 | 검증 방법 |
|------|------|----------|
| 2/17 | 시연 성공률 80% | 40회 중 32회 성공 |
| 2/19 | 시연 성공률 95% | 40회 중 38회 성공 |
| 2/20 | 시연 성공률 100% | 40회 전체 성공 |

---

### R5: 투표-장부 연동 트랜잭션 복잡도

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | **High (65%)** |
| 영향도 | **Critical** |
| 발생 시점 | Week 5 (1/30-2/1) |
| 영향 범위 | 투표 시스템 미작동 |
| 책임자 | Backend Team Lead |

#### 리스크 상세
**원인:**
- 투표 승인 → 장부 기록 → 모임 금고 차감 3단계 트랜잭션
- 과반수 판정 로직 복잡도
- 동시 투표 시 Race Condition

**복잡한 트랜잭션 예시:**
```sql
BEGIN TRANSACTION;

-- 1. 투표 결과 확인
SELECT
  COUNT(*) as total_votes,
  SUM(CASE WHEN vote = 'approve' THEN 1 ELSE 0 END) as yes_votes
FROM vote_casts
WHERE vote_id = ?;

-- 2. 과반수 판정
-- yes_votes > total_members / 2

-- 3. 투표 상태 업데이트
UPDATE votes SET status = 'approved' WHERE id = ?;

-- 4. 장부 기록
INSERT INTO ledger_entries (gye_id, type, amount, vote_id, ...) VALUES (...);

-- 5. 모임 금고 차감
UPDATE gye SET balance = balance - ? WHERE id = ?;

COMMIT;
```

#### 완화 전략
**1. Week 5 전반 투표 API 선행 개발**
- 1/27-1/29: 투표 생성/참여 API 완료
- 1/30-2/1: 장부 연동 집중 개발

**2. 단위 테스트 시나리오**
```java
@Test
@Transactional
public void testVoteApprovalToLedger() {
    // Given: 10명 멤버, 6명 찬성
    // When: 투표 마감
    // Then: 장부 기록 + 금고 차감 확인
}
```

**3. 트랜잭션 격리 수준**
```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void approveVoteAndRecordLedger(Long voteId) {
    // 동시성 문제 방지
}
```

#### 대체 계획
**시나리오 1: 트랜잭션 실패**
- 장부 기록 수동 처리 (CP 권한)
- 투표 승인 후 CP가 직접 장부 등록

**시나리오 2: 과반수 판정 버그**
- 단순 과반수로 고정 (2/3, 70% 제거)

#### 모니터링 지표
| 날짜 | 목표 | 검증 방법 |
|------|------|----------|
| 1/31 | 투표-장부 연동 완료 | 단위 테스트 100% 통과 |
| 2/3 | Full Flow 테스트 | 투표 승인 → 장부 기록 10회 성공 |

---

## High 리스크 (4개)

### R6: 토스페이 Mock 연동 실패

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Low (20%) |
| 영향도 | Medium |
| 발생 시점 | Week 4 (1/23) |
| 완화 전략 | 로컬 시뮬레이션으로 대체 |

#### 대체 계획
```javascript
// 토스페이 Mock 실패 시
const mockCharge = (amount) => {
  setTimeout(() => {
    alert('충전 완료 (시뮬레이션)');
    updateBalance(amount);
  }, 2000);
};
```

---

### R7: S3 연동 실패

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Medium (30%) |
| 영향도 | Medium |
| 발생 시점 | Week 3 (1/16) |
| 완화 전략 | 로컬 파일 저장 Fallback |

#### 대체 계획
```java
// S3 연동 실패 시
public String uploadImage(MultipartFile file) {
    // 로컬 저장
    String filename = "/uploads/" + UUID.randomUUID() + ".jpg";
    file.transferTo(new File(filename));
    return "http://localhost:8080" + filename;
}
```

---

### R8: 페이지네이션 성능 문제

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Medium (35%) |
| 영향도 | Medium |
| 발생 시점 | Week 2-3 (피드 1000개 이상) |
| 완화 전략 | Oracle Pagination 최적화 |

#### 완화 전략
```sql
-- OFFSET 대신 CURSOR 방식
SELECT * FROM posts
WHERE id < ? -- 마지막 조회 ID
ORDER BY created_at DESC
LIMIT 20;
```

---

### R9: Optimistic Update 버그

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Medium (30%) |
| 영향도 | Low |
| 발생 시점 | Week 3 (좋아요 기능) |
| 완화 전략 | 실패 시 전체 새로고침 |

#### 대체 계획
```typescript
// Optimistic Update 실패 시
try {
  await likePost(postId);
} catch (error) {
  queryClient.invalidateQueries(['posts']);
  // 전체 새로고침
}
```

---

## Medium 리스크 (4개)

### R10: Oracle Docker 설치 실패

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Low (15%) |
| 영향도 | High |
| 발생 시점 | Week 1 (12/30) |
| 완화 전략 | PostgreSQL로 대체 |

---

### R11: Django pandas 성능 문제

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Medium (40%) |
| 영향도 | Medium |
| 발생 시점 | Week 5 (2/1) |
| 완화 전략 | 캐싱 (lru_cache) |

---

### R12: 반응형 버그 (Mobile/Desktop)

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Medium (45%) |
| 영향도 | Medium |
| 발생 시점 | Week 8 (2/17) |
| 완화 전략 | Tailwind 반응형 클래스 철저히 |

---

### R13: JWT 토큰 만료 처리 버그

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Low (25%) |
| 영향도 | Medium |
| 발생 시점 | Week 1 (1/4) |
| 완화 전략 | Axios Interceptor로 자동 갱신 |

---

## Low 리스크 (2개)

### R14: React2Shell 취약점 (CVE-2025-55182)

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | **None (0%)** |
| 영향도 | None |
| 발생 시점 | - |
| 상태 | **영향 없음** |

#### 리스크 분석
- React 18.3.1 사용 (React Server Components 미사용)
- Next.js 미사용 (Vite 사용)
- **결론**: 이 프로젝트는 React2Shell 취약점에 직접 영향 없음

---

### R15: 팀원 휴가/공휴일

#### 기본 정보
| 항목 | 내용 |
|------|------|
| 확률 | Low (10%) |
| 영향도 | Low |
| 발생 시점 | 2026년 1월 (설 연휴 없음) |
| 완화 전략 | 버퍼 타임 활용 |

---

## 리스크 대응 프로세스

### 리스크 모니터링 주기
| 리스크 등급 | 모니터링 주기 | 보고 방식 |
|------------|--------------|----------|
| Critical | 매일 | Slack + 주간 보고 |
| High | 주 2회 | 주간 보고 |
| Medium | 주 1회 | 주간 보고 |
| Low | 월 1회 | 월간 보고 |

### 리스크 발생 시 대응 절차
```
1. 리스크 발생 감지
   ↓
2. PM에게 즉시 보고 (Slack)
   ↓
3. 영향도 재평가 (Critical/High/Medium)
   ↓
4. 완화 전략 실행 (Mitigation)
   ↓
5. 실패 시 대체 계획 실행 (Contingency)
   ↓
6. 일정 재조정 (필요 시)
   ↓
7. 팀 전체 공유 (회고)
```

---

## 리스크 대시보드 (주간 업데이트)

### Week 1 (12/30-1/5)
| 리스크 ID | 현재 상태 | 진척도 | 조치 사항 |
|-----------|----------|--------|----------|
| R10 | 🟢 안전 | Oracle 설치 완료 | - |
| R13 | 🟢 안전 | JWT 구현 완료 | - |
| R3 | 🟡 주의 | Spring-Django 통신 테스트 진행 중 | Week 1 종료 전 검증 필요 |

### Week 2-3 (1/6-1/19)
| 리스크 ID | 현재 상태 | 진척도 | 조치 사항 |
|-----------|----------|--------|----------|
| R1 | 🔴 위험 | 1/12 진척도 확인 필요 | 50% 미달 시 범위 축소 |
| R7 | 🟡 주의 | S3 연동 진행 중 | Fallback 준비 |
| R8 | 🟢 안전 | 페이지네이션 최적화 완료 | - |

### Week 4 (1/20-1/26)
| 리스크 ID | 현재 상태 | 진척도 | 조치 사항 |
|-----------|----------|--------|----------|
| R2 | 🔴 위험 | 보증금 락 개발 중 | 1/22 단위 테스트 필수 |
| R6 | 🟡 주의 | 토스페이 Mock 연동 중 | Fallback 준비 |

### Week 5 (1/27-2/5)
| 리스크 ID | 현재 상태 | 진척도 | 조치 사항 |
|-----------|----------|--------|----------|
| R3 | 🔴 위험 | Django 분석 연동 중 | Fallback UI 필수 |
| R5 | 🔴 위험 | 투표-장부 연동 중 | 1/31 테스트 통과 필수 |
| R11 | 🟡 주의 | pandas 성능 테스트 중 | 캐싱 도입 |

### Week 6-7 (2/6-2/14)
| 리스크 ID | 현재 상태 | 진척도 | 조치 사항 |
|-----------|----------|--------|----------|
| R9 | 🟡 주의 | Optimistic Update 테스트 중 | Fallback 준비 |

### Week 8 (2/15-2/20)
| 리스크 ID | 현재 상태 | 진척도 | 조치 사항 |
|-----------|----------|--------|----------|
| R4 | 🔴 위험 | 통합 테스트 진행 중 | 2/17까지 80% 성공률 필수 |
| R12 | 🟡 주의 | 반응형 테스트 중 | Mobile/Desktop 검증 |

---

## 리스크 완화 예산

### 버퍼 타임 할당
| Week | 버퍼 타임 | 할당 리스크 |
|------|----------|------------|
| Week 1 | 1일 | R10, R13 |
| Week 2-3 | 1일 | R1 (SNS 개발 지연) |
| Week 4 | 0.5일 | R2 (보증금 락) |
| Week 5 | 1일 | R3, R5 (Django, 투표-장부) |
| Week 6-7 | 1일 | R9 (Optimistic Update) |
| Week 8 | 0.5일 | R4 (통합 테스트) |

**총 버퍼 타임**: 5일 (전체 57일의 8.8%)

---

## 문서 버전 관리

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-01-06 | v1.0 | 리스크 분석 초안 작성 | PM Team |

---

## 관련 문서

- [WBS_MASTER.md](./WBS_MASTER.md) - WBS 마스터 문서
- [WBS_GANTT.md](./WBS_GANTT.md) - Gantt Chart
- [WEEKLY_REPORT_TEMPLATE.md](./WEEKLY_REPORT_TEMPLATE.md) - 주간 보고 양식

---

**이 리스크 분석 문서는 프로젝트 진행 상황에 따라 지속적으로 업데이트됩니다.**
