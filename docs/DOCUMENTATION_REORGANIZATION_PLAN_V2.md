# 문서 재구성 계획 v2.0 (노션 구조 기반)

**작성일**: 2026-01-06
**목적**: 노션 페이지와 동기화된 문서 구조 재설계
**버전**: v2.0 - Notion Aligned

---

## 📋 노션 구조 분석

### 노션 메인 페이지 구조

```
💡 PLANNING (기획 & 전략)
├── 📰 시장 조사 및 유사 프로그램 분석
├── 🛠️ 개발 환경(Tech Stack)
├── 📋 기능 명세서 (Requirements)
└── 🎨 UX/UI 기획

🔧 ENGINEERING (설계 & 개발)
├── 🏗️ 시스템 아키텍처
├── 💻 프론트엔드 표준 ([O])
└── 📱 백엔드 & 데이터 ([M])

🔐 SECURITY & COMPLIANCE (보안 & 대외계)
├── 🛡️ 보안 표준 가이드 ([])
└── 🏛️ 대외계 연동 명세 ([K])

🚀 DEVOPS & INFRA (배포 & 인프라)
├── 🔺 인프라 접속 정보
└── 📑 배포 매뉴얼 (Human-Driven) ([L])

🏆 OPERATIONS (운영 & 관리)
├── 💰 DBA 운영 원칙 ([M])
└── 📊 데이터 분석 결과

📅 WORK (업무 & 일정)

📋 시연
```

---

## 🎯 새로운 문서 구조 (노션 기반)

### 최종 구조

```
docs/
├── 📁 00_ARCHIVE/                      # 레거시 보관
│   ├── legacy_root/
│   └── deprecated_final/
│
├── 📁 01_PLANNING/                     # 💡 기획 & 전략
│   ├── 📁 Product/                     # 프로덕트 전략
│   │   ├── PRODUCT_AGENDA.md           # 프로덕트 아젠다 v3.0
│   │   ├── TERMINOLOGY.md              # 용어 정의 (챌린지, 리더, 팔로워)
│   │   └── COMPETITIVE_ANALYSIS.md     # 경쟁사 분석
│   ├── 📁 Requirements/                # 기능 명세서
│   │   ├── USE_CASES.md                # 유스케이스
│   │   ├── USER_STORIES.md             # 사용자 스토리
│   │   └── POLICY_CHANGES.md           # 정책 변경 영향도
│   ├── 📁 UX_UI/                       # UX/UI 기획
│   │   ├── IA_SPECIFICATION.md         # IA 명세
│   │   ├── DESIGN_SYSTEM.md            # 디자인 시스템
│   │   └── WIREFRAMES.md               # 와이어프레임
│   └── README.md
│
├── 📁 02_ENGINEERING/                  # 🔧 설계 & 개발
│   ├── 📁 Architecture/                # 시스템 아키텍처
│   │   ├── SYSTEM_ARCHITECTURE.md      # 전체 아키텍처
│   │   ├── DATABASE_DESIGN.md          # DB 설계 개요
│   │   └── API_DESIGN.md               # API 설계 원칙
│   ├── 📁 Database/                    # ERD & 데이터베이스
│   │   ├── ERD_SPECIFICATION.md        # ERD 명세 + DDL
│   │   ├── ERD_MERMAID.md              # ERD 시각화
│   │   └── ERD_VALIDATION.md           # ERD 검증 보고서
│   ├── 📁 Frontend/                    # 프론트엔드 표준
│   │   ├── IMPLEMENTATION_GUIDE.md     # 구현 가이드
│   │   ├── COMPONENT_LIBRARY.md        # 컴포넌트 라이브러리
│   │   └── STATE_MANAGEMENT.md         # 상태 관리 전략
│   ├── 📁 Backend/                     # 백엔드 & 데이터
│   │   ├── IMPLEMENTATION_GUIDE.md     # Backend 구현 가이드
│   │   ├── VOTE_SYSTEM.md              # 투표 시스템
│   │   └── TRANSACTION_PATTERNS.md     # 트랜잭션 패턴
│   └── README.md
│
├── 📁 03_DEVOPS/                       # 🚀 배포 & 인프라
│   ├── INFRASTRUCTURE.md               # 인프라 구성
│   ├── DEPLOYMENT_GUIDE.md             # 배포 매뉴얼
│   ├── ENVIRONMENT_SETUP.md            # 개발 환경 세팅
│   ├── CI_CD.md                        # CI/CD 파이프라인
│   └── README.md
│
├── 📁 04_OPERATIONS/                   # 🏆 운영 & 관리
│   ├── DBA_GUIDELINES.md               # DBA 운영 원칙
│   ├── MONITORING.md                   # 모니터링 전략
│   ├── BACKUP_RECOVERY.md              # 백업/복구 절차
│   └── README.md
│
├── 📁 05_PROJECT_MANAGEMENT/           # 📅 업무 & 일정
│   ├── WBS_AI_MASTER.md                # WBS v2.0 (AI 활용)
│   ├── RISK_ANALYSIS.md                # 리스크 분석
│   ├── WEEKLY_REPORT_TEMPLATE.md       # 주간 보고서
│   ├── MEETING_NOTES/                  # 회의록
│   └── README.md
│
├── 📁 06_AI_STRATEGY/                  # 🤖 AI 활용 전략 (NEW)
│   ├── AI_DEVELOPMENT_STRATEGY.md      # AI 개발 전략
│   ├── AI_TOOLS_GUIDE.md               # AI 도구 가이드
│   └── README.md
│
├── 📁 07_DEMO/                         # 📋 시연 (NEW)
│   ├── DEMO_SCENARIO.md                # 시연 시나리오
│   ├── DEMO_SCRIPT.md                  # 시연 스크립트
│   └── README.md
│
├── 📁 08_REFERENCE/                    # 📚 참고 자료
│   ├── WOORIDO_GUIDELINE.md            # 프로젝트 가이드라인
│   ├── GLOSSARY.md                     # 용어 사전
│   └── README.md
│
└── 📄 README.md                        # 📚 마스터 인덱스
```

