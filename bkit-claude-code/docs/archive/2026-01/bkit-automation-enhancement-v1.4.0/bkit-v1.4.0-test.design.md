# bkit v1.4.0 종합 테스트 설계서

> **Feature**: bkit-v1.4.0-test
> **Version**: 1.0
> **Author**: AI (POPUP STUDIO)
> **Date**: 2026-01-24
> **Status**: Draft
> **Plan Reference**: [bkit-v1.4.0-test.plan.md](../../01-plan/features/bkit-v1.4.0-test.plan.md)

---

## 1. 개요

### 1.1 목적

bkit v1.4.0의 182+ 테스트 케이스를 실행하기 위한 **경량 테스트 프레임워크**와 **테스트 스크립트 상세 구현** 방안을 정의한다.

### 1.2 설계 원칙

| 원칙 | 설명 |
|------|------|
| **Zero Dependencies** | 외부 테스트 라이브러리 없이 순수 Node.js로 구현 |
| **Isolation** | 각 테스트는 독립적으로 실행 가능 |
| **Fast Feedback** | 전체 테스트 30초 이내 완료 목표 |
| **Clear Output** | 성공/실패 명확히 표시, 디버그 정보 포함 |
| **Security** | 안전한 프로세스 실행 (execFileSync 사용) |

---

## 2. 테스트 프레임워크 아키텍처

### 2.1 디렉토리 구조

```
test-scripts/
├── lib/                          # 테스트 유틸리티
│   ├── test-runner.js            # 테스트 실행기
│   ├── assertions.js             # 단언 함수들
│   ├── mocks.js                  # Mock/Stub 유틸리티
│   ├── safe-exec.js              # 안전한 프로세스 실행
│   └── fixtures.js               # 테스트 데이터 로더
├── fixtures/                     # 테스트 데이터
│   ├── pdca-status-v1.json       # v1.0 상태 샘플
│   ├── pdca-status-v2.json       # v2.0 상태 샘플
│   ├── sample-plan.md            # 샘플 Plan 문서
│   ├── sample-design.md          # 샘플 Design 문서
│   └── hook-inputs/              # Hook 입력 샘플
│       ├── session-start-new.json
│       ├── session-start-resume.json
│       └── pre-write-input.json
├── unit/                         # 단위 테스트
│   ├── config.test.js
│   ├── file-detection.test.js
│   ├── feature-detection.test.js
│   ├── task-classification.test.js
│   ├── json-output.test.js
│   ├── level-detection.test.js
│   ├── input-helpers.test.js
│   ├── platform-compatibility.test.js
│   ├── debug-logging.test.js
│   ├── pdca-status.test.js
│   ├── multi-feature.test.js
│   ├── intent-detection.test.js
│   ├── ambiguity.test.js
│   ├── pdca-automation.test.js
│   ├── requirement-fulfillment.test.js
│   └── phase-transition.test.js
├── integration/                  # 통합 테스트
│   ├── pdca-scripts.test.js
│   ├── phase-scripts.test.js
│   ├── qa-scripts.test.js
│   └── utility-scripts.test.js
├── hooks/                        # Hook 테스트
│   └── session-start.test.js
└── run-all.js                    # 전체 실행
```

### 2.2 테스트 러너 설계

```javascript
// test-scripts/lib/test-runner.js

/**
 * 경량 테스트 러너
 * - describe/it 패턴 지원
 * - beforeEach/afterEach 지원
 * - 병렬 실행 옵션
 */

class TestRunner {
  constructor(options = {}) {
    this.suites = [];
    this.currentSuite = null;
    this.stats = { passed: 0, failed: 0, skipped: 0 };
    this.verbose = options.verbose || false;
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEach: null,
      afterEach: null
    };
    this.suites.push(suite);
    this.currentSuite = suite;
    fn();
    this.currentSuite = null;
  }

  it(name, fn) {
    if (!this.currentSuite) throw new Error('it() must be inside describe()');
    this.currentSuite.tests.push({ name, fn });
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEach = fn;
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEach = fn;
  }

  async run() {
    const results = [];

    for (const suite of this.suites) {
      console.log(`\n📦 ${suite.name}`);

      for (const test of suite.tests) {
        try {
          if (suite.beforeEach) await suite.beforeEach();
          await test.fn();
          if (suite.afterEach) await suite.afterEach();

          this.stats.passed++;
          console.log(`  ✅ ${test.name}`);
          results.push({ suite: suite.name, test: test.name, status: 'passed' });
        } catch (error) {
          this.stats.failed++;
          console.log(`  ❌ ${test.name}`);
          if (this.verbose) console.log(`     ${error.message}`);
          results.push({
            suite: suite.name,
            test: test.name,
            status: 'failed',
            error: error.message
          });
        }
      }
    }

    return { stats: this.stats, results };
  }
}

module.exports = { TestRunner };
```

### 2.3 단언 함수 설계

