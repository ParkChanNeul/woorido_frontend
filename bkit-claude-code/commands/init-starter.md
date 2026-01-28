---
description: Initialize Starter level project (static web, Next.js basics)
allowed-tools: ["Read", "Write", "Bash", "Glob"]
---

# Starter Project Initialization

## Tasks Performed

1. **Check Project Structure**
   - Verify package.json or index.html
   - Check existing docs/ folder

2. **Create PDCA Document Folders**
   ```
   docs/
   ├── 01-plan/
   │   ├── _INDEX.md
   │   └── features/
   ├── 02-design/
   │   ├── _INDEX.md
   │   └── features/
   ├── 03-analysis/
   │   └── _INDEX.md
   └── 04-report/
       └── _INDEX.md
   ```

3. **Generate Base Documents**
   - Create _INDEX.md in each folder
   - Update project README.md (if needed)

4. **Initialize PDCA Status File**
   - Create `docs/.pdca-status.json` with initial structure:
   ```json
   {
     "version": "1.0.0",
     "last_updated": "{current_timestamp}",
     "project_level": "starter",
     "features": {},
     "quick_changes": [],
     "statistics": {
       "total_features": 0,
       "completed": 0,
       "in_progress": 0,
       "quick_changes_count": 0
     }
   }
   ```

5. **Completion Message**
   - Display created structure
   - Guide next steps

## Execution Conditions

- Verify project is suitable for Starter level
- Skip if already initialized (don't overwrite)

## Next Steps Guide

```
✅ Starter project has been initialized!

Next Steps:
1. /pdca-plan [feature-name] - Write first feature plan
2. Or request feature implementation and PDCA will be automatically applied
```