---

## 📂 폴더별 상세 설명

### 📁 01_PLANNING (기획 & 전략)

**노션 대응**: 💡 PLANNING (기획 & 전략)

#### Product/ (프로덕트 전략)
| 파일 | 설명 | 출처 |
|------|------|------|
| `PRODUCT_AGENDA.md` | 프로덕트 아젠다 v3.0 | Final/PRODUCT_AGENDA.md |
| `TERMINOLOGY.md` | 용어 정의 (챌린지, 리더, 팔로워, 리워드) | AI_STRATEGY 섹션 1 추출 |
| `COMPETITIVE_ANALYSIS.md` | 경쟁사 분석 (토스, 카카오) | PRODUCT_AGENDA 섹션 추출 |

#### Requirements/ (기능 명세서)
| 파일 | 설명 | 출처 |
|------|------|------|
| `USE_CASES.md` | 통합 유스케이스 | ⭐ NEW (IA + PRODUCT_AGENDA) |
| `USER_STORIES.md` | Agile 사용자 스토리 | ⭐ NEW |
| `POLICY_CHANGES.md` | 정책 변경 영향도 | POLICY_CHANGE_IMPACT_ASSESSMENT.md |

#### UX_UI/ (UX/UI 기획)
| 파일 | 설명 | 출처 |
|------|------|------|
| `IA_SPECIFICATION.md` | IA 명세 | Final/IA_SPECIFICATION.md |
| `DESIGN_SYSTEM.md` | 디자인 시스템 (색상, 타이포) | ⭐ NEW (IA 섹션 추출) |
| `WIREFRAMES.md` | 와이어프레임 링크 | ⭐ NEW |

---

### 📁 02_ENGINEERING (설계 & 개발)

**노션 대응**: 🔧 ENGINEERING (설계 & 개발)

