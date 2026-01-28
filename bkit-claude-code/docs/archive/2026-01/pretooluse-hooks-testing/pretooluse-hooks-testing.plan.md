# PreToolUse Hooks Testing Planning Document

> **Summary**: PreToolUse Hooks 개선 구현(FR-01~FR-06)에 대한 종합 테스트 계획
>
> **Project**: bkit-claude-code
> **Version**: v1.4.2
> **Author**: Claude Code
> **Date**: 2026-01-26
> **Status**: Draft
> **Related**: [pretooluse-hooks-improvement.plan.md](./pretooluse-hooks-improvement.plan.md), [pretooluse-hooks-improvement.design.md](../02-design/features/pretooluse-hooks-improvement.design.md)

---

## 1. Overview

### 1.1 Purpose

PreToolUse Hooks 개선 구현(v1.4.2)의 모든 변경 사항이 설계서대로 올바르게 동작하는지 검증한다.

### 1.2 Background

**구현 완료 항목:**

| FR ID | 구현 내용 | 파일 |
|-------|----------|------|
| FR-01 | `outputAllow()` 개선 - `permissionDecision: "allow"` 제거 | lib/common.js |
| FR-02 | `outputBlock()` 개선 - stderr + Exit Code 2 | lib/common.js |
| FR-03 | `readStdinSync()` 에러 로깅 추가 | lib/common.js |
| FR-04 | `truncateContext()` 함수 및 500자 제한 | lib/common.js |
| FR-05 | `updatePdcaStatus()` 반환값 추가 | lib/common.js |
| FR-06 | `findDesignDoc()/findPlanDoc()` 권한 검증 | lib/common.js |

**추가 변경 사항:**
- scripts/ 5개 파일에 `outputAllow()` 타입 파라미터 추가
- `scripts/code-analyzer-pre.js` 신규 생성
- `agents/code-analyzer.md` hook 방식 변경
- `skills/phase-9-deployment/SKILL.md` timeout 추가

### 1.3 Related Documents

- 계획서: `docs/01-plan/features/pretooluse-hooks-improvement.plan.md`
- 설계서: `docs/02-design/features/pretooluse-hooks-improvement.design.md`
- 구현 코드: `lib/common.js`, `scripts/*.js`

---

## 2. Scope

### 2.1 In Scope

- [x] lib/common.js 핵심 함수 6개 단위 테스트
- [x] scripts/ 파일 통합 테스트
- [x] agents/code-analyzer.md 동작 테스트
- [x] skills/phase-9-deployment timeout 테스트
- [x] 회귀 테스트 (기존 기능 동작 확인)
- [x] 경계값 테스트 (edge cases)

### 2.2 Out of Scope

- PostToolUse hooks 전체 리팩토링 테스트
- SessionStart hooks 테스트
- Gemini CLI 호환성 테스트 (별도 테스트 계획)
- 성능 벤치마크 (추후 별도)

---

## 3. Requirements (테스트 요구사항)

### 3.1 Functional Test Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| TR-01 | FR-01 `outputAllow()` PreToolUse 출력 형식 검증 | High | Pending |
| TR-02 | FR-01 `outputAllow()` PostToolUse/SessionStart 출력 형식 검증 | High | Pending |
| TR-03 | FR-02 `outputBlock()` stderr 출력 및 Exit Code 2 검증 | High | Pending |
| TR-04 | FR-03 `readStdinSync()` JSON 파싱 에러 로깅 검증 | Medium | Pending |
| TR-05 | FR-04 `truncateContext()` 500자 제한 검증 | Medium | Pending |
| TR-06 | FR-05 `updatePdcaStatus()` 반환값 검증 | Medium | Pending |
| TR-07 | FR-06 `findDesignDoc()` 권한 검증 동작 확인 | Medium | Pending |
| TR-08 | FR-06 `findPlanDoc()` 권한 검증 동작 확인 | Medium | Pending |
| TR-09 | scripts/ 5개 파일 outputAllow 타입 파라미터 적용 확인 | High | Pending |
| TR-10 | code-analyzer-pre.js 차단 동작 검증 | High | Pending |
| TR-11 | code-analyzer.md hook 설정 검증 | Medium | Pending |
| TR-12 | phase-9-deployment timeout 설정 검증 | Low | Pending |
| TR-13 | 기존 기능 회귀 테스트 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 모든 테스트 1초 이내 완료 | Jest timeout |
| Coverage | 핵심 함수 80% 이상 커버리지 | Jest --coverage |
| Reliability | 100% 테스트 통과 | CI/CD 결과 |

