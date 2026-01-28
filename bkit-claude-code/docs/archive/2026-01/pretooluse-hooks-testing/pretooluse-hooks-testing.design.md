# PreToolUse Hooks Testing Design Document

> **Summary**: PreToolUse Hooks 개선(FR-01~FR-06) 및 전체 scripts/ 테스트 상세 설계서
>
> **Project**: bkit-claude-code
> **Version**: v1.4.2
> **Author**: Claude Code
> **Date**: 2026-01-26
> **Status**: Draft
> **Planning Doc**: [pretooluse-hooks-testing.plan.md](../01-plan/features/pretooluse-hooks-testing.plan.md)

---

## 1. Overview

### 1.1 Design Goals

1. **FR-01~FR-06 구현 검증**: lib/common.js 핵심 함수 테스트
2. **전체 Scripts 커버리지**: 26개 scripts/ 파일 테스트
3. **SessionStart Hook 테스트**: hooks/session-start.js 검증
4. **회귀 방지**: 기존 기능 동작 보장

### 1.2 Design Principles

- **격리된 테스트**: 각 함수/스크립트 독립 테스트
- **자식 프로세스 패턴**: process.exit() 테스트를 위한 격리 실행
- **임시 파일 활용**: 파일 시스템 테스트 격리

---

## 2. Test Architecture

### 2.1 테스트 레이어 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                     Test Categories                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Unit Tests  │  │ Integration  │  │  Regression  │           │
│  │ (함수 단위)   │  │   Tests      │  │    Tests     │           │
│  │              │  │ (스크립트)    │  │  (기존 기능)  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                │                  │                    │
│         ▼                ▼                  ▼                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Test Utilities                           │   │
│  │  - spawnSync wrapper                                      │   │
│  │  - Temp file helpers                                      │   │
│  │  - Mock stdin creator                                     │   │
│  │  - Console capture                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Jest Framework                         │   │
│  │  - Assertions, Mocking, Coverage                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 테스트 디렉토리 구조

```
test-scripts/
├── unit/                              # 단위 테스트 (lib/common.js)
│   ├── output-functions.test.js       # TR-01, TR-02, TR-03
│   ├── truncate-context.test.js       # TR-05
│   ├── input-functions.test.js        # TR-04
│   ├── pdca-status.test.js            # TR-06
│   ├── doc-finder.test.js             # TR-07, TR-08
│   ├── file-detection.test.js         # isSourceFile, isCodeFile 등
│   ├── feature-extraction.test.js     # extractFeature, extractFeatureFromContext
│   ├── task-classification.test.js    # classifyTask, getPdcaLevel
│   └── platform-detection.test.js     # detectPlatform, isGeminiCli
│
├── integration/                       # 통합 테스트 (scripts/)
│   ├── scripts-type-param.test.js     # TR-09 (5개 파일 타입 파라미터)
│   ├── code-analyzer.test.js          # TR-10, TR-11
│   ├── phase9-deploy.test.js          # TR-12
│   ├── pre-write.test.js              # pre-write.js 통합 테스트
│   ├── qa-pre-bash.test.js            # qa-pre-bash.js 통합 테스트
│   ├── session-start.test.js          # hooks/session-start.js 테스트
│   └── all-scripts.test.js            # 모든 스크립트 로드 테스트
│
├── regression/                        # 회귀 테스트
│   └── existing-hooks.test.js         # TR-13
│
├── compatibility/                     # 호환성 테스트 (기존)
│   └── scripts.test.js
│
├── helpers/                           # 테스트 유틸리티
│   ├── test-utils.js                  # 공통 헬퍼 함수
│   ├── mock-stdin.js                  # stdin 모킹
│   └── temp-files.js                  # 임시 파일 관리
│
└── fixtures/                          # 테스트 데이터
    ├── mock-inputs/                   # Mock stdin JSON
    ├── sample-files/                  # 테스트용 소스 파일
    └── pdca-status/                   # Mock PDCA 상태 파일
```

---

## 3. Test Utilities Design

### 3.1 테스트 유틸리티 (test-utils.js)

