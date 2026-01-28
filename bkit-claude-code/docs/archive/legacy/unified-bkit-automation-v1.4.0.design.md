# Unified bkit Automation Enhancement Design v1.4.0

> **Summary**: The definitive design document merging architectural depth (Claude Code) with implementation pragmatism (Gemini CLI) for bkit v1.4.0.
> 
> **Project**: bkit-claude-code
> **Version**: 1.4.0
> **Target Platform**: Dual Support (Claude Code + Gemini CLI)
> **Author**: POPUP STUDIO (Unified Architect)
> **Date**: 2026-01-24
> **Status**: **FINAL**
> **Planning Doc**: [12-bkit-automation-enhancement-plan.md](../../01-plan/12-bkit-automation-enhancement-plan.md)

---

## 1. Executive Summary

### 1.1 Objective
To transform `bkit` from a passive toolset into an **Autonomous PDCA Partner**. This version enforces "Docs=Code" and "No Guessing" through rigid architectural controls while maintaining "Automation First" via intelligent intent detection.

### 1.2 The "Dual-Brain" Strategy
This design unifies two competing design philosophies:
*   **Architectural Robustness (Claude-style)**: Explicit data models (`PdcaStatusV2`), Platform Abstraction Layers (`emitUserPrompt`), and Multi-lingual regex support.
*   **Implementation Pragmatism (Gemini-style)**: Heuristic scoring algorithms, specific file parsing logic (`requirements-tracer`), and blocking hook strategies.

---

## 2. System Architecture

### 2.1 High-Level Component Diagram

```
[User Input] 
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                  Platform Abstraction Layer                  │
│  (lib/common.js: isGeminiCli, isClaudeCode, emitUserPrompt)  │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────┴───────────────────────────────┐
│                     Core Logic Engines                       │
│                                                              │
│  ┌───────────────────┐       ┌──────────────────────────┐    │
│  │ Request Analyzer  │       │   Requirements Tracer    │    │
│  │ (Intent/Ambiguity)│       │  (Docs=Code Verification)│    │
│  └─────────┬─────────┘       └────────────┬─────────────┘    │
│            │                              │                  │
└────────────┼──────────────────────────────┼──────────────────┘
             │                              │
             ▼                              ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│    Pre-Execution Hooks   │   │   Post-Execution Hooks   │
│ (pre-write, session-start)│   │ (gap-detector-stop, etc) │
└──────────────────────────┘   └──────────────────────────┘
```

### 2.2 Directory Structure (Refined)

```
bkit-claude-code/
├── lib/
│   ├── common.js              # [CORE] Platform abstraction, PDCA State V2
│   ├── request-analyzer.js    # [NEW] Hybrid Intent & Ambiguity Engine
│   └── requirements-tracer.js # [NEW] Markdown Table Parser & Scorer
│
├── hooks/
│   └── session-start.js       # [UPDATE] Onboarding with Ambiguity Check
│
├── scripts/
│   ├── pre-write.js           # [UPDATE] Blocking Logic for "No Design"
│   ├── gap-detector-stop.js   # [UPDATE] Quantitative Act Trigger
│   ├── iterator-stop.js       # [UPDATE] Auto-Recheck Logic
│   └── phase-transition.js    # [NEW] Pipeline Automation
│
├── templates/
│   └── plan.template.md       # [UPDATE] Enforced [REQ-ID] Schema
│
└── agents/
    └── gap-detector.md        # [UPDATE] Prompt for Structured Output
```

---

## 3. Data Model Design

### 3.1 PDCA Status Schema V2 (`docs/.pdca-status.json`)
Adopted from Claude's architecture to support multi-feature context and session history.

```typescript
interface PdcaStatusV2 {
  version: "2.0";
  lastUpdated: string; // ISO 8601

  // Context Management
  activeFeatures: string[];      // List of features currently being worked on
  primaryFeature: string | null; // The main feature in focus

  // Feature State
  features: {
    [featureName: string]: {
      phase: 'plan' | 'design' | 'do' | 'check' | 'act' | 'completed';
      matchRate: number | null;
      iterationCount: number;
      
      // [NEW] Quantitative Tracking
      requirements: Array<{ 
        id: string;       // "FR-001"
        status: 'fulfilled' | 'partial' | 'missing';
        trace: string;    // "src/auth.ts:45"
      }>;
      
      documents: {
        plan: string;
        design: string;
        analysis: string;
      };
    };
  };
}
```

---

## 4. Core Logic Design

### 4.1 `lib/request-analyzer.js` (The Brain)

Combines **Regex Patterns** (for broad intent) with **Heuristic Scoring** (for ambiguity).

**API Specification:**
```javascript
/**
 * Analyzes input to detect intent and ambiguity.
 * @param {string} input - User's natural language input.
 * @returns {AnalysisResult}
 */
function analyzeRequest(input) { ... }

interface AnalysisResult {
  intent: 'new_feature' | 'bug_fix' | 'refactor' | 'question' | 'unknown';
  featureName: string | null;
  ambiguityScore: number; // 0-100
  ambiguityReasons: string[]; // e.g., ["Missing Subject", "No Scope Defined"]
  implicitAgent: string | null; // e.g., "gap-detector" if user asks "Is this right?"
}
```

