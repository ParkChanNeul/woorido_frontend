---
description: Generate Design phase document (feature design)
allowed-tools: ["Read", "Write", "Glob"]
---

# Design Document Generation

Receives feature name via $ARGUMENTS. (e.g., /pdca-design login)

## Tasks Performed

1. **Check Plan Document**
   - Verify docs/01-plan/features/{feature}.plan.md exists
   - If not, guide to create Plan first

2. **Check Existing Design**
   - Check if docs/02-design/features/{feature}.design.md exists
   - If exists, confirm whether to update

3. **Reference Plan Content**
   - Pull requirements, scope, etc. from Plan
   - Auto-reflect in design document

4. **Apply Template**
   - Use templates/design.template.md
   - Variable substitution and Plan linkage

5. **Generate Document**
   - Create docs/02-design/features/{feature}.design.md
   - Update _INDEX.md

6. **Task System Integration (v1.3.1)**
   - Create a Task for tracking: `TaskCreate` with subject `[Design] {feature}`
   - Set metadata: `{ pdcaPhase: "design", feature: "{feature}" }`
   - Set dependency: `blockedBy: [Plan Task ID]` (link to Plan Task)
   - Mark Plan Task as completed when starting Design

## Usage Examples

```
/pdca-design login          # Login feature design document
/pdca-design user-profile   # User profile feature design document
```

## Output Example

```
✅ Design document has been created!

📄 Generated File:
   docs/02-design/features/login.design.md

🔗 Linked Plan:
   docs/01-plan/features/login.plan.md

📝 Next Steps:
   1. Fill in the architecture, data model, and API specification sections
   2. Request implementation after design completion
   3. After implementation, analyze with /pdca-analyze login

📋 Task System:
   Task #1: [Plan] login → completed ✓
   Task #2: [Design] login → in_progress
   Metadata: { pdcaPhase: "design", feature: "login" }
   BlockedBy: Task #1

💡 Tip: Focus on "how" to implement in the design document.
        Completing design before coding improves efficiency.
```

## Auto-included Sections

Sections are automatically added based on level:

| Section | Starter | Dynamic | Enterprise |
|---------|---------|---------|------------|
| Architecture | ✅ | ✅ | ✅ |
| Data Model | Optional | ✅ | ✅ |
| API Specification | - | ✅ | ✅ |
| Infrastructure | - | - | ✅ |
| Security | - | Optional | ✅ |

## Cautions

- Warning when creating Design without Plan (Plan first recommended)
- Gap analysis becomes difficult without design documents before implementation
