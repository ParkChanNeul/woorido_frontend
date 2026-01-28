# Gemini CLI Support Design Document

> **Summary**: bkit 플러그인의 Gemini CLI 듀얼 플랫폼 지원을 위한 상세 설계서
>
> **Project**: bkit-claude-code
> **Version**: 1.3.2 → 1.4.0
> **Author**: POPUP STUDIO
> **Date**: 2026-01-23
> **Status**: Draft
> **Plan Document**: [gemini-cli-support.plan.md](../01-plan/features/gemini-cli-support.plan.md)

---

## 1. Requirement Traceability Matrix

### 1.1 Functional Requirements 매핑

| FR ID | Requirement | 설계 섹션 | 구현 방법 |
|-------|-------------|----------|----------|
| FR-01 | Gemini CLI에서 설치 가능 | 2, 12 | `gemini-extension.json` + GitHub 저장소 설정 |
| FR-02 | 20개 명령어 실행 가능 | 4 | TOML 명령어 변환, `commands/gemini/` |
| FR-03 | 18개 스킬 활성화 | 7 | SKILL.md frontmatter 호환, autoActivate 설정 |
| FR-04 | SessionStart 훅 실행 | 5 | `hooks.SessionStart` + session-start.js |
| FR-05 | PreToolUse/PostToolUse 훅 | 5 | `BeforeTool`/`AfterTool` 매핑 |
| FR-06 | PDCA 템플릿 정상 작동 | 13 | templates/ 폴더 공유, 경로 변수 분기 |
| FR-07 | 레벨 감지 정상 작동 | 6, 14 | `detectLevel()` + `detectProjectLevel()` |
| FR-08 | 다국어 트리거 정상 작동 | 15 | SKILL.md 트리거 키워드 파싱 |
| FR-09 | Claude Code regression 없음 | 8 | 통합 테스트, 기존 코드 분리 |
| FR-10 | GitHub 직접 설치 가능 | 12 | repository 필드 + 설치 가이드 |

### 1.2 Implementation Phases 매핑

| Phase | 내용 | 관련 FR | 설계 섹션 |
|-------|------|---------|----------|
| Phase 1 | Core (매니페스트, 컨텍스트, 환경변수) | FR-01, FR-10 | 2, 3, 6 |
| Phase 2 | Commands 변환 | FR-02 | 4 |
| Phase 3 | Hooks 변환 | FR-04, FR-05 | 5 |
| Phase 4 | Skills 호환성 | FR-03, FR-08 | 7, 15 |
| Phase 5 | 테스트 및 문서화 | FR-06, FR-07, FR-09 | 8, 13, 14 |

---

## 2. Architecture Overview

### 1.1 최종 폴더 구조

```
bkit/
├── .claude-plugin/                    # Claude Code 전용 (기존 유지)
│   ├── plugin.json
│   └── marketplace.json
│
├── gemini-extension.json              # [NEW] Gemini CLI 매니페스트
├── GEMINI.md                          # [NEW] Gemini CLI 컨텍스트 파일
│
├── commands/
│   ├── *.md                           # Claude Code용 (기존 20개)
│   └── gemini/                        # [NEW] Gemini CLI용 TOML
│       └── *.toml                     # 20개 TOML 명령어
│
├── hooks/
│   ├── hooks.json                     # [MODIFY] 양 플랫폼 지원 형식
│   └── session-start.js               # [MODIFY] 환경 변수 분기 추가
│
├── lib/
│   └── common.js                      # [MODIFY] 플랫폼 감지 및 환경 변수 분기
│
├── skills/                            # 공유 (변경 불필요)
├── agents/                            # Claude Code 전용 (유지)
├── scripts/                           # [MODIFY] 환경 변수 호환성
└── templates/                         # 공유 (변경 불필요)
```

### 1.2 플랫폼 감지 로직

```javascript
// lib/common.js에 추가
function detectPlatform() {
  // Gemini CLI 환경 변수 존재 확인
  if (process.env.GEMINI_PROJECT_DIR || process.env.GEMINI_SESSION_ID) {
    return 'gemini';
  }
  // Claude Code 환경 변수 존재 확인
  if (process.env.CLAUDE_PLUGIN_ROOT || process.env.CLAUDE_PROJECT_DIR) {
    return 'claude';
  }
  // 기본값
  return 'unknown';
}
```