```javascript
/**
 * test-scripts/helpers/test-utils.js
 * 테스트 공통 유틸리티 함수
 */

const { spawnSync } = require('child_process');
const path = require('path');

/**
 * 스크립트를 자식 프로세스로 실행하고 결과 반환
 * @param {string} scriptPath - 실행할 스크립트 경로
 * @param {object|string} stdinInput - stdin으로 전달할 입력
 * @param {object} env - 환경 변수 (기본값 유지)
 * @returns {{ stdout: string, stderr: string, status: number }}
 */
function runScript(scriptPath, stdinInput = '', env = {}) {
  const input = typeof stdinInput === 'object'
    ? JSON.stringify(stdinInput)
    : stdinInput;

  const result = spawnSync('node', [scriptPath], {
    input,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    cwd: path.resolve(__dirname, '../../..')
  });

  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status
  };
}

/**
 * stdout JSON 파싱 헬퍼
 * @param {string} stdout - stdout 문자열
 * @returns {object} 파싱된 JSON 또는 빈 객체
 */
function parseStdoutJson(stdout) {
  try {
    const trimmed = stdout.trim();
    if (!trimmed || trimmed === '{}') return {};
    return JSON.parse(trimmed);
  } catch (e) {
    return { _raw: stdout, _parseError: e.message };
  }
}

/**
 * 스크립트 결과에서 특정 출력 패턴 확인
 * @param {object} result - runScript 결과
 * @param {object} expectations - 기대 조건
 */
function expectScriptResult(result, expectations) {
  if (expectations.exitCode !== undefined) {
    expect(result.status).toBe(expectations.exitCode);
  }
  if (expectations.stdoutContains) {
    expect(result.stdout).toContain(expectations.stdoutContains);
  }
  if (expectations.stderrContains) {
    expect(result.stderr).toContain(expectations.stderrContains);
  }
  if (expectations.stdoutEmpty) {
    expect(result.stdout.trim()).toBe('');
  }
  if (expectations.jsonOutput) {
    const parsed = parseStdoutJson(result.stdout);
    expect(parsed).toMatchObject(expectations.jsonOutput);
  }
}

module.exports = {
  runScript,
  parseStdoutJson,
  expectScriptResult
};
```

### 3.2 임시 파일 헬퍼 (temp-files.js)

```javascript
/**
 * test-scripts/helpers/temp-files.js
 * 테스트용 임시 파일 관리
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * 임시 디렉토리 생성
 * @param {string} prefix - 디렉토리 접두사
 * @returns {string} 생성된 디렉토리 경로
 */
function createTempDir(prefix = 'bkit-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * 임시 파일 생성
 * @param {string} dir - 디렉토리 경로
 * @param {string} filename - 파일명
 * @param {string} content - 파일 내용
 * @returns {string} 생성된 파일 경로
 */
function createTempFile(dir, filename, content = '') {
  const filePath = path.join(dir, filename);
  const parentDir = path.dirname(filePath);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * 임시 디렉토리 재귀 삭제
 * @param {string} dir - 삭제할 디렉토리 경로
 */
function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * PDCA 상태 파일 생성
 * @param {string} dir - 프로젝트 디렉토리
 * @param {object} status - PDCA 상태 객체
 * @returns {string} 생성된 파일 경로
 */
function createMockPdcaStatus(dir, status) {
  const docsDir = path.join(dir, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const statusPath = path.join(docsDir, '.pdca-status.json');
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
  return statusPath;
}

module.exports = {
  createTempDir,
  createTempFile,
  cleanupTempDir,
  createMockPdcaStatus
};
```

---

## 4. Unit Test Specifications

### 4.1 TR-01: outputAllow() PreToolUse 테스트

**파일**: `test-scripts/unit/output-functions.test.js`

```javascript
describe('TR-01: outputAllow() PreToolUse 출력 형식', () => {
  // 테스트를 위한 wrapper 스크립트 사용 (process.exit 격리)
  const wrapperScript = path.join(__dirname, '../fixtures/output-allow-wrapper.js');

  test('1.1 PreToolUse with context - additionalContext만 포함', () => {
    const result = runScript(wrapperScript, {
      context: 'test context',
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    const output = parseStdoutJson(result.stdout);

    // FR-01: permissionDecision 없어야 함
    expect(output).not.toHaveProperty('decision');
    expect(output.hookSpecificOutput).toBeDefined();
    expect(output.hookSpecificOutput.additionalContext).toBe('test context');
    expect(output.hookSpecificOutput).not.toHaveProperty('permissionDecision');
  });

  test('1.2 PreToolUse without context - 빈 JSON', () => {
    const result = runScript(wrapperScript, {
      context: '',
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });

  test('1.3 PreToolUse null context - 빈 JSON', () => {
    const result = runScript(wrapperScript, {
      context: null,
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });

  test('1.4 Verify NO permissionDecision in any PreToolUse output', () => {
    const contexts = ['test', 'long context message', '한글 컨텍스트'];

    for (const context of contexts) {
      const result = runScript(wrapperScript, {
        context,
        hookEvent: 'PreToolUse'
      });

      // permissionDecision 키가 출력에 절대 없어야 함
      expect(result.stdout).not.toContain('permissionDecision');
    }
  });
});
```

