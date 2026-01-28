# bkit v1.4.0 종합 테스트 계획서

> **Feature**: bkit-v1.4.0-test
> **Version**: 2.0 (확장판)
> **Author**: AI (POPUP STUDIO)
> **Date**: 2026-01-24
> **Status**: Draft
> **Reference**: [claudecode-bkit-automation-enhancement-v1.4.0.design.md](../../archive/2026-01/bkit-automation-enhancement-v1.4.0/)

---

## 1. 개요

### 1.1 목적

bkit v1.4.0의 **전체 기능**(lib/common.js 80+ 함수, scripts/ 26개 스크립트, hooks/ 세션 시작)을 종합 검증하여 프로덕션 배포 준비 상태를 확인한다.

### 1.2 테스트 범위 요약

| 영역 | 파일 수 | 함수/스크립트 수 | 테스트 케이스 |
|------|:------:|:---------------:|:------------:|
| lib/common.js | 1 | 80+ 함수 | 120+ |
| scripts/ | 26 | 26 스크립트 | 52+ |
| hooks/ | 1 | 1 스크립트 | 10+ |
| **합계** | **28** | **107+** | **182+** |

### 1.3 테스트 우선순위

| 우선순위 | 설명 | 커버리지 목표 |
|:--------:|------|:------------:|
| P1 | 핵심 기능 (PDCA, Hook, Core) | 100% |
| P2 | 주요 기능 (Platform, Task) | 95% |
| P3 | 부가 기능 (Tier, Utility) | 90% |

---

## 2. 테스트 대상 전체 목록

### 2.1 lib/common.js - 전체 Export 함수 (80+ 함수)

#### 2.1.1 Configuration (3개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `getConfig(key, default)` | 설정값 조회 | P2 |
| `getConfigArray(key, default)` | 배열 설정값 조회 | P3 |
| `loadConfig()` | 설정 파일 로드 | P3 |

#### 2.1.2 File Detection (4개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `isSourceFile(path)` | 소스 파일 여부 | P2 |
| `isCodeFile(path)` | 코드 파일 여부 | P2 |
| `isUiFile(path)` | UI 파일 여부 | P3 |
| `isEnvFile(path)` | 환경 파일 여부 | P2 |

#### 2.1.3 Tier Detection (8개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `getLanguageTier(ext)` | 언어 Tier 조회 | P3 |
| `getTierDescription(tier)` | Tier 설명 조회 | P3 |
| `getTierPdcaGuidance(tier)` | Tier별 PDCA 가이드 | P3 |
| `isTier1(ext)` | Tier 1 여부 | P3 |
| `isTier2(ext)` | Tier 2 여부 | P3 |
| `isTier3(ext)` | Tier 3 여부 | P3 |
| `isTier4(ext)` | Tier 4 여부 | P3 |
| `isExperimentalTier(ext)` | 실험적 Tier 여부 | P3 |

#### 2.1.4 Feature Detection (1개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `extractFeature(path)` | 파일 경로에서 기능명 추출 | P1 |

#### 2.1.5 PDCA Document Detection (2개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `findDesignDoc(feature)` | 설계 문서 경로 찾기 | P1 |
| `findPlanDoc(feature)` | 계획 문서 경로 찾기 | P1 |

#### 2.1.6 Task Classification (5개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `classifyTask(description)` | 작업 분류 | P1 |
| `classifyTaskByLines(lines)` | 라인 수 기반 분류 | P2 |
| `getPdcaLevel(classification)` | PDCA 레벨 조회 | P2 |
| `getPdcaGuidance(classification)` | PDCA 가이드 조회 | P2 |
| `getPdcaGuidanceByLevel(level)` | 레벨별 가이드 조회 | P2 |

#### 2.1.7 JSON Output (3개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `outputAllow(message, context)` | 허용 JSON 출력 | P1 |
| `outputBlock(reason)` | 차단 JSON 출력 | P1 |
| `outputEmpty()` | 빈 출력 | P2 |

#### 2.1.8 Level Detection (1개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `detectLevel()` | 프로젝트 레벨 감지 | P1 |

