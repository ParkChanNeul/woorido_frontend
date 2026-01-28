# PreToolUse Hooks Improvement Design Document

> **Summary**: bkit의 PreToolUse hooks 안정성 향상을 위한 상세 설계서 (6가지 요구사항 구현)
>
> **Project**: bkit-claude-code
> **Version**: v1.4.2
> **Author**: Claude Code
> **Date**: 2026-01-26
> **Status**: Draft
> **Planning Doc**: [pretooluse-hooks-improvement.plan.md](../01-plan/features/pretooluse-hooks-improvement.plan.md)

---

## 1. Overview

### 1.1 Design Goals

6가지 요구사항(FR-01~FR-06)을 충족하여 PreToolUse hooks의 안정성과 신뢰성 향상

### 1.2 Design Principles

- **안정성 우선**: GitHub Issue #16598 회피를 위한 안전한 출력 형식 사용
- **명시적 에러 처리**: Silent failure 제거, 모든 에러 로깅
- **일관성**: 모든 hook 스크립트에서 동일한 패턴 적용

---

## 2. 현재 코드베이스 분석 결과

### 2.1 디렉토리별 분석 요약

| 디렉토리 | 파일 수 | PreToolUse 관련 | 수정 필요 |
|----------|--------|----------------|----------|
| agents/ | 11 | 3개 파일 hooks 설정 | 1개 (code-analyzer.md) |
| commands/ | 21 | 없음 | 없음 |
| hooks/ | 2 | hooks.json (설정) | 없음 |
| lib/ | 1 | **핵심** common.js | **6개 함수** |
| scripts/ | 26 | 20개 hook 스크립트 | **7개 파일** |
| skills/ | 18 | 3개 PreToolUse 설정 | 1개 (phase-9) |
| templates/ | 20 | 없음 | 없음 |

### 2.2 수정 대상 파일 목록

#### 핵심 수정 (lib/common.js)

| 함수 | 라인 | 문제점 | FR |
|------|------|--------|-----|
| `outputAllow()` | 509-551 | `permissionDecision: "allow"` 간헐적 크래시 | FR-01 |
| `outputBlock()` | 553-570 | stdout 사용 (stderr 권장) | FR-02 |
| `readStdinSync()` | 651-659 | JSON 파싱 에러 silent failure | FR-03 |
| (신규) | N/A | Context 길이 제한 없음 | FR-04 |
| `updatePdcaStatus()` | 1092-1189 | 실패 시 void 반환 | FR-05 |
| `findDesignDoc()` | 370-383 | 읽기 권한 검증 없음 | FR-06 |

#### scripts/ 파일 수정 (outputAllow 타입 파라미터 누락)

| 파일 | 라인 | 현재 코드 | 수정 필요 |
|------|------|----------|----------|
| gap-detector-post.js | 23 | `outputAllow(message)` | `outputAllow(message, 'PostToolUse')` |
| pdca-post-write.js | 71 | `outputAllow(context)` | `outputAllow(context, 'PostToolUse')` |
| phase5-design-post.js | 58 | `outputAllow(...)` | `outputAllow(..., 'PostToolUse')` |
| phase6-ui-post.js | 33, 40 | `outputAllow(message)` | `outputAllow(message, 'PostToolUse')` |
| qa-monitor-post.js | 32, 38 | `outputAllow(message)` | `outputAllow(message, 'PostToolUse')` |

#### agents/ 파일 수정

| 파일 | 문제점 |
|------|--------|
| code-analyzer.md | echo 인라인 방식 대신 스크립트 파일 권장 |

#### skills/ 파일 수정

| 파일 | 문제점 |
|------|--------|
| phase-9-deployment/SKILL.md | PreToolUse hook에 timeout 미지정 |

---

## 3. 상세 설계

### 3.1 FR-01: outputAllow() 개선

