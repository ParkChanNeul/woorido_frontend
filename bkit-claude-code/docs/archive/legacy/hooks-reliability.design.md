# Hooks Reliability Design Document

> **Summary**: bkit hooks 시스템의 신뢰성 개선 - 사용자가 bkit을 몰라도 자동 가이드되는 시스템 구현
>
> **Project**: bkit-claude-code
> **Version**: 1.4.0
> **Author**: AI Assistant
> **Date**: 2026-01-24
> **Status**: Draft
> **Planning Doc**: [hooks-reliability.plan.md](../01-plan/features/hooks-reliability.plan.md)

### Design Philosophy Reference

> **bkit-system 핵심 사상**: "사용자가 bkit 기능을 상세하게 모르더라도 hooks와 triggers를 통해 자동으로 가이드 받을 수 있어야 한다"
>
> - `bkit-system/philosophy/ai-native-principles.md`: AI가 개발 파트너로 작동
> - `bkit-system/triggers/trigger-matrix.md`: Hook Event Matrix
> - `bkit-system/triggers/priority-rules.md`: 충돌 해결 규칙

---

## 1. Overview

### 1.1 Design Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **자동 가이드** | 사용자가 명령어를 몰라도 적절한 시점에 안내 | 100% 트리거 발동 |
| **투명한 검증** | Hook 실행 여부를 확인할 수 있음 | Debug log 생성 |
| **상태 추적** | PDCA 진행 상태가 자동으로 기록됨 | status 파일 자동 업데이트 |
| **듀얼 플랫폼** | Claude Code + Gemini CLI 동일 동작 | 양 플랫폼 테스트 통과 |

### 1.2 Design Principles

- **Non-blocking**: Hook은 사용자를 막지 않고 가이드만 제공 (outputAllow)
- **Fail-safe**: Hook 실패 시에도 작업은 계속 진행
- **Observable**: 모든 Hook 실행이 로그로 확인 가능
- **Stateful**: PDCA 상태가 파일로 영속화되어 세션 간 유지

---

## 2. Architecture

### 2.1 Hook System Architecture (현재 vs 개선)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Current Architecture                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  hooks/hooks.json (Global)           agents/*.md (Agent-specific)        │
│  ┌─────────────────────┐             ┌─────────────────────┐            │
│  │ SessionStart ✅     │             │ Stop hooks          │            │
│  │ PreToolUse ✅       │             │ (실행 여부 불확실) ❓│            │
│  │ PostToolUse ✅      │             └─────────────────────┘            │
│  └─────────────────────┘                                                 │
│                                                                          │
│  문제: Agent Stop hooks 실행 여부 검증 불가, PDCA status 미관리          │
└─────────────────────────────────────────────────────────────────────────┘

                                    ↓ 개선

