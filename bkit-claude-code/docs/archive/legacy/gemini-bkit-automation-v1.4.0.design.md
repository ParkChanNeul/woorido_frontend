# bkit Automation Enhancement v1.4.0 Design Document

> **Summary**: Implementation design for "Automation First", "No Guessing", and "Docs=Code" enhancements.
>
> **Project**: bkit-claude-code
> **Version**: 1.4.0
> **Author**: POPUP STUDIO
> **Date**: 2026-01-24
> **Status**: Draft
> **Planning Doc**: [12-bkit-automation-enhancement-plan.md](../../01-plan/12-bkit-automation-enhancement-plan.md)

---

## 1. Overview

### 1.1 Design Goals
To evolve the bkit plugin into an autonomous development partner by implementing:
1.  **Proactive PDCA**: Automatically trigger Plan/Design phases for new features.
2.  **Ambiguity Guard**: Detect vague requests and force clarification.
3.  **Quantitative Quality**: Track requirement implementation rates using unique IDs.

### 1.2 Scope
- **Core Modules**: New `lib/request-analyzer.js` and `lib/requirements-tracer.js`.
- **Hooks**: Major refactoring of `pre-write.js` and `gap-detector-stop.js`.
- **Templates**: Standardized Requirement ID format in `plan.template.md`.
- **Agents**: Prompt updates for `gap-detector`.
- **Platform**: Support both Claude Code and Gemini CLI environments.

---

## 2. Architecture

### 2.1 Module Structure

```
bkit-claude-code/
├── lib/
│   ├── common.js              # Existing utilities (Level, PDCA Status)
│   ├── request-analyzer.js    # [NEW] Intent & Ambiguity detection logic
│   └── requirements-tracer.js # [NEW] Requirement parsing & tracing logic
│
├── scripts/
│   ├── pre-write.js           # [UPDATE] Integrate Request Analyzer
│   └── gap-detector-stop.js   # [UPDATE] Integrate Requirements Tracer
│
└── templates/
    └── plan.template.md       # [UPDATE] Add [REQ-ID] column
```

### 2.2 Data Flow

#### A. New Feature Request Flow (Automation First & No Guessing)
```
User Input ("Create login")
    │
    ▼
[Hook: pre-write.js]
    │
    ├── 1. Request Analyzer
    │      ├─ detectIntent() → "new_feature"
    │      └─ calculateAmbiguity() → Score: 80 (High)
    │
    ▼
[Decision]
    ├─ If Ambiguity > 50:
    │    BLOCK Tool Execution
    │    RETURN Error/Context: "Request too vague. Ask user for scope."
    │
    └─ If Intent == "new_feature" AND No Design Doc:
         BLOCK Tool Execution
         RETURN Context: "New feature detected. Suggest starting with /pdca-design."
```

#### B. Quality Check Flow (Docs=Code)
```
[Agent: gap-detector]
    │ Reads docs & code
    │ Outputs: Requirement Matrix (Text)
    ▼
[Hook: gap-detector-stop.js]
    │ Input: Agent Output
    │
    ├── 1. Requirements Tracer
    │      ├─ extractRequirements(planDoc)
    │      └─ parseImplementationStatus(agentOutput)
    │
    ▼
[Metric Calculation]
    │ Implementation Rate = (Matched REQs / Total REQs) * 100
    │
    ▼
[Decision]
    ├─ Rate < 90%: Suggest /pdca-iterate
    └─ Rate >= 90%: Suggest /pdca-report
```

---

## 3. Detailed Component Design

### 3.1 `lib/request-analyzer.js`

**Purpose**: Lightweight heuristic analysis of user input to determine intent and ambiguity. Must run fast (<50ms).

**API**:
```javascript
/**
 * Detect user intent from input string
 * @param {string} input - User's natural language request
 * @returns {'new_feature' | 'bug_fix' | 'refactor' | 'unknown'}
 */
function detectIntent(input) {}

/**
 * Calculate ambiguity score
 * @param {string} input - User's natural language request
 * @returns {Object} { score: number, reasons: string[] }
 * Score range: 0 (Clear) to 100 (Vague)
 */
function calculateAmbiguity(input) {}
```

**Logic (Heuristics)**:
- **Intent**:
    - `new_feature`: Keywords like "create", "add", "implement", "build".
    - `bug_fix`: "fix", "bug", "error", "issue", "crash".
- **Ambiguity**:
    - Score starts at 0.
    - **+20** if length < 15 chars (Too short).
    - **+30** if missing specific nouns (e.g., "it", "this", "something").
    - **+20** if subject is missing (e.g., "Fix broken").
    - **-30** if contains file extensions or paths (`.ts`, `src/`).
    - **-20** if contains specific technical terms (from glossary or known patterns).

### 3.2 `lib/requirements-tracer.js`