#### 2.1.9 Input Helpers (3개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `readStdin()` | 비동기 stdin 읽기 | P1 |
| `readStdinSync()` | 동기 stdin 읽기 | P1 |
| `parseHookInput(input)` | Hook 입력 파싱 | P1 |

#### 2.1.10 Task System Integration - v1.3.1 (7개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `getPdcaTaskMetadata(phase, feature)` | Task 메타데이터 생성 | P2 |
| `generatePdcaTaskSubject(phase, feature)` | Task 제목 생성 | P2 |
| `generatePdcaTaskDescription(phase, feature)` | Task 설명 생성 | P2 |
| `generateTaskGuidance(phase, feature, prev)` | Task 가이드 생성 | P2 |
| `getPreviousPdcaPhase(phase)` | 이전 PDCA 단계 | P2 |
| `findPdcaStatus(feature)` | PDCA 상태 찾기 | P1 |
| `getCurrentPdcaPhase(feature)` | 현재 PDCA 단계 | P1 |

#### 2.1.11 Platform Compatibility - v1.4.0 (7개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `detectPlatform()` | 플랫폼 감지 | P1 |
| `isGeminiCli()` | Gemini CLI 여부 | P1 |
| `isClaudeCode()` | Claude Code 여부 | P1 |
| `getPluginPath(relative)` | 플러그인 경로 | P2 |
| `getProjectPath(relative)` | 프로젝트 경로 | P2 |
| `getTemplatePath(name)` | 템플릿 경로 | P2 |

#### 2.1.12 Debug Logging - v1.4.0 (2개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `debugLog(scope, message, data)` | 디버그 로그 | P1 |
| `getDebugLogPath()` | 로그 파일 경로 | P2 |

#### 2.1.13 PDCA Status Management - v1.4.0 (9개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `initPdcaStatusIfNotExists()` | 상태 파일 초기화 | P1 |
| `getPdcaStatusFull(forceRefresh)` | 전체 상태 조회 (캐싱) | P1 |
| `getFeatureStatus(feature)` | 기능별 상태 조회 | P1 |
| `updatePdcaStatus(feature, phase, data)` | 상태 업데이트 (v2.0) | P1 |
| `addPdcaHistory(feature, action, details)` | 히스토리 추가 | P2 |
| `completePdcaFeature(feature)` | 기능 완료 처리 | P1 |
| `extractFeatureFromContext(sources)` | 컨텍스트에서 기능명 추출 | P1 |
| `savePdcaStatus(status)` | 상태 저장 (캐시 갱신) | P1 |
| `loadPdcaStatus()` | 상태 로드 | P1 |

#### 2.1.14 Multi-Feature Context - v1.4.0 P4 (5개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `setActiveFeature(feature)` | 활성 기능 설정 | P1 |
| `addActiveFeature(feature, asPrimary)` | 활성 기능 추가 | P1 |
| `removeActiveFeature(feature)` | 활성 기능 제거 | P1 |
| `getActiveFeatures()` | 활성 기능 목록 | P1 |
| `switchFeatureContext(feature)` | 컨텍스트 전환 | P1 |

#### 2.1.15 Intent Detection - v1.4.0 (3개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `detectNewFeatureIntent(message)` | 새 기능 의도 감지 | P1 |
| `matchImplicitAgentTrigger(message)` | 암시적 Agent 트리거 | P1 |
| `matchImplicitSkillTrigger(message)` | 암시적 Skill 트리거 | P1 |

#### 2.1.16 Ambiguity Detection - v1.4.0 (9개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `containsFilePath(text)` | 파일 경로 포함 여부 | P2 |
| `containsTechnicalTerms(text)` | 기술 용어 포함 여부 | P2 |
| `hasSpecificNouns(text)` | 구체적 명사 포함 여부 | P2 |
| `hasScopeDefinition(text)` | 범위 정의 포함 여부 | P2 |
| `hasMultipleInterpretations(text)` | 다중 해석 가능 여부 | P2 |
| `detectContextConflicts(request, ctx)` | 컨텍스트 충돌 감지 | P2 |
| `calculateAmbiguityScore(request, ctx)` | 모호성 점수 계산 | P1 |
| `generateClarifyingQuestions(req, factors)` | 명확화 질문 생성 | P1 |
| `extractFeatureNameFromRequest(request)` | 요청에서 기능명 추출 | P2 |