┌─────────────────────────────────────────────────────────────────────────┐
│                        Improved Architecture                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  hooks/hooks.json (Global)           agents/*.md (Agent-specific)        │
│  ┌─────────────────────┐             ┌─────────────────────┐            │
│  │ SessionStart ✅     │             │ Stop hooks ✅       │            │
│  │ PreToolUse ✅       │             │ + Debug logging     │            │
│  │ PostToolUse ✅      │             │ + Status update     │            │
│  └─────────────────────┘             └─────────────────────┘            │
│           │                                    │                         │
│           └──────────────┬─────────────────────┘                         │
│                          ▼                                               │
│              ┌─────────────────────┐                                     │
│              │ lib/common.js       │                                     │
│              │ + debugLog()        │                                     │
│              │ + updatePdcaStatus()│                                     │
│              │ + getPdcaStatus()   │                                     │
│              └─────────────────────┘                                     │
│                          │                                               │
│                          ▼                                               │
│              ┌─────────────────────┐                                     │
│              │ docs/.pdca-status   │                                     │
│              │ .json               │                                     │
│              │ (자동 생성/업데이트)│                                     │
│              └─────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Hook Execution Flow (개선)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Complete Hook Flow (v1.4.0)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SessionStart                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ session-start.js                                                 │    │
│  │ ├─ detectLevel() → BKIT_LEVEL 설정                               │    │
│  │ ├─ detectPdcaPhase() → BKIT_PDCA_PHASE 설정                      │    │
│  │ ├─ [NEW] initPdcaStatusIfNotExists() → status 파일 초기화        │    │
│  │ ├─ [NEW] debugLog("SessionStart executed")                       │    │
│  │ └─ AskUserQuestion 가이드 제공                                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  PreToolUse (Write|Edit)                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ pre-write.js                                                     │    │
│  │ ├─ Task classification (Quick Fix → Major Feature)               │    │
│  │ ├─ PDCA doc check                                                │    │
│  │ ├─ Convention hints                                              │    │
│  │ ├─ [NEW] debugLog("PreToolUse: {filePath}")                      │    │
│  │ └─ [NEW] updatePdcaStatus(feature, "do") if feature detected     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  [Tool Execution: Write/Edit]                                            │
│                              │                                           │
│                              ▼                                           │
│  PostToolUse (Write)                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ pdca-post-write.js                                               │    │
│  │ ├─ Suggest gap analysis                                          │    │
│  │ ├─ [NEW] debugLog("PostToolUse: {filePath}")                     │    │
│  │ └─ Output guidance                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                           │
│                              ▼                                           │
│  Agent Execution (gap-detector, pdca-iterator, etc.)                     │
│                              │                                           │
│                              ▼                                           │
│  Agent Stop Hook                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ gap-detector-stop.js / iterator-stop.js                          │    │
│  │ ├─ [NEW] debugLog("Agent Stop: {agentName}")                     │    │
│  │ ├─ Parse match rate from agent output                            │    │
│  │ ├─ [NEW] Extract feature name from context                       │    │
│  │ ├─ [NEW] updatePdcaStatus(feature, phase, {matchRate})           │    │
│  │ └─ Provide next step guidance                                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| All Hook Scripts | `lib/common.js` | Utility functions |
| `session-start.js` | `bkit.config.json` | Configuration |
| Stop Scripts | Agent stdout | Parse match rate |
| PDCA Status | `docs/.pdca-status.json` | State persistence |

---

## 3. Data Model

### 3.1 PDCA Status File Schema

```typescript
// docs/.pdca-status.json
interface PdcaStatus {
  version: "1.0";
  lastUpdated: string;  // ISO 8601 format

  // Global state
  currentFeature: string | null;
  currentPhase: number;  // 1-5 (Plan, Design, Do, Check, Act)

  // Per-feature tracking
  features: {
    [featureName: string]: FeatureStatus;
  };

  // Audit trail
  history: HistoryEntry[];
}

interface FeatureStatus {
  phase: "plan" | "design" | "do" | "check" | "act" | "completed";
  phaseNumber: number;

  // Document paths
  planDoc?: string;
  designDoc?: string;
  analysisDoc?: string;
  reportDoc?: string;

  // Metrics
  matchRate?: number;      // Last gap analysis result
  iterationCount?: number; // Number of Check-Act iterations

  // Timestamps
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface HistoryEntry {
  timestamp: string;
  feature: string;
  phase: string;
  action: "created" | "updated" | "completed" | "analyzed";
  details?: {
    matchRate?: number;
    iteration?: number;
    script?: string;
  };
}
```

### 3.2 Example Status File

```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-24T10:30:00Z",
  "currentFeature": "auth",
  "currentPhase": 4,
  "features": {
    "auth": {
      "phase": "check",
      "phaseNumber": 4,
      "planDoc": "docs/01-plan/features/auth.plan.md",
      "designDoc": "docs/02-design/features/auth.design.md",
      "matchRate": 85,
      "iterationCount": 1,
      "startedAt": "2026-01-24T09:00:00Z",
      "updatedAt": "2026-01-24T10:30:00Z"
    }
  },
  "history": [
    {
      "timestamp": "2026-01-24T09:00:00Z",
      "feature": "auth",
      "phase": "plan",
      "action": "created"
    },
    {
      "timestamp": "2026-01-24T09:30:00Z",
      "feature": "auth",
      "phase": "design",
      "action": "updated"
    },
    {
      "timestamp": "2026-01-24T10:00:00Z",
      "feature": "auth",
      "phase": "do",
      "action": "updated"
    },
    {
      "timestamp": "2026-01-24T10:30:00Z",
      "feature": "auth",
      "phase": "check",
      "action": "analyzed",
      "details": {
        "matchRate": 85,
        "script": "gap-detector-stop.js"
      }
    }
  ]
}
```

### 3.3 Debug Log Format

```
// /tmp/bkit-hook-debug.log (Claude Code)
// /tmp/bkit-hook-debug-gemini.log (Gemini CLI)

[2026-01-24T10:30:00.123Z] [SessionStart] Platform: claude, Level: Dynamic, Phase: 3
[2026-01-24T10:30:05.456Z] [PreToolUse] File: src/features/auth/login.ts, Feature: auth, Classification: feature
[2026-01-24T10:30:10.789Z] [PostToolUse] File: src/features/auth/login.ts, Guidance: gap analysis suggested
[2026-01-24T10:35:00.000Z] [Agent:gap-detector:Stop] Feature: auth, MatchRate: 85%, NextStep: pdca-iterate
[2026-01-24T10:40:00.000Z] [Agent:pdca-iterator:Stop] Feature: auth, Status: improved, MatchRate: 92%
```

---

## 4. API Specification (lib/common.js 추가 함수)

### 4.1 Debug Logging Functions

```typescript
/**
 * Debug log to temporary file
 * @param category - Log category (SessionStart, PreToolUse, etc.)
 * @param message - Log message
 * @param data - Optional structured data
 */
