# 🎯 WOORIDO 프로젝트 가이드라인

> **버전**: v1.0
> **최종 업데이트**: 2025-12-30
> **상태**: ⚠️ **긴급 공지** - 문서 대폭 개편 완료
> **데모 데이**: 2026-02-25 (D-57)

---

## 🚨 먼저 읽어주세요!

### ⚡ 무엇이 바뀌었나요?

**Final 폴더가 완전히 새로 구성되었습니다.**
기존 초안들이 **PM, UI/UX 관리자, 개발 리드의 3중 검증**을 거쳐 **production-ready** 문서로 업그레이드되었습니다.

#### 📊 주요 변경사항 요약

| 항목 | 이전 | 현재 (v2.0) |
|------|------|-------------|
| **IA 구조** | Phase 4 → 6 (누락) | Phase 1-7 완전 정렬 |
| **UI/UX** | Empty State 없음 | 모든 빈 화면에 CTA 추가 |
| **디자인 토큰** | 임시 컬러 | **로고 기반** #ff5722 |
| **국제화** | 없음 | **한/영 i18n** 준비 완료 |
| **개발 가이드** | 불완전 | **즉시 코딩 가능** 수준 |
| **CSV** | 1개 | **3개** (종합/이벤트/페이즈) |

---

## 🗺️ 5초 만에 이해하는 WOORIDO

```
┌─────────────────────────────────────────────────────┐
│  "소모임 + 토스 = 우리두"                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  문제: 소모임은 회비 수금 불가 ❌                     │
│        토스는 계주가 독단 출금 가능 ❌                 │
│                                                     │
│  해결: SNS 피드 + 투표 기반 출금 승인 ✅               │
│        보증금 락으로 이탈 방지 ✅                      │
│        투명한 장부 공개 ✅                             │
│                                                     │
│  핵심: 신뢰 트라이앵글 (Trust Triangle)              │
│        ┌──────┐                                    │
│        │ 장부 │                                    │
│        │투명화│                                    │
│        └──┬───┘                                    │
│          / \                                       │
│         /   \                                      │
│    ┌───┐   ┌───┐                                  │
│    │락 │───│투표│                                  │
│    │보증│   │승인│                                  │
│    └───┘   └───┘                                  │
└─────────────────────────────────────────────────────┘
```

**데모 데이 핵심 메시지**:
> "소모임처럼 모이고, 토스처럼 관리하되, 먹튀 걱정은 없다"

---

## 📁 문서 구조 한눈에 보기

### Final 폴더 구성 (8개 파일)

```
docs/Final/
│
├── 📘 WOORIDO_GUIDELINE.md ⭐ 이 파일
│   └─ 시작점: 팀원 온보딩용
│
├── 📗 WOORIDO_FINAL_SPECIFICATION.md (31KB)
│   └─ 전체 시스템 설계 명세서
│
├── 📕 PRODUCT_AGENDA.md (24KB)
│   └─ 제품 아젠다 + Phase 1-7 일정
│
├── 📙 IA_SPECIFICATION.md (43KB)
│   └─ 화면 설계서 + ASCII 와이어프레임
│
├── 📓 DEVELOPMENT_ENVIRONMENT.md (29KB)
│   └─ 개발 환경 + 기술 스택
│
├── 📔 FRONTEND_IMPLEMENTATION_GUIDE.md (41KB)
│   └─ 프론트엔드 구현 가이드 (API/컴포넌트/디자인)
│
└── 📊 CSV 파일 3개 (개발자용)
    ├─ IA_Comprehensive_v2.csv (80개 화면/컴포넌트)
    ├─ IA_Event_Mapping_v2.csv (42개 유저 액션)
    └─ IA_Development_Phase_v2.csv (66개 개발 태스크)
```

---

## 👥 역할별 읽기 가이드

### 🎨 PM / 기획자

**당신의 미션**: 전체 프로젝트 방향성 파악 + 데모 데이 준비

#### 필독 순서
1. ✅ **이 파일** (WOORIDO_GUIDELINE.md) - 5분
2. 📕 [PRODUCT_AGENDA.md](PRODUCT_AGENDA.md) - 15분
   - Phase 1-7 일정표
   - Trust Triangle 핵심 개념
   - 데모 데이 시나리오
3. 📗 [WOORIDO_FINAL_SPECIFICATION.md](WOORIDO_FINAL_SPECIFICATION.md) - 30분
   - 비즈니스 로직 전체
   - 수수료 정책
   - 보증금 해제 시나리오

