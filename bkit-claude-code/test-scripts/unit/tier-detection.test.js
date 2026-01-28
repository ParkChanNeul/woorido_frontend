/**
 * Tier Detection Tests
 * TC-U070 ~ TC-U077
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');

const runner = new TestRunner({ verbose: true });
const common = require('../../lib/common');

runner.describe('Tier Detection Functions', () => {
  // TC-U070
  runner.it('getLanguageTier returns 1 for TypeScript', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('app.ts'), '1');
    assert.equal(common.getLanguageTier('component.tsx'), '1');
  });

  // TC-U071
  runner.it('getLanguageTier returns 1 for JavaScript', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('app.js'), '1');
    assert.equal(common.getLanguageTier('component.jsx'), '1');
  });

  // TC-U072
  runner.it('getLanguageTier returns 1 for Python', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('main.py'), '1');
  });

  // TC-U073
  runner.it('getLanguageTier returns 2 for Go', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('main.go'), '2');
  });

  // TC-U074
  runner.it('getLanguageTier returns 2 for Rust', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('main.rs'), '2');
  });

  // TC-U075
  runner.it('getLanguageTier returns 3 for Java', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('Main.java'), '3');
  });

  // TC-U076
  runner.it('getLanguageTier returns unknown for unrecognized', () => {
    if (typeof common.getLanguageTier !== 'function') {
      console.log('     ⏭️ Skipped: getLanguageTier not exported');
      return;
    }
    assert.equal(common.getLanguageTier('data.csv'), 'unknown');
    assert.equal(common.getLanguageTier('config.yaml'), 'unknown');
  });

  // TC-U077
  runner.it('getTierDescription returns correct description', () => {
    if (typeof common.getTierDescription !== 'function') {
      console.log('     ⏭️ Skipped: getTierDescription not exported');
      return;
    }
    assert.equal(common.getTierDescription('1'), 'AI-Native Essential');
    assert.equal(common.getTierDescription('2'), 'Mainstream Recommended');
    assert.equal(common.getTierDescription('3'), 'Domain Specific');
    assert.equal(common.getTierDescription('4'), 'Legacy/Niche');
  });

  // TC-U078
  runner.it('isTier1 returns true for tier 1 files', () => {
    if (typeof common.isTier1 !== 'function') {
      console.log('     ⏭️ Skipped: isTier1 not exported');
      return;
    }
    assert.true(common.isTier1('app.ts'));
    assert.true(common.isTier1('main.py'));
    assert.false(common.isTier1('main.go'));
  });

  // TC-U079
  runner.it('getTierPdcaGuidance returns guidance for tier', () => {
    if (typeof common.getTierPdcaGuidance !== 'function') {
      console.log('     ⏭️ Skipped: getTierPdcaGuidance not exported');
      return;
    }
    const result = common.getTierPdcaGuidance('1');
    assert.isString(result);
    assert.true(result.includes('Tier 1'));
  });
});

module.exports = runner;
