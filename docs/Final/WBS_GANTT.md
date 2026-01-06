# WOORIDO 프로젝트 Gantt Chart

> **Demo Day**: 2026-02-25
> **전체 기간**: 57일 (8주)
> **작성일**: 2026-01-06
> **버전**: v1.0

---

## Gantt Chart (Mermaid 다이어그램)

### 전체 타임라인 (Phase별)

```mermaid
gantt
    title WOORIDO 프로젝트 전체 일정 (Phase별)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section Phase 1
    환경 세팅 및 인증          :crit, p1, 2025-12-30, 7d

    section Phase 2-3
    SNS 개발 (Critical Path)   :crit, p2, 2026-01-06, 14d

    section Phase 3
    가입 플로우 및 가상머니     :p3, 2026-01-20, 7d

    section Phase 4
    장부 + Django 분석         :p4, 2026-01-27, 10d

    section Phase 5
    투표 시스템                :p5, 2026-02-06, 9d

    section Phase 6
    통합 테스트                :p6, 2026-02-15, 6d

    section Phase 7
    Demo Day 리허설            :p7, 2026-02-21, 5d

    section Milestone
    Demo Day                   :milestone, demo, 2026-02-25, 0d
```

---

### Phase 1: 환경 세팅 (Week 1)

```mermaid
gantt
    title Phase 1: 환경 세팅 및 인증 (12/30-1/5)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 환경 구축
    Oracle Docker 설치         :env1, 2025-12-30, 0.5d
    Spring Boot 초기화         :env2, after env1, 0.5d
    React 프로젝트 세팅        :env3, 2025-12-30, 0.5d
    Django 프로젝트 초기화     :env4, 2025-12-30, 0.5d
    Spring-Django 통신 테스트  :crit, env5, after env2 env4, 0.5d

    section 인증 시스템
    Spring Security + JWT      :auth1, after env2, 1d
    회원가입 API               :auth2, after auth1, 0.5d
    로그인 API                 :auth3, after auth1, 0.5d
    로그인 페이지 UI           :auth4, after env3, 1d
    로그인 API 연동            :auth5, after auth3 auth4, 0.5d
    JWT 토큰 저장              :auth6, after auth5, 0.5d

    section Seed 데이터
    테스트 유저 5명            :seed1, after env1, 0.25d
    테스트 모임 2개            :seed2, after seed1, 0.25d
    테스트 피드 10개           :seed3, after seed2, 0.25d
    테스트 장부 5개            :seed4, after seed2, 0.25d

    section 공통 컴포넌트
    Tailwind 설정              :ui1, after env3, 0.5d
    Radix UI 설정              :ui2, after ui1, 0.25d
    Skeleton 컴포넌트          :ui3, after ui1, 0.5d
    Toast 시스템               :ui4, after ui2, 0.25d
    Header + BottomNav         :ui5, after ui1, 0.5d

    section Checkpoint
    환경 세팅 완료             :milestone, m1, 2026-01-05, 0d
```

---

### Phase 2-3: SNS 개발 (Week 2-3) ⚠️ Critical Path

```mermaid
gantt
    title Phase 2-3: SNS 개발 (1/6-1/19) - Critical Path
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 피드 CRUD (Week 2 전반)
    피드 DB 스키마             :crit, post1, 2026-01-06, 0.5d
    피드 목록 API              :crit, post2, after post1, 1d
    피드 작성 API              :crit, post3, after post1, 1d
    피드 수정/삭제 API         :crit, post4, after post3, 0.5d
    공지사항 핀 API            :crit, post5, after post3, 0.5d
    피드 목록 UI + Skeleton    :crit, post6, 2026-01-06, 1d
    피드 작성 폼 UI            :crit, post7, after post6, 1d
    피드 API 연동              :crit, post8, after post2 post6, 1d

    section 댓글 시스템 (Week 2 후반)
    댓글 DB 스키마             :crit, comment1, after post1, 0.25d
    댓글 목록 API              :crit, comment2, after comment1, 0.5d
    댓글 작성 API              :crit, comment3, after comment1, 0.5d
    대댓글 작성 API            :crit, comment4, after comment3, 0.5d
    댓글 수정/삭제 API         :crit, comment5, after comment3, 0.25d
    댓글 목록 UI               :crit, comment6, after post6, 1d
    댓글 작성 폼               :crit, comment7, after comment6, 0.5d
    댓글 API 연동              :crit, comment8, after comment2 comment6, 1d

    section 좋아요 시스템 (Week 3 전반)
    좋아요 DB 스키마           :crit, like1, after comment1, 0.25d
    피드 좋아요 API            :crit, like2, after like1, 0.5d
    댓글 좋아요 API            :crit, like3, after like1, 0.5d
    좋아요 버튼 UI             :crit, like4, after post6, 0.5d
    Optimistic Update          :crit, like5, after like2 like4, 1d
    좋아요 애니메이션          :crit, like6, after like4, 0.5d

    section 이미지 업로드 (Week 3 후반)
    S3 Bucket 설정             :media1, 2026-01-15, 0.5d
    이미지 업로드 API          :media2, after media1, 1d
    이미지 삭제 API            :media3, after media2, 0.25d
    이미지 업로드 UI           :media4, after post7, 1d
    Progress Bar               :media5, after media4, 0.5d
    업로드 실패 Fallback       :media6, after media2 media4, 0.5d

    section Checkpoint
    SNS Full Flow 완료         :milestone, m2, 2026-01-19, 0d
```

