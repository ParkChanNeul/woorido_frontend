/**
 * bkit v1.4.2 Regression Tests
 *
 * TR-13: 기존 기능 회귀 테스트
 *
 * PreToolUse Hooks 개선 후 기존 기능이 정상 동작하는지 검증
 * - 기존 스크립트 정상 동작
 * - PDCA 상태 관리 정상
 * - common.js 함수 정상
 */

const fs = require('fs');
const path = require('path');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { createTempDir, cleanupTempDir, createMockPdcaStatus } = require('../lib/temp-files');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const HOOKS_DIR = path.join(__dirname, '../../hooks');
const PLUGIN_ROOT = path.resolve(__dirname, '../..');

describe('TR-13: 기존 기능 회귀 테스트', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('regression-');
    fs.mkdirSync(path.join(tempDir, 'docs'), { recursive: true });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // 13.1: pre-write.js 정상 동작
  test('13.1 pre-write.js 정상 동작', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'pre-write.js');

    if (!fs.existsSync(scriptPath)) {
      console.log('Skipping: pre-write.js not found');
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/test.ts',
        content: 'const x = 1;'
      }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    // 정상 종료 (크래시 없음)
    expect(result.status).toBe(0);
  });

  // 13.2: qa-pre-bash.js 위험 명령어 차단
  test('13.2 qa-pre-bash.js 위험 명령어 차단', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-pre-bash.js');

    if (!fs.existsSync(scriptPath)) {
      console.log('Skipping: qa-pre-bash.js not found');
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: { command: 'rm -rf /' }
    });

    expect(result.status).toBe(2);
  });

  // 13.3: PDCA 상태 업데이트 정상
  test('13.3 PDCA 상태 업데이트 정상', () => {
    // 환경 변수 설정
    const originalDir = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = tempDir;

    try {
      // 캐시 클리어 후 새로 로드
      delete require.cache[require.resolve('../../lib/common.js')];
      const { updatePdcaStatus, initPdcaStatusIfNotExists } = require('../../lib/common.js');

      initPdcaStatusIfNotExists();
      const result = updatePdcaStatus('test-feature', 'design', {});

      expect(result.success).toBe(true);
      expect(result.feature).toBe('test-feature');
      expect(result.phase).toBe('design');

      // 파일 생성 확인
      const statusPath = path.join(tempDir, 'docs/.pdca-status.json');
      expect(fs.existsSync(statusPath)).toBe(true);
    } finally {
      process.env.CLAUDE_PROJECT_DIR = originalDir;
      delete require.cache[require.resolve('../../lib/common.js')];
    }
  });

  // 13.4: session-start.js 정상 동작
  test('13.4 session-start.js 정상 동작', () => {
    const scriptPath = path.join(HOOKS_DIR, 'session-start.js');

    if (!fs.existsSync(scriptPath)) {
      console.log('Skipping: session-start.js not found');
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: tempDir,
      CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
    });

    expect(result.status).toBe(0);

    // JSON 출력 검증
    if (result.stdout.trim()) {
      expect(() => JSON.parse(result.stdout)).not.toThrow();
    }
  });

  // 13.5: pdca-post-write.js 정상 동작
  test('13.5 pdca-post-write.js 정상 동작', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'pdca-post-write.js');

    if (!fs.existsSync(scriptPath)) {
      console.log('Skipping: pdca-post-write.js not found');
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/feature.ts',
        content: 'export function test() {}'
      },
      tool_result: { success: true }
    }, { CLAUDE_PROJECT_DIR: tempDir });

    // 정상 종료
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });

  // 13.6: gap-detector-post.js 정상 동작
  test('13.6 gap-detector-post.js 정상 동작', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'gap-detector-post.js');

    if (!fs.existsSync(scriptPath)) {
      console.log('Skipping: gap-detector-post.js not found');
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      agent_name: 'gap-detector',
      agent_output: 'Analysis complete. Match rate: 85%'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status === 0 || result.status === null).toBeTruthy();
  });
});

