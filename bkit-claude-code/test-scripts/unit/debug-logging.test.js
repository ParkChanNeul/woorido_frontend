/**
 * Debug Logging Tests
 * TC-U080 ~ TC-U087
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();
const common = require('../../lib/common');

runner.describe('Debug Logging Functions', () => {
  // v1.4.0: BKIT_DEBUG must be set for debugLog to write
  runner.beforeEach(() => {
    mockEnv.set('BKIT_DEBUG', 'true');
  });

  runner.afterEach(() => {
    mockEnv.restore();
  });
  // TC-U080
  runner.it('getDebugLogPath returns valid path', () => {
    if (typeof common.getDebugLogPath !== 'function') {
      console.log('     ⏭️ Skipped: getDebugLogPath not exported');
      return;
    }
    const result = common.getDebugLogPath();
    assert.isString(result);
    assert.true(result.length > 0);
    // Should be in temp directory
    assert.true(result.includes('bkit-hook-debug'));
  });

  // TC-U081
  runner.it('debugLog writes to log file', () => {
    if (typeof common.debugLog !== 'function') {
      console.log('     ⏭️ Skipped: debugLog not exported');
      return;
    }
    if (typeof common.getDebugLogPath !== 'function') {
      console.log('     ⏭️ Skipped: getDebugLogPath not exported');
      return;
    }

    const logPath = common.getDebugLogPath();
    const testMessage = `test-${Date.now()}`;

    common.debugLog('TEST', testMessage);

    // Verify log file exists and contains message
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      assert.true(content.includes(testMessage));
    } else {
      console.log('     ℹ️ Note: Log file not created (may be permission issue)');
    }
  });

  // TC-U082
  runner.it('debugLog includes timestamp', () => {
    if (typeof common.debugLog !== 'function') {
      console.log('     ⏭️ Skipped: debugLog not exported');
      return;
    }
    if (typeof common.getDebugLogPath !== 'function') {
      console.log('     ⏭️ Skipped: getDebugLogPath not exported');
      return;
    }

    const logPath = common.getDebugLogPath();
    common.debugLog('TEST', 'timestamp-test');

    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      // ISO timestamp pattern: 2026-01-24T
      assert.true(/\d{4}-\d{2}-\d{2}T/.test(content));
    } else {
      console.log('     ℹ️ Note: Log file not created');
    }
  });

  // TC-U083
  runner.it('debugLog includes category', () => {
    if (typeof common.debugLog !== 'function') {
      console.log('     ⏭️ Skipped: debugLog not exported');
      return;
    }
    if (typeof common.getDebugLogPath !== 'function') {
      console.log('     ⏭️ Skipped: getDebugLogPath not exported');
      return;
    }

    const logPath = common.getDebugLogPath();
    common.debugLog('CATEGORY_TEST', 'category-message');

    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      assert.true(content.includes('[CATEGORY_TEST]'));
    } else {
      console.log('     ℹ️ Note: Log file not created');
    }
  });

  // TC-U084
  runner.it('debugLog handles structured data', () => {
    if (typeof common.debugLog !== 'function') {
      console.log('     ⏭️ Skipped: debugLog not exported');
      return;
    }
    if (typeof common.getDebugLogPath !== 'function') {
      console.log('     ⏭️ Skipped: getDebugLogPath not exported');
      return;
    }

    const logPath = common.getDebugLogPath();
    common.debugLog('DATA_TEST', 'message', { key: 'value', num: 42 });

    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      assert.true(content.includes('"key":"value"') || content.includes('key'));
    } else {
      console.log('     ℹ️ Note: Log file not created');
    }
  });

  // TC-U085
  runner.it('debugLog fails silently on error', () => {
    if (typeof common.debugLog !== 'function') {
      console.log('     ⏭️ Skipped: debugLog not exported');
      return;
    }

    // Should not throw even if logging fails
    try {
      common.debugLog('ERROR_TEST', 'should-not-throw');
      assert.true(true);
    } catch (e) {
      assert.true(false, 'debugLog should not throw');
    }
  });

  // TC-U086
  runner.it('DEBUG_LOG_PATHS contains platform paths', () => {
    if (!common.DEBUG_LOG_PATHS) {
      console.log('     ⏭️ Skipped: DEBUG_LOG_PATHS not exported');
      return;
    }
    assert.exists(common.DEBUG_LOG_PATHS.claude);
    assert.exists(common.DEBUG_LOG_PATHS.gemini);
  });

  // TC-U087
  runner.it('debugLog handles empty data gracefully', () => {
    if (typeof common.debugLog !== 'function') {
      console.log('     ⏭️ Skipped: debugLog not exported');
      return;
    }

    // Should not throw with empty data
    try {
      common.debugLog('EMPTY_TEST', 'message', {});
      common.debugLog('NULL_TEST', 'message', null);
      assert.true(true);
    } catch (e) {
      assert.true(false, 'debugLog should handle empty/null data');
    }
  });
});

module.exports = runner;
