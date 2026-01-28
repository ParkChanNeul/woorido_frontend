# bkit Automation & Logic Enhancement Plan

> **Project**: bkit-claude-code
> **Target Version**: v1.4.0
> **Based on**: Analysis [20-bkit-plugin-auto-trigger](../03-analysis/20-bkit-plugin-auto-trigger-analysis.md), [30-gemini-cli-automation](../03-analysis/30-gemini-cli-automation-analysis.md)
> **Author**: POPUP STUDIO
> **Date**: 2026-01-24
> **Status**: Approved (Consolidated to v1.4.0)

---

## 1. Executive Summary

### 1.1 Purpose
This plan aims to evolve the **bkit** plugin from a "set of useful tools" into a **fully autonomous AI development partner** within the v1.4.0 release. Based on the analysis of current auto-trigger capabilities and Gemini CLI's hook system, we will implement mechanisms to enforce the **Automation First**, **No Guessing**, and **Docs=Code** philosophies more rigorously without user intervention.

### 1.2 Key Objectives
1.  **Automation First**: Eliminate the need for manual commands (e.g., `/pdca-plan`) by automatically triggering the Plan/Design phases upon detecting new feature requests.
2.  **No Guessing**: Implement a "Request Analyzer" to calculate ambiguity scores and force clarification questions before implementation.
3.  **Docs=Code**: Transition from qualitative gap analysis to **Quantitative Requirements Satisfaction** tracking (REQ-ID based).
4.  **Gemini Native**: Optimize hooks (`BeforeTool`, `AfterTool`) to leverage Gemini CLI's event-driven architecture for seamless PDCA cycles.

---

## 2. Strategic Pillars

### 2.1 Pillar 1: Proactive PDCA Cycle (Automation First)
**Current Gap**: Users must manually invoke `/pdca-plan` or `/pdca-design`.
**Solution**:
- Intercept the "intent" of a new feature request *before* any tool execution.
- Automatically propose or initiate the Plan/Design phase.
- **Implementation**: `Intent Detector` in `pre-write.js` or a new dedicated hook script.

### 2.2 Pillar 2: Ambiguity Guard (No Guessing)
**Current Gap**: Agents often make assumptions when requests are vague.
**Solution**:
- **Ambiguity Score**: Calculate a score (0-100) based on specific nouns, scope definition, and existing context conflicts.
- **Threshold**: If Score > 50, trigger `AskUserQuestion` tool instead of proceeding.
- **Implementation**: `lib/ambiguity-check.js` module.

### 2.3 Pillar 3: Quantifiable Quality (Docs=Code)
**Current Gap**: `gap-detector` provides a textual summary without structured metrics.
**Solution**:
- **Requirement IDs**: Auto-tag requirements in Plan/Design docs (e.g., `[FR-01]`).
- **Satisfaction Metric**: Calculate implementation rate (`Σ(Implemented REQs) / Total REQs`).
- **Auto-Act**: Automatically trigger `pdca-iterator` if satisfaction < 90%.

---

## 3. Detailed Implementation Plan (v1.4.0)

### 3.1 Core Modules Enhancement (`lib/`)

#### 3.1.1 `lib/request-analyzer.js` (New)
A logic module to analyze user input from `stdin` (captured via hooks).
- **Function**: `detectIntent(input)` → returns `'new_feature' | 'bug_fix' | 'refactor' | 'question'`
- **Function**: `calculateAmbiguity(input, context)` → returns `score` (0-100) and `missing_info[]`

#### 3.1.2 `lib/requirements-tracer.js` (New)
A module to parse markdown documents and extract structured requirements.
- **Input**: `docs/01-plan/*.md`, `docs/02-design/*.md`
- **Output**: JSON object mapping `REQ-ID` to `Implementation Status`.

### 3.2 Hooks & Scripts Refactoring (`scripts/`)

#### 3.2.1 `scripts/pre-write.js` (Major Update)
1.  **Ambiguity Check**: If `Ambiguity Score > Threshold`, abort tool use and output `AskUserQuestion` guidance.
2.  **Intent Detection**: If `Intent == 'new_feature'` AND `Plan/Design Doc == Missing`:
    - **Suggest**: "New feature detected. Shall we start with the Design phase? (Y/n)" via `AskUserQuestion`.

#### 3.2.2 `scripts/gap-detector-stop.js` (Update)
Integrate with `Requirements Tracer`.
- Parse the structured requirements list.
- If `Satisfaction < 90%`, automatically construct the prompt for `pdca-iterator`.

### 3.3 Agent Prompt Updates (`agents/`)

#### 3.3.1 `gap-detector.md`
- Update system prompt to output **Requirements Traceability Matrix** table.
- Instruct to verify each `[FR-xx]` item explicitly.

---

## 4. Roadmap (v1.4.0 Unified)

### Phase 1: Foundation & Logic
- [ ] Create `lib/request-analyzer.js`
- [ ] Update `lib/common.js` to expose analyzer functions
- [ ] Create `lib/requirements-tracer.js`

### Phase 2: Automation & Hooks
- [ ] Implement "Block & Ask" in `pre-write.js` for high ambiguity
- [ ] Implement "New Feature" interception: Trigger Design doc creation before coding
- [ ] Update `gap-detector` agent to use traceability matrix

### Phase 3: Templates & Reports
- [ ] Update `templates/plan.template.md` to include standardized `FR-ID` tables
- [ ] Finalize self-driving PDCA logic for v1.4.0 release

---

## 5. Technical Constraints & Risks

### 5.1 Gemini CLI Constraints
- **Stdout Pollution**: Hooks must strictly output JSON or clean text. Any debug logs must go to `stderr`.
- **Latency**: `request-analyzer` logic must be lightweight (<500ms).

### 5.2 Risk Mitigation
- **False Positives**: Add a "Force" override (e.g., `!force` in message) or adaptive thresholds.
- **Looping**: Hard limit of 3 auto-iterations in `pdca-iterator` logic.

---

## 6. Success Metrics

| Metric | Current | Target (v1.4.0) | Method |
|--------|:-------:|:-------------:|--------|
| **PDCA Adoption** | 50% (Manual) | 90% (Auto) | % of features with Plan/Design docs |
| **Ambiguity Handling** | 0% (Guess) | 80% (Ask) | % of vague requests triggering clarification |
| **Req Traceability** | 0% (Text) | 100% (ID) | % of FRs tracked in Gap Analysis |

---

## 7. Action Items (Immediate)

1.  **Scaffold Libraries**: Create `lib/request-analyzer.js` and `lib/requirements-tracer.js`.
2.  **Update Hook**: Revise `pre-write.js` with new logic.
3.  **Update Template**: Revise `plan.template.md` to strictly enforce `[FR-xx]` format.
