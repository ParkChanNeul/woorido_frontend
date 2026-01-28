# Context Engineering Enhancement v1.4.2 Planning Document

> **Summary**: Claude Code Context Engineering 기능 강화를 통한 bkit 자동화 및 컨텍스트 관리 개선
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.2
> **Author**: AI Assistant
> **Date**: 2026-01-26
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Claude Code v2.1.19의 Context Engineering 기능(Memory System, Skills, Hooks, Subagents, Task Management)을 bkit에 더 깊이 통합하여:
- LLM 추론을 위한 최적의 컨텍스트 토큰 큐레이션
- 다중 레벨 컨텍스트 관리 체계 구축
- 모듈화된 컨텍스트 로딩(@import) 지원
- 스킬/에이전트 간 컨텍스트 격리(context: fork) 구현

### 1.2 Background

bkit v1.4.1은 이미 Context Engineering의 핵심 개념을 구현하고 있음:
- 18개 Skills (Domain Knowledge Layer)
- 11개 Agents (Behavioral Rules Layer)
- lib/common.js 76+ 함수 (State Management Layer)
- 5-Layer Hook System
- 8개 언어 Intent Detection

그러나 Claude Code의 최신 Context Engineering 기능과 비교 시 Gap이 존재:
- Multi-level Context Hierarchy 미구현
- @import directive 미지원
- context: fork isolation 미구현
- Hook 이벤트 제한 (4/12)

### 1.3 Related Documents

- References: `docs/04-report/99-deep-research-claude-code-2026-01.md`
- References: `docs/04-report/99-context-engineering-deep-dive-claude-code.md`
- Architecture: `bkit-system/README.md`
- Philosophy: `bkit-system/philosophy/context-engineering.md`

---

## 2. Scope

### 2.1 In Scope

- [x] **P1**: Multi-Level Context Hierarchy 구현
- [x] **P2**: @import Directive 지원 구현
- [x] **P3**: context: fork Skill Isolation 구현
- [x] **P4**: Enhanced Hook Events 추가
- [x] **P5**: Permission Hierarchy System 구현
- [x] **P6**: Task System Full Integration

### 2.2 Out of Scope

- Claude Code 내부 런타임 수정
- Gemini CLI 핵심 기능 변경
- 기존 PDCA workflow 파괴적 변경
- 하위 호환성 파괴

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| **FR-01** | Multi-Level Context Hierarchy: Plugin → User → Project → Session 4단계 컨텍스트 계층 구현 | High | Pending |
| **FR-02** | @import Directive: SKILL.md/Agent.md에서 외부 컨텍스트 파일 모듈 로딩 지원 | High | Pending |
| **FR-03** | Context Fork: skills frontmatter에 `context: fork` 옵션 추가하여 독립 컨텍스트 실행 | High | Pending |
| **FR-04** | Hook Events 확장: UserPrompt, Notification 이벤트 지원 | Medium | Pending |
| **FR-05** | Permission Hierarchy: deny → ask → allow 3단계 권한 체계 구현 | Medium | Pending |
| **FR-06** | Task Dependency Chain: PDCA 단계별 Task blocking/dependency 자동 설정 | Medium | Pending |
| **FR-07** | Context Compaction Hook: 컨텍스트 압축 시점에 PDCA 상태 보존 로직 | Medium | Pending |
| **FR-08** | MEMORY Variable Support: 세션 간 영속 데이터 저장 메커니즘 | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Hook 실행 시간 < 500ms | Debug logging timestamp |
| Compatibility | Claude Code v2.1.x + Gemini CLI v1.x 동시 지원 | Cross-platform test |
| Maintainability | 기존 테스트 96%+ 통과율 유지 | Jest + TestRunner |
| Backward Compat | v1.4.1 설정/상태 파일 자동 마이그레이션 | Migration test |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] All FR-01~FR-08 구현 완료
- [ ] bkit-system 문서 업데이트
- [ ] Unit tests 작성 및 통과
- [ ] Integration tests 통과
- [ ] CHANGELOG.md 업데이트

### 4.2 Quality Criteria

- [ ] Test coverage 90%+ (신규 코드)
- [ ] 기존 테스트 96%+ 통과율 유지
- [ ] Zero lint errors
- [ ] Build succeeds (Claude Code + Gemini CLI)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Claude Code 내부 API 변경 | High | Low | Version pinning, Abstraction layer |
| 컨텍스트 크기 폭증 | Medium | Medium | TTL 기반 캐싱, 선택적 로딩 |
| 기존 workflow 호환성 파괴 | High | Low | Extensive regression testing |
| Multi-level hierarchy 복잡성 | Medium | Medium | 단계적 구현 (P1 → P2 → P3) |
| Gemini CLI 지원 불일치 | Medium | Medium | Platform abstraction in lib/common.js |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules | Web apps with backend | ☐ |
| **Enterprise** | Strict layer separation | High-traffic systems | ☑ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Context Storage | JSON file / In-memory / Hybrid | Hybrid | PDCA Status v2.0 확장 |
| Import Resolution | Sync / Async | Sync | Hook 타이밍 보장 |
| Fork Isolation | Process / Context Copy | Context Copy | 성능 최적화 |
| Permission Check | Pre-hook / Runtime | Pre-hook | 일관성 |

### 6.3 Context Engineering Architecture