---

## 4. Test Cases (상세 테스트 케이스)

### 4.1 TR-01: outputAllow() PreToolUse 출력 형식

**목적**: FR-01 구현 검증 - `permissionDecision: "allow"` 제거 확인

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 1.1 | PreToolUse with context | `outputAllow('test context', 'PreToolUse')` | `{ hookSpecificOutput: { additionalContext: "test context" }}` | High |
| 1.2 | PreToolUse without context | `outputAllow('', 'PreToolUse')` | `{}` | High |
| 1.3 | PreToolUse null context | `outputAllow(null, 'PreToolUse')` | `{}` | Medium |
| 1.4 | Verify NO permissionDecision | 위 출력 검사 | `permissionDecision` 키 없음 | Critical |

**테스트 코드 위치**: `test-scripts/unit/output-functions.test.js`

### 4.2 TR-02: outputAllow() PostToolUse/SessionStart 출력 형식

**목적**: PostToolUse/SessionStart는 기존 형식 유지 확인

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 2.1 | PostToolUse with context | `outputAllow('message', 'PostToolUse')` | `{ decision: "allow", hookSpecificOutput: { additionalContext: "message" }}` | High |
| 2.2 | SessionStart with context | `outputAllow('info', 'SessionStart')` | `{ decision: "allow", hookSpecificOutput: { additionalContext: "info" }}` | Medium |
| 2.3 | Stop hook (systemMessage) | `outputAllow('report', 'Stop')` | `{ decision: "allow", systemMessage: "report" }` | Medium |

### 4.3 TR-03: outputBlock() stderr 및 Exit Code

**목적**: FR-02 구현 검증 - stderr + Exit Code 2 확인

| # | Test Case | Input | Expected | Priority |
|---|-----------|-------|----------|----------|
| 3.1 | Block outputs to stderr | `outputBlock('blocked reason')` | stderr: "blocked reason" | Critical |
| 3.2 | Block exits with code 2 | `outputBlock('reason')` | process.exit(2) 호출 | Critical |
| 3.3 | No JSON in stdout | `outputBlock('reason')` | stdout 비어있음 | High |

**테스트 방법**: 자식 프로세스 실행 후 stderr/stdout/exitCode 검사

### 4.4 TR-04: readStdinSync() 에러 로깅

**목적**: FR-03 구현 검증 - JSON 파싱 실패 시 로깅

| # | Test Case | Input (stdin) | Expected | Priority |
|---|-----------|---------------|----------|----------|
| 4.1 | Empty stdin | "" | `{}` 반환, debugLog 호출 | Medium |
| 4.2 | Invalid JSON | "not json" | `{}` 반환, debugLog 에러 로깅 | High |
| 4.3 | Valid JSON | `{"tool":"Write"}` | 파싱된 객체 반환 | High |
| 4.4 | Whitespace only | "   \n  " | `{}` 반환 | Low |

**테스트 코드 위치**: `test-scripts/unit/input-functions.test.js`

### 4.5 TR-05: truncateContext() 500자 제한

**목적**: FR-04 구현 검증 - Context 길이 제한

| # | Test Case | Input Length | Expected | Priority |
|---|-----------|--------------|----------|----------|
| 5.1 | Under limit | 100자 | 원본 그대로 | High |
| 5.2 | Exactly 500 | 500자 | 원본 그대로 | High |
| 5.3 | Over limit | 600자 | 500자 이하 + "..." | High |
| 5.4 | Cuts at sentence | "...sentence. more text..." (510자) | 마지막 `.` 에서 자름 | Medium |
| 5.5 | Cuts at pipe | "...info \| more..." (510자) | 마지막 ` \| `에서 자름 | Medium |
| 5.6 | Null input | null | "" | Medium |
| 5.7 | Number input | 12345 | "" | Low |

### 4.6 TR-06: updatePdcaStatus() 반환값

**목적**: FR-05 구현 검증 - 성공/실패 결과 반환

| # | Test Case | Scenario | Expected Return | Priority |
|---|-----------|----------|-----------------|----------|
| 6.1 | Success | 정상 업데이트 | `{ success: true, feature: "x", phase: "design" }` | High |
| 6.2 | Failure | 파일 쓰기 권한 없음 | `{ success: false, error: "..." }` | High |
| 6.3 | Invalid phase | phase="invalid" | `{ success: true }` (order: undefined) | Low |

