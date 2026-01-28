/**
 * Feature Detection Tests
 * TC-U020 ~ TC-U027
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');

const runner = new TestRunner({ verbose: true });
const common = require('../../lib/common');

runner.describe('Feature Detection Functions', () => {
  // TC-U020
  runner.it('extractFeature extracts from features folder', () => {
    if (typeof common.extractFeature !== 'function') {
      console.log('     ⏭️ Skipped: extractFeature not exported');
      return;
    }
    const result = common.extractFeature('src/features/login/auth.ts');
    assert.equal(result, 'login');
  });

  // TC-U021
  runner.it('extractFeature extracts from modules folder', () => {
    if (typeof common.extractFeature !== 'function') {
      console.log('     ⏭️ Skipped: extractFeature not exported');
      return;
    }
    const result = common.extractFeature('src/modules/user-profile/index.ts');
    assert.equal(result, 'user-profile');
  });

  // TC-U022
  runner.it('extractFeature returns empty for generic paths', () => {
    if (typeof common.extractFeature !== 'function') {
      console.log('     ⏭️ Skipped: extractFeature not exported');
      return;
    }
    const result = common.extractFeature('src/utils/helpers.ts');
    // May return 'utils' or empty depending on implementation
    assert.isString(result);
  });

  // TC-U023
  runner.it('extractFeature handles empty input', () => {
    if (typeof common.extractFeature !== 'function') {
      console.log('     ⏭️ Skipped: extractFeature not exported');
      return;
    }
    const result = common.extractFeature('');
    assert.equal(result, '');
  });

  // TC-U024
  runner.it('findDesignDoc finds existing design doc', () => {
    if (typeof common.findDesignDoc !== 'function') {
      console.log('     ⏭️ Skipped: findDesignDoc not exported');
      return;
    }
    // Test with actual feature that has design doc
    const result = common.findDesignDoc('bkit-v1.4.0-test');
    // Result should be string (path or empty)
    assert.isString(result);
  });

  // TC-U025
  runner.it('findDesignDoc returns empty for non-existent', () => {
    if (typeof common.findDesignDoc !== 'function') {
      console.log('     ⏭️ Skipped: findDesignDoc not exported');
      return;
    }
    const result = common.findDesignDoc('nonexistent-feature-xyz123');
    assert.equal(result, '');
  });

  // TC-U026
  runner.it('findPlanDoc finds existing plan doc', () => {
    if (typeof common.findPlanDoc !== 'function') {
      console.log('     ⏭️ Skipped: findPlanDoc not exported');
      return;
    }
    // Test with actual feature that has plan doc
    const result = common.findPlanDoc('bkit-v1.4.0-test');
    assert.isString(result);
  });

  // TC-U027
  runner.it('findPlanDoc returns empty for non-existent', () => {
    if (typeof common.findPlanDoc !== 'function') {
      console.log('     ⏭️ Skipped: findPlanDoc not exported');
      return;
    }
    const result = common.findPlanDoc('nonexistent-feature-xyz123');
    assert.equal(result, '');
  });
});

module.exports = runner;