---

## 2. gemini-extension.json 상세 스키마

### 2.1 전체 구조

```json
{
  "$schema": "https://geminicli.dev/schemas/extension.json",
  "name": "bkit",
  "version": "1.4.0",
  "description": "Vibecoding Kit - PDCA methodology + AI-native development for Gemini CLI",
  "author": {
    "name": "POPUP STUDIO PTE. LTD.",
    "email": "contact@popupstudio.ai",
    "url": "https://popupstudio.ai"
  },
  "repository": "https://github.com/popup-studio-ai/bkit-claude-code",
  "license": "Apache-2.0",
  "keywords": [
    "vibecoding", "pdca", "development-pipeline", "ai-native",
    "fullstack", "multilingual", "baas", "enterprise"
  ],
  "engines": {
    "gemini-cli": ">=1.0.0"
  },
  "context": {
    "file": "GEMINI.md"
  },
  "commands": {
    "directory": "commands/gemini"
  },
  "hooks": {
    "SessionStart": {
      "command": "node ${extensionPath}/hooks/session-start.js",
      "timeout": 5000,
      "once": true
    },
    "BeforeTool": [
      {
        "matcher": "Write|Edit",
        "command": "node ${extensionPath}/scripts/pre-write.js",
        "timeout": 5000
      }
    ],
    "AfterTool": [
      {
        "matcher": "Write",
        "command": "node ${extensionPath}/scripts/pdca-post-write.js",
        "timeout": 5000
      }
    ]
  },
  "skills": {
    "directory": "skills",
    "autoActivate": [
      "bkit-rules",
      "development-pipeline"
    ]
  },
  "environment": {
    "BKIT_PLATFORM": "gemini"
  }
}
```

### 2.2 주요 필드 설명

| 필드 | 타입 | 설명 | Claude 대응 |
|------|------|------|-------------|
| `context.file` | string | 컨텍스트 파일 경로 | `CLAUDE.md` |
| `commands.directory` | string | 명령어 디렉토리 | `commands/` |
| `hooks.SessionStart` | object | 세션 시작 훅 | `SessionStart` |
| `hooks.BeforeTool` | array | 도구 실행 전 훅 | `PreToolUse` |
| `hooks.AfterTool` | array | 도구 실행 후 훅 | `PostToolUse` |
| `skills.directory` | string | 스킬 디렉토리 | `skills/` |
| `environment` | object | 환경 변수 | - |

### 2.3 환경 변수 매핑

| 용도 | Claude Code | Gemini CLI | 통합 변수 |
|------|-------------|------------|-----------|
| 플러그인 루트 | `CLAUDE_PLUGIN_ROOT` | `${extensionPath}` | - |
| 프로젝트 디렉토리 | `CLAUDE_PROJECT_DIR` | `GEMINI_PROJECT_DIR` | `BKIT_PROJECT_DIR` |
| 세션 ID | - | `GEMINI_SESSION_ID` | - |
| 현재 작업 디렉토리 | - | `GEMINI_CWD` | - |
| 플랫폼 구분 | - | - | `BKIT_PLATFORM` |

---

## 3. GEMINI.md 콘텐츠 구조

### 3.1 파일 개요

`GEMINI.md`는 Gemini CLI에서 세션 시작 시 로드되는 컨텍스트 파일입니다. Claude Code의 instructions/ 폴더 내용을 통합한 형태입니다.

### 3.2 전체 구조