#### 선택적으로 확인
- 📙 [IA_SPECIFICATION.md](IA_SPECIFICATION.md) - UI 플로우 검증용
- 📊 IA_Comprehensive_v2.csv - 화면 목록 확인

---

### 🎨 디자이너 / UI/UX

**당신의 미션**: 화면 설계 + 사용자 경험 최적화

#### 필독 순서
1. ✅ **이 파일** (WOORIDO_GUIDELINE.md) - 5분
2. 📔 [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md) - 20분
   - **디자인 토큰** (Section 5)
     - 브랜드 컬러: **#ff5722** (로고 기반)
     - Typography Scale
     - Spacing System
     - Glassmorphism 스타일
   - **공통 컴포넌트 Props** (Section 2)
3. 📙 [IA_SPECIFICATION.md](IA_SPECIFICATION.md) - 40분
   - **ASCII 와이어프레임** (실제 UI 구조)
   - Empty State 설계
   - 터치 타겟 사이즈 (44px/48px/56px)

#### 선택적으로 확인
- 📊 IA_Comprehensive_v2.csv - "플랫폼", "터치타겟" 열 확인
- 📊 IA_Event_Mapping_v2.csv - "로딩상태", "접근성" 열 확인

#### 🎨 디자인 시스템 핵심

```typescript
// 브랜드 컬러 (로고 기반)
Primary: #ff5722  // 우리두 오렌지
Hover:   #e64a19
Active:  #d84315

// 터치 타겟 (Mobile-First)
- 버튼: 48px 이상
- 카드 전체: 전체 영역
- FAB: 56px
- 네비게이션: 44px
```

---

### 💻 프론트엔드 개발자

**당신의 미션**: React 18 + TypeScript로 SNS-First UI 구현

#### 필독 순서
1. ✅ **이 파일** (WOORIDO_GUIDELINE.md) - 5분
2. 📔 [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md) - **60분** ⭐
   - **Section 1**: API Response 스키마 (모든 엔드포인트)
   - **Section 2**: 공통 컴포넌트 Props 타입
   - **Section 3**: 라우팅 시스템 (ProtectedRoute 포함)
   - **Section 4**: 상태 관리 (TanStack Query + Zustand)
   - **Section 5**: 디자인 토큰 (Tailwind Config)
   - **Section 6**: Zod 유효성 검사
   - **Section 7**: Toast 알림 시스템
   - **Section 8**: i18n 설정 (한/영)
   - **Section 9**: MSW 핸들러 (모든 API 모킹)
3. 📓 [DEVELOPMENT_ENVIRONMENT.md](DEVELOPMENT_ENVIRONMENT.md) - 20분
   - React 18.3.1 (React2Shell CVE 안전)
   - Vite 6.x
   - TanStack Query 5.90.12
   - Radix UI, Recharts, Framer Motion
4. 📙 [IA_SPECIFICATION.md](IA_SPECIFICATION.md) - 30분
   - Phase별 구현 우선순위
   - ASCII 와이어프레임 → 실제 컴포넌트 구조

#### 즉시 시작 가능한 템플릿

```typescript
// FRONTEND_IMPLEMENTATION_GUIDE.md에 모두 포함:
✅ API 스키마 (48개 엔드포인트)
✅ 컴포넌트 Props 타입
✅ Protected Route 패턴
✅ Optimistic Update 패턴
✅ MSW 핸들러 (모든 API)
✅ Tailwind Config
✅ Zod Schema
✅ i18n 설정
```

#### 개발 우선순위 (Phase)
- **Phase 1 (Week 1)**: 환경 + 로그인 + Seed 데이터
- **Phase 2-3 (Week 2-4)**: SNS (피드/댓글/좋아요) - 18 APIs
- **Phase 4 (Week 5)**: 장부 + Django 분석 - 8 APIs
- **Phase 5 (Week 6-7)**: 투표 시스템 - 5 APIs

---

### ⚙️ 백엔드 개발자

**당신의 미션**: Spring Boot + MyBatis로 비즈니스 로직 구현

#### 필독 순서
1. ✅ **이 파일** (WOORIDO_GUIDELINE.md) - 5분
2. 📓 [DEVELOPMENT_ENVIRONMENT.md](DEVELOPMENT_ENVIRONMENT.md) - 30분
   - **Spring Boot 3.1.18** (Java 17)
   - **MyBatis 3.5.16** (JPA 아님!)
   - **Oracle 21c XE**
   - **Django 5.1** (분석만, DB 직접 연결 금지)
