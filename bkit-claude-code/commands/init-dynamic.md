---
description: Initialize Dynamic level project (bkend.ai BaaS fullstack)
allowed-tools: ["Read", "Write", "Bash", "Glob"]
---

# Dynamic Project Initialization

## Tasks Performed

1. **Check Project Structure**
   - Verify package.json (React/Next.js)
   - Check .mcp.json or bkend configuration

2. **Create PDCA Document Folders**
   ```
   docs/
   ├── 01-plan/
   │   ├── _INDEX.md
   │   ├── requirements.md
   │   └── features/
   ├── 02-design/
   │   ├── _INDEX.md
   │   ├── data-model.md      # bkend.ai collection design
   │   ├── api-spec.md        # API endpoint specification
   │   └── features/
   ├── 03-analysis/
   │   ├── _INDEX.md
   │   └── gap-analysis/
   └── 04-report/
       ├── _INDEX.md
       └── changelog.md
   ```

3. **Dynamic Level Specific Setup**
   - Generate data-model.md template (bkend.ai collection structure)
   - Authentication flow document template

4. **Initialize PDCA Status File**
   - Create `docs/.pdca-status.json` with initial structure:
   ```json
   {
     "version": "1.0.0",
     "last_updated": "{current_timestamp}",
     "project_level": "dynamic",
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

5. **Check MCP Configuration**
   - Verify .mcp.json file
   - Guide bkend.ai MCP server setup

## Execution Conditions

- Next.js or React project required
- bkend.ai project ID needed (guide if missing)

## Next Steps Guide

```
✅ Dynamic project has been initialized!

Next Steps:
1. Define collections in docs/02-design/data-model.md
2. /pdca-plan [feature-name] - Write feature plan
3. Or auto PDCA applied when feature requested

💡 Tip: Check project settings in bkend.ai dashboard.
```
