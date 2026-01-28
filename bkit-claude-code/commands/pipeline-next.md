---
description: Guide to next Pipeline phase
---

# Pipeline Next Step

Analyzes the current Phase and guides the next task to be done.

## Execution Content

1. **Identify Current Phase**
   - Check in-progress Phase
   - Check completed/incomplete items within Phase

2. **Determine Next Task**
   - If current Phase is not complete: Guide remaining tasks
   - If current Phase is complete: Guide next Phase

3. **Provide Specific Guide**
   - Specific tasks to do next
   - Related template guidance
   - How to apply PDCA

## Output Format

### When Phase is In Progress
```
🔄 Current: Phase 4 - API Design/Implementation

Completed:
- [x] API Specification Writing (docs/02-design/api-spec.md)

Next Task:
→ Start API Implementation

Guide:
1. Implement API based on schema defined in Phase 1
2. Write code following conventions (Phase 2)
3. Run Zero Script QA after completion

Shall we start?
```

### After Phase Completion
```
✅ Phase 4 Complete!

Completed:
- [x] API Specification Writing
- [x] API Implementation
- [x] Zero Script QA

Next: Phase 5 - Design System

In Phase 5:
- Install shadcn/ui components
- Define design tokens
- Configure basic components

Shall we start Phase 5?
```

## Reference

- `skills/phase-*/`: Detailed guide per Phase
- `templates/pipeline/`: Templates per Phase
- `agents/pipeline-guide.md`: Guide agent