3. 📗 [WOORIDO_FINAL_SPECIFICATION.md](WOORIDO_FINAL_SPECIFICATION.md) - 60분
   - 보증금 락 로직
   - 투표 승인 알고리즘 (50% / 67%)
   - 수수료 정책 (1% / 3% / 1.5%)
   - 토스페이 결제 연동
4. 📔 [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md) - 30분
   - **Section 1**: API Response 스키마 (백엔드가 리턴해야 할 JSON)
5. 📊 IA_Development_Phase_v2.csv - Phase별 API 개수 확인

#### API 구현 우선순위

```
Phase 1: 2 APIs (로그인, Seed 데이터)
Phase 2-3: 18 APIs (피드, 댓글, 좋아요, 모임 가입, 충전)
Phase 4: 8 APIs (장부, Django 프록시)
Phase 5: 5 APIs (투표)
───────────────────────────
총: 48 APIs (Spring 44 + Django 4)
```

#### 핵심 비즈니스 로직

```java
// 1. 모임 가입 시 보증금 락
public void joinGroup(userId, groupId) {
  // 1. 가용 잔액 >= monthlyFee 확인
  // 2. 가용 잔액 → 락 잔액 이동
  // 3. 멤버십 생성
  // 4. Transaction 커밋
}

// 2. 투표 승인 알고리즘
public boolean isVoteApproved(voteId) {
  // 일반 지출 (<100k): 과반수 (50%)
  // 대형 지출 (≥100k): 2/3 (67%)
  // 기권 표는 분모에서 제외
}

// 3. 수수료 정책
public int calculateFee(amount) {
  if (amount < 100_000) return amount * 0.01;      // 1%
  if (amount < 1_000_000) return amount * 0.03;    // 3%
  return amount * 0.015;                           // 1.5%
}
```

---

### 🐍 Django 개발자 (Analytics)

**당신의 미션**: pandas로 재정 분석 API 구현

#### 필독 순서
1. ✅ **이 파일** (WOORIDO_GUIDELINE.md) - 5분
2. 📓 [DEVELOPMENT_ENVIRONMENT.md](DEVELOPMENT_ENVIRONMENT.md) - 15분
   - Django 5.1
   - pandas 2.2.x, numpy 2.2.x
   - ❌ DB 직접 연결 금지 (Spring이 데이터 전달)
3. 📔 [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md) - 10분
   - **Section 1.7**: Django 분석 API 스키마

#### Django의 역할

```python
# Spring → Django 분석 요청 플로우
1. Spring이 거래 내역 JSON으로 전달
2. Django가 pandas로 분석
3. JSON 결과 리턴
4. Spring이 프론트에 전달

# 구현할 API (4개)
POST /api/analyze/monthly-stats    # 월별 통계
POST /api/analyze/category-ratio   # 카테고리 비율
POST /api/analyze/trend             # 지출 트렌드
POST /api/analyze/prediction        # 다음 달 예상 지출
```

#### 핵심 분석 로직

```python
# 월별 통계
def calculate_monthly_stats(transactions):
    df = pd.DataFrame(transactions)
    return {
        'total': df['amount'].sum(),
        'avgPerDay': df.groupby('date')['amount'].mean(),
        'trend': 'increasing' | 'decreasing' | 'stable',
        'changePercent': (이번 달 - 지난 달) / 지난 달
    }
```

---

## 🚀 빠른 시작 가이드

### 1️⃣ 첫 30분에 할 일

```bash
# 1. 이 파일 읽기 (5분)
✅ WOORIDO_GUIDELINE.md

# 2. 역할별 필독 문서 1개 읽기 (25분)
📕 PM → PRODUCT_AGENDA.md
🎨 디자이너 → FRONTEND_IMPLEMENTATION_GUIDE.md (Section 5만)
💻 프론트 → FRONTEND_IMPLEMENTATION_GUIDE.md (전체)
⚙️ 백엔드 → DEVELOPMENT_ENVIRONMENT.md
🐍 Django → DEVELOPMENT_ENVIRONMENT.md (Section 3.2만)
```

### 2️⃣ 첫 2시간에 할 일

- **PM**: 데모 데이 시나리오 숙지 (PRODUCT_AGENDA.md Part 5)
- **디자이너**: ASCII 와이어프레임 검토 (IA_SPECIFICATION.md)
- **프론트엔드**: MSW 핸들러로 로컬 개발 환경 구축
- **백엔드**: API 스키마 기반 Spring Controller 스켈레톤 작성
- **Django**: pandas 분석 로직 프로토타입 작성

### 3️⃣ 첫 1주일 목표 (Phase 1)