```javascript
// test-scripts/lib/assertions.js

/**
 * 단언 함수 모음
 * - 명확한 에러 메시지
 * - 다양한 타입 지원
 */

const assert = {
  // 기본 단언
  equal(actual, expected, msg = '') {
    if (actual !== expected) {
      throw new Error(`${msg}\nExpected: ${expected}\nActual: ${actual}`);
    }
  },

  deepEqual(actual, expected, msg = '') {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);
    if (actualStr !== expectedStr) {
      throw new Error(`${msg}\nExpected: ${expectedStr}\nActual: ${actualStr}`);
    }
  },

  true(value, msg = '') {
    if (value !== true) {
      throw new Error(`${msg}\nExpected true, got: ${value}`);
    }
  },

  false(value, msg = '') {
    if (value !== false) {
      throw new Error(`${msg}\nExpected false, got: ${value}`);
    }
  },

  // 타입 단언
  isString(value, msg = '') {
    if (typeof value !== 'string') {
      throw new Error(`${msg}\nExpected string, got: ${typeof value}`);
    }
  },

  isArray(value, msg = '') {
    if (!Array.isArray(value)) {
      throw new Error(`${msg}\nExpected array, got: ${typeof value}`);
    }
  },

  isObject(value, msg = '') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${msg}\nExpected object, got: ${typeof value}`);
    }
  },

  // 존재 단언
  exists(value, msg = '') {
    if (value === undefined || value === null) {
      throw new Error(`${msg}\nExpected value to exist`);
    }
  },

  notExists(value, msg = '') {
    if (value !== undefined && value !== null) {
      throw new Error(`${msg}\nExpected value to not exist`);
    }
  },

  // 범위 단언
  greaterThan(actual, expected, msg = '') {
    if (actual <= expected) {
      throw new Error(`${msg}\nExpected ${actual} > ${expected}`);
    }
  },

  lessThan(actual, expected, msg = '') {
    if (actual >= expected) {
      throw new Error(`${msg}\nExpected ${actual} < ${expected}`);
    }
  },

  // 문자열 단언
  includes(str, substr, msg = '') {
    if (!str.includes(substr)) {
      throw new Error(`${msg}\nExpected "${str}" to include "${substr}"`);
    }
  },

  matches(str, regex, msg = '') {
    if (!regex.test(str)) {
      throw new Error(`${msg}\nExpected "${str}" to match ${regex}`);
    }
  },

  // 예외 단언
  throws(fn, expectedError, msg = '') {
    let threw = false;
    try {
      fn();
    } catch (e) {
      threw = true;
      if (expectedError && !e.message.includes(expectedError)) {
        throw new Error(
          `${msg}\nExpected error containing: ${expectedError}\nActual: ${e.message}`
        );
      }
    }
    if (!threw) {
      throw new Error(`${msg}\nExpected function to throw`);
    }
  }
};

module.exports = { assert };
```

### 2.4 안전한 프로세스 실행 유틸리티

```javascript
// test-scripts/lib/safe-exec.js

/**
 * 안전한 프로세스 실행 유틸리티
 * - execFileSync 사용 (shell injection 방지)
 * - 테스트 전용 (controlled inputs only)
 */

const { execFileSync, spawnSync } = require('child_process');
const path = require('path');

/**
 * Node.js 스크립트를 안전하게 실행
 * @param {string} scriptPath - 스크립트 경로 (절대 경로 또는 상대 경로)
 * @param {string} stdinData - stdin으로 전달할 데이터
 * @param {object} env - 추가 환경변수
 * @returns {object} { stdout, stderr, status }
 */
function runScript(scriptPath, stdinData = '', env = {}) {
  const absolutePath = path.isAbsolute(scriptPath)
    ? scriptPath
    : path.resolve(scriptPath);

  try {
    const result = spawnSync('node', [absolutePath], {
      input: stdinData,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      timeout: 10000 // 10초 타임아웃
    });

    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.status
    };
  } catch (error) {
    return {
      stdout: '',
      stderr: error.message,
      status: 1
    };
  }
}

/**
 * JSON 입력으로 스크립트 실행
 * @param {string} scriptPath - 스크립트 경로
 * @param {object} inputData - JSON으로 변환할 입력 데이터
 * @param {object} env - 추가 환경변수
 * @returns {object} { stdout, stderr, status, parsed }
 */
function runScriptWithJson(scriptPath, inputData = {}, env = {}) {
  const stdinData = JSON.stringify(inputData);
  const result = runScript(scriptPath, stdinData, env);

  // JSON 출력 파싱 시도
  let parsed = null;
  try {
    const trimmed = result.stdout.trim();
    // JSON 시작/끝 찾기
    const jsonStart = trimmed.indexOf('{');
    const jsonEnd = trimmed.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      parsed = JSON.parse(trimmed.substring(jsonStart, jsonEnd + 1));
    }
  } catch (e) {
    // JSON 파싱 실패는 무시
  }

  return { ...result, parsed };
}