#### Architecture/ (시스템 아키텍처)
| 파일 | 설명 | 출처 |
|------|------|------|
| `SYSTEM_ARCHITECTURE.md` | 전체 아키텍처 (Spring + Django + Oracle) | ⭐ NEW |
| `DATABASE_DESIGN.md` | DB 설계 철학 | ERD_SPEC 섹션 1-2 추출 |
| `API_DESIGN.md` | API 설계 원칙 (REST, 네이밍) | ⭐ NEW |

#### Database/ (ERD & 데이터베이스)
| 파일 | 설명 | 출처 |
|------|------|------|
| `ERD_SPECIFICATION.md` | ERD 명세 + DDL + 트랜잭션 | Final/ERD_SPECIFICATION.md |
| `ERD_MERMAID.md` | ERD 시각화 | Final/ERD_MERMAID.md |
| `ERD_VALIDATION.md` | ERD 검증 보고서 | Final/ERD_VALIDATION_REPORT.md |

#### Frontend/ (프론트엔드 표준 [O])
| 파일 | 설명 | 출처 |
|------|------|------|
| `IMPLEMENTATION_GUIDE.md` | Frontend 구현 가이드 | Final/FRONTEND_IMPLEMENTATION_GUIDE.md |
| `COMPONENT_LIBRARY.md` | 컴포넌트 라이브러리 | ⭐ NEW (FRONTEND_IMPL 섹션 2 추출) |
| `STATE_MANAGEMENT.md` | 상태 관리 (Zustand, React Query) | ⭐ NEW |

#### Backend/ (백엔드 & 데이터 [M])
| 파일 | 설명 | 출처 |
|------|------|------|
| `IMPLEMENTATION_GUIDE.md` | Backend 구현 가이드 | ⭐ NEW (ERD_SPEC 섹션 4-5) |
| `VOTE_SYSTEM.md` | 투표 시스템 구현 | Final/VOTE_IMPLEMENTATION_GUIDE.md |
| `TRANSACTION_PATTERNS.md` | 트랜잭션 패턴 | ERD_SPEC 섹션 2 추출 |

---

### 📁 03_DEVOPS (배포 & 인프라)

**노션 대응**: 🚀 DEVOPS & INFRA (배포 & 인프라)

| 파일 | 설명 | 출처 |
|------|------|------|
| `INFRASTRUCTURE.md` | 인프라 구성 (Docker, AWS) | ⭐ NEW |
| `DEPLOYMENT_GUIDE.md` | 배포 매뉴얼 | ⭐ NEW |
| `ENVIRONMENT_SETUP.md` | 개발 환경 세팅 | Final/DEVELOPMENT_ENVIRONMENT.md |
| `CI_CD.md` | CI/CD 파이프라인 | ⭐ NEW |

---

### 📁 04_OPERATIONS (운영 & 관리)

**노션 대응**: 🏆 OPERATIONS (운영 & 관리)

| 파일 | 설명 | 출처 |
|------|------|------|
| `DBA_GUIDELINES.md` | DBA 운영 원칙 ([M]) | ⭐ NEW |
| `MONITORING.md` | 모니터링 전략 | ⭐ NEW |
| `BACKUP_RECOVERY.md` | 백업/복구 절차 | ⭐ NEW |

---

### 📁 05_PROJECT_MANAGEMENT (업무 & 일정)

**노션 대응**: 📅 WORK (업무 & 일정)

| 파일 | 설명 | 출처 |
|------|------|------|
| `WBS_AI_MASTER.md` | WBS v2.0 (AI 활용, 19일) | Final/WBS_AI_MASTER.md |
| `RISK_ANALYSIS.md` | 리스크 분석 | Final/WBS_RISK_ANALYSIS.md |
| `WEEKLY_REPORT_TEMPLATE.md` | 주간 보고서 템플릿 | Final/WEEKLY_REPORT_TEMPLATE.md |
| `MEETING_NOTES/` | 회의록 폴더 | ⭐ NEW |

---

### 📁 06_AI_STRATEGY (AI 활용 전략) ⭐ NEW

**노션에 없는 새로운 카테고리** (WOORIDO의 차별화 포인트)