```markdown
# bkit Vibecoding Kit for Gemini CLI

> AI-Native Development with PDCA Methodology

---

## Core Principles

### 1. Automation First, Commands are Shortcuts
```
Gemini automatically applies PDCA methodology.
Commands are shortcuts for power users.
```

### 2. SoR (Single Source of Truth) Priority
```
1st: Codebase (actual working code)
2nd: GEMINI.md / Convention docs
3rd: docs/ design documents
```

### 3. No Guessing
```
Unknown → Check documentation
Not in docs → Ask user
Never guess
```

---

## PDCA Workflow

### Phase 1: Plan
- Use `/pdca-plan {feature}` to create plan document
- Stored in `docs/01-plan/features/{feature}.plan.md`

### Phase 2: Design
- Use `/pdca-design {feature}` to create design document
- Stored in `docs/02-design/features/{feature}.design.md`

### Phase 3: Do (Implementation)
- Implement based on design document
- Apply coding conventions from this file

### Phase 4: Check
- Use `/pdca-analyze {feature}` for gap analysis
- Stored in `docs/03-analysis/{feature}.analysis.md`

### Phase 5: Act
- Use `/pdca-iterate {feature}` for auto-fix if < 90%
- Use `/pdca-report {feature}` for completion report

---

## Level System

### Starter (Basic)
- Static websites, simple apps
- HTML/CSS/JavaScript, Next.js basics
- Friendly explanations, step-by-step guidance

### Dynamic (Intermediate)
- Fullstack apps with BaaS
- Authentication, database, API integration
- Technical but clear explanations

### Enterprise (Advanced)
- Microservices, Kubernetes, Terraform
- High traffic, high availability
- Concise, use technical terms

---

## Available Commands

| Command | Description |
|---------|-------------|
| `/pdca-status` | Check current PDCA status |
| `/pdca-plan {feature}` | Generate Plan document |
| `/pdca-design {feature}` | Generate Design document |
| `/pdca-analyze {feature}` | Run Gap analysis |
| `/pdca-iterate {feature}` | Auto-fix iteration loop |
| `/pdca-report {feature}` | Generate completion report |
| `/init-starter` | Initialize Starter project |
| `/init-dynamic` | Initialize Dynamic project |
| `/init-enterprise` | Initialize Enterprise project |
| `/pipeline-start` | Start development pipeline guide |
| `/pipeline-status` | Check pipeline progress |
| `/pipeline-next` | Guide to next pipeline phase |
| `/zero-script-qa` | Run Zero Script QA |
| `/learn-claude-code` | Claude Code learning guide |
| `/setup-claude-code` | Project setup generation |
| `/upgrade-claude-code` | Claude Code settings upgrade |
| `/upgrade-level` | Upgrade project level |
| `/archive` | Archive completed documents |
| `/github-stats` | Collect GitHub statistics |
| `/pdca-next` | Guide to next PDCA step |

---

## Trigger Keywords

When user mentions these keywords, consider using corresponding skills:

| Keyword | Skill/Action |
|---------|--------------|
| 검증, verify, check | Gap Analysis |
| 개선, improve, iterate | Auto-fix iteration |
| 분석, analyze, quality | Code quality analysis |
| 보고서, report, summary | Generate report |
| QA, 테스트, test | Zero Script QA |
| 설계, design, spec | Design validation |

---

## Task Size Rules

| Size | Lines | PDCA Level |
|------|-------|------------|
| Quick Fix | <10 | None |
| Minor Change | <50 | Light (optional) |
| Feature | <200 | Recommended |
| Major Feature | >=200 | Required |

---

**Version**: 1.4.0 (Dual Platform Support)
**Generated by**: bkit Vibecoding Kit
```

---

## 4. TOML 명령어 변환 규칙

### 4.1 변환 규칙 매핑

| Claude Code (Markdown) | Gemini CLI (TOML) |
|------------------------|-------------------|
| `---` (YAML frontmatter) | TOML 헤더 |
| `description:` | `description = ""` |
| `allowed-tools:` | - (미지원, 제거) |
| Markdown body | `prompt = """..."""` |

### 4.2 변환 예시

**Before (Claude Code - pdca-plan.md)**:
```markdown
---
description: Generate Plan phase document (feature planning)
allowed-tools: ["Read", "Write", "Glob"]
---

# Plan Document Generation

Receives feature name via $ARGUMENTS. (e.g., /pdca-plan login)
...
```

**After (Gemini CLI - pdca-plan.toml)**:
```toml
# bkit Command: pdca-plan
# Platform: Gemini CLI

description = "Generate Plan phase document (feature planning)"

prompt = """
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

4. **Guide Next Steps**
   - Suggest /pdca-design as next step

## Usage Examples

```
/pdca-plan login          # Login feature plan
/pdca-plan user-profile   # User profile feature plan
/pdca-plan checkout       # Checkout feature plan
```

## Cautions

- Feature names should be in English kebab-case (login, user-profile)
- Don't overwrite if already exists
- If Design or implementation is requested without Plan, automatically create Plan first
"""
```

