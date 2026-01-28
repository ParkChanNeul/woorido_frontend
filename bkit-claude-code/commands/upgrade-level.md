---
description: Upgrade project level (Starter→Dynamic→Enterprise)
allowed-tools: ["Read", "Write", "Bash", "Glob", "Grep"]
---

# Project Level Upgrade

Performs upgrade based on $ARGUMENTS (e.g., /upgrade-level dynamic)

## Upgrade Path

```
┌──────────┐      ┌──────────┐      ┌─────────────┐
│ Starter  │ ───▶ │ Dynamic  │ ───▶ │ Enterprise  │
│ (Static) │      │ (BaaS)   │      │ (MSA/K8s)   │
└──────────┘      └──────────┘      └─────────────┘
```

## Starter → Dynamic Upgrade

### Prerequisites
- React or Next.js installed
- bkend.ai account and project

### What's Added
1. **Document Structure Expansion**
   - docs/02-design/data-model.md
   - docs/02-design/api-spec.md

2. **Configuration Files**
   - .mcp.json (bkend.ai MCP server)
   - .env.local template

3. **Code Structure**
   - src/lib/bkend.ts
   - src/hooks/useAuth.ts

## Dynamic → Enterprise Upgrade

### Prerequisites
- Need for own backend
- Need for infrastructure control
- Large-scale traffic expected

### What's Added
1. **Document Structure Expansion**
   - docs/00-requirement/
   - docs/02-scenario/
   - docs/04-operation/

2. **Domain-specific CLAUDE.md**
   - services/CLAUDE.md
   - frontend/CLAUDE.md
   - infra/CLAUDE.md

3. **Infrastructure Templates**
   - infra/terraform/ structure
   - infra/k8s/ structure
   - docker-compose.yml

## Tasks Performed

1. **Check Current Level**
   - Analyze project structure
   - Check existing documents

2. **Execute Upgrade**
   - Create new folders/files (keep existing ones)
   - Provide migration guide

3. **Completion Guide**
   - Summarize changes
   - Guide next steps

## Usage Examples

```
/upgrade-level dynamic    # Starter → Dynamic
/upgrade-level enterprise # Dynamic → Enterprise
```
