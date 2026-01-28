# Claude Code 2.1.19 호환성 테스트 설계서

> **Summary**: bkit v1.4.0 전체 코드베이스 99개 컴포넌트의 Claude Code 2.1.19 호환성 테스트 설계
>
> **Project**: bkit Vibecoding Kit
> **Version**: v1.4.0
> **Author**: bkit Team
> **Date**: 2026-01-24
> **Status**: Draft
> **Planning Doc**: [claude-code-2.1.19-compatibility-test.plan.md](../01-plan/features/claude-code-2.1.19-compatibility-test.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- 99개 bkit 컴포넌트의 Claude Code 2.1.19 호환성 검증
- Breaking Change 여부 확인
- 자동화된 테스트 스크립트 제공

### 1.2 Design Principles

- **비파괴 테스트**: 기존 코드/문서 변경 없이 검증
- **우선순위 기반**: Critical → High → Medium → Low 순서
- **재현 가능**: 테스트 스크립트로 반복 실행 가능

---

## 2. Test Architecture

### 2.1 Test Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     Test Runner (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  Hooks   │  │ Commands │  │  Skills  │  │ Scripts  │        │
│  │  Tests   │  │  Tests   │  │  Tests   │  │  Tests   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴─────────────┴─────────────┘               │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │   Results   │                              │
│                    │  Collector  │                              │
│                    └──────┬──────┘                              │
│                           │                                      │
│                    ┌──────▼──────┐                              │
│                    │   Report    │                              │
│                    │  Generator  │                              │
│                    └─────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Test Categories

| Category | Test Type | Method |
|----------|-----------|--------|
| Hooks | 구조 검증 + 실행 검증 | JSON 스키마, Node 실행 |
| Commands | 로딩 검증 + 인자 전달 | Frontmatter 파싱 |
| Skills | 로딩 검증 + 자동 승인 | Frontmatter 파싱, hooks 유무 |
| Scripts | 실행 검증 + 출력 형식 | Node 실행, JSON 파싱 |
| Templates | 구조 검증 | Frontmatter 파싱 |
| Agents | 로딩 검증 | Frontmatter 파싱 |
| Library | 함수 실행 | require + 함수 호출 |

---

## 3. Test Specifications

### 3.1 Hooks Tests (H-01 ~ H-02)

#### H-01: hooks.json 스키마 검증

**검증 항목:**
- JSON 스키마 유효성
- SessionStart hook 존재
- PreToolUse hook 존재
- PostToolUse hook 존재

**Expected Output:**
```json
{
  "H-01": {
    "status": "pass",
    "tests": 4,
    "passed": 4,
    "failed": 0
  }
}
```

#### H-02: session-start.js 실행 검증

**검증 항목:**
- 유효한 JSON 출력
- systemMessage 필드 존재
- hookSpecificOutput 필드 존재
- additionalContext 필드 존재

---

### 3.2 Commands Tests (C-01 ~ C-20)

#### 공통 검증 항목

| 항목 | 검증 방법 |
|------|----------|
| Frontmatter 존재 | YAML 파싱 가능 |
| description 필드 | 문자열 존재 |
| allowed-tools 필드 | 배열 형태 |

#### 인자 전달 검증 (v2.1.19 핵심)

| Command | 인자 사용 | 검증 결과 |
|---------|----------|----------|
| `/pdca-plan` | `$ARGUMENTS` (문서상) | 프롬프트 기반 - 영향 없음 |
| `/pdca-design` | `$ARGUMENTS` (문서상) | 프롬프트 기반 - 영향 없음 |
| `/pdca-analyze` | `$ARGUMENTS` (문서상) | 프롬프트 기반 - 영향 없음 |

**예상 결과**: 모든 Commands는 프롬프트 기반이므로 `$ARGUMENTS[0]` 괄호 구문 변경에 영향 없음

---

### 3.3 Skills Tests (S-01 ~ S-18)

#### 자동 승인 정책 검증 (v2.1.19 핵심 변경사항)

**검증 로직:**
```
hasHooks = frontmatter.hooks 존재 여부
expectedAutoApprove = !hasHooks
```

**예상 결과:**

| Skill | hooks | 예상 동작 (v2.1.19) |
|-------|:-----:|-------------------|
| starter | ❌ | 자동 승인 ✅ |
| dynamic | ❌ | 자동 승인 ✅ |
| enterprise | ❌ | 자동 승인 ✅ |
| mobile-app | ❌ | 자동 승인 ✅ |
| desktop-app | ❌ | 자동 승인 ✅ |
| phase-1-schema | ❌ | 자동 승인 ✅ |
| phase-2-convention | ❌ | 자동 승인 ✅ |
| phase-3-mockup | ❌ | 자동 승인 ✅ |
| phase-7-seo-security | ❌ | 자동 승인 ✅ |
| bkit-templates | ❌ | 자동 승인 ✅ |
| phase-4-api | ✅ | 승인 요청 |
| phase-5-design-system | ✅ | 승인 요청 |
| phase-6-ui-integration | ✅ | 승인 요청 |
| phase-8-review | ✅ | 승인 요청 |
| phase-9-deployment | ✅ | 승인 요청 |
| zero-script-qa | ✅ | 승인 요청 |
| bkit-rules | ✅ | 승인 요청 |
| development-pipeline | ✅ | 승인 요청 |

---

### 3.4 Scripts Tests (SC-01 ~ SC-26)

#### JSON 출력 형식 검증

| Script | 예상 출력 | 필수 필드 |
|--------|----------|----------|
| pre-write.js | JSON | `decision` |
| pdca-post-write.js | JSON or empty | - |
| gap-detector-post.js | JSON or empty | - |
| session-start.js | JSON | `systemMessage` |

---

### 3.5 Templates Tests (T-01 ~ T-21)

#### Frontmatter 검증

| 필드 | 필수 여부 | 타입 |
|------|:--------:|------|
| template | Optional | string |
| version | Optional | string |
| variables | Optional | array |

---

### 3.6 Library Tests (L-01)

#### lib/common.js 함수 검증

| 함수 | 예상 반환값 |
|------|-----------|
| `detectPlatform()` | 'claude' or 'gemini' or 'unknown' |
| `detectLevel()` | 'Starter' or 'Dynamic' or 'Enterprise' |
| `loadConfig()` | object |
| `debugLog()` | undefined |
| `getPdcaStatusFull()` | object |

---

## 4. Test Execution Plan

### 4.1 Phase 1: Critical Tests (필수)

```bash
# 1. Hooks 테스트
claude --new  # 새 세션 시작, additionalContext 확인

# 2. Commands 인자 전달 테스트
/pdca-plan test-feature
/pdca-design test-feature
/pdca-analyze test-feature

# 3. lib/common.js 테스트
node -e "const c = require('./lib/common.js'); console.log(Object.keys(c));"
```

### 4.2 Phase 2: High Priority Tests

```bash
# 4. Skills 자동 승인 테스트 (hooks 없는 11개)
# starter skill 활성화 시 승인 프롬프트 없음 확인

# 5. Skills 승인 요청 테스트 (hooks 있는 7개)
# phase-4-api skill 활성화 시 승인 프롬프트 확인

# 6. Scripts 응답 형식 테스트
node scripts/pre-write.js  # JSON 출력 확인
```

### 4.3 Phase 3-4: Medium/Low Priority Tests

- Agents 트리거 테스트
- Templates 변수 치환 테스트
- 나머지 Commands 테스트

---

## 5. Expected Results

### 5.1 Pass Criteria

| Category | Total | Expected Pass | Criteria |
|----------|:-----:|:-------------:|----------|
| Hooks | 2 | 2 | 100% |
| Commands | 20 | 20 | 100% |
| Skills | 18 | 18 | 100% |
| Scripts | 26 | 24+ | 92%+ |
| Templates | 21 | 21 | 100% |
| Agents | 11 | 11 | 100% |
| Library | 1 | 1 | 100% |
| **Total** | **99** | **97+** | **98%+** |

### 5.2 Known Issues

| ID | Component | Issue | Severity | Status |
|----|-----------|-------|----------|--------|
| - | - | 예상되는 이슈 없음 | - | - |

---

## 6. Test Results Template

### 6.1 Individual Test Result

```json
{
  "testId": "H-01",
  "category": "hooks",
  "name": "hooks.json schema validation",
  "status": "pass|fail|skip",
  "duration": 123,
  "checks": [
    { "name": "valid-schema", "pass": true },
    { "name": "session-start-exists", "pass": true }
  ]
}
```

### 6.2 Summary Report Location

```
docs/03-analysis/compatibility-test-results.json
```

---

## 7. Implementation Order

1. [x] 테스트 설계 문서 작성 (현재)
2. [ ] Phase 1 테스트 실행 (Critical)
3. [ ] Phase 2 테스트 실행 (High)
4. [ ] Phase 3-4 테스트 실행 (Medium/Low)
5. [ ] 결과 분석 및 `/pdca-analyze` 실행
6. [ ] 완료 보고서 작성 (`/pdca-report`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-24 | Initial draft | bkit Team |