#### 2.1.17 PDCA Automation - v1.4.0 (7개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `shouldAutoStartPdca(feature, class)` | 자동 PDCA 시작 여부 | P1 |
| `autoAdvancePdcaPhase(feature, phase, result)` | 자동 단계 전환 | P1 |
| `getHookContext()` | Hook 컨텍스트 조회 | P1 |
| `emitUserPrompt(options)` | 사용자 프롬프트 생성 | P1 |
| `formatAskUserQuestion(payload)` | AskUserQuestion 포맷 | P1 |
| `safeJsonParse(str, fallback)` | 안전한 JSON 파싱 | P2 |
| `getBkitConfig(forceRefresh)` | bkit 설정 조회 (캐싱) | P1 |

#### 2.1.18 Requirement Fulfillment - v1.4.0 P2 (2개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `extractRequirementsFromPlan(path)` | 요구사항 추출 | P1 |
| `calculateRequirementFulfillment(path, data)` | 충족도 계산 | P1 |

#### 2.1.19 Phase Transition - v1.4.0 P3 (2개)

| 함수명 | 설명 | 우선순위 |
|--------|------|:--------:|
| `checkPhaseDeliverables(phase, feature)` | 산출물 체크 | P1 |
| `validatePdcaTransition(feature, from, to)` | 전환 유효성 검증 | P1 |

---

### 2.2 scripts/ - 전체 스크립트 (26개)

#### 2.2.1 PDCA Core Scripts (4개)

| 스크립트 | 설명 | 우선순위 |
|----------|------|:--------:|
| `pre-write.js` | Write 전 설계 문서 체크 | P1 |
| `pdca-pre-write.js` | PDCA Write 전 처리 | P1 |
| `pdca-post-write.js` | PDCA Write 후 처리 | P1 |
| `archive-feature.js` | 기능 아카이브 | P2 |

#### 2.2.2 Gap/Iterator Scripts (4개)

| 스크립트 | 설명 | 우선순위 |
|----------|------|:--------:|
| `gap-detector-post.js` | Gap 분석 후 처리 | P1 |
| `gap-detector-stop.js` | Gap 분석 완료 처리 | P1 |
| `iterator-stop.js` | 반복 개선 완료 처리 | P1 |
| `analysis-stop.js` | 분석 완료 처리 | P2 |

#### 2.2.3 Phase Stop Scripts - v1.4.0 P3 (9개)

| 스크립트 | 설명 | 우선순위 |
|----------|------|:--------:|
| `phase-transition.js` | Phase 전환 자동화 | P1 |
| `phase1-schema-stop.js` | Phase 1 완료 | P2 |
| `phase2-convention-pre.js` | Phase 2 전처리 | P2 |
| `phase2-convention-stop.js` | Phase 2 완료 | P2 |
| `phase3-mockup-stop.js` | Phase 3 완료 | P2 |
| `phase4-api-stop.js` | Phase 4 완료 | P2 |
| `phase5-design-post.js` | Phase 5 후처리 | P2 |
| `phase6-ui-post.js` | Phase 6 후처리 | P2 |
| `phase7-seo-stop.js` | Phase 7 완료 | P2 |
| `phase8-review-stop.js` | Phase 8 완료 | P2 |
| `phase9-deploy-pre.js` | Phase 9 전처리 | P2 |

#### 2.2.4 QA Scripts (3개)

| 스크립트 | 설명 | 우선순위 |
|----------|------|:--------:|
| `qa-pre-bash.js` | QA Bash 전처리 | P2 |
| `qa-monitor-post.js` | QA 모니터 후처리 | P2 |
| `qa-stop.js` | QA 완료 처리 | P2 |

#### 2.2.5 Utility Scripts (4개)

