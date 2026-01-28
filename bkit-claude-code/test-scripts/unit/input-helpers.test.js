/**
 * Input Helper Tests
 * TC-U060 ~ TC-U067
 * TR-04: readStdinSync() JSON 파싱 에러 로깅 (v1.4.2)
 */

const path = require('path');
const { TestRunner } = require('../lib/test-runner');
const { assert } = require('../lib/assertions');
const { runScriptWithJson, runScript } = require('../lib/safe-exec');

const runner = new TestRunner({ verbose: true });
const common = require('../../lib/common');

// Wrapper 스크립트 경로
const STDIN_WRAPPER = path.join(__dirname, '../fixtures/stdin-wrapper.js');

runner.describe('Input Helper Functions', () => {
  // TC-U060
  runner.it('parseHookInput extracts tool_name', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_name: 'Write' };
    const result = common.parseHookInput(input);
    assert.equal(result.toolName, 'Write');
  });

  // TC-U061
  runner.it('parseHookInput extracts file_path', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { file_path: '/src/app.ts' } };
    const result = common.parseHookInput(input);
    assert.equal(result.filePath, '/src/app.ts');
  });

  // TC-U062
  runner.it('parseHookInput extracts path fallback', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { path: '/src/index.ts' } };
    const result = common.parseHookInput(input);
    assert.equal(result.filePath, '/src/index.ts');
  });

  // TC-U063
  runner.it('parseHookInput extracts content', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { content: 'test content' } };
    const result = common.parseHookInput(input);
    assert.equal(result.content, 'test content');
  });

  // TC-U064
  runner.it('parseHookInput extracts new_string fallback', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { new_string: 'new value' } };
    const result = common.parseHookInput(input);
    assert.equal(result.content, 'new value');
  });

  // TC-U065
  runner.it('parseHookInput extracts command', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { command: 'npm install' } };
    const result = common.parseHookInput(input);
    assert.equal(result.command, 'npm install');
  });

  // TC-U066
  runner.it('parseHookInput handles empty input', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const result = common.parseHookInput({});
    assert.equal(result.toolName, '');
    assert.equal(result.filePath, '');
    assert.equal(result.content, '');
  });

  // TC-U067
  runner.it('parseHookInput extracts old_string', () => {
    if (typeof common.parseHookInput !== 'function') {
      console.log('     ⏭️ Skipped: parseHookInput not exported');
      return;
    }
    const input = { tool_input: { old_string: 'old value' } };
    const result = common.parseHookInput(input);
    assert.equal(result.oldString, 'old value');
  });
});

// ============================================================
// TR-04: readStdinSync() JSON 파싱 에러 로깅 테스트 (v1.4.2)
// ============================================================

runner.describe('TR-04: readStdinSync() JSON 파싱', () => {
  // TR-04.1
  runner.it('Empty stdin - 빈 객체 반환', () => {
    const result = runScript(STDIN_WRAPPER, '');

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.deepEqual(parsed, {});
  });

  // TR-04.2
  runner.it('Invalid JSON - 빈 객체 반환', () => {
    const result = runScript(STDIN_WRAPPER, 'not json');

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.deepEqual(parsed, {});
  });

  // TR-04.3
  runner.it('Valid JSON - 파싱된 객체 반환', () => {
    const result = runScript(STDIN_WRAPPER, JSON.stringify({ tool: 'Write' }));

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.equal(parsed.tool, 'Write');
  });

  // TR-04.4
  runner.it('Whitespace only - 빈 객체 반환', () => {
    const result = runScript(STDIN_WRAPPER, '   \n  ');

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.deepEqual(parsed, {});
  });

  // TR-04.5
  runner.it('Complex JSON - 정상 파싱', () => {
    const complexInput = {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/test.ts',
        content: 'const x = 1;'
      }
    };
    const result = runScript(STDIN_WRAPPER, JSON.stringify(complexInput));

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.equal(parsed.tool_name, 'Write');
    assert.equal(parsed.tool_input.file_path, '/src/test.ts');
  });

  // TR-04.6
  runner.it('JSON with special characters - 정상 파싱', () => {
    const input = {
      message: '한글 메시지 with "quotes" and \'apostrophes\''
    };
    const result = runScript(STDIN_WRAPPER, JSON.stringify(input));

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.equal(parsed.message, '한글 메시지 with "quotes" and \'apostrophes\'');
  });

  // TR-04.7
  runner.it('Truncated JSON - 빈 객체 반환', () => {
    const result = runScript(STDIN_WRAPPER, '{"tool": "Write"');  // 닫는 } 없음

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.deepEqual(parsed, {});
  });

  // TR-04.8
  runner.it('JSON array - 정상 파싱', () => {
    const result = runScript(STDIN_WRAPPER, JSON.stringify([1, 2, 3]));

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout.trim());
    assert.deepEqual(parsed, [1, 2, 3]);
  });
});

module.exports = runner;