### 4.3 전체 명령어 변환 목록 (20개)

| # | 명령어 | Claude 파일 | Gemini 파일 |
|---|--------|-------------|-------------|
| 1 | pdca-status | `commands/pdca-status.md` | `commands/gemini/pdca-status.toml` |
| 2 | pdca-plan | `commands/pdca-plan.md` | `commands/gemini/pdca-plan.toml` |
| 3 | pdca-design | `commands/pdca-design.md` | `commands/gemini/pdca-design.toml` |
| 4 | pdca-analyze | `commands/pdca-analyze.md` | `commands/gemini/pdca-analyze.toml` |
| 5 | pdca-iterate | `commands/pdca-iterate.md` | `commands/gemini/pdca-iterate.toml` |
| 6 | pdca-report | `commands/pdca-report.md` | `commands/gemini/pdca-report.toml` |
| 7 | pdca-next | `commands/pdca-next.md` | `commands/gemini/pdca-next.toml` |
| 8 | init-starter | `commands/init-starter.md` | `commands/gemini/init-starter.toml` |
| 9 | init-dynamic | `commands/init-dynamic.md` | `commands/gemini/init-dynamic.toml` |
| 10 | init-enterprise | `commands/init-enterprise.md` | `commands/gemini/init-enterprise.toml` |
| 11 | pipeline-start | `commands/pipeline-start.md` | `commands/gemini/pipeline-start.toml` |
| 12 | pipeline-status | `commands/pipeline-status.md` | `commands/gemini/pipeline-status.toml` |
| 13 | pipeline-next | `commands/pipeline-next.md` | `commands/gemini/pipeline-next.toml` |
| 14 | zero-script-qa | `commands/zero-script-qa.md` | `commands/gemini/zero-script-qa.toml` |
| 15 | learn-claude-code | `commands/learn-claude-code.md` | `commands/gemini/learn-claude-code.toml` |
| 16 | setup-claude-code | `commands/setup-claude-code.md` | `commands/gemini/setup-claude-code.toml` |
| 17 | upgrade-claude-code | `commands/upgrade-claude-code.md` | `commands/gemini/upgrade-claude-code.toml` |
| 18 | upgrade-level | `commands/upgrade-level.md` | `commands/gemini/upgrade-level.toml` |
| 19 | archive | `commands/archive.md` | `commands/gemini/archive.toml` |
| 20 | github-stats | `commands/github-stats.md` | `commands/gemini/github-stats.toml` |

### 4.4 TOML 명령어 템플릿

```toml
# bkit Command: {command-name}
# Platform: Gemini CLI
# Converted from: commands/{command-name}.md

description = "{description}"

prompt = """
# {Title}

{Body content from markdown file}

## Usage Examples

```
/{command-name} {example-args}
```

## Notes

- {Note 1}
- {Note 2}
"""
```

---

## 5. Hooks 변환 사양

### 5.1 이벤트 매핑

| Claude Code | Gemini CLI | 비고 |
|-------------|------------|------|
| `SessionStart` | `SessionStart` | 동일 |
| `PreToolUse` | `BeforeTool` | 이름 변경 |
| `PostToolUse` | `AfterTool` | 이름 변경 |

### 5.2 현재 hooks.json (Claude Code)

```json
{
  "$schema": "https://json.schemastore.org/claude-code-hooks.json",
  "hooks": {
    "SessionStart": [...],
    "PreToolUse": [...],
    "PostToolUse": [...]
  }
}
```

### 5.3 gemini-extension.json의 hooks 섹션

```json
{
  "hooks": {
    "SessionStart": {
      "command": "node ${extensionPath}/hooks/session-start.js",
      "timeout": 5000,
      "once": true
    },
    "BeforeTool": [
      {
        "matcher": "Write|Edit",
        "command": "node ${extensionPath}/scripts/pre-write.js",
        "timeout": 5000
      }
    ],
    "AfterTool": [
      {
        "matcher": "Write",
        "command": "node ${extensionPath}/scripts/pdca-post-write.js",
        "timeout": 5000
      }
    ]
  }
}
```

### 5.4 스크립트 수정 사항

#### session-start.js 수정

