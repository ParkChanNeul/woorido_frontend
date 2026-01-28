# Context Engineering Enhancement v1.4.2 Design Document

> **Summary**: Claude Code Context Engineering 기능 강화를 위한 bkit 코드베이스 수정 상세 설계
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.2
> **Author**: AI Assistant
> **Date**: 2026-01-26
> **Status**: Draft
> **Planning Doc**: [context-engineering-enhancement.plan.md](../01-plan/features/context-engineering-enhancement.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- **FR-01**: Multi-Level Context Hierarchy (Plugin → User → Project → Session) 4단계 구현
- **FR-02**: @import Directive로 외부 컨텍스트 파일 모듈 로딩 지원
- **FR-03**: context: fork 옵션으로 Skill/Agent 독립 컨텍스트 실행
- **FR-04**: Hook Events 확장 (UserPrompt, Notification 이벤트)
- **FR-05**: Permission Hierarchy (deny → ask → allow) 3단계 권한 체계
- **FR-06**: Task Dependency Chain으로 PDCA 단계별 자동 blocking/dependency 설정
- **FR-07**: Context Compaction Hook으로 컨텍스트 압축 시 PDCA 상태 보존
- **FR-08**: MEMORY Variable로 세션 간 영속 데이터 저장

### 1.2 Design Principles

- **Backward Compatibility**: 기존 v1.4.1 기능 및 설정 100% 호환
- **Platform Parity**: Claude Code와 Gemini CLI 동일 기능 제공
- **Progressive Enhancement**: 각 FR은 독립적으로 동작 가능
- **Minimal Invasive**: lib/common.js 확장 중심, 기존 함수 시그니처 유지
- **Non-Blocking PDCA**: PDCA는 권장이지 강제가 아님, 사용자 작업 흐름 방해 금지

### 1.3 bkit 배포 구조

bkit은 **Claude Code 플러그인** 및 **Gemini CLI 익스텐션**으로 제공됩니다:

```
bkit 배포 구조
├── Claude Code용: hooks/hooks.json (플러그인)
│   └── PreToolUse, PostToolUse, SessionStart, Stop 이벤트
│
└── Gemini CLI용: gemini-extension.json + GEMINI.md (익스텐션)
    └── BeforeTool, AfterTool, SessionStart, AgentStop 이벤트
```

**중요**: 모든 새 기능은 양 플랫폼 호환성을 고려하여 설계해야 합니다.

---

## 2. Architecture

### 2.1 Current Architecture (v1.4.1)

```
┌─────────────────────────────────────────────────────────────────┐
│                    bkit v1.4.1 Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Skills     │───▶│   Agents     │───▶│   Scripts    │      │
│  │  (18)        │    │  (11)        │    │  (26)        │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    Hooks Layer                        │      │
│  │  SessionStart │ PreToolUse │ PostToolUse │ Stop       │      │
│  └──────────────────────────────────────────────────────┘      │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              lib/common.js (76+ functions)            │      │
│  │  • PDCA Status v2.0 (Single Level)                   │      │
│  │  • Intent Detection (8 Languages)                    │      │
│  │  • Ambiguity Detection                               │      │
│  │  • TTL Caching                                       │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Target Architecture (v1.4.2)

```
┌─────────────────────────────────────────────────────────────────┐
│                    bkit v1.4.2 Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Multi-Level Context Hierarchy (FR-01)          │  │
│  │  L1: Plugin Policy ──→ L2: User Config ──→ L3: Project   │  │
│  │                                  │                        │  │
│  │                                  ▼                        │  │
│  │                          L4: Session                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              @import Directive (FR-02)                    │  │
│  │  SKILL.md/Agent.md → resolveImports() → merged content   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Skills     │───▶│   Agents     │───▶│   Scripts    │      │
│  │  +context:   │    │  +context:   │    │  +26 modules │      │
│  │   fork/share │    │   fork/share │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Extended Hooks Layer (FR-04, FR-07)             │  │
│  │  SessionStart │ PreToolUse │ PostToolUse │ Stop          │  │
│  │  +UserPrompt  │ +Notification │ +ContextCompaction       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │       lib/common.js + lib/context-hierarchy.js           │  │
│  │                                                          │  │
│  │  • Multi-Level Context (FR-01)                          │  │
│  │  • Import Resolver (FR-02)                              │  │
│  │  • Context Fork (FR-03)                                 │  │
│  │  • Permission Hierarchy (FR-05)                         │  │
│  │  • Task Dependency Chain (FR-06)                        │  │
│  │  • Memory Variable (FR-08)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Component Dependencies

| Component | New Dependencies | Purpose |
|-----------|-----------------|---------|
| lib/context-hierarchy.js | lib/common.js | FR-01 Multi-Level Context 관리 |
| lib/import-resolver.js | lib/common.js | FR-02 @import 처리 |
| lib/context-fork.js | lib/common.js | FR-03 컨텍스트 격리 |
| lib/permission-manager.js | lib/common.js | FR-05 권한 관리 |
| lib/memory-store.js | lib/common.js | FR-08 영속 저장소 |
| hooks/hooks.json | (none) | FR-04 새 이벤트 등록 |
| scripts/context-compaction.js | lib/common.js | FR-07 압축 시 상태 보존 |

---

## 3. Detailed Design by Functional Requirement

### 3.1 FR-01: Multi-Level Context Hierarchy

#### 3.1.1 Data Model

```typescript
// lib/context-hierarchy.js

interface ContextLevel {
  level: 'plugin' | 'user' | 'project' | 'session';
  priority: 1 | 2 | 3 | 4;  // Higher = more specific, wins on conflict
  source: string;           // File path or 'memory'
  data: Record<string, any>;
  loadedAt: string;         // ISO timestamp
}

interface ContextHierarchy {
  levels: ContextLevel[];
  merged: Record<string, any>;  // Final merged result
  conflicts: Array<{
    key: string;
    values: { level: string; value: any }[];
    resolved: any;
  }>;
}
```

#### 3.1.2 Level Sources

| Level | Priority | Source Path | Platform |
|-------|----------|-------------|----------|
| L1: Plugin | 1 | `${PLUGIN_ROOT}/bkit.config.json` | Both |
| L2: User | 2 | `~/.claude/bkit/user-config.json` or `~/.gemini/bkit/user-config.json` | Platform-specific |
| L3: Project | 3 | `${PROJECT_DIR}/bkit.config.json` | Both |
| L4: Session | 4 | In-memory (from SessionStart hook) | Both |

#### 3.1.3 Implementation

**New file: `lib/context-hierarchy.js`**

```javascript
/**
 * Multi-Level Context Hierarchy (FR-01)
 * Manages 4-level context: Plugin → User → Project → Session
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { PLUGIN_ROOT, PROJECT_DIR, BKIT_PLATFORM, debugLog, _cache } = require('./common.js');

// Context level priorities (higher = more specific)
const LEVEL_PRIORITY = {
  plugin: 1,
  user: 2,
  project: 3,
  session: 4
};

// Session context (in-memory)
let _sessionContext = {};

/**
 * Get user config directory based on platform
 * @returns {string} User config path
 */
function getUserConfigDir() {
  const homeDir = os.homedir();
  if (BKIT_PLATFORM === 'gemini') {
    return path.join(homeDir, '.gemini', 'bkit');
  }
  return path.join(homeDir, '.claude', 'bkit');
}

/**
 * Load context from a specific level
 * @param {'plugin' | 'user' | 'project' | 'session'} level
 * @returns {ContextLevel | null}
 */
function loadContextLevel(level) {
  const now = new Date().toISOString();

  switch (level) {
    case 'plugin': {
      const pluginConfigPath = path.join(PLUGIN_ROOT, 'bkit.config.json');
      if (fs.existsSync(pluginConfigPath)) {
        try {
          return {
            level: 'plugin',
            priority: LEVEL_PRIORITY.plugin,
            source: pluginConfigPath,
            data: JSON.parse(fs.readFileSync(pluginConfigPath, 'utf8')),
            loadedAt: now
          };
        } catch (e) {
          debugLog('ContextHierarchy', 'Failed to load plugin config', { error: e.message });
        }
      }
      return null;
    }

    case 'user': {
      const userConfigPath = path.join(getUserConfigDir(), 'user-config.json');
      if (fs.existsSync(userConfigPath)) {
        try {
          return {
            level: 'user',
            priority: LEVEL_PRIORITY.user,
            source: userConfigPath,
            data: JSON.parse(fs.readFileSync(userConfigPath, 'utf8')),
            loadedAt: now
          };
        } catch (e) {
          debugLog('ContextHierarchy', 'Failed to load user config', { error: e.message });
        }
      }
      return null;
    }

    case 'project': {
      const projectConfigPath = path.join(PROJECT_DIR, 'bkit.config.json');
      if (fs.existsSync(projectConfigPath)) {
        try {
          return {
            level: 'project',
            priority: LEVEL_PRIORITY.project,
            source: projectConfigPath,
            data: JSON.parse(fs.readFileSync(projectConfigPath, 'utf8')),
            loadedAt: now
          };
        } catch (e) {
          debugLog('ContextHierarchy', 'Failed to load project config', { error: e.message });
        }
      }
      return null;
    }

    case 'session': {
      return {
        level: 'session',
        priority: LEVEL_PRIORITY.session,
        source: 'memory',
        data: _sessionContext,
        loadedAt: now
      };
    }

    default:
      return null;
  }
}

/**
 * Get full context hierarchy with merging
 * @param {boolean} forceRefresh - Skip cache
 * @returns {ContextHierarchy}
 */
function getContextHierarchy(forceRefresh = false) {
  // Check cache
  if (!forceRefresh) {
    const cached = _cache.get('context-hierarchy', 5000);
    if (cached) return cached;
  }

  const levels = [];
  const conflicts = [];

  // Load all levels
  for (const levelName of ['plugin', 'user', 'project', 'session']) {
    const level = loadContextLevel(levelName);
    if (level) {
      levels.push(level);
    }
  }

  // Sort by priority (ascending, so later ones override)
  levels.sort((a, b) => a.priority - b.priority);

  // Merge with conflict detection
  const merged = {};
  const keyHistory = {};  // Track which level set each key

  for (const level of levels) {
    for (const [key, value] of Object.entries(level.data)) {
      if (key in merged && JSON.stringify(merged[key]) !== JSON.stringify(value)) {
        // Conflict detected
        if (!keyHistory[key]) {
          keyHistory[key] = [];
        }
        keyHistory[key].push({ level: level.level, value: merged[key] });
        conflicts.push({
          key,
          values: [...keyHistory[key], { level: level.level, value }],
          resolved: value  // Higher priority wins
        });
      }
      merged[key] = value;
      keyHistory[key] = keyHistory[key] || [];
      keyHistory[key].push({ level: level.level, value });
    }
  }

  const result = { levels, merged, conflicts };

  // Cache result
  _cache.set('context-hierarchy', result);

  debugLog('ContextHierarchy', 'Hierarchy loaded', {
    levelCount: levels.length,
    conflictCount: conflicts.length
  });

  return result;
}

/**
 * Get merged config value with hierarchy
 * @param {string} keyPath - Dot-separated path (e.g., "pdca.matchRateThreshold")
 * @param {*} defaultValue - Default if not found
 * @returns {*}
 */
function getHierarchicalConfig(keyPath, defaultValue = null) {
  const hierarchy = getContextHierarchy();
  const keys = keyPath.split('.');
  let value = hierarchy.merged;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }

  return value ?? defaultValue;
}

/**
 * Set session-level context (in-memory)
 * @param {string} key - Config key
 * @param {*} value - Value to set
 */
function setSessionContext(key, value) {
  _sessionContext[key] = value;
  _cache.invalidate('context-hierarchy');
  debugLog('ContextHierarchy', 'Session context set', { key });
}

/**
 * Clear session context
 */
function clearSessionContext() {
  _sessionContext = {};
  _cache.invalidate('context-hierarchy');
}

module.exports = {
  getContextHierarchy,
  getHierarchicalConfig,
  loadContextLevel,
  setSessionContext,
  clearSessionContext,
  getUserConfigDir,
  LEVEL_PRIORITY
};
```

#### 3.1.4 Integration Points

| File | Modification | Purpose |
|------|-------------|---------|
| `lib/common.js` | `getConfig()` → call `getHierarchicalConfig()` | 기존 함수 호환성 유지하며 계층 적용 |
| `hooks/session-start.js` | Call `setSessionContext()` | 세션 레벨 컨텍스트 초기화 |
| `bkit.config.json` | Add to plugin root | L1 Plugin Policy 기본값 |

---

### 3.2 FR-02: @import Directive Support

#### 3.2.1 Syntax Definition

```yaml
# In SKILL.md or Agent.md frontmatter
---
name: my-skill
imports:
  - ./shared/api-patterns.md
  - ${PLUGIN_ROOT}/templates/error-handling.md
  - ${PROJECT}/conventions.md
---
```

**Supported Variables:**
- `${PLUGIN_ROOT}` → bkit plugin 설치 경로
- `${PROJECT}` → 현재 프로젝트 루트
- `${USER_CONFIG}` → 사용자 설정 디렉토리 (~/.claude/bkit/ 또는 ~/.gemini/bkit/)

#### 3.2.2 Implementation

**New file: `lib/import-resolver.js`**

```javascript
/**
 * @import Directive Resolver (FR-02)
 * Resolves and loads external context files from SKILL.md/Agent.md
 */

const fs = require('fs');
const path = require('path');
const { PLUGIN_ROOT, PROJECT_DIR, debugLog } = require('./common.js');
const { getUserConfigDir } = require('./context-hierarchy.js');

// Track imports to detect circular dependencies
const _importStack = new Set();

// TTL cache for resolved imports
const _importCache = new Map();
const IMPORT_CACHE_TTL = 30000;  // 30 seconds

/**
 * Resolve variable in import path
 * @param {string} importPath - Path with variables
 * @returns {string} Resolved path
 */
function resolveVariables(importPath) {
  return importPath
    .replace(/\$\{PLUGIN_ROOT\}/g, PLUGIN_ROOT)
    .replace(/\$\{PROJECT\}/g, PROJECT_DIR)
    .replace(/\$\{USER_CONFIG\}/g, getUserConfigDir());
}

/**
 * Resolve relative import path
 * @param {string} importPath - Import path
 * @param {string} fromFile - Source file path
 * @returns {string} Absolute path
 */
function resolveImportPath(importPath, fromFile) {
  // Resolve variables first
  let resolved = resolveVariables(importPath);

  // Handle relative paths
  if (resolved.startsWith('./') || resolved.startsWith('../')) {
    const fromDir = path.dirname(fromFile);
    resolved = path.resolve(fromDir, resolved);
  }

  return resolved;
}

/**
 * Load and cache imported content
 * @param {string} absolutePath - Absolute file path
 * @returns {string} File content or empty string
 */
function loadImportedContent(absolutePath) {
  // Check cache
  const cached = _importCache.get(absolutePath);
  if (cached && (Date.now() - cached.timestamp < IMPORT_CACHE_TTL)) {
    return cached.content;
  }

  try {
    if (!fs.existsSync(absolutePath)) {
      debugLog('ImportResolver', 'Import file not found', { path: absolutePath });
      return '';
    }

    const content = fs.readFileSync(absolutePath, 'utf8');

    // Cache the content
    _importCache.set(absolutePath, {
      content,
      timestamp: Date.now()
    });

    return content;
  } catch (e) {
    debugLog('ImportResolver', 'Failed to load import', { path: absolutePath, error: e.message });
    return '';
  }
}

/**
 * Detect circular import
 * @param {string} absolutePath - File to import
 * @returns {boolean} True if circular
 */
function detectCircularImport(absolutePath) {
  return _importStack.has(absolutePath);
}

/**
 * Resolve all imports in a frontmatter
 * @param {Object} frontmatter - Parsed YAML frontmatter
 * @param {string} sourceFile - Source file path
 * @returns {{ content: string, errors: string[] }}
 */
function resolveImports(frontmatter, sourceFile) {
  const imports = frontmatter.imports || [];
  const errors = [];
  const contents = [];

  if (!Array.isArray(imports) || imports.length === 0) {
    return { content: '', errors: [] };
  }

  debugLog('ImportResolver', 'Resolving imports', {
    sourceFile,
    importCount: imports.length
  });

  for (const importPath of imports) {
    const absolutePath = resolveImportPath(importPath, sourceFile);

    // Check for circular import
    if (detectCircularImport(absolutePath)) {
      errors.push(`Circular import detected: ${importPath}`);
      continue;
    }

    // Add to stack for circular detection
    _importStack.add(absolutePath);

    try {
      const content = loadImportedContent(absolutePath);
      if (content) {
        contents.push(`<!-- Imported from: ${importPath} -->\n${content}`);
      } else {
        errors.push(`Failed to load: ${importPath}`);
      }
    } finally {
      // Remove from stack
      _importStack.delete(absolutePath);
    }
  }

  return {
    content: contents.join('\n\n'),
    errors
  };
}

/**
 * Clear import cache
 */
function clearImportCache() {
  _importCache.clear();
}

module.exports = {
  resolveImports,
  resolveImportPath,
  resolveVariables,
  loadImportedContent,
  detectCircularImport,
  clearImportCache
};
```

#### 3.2.3 Integration Points

| File | Modification | Purpose |
|------|-------------|---------|
| Skills loader | Parse frontmatter → call `resolveImports()` | Skill 로딩 시 import 처리 |
| Agents loader | Parse frontmatter → call `resolveImports()` | Agent 로딩 시 import 처리 |

> **Note**: Claude Code/Gemini CLI 내부 로더를 직접 수정할 수 없으므로, Hook을 통해 추가 컨텍스트로 주입하는 방식 사용

---

### 3.3 FR-03: context: fork Skill Isolation

#### 3.3.1 Frontmatter Extension

```yaml
---
name: isolated-skill
context: fork      # NEW: 'fork' | 'shared' (default)
mergeResult: true  # NEW: merge result back to parent context
---
```

#### 3.3.2 Implementation

**New file: `lib/context-fork.js`**

```javascript
/**
 * Context Fork Isolation (FR-03)
 * Creates isolated context copies for skill/agent execution
 */

const { debugLog, getPdcaStatusFull, savePdcaStatus } = require('./common.js');

// Fork storage (in-memory)
const _forks = new Map();
let _forkIdCounter = 0;

/**
 * Create a forked context
 * @param {string} skillOrAgentName - Name of skill/agent
 * @param {Object} options - Fork options
 * @returns {{ forkId: string, context: Object }}
 */
function forkContext(skillOrAgentName, options = {}) {
  const forkId = `fork-${++_forkIdCounter}-${Date.now()}`;

  // Deep clone current PDCA status
  const currentStatus = getPdcaStatusFull(true);
  const forkedStatus = JSON.parse(JSON.stringify(currentStatus || {}));

  // Create fork metadata
  const fork = {
    id: forkId,
    name: skillOrAgentName,
    createdAt: new Date().toISOString(),
    parentState: currentStatus,
    forkedState: forkedStatus,
    mergeResult: options.mergeResult !== false,
    merged: false
  };

  _forks.set(forkId, fork);

  debugLog('ContextFork', 'Context forked', {
    forkId,
    skillOrAgentName,
    mergeResult: fork.mergeResult
  });

  return {
    forkId,
    context: forkedStatus
  };
}

/**
 * Get forked context by ID
 * @param {string} forkId - Fork ID
 * @returns {Object|null}
 */
function getForkedContext(forkId) {
  const fork = _forks.get(forkId);
  return fork ? fork.forkedState : null;
}

/**
 * Update forked context
 * @param {string} forkId - Fork ID
 * @param {Object} updates - Partial updates
 */
function updateForkedContext(forkId, updates) {
  const fork = _forks.get(forkId);
  if (!fork) {
    debugLog('ContextFork', 'Fork not found', { forkId });
    return;
  }

  Object.assign(fork.forkedState, updates);
}

/**
 * Merge forked context back to parent
 * @param {string} forkId - Fork ID
 * @param {Object} options - Merge options
 * @returns {{ success: boolean, merged: Object }}
 */
function mergeForkedContext(forkId, options = {}) {
  const fork = _forks.get(forkId);
  if (!fork) {
    return { success: false, error: 'Fork not found' };
  }

  if (!fork.mergeResult) {
    // Fork was created with mergeResult: false
    debugLog('ContextFork', 'Merge skipped (mergeResult: false)', { forkId });
    _forks.delete(forkId);
    return { success: true, merged: null };
  }

  // Strategy: merge specific fields from forked state
  const mergeFields = options.fields || ['features', 'history'];
  const currentStatus = getPdcaStatusFull(true);

  for (const field of mergeFields) {
    if (fork.forkedState[field]) {
      if (Array.isArray(fork.forkedState[field])) {
        // Merge arrays (deduplicate)
        currentStatus[field] = [
          ...new Set([
            ...(currentStatus[field] || []),
            ...fork.forkedState[field]
          ])
        ];
      } else if (typeof fork.forkedState[field] === 'object') {
        // Merge objects
        currentStatus[field] = {
          ...currentStatus[field],
          ...fork.forkedState[field]
        };
      } else {
        // Replace primitives
        currentStatus[field] = fork.forkedState[field];
      }
    }
  }

  // Save merged state
  savePdcaStatus(currentStatus);

  // Mark as merged and cleanup
  fork.merged = true;
  _forks.delete(forkId);

  debugLog('ContextFork', 'Context merged', {
    forkId,
    mergedFields: mergeFields
  });

  return { success: true, merged: currentStatus };
}

/**
 * Check if execution is in forked context
 * @param {string} forkId - Fork ID to check
 * @returns {boolean}
 */
function isForkedExecution(forkId) {
  return _forks.has(forkId);
}

/**
 * Discard forked context without merging
 * @param {string} forkId - Fork ID
 */
function discardFork(forkId) {
  _forks.delete(forkId);
  debugLog('ContextFork', 'Fork discarded', { forkId });
}

module.exports = {
  forkContext,
  getForkedContext,
  updateForkedContext,
  mergeForkedContext,
  isForkedExecution,
  discardFork
};
```

---

### 3.4 FR-04: Enhanced Hook Events

#### 3.4.1 New Events

| Event | Timing | Use Case |
|-------|--------|----------|
| `UserPrompt` | 사용자 입력 직후, 처리 전 | 입력 전처리, Intent Detection 트리거 |
| `Notification` | 시스템 알림 시점 | PDCA 단계 변경 알림, 자동 트리거 안내 |
| `ContextCompaction` | 컨텍스트 압축 직전 | PDCA 상태 보존 (FR-07) |

#### 3.4.2 hooks.json Modification

```json
{
  "$schema": "https://json.schemastore.org/claude-code-hooks.json",
  "description": "bkit Vibecoding Kit - Global hooks for PDCA workflow enforcement",
  "hooks": {
    "SessionStart": [
      {
        "once": true,
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.js",
            "timeout": 5000
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/pre-write.js",
            "timeout": 5000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/pdca-post-write.js",
            "timeout": 5000
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ${CLAUDE_PLUGIN_ROOT}/scripts/user-prompt-handler.js",
            "timeout": 3000
          }
        ]
      }
    ]
  }
}
```

#### 3.4.3 New Script: user-prompt-handler.js

```javascript
/**
 * user-prompt-handler.js - UserPromptSubmit Hook (FR-04)
 * Process user input before AI processing
 */

const {
  readStdinSync,
  debugLog,
  detectNewFeatureIntent,
  matchImplicitAgentTrigger,
  matchImplicitSkillTrigger,
  calculateAmbiguityScore,
  outputAllow,
  outputEmpty
} = require('../lib/common.js');

// Read user prompt from stdin
const input = readStdinSync();
const userPrompt = input.prompt || input.user_message || '';

debugLog('UserPrompt', 'Hook started', { promptLength: userPrompt.length });

if (!userPrompt || userPrompt.length < 3) {
  outputEmpty();
  process.exit(0);
}

const contextParts = [];

// 1. New Feature Intent Detection
const featureIntent = detectNewFeatureIntent(userPrompt);
if (featureIntent.isNewFeature && featureIntent.confidence > 0.8) {
  contextParts.push(`New feature detected: "${featureIntent.featureName}". Consider /pdca-plan first.`);
}

// 2. Implicit Agent Trigger
const agentTrigger = matchImplicitAgentTrigger(userPrompt);
if (agentTrigger && agentTrigger.confidence > 0.8) {
  contextParts.push(`Suggested agent: ${agentTrigger.agent}`);
}

// 3. Implicit Skill Trigger
const skillTrigger = matchImplicitSkillTrigger(userPrompt);
if (skillTrigger && skillTrigger.confidence > 0.75) {
  contextParts.push(`Relevant skill: ${skillTrigger.skill}`);
}

// 4. Ambiguity Detection
const ambiguity = calculateAmbiguityScore(userPrompt, {});
if (ambiguity.shouldClarify && !ambiguity.bypassed) {
  contextParts.push(`Request may be ambiguous (score: ${ambiguity.score}). Consider clarifying.`);
}

debugLog('UserPrompt', 'Hook completed', {
  hasFeatureIntent: featureIntent.isNewFeature,
  hasAgentTrigger: !!agentTrigger,
  hasSkillTrigger: !!skillTrigger,
  ambiguityScore: ambiguity.score
});

if (contextParts.length > 0) {
  outputAllow(contextParts.join(' | '), 'PreToolUse');
} else {
  outputEmpty();
}
```

---

### 3.5 FR-05: Permission Hierarchy

#### 3.5.1 Permission Schema

```json
{
  "permissions": {
    "Write": "allow",
    "Edit": "allow",
    "Bash": "ask",
    "Bash(rm -rf*)": "deny",
    "Bash(git push --force)": "deny",
    "Bash(git commit*)": "allow",
    "Bash(npm install*)": "ask"
  }
}
```

#### 3.5.2 Implementation

**New file: `lib/permission-manager.js`**

```javascript
/**
 * Permission Hierarchy Manager (FR-05)
 * Implements deny → ask → allow permission chain
 */

const { getHierarchicalConfig, debugLog } = require('./common.js');

/**
 * Permission levels
 */
const PERMISSION_LEVELS = {
  deny: 0,
  ask: 1,
  allow: 2
};

/**
 * Check permission for a tool
 * @param {string} toolName - Tool name (e.g., "Write", "Bash")
 * @param {string} toolInput - Tool input/command for pattern matching
 * @returns {'deny' | 'ask' | 'allow'}
 */
function checkPermission(toolName, toolInput = '') {
  const permissions = getHierarchicalConfig('permissions', {});

  // Check specific pattern first (most restrictive wins)
  const patterns = Object.keys(permissions).filter(p =>
    p.startsWith(`${toolName}(`) && p.endsWith(')')
  );

  for (const pattern of patterns) {
    // Extract pattern inside parentheses
    const regex = pattern.slice(toolName.length + 1, -1);
    const matcher = new RegExp(regex.replace('*', '.*'), 'i');

    if (matcher.test(toolInput)) {
      debugLog('Permission', 'Pattern matched', { pattern, toolInput });
      return permissions[pattern];
    }
  }

  // Check tool-level permission
  if (toolName in permissions) {
    return permissions[toolName];
  }

  // Default: allow
  return 'allow';
}

/**
 * Get all permissions for a tool
 * @param {string} toolName - Tool name
 * @returns {Object} Permission rules for the tool
 */
function getToolPermissions(toolName) {
  const permissions = getHierarchicalConfig('permissions', {});
  const toolPermissions = {};

  for (const [key, value] of Object.entries(permissions)) {
    if (key === toolName || key.startsWith(`${toolName}(`)) {
      toolPermissions[key] = value;
    }
  }

  return toolPermissions;
}

/**
 * Validate permission action
 * @param {string} permission - Permission string
 * @returns {boolean}
 */
function isValidPermission(permission) {
  return permission in PERMISSION_LEVELS;
}

module.exports = {
  checkPermission,
  getToolPermissions,
  isValidPermission,
  PERMISSION_LEVELS
};
```

#### 3.5.3 Integration with Pre-Write Hook

```javascript
// scripts/pre-write.js - Add permission check

const { checkPermission } = require('../lib/permission-manager.js');

// ... existing code ...

// Permission check (FR-05)
const permission = checkPermission('Write', filePath);
if (permission === 'deny') {
  outputBlock(`Write to ${filePath} is denied by permission policy.`);
  process.exit(2);
}

if (permission === 'ask') {
  contextParts.push(`Write to ${filePath} requires confirmation.`);
}

// ... rest of existing code ...
```

---

### 3.6 FR-06: Task Dependency Chain (권장, 비강제)

#### 3.6.1 핵심 원칙: PDCA는 권장이지 강제가 아님

**중요**: Task System의 `blockedBy`는 **의존성 추적용 메타데이터**입니다.
- 실제로 작업 실행을 **강제로 차단하지 않음**
- 순서와 상태를 **시각적으로 표현**하는 목적
- 사용자가 "그냥 수정해줘"라고 하면 **바로 실행 가능**

#### 3.6.2 Task Classification별 동작

| Task Classification | PDCA Level | Task 생성 | blockedBy |
|---------------------|------------|:---------:|:---------:|
| Quick Fix (typo 등) | None       | ❌ Skip   | N/A       |
| Minor Change        | Lite       | ❌ Skip   | N/A       |
| Feature             | Standard   | ✅ 생성   | 선택적    |
| Major Feature       | Strict     | ✅ 생성   | 자동 설정 |

**작은 수정 작업에는 Task를 생성하지 않습니다.**

#### 3.6.3 PDCA Phase Dependencies (Major Feature에만 적용)

```
[Plan] feature ───blockedBy───▶ (none - first phase)
                     │
                     ▼
[Design] feature ───blockedBy───▶ [Plan] feature
                     │
                     ▼
[Do] feature ───blockedBy───▶ [Design] feature
                     │
                     ▼
[Check] feature ───blockedBy───▶ [Do] feature
                     │
                     ▼ (if matchRate < 90%)
[Act] feature ───blockedBy───▶ [Check] feature

※ 위 다이어그램은 "권장 순서"이며, 강제 차단이 아님
※ blockedBy가 있어도 사용자 요청 시 즉시 실행 가능
```

#### 3.6.4 Implementation

**lib/common.js 수정 - `autoCreatePdcaTask()` 함수**

```javascript
/**
 * Auto-create PDCA Task with dependency chain (FR-06)
 * Task Classification에 따라 생성 여부 결정
 *
 * @param {string} feature - Feature name
 * @param {string} phase - PDCA phase
 * @param {Object} options - Additional options
 * @param {string} options.classification - 'quick_fix' | 'minor_change' | 'feature' | 'major_feature'
 * @param {boolean} options.skipTask - Task 생성 강제 스킵
 * @returns {Object|null} Task creation guidance or null if skipped
 */
function autoCreatePdcaTask(feature, phase, options = {}) {
  // Task Classification 기반 스킵 결정
  const classification = options.classification || 'feature';
  const skipLevels = ['quick_fix', 'minor_change'];

  // Quick Fix, Minor Change는 Task 생성 스킵
  if (skipLevels.includes(classification) || options.skipTask) {
    debugLog('TaskSystem', 'Task creation skipped (small change)', {
      classification,
      feature,
      phase
    });
    return null;  // Task 미생성
  }

  const subject = generatePdcaTaskSubject(phase, feature);
  const description = generatePdcaTaskDescription(phase, feature);
  const metadata = getPdcaTaskMetadata(phase, feature, options);

  // blockedBy는 Major Feature에서만 자동 설정
  let blockedBy = [];
  if (classification === 'major_feature') {
    const prevPhase = getPreviousPdcaPhase(phase);
    if (prevPhase) {
      blockedBy = [generatePdcaTaskSubject(prevPhase, feature)];
    }
  }

  const taskGuidance = {
    action: 'TaskCreate',
    subject,
    description,
    metadata,
    blockedBy,  // 빈 배열 또는 이전 단계
    activeForm: `${PDCA_PHASES[phase]?.emoji || ''} ${phase} phase for ${feature}`
  };

  debugLog('TaskSystem', 'Task guidance generated', {
    feature,
    phase,
    classification,
    hasBlocker: blockedBy.length > 0
  });

  return taskGuidance;
}

// Export
module.exports = {
  // ... existing exports ...
  autoCreatePdcaTask
};
```

#### 3.6.5 사용 예시

```javascript
// 1. 큰 기능 개발 - Task 생성 + blockedBy 자동 설정
autoCreatePdcaTask('auth-system', 'design', { classification: 'major_feature' });
// → Task 생성됨, blockedBy: ['[Plan] auth-system']

// 2. 일반 기능 - Task 생성, blockedBy 없음
autoCreatePdcaTask('add-button', 'do', { classification: 'feature' });
// → Task 생성됨, blockedBy: []

// 3. 작은 수정 - Task 미생성
autoCreatePdcaTask('fix-typo', 'do', { classification: 'quick_fix' });
// → null 반환, Task 생성 안 함

// 4. 강제 스킵
autoCreatePdcaTask('any-feature', 'plan', { skipTask: true });
// → null 반환, Task 생성 안 함
```

---

### 3.7 FR-07: Context Compaction Hook

#### 3.7.1 New Script: context-compaction.js

```javascript
/**
 * context-compaction.js - Context Compaction Hook (FR-07)
 * Preserves PDCA state before context compression
 */

const fs = require('fs');
const path = require('path');
const {
  readStdinSync,
  debugLog,
  getPdcaStatusFull,
  PROJECT_DIR
} = require('../lib/common.js');

// Read compaction event from stdin
const input = readStdinSync();

debugLog('ContextCompaction', 'Hook started', {
  reason: input.reason || 'unknown'
});

// Get current PDCA status
const pdcaStatus = getPdcaStatusFull(true);

if (pdcaStatus) {
  // Create compaction snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    reason: input.reason || 'compaction',
    status: pdcaStatus
  };

  // Save snapshot
  const snapshotDir = path.join(PROJECT_DIR, 'docs', '.pdca-snapshots');
  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true });
  }

  const snapshotPath = path.join(
    snapshotDir,
    `snapshot-${Date.now()}.json`
  );

  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));

  debugLog('ContextCompaction', 'Snapshot saved', { path: snapshotPath });

  // Output summary for context restoration
  const summary = {
    activeFeatures: pdcaStatus.activeFeatures || [],
    primaryFeature: pdcaStatus.primaryFeature,
    currentPhases: Object.entries(pdcaStatus.features || {}).map(([name, data]) => ({
      feature: name,
      phase: data.phase,
      matchRate: data.matchRate
    }))
  };

  console.log(JSON.stringify({
    hookSpecificOutput: {
      additionalContext: `PDCA State preserved. Active: ${summary.activeFeatures.join(', ') || 'none'}. Primary: ${summary.primaryFeature || 'none'}.`
    }
  }));
} else {
  console.log('{}');
}
```

---

### 3.8 FR-08: MEMORY Variable Support

#### 3.8.1 Implementation

**New file: `lib/memory-store.js`**

```javascript
/**
 * Memory Variable Store (FR-08)
 * Session-persistent storage for cross-session data
 */

const fs = require('fs');
const path = require('path');
const { PROJECT_DIR, debugLog } = require('./common.js');

const MEMORY_FILE = path.join(PROJECT_DIR, 'docs', '.bkit-memory.json');

// In-memory cache
let _memoryCache = null;

/**
 * Load memory from file
 * @returns {Object}
 */
function loadMemory() {
  if (_memoryCache !== null) {
    return _memoryCache;
  }

  try {
    if (fs.existsSync(MEMORY_FILE)) {
      _memoryCache = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
      return _memoryCache;
    }
  } catch (e) {
    debugLog('MemoryStore', 'Failed to load memory', { error: e.message });
  }

  _memoryCache = {};
  return _memoryCache;
}

/**
 * Save memory to file
 */
function saveMemory() {
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(_memoryCache, null, 2));
    debugLog('MemoryStore', 'Memory saved');
  } catch (e) {
    debugLog('MemoryStore', 'Failed to save memory', { error: e.message });
  }
}

/**
 * Get memory variable
 * @param {string} key - Variable key
 * @param {*} defaultValue - Default if not found
 * @returns {*}
 */
function getMemory(key, defaultValue = null) {
  const memory = loadMemory();
  return key in memory ? memory[key] : defaultValue;
}

/**
 * Set memory variable
 * @param {string} key - Variable key
 * @param {*} value - Value to store
 */
function setMemory(key, value) {
  loadMemory();
  _memoryCache[key] = value;
  saveMemory();
}

/**
 * Delete memory variable
 * @param {string} key - Variable key
 */
function deleteMemory(key) {
  loadMemory();
  delete _memoryCache[key];
  saveMemory();
}

/**
 * Get all memory variables
 * @returns {Object}
 */
function getAllMemory() {
  return loadMemory();
}

/**
 * Clear all memory
 */
function clearMemory() {
  _memoryCache = {};
  saveMemory();
}

module.exports = {
  getMemory,
  setMemory,
  deleteMemory,
  getAllMemory,
  clearMemory,
  MEMORY_FILE
};
```

---

## 4. File Modification Summary

### 4.1 New Files to Create

| File | Purpose | Priority |
|------|---------|----------|
| `lib/context-hierarchy.js` | FR-01 Multi-Level Context | P1 |
| `lib/import-resolver.js` | FR-02 @import Directive | P2 |
| `lib/context-fork.js` | FR-03 Context Fork | P3 |
| `lib/permission-manager.js` | FR-05 Permission Hierarchy | P5 |
| `lib/memory-store.js` | FR-08 Memory Variable | P6 |
| `scripts/user-prompt-handler.js` | FR-04 UserPrompt Hook | P4 |
| `scripts/context-compaction.js` | FR-07 Compaction Hook | P4 |
| `bkit.config.json` (plugin root) | L1 Plugin Policy defaults | P1 |

### 4.2 Files to Modify

| File | Modification | Priority |
|------|-------------|----------|
| `lib/common.js` | Add `autoCreatePdcaTask()`, integrate hierarchy | P1 |
| `hooks/hooks.json` | Add UserPromptSubmit event | P4 |
| `gemini-extension.json` | Add UserPrompt hook (if supported) | P4 |
| `hooks/session-start.js` | Initialize session context | P1 |
| `scripts/pre-write.js` | Add permission check | P5 |
| `bkit-system/README.md` | Document new features | All |
| `bkit-system/philosophy/context-engineering.md` | Add FR-01~08 sections | All |

### 4.3 Files Not Modified (Preserved)

| File | Reason |
|------|--------|
| All 11 Agent files | Description triggers sufficient |
| All 18 Skill files | hooks: frontmatter already extensible |
| All 12 Template files | No changes needed |
| 26 Scripts (except pre-write.js) | No changes needed |

---

## 5. Implementation Order

### Phase 1: Multi-Level Context (P1) - FR-01

1. Create `lib/context-hierarchy.js`
2. Create `bkit.config.json` in plugin root
3. Modify `lib/common.js` - integrate `getHierarchicalConfig()`
4. Modify `hooks/session-start.js` - initialize session context
5. Test: Verify 4-level loading and merge

### Phase 2: @import Directive (P2) - FR-02

1. Create `lib/import-resolver.js`
2. Integration via Hook (additionalContext injection)
3. Test: Verify import resolution and caching

### Phase 3: Context Fork (P3) - FR-03

1. Create `lib/context-fork.js`
2. Test: Verify fork/merge workflow

### Phase 4: Enhanced Hooks (P4) - FR-04, FR-07

1. Modify `hooks/hooks.json` - add UserPromptSubmit
2. Create `scripts/user-prompt-handler.js`
3. Create `scripts/context-compaction.js`
4. Test: Verify new events fire correctly

### Phase 5: Permission Hierarchy (P5) - FR-05

1. Create `lib/permission-manager.js`
2. Modify `scripts/pre-write.js` - add permission check
3. Test: Verify deny/ask/allow chain

### Phase 6: Task Dependency & Memory (P6) - FR-06, FR-08

1. Add `autoCreatePdcaTask()` to `lib/common.js`
2. Create `lib/memory-store.js`
3. Test: Verify task dependency chain and memory persistence

---

## 6. Test Plan

### 6.1 Unit Tests

| Module | Test Cases |
|--------|-----------|
| `lib/context-hierarchy.js` | L1-L4 loading, merge, conflict resolution |
| `lib/import-resolver.js` | Path resolution, circular detection, caching |
| `lib/context-fork.js` | Fork, update, merge, discard |
| `lib/permission-manager.js` | deny/ask/allow, pattern matching |
| `lib/memory-store.js` | get/set/delete, persistence |

### 6.2 Integration Tests

| Scenario | Expected |
|----------|----------|
| Session start with user config | L1+L2+L3 merged correctly |
| Skill with imports | Content injected to additionalContext |
| Pre-write with deny pattern | Exit code 2, blocked message |
| PDCA phase change | Task created with blockedBy |
| Context compaction | Snapshot created, state preserved |

### 6.3 Regression Tests

| Test | Verification |
|------|-------------|
| Existing hooks work | pre-write.js, pdca-post-write.js |
| PDCA status update | docs/.pdca-status.json format |
| Agent triggers | gap-detector, pdca-iterator |
| 8-language detection | EN, KO, JA, ZH, ES, FR, DE, IT |

---

## 7. Migration Strategy

### 7.1 Version Compatibility

| Old Setting | New Location | Auto-Migration |
|-------------|--------------|:--------------:|
| `bkit.config.json` (project) | L3: Project | ✅ Yes (no change) |
| N/A | L1: Plugin | ✅ New file created |
| N/A | L2: User | ✅ Optional, user creates |

### 7.2 Backward Compatibility

- `getConfig()` continues to work (internally calls `getHierarchicalConfig()`)
- Existing `hooks.json` events preserved
- All existing scripts/agents/skills unchanged
- PDCA Status v2.0 schema unchanged

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial design based on codebase analysis | AI Assistant |