```
✅ 개발 환경 100% 작동
✅ 로그인 API 구현
✅ 테스트 모임 2개 + 멤버 5명 Seed 데이터
✅ Django ↔ Spring 통신 성공
✅ 프론트엔드 로그인 화면 + Skeleton UI
```

---

## 📊 주요 변경사항 상세

### 1. IA 구조 개편

**문제**: Phase 4 → 6으로 점프 (Phase 5 누락)

**해결**:
```
Phase 1: 환경 + 로그인 (Week 1)
Phase 2-3: SNS 구현 (Week 2-4)
Phase 4: 장부 + Django (Week 5)
Phase 5: 투표 (Week 6-7)  ⭐ 추가
Phase 6: 통합 테스트 (Week 8)
Phase 7: 리허설 (Week 9)
```

### 2. UI/UX 개선

**문제**: 사용자 이탈 방지 장치 없음

**해결**:
- ✅ 모든 Empty State에 CTA 추가
- ✅ 충전 → 가입 복귀 경로 명시 (returnUrl)
- ✅ 온보딩 플로우 추가 (신규 유저용)
- ✅ 에러 복구 경로 명시 (재시도 버튼)

**예시**:
```
❌ 이전: 피드 없음 → 빈 화면
✅ 현재: 피드 없음 → "첫 글을 작성해보세요" CTA 버튼
```

### 3. 디자인 토큰 정비

**문제**: 임시 파란색 컬러 사용

**해결**: 로고 분석 후 실제 브랜드 컬러 추출
```
Primary: #ff5722 (로고 오렌지-빨강)
Hover:   #e64a19
Active:  #d84315
```

### 4. 국제화 준비

**문제**: 한국어만 지원

**해결**: react-i18next 설정 완료
```typescript
// 한/영 토글 지원
const { t } = useTranslation();
<button>{t('common.login')}</button>  // 로그인 / Login
```

### 5. 프론트엔드 가이드 완성

**문제**: API 스키마 일부만 정의, 컴포넌트 타입 없음

**해결**: FRONTEND_IMPLEMENTATION_GUIDE.md 작성
- ✅ 48개 전체 API 스키마
- ✅ 공통 컴포넌트 Props 타입
- ✅ MSW 핸들러 완전판
- ✅ Zod 유효성 검사
- ✅ Toast 시스템
- ✅ Optimistic Update 패턴

### 6. CSV 3종 세트

**문제**: 개발자가 IA 명세서에서 정보 찾기 어려움

**해결**: Excel로 열 수 있는 CSV 3개 제공
1. **IA_Comprehensive_v2.csv**: 80개 화면/컴포넌트 목록
2. **IA_Event_Mapping_v2.csv**: 42개 유저 액션 → API 매핑
3. **IA_Development_Phase_v2.csv**: 66개 개발 태스크 + 의존성

---

## ❓ FAQ

### Q1. 기존 작업한 코드는 어떻게 하나요?

**A**: 이 명세서와 대조해서 검증하세요.
- API Response 형식이 다르면 → FRONTEND_IMPLEMENTATION_GUIDE.md 따르기
- UI 컬러가 다르면 → #ff5722 브랜드 컬러 적용
- Empty State 없으면 → CTA 추가

### Q2. 왜 MyBatis인가요? JPA는요?

**A**: MyBatis 선택 이유 (DEVELOPMENT_ENVIRONMENT.md Section 3.1.2 참조)
- 복잡한 장부 쿼리 (Join 많음)
- 투표 승인 계산 (집계 쿼리)
- 팀의 SQL 숙련도

### Q3. Elasticsearch는 언제 쓰나요?

**A**: **Post-Demo** (데모 데이 이후)
- Demo Day에서는 Oracle LIKE 검색으로 대체
- Phase 7까지는 Elasticsearch 설치 불필요

### Q4. Django는 DB에 직접 연결하나요?

**A**: ❌ **절대 금지**
- Spring이 거래 내역 JSON으로 전달
- Django는 분석만 수행
- 단일 DB 연결로 트랜잭션 정합성 보장

### Q5. 프론트엔드 먼저 개발 가능한가요?

**A**: ✅ **가능** (MSW 활용)
```typescript
// FRONTEND_IMPLEMENTATION_GUIDE.md Section 9 참조
import { worker } from '@/mocks/browser';
worker.start();  // 모든 API 모킹 완료
```

### Q6. 디자인 시스템은 어디 있나요?

