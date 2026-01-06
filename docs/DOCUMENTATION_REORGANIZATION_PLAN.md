# 문서 재구성 계획 (Documentation Reorganization Plan)

**작성일**: 2026-01-06
**목적**: WOORIDO 프로젝트 문서의 체계적 정리 및 아카이브 전략
**버전**: v1.0

---

## 📋 현재 상황 분석

### 문제점
1. ✅ **docs/ 루트에 레거시 파일 과다** (33개 파일)
   - `PRODUCT_AGENDA.md`, `IA_SPECIFICATION.md` 등 Final과 중복
   - 업데이트되지 않은 구버전 문서들

2. ✅ **Final 폴더 내 분류 부재** (22개 파일)
   - ERD, WBS, IA 등이 한 폴더에 혼재
   - 최신/구버전 구분 어려움

3. ✅ **아카이브 전략 부재**
   - 어떤 문서가 최신인지 불명확
   - 버전 관리 미흡

### 현재 문서 목록

#### docs/ 루트 (레거시)
```
API_SPEC_COMPLETE.md
CRITICAL_ANALYSIS_AND_IMPROVEMENTS.md
DEVELOPMENT_GUIDE.md
genius_thinking_formula.md
IA_SPECIFICATION.md
IMPLEMENTATION_HISTORY.md
MARKET_RESEARCH_REPORT.md
Part3_Project페이지_최종버전.md
Part3_이미지_프롬프트.md
Part3_주요기능_Framer용.md
PRODUCT_AGENDA.md
project_woorido_guideline.md
WOORIDO_PROJECT_INTRO.md
주요 기능 2d2758822656806097b4f9baa9afd77b.md
주요 기능_v2.0_VC_Ready.md
```

#### docs/Final/ (최신 + 구버전 혼재)
```
AI_ASSISTED_DEVELOPMENT_STRATEGY.md      ⭐ 최신
DEVELOPMENT_ENVIRONMENT.md                ⭐ 최신
ERD_MERMAID.md                            ⭐ 최신
ERD_SPECIFICATION.md                      ⭐ 최신
ERD_VALIDATION_REPORT.md                  ⭐ 최신
FRONTEND_IMPLEMENTATION_GUIDE.md          ⭐ 최신
IA_SPECIFICATION.md                       ⭐ 최신
POLICY_CHANGE_IMPACT_ASSESSMENT.md        ⭐ 최신
PRODUCT_AGENDA.md                         ⭐ 최신
VOTE_IMPLEMENTATION_GUIDE.md              ⭐ 최신
WBS_AI_MASTER.md                          ⭐ 최신 (v2.0)
WBS_GANTT.md                              🟡 참고용
WBS_MASTER.md                             🔴 구버전 (v1.0)
WBS_RISK_ANALYSIS.md                      🟡 참고용
WEEKLY_REPORT_TEMPLATE.md                 ⭐ 최신
WOORIDO_FINAL_SPECIFICATION.md            🟡 참고용
WOORIDO_GUIDELINE.md                      🟡 참고용
노션.md                                   🟡 참고용
```

---

## 🎯 새로운 문서 구조

### 최종 목표 구조

