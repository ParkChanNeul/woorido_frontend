---
description: Archive completed PDCA documents to archive folder
allowed-tools: ["Read", "Bash", "Glob"]
---

# PDCA Document Archive

Receives feature name via $ARGUMENTS. (e.g., /archive login)

## Tasks Performed

1. **Verify PDCA Documents Exist**
   - Check docs/01-plan/features/{feature}.plan.md
   - Check docs/02-design/features/{feature}.design.md
   - Check docs/03-analysis/{feature}.analysis.md or gap-analysis.md
   - Check docs/04-report/{feature}.report.md

2. **Create Archive Folder**
   - Create docs/archive/YYYY-MM/{feature}/
   - YYYY-MM based on current date

3. **Move Documents**
   - Move all found PDCA documents to archive folder
   - Preserve original filenames

4. **Update Archive Index**
   - Create or update docs/archive/YYYY-MM/_INDEX.md
   - Add entry with feature name, date, and status

## Usage Examples

```
/archive login           # Archive login feature PDCA documents
/archive user-profile    # Archive user-profile documents
/archive checkout        # Archive checkout documents
```

## Output Example

```
✅ Archived: login

📁 Location: docs/archive/2026-01/login
📄 Documents moved: 4
   - plan.md
   - design.md
   - analysis.md
   - report.md

📋 Index updated: docs/archive/2026-01/_INDEX.md
```

## When to Use

- After completing PDCA cycle (Report phase done)
- Match Rate >= 90% achieved
- Ready to start new feature or next PDCA cycle

## Archive Structure

```
docs/archive/
├── 2026-01/
│   ├── _INDEX.md
│   ├── login/
│   │   ├── login.plan.md
│   │   ├── login.design.md
│   │   ├── login.analysis.md
│   │   └── login.report.md
│   └── checkout/
│       └── ...
└── 2026-02/
    └── ...
```

## Cautions

- Archive only completed features (after report)
- Documents are MOVED, not copied (originals deleted from active folders)
- Cannot undo easily - verify completion before archiving
- Feature name must match document filenames exactly