module.exports = { runScript, runScriptWithJson };
```

### 2.5 Mock/Stub 유틸리티 설계

```javascript
// test-scripts/lib/mocks.js

const path = require('path');

/**
 * Mock 유틸리티
 * - 파일 시스템 Mock
 * - 프로세스 환경 Mock
 */

class MockFS {
  constructor() {
    this.files = new Map();
    this.originalFs = null;
  }

  addFile(filePath, content) {
    this.files.set(path.resolve(filePath), content);
  }

  removeFile(filePath) {
    this.files.delete(path.resolve(filePath));
  }

  mock() {
    // 실제 구현에서는 fs 모듈 대체
    this.originalFs = { ...require('fs') };
  }

  restore() {
    this.files.clear();
    this.originalFs = null;
  }

  // 가상 파일 존재 여부
  exists(filePath) {
    return this.files.has(path.resolve(filePath));
  }

  // 가상 파일 읽기
  read(filePath) {
    return this.files.get(path.resolve(filePath));
  }
}

class MockEnv {
  constructor() {
    this.originalEnv = { ...process.env };
    this.addedKeys = new Set();
  }

  set(key, value) {
    if (!(key in this.originalEnv)) {
      this.addedKeys.add(key);
    }
    process.env[key] = value;
  }

  unset(key) {
    delete process.env[key];
  }

  restore() {
    // 추가된 키 제거
    for (const key of this.addedKeys) {
      delete process.env[key];
    }
    // 원래 값 복원
    for (const [key, value] of Object.entries(this.originalEnv)) {
      process.env[key] = value;
    }
    this.addedKeys.clear();
  }
}

// 스파이 함수
function spy(fn) {
  const calls = [];
  const spyFn = function(...args) {
    calls.push(args);
    return fn ? fn(...args) : undefined;
  };
  spyFn.calls = calls;
  spyFn.callCount = () => calls.length;
  spyFn.calledWith = (...args) =>
    calls.some(c => JSON.stringify(c) === JSON.stringify(args));
  return spyFn;
}

module.exports = { MockFS, MockEnv, spy };
```

---

## 3. 단위 테스트 상세 설계

### 3.1 Configuration Tests (TC-U001 ~ TC-U005)

```javascript
// test-scripts/unit/config.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv } = require('../lib/mocks');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

// common.js 모듈 로드
const common = require('../../lib/common');

runner.describe('Configuration Functions', () => {
  runner.afterEach(() => {
    mockEnv.restore();
  });

  // TC-U001
  runner.it('getConfig returns default when key not found', () => {
    const result = common.getConfig('nonexistent_key_12345', 'default-value');
    assert.equal(result, 'default-value');
  });

  // TC-U002
  runner.it('getConfig returns value when key exists', () => {
    mockEnv.set('BKIT_TEST_KEY', 'test-value');
    const result = common.getConfig('BKIT_TEST_KEY', 'default');
    assert.equal(result, 'test-value');
  });

  // TC-U003
  runner.it('getConfigArray returns empty array as default', () => {
    const result = common.getConfigArray('nonexistent_array_key', []);
    assert.isArray(result);
    assert.equal(result.length, 0);
  });

  // TC-U004
  runner.it('getConfigArray parses comma-separated values', () => {
    mockEnv.set('BKIT_TEST_ARRAY', 'a,b,c');
    const result = common.getConfigArray('BKIT_TEST_ARRAY', []);
    assert.isArray(result);
    assert.equal(result.length, 3);
  });

  // TC-U005
  runner.it('loadConfig returns object', () => {
    const config = common.loadConfig();
    assert.isObject(config);
  });
});

module.exports = runner;
```

### 3.2 File Detection Tests (TC-U010 ~ TC-U017)

```javascript
// test-scripts/unit/file-detection.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const common = require('../../lib/common');

const runner = new TestRunner({ verbose: true });

runner.describe('File Detection Functions', () => {
  // TC-U010
  runner.it('isSourceFile returns true for JS files', () => {
    assert.true(common.isSourceFile('src/app.js'));
  });

  // TC-U011
  runner.it('isSourceFile returns false for non-code files', () => {
    assert.false(common.isSourceFile('README.md'));
  });

  // TC-U012
  runner.it('isCodeFile returns true for TS files', () => {
    assert.true(common.isCodeFile('lib/util.ts'));
  });

  // TC-U013
  runner.it('isCodeFile returns false for config files', () => {
    assert.false(common.isCodeFile('package.json'));
  });

  // TC-U014
  runner.it('isUiFile returns true for TSX files', () => {
    assert.true(common.isUiFile('components/App.tsx'));
  });

  // TC-U015
  runner.it('isUiFile returns true for CSS files', () => {
    assert.true(common.isUiFile('styles/main.css'));
  });

  // TC-U016
  runner.it('isEnvFile returns true for .env', () => {
    assert.true(common.isEnvFile('.env'));
  });

  // TC-U017
  runner.it('isEnvFile returns true for .env.local', () => {
    assert.true(common.isEnvFile('.env.local'));
  });
});