```
docs/
├── 📁 00_ARCHIVE/                      # 레거시 문서 보관
│   ├── legacy_root/                    # docs/ 루트의 구버전
│   │   ├── PRODUCT_AGENDA_v1.0.md
│   │   ├── IA_SPECIFICATION_v1.0.md
│   │   └── ...
│   └── deprecated_final/               # Final의 구버전
│       ├── WBS_MASTER_v1.0.md
│       └── ...
│
├── 📁 01_PRODUCT/                      # 프로덕트 아젠다 & 전략
│   ├── PRODUCT_AGENDA.md               # 최신 (v3.0)
│   ├── TERMINOLOGY.md                  # ⭐ NEW: 용어 정의
│   ├── COMPETITIVE_ANALYSIS.md         # 경쟁사 분석
│   └── README.md                       # 섹션 인덱스
│
├── 📁 02_REQUIREMENTS/                 # 요구사항 & 유스케이스
│   ├── USE_CASES.md                    # ⭐ NEW: 통합 유스케이스
│   ├── USER_STORIES.md                 # ⭐ NEW: 사용자 스토리
│   ├── POLICY_CHANGE_IMPACT.md         # 정책 변경 영향도 분석
│   └── README.md
│
├── 📁 03_DESIGN/                       # 시스템 설계
│   ├── 📁 ERD/
│   │   ├── ERD_SPECIFICATION.md        # DDL + 트랜잭션 가이드
│   │   ├── ERD_MERMAID.md              # 시각화
│   │   └── ERD_VALIDATION_REPORT.md    # 검증 보고서
│   ├── IA_SPECIFICATION.md             # IA 명세
│   ├── SYSTEM_ARCHITECTURE.md          # ⭐ NEW: 시스템 아키텍처
│   └── README.md
│
├── 📁 04_IMPLEMENTATION/               # 구현 가이드
│   ├── FRONTEND_IMPLEMENTATION.md      # Frontend 가이드
│   ├── BACKEND_IMPLEMENTATION.md       # ⭐ NEW: Backend 가이드
│   ├── VOTE_IMPLEMENTATION.md          # 투표 시스템 구현
│   ├── AI_STRATEGY.md                  # AI 활용 전략
│   └── README.md
│
├── 📁 05_PROJECT_MANAGEMENT/           # 프로젝트 관리
│   ├── WBS_AI_MASTER.md                # 최신 WBS (v2.0)
│   ├── WBS_GANTT.md                    # Gantt 차트
│   ├── RISK_ANALYSIS.md                # 리스크 분석
│   ├── WEEKLY_REPORT_TEMPLATE.md       # 주간 보고서 템플릿
│   └── README.md
│
├── 📁 06_ENVIRONMENT/                  # 개발 환경
│   ├── DEVELOPMENT_ENVIRONMENT.md      # 환경 세팅 가이드
│   ├── DEPLOYMENT_GUIDE.md             # ⭐ NEW: 배포 가이드
│   └── README.md
│
├── 📁 07_REFERENCE/                    # 참고 자료
│   ├── WOORIDO_GUIDELINE.md            # 프로젝트 가이드라인
│   ├── WOORIDO_FINAL_SPECIFICATION.md  # 최종 명세서
│   ├── 노션.md                         # Notion 정리본
│   └── README.md
│
└── 📄 README.md                        # 📚 마스터 인덱스
```

---

## 🗂️ 폴더별 상세 설명

### 📁 01_PRODUCT (프로덕트 아젠다)

**목적**: 프로덕트 비전, 전략, 용어 정의

| 파일 | 설명 | 출처 |
|------|------|------|
| `PRODUCT_AGENDA.md` | 프로덕트 아젠다 v3.0 | Final/PRODUCT_AGENDA.md |
| `TERMINOLOGY.md` | ⭐ NEW: 용어 정의 (계모임→챌린지) | AI_STRATEGY.md 섹션 1 |
| `COMPETITIVE_ANALYSIS.md` | 경쟁사 분석 | PRODUCT_AGENDA 섹션 추출 |

**생성 필요**:
- `TERMINOLOGY.md`: AI_ASSISTED_DEVELOPMENT_STRATEGY.md의 "용어 변경" 섹션을 독립 문서로

---

### 📁 02_REQUIREMENTS (요구사항)

**목적**: 유스케이스, 사용자 스토리, 정책 변경

| 파일 | 설명 | 출처 |
|------|------|------|
| `USE_CASES.md` | ⭐ NEW: 통합 유스케이스 | IA_SPECIFICATION 섹션 2 + PRODUCT_AGENDA |
| `USER_STORIES.md` | ⭐ NEW: 사용자 스토리 | 생성 필요 |
| `POLICY_CHANGE_IMPACT.md` | 정책 변경 영향도 분석 | Final/POLICY_CHANGE_IMPACT_ASSESSMENT.md |

