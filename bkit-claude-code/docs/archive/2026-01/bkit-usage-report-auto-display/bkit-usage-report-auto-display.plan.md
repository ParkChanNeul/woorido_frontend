# bkit 기능 사용 현황 자동 보고 기능 계획서

> **Summary**: AI Agent가 매 답변 끝에 bkit 기능 사용 현황을 자동으로 보고하는 기능
>
> **Project**: bkit Vibecoding Kit
> **Version**: v1.4.1 (예정)
> **Author**: bkit Team
> **Date**: 2026-01-24
> **Status**: Complete

---

## 1. Overview

### 1.1 Purpose

사용자와 AI Agent 간의 대화에서 bkit 플러그인의 어떤 기능이 사용되었는지, 사용하지 않은 기능은 무엇인지, 다음 작업에 어떤 기능을 사용하면 좋을지를 **매 답변 끝에 자동으로 보고**합니다.

### 1.2 Background

- 사용자가 bkit 기능 활용 현황을 실시간으로 파악하기 어려움
- 어떤 bkit 기능을 사용했는지 매번 수동으로 질문해야 함
- 다음 단계에서 사용 가능한 기능 안내가 부족함
- bkit 학습 및 활용도 향상을 위해 자동 보고 필요

### 1.3 Goals

1. 매 답변 끝에 bkit 기능 사용 현황 자동 표시
2. Claude Code CLI와 Gemini CLI 모두 지원
3. 사용/미사용 기능 명확히 구분
4. 다음 작업에 적합한 기능 추천

### 1.4 Related Documents

