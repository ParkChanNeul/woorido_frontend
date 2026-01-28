---
description: Generate Act phase document (completion report)
allowed-tools: ["Read", "Write", "Glob"]
---

# Completion Report Generation

Receives feature name via $ARGUMENTS. (e.g., /pdca-report login)

## Tasks Performed

1. **Collect Related Documents**
   - docs/01-plan/features/{feature}.plan.md
   - docs/02-design/features/{feature}.design.md
   - docs/03-analysis/{feature}.analysis.md

2. **Organize Completed Items**
   - Plan requirements vs actual implementation
   - Classify as completed/incomplete/cancelled

3. **Summarize Quality Metrics**
   - Final match rate
   - Resolved issues
   - Test coverage

4. **Prepare Retrospective Section**
   - Keep (what went well) - Auto-suggest
   - Problem (areas for improvement) - Extract from analysis
   - Try (things to try) - Recommendations

5. **Generate Report**
   - docs/04-report/features/{feature}.report.md
   - Update _INDEX.md and changelog.md

## Usage Examples

```
/pdca-report login           # Login feature completion report
/pdca-report login --draft   # Generate draft only (manual editing needed)
```

## Output Example

```
📊 Completion Report Generated: login

┌─────────────────────────────────────────────┐
│  PDCA Cycle Complete                         │
├─────────────────────────────────────────────┤
│  Feature: Login                              │
│  Cycle: #1                                   │
│  Period: 2024-12-01 ~ 2024-12-15            │
│  Completion Rate: 95%                        │
└─────────────────────────────────────────────┘

📋 Summary:
   - Completed: 19/20 items
   - Incomplete: 1 item (carried over to next cycle)

📄 Generated File:
   docs/04-report/features/login.report.md

📝 Content to Add to Report:
   1. Write retrospective section (Keep/Problem/Try)
   2. Review next cycle plan
   3. Share with team

🎉 PDCA cycle has been completed!
   To start next feature, use /pdca-plan [feature-name]
```

## Auto-generated Content

- **Result Summary**: Completion rate based on Plan requirements
- **Quality Metrics**: Final analysis result summary
- **Change History**: Implemented features in changelog format

## Recommended for Manual Writing

- **Retrospective (KPT)**: Personal/team learnings
- **Next Steps**: Follow-up work plan
- **Notes**: Special circumstances, technical debt, etc.

## Cautions

- Recommended to write report after Check (analysis) completion
- Report focuses on "learning" - basis for next cycle improvement
- Can be used for team sharing