**생성 필요**:
- `USE_CASES.md`: IA_SPECIFICATION.md의 "사용자 여정" + PRODUCT_AGENDA의 "시연 시나리오"
- `USER_STORIES.md`: Agile 형식의 사용자 스토리

---

### 📁 03_DESIGN (시스템 설계)

**목적**: ERD, IA, 시스템 아키텍처

| 파일 | 설명 | 출처 |
|------|------|------|
| `ERD/ERD_SPECIFICATION.md` | ERD 명세 + DDL | Final/ERD_SPECIFICATION.md |
| `ERD/ERD_MERMAID.md` | ERD 시각화 | Final/ERD_MERMAID.md |
| `ERD/ERD_VALIDATION_REPORT.md` | ERD 검증 보고서 | Final/ERD_VALIDATION_REPORT.md |
| `IA_SPECIFICATION.md` | IA 명세 | Final/IA_SPECIFICATION.md |
| `SYSTEM_ARCHITECTURE.md` | ⭐ NEW: 시스템 아키텍처 | 생성 필요 |

**생성 필요**:
- `SYSTEM_ARCHITECTURE.md`: Spring Boot + Django + Oracle 아키텍처 다이어그램

---

### 📁 04_IMPLEMENTATION (구현 가이드)

**목적**: Frontend/Backend 구현 가이드

| 파일 | 설명 | 출처 |
|------|------|------|
| `FRONTEND_IMPLEMENTATION.md` | Frontend 구현 가이드 | Final/FRONTEND_IMPLEMENTATION_GUIDE.md |
| `BACKEND_IMPLEMENTATION.md` | ⭐ NEW: Backend 구현 가이드 | ERD_SPECIFICATION 섹션 4-5 |
| `VOTE_IMPLEMENTATION.md` | 투표 시스템 구현 | Final/VOTE_IMPLEMENTATION_GUIDE.md |
| `AI_STRATEGY.md` | AI 활용 전략 | Final/AI_ASSISTED_DEVELOPMENT_STRATEGY.md |

**생성 필요**:
- `BACKEND_IMPLEMENTATION.md`: ERD_SPECIFICATION.md의 "MyBatis 구현" + "Spring Boot 서비스 패턴" 섹션

---

### 📁 05_PROJECT_MANAGEMENT (프로젝트 관리)

**목적**: WBS, 리스크, 주간 보고서

| 파일 | 설명 | 출처 |
|------|------|------|
| `WBS_AI_MASTER.md` | WBS v2.0 (AI 활용) | Final/WBS_AI_MASTER.md |
| `WBS_GANTT.md` | Gantt 차트 | Final/WBS_GANTT.md |
| `RISK_ANALYSIS.md` | 리스크 분석 | Final/WBS_RISK_ANALYSIS.md |
| `WEEKLY_REPORT_TEMPLATE.md` | 주간 보고서 템플릿 | Final/WEEKLY_REPORT_TEMPLATE.md |

---

### 📁 06_ENVIRONMENT (개발 환경)

**목적**: 환경 세팅, 배포 가이드

| 파일 | 설명 | 출처 |
|------|------|------|
| `DEVELOPMENT_ENVIRONMENT.md` | 환경 세팅 가이드 | Final/DEVELOPMENT_ENVIRONMENT.md |
| `DEPLOYMENT_GUIDE.md` | ⭐ NEW: 배포 가이드 | 생성 필요 |

**생성 필요**:
- `DEPLOYMENT_GUIDE.md`: Vercel (FE) + Docker (BE) 배포 가이드

---

### 📁 07_REFERENCE (참고 자료)

**목적**: 가이드라인, 최종 명세서 등 참고용 문서

| 파일 | 설명 | 출처 |
|------|------|------|
| `WOORIDO_GUIDELINE.md` | 프로젝트 가이드라인 | Final/WOORIDO_GUIDELINE.md |
| `WOORIDO_FINAL_SPECIFICATION.md` | 최종 명세서 | Final/WOORIDO_FINAL_SPECIFICATION.md |
| `노션.md` | Notion 정리본 | Final/노션.md |

