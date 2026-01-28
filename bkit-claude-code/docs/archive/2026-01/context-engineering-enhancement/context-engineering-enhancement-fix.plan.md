# Context Engineering Enhancement Fix v1.4.2 Planning Document

> **Summary**: v1.4.2 분석에서 발견된 CRITICAL/HIGH 이슈 6건 해결을 위한 개선 계획
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.2
> **Author**: AI Assistant
> **Date**: 2026-01-26
> **Status**: Draft
> **Previous Version**: [v1.4.2 Analysis](../../03-analysis/context-engineering-enhancement.analysis.md)

---

## 1. Overview

### 1.1 Purpose

v1.4.2 Context Engineering Enhancement 구현 후 Gap Analysis에서 발견된 6건의 이슈를 해결하여:
- Claude Code Hook API 스키마와 완전 호환 달성
- Dead Code 제거 및 실제 동작하는 기능으로 전환
- Production Readiness 30% → 90%+ 달성

### 1.2 Background

v1.4.2에서 8개 FR(Functional Requirements)을 구현했으나, 분석 결과:

| 평가 항목 | v1.4.2 점수 | 목표 |
|----------|:-----------:|:----:|
| Implementation Completeness | 70% | 95%+ |
| Integration Status | 40% | 90%+ |
| Claude Code Compatibility | 60% | 100% |
| Production Readiness | 30% | 90%+ |

**발견된 이슈 요약:**

| ID | Severity | Issue | Root Cause |
|----|:--------:|-------|------------|
| ISSUE-001 | CRITICAL | UserPromptSubmit 플러그인 버그 | GitHub #20659 (외부) |
| ISSUE-002 | CRITICAL | PreCompact 이벤트 미등록 | 이벤트명 불일치 |
| ISSUE-003 | CRITICAL | outputAllow() 잘못된 `decision: 'allow'` | API 스키마 불일치 |
| ISSUE-006 | CRITICAL | outputAllow() `hookEventName` 누락 | API 스키마 불일치 |
| ISSUE-004 | HIGH | context:fork 호출 코드 없음 | Integration 미완료 |
| ISSUE-005 | MEDIUM | @import 통합 불완전 | ISSUE-001 연쇄 영향 |

### 1.3 Related Documents

- Previous Plan: [context-engineering-enhancement.plan.md](./context-engineering-enhancement.plan.md)
- Design: [context-engineering-enhancement.design.md](../../02-design/features/context-engineering-enhancement.design.md)
- Analysis: [context-engineering-enhancement.analysis.md](../../03-analysis/context-engineering-enhancement.analysis.md)
- Test Report: [context-engineering-enhancement-test.report.md](../../04-report/features/context-engineering-enhancement-test.report.md)

---

## 2. Scope

### 2.1 In Scope

- [x] **FIX-01**: outputAllow() 함수 Claude Code API 스키마 준수 수정 (ISSUE-003, ISSUE-006)
- [x] **FIX-02**: PreCompact Hook 이벤트 등록 (ISSUE-002)
- [x] **FIX-03**: UserPromptSubmit Workaround 문서화 + 자동 감지 (ISSUE-001)
- [x] **FIX-04**: context:fork 통합 전략 재검토 (ISSUE-004)
- [x] **FIX-05**: @import 대체 통합 경로 구현 (ISSUE-005)

### 2.2 Out of Scope