function debugLog(
  category: string,
  message: string,
  data?: Record<string, any>
): void;

/**
 * Get debug log file path based on platform
 * @returns Full path to debug log file
 */
function getDebugLogPath(): string;
```

### 4.2 PDCA Status Management Functions

```typescript
/**
 * Initialize PDCA status file if not exists
 * Creates docs/.pdca-status.json with default values
 */
function initPdcaStatusIfNotExists(): void;

/**
 * Get current PDCA status
 * @returns Full status object or null if not exists
 */
function getPdcaStatus(): PdcaStatus | null;

/**
 * Get status for specific feature
 * @param feature - Feature name
 * @returns Feature status or null
 */
function getFeatureStatus(feature: string): FeatureStatus | null;

/**
 * Update PDCA status for a feature
 * @param feature - Feature name
 * @param phase - PDCA phase (plan|design|do|check|act)
 * @param data - Additional data (matchRate, docPath, etc.)
 */
function updatePdcaStatus(
  feature: string,
  phase: string,
  data?: Partial<FeatureStatus>
): void;

/**
 * Add entry to PDCA history
 * @param entry - History entry to add
 */
function addPdcaHistory(entry: Omit<HistoryEntry, 'timestamp'>): void;

/**
 * Mark feature as completed
 * @param feature - Feature name
 */
function completePdcaFeature(feature: string): void;
```

### 4.3 Feature Extraction Enhancement

```typescript
/**
 * Extract feature name from multiple sources
 * Priority: 1) explicit param, 2) agent output, 3) file path, 4) current status
 * @param sources - Possible sources for feature name
 * @returns Feature name or empty string
 */
function extractFeatureFromContext(sources: {
  explicit?: string;
  agentOutput?: string;
  filePath?: string;
  currentStatus?: PdcaStatus;
}): string;
```

---

## 5. Component Design

### 5.1 Debug Logging Implementation

```javascript
// lib/common.js 추가

const DEBUG_LOG_PATHS = {
  claude: '/tmp/bkit-hook-debug.log',
  gemini: '/tmp/bkit-hook-debug-gemini.log',
  unknown: '/tmp/bkit-hook-debug.log'
};

/**
 * Debug log to temporary file
 */
function debugLog(category, message, data = {}) {
  try {
    const logPath = DEBUG_LOG_PATHS[BKIT_PLATFORM] || DEBUG_LOG_PATHS.unknown;
    const timestamp = new Date().toISOString();
    const dataStr = Object.keys(data).length > 0
      ? `, ${JSON.stringify(data)}`
      : '';
    const logLine = `[${timestamp}] [${category}] ${message}${dataStr}\n`;

    fs.appendFileSync(logPath, logLine);
  } catch (e) {
    // Fail silently - logging should never break the hook
  }
}

