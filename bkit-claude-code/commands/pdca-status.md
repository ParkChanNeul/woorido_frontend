---
description: Check current PDCA progress status
allowed-tools: ["Read", "Glob", "Grep", "Write"]
---

# PDCA Status Dashboard

## Tasks Performed

1. **Check Status File**
   - Read `docs/.pdca-status.json` if exists
   - If not exists, scan docs/ folder and create status file

2. **Display Dashboard**
   - Summary statistics
   - Feature-by-feature status
   - Recent quick changes
   - Recommended next actions

3. **Auto-Update**
   - Update statistics counts
   - Update last_updated timestamp

## Status File Location

`docs/.pdca-status.json`

## Output Format

```
📊 PDCA Status Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Summary
• Total Features: {count}
• In Progress: {count}
• Completed: {count}
• Quick Changes: {count}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Feature Status

┌──────────────┬──────────┬────────────────────────┐
│ Feature      │ Status   │ Next Step              │
├──────────────┼──────────┼────────────────────────┤
│ login        │ 🔵 design │ Start implementation   │
│ payment      │ 🟡 plan   │ Create design doc      │
└──────────────┴──────────┴────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Recent Quick Changes (last 5)

┌────────────┬─────────────────────────────────┐
│ Date       │ Description                     │
├────────────┼─────────────────────────────────┤
│ 2026-01-15 │ Fixed typo in README            │
│ 2026-01-14 │ Updated button color            │
└────────────┴─────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Recommendation: {feature} is ready for next step.
   Run: /pdca-design {feature}
```

## Status Icons

| Status | Icon | Meaning |
|--------|------|---------|
| plan | 🟡 | Plan complete, needs design |
| design | 🔵 | Design complete, needs implementation |
| do | 🟢 | Implementation in progress |
| check | 🟣 | Analysis complete, needs improvement |
| act | 🟠 | Report complete |
| completed | ✅ | PDCA cycle complete |

## Status File Schema

```json
{
  "version": "1.0.0",
  "last_updated": "2026-01-15T10:30:00Z",
  "project_level": "dynamic",
  "features": {
    "feature-name": {
      "status": "plan|design|do|check|act|completed",
      "plan_doc": "docs/01-plan/features/feature.plan.md",
      "design_doc": "docs/02-design/features/feature.design.md",
      "analysis_doc": null,
      "report_doc": null,
      "created_at": "2026-01-10",
      "last_updated": "2026-01-14",
      "next_step": "Description of next step",
      "notes": "Optional notes"
    }
  },
  "quick_changes": [
    {
      "date": "2026-01-15",
      "desc": "Brief description",
      "type": "quick_fix|minor",
      "what": "What was changed",
      "why": "Why it was changed",
      "how": "How it was changed"
    }
  ],
  "statistics": {
    "total_features": 0,
    "completed": 0,
    "in_progress": 0,
    "quick_changes_count": 0
  }
}
```

## Migration for Existing Projects

If `docs/.pdca-status.json` doesn't exist:

1. Scan docs/ folder structure
2. Find existing plan/design/analysis/report documents
3. Extract feature names from file paths
4. Infer status from existing documents
5. Create initial .pdca-status.json
6. Ask user to confirm before saving

## Next Step Logic

| Current Status | Next Step Recommendation |
|----------------|--------------------------|
| plan | Create design doc with /pdca-design |
| design | Start implementation |
| do | Run gap analysis with /pdca-analyze |
| check | Create report with /pdca-report |
| act | Mark as completed or iterate |