**Algorithm:**
1.  **Intent Detection**: Match against multi-lingual patterns (e.g., `/(create|make|build)\s+(.+)/i`, `/만들어/`).
2.  **Ambiguity Scoring**:
    *   Base Score: 0
    *   Length < 10 chars: +30 (Too short)
    *   No specific nouns (e.g., "it", "this"): +20
    *   No file extensions or paths mentioned: +10
    *   Conflict detection (checking existing files): +20 if conflict exists.
3.  **Implicit Trigger**: Regex match for agent personas (e.g., "check this" -> `gap-detector`).

### 4.2 `lib/requirements-tracer.js` (The Validator)

Parses markdown tables to enforce "Docs=Code".

**API Specification:**
```javascript
/**
 * Extracts requirements from Plan/Design docs.
 */
function getRequirements(docPath) {
  // Parses markdown AST/Regex to find tables with "ID" and "Requirement" headers.
  // Returns: [{ id: "FR-01", desc: "Login UI", priority: "High" }]
}

/**
 * Calculates fulfillment score based on Agent output.
 */
function calculateFulfillment(requirements, agentOutput) {
  // Parses Agent's output looking for "FR-01: [x]" or "FR-01: ✅"
  // Returns: { score: 85, missing: ["FR-03"] }
}
```

---

## 5. Hook Implementation Details

### 5.1 `scripts/pre-write.js` (The Gatekeeper)

**Logic Flow:**
1.  **Context Loading**: Read `common.js` configuration.
2.  **Input Analysis**: Run `request-analyzer.js` on the tool input/context.
3.  **Ambiguity Guard**:
    *   If `ambiguityScore > 50`: **BLOCK** execution.
    *   Return `AskUserQuestion` (via `emitUserPrompt` wrapper) asking to clarify scope.
4.  **Design Enforcement**:
    *   If `intent === 'new_feature'` AND `design_doc` does not exist:
    *   **BLOCK** execution.
    *   Return `AskUserQuestion`: "Design document missing. Create one? [Yes/No/Use Template]"

### 5.2 `scripts/gap-detector-stop.js` (The Loop Manager)

**Logic Flow:**
1.  **Trace**: Run `requirements-tracer.js` on the agent's output.
2.  **Update State**: Write result to `PdcaStatusV2`.
3.  **Decision**:
    *   If `score >= 90%`: Suggest `/pdca-report`.
    *   If `score < 90%`:
        *   Check `iterationCount` in status.
        *   If `< 5`: **Auto-Suggest** `/pdca-iterate` (Prompt: "Score is 75%. Fixing missing REQs: FR-03, FR-05...").
        *   If `>= 5`: Warn user "Max iterations reached. Manual review needed."

---

## 6. Platform Abstraction Strategy (`lib/common.js`)

To ensure 100% consistency between Claude and Gemini.

```javascript
/**
 * Standardizes output for the hosting platform.
 */
function emitUserPrompt({ question, options }) {
  if (isGeminiCli()) {
    // Gemini supports rich text interaction but not native UI widgets yet.
    // We format this as a structured text block that the User understands to reply to.
    return JSON.stringify({
      type: "ask_user", // Signal to Gemini model to stop and ask
      content: `${question}\nOptions: ${options.map(o => o.label).join(', ')}`
    });
  } else {
    // Claude Code supports the native AskUserQuestion tool
    return JSON.stringify({
      tool: "AskUserQuestion",
      params: { questions: [{ question, options, ... }] }
    });
  }
}

/**
 * Standardizes blocking behavior.
 */
function outputBlock(reason) {
  if (isGeminiCli()) {
    console.error(`[bkit] 🚫 ${reason}`);
    process.exit(1); // Standard CLI failure
  } else {
    console.log(JSON.stringify({ decision: "block", reason }));
    process.exit(0); // Claude Code hook convention
  }
}
```

---

## 7. Roadmap & Phasing (v1.4.0)

All features are consolidated into the v1.4.0 release.

| Step | Component | Description | 
| :--- | :--- | :--- |
| **1** | `lib/common.js` | Implement `PdcaStatusV2` and Platform Abstraction. |
| **2** | `lib/request-analyzer.js` | Implement Intent/Ambiguity logic. |
| **3** | `lib/requirements-tracer.js`| Implement Markdown table parser. |
| **4** | `scripts/pre-write.js` | Integrate Gatekeeper logic (Blocking/Asking). |
| **5** | `scripts/*-stop.js` | Integrate Loop Manager logic (Quantification). |
| **6** | Templates & Agents | Update `plan.template.md` and `gap-detector` prompt. |

---

## 8. Success Metrics (Quantitative)

1.  **Ambiguity Rejection Rate**: > 80% of vague requests (e.g., "fix it") are blocked and clarified.
2.  **Design Compliance**: 100% of new features have a Design Doc before implementation code is written.
3.  **Autonomous Iteration**: 80% of minor implementation gaps are resolved without manual `/pdca-iterate` commands.

```