### 4.7 TR-07, TR-08: findDesignDoc()/findPlanDoc() 권한 검증

**목적**: FR-06 구현 검증 - fs.accessSync 사용 확인

| # | Test Case | Scenario | Expected | Priority |
|---|-----------|----------|----------|----------|
| 7.1 | File exists, readable | 정상 파일 | 경로 반환 | High |
| 7.2 | File exists, no read permission | chmod 000 파일 | "" 반환 | High |
| 7.3 | File not exists | 없는 파일 | "" 반환 | High |
| 7.4 | Empty feature | feature="" | "" 반환 | Medium |

### 4.8 TR-09: scripts/ outputAllow 타입 파라미터

**목적**: 5개 스크립트의 타입 파라미터 적용 확인

| # | File | Line | Expected | Priority |
|---|------|------|----------|----------|
| 9.1 | gap-detector-post.js | 23 | `outputAllow(message, 'PostToolUse')` | High |
| 9.2 | pdca-post-write.js | 71 | `outputAllow(context, 'PostToolUse')` | High |
| 9.3 | phase5-design-post.js | 58 | `outputAllow(..., 'PostToolUse')` | High |
| 9.4 | phase6-ui-post.js | 33, 40 | `outputAllow(message, 'PostToolUse')` | High |
| 9.5 | qa-monitor-post.js | 32, 38 | `outputAllow(message, 'PostToolUse')` | High |

**테스트 방법**: 정적 코드 분석 (grep) + 실제 실행 테스트

### 4.9 TR-10: code-analyzer-pre.js 차단 동작

**목적**: Read-only agent의 Write/Edit 차단 확인

| # | Test Case | Expected | Priority |
|---|-----------|----------|----------|
| 10.1 | Execute script | stderr: "Code analyzer agent is read-only...", exit 2 | Critical |
| 10.2 | No stdout output | stdout 비어있음 | High |

### 4.10 TR-11: code-analyzer.md hook 설정

**목적**: echo 방식에서 스크립트 방식으로 변경 확인

| # | Check Item | Expected | Priority |
|---|------------|----------|----------|
| 11.1 | matcher | "Write\|Edit" | High |
| 11.2 | command | `node $\{CLAUDE_PLUGIN_ROOT\}/scripts/code-analyzer-pre.js` | High |
| 11.3 | timeout | 5000 | Medium |

### 4.11 TR-12: phase-9-deployment timeout 설정

**목적**: PreToolUse hook에 timeout 추가 확인

| # | Check Item | Expected | Priority |
|---|------------|----------|----------|
| 12.1 | timeout exists | 5000 | Medium |
| 12.2 | command | `node $\{CLAUDE_PLUGIN_ROOT\}/scripts/phase9-deploy-pre.js` | Medium |

### 4.12 TR-13: 회귀 테스트

**목적**: 기존 기능이 변경으로 인해 영향받지 않음 확인

| # | Test Case | Expected | Priority |
|---|-----------|----------|----------|
| 13.1 | pre-write.js 정상 동작 | 허용/차단 정상 | Critical |
| 13.2 | qa-pre-bash.js 위험 명령어 차단 | exit 2 | Critical |
| 13.3 | PDCA 상태 업데이트 정상 | .pdca-status.json 업데이트 | High |
| 13.4 | Design doc 검색 정상 | findDesignDoc() 경로 반환 | High |

---

## 5. Test Environment

### 5.1 Test Framework

| Component | Tool | Version |
|-----------|------|---------|
| Test Runner | Jest | 29.x |
| Assertions | Jest expect | Built-in |
| Coverage | Jest --coverage | Built-in |
| Mocking | Jest mock | Built-in |

### 5.2 Test Directory Structure

```
test-scripts/
├── unit/                           # 단위 테스트
│   ├── output-functions.test.js    # TR-01, TR-02, TR-03
│   ├── input-functions.test.js     # TR-04
│   ├── truncate-context.test.js    # TR-05
│   ├── pdca-status.test.js         # TR-06
│   └── doc-finder.test.js          # TR-07, TR-08
├── integration/                    # 통합 테스트
│   ├── scripts-type-param.test.js  # TR-09
│   ├── code-analyzer.test.js       # TR-10, TR-11
│   └── phase9-deploy.test.js       # TR-12
├── regression/                     # 회귀 테스트
│   └── existing-hooks.test.js      # TR-13
└── compatibility/                  # 기존 호환성 테스트
    └── scripts.test.js             # (기존)
```

### 5.3 Test Data