| 파일 | 설명 | 출처 |
|------|------|------|
| `AI_DEVELOPMENT_STRATEGY.md` | AI 개발 전략 (생산성 3배) | Final/AI_ASSISTED_DEVELOPMENT_STRATEGY.md |
| `AI_TOOLS_GUIDE.md` | AI 도구 가이드 (Claude, Cursor, Copilot) | AI_STRATEGY 섹션 5 추출 |

---

### 📁 07_DEMO (시연) ⭐ NEW

**노션 대응**: 📋 시연

| 파일 | 설명 | 출처 |
|------|------|------|
| `DEMO_SCENARIO.md` | Demo Day 시연 시나리오 | PRODUCT_AGENDA 섹션 4 추출 |
| `DEMO_SCRIPT.md` | 시연 스크립트 (6분) | ⭐ NEW |

---

### 📁 08_REFERENCE (참고 자료)

| 파일 | 설명 | 출처 |
|------|------|------|
| `WOORIDO_GUIDELINE.md` | 프로젝트 가이드라인 | Final/WOORIDO_GUIDELINE.md |
| `GLOSSARY.md` | 용어 사전 | ⭐ NEW |

---

## 🗂️ 아카이브 전략

### 00_ARCHIVE/ 구조

```
00_ARCHIVE/
├── legacy_root/                    # docs/ 루트 33개 파일
│   ├── README.md                   # "이 문서들은 Final로 대체"
│   ├── PRODUCT_AGENDA_v1.0.md
│   └── ...
│
└── deprecated_final/               # Final 구버전
    ├── README.md                   # "v2.0으로 대체"
    ├── WBS_MASTER_v1.0.md          # AI 도입 전 WBS (57일)
    └── WBS_GANTT.md                # 참고용 (최신 WBS에 통합)
```

---

## 📋 파일 매핑 테이블

### 기존 Final/ → 새 구조

| 기존 파일 (Final/) | 새 위치 | 비고 |
|-------------------|---------|------|
| `PRODUCT_AGENDA.md` | `01_PLANNING/Product/PRODUCT_AGENDA.md` | 이동 |
| `IA_SPECIFICATION.md` | `01_PLANNING/UX_UI/IA_SPECIFICATION.md` | 이동 |
| `POLICY_CHANGE_IMPACT_ASSESSMENT.md` | `01_PLANNING/Requirements/POLICY_CHANGES.md` | 이름 변경 |
| `ERD_SPECIFICATION.md` | `02_ENGINEERING/Database/ERD_SPECIFICATION.md` | 이동 |
| `ERD_MERMAID.md` | `02_ENGINEERING/Database/ERD_MERMAID.md` | 이동 |
| `ERD_VALIDATION_REPORT.md` | `02_ENGINEERING/Database/ERD_VALIDATION.md` | 이름 변경 |
| `FRONTEND_IMPLEMENTATION_GUIDE.md` | `02_ENGINEERING/Frontend/IMPLEMENTATION_GUIDE.md` | 이동 |
| `VOTE_IMPLEMENTATION_GUIDE.md` | `02_ENGINEERING/Backend/VOTE_SYSTEM.md` | 이름 변경 |
| `DEVELOPMENT_ENVIRONMENT.md` | `03_DEVOPS/ENVIRONMENT_SETUP.md` | 이름 변경 |
| `AI_ASSISTED_DEVELOPMENT_STRATEGY.md` | `06_AI_STRATEGY/AI_DEVELOPMENT_STRATEGY.md` | 이름 변경 |
| `WBS_AI_MASTER.md` | `05_PROJECT_MANAGEMENT/WBS_AI_MASTER.md` | 이동 |
| `WBS_RISK_ANALYSIS.md` | `05_PROJECT_MANAGEMENT/RISK_ANALYSIS.md` | 이름 변경 |
| `WEEKLY_REPORT_TEMPLATE.md` | `05_PROJECT_MANAGEMENT/WEEKLY_REPORT_TEMPLATE.md` | 이동 |
| `WOORIDO_GUIDELINE.md` | `08_REFERENCE/WOORIDO_GUIDELINE.md` | 이동 |
| `WBS_MASTER.md` | `00_ARCHIVE/deprecated_final/WBS_MASTER_v1.0.md` | 아카이브 |
| `WBS_GANTT.md` | `00_ARCHIVE/deprecated_final/WBS_GANTT.md` | 아카이브 |
| `WOORIDO_FINAL_SPECIFICATION.md` | `08_REFERENCE/` | 이동 (참고용) |
| `노션.md` | `08_REFERENCE/` | 이동 (참고용) |