### 4.2 TR-02: outputAllow() PostToolUse/SessionStart 테스트

```javascript
describe('TR-02: outputAllow() PostToolUse/SessionStart 출력 형식', () => {
  test('2.1 PostToolUse with context - decision: allow 포함', () => {
    const result = runScript(wrapperScript, {
      context: 'message',
      hookEvent: 'PostToolUse'
    });

    const output = parseStdoutJson(result.stdout);
    expect(output.decision).toBe('allow');
    expect(output.hookSpecificOutput.additionalContext).toBe('message');
  });

  test('2.2 SessionStart with context - decision: allow 포함', () => {
    const result = runScript(wrapperScript, {
      context: 'info',
      hookEvent: 'SessionStart'
    });

    const output = parseStdoutJson(result.stdout);
    expect(output.decision).toBe('allow');
    expect(output.hookSpecificOutput.additionalContext).toBe('info');
  });

  test('2.3 Stop hook - systemMessage 사용', () => {
    const result = runScript(wrapperScript, {
      context: 'report',
      hookEvent: 'Stop'
    });

    const output = parseStdoutJson(result.stdout);
    expect(output.decision).toBe('allow');
    expect(output.systemMessage).toBe('report');
    expect(output.hookSpecificOutput).toBeUndefined();
  });
});
```

### 4.3 TR-03: outputBlock() 테스트

```javascript
describe('TR-03: outputBlock() stderr 및 Exit Code', () => {
  const blockWrapperScript = path.join(__dirname, '../fixtures/output-block-wrapper.js');

  test('3.1 Block outputs to stderr', () => {
    const result = runScript(blockWrapperScript, {
      reason: 'blocked reason'
    });

    expect(result.stderr).toContain('blocked reason');
  });

  test('3.2 Block exits with code 2', () => {
    const result = runScript(blockWrapperScript, {
      reason: 'reason'
    });

    expect(result.status).toBe(2);
  });

  test('3.3 No JSON in stdout', () => {
    const result = runScript(blockWrapperScript, {
      reason: 'reason'
    });

    // stdout에 JSON 없음 (FR-02: stderr만 사용)
    expect(result.stdout.trim()).toBe('');
  });
});
```

### 4.4 TR-05: truncateContext() 테스트

**파일**: `test-scripts/unit/truncate-context.test.js`

```javascript
const { truncateContext, MAX_CONTEXT_LENGTH } = require('../../lib/common.js');

describe('TR-05: truncateContext() 500자 제한', () => {
  test('5.1 Under limit (100자) - 원본 그대로', () => {
    const input = 'a'.repeat(100);
    expect(truncateContext(input)).toBe(input);
  });

  test('5.2 Exactly 500자 - 원본 그대로', () => {
    const input = 'a'.repeat(500);
    expect(truncateContext(input)).toBe(input);
  });

  test('5.3 Over limit (600자) - 잘림 + "..."', () => {
    const input = 'a'.repeat(600);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.4 Cuts at sentence (마지막 마침표)', () => {
    // 마지막 문장 끝에서 자르기
    const input = 'First sentence. ' + 'x'.repeat(490) + ' Second sentence. More text here.';
    const result = truncateContext(input, 520);

    // 마지막 완전한 문장에서 자름
    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.5 Cuts at pipe (마지막 파이프)', () => {
    const input = 'Info 1 | Info 2 | ' + 'x'.repeat(480) + ' | More info | Extra';
    const result = truncateContext(input, 510);

    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.6 Null input - 빈 문자열', () => {
    expect(truncateContext(null)).toBe('');
  });

  test('5.7 Number input - 빈 문자열', () => {
    expect(truncateContext(12345)).toBe('');
  });

  test('5.8 MAX_CONTEXT_LENGTH 상수 확인', () => {
    expect(MAX_CONTEXT_LENGTH).toBe(500);
  });
});
```