| 스크립트 | 설명 | 우선순위 |
|----------|------|:--------:|
| `design-validator-pre.js` | 설계 검증 전처리 | P2 |
| `select-template.js` | 템플릿 선택 | P3 |
| `sync-folders.js` | 폴더 동기화 | P3 |
| `validate-plugin.js` | 플러그인 검증 | P2 |

---

### 2.3 hooks/ - Hook 스크립트 (1개)

| 스크립트 | 설명 | 우선순위 |
|----------|------|:--------:|
| `session-start.js` | 세션 시작 Hook | P1 |

---

## 3. 상세 테스트 케이스

### 3.1 Unit Tests - lib/common.js (120+ 케이스)

#### 3.1.1 Configuration Tests (TC-U001 ~ TC-U005)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U001 | getConfig 기본값 | key 없음 | default 반환 |
| TC-U002 | getConfig 존재 | 유효한 key | 설정값 반환 |
| TC-U003 | getConfigArray 기본값 | key 없음 | 빈 배열 |
| TC-U004 | getConfigArray 존재 | 유효한 key | 배열 반환 |
| TC-U005 | loadConfig | - | 설정 객체 |

#### 3.1.2 File Detection Tests (TC-U010 ~ TC-U017)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U010 | isSourceFile - JS | "src/app.js" | `true` |
| TC-U011 | isSourceFile - non-code | "README.md" | `false` |
| TC-U012 | isCodeFile - TS | "lib/util.ts" | `true` |
| TC-U013 | isCodeFile - config | "package.json" | `false` |
| TC-U014 | isUiFile - TSX | "App.tsx" | `true` |
| TC-U015 | isUiFile - CSS | "style.css" | `true` |
| TC-U016 | isEnvFile - .env | ".env" | `true` |
| TC-U017 | isEnvFile - .env.local | ".env.local" | `true` |

#### 3.1.3 Feature Detection Tests (TC-U020 ~ TC-U027)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U020 | extractFeature - src/features | "src/features/login/index.ts" | "login" |
| TC-U021 | extractFeature - components | "src/components/Button.tsx" | "Button" |
| TC-U022 | extractFeature - api | "api/auth/login.ts" | "auth" |
| TC-U023 | extractFeature - docs | "docs/01-plan/features/auth.md" | "auth" |
| TC-U024 | findDesignDoc - 존재 | "login" (설계 문서 있음) | 경로 반환 |
| TC-U025 | findDesignDoc - 미존재 | "nonexistent" | `null` |
| TC-U026 | findPlanDoc - 존재 | "login" (계획 문서 있음) | 경로 반환 |
| TC-U027 | findPlanDoc - 미존재 | "nonexistent" | `null` |

#### 3.1.4 Task Classification Tests (TC-U030 ~ TC-U037)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U030 | classifyTask - quick_fix | "버그 수정" | "quick_fix" |
| TC-U031 | classifyTask - feature | "새 기능 추가" | "feature" |
| TC-U032 | classifyTask - major_feature | "시스템 리팩토링" | "major_feature" |
| TC-U033 | classifyTaskByLines - small | 10줄 | "quick_fix" |
| TC-U034 | classifyTaskByLines - medium | 100줄 | "minor_change" |
| TC-U035 | classifyTaskByLines - large | 500줄 | "feature" |
| TC-U036 | getPdcaLevel | "feature" | 레벨 반환 |
| TC-U037 | getPdcaGuidance | "feature" | 가이드 반환 |

#### 3.1.5 JSON Output Tests (TC-U040 ~ TC-U045)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U040 | outputAllow - 기본 | "message" | `{ decision: "allow" }` |
| TC-U041 | outputAllow - context | "msg", {ctx} | context 포함 |
| TC-U042 | outputBlock - 이유 | "blocked" | `{ decision: "block" }` |
| TC-U043 | outputEmpty | - | 빈 출력 |

#### 3.1.6 Level Detection Tests (TC-U050 ~ TC-U055)

