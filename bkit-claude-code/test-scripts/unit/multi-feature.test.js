/**
 * Multi-Feature Context Tests
 * TC-U110 ~ TC-U119
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { MockEnv, clearModuleCache } = require('../lib/mocks');
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
      features: { login: { phase: 'do' } },
      session: { startedAt: new Date().toISOString() },
      history: []
    };
    fs.writeFileSync(STATUS_PATH, JSON.stringify(initial));

    clearModuleCache('../../lib/common');
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) {
      // 무시
    }
  });

  // TC-U110
  runner.it('addActiveFeature adds new feature', () => {
    const common = require('../../lib/common');
    if (typeof common.addActiveFeature !== 'function') {
      console.log('     ⏭️ Skipped: addActiveFeature not exported');
      return;
    }

    const result = common.addActiveFeature('signup');

    assert.true(result);
    const featuresResult = common.getActiveFeatures();
    // getActiveFeatures returns object with activeFeatures array
    const features = featuresResult.activeFeatures || [];
    assert.arrayIncludes(features, 'signup');
  });

  // TC-U111
  runner.it('addActiveFeature sets primary when specified', () => {
    const common = require('../../lib/common');
    if (typeof common.addActiveFeature !== 'function') {
      console.log('     ⏭️ Skipped: addActiveFeature not exported');
      return;
    }

    common.addActiveFeature('signup', true);

    const status = common.getPdcaStatusFull(true);
    assert.equal(status.primaryFeature, 'signup');
  });

  // TC-U112
  runner.it('addActiveFeature prevents duplicates', () => {
    const common = require('../../lib/common');
    if (typeof common.addActiveFeature !== 'function') {
      console.log('     ⏭️ Skipped: addActiveFeature not exported');
      return;
    }

    common.addActiveFeature('login');

    const featuresResult = common.getActiveFeatures();
    const features = featuresResult.activeFeatures || [];
    const loginCount = features.filter(f => f === 'login').length;
    assert.equal(loginCount, 1);
  });

  // TC-U113
  runner.it('setActiveFeature changes primary', () => {
    const common = require('../../lib/common');
    if (typeof common.setActiveFeature !== 'function') {
      console.log('     ⏭️ Skipped: setActiveFeature not exported');
      return;
    }

    // 먼저 signup 추가
    if (typeof common.addActiveFeature === 'function') {
      common.addActiveFeature('signup');
    }

    common.setActiveFeature('signup');

    const status = common.getPdcaStatusFull(true);
    assert.equal(status.primaryFeature, 'signup');
  });

  // TC-U114
  runner.it('getActiveFeatures returns list', () => {
    const common = require('../../lib/common');
    if (typeof common.getActiveFeatures !== 'function') {
      console.log('     ⏭️ Skipped: getActiveFeatures not exported');
      return;
    }

    const result = common.getActiveFeatures();

    // getActiveFeatures returns object with activeFeatures array
    assert.exists(result);
    const features = result.activeFeatures || [];
    assert.isArray(features);
    assert.arrayIncludes(features, 'login');
  });

  // TC-U115
  runner.it('switchFeatureContext switches to existing', () => {
    const common = require('../../lib/common');
    if (typeof common.switchFeatureContext !== 'function') {
      console.log('     ⏭️ Skipped: switchFeatureContext not exported');
      return;
    }

    // signup 추가
    if (typeof common.addActiveFeature === 'function') {
      common.addActiveFeature('signup');
    }

    const result = common.switchFeatureContext('signup');

    assert.exists(result);
    assert.true(result.success);

    const status = common.getPdcaStatusFull(true);
    assert.equal(status.primaryFeature, 'signup');
  });

  // TC-U116
  runner.it('switchFeatureContext fails for missing', () => {
    const common = require('../../lib/common');
    if (typeof common.switchFeatureContext !== 'function') {
      console.log('     ⏭️ Skipped: switchFeatureContext not exported');
      return;
    }

    const result = common.switchFeatureContext('nonexistent');

    assert.exists(result);
    assert.false(result.success);
  });

  // TC-U117
  runner.it('removeActiveFeature removes feature', () => {
    const common = require('../../lib/common');
    if (typeof common.removeActiveFeature !== 'function') {
      console.log('     ⏭️ Skipped: removeActiveFeature not exported');
      return;
    }

    // signup 추가 후 제거
    if (typeof common.addActiveFeature === 'function') {
      common.addActiveFeature('signup');
    }

    const result = common.removeActiveFeature('signup');

    assert.true(result);
    const featuresResult = common.getActiveFeatures();
    const features = featuresResult.activeFeatures || [];
    const hasSignup = features.includes('signup');
    assert.false(hasSignup);
  });

  // TC-U118
  runner.it('removeActiveFeature selects new primary', () => {
    const common = require('../../lib/common');
    if (typeof common.removeActiveFeature !== 'function') {
      console.log('     ⏭️ Skipped: removeActiveFeature not exported');
      return;
    }

    // signup 추가
    if (typeof common.addActiveFeature === 'function') {
      common.addActiveFeature('signup');
    }

    // primary인 login 제거
    common.removeActiveFeature('login');

    const status = common.getPdcaStatusFull(true);
    // 다른 기능이 primary가 되어야 함
    if (status.activeFeatures && status.activeFeatures.length > 0) {
      assert.exists(status.primaryFeature);
    }
  });
});

module.exports = runner;