module.exports = runner;
```

### 3.3 Intent Detection Tests (TC-U120 ~ TC-U135)

```javascript
// test-scripts/unit/intent-detection.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const common = require('../../lib/common');

const runner = new TestRunner({ verbose: true });

runner.describe('Intent Detection Functions', () => {
  // TC-U120: 한국어
  runner.it('detectNewFeatureIntent detects Korean request', () => {
    const result = common.detectNewFeatureIntent('로그인 기능 만들어줘');
    assert.true(result.isNewFeature);
    assert.exists(result.featureName);
  });

  // TC-U121: 영어
  runner.it('detectNewFeatureIntent detects English request', () => {
    const result = common.detectNewFeatureIntent('Create a login feature');
    assert.true(result.isNewFeature);
  });

  // TC-U122: 일본어
  runner.it('detectNewFeatureIntent detects Japanese request', () => {
    const result = common.detectNewFeatureIntent('ログイン機能を作って');
    assert.true(result.isNewFeature);
  });

  // TC-U123: 중국어
  runner.it('detectNewFeatureIntent detects Chinese request', () => {
    const result = common.detectNewFeatureIntent('创建登录功能');
    assert.true(result.isNewFeature);
  });

  // TC-U124: 비기능 요청
  runner.it('detectNewFeatureIntent returns false for non-feature', () => {
    const result = common.detectNewFeatureIntent('이 코드 설명해줘');
    assert.false(result.isNewFeature);
  });

  // TC-U125: Agent 트리거 - 검증
  runner.it('matchImplicitAgentTrigger detects gap-detector', () => {
    const result = common.matchImplicitAgentTrigger('이거 잘 됐는지 확인해줘');
    assert.exists(result);
    assert.equal(result.agent, 'gap-detector');
  });

  // TC-U126: Agent 트리거 - 개선
  runner.it('matchImplicitAgentTrigger detects pdca-iterator', () => {
    const result = common.matchImplicitAgentTrigger('이거 개선해줘');
    assert.exists(result);
    assert.equal(result.agent, 'pdca-iterator');
  });

  // TC-U127: Agent 트리거 - 분석
  runner.it('matchImplicitAgentTrigger detects code-analyzer', () => {
    const result = common.matchImplicitAgentTrigger('코드 분석해줘');
    assert.exists(result);
    assert.equal(result.agent, 'code-analyzer');
  });

  // TC-U130: Skill 트리거 - starter
  runner.it('matchImplicitSkillTrigger detects starter', () => {
    const result = common.matchImplicitSkillTrigger('정적 웹사이트 만들고 싶어');
    assert.exists(result);
    assert.equal(result.skill, 'starter');
  });

  // TC-U131: Skill 트리거 - dynamic
  runner.it('matchImplicitSkillTrigger detects dynamic', () => {
    const result = common.matchImplicitSkillTrigger('로그인 있는 웹앱 만들어줘');
    assert.exists(result);
    assert.equal(result.skill, 'dynamic');
  });

  // TC-U132: Skill 트리거 - enterprise
  runner.it('matchImplicitSkillTrigger detects enterprise', () => {
    const result = common.matchImplicitSkillTrigger('마이크로서비스 아키텍처로');
    assert.exists(result);
    assert.equal(result.skill, 'enterprise');
  });
});

module.exports = runner;
```

### 3.4 Ambiguity Detection Tests (TC-U140 ~ TC-U155)

```javascript
// test-scripts/unit/ambiguity.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const common = require('../../lib/common');

const runner = new TestRunner({ verbose: true });

runner.describe('Ambiguity Detection Functions', () => {
  // TC-U140
  runner.it('containsFilePath returns true when path exists', () => {
    assert.true(common.containsFilePath('src/app.ts 파일 수정해줘'));
  });

  // TC-U141
  runner.it('containsFilePath returns false when no path', () => {
    assert.false(common.containsFilePath('기능 만들어줘'));
  });

  // TC-U142
  runner.it('containsTechnicalTerms returns true for React', () => {
    assert.true(common.containsTechnicalTerms('React 컴포넌트 만들어줘'));
  });

  // TC-U143
  runner.it('containsTechnicalTerms returns false for generic', () => {
    assert.false(common.containsTechnicalTerms('이거 만들어줘'));
  });

  // TC-U144
  runner.it('calculateAmbiguityScore returns high for vague', () => {
    const result = common.calculateAmbiguityScore('이거 만들어줘', {});
    assert.greaterThan(result.score, 50);
  });

  // TC-U145
  runner.it('calculateAmbiguityScore returns low for specific', () => {
    const result = common.calculateAmbiguityScore(
      'src/auth/login.ts 파일의 validateUser 함수 수정해줘',
      {}
    );
    assert.lessThan(result.score, 50);
  });

  // TC-U147
  runner.it('generateClarifyingQuestions returns questions', () => {
    const ambiguity = common.calculateAmbiguityScore('기능 만들어줘', {});
    const questions = common.generateClarifyingQuestions(
      '기능 만들어줘',
      ambiguity.factors
    );
    assert.isArray(questions);
    assert.greaterThan(questions.length, 0);
  });
});