---

### Phase 3: 가입 플로우 (Week 4)

```mermaid
gantt
    title Phase 3: 가입 플로우 및 가상머니 (1/20-1/26)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 어카운트 시스템
    어카운트 DB 스키마         :account1, 2026-01-20, 0.25d
    잔액 조회 API              :account2, after account1, 0.5d
    충전 API                   :account3, after account1, 1d
    토스페이 Mock 연동         :account4, after account3, 1d
    거래 내역 API              :account5, after account1, 0.5d
    잔액 카드 UI               :account6, 2026-01-20, 1d
    충전 폼 UI                 :account7, after account6, 1d
    충전 API 연동 + returnUrl  :account8, after account3 account7, 1d
    거래 내역 UI               :account9, after account5, 0.5d

    section 모임 생성
    모임 DB 스키마             :group1, 2026-01-20, 0.25d
    모임 생성 API              :group2, after group1, 1d
    모임 상세 API              :group3, after group1, 0.5d
    모임 수정 API (CP)         :group4, after group2, 0.5d
    모임 생성 폼 (3단계)       :group5, 2026-01-20, 1.5d
    보증금 미리보기            :group6, after group5, 0.5d
    모임 생성 API 연동         :group7, after group2 group5, 0.5d

    section 가입 플로우
    멤버 DB 스키마             :join1, after group1, 0.25d
    가입 API                   :crit, join2, after join1 account1, 1.5d
    보증금 락 로직 (트랜잭션)  :crit, join3, after join2, 1d
    멤버 목록 API              :join4, after join1, 0.5d
    모임 상세 페이지 (공개)    :join5, after group5, 1d
    가입 확인 모달             :join6, after join5, 1d
    잔액 부족 분기             :join7, after join6 account7, 0.5d
    가입 API 연동              :crit, join8, after join2 join6, 1d

    section 온보딩
    신규 유저 웰컴 카드        :onboard1, 2026-01-22, 0.5d
    인기 모임 추천 API         :onboard2, after group1, 0.5d
    인기 모임 추천 UI          :onboard3, after onboard2, 0.5d
    빈 상태 CTA                :onboard4, 2026-01-22, 0.5d

    section Checkpoint
    가입 Full Flow 완료        :milestone, m3, 2026-01-26, 0d
```

---

### Phase 4: 장부 + Django 분석 (Week 5)

