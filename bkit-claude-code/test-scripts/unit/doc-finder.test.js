/**
 * bkit v1.4.2 Doc Finder Unit Tests
 *
 * TR-07: findDesignDoc() 권한 검증 동작 확인
 * TR-08: findPlanDoc() 권한 검증 동작 확인
 *
 * 테스트 대상: lib/common.js - findDesignDoc(), findPlanDoc()
 */

const fs = require('fs');
const path = require('path');
const { runScriptWithJson } = require('../lib/safe-exec');
const {
  createTempDir,
  cleanupTempDir,
  createMockDesignDoc,
  createMockPlanDoc
} = require('../lib/temp-files');

// Wrapper 스크립트 경로
const DOC_FINDER_WRAPPER = path.join(__dirname, '../fixtures/doc-finder-wrapper.js');

// 직접 import (단위 테스트)
const { findDesignDoc, findPlanDoc } = require('../../lib/common.js');

describe('TR-07: findDesignDoc() 권한 검증', () => {
  let tempDir;
  let originalProjectDir;

  beforeEach(() => {
    tempDir = createTempDir('doc-finder-');
    originalProjectDir = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = tempDir;
  });

  afterEach(() => {
    process.env.CLAUDE_PROJECT_DIR = originalProjectDir;
    cleanupTempDir(tempDir);
  });

  test('7.1 File exists, readable - 경로 반환', () => {
    createMockDesignDoc(tempDir, 'test-feature');

    const result = findDesignDoc('test-feature');

    expect(result).toContain('test-feature.design.md');
    expect(result).toContain(path.join('docs', '02-design', 'features'));
  });

  test('7.2 File exists, no read permission - 빈 문자열 반환 (Unix only)', () => {
    // Windows에서는 skip
    if (process.platform === 'win32') {
      console.log('Skipping permission test on Windows');
      return;
    }

    const docPath = createMockDesignDoc(tempDir, 'noperm-feature');
    fs.chmodSync(docPath, 0o000);

    try {
      const result = findDesignDoc('noperm-feature');
      expect(result).toBe('');
    } finally {
      // 정리를 위해 권한 복구
      fs.chmodSync(docPath, 0o644);
    }
  });

  test('7.3 File not exists - 빈 문자열 반환', () => {
    const result = findDesignDoc('nonexistent-feature');

    expect(result).toBe('');
  });

  test('7.4 Empty feature - 빈 문자열 반환', () => {
    const result = findDesignDoc('');

    expect(result).toBe('');
  });

  test('7.5 Null feature - 빈 문자열 반환', () => {
    const result = findDesignDoc(null);

    expect(result).toBe('');
  });

  test('7.6 Undefined feature - 빈 문자열 반환', () => {
    const result = findDesignDoc(undefined);

    expect(result).toBe('');
  });

  test('7.7 Feature with special characters', () => {
    // 특수문자가 포함된 feature 이름
    const feature = 'test-feature-v1.2';
    createMockDesignDoc(tempDir, feature);

    const result = findDesignDoc(feature);

    expect(result).toContain(`${feature}.design.md`);
  });

  test('7.8 Multiple search paths - 첫 번째 매치 반환', () => {
    // 두 위치에 모두 파일 생성
    createMockDesignDoc(tempDir, 'multi-feature'); // features/

    const docsDesignDir = path.join(tempDir, 'docs', '02-design');
    if (!fs.existsSync(docsDesignDir)) {
      fs.mkdirSync(docsDesignDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(docsDesignDir, 'multi-feature.design.md'),
      '# Alternative location'
    );

    const result = findDesignDoc('multi-feature');

    // features/ 경로가 먼저 검색됨
    expect(result).toContain('features');
  });
});

describe('TR-08: findPlanDoc() 권한 검증', () => {
  let tempDir;
  let originalProjectDir;

  beforeEach(() => {
    tempDir = createTempDir('plan-finder-');
    originalProjectDir = process.env.CLAUDE_PROJECT_DIR;
    process.env.CLAUDE_PROJECT_DIR = tempDir;
  });

  afterEach(() => {
    process.env.CLAUDE_PROJECT_DIR = originalProjectDir;
    cleanupTempDir(tempDir);
  });

  test('8.1 File exists, readable - 경로 반환', () => {
    createMockPlanDoc(tempDir, 'test-feature');

    const result = findPlanDoc('test-feature');

    expect(result).toContain('test-feature.plan.md');
    expect(result).toContain(path.join('docs', '01-plan', 'features'));
  });

  test('8.2 File exists, no read permission - 빈 문자열 반환 (Unix only)', () => {
    if (process.platform === 'win32') {
      console.log('Skipping permission test on Windows');
      return;
    }

    const docPath = createMockPlanDoc(tempDir, 'noperm-feature');
    fs.chmodSync(docPath, 0o000);

    try {
      const result = findPlanDoc('noperm-feature');
      expect(result).toBe('');
    } finally {
      fs.chmodSync(docPath, 0o644);
    }
  });

  test('8.3 File not exists - 빈 문자열 반환', () => {
    const result = findPlanDoc('nonexistent-feature');

    expect(result).toBe('');
  });

  test('8.4 Empty feature - 빈 문자열 반환', () => {
    const result = findPlanDoc('');

    expect(result).toBe('');
  });

  test('8.5 한글 feature 이름', () => {
    const feature = 'korean-기능';
    createMockPlanDoc(tempDir, feature);

    const result = findPlanDoc(feature);

    expect(result).toContain(`${feature}.plan.md`);
  });
});

describe('findDesignDoc/findPlanDoc Wrapper 테스트', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir('wrapper-test-');
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  test('Wrapper: findDesignDoc - 파일 있음', () => {
    createMockDesignDoc(tempDir, 'wrapper-test');

    const result = runScriptWithJson(DOC_FINDER_WRAPPER, {
      action: 'findDesignDoc',
      feature: 'wrapper-test'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toContain('wrapper-test.design.md');
  });

  test('Wrapper: findDesignDoc - 파일 없음', () => {
    const result = runScriptWithJson(DOC_FINDER_WRAPPER, {
      action: 'findDesignDoc',
      feature: 'nonexistent'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('');
  });

  test('Wrapper: findPlanDoc - 파일 있음', () => {
    createMockPlanDoc(tempDir, 'wrapper-plan');

    const result = runScriptWithJson(DOC_FINDER_WRAPPER, {
      action: 'findPlanDoc',
      feature: 'wrapper-plan'
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toContain('wrapper-plan.plan.md');
  });

  test('Wrapper: Empty feature', () => {
    const result = runScriptWithJson(DOC_FINDER_WRAPPER, {
      action: 'findDesignDoc',
      feature: ''
    }, { CLAUDE_PROJECT_DIR: tempDir });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('');
  });
});

describe('FR-06: fs.accessSync 사용 확인', () => {
  test('findDesignDoc uses accessSync with R_OK', () => {
    // 코드 검사: fs.accessSync 사용 확인
    const commonJs = fs.readFileSync(
      path.join(__dirname, '../../lib/common.js'),
      'utf8'
    );

    // findDesignDoc 함수에서 fs.accessSync 사용 확인
    expect(commonJs).toContain('fs.accessSync');
    expect(commonJs).toContain('fs.constants.R_OK');
  });

  test('findPlanDoc uses accessSync with R_OK', () => {
    const commonJs = fs.readFileSync(
      path.join(__dirname, '../../lib/common.js'),
      'utf8'
    );

    // 두 함수 모두 accessSync 패턴 사용
    const accessSyncMatches = commonJs.match(/fs\.accessSync\([^)]+fs\.constants\.R_OK/g);
    expect(accessSyncMatches).not.toBeNull();
    expect(accessSyncMatches.length).toBeGreaterThanOrEqual(2); // findDesignDoc + findPlanDoc
  });
});
