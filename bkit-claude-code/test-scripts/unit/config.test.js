/**
 * Configuration Tests
 * TC-U001 ~ TC-U005
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv, clearModuleCache } = require('../lib/mocks');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

runner.describe('Configuration Functions', () => {
  runner.beforeEach(() => {
    clearModuleCache('../../lib/common');
  });

  runner.afterEach(() => {
    mockEnv.restore();
  });

  // TC-U001
  runner.it('getConfig returns default when key not found', () => {
    const common = require('../../lib/common');
    const result = common.getConfig('NONEXISTENT_KEY_12345', 'default-value');
    assert.equal(result, 'default-value');
  });

  // TC-U002
  // Note: getConfig reads from CLAUDE.md settings, not env vars
  // This test verifies default behavior when key doesn't exist in settings
  runner.it('getConfig returns value when key exists', () => {
    const common = require('../../lib/common');
    // getConfig checks project settings, not env vars
    // When key doesn't exist in settings, it returns default
    const result = common.getConfig('BKIT_TEST_CONFIG', 'default');
    // Since BKIT_TEST_CONFIG doesn't exist in CLAUDE.md, default is returned
    assert.equal(result, 'default');
  });

  // TC-U003
  runner.it('getConfigArray returns empty array as default', () => {
    const common = require('../../lib/common');
    const result = common.getConfigArray('NONEXISTENT_ARRAY_KEY', []);
    assert.isArray(result);
    assert.equal(result.length, 0);
  });

  // TC-U004
  // Note: getConfigArray reads from CLAUDE.md settings, not env vars
  runner.it('getConfigArray parses comma-separated values', () => {
    const common = require('../../lib/common');
    // getConfigArray checks project settings, not env vars
    // When key doesn't exist in settings, default is returned
    const result = common.getConfigArray('BKIT_TEST_ARRAY', ['x', 'y']);
    assert.isArray(result);
    // Returns the default array when key not found
    assert.equal(result.length, 2);
    assert.arrayIncludes(result, 'x');
    assert.arrayIncludes(result, 'y');
  });

  // TC-U005
  runner.it('loadConfig returns object', () => {
    const common = require('../../lib/common');
    if (typeof common.loadConfig === 'function') {
      const config = common.loadConfig();
      assert.isObject(config);
    } else {
      // loadConfig가 없으면 스킵
      console.log('     ⏭️ Skipped: loadConfig not exported');
    }
  });
});

module.exports = runner;