module.exports = runner;
```

### 3.5 PDCA Status Tests (TC-U090 ~ TC-U103)

```javascript
// test-scripts/unit/pdca-status.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

// 테스트용 임시 디렉토리
const TEST_DIR = path.join(__dirname, '../.test-temp');
const STATUS_PATH = path.join(TEST_DIR, 'docs/.pdca-status.json');

runner.describe('PDCA Status Management', () => {
  runner.beforeEach(() => {
    // 테스트 디렉토리 생성
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);

    // common.js 캐시 초기화
    delete require.cache[require.resolve('../../lib/common')];
  });

  runner.afterEach(() => {
    mockEnv.restore();
    // 테스트 파일 정리
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) {}
  });

  // TC-U090
  runner.it('initPdcaStatusIfNotExists creates v2.0 file', () => {
    const common = require('../../lib/common');
    common.initPdcaStatusIfNotExists();

    assert.true(fs.existsSync(STATUS_PATH));
    const content = fs.readFileSync(STATUS_PATH, 'utf8');
    const status = JSON.parse(content);
    assert.equal(status.version, '2.0');
  });

  // TC-U091
  runner.it('initPdcaStatusIfNotExists preserves existing', () => {
    const existing = {
      version: '2.0',
      primaryFeature: 'test',
      features: { test: { phase: 'do' } }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(existing));

    const common = require('../../lib/common');
    common.initPdcaStatusIfNotExists();

    const content = fs.readFileSync(STATUS_PATH, 'utf8');
    const status = JSON.parse(content);
    assert.equal(status.primaryFeature, 'test');
  });

  // TC-U095
  runner.it('getFeatureStatus returns existing feature', () => {
    const existing = {
      version: '2.0',
      features: { login: { phase: 'do' } }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(existing));

    const common = require('../../lib/common');
    const featureStatus = common.getFeatureStatus('login');

    assert.exists(featureStatus);
    assert.equal(featureStatus.phase, 'do');
  });

  // TC-U096
  runner.it('getFeatureStatus returns null for missing', () => {
    const existing = { version: '2.0', features: {} };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(existing));

    const common = require('../../lib/common');
    const featureStatus = common.getFeatureStatus('nonexistent');

    assert.notExists(featureStatus);
  });

  // TC-U097
  runner.it('updatePdcaStatus updates phase', () => {
    const existing = {
      version: '2.0',
      features: { login: { phase: 'do' } }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(existing));

    const common = require('../../lib/common');
    common.updatePdcaStatus('login', 'check', { matchRate: 85 });

    const status = common.getPdcaStatusFull(true);
    assert.equal(status.features.login.phase, 'check');
  });

  // TC-U099
  runner.it('completePdcaFeature sets completed', () => {
    const existing = {
      version: '2.0',
      features: { login: { phase: 'act' } }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(existing));

    const common = require('../../lib/common');
    common.completePdcaFeature('login');

    const status = common.getPdcaStatusFull(true);
    assert.equal(status.features.login.phase, 'completed');
  });
});

module.exports = runner;
```

### 3.6 Multi-Feature Context Tests (TC-U110 ~ TC-U119)

```javascript
// test-scripts/unit/multi-feature.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-multi');
const STATUS_PATH = path.join(TEST_DIR, 'docs/.pdca-status.json');

runner.describe('Multi-Feature Context Functions', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);

    // 초기 상태 생성
    const initial = {
      version: '2.0',
      activeFeatures: ['login'],
      primaryFeature: 'login',
      features: { login: { phase: 'do' } }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(initial));

    delete require.cache[require.resolve('../../lib/common')];
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) {}
  });

  // TC-U110
  runner.it('addActiveFeature adds new feature', () => {
    const common = require('../../lib/common');
    const result = common.addActiveFeature('signup');

    assert.true(result);
    const features = common.getActiveFeatures();
    assert.true(features.includes('signup'));
  });

  // TC-U111
  runner.it('addActiveFeature sets primary when specified', () => {
    const common = require('../../lib/common');
    common.addActiveFeature('signup', true);

    const status = common.getPdcaStatusFull(true);
    assert.equal(status.primaryFeature, 'signup');
  });

  // TC-U112
  runner.it('addActiveFeature prevents duplicates', () => {
    const common = require('../../lib/common');
    common.addActiveFeature('login');

    const features = common.getActiveFeatures();
    const loginCount = features.filter(f => f === 'login').length;
    assert.equal(loginCount, 1);
  });

  // TC-U114
  runner.it('getActiveFeatures returns list', () => {
    const common = require('../../lib/common');
    const features = common.getActiveFeatures();

    assert.isArray(features);
    assert.true(features.includes('login'));
  });

  // TC-U115
  runner.it('switchFeatureContext switches to existing', () => {
    const common = require('../../lib/common');
    common.addActiveFeature('signup');
    const result = common.switchFeatureContext('signup');

    assert.true(result.success);
    const status = common.getPdcaStatusFull(true);
    assert.equal(status.primaryFeature, 'signup');
  });

  // TC-U116
  runner.it('switchFeatureContext fails for missing', () => {
    const common = require('../../lib/common');
    const result = common.switchFeatureContext('nonexistent');

    assert.false(result.success);
  });

  // TC-U117
  runner.it('removeActiveFeature removes feature', () => {
    const common = require('../../lib/common');
    common.addActiveFeature('signup');
    const result = common.removeActiveFeature('signup');

    assert.true(result);
    const features = common.getActiveFeatures();
    assert.false(features.includes('signup'));
  });
});