```mermaid
gantt
    title Phase 4: 장부 시각화 및 Django 분석 (1/27-2/5)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 투표 API (선행 작업)
    투표 DB 스키마             :crit, vote1, 2026-01-27, 0.25d
    투표 생성 API              :crit, vote2, after vote1, 1d
    투표 참여 API              :crit, vote3, after vote1, 1d
    과반수 판정 로직           :crit, vote4, after vote3, 0.5d
    투표 결과 API              :crit, vote5, after vote3, 0.5d

    section 장부 시스템
    장부 DB 스키마             :crit, ledger1, 2026-01-27, 0.25d
    장부 타임라인 API          :crit, ledger2, after ledger1, 1d
    장부 요약 API              :crit, ledger3, after ledger1, 1d
    투표 승인 → 장부 연동      :crit, ledger4, after vote4 ledger1, 1.5d
    장부 메모 수정 API (CP)    :ledger5, after ledger2, 0.5d

    section Django 분석
    Django 분석 구조 설계      :django1, 2026-01-30, 0.25d
    월별 통계 API              :django2, after django1, 1d
    카테고리 비율 API          :django3, after django1, 1d
    지출 트렌드 API            :django4, after django1, 1d
    pandas 집계 로직           :django5, after django2, 1.5d
    Spring → Django 프록시     :crit, django6, after ledger3 django2, 1d

    section 차트 시각화
    Line Chart (월별 추이)     :chart1, after django4, 1d
    Pie Chart (카테고리)       :chart2, after django3, 1d
    분석 요약 카드 UI          :chart3, after django2, 0.5d
    차트 Skeleton UI           :chart4, 2026-02-01, 0.25d
    분석 실패 Fallback UI      :crit, chart5, after chart1, 1d
    장부 타임라인 UI           :chart6, after ledger2, 1d
    빈 장부 Empty State        :chart7, after chart6, 0.5d

    section Checkpoint
    장부 + Django 분석 완료    :milestone, m4, 2026-02-05, 0d
```

---

### Phase 5: 투표 시스템 (Week 6-7)

```mermaid
gantt
    title Phase 5: 투표 시스템 UI 및 Full Flow (2/6-2/14)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 투표 UI (Week 6)
    진행 중 투표 리스트 UI     :voteui1, 2026-02-06, 1d
    빈 투표 Empty State        :voteui2, after voteui1, 0.5d
    투표 상세 모달 (Skeleton)  :voteui3, after voteui1, 1d
    찬성/반대 버튼 (Optimistic):voteui4, after voteui3, 1d
    Progress Bar (진행률)      :voteui5, after voteui4, 0.5d
    마감 임박 강조 UI          :voteui6, after voteui1, 0.5d

    section 지출 요청 (Week 7)
    지출 요청 폼 UI (CP)       :expense1, after voteui1, 1d
    멤버 권한 안내 모달        :expense2, after expense1, 0.5d
    지출 요청 API 연동         :expense3, after expense1, 0.5d
    완료된 투표 이력 UI        :expense4, after voteui1, 1d
    장부 연결 링크             :expense5, after expense4, 0.5d

    section Full Flow 통합 테스트
    지출 요청 시나리오         :crit, flow1, after expense3, 0.5d
    투표 참여 시나리오         :crit, flow2, after voteui4, 0.5d
    장부 기록 검증             :crit, flow3, after flow2, 0.5d
    버그 수정                  :crit, flow4, after flow1 flow2 flow3, 2d

    section Checkpoint
    투표 Full Flow 완료        :milestone, m5, 2026-02-14, 0d
```

---

### Phase 6: 통합 테스트 (Week 8)

```mermaid
gantt
    title Phase 6: 통합 테스트 및 안정화 (2/15-2/20)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 시나리오 테스트
    SNS 시연 테스트            :crit, test1, 2026-02-15, 1d
    온보딩 시연 테스트         :crit, test2, 2026-02-15, 0.5d
    가입 시연 테스트           :crit, test3, after test2, 1d
    장부 시연 테스트           :crit, test4, after test3, 1d
    투표 시연 테스트           :crit, test5, after test4, 1d
    모든 Empty State 검증     :crit, test6, after test5, 0.5d

    section 에러 복구 테스트
    네트워크 에러 복구         :error1, 2026-02-18, 0.5d
    Spring-Django Fallback     :crit, error2, 2026-02-18, 0.5d
    충전 실패 복구             :error3, 2026-02-18, 0.25d
    이미지 업로드 Fallback     :error4, 2026-02-18, 0.25d
    Toast 메시지 검증          :error5, after error1, 0.5d

    section 버그 수정
    Critical 버그 수정         :crit, bug1, after test6 error5, 2d
    UI 버그 수정 (반응형)      :bug2, after bug1, 1d
    성능 최적화                :bug3, after bug1, 0.5d

    section Checkpoint
    통합 테스트 완료           :milestone, m6, 2026-02-20, 0d
```

---

### Phase 7: Demo Day 리허설 (Week 9)

