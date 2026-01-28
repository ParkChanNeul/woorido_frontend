---
description: Claude Code project setup generation
---

# Claude Code Project Setup Generation

Automatically generates Claude Code settings **for any project, any language**.

Supported languages: TypeScript, JavaScript, Python, Go, Rust, Java, C#, Ruby, PHP, etc.

## Usage

```
/setup-claude-code [option]
```

Options:
- `minimal`: Minimal setup (CLAUDE.md + hooks)
- `standard`: Standard setup (+ Commands, Agents)
- `full`: Full setup (+ Skills, MCP, GitHub Action)
- If omitted: Auto-determined after project analysis

## Why This Command?

```
Problem: Need to manually configure Claude Code from scratch for each new project
Solution: Project analysis → Auto-generate settings matching language/structure
```

## Tasks Performed

### Step 1: Project Analysis

```bash
# Analysis targets
1. package.json → Package manager, scripts check
2. Folder structure → Monorepo status, module structure
3. Existing .claude/ → Already configured items
4. tsconfig.json → TypeScript settings
5. .eslintrc / biome.json → Lint settings
6. .prettierrc → Formatter settings
```

### Step 2: Identify Tech Stack

| Item | How to Check |
|------|-------------|
| Package manager | Check lockfile (pnpm-lock.yaml, package-lock.json, bun.lockb) |
| Language | tsconfig.json presence, file extensions |
| Framework | package.json dependencies |
| Monorepo | pnpm-workspace.yaml, turbo.json, lerna.json |
| Test tool | vitest, jest, mocha, etc. |

### Step 3: Determine Configuration Scale

```markdown
## Scale Determination Criteria

### Minimal (Small, 1-3 people)
- Single package
- Simple project

### Standard (Medium, 4-10 people)
- Monorepo or complex single package
- Multiple developer collaboration

### Full (Large, 10+ people)
- Large-scale monorepo
- Multiple domains
- External system integration needed
```

### Step 4: File Generation

#### 5.1 Generate CLAUDE.md (Always)

**Template reference**: `templates/CLAUDE.template.md`

**Variable substitution list**:

| Variable | Detection Method | Example |
|----------|-----------------|---------|
| `{{PROJECT_NAME}}` | package.json name or folder name | `my-saas-app` |
| `{{PROJECT_DESCRIPTION}}` | package.json description or user input | `AI-powered SaaS` |
| `{{LANGUAGE}}` | tsconfig.json presence, file extensions | `TypeScript` |
| `{{FRAMEWORK}}` | package.json dependencies | `Next.js 14` |
| `{{PACKAGE_MANAGER}}` | Check lockfile | `pnpm` |
| `{{LEVEL}}` | Project structure analysis | `Dynamic` |
| `{{TYPECHECK_COMMAND}}` | package.json scripts | `pnpm typecheck` |
| `{{TEST_COMMAND}}` | package.json scripts | `pnpm test` |
| `{{LINT_COMMAND}}` | package.json scripts | `pnpm lint` |
| `{{BUILD_COMMAND}}` | package.json scripts | `pnpm build` |
| `{{CONVENTIONS}}` | Existing config file analysis or defaults | (see below) |
| `{{FOLDER_STRUCTURE}}` | Actual folder structure analysis | (see below) |

**Default Conventions (TypeScript)**:
```markdown
- Prefer `type` over `interface`
- **Never use `enum`** → Use string literal unions
- Define types with Zod schemas
- No `console.log` → Use logger
- No `any` type
```

**Folder Structure Generation Rules**:
- Display only up to 3 levels deep
- Exclude node_modules, .git, dist, etc.
- Add comments to major folders