---

## 🚀 실행 계획

### Phase 1: 아카이브 생성 (5분)

```bash
# 아카이브 폴더 생성
mkdir -p docs/00_ARCHIVE/legacy_root
mkdir -p docs/00_ARCHIVE/deprecated_final

# docs/ 루트 파일 아카이브 (33개)
find docs -maxdepth 1 -name "*.md" ! -name "README.md" -exec mv {} docs/00_ARCHIVE/legacy_root/ \;

# Final 구버전 아카이브
mv docs/Final/WBS_MASTER.md docs/00_ARCHIVE/deprecated_final/WBS_MASTER_v1.0.md
mv docs/Final/WBS_GANTT.md docs/00_ARCHIVE/deprecated_final/WBS_GANTT.md
```

### Phase 2: 새 폴더 구조 생성 (3분)

```bash
# 메인 폴더
mkdir -p docs/01_PLANNING/{Product,Requirements,UX_UI}
mkdir -p docs/02_ENGINEERING/{Architecture,Database,Frontend,Backend}
mkdir -p docs/03_DEVOPS
mkdir -p docs/04_OPERATIONS
mkdir -p docs/05_PROJECT_MANAGEMENT/MEETING_NOTES
mkdir -p docs/06_AI_STRATEGY
mkdir -p docs/07_DEMO
mkdir -p docs/08_REFERENCE
```

### Phase 3: 파일 이동 (10분)

```bash
# 01_PLANNING
mv docs/Final/PRODUCT_AGENDA.md docs/01_PLANNING/Product/
mv docs/Final/IA_SPECIFICATION.md docs/01_PLANNING/UX_UI/
mv docs/Final/POLICY_CHANGE_IMPACT_ASSESSMENT.md docs/01_PLANNING/Requirements/POLICY_CHANGES.md

# 02_ENGINEERING
mv docs/Final/ERD_SPECIFICATION.md docs/02_ENGINEERING/Database/
mv docs/Final/ERD_MERMAID.md docs/02_ENGINEERING/Database/
mv docs/Final/ERD_VALIDATION_REPORT.md docs/02_ENGINEERING/Database/ERD_VALIDATION.md
mv docs/Final/FRONTEND_IMPLEMENTATION_GUIDE.md docs/02_ENGINEERING/Frontend/IMPLEMENTATION_GUIDE.md
mv docs/Final/VOTE_IMPLEMENTATION_GUIDE.md docs/02_ENGINEERING/Backend/VOTE_SYSTEM.md

# 03_DEVOPS
mv docs/Final/DEVELOPMENT_ENVIRONMENT.md docs/03_DEVOPS/ENVIRONMENT_SETUP.md

# 05_PROJECT_MANAGEMENT
mv docs/Final/WBS_AI_MASTER.md docs/05_PROJECT_MANAGEMENT/
mv docs/Final/WBS_RISK_ANALYSIS.md docs/05_PROJECT_MANAGEMENT/RISK_ANALYSIS.md
mv docs/Final/WEEKLY_REPORT_TEMPLATE.md docs/05_PROJECT_MANAGEMENT/

# 06_AI_STRATEGY
mv docs/Final/AI_ASSISTED_DEVELOPMENT_STRATEGY.md docs/06_AI_STRATEGY/AI_DEVELOPMENT_STRATEGY.md

# 08_REFERENCE
mv docs/Final/WOORIDO_GUIDELINE.md docs/08_REFERENCE/
mv docs/Final/WOORIDO_FINAL_SPECIFICATION.md docs/08_REFERENCE/
mv docs/Final/노션.md docs/08_REFERENCE/
```