```javascript
// 기존 (line 18)
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');

// 수정
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT
                 || process.env.GEMINI_EXTENSION_PATH
                 || path.resolve(__dirname, '..');

// 플랫폼 감지 추가
const PLATFORM = process.env.BKIT_PLATFORM
              || (process.env.GEMINI_SESSION_ID ? 'gemini' : 'claude');
```

#### 응답 형식 (양 플랫폼 호환)

```javascript
// 두 플랫폼 모두 동일한 JSON 응답 형식 지원
const response = {
  systemMessage: "bkit Vibecoding Kit v1.4.0 activated",
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: `...`
  }
};
```

---

## 6. lib/common.js 수정 계획

### 6.1 수정 위치 및 내용

#### 6.1.1 환경 변수 상수 (line 18-19)

**Before**:
```javascript
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
```

**After**:
```javascript
// Platform detection
const detectPlatform = () => {
  if (process.env.GEMINI_PROJECT_DIR || process.env.GEMINI_SESSION_ID) {
    return 'gemini';
  }
  if (process.env.CLAUDE_PLUGIN_ROOT || process.env.CLAUDE_PROJECT_DIR) {
    return 'claude';
  }
  return 'unknown';
};

const BKIT_PLATFORM = process.env.BKIT_PLATFORM || detectPlatform();

// Cross-platform environment variables
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT
                 || process.env.GEMINI_EXTENSION_PATH
                 || path.resolve(__dirname, '..');

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR
                 || process.env.GEMINI_PROJECT_DIR
                 || process.cwd();

// Export platform for scripts
const BKIT_PROJECT_DIR = PROJECT_DIR;
```

#### 6.1.2 새로운 유틸리티 함수

```javascript
// ============================================================
// 11. Platform Compatibility (v1.4.0)
// ============================================================

/**
 * Check if running in Gemini CLI environment
 * @returns {boolean}
 */
function isGeminiCli() {
  return BKIT_PLATFORM === 'gemini';
}

/**
 * Check if running in Claude Code environment
 * @returns {boolean}
 */
function isClaudeCode() {
  return BKIT_PLATFORM === 'claude';
}

/**
 * Get platform-specific path
 * @param {string} relativePath - Relative path from plugin root
 * @returns {string} Full path
 */
function getPluginPath(relativePath) {
  return path.join(PLUGIN_ROOT, relativePath);
}

/**
 * Get project path
 * @param {string} relativePath - Relative path from project root
 * @returns {string} Full path
 */
function getProjectPath(relativePath) {
  return path.join(PROJECT_DIR, relativePath);
}
```

#### 6.1.3 exports 추가 (line 691+)

```javascript
module.exports = {
  // ... existing exports ...

  // Platform Compatibility (v1.4.0)
  BKIT_PLATFORM,
  BKIT_PROJECT_DIR,
  isGeminiCli,
  isClaudeCode,
  getPluginPath,
  getProjectPath,
  detectPlatform
};
```

### 6.2 영향받는 스크립트 목록

다음 스크립트들은 `lib/common.js`를 사용하므로 자동으로 호환됩니다:

| 스크립트 | 사용하는 상수 | 상태 |
|---------|--------------|------|
| `hooks/session-start.js` | 직접 환경 변수 | 수정 필요 |
| `scripts/pre-write.js` | `PLUGIN_ROOT`, `PROJECT_DIR` | 자동 호환 |
| `scripts/pdca-post-write.js` | `PLUGIN_ROOT`, `PROJECT_DIR` | 자동 호환 |

---

## 7. Skills 호환성 검증

### 7.1 SKILL.md frontmatter 호환성

Claude Code와 Gemini CLI 모두 동일한 SKILL.md 형식을 지원합니다.

```yaml
---
name: skill-name
description: |
  Skill description with triggers.

  Triggers: keyword1, keyword2, 한글키워드
hooks:
  PreToolUse:           # Claude Code: PreToolUse
    - matcher: "Write"  # Gemini CLI: 동일하게 해석
      hooks:
        - type: command
          command: "..."
---
```

### 7.2 변경 불필요한 Skills (18개)

모든 18개 스킬은 frontmatter 형식이 호환되므로 변경이 필요하지 않습니다:

1. bkit-rules
2. bkit-templates
3. development-pipeline
4. starter
5. dynamic
6. enterprise
7. phase-1-schema ~ phase-9-deployment
8. mobile-app
9. desktop-app
10. zero-script-qa

