---
description: Initialize Enterprise level project (MSA, K8s, Terraform)
allowed-tools: ["Read", "Write", "Bash", "Glob"]
---

# Enterprise Project Initialization

## Tasks Performed

1. **Analyze Project Structure**
   - Check monorepo structure (turbo.json, pnpm-workspace.yaml)
   - Check backend service structure (services/)
   - Check infrastructure code (infra/)

2. **Create PDCA Document Folders**
   ```
   docs/
   ├── 00-requirement/           # Original requirements
   │   └── _INDEX.md
   ├── 01-development/           # Design documents (multiple)
   │   ├── _INDEX.md
   │   ├── 01_architecture.md
   │   ├── 02_data-model.md
   │   ├── 03_api-spec.md
   │   └── features/
   ├── 02-scenario/              # Scenarios, use cases
   │   └── _INDEX.md
   ├── 03-refactoring/           # Analysis and refactoring
   │   ├── _INDEX.md
   │   ├── gap-analysis/
   │   └── issues/
   └── 04-operation/             # Operations documents
       ├── _INDEX.md
       ├── runbook.md
       └── changelog.md
   ```

3. **Generate Domain-specific CLAUDE.md**
   - services/CLAUDE.md (backend conventions)
   - frontend/CLAUDE.md (frontend conventions)
   - infra/CLAUDE.md (infrastructure conventions)

4. **Initialize PDCA Status File**
   - Create `docs/.pdca-status.json` with initial structure:
   ```json
   {
     "version": "1.0.0",
     "last_updated": "{current_timestamp}",
     "project_level": "enterprise",
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

5. **Check CI/CD**
   - Verify .github/workflows/
   - Check ArgoCD configuration (if applicable)

## Execution Conditions

- Microservices or monorepo structure
- Kubernetes or Docker required
- Terraform recommended

## Next Steps Guide

```
✅ Enterprise project has been initialized!

Next Steps:
1. Review docs/01-development/01_architecture.md
2. Define backend conventions in services/CLAUDE.md
3. /pdca-plan [service-name] - Write service plan

⚠️ SoR Priority: Code > CLAUDE.md > Design Documents
   Always check the codebase first.
```
