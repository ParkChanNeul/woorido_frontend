---
description: Claude Code learning guide
---

# Claude Code Learning Guide

Educates users on how to configure Claude Code. Works **across any project, any language**.

## Usage

```
/learn-claude-code [level]
```

- If level is omitted: Analyzes current settings and recommends appropriate level
- If level specified: 1 (basics), 2 (automation), 3 (specialization), 4 (team optimization)

## Why This Command?

```
Problem: Need to re-explain Claude Code usage every new session
Solution: Provide consistent education through this command
```

## Tasks Performed

### Step 1: Analyze Current Settings

Analyze the project's Claude Code configuration status:

```bash
# Files/folders to check
- CLAUDE.md (root)
- .claude/settings.local.json
- .claude/commands/
- .claude/agents/
- .claude/skills/
- .mcp.json
- .github/workflows/claude-docs-update.yml
```

#### Exclude Default Provided Files (Important!)

The following files/folders are **default files of this learning system** and should be **excluded** when determining level:

```bash
# Files/folders to exclude (not counted as user settings)
# These are bkit plugin defaults, not user-created settings
```

**Examples**:
- If `.claude/commands/` is empty or doesn't exist → Determine as "No Commands"
- If `.claude/commands/commit.md` exists → Determine as "Commands exist"

### Step 2: Determine User Level

| Level | Condition | Learning Content |
|-------|-----------|------------------|
| 1 | No CLAUDE.md | Basics: How to write CLAUDE.md, Plan Mode |
| 2 | Only CLAUDE.md | Automation: Commands, Hooks, Permission management |
| 3 | Commands/Hooks exist | Specialization: Agents, Skills, MCP |
| 4 | Most settings complete | Team Optimization: GitHub Action, Team rules |

### Step 3: Provide Educational Content

Provide education matching the selected level:

#### Level 1: Basics (15 min)

```markdown
## What is CLAUDE.md?

It's your team's shared knowledge repository. When Claude makes mistakes,
add rules so the same mistakes aren't repeated.

## Example

# Development Workflow

## Package Management
- **Always use `pnpm`** (`npm`, `yarn` prohibited)

## Coding Conventions
- Prefer `type`, avoid `interface`
- **Never use `enum`** → Use string literal unions

## Prohibited
- ❌ No console.log (use logger)
- ❌ No any type

## Practice

Create CLAUDE.md right now!
```

#### Level 2: Automation (30 min)

```markdown
## What are Slash Commands?

Execute repetitive daily tasks with `/command-name`.

## Command Location

.claude/commands/{command-name}.md

## Example: /commit-push-pr

# Commit, Push, Create PR

## Tasks
1. Check git status
2. git add -A
3. Generate commit message (conventional commits)
4. git push
5. gh pr create

## PostToolUse Hook

Automatically run formatting after code modifications.

// .claude/settings.local.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "pnpm format || true"
      }]
    }]
  }
}
```

#### Level 3: Specialization (45 min)

```markdown
## What are Sub-agents?

AI agents specialized for specific tasks.

## Example: build-validator.md

# Build Validation Agent

Validates that builds completed successfully.

## Tasks
1. Run pnpm -r build
2. Check for build errors

## Success Criteria
- All modules build successfully
- dist/ folder creation confirmed

## What are Skills?

Domain-specific expert contexts. Claude automatically references them for related work.

## Skill Creation (Hybrid Approach)

Step 1: Common Skills (Auto-generated)
- {project}-architecture: Overall architecture
- {project}-testing: Test patterns

Step 2: Detect Project Type
- modules/ → Hexagonal/DDD
- packages/ → Monorepo
- components/ → Frontend

Step 3: Type-specific Skill Suggestions (User confirmation)

## MCP Connection

Connect external tools (Slack, GitHub, Jira, etc.) via .mcp.json.
```

#### Level 4: Team Optimization (1 hour)

```markdown
## Automate PRs with GitHub Action

Mention @claude in PR comments to automatically update documentation.

## Example

bcherny: @claude Add enum prohibition rule to CLAUDE.md

claude (bot): Added enum guidelines to CLAUDE.md!

## Configuration File

.github/workflows/claude-docs-update.yml

## Team Rule Standardization

1. Manage CLAUDE.md with Git
2. Add rules during PR reviews
3. Gradually accumulate team knowledge
```

### Step 4: Guide to Next Level

After completing current level, guide to proceed to next level.

## Output

```
📚 Claude Code Learning Complete!

**Current Level**: {level}
**Learned**: {summary}

🎯 Next Steps:
- Continue learning with /learn-claude-code {next_level}
- Auto-generate settings with /setup-claude-code
- Check latest trends with /upgrade-claude-code
```

## Level 5: PDCA Methodology (Optional)

```markdown
## What is PDCA?

A document-driven development methodology. Claude applies it automatically.

Plan → Do (Design/Implement) → Check (Analyze) → Act (Improve)

## Core Principles

User: "Create a login feature"
Claude: 1. Check docs/02-design/ → Design first
        2. Generate design document from template
        3. Implement after design approval
        4. Suggest Gap analysis after completion

## Folder Structure

docs/
├── 01-plan/      # Planning
├── 02-design/    # Design
├── 03-analysis/  # Analysis
└── 04-report/    # Reports

## Detailed Learning

Use `/pdca-design`, `/pdca-plan`, `/pdca-analyze` commands to learn PDCA methodology.
```