| Data | Location | Purpose |
|------|----------|---------|
| Mock stdin | 테스트 내 fixture | readStdinSync 테스트 |
| Long context (600자) | 테스트 내 상수 | truncateContext 테스트 |
| Mock PDCA status | temp file | updatePdcaStatus 테스트 |
| Permission-denied file | temp chmod 000 | findDesignDoc 테스트 |

---

## 6. Success Criteria

### 6.1 Definition of Done

- [x] 모든 TR-01~TR-13 테스트 케이스 구현 완료
- [x] 100% 테스트 통과 (0 failures)
- [x] 핵심 함수 80% 이상 커버리지
- [x] CI/CD 파이프라인 통과

### 6.2 Quality Criteria

- [x] 단위 테스트 실행 시간 < 5초
- [x] 통합 테스트 실행 시간 < 10초
- [x] 회귀 테스트 포함 전체 < 30초

---

## 7. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| process.exit() 테스트 어려움 | High | High | Jest spy 또는 자식 프로세스 사용 |
| stdin 모킹 복잡성 | Medium | Medium | 별도 테스트 헬퍼 함수 작성 |
| 권한 테스트 플랫폼 의존성 | Medium | Low | Unix 전용 테스트 또는 skip |
| PDCA 상태 파일 충돌 | Low | Medium | 임시 디렉토리 사용 |

---

## 8. Test Execution Plan

### 8.1 Phase 1: 단위 테스트 구현 (High Priority)

| Task | File | TR Coverage |
|------|------|-------------|
| 1.1 | output-functions.test.js | TR-01, TR-02, TR-03 |
| 1.2 | truncate-context.test.js | TR-05 |
| 1.3 | input-functions.test.js | TR-04 |

### 8.2 Phase 2: 통합 테스트 구현 (High Priority)

| Task | File | TR Coverage |
|------|------|-------------|
| 2.1 | scripts-type-param.test.js | TR-09 |
| 2.2 | code-analyzer.test.js | TR-10, TR-11 |
| 2.3 | pdca-status.test.js | TR-06 |
| 2.4 | doc-finder.test.js | TR-07, TR-08 |

### 8.3 Phase 3: 회귀 테스트 (High Priority)

| Task | File | TR Coverage |
|------|------|-------------|
| 3.1 | existing-hooks.test.js | TR-13 |
| 3.2 | phase9-deploy.test.js | TR-12 |

### 8.4 Phase 4: 커버리지 확인 및 보완

| Task | Description |
|------|-------------|
| 4.1 | Jest --coverage 실행 |
| 4.2 | 80% 미달 함수 추가 테스트 |
| 4.3 | 테스트 리포트 생성 |

---

## 9. Convention Prerequisites

### 9.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration (`.eslintrc.*`)
- [x] Prettier configuration (`.prettierrc`)
- [x] Jest configuration (`jest.config.js`)

### 9.2 Test Conventions to Follow

| Category | Convention |
|----------|------------|
| File naming | `*.test.js` |
| Test description | Korean (한글) |
| Assertion style | Jest expect |
| Async handling | async/await |

---

## 10. Next Steps

1. [ ] Write design document (`pretooluse-hooks-testing.design.md`)
2. [ ] Implement Phase 1 unit tests
3. [ ] Implement Phase 2 integration tests
4. [ ] Implement Phase 3 regression tests
5. [ ] Run full test suite and verify coverage
6. [ ] Generate test report

---

## Appendix A: Test Command Reference

```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- test-scripts/unit/output-functions.test.js

# 커버리지 리포트
npm test -- --coverage

# Watch 모드
npm test -- --watch

# 특정 TR 테스트만 (예: TR-01)
npm test -- --testNamePattern="TR-01"
```

---

## Appendix B: Mock Helper Examples

### B.1 process.exit() 모킹

```javascript
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
// 테스트 후
mockExit.mockRestore();
```

### B.2 stdin 모킹 (자식 프로세스 방식)

```javascript
const { spawnSync } = require('child_process');
const result = spawnSync('node', ['script.js'], {
  input: JSON.stringify({ tool: 'Write' }),
  encoding: 'utf8'
});
// result.stdout, result.stderr, result.status 검사
```

### B.3 console.error 캡처

```javascript
const mockStderr = jest.spyOn(console, 'error').mockImplementation(() => {});
// 테스트 후 검증
expect(mockStderr).toHaveBeenCalledWith('blocked reason');
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial test plan for PreToolUse hooks improvement | Claude Code |