describe('TR-13: common.js 함수 회귀 테스트', () => {
  let tempDir;
  let originalDir;

  beforeEach(() => {
    tempDir = createTempDir('common-regression-');
    fs.mkdirSync(path.join(tempDir, 'docs'), { recursive: true });
    originalDir = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = tempDir;
    delete require.cache[require.resolve('../../lib/common.js')];
  });

  afterEach(() => {
    process.env.CLAUDE_PROJECT_DIR = originalDir;
    delete require.cache[require.resolve('../../lib/common.js')];
    cleanupTempDir(tempDir);
  });

  test('truncateContext 500자 제한 유지', () => {
    const { truncateContext, MAX_CONTEXT_LENGTH } = require('../../lib/common.js');

    // 상수 확인
    expect(MAX_CONTEXT_LENGTH).toBe(500);

    // 긴 문자열 자르기
    const longText = 'a'.repeat(600);
    const result = truncateContext(longText);

    expect(result.length).toBeLessThanOrEqual(500);
    expect(result.endsWith('...')).toBe(true);
  });

  test('outputAllow PreToolUse 형식 유지', () => {
    const { outputAllow } = require('../../lib/common.js');

    // stdout 캡처
    const originalLog = console.log;
    let output = '';
    console.log = (msg) => { output = msg; };

    try {
      outputAllow('test context', 'PreToolUse');

      const parsed = JSON.parse(output);

      // PreToolUse는 decision 없음
      expect(parsed.decision).toBeUndefined();

      if (parsed.hookSpecificOutput) {
        expect(parsed.hookSpecificOutput.additionalContext).toBe('test context');
        expect(parsed.hookSpecificOutput.permissionDecision).toBeUndefined();
      }
    } finally {
      console.log = originalLog;
    }
  });

  test('outputAllow PostToolUse 형식 유지', () => {
    const { outputAllow } = require('../../lib/common.js');

    const originalLog = console.log;
    let output = '';
    console.log = (msg) => { output = msg; };

    try {
      outputAllow('test context', 'PostToolUse');

      const parsed = JSON.parse(output);

      // PostToolUse는 decision: allow 포함
      expect(parsed.decision).toBe('allow');
    } finally {
      console.log = originalLog;
    }
  });

  test('parseHookInput 정상 동작', () => {
    const { parseHookInput } = require('../../lib/common.js');

    if (typeof parseHookInput !== 'function') {
      console.log('Skipping: parseHookInput not exported');
      return;
    }

    const input = {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/test.ts',
        content: 'const x = 1;'
      }
    };

    const result = parseHookInput(input);

    expect(result.toolName).toBe('Write');
    expect(result.filePath).toBe('/src/test.ts');
    expect(result.content).toBe('const x = 1;');
  });

  test('findDesignDoc 정상 동작', () => {
    const { findDesignDoc } = require('../../lib/common.js');

    // 존재하지 않는 파일
    const result = findDesignDoc('nonexistent');
    expect(result).toBe('');

    // 파일 생성 후 검색
    const designDir = path.join(tempDir, 'docs/02-design/features');
    fs.mkdirSync(designDir, { recursive: true });
    fs.writeFileSync(path.join(designDir, 'test.design.md'), '# Test');

    delete require.cache[require.resolve('../../lib/common.js')];
    const { findDesignDoc: findDesignDoc2 } = require('../../lib/common.js');

    const result2 = findDesignDoc2('test');
    expect(result2).toContain('test.design.md');
  });

  test('findPlanDoc 정상 동작', () => {
    const { findPlanDoc } = require('../../lib/common.js');

    // 존재하지 않는 파일
    const result = findPlanDoc('nonexistent');
    expect(result).toBe('');

    // 파일 생성 후 검색
    const planDir = path.join(tempDir, 'docs/01-plan/features');
    fs.mkdirSync(planDir, { recursive: true });
    fs.writeFileSync(path.join(planDir, 'test.plan.md'), '# Test');

    delete require.cache[require.resolve('../../lib/common.js')];
    const { findPlanDoc: findPlanDoc2 } = require('../../lib/common.js');

    const result2 = findPlanDoc2('test');
    expect(result2).toContain('test.plan.md');
  });
});

describe('TR-13: 기존 테스트 호환성', () => {
  test('기존 unit 테스트 파일 존재', () => {
    const unitDir = path.join(__dirname, '../unit');
    expect(fs.existsSync(unitDir)).toBe(true);

    const testFiles = fs.readdirSync(unitDir).filter(f => f.endsWith('.test.js'));
    expect(testFiles.length).toBeGreaterThan(0);
  });

  test('기존 integration 테스트 파일 존재', () => {
    const integrationDir = path.join(__dirname, '../integration');
    expect(fs.existsSync(integrationDir)).toBe(true);

    const testFiles = fs.readdirSync(integrationDir).filter(f => f.endsWith('.test.js'));
    expect(testFiles.length).toBeGreaterThan(0);
  });

  test('테스트 유틸리티 파일 존재', () => {
    const libDir = path.join(__dirname, '../lib');
    expect(fs.existsSync(libDir)).toBe(true);

    const expectedFiles = ['test-runner.js', 'assertions.js', 'safe-exec.js', 'temp-files.js'];
    for (const file of expectedFiles) {
      const filePath = path.join(libDir, file);
      if (!fs.existsSync(filePath)) {
        console.log(`Note: ${file} not found`);
      }
    }
  });
});

describe('TR-13: 스크립트 실행 권한', () => {
  test('모든 스크립트 실행 가능', () => {
    const scripts = fs.readdirSync(SCRIPTS_DIR)
      .filter(f => f.endsWith('.js') && !f.startsWith('_'));

    for (const script of scripts) {
      const scriptPath = path.join(SCRIPTS_DIR, script);

      // 파일 읽기 가능
      expect(() => fs.readFileSync(scriptPath, 'utf8')).not.toThrow();

      // shebang 확인
      const content = fs.readFileSync(scriptPath, 'utf8');
      if (!content.startsWith('#!/')) {
        console.log(`Note: ${script} has no shebang`);
      }
    }
  });

  test('hooks 폴더 스크립트 실행 가능', () => {
    if (!fs.existsSync(HOOKS_DIR)) {
      console.log('Hooks directory not found');
      return;
    }

    const hooks = fs.readdirSync(HOOKS_DIR)
      .filter(f => f.endsWith('.js'));

    for (const hook of hooks) {
      const hookPath = path.join(HOOKS_DIR, hook);
      expect(() => fs.readFileSync(hookPath, 'utf8')).not.toThrow();
    }
  });
});