| TC-ID | 테스트 케이스 | 조건 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U050 | detectLevel - CLAUDE.md | "Starter" 선언 | "Starter" |
| TC-U051 | detectLevel - package.json | DB 의존성 있음 | "Dynamic" |
| TC-U052 | detectLevel - k8s | k8s 파일 존재 | "Enterprise" |
| TC-U053 | detectLevel - 기본 | 조건 없음 | "Dynamic" |

#### 3.1.7 Input Helper Tests (TC-U060 ~ TC-U065)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U060 | readStdinSync - JSON | `{"key":"value"}` | 파싱된 객체 |
| TC-U061 | readStdinSync - text | "plain text" | 문자열 |
| TC-U062 | parseHookInput - valid | 유효한 JSON | 파싱된 객체 |
| TC-U063 | parseHookInput - invalid | 잘못된 JSON | 빈 객체 |

#### 3.1.8 Platform Compatibility Tests (TC-U070 ~ TC-U077)

| TC-ID | 테스트 케이스 | 환경 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U070 | detectPlatform - Claude | CLAUDE_PROJECT_DIR 설정 | "claude" |
| TC-U071 | detectPlatform - Gemini | gemini-extension.json 존재 | "gemini" |
| TC-U072 | isClaudeCode | Claude 환경 | `true` |
| TC-U073 | isGeminiCli | Gemini 환경 | `true` |
| TC-U074 | getPluginPath | "scripts/test.js" | 절대 경로 |
| TC-U075 | getProjectPath | "src/app.ts" | 절대 경로 |
| TC-U076 | getTemplatePath | "plan" | 템플릿 경로 |

#### 3.1.9 Debug Logging Tests (TC-U080 ~ TC-U083)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U080 | debugLog - 기본 | scope, msg | 로그 기록 |
| TC-U081 | debugLog - data | scope, msg, {data} | data 포함 |
| TC-U082 | getDebugLogPath | - | 유효한 경로 |

#### 3.1.10 PDCA Status Tests (TC-U090 ~ TC-U105)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U090 | initPdcaStatusIfNotExists | 파일 없음 | v2.0 생성 |
| TC-U091 | initPdcaStatusIfNotExists | 파일 존재 | 변경 없음 |
| TC-U092 | getPdcaStatusFull - 캐시 | forceRefresh=false | 캐시 반환 |
| TC-U093 | getPdcaStatusFull - 강제 | forceRefresh=true | 파일 읽기 |
| TC-U094 | getPdcaStatusFull - v1→v2 | v1.0 파일 | v2.0 마이그레이션 |
| TC-U095 | getFeatureStatus | 존재하는 feature | 상태 반환 |
| TC-U096 | getFeatureStatus | 없는 feature | `null` |
| TC-U097 | updatePdcaStatus | feature, phase, data | 상태 업데이트 |
| TC-U098 | addPdcaHistory | action, details | 히스토리 추가 |
| TC-U099 | completePdcaFeature | feature | phase=completed |
| TC-U100 | extractFeatureFromContext - explicit | {explicit: "login"} | "login" |
| TC-U101 | extractFeatureFromContext - output | {agentOutput: "..."} | 파싱된 이름 |
| TC-U102 | savePdcaStatus | status 객체 | 파일 저장 |
| TC-U103 | loadPdcaStatus | - | 상태 반환 |

#### 3.1.11 Multi-Feature Context Tests (TC-U110 ~ TC-U119)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U110 | addActiveFeature | "new-feature" | `true` |
| TC-U111 | addActiveFeature - primary | "new", true | primaryFeature 설정 |
| TC-U112 | addActiveFeature - 중복 | 이미 존재 | 중복 방지 |
| TC-U113 | setActiveFeature | "feature" | primaryFeature 변경 |
| TC-U114 | getActiveFeatures | - | 목록 반환 |
| TC-U115 | switchFeatureContext - 존재 | 존재하는 feature | `{ success: true }` |
| TC-U116 | switchFeatureContext - 미존재 | 없는 feature | `{ success: false }` |
| TC-U117 | removeActiveFeature | "feature" | `true` |
| TC-U118 | removeActiveFeature - primary | primary feature | 새 primary 선택 |