```
v1.4.2 Context Engineering Enhancement
┌─────────────────────────────────────────────────────────────────┐
│                 Multi-Level Context Hierarchy                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  L1: Plugin Policy (bkit defaults)                              │
│       └── bkit.config.json + GEMINI.md/CLAUDE.md                │
│                                                                  │
│  L2: User Config (~/.claude/bkit/ or ~/.gemini/bkit/)           │
│       └── user-preferences.json + custom rules                   │
│                                                                  │
│  L3: Project Context (docs/.pdca-status.json)                   │
│       └── PDCA Status v2.0 + @import resolved                   │
│                                                                  │
│  L4: Session Context (in-memory)                                │
│       └── Active features + current task + iteration state      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    @import Directive Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SKILL.md / Agent.md                                            │
│       │                                                          │
│       ├── @import ./shared/api-patterns.md                      │
│       ├── @import ../templates/error-handling.md                │
│       └── @import ${PROJECT}/conventions.md                     │
│                                                                  │
│  lib/common.js: resolveImports()                                │
│       │                                                          │
│       ├── Path resolution (relative, absolute, variable)        │
│       ├── Circular dependency detection                         │
│       └── TTL-based caching                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Context Fork Isolation                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Main Context                                                    │
│       │                                                          │
│       ├── Skill A (context: shared) → Modifies main context     │
│       │                                                          │
│       └── Skill B (context: fork)                               │
│                │                                                 │
│                └── Isolated copy                                 │
│                        │                                         │
│                        ├── Local modifications                  │
│                        └── Result merged back (optional)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Plan

### 7.1 Phase 1: Multi-Level Context Hierarchy (FR-01)

**Files to Modify:**
- `lib/common.js`: 새 함수 추가
  - `getContextHierarchy()`: 4단계 컨텍스트 로딩
  - `mergeContextLevels()`: 우선순위 기반 병합
  - `getUserConfig()`: 사용자 설정 로딩

**New Files:**
- `lib/context-hierarchy.js`: 컨텍스트 계층 관리 모듈

**Test Cases:**
- L1~L4 개별 로딩 테스트
- 계층 병합 우선순위 테스트
- 누락 레벨 fallback 테스트

### 7.2 Phase 2: @import Directive (FR-02)

**Files to Modify:**
- `lib/common.js`: 새 함수 추가
  - `resolveImports()`: @import 디렉티브 해석
  - `loadImportedContent()`: 외부 파일 로딩
  - `detectCircularImport()`: 순환 참조 감지

**New Files:**
- `lib/import-resolver.js`: @import 처리 모듈

**Syntax:**
```markdown
<!-- In SKILL.md or Agent.md frontmatter -->
imports:
  - ./shared/api-patterns.md
  - ${PLUGIN_ROOT}/templates/error-handling.md
  - ${PROJECT}/conventions.md
```

### 7.3 Phase 3: Context Fork (FR-03)

**Files to Modify:**
- `lib/common.js`: 새 함수 추가
  - `forkContext()`: 컨텍스트 복제
  - `mergeForkedContext()`: 격리 결과 병합
  - `isForkedExecution()`: fork 상태 확인

**Frontmatter Extension:**
```yaml
---
name: isolated-skill
context: fork  # NEW: fork | shared (default)
mergeResult: true  # NEW: merge result back to parent
---
```

### 7.4 Phase 4: Enhanced Hook Events (FR-04)

**Files to Modify:**
- `hooks/hooks.json`: 새 이벤트 추가
- `gemini-extension.json`: Gemini CLI용 이벤트 매핑

**New Events:**
- `UserPrompt`: 사용자 입력 직후
- `Notification`: 시스템 알림 시점

### 7.5 Phase 5: Permission Hierarchy (FR-05)

**Files to Modify:**
- `lib/common.js`: 새 함수 추가
  - `checkPermission()`: deny → ask → allow 체크
  - `getToolPermission()`: 도구별 권한 조회

**Permission Schema:**
```json
{
  "permissions": {
    "Write": "allow",
    "Bash(rm*)": "deny",
    "Bash(git push)": "ask"
  }
}
```

### 7.6 Phase 6: Task System Integration (FR-06)

**Files to Modify:**
- `lib/common.js`: 기존 함수 강화
  - `generatePdcaTaskSubject()`: dependency chain 자동 설정
  - `autoCreatePdcaTask()`: PDCA 단계 변경 시 Task 자동 생성

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `bkit-system/` architecture documentation
- [x] ESLint configuration (`.eslintrc.*`) - N/A (plugin)
- [x] Node.js scripts convention (lib/common.js pattern)

### 8.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Context file format** | exists | @import syntax | High |
| **Permission schema** | missing | deny/ask/allow | High |
| **Fork merge rules** | missing | merge strategy | Medium |
| **Hook event naming** | exists | new events | Medium |

---

## 9. Next Steps

1. [ ] Write design document (`context-engineering-enhancement.design.md`)
2. [ ] Phase 1 구현: Multi-Level Context Hierarchy
3. [ ] Phase 2 구현: @import Directive
4. [ ] Phase 3 구현: Context Fork
5. [ ] Phase 4-6 구현: Enhanced hooks, permissions, tasks
6. [ ] Integration testing
7. [ ] Documentation update
8. [ ] Release v1.4.2

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial draft based on Gap Analysis | AI Assistant |