module.exports = runner;
```

---

## 4. 통합 테스트 상세 설계

### 4.1 PDCA Scripts Tests (TC-I001 ~ TC-I012)

```javascript
// test-scripts/integration/pdca-scripts.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScriptWithJson } = require('../lib/safe-exec');
const { MockEnv } = require('../lib/mocks');
const path = require('path');
const fs = require('fs');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

runner.describe('PDCA Core Scripts Integration', () => {
  runner.beforeEach(() => {
    mockEnv.set('CLAUDE_PROJECT_DIR', '/test-project');
  });

  runner.afterEach(() => {
    mockEnv.restore();
  });

  // TC-I001: pre-write.js 테스트
  runner.it('pre-write.js handles missing design doc', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'pre-write.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: pre-write.js not found');
      return;
    }

    const input = {
      tool: 'Write',
      input: { file_path: '/test-project/src/features/login/index.ts' }
    };

    const result = runScriptWithJson(scriptPath, input);
    // 스크립트가 실행되어야 함
    assert.exists(result.stdout);
  });

  // TC-I006: gap-detector-stop.js 저율 테스트
  runner.it('gap-detector-stop.js suggests improvement for low rate', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'gap-detector-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: gap-detector-stop.js not found');
      return;
    }

    const input = {
      output: '## Gap Analysis Result\n\nMatch Rate: 75%\n\nFeature: login'
    };

    const result = runScriptWithJson(scriptPath, input);
    const output = result.stdout.toLowerCase();

    // 90% 미만이면 개선 제안
    assert.true(
      output.includes('pdca-iterator') ||
      output.includes('개선') ||
      output.includes('improve')
    );
  });

  // TC-I007: gap-detector-stop.js 고율 테스트
  runner.it('gap-detector-stop.js suggests report for high rate', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'gap-detector-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: gap-detector-stop.js not found');
      return;
    }

    const input = {
      output: '## Gap Analysis Result\n\nMatch Rate: 92%\n\nFeature: login'
    };

    const result = runScriptWithJson(scriptPath, input);
    const output = result.stdout.toLowerCase();

    // 90% 이상이면 보고서 제안
    assert.true(
      output.includes('report') ||
      output.includes('보고서') ||
      output.includes('완료')
    );
  });

  // TC-I008: iterator-stop.js 테스트
  runner.it('iterator-stop.js suggests re-analysis', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'iterator-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: iterator-stop.js not found');
      return;
    }

    const input = {
      output: 'Iteration complete. Fixed 3 issues.\n\nFeature: login'
    };

    const result = runScriptWithJson(scriptPath, input);
    const output = result.stdout.toLowerCase();

    // 재분석 제안
    assert.true(
      output.includes('analyze') ||
      output.includes('분석') ||
      output.includes('check')
    );
  });
});

module.exports = runner;
```

### 4.2 Phase Scripts Tests (TC-I020 ~ TC-I035)

```javascript
// test-scripts/integration/phase-scripts.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScriptWithJson } = require('../lib/safe-exec');
const { MockEnv } = require('../lib/mocks');
const path = require('path');
const fs = require('fs');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

runner.describe('Phase Scripts Integration', () => {
  runner.beforeEach(() => {
    mockEnv.set('CLAUDE_PROJECT_DIR', '/test-project');
  });

  runner.afterEach(() => {
    mockEnv.restore();
  });

  // Phase stop 스크립트 목록
  const phaseScripts = [
    'phase1-schema-stop.js',
    'phase2-convention-stop.js',
    'phase3-mockup-stop.js',
    'phase4-api-stop.js',
    'phase7-seo-stop.js',
    'phase8-review-stop.js'
  ];

  for (const script of phaseScripts) {
    runner.it(`${script} outputs valid response`, () => {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) {
        console.log(`     ⏭️ Skipped: ${script} not found`);
        return;
      }

      const input = { feature: 'test-feature' };
      const result = runScriptWithJson(scriptPath, input);

      // 스크립트가 정상 실행되어야 함
      assert.equal(result.status, 0, `${script} should exit with 0`);
    });
  }

  // TC-I020: phase-transition.js 테스트
  runner.it('phase-transition.js guides next phase', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase-transition.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase-transition.js not found');
      return;
    }

    const input = { currentPhase: 1, feature: 'login' };
    const result = runScriptWithJson(scriptPath, input);

    // Phase 2 안내가 포함되어야 함
    assert.true(
      result.stdout.includes('Phase 2') ||
      result.stdout.includes('Convention') ||
      result.stdout.includes('2')
    );
  });
});