#### 3.1.12 Intent Detection Tests (TC-U120 ~ TC-U135)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U120 | detectNewFeatureIntent - KO | "로그인 기능 만들어줘" | `{ isNewFeature: true }` |
| TC-U121 | detectNewFeatureIntent - EN | "Create login feature" | `{ isNewFeature: true }` |
| TC-U122 | detectNewFeatureIntent - JA | "ログイン機能作って" | `{ isNewFeature: true }` |
| TC-U123 | detectNewFeatureIntent - ZH | "创建登录功能" | `{ isNewFeature: true }` |
| TC-U124 | detectNewFeatureIntent - 비기능 | "설명해줘" | `{ isNewFeature: false }` |
| TC-U125 | matchImplicitAgentTrigger - 검증 | "이거 괜찮아?" | gap-detector |
| TC-U126 | matchImplicitAgentTrigger - 개선 | "개선해줘" | pdca-iterator |
| TC-U127 | matchImplicitAgentTrigger - 분석 | "분석해줘" | code-analyzer |
| TC-U128 | matchImplicitAgentTrigger - 보고서 | "보고서 작성" | report-generator |
| TC-U129 | matchImplicitAgentTrigger - 도움 | "어떻게 해야 해?" | starter-guide |
| TC-U130 | matchImplicitSkillTrigger - starter | "정적 웹사이트" | starter |
| TC-U131 | matchImplicitSkillTrigger - dynamic | "로그인 있는 앱" | dynamic |
| TC-U132 | matchImplicitSkillTrigger - enterprise | "마이크로서비스" | enterprise |
| TC-U133 | matchImplicitSkillTrigger - mobile | "React Native" | mobile-app |

#### 3.1.13 Ambiguity Detection Tests (TC-U140 ~ TC-U155)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U140 | containsFilePath - 있음 | "src/app.ts 수정" | `true` |
| TC-U141 | containsFilePath - 없음 | "기능 만들어줘" | `false` |
| TC-U142 | containsTechnicalTerms - 있음 | "React 컴포넌트" | `true` |
| TC-U143 | containsTechnicalTerms - 없음 | "이거 만들어줘" | `false` |
| TC-U144 | calculateAmbiguityScore - 모호 | "이거 만들어줘" | `>= 50` |
| TC-U145 | calculateAmbiguityScore - 명확 | "src/auth/login.ts 수정" | `< 50` |
| TC-U146 | calculateAmbiguityScore - 감점 | 파일 경로 포함 | `-30` 적용 |
| TC-U147 | generateClarifyingQuestions | 모호한 요청 | 질문 배열 |

#### 3.1.14 PDCA Automation Tests (TC-U160 ~ TC-U175)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U160 | shouldAutoStartPdca - quick_fix | "quick_fix" | `false` |
| TC-U161 | shouldAutoStartPdca - feature | "feature" | `true` |
| TC-U162 | autoAdvancePdcaPhase - plan→design | "plan", {} | design |
| TC-U163 | autoAdvancePdcaPhase - check→act | check, 75% | act |
| TC-U164 | autoAdvancePdcaPhase - check→complete | check, 95% | completed |
| TC-U165 | getHookContext | - | context 객체 |
| TC-U166 | emitUserPrompt | options | 포맷된 출력 |
| TC-U167 | formatAskUserQuestion | payload | 마크다운 |
| TC-U168 | safeJsonParse - valid | 유효 JSON | 파싱 객체 |
| TC-U169 | safeJsonParse - invalid | 잘못된 JSON | fallback |
| TC-U170 | getBkitConfig - 기본 | - | 기본 설정 |
| TC-U171 | getBkitConfig - 환경변수 | BKIT_PDCA_THRESHOLD=95 | 95 |
| TC-U172 | getBkitConfig - 캐싱 | 연속 호출 | 캐시 히트 |

