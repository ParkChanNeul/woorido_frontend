/**
 * Task Classification Tests
 * TC-U030 ~ TC-U037
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');

const runner = new TestRunner({ verbose: true });
const common = require('../../lib/common');

runner.describe('Task Classification Functions', () => {
  // TC-U030
  runner.it('classifyTask returns quick_fix for short content', () => {
    if (typeof common.classifyTask !== 'function') {
      console.log('     ⏭️ Skipped: classifyTask not exported');
      return;
    }
    const result = common.classifyTask('fix typo');
    assert.equal(result, 'quick_fix');
  });

  // TC-U031
  runner.it('classifyTask returns minor_change for medium content', () => {
    if (typeof common.classifyTask !== 'function') {
      console.log('     ⏭️ Skipped: classifyTask not exported');
      return;
    }
    const content = 'a'.repeat(100);
    const result = common.classifyTask(content);
    assert.equal(result, 'minor_change');
  });

  // TC-U032
  runner.it('classifyTask returns feature for large content', () => {
    if (typeof common.classifyTask !== 'function') {
      console.log('     ⏭️ Skipped: classifyTask not exported');
      return;
    }
    const content = 'a'.repeat(500);
    const result = common.classifyTask(content);
    assert.equal(result, 'feature');
  });

  // TC-U033
  runner.it('classifyTask returns major_feature for very large', () => {
    if (typeof common.classifyTask !== 'function') {
      console.log('     ⏭️ Skipped: classifyTask not exported');
      return;
    }
    const content = 'a'.repeat(2000);
    const result = common.classifyTask(content);
    assert.equal(result, 'major_feature');
  });

  // TC-U034
  runner.it('classifyTaskByLines returns quick_fix for few lines', () => {
    if (typeof common.classifyTaskByLines !== 'function') {
      console.log('     ⏭️ Skipped: classifyTaskByLines not exported');
      return;
    }
    const content = 'line1\nline2\nline3';
    const result = common.classifyTaskByLines(content);
    assert.equal(result, 'quick_fix');
  });

  // TC-U035
  runner.it('classifyTaskByLines returns feature for many lines', () => {
    if (typeof common.classifyTaskByLines !== 'function') {
      console.log('     ⏭️ Skipped: classifyTaskByLines not exported');
      return;
    }
    const lines = Array(100).fill('line').join('\n');
    const result = common.classifyTaskByLines(lines);
    assert.equal(result, 'feature');
  });

  // TC-U036
  runner.it('getPdcaLevel returns correct level', () => {
    if (typeof common.getPdcaLevel !== 'function') {
      console.log('     ⏭️ Skipped: getPdcaLevel not exported');
      return;
    }
    assert.equal(common.getPdcaLevel('quick_fix'), 'none');
    assert.equal(common.getPdcaLevel('minor_change'), 'light');
    assert.equal(common.getPdcaLevel('feature'), 'recommended');
    assert.equal(common.getPdcaLevel('major_feature'), 'required');
  });

  // TC-U037
  runner.it('getPdcaGuidance returns guidance string', () => {
    if (typeof common.getPdcaGuidance !== 'function') {
      console.log('     ⏭️ Skipped: getPdcaGuidance not exported');
      return;
    }
    const result = common.getPdcaGuidance('feature');
    assert.isString(result);
    assert.true(result.length > 0);
  });
});

module.exports = runner;