### 7.3 hooks 필드 매핑 (자동 처리)

Gemini CLI는 SKILL.md의 hooks 필드를 읽을 때 `PreToolUse` → `BeforeTool`로 자동 매핑합니다.

---

## 8. 테스트 계획

### 8.1 단위 테스트

| # | 테스트 항목 | 테스트 방법 | 예상 결과 |
|---|-----------|-----------|----------|
| U-01 | TOML 문법 검증 | `toml-validator` | 모든 TOML 파일 파싱 성공 |
| U-02 | gemini-extension.json 스키마 | JSON Schema 검증 | 유효한 스키마 |
| U-03 | 환경 변수 분기 | Jest 단위 테스트 | 양 플랫폼 변수 인식 |
| U-04 | 플랫폼 감지 함수 | Jest 단위 테스트 | 올바른 플랫폼 반환 |

### 8.2 통합 테스트 (Claude Code)

| # | 테스트 항목 | 테스트 방법 | 예상 결과 |
|---|-----------|-----------|----------|
| I-01 | 기존 기능 regression | 모든 명령어 실행 | 기존과 동일하게 작동 |
| I-02 | SessionStart 훅 | 새 세션 시작 | bkit 활성화 메시지 |
| I-03 | PreToolUse 훅 | Write 도구 사용 | pre-write.js 실행 |
| I-04 | PostToolUse 훅 | Write 완료 | pdca-post-write.js 실행 |

### 8.3 통합 테스트 (Gemini CLI)

| # | 테스트 항목 | 테스트 방법 | 예상 결과 |
|---|-----------|-----------|----------|
| G-01 | Extension 설치 | `gemini extensions install` | 설치 성공 |
| G-02 | 명령어 로드 | `/pdca-status` 실행 | 상태 출력 |
| G-03 | SessionStart 훅 | 새 세션 시작 | bkit 활성화 메시지 |
| G-04 | BeforeTool 훅 | Write 도구 사용 | pre-write.js 실행 |
| G-05 | AfterTool 훅 | Write 완료 | pdca-post-write.js 실행 |
| G-06 | PDCA 워크플로우 | Plan→Design→Do→Check→Act | 전체 흐름 완료 |

### 8.4 E2E 테스트 시나리오

**시나리오: 새 기능 개발 워크플로우**

```
1. [Claude Code] /init-starter → Starter 프로젝트 초기화
2. [Gemini CLI] /init-starter → 동일한 결과 확인
3. [Both] /pdca-plan login → Plan 문서 생성
4. [Both] /pdca-design login → Design 문서 생성
5. [Both] "Login 구현해줘" → 자동 PDCA 적용
6. [Both] /pdca-analyze login → Gap 분석
7. [Both] /pdca-report login → 완료 보고서
```

### 8.5 Cross-platform 테스트

| 환경 | Claude Code | Gemini CLI |
|------|-------------|------------|
| macOS | ✅ | ✅ |
| Windows | ✅ | ✅ |
| Linux | ✅ | ✅ |

---

## 9. 구현 순서

### Phase 1: 기본 구조 생성 (Core)

1. `gemini-extension.json` 생성
2. `GEMINI.md` 생성
3. `lib/common.js` 환경 변수 분기 추가
4. `commands/gemini/` 폴더 생성

### Phase 2: Commands 변환

1. TOML 템플릿 작성
2. 20개 명령어 TOML 변환
3. 명령어별 테스트

### Phase 3: Hooks 변환

1. `hooks/session-start.js` 수정
2. `scripts/pre-write.js` 환경 변수 호환성 확인
3. `scripts/pdca-post-write.js` 환경 변수 호환성 확인

### Phase 4: Skills 검증

1. 18개 스킬 Gemini 호환성 검증
2. 트리거 키워드 작동 확인

### Phase 5: 테스트 및 문서화

1. 단위 테스트 실행
2. Claude Code 통합 테스트
3. Gemini CLI 통합 테스트
4. README.md 업데이트
5. 설치 가이드 작성

---

## 10. 파일 변경 요약

### 10.1 신규 생성 파일