- Claude Code 내부 버그 수정 (GitHub #20659)
- Claude Code 내부 Skill 로더 수정
- 기존 v1.4.2 기능 중 정상 동작하는 부분 변경
- 하위 호환성 파괴

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Related Issue | Status |
|----|-------------|:--------:|:-------------:|:------:|
| **FIX-01** | outputAllow() 함수에서 hookEventName 필드 추가 및 UserPromptSubmit에서 decision 필드 제거 | CRITICAL | ISSUE-003, 006 | Pending |
| **FIX-02** | hooks.json에 PreCompact 이벤트 등록하여 FR-07 활성화 | CRITICAL | ISSUE-002 | Pending |
| **FIX-03** | UserPromptSubmit 버그 자동 감지 및 Workaround 안내 메시지 추가 | HIGH | ISSUE-001 | Pending |
| **FIX-04** | context:fork를 SessionStart Hook 기반 Skill 스캔 방식으로 재설계 | HIGH | ISSUE-004 | Pending |
| **FIX-05** | @import 결과를 SessionStart에서 사전 로딩 후 캐싱하는 방식으로 전환 | MEDIUM | ISSUE-005 | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Compatibility | Claude Code v2.1.x Hook API 100% 준수 | API 스키마 검증 테스트 |
| Regression | 기존 87개 테스트 100% 통과 유지 | tests/run-all-tests.js |
| Performance | Hook 실행 시간 < 100ms | Debug logging timestamp |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FIX-01~05 모두 구현 완료
- [ ] 기존 87개 테스트 100% 통과
- [ ] 새로운 이슈 해결 테스트 추가 (최소 10개)
- [ ] CHANGELOG.md 업데이트
- [ ] 분석 문서 v1.4.2 섹션 추가

### 4.2 Quality Criteria

- [ ] Production Readiness 90%+ 달성
- [ ] Claude Code Compatibility 100% 달성
- [ ] Zero new lint errors
- [ ] All hooks return valid JSON schema

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|:------:|:----------:|------------|
| GitHub #20659 장기 미해결 | High | Medium | Workaround 문서화 + 자동 감지 메시지 |
| context:fork 재설계 복잡성 | Medium | Medium | 단순화: Skill 메타데이터 캐싱만 구현 |
| PreCompact Hook 동작 미검증 | Medium | Low | 수동 테스트 + 스냅샷 생성 확인 |
| API 스키마 재변경 | Low | Low | Claude Code 버전 체크 로직 추가 |

---

## 6. Detailed Fix Design

### 6.1 FIX-01: outputAllow() API 스키마 수정

**현재 문제:**
```javascript
// lib/common.js:593-596 (버그)
console.log(JSON.stringify({
  decision: 'allow',  // UserPromptSubmit에서 유효하지 않음!
  hookSpecificOutput: { additionalContext: safeContext }
}));
```

**수정안:**
```javascript
function outputAllow(context = '', hookEvent = 'PostToolUse') {
  const safeContext = truncateContext(context, MAX_CONTEXT_LENGTH);

  if (isGeminiCli()) {
    // Gemini CLI 처리 (기존 유지)
    if (safeContext) {
      console.log(`\x1b[36m💡 bkit Context:\x1b[0m ${safeContext}`);
    }
    process.exit(0);
  } else {
    if (!safeContext) {
      console.log('{}');
      return;
    }

    // Claude Code API 스키마 준수
    if (hookEvent === 'UserPromptSubmit') {
      // ISSUE-003 수정: decision 필드 제거
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',  // ISSUE-006 수정
          additionalContext: safeContext
        }
      }));
    } else if (hookEvent === 'Stop') {
      console.log(JSON.stringify({
        systemMessage: safeContext
      }));
    } else {
      // PreToolUse, PostToolUse, SessionStart
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: hookEvent,  // ISSUE-006 수정
          additionalContext: safeContext
        }
      }));
    }
  }
}
```

**영향 범위:**
- `lib/common.js`: outputAllow() 함수 수정
- 모든 Hook 스크립트: 변경 없음 (outputAllow 호출부)

---

### 6.2 FIX-02: PreCompact Hook 등록

**현재 상태:**
- `scripts/context-compaction.js` 구현됨 (95 lines)
- `hooks.json`에 이벤트 미등록

**수정안 (hooks.json 추가):**
```json
{
  "PreCompact": [
    {
      "matcher": "auto|manual",
      "hooks": [
        {
          "type": "command",
          "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/context-compaction.js",
          "timeout": 5000
        }
      ]
    }
  ]
}
```

---

### 6.3 FIX-03: UserPromptSubmit Workaround

**전략:**
1. SessionStart에서 플러그인 UserPromptSubmit 동작 여부 감지
2. 동작하지 않으면 Workaround 안내 메시지 출력

**구현:**
```javascript
// hooks/session-start.js 추가
function checkUserPromptSubmitBug() {
  // GitHub #20659 버그 체크
  // 플러그인 hooks.json에 UserPromptSubmit이 있지만 동작 안 하는 경우 감지

  const warningMessage = `
⚠️ Known Issue: UserPromptSubmit hook may not work in plugins (GitHub #20659).
Workaround: Add to ~/.claude/settings.json manually.
See: docs/TROUBLESHOOTING.md
`;

  return warningMessage;
}
```

**문서화:**
- `docs/TROUBLESHOOTING.md` 생성
- Workaround 설정 예시 포함

---

### 6.4 FIX-04: context:fork 재설계

**기존 문제:**
- `lib/context-fork.js` 구현됨 (228 lines)
- Skill frontmatter `context: fork` 감지 코드 없음
- Claude Code Skill 로더 수정 불가

**새로운 전략: SessionStart 기반 사전 스캔**

```javascript
// hooks/session-start.js에 추가
function scanSkillsForForkConfig() {
  const skillsDir = path.join(PLUGIN_ROOT, 'skills');
  const forkEnabledSkills = [];

  // 모든 SKILL.md frontmatter 스캔
  const skills = fs.readdirSync(skillsDir);
  for (const skill of skills) {
    const skillMd = path.join(skillsDir, skill, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      const frontmatter = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
      if (frontmatter.context === 'fork') {
        forkEnabledSkills.push({
          name: skill,
          mergeResult: frontmatter.mergeResult !== false
        });
      }
    }
  }

  // 세션 컨텍스트에 저장
  setSessionContext('forkEnabledSkills', forkEnabledSkills);

  return forkEnabledSkills;
}
```

**제한사항:**
- 실제 fork 실행은 Skill 호출 시점에 수동 트리거 필요
- v1.5.0에서 SubagentStart Hook 활용 방안 검토

---

### 6.5 FIX-05: @import 대체 통합

**기존 문제:**
- UserPromptSubmit에서 @import 처리 → ISSUE-001로 동작 안 함

**새로운 전략: SessionStart 사전 로딩**

```javascript
// hooks/session-start.js에 추가
function preloadImportedContent() {
  const importResolver = require('../lib/import-resolver.js');

  // 자주 사용되는 import 경로 사전 로딩
  const commonImports = [
    '${PLUGIN_ROOT}/templates/shared/api-patterns.md',
    '${PLUGIN_ROOT}/templates/shared/error-handling.md'
  ];

  for (const importPath of commonImports) {
    const resolved = importResolver.resolveVariables(importPath);
    importResolver.loadImportedContent(resolved);  // 캐시에 저장
  }

  debugLog('SessionStart', 'Imports preloaded', { count: commonImports.length });
}
```

---

## 7. Implementation Order

### Phase 1: API Schema Fix (FIX-01) - 최우선

1. `lib/common.js` outputAllow() 함수 수정
2. 테스트: 각 Hook 이벤트별 JSON 출력 검증
3. 예상 영향: 모든 Hook 정상화

### Phase 2: Hook Registration (FIX-02)

1. `hooks/hooks.json`에 PreCompact 이벤트 추가
2. 테스트: `/compact` 명령 시 스냅샷 생성 확인

### Phase 3: SessionStart Enhancement (FIX-03, 04, 05)

1. `hooks/session-start.js` 확장
   - UserPromptSubmit 버그 감지 메시지
   - Skill fork 설정 스캔
   - Import 사전 로딩
2. 테스트: SessionStart 디버그 로그 확인

### Phase 4: Documentation

1. `docs/TROUBLESHOOTING.md` 생성
2. CHANGELOG.md v1.4.2 섹션 추가
3. 분석 문서 업데이트

---

## 8. Test Plan

### 8.1 New Test Cases

| TC ID | Description | Expected Result |
|-------|-------------|-----------------|
| TC-FIX-01a | outputAllow('test', 'UserPromptSubmit') | No `decision` field in output |
| TC-FIX-01b | outputAllow('test', 'PreToolUse') | `hookEventName: 'PreToolUse'` present |
| TC-FIX-02 | PreCompact hook trigger | Snapshot file created |
| TC-FIX-03 | SessionStart with plugin bug | Warning message in context |
| TC-FIX-04 | Skill with `context: fork` in frontmatter | Registered in session context |
| TC-FIX-05 | SessionStart import preload | Cache populated |

### 8.2 Regression Tests

- 기존 87개 테스트 전체 실행
- Hook별 디버그 로그 검증

---

## 9. Next Steps

1. [ ] /pdca-design context-engineering-enhancement-fix 실행
2. [ ] FIX-01 구현 및 테스트
3. [ ] FIX-02~05 순차 구현
4. [ ] /pdca-analyze context-engineering-enhancement-fix 실행
5. [ ] Match Rate 90%+ 달성 확인
6. [ ] /pdca-report context-engineering-enhancement-fix 실행

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial draft based on v1.4.2 analysis | AI Assistant |