#### 3.1.15 Requirement Fulfillment Tests (TC-U180 ~ TC-U185)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U180 | extractRequirementsFromPlan | plan.md 경로 | 요구사항 배열 |
| TC-U181 | extractRequirementsFromPlan - 없음 | 없는 경로 | 빈 배열 |
| TC-U182 | calculateRequirementFulfillment | plan 경로, 분석 데이터 | 충족도 객체 |

#### 3.1.16 Phase Transition Tests (TC-U190 ~ TC-U197)

| TC-ID | 테스트 케이스 | 입력 | 예상 결과 |
|-------|-------------|------|----------|
| TC-U190 | checkPhaseDeliverables - 완료 | phase, feature | `{ complete: true }` |
| TC-U191 | checkPhaseDeliverables - 미완료 | phase, feature | `{ complete: false, missing: [...] }` |
| TC-U192 | validatePdcaTransition - 유효 | plan→design | `{ valid: true }` |
| TC-U193 | validatePdcaTransition - 무효 | design→plan | `{ valid: false }` |
| TC-U194 | validatePdcaTransition - check-act | check↔act | `{ valid: true }` |

---

### 3.2 Integration Tests - scripts/ (52+ 케이스)

#### 3.2.1 PDCA Core Script Tests (TC-I001 ~ TC-I012)

| TC-ID | 스크립트 | 테스트 케이스 | 예상 결과 |
|-------|----------|-------------|----------|
| TC-I001 | pre-write.js | 설계 문서 없이 Write | 경고 출력 |
| TC-I002 | pre-write.js | 설계 문서 있고 Write | 허용 |
| TC-I003 | pdca-pre-write.js | 정상 실행 | JSON 출력 |
| TC-I004 | pdca-post-write.js | Write 후 | Check 제안 |
| TC-I005 | gap-detector-post.js | gap-detector 후 | 분석 결과 파싱 |
| TC-I006 | gap-detector-stop.js | 매치율 75% | 자동 개선 제안 |
| TC-I007 | gap-detector-stop.js | 매치율 92% | 완료 보고서 제안 |
| TC-I008 | iterator-stop.js | 반복 완료 | 재분석 제안 |
| TC-I009 | iterator-stop.js | 최대 반복 도달 | 수동 안내 |
| TC-I010 | analysis-stop.js | 분석 완료 | 다음 단계 안내 |
| TC-I011 | archive-feature.js | feature 아카이브 | 파일 이동 |

#### 3.2.2 Phase Stop Script Tests (TC-I020 ~ TC-I035)

| TC-ID | 스크립트 | 테스트 케이스 | 예상 결과 |
|-------|----------|-------------|----------|
| TC-I020 | phase-transition.js | Phase 1 완료 | Phase 2 안내 |
| TC-I021 | phase-transition.js | Phase 9 완료 | 완료 메시지 |
| TC-I022 | phase1-schema-stop.js | Phase 1 완료 | JSON 출력 |
| TC-I023 | phase2-convention-pre.js | Phase 2 전처리 | 준비 확인 |
| TC-I024 | phase2-convention-stop.js | Phase 2 완료 | JSON 출력 |
| TC-I025 | phase3-mockup-stop.js | Phase 3 완료 | JSON 출력 |
| TC-I026 | phase4-api-stop.js | Phase 4 완료 | JSON 출력 |
| TC-I027 | phase5-design-post.js | Phase 5 후처리 | JSON 출력 |
| TC-I028 | phase6-ui-post.js | Phase 6 후처리 | JSON 출력 |
| TC-I029 | phase7-seo-stop.js | Phase 7 완료 | JSON 출력 |
| TC-I030 | phase8-review-stop.js | Phase 8 완료 | JSON 출력 |
| TC-I031 | phase9-deploy-pre.js | Phase 9 전처리 | 준비 확인 |

#### 3.2.3 QA Script Tests (TC-I040 ~ TC-I045)

| TC-ID | 스크립트 | 테스트 케이스 | 예상 결과 |
|-------|----------|-------------|----------|
| TC-I040 | qa-pre-bash.js | QA 전처리 | JSON 출력 |
| TC-I041 | qa-monitor-post.js | QA 후처리 | JSON 출력 |
| TC-I042 | qa-stop.js | QA 완료 | JSON 출력 |