### Phase 4: 신규 문서 생성 (40분)

| 파일 | 생성 방법 | 시간 |
|------|----------|------|
| `01_PLANNING/Product/TERMINOLOGY.md` | AI_STRATEGY 섹션 1 추출 | 5분 |
| `01_PLANNING/Requirements/USE_CASES.md` | IA + PRODUCT_AGENDA 통합 | 10분 |
| `02_ENGINEERING/Architecture/SYSTEM_ARCHITECTURE.md` | 아키텍처 다이어그램 생성 | 10분 |
| `02_ENGINEERING/Backend/IMPLEMENTATION_GUIDE.md` | ERD_SPEC 섹션 4-5 추출 | 10분 |
| `07_DEMO/DEMO_SCENARIO.md` | PRODUCT_AGENDA 섹션 4 추출 | 5분 |

### Phase 5: README 생성 (30분)

각 폴더별 `README.md`:
- 폴더 목적
- 파일 목록
- 읽는 순서 추천
- 노션 페이지 링크

### Phase 6: 마스터 인덱스 생성 (15분)

`docs/README.md`:
- 전체 문서 구조
- 노션과의 매핑
- 빠른 네비게이션
- 최신 문서 표시

---

## 📊 노션 vs Docs 매핑

| 노션 카테고리 | Docs 폴더 | 주요 문서 |
|--------------|-----------|----------|
| 💡 PLANNING | `01_PLANNING/` | PRODUCT_AGENDA, USE_CASES, IA |
| 🔧 ENGINEERING | `02_ENGINEERING/` | ERD, Frontend/Backend 가이드 |
| 🔐 SECURITY | (미구현) | 추후 추가 |
| 🚀 DEVOPS | `03_DEVOPS/` | ENVIRONMENT_SETUP, DEPLOYMENT |
| 🏆 OPERATIONS | `04_OPERATIONS/` | DBA_GUIDELINES (신규 작성 필요) |
| 📅 WORK | `05_PROJECT_MANAGEMENT/` | WBS, RISK_ANALYSIS |
| 📋 시연 | `07_DEMO/` | DEMO_SCENARIO |
| 🤖 AI (추가) | `06_AI_STRATEGY/` | AI_DEVELOPMENT_STRATEGY |

---

## 🎉 예상 효과

### Before (혼란)
```
❌ 55개 파일이 2개 폴더에 혼재
❌ 노션과 문서 구조 불일치
❌ 어떤 문서가 최신인지 불명확
```

### After (체계화)
```
✅ 노션 구조와 1:1 매핑
✅ 8개 카테고리로 체계적 분류
✅ 각 폴더별 README로 빠른 네비게이션
✅ 아카이브로 레거시 분리
```

---

## ⏱️ 총 소요 시간

| Phase | 작업 | 시간 |
|-------|------|------|
| Phase 1 | 아카이브 생성 | 5분 |
| Phase 2 | 폴더 구조 생성 | 3분 |
| Phase 3 | 파일 이동 | 10분 |
| Phase 4 | 신규 문서 생성 | 40분 |
| Phase 5 | README 생성 | 30분 |
| Phase 6 | 마스터 인덱스 | 15분 |
| **총계** | - | **1시간 43분** |

---

## 🚀 다음 단계

### 즉시 수행
1. ✅ v2.0 계획서 검토 및 승인
2. ✅ Phase 1-3 실행 (파일 이동)
3. ✅ Phase 4-6 실행 (신규 문서 + README)

### 승인 후
- [ ] 노션 페이지에 Docs 링크 추가
- [ ] 각 노션 페이지에서 해당 문서로 바로가기
- [ ] 팀원들에게 새 구조 공유

---

**문서 버전**: v2.0 - Notion Aligned
**최종 수정**: 2026-01-06
**작성자**: Claude (Sonnet 4.5)
**승인 필요**: 프로젝트 관리자