**목표**: `permissionDecision: "allow"` 간헐적 크래시 회피 (GitHub Issue #16598)

**현재 구현** (lib/common.js:525-537):
```javascript
if (hookEvent === 'PreToolUse') {
  console.log(JSON.stringify({
    decision: 'allow',
    hookSpecificOutput: {
      permissionDecision: 'allow',         // ⚠️ 크래시 원인
      permissionDecisionReason: context
    }
  }));
}
```

**개선 설계**:
```javascript
if (hookEvent === 'PreToolUse') {
  // GitHub Issue #16598 회피: permissionDecision 제거
  // Exit Code 0만으로 허용 의미 전달
  if (context) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        additionalContext: truncateContext(context, MAX_CONTEXT_LENGTH)
      }
    }));
  } else {
    console.log('{}');
  }
}
```

**변경 사항**:
1. `permissionDecision: 'allow'` 제거
2. `permissionDecisionReason` → `additionalContext`로 변경
3. `truncateContext()` 함수 추가 (FR-04 연계)

**수정 위치**: `lib/common.js` 라인 525-537

---

### 3.2 FR-02: outputBlock() 개선

**목표**: Exit Code 2 + stderr 사용으로 안정적인 차단

**현재 구현** (lib/common.js:561-568):
```javascript
// Claude Code: Print JSON and exit 2 (Claude convention)
console.log(JSON.stringify({
  decision: 'block',
  reason: reason
}));
process.exit(2);
```

**개선 설계**:
```javascript
// Claude Code: Best Practice - stderr + Exit Code 2
// JSON stdout은 Exit Code 2에서 무시됨 (공식 문서)
console.error(reason);  // stderr로 출력
process.exit(2);
```

**변경 사항**:
1. `console.log(JSON.stringify(...))` → `console.error(reason)` 변경
2. JSON 출력 제거 (Exit Code 2에서 무시됨)

**수정 위치**: `lib/common.js` 라인 561-568

---

### 3.3 FR-03: readStdinSync() 에러 로깅 추가

**목표**: JSON 파싱 에러 시 디버깅 가능하도록 로깅

**현재 구현** (lib/common.js:651-659):
```javascript
function readStdinSync() {
  try {
    const data = fs.readFileSync(0, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};  // ⚠️ Silent failure
  }
}
```

**개선 설계**:
```javascript
function readStdinSync() {
  let data = '';
  try {
    data = fs.readFileSync(0, 'utf8');
    if (!data || data.trim() === '') {
      debugLog('Input', 'stdin is empty');
      return {};
    }
    return JSON.parse(data);
  } catch (e) {
    // 에러 로깅 추가
    debugLog('Input', 'Failed to parse stdin JSON', {
      error: e.message,
      errorName: e.name,
      dataPreview: (data || '').substring(0, 100)
    });
    return {};
  }
}
```

**변경 사항**:
1. `data` 변수 스코프 확장 (catch 블록에서 접근 가능)
2. 빈 stdin 체크 및 로깅
3. JSON 파싱 에러 시 `debugLog()` 호출

**수정 위치**: `lib/common.js` 라인 651-659

---

### 3.4 FR-04: Context 메시지 길이 제한

**목표**: Context 메시지가 너무 길어 UI에서 잘리는 것 방지

**신규 함수 추가** (lib/common.js 라인 500 부근):
```javascript
/**
 * Context 메시지 길이 제한
 * @param {string} context - 원본 context 메시지
 * @param {number} maxLength - 최대 길이 (기본 500)
 * @returns {string} - 제한된 context
 */
const MAX_CONTEXT_LENGTH = 500;

function truncateContext(context, maxLength = MAX_CONTEXT_LENGTH) {
  if (!context || typeof context !== 'string') return '';
  if (context.length <= maxLength) return context;

  // 마지막 완전한 문장에서 자르기 시도
  const truncated = context.substring(0, maxLength - 3);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastPipe = truncated.lastIndexOf(' | ');

  const cutPoint = Math.max(lastPeriod, lastPipe);
  if (cutPoint > maxLength * 0.7) {
    return context.substring(0, cutPoint + 1) + '...';
  }

  return truncated + '...';
}
```

**적용 위치**:
1. `outputAllow()` 함수 내 context 출력 전
2. `generateTaskGuidance()` 함수 반환값

**수정 위치**:
- 신규: `lib/common.js` 라인 500 부근
- 적용: `lib/common.js` 라인 525-551 (outputAllow)

---

### 3.5 FR-05: updatePdcaStatus() 실패 처리 개선

**목표**: 실패 시 결과 반환으로 호출자가 성공/실패 판단 가능

**현재 구현** (lib/common.js:1092-1189):
```javascript
function updatePdcaStatus(feature, phase, data = {}) {
  try {
    // ... 업데이트 로직 ...
    savePdcaStatus(status);
    debugLog('PDCA', `Status updated: ${feature} → ${phase}`);
  } catch (e) {
    debugLog('PDCA', 'Failed to update status', { error: e.message });
    // ⚠️ void 반환 - 호출자가 성공/실패 알 수 없음
  }
}
```

**개선 설계**:
```javascript
/**
 * PDCA 상태 업데이트
 * @returns {{ success: boolean, feature?: string, phase?: string, error?: string }}
 */
function updatePdcaStatus(feature, phase, data = {}) {
  try {
    initPdcaStatusIfNotExists();
    const status = getPdcaStatusFull() || createInitialStatusV2();
    // ... 기존 업데이트 로직 ...
    savePdcaStatus(status);
    debugLog('PDCA', `Status updated (v2.0): ${feature} → ${phase}`, data);
    return { success: true, feature, phase };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    debugLog('PDCA', 'Failed to update status', { error: errorMsg });
    return { success: false, feature, phase, error: errorMsg };
  }
}
```

**변경 사항**:
1. 반환 타입: `void` → `{ success: boolean, ... }`
2. 성공 시 `{ success: true, feature, phase }` 반환
3. 실패 시 `{ success: false, error: message }` 반환

**수정 위치**: `lib/common.js` 라인 1092-1189

---

### 3.6 FR-06: findDesignDoc() 파일 접근 최적화

**목표**: 읽기 권한 검증 추가로 권한 문제 조기 감지

**현재 구현** (lib/common.js:370-383):
```javascript
function findDesignDoc(feature) {
  if (!feature) return '';

  const paths = [
    path.join(PROJECT_DIR, `docs/02-design/features/${feature}.design.md`),
    path.join(PROJECT_DIR, `docs/02-design/${feature}.design.md`),
    path.join(PROJECT_DIR, `docs/design/${feature}.md`)
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;  // ⚠️ 읽기 권한 미확인
  }
  return '';
}
```

**개선 설계**:
```javascript
function findDesignDoc(feature) {
  if (!feature) return '';

  const paths = [
    path.join(PROJECT_DIR, 'docs', '02-design', 'features', `${feature}.design.md`),
    path.join(PROJECT_DIR, 'docs', '02-design', `${feature}.design.md`),
    path.join(PROJECT_DIR, 'docs', 'design', `${feature}.md`)
  ];

  for (const p of paths) {
    try {
      // 읽기 권한까지 확인
      fs.accessSync(p, fs.constants.R_OK);
      return p;
    } catch (e) {
      // 파일 없거나 권한 없음 - 다음 경로 시도
      continue;
    }
  }
  return '';
}
```

**변경 사항**:
1. `fs.existsSync()` → `fs.accessSync(p, fs.constants.R_OK)` 변경
2. `path.join()` 인자를 문자열 분리 (Windows 호환성)
3. try-catch로 권한 에러 처리

**수정 위치**: `lib/common.js` 라인 370-383

**동일 패턴 적용 대상**:
- `findPlanDoc()`: 라인 390-402

---

## 4. scripts/ 파일 수정 상세

### 4.1 PostToolUse 스크립트 수정

모든 PostToolUse hook 스크립트에서 `outputAllow()` 호출 시 타입 파라미터 추가:

#### gap-detector-post.js (라인 23)
```javascript
// Before
outputAllow(message);

// After
outputAllow(message, 'PostToolUse');
```

#### pdca-post-write.js (라인 71)
```javascript
// Before
outputAllow(context);

// After
outputAllow(context, 'PostToolUse');
```

#### phase5-design-post.js (라인 58)
```javascript
// Before
outputAllow(`Design System Check: ${warnings.join(' | ')}`);

// After
outputAllow(`Design System Check: ${warnings.join(' | ')}`, 'PostToolUse');
```

#### phase6-ui-post.js (라인 33, 40)
```javascript
// Before (line 33)
outputAllow(message);
// Before (line 40)
outputAllow(message);

// After
outputAllow(message, 'PostToolUse');
outputAllow(message, 'PostToolUse');
```

#### qa-monitor-post.js (라인 32, 38)
```javascript
// Before
outputAllow(message);

// After
outputAllow(message, 'PostToolUse');
```

---

## 5. agents/ 파일 수정

### 5.1 code-analyzer.md

**현재 구현**:
```yaml
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "echo '{\"decision\": \"block\", \"reason\": \"Code analyzer agent is read-only\"}'"
```

**문제점**:
- echo 인라인 방식은 JSON 이스케이프 문제 발생 가능
- 다른 agent와 일관성 없음

**개선 설계** (권장):
```yaml
hooks:
  PreToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "node ${CLAUDE_PLUGIN_ROOT}/scripts/code-analyzer-pre.js"
          timeout: 5000
```

**신규 스크립트** (`scripts/code-analyzer-pre.js`):
```javascript
#!/usr/bin/env node
const { outputBlock } = require('../lib/common.js');

// Code analyzer는 read-only agent
outputBlock('Code analyzer agent is read-only and cannot modify files');
```

---

## 6. skills/ 파일 수정

### 6.1 phase-9-deployment/SKILL.md

**현재 구현**:
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "node ${CLAUDE_PLUGIN_ROOT}/scripts/phase9-deploy-pre.js"
```

**수정**: timeout 추가
```yaml
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "node ${CLAUDE_PLUGIN_ROOT}/scripts/phase9-deploy-pre.js"
          timeout: 5000
```

---

## 7. 파일 삭제/정리

### 7.1 Deprecated 파일

| 파일 | 상태 | 조치 |
|------|------|------|
| scripts/pdca-pre-write.js | pre-write.js로 통합됨 | 삭제 |

### 7.2 pdca-pre-write.js 삭제 시 연관 파일 수정

pdca-pre-write.js 삭제 시 다음 파일들도 함께 수정 필요:

| 파일 | 수정 내용 |
|------|----------|
| test-scripts/integration/pdca-scripts.test.js | pdca-pre-write.js 테스트 케이스 삭제 |
| test-scripts/compatibility/scripts.test.js | 스크립트 목록에서 제거 |
| bkit-system/components/scripts/_scripts-overview.md | Legacy 항목 삭제 |

---

## 8. 구현 순서

### Phase 1: Critical Fixes (High Priority)

| 순서 | 파일 | 변경 내용 | 예상 라인 |
|------|------|----------|----------|
| 1 | lib/common.js | `truncateContext()` 함수 추가 | +15 |
| 2 | lib/common.js | `outputAllow()` 수정 (FR-01, FR-04) | ~20 변경 |
| 3 | lib/common.js | `outputBlock()` 수정 (FR-02) | ~10 변경 |

### Phase 2: Error Handling (Medium Priority)

| 순서 | 파일 | 변경 내용 | 예상 라인 |
|------|------|----------|----------|
| 4 | lib/common.js | `readStdinSync()` 수정 (FR-03) | ~15 변경 |
| 5 | lib/common.js | `updatePdcaStatus()` 수정 (FR-05) | ~10 변경 |
| 6 | lib/common.js | `findDesignDoc()` 수정 (FR-06) | ~10 변경 |
| 7 | lib/common.js | `findPlanDoc()` 수정 (FR-06) | ~10 변경 |

### Phase 3: Scripts Consistency (Medium Priority)

| 순서 | 파일 | 변경 내용 |
|------|------|----------|
| 8 | scripts/gap-detector-post.js | outputAllow 타입 파라미터 추가 |
| 9 | scripts/pdca-post-write.js | outputAllow 타입 파라미터 추가 |
| 10 | scripts/phase5-design-post.js | outputAllow 타입 파라미터 추가 |
| 11 | scripts/phase6-ui-post.js | outputAllow 타입 파라미터 추가 |
| 12 | scripts/qa-monitor-post.js | outputAllow 타입 파라미터 추가 |

### Phase 4: Agents & Skills (Low Priority)

| 순서 | 파일 | 변경 내용 |
|------|------|----------|
| 13 | scripts/code-analyzer-pre.js | 신규 생성 |
| 14 | agents/code-analyzer.md | echo → 스크립트 변경 |
| 15 | skills/phase-9-deployment/SKILL.md | timeout 추가 |

### Phase 5: Cleanup

| 순서 | 파일 | 변경 내용 |
|------|------|----------|
| 16 | scripts/pdca-pre-write.js | 삭제 (deprecated) |
| 17 | test-scripts/integration/pdca-scripts.test.js | pdca-pre-write.js 테스트 케이스 삭제 |
| 18 | test-scripts/compatibility/scripts.test.js | 스크립트 목록에서 제거 |
| 19 | bkit-system/components/scripts/_scripts-overview.md | Legacy 항목 삭제 |

---

## 9. 테스트 계획

### 9.1 단위 테스트

| 함수 | 테스트 케이스 |
|------|--------------|
| `truncateContext()` | 500자 이하: 그대로, 500자 초과: 잘림 |
| `outputAllow()` | PreToolUse: additionalContext 사용 확인 |
| `outputBlock()` | stderr 출력, Exit Code 2 확인 |
| `readStdinSync()` | 빈 stdin, 유효 JSON, 무효 JSON |
| `updatePdcaStatus()` | 성공 반환, 실패 반환 |
| `findDesignDoc()` | 파일 있음, 없음, 권한 없음 |

### 9.2 통합 테스트

| 시나리오 | 테스트 방법 |
|----------|------------|
| PreToolUse Allow | Write 도구 호출 → hook 실행 → 파일 생성 확인 |
| PreToolUse Block | qa-pre-bash.js에서 위험 명령어 → 차단 확인 |
| PostToolUse Context | Write 후 → context 메시지 표시 확인 |

---

## 10. exports 수정

lib/common.js의 exports에 `truncateContext` 추가:

```javascript
module.exports = {
  // ... 기존 exports ...
  truncateContext,
  MAX_CONTEXT_LENGTH,
};
```

---

## 11. 영향 범위 분석

### 11.1 하위 호환성

| 변경 | 하위 호환 | 비고 |
|------|----------|------|
| outputAllow() | ✅ | context 형식 동일 |
| outputBlock() | ✅ | stderr는 Claude Code에서 표시됨 |
| readStdinSync() | ✅ | 반환 형식 동일 |
| updatePdcaStatus() | ✅ | 반환값 추가 (void → object), 기존 호출부 수정 불필요 |
| findDesignDoc() | ✅ | 반환 형식 동일 |

> **Note**: updatePdcaStatus()의 반환값 추가는 완전 하위 호환됩니다.
> 기존 코드가 반환값을 무시하면 영향 없습니다. (JavaScript에서 반환값은 사용하지 않으면 버려짐)

### 11.2 updatePdcaStatus() 호출부 확인 (참고용)

| 파일 | 라인 | 현재 사용 | 수정 필요 |
|------|------|----------|----------|
| scripts/pre-write.js | 80-82 | `updatePdcaStatus(...)` (반환값 무시) | 불필요 |
| scripts/gap-detector-stop.js | 다수 | `updatePdcaStatus(...)` (반환값 무시) | 불필요 |

**권장**: 기존 호출부는 반환값을 무시해도 동작에 영향 없음. 점진적으로 반환값 활용 추가 가능.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial design based on 7-Task analysis | Claude Code |