### 4.5 TR-04: readStdinSync() 테스트

**파일**: `test-scripts/unit/input-functions.test.js`

```javascript
describe('TR-04: readStdinSync() JSON 파싱', () => {
  const stdinWrapperScript = path.join(__dirname, '../fixtures/stdin-wrapper.js');

  test('4.1 Empty stdin - 빈 객체 반환', () => {
    const result = runScript(stdinWrapperScript, '');
    const output = parseStdoutJson(result.stdout);

    expect(output).toEqual({});
  });

  test('4.2 Invalid JSON - 빈 객체 반환', () => {
    const result = runScript(stdinWrapperScript, 'not json');
    const output = parseStdoutJson(result.stdout);

    expect(output).toEqual({});
  });

  test('4.3 Valid JSON - 파싱된 객체 반환', () => {
    const result = runScript(stdinWrapperScript, JSON.stringify({ tool: 'Write' }));
    const output = parseStdoutJson(result.stdout);

    expect(output).toEqual({ tool: 'Write' });
  });

  test('4.4 Whitespace only - 빈 객체 반환', () => {
    const result = runScript(stdinWrapperScript, '   \n  ');
    const output = parseStdoutJson(result.stdout);

    expect(output).toEqual({});
  });
});
```

### 4.6 TR-06: updatePdcaStatus() 테스트

**파일**: `test-scripts/unit/pdca-status.test.js`

```javascript
describe('TR-06: updatePdcaStatus() 반환값', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('pdca-test-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('6.1 Success - { success: true, feature, phase }', () => {
    const statusWrapperScript = path.join(__dirname, '../fixtures/pdca-status-wrapper.js');

    const result = runScript(statusWrapperScript, {
      action: 'update',
      feature: 'test-feature',
      phase: 'design'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    const output = parseStdoutJson(result.stdout);
    expect(output.success).toBe(true);
    expect(output.feature).toBe('test-feature');
    expect(output.phase).toBe('design');
  });

  test('6.2 Failure - { success: false, error }', () => {
    // 쓰기 권한 없는 디렉토리에서 테스트
    const readonlyDir = path.join(tempDir, 'readonly');
    fs.mkdirSync(readonlyDir);
    fs.chmodSync(readonlyDir, 0o444);  // read-only

    const result = runScript(statusWrapperScript, {
      action: 'update',
      feature: 'test',
      phase: 'plan'
    }, { CLAUDE_PROJECT_DIR: readonlyDir });

    const output = parseStdoutJson(result.stdout);
    expect(output.success).toBe(false);
    expect(output.error).toBeDefined();

    // cleanup
    fs.chmodSync(readonlyDir, 0o755);
  });
});
```

### 4.7 TR-07, TR-08: findDesignDoc()/findPlanDoc() 테스트

**파일**: `test-scripts/unit/doc-finder.test.js`

```javascript
describe('TR-07, TR-08: findDesignDoc()/findPlanDoc() 권한 검증', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('doc-finder-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('7.1 File exists, readable - 경로 반환', () => {
    // 테스트 파일 생성
    const designPath = createTempFile(
      tempDir,
      'docs/02-design/features/test.design.md',
      '# Test Design'
    );

    const docFinderWrapper = path.join(__dirname, '../fixtures/doc-finder-wrapper.js');
    const result = runScript(docFinderWrapper, {
      action: 'findDesignDoc',
      feature: 'test'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.stdout.trim()).toContain('test.design.md');
  });

  test('7.2 File exists, no read permission - 빈 문자열', () => {
    // 권한 없는 파일 생성 (Unix only)
    if (process.platform === 'win32') {
      return; // Windows에서는 skip
    }

    const designPath = createTempFile(
      tempDir,
      'docs/02-design/features/noperm.design.md',
      '# No Permission'
    );
    fs.chmodSync(designPath, 0o000);

    const result = runScript(docFinderWrapper, {
      action: 'findDesignDoc',
      feature: 'noperm'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.stdout.trim()).toBe('');

    // cleanup
    fs.chmodSync(designPath, 0o644);
  });

  test('7.3 File not exists - 빈 문자열', () => {
    const result = runScript(docFinderWrapper, {
      action: 'findDesignDoc',
      feature: 'nonexistent'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.stdout.trim()).toBe('');
  });

  test('7.4 Empty feature - 빈 문자열', () => {
    const result = runScript(docFinderWrapper, {
      action: 'findDesignDoc',
      feature: ''
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.stdout.trim()).toBe('');
  });

  test('8.1 findPlanDoc - 경로 반환', () => {
    createTempFile(
      tempDir,
      'docs/01-plan/features/test.plan.md',
      '# Test Plan'
    );

    const result = runScript(docFinderWrapper, {
      action: 'findPlanDoc',
      feature: 'test'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.stdout.trim()).toContain('test.plan.md');
  });
});
```