```mermaid
gantt
    title Phase 7: Demo Day 리허설 (2/21-2/25)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 시연 준비
    시연 대본 작성 (6분)       :demo1, 2026-02-21, 0.5d
    PPT 발표 자료 준비         :demo2, after demo1, 1d
    리허설 1차 (팀 내부)       :demo3, after demo1, 0.25d
    리허설 2-5차               :demo4, after demo3, 2d
    백업 시연 영상 녹화        :demo5, after demo4, 0.5d
    예상 질문 답변 준비        :demo6, after demo2, 0.5d

    section 최종 점검
    서버 안정성 점검           :final1, 2026-02-24, 0.25d
    DB 백업                    :final2, 2026-02-24, 0.25d
    Demo Day 체크리스트        :final3, after demo6, 0.25d

    section Milestone
    Demo Day 발표              :milestone, demo, 2026-02-25, 0d
```

---

## Critical Path 시각화

### Critical Path 하이라이트

```mermaid
gantt
    title WOORIDO Critical Path (치명적 지연 가능 작업)
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section Critical Path
    환경 세팅 (Spring-Django)  :crit, cp1, 2025-12-30, 7d
    SNS 18개 API 개발          :crit, cp2, 2026-01-06, 14d
    보증금 락 트랜잭션         :crit, cp3, 2026-01-20, 2.5d
    투표-장부 연동             :crit, cp4, 2026-01-27, 3d
    Django 분석 연동           :crit, cp5, 2026-02-01, 2d
    투표 Full Flow 테스트      :crit, cp6, 2026-02-11, 3d
    통합 테스트                :crit, cp7, 2026-02-15, 6d

    section 병렬 가능 작업
    Frontend UI 개발           :p1, 2026-01-06, 14d
    Django 분석 로직           :p2, 2026-02-01, 4d

    section Milestone
    Demo Day                   :milestone, demo, 2026-02-25, 0d
```

---

## 팀별 작업 타임라인

### Frontend Team

```mermaid
gantt
    title Frontend Team 작업 타임라인
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section Week 1
    React 환경 세팅            :fe1, 2025-12-30, 1d
    공통 컴포넌트 (Skeleton)   :fe2, 2026-01-01, 2d
    로그인 페이지              :fe3, 2026-01-03, 2d

    section Week 2-3
    SNS UI 개발 (집중)         :crit, fe4, 2026-01-06, 10d
    이미지 업로드 UI           :fe5, 2026-01-16, 3d

    section Week 4
    어카운트 UI                :fe6, 2026-01-20, 3d
    가입 플로우 UI             :fe7, 2026-01-23, 3d

    section Week 5
    차트 UI (Recharts)         :fe8, 2026-01-31, 3d
    장부 타임라인 UI           :fe9, 2026-02-03, 2d

    section Week 6-7
    투표 UI                    :fe10, 2026-02-06, 5d
    Full Flow 테스트           :fe11, 2026-02-11, 3d

    section Week 8-9
    통합 테스트 및 버그 수정   :fe12, 2026-02-15, 11d
```

### Backend (Spring Boot) Team

```mermaid
gantt
    title Backend (Spring Boot) Team 작업 타임라인
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section Week 1
    Spring Boot 환경 세팅      :be1, 2025-12-30, 1d
    JWT 인증 구현              :be2, 2026-01-01, 2d
    Seed 데이터 생성           :be3, 2026-01-03, 2d

    section Week 2-3
    SNS API 18개 개발 (집중)   :crit, be4, 2026-01-06, 10d
    이미지 업로드 API (S3)     :be5, 2026-01-16, 3d

    section Week 4
    어카운트 API               :be6, 2026-01-20, 3d
    모임 생성/가입 API         :crit, be7, 2026-01-23, 3d

    section Week 5
    투표 API (선행)            :crit, be8, 2026-01-27, 3d
    장부 API + 투표 연동       :crit, be9, 2026-01-30, 4d
    Django 프록시 API          :be10, 2026-02-03, 2d

    section Week 6-7
    투표 Full Flow 통합        :be11, 2026-02-06, 5d
    버그 수정                  :be12, 2026-02-11, 3d

    section Week 8-9
    성능 최적화 및 안정화      :be13, 2026-02-15, 11d
```

### Backend (Django) Team