---

## 🗄️ 아카이브 전략

### 00_ARCHIVE/ 구조

```
00_ARCHIVE/
├── legacy_root/                    # docs/ 루트의 구버전 (33개 파일)
│   ├── README.md                   # "이 문서들은 Final로 대체되었습니다"
│   ├── PRODUCT_AGENDA_v1.0.md
│   ├── IA_SPECIFICATION_v1.0.md
│   └── ...
│
└── deprecated_final/               # Final의 구버전
    ├── README.md                   # "이 문서들은 v2.0으로 대체되었습니다"
    └── WBS_MASTER_v1.0.md          # AI 도입 전 WBS
```

### 아카이브 대상

#### docs/ 루트 → 00_ARCHIVE/legacy_root/
- ✅ `PRODUCT_AGENDA.md` (Final에 v3.0 존재)
- ✅ `IA_SPECIFICATION.md` (Final에 v2.0 존재)
- ✅ `API_SPEC_COMPLETE.md` (FRONTEND_IMPLEMENTATION_GUIDE에 통합)
- ✅ `DEVELOPMENT_GUIDE.md` (DEVELOPMENT_ENVIRONMENT.md로 대체)
- ✅ Part3 관련 파일들 (Framer 프레젠테이션용, 아카이브)
- ✅ `주요 기능` 관련 파일들 (PRODUCT_AGENDA에 통합)

#### Final/ → 00_ARCHIVE/deprecated_final/
- ✅ `WBS_MASTER.md` (v1.0, WBS_AI_MASTER.md로 대체)

---

## 🚀 실행 계획

### Phase 1: 아카이브 생성 (10분)

```bash
# 1. 아카이브 폴더 생성
mkdir -p docs/00_ARCHIVE/legacy_root
mkdir -p docs/00_ARCHIVE/deprecated_final

# 2. docs/ 루트 파일 이동 (Final 제외)
mv docs/PRODUCT_AGENDA.md docs/00_ARCHIVE/legacy_root/PRODUCT_AGENDA_v1.0.md
mv docs/IA_SPECIFICATION.md docs/00_ARCHIVE/legacy_root/IA_SPECIFICATION_v1.0.md
# ... (33개 파일)

# 3. Final 구버전 이동
mv docs/Final/WBS_MASTER.md docs/00_ARCHIVE/deprecated_final/WBS_MASTER_v1.0.md
```

### Phase 2: 새 폴더 구조 생성 (5분)

```bash
# 폴더 생성
mkdir -p docs/01_PRODUCT
mkdir -p docs/02_REQUIREMENTS
mkdir -p docs/03_DESIGN/ERD
mkdir -p docs/04_IMPLEMENTATION
mkdir -p docs/05_PROJECT_MANAGEMENT
mkdir -p docs/06_ENVIRONMENT
mkdir -p docs/07_REFERENCE
```

### Phase 3: 파일 이동 (10분)

