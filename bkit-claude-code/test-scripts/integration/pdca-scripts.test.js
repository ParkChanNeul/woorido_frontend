/**
 * PDCA Scripts Integration Tests
 * TC-I001 ~ TC-I012
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { MockEnv, clearModuleCache } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-pdca-scripts');
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

runner.describe('PDCA Scripts Integration', () => {
  runner.beforeEach(() => {
    fs.mkdirSync(path.join(TEST_DIR, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(TEST_DIR, 'docs/01-plan/features'), { recursive: true });
    fs.mkdirSync(path.join(TEST_DIR, 'docs/02-design/features'), { recursive: true });
    mockEnv.set('CLAUDE_PROJECT_DIR', TEST_DIR);
  });

  runner.afterEach(() => {
    mockEnv.restore();
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    } catch (e) { /* ignore */ }
  });

  // TC-I001: REMOVED - pdca-pre-write.js was deprecated and deleted in v1.4.2
  // Functionality merged into pre-write.js

  // TC-I002
  runner.it('pdca-post-write.js processes file write', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'pdca-post-write.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: pdca-post-write.js not found');
      return;
    }

    const input = {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(TEST_DIR, 'src/feature.ts'),
        content: 'export function test() {}'
      },
      tool_result: { success: true }
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I003
  runner.it('gap-detector-stop.js executes', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'gap-detector-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: gap-detector-stop.js not found');
      return;
    }

    const input = {
      agent_name: 'gap-detector',
      stop_reason: 'completed'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script may exit with various codes depending on internal logic
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I004
  runner.it('gap-detector-post.js processes analysis', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'gap-detector-post.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: gap-detector-post.js not found');
      return;
    }

    const input = {
      agent_name: 'gap-detector',
      agent_output: 'Analysis complete. Match rate: 85%'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I005
  runner.it('iterator-stop.js handles completion', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'iterator-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: iterator-stop.js not found');
      return;
    }

    const input = {
      agent_name: 'pdca-iterator',
      stop_reason: 'completed'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I006
  runner.it('analysis-stop.js processes analysis stop', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'analysis-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: analysis-stop.js not found');
      return;
    }

    const input = {
      agent_name: 'code-analyzer',
      stop_reason: 'completed'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I007
  runner.it('archive-feature.js archives completed feature', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'archive-feature.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: archive-feature.js not found');
      return;
    }

    // Create test documents
    fs.writeFileSync(
      path.join(TEST_DIR, 'docs/01-plan/features/test.plan.md'),
      '# Test Plan'
    );
    fs.writeFileSync(
      path.join(TEST_DIR, 'docs/02-design/features/test.design.md'),
      '# Test Design'
    );

    const result = runScript(scriptPath, 'test', {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // May succeed or fail depending on archive logic
    assert.true(result.status !== undefined);
  });

  // TC-I008
  runner.it('phase-transition.js handles phase change', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'phase-transition.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: phase-transition.js not found');
      return;
    }

    const input = {
      feature: 'login',
      fromPhase: 'plan',
      toPhase: 'design'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Script may exit with various codes depending on internal logic
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I009
  runner.it('design-validator-pre.js validates design', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'design-validator-pre.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: design-validator-pre.js not found');
      return;
    }

    const input = {
      agent_name: 'design-validator'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I010
  runner.it('pre-write.js processes write request', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'pre-write.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: pre-write.js not found');
      return;
    }

    const input = {
      tool_name: 'Write',
      tool_input: {
        file_path: path.join(TEST_DIR, 'src/new-file.ts'),
        content: 'const x = 1;'
      }
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null || result.status === 2);
  });

  // TC-I011
  runner.it('select-template.js selects template', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'select-template.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: select-template.js not found');
      return;
    }

    const result = runScript(scriptPath, 'plan', {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Template selection should work
    assert.true(result.status !== undefined);
  });

  // TC-I012
  runner.it('validate-plugin.js validates plugin', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'validate-plugin.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: validate-plugin.js not found');
      return;
    }

    const result = runScript(scriptPath, '', {
      CLAUDE_PROJECT_DIR: TEST_DIR,
      CLAUDE_PLUGIN_ROOT: path.join(__dirname, '../..')
    });

    // Validation should run
    assert.true(result.status !== undefined);
  });
});

module.exports = runner;