#### 3.2.4 Utility Script Tests (TC-I050 ~ TC-I057)

| TC-ID | 스크립트 | 테스트 케이스 | 예상 결과 |
|-------|----------|-------------|----------|
| TC-I050 | design-validator-pre.js | 검증 전처리 | JSON 출력 |
| TC-I051 | select-template.js | 템플릿 선택 | 템플릿 경로 |
| TC-I052 | sync-folders.js | 폴더 동기화 | 성공 메시지 |
| TC-I053 | validate-plugin.js | 플러그인 검증 | 검증 결과 |

---

### 3.3 Hook Tests - hooks/ (10+ 케이스)

| TC-ID | 테스트 케이스 | 조건 | 예상 결과 |
|-------|-------------|------|----------|
| TC-H001 | session-start.js - 신규 | PDCA 상태 없음 | 온보딩 프롬프트 |
| TC-H002 | session-start.js - 재개 | 기존 작업 있음 | 재개 프롬프트 |
| TC-H003 | session-start.js - 환경변수 | CLAUDE_ENV_FILE | 변수 기록 |
| TC-H004 | session-start.js - 레벨 감지 | - | BKIT_LEVEL 설정 |
| TC-H005 | session-start.js - 플랫폼 | Claude Code | JSON 출력 |
| TC-H006 | session-start.js - PDCA 초기화 | 파일 없음 | v2.0 생성 |
| TC-H007 | session-start.js - 트리거 테이블 | - | 키워드 테이블 포함 |

---

## 4. 테스트 실행 방법

### 4.1 테스트 스크립트 구조

```
test-scripts/
├── unit/
│   ├── test-config.js
│   ├── test-file-detection.js
│   ├── test-feature-detection.js
│   ├── test-task-classification.js
│   ├── test-json-output.js
│   ├── test-level-detection.js
│   ├── test-input-helpers.js
│   ├── test-platform-compatibility.js
│   ├── test-debug-logging.js
│   ├── test-pdca-status.js
│   ├── test-multi-feature.js
│   ├── test-intent-detection.js
│   ├── test-ambiguity.js
│   ├── test-pdca-automation.js
│   ├── test-requirement-fulfillment.js
│   └── test-phase-transition.js
├── integration/
│   ├── test-pdca-scripts.js
│   ├── test-phase-scripts.js
│   ├── test-qa-scripts.js
│   └── test-utility-scripts.js
├── hooks/
│   └── test-session-start.js
└── run-all-tests.js
```

### 4.2 실행 명령

```bash
# 전체 테스트
node test-scripts/run-all-tests.js

# 단위 테스트만
node test-scripts/run-all-tests.js --unit

# 통합 테스트만
node test-scripts/run-all-tests.js --integration

# 특정 파일
node test-scripts/unit/test-pdca-status.js
```

---

## 5. 테스트 완료 기준

### 5.1 필수 조건

| 조건 | 기준 | 현재 |
|------|:----:|:----:|
| Unit Test 통과율 | >= 95% | - |
| Integration Test 통과율 | >= 90% | - |
| Hook Test 통과율 | >= 95% | - |
| Critical 버그 | 0개 | - |
| High 버그 | 0개 | - |

### 5.2 커버리지 목표

| 영역 | 목표 | 케이스 수 |
|------|:----:|:--------:|
| lib/common.js 함수 | 100% | 80+ |
| scripts/ 스크립트 | 100% | 26 |
| hooks/ 스크립트 | 100% | 1 |

---

## 6. 관련 문서

| 문서 | 경로 |
|------|------|
| 설계 문서 | docs/archive/2026-01/bkit-automation-enhancement-v1.4.0/ |
| 테스트 설계서 | docs/02-design/features/bkit-v1.4.0-test.design.md (예정) |
| 테스트 결과 | docs/03-analysis/bkit-v1.4.0-test.analysis.md (예정) |

---

**작성일**: 2026-01-24
**버전**: 2.0 (확장판)
**테스트 케이스 총계**: 182+