| 파일 | 설명 |
|------|------|
| `gemini-extension.json` | Gemini CLI 매니페스트 |
| `GEMINI.md` | Gemini CLI 컨텍스트 |
| `commands/gemini/*.toml` | 20개 TOML 명령어 |

### 10.2 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `lib/common.js` | 플랫폼 감지 및 환경 변수 분기 |
| `hooks/session-start.js` | 환경 변수 호환성 |
| `README.md` | 듀얼 플랫폼 설치 방법 |

### 10.3 변경 없는 파일

| 카테고리 | 파일 수 | 이유 |
|----------|---------|------|
| Skills | 18 | frontmatter 호환 |
| Agents | 11 | Claude Code 전용 |
| Templates | 20 | 플랫폼 무관 |
| scripts/*.js | 21 | lib/common.js 통해 자동 호환 |

---

## 11. 위험 요소 및 대응

| 위험 | 영향도 | 대응 방안 |
|------|--------|----------|
| Gemini Hooks 실험적 | High | `enableHooks: true` 설정 필수 문서화 |
| TOML 명령어 로드 실패 | High | 경로 권한 검증, 상세 오류 로깅 |
| Windows 경로 문제 | Medium | `path.join()` 사용 철저 |
| 환경 변수 누락 | Medium | fallback 로직 완비 |

---

## 12. GitHub 설치 설계 (FR-10)

### 12.1 설치 방법

```bash
# Gemini CLI에서 GitHub 저장소 직접 설치
gemini extensions install https://github.com/popup-studio-ai/bkit-claude-code

# 또는 약식 (GitHub)
gemini extensions install popup-studio-ai/bkit-claude-code
```

### 12.2 gemini-extension.json 필수 필드

```json
{
  "name": "bkit",
  "version": "1.4.0",
  "repository": "https://github.com/popup-studio-ai/bkit-claude-code",
  "engines": {
    "gemini-cli": ">=1.0.0"
  }
}
```

### 12.3 설치 요구사항

- Node.js >= 18.0.0
- Gemini CLI >= 1.0.0
- Git (GitHub 설치 시)

### 12.4 설치 후 설정

```bash
# ~/.gemini/settings.json에 hooks 활성화 필요
{
  "tools": {
    "enableHooks": true
  }
}
```

---

## 13. PDCA 템플릿 호환성 (FR-06)

### 13.1 templates/ 폴더 구조

```
templates/
├── plan.template.md
├── design.template.md
├── analysis.template.md
├── report.template.md
└── CLAUDE.template.md
```

### 13.2 템플릿 변수 처리

템플릿은 플랫폼에 무관하게 동일한 변수를 사용합니다:

| 변수 | 설명 | 예시 |
|------|------|------|
| `{feature}` | 기능명 | `login` |
| `{date}` | 생성 날짜 | `2026-01-23` |
| `{author}` | 작성자 | `User` |
| `{PROJECT_NAME}` | 프로젝트명 | `my-app` |
| `{LEVEL}` | 프로젝트 레벨 | `Starter` |

### 13.3 템플릿 경로 조회 (lib/common.js)

```javascript
/**
 * Get template file path
 * @param {string} templateName - Template name (plan, design, analysis, report)
 * @returns {string} Full path to template
 */
function getTemplatePath(templateName) {
  return path.join(PLUGIN_ROOT, 'templates', `${templateName}.template.md`);
}
```

### 13.4 명령어에서 템플릿 사용

```javascript
// pdca-plan 명령어 예시
const templatePath = getTemplatePath('plan');
const template = fs.readFileSync(templatePath, 'utf8');
const content = template
  .replace(/{feature}/g, featureName)
  .replace(/{date}/g, new Date().toISOString().split('T')[0])
  .replace(/{author}/g, 'User');
