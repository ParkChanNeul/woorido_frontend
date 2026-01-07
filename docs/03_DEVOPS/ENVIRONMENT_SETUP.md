# 🛠️ WOORIDO 개발 환경 및 의존성 명세서

> **Project:** WOORIDO (Frontend + Backend + Analytics)
> **Version:** v2.0 - Final Specification Aligned
> **Last Updated:** 2025-12-30
> **Status:** Development Ready
> **Based On:** PRODUCT_AGENDA v3.0 Final, IA_SPECIFICATION v2.1

---

## 📋 목차

- [1. 개요](#1-개요)
- [2. 프론트엔드 환경](#2-프론트엔드-환경)
  - [2.1 핵심 프레임워크](#21-핵심-프레임워크)
  - [2.2 보안 고려사항 (React2Shell)](#22-보안-고려사항-react2shell)
  - [2.3 UI 라이브러리](#23-ui-라이브러리)
  - [2.4 상태 관리 및 데이터 페칭](#24-상태-관리-및-데이터-페칭)
  - [2.5 개발 도구](#25-개발-도구)
- [3. 백엔드 환경](#3-백엔드-환경)
  - [3.1 Java/Spring Boot 스택](#31-javaspring-boot-스택)
  - [3.2 Python/Django 스택](#32-pythondjango-스택)
  - [3.3 데이터베이스 및 검색](#33-데이터베이스-및-검색)
- [4. 버전 호환성 매트릭스](#4-버전-호환성-매트릭스)
- [5. 의존성 업데이트 권장사항](#5-의존성-업데이트-권장사항)
- [6. 보안 체크리스트](#6-보안-체크리스트)
- [7. 환경 변수 설정](#7-환경-변수-설정)

---

## 1. 개요

### 1.1 설계 원칙

WOORIDO 프로젝트는 다음 원칙에 따라 개발 환경을 구성합니다:

1. **보안 우선**: 알려진 CVE 취약점이 없는 안정 버전 사용
2. **안정성 중심**: 최신 버전보다 검증된 LTS/안정 버전 선호
3. **호환성 보장**: 프론트엔드-백엔드 간 의존성 충돌 방지
4. **개발 생산성**: 현대적인 개발 도구 및 자동화 지원

### 1.2 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React 18 + Vite + TypeScript)                │
│  - SNS-First Design (피드 우선)                          │
│  - Mobile-First Responsive                              │
│  - MSW (Mock Service Worker) for Frontend-First Dev    │
│  - 2026 UI/UX Trends (Skeleton, Glassmorphism)         │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API (JSON)
┌─────────────────┴───────────────────────────────────────┐
│  Backend: Spring Boot (Java 17) + MyBatis              │
│  - Main Business Logic (모임/투표/장부/유저 CRUD)        │
│  - Transaction Management                               │
│  - JWT 인증 및 권한 관리                                 │
│  - 토스페이 결제 연동 (MVP)                              │
│  - Django 분석 요청 라우팅                               │
└─────┬───────────────────┬───────────────────────────────┘
      │                   │
      │ HTTP API          │ JDBC
      ▼                   ▼
┌──────────────┐    ┌──────────────┐
│ Django 5.1   │    │ Oracle 21c   │
│ (Analytics)  │    │ (Main Store) │
│              │    │              │
│ ❌ DB 직접   │    │ ✅ Spring만  │
│   연결 금지  │    │   연결       │
└──────────────┘    └──────────────┘
      │
      │ pandas/numpy 분석
      ▼
┌──────────────────────────────────────┐
│ Financial Analysis (Demo Day 핵심)   │
│ - 월별 지출 통계                      │
│ - 카테고리별 비율                     │
│ - 지출 트렌드                        │
│ - 재정 건전성 분석                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 🔴 Elasticsearch (Post-Demo)         │
│ - Group Search (태그, 카테고리, 키워드) │
│ - Real-time Autocomplete             │
│ - **Demo Day 제외** (2순위 기능)      │
└──────────────────────────────────────┘
```

---

## 2. 프론트엔드 환경

### 2.1 핵심 프레임워크

| 패키지 | 현재 버전 | 권장 버전 | 비고 |
|--------|----------|----------|------|
| **React** | 18.3.1 | **18.3.1** | ✅ 안정 버전 유지 (React2Shell 영향 없음) |
| **React-DOM** | 18.3.1 | **18.3.1** | React 버전과 일치 |
| **TypeScript** | 5.9.3 | **5.9.3** | 안정 버전 (5.x LTS) |
| **Vite** | 6.0.5 | 6.4.1 | 6.x 최신 마이너 버전으로 업데이트 권장 |

**📌 React 버전 결정 근거:**

- **React 18.3.1 유지 권장** (현재 상태)
  - ✅ React Server Components 미사용 → React2Shell (CVE-2025-55182) 영향 없음
  - ✅ 안정성 검증 완료 (2024년 릴리스)
  - ✅ 에코시스템 호환성 우수 (대부분 라이브러리 지원)
  - ✅ 프로젝트 타임라인 고려 (Demo Day: 2026-02-25, 68일)

- **React 19.x 업그레이드 시 고려사항**
  - ⚠️ Breaking Changes 존재 (컴포넌트 라이프사이클 변경)
  - ⚠️ 서드파티 라이브러리 호환성 확인 필요
  - ✅ 최신 보안 패치 (19.2.3)
  - ⚠️ 마이그레이션 작업 필요 (최소 3-5일 소요)

**결론: React 18.3.1 유지 + 정기 보안 패치 모니터링**

---

### 2.2 보안 고려사항 (React2Shell)

#### 2.2.1 CVE-2025-55182 (React2Shell) 개요

**심각도:** 🔴 Critical (CVSS 10.0)

**영향 범위:**
- React 19.x (Server Components 사용 시)
- Next.js 15.x, 16.x (App Router 사용 시)

**취약점 설명:**
- React Server Components(RSC)의 **비안전한 역직렬화** 문제
- 공격자가 조작된 HTTP 요청으로 **원격 코드 실행(RCE)** 가능
- 인증 없이 공격 가능 (Pre-authentication)
- 2025년 12월 3일 공개, **즉시 악용 사례 확인됨**

**안전한 버전:**
- React: 19.0.3, 19.1.4, **19.2.3**
- Next.js: 14.2.35, 15.0.7, 15.1.11

**WOORIDO 프로젝트 영향 분석:**

| 항목 | 상태 | 영향도 |
|------|------|--------|
| React 버전 | 18.3.1 | ✅ **안전** (RSC 미사용) |
| Server Components 사용 | ❌ 미사용 | ✅ **영향 없음** |
| Next.js 사용 | ❌ Vite 사용 | ✅ **영향 없음** |

**결론:** 현재 프로젝트는 React2Shell 취약점에 **직접 영향 없음**

**Sources:**
- [Resecurity - React2Shell Explained](https://www.resecurity.com/blog/article/react2shell-explained-cve-2025-55182-from-vulnerability-discovery-to-exploitation)
- [Microsoft Security Blog - Defending against CVE-2025-55182](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)
- [React Official Blog - Critical Security Vulnerability](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
- [AWS Security Blog - China-nexus cyber threat groups exploit](https://aws.amazon.com/blogs/security/china-nexus-cyber-threat-groups-rapidly-exploit-react2shell-vulnerability-cve-2025-55182/)

#### 2.2.2 보안 모니터링

**정기 점검 체크리스트:**
- [ ] React 공식 보안 권고 모니터링 (https://react.dev/blog)
- [ ] npm audit 정기 실행 (주 1회)
- [ ] GitHub Dependabot 알림 확인
- [ ] OWASP Top 10 취약점 점검

---

### 2.3 2026 UI/UX 트렌드 적용

**IA_SPECIFICATION v2.0 기반 트렌드:**

| 트렌드 | 적용 영역 | 구현 라이브러리 |
|--------|----------|---------------|
| **Skeleton UI** | 모든 로딩 상태 | custom CSS + Framer Motion |
| **Glassmorphism** | Modal, Card | backdrop-filter CSS |
| **Micro-interactions** | 투표, 좋아요, 충전 | Framer Motion |
| **Progressive Disclosure** | 가입 플로우, 장부 상세 | React State Management |
| **Minimalist Design** | 전체 UI | Tailwind CSS |
| **Dark Mode** | 전체 (Post-Demo) | Tailwind dark: variants |

**Sources:**
- [Mobile App UI/UX Design Trends 2026](https://www.letsgroto.com/blog/mobile-app-ui-ux-design-trends-2026-the-only-guide-you-ll-need)
- [Top 10 Fintech UX Design Practices 2026](https://www.onething.design/post/top-10-fintech-ux-design-practices-2026)

---

### 2.4 UI 라이브러리

#### 2.4.1 컴포넌트 라이브러리

| 패키지 | 현재 버전 | 용도 | 우선순위 |
|--------|----------|------|---------|
| **@radix-ui/react-*** | 1.x-2.x | Headless UI 컴포넌트 | P0 |
| **tailwindcss** | 3.4.19 | CSS 프레임워크 | P0 |
| **tailwind-merge** | 3.4.0 | 클래스 충돌 방지 | P0 |
| **class-variance-authority** | 0.7.1 | 조건부 스타일링 | P0 |
| **framer-motion** | 11.15.0 → 12.23.26 | 애니메이션 | P1 |
| **lucide-react** | 0.468.0 → 0.562.0 | 아이콘 | P1 |

**Radix UI 컴포넌트 목록 (IA v2.1 매핑):**

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

// IA v2.1 신규 컴포넌트
Skeleton   → Custom (Tailwind + Framer)   // 로딩 UX
EmptyState → Custom Component             // 빈 상태 CTA
```

#### 2.3.2 차트 라이브러리

| 패키지 | 버전 | 용도 | Demo Day 포함 |
|--------|------|------|--------------|
| **recharts** | 2.15.0 | 장부 통계 시각화 | ✅ P0 |
| react-circular-progressbar | 2.2.0 | 참여율 표시 | ✅ P1 |

**Recharts 구현 예정 차트 (Django 분석 연동):**
- Line Chart: 월별 지출 추이 (Django `/api/analyze/trend`)
- Pie Chart: 카테고리별 지출 비율 (Django `/api/analyze/category-ratio`)
- Bar Chart: 월별 납입률 비교 (Post-Demo)

**Django 분석 Fallback 전략:**
```typescript
// Django 분석 실패 시 기본 통계만 표시
try {
  const analysis = await fetchDjangoAnalysis(groupId);
  return <RechartsLineChart data={analysis.trend} />;
} catch (error) {
  return <SimpleStats total={basicStats.total} avg={basicStats.avg} />;
}
```

---

### 2.5 상태 관리 및 데이터 페칭

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| **@tanstack/react-query** | 5.90.12 | 서버 상태 관리 | 캐싱, 동기화, 리페칭 |
| **zustand** | 4.5.5 → 5.0.9 | 클라이언트 상태 관리 | 글로벌 UI 상태 |
| **axios** | 1.7.9 | HTTP 클라이언트 | Spring Boot API 통신 |
| **react-hook-form** | 7.54.0 | 폼 상태 관리 | 모임 생성, 회원가입 |
| **zod** | 3.24.0 → 4.2.1 | 스키마 검증 | 폼 유효성 검사 |

**상태 관리 전략:**

```typescript
// TanStack Query: 서버 데이터
const { data: groups } = useQuery({
  queryKey: ['groups', userId],
  queryFn: fetchMyGroups,
  staleTime: 1000 * 60 * 5, // 5분
});

// Zustand: UI 상태
const useUIStore = create((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
```

---

### 2.6 개발 도구

#### 2.6.1 코드 품질

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **ESLint** | 9.39.1 | 코드 린팅 |
| **Prettier** | 3.7.4 | 코드 포매팅 |
| **TypeScript** | 5.9.3 | 정적 타입 검사 |
| **lint-staged** | 16.2.7 | Git Hook 린팅 |
| **husky** | 9.1.7 | Git Hook 관리 |

#### 2.6.2 테스트 및 모킹

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **vitest** | 4.0.15 | 유닛/통합 테스트 |
| **playwright** | 1.57.0 | E2E 테스트 |
| **MSW** | 2.12.4 | API 모킹 (Frontend-First 개발) |

**MSW 활용:**
```typescript
// Demo Day 전까지 백엔드 API 모킹
// handlers/groups.ts
export const groupHandlers = [
  http.get('/api/groups/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: '독서 모임',
      category: 'STUDY',
      // ... mock data
    });
  }),
];
```

#### 2.6.3 스토리북

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **storybook** | 10.1.8 → 10.1.10 | 컴포넌트 문서화 |
| **chromatic** | 13.3.4 | 비주얼 리그레션 테스트 |

**Storybook 사용 목적:**
- Mobile(375px) + Desktop(1920px) 반응형 확인
- Week 0-1 스켈레톤 작성 시 사용
- 디자이너/기획자와 협업

---

## 3. 백엔드 환경

### 3.1 Java/Spring Boot 스택

#### 3.1.1 핵심 버전

| 항목 | 권장 버전 | 비고 |
|------|----------|------|
| **Java** | **17.0.16 LTS** | 사용자 지정 버전 (보안 패치 포함) |
| **Spring Boot** | **3.1.18** | Java 17 LTS 지원, 안정성 중심, MyBatis 호환 |
| **MyBatis** | **3.5.16** | Spring Boot 3.x 호환 |
| **MyBatis-Spring-Boot-Starter** | **3.0.3** | Spring Boot 3.1.x 호환 |

**⚠️ MyBatis vs JPA 선택:**
- **우리두 선택: MyBatis** (복잡한 SQL 쿼리 직접 제어 필요)
- 장부, 회비 계산 등 복잡한 집계 쿼리에 유리
- XML 매퍼로 SQL과 코드 분리
- 안정성 검증 완료

**Java 17.0.16 선정 이유:**
- ✅ LTS 버전 (2029년까지 지원)
- ✅ 최신 보안 패치 포함
- ✅ Spring Boot 3.x 공식 지원
- ✅ 기업 환경 검증 완료

#### 3.1.2 Spring Boot 의존성

```xml
<!-- pom.xml -->
<properties>
    <java.version>17</java.version>
    <spring-boot.version>3.1.18</spring-boot.version>
    <mybatis-spring-boot.version>3.0.3</mybatis-spring-boot.version>
</properties>

<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>${mybatis-spring-boot.version}</version>
    </dependency>

    <!-- Oracle JDBC Driver -->
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc11</artifactId>
        <version>23.7.0.25.01</version>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.6</version>
    </dependency>
</dependencies>
```

**MyBatis 사용 이유:**
- 복잡한 SQL 쿼리 직접 제어 (장부, 회비 계산)
- XML 매퍼로 SQL과 코드 분리
- 안정성 검증 완료 (레거시 프로젝트 호환)

---

### 3.2 Python/Django 스택

#### 3.2.1 핵심 버전

| 항목 | 권장 버전 | 비고 |
|------|----------|------|
| **Python** | **3.12.x** | 3.11~3.14 중 안정성 중심 선택 |
| **Django** | **5.1.x** | Python 3.12 공식 지원 |
| **djangorestframework** | **3.15.x** | Spring Boot REST API 연동 |
| **pandas** | **2.2.x** | 재정 분석 (Demo Day 핵심) |
| **numpy** | **2.2.x** | 수치 계산 |

**Python 3.12 선정 이유:**
- ✅ 안정성 검증 완료 (2024년 릴리스)
- ✅ Django 5.1 공식 지원
- ✅ 성능 개선 (3.11 대비 5-10%)
- ✅ 보안 패치 활발
- ⚠️ 3.13, 3.14는 아직 초기 버전 (안정성 고려)

#### 3.2.2 Django 의존성

```python
# requirements.txt
Django==5.1.4
djangorestframework==3.15.2
pandas==2.2.3
numpy==2.2.1
requests==2.32.3  # Spring Boot API 호출

# 추가 라이브러리
python-dateutil==2.9.0
pytz==2024.2
```

#### 3.2.3 Django 역할

**Django는 분석 전용 마이크로서비스:**

```python
# Spring Boot → Django 호출 흐름
# 1. Spring Boot Controller
@PostMapping("/api/groups/{groupId}/finance/analysis")
public FinanceAnalysis getFinanceAnalysis(@PathVariable Long groupId) {
    // Django API 호출
    String djangoUrl = "http://django:8000/analysis/finance";
    // ...
}

# 2. Django View
@api_view(['POST'])
def analyze_finance(request):
    transactions = request.data['transactions']

    df = pd.DataFrame(transactions)
    total_expense = df['amount'].sum()
    avg_daily_expense = df.groupby('date')['amount'].mean()

    return Response({
        'total_expense': total_expense,
        'avg_daily_expense': avg_daily_expense.to_dict(),
        # ...
    })
```

**Demo Day 필수 분석 기능:**
- 재정 프로필 기반 적정 월 납입금 추천
- 카테고리별 지출 비율 (Pie Chart 데이터)
- 일별 지출 추이 (Line Chart 데이터)

---

### 3.3 데이터베이스 및 검색

#### 3.3.1 Oracle Database

| 항목 | 권장 버전 | 비고 |
|------|----------|------|
| **Oracle DB** | **21c Express Edition** | 개발/테스트 환경 |
| **JDBC Driver** | **23.7.0.25.01** | Java 17 호환 |

**선정 이유:**
- 트랜잭션 안정성 (회비 입출금)
- ACID 보장 (장부 데이터 무결성)

#### 3.3.2 Elasticsearch (Post-Demo)

**⚠️ Demo Day 제외 - 2순위 기능**

| 항목 | 권장 버전 | 비고 |
|------|----------|------|
| **Elasticsearch** | **8.16.x** | 최신 안정 버전 |
| **Elasticsearch Java Client** | **8.16.2** | Spring Boot 연동 |

**사용 목적 (Post-Demo):**
- 모임 검색 (키워드, 태그, 카테고리)
- 실시간 자동완성
- 전문 검색 (Full-text Search)

**Demo Day 대체 방안:**
- Oracle `LIKE` 검색으로 기본 구현
- 카테고리 필터 (Dropdown)
- Post-Demo에 Elasticsearch 마이그레이션

```java
// Demo Day: Oracle LIKE 검색
@Repository
public interface GroupRepository {
    @Select("SELECT * FROM groups WHERE name LIKE #{keyword} OR description LIKE #{keyword}")
    List<Group> searchByKeyword(@Param("keyword") String keyword);
}

// Post-Demo: Elasticsearch 연동
@Service
public class GroupSearchService {
    @Autowired
    private ElasticsearchClient elasticsearchClient;

    public List<Group> searchGroups(String keyword) {
        // Elasticsearch Query DSL
        // ...
    }
}
```

---

## 4. 버전 호환성 매트릭스

### 4.1 프론트엔드-백엔드 호환성

| Frontend | Backend (Spring Boot) | Backend (Django) | Database |
|----------|----------------------|------------------|----------|
| React 18.3.1 | Spring Boot 3.1.x | Django 5.1.x | Oracle 21c |
| TypeScript 5.9.3 | Java 17.0.16 | Python 3.12.x | - |
| Vite 6.x | Tomcat 10.x (내장) | Gunicorn 23.x | - |

### 4.2 주요 의존성 버전 제약

| 라이브러리 | 최소 버전 | 권장 버전 | Breaking Change |
|-----------|----------|----------|----------------|
| React | 18.0.0 | 18.3.1 | - |
| @tanstack/react-query | 5.0.0 | 5.90.12 | v5: useQuery 반환값 변경 |
| react-router-dom | 6.0.0 | 6.28.0 | v7: Layout Routes 변경 (현재 6.x 유지) |
| Radix UI | 1.0.0 | 1.x-2.x | - |
| recharts | 2.0.0 | 2.15.0 | v3: Major API 변경 (현재 2.x 유지) |

---

## 5. 개발 일정 및 우선순위 (Demo Day 역산)

### 5.1 Phase 1-7 타임라인 (PRODUCT_AGENDA v3.0)

**전체 기간: 2025-12-30 ~ 2026-02-25 (57일, 8주)**

| Phase | 기간 | 주요 기능 | API 수 | Checkpoint |
|-------|------|----------|--------|-----------|
| **Phase 1** | Week 1 (12/30-1/5) | 환경 세팅 + 로그인 + Seed 데이터 | 2개 | 개발환경 100% 작동, Spring↔Django 통신 성공 |
| **Phase 2** | Week 2-3 (1/6-1/19) | **SNS 완성** (피드/댓글/좋아요/이미지) | 18개 | 피드 Full Flow 작동, 이미지 업로드 성공 |
| **Phase 3** | Week 4 (1/20-1/26) | 가입 플로우 + 가상머니 + 모임 생성 | 14개 | 충전→가입→보증금락 Full Flow |
| **Phase 4** | Week 5 (1/27-2/5) | **장부 + Django 분석** + 투표 API (Backend) | 8개 | 차트 렌더링, Django 분석 3초 이내 |
| **Phase 5** | Week 6-7 (2/6-2/14) | **투표 시스템** (UI + Full Flow) | 5개 | 지출요청→투표→승인→장부 Full Flow |
| **Phase 6** | Week 8 (2/15-2/20) | 통합 테스트 + 버그 수정 | 0개 | 시연 성공률 100%, Spring↔Django 안정성 |
| **Phase 7** | Week 9 (2/21-2/25) | 시연 리허설 | 0개 | Demo Day 준비 완료 |

**총 API: Spring Boot 44개 + Django 4개 = 48개**

### 5.2 SNS-First 개발 우선순위

**1순위 (P0): Demo Day 필수**
```
Week 2-3: SNS (피드/댓글/좋아요/이미지) - 18 API
  └─ 가장 먼저 완성 (사용자 이탈 방지)
  └─ Seed 데이터 필요 (테스트 모임 2개 + 멤버 5명)
  └─ 피드 작성 → 댓글 → 좋아요 Full Flow
  └─ 이미지 업로드 (S3)
  └─ 페이지네이션 (20개씩)
  └─ 공지사항 핀 고정
```

**2순위 (P0): 신뢰 구축**
```
Week 4: 가입 플로우 + 가상머니
  └─ 충전 (토스페이 Mock)
  └─ 가입 시 보증금 락 (2개월치)
  └─ 어카운트 잔액 표시 (가용/락 분리)
```

**3순위 (P0): 투명성**
```
Week 5: 장부 + Django 분석
  └─ Django 분석 API 4개 (월별/카테고리/트렌드/재정건전성)
  └─ Recharts Line Chart (월별 추이)
  └─ Recharts Pie Chart (카테고리별 비율)
  └─ Fallback UI (Django 실패 시 기본 통계)

Week 6-7: 투표 시스템
  └─ 지출 요청 → 투표 → 승인 → 장부 자동 기록
  └─ 과반수 판정 로직
```

**4순위 (P1): 있으면 좋음**
- 반응형 (Mobile + Desktop) - 동시 진행
- 재정 프로필 입력 - 선택 기능

**5순위 (P2): Post-Demo**
- Elasticsearch 검색
- 실시간 알림 (WebSocket)
- 무한 스크롤
- Dark Mode

### 5.3 IA v2.1 신규 기능 반영

**온보딩 플로우 (신규 유저 이탈 방지):**
- 웰컴 카드 (첫 방문 유저)
- 첫 충전 유도 CTA (잔액 0원 시)
- 인기 모임 추천 (가입 모임 없을 때)

**보증금 해제 플로우:**
- `/groups/:id/complete` - 완주 축하 (보증금 → 가용 잔액)
- `/groups/:id/leave` - 정상 탈퇴 확인
- 강제 퇴출 Toast (보증금 몰수 알림)

**Empty State CTA (모든 빈 상태):**
- 빈 피드 → "첫 글 작성 유도"
- 빈 투표 → "CP만 생성 가능 안내"
- 빈 장부 → "첫 지출 요청 안내"
- 빈 모임 → "모임 찾기 CTA"

**로딩 UX:**
- Skeleton UI (Card/List/Page 3종)
- Progress Bar (이미지 업로드, 충전)
- Optimistic UI (좋아요, 댓글)

---

## 6. 의존성 업데이트 권장사항

### 6.1 즉시 업데이트 권장 (보안/안정성)

```bash
# 마이너/패치 버전 업데이트
npm update vite                      # 6.0.5 → 6.4.1
npm update @storybook/react-vite     # 10.1.8 → 10.1.10
npm update vitest                    # 4.0.15 → 4.0.16
npm update eslint                    # 9.39.1 → 9.39.2
npm update typescript-eslint         # 8.49.0 → 8.50.1
```

### 6.2 Phase별 업데이트 계획

**Phase 1 (Week 1): 환경세팅**
- ✅ Storybook 최신화 (10.1.10)
- ✅ Vite 최신화 (6.4.1)
- ✅ ESLint/Prettier 설정
- ✅ Django 프로젝트 초기화 + pandas/numpy
- ✅ Spring↔Django HTTP 통신 테스트

**Phase 2-3 (Week 2-4): 기능 개발**
- ⏸️ 메이저 업데이트 금지 (안정성 우선)
- ✅ 보안 패치만 적용

**Phase 4 (Week 5): Django 연동**
- ⚠️ 기존 의존성 유지
- ✅ Django 분석 API 4개 구현

**Demo Day 이후:**
- React 19.x 마이그레이션 검토
- zustand 5.x 업그레이드
- recharts 3.x 검토 (Breaking Changes 확인 필요)

### 6.3 업데이트 금지 목록 (Demo Day 전)

| 패키지 | 현재 버전 | Latest | 사유 |
|--------|----------|--------|------|
| react | 18.3.1 | 19.2.3 | Breaking Changes (마이그레이션 시간 부족) |
| react-router-dom | 6.28.0 | 7.11.0 | Layout Routes 변경 (리팩토링 필요) |
| recharts | 2.15.0 | 3.6.0 | API 변경 (차트 구현 완료 후 업그레이드) |
| tailwindcss | 3.4.19 | 4.1.18 | CSS 변경 (v4: 새로운 엔진) |
| zod | 3.24.0 | 4.2.1 | 스키마 검증 로직 변경 가능성 |

---

## 7. 보안 체크리스트

### 7.1 프론트엔드 보안

- [ ] **XSS 방지**: React의 자동 이스케이핑 활용
- [ ] **CSRF 방지**: Spring Security CSRF 토큰 검증
- [ ] **JWT 토큰 관리**: httpOnly Cookie 저장 (LocalStorage 금지)
- [ ] **API 호출 검증**: Axios Interceptor에서 토큰 자동 주입
- [ ] **환경 변수 관리**: `.env` 파일 `.gitignore` 등록

```typescript
// Axios 인터셉터 예시
axios.interceptors.request.use((config) => {
  const token = getTokenFromCookie(); // httpOnly Cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 7.2 백엔드 보안

- [ ] **SQL Injection 방지**: MyBatis PreparedStatement 사용
- [ ] **인증/인가**: Spring Security + JWT
- [ ] **비밀번호 암호화**: BCrypt (strength 12)
- [ ] **CORS 설정**: 프론트엔드 도메인만 허용

```java
// Spring Security 설정
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable()) // JWT 사용 시
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        );
    return http.build();
}
```

### 7.3 의존성 보안 점검

```bash
# 프론트엔드
npm audit
npm audit fix  # 자동 수정 가능한 취약점만

# 백엔드 (Spring Boot)
mvn dependency-check:check

# 백엔드 (Django)
pip-audit
```

---

## 8. 환경 변수 설정

### 8.1 프론트엔드 (.env)

```bash
# API Endpoint
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DJANGO_API_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_MSW=true  # MSW 활성화 (개발 환경)
VITE_ENABLE_DEVTOOLS=true  # React Query DevTools

# OAuth (소셜 로그인)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
```

### 8.2 백엔드 (Spring Boot - application.yml)

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@localhost:1521:XE
    username: woorido
    password: ${DB_PASSWORD}  # 환경 변수로 주입
    driver-class-name: oracle.jdbc.OracleDriver

  jpa:
    hibernate:
      ddl-auto: validate  # 프로덕션: validate
    show-sql: false

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.woorido.domain

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000  # 24시간
```

### 8.3 백엔드 (Django - settings.py)

```python
# settings.py
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# Spring Boot API 연동
SPRING_BOOT_API_URL = os.getenv('SPRING_BOOT_API_URL', 'http://localhost:8080')

# Database (분석 결과 캐시용)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'analysis_cache.db',
    }
}
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-12-26 | v1.0 | 초안 작성 (React2Shell 보안 분석 포함) | Development Team |
| 2025-12-30 | v2.0 | **Final Specification 정렬**: Phase 1-7 일정 추가, SNS-First 우선순위 명시, Django 분석 역할 강화, Elasticsearch Post-Demo 이동, IA v2.1 신규 기능 반영 (보증금 해제, 온보딩, Empty State CTA), 2026 UI/UX 트렌드 추가, MyBatis vs JPA 명확화, API 수 명시 (Spring 44 + Django 4) | Development Team |

---

**이 문서는 살아있는 문서(Living Document)입니다. 의존성 업데이트 시 지속적으로 업데이트됩니다.**

**관련 문서:**
- [PRODUCT_AGENDA.md](./Final/PRODUCT_AGENDA.md) - 프로젝트 아젠다 v3.0
- [IA_SPECIFICATION.md](./Final/IA_SPECIFICATION.md) - IA 명세서 v2.1
- [WOORIDO_FINAL_SPECIFICATION.md](./Final/WOORIDO_FINAL_SPECIFICATION.md) - 최종 설계 명세서 v1.0
- [IA_Comprehensive_v2.csv](./Final/IA_Comprehensive_v2.csv) - 종합 IA
- [IA_Event_Mapping_v2.csv](./Final/IA_Event_Mapping_v2.csv) - 이벤트 매핑
- [IA_Development_Phase_v2.csv](./Final/IA_Development_Phase_v2.csv) - 개발 페이즈