#### 5.2 Generate settings.local.json (Always)

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "{format_command} || true"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash({package_manager}:*)",
      "Bash({package_manager} build:*)",
      "Bash({package_manager} test:*)",
      "Bash({package_manager} lint:*)",
      "Bash({package_manager} typecheck:*)"
    ],
    "deny": [],
    "ask": []
  }
}
```

#### 5.3 Generate Commands (Standard, Full)

Create following files in `.claude/commands/` folder:

1. `commit-push-pr.md` - Commit → Push → PR
2. `typecheck-all.md` - Full typecheck
3. `test-module.md` - Module-specific tests
4. `lint-fix.md` - Auto-fix lint
5. `build-all.md` - Full build

#### 5.4 Generate Agents (Standard, Full)

Create following files in `.claude/agents/` folder:

1. `build-validator.md` - Build validation
2. `code-reviewer.md` - Code review
3. `test-runner.md` - Test execution analysis
4. `api-doc-generator.md` - API documentation generation

#### 5.5 Generate Skills (Standard, Full) - Hybrid Approach

Create skills in `.claude/skills/` folder in **3 stages**.

##### Stage 1: Common Skills (Always generated)

| Skill | Purpose |
|-------|---------|
| `{project}-architecture` | Overall architecture, folder structure, dependency direction |
| `{project}-testing` | Test patterns, unit/integration tests, execution methods |

##### Stage 2: Detect Project Type

```bash
# Project structure analysis
if modules/ or domains/ exist → Hexagonal/DDD
if packages/ or apps/ exist → Monorepo
if components/ or pages/ exist → Frontend
if controllers/ or routes/ exist → MVC Backend
if services/ exist → Microservices
if src/ only → Library/Simple
```

##### Stage 3: Type-specific Skill Suggestions (User confirmation)

**Hexagonal/DDD Projects**:

| Detection | Suggested Skill |
|-----------|----------------|
| `modules/{name}/` | `{project}-{name}` (per domain) |
| MongoDB usage | `{project}-database` |
| Fastify/Express | `{project}-api-conventions` |
| Zod usage | `{project}-validation` |

**Monorepo**:

| Detection | Suggested Skill |
|-----------|----------------|
| `packages/{name}/` | `{project}-{name}` (per package) |
| `apps/{name}/` | `{project}-{name}-app` |
| Shared config | `{project}-shared` |

**Frontend**:

| Detection | Suggested Skill |
|-----------|----------------|
| `components/` | `{project}-components` |
| `pages/` or `routes/` | `{project}-routing` |
| `hooks/` | `{project}-hooks` |
| `stores/` or `context/` | `{project}-state` |

**MVC Backend**:

| Detection | Suggested Skill |
|-----------|----------------|
| `controllers/` | `{project}-controllers` |
| `models/` | `{project}-models` |
| `routes/` | `{project}-api-conventions` |
| `middleware/` | `{project}-middleware` |

**Microservices**:

| Detection | Suggested Skill |
|-----------|----------------|
| `services/{name}/` | `{project}-{name}` (per service) |
| Docker usage | `{project}-deployment` |
| Message queue | `{project}-messaging` |

**Library**:

| Detection | Suggested Skill |
|-----------|----------------|
| `src/` | `{project}-api` |
| `examples/` | `{project}-examples` |

##### User Confirmation (AskUserQuestion)

```
Project Type: Hexagonal/DDD (modules/ detected)

Generate the following skills?

Common Skills (Auto-generated):
 ✅ {project}-architecture
 ✅ {project}-testing

Project-specific Skills (Optional):
 [x] {project}-auth (modules/auth/)
 [x] {project}-user (modules/user/)
 [x] {project}-transaction (modules/transaction/)
 [ ] {project}-marketing (can be deselected)
 [x] {project}-database (MongoDB detected)
 [x] {project}-api-conventions (Fastify detected)
```

##### Skill Template

```yaml
---
name: {project}-{name}
description: Applied when working with {name}. Use when working with {keywords}.
---

# {Name} Skill

## Overview
[Auto-analyzed description]

## Core Files
[Main file paths for this area]

## Core Rules
[Patterns extracted from codebase]

## Frequently Used Commands
[Related test/build commands]
```

#### 5.6 Generate .mcp.json (Full only)

```json
{
  "mcpServers": {
    "slack": {
      "type": "http",
      "url": "https://slack.mcp.anthropic.com/mcp"
    },
    "github": {
      "type": "http",
      "url": "https://github.mcp.anthropic.com/mcp"
    }
  }
}
```

#### 5.7 Generate GitHub Action (Full only)

Create `.github/workflows/claude-docs-update.yml`

#### 5.8 Generate PDCA Folder Structure (Always)

Create PDCA structure in `docs/` folder:

```
docs/
├── 01-plan/
│   └── _INDEX.md
├── 02-design/
│   ├── _INDEX.md
│   └── features/
├── 03-analysis/
│   ├── _INDEX.md
│   └── issues/
└── 04-report/
    └── _INDEX.md
```

**Template references**:
- `templates/plan.template.md` → For docs/01-plan/ documents
- `templates/design.template.md` → For docs/02-design/ documents
- `templates/analysis.template.md` → For docs/03-analysis/ documents
- `templates/report.template.md` → For docs/04-report/ documents
- `templates/_INDEX.template.md` → For each folder index

### Step 5: Merge with Existing Settings

- Don't overwrite already existing files
- Only add new items or request user confirmation

## Output

```
✅ Claude Code Setup Complete!

📁 Generated Files:
- CLAUDE.md ✅
- .claude/settings.local.json ✅
- .claude/commands/ (5 files) ✅
- .claude/agents/ (4 files) ✅
- .claude/skills/ (4 files) ✅
- .mcp.json ✅
- .github/workflows/claude-docs-update.yml ✅

📊 Configuration Scale: {minimal|standard|full}
🔧 Tech Stack: {detected_stack}

🎯 Next Steps:
1. Review and modify CLAUDE.md content
2. Learn usage with /learn-claude-code
3. Check latest trends with /upgrade-claude-code
```

## Cautions

- If existing files exist, backup then attempt merge
- If no package.json, create with default npm settings
- For custom settings, modify manually after generation

## Reference

- `templates/` - Document templates for PDCA methodology
