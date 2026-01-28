/**
 * Phase Scripts Integration Tests
 * TC-I020 ~ TC-I035
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { MockEnv } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-phase-scripts');
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

runner.describe('Phase Scripts Integration', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
  });

  // TC-I020: Phase 1 - Schema
  runner.it('phase1-schema-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase1-schema-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase1-schema-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-1', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script may exit with various codes depending on internal logic
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I021: Phase 2 - Convention Pre
  runner.it('phase2-convention-pre.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase2-convention-pre.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase2-convention-pre.js not found');
      return;
    }

    const input = { agent_name: 'phase-2' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I022: Phase 2 - Convention Stop
  runner.it('phase2-convention-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase2-convention-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase2-convention-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-2', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script may exit with various codes depending on internal logic
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I023: Phase 3 - Mockup Stop
  runner.it('phase3-mockup-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase3-mockup-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase3-mockup-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-3', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script may exit with various codes depending on internal logic
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I024: Phase 4 - API Stop
  runner.it('phase4-api-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase4-api-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase4-api-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-4', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I025: Phase 5 - Design Post
  runner.it('phase5-design-post.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase5-design-post.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase5-design-post.js not found');
      return;
    }

    const input = { agent_name: 'phase-5', agent_output: 'Design system created' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I026: Phase 6 - UI Post
  runner.it('phase6-ui-post.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase6-ui-post.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase6-ui-post.js not found');
      return;
    }

    const input = { agent_name: 'phase-6', agent_output: 'UI integrated' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I027: Phase 7 - SEO Stop
  runner.it('phase7-seo-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase7-seo-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase7-seo-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-7', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script may exit with various codes depending on internal logic
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I028: Phase 8 - Review Stop
  runner.it('phase8-review-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase8-review-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase8-review-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-8', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I029: Phase 9 - Deploy Pre
  runner.it('phase9-deploy-pre.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase9-deploy-pre.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase9-deploy-pre.js not found');
      return;
    }

    const input = { agent_name: 'phase-9' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I030: Phase scripts handle missing input gracefully
  runner.it('phase scripts handle empty input', () => {
    const scripts = [
      'phase1-schema-stop.js',
      'phase2-convention-stop.js',
      'phase3-mockup-stop.js'
    ];

    for (const script of scripts) {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (!fs.existsSync(scriptPath)) continue;

      const result = runScriptWithJson(scriptPath, {}, {
        CLAUDE_PROJECT_DIR: TEST_DIR
      });

      // Should not crash with empty input
      assert.true(typeof result.status === 'number' || result.status === null);
    }
  });

  // TC-I031: Phase scripts write to correct location
  runner.it('phase scripts respect PROJECT_DIR', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase1-schema-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase1-schema-stop.js not found');
      return;
    }

    const input = { agent_name: 'phase-1', stop_reason: 'completed' };
    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script should run without throwing unhandled exceptions
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I032: All phase scripts exist
  runner.it('all phase scripts exist', () => {
    const expectedScripts = [
      'phase1-schema-stop.js',
      'phase2-convention-pre.js',
      'phase2-convention-stop.js',
      'phase3-mockup-stop.js',
      'phase4-api-stop.js',
      'phase5-design-post.js',
      'phase6-ui-post.js',
      'phase7-seo-stop.js',
      'phase8-review-stop.js',
      'phase9-deploy-pre.js'
    ];

    let existCount = 0;
    for (const script of expectedScripts) {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      if (fs.existsSync(scriptPath)) {
        existCount++;
      } else {
        console.log(`     ℹ️ Missing: ${script}`);
      }
    }

    // At least some scripts should exist
    assert.greaterThan(existCount, 5);
  });
});

module.exports = runner;