```bash
# 01_PRODUCT
mv docs/Final/PRODUCT_AGENDA.md docs/01_PRODUCT/

# 02_REQUIREMENTS
mv docs/Final/POLICY_CHANGE_IMPACT_ASSESSMENT.md docs/02_REQUIREMENTS/POLICY_CHANGE_IMPACT.md

# 03_DESIGN
mv docs/Final/ERD_SPECIFICATION.md docs/03_DESIGN/ERD/
mv docs/Final/ERD_MERMAID.md docs/03_DESIGN/ERD/
mv docs/Final/ERD_VALIDATION_REPORT.md docs/03_DESIGN/ERD/
mv docs/Final/IA_SPECIFICATION.md docs/03_DESIGN/

# 04_IMPLEMENTATION
mv docs/Final/FRONTEND_IMPLEMENTATION_GUIDE.md docs/04_IMPLEMENTATION/FRONTEND_IMPLEMENTATION.md
mv docs/Final/VOTE_IMPLEMENTATION_GUIDE.md docs/04_IMPLEMENTATION/VOTE_IMPLEMENTATION.md
mv docs/Final/AI_ASSISTED_DEVELOPMENT_STRATEGY.md docs/04_IMPLEMENTATION/AI_STRATEGY.md

# 05_PROJECT_MANAGEMENT
mv docs/Final/WBS_AI_MASTER.md docs/05_PROJECT_MANAGEMENT/
mv docs/Final/WBS_GANTT.md docs/05_PROJECT_MANAGEMENT/
mv docs/Final/WBS_RISK_ANALYSIS.md docs/05_PROJECT_MANAGEMENT/RISK_ANALYSIS.md
mv docs/Final/WEEKLY_REPORT_TEMPLATE.md docs/05_PROJECT_MANAGEMENT/

# 06_ENVIRONMENT
mv docs/Final/DEVELOPMENT_ENVIRONMENT.md docs/06_ENVIRONMENT/

# 07_REFERENCE
mv docs/Final/WOORIDO_GUIDELINE.md docs/07_REFERENCE/
mv docs/Final/WOORIDO_FINAL_SPECIFICATION.md docs/07_REFERENCE/
mv docs/Final/노션.md docs/07_REFERENCE/
```

### Phase 4: 새 문서 생성 (30분)

| 파일 | 생성 방법 | 예상 시간 |
|------|----------|----------|
| `01_PRODUCT/TERMINOLOGY.md` | AI_STRATEGY.md 섹션 1 추출 | 5분 |
| `02_REQUIREMENTS/USE_CASES.md` | IA + PRODUCT_AGENDA 통합 | 10분 |
| `03_DESIGN/SYSTEM_ARCHITECTURE.md` | 아키텍처 다이어그램 생성 | 10분 |
| `04_IMPLEMENTATION/BACKEND_IMPLEMENTATION.md` | ERD_SPEC 섹션 추출 | 5분 |

### Phase 5: README 생성 (20분)

각 폴더별 `README.md` 생성:
- 폴더 목적
- 파일 목록
- 읽는 순서 추천

### Phase 6: 마스터 인덱스 생성 (10분)

`docs/README.md` 생성:
- 전체 문서 구조
- 빠른 네비게이션
- 최신 문서 표시

---

## 📝 예상 결과

### Before (혼란)
```
docs/
├── 33개 레거시 파일 (루트)
└── Final/
    ├── 22개 파일 (최신 + 구버전 혼재)
    └── 분류 없음
```

### After (체계화)
```
docs/
├── 00_ARCHIVE/ (아카이브)
├── 01_PRODUCT/ (4개 파일)
├── 02_REQUIREMENTS/ (3개 파일)
├── 03_DESIGN/ (5개 파일)
├── 04_IMPLEMENTATION/ (4개 파일)
├── 05_PROJECT_MANAGEMENT/ (4개 파일)
├── 06_ENVIRONMENT/ (2개 파일)
├── 07_REFERENCE/ (3개 파일)
└── README.md (마스터 인덱스)
```

### 장점
1. ✅ **빠른 문서 검색**: 카테고리별 분류
2. ✅ **명확한 버전 관리**: 최신 문서만 유지, 구버전은 아카이브
3. ✅ **신규 팀원 온보딩**: README로 쉬운 네비게이션
4. ✅ **유지보수 용이**: 각 폴더별 책임 명확

---

## 🎯 다음 단계

### 즉시 수행
1. ✅ 이 계획서 검토 및 승인
2. ✅ Phase 1-3 실행 (파일 이동)
3. ✅ Phase 4 실행 (새 문서 생성)
4. ✅ Phase 5-6 실행 (README 생성)

### 예상 총 소요 시간
- **자동화 스크립트 사용**: 10분
- **수동 작업**: 85분
- **총 소요 시간**: **1.5시간**

---

**문서 버전**: v1.0
**최종 수정**: 2026-01-06
**작성자**: Claude (Sonnet 4.5)
**승인 필요**: 프로젝트 관리자
