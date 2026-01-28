# Context Engineering Enhancement Fix v1.4.2 Design Document

> **Summary**: v1.4.2 분석에서 발견된 CRITICAL/HIGH 이슈 6건 해결을 위한 상세 설계
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.2
> **Author**: AI Assistant
> **Date**: 2026-01-26
> **Status**: Draft
> **Planning Doc**: [context-engineering-enhancement-fix.plan.md](../../01-plan/features/context-engineering-enhancement-fix.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- **FIX-01**: `outputAllow()` 함수를 Claude Code Hook API 스키마와 완전 호환되도록 수정
- **FIX-02**: `hooks.json`에 PreCompact 이벤트 등록하여 FR-07 활성화
- **FIX-03**: UserPromptSubmit 플러그인 버그 자동 감지 및 Workaround 안내
- **FIX-04**: context:fork 기능을 SessionStart 기반 사전 스캔 방식으로 재설계
- **FIX-05**: @import 결과를 SessionStart에서 사전 로딩

### 1.2 Design Principles

- **Backward Compatibility**: 기존 v1.4.2 기능 및 설정 100% 호환
- **Minimal Invasive**: 최소한의 코드 수정으로 최대 효과
- **Fail-Safe**: 새 기능 실패 시 기존 동작 유지
- **Platform Parity**: Claude Code와 Gemini CLI 동일 동작

---

## 2. Impact Analysis

### 2.1 Files to Modify

| File | Lines | FIX | Changes |
|------|:-----:|:---:|---------|
| `lib/common.js` | 556-600 | FIX-01 | outputAllow() 함수 수정 |
| `hooks/hooks.json` | 41-52 | FIX-02 | PreCompact 이벤트 추가 |
| `hooks/session-start.js` | 101-188 | FIX-03,04,05 | 버그 감지, fork 스캔, import 사전로딩 |
| `scripts/context-compaction.js` | 87-91 | FIX-01 | hookEventName 추가 |

### 2.2 Files Affected (Indirect)

| File | Lines | Reason |
|------|:-----:|--------|
| `scripts/pre-write.js` | 194 | outputAllow('PreToolUse') 호출 |
| `scripts/user-prompt-handler.js` | 141 | outputAllow('UserPromptSubmit') 호출 |
| `scripts/pdca-post-write.js` | - | outputAllow('PostToolUse') 호출 |
| 기타 26개 scripts/* | - | outputAllow() 호출하는 모든 스크립트 |

### 2.3 No Changes Required

| File | Reason |
|------|--------|
| `lib/context-hierarchy.js` | 정상 동작 (테스트 통과) |
| `lib/import-resolver.js` | 정상 동작 (테스트 통과) |
| `lib/context-fork.js` | 정상 동작, 호출 코드만 추가 필요 |
| `lib/permission-manager.js` | 정상 동작 (테스트 통과) |
| `lib/memory-store.js` | 정상 동작 (테스트 통과) |

---

## 3. Detailed Design: FIX-01 (outputAllow API Schema)

### 3.1 Current Code Analysis

**Location**: `lib/common.js:556-600`

```javascript
// 현재 코드 (버그)
function outputAllow(context = '', hookEvent = 'PostToolUse') {
  // ...
  if (hookEvent === 'PreToolUse') {
    // OK: decision 없음, hookEventName 없음
    console.log(JSON.stringify({
      hookSpecificOutput: {
        additionalContext: safeContext
      }
    }));
  } else if (hookEvent === 'Stop') {
    // ISSUE: decision: 'allow' 사용
    console.log(JSON.stringify({
      decision: 'allow',
      systemMessage: safeContext
    }));
  } else {
    // ISSUE: PostToolUse, SessionStart, UserPromptSubmit 모두 동일 처리
    // UserPromptSubmit에서 decision: 'allow' 는 유효하지 않음!
    console.log(JSON.stringify({
      decision: 'allow',  // ← ISSUE-003
      hookSpecificOutput: { additionalContext: safeContext }  // ← ISSUE-006: hookEventName 없음
    }));
  }
}
```

### 3.2 Claude Code Hook API Schema (공식)

| Hook Event | decision | hookEventName | additionalContext | systemMessage |
|------------|:--------:|:-------------:|:-----------------:|:-------------:|
| SessionStart | optional | required | supported | - |
| PreToolUse | **not used** | required | supported | - |
| PostToolUse | optional | required | supported | - |
| UserPromptSubmit | **not supported** | required | supported | - |
| Stop | optional | - | - | supported |
| PreCompact | optional | required | supported | - |

**핵심 발견**:
1. `decision: 'allow'`는 UserPromptSubmit에서 지원되지 않음
2. `hookEventName`은 모든 이벤트에서 필수임 (Stop 제외)

### 3.3 Fix Implementation

**수정된 outputAllow() 함수**:

```javascript
/**
 * Output allow decision with context
 * @param {string} context - Additional context
 * @param {string} hookEvent - Hook event type: 'PreToolUse' | 'PostToolUse' | 'SessionStart' | 'UserPromptSubmit' | 'Stop' | 'PreCompact'
 */
function outputAllow(context = '', hookEvent = 'PostToolUse') {
  // Apply context length limit (FR-04)
  const safeContext = truncateContext(context, MAX_CONTEXT_LENGTH);

  if (isGeminiCli()) {
    // Gemini CLI: Print plain text context if available
    if (safeContext) {
      console.log(`\x1b[36m💡 bkit Context:\x1b[0m ${safeContext}`);
    }
    process.exit(0);
  } else {
    // Claude Code: Print JSON based on hook event type
    if (!safeContext) {
      console.log('{}');
      return;
    }

    // v1.4.2: Hook event별 올바른 스키마 사용
    // FIX-01: hookEventName 필수 추가, UserPromptSubmit에서 decision 제거

    if (hookEvent === 'Stop') {
      // Stop hooks: systemMessage만 사용 (hookEventName, additionalContext 미지원)
      console.log(JSON.stringify({
        systemMessage: safeContext
      }));
    } else if (hookEvent === 'UserPromptSubmit') {
      // FIX-01 (ISSUE-003): UserPromptSubmit은 decision 필드 미지원
      // FIX-01 (ISSUE-006): hookEventName 필수
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: safeContext
        }
      }));
    } else if (hookEvent === 'PreToolUse') {
      // PreToolUse: decision 없이 hookEventName + additionalContext
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: safeContext
        }
      }));
    } else {
      // PostToolUse, SessionStart, PreCompact: 표준 스키마
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: hookEvent,
          additionalContext: safeContext
        }
      }));
    }
  }
}
```

### 3.4 Affected Call Sites

모든 `outputAllow()` 호출 분석:

| File | Line | Current Call | Change Required |
|------|:----:|--------------|:---------------:|
| `scripts/pre-write.js` | 194 | `outputAllow(context, 'PreToolUse')` | ❌ |
| `scripts/user-prompt-handler.js` | 141 | `outputAllow(context, 'UserPromptSubmit')` | ❌ |
| `scripts/pdca-post-write.js` | - | `outputAllow(context, 'PostToolUse')` | ❌ |
| `scripts/context-compaction.js` | 87 | Direct JSON output | ✅ hookEventName 추가 |
| `hooks/session-start.js` | 530-543 | Direct JSON output | ✅ 이미 hookEventName 있음 |
| 기타 scripts/*.js | - | `outputAllow(context)` default | ❌ |

### 3.5 context-compaction.js Fix

**현재 코드** (lines 87-91):
```javascript
console.log(JSON.stringify({
  hookSpecificOutput: {
    additionalContext  // hookEventName 없음
  }
}));
```

**수정 코드**:
```javascript
console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreCompact',  // FIX-01 추가
    additionalContext
  }
}));
```

---

## 4. Detailed Design: FIX-02 (PreCompact Hook Registration)

### 4.1 Current hooks.json Structure

```json
{
  "hooks": {
    "SessionStart": [...],
    "PreToolUse": [...],
    "PostToolUse": [...],
    "UserPromptSubmit": [...]
    // PreCompact 미등록!
  }
}
```

### 4.2 Add PreCompact Event

**hooks.json 추가 내용**:

```json
{
  "hooks": {
    // ... 기존 이벤트 ...

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
}
```

### 4.3 Verification

PreCompact 이벤트는 Claude Code가 다음 상황에서 트리거:
- 컨텍스트 길이가 제한에 도달할 때 (`auto`)
- 사용자가 `/compact` 명령 실행 시 (`manual`)

---

## 5. Detailed Design: FIX-03 (UserPromptSubmit Bug Detection)

### 5.1 Problem Analysis

GitHub Issue #20659:
- 플러그인의 `hooks.json`에서 정의한 UserPromptSubmit이 동작하지 않음
- 같은 설정을 `~/.claude/settings.json`에 넣으면 동작함

### 5.2 Detection Strategy

SessionStart에서 플러그인 버그를 감지하고 경고 메시지 추가:

```javascript
// hooks/session-start.js 추가
function checkUserPromptSubmitBug() {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  // 1. 플러그인 hooks.json에 UserPromptSubmit 있는지 확인
  const pluginHooksPath = path.join(__dirname, 'hooks.json');
  let pluginHasUPS = false;

  try {
    const pluginHooks = JSON.parse(fs.readFileSync(pluginHooksPath, 'utf8'));
    pluginHasUPS = !!(pluginHooks.hooks && pluginHooks.hooks.UserPromptSubmit);
  } catch (e) {}

  if (!pluginHasUPS) {
    return null; // 플러그인에 UserPromptSubmit 없음
  }

  // 2. 사용자 settings.json에 workaround 있는지 확인
  const userSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  let userHasWorkaround = false;

  try {
    const userSettings = JSON.parse(fs.readFileSync(userSettingsPath, 'utf8'));
    userHasWorkaround = !!(userSettings.hooks && userSettings.hooks.UserPromptSubmit);
  } catch (e) {}

  if (userHasWorkaround) {
    return null; // 이미 workaround 적용됨
  }

  // 3. 경고 메시지 반환
  return {
    warning: true,
    message: `⚠️ Known Issue (GitHub #20659): UserPromptSubmit hook may not work in plugins.
Workaround: Add to ~/.claude/settings.json. See docs/TROUBLESHOOTING.md`,
    workaroundPath: userSettingsPath
  };
}
```

### 5.3 Integration Point

`hooks/session-start.js`의 `additionalContext`에 경고 추가:

```javascript
// v1.4.2: UserPromptSubmit 버그 감지 (FIX-03)
const upsBugWarning = checkUserPromptSubmitBug();
if (upsBugWarning) {
  additionalContext += `\n\n${upsBugWarning.message}\n`;
}
```

---

## 6. Detailed Design: FIX-04 (context:fork Redesign)

### 6.1 Current State

- `lib/context-fork.js`: 완전 구현됨 (228 lines, 테스트 통과)
- **문제**: Skill frontmatter의 `context: fork` 를 감지하고 호출하는 코드 없음

### 6.2 Design Constraint

- Claude Code 내부 Skill 로더를 수정할 수 없음
- Hook으로 Skill 시작 시점 감지 불가 (SubagentStart는 Task용)

### 6.3 New Strategy: SessionStart Skill Scan

SessionStart에서 모든 Skill의 frontmatter를 스캔하여 fork 설정을 캐싱:

```javascript
// hooks/session-start.js 추가
function scanSkillsForForkConfig() {
  const fs = require('fs');
  const path = require('path');
  const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace('/hooks', '');

  const skillsDir = path.join(PLUGIN_ROOT, 'skills');
  const forkEnabledSkills = [];

  try {
    if (!fs.existsSync(skillsDir)) {
      return [];
    }

    const skills = fs.readdirSync(skillsDir);

    for (const skill of skills) {
      const skillPath = path.join(skillsDir, skill);
      const skillMdPath = path.join(skillPath, 'SKILL.md');

      if (!fs.existsSync(skillMdPath)) continue;

      try {
        const content = fs.readFileSync(skillMdPath, 'utf8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];

          // context: fork 감지
          const contextMatch = frontmatter.match(/^context:\s*(\w+)/m);
          if (contextMatch && contextMatch[1] === 'fork') {
            // mergeResult 감지 (default: true)
            const mergeMatch = frontmatter.match(/^mergeResult:\s*(true|false)/m);
            const mergeResult = mergeMatch ? mergeMatch[1] === 'true' : true;

            forkEnabledSkills.push({
              name: skill,
              context: 'fork',
              mergeResult
            });
          }
        }
      } catch (e) {
        // Skip individual skill errors
      }
    }
  } catch (e) {
    debugLog('SessionStart', 'Skill scan failed', { error: e.message });
  }

  return forkEnabledSkills;
}
```

### 6.4 Session Context Storage

```javascript
// SessionStart에서 호출
const forkEnabledSkills = scanSkillsForForkConfig();
if (forkEnabledSkills.length > 0) {
  contextHierarchy.setSessionContext('forkEnabledSkills', forkEnabledSkills);
  debugLog('SessionStart', 'Fork-enabled skills detected', {
    count: forkEnabledSkills.length,
    skills: forkEnabledSkills.map(s => s.name)
  });
}
```

### 6.5 Future Enhancement (v1.5.0)

실제 fork 실행은 SubagentStart Hook 또는 다른 메커니즘으로 구현 예정.
현재는 감지 및 캐싱만 구현.

---

## 7. Detailed Design: FIX-05 (@import Preloading)

### 7.1 Current State

- `lib/import-resolver.js`: 완전 구현됨 (272 lines, 테스트 통과)
- `scripts/user-prompt-handler.js`: import 호출 시도 (lines 111-133)
- **문제**: UserPromptSubmit 버그 (ISSUE-001)로 결과가 컨텍스트에 주입되지 않음

### 7.2 New Strategy: SessionStart Preloading

SessionStart에서 자주 사용되는 import를 사전 로딩하여 캐시에 저장:

```javascript
// hooks/session-start.js 수정 (기존 lines 149-175 보완)
function preloadCommonImports() {
  if (!importResolver) return;

  const fs = require('fs');
  const path = require('path');
  const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || __dirname.replace('/hooks', '');

  // 1. 공통 템플릿 사전 로딩
  const commonImports = [
    path.join(PLUGIN_ROOT, 'templates', 'shared', 'api-patterns.md'),
    path.join(PLUGIN_ROOT, 'templates', 'shared', 'error-handling.md'),
    path.join(PLUGIN_ROOT, 'templates', 'shared', 'conventions.md')
  ];

  let loadedCount = 0;
  for (const importPath of commonImports) {
    if (fs.existsSync(importPath)) {
      importResolver.loadImportedContent(importPath);
      loadedCount++;
    }
  }

  // 2. bkit.config.json의 startupImports 로딩 (기존 로직)
  const config = getBkitConfig();
  const startupImports = config.startupImports || [];

  if (startupImports.length > 0) {
    const { content, errors } = importResolver.resolveImports(
      { imports: startupImports },
      path.join(process.cwd(), 'bkit.config.json')
    );

    if (errors.length === 0 && content) {
      loadedCount += startupImports.length;
    }
  }

  debugLog('SessionStart', 'Imports preloaded', {
    commonCount: commonImports.filter(p => fs.existsSync(p)).length,
    startupCount: startupImports.length,
    totalLoaded: loadedCount
  });
}
```

---

## 8. Implementation Order

### Phase 1: FIX-01 (API Schema) - 최우선

1. `lib/common.js` outputAllow() 함수 수정 (lines 556-600)
2. `scripts/context-compaction.js` hookEventName 추가 (lines 87-91)
3. 테스트: 각 Hook 이벤트별 JSON 출력 검증

### Phase 2: FIX-02 (PreCompact Registration)

1. `hooks/hooks.json`에 PreCompact 이벤트 추가
2. 테스트: `/compact` 명령 시 context-compaction.js 실행 확인

### Phase 3: FIX-03, 04, 05 (SessionStart Enhancement)

1. `hooks/session-start.js`에 세 함수 추가:
   - `checkUserPromptSubmitBug()`
   - `scanSkillsForForkConfig()`
   - `preloadCommonImports()` 수정
2. 테스트: SessionStart 디버그 로그 확인

### Phase 4: Documentation

1. `docs/TROUBLESHOOTING.md` 생성
2. CHANGELOG.md v1.4.2 섹션 추가

---

## 9. Test Plan

### 9.1 Unit Tests for FIX-01

| TC ID | Description | Input | Expected Output |
|-------|-------------|-------|-----------------|
| TC-FIX01-01 | outputAllow PreToolUse | `('test', 'PreToolUse')` | `{hookSpecificOutput: {hookEventName: 'PreToolUse', ...}}` |
| TC-FIX01-02 | outputAllow UserPromptSubmit | `('test', 'UserPromptSubmit')` | No `decision` field |
| TC-FIX01-03 | outputAllow PostToolUse | `('test', 'PostToolUse')` | `{hookSpecificOutput: {hookEventName: 'PostToolUse', ...}}` |
| TC-FIX01-04 | outputAllow SessionStart | `('test', 'SessionStart')` | `{hookSpecificOutput: {hookEventName: 'SessionStart', ...}}` |
| TC-FIX01-05 | outputAllow Stop | `('test', 'Stop')` | `{systemMessage: ...}` only |
| TC-FIX01-06 | outputAllow PreCompact | `('test', 'PreCompact')` | `{hookSpecificOutput: {hookEventName: 'PreCompact', ...}}` |

### 9.2 Integration Tests

| TC ID | Description | Expected |
|-------|-------------|----------|
| TC-INT-01 | PreCompact hook registration | Hook fires on `/compact` |
| TC-INT-02 | UPS bug detection | Warning in additionalContext |
| TC-INT-03 | Skill fork scan | forkEnabledSkills in session context |
| TC-INT-04 | Import preloading | Cache populated with common imports |

### 9.3 Regression Tests

기존 87개 테스트 전체 통과 확인

---

## 10. Rollback Plan

문제 발생 시 롤백 절차:

1. **FIX-01 롤백**: `lib/common.js` outputAllow() 이전 버전 복원
2. **FIX-02 롤백**: `hooks/hooks.json`에서 PreCompact 제거
3. **FIX-03~05 롤백**: `hooks/session-start.js` 이전 버전 복원

각 FIX는 독립적으로 롤백 가능.

---

## 11. File Change Summary

### 11.1 Modified Files

| File | Lines Changed | Description |
|------|:------------:|-------------|
| `lib/common.js` | ~50 | outputAllow() 전면 수정 |
| `hooks/hooks.json` | ~15 | PreCompact 이벤트 추가 |
| `hooks/session-start.js` | ~100 | 3개 함수 추가 |
| `scripts/context-compaction.js` | ~5 | hookEventName 추가 |

### 11.2 New Files

| File | Purpose |
|------|---------|
| `docs/TROUBLESHOOTING.md` | UserPromptSubmit workaround 문서 |
| `templates/shared/` (directory) | 공통 import 템플릿 |

### 11.3 No Changes

- All 5 lib modules (context-hierarchy, import-resolver, context-fork, permission-manager, memory-store)
- All 11 Agent files
- All 18 Skill files
- All 12 Template files (except new shared/)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial design based on codebase analysis | AI Assistant |