**Purpose**: Parse markdown tables to track requirement status.

**API**:
```javascript
/**
 * Extract requirements from Plan document
 * @param {string} filePath - Path to plan.md
 * @returns {Array<{id: string, description: string}>}
 */
function extractRequirements(filePath) {}

/**
 * Parse agent output for requirement status
 * @param {string} agentOutput - Output text from gap-detector
 * @returns {Map<string, 'implemented' | 'missing' | 'partial'>}
 */
function parseTraceabilityMatrix(agentOutput) {}
```

**Logic**:
- Look for Markdown tables with headers containing "ID" and "Requirement".
- Parse rows to extract `FR-xxx` or `REQ-xxx` IDs.
- In Agent output, look for lines/tables correlating IDs with status (✅, ❌, ⚠️).

### 3.3 Hook Updates

#### `scripts/pre-write.js`
**Modification**:
- Import `detectIntent` and `calculateAmbiguity`.
- **Before** existing file checks:
    - Get user's last message (if available in context/stdin) or infer from tool arguments if they contain natural language hints (unlikely for `write_file` but possible if we capture conversation history).
    - *Correction*: `pre-write.js` receives `write_file` arguments. It doesn't receive the user's prompt directly in standard MCP.
    - *Strategy Adjustment*: We will analyze the **Content being written** or the **File Path** for intent.
    - Wait, `hooks/session-start.js` can set global context, but per-turn user prompt capturing is hard in pure hooks without platform support.
    - **Gemini Specifics**: Gemini sends the *tool call*.
    - **Refined Strategy for Intent**:
        - If `file_path` is new (doesn't exist) AND path is in `features/` or `src/` -> Intent: `new_feature`.
        - If `file_path` exists -> Intent: `modification`.
    - **Refined Strategy for Ambiguity**:
        - We cannot easily judge user ambiguity from `write_file` args alone (code is precise).
        - **Alternative**: We assume the *Agent* has already resolved ambiguity if it is generating code.
        - **BUT**, we can enforce "Docs=Code":
            - If writing to `src/` (implementation) AND no corresponding `docs/02-design` exists:
            - **BLOCK**: "🚫 Violation: Docs=Code. No design document found for this feature. Please create design first."

#### `scripts/gap-detector-stop.js`
**Modification**:
- Read standard input (Agent Output).
- Use `parseTraceabilityMatrix`.
- Calculate score.
- Update `pdca-status.json` with the quantitative score.

---

## 4. Template Updates

### 4.1 `templates/plan.template.md`

Add a strict Requirements Table structure:

```markdown
## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | {Description} | High | Pending |
| FR-02 | {Description} | Medium | Pending |
```

---

## 5. Implementation Plan

### Phase 1: Libraries (Foundation)
1.  Implement `lib/request-analyzer.js` (focus on regex-based intent detection).
2.  Implement `lib/requirements-tracer.js` (markdown table parser).
3.  Unit tests for both.

### Phase 2: Hooks (Automation Logic)
1.  Update `pre-write.js` to import analyzer.
    - Logic: Check if target file is a source file. If NEW source file -> Check for Design Doc. If missing -> Block & Suggest Design.
2.  Update `gap-detector-stop.js` to import tracer.
    - Logic: Parse output, calculate %, output guidance.

### Phase 3: Integration
1.  Update `gap-detector` agent prompt to ensure it outputs the specific table format required by the tracer.
2.  Update `plan.template.md`.

---

## 6. Platform Compatibility

| Feature | Claude Code | Gemini CLI | Strategy |
|---------|-------------|------------|----------|
| **Blocking** | `{"decision": "block", ...}` | Exit 1 + Stderr | Use `outputBlock` wrapper in `common.js`. |
| **User Input**| `AskUserQuestion` tool | Text response | Return text prompting user to answer. |
| **Output** | JSON (hook specific) | Plain text/JSON | Use `outputAllow` wrapper in `common.js`. |

---

## 7. Risks & Mitigation

- **Risk**: Blocking valid rapid prototyping.
    - **Mitigation**: Add a "Magic Word" to bypass checks (e.g., if commit msg or comment says `!hotfix` or `!prototype`).
- **Risk**: Parser failure on loosely formatted markdown.
    - **Mitigation**: Make `requirements-tracer` robust (fuzzy matching for headers). Defaults to "Manual Verification Needed" if parsing fails.

---

## 8. Verification Plan

1.  **Test Case 1 (Automation)**:
    - Action: `write_file("src/features/login/auth.ts", ...)` without design doc.
    - Expected: Blocked. Message: "Design document missing for 'login'. Run /pdca-design login first."
2.  **Test Case 2 (Quantification)**:
    - Action: Run `gap-detector`. Agent outputs table with 1 check, 1 cross.
    - Expected: `gap-detector-stop.js` calculates 50%. Updates status. Suggests iterator.
