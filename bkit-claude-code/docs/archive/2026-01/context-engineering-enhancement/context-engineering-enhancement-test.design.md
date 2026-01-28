# Context Engineering Enhancement Test Design Document

> **Summary**: context-engineering-enhancement v1.4.2의 8개 FR 및 수정된 22개 파일에 대한 종합 테스트 상세 설계
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.2
> **Author**: AI Assistant
> **Date**: 2026-01-26
> **Status**: Draft
> **Planning Doc**: [context-engineering-enhancement-test.plan.md](../01-plan/features/context-engineering-enhancement-test.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- **완전성**: 신규 7개 모듈 + 수정 15개 파일의 모든 기능 검증
- **영향 범위 검증**: 기존 28개 스크립트의 lib/common.js 의존성 호환 확인
- **실시간 동작 검증**: Claude Code/Gemini CLI 대화형 테스트 포함
- **회귀 방지**: v1.4.1 기능 100% 호환성 보장

### 1.2 Design Principles

- **Isolation First**: 각 모듈을 독립적으로 테스트 후 통합
- **Lazy Loading Safe**: 순환 참조 방지 패턴(getCommon()) 검증
- **Graceful Degradation**: 모듈 부재 시 fallback 동작 확인
- **Platform Parity**: Claude Code와 Gemini CLI 동일 동작 보장

### 1.3 Test Target Summary

| 카테고리 | 파일 수 | Lines | 테스트 유형 |
|----------|:-------:|:-----:|-------------|
| 신규 lib 모듈 | 5 | 1,176 | Unit + Integration |
| 신규 scripts | 2 | 241 | Unit + Integration |
| 수정된 hooks/scripts | 3 | +171 | Regression + Integration |
| 수정된 agents | 4 | +13 | Integration + E2E |
| 수정된 skills | 2 | +5 | Integration + E2E |
| lib/common.js | 1 | +59 | Unit + Regression |
| config 파일 | 2 | +44 | Integration |
| shared templates | 3 | ~150 | Integration |
| **Total** | **22+** | **~1,700** | - |

---

## 2. Architecture

### 2.1 Test Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      bkit v1.4.2 Test Architecture                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        E2E / Conversation Tests                      │   │
│  │  • Claude Code 실시간 대화 테스트                                    │   │
│  │  • Gemini CLI 대화 테스트                                           │   │
│  │  • Hook 이벤트 체인 검증                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Integration Tests                             │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │ Session   │  │ PreWrite  │  │ UserPrompt│  │ Compaction│        │   │
│  │  │ Start     │  │ Hook      │  │ Hook      │  │ Hook      │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  │        │              │              │              │               │   │
│  │        ▼              ▼              ▼              ▼               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              Module Integration Layer                        │   │   │
│  │  │  context-hierarchy ↔ import-resolver ↔ permission-manager   │   │   │
│  │  │        ↕                    ↕                    ↕           │   │   │
│  │  │  context-fork ↔ memory-store ↔ lib/common.js               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          Unit Tests                                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ context-    │ │ import-     │ │ context-    │ │ permission- │   │   │
│  │  │ hierarchy   │ │ resolver    │ │ fork        │ │ manager     │   │   │
│  │  │ (282 lines) │ │ (272 lines) │ │ (228 lines) │ │ (205 lines) │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐   │   │
│  │  │ memory-     │ │ auto        │ │ user-prompt-handler (145)  │   │   │
│  │  │ store       │ │ CreatePdca  │ │ context-compaction (96)    │   │   │
│  │  │ (189 lines) │ │ Task (59)   │ │                             │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Module Dependency Map

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      Module Dependency Chain                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  lib/common.js (Core - 2,800+ lines)                                    │
│       ▲                                                                  │
│       │ getCommon() [Lazy Loading]                                      │
│       │                                                                  │
│  ┌────┴────┬────────────┬─────────────┬──────────────┐                  │
│  │         │            │             │              │                  │
│  ▼         ▼            ▼             ▼              ▼                  │
│ context-  import-    context-    permission-    memory-                 │
│ hierarchy resolver   fork        manager        store                   │
│  (FR-01)  (FR-02)   (FR-03)     (FR-05)       (FR-08)                  │
│     │        │          │            │              │                   │
│     └────────┴──────────┴────────────┴──────────────┘                   │
│              │                                                           │
│              ▼                                                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Hook Scripts Layer                              │  │
│  │  session-start.js   pre-write.js   user-prompt-handler.js        │  │
│  │      (FR-01/02/03/08)   (FR-05)         (FR-04)                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Lazy Loading Pattern Verification Points

| 모듈 | getCommon() 호출 | 순환 참조 위험 | 테스트 ID |
|------|:---------------:|:-------------:|-----------|
| context-hierarchy.js | 6회 | Low | UT-LP-01 |
| import-resolver.js | 5회 + getHierarchy() 1회 | Medium | UT-LP-02 |
| context-fork.js | 6회 | Low | UT-LP-03 |
| permission-manager.js | 2회 + getHierarchy() 1회 | Medium | UT-LP-04 |
| memory-store.js | 5회 | Low | UT-LP-05 |

---

## 3. Data Model

### 3.1 Test Fixture Entities

```typescript
// Context Hierarchy Test Data
interface ContextLevelFixture {
  level: 'plugin' | 'user' | 'project' | 'session';
  source: string;
  data: Record<string, any>;
  expectedPriority: 1 | 2 | 3 | 4;
}

// Import Resolver Test Data
interface ImportTestFixture {
  sourceFile: string;
  imports: string[];
  expectedContent: string;
  expectedErrors: string[];
}

// Permission Test Data
interface PermissionTestFixture {
  toolName: string;
  toolInput: string;
  expectedPermission: 'deny' | 'ask' | 'allow';
  reason: string;
}

// Memory Store Test Data
interface MemoryTestFixture {
  key: string;
  value: any;
  expectedPersistence: boolean;
}

// Context Fork Test Data
interface ForkTestFixture {
  name: string;
  mergeResult: boolean;
  includeFields: string[];
  parentState: object;
  forkedChanges: object;
  expectedMergedState: object;
}
```

### 3.2 Test Data File Structure

```
tests/
├── fixtures/
│   ├── context-hierarchy/
│   │   ├── l1-plugin-config.json
│   │   │   {
│   │   │     "version": "1.4.2",
│   │   │     "pdca": { "matchRateThreshold": 90 },
│   │   │     "permissions": { "Write": "allow" }
│   │   │   }
│   │   ├── l2-user-config.json
│   │   │   {
│   │   │     "permissions": { "Bash(rm*)": "deny" },
│   │   │     "automation": { "intentDetection": true }
│   │   │   }
│   │   ├── l3-project-config.json
│   │   │   {
│   │   │     "pdca": { "matchRateThreshold": 85 },
│   │   │     "permissions": { "Write": "ask" }
│   │   │   }
│   │   └── merged-expected.json
│   │       {
│   │         "version": "1.4.2",
│   │         "pdca": { "matchRateThreshold": 85 },
│   │         "permissions": {
│   │           "Write": "ask",
│   │           "Bash(rm*)": "deny"
│   │         },
│   │         "automation": { "intentDetection": true },
│   │         "conflicts": [
│   │           { "key": "pdca.matchRateThreshold", "resolved": 85 },
│   │           { "key": "permissions.Write", "resolved": "ask" }
│   │         ]
│   │       }
│   │
│   ├── import-resolver/
│   │   ├── skill-with-imports.md
│   │   │   ---
│   │   │   name: test-skill
│   │   │   imports:
│   │   │     - ./shared-content.md
│   │   │     - ${PLUGIN_ROOT}/templates/shared/api-patterns.md
│   │   │   ---
│   │   │   # Skill Content
│   │   ├── circular-a.md
│   │   │   imports: [./circular-b.md]
│   │   ├── circular-b.md
│   │   │   imports: [./circular-a.md]
│   │   └── shared-content.md
│   │       # Shared API Patterns
│   │
│   ├── permission/
│   │   ├── scenarios.json
│   │   │   [
│   │   │     { "tool": "Write", "input": "/src/app.js", "expected": "allow" },
│   │   │     { "tool": "Bash", "input": "rm -rf /", "expected": "deny" },
│   │   │     { "tool": "Bash", "input": "rm file.txt", "expected": "ask" },
│   │   │     { "tool": "Bash", "input": "git push --force", "expected": "deny" }
│   │   │   ]
│   │
│   ├── context-fork/
│   │   ├── fork-merge-array.json
│   │   │   {
│   │   │     "parent": { "features": ["a", "b"] },
│   │   │     "forked": { "features": ["b", "c"] },
│   │   │     "expected": { "features": ["a", "b", "c"] }
│   │   │   }
│   │   └── fork-merge-object.json
│   │
│   └── memory/
│       ├── initial-state.json
│       └── persistence-test.json
```

---

## 4. Detailed Test Specifications

### 4.1 Unit Tests - lib/context-hierarchy.js

| Test ID | Function | Input | Expected Output | Edge Case |
|---------|----------|-------|-----------------|-----------|
| UT-CH-01 | loadContextLevel('plugin') | Valid bkit.config.json | { level: 'plugin', priority: 1, data: {...} } | - |
| UT-CH-02 | loadContextLevel('plugin') | Missing file | null | ✓ |
| UT-CH-03 | loadContextLevel('plugin') | Invalid JSON | null + debugLog | ✓ |
| UT-CH-04 | loadContextLevel('user') | Claude platform | ~/.claude/bkit/... | - |
| UT-CH-05 | loadContextLevel('user') | Gemini platform | ~/.gemini/bkit/... | - |
| UT-CH-06 | loadContextLevel('session') | Any | { level: 'session', source: 'memory' } | - |
| UT-CH-07 | getContextHierarchy() | All levels exist | Merged with conflicts array | - |
| UT-CH-08 | getContextHierarchy() | L2 missing | Merge L1+L3+L4 | ✓ |
| UT-CH-09 | getContextHierarchy() | Cache hit | Same object, no reload | - |
| UT-CH-10 | getContextHierarchy(true) | Force refresh | New load | - |
| UT-CH-11 | getHierarchicalConfig('pdca.threshold', 90) | Nested key exists | Value from merged | - |
| UT-CH-12 | getHierarchicalConfig('missing.key', 'default') | Key not found | 'default' | ✓ |
| UT-CH-13 | setSessionContext('key', value) | Valid key/value | Cache invalidated, value stored | - |
| UT-CH-14 | clearSessionContext() | Any | Empty session, cache invalidated | - |

**Implementation Details:**

```javascript
// tests/__tests__/unit/context-hierarchy.test.js

describe('lib/context-hierarchy.js', () => {
  describe('loadContextLevel()', () => {
    it('UT-CH-01: should load plugin level config', () => {
      // Setup: Mock fs.existsSync, fs.readFileSync
      // Act: loadContextLevel('plugin')
      // Assert: Returns valid ContextLevel object with priority 1
    });

    it('UT-CH-02: should return null when plugin config missing', () => {
      // Setup: fs.existsSync returns false
      // Act: loadContextLevel('plugin')
      // Assert: Returns null
    });

    it('UT-CH-03: should log error and return null for invalid JSON', () => {
      // Setup: fs.readFileSync returns invalid JSON
      // Act: loadContextLevel('plugin')
      // Assert: Returns null, debugLog called with error
    });
  });

  describe('getContextHierarchy()', () => {
    it('UT-CH-07: should merge all levels with correct priority', () => {
      // Setup: All 4 levels with conflicting values
      // Act: getContextHierarchy()
      // Assert:
      //   - L4 values override L3
      //   - L3 values override L2
      //   - L2 values override L1
      //   - conflicts array populated
    });

    it('UT-CH-09: should return cached result within TTL', () => {
      // Setup: Call getContextHierarchy() once
      // Act: Call again within 5 seconds
      // Assert: Same object reference, no file reads
    });
  });
});
```

### 4.2 Unit Tests - lib/import-resolver.js

| Test ID | Function | Input | Expected Output | Edge Case |
|---------|----------|-------|-----------------|-----------|
| UT-IR-01 | resolveVariables('${PLUGIN_ROOT}/x') | Valid variable | Absolute path | - |
| UT-IR-02 | resolveVariables('${PROJECT}/x') | Valid variable | Project path | - |
| UT-IR-03 | resolveVariables('${USER_CONFIG}/x') | Valid variable | User config path | - |
| UT-IR-04 | resolveVariables('${UNKNOWN}/x') | Unknown variable | String unchanged | ✓ |
| UT-IR-05 | resolveImportPath('./file.md', '/a/b/source.md') | Relative path | /a/b/file.md | - |
| UT-IR-06 | resolveImportPath('../file.md', '/a/b/source.md') | Parent path | /a/file.md | - |
| UT-IR-07 | detectCircularImport('/path') | First call | false | - |
| UT-IR-08 | detectCircularImport('/path') | After stack.add | true | ✓ |
| UT-IR-09 | loadImportedContent('/exists') | File exists | Content string | - |
| UT-IR-10 | loadImportedContent('/missing') | File missing | '' | ✓ |
| UT-IR-11 | loadImportedContent('/cached') | Within TTL | Cached content | - |
| UT-IR-12 | resolveImports({ imports: ['a', 'b'] }, src) | Valid imports | { content, errors: [] } | - |
| UT-IR-13 | resolveImports({ imports: [] }, src) | Empty imports | { content: '', errors: [] } | ✓ |
| UT-IR-14 | resolveImports(circular) | Circular reference | { errors: ['Circular...'] } | ✓ |
| UT-IR-15 | parseFrontmatter(content) | Valid YAML | { frontmatter, body } | - |
| UT-IR-16 | parseFrontmatter(no-yaml) | No frontmatter | { frontmatter: {}, body: content } | ✓ |

### 4.3 Unit Tests - lib/context-fork.js

| Test ID | Function | Input | Expected Output | Edge Case |
|---------|----------|-------|-----------------|-----------|
| UT-CF-01 | forkContext('skill', {}) | Valid name | { forkId, context } | - |
| UT-CF-02 | forkContext('skill', {}) | PDCA status exists | Deep cloned context | - |
| UT-CF-03 | forkContext('skill', { mergeResult: false }) | Merge disabled | mergeResult: false in fork | - |
| UT-CF-04 | getForkedContext(validId) | Valid fork ID | Forked context object | - |
| UT-CF-05 | getForkedContext('invalid') | Invalid ID | null | ✓ |
| UT-CF-06 | updateForkedContext(id, updates) | Valid updates | Context updated | - |
| UT-CF-07 | mergeForkedContext(id) | mergeResult: true | Merged to parent | - |
| UT-CF-08 | mergeForkedContext(id) | mergeResult: false | No merge, fork deleted | ✓ |
| UT-CF-09 | mergeForkedContext(id) | Array field | Deduplicated merge | - |
| UT-CF-10 | mergeForkedContext(id) | Object field | Deep merged | - |
| UT-CF-11 | discardFork(id) | Valid ID | Fork deleted | - |
| UT-CF-12 | getActiveForks() | Multiple forks | Array of fork info | - |
| UT-CF-13 | clearAllForks() | Multiple forks | All cleared | - |

**Critical Test: Deep Clone Isolation**

```javascript
describe('Context Isolation', () => {
  it('UT-CF-02: forked context modifications should not affect parent', () => {
    // Setup: Create PDCA status with nested objects
    const parentStatus = {
      features: { login: { phase: 'plan', matchRate: 80 } },
      activeFeatures: ['login']
    };
    mockGetPdcaStatusFull.mockReturnValue(parentStatus);

    // Act: Fork and modify
    const { forkId, context } = forkContext('test-agent');
    context.features.login.matchRate = 100;
    context.activeFeatures.push('logout');

    // Assert: Parent unchanged
    expect(parentStatus.features.login.matchRate).toBe(80);
    expect(parentStatus.activeFeatures).toEqual(['login']);
  });
});
```

### 4.4 Unit Tests - lib/permission-manager.js

| Test ID | Function | Input | Expected Output | Edge Case |
|---------|----------|-------|-----------------|-----------|
| UT-PM-01 | checkPermission('Write', 'path') | Default allow | 'allow' | - |
| UT-PM-02 | checkPermission('Bash', 'rm -rf /') | Pattern deny | 'deny' | - |
| UT-PM-03 | checkPermission('Bash', 'rm file.txt') | Pattern ask | 'ask' | - |
| UT-PM-04 | checkPermission('Bash', 'git push --force main') | Pattern deny | 'deny' | - |
| UT-PM-05 | checkPermission('Bash', 'git push origin main') | No pattern match | 'allow' | - |
| UT-PM-06 | checkPermission('Unknown', '') | Unknown tool | 'allow' | ✓ |
| UT-PM-07 | shouldBlock('Bash', 'rm -rf /') | Deny permission | { blocked: true, reason: '...' } | - |
| UT-PM-08 | shouldBlock('Write', 'file.js') | Allow permission | { blocked: false } | - |
| UT-PM-09 | requiresConfirmation('Bash', 'rm file') | Ask permission | { requiresConfirmation: true } | - |
| UT-PM-10 | getToolPermissions('Bash') | Tool with patterns | All Bash* permissions | - |
| UT-PM-11 | isMoreRestrictive('deny', 'allow') | Compare levels | true | - |
| UT-PM-12 | isMoreRestrictive('allow', 'deny') | Compare levels | false | - |

**Pattern Matching Test Suite:**

```javascript
describe('Permission Pattern Matching', () => {
  const testCases = [
    { tool: 'Bash', input: 'rm -rf /', pattern: 'Bash(rm -rf*)', expected: 'deny' },
    { tool: 'Bash', input: 'rm -r folder/', pattern: 'Bash(rm -r*)', expected: 'ask' },
    { tool: 'Bash', input: 'git push --force origin main', pattern: 'Bash(git push --force*)', expected: 'deny' },
    { tool: 'Bash', input: 'git reset --hard HEAD~1', pattern: 'Bash(git reset --hard*)', expected: 'ask' },
    { tool: 'Bash', input: 'npm install express', pattern: null, expected: 'allow' },
  ];

  testCases.forEach(({ tool, input, pattern, expected }) => {
    it(`should return ${expected} for ${tool}("${input}")`, () => {
      expect(checkPermission(tool, input)).toBe(expected);
    });
  });
});
```

### 4.5 Unit Tests - lib/memory-store.js

| Test ID | Function | Input | Expected Output | Edge Case |
|---------|----------|-------|-----------------|-----------|
| UT-MS-01 | setMemory('key', 'value') | Valid key/value | Stored and persisted | - |
| UT-MS-02 | getMemory('key', 'default') | Existing key | Stored value | - |
| UT-MS-03 | getMemory('missing', 'default') | Missing key | 'default' | ✓ |
| UT-MS-04 | deleteMemory('key') | Existing key | true, key removed | - |
| UT-MS-05 | deleteMemory('missing') | Missing key | false | ✓ |
| UT-MS-06 | hasMemory('key') | Existing key | true | - |
| UT-MS-07 | hasMemory('missing') | Missing key | false | - |
| UT-MS-08 | clearMemory() | Any | All cleared, file empty | - |
| UT-MS-09 | updateMemory({ a: 1, b: 2 }) | Multiple keys | All updated | - |
| UT-MS-10 | getMemoryPath() | Any | docs/.bkit-memory.json | - |

**Persistence Test:**

```javascript
describe('Memory Persistence', () => {
  it('UT-MS-PERSIST: should persist across process restarts', () => {
    // Phase 1: Set and verify file written
    setMemory('testKey', { nested: 'value' });
    const fileContent = fs.readFileSync(getMemoryPath(), 'utf8');
    expect(JSON.parse(fileContent).testKey).toEqual({ nested: 'value' });

    // Phase 2: Clear cache and reload
    invalidateCache();

    // Phase 3: Verify value restored
    expect(getMemory('testKey')).toEqual({ nested: 'value' });
  });
});
```

### 4.6 Unit Tests - scripts/user-prompt-handler.js

| Test ID | Function/Behavior | Input | Expected Output | Edge Case |
|---------|-------------------|-------|-----------------|-----------|
| UT-UPH-01 | Feature Intent Detection | "로그인 기능 만들어줘" | New feature: "로그인" | - |
| UT-UPH-02 | Feature Intent Detection | "버그 수정해줘" | No feature intent | - |
| UT-UPH-03 | Agent Trigger Detection | "코드 검증해줘" | Suggested: gap-detector | - |
| UT-UPH-04 | Agent Trigger Detection | "분석해줘" | Suggested: code-analyzer | - |
| UT-UPH-05 | Skill Trigger Detection | "API 설계" | Relevant: phase-4-api | - |
| UT-UPH-06 | Ambiguity Detection | "이거 고쳐줘" | Ambiguous (score >= 50) | ✓ |
| UT-UPH-07 | Ambiguity Detection | "src/app.js의 login 함수 수정" | Clear (score < 50) | - |
| UT-UPH-08 | Short prompt handling | "hi" | outputEmpty() | ✓ |
| UT-UPH-09 | Import resolution | Skill with imports | Skill imports resolved | - |

### 4.7 Unit Tests - lib/common.js (autoCreatePdcaTask)

| Test ID | Classification | Expected | Reason |
|---------|---------------|----------|--------|
| UT-ACT-01 | quick_fix | null (no task) | < 50 lines |
| UT-ACT-02 | minor_change | null (no task) | 50-200 lines |
| UT-ACT-03 | feature | Task created, blockedBy: [] | 200-1000 lines |
| UT-ACT-04 | major_feature | Task created, blockedBy: [prev phase] | > 1000 lines |
| UT-ACT-05 | feature + skipTask: true | null | Forced skip |
| UT-ACT-06 | major_feature, phase: 'plan' | blockedBy: [] | First phase |
| UT-ACT-07 | major_feature, phase: 'design' | blockedBy: ['[Plan] feature'] | Depends on plan |

---

## 5. Integration Tests

### 5.1 Session Start Integration (IT-01 ~ IT-03)

**Purpose**: hooks/session-start.js에서 FR-01/02/03/08 모듈 초기화 검증

```javascript
describe('Session Start Integration', () => {
  it('IT-01: should initialize all 4 context levels', async () => {
    // Setup: Create L1, L2, L3 config files
    // Act: Run session-start.js
    // Assert: getContextHierarchy() returns all levels merged
  });

  it('IT-02: should fallback gracefully when L2 missing', async () => {
    // Setup: Only L1 and L3 exist
    // Act: Run session-start.js
    // Assert: No error, L1+L3+L4 merged
  });

  it('IT-03: should initialize session context with platform info', async () => {
    // Act: Run session-start.js
    // Assert: getSessionContext('platform') === 'claude' or 'gemini'
    //         getSessionContext('sessionStartedAt') is valid ISO string
  });

  it('IT-03b: should increment memory session count', async () => {
    const before = getMemory('sessionCount', 0);
    // Act: Run session-start.js
    const after = getMemory('sessionCount');
    expect(after).toBe(before + 1);
  });

  it('IT-03c: should clear stale forks from previous session', async () => {
    // Setup: Create stale forks
    forkContext('stale-1');
    forkContext('stale-2');
    expect(getActiveForks()).toHaveLength(2);

    // Act: Run session-start.js

    // Assert: Forks cleared
    expect(getActiveForks()).toHaveLength(0);
  });
});
```

### 5.2 Import Directive Integration (IT-04 ~ IT-06)

**Purpose**: SKILL.md/Agent.md의 imports frontmatter 해석 검증

```javascript
describe('Import Directive Integration', () => {
  it('IT-04: should resolve SKILL.md imports at session start', async () => {
    // Setup: SKILL.md with imports: [./shared/patterns.md]
    // Act: Process skill file
    // Assert: Imported content merged
  });

  it('IT-05: should resolve Agent.md imports with variable substitution', async () => {
    // Setup: Agent.md with imports: [${PLUGIN_ROOT}/templates/shared/api-patterns.md]
    // Act: Process agent file
    // Assert: api-patterns.md content included
  });

  it('IT-06: should load actual shared context files', async () => {
    // Verify these exist and load correctly:
    const files = [
      'templates/shared/api-patterns.md',
      'templates/shared/error-handling-patterns.md',
      'templates/shared/naming-conventions.md'
    ];

    files.forEach(file => {
      const { content, errors } = processMarkdownWithImports(
        path.join(PLUGIN_ROOT, file)
      );
      expect(content).toBeTruthy();
      expect(errors).toHaveLength(0);
    });
  });
});
```

### 5.3 Permission Integration (IT-09 ~ IT-10)

**Purpose**: pre-write.js에서 권한 체크 동작 검증

```javascript
describe('Permission Integration', () => {
  it('IT-09: should block write when permission is deny', async () => {
    // Setup: bkit.config.json with permissions: { "Write(*.secret)": "deny" }
    // Act: Run pre-write.js with filePath = "config.secret"
    // Assert: outputBlock() called, exit code 2
  });

  it('IT-09b: should add context when permission is ask', async () => {
    // Setup: Default permissions
    // Act: Run pre-write.js with Bash input "rm -r folder"
    // Assert: contextParts includes confirmation message
  });

  it('IT-10: should merge permissions from hierarchy (L3 > L1)', async () => {
    // Setup:
    //   L1: { permissions: { Write: "allow" } }
    //   L3: { permissions: { Write: "ask" } }
    // Act: checkPermission('Write', 'file.js')
    // Assert: 'ask' (L3 wins)
  });
});
```

### 5.4 Context Fork Integration (IT-07 ~ IT-08)

**Purpose**: context: fork frontmatter Agent 실행 검증

```javascript
describe('Context Fork Integration', () => {
  it('IT-07: should create isolated fork for agents with context: fork', async () => {
    // Setup: gap-detector.md has context: fork
    // Simulate agent execution with PDCA modifications
    // Assert: Parent PDCA status unchanged
  });

  it('IT-07b: should not merge back when mergeResult: false', async () => {
    // design-validator.md has context: fork, mergeResult: false
    // Assert: No state changes after execution
  });
});
```

### 5.5 Hook Events Integration (IT-11 ~ IT-12)

**Purpose**: UserPromptSubmit 이벤트 발생 및 additionalContext 전달 검증

```javascript
describe('Hook Events Integration', () => {
  it('IT-11: should fire UserPromptSubmit hook for user input', async () => {
    // Mock stdin with user prompt
    const input = { prompt: '새로운 로그인 기능 만들어줘' };

    // Act: Run user-prompt-handler.js with input

    // Assert: Hook completes without error
  });

  it('IT-12: should pass detected context to additionalContext', async () => {
    // Input with feature intent
    const input = { prompt: '인증 시스템 구현해줘' };

    // Act: Run handler

    // Assert: Output includes feature detection context
  });
});
```

---

## 6. Regression Tests

### 6.1 Existing Hook Compatibility (RT-01 ~ RT-02)

| Test ID | Target | Verification |
|---------|--------|--------------|
| RT-01 | pre-write.js | Task classification still works |
| RT-01b | pre-write.js | PDCA document check still works |
| RT-01c | pre-write.js | Convention hints still work |
| RT-02 | pdca-post-write.js | Post-write PDCA update works |

### 6.2 PDCA Status Compatibility (RT-03)

```javascript
describe('PDCA Status Compatibility', () => {
  it('RT-03: should read v1.4.1 status file format', () => {
    // Setup: v1.4.1 format status file
    const v141Status = {
      version: '2.0',
      activeFeatures: ['login'],
      primaryFeature: 'login',
      features: {
        login: { phase: 'do', matchRate: 85 }
      }
    };

    // Act: getPdcaStatusFull()

    // Assert: All fields read correctly
  });

  it('RT-03b: should write compatible status format', () => {
    // Act: savePdcaStatus(status)
    // Assert: File format matches v1.4.1 schema
  });
});
```

### 6.3 Agent Trigger Compatibility (RT-04 ~ RT-05)

```javascript
describe('Agent Trigger Compatibility', () => {
  it('RT-04: should trigger gap-detector for "검증" keyword', () => {
    const result = matchImplicitAgentTrigger('이 코드 검증해줘');
    expect(result.agent).toBe('gap-detector');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('RT-05: should trigger pdca-iterator for "개선" keyword', () => {
    const result = matchImplicitAgentTrigger('자동으로 개선해줘');
    expect(result.agent).toBe('pdca-iterator');
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});
```

### 6.4 Multi-Language Intent Detection (RT-06)

```javascript
describe('Multi-Language Intent Detection', () => {
  const testCases = [
    { lang: 'EN', input: 'verify this code', agent: 'gap-detector' },
    { lang: 'KO', input: '코드 검증해줘', agent: 'gap-detector' },
    { lang: 'JA', input: 'コードを確認して', agent: 'gap-detector' },
    { lang: 'ZH', input: '验证代码', agent: 'gap-detector' },
    { lang: 'ES', input: 'verificar código', agent: 'gap-detector' },
    { lang: 'FR', input: 'vérifier le code', agent: 'gap-detector' },
    { lang: 'DE', input: 'Code überprüfen', agent: 'gap-detector' },
    { lang: 'IT', input: 'verificare il codice', agent: 'gap-detector' },
  ];

  testCases.forEach(({ lang, input, agent }) => {
    it(`RT-06-${lang}: should detect ${agent} in ${lang}`, () => {
      const result = matchImplicitAgentTrigger(input);
      expect(result.agent).toBe(agent);
    });
  });
});
```

---

## 7. E2E / Conversation Tests

### 7.1 Claude Code Real Session Tests

**Purpose**: 실제 Claude Code 세션에서 동작 검증

| Test ID | Scenario | Steps | Expected |
|---------|----------|-------|----------|
| E2E-CC-01 | Session Start | 1. Start new session | PDCA status loaded, memory count++ |
| E2E-CC-02 | Feature Intent | 1. Say "로그인 기능 구현해줘" | AskUserQuestion or /pdca-plan suggestion |
| E2E-CC-03 | Write Permission | 1. Try to write restricted file | Permission check message |
| E2E-CC-04 | Agent Trigger | 1. Say "검증해줘" | gap-detector agent suggested |
| E2E-CC-05 | Error Resilience | 1. Delete lib/context-hierarchy.js<br>2. Start session | Session starts with fallback |

### 7.2 Gemini CLI Parity Tests

| Test ID | Scenario | Steps | Expected |
|---------|----------|-------|----------|
| E2E-GC-01 | Session Start | Same as E2E-CC-01 | Same behavior |
| E2E-GC-02 | Platform Detection | Check BKIT_PLATFORM | 'gemini' |
| E2E-GC-03 | User Config Path | getUserConfigDir() | ~/.gemini/bkit/ |

---

## 8. Error Handling Tests

### 8.1 Graceful Degradation Tests

| Test ID | Scenario | Expected Behavior |
|---------|----------|-------------------|
| ERR-01 | context-hierarchy.js missing | Session starts, features disabled |
| ERR-02 | import-resolver.js missing | Imports skipped, no error |
| ERR-03 | permission-manager.js missing | All permissions default to allow |
| ERR-04 | memory-store.js missing | Session count not tracked |
| ERR-05 | Invalid bkit.config.json | Default config used |
| ERR-06 | Circular import detected | Error logged, import skipped |
| ERR-07 | Permission pattern regex error | Default to allow, log error |

### 8.2 Error Message Verification

```javascript
describe('Error Messages', () => {
  it('ERR-01: should log helpful message when module missing', () => {
    // Verify debugLog is called with:
    // - Module name
    // - Error type
    // - Suggested fix (if applicable)
  });
});
```

---

## 9. Test Implementation Guide

### 9.1 File Structure

```
tests/
├── __tests__/
│   ├── unit/
│   │   ├── context-hierarchy.test.js    # UT-CH-*
│   │   ├── import-resolver.test.js      # UT-IR-*
│   │   ├── context-fork.test.js         # UT-CF-*
│   │   ├── permission-manager.test.js   # UT-PM-*
│   │   ├── memory-store.test.js         # UT-MS-*
│   │   ├── user-prompt-handler.test.js  # UT-UPH-*
│   │   ├── auto-create-task.test.js     # UT-ACT-*
│   │   └── lazy-loading.test.js         # UT-LP-*
│   │
│   ├── integration/
│   │   ├── session-start.test.js        # IT-01 ~ IT-03
│   │   ├── import-directive.test.js     # IT-04 ~ IT-06
│   │   ├── context-fork.test.js         # IT-07 ~ IT-08
│   │   ├── permission.test.js           # IT-09 ~ IT-10
│   │   ├── hook-events.test.js          # IT-11 ~ IT-12
│   │   ├── task-system.test.js          # IT-13 ~ IT-14
│   │   └── memory.test.js               # IT-15 ~ IT-17
│   │
│   ├── regression/
│   │   ├── existing-hooks.test.js       # RT-01 ~ RT-02
│   │   ├── pdca-status.test.js          # RT-03
│   │   ├── agent-triggers.test.js       # RT-04 ~ RT-05
│   │   ├── intent-detection.test.js     # RT-06
│   │   └── backward-compat.test.js      # RT-07
│   │
│   └── e2e/
│       ├── claude-code.test.js          # E2E-CC-*
│       └── gemini-cli.test.js           # E2E-GC-*
│
├── fixtures/
│   └── (as defined in Section 3.2)
│
├── helpers/
│   ├── mockFactories.js
│   ├── fixtureLoaders.js
│   └── assertionHelpers.js
│
└── jest.config.js
```

### 9.2 Mock Factory Examples

```javascript
// tests/helpers/mockFactories.js

function createMockContextLevel(level, data = {}) {
  return {
    level,
    priority: LEVEL_PRIORITY[level],
    source: `mock-${level}-path`,
    data,
    loadedAt: new Date().toISOString()
  };
}

function createMockPdcaStatus(feature, phase = 'plan') {
  return {
    version: '2.0',
    activeFeatures: [feature],
    primaryFeature: feature,
    features: {
      [feature]: { phase, matchRate: 85 }
    }
  };
}

function createMockPermissions(overrides = {}) {
  return {
    Write: 'allow',
    Edit: 'allow',
    Bash: 'allow',
    'Bash(rm -rf*)': 'deny',
    ...overrides
  };
}
```

### 9.3 Jest Configuration

```javascript
// tests/jest.config.js

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.js'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '../lib/context-hierarchy.js',
    '../lib/import-resolver.js',
    '../lib/context-fork.js',
    '../lib/permission-manager.js',
    '../lib/memory-store.js',
    '../scripts/user-prompt-handler.js',
    '../scripts/context-compaction.js',
    '../lib/common.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/helpers/setup.js'],
  moduleNameMapper: {
    '^@lib/(.*)$': '<rootDir>/../lib/$1',
    '^@scripts/(.*)$': '<rootDir>/../scripts/$1',
    '^@fixtures/(.*)$': '<rootDir>/fixtures/$1'
  }
};
```

---

## 10. Implementation Order

### 10.1 Phase 1: Unit Tests (Priority: High)

```
Week 1:
├── Day 1-2: UT-CH-* (context-hierarchy.js) - 14 tests
├── Day 3-4: UT-IR-* (import-resolver.js) - 16 tests
├── Day 5: UT-CF-* (context-fork.js) - 13 tests

Week 2:
├── Day 1-2: UT-PM-* (permission-manager.js) - 12 tests
├── Day 3: UT-MS-* (memory-store.js) - 10 tests
├── Day 4: UT-UPH-* (user-prompt-handler.js) - 9 tests
├── Day 5: UT-ACT-* + UT-LP-* - 12 tests
```

### 10.2 Phase 2: Integration Tests (Priority: High)

```
Week 3:
├── Day 1: IT-01 ~ IT-03 (Session Start)
├── Day 2: IT-04 ~ IT-06 (Import Directive)
├── Day 3: IT-07 ~ IT-08 (Context Fork)
├── Day 4: IT-09 ~ IT-10 (Permission)
├── Day 5: IT-11 ~ IT-17 (Remaining)
```

### 10.3 Phase 3: Regression Tests (Priority: High)

```
Week 4:
├── Day 1-2: RT-01 ~ RT-03 (Hooks, PDCA)
├── Day 3: RT-04 ~ RT-05 (Agent Triggers)
├── Day 4: RT-06 (8 Language Detection)
├── Day 5: RT-07 (Backward Compat)
```

### 10.4 Phase 4: E2E Tests (Priority: Medium)

```
Week 5:
├── Day 1-2: E2E-CC-* (Claude Code)
├── Day 3: E2E-GC-* (Gemini CLI)
├── Day 4-5: Error handling tests
```

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|:------:|-------------|
| Unit Test Pass Rate | 100% | All UT-* pass |
| Integration Test Pass Rate | 100% | All IT-* pass |
| Regression Test Pass Rate | 100% | All RT-* pass |
| Code Coverage (lib/) | 90%+ | Jest coverage report |
| Code Coverage (scripts/) | 85%+ | Jest coverage report |
| E2E Test Pass Rate | 95%+ | All E2E-* pass |
| Test Execution Time | < 60s | CI pipeline metric |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial design from comprehensive analysis | AI Assistant |