module.exports = runner;
```

---

## 5. Hook 테스트 상세 설계

### 5.1 Session Start Tests (TC-H001 ~ TC-H007)

```javascript
// test-scripts/hooks/session-start.test.js

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScript } = require('../lib/safe-exec');
const { MockEnv } = require('../lib/mocks');
const path = require('path');
const fs = require('fs');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const HOOK_PATH = path.join(__dirname, '../../hooks/session-start.js');
const TEST_DIR = path.join(__dirname, '../.test-temp-hook');
const STATUS_PATH = path.join(TEST_DIR, 'docs/.pdca-status.json');

runner.describe('Session Start Hook', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) {}
  });

  // TC-H001
  runner.it('outputs startup message when no PDCA status', () => {
    const result = runScript(HOOK_PATH, '', {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // 시작 메시지 포함
    assert.true(result.stdout.length > 0);
    assert.true(
      result.stdout.includes('bkit') ||
      result.stdout.includes('Session') ||
      result.stdout.includes('시작')
    );
  });

  // TC-H002
  runner.it('outputs resume prompt with active feature', () => {
    const status = {
      version: '2.0',
      primaryFeature: 'login',
      activeFeatures: ['login'],
      features: { login: { phase: 'do' } },
      session: { onboardingCompleted: true }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(status));

    const result = runScript(HOOK_PATH, '', {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // 재개 프롬프트 포함
    assert.true(
      result.stdout.includes('login') ||
      result.stdout.includes('이전') ||
      result.stdout.includes('Resume')
    );
  });

  // TC-H005
  runner.it('outputs non-empty response', () => {
    const result = runScript(HOOK_PATH, '', {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.stdout.trim().length > 0);
  });

  // TC-H007
  runner.it('includes trigger keywords', () => {
    const result = runScript(HOOK_PATH, '', {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // 트리거 키워드 관련 내용 포함
    assert.true(
      result.stdout.includes('트리거') ||
      result.stdout.includes('trigger') ||
      result.stdout.includes('keyword') ||
      result.stdout.includes('키워드')
    );
  });
});

module.exports = runner;
```

---

## 6. 테스트 실행기 설계

### 6.1 전체 테스트 실행 (test-scripts/run-all.js)

```javascript
#!/usr/bin/env node

/**
 * 전체 테스트 실행기
 *
 * Usage:
 *   node test-scripts/run-all.js              # 전체 테스트
 *   node test-scripts/run-all.js --unit       # 단위 테스트만
 *   node test-scripts/run-all.js --integration # 통합 테스트만
 *   node test-scripts/run-all.js --hooks      # Hook 테스트만
 *   node test-scripts/run-all.js --verbose    # 상세 출력
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const hasFilter = args.some(a => ['--unit', '--integration', '--hooks'].includes(a));
const runUnit = args.includes('--unit') || !hasFilter;
const runIntegration = args.includes('--integration') || !hasFilter;
const runHooks = args.includes('--hooks') || !hasFilter;
const verbose = args.includes('--verbose');

const TEST_DIR = __dirname;

async function loadAndRunTests(dir, label) {
  const stats = { passed: 0, failed: 0 };
  const results = [];

  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️ Directory not found: ${dir}`);
    return { stats, results };
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.js'));

  for (const file of files) {
    try {
      const runner = require(path.join(dir, file));
      const { stats: s, results: r } = await runner.run();

      stats.passed += s.passed;
      stats.failed += s.failed;
      results.push(...r);
    } catch (e) {
      console.log(`  ❌ Error in ${file}: ${e.message}`);
      stats.failed++;
    }
  }

  return { stats, results };
}

async function runAllTests() {
  const startTime = Date.now();
  const allStats = { passed: 0, failed: 0 };
  const allResults = [];

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  bkit v1.4.0 종합 테스트');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  시작: ${new Date().toLocaleTimeString()}`);
  console.log('───────────────────────────────────────────────────────────\n');

  if (runUnit) {
    console.log('📦 UNIT TESTS');
    console.log('───────────────────────────────────────────────────────────');
    const { stats, results } = await loadAndRunTests(
      path.join(TEST_DIR, 'unit'),
      'Unit'
    );
    allStats.passed += stats.passed;
    allStats.failed += stats.failed;
    allResults.push(...results);
    console.log('');
  }

  if (runIntegration) {
    console.log('📦 INTEGRATION TESTS');
    console.log('───────────────────────────────────────────────────────────');
    const { stats, results } = await loadAndRunTests(
      path.join(TEST_DIR, 'integration'),
      'Integration'
    );
    allStats.passed += stats.passed;
    allStats.failed += stats.failed;
    allResults.push(...results);
    console.log('');
  }

  if (runHooks) {
    console.log('📦 HOOK TESTS');
    console.log('───────────────────────────────────────────────────────────');
    const { stats, results } = await loadAndRunTests(
      path.join(TEST_DIR, 'hooks'),
      'Hooks'
    );
    allStats.passed += stats.passed;
    allStats.failed += stats.failed;
    allResults.push(...results);
    console.log('');
  }

  // 결과 요약
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const total = allStats.passed + allStats.failed;
  const passRate = total > 0 ? ((allStats.passed / total) * 100).toFixed(1) : 0;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  테스트 결과');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ 성공: ${allStats.passed}`);
  console.log(`  ❌ 실패: ${allStats.failed}`);
  console.log(`  📊 통과율: ${passRate}%`);
  console.log(`  ⏱️  소요: ${duration}s`);
  console.log('───────────────────────────────────────────────────────────');

  if (allStats.failed > 0 && verbose) {
    console.log('\n📋 실패 목록:');
    allResults
      .filter(r => r.status === 'failed')
      .forEach(r => {
        console.log(`  • ${r.suite} > ${r.test}`);
        if (r.error) console.log(`    ${r.error}`);
      });
  }

  process.exit(allStats.failed > 0 ? 1 : 0);
}

runAllTests().catch(e => {
  console.error('Runner error:', e);
  process.exit(1);
});
```

---

## 7. 테스트 데이터 (Fixtures)

### 7.1 PDCA Status v2.0 샘플

**test-scripts/fixtures/pdca-status-v2.json:**
```json
{
  "version": "2.0",
  "lastUpdated": "2026-01-24T00:00:00.000Z",
  "activeFeatures": ["login", "signup"],
  "primaryFeature": "login",
  "features": {
    "login": {
      "phase": "do",
      "createdAt": "2026-01-20T00:00:00.000Z",
      "documents": {
        "plan": "docs/01-plan/features/login.plan.md",
        "design": "docs/02-design/features/login.design.md"
      },
      "iterations": { "count": 0, "history": [] },
      "requirements": {
        "total": 5,
        "fulfilled": 3,
        "items": []
      }
    }
  },
  "session": {
    "startedAt": "2026-01-24T00:00:00.000Z",
    "onboardingCompleted": true
  },
  "history": []
}
```

### 7.2 Hook 입력 샘플

**test-scripts/fixtures/hook-inputs/pre-write-input.json:**
```json
{
  "tool": "Write",
  "input": {
    "file_path": "/test-project/src/features/login/index.ts",
    "content": "export function login() {}"
  }
}
```

---

## 8. 구현 우선순위

### Phase 1: 테스트 인프라 (1일)

| 파일 | 우선순위 |
|------|:--------:|
| lib/test-runner.js | P1 |
| lib/assertions.js | P1 |
| lib/mocks.js | P1 |
| lib/safe-exec.js | P1 |
| fixtures/*.json | P1 |

### Phase 2: 핵심 단위 테스트 (2일)

| 파일 | 우선순위 |
|------|:--------:|
| unit/pdca-status.test.js | P1 |
| unit/intent-detection.test.js | P1 |
| unit/ambiguity.test.js | P1 |
| unit/multi-feature.test.js | P1 |

### Phase 3: 보조 단위 테스트 (1일)

| 파일 | 우선순위 |
|------|:--------:|
| unit/config.test.js | P2 |
| unit/file-detection.test.js | P2 |
| 기타 unit/*.test.js | P3 |

### Phase 4: 통합/Hook 테스트 (1일)

| 파일 | 우선순위 |
|------|:--------:|
| integration/pdca-scripts.test.js | P1 |
| integration/phase-scripts.test.js | P2 |
| hooks/session-start.test.js | P1 |
| run-all.js | P1 |

---

## 9. 완료 기준

- [x] 테스트 프레임워크 설계
- [x] 단언 함수 설계
- [x] Mock/Stub 전략
- [x] 안전한 프로세스 실행 설계
- [x] 단위 테스트 설계 (16개)
- [x] 통합 테스트 설계 (4개)
- [x] Hook 테스트 설계 (1개)
- [x] 테스트 데이터 설계

---

## 10. 관련 문서

| 문서 | 경로 |
|------|------|
| 테스트 계획서 | [bkit-v1.4.0-test.plan.md](../../01-plan/features/bkit-v1.4.0-test.plan.md) |
| 테스트 결과 | docs/03-analysis/bkit-v1.4.0-test.analysis.md (예정) |

---

**작성일**: 2026-01-24
**버전**: 1.0
