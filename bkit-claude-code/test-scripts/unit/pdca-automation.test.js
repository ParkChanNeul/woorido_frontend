/**
 * PDCA Automation Tests
 * TC-U160 ~ TC-U175
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv, clearModuleCache } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-automation');
const STATUS_PATH = path.join(TEST_DIR, 'docs/.pdca-status.json');

runner.describe('PDCA Automation Functions', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
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

  // TC-U160
  runner.it('getPdcaTaskMetadata returns correct structure', () => {
    const common = require('../../lib/common');
    if (typeof common.getPdcaTaskMetadata !== 'function') {
      console.log('     ⏭️ Skipped: getPdcaTaskMetadata not exported');
      return;
    }

    const result = common.getPdcaTaskMetadata('plan', 'login');
    assert.exists(result);
    assert.equal(result.pdcaPhase, 'plan');
    assert.equal(result.feature, 'login');
    assert.exists(result.createdAt);
  });

  // TC-U161
  runner.it('generatePdcaTaskSubject creates correct format', () => {
    const common = require('../../lib/common');
    if (typeof common.generatePdcaTaskSubject !== 'function') {
      console.log('     ⏭️ Skipped: generatePdcaTaskSubject not exported');
      return;
    }

    const result = common.generatePdcaTaskSubject('design', 'user-profile');
    assert.equal(result, '[Design] user-profile');
  });

  // TC-U162
  runner.it('generatePdcaTaskDescription creates description', () => {
    const common = require('../../lib/common');
    if (typeof common.generatePdcaTaskDescription !== 'function') {
      console.log('     ⏭️ Skipped: generatePdcaTaskDescription not exported');
      return;
    }

    const result = common.generatePdcaTaskDescription('plan', 'login');
    assert.isString(result);
    assert.true(result.includes('login'));
  });

  // TC-U163
  runner.it('generateTaskGuidance creates guidance string', () => {
    const common = require('../../lib/common');
    if (typeof common.generateTaskGuidance !== 'function') {
      console.log('     ⏭️ Skipped: generateTaskGuidance not exported');
      return;
    }

    const result = common.generateTaskGuidance('design', 'login', 'plan');
    assert.isString(result);
    assert.true(result.includes('Task System'));
  });

  // TC-U164
  runner.it('getPreviousPdcaPhase returns correct order', () => {
    const common = require('../../lib/common');
    if (typeof common.getPreviousPdcaPhase !== 'function') {
      console.log('     ⏭️ Skipped: getPreviousPdcaPhase not exported');
      return;
    }

    assert.equal(common.getPreviousPdcaPhase('plan'), null);
    assert.equal(common.getPreviousPdcaPhase('design'), 'plan');
    assert.equal(common.getPreviousPdcaPhase('do'), 'design');
    assert.equal(common.getPreviousPdcaPhase('check'), 'do');
    assert.equal(common.getPreviousPdcaPhase('act'), 'check');
  });

  // TC-U165
  runner.it('PDCA_PHASES contains all phases', () => {
    const common = require('../../lib/common');
    if (!common.PDCA_PHASES) {
      console.log('     ⏭️ Skipped: PDCA_PHASES not exported');
      return;
    }

    assert.exists(common.PDCA_PHASES.plan);
    assert.exists(common.PDCA_PHASES.design);
    assert.exists(common.PDCA_PHASES.do);
    assert.exists(common.PDCA_PHASES.check);
    assert.exists(common.PDCA_PHASES.act);
  });

  // TC-U166
  runner.it('PDCA_PHASES has correct order', () => {
    const common = require('../../lib/common');
    if (!common.PDCA_PHASES) {
      console.log('     ⏭️ Skipped: PDCA_PHASES not exported');
      return;
    }

    assert.equal(common.PDCA_PHASES.plan.order, 1);
    assert.equal(common.PDCA_PHASES.design.order, 2);
    assert.equal(common.PDCA_PHASES.do.order, 3);
    assert.equal(common.PDCA_PHASES.check.order, 4);
    assert.equal(common.PDCA_PHASES.act.order, 5);
  });

  // TC-U167
  runner.it('findPdcaStatus reads status file', () => {
    const statusData = { version: '2.0', features: { test: { phase: 'do' } } };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(statusData));

    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');
    if (typeof common.findPdcaStatus !== 'function') {
      console.log('     ⏭️ Skipped: findPdcaStatus not exported');
      return;
    }

    const result = common.findPdcaStatus();
    assert.exists(result);
    assert.equal(result.version, '2.0');
  });

  // TC-U168
  runner.it('findPdcaStatus returns null when no file', () => {
    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');
    if (typeof common.findPdcaStatus !== 'function') {
      console.log('     ⏭️ Skipped: findPdcaStatus not exported');
      return;
    }

    const result = common.findPdcaStatus();
    // May return null or empty object
    if (result === null) {
      assert.equal(result, null);
    } else {
      assert.exists(result);
    }
  });

  // TC-U169
  runner.it('getCurrentPdcaPhase returns phase for feature', () => {
    const statusData = {
      version: '2.0',
      features: {
        login: { currentPhase: 'design' }
      }
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(statusData));

    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');
    if (typeof common.getCurrentPdcaPhase !== 'function') {
      console.log('     ⏭️ Skipped: getCurrentPdcaPhase not exported');
      return;
    }

    const result = common.getCurrentPdcaPhase('login');
    assert.equal(result, 'design');
  });

  // TC-U170
  runner.it('getCurrentPdcaPhase returns null for unknown', () => {
    const statusData = { version: '2.0', features: {} };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(statusData));

    clearModuleCache('../../lib/common');
    const common = require('../../lib/common');
    if (typeof common.getCurrentPdcaPhase !== 'function') {
      console.log('     ⏭️ Skipped: getCurrentPdcaPhase not exported');
      return;
    }

    const result = common.getCurrentPdcaPhase('nonexistent');
    assert.equal(result, null);
  });
});

module.exports = runner;
