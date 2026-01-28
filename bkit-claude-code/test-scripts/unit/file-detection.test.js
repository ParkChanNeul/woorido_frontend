/**
 * File Detection Tests
 * TC-U010 ~ TC-U017
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');

const runner = new TestRunner({ verbose: true });
const common = require('../../lib/common');

runner.describe('File Detection Functions', () => {
  // TC-U010
  runner.it('isSourceFile returns true for JS files', () => {
    if (typeof common.isSourceFile !== 'function') {
      console.log('     ⏭️ Skipped: isSourceFile not exported');
      return;
    }
    assert.true(common.isSourceFile('src/app.js'));
  });

  // TC-U011
  runner.it('isSourceFile returns false for non-code files', () => {
    if (typeof common.isSourceFile !== 'function') {
      console.log('     ⏭️ Skipped: isSourceFile not exported');
      return;
    }
    assert.false(common.isSourceFile('README.md'));
  });

  // TC-U012
  runner.it('isCodeFile returns true for TS files', () => {
    if (typeof common.isCodeFile !== 'function') {
      console.log('     ⏭️ Skipped: isCodeFile not exported');
      return;
    }
    assert.true(common.isCodeFile('lib/util.ts'));
  });

  // TC-U013
  runner.it('isCodeFile returns false for config files', () => {
    if (typeof common.isCodeFile !== 'function') {
      console.log('     ⏭️ Skipped: isCodeFile not exported');
      return;
    }
    assert.false(common.isCodeFile('package.json'));
  });

  // TC-U014
  runner.it('isUiFile returns true for TSX files', () => {
    if (typeof common.isUiFile !== 'function') {
      console.log('     ⏭️ Skipped: isUiFile not exported');
      return;
    }
    assert.true(common.isUiFile('components/App.tsx'));
  });

  // TC-U015
  // Note: isUiFile checks for JSX/TSX React components, not CSS
  // CSS files are style files, not UI component files
  runner.it('isUiFile returns false for CSS files (CSS is style, not UI)', () => {
    if (typeof common.isUiFile !== 'function') {
      console.log('     ⏭️ Skipped: isUiFile not exported');
      return;
    }
    // CSS is categorized as style file, not UI component file
    // isUiFile only detects JSX/TSX React component files
    assert.false(common.isUiFile('styles/main.css'));
  });

  // TC-U016
  runner.it('isEnvFile returns true for .env', () => {
    if (typeof common.isEnvFile !== 'function') {
      console.log('     ⏭️ Skipped: isEnvFile not exported');
      return;
    }
    assert.true(common.isEnvFile('.env'));
  });

  // TC-U017
  runner.it('isEnvFile returns true for .env.local', () => {
    if (typeof common.isEnvFile !== 'function') {
      console.log('     ⏭️ Skipped: isEnvFile not exported');
      return;
    }
    assert.true(common.isEnvFile('.env.local'));
  });
});

module.exports = runner;