- [Claude Code Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks)
- [Gemini CLI Configuration](https://geminicli.com/docs/get-started/configuration/)
- GitHub Issues:
  - [Claude Code #10373: SessionStart hooks not working for new conversations](https://github.com/anthropics/claude-code/issues/10373)
  - [Gemini CLI #2779: Implement a Hooks System](https://github.com/google-gemini/gemini-cli/issues/2779)

---

## 2. Research Findings

### 2.1 Claude Code CLI

#### 2.1.1 SessionStart Hook 현황

| 항목 | 상태 | 비고 |
|------|:----:|------|
| SessionStart 실행 | ✅ | hook 실행됨 |
| additionalContext 주입 | ⚠️ | 새 세션에서 버그 있음 (#10373) |
| /clear, /compact 트리거 | ✅ | 정상 동작 |
| 새 세션 트리거 | ❌ | 버그로 인해 출력 무시됨 |

#### 2.1.2 알려진 버그 (Issue #10373)

```
문제: SessionStart hooks가 새 대화에서 실행되지만 출력이 무시됨
상태: OPEN (2025-10-26 ~ 현재)
영향: additionalContext가 새 세션에서 주입되지 않음
Workaround: /clear 명령으로 hook 재트리거
```

#### 2.1.3 additionalContext 작동 방식

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "이 문자열이 Claude 컨텍스트에 주입됨"
  }
}
```

- 여러 hook의 additionalContext 값은 연결(concatenate)됨
- 시스템 프롬프트에 추가되어 Claude 동작에 영향

### 2.2 Gemini CLI

#### 2.2.1 Hooks 시스템 현황

| 항목 | 상태 | 비고 |
|------|:----:|------|
| Hooks 시스템 | ⚠️ | Feature Request 상태 (#2779) |
| PreToolUse/PostToolUse | ❌ | 미구현 |
| BeforeModel/AfterModel | ❌ | 제안됨 (미구현) |
| GEMINI.md 지원 | ✅ | 프로젝트 규칙 파일 |
| GEMINI_SYSTEM_MD | ✅ | 시스템 프롬프트 오버라이드 |

#### 2.2.2 현재 bkit Gemini 지원 방식

```javascript
// session-start.js에서 plain text 출력
console.log(`🤖 bkit Vibecoding Kit v1.4.0 (Gemini Edition)`);
```

- Gemini CLI는 hooks 시스템이 없어 GEMINI.md 파일 기반 규칙 사용
- SessionStart hook이 있으나 출력이 시스템 프롬프트에 주입되지 않음

### 2.3 플랫폼별 구현 전략

| 플랫폼 | 구현 방식 | 신뢰도 |
|--------|----------|:------:|
| Claude Code | additionalContext에 규칙 추가 | ⚠️ 버그 있음 |
| Gemini CLI | GEMINI.md 파일에 규칙 추가 | ✅ 안정적 |

---

## 3. Scope

### 3.1 In Scope

- [x] SessionStart hook의 additionalContext 수정
- [x] 보고 형식 템플릿 정의
- [x] Claude Code CLI 지원
- [x] Gemini CLI 지원 (GEMINI.md 방식)
- [x] 보고 내용 정의:
  - 사용한 bkit 기능
  - 미사용 기능 (이유 포함)
  - 추천 기능 (다음 작업)

### 3.2 Out of Scope

- 실시간 기능 추적 시스템 (복잡도 높음)
- 사용 통계 저장 (프라이버시 이슈)
- 보고서 비활성화 옵션 (추후 고려)

---

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|:--------:|:------:|
| FR-01 | 매 답변 끝에 bkit 기능 현황 표시 | Critical | ✅ Complete |
| FR-02 | Claude Code CLI에서 동작 | Critical | ✅ Complete |
| FR-03 | Gemini CLI에서 동작 | High | ✅ Complete |
| FR-04 | 사용한 기능 목록 표시 | Critical | ✅ Complete |
| FR-05 | 미사용 기능 및 이유 표시 | High | ✅ Complete |
| FR-06 | 다음 작업 추천 기능 표시 | High | ✅ Complete |
| FR-07 | PDCA 단계별 컨텍스트 반영 | Medium | ✅ Complete |

### 4.2 Non-Functional Requirements

| ID | Requirement | Criteria |
|----|-------------|----------|
| NFR-01 | 성능 | hook 실행 < 1초 |
| NFR-02 | 가독성 | 깔끔한 테이블/박스 형식 |
| NFR-03 | 간결성 | 3~5줄 이내로 요약 |
| NFR-04 | 호환성 | Claude Code 2.1.19+, Gemini CLI 최신 |

---

## 5. Proposed Solution

### 5.1 보고 형식 템플릿

```markdown
─────────────────────────────────────────────────
📊 bkit 기능 사용 현황
─────────────────────────────────────────────────
✅ 사용: /pdca-plan, TaskCreate, AskUserQuestion
⏭️ 미사용: gap-detector (Plan 단계에서 불필요)
💡 추천: /pdca-design으로 설계 단계 진행
─────────────────────────────────────────────────
```

### 5.2 구현 위치

#### 5.2.1 Claude Code (Primary)

**파일**: `hooks/session-start.js`

**수정 내용**: additionalContext에 보고 규칙 추가

```javascript
additionalContext += `
## 📊 bkit 기능 현황 보고 (매 답변 필수)

**모든 답변 끝에 아래 형식으로 보고:**

\`\`\`
─────────────────────────────────────────────────
📊 bkit 기능 사용 현황
─────────────────────────────────────────────────
✅ 사용: [이번 답변에서 사용한 bkit 기능]
⏭️ 미사용: [사용하지 않은 기능] (이유)
💡 추천: [다음 작업에 적합한 기능]
─────────────────────────────────────────────────
\`\`\`

### 보고 대상 기능:
- PDCA Commands: /pdca-plan, /pdca-design, /pdca-analyze, /pdca-report, /pdca-next, /pdca-status
- Task System: TaskCreate, TaskUpdate, TaskList, TaskGet
- Hooks: SessionStart, PreToolUse, PostToolUse
- Agents: gap-detector, pdca-iterator, code-analyzer, report-generator 등
- Skills: starter, dynamic, enterprise, phase-1~9 등
- Tools: AskUserQuestion, Read, Write, Edit, Bash, Grep, Glob 등

### 보고 규칙:
1. bkit 관련 기능만 보고 (일반 도구는 제외 가능)
2. 미사용 기능은 "왜 사용하지 않았는지" 간단히 설명
3. 현재 PDCA 단계에 맞는 추천 제공
`;
```

#### 5.2.2 Gemini CLI (Secondary)

**파일**: `.gemini/GEMINI.md` (또는 프로젝트 루트)

**추가 내용**: 동일한 보고 규칙

### 5.3 기능 카테고리 분류

| 카테고리 | 기능 목록 |
|----------|----------|
| PDCA Commands | /pdca-plan, /pdca-design, /pdca-analyze, /pdca-report, /pdca-next, /pdca-status, /pdca-iterate |
| Pipeline Commands | /pipeline-start, /pipeline-next, /pipeline-status |
| Init Commands | /init-starter, /init-dynamic, /init-enterprise |
| Task System | TaskCreate, TaskUpdate, TaskList, TaskGet |
| Agents | gap-detector, pdca-iterator, code-analyzer, report-generator, starter-guide, bkend-expert 등 |
| Skills | starter, dynamic, enterprise, phase-1~9, zero-script-qa 등 |
| Hooks | SessionStart, PreToolUse, PostToolUse |
| Utilities | /archive, /upgrade-level, /learn-claude-code 등 |

---

## 6. Implementation Plan

### 6.1 Phase 1: Core Implementation

| Task | Description | Priority |
|------|-------------|:--------:|
| 1.1 | session-start.js additionalContext 수정 | Critical |
| 1.2 | 보고 템플릿 정의 | Critical |
| 1.3 | 기능 카테고리 정의 | High |

### 6.2 Phase 2: Platform Support

| Task | Description | Priority |
|------|-------------|:--------:|
| 2.1 | Claude Code 테스트 | Critical |
| 2.2 | Gemini CLI GEMINI.md 업데이트 | High |
| 2.3 | 크로스 플랫폼 테스트 | High |

### 6.3 Phase 3: Enhancement (Optional)

| Task | Description | Priority |
|------|-------------|:--------:|
| 3.1 | PDCA 단계별 추천 로직 | Medium |
| 3.2 | 보고 비활성화 옵션 | Low |
| 3.3 | 보고 형식 커스터마이징 | Low |

---

## 7. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|:------:|:----------:|------------|
| SessionStart 버그 (#10373) | High | High | /clear workaround 문서화, 버그 수정 시 자동 해결 |
| Gemini CLI hooks 미지원 | Medium | High | GEMINI.md 방식으로 대체 |
| 보고가 너무 장황함 | Medium | Medium | 간결한 3줄 형식 유지 |
| 성능 저하 | Low | Low | hook timeout 5초 유지 |

---

## 8. Success Criteria

### 8.1 Definition of Done

- [ ] Claude Code에서 매 답변 끝에 보고 표시
- [ ] Gemini CLI에서 매 답변 끝에 보고 표시
- [ ] 보고 형식이 일관됨
- [ ] PDCA 단계에 맞는 추천 제공
- [ ] 테스트 완료

### 8.2 Acceptance Criteria

| Criteria | Measurement |
|----------|-------------|
| 보고 표시율 | 95%+ 답변에 보고 포함 |
| 가독성 | 3~5줄 이내 |
| 정확성 | 사용한 기능이 정확히 표시됨 |

---

## 9. Next Steps

1. [ ] 이 Plan 승인
2. [ ] `/pdca-design bkit-usage-report-auto-display` 실행
3. [ ] session-start.js 수정
4. [ ] 테스트 및 검증
5. [ ] `/pdca-analyze` 실행

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-24 | Initial draft with research findings | bkit Team |
