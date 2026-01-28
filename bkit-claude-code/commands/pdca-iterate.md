---
description: Run automatic Evaluator-Optimizer iteration cycle (반복 개선 / イテレーション / 迭代优化)
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Task", "LSP", "TodoWrite"]
---

# PDCA Iteration Execution

Receives feature name and options via $ARGUMENTS.

## Basic Usage

```bash
/pdca-iterate {feature}                    # Run full iteration cycle
/pdca-iterate {feature} --evaluator gap    # Gap analysis only
/pdca-iterate {feature} --evaluator quality # Quality analysis only
/pdca-iterate {feature} --full             # All evaluators
/pdca-iterate {feature} --max-iterations 7 # Custom iteration limit
/pdca-iterate {feature} --threshold 95     # Custom pass threshold
```

## Tasks Performed

### 1. Initial Assessment

```markdown
1. Load design document: docs/02-design/features/{feature}.design.md
2. Identify implementation paths: src/features/{feature}/, api/{feature}/
3. Determine applicable evaluators based on content
4. Set iteration parameters (max iterations, thresholds)
```

### 2. Evaluation Phase

```markdown
For each evaluator:
1. Run analysis (gap-detector, code-analyzer, qa-monitor)
2. Calculate score against criteria
3. Identify issues with severity levels
4. Generate improvement suggestions
```

### 3. Improvement Phase

```markdown
If evaluation fails:
1. Sort issues by priority (Critical > Warning > Info)
2. Select top N issues for this iteration
3. Apply fixes using Edit/Write tools
4. Record changes made
```

### 4. Re-evaluation Phase

```markdown
1. Re-run evaluators on modified code
2. Compare new scores with previous
3. Determine if criteria met or improvement made
4. Decide: continue, succeed, or fail
```

### 5. Report Generation

```markdown
1. Create iteration report: docs/03-analysis/{feature}.iteration-report.md
2. Include score progression, changes made, final status
3. Provide next step recommendations
```

### 6. Task System Integration (v1.3.1)

```markdown
1. Track iteration progress with Tasks:
   - Create Task: `[Act-1] {feature}` for first iteration
   - Update Task status on each iteration
   - Metadata: { pdcaPhase: "act", iteration: N, matchRate: XX }

2. Task Dependency:
   - blockedBy: [Check Task ID] (gap analysis must be done)
   - When match rate >= 90%: Mark Task as completed

3. Task Creation for Each Iteration:
   - `[Act-1] login` → iteration 1
   - `[Act-2] login` → iteration 2 (blockedBy: Act-1)
   - Continue until threshold met or max iterations
```

## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--evaluator` | Specific evaluator (gap/quality/functional/all) | all |
| `--max-iterations` | Maximum iteration count | 5 |
| `--threshold` | Pass threshold percentage | 90 |
| `--fix-limit` | Max issues to fix per iteration | 5 |
| `--dry-run` | Analyze only, no fixes applied | false |
| `--verbose` | Show detailed progress | false |

## Output Examples

### Iteration Progress

```
🔄 PDCA Iteration: login feature

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Iteration 1/5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Evaluation Results:
┌────────────────┬─────────┬────────┬────────┐
│ Evaluator      │ Score   │ Target │ Status │
├────────────────┼─────────┼────────┼────────┤
│ Gap Analysis   │ 72%     │ 90%    │ ❌     │
│ Code Quality   │ 85%     │ 80%    │ ✅     │
│ Functional     │ 90%     │ 90%    │ ✅     │
└────────────────┴─────────┴────────┴────────┘

Issues Found (3):
🔴 [Critical] Missing POST /auth/logout endpoint
🔴 [Critical] Response format mismatch in login
🟡 [Warning] Missing INVALID_CREDENTIALS error code

Applying fixes...
✏️ Created: src/api/auth/logout.ts
✏️ Modified: src/api/auth/login.ts
✏️ Modified: src/types/errors.ts

Re-evaluating...
```

### Success Output

```
✅ PDCA Iteration Complete: login feature

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Iteration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Progress:
┌───────────┬─────────┬─────────┬─────────┐
│ Iteration │ Gap %   │ Quality │ Func %  │
├───────────┼─────────┼─────────┼─────────┤
│ Initial   │ 72%     │ 85%     │ 90%     │
│ Iter 1    │ 85%     │ 87%     │ 92%     │
│ Iter 2    │ 93%     │ 90%     │ 95%     │
│ Final     │ 95%     │ 92%     │ 95%     │
└───────────┴─────────┴─────────┴─────────┘

Changes Made:
  📁 Created:  2 files
  📝 Modified: 5 files
  🧪 Tests:    3 updated

Report: docs/03-analysis/login.iteration-report.md

📝 Next Steps:
   1. Review changes: /pdca-analyze login
   2. Manual verification of critical paths
   3. Write completion report: /pdca-report login
```

### Failure Output

```
❌ PDCA Iteration Failed: login feature

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Maximum iterations reached
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Final Scores:
  Gap Analysis: 78% (target: 90%) ❌
  Code Quality: 88% (target: 80%) ✅

Remaining Issues (2):
🔴 [Critical] Cannot auto-fix: External API integration
🔴 [Critical] Requires design decision: Auth flow ambiguity

Report: docs/03-analysis/login.iteration-report.md

📝 Manual Action Required:
   1. Review unfixable issues in report
   2. Update design document if needed
   3. Re-run after manual fixes: /pdca-iterate login
```

## Evaluator Details

### Gap Evaluator (--evaluator gap)

```markdown
Checks:
- API endpoint match rate
- Data model field match rate
- Component structure match
- Error handling coverage

Uses: gap-detector agent
```

### Quality Evaluator (--evaluator quality)

```markdown
Checks:
- Security vulnerabilities
- Code complexity
- Duplicate code
- Naming conventions

Uses: code-analyzer agent
```

### Functional Evaluator (--evaluator functional)

```markdown
Checks:
- Error log presence
- Success log coverage
- Response time
- Exception handling

Uses: qa-monitor agent
```

## Integration with PDCA

```
/pdca-plan login      → Plan document created
/pdca-design login    → Design document created
... implementation ...
/pdca-iterate login   → Auto-fix issues ← THIS COMMAND
/pdca-analyze login   → Final verification
/pdca-report login    → Completion report
```

## Cautions

```markdown
⚠️ Iteration Limits:
   - Default max: 5 iterations
   - For critical systems: increase to 10

⚠️ Scope Control:
   - Always specify feature name
   - Avoid iterating entire codebase at once

⚠️ Review Required:
   - Auto-fixes may introduce new issues
   - Always review changes before committing
   - Use --dry-run first for large changes

⚠️ Design Dependency:
   - Cannot iterate without design document
   - Create design first: /pdca-design {feature}
```
