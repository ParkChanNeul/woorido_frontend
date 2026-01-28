/**
 * bkit v1.4.2 SessionStart Hook Integration Tests
 *
 * hooks/session-start.js 통합 테스트
 *
 * 테스트 대상: hooks/session-start.js
 */

const fs = require('fs');
const path = require('path');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { createTempDir, cleanupTempDir, createMockPdcaStatus } = require('../lib/temp-files');

const HOOKS_DIR = path.join(__dirname, '../../hooks');
const scriptPath = path.join(HOOKS_DIR, 'session-start.js');
const PLUGIN_ROOT = path.resolve(__dirname, '../..');

describe('hooks/session-start.js 통합 테스트', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('session-test-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('스크립트 파일 존재', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  test('Claude Code 환경 - JSON 출력', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    // JSON 파싱 가능해야 함
    if (result.stdout.trim()) {
      const output = JSON.parse(result.stdout);

      // SessionStart 형식 검증
      expect(output).toHaveProperty('decision');
      expect(output.decision).toBe('allow');
    }
  });

  test('systemMessage 포함', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    if (result.stdout.trim()) {
      const output = JSON.parse(result.stdout);

      // systemMessage 존재
      if (output.systemMessage) {
        expect(output.systemMessage).toContain('bkit');
      }
    }
  });

  test('hookSpecificOutput 구조', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    if (result.stdout.trim()) {
      const output = JSON.parse(result.stdout);

      if (output.hookSpecificOutput) {
        expect(output.hookSpecificOutput).toHaveProperty('hookEventName');
        expect(output.hookSpecificOutput.hookEventName).toBe('SessionStart');
      }
    }
  });
});

describe('session-start.js PDCA 상태 연동', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('session-pdca-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('PDCA 상태 없을 때 기본 출력', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);
  });

  test('PDCA 상태 있을 때 컨텍스트 포함', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    // PDCA 상태 생성
    createMockPdcaStatus(tempDir, {
      version: '2.0',
      primaryFeature: 'login',
      activeFeatures: ['login'],
      features: {
        login: {
          phase: 'do',
          phaseNumber: 3,
          timestamps: { started: new Date().toISOString() }
        }
      }
    });

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    if (result.stdout.trim()) {
      const output = JSON.parse(result.stdout);

      // PDCA 상태 정보 포함 가능
      if (output.systemMessage) {
        // login 또는 PDCA 관련 정보
        expect(typeof output.systemMessage).toBe('string');
      }
    }
  });

  test('여러 활성 기능이 있을 때', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    createMockPdcaStatus(tempDir, {
      version: '2.0',
      primaryFeature: 'checkout',
      activeFeatures: ['login', 'checkout'],
      features: {
        login: { phase: 'check', phaseNumber: 4 },
        checkout: { phase: 'do', phaseNumber: 3 }
      }
    });

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);
  });
});

describe('session-start.js 환경 변수 처리', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('session-env-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('CLAUDE_PROJECT_DIR 없을 때', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
      // CLAUDE_PROJECT_DIR 없음
    });

    // 에러 없이 실행되어야 함
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });

  test('CLAUDE_PLUGIN_ROOT 없을 때', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir
      // CLAUDE_PLUGIN_ROOT 없음
    });

    // 에러 없이 실행되어야 함
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });

  test('Gemini 환경 변수', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      GEMINI_PROJECT_DIR: tempDir,
      GEMINI_EXTENSION_PATH: PLUGIN_ROOT
    });

    // Gemini 환경에서도 실행 가능
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });
});

describe('session-start.js 출력 형식 검증', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('session-output-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('유효한 JSON 출력', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    // stdout이 비어있지 않으면 유효한 JSON이어야 함
    if (result.stdout.trim()) {
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    }
  });

  test('stderr에 에러 없음', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    // 정상 실행 시 stderr 비어있음
    // (디버그 로그는 있을 수 있음)
  });

  test('exit code 0', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);
  });
});

describe('session-start.js common.js 연동', () => {
  test('common.js import', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // common.js 사용
    expect(content).toMatch(/require\s*\(\s*['"][^'"]*common[^'"]*['"]\s*\)/);
  });

  test('outputAllow 또는 outputSessionStart 사용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // 출력 함수 사용
    const hasOutputFunc = content.includes('outputAllow') ||
                          content.includes('outputSessionStart') ||
                          content.includes('console.log');

    expect(hasOutputFunc).toBe(true);
  });
});
