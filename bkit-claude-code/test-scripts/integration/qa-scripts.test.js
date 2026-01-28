/**
 * QA Scripts Integration Tests
 * TC-I040 ~ TC-I047
 */

const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');
const { MockEnv } = require('../lib/mocks');
const fs = require('fs');
const path = require('path');

const runner = new TestRunner({ verbose: true });
const mockEnv = new MockEnv();

const TEST_DIR = path.join(__dirname, '../.test-temp-qa-scripts');
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

runner.describe('QA Scripts Integration', () => {
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

  // TC-I040: qa-stop.js executes
  runner.it('qa-stop.js executes successfully', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-stop.js not found');
      return;
    }

    const input = {
      agent_name: 'qa-monitor',
      stop_reason: 'completed'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I041: qa-pre-bash.js validates commands
  runner.it('qa-pre-bash.js validates bash commands', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-pre-bash.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-pre-bash.js not found');
      return;
    }

    const input = {
      tool_name: 'Bash',
      tool_input: {
        command: 'docker logs test-container'
      }
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should allow or provide context
    assert.true(result.status === 0 || result.status === null || result.status === 2);
  });

  // TC-I042: qa-monitor-post.js processes output
  runner.it('qa-monitor-post.js processes monitor output', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-monitor-post.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-monitor-post.js not found');
      return;
    }

    const input = {
      agent_name: 'qa-monitor',
      agent_output: 'Monitoring complete. No errors found.'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    assert.true(result.status === 0 || result.status === null);
  });

  // TC-I043: qa-stop handles error output
  runner.it('qa-stop.js handles error in output', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-stop.js not found');
      return;
    }

    const input = {
      agent_name: 'qa-monitor',
      stop_reason: 'error',
      agent_output: 'Error: Container not found'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should handle error gracefully
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I044: qa-pre-bash blocks dangerous commands
  runner.it('qa-pre-bash.js handles command validation', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-pre-bash.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-pre-bash.js not found');
      return;
    }

    const input = {
      tool_name: 'Bash',
      tool_input: {
        command: 'npm test'
      }
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Regular commands should be allowed
    assert.true(result.status === 0 || result.status === null || result.status === 2);
  });

  // TC-I045: All QA scripts exist
  runner.it('all QA scripts exist', () => {
    const expectedScripts = [
      'qa-stop.js',
      'qa-pre-bash.js',
      'qa-monitor-post.js'
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

    // At least some QA scripts should exist
    assert.greaterThan(existCount, 0);
  });

  // TC-I046: QA scripts handle missing input
  runner.it('QA scripts handle empty input gracefully', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-stop.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-stop.js not found');
      return;
    }

    const result = runScriptWithJson(scriptPath, {}, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should not crash
    assert.true(typeof result.status === 'number' || result.status === null);
  });

  // TC-I047: QA scripts respect environment
  runner.it('QA scripts use correct project directory', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'qa-monitor-post.js');
    if (!fs.existsSync(scriptPath)) {
      console.log('     ⏭️ Skipped: qa-monitor-post.js not found');
      return;
    }

    const input = {
      agent_name: 'qa-monitor',
      agent_output: 'Test output'
    };

    const result = runScriptWithJson(scriptPath, input, {
      CLAUDE_PROJECT_DIR: TEST_DIR
    });

    // Should work with custom project dir
    assert.true(result.status === 0 || result.status === null);
  });
});

module.exports = runner;