**A**: FRONTEND_IMPLEMENTATION_GUIDE.md Section 5
```typescript
// tailwind.config.ts
colors: {
  brand: {
    500: '#ff5722',  // Primary
    600: '#e64a19',  // Hover
  }
}
```

### Q7. Phase별 데드라인은 언제인가요?

**A**: IA_Development_Phase_v2.csv 또는 PRODUCT_AGENDA.md Part 4 참조
```
Phase 1: 12/30-1/5 (Week 1)
Phase 2: 1/6-1/12 (Week 2)
Phase 3: 1/13-1/26 (Week 3-4)
Phase 4: 1/27-2/5 (Week 5)
Phase 5: 2/6-2/14 (Week 6-7)
Phase 6: 2/15-2/20 (Week 8)
Phase 7: 2/21-2/25 (Week 9)
```

### Q8. 데모 데이 시연 시나리오는?

**A**: PRODUCT_AGENDA.md Part 5 참조
1. 신규 유저 가입 (온보딩)
2. 충전 (토스페이)
3. 모임 가입 (보증금 락)
4. 피드 작성/댓글/좋아요
5. 지출 요청 투표
6. 장부 + Django 분석 차트

### Q9. 급하게 확인해야 할 파일 1개만 추천한다면?

**A**: 역할별로 다름
- **PM**: PRODUCT_AGENDA.md
- **디자이너**: FRONTEND_IMPLEMENTATION_GUIDE.md (Section 5 디자인 토큰)
- **프론트**: FRONTEND_IMPLEMENTATION_GUIDE.md (전체)
- **백엔드**: WOORIDO_FINAL_SPECIFICATION.md
- **Django**: DEVELOPMENT_ENVIRONMENT.md (Section 3.2)

### Q10. 이 가이드라인 작성자는 누구인가요?

**A**: Claude Code (AI 개발 어시스턴트)
- PM 검증 + UI/UX 관리자 검증 + 개발 리드 검증 완료
- 문제 발견 시 Slack/Notion으로 공유 → 문서 업데이트

---

## 📞 문의 및 피드백

### 문서 관련 문의
- **Slack**: #woorido-docs 채널
- **Notion**: 프로젝트 질문 페이지
- **이메일**: woorido-team@example.com

### 긴급 이슈
- 데모 데이까지 **57일** 남음
- 매주 월요일 Sprint Review
- 매일 Daily Standup (오전 10시)

---

## 🎓 학습 자료

### 추천 순서 (비개발자용)
1. [PRODUCT_AGENDA.md](PRODUCT_AGENDA.md) - Trust Triangle 이해
2. [IA_SPECIFICATION.md](IA_SPECIFICATION.md) - ASCII 와이어프레임 읽는 법
3. YouTube: "계모임 플랫폼 UX 사례 연구"

### 추천 순서 (개발자용)
1. [FRONTEND_IMPLEMENTATION_GUIDE.md](FRONTEND_IMPLEMENTATION_GUIDE.md) - 전체
2. [DEVELOPMENT_ENVIRONMENT.md](DEVELOPMENT_ENVIRONMENT.md) - 기술 스택
3. React Query + Zustand 튜토리얼
4. Radix UI + Tailwind CSS 조합법

---

## ✅ 체크리스트

### 모든 팀원이 확인해야 할 것
- [ ] 이 가이드라인을 끝까지 읽었다
- [ ] 내 역할에 맞는 필독 문서 1개를 읽었다
- [ ] 데모 데이 날짜를 알고 있다 (2026-02-25)
- [ ] Phase 1 목표를 이해했다
- [ ] Slack #woorido-docs 채널에 참여했다

### 개발자만 확인
- [ ] FRONTEND_IMPLEMENTATION_GUIDE.md를 읽었다
- [ ] DEVELOPMENT_ENVIRONMENT.md를 읽었다
- [ ] 로컬 개발 환경을 세팅했다
- [ ] Git Repository를 클론했다
- [ ] Phase별 API 개수를 확인했다

---

## 🚀 다음 단계

### 지금 바로 하세요
1. **이 파일 출력** (또는 북마크)
2. **역할별 필독 문서 열기**
3. **첫 30분 계획 실행**

### 내일 할 일
- Sprint Planning 참여
- Jira/Notion 태스크 확인
- 팀원과 문서 리뷰 미팅

---

**마지막 업데이트**: 2025-12-30
**다음 업데이트 예정**: Phase 1 완료 후 (2026-01-05)
**문서 버전**: v1.0

---

> 💡 **Tip**: 이 파일을 즐겨찾기에 추가하세요.
> 앞으로 모든 프로젝트 질문의 시작점이 될 것입니다.
