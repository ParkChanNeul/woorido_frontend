/**
 * Level Detection Tests
 * TC-U050 ~ TC-U057
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv, clearModuleCache } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-level');

runner.describe('Level Detection Functions', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(TEST_DIR, { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);
    clearModuleCache('../../lib/common');
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
    clearModuleCache('../../lib/common');
  });

  // TC-U050
  runner.it('detectLevel returns Starter by default', () => {
    const common = require('../../lib/common');
    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Starter');
  });

  // TC-U051
  runner.it('detectLevel returns Enterprise with kubernetes dir', () => {
    fs.mkdirSync(path.join(TEST_DIR, 'kubernetes'), { recursive: true });
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Enterprise');
  });

  // TC-U052
  runner.it('detectLevel returns Enterprise with terraform dir', () => {
    fs.mkdirSync(path.join(TEST_DIR, 'terraform'), { recursive: true });
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Enterprise');
  });

  // TC-U053
  runner.it('detectLevel returns Dynamic with api dir', () => {
    fs.mkdirSync(path.join(TEST_DIR, 'api'), { recursive: true });
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Dynamic');
  });

  // TC-U054
  runner.it('detectLevel reads level from CLAUDE.md', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'CLAUDE.md'), 'level: Dynamic\n');
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Dynamic');
  });

  // TC-U055
  runner.it('detectLevel reads level from GEMINI.md', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'GEMINI.md'), 'level: Enterprise\n');
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Enterprise');
  });

  // TC-U056
  runner.it('detectLevel returns Dynamic with .mcp.json containing bkend', () => {
    fs.writeFileSync(path.join(TEST_DIR, '.mcp.json'), '{"servers": {"bkend": {}}}');
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    assert.equal(result, 'Dynamic');
  });

  // TC-U057
  runner.it('detectLevel prioritizes explicit level over structure', () => {
    // Create both kubernetes dir and explicit Starter level
    fs.mkdirSync(path.join(TEST_DIR, 'kubernetes'), { recursive: true });
    fs.writeFileSync(path.join(TEST_DIR, 'CLAUDE.md'), 'level: Starter\n');
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');

    if (typeof common.detectLevel !== 'function') {
      console.log('     ⏭️ Skipped: detectLevel not exported');
      return;
    }
    const result = common.detectLevel();
    // Explicit level should take priority
    assert.equal(result, 'Starter');
  });
});

module.exports = runner;