```mermaid
gantt
    title Backend (Django) Team 작업 타임라인
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section Week 1
    Django 환경 세팅           :dj1, 2025-12-30, 1d
    Spring 통신 테스트         :dj2, 2026-01-02, 1d

    section Week 2-4
    대기 (다른 팀 작업 지원)   :dj3, 2026-01-06, 21d

    section Week 5 (집중)
    분석 API 구조 설계         :dj4, 2026-01-30, 1d
    pandas 분석 로직 4개 API   :crit, dj5, 2026-01-31, 4d
    성능 최적화                :dj6, 2026-02-04, 1d

    section Week 6-9
    분석 안정화 및 모니터링    :dj7, 2026-02-06, 20d
```

---

## 의존성 관계도

### API 의존성

```mermaid
graph TD
    A[환경 세팅] --> B[인증 API]
    A --> C[Seed 데이터]
    C --> D[피드 API]
    D --> E[댓글 API]
    E --> F[좋아요 API]
    D --> G[이미지 업로드 API]

    A --> H[어카운트 API]
    H --> I[모임 생성 API]
    I --> J[가입 API]
    J --> K[보증금 락]

    K --> L[투표 API]
    L --> M[장부 API]
    M --> N[투표-장부 연동]

    M --> O[Django 분석 API]
    O --> P[Spring-Django 프록시]
    P --> Q[차트 UI]

    N --> R[투표 Full Flow]
    R --> S[통합 테스트]
    S --> T[Demo Day]

    style A fill:#f9f,stroke:#333,stroke-width:4px
    style D fill:#ff9,stroke:#333,stroke-width:4px
    style K fill:#f99,stroke:#333,stroke-width:4px
    style N fill:#f99,stroke:#333,stroke-width:4px
    style P fill:#f99,stroke:#333,stroke-width:4px
    style T fill:#9f9,stroke:#333,stroke-width:4px
```

---

## 주간 진행률 목표

| Week | 날짜 | 목표 진척도 | 주요 Checkpoint |
|------|------|------------|----------------|
| Week 1 | 12/30-1/5 | 10% | 환경 세팅 완료, 로그인 가능 |
| Week 2 | 1/6-1/12 | 25% | 피드 + 댓글 API 완료 |
| Week 3 | 1/13-1/19 | 40% | SNS Full Flow 완료 |
| Week 4 | 1/20-1/26 | 55% | 가입 Full Flow 완료 |
| Week 5 | 1/27-2/5 | 70% | 장부 + Django 분석 완료 |
| Week 6 | 2/6-2/9 | 80% | 투표 UI 완료 |
| Week 7 | 2/10-2/14 | 85% | 투표 Full Flow 완료 |
| Week 8 | 2/15-2/20 | 95% | 통합 테스트 통과 |
| Week 9 | 2/21-2/25 | 100% | Demo Day 준비 완료 |

---

## 버퍼 타임 분포

```mermaid
gantt
    title 버퍼 타임 분포
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 실제 작업
    Phase 1 작업               :p1, 2025-12-30, 6d
    Phase 2-3 작업             :p2, 2026-01-06, 13d
    Phase 3 작업               :p3, 2026-01-20, 6.5d
    Phase 4 작업               :p4, 2026-01-27, 9d
    Phase 5 작업               :p5, 2026-02-06, 8d
    Phase 6 작업               :p6, 2026-02-15, 5.5d

    section 버퍼 타임
    버퍼 1 (1일)               :done, b1, 2026-01-05, 1d
    버퍼 2 (1일)               :done, b2, 2026-01-19, 1d
    버퍼 3 (0.5일)             :done, b3, 2026-01-26, 0.5d
    버퍼 4 (1일)               :done, b4, 2026-02-05, 1d
    버퍼 5 (1일)               :done, b5, 2026-02-14, 1d
    버퍼 6 (0.5일)             :done, b6, 2026-02-20, 0.5d

    section Milestone
    Demo Day                   :milestone, demo, 2026-02-25, 0d
```

**총 버퍼 타임**: 5일 (전체 57일의 8.8%)

---

## 문서 버전 관리

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2026-01-06 | v1.0 | Gantt Chart 초안 작성 | PM Team |

---

## 관련 문서

- [WBS_MASTER.md](./WBS_MASTER.md) - WBS 마스터 문서
- [WBS_RISK_ANALYSIS.md](./WBS_RISK_ANALYSIS.md) - 리스크 분석
- [WEEKLY_REPORT_TEMPLATE.md](./WEEKLY_REPORT_TEMPLATE.md) - 주간 보고 양식

---

**이 Gantt Chart는 프로젝트 진행 상황에 따라 지속적으로 업데이트됩니다.**
