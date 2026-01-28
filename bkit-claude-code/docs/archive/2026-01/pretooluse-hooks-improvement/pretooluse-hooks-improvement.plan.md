# PreToolUse Hooks Improvement Planning Document

> **Summary**: bkit의 PreToolUse hooks 안정성 향상 및 Best Practice 적용
>
> **Project**: bkit-claude-code
> **Version**: v1.4.2
> **Author**: Claude Code
> **Date**: 2026-01-26
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

bkit의 PreToolUse hooks 구현에서 발견된 잠재적 문제점을 해결하고, Claude Code 공식 문서 및 커뮤니티 Best Practice를 적용하여 안정성과 신뢰성을 향상시킨다.

### 1.2 Background

**조사 결과 요약:**

1. **코드베이스 분석** (Task #1)
   - 8가지 잠재적 문제점 발견
   - 에러 처리 미흡, 동기 파일 접근 성능 이슈 등

2. **공식 문서 조사** (Task #2)
   - PreToolUse 입출력 스키마 확인
   - 올바른 응답 형식: `permissionDecision` + `hookSpecificOutput`

3. **GitHub Issues 조사** (Task #3)
   - **Issue #16598**: `permissionDecision: "allow"` 간헐적 크래시 (미해결)
   - **Issue #4362**: 잘못된 output 형식 사용 시 차단 실패
   - **Issue #13339**: VS Code에서 "ask" 무시
   - **Best Practice**: Exit Code 2 차단이 가장 안정적

### 1.3 Related Documents

- 코드베이스: `hooks/hooks.json`, `scripts/pre-write.js`, `lib/common.js`
- 공식 문서: https://code.claude.com/docs/en/hooks
- GitHub Issues: https://github.com/anthropics/claude-code/issues

---

## 2. Scope

### 2.1 In Scope

- [x] PreToolUse hook 출력 형식 안정화 (Exit Code 2 기반)
- [x] 에러 처리 강화 (stdin 파싱, 파일 접근)
- [x] `outputAllow()` 함수 안정성 개선
- [x] `outputBlock()` 함수 Best Practice 적용
- [x] Context 메시지 길이 제한 추가
- [x] 프로덕션 로깅 전략 수립

### 2.2 Out of Scope

- PostToolUse hooks 개선 (별도 계획)
- SessionStart hooks 개선 (별도 계획)
- Gemini CLI 지원 개선 (별도 계획)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `permissionDecision: "allow"` 대신 Exit Code 0 + 빈 JSON 사용 | High | Pending |
| FR-02 | 차단 시 Exit Code 2 + stderr 사용 (가장 안정적) | High | Pending |
| FR-03 | stdin JSON 파싱 에러 시 로깅 추가 | Medium | Pending |
| FR-04 | Context 메시지 최대 500자 제한 | Medium | Pending |
| FR-05 | PDCA 상태 업데이트 실패 시 graceful 처리 | Medium | Pending |
| FR-06 | 파일 접근 최적화 (캐싱 또는 병렬화) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Hook 실행 시간 < 1초 | timeout 모니터링 |
| Reliability | 크래시 0건 | GitHub Issues 모니터링 |
| Compatibility | Claude Code v2.0.10+ 지원 | 버전 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] 모든 FR 구현 완료
- [x] Exit Code 기반 차단 테스트 통과
- [x] `permissionDecision: "allow"` 제거 또는 fallback 추가
- [x] 에러 로깅 동작 확인

### 4.2 Quality Criteria

- [x] Hook 실행 중 크래시 없음
- [x] Context 메시지 500자 이내
- [x] 기존 기능 regression 없음

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `permissionDecision: "allow"` 간헐적 크래시 | High | Medium | Exit Code 0 + 빈 JSON으로 대체 |
| VS Code에서 "ask" 무시 | Medium | High | "ask" 대신 "deny" 사용 |
| 기존 기능 regression | High | Low | 단계별 테스트, rollback 계획 |
| 타임아웃 (5초) 초과 | Medium | Low | 파일 접근 최적화 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules | Web apps with backend | ☒ |
| **Enterprise** | Strict layer separation | Complex architectures | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 차단 방식 | JSON / Exit Code 2 | Exit Code 2 | GitHub Issue #16598 회피 |
| 허용 방식 | JSON allow / Exit 0 + {} | Exit 0 + {} | 간헐적 크래시 방지 |
| 로깅 | BKIT_DEBUG / Always | Hybrid | 중요 에러만 항상 로깅 |

### 6.3 Output Function 개선 구조

```
현재 구조:
┌─────────────────────────────────────────────────────┐
│ outputAllow(context, 'PreToolUse')                  │
│   → JSON { permissionDecision: "allow" }            │
│   → ⚠️ Issue #16598: 간헐적 크래시                  │
└─────────────────────────────────────────────────────┘

개선 구조:
┌─────────────────────────────────────────────────────┐
│ outputAllow(context, 'PreToolUse')                  │
│   → JSON { hookSpecificOutput: { additionalContext }}│
│   → Exit Code 0 (allow는 명시하지 않음)             │
│   → ✅ 안정적 동작                                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ outputBlock(reason)                                 │
│   → stderr: reason                                  │
│   → Exit Code 2                                     │
│   → ✅ 가장 안정적인 차단 방식                      │
└─────────────────────────────────────────────────────┘
```

---

## 7. Implementation Plan

### Phase 1: Critical Fixes (High Priority)

| Task | File | Changes | Est. Lines |
|------|------|---------|------------|
| 1.1 | `lib/common.js` | `outputAllow()` 개선 - `permissionDecision: "allow"` 제거 | ~20 |
| 1.2 | `lib/common.js` | `outputBlock()` 개선 - Exit Code 2 + stderr 강화 | ~15 |
| 1.3 | `lib/common.js` | Context 메시지 길이 제한 (500자) 추가 | ~10 |

### Phase 2: Error Handling (Medium Priority)

| Task | File | Changes | Est. Lines |
|------|------|---------|------------|
| 2.1 | `lib/common.js` | `readStdinSync()` 에러 로깅 추가 | ~10 |
| 2.2 | `lib/common.js` | `updatePdcaStatus()` 실패 처리 개선 | ~15 |
| 2.3 | `lib/common.js` | Critical 에러는 BKIT_DEBUG 없이도 로깅 | ~20 |

### Phase 3: Optimization (Low Priority)

| Task | File | Changes | Est. Lines |
|------|------|---------|------------|
| 3.1 | `lib/common.js` | `findDesignDoc()` 캐싱 개선 | ~15 |
| 3.2 | `lib/common.js` | 중복 캐싱 메커니즘 통일 | ~30 |

---

## 8. Detailed Changes

### 8.1 outputAllow() 개선 (FR-01)

**Before:**
```javascript
if (hookEvent === 'PreToolUse') {
  console.log(JSON.stringify({
    decision: 'allow',
    hookSpecificOutput: {
      permissionDecision: 'allow',  // ⚠️ 간헐적 크래시
      permissionDecisionReason: context
    }
  }));
}
```

**After:**
```javascript
if (hookEvent === 'PreToolUse') {
  // Issue #16598 회피: permissionDecision: "allow" 제거
  // Exit Code 0만으로 허용 의미 전달
  if (context) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        additionalContext: truncateContext(context, 500)
      }
    }));
  } else {
    console.log('{}');
  }
}
```

### 8.2 outputBlock() 개선 (FR-02)

**Before:**
```javascript
function outputBlock(reason) {
  console.log(JSON.stringify({
    decision: 'block',
    reason: reason
  }));
  process.exit(2);
}
```

**After:**
```javascript
function outputBlock(reason) {
  // Best Practice: stderr + Exit Code 2 (가장 안정적)
  console.error(reason);  // stderr로 출력
  process.exit(2);        // JSON은 무시됨
}
```

### 8.3 Context 길이 제한 (FR-04)

**New:**
```javascript
function truncateContext(context, maxLength = 500) {
  if (!context || context.length <= maxLength) return context;
  return context.substring(0, maxLength - 3) + '...';
}
```

---

## 9. Testing Plan

### 9.1 Unit Tests

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Allow with context | context="test" | `{ hookSpecificOutput: { additionalContext: "test" }}` + exit 0 |
| Allow without context | context="" | `{}` + exit 0 |
| Block with reason | reason="blocked" | stderr: "blocked" + exit 2 |
| Long context | 600자 context | 500자로 truncate |

### 9.2 Integration Tests

| Scenario | Steps | Expected |
|----------|-------|----------|
| Write 허용 | Write 도구 호출 | Hook 실행, 파일 생성됨 |
| Write 차단 | 위험 경로 Write | Hook exit 2, 파일 생성 안됨 |
| VS Code 호환 | VS Code에서 실행 | 크래시 없음 |

---

## 10. Convention Prerequisites

### 10.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] ESLint configuration (`.eslintrc.*`)
- [x] Prettier configuration (`.prettierrc`)

### 10.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| Exit Codes | 혼재 (0, 1, 2) | 0=allow, 2=block | High |
| Error Logging | BKIT_DEBUG 필수 | Critical은 항상 | Medium |

---

## 11. Next Steps

1. [ ] Write design document (`pretooluse-hooks-improvement.design.md`)
2. [ ] Team review and approval
3. [ ] Phase 1 구현 (Critical Fixes)
4. [ ] Phase 2 구현 (Error Handling)
5. [ ] Phase 3 구현 (Optimization)

---

## 12. References

### GitHub Issues

| Issue | Title | Status | Impact |
|-------|-------|--------|--------|
| #16598 | `permissionDecision: "allow"` 간헐적 크래시 | Open | High |
| #4362 | PreToolUse가 tool 실행을 차단하지 못함 | Closed | Medium |
| #13339 | VS Code Extension이 "ask" 무시 | Open | Medium |
| #3148 | Wildcard Matcher `*` 동작 안함 | Closed | Low |
| #2814 | Hooks 시스템 전반적 문제 | Open | Medium |

### Best Practices Summary

| Practice | Source | Applied |
|----------|--------|:-------:|
| Exit Code 2로 차단 | DataCamp Tutorial | ☐ |
| `permissionDecision: "allow"` 회피 | GitHub Issue #16598 | ☐ |
| "ask" 대신 "deny" 사용 (VS Code) | GitHub Issue #13339 | ☐ |
| Context 길이 제한 | bkit 자체 분석 | ☐ |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial draft based on Task #1-3 research | Claude Code |
