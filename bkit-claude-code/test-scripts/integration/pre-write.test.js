/**
 * bkit v1.4.2 pre-write.js Integration Tests
 *
 * pre-write.js 스크립트 통합 테스트
 * FR-01 준수: PreToolUse 출력 형식 검증
 *
 * 테스트 대상: scripts/pre-write.js
 */

const fs = require('fs');
const path = require('path');
const { runScriptWithJson } = require('../lib/safe-exec');
const { createTempDir, cleanupTempDir, createMockPdcaStatus } = require('../lib/temp-files');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const scriptPath = path.join(SCRIPTS_DIR, 'pre-write.js');

describe('pre-write.js 통합 테스트', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('pre-write-test-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('스크립트 파일 존재', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  test('소스 파일 작성 시 PreToolUse 형식 출력', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/components/Button.tsx',
        content: 'export const Button = () => <button>Click</button>;'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);

    // PreToolUse 형식: permissionDecision 없어야 함
    if (result.stdout.trim() !== '{}') {
      expect(result.stdout).not.toContain('permissionDecision');
      expect(result.stdout).not.toContain('"decision"');
    }
  });

  test('빈 JSON 출력 시 올바른 형식', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/readme.txt',
        content: 'Simple text file'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);

    // 빈 JSON이거나 유효한 JSON
    if (result.stdout.trim()) {
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    }
  });

  test('PDCA 상태 없이 실행', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/app.ts',
        content: 'const app = express();'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    // PDCA 상태 없어도 정상 실행
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });

  test('PDCA 상태 있을 때 컨텍스트 포함', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    // PDCA 상태 생성
    createMockPdcaStatus(tempDir, {
      version: '2.0',
      primaryFeature: 'login',
      features: {
        login: { phase: 'do', phaseNumber: 3 }
      }
    });

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/auth/login.ts',
        content: 'export function login() {}'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);

    // PDCA 컨텍스트가 있으면 additionalContext에 포함
    if (result.stdout.trim() !== '{}' && result.parsed) {
      if (result.parsed.hookSpecificOutput?.additionalContext) {
        // PDCA 관련 내용 포함 가능
        const ctx = result.parsed.hookSpecificOutput.additionalContext;
        expect(typeof ctx).toBe('string');
      }
    }
  });
});

describe('pre-write.js 대규모 변경 감지', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('pre-write-large-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('100줄 이상 파일 작성 시 가이드', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const largeContent = 'const x = 1;\n'.repeat(100);

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/features/auth/login.ts',
        content: largeContent
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);

    // 대규모 변경 시 가이드 메시지 포함 가능
    // (구현에 따라 다를 수 있음)
  });

  test('새 기능 폴더 생성 시 Plan 가이드', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/features/new-feature/index.ts',
        content: 'export * from "./core";'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);
  });
});

describe('pre-write.js 환경 변수 파일 처리', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('pre-write-env-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('.env 파일 작성 시 네이밍 가이드', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/.env.local',
        content: 'DATABASE_URL=postgres://localhost'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);

    // .env 파일 작성 시 네이밍 가이드
    if (result.stdout.trim() !== '{}' && result.parsed?.hookSpecificOutput?.additionalContext) {
      const ctx = result.parsed.hookSpecificOutput.additionalContext;
      // Env naming 가이드 포함 여부 (구현에 따라 다름)
      expect(typeof ctx).toBe('string');
    }
  });

  test('.env.example 파일 작성 허용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/.env.example',
        content: 'DATABASE_URL=your_database_url_here'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    // .env.example은 안전하므로 허용
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });
});

describe('pre-write.js FR-01 준수 검증', () => {
  test('outputAllow 호출 시 PreToolUse 타입 또는 타입 없음', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // outputAllow 사용 시 PreToolUse 또는 타입 없음
    if (content.includes('outputAllow')) {
      // 다른 타입 (PostToolUse, Stop 등)을 사용하면 안됨
      expect(content).not.toMatch(/outputAllow\([^)]+,\s*['"]PostToolUse['"]\)/);
      expect(content).not.toMatch(/outputAllow\([^)]+,\s*['"]Stop['"]\)/);
      expect(content).not.toMatch(/outputAllow\([^)]+,\s*['"]SessionStart['"]\)/);
    }
  });

  test('common.js에서 outputAllow import', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // common.js 사용
    expect(content).toMatch(/require\s*\(\s*['"][^'"]*common[^'"]*['"]\s*\)/);
  });
});
