/**
 * bkit v1.4.2 Output Functions Unit Tests
 *
 * TR-01: outputAllow() PreToolUse 출력 형식
 * TR-02: outputAllow() PostToolUse/SessionStart 출력 형식
 * TR-03: outputBlock() stderr 및 Exit Code
 *
 * 테스트 대상: lib/common.js - outputAllow(), outputBlock(), outputEmpty()
 */

const path = require('path');
const { runScriptWithJson, runScript } = require('../lib/safe-exec');

// Wrapper 스크립트 경로
const OUTPUT_ALLOW_WRAPPER = path.join(__dirname, '../fixtures/output-allow-wrapper.js');
const OUTPUT_BLOCK_WRAPPER = path.join(__dirname, '../fixtures/output-block-wrapper.js');

describe('TR-01: outputAllow() PreToolUse 출력 형식', () => {
  test('1.1 PreToolUse with context - additionalContext만 포함, permissionDecision 없음', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: 'test context',
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.parsed).not.toBeNull();

    // FR-01: permissionDecision 없어야 함
    expect(result.parsed).not.toHaveProperty('decision');
    expect(result.parsed.hookSpecificOutput).toBeDefined();
    expect(result.parsed.hookSpecificOutput.additionalContext).toBe('test context');
    expect(result.parsed.hookSpecificOutput).not.toHaveProperty('permissionDecision');
  });

  test('1.2 PreToolUse without context - 빈 JSON 출력', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: '',
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });

  test('1.3 PreToolUse null context - 빈 JSON 출력', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: null,
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });

  test('1.4 PreToolUse undefined context - 빈 JSON 출력', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });

  test('1.5 Verify NO permissionDecision in any PreToolUse output', () => {
    const contexts = ['test', 'long context message', '한글 컨텍스트', 'Info | Data | More'];

    for (const context of contexts) {
      const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
        context,
        hookEvent: 'PreToolUse'
      });

      // permissionDecision 키가 출력에 절대 없어야 함
      expect(result.stdout).not.toContain('permissionDecision');
      expect(result.stdout).not.toContain('"decision"');
    }
  });

  test('1.6 PreToolUse 한글 context 정상 처리', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: '한글 컨텍스트 메시지입니다.',
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.parsed.hookSpecificOutput.additionalContext).toBe('한글 컨텍스트 메시지입니다.');
  });
});

describe('TR-02: outputAllow() PostToolUse/SessionStart 출력 형식', () => {
  test('2.1 PostToolUse with context - decision: allow 포함', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: 'message',
      hookEvent: 'PostToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.parsed.decision).toBe('allow');
    expect(result.parsed.hookSpecificOutput.additionalContext).toBe('message');
  });

  test('2.2 SessionStart with context - decision: allow 포함', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: 'info',
      hookEvent: 'SessionStart'
    });

    expect(result.status).toBe(0);
    expect(result.parsed.decision).toBe('allow');
    expect(result.parsed.hookSpecificOutput.additionalContext).toBe('info');
  });

  test('2.3 Stop hook - systemMessage 사용 (additionalContext 미지원)', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: 'report',
      hookEvent: 'Stop'
    });

    expect(result.status).toBe(0);
    expect(result.parsed.decision).toBe('allow');
    expect(result.parsed.systemMessage).toBe('report');
    // Stop hook은 hookSpecificOutput 대신 systemMessage 사용
  });

  test('2.4 UserPromptSubmit hook - additionalContext 사용', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: 'user prompt info',
      hookEvent: 'UserPromptSubmit'
    });

    expect(result.status).toBe(0);
    expect(result.parsed.decision).toBe('allow');
    expect(result.parsed.hookSpecificOutput.additionalContext).toBe('user prompt info');
  });

  test('2.5 Default hookEvent (PostToolUse) - decision: allow 포함', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: 'default message'
    });

    expect(result.status).toBe(0);
    expect(result.parsed.decision).toBe('allow');
  });

  test('2.6 PostToolUse without context - 빈 JSON', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: '',
      hookEvent: 'PostToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });
});

describe('TR-03: outputBlock() stderr 및 Exit Code', () => {
  test('3.1 Block outputs to stderr', () => {
    const result = runScriptWithJson(OUTPUT_BLOCK_WRAPPER, {
      reason: 'blocked reason'
    });

    expect(result.stderr).toContain('blocked reason');
  });

  test('3.2 Block exits with code 2', () => {
    const result = runScriptWithJson(OUTPUT_BLOCK_WRAPPER, {
      reason: 'reason'
    });

    expect(result.status).toBe(2);
  });

  test('3.3 No JSON in stdout (FR-02: stderr만 사용)', () => {
    const result = runScriptWithJson(OUTPUT_BLOCK_WRAPPER, {
      reason: 'reason'
    });

    // stdout에 JSON 없음
    expect(result.stdout.trim()).toBe('');
  });

  test('3.4 Block with Korean reason', () => {
    const result = runScriptWithJson(OUTPUT_BLOCK_WRAPPER, {
      reason: '위험한 명령어가 감지되었습니다.'
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('위험한 명령어가 감지되었습니다.');
  });

  test('3.5 Block with long reason', () => {
    const longReason = 'This is a very long reason message. '.repeat(20);

    const result = runScriptWithJson(OUTPUT_BLOCK_WRAPPER, {
      reason: longReason
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('This is a very long reason message');
  });

  test('3.6 Block with default reason', () => {
    const result = runScriptWithJson(OUTPUT_BLOCK_WRAPPER, {});

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('blocked');
  });
});

describe('outputEmpty() 테스트', () => {
  // outputEmpty는 별도 wrapper 없이 outputAllow에서 빈 context로 테스트
  test('Empty context produces empty JSON', () => {
    const result = runScriptWithJson(OUTPUT_ALLOW_WRAPPER, {
      context: '',
      hookEvent: 'PreToolUse'
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('{}');
  });
});