```

---

## 14. 레벨 감지 상세 설계 (FR-07)

### 14.1 감지 로직 (lib/common.js - detectLevel)

```javascript
function detectLevel() {
  // 1. CLAUDE.md 또는 GEMINI.md에서 명시적 선언 확인
  const contextFiles = ['CLAUDE.md', 'GEMINI.md'];
  for (const file of contextFiles) {
    const filePath = path.join(PROJECT_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/^level:\s*(\w+)/im);
      if (match) {
        const level = match[1].toLowerCase();
        if (['starter', 'dynamic', 'enterprise'].includes(level)) {
          return level.charAt(0).toUpperCase() + level.slice(1);
        }
      }
    }
  }

  // 2. Enterprise 지표 확인
  const enterpriseDirs = ['kubernetes', 'terraform', 'k8s', 'infra/terraform'];
  for (const dir of enterpriseDirs) {
    if (fs.existsSync(path.join(PROJECT_DIR, dir))) {
      return 'Enterprise';
    }
  }

  // 3. Dynamic 지표 확인
  const dynamicIndicators = ['lib/bkend', 'supabase', 'src/features'];
  for (const indicator of dynamicIndicators) {
    if (fs.existsSync(path.join(PROJECT_DIR, indicator))) {
      return 'Dynamic';
    }
  }

  // 4. 기본값
  return 'Starter';
}
```

### 14.2 hooks/session-start.js 레벨 감지

```javascript
function detectProjectLevel() {
  const cwd = process.cwd();

  // Enterprise indicators
  const enterpriseIndicators = [
    'infra/terraform', 'infra/k8s', 'kubernetes'
  ];
  for (const indicator of enterpriseIndicators) {
    if (fs.existsSync(path.join(cwd, indicator))) {
      return 'enterprise';
    }
  }

  // Dynamic indicators
  const dynamicIndicators = [
    'src/features', 'src/services', 'lib/bkend', 'supabase'
  ];
  for (const indicator of dynamicIndicators) {
    if (fs.existsSync(path.join(cwd, indicator))) {
      return 'dynamic';
    }
  }

  return 'starter';
}
```

### 14.3 레벨별 동작 차이

| 레벨 | 설명 스타일 | 코드 주석 | 기본 스킬 |
|------|------------|----------|----------|
| Starter | 친절하고 상세 | 상세 | `starter` |
| Dynamic | 기술적이지만 명확 | 핵심 로직만 | `dynamic` |
| Enterprise | 간결, 전문 용어 | 아키텍처만 | `enterprise` |

---

## 15. 다국어 트리거 키워드 설계 (FR-08)

### 15.1 SKILL.md 트리거 형식

```yaml
---
name: gap-detector
description: |
  Agent that detects gaps between design documents and actual implementation.

  Triggers: gap analysis, design-implementation check, compare design, verify implementation,
  갭 분석, 설계-구현 비교, 검증, ギャップ分析, 設計検証, 差距分析, 对比设计

  Do NOT use for: documentation-only tasks, initial planning, or design creation.
---
```

### 15.2 지원 언어

| 언어 | 예시 키워드 |
|------|------------|
| English | gap analysis, verify, check, review |
| 한국어 | 갭 분석, 검증, 설계, 개선, 보고서 |
| 日本語 | ギャップ分析, 設計検証, 改善, レポート |
| 中文 | 差距分析, 对比设计, 验证, 改进 |

### 15.3 트리거 매칭 로직

Gemini CLI와 Claude Code 모두 동일한 트리거 매칭을 사용합니다:

```javascript
/**
 * Check if user message matches skill triggers
 * @param {string} userMessage - User input
 * @param {string} triggers - Comma-separated trigger keywords
 * @returns {boolean}
 */
function matchesTriggers(userMessage, triggers) {
  const keywords = triggers.split(',').map(k => k.trim().toLowerCase());
  const message = userMessage.toLowerCase();

  return keywords.some(keyword => message.includes(keyword));
}
```

### 15.4 스킬별 다국어 트리거 목록

| Skill | EN | KO | JA | ZH |
|-------|----|----|----|----|
| gap-detector | gap analysis, verify | 갭 분석, 검증 | ギャップ分析 | 差距分析 |
| pdca-iterator | iterate, improve | 반복 개선, 고쳐 | イテレーション | 迭代优化 |
| code-analyzer | code review, quality | 코드 분석, 품질 | コード分析 | 代码分析 |
| report-generator | report, summary | 보고서, 요약 | レポート | 报告 |
| qa-monitor | QA, test, log | QA, 테스트, 로그 | QA, ログ分析 | 日志分析 |
| design-validator | design, spec | 설계, 스펙 | 設計検証 | 设计验证 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-23 | Initial draft | Claude |
| 0.2 | 2026-01-23 | Added FR traceability matrix, FR-06/07/08/10 sections | Claude |