---

## 5. Integration Test Specifications

### 5.1 TR-09: scripts/ outputAllow 타입 파라미터

**파일**: `test-scripts/integration/scripts-type-param.test.js`

```javascript
describe('TR-09: scripts/ outputAllow 타입 파라미터', () => {
  const scriptsDir = path.join(__dirname, '../../scripts');

  const targetFiles = [
    { file: 'gap-detector-post.js', type: 'PostToolUse' },
    { file: 'pdca-post-write.js', type: 'PostToolUse' },
    { file: 'phase5-design-post.js', type: 'PostToolUse' },
    { file: 'phase6-ui-post.js', type: 'PostToolUse' },
    { file: 'qa-monitor-post.js', type: 'PostToolUse' }
  ];

  test.each(targetFiles)('9.x $file - outputAllow($type) 호출 확인', ({ file, type }) => {
    const content = fs.readFileSync(path.join(scriptsDir, file), 'utf8');

    // outputAllow(..., 'PostToolUse') 패턴 확인
    const pattern = new RegExp(`outputAllow\\([^)]+,\\s*['"]${type}['"]\\)`);
    expect(content).toMatch(pattern);

    // 타입 없는 outputAllow() 호출 없어야 함 (outputEmpty 제외)
    const noTypePattern = /outputAllow\([^,)]+\)(?!\s*;)/g;
    const matches = content.match(noTypePattern) || [];

    // outputAllow() 뒤에 쉼표 없이 바로 닫히는 경우 확인
    for (const match of matches) {
      // outputAllow(message) 형태가 아닌지 확인
      expect(match).not.toMatch(/outputAllow\(\w+\)$/);
    }
  });
});
```

### 5.2 TR-10, TR-11: code-analyzer 테스트

**파일**: `test-scripts/integration/code-analyzer.test.js`

```javascript
describe('TR-10: code-analyzer-pre.js 차단 동작', () => {
  const scriptPath = path.join(__dirname, '../../scripts/code-analyzer-pre.js');

  test('10.1 Execute script - stderr 출력, exit 2', () => {
    const result = runScript(scriptPath, '');

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Code analyzer agent is read-only');
  });

  test('10.2 No stdout output', () => {
    const result = runScript(scriptPath, '');

    expect(result.stdout.trim()).toBe('');
  });
});