function getDebugLogPath() {
  return DEBUG_LOG_PATHS[BKIT_PLATFORM] || DEBUG_LOG_PATHS.unknown;
}
```

### 5.2 PDCA Status Management Implementation

```javascript
// lib/common.js 추가

const PDCA_STATUS_PATH = path.join(PROJECT_DIR, 'docs/.pdca-status.json');

/**
 * Initialize PDCA status file if not exists
 */
function initPdcaStatusIfNotExists() {
  if (fs.existsSync(PDCA_STATUS_PATH)) return;

  // Ensure docs directory exists
  const docsDir = path.dirname(PDCA_STATUS_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const initialStatus = {
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    currentFeature: null,
    currentPhase: 1,
    features: {},
    history: []
  };

  fs.writeFileSync(PDCA_STATUS_PATH, JSON.stringify(initialStatus, null, 2));
  debugLog('PDCA', 'Status file initialized', { path: PDCA_STATUS_PATH });
}

/**
 * Get current PDCA status
 */
function getPdcaStatus() {
  try {
    if (!fs.existsSync(PDCA_STATUS_PATH)) return null;
    return JSON.parse(fs.readFileSync(PDCA_STATUS_PATH, 'utf8'));
  } catch (e) {
    debugLog('PDCA', 'Failed to read status', { error: e.message });
    return null;
  }
}

/**
 * Update PDCA status for a feature
 */
function updatePdcaStatus(feature, phase, data = {}) {
  try {
    initPdcaStatusIfNotExists();

    const status = getPdcaStatus() || {
      version: "1.0",
      features: {},
      history: []
    };

    const phaseNumber = PDCA_PHASES[phase.toLowerCase()]?.order || 3;
    const now = new Date().toISOString();

    // Update or create feature status
    if (!status.features[feature]) {
      status.features[feature] = {
        phase: phase.toLowerCase(),
        phaseNumber,
        startedAt: now,
        updatedAt: now,
        ...data
      };
    } else {
      status.features[feature] = {
        ...status.features[feature],
        phase: phase.toLowerCase(),
        phaseNumber,
        updatedAt: now,
        ...data
      };
    }

    // Update global state
    status.currentFeature = feature;
    status.currentPhase = phaseNumber;
    status.lastUpdated = now;

    // Add history entry
    status.history.push({
      timestamp: now,
      feature,
      phase: phase.toLowerCase(),
      action: data.matchRate ? 'analyzed' : 'updated',
      details: data.matchRate ? { matchRate: data.matchRate } : undefined
    });

    // Keep history to last 100 entries
    if (status.history.length > 100) {
      status.history = status.history.slice(-100);
    }

    fs.writeFileSync(PDCA_STATUS_PATH, JSON.stringify(status, null, 2));
    debugLog('PDCA', `Status updated: ${feature} → ${phase}`, data);

  } catch (e) {
    debugLog('PDCA', 'Failed to update status', { error: e.message });
  }
}
```

### 5.3 Agent Stop Hook Enhancement

```javascript
// scripts/gap-detector-stop.js 수정

#!/usr/bin/env node
const {
  readStdinSync,
  outputAllow,
  debugLog,
  updatePdcaStatus,
  extractFeatureFromContext,
  getPdcaStatus
} = require('../lib/common.js');

// Log execution start
debugLog('Agent:gap-detector:Stop', 'Hook started');

// Read agent output from stdin
const input = readStdinSync();
const inputText = typeof input === 'string' ? input : JSON.stringify(input);

// Extract match rate
const matchRatePattern = /(Overall|Match Rate|매치율|일치율|Design Match)[^0-9]*(\d+)/i;
const match = inputText.match(matchRatePattern);
const matchRate = match ? parseInt(match[2], 10) : 0;

// Extract feature name from multiple sources
const featurePattern = /feature[:\s]+['"]?(\w+)['"]?/i;
const featureMatch = inputText.match(featurePattern);
const currentStatus = getPdcaStatus();

const feature = extractFeatureFromContext({
  agentOutput: featureMatch ? featureMatch[1] : null,
  currentStatus
});

// Log extracted data
debugLog('Agent:gap-detector:Stop', 'Data extracted', {
  matchRate,
  feature,
  inputLength: inputText.length
});

// Update PDCA status
if (feature) {
  updatePdcaStatus(feature, 'check', { matchRate });
}

// Generate guidance based on match rate
let guidance = '';
let nextStep = '';

if (matchRate >= 90) {
  guidance = `✅ Gap Analysis 완료: ${matchRate}% 매치\n\n설계-구현이 잘 일치합니다.\n\n다음 단계:\n1. /pdca-report ${feature || ''} 로 완료 보고서 생성\n2. Archive 진행 가능`;
  nextStep = 'pdca-report';
} else if (matchRate >= 70) {
  guidance = `⚠️ Gap Analysis 완료: ${matchRate}% 매치\n\n일부 차이가 있습니다.\n\n1. **수동 수정**: 직접 차이점 수정\n2. **/pdca-iterate ${feature || ''}**: 자동 개선 실행 (권장)`;
  nextStep = 'pdca-iterate';
} else {
  guidance = `🔴 Gap Analysis 완료: ${matchRate}% 매치\n\n설계-구현 차이가 큽니다.\n\n권장: /pdca-iterate ${feature || ''} 실행`;
  nextStep = 'pdca-iterate';
}

// Log completion
debugLog('Agent:gap-detector:Stop', 'Hook completed', {
  matchRate,
  feature,
  nextStep
});

outputAllow(guidance);
```

---

## 6. Trigger Points for Auto-Guide

### 6.1 자동 가이드 트리거 매트릭스

사용자가 bkit을 모르더라도 다음 시점에 자동 가이드:

| 시점 | 트리거 | 가이드 내용 | 스크립트 |
|------|--------|-------------|----------|
| **세션 시작** | SessionStart | 4가지 시작 옵션 제시 | `session-start.js` |
| **코드 작성 시도** | PreToolUse (Write/Edit) | PDCA 단계 안내, Design doc 권장 | `pre-write.js` |
| **코드 작성 완료** | PostToolUse (Write) | Gap analysis 권장 | `pdca-post-write.js` |
| **Gap 분석 완료** | Agent Stop | Match rate 기반 다음 단계 | `gap-detector-stop.js` |
| **자동 개선 완료** | Agent Stop | 완료 여부 판단, 보고서 권장 | `iterator-stop.js` |

### 6.2 Keyword-Based Auto-Trigger (기존 유지)

`bkit-system/triggers/trigger-matrix.md` 기반:

| 사용자 키워드 | 자동 호출 Agent | 가이드 |
|--------------|----------------|--------|
| "검증", "verify" | gap-detector | 설계-구현 비교 |
| "개선", "fix" | pdca-iterator | 자동 수정 루프 |
| "보고서", "report" | report-generator | 완료 보고서 |
| "QA", "테스트" | qa-monitor | Docker 로그 분석 |

### 6.3 PDCA Status 기반 Context-Aware Guide

```javascript
// session-start.js에서 status 기반 가이드 생성

const status = getPdcaStatus();

if (status?.currentFeature) {
  const feature = status.features[status.currentFeature];

  switch (feature.phase) {
    case 'plan':
      guide = `📋 '${status.currentFeature}' Plan 작성 중. /pdca-design으로 Design 진행`;
      break;
    case 'design':
      guide = `📐 '${status.currentFeature}' Design 완료. 구현을 시작하세요.`;
      break;
    case 'do':
      guide = `🔨 '${status.currentFeature}' 구현 중. 완료 후 /pdca-analyze 실행`;
      break;
    case 'check':
      if (feature.matchRate >= 90) {
        guide = `✅ '${status.currentFeature}' ${feature.matchRate}% 매치. /pdca-report로 완료`;
      } else {
        guide = `⚠️ '${status.currentFeature}' ${feature.matchRate}% 매치. /pdca-iterate 권장`;
      }
      break;
    case 'act':
      guide = `🔄 '${status.currentFeature}' 개선 중. 반복 ${feature.iterationCount || 1}회`;
      break;
  }
}
```

---

## 7. Test Plan

### 7.1 Agent Stop Hook 검증 테스트

```bash
# test-scripts/verify-agent-stop-hooks.sh

#!/bin/bash
echo "=== Agent Stop Hook Verification ==="

# 1. Clear debug log
rm -f /tmp/bkit-hook-debug.log

# 2. Simulate gap-detector agent completion
echo '{"match_rate": 85, "feature": "auth"}' | \
  node scripts/gap-detector-stop.js

# 3. Check debug log
echo "--- Debug Log ---"
cat /tmp/bkit-hook-debug.log

# 4. Check PDCA status
echo "--- PDCA Status ---"
cat docs/.pdca-status.json | jq '.features.auth'

# 5. Verify
if grep -q "Agent:gap-detector:Stop" /tmp/bkit-hook-debug.log; then
  echo "✅ Stop hook executed successfully"
else
  echo "❌ Stop hook NOT executed"
fi
```

### 7.2 PDCA Status 자동 업데이트 테스트

| Test Case | Action | Expected Result |
|-----------|--------|-----------------|
| TC-01 | SessionStart 실행 | status 파일 초기화 (없으면 생성) |
| TC-02 | `/pdca-design auth` 실행 | `auth.phase = "design"` |
| TC-03 | `src/features/auth/login.ts` Write | `auth.phase = "do"` |
| TC-04 | `/pdca-analyze auth` 완료 (85%) | `auth.phase = "check"`, `auth.matchRate = 85` |
| TC-05 | `/pdca-iterate auth` 완료 (92%) | `auth.matchRate = 92` |
| TC-06 | `/pdca-report auth` 실행 | `auth.phase = "completed"` |

### 7.3 듀얼 플랫폼 테스트

| Platform | Test | Expected |
|----------|------|----------|
| Claude Code | Debug log path | `/tmp/bkit-hook-debug.log` |
| Gemini CLI | Debug log path | `/tmp/bkit-hook-debug-gemini.log` |
| Claude Code | JSON output | `{"decision": "allow", ...}` |
| Gemini CLI | Text output | ANSI colored text |

---

## 8. Implementation Order

### Phase 1: Debug Logging (Day 1)

```
1. lib/common.js에 debugLog() 함수 추가
2. 모든 hook 스크립트에 debug logging 추가:
   - session-start.js
   - pre-write.js
   - pdca-post-write.js
   - gap-detector-stop.js
   - iterator-stop.js
3. 테스트: 각 hook 실행 후 log 확인
```

### Phase 2: Agent Stop Hook 검증 (Day 1-2)

```
1. test-scripts/verify-agent-stop-hooks.js 작성
2. 실제 Agent 실행하여 Stop hook 트리거 확인
3. 안 되면 대안 검토:
   - PostToolUse에서 Task tool 완료 감지
   - Agent 내부에서 직접 스크립트 호출
```

### Phase 3: PDCA Status Management (Day 2-3)

```
1. lib/common.js에 status 관리 함수 추가
2. session-start.js에서 status 초기화
3. pre-write.js에서 "do" phase 업데이트
4. gap-detector-stop.js에서 "check" phase + matchRate 업데이트
5. iterator-stop.js에서 반복 카운트 업데이트
```

### Phase 4: Integration & Testing (Day 3-4)

```
1. 전체 PDCA 사이클 테스트
2. Claude Code + Gemini CLI 듀얼 테스트
3. 문서 업데이트 (bkit-system/triggers/trigger-matrix.md)
```

---

## 9. Files to Modify

| File | Changes |
|------|---------|
| `lib/common.js` | debugLog, PDCA status 함수 추가 |
| `hooks/session-start.js` | debugLog 추가, status 초기화 |
| `scripts/pre-write.js` | debugLog 추가, "do" status 업데이트 |
| `scripts/pdca-post-write.js` | debugLog 추가 |
| `scripts/gap-detector-stop.js` | debugLog, feature 추출, status 업데이트 |
| `scripts/iterator-stop.js` | debugLog, status 업데이트 |
| `bkit-system/triggers/trigger-matrix.md` | 새 hook flow 문서화 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-24 | Initial design draft | AI Assistant |
