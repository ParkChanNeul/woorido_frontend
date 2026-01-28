# Scenario: Write Code

> How bkit behaves when user writes/modifies code (v1.2.1)

## Scenario Overview

```
User: "Modify login.ts file"
→ Claude uses Write/Edit tool
→ Multiple Hooks fire
→ Guidance provided to user
```

## Trigger Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User Request: "Modify login.ts"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Claude Prepares Write/Edit Tool Invocation                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. PreToolUse Hooks Execute (Unified Hook v1.2.0)               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [[../../skills/bkit-rules/SKILL|bkit-rules]] → pre-write.js     │   │
│  │ (Unified hook: PDCA + Task Classification + Convention) │   │
│  │                                                          │   │
│  │ 1. Source file detection (is_source_file - ext-based v1.2.1)│
│  │    • 20+ languages supported (.ts, .py, .go, .rs, .rb, etc.)│
│  │    • Exclude patterns: node_modules, __pycache__, .git, etc.│
│  │                                                          │   │
│  │ 2. Feature name extraction (extract_feature - multi-lang) │   │
│  │    • Next.js: features/, modules/                        │   │
│  │    • Go: internal/, cmd/                                 │   │
│  │    • Python: routers/, views/                            │   │
│  │                                                          │   │
│  │ 3. Design doc existence check                            │   │
│  │    • If exists: "Reference design doc" guidance          │   │
│  │    • If not: Empty output                                │   │
│  │                                                          │   │
│  │ 4. Task Classification (unified)                         │   │
│  │    • < 50 chars: Quick Fix                               │   │
│  │    • < 200 chars: Minor Change                           │   │
│  │    • < 1000 chars: Feature (PDCA recommended)            │   │
│  │    • >= 1000 chars: Major Feature (PDCA required)        │   │
│  │                                                          │   │
│  │ 5. Convention Hints (unified)                            │   │
│  │    • Coding convention guidance by file type             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Actual Write/Edit Execution                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. PostToolUse Hooks Execute                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [[../../skills/bkit-rules/SKILL|bkit-rules]] → pdca-post-write.js│   │
│  │ • If design doc exists: "/pdca-analyze recommended" guidance│
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ (If UI file - extension-based v1.2.1)                    │   │
│  │ Detected: .tsx, .jsx, .vue, .svelte (is_ui_file)        │   │
│  │                                                          │   │
│  │ [[../../skills/phase-5-design-system/SKILL|phase-5-design-system]]          │   │
│  │ → phase5-design-post.js                                  │   │
│  │ • Hardcoded color check                                  │   │
│  │ • Design token usage recommendation                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ (If UI file or pages/components/features path)           │   │
│  │ [[../../skills/phase-6-ui-integration/SKILL|phase-6-ui-integration]]         │   │
│  │ → phase6-ui-post.js                                      │   │
│  │ • UI layer separation verification                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Claude Synthesizes additionalContext and Guides User         │
└─────────────────────────────────────────────────────────────────┘
```

## Example: Modifying src/features/auth/login.ts

### Input

```
File: src/features/auth/login.ts
Changes: 50 lines added (approximately 1500 chars)
Design doc: docs/02-design/features/auth.design.md exists
```

### PreToolUse Result

**bkit-rules (pre-write.js - Unified Hook v1.2.0)**:
```
PDCA Notice: This file belongs to the 'auth' feature.

Design doc: docs/02-design/features/auth.design.md

Refer to the design document during implementation.
After completion, run /pdca-analyze auth for Gap Analysis.

---
Task Classification: Major Feature (1500 chars).
PDCA documentation is essential.

---
📏 Convention Check:
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case or PascalCase
```

> **Note (v1.2.0)**: Previous 3 hooks were unified into pre-write.js.
> **Note (v1.3.1)**: All scripts converted to Node.js (.js).

### PostToolUse Result

**bkit-rules (pdca-post-write.js)**:
```
Write completed: src/features/auth/login.ts

When implementation is finished, run /pdca-analyze auth to verify
design-implementation alignment.
```

**phase-6-ui-integration (phase6-ui-post.js)**:
```
🔍 UI Layer Check:
- Components should use hooks, not direct fetch
- Follow: Components → hooks → services → apiClient
- No business logic in UI components
```

---

## Trigger Differences by File (v1.2.1)

### Extension-Based Detection

| File Extension | Fired Hooks |
|----------------|-------------|
| `.tsx`, `.jsx` | pre-write (unified), pdca-post-write, phase-5-design, phase-6-ui |
| `.vue`, `.svelte` | pre-write (unified), pdca-post-write, phase-5-design, phase-6-ui |
| `.ts`, `.js` | pre-write (unified), pdca-post-write |
| `.py`, `.go`, `.rs` | pre-write (unified), pdca-post-write |
| `.md` | design-validator (if design document) |

### Path-Based Detection

| File Path | Additional Triggers |
|-----------|---------------------|
| `pages/`, `components/`, `features/` | phase-6-ui (layer verification) |
| `services/`, `api/`, `lib/` | phase-6-ui (service layer verification) |

### Exclude Patterns

> Customizable via `BKIT_EXCLUDE_PATTERNS` environment variable

| Pattern | Description |
|---------|-------------|
| `node_modules` | npm packages |
| `__pycache__`, `.venv` | Python cache/virtual environment |
| `.git`, `dist`, `build` | Build/version control |
| `target`, `.cargo` | Rust build |
| `vendor` | Go/Ruby dependencies |

---

## Test Checklist

- [ ] Verify PreToolUse (pre-write.js) fires on source file modification
- [ ] Verify PDCA guidance message when design doc exists
- [ ] Verify empty output when design doc doesn't exist
- [ ] Verify "Quick Fix" classification for changes under 50 chars
- [ ] Verify "Major Feature" classification for changes over 1000 chars
- [ ] Verify design token verification after .tsx/.jsx/.vue/.svelte file modification
- [ ] Verify layer separation verification after UI file modification
- [ ] Verify .py/.go/.rs files detected as source files
- [ ] Verify files in node_modules/, __pycache__/ are ignored

---

## Related Documents

- [[../triggers/trigger-matrix]] - Full trigger matrix
- [[../components/scripts/_scripts-overview]] - Script details
- [[scenario-new-feature]] - New feature request scenario