describe('TR-11: code-analyzer.md hook 설정', () => {
  const agentPath = path.join(__dirname, '../../agents/code-analyzer.md');

  test('11.1 matcher = "Write|Edit"', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toContain('matcher: "Write|Edit"');
  });

  test('11.2 command = node script', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toContain('scripts/code-analyzer-pre.js');
  });

  test('11.3 timeout = 5000', () => {
    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toContain('timeout: 5000');
  });
});
```

### 5.3 TR-12: phase-9-deployment 테스트

**파일**: `test-scripts/integration/phase9-deploy.test.js`

```javascript
describe('TR-12: phase-9-deployment timeout 설정', () => {
  const skillPath = path.join(__dirname, '../../skills/phase-9-deployment/SKILL.md');

  test('12.1 timeout exists = 5000', () => {
    const content = fs.readFileSync(skillPath, 'utf8');
    expect(content).toContain('timeout: 5000');
  });

  test('12.2 command path correct', () => {
    const content = fs.readFileSync(skillPath, 'utf8');
    expect(content).toContain('scripts/phase9-deploy-pre.js');
  });
});
```

### 5.4 pre-write.js 통합 테스트

**파일**: `test-scripts/integration/pre-write.test.js`

```javascript
describe('pre-write.js 통합 테스트', () => {
  const scriptPath = path.join(__dirname, '../../scripts/pre-write.js');
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('pre-write-test-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('소스 파일 작성 시 PreToolUse 형식 출력', () => {
    const result = runScript(scriptPath, {
      tool_input: {
        file_path: '/src/components/Button.tsx',
        content: 'export const Button = () => <button>Click</button>;'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);

    // PreToolUse 형식: permissionDecision 없음
    if (result.stdout.trim() !== '{}') {
      expect(result.stdout).not.toContain('permissionDecision');
    }
  });

  test('대규모 변경 시 PDCA 가이드 출력', () => {
    const largeContent = 'const x = 1;\n'.repeat(100); // 100줄

    const result = runScript(scriptPath, {
      tool_input: {
        file_path: '/src/features/auth/login.ts',
        content: largeContent
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    // PDCA 가이드 메시지 포함
    if (result.stdout.trim() !== '{}') {
      const output = parseStdoutJson(result.stdout);
      expect(output.hookSpecificOutput?.additionalContext).toBeDefined();
    }
  });

  test('환경 변수 파일 작성 시 네이밍 가이드', () => {
    const result = runScript(scriptPath, {
      tool_input: {
        file_path: '/.env.local',
        content: 'API_KEY=secret'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    if (result.stdout.trim() !== '{}') {
      const output = parseStdoutJson(result.stdout);
      expect(output.hookSpecificOutput?.additionalContext).toContain('Env naming');
    }
  });
});
```

### 5.5 qa-pre-bash.js 통합 테스트

**파일**: `test-scripts/integration/qa-pre-bash.test.js`

```javascript
describe('qa-pre-bash.js 통합 테스트', () => {
  const scriptPath = path.join(__dirname, '../../scripts/qa-pre-bash.js');

  test('안전한 명령어 - 허용', () => {
    const result = runScript(scriptPath, {
      tool_input: {
        command: 'docker logs app'
      }
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('validated as safe');
  });

  test('rm -rf 명령어 - 차단', () => {
    const result = runScript(scriptPath, {
      tool_input: {
        command: 'rm -rf /tmp/test'
      }
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Destructive command');
  });

  test('DROP TABLE 명령어 - 차단', () => {
    const result = runScript(scriptPath, {
      tool_input: {
        command: 'psql -c "DROP TABLE users"'
      }
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Destructive command');
  });

  const destructiveCommands = [
    'rm -r /data',
    'DELETE FROM users',
    'TRUNCATE TABLE logs',
    'dd if=/dev/zero of=/disk',
  ];

  test.each(destructiveCommands)('위험 명령어 차단: %s', (cmd) => {
    const result = runScript(scriptPath, {
      tool_input: { command: cmd }
    });

    expect(result.status).toBe(2);
  });
});
```

### 5.6 session-start.js 통합 테스트

**파일**: `test-scripts/integration/session-start.test.js`

```javascript
describe('hooks/session-start.js 통합 테스트', () => {
  const scriptPath = path.join(__dirname, '../../hooks/session-start.js');
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('session-test-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('Claude Code 환경 - JSON 출력', () => {
    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, '../..')
    });

    expect(result.status).toBe(0);

    const output = parseStdoutJson(result.stdout);
    expect(output.systemMessage).toContain('bkit');
    expect(output.hookSpecificOutput).toBeDefined();
    expect(output.hookSpecificOutput.hookEventName).toBe('SessionStart');
  });

  test('이전 작업 있을 때 - resume 타입', () => {
    // PDCA 상태 파일 생성
    createMockPdcaStatus(tempDir, {
      version: "2.0",
      primaryFeature: "test-feature",
      activeFeatures: ["test-feature"],
      features: {
        "test-feature": {
          phase: "design",
          matchRate: 85
        }
      }
    });

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, '../..')
    });

    const output = parseStdoutJson(result.stdout);
    expect(output.hookSpecificOutput.onboardingType).toBe('resume');
    expect(output.hookSpecificOutput.hasExistingWork).toBe(true);
    expect(output.hookSpecificOutput.primaryFeature).toBe('test-feature');
  });

  test('새 사용자 - new_user 타입', () => {
    // 빈 프로젝트 (PDCA 상태 없음)
    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, '../..')
    });

    const output = parseStdoutJson(result.stdout);
    expect(output.hookSpecificOutput.onboardingType).toBe('new_user');
    expect(output.hookSpecificOutput.hasExistingWork).toBe(false);
  });

  test('bkit 기능 현황 보고 규칙 포함', () => {
    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, '../..')
    });

    const output = parseStdoutJson(result.stdout);
    const context = output.hookSpecificOutput?.additionalContext || '';

    // v1.4.1 Response Report Rule 포함 확인
    expect(context).toContain('bkit 기능 현황 보고');
    expect(context).toContain('PDCA Commands');
    expect(context).toContain('Task System');
  });
});
```

### 5.7 모든 스크립트 로드 테스트

**파일**: `test-scripts/integration/all-scripts.test.js`

```javascript
describe('모든 스크립트 로드 테스트', () => {
  const scriptsDir = path.join(__dirname, '../../scripts');
  const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

  test.each(scripts)('%s - 구문 오류 없이 로드', (scriptFile) => {
    const scriptPath = path.join(scriptsDir, scriptFile);

    // require로 로드 시도 (구문 오류 검출)
    expect(() => {
      // 실행하지 않고 파싱만
      require.resolve(scriptPath);
    }).not.toThrow();
  });

  test('모든 스크립트가 shebang 포함', () => {
    for (const scriptFile of scripts) {
      const content = fs.readFileSync(path.join(scriptsDir, scriptFile), 'utf8');
      expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
    }
  });

  test('모든 스크립트가 common.js 참조', () => {
    for (const scriptFile of scripts) {
      const content = fs.readFileSync(path.join(scriptsDir, scriptFile), 'utf8');
      expect(content).toContain("require('../lib/common.js')");
    }
  });
});
```

---

## 6. Regression Test Specifications

### 6.1 TR-13: 기존 기능 회귀 테스트

**파일**: `test-scripts/regression/existing-hooks.test.js`

```javascript
describe('TR-13: 기존 기능 회귀 테스트', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('regression-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('13.1 pre-write.js 정상 동작', () => {
    const scriptPath = path.join(__dirname, '../../scripts/pre-write.js');

    const result = runScript(scriptPath, {
      tool_input: {
        file_path: '/src/test.ts',
        content: 'const x = 1;'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    // 정상 종료 (크래시 없음)
    expect(result.status).toBe(0);
  });

  test('13.2 qa-pre-bash.js 위험 명령어 차단', () => {
    const scriptPath = path.join(__dirname, '../../scripts/qa-pre-bash.js');

    const result = runScript(scriptPath, {
      tool_input: { command: 'rm -rf /' }
    });

    expect(result.status).toBe(2);
  });

  test('13.3 PDCA 상태 업데이트 정상', () => {
    const { updatePdcaStatus } = require('../../lib/common.js');

    // 임시 환경에서 테스트
    const originalDir = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = tempDir;

    try {
      const result = updatePdcaStatus('test-feature', 'design');
      expect(result.success).toBe(true);

      // 파일 생성 확인
      const statusPath = path.join(tempDir, 'docs/.pdca-status.json');
      expect(fs.existsSync(statusPath)).toBe(true);
    } finally {
      process.env.CLAUDE_PROJECT_DIR = originalDir;
    }
  });

  test('13.4 Design doc 검색 정상', () => {
    // 테스트 파일 생성
    createTempFile(
      tempDir,
      'docs/02-design/features/existing.design.md',
      '# Existing Design'
    );

    const { findDesignDoc } = require('../../lib/common.js');
    const originalDir = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = tempDir;

    try {
      const result = findDesignDoc('existing');
      expect(result).toContain('existing.design.md');
    } finally {
      process.env.CLAUDE_PROJECT_DIR = originalDir;
    }
  });
});
```

---

## 7. Test Fixtures

### 7.1 outputAllow Wrapper Script

**파일**: `test-scripts/fixtures/output-allow-wrapper.js`

```javascript
#!/usr/bin/env node
/**
 * outputAllow 테스트용 wrapper 스크립트
 * process.exit() 격리를 위해 별도 프로세스로 실행
 */

const { outputAllow } = require('../../lib/common.js');
const { readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { context, hookEvent } = input;

outputAllow(context, hookEvent);
```

### 7.2 outputBlock Wrapper Script

**파일**: `test-scripts/fixtures/output-block-wrapper.js`

```javascript
#!/usr/bin/env node
/**
 * outputBlock 테스트용 wrapper 스크립트
 */

const { outputBlock, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { reason } = input;

outputBlock(reason);
```

### 7.3 stdin Wrapper Script

**파일**: `test-scripts/fixtures/stdin-wrapper.js`

```javascript
#!/usr/bin/env node
/**
 * readStdinSync 테스트용 wrapper 스크립트
 */

const { readStdinSync } = require('../../lib/common.js');

const result = readStdinSync();
console.log(JSON.stringify(result));
```

### 7.4 Doc Finder Wrapper Script

**파일**: `test-scripts/fixtures/doc-finder-wrapper.js`

```javascript
#!/usr/bin/env node
/**
 * findDesignDoc/findPlanDoc 테스트용 wrapper 스크립트
 */

const { findDesignDoc, findPlanDoc, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { action, feature } = input;

let result = '';
if (action === 'findDesignDoc') {
  result = findDesignDoc(feature);
} else if (action === 'findPlanDoc') {
  result = findPlanDoc(feature);
}

console.log(result);
```

### 7.5 PDCA Status Wrapper Script

**파일**: `test-scripts/fixtures/pdca-status-wrapper.js`

```javascript
#!/usr/bin/env node
/**
 * updatePdcaStatus 테스트용 wrapper 스크립트
 */

const { updatePdcaStatus, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { action, feature, phase, data } = input;

if (action === 'update') {
  const result = updatePdcaStatus(feature, phase, data || {});
  console.log(JSON.stringify(result));
}
```

---

## 8. Implementation Guide

### 8.1 구현 순서

| 순서 | 파일 | 내용 | 예상 라인 |
|------|------|------|----------|
| 1 | helpers/test-utils.js | 공통 유틸리티 | ~50 |
| 2 | helpers/temp-files.js | 임시 파일 헬퍼 | ~50 |
| 3 | fixtures/*.js | Wrapper 스크립트들 | ~30 each |
| 4 | unit/output-functions.test.js | TR-01, TR-02, TR-03 | ~100 |
| 5 | unit/truncate-context.test.js | TR-05 | ~60 |
| 6 | unit/input-functions.test.js | TR-04 | ~40 |
| 7 | unit/pdca-status.test.js | TR-06 | ~60 |
| 8 | unit/doc-finder.test.js | TR-07, TR-08 | ~80 |
| 9 | integration/scripts-type-param.test.js | TR-09 | ~40 |
| 10 | integration/code-analyzer.test.js | TR-10, TR-11 | ~50 |
| 11 | integration/phase9-deploy.test.js | TR-12 | ~30 |
| 12 | integration/pre-write.test.js | 통합 테스트 | ~60 |
| 13 | integration/qa-pre-bash.test.js | 통합 테스트 | ~60 |
| 14 | integration/session-start.test.js | 통합 테스트 | ~80 |
| 15 | integration/all-scripts.test.js | 로드 테스트 | ~40 |
| 16 | regression/existing-hooks.test.js | TR-13 | ~80 |

### 8.2 Jest 설정 확인

```javascript
// jest.config.js 필요 설정
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test-scripts/**/*.test.js'],
  collectCoverageFrom: [
    'lib/**/*.js',
    'scripts/**/*.js',
    'hooks/**/*.js'
  ],
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80
    }
  }
};
```

---

## 9. Coverage Targets

### 9.1 lib/common.js 커버리지 목표

| 함수 | 목표 | 테스트 파일 |
|------|------|------------|
| outputAllow | 100% | output-functions.test.js |
| outputBlock | 100% | output-functions.test.js |
| outputEmpty | 100% | output-functions.test.js |
| truncateContext | 100% | truncate-context.test.js |
| readStdinSync | 100% | input-functions.test.js |
| updatePdcaStatus | 90% | pdca-status.test.js |
| findDesignDoc | 100% | doc-finder.test.js |
| findPlanDoc | 100% | doc-finder.test.js |
| parseHookInput | 90% | integration tests |
| detectPlatform | 80% | platform-detection.test.js |

### 9.2 scripts/ 커버리지 목표

| 스크립트 | 목표 | 테스트 방법 |
|---------|------|------------|
| pre-write.js | 80% | 통합 테스트 |
| qa-pre-bash.js | 90% | 통합 테스트 |
| code-analyzer-pre.js | 100% | 단위 테스트 |
| gap-detector-post.js | 70% | 통합 테스트 |
| phase9-deploy-pre.js | 80% | 통합 테스트 |

---

## 10. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial design for comprehensive hooks testing | Claude Code |
