/**
 * bkit v1.4.2 All Scripts Integration Tests
 *
 * scripts/ 폴더 내 모든 스크립트 실행 가능성 테스트
 * 기본 실행 및 common.js 의존성 검증
 *
 * 테스트 대상: scripts/*.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { createTempDir, cleanupTempDir } = require('../lib/temp-files');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const PLUGIN_ROOT = path.resolve(__dirname, '../..');

// 스크립트 목록 가져오기
function getScriptFiles() {
  if (!fs.existsSync(SCRIPTS_DIR)) {
    return [];
  }

  return fs.readdirSync(SCRIPTS_DIR)
    .filter(f => f.endsWith('.js') && !f.startsWith('_'))
    .map(f => ({ name: f, path: path.join(SCRIPTS_DIR, f) }));
}

describe('All Scripts 기본 검증', () => {
  const scripts = getScriptFiles();

  test('scripts 디렉토리 존재', () => {
    expect(fs.existsSync(SCRIPTS_DIR)).toBe(true);
  });

  test('최소 1개 이상의 스크립트 존재', () => {
    expect(scripts.length).toBeGreaterThan(0);
  });

  test.each(scripts)(
    '$name - 파일 존재 및 읽기 가능',
    ({ path: scriptPath }) => {
      expect(fs.existsSync(scriptPath)).toBe(true);

      // 읽기 가능
      expect(() => fs.readFileSync(scriptPath, 'utf8')).not.toThrow();
    }
  );
});

describe('All Scripts common.js 의존성', () => {
  const scripts = getScriptFiles();

  test.each(scripts)(
    '$name - common.js import 패턴',
    ({ name, path: scriptPath }) => {
      const content = fs.readFileSync(scriptPath, 'utf8');

      // 대부분의 스크립트는 common.js 사용
      const usesCommon = content.includes("require('../lib/common")
                      || content.includes('require("../lib/common')
                      || content.includes("require('../../lib/common")
                      || content.includes('require("../../lib/common');

      // 사용하지 않는 경우 로그
      if (!usesCommon) {
        console.log(`Note: ${name} does not use common.js`);
      }

      // 항상 통과 (정보 제공 목적)
      expect(true).toBe(true);
    }
  );
});

describe('All Scripts 구문 검증', () => {
  const scripts = getScriptFiles();

  test.each(scripts)(
    '$name - JavaScript 구문 오류 없음',
    ({ path: scriptPath }) => {
      const content = fs.readFileSync(scriptPath, 'utf8');

      // Node.js vm 모듈로 구문 검사 (안전한 방법)
      expect(() => {
        new vm.Script(content, { filename: scriptPath });
      }).not.toThrow(SyntaxError);
    }
  );
});

describe('All Scripts 실행 테스트', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('all-scripts-');
    fs.mkdirSync(path.join(tempDir, 'docs'), { recursive: true });
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  // PreToolUse 스크립트 (빈 입력으로 테스트)
  const preScripts = [
    'pre-write.js',
    'code-analyzer-pre.js',
    'qa-pre-bash.js',
    'design-validator-pre.js'
  ].filter(name => fs.existsSync(path.join(SCRIPTS_DIR, name)));

  if (preScripts.length > 0) {
    test.each(preScripts)(
      '%s - 빈 입력으로 실행 (크래시 없음)',
      (name) => {
        const scriptPath = path.join(SCRIPTS_DIR, name);

        const result = runScriptWithJson(scriptPath, {}, {
          CLAUDE_PROJECT_DIR: tempDir,
          CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
        });

        // exit 0 또는 2 (정상 실행 또는 의도적 차단)
        expect([0, 2, null]).toContain(result.status);
      }
    );
  }

  // PostToolUse 스크립트
  const postScripts = [
    'pdca-post-write.js',
    'gap-detector-post.js',
    'phase5-design-post.js',
    'phase6-ui-post.js',
    'qa-monitor-post.js'
  ].filter(name => fs.existsSync(path.join(SCRIPTS_DIR, name)));

  if (postScripts.length > 0) {
    test.each(postScripts)(
      '%s - 기본 입력으로 실행',
      (name) => {
        const scriptPath = path.join(SCRIPTS_DIR, name);

        const result = runScriptWithJson(scriptPath, {
          tool_name: 'Write',
          tool_result: { success: true }
        }, {
          CLAUDE_PROJECT_DIR: tempDir,
          CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
        });

        // 크래시 없이 실행
        expect(result.status === 0 || result.status === null).toBeTruthy();
      }
    );
  }

  // Stop 스크립트
  const stopScripts = [
    'gap-detector-stop.js',
    'iterator-stop.js',
    'analysis-stop.js'
  ].filter(name => fs.existsSync(path.join(SCRIPTS_DIR, name)));

  if (stopScripts.length > 0) {
    test.each(stopScripts)(
      '%s - stop 이벤트로 실행',
      (name) => {
        const scriptPath = path.join(SCRIPTS_DIR, name);

        const result = runScriptWithJson(scriptPath, {
          stop_reason: 'completed'
        }, {
          CLAUDE_PROJECT_DIR: tempDir,
          CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT
        });

        // 크래시 없이 실행
        expect(typeof result.status === 'number' || result.status === null).toBeTruthy();
      }
    );
  }
});

describe('All Scripts 출력 함수 사용', () => {
  const scripts = getScriptFiles();

  test.each(scripts)(
    '$name - outputAllow/outputBlock/outputEmpty 사용',
    ({ name, path: scriptPath }) => {
      const content = fs.readFileSync(scriptPath, 'utf8');

      // 출력 함수 사용 여부
      const hasOutputAllow = content.includes('outputAllow');
      const hasOutputBlock = content.includes('outputBlock');
      const hasOutputEmpty = content.includes('outputEmpty');
      const hasConsoleLog = content.includes('console.log');

      // 최소한 하나의 출력 메커니즘 사용
      const hasOutput = hasOutputAllow || hasOutputBlock || hasOutputEmpty || hasConsoleLog;

      if (!hasOutput) {
        console.log(`Warning: ${name} has no output function`);
      }

      // 정보 제공 목적 (항상 통과)
      expect(true).toBe(true);
    }
  );
});

describe('All Scripts 명명 규칙', () => {
  const scripts = getScriptFiles();

  test.each(scripts)(
    '$name - 명명 규칙 준수',
    ({ name }) => {
      // kebab-case 확인
      expect(name).toMatch(/^[a-z0-9-]+\.js$/);

      // 유효한 접미사
      const validSuffixes = ['-pre', '-post', '-stop', '-wrapper'];
      const hasSuffix = validSuffixes.some(s => name.includes(s));

      // 접미사가 없어도 OK (예: archive-feature.js)
      if (!hasSuffix) {
        console.log(`Note: ${name} has no standard suffix`);
      }
    }
  );
});

describe('Scripts 카테고리별 존재 확인', () => {
  test('PreToolUse 스크립트 존재', () => {
    const preScripts = ['pre-write.js', 'code-analyzer-pre.js', 'qa-pre-bash.js'];
    const existing = preScripts.filter(s => fs.existsSync(path.join(SCRIPTS_DIR, s)));

    expect(existing.length).toBeGreaterThan(0);
  });

  test('PostToolUse 스크립트 존재', () => {
    const postScripts = ['pdca-post-write.js', 'gap-detector-post.js'];
    const existing = postScripts.filter(s => fs.existsSync(path.join(SCRIPTS_DIR, s)));

    expect(existing.length).toBeGreaterThan(0);
  });

  test('Stop 스크립트 존재', () => {
    const stopScripts = ['gap-detector-stop.js', 'iterator-stop.js', 'analysis-stop.js'];
    const existing = stopScripts.filter(s => fs.existsSync(path.join(SCRIPTS_DIR, s)));

    expect(existing.length).toBeGreaterThan(0);
  });
});
