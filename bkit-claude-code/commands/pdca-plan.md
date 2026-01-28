---
description: Generate Plan phase document (feature planning)
allowed-tools: ["Read", "Write", "Glob"]
---

# Plan Document Generation

Receives feature name via $ARGUMENTS. (e.g., /pdca-plan login)

## Tasks Performed

1. **Check Existing Documents**
   - Check if docs/01-plan/features/{feature}.plan.md exists
   - If exists, confirm whether to update

2. **Apply Template**
   - Use templates/plan.template.md
   - Variable substitution:
     - `{feature}` → $ARGUMENTS
     - `{date}` → Today's date
     - `{author}` → User (or blank)

3. **Generate Document**
   - Create docs/01-plan/features/{feature}.plan.md
   - Update _INDEX.md

4. **Task System Integration (v1.3.1)**
   - Create a Task for tracking: `TaskCreate` with subject `[Plan] {feature}`
   - Set metadata: `{ pdcaPhase: "plan", feature: "{feature}" }`
   - This Task will be referenced by Design Task (blockedBy)

5. **Guide Next Steps**

## Usage Examples

```
/pdca-plan login          # Login feature plan
/pdca-plan user-profile   # User profile feature plan
/pdca-plan checkout       # Checkout feature plan
```

## Output Example

```
✅ Plan document has been created!

📄 Generated File:
   docs/01-plan/features/login.plan.md

📝 Next Steps:
   1. Fill in the objectives, scope, and requirements sections of the plan
   2. After completion, proceed to design phase with /pdca-design login
   3. Or simply request "Design the login feature" for automatic progression

📋 Task Created:
   Task #1: [Plan] login
   Status: in_progress
   Metadata: { pdcaPhase: "plan", feature: "login" }

💡 Tip: Focus on "why" this feature is needed in the plan.
```

## Cautions

- Feature names should be in English kebab-case (login, user-profile)
- Don't overwrite if already exists
- If Design or implementation is requested without Plan, automatically create Plan first
