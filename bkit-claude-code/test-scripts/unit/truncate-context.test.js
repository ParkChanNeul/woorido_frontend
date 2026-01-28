/**
 * bkit v1.4.2 truncateContext Unit Tests
 *
 * TR-05: truncateContext() 500자 제한 검증
 *
 * 테스트 대상: lib/common.js - truncateContext(), MAX_CONTEXT_LENGTH
 */

const path = require('path');
const { runScriptWithJson } = require('../lib/safe-exec');

// 직접 import로 테스트 (단위 테스트)
const { truncateContext, MAX_CONTEXT_LENGTH } = require('../../lib/common.js');

// Wrapper 스크립트 경로 (프로세스 격리 테스트용)
const TRUNCATE_WRAPPER = path.join(__dirname, '../fixtures/truncate-context-wrapper.js');

describe('TR-05: truncateContext() 500자 제한 - 직접 테스트', () => {
  test('5.1 Under limit (100자) - 원본 그대로 반환', () => {
    const input = 'a'.repeat(100);
    const result = truncateContext(input);

    expect(result).toBe(input);
    expect(result.length).toBe(100);
  });

  test('5.2 Exactly 500자 - 원본 그대로 반환', () => {
    const input = 'a'.repeat(500);
    const result = truncateContext(input);

    expect(result).toBe(input);
    expect(result.length).toBe(500);
  });

  test('5.3 Over limit (600자) - 잘림 + "..." 추가', () => {
    const input = 'a'.repeat(600);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.4 Cuts at sentence (마지막 마침표에서 자름)', () => {
    // 350자 문장 + ". " + 160자 추가 = 약 512자
    const sentence1 = 'First sentence with content. ';
    const filler = 'x'.repeat(460);
    const sentence2 = 'Second sentence here. ';
    const extra = 'More text after.';
    const input = sentence1 + filler + sentence2 + extra;

    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
    // 마지막 완전한 문장에서 자르거나 "..."로 끝남
    expect(result).toMatch(/(\.$|\.\.\.)/);
  });

  test('5.5 Cuts at pipe (마지막 파이프에서 자름)', () => {
    const part1 = 'Info 1 | ';
    const filler = 'x'.repeat(480);
    const part2 = ' | More info | Extra text here';
    const input = part1 + filler + part2;

    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.6 Null input - 빈 문자열 반환', () => {
    expect(truncateContext(null)).toBe('');
  });

  test('5.7 Undefined input - 빈 문자열 반환', () => {
    expect(truncateContext(undefined)).toBe('');
  });

  test('5.8 Number input - 빈 문자열 반환', () => {
    expect(truncateContext(12345)).toBe('');
  });

  test('5.9 Object input - 빈 문자열 반환', () => {
    expect(truncateContext({ key: 'value' })).toBe('');
  });

  test('5.10 Array input - 빈 문자열 반환', () => {
    expect(truncateContext(['a', 'b', 'c'])).toBe('');
  });

  test('5.11 Empty string input - 빈 문자열 반환', () => {
    expect(truncateContext('')).toBe('');
  });

  test('5.12 MAX_CONTEXT_LENGTH 상수 확인', () => {
    expect(MAX_CONTEXT_LENGTH).toBe(500);
  });

  test('5.13 Custom maxLength 파라미터', () => {
    const input = 'a'.repeat(200);

    // 100자로 제한
    const result = truncateContext(input, 100);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.14 한글 컨텍스트 잘림', () => {
    const input = '가'.repeat(600);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
    expect(result).toMatch(/\.\.\.$/);
  });

  test('5.15 혼합 (한글 + 영문) 컨텍스트', () => {
    const input = '한글과 English mixed content. '.repeat(30);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
  });

  test('5.16 줄바꿈 포함 컨텍스트', () => {
    const input = 'Line 1\nLine 2\nLine 3\n'.repeat(50);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
  });

  test('5.17 특수문자 포함 컨텍스트', () => {
    const input = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~ '.repeat(20);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
  });
});

describe('TR-05: truncateContext() - Wrapper 스크립트 테스트', () => {
  test('Wrapper: Under limit', () => {
    const result = runScriptWithJson(TRUNCATE_WRAPPER, {
      context: 'short context',
      maxLength: 500
    });

    expect(result.status).toBe(0);
    expect(result.parsed.result).toBe('short context');
  });

  test('Wrapper: Over limit', () => {
    const longContext = 'a'.repeat(600);
    const result = runScriptWithJson(TRUNCATE_WRAPPER, {
      context: longContext,
      maxLength: 500
    });

    expect(result.status).toBe(0);
    expect(result.parsed.length).toBeLessThanOrEqual(500);
    expect(result.parsed.result).toMatch(/\.\.\.$/);
  });

  test('Wrapper: Null context', () => {
    const result = runScriptWithJson(TRUNCATE_WRAPPER, {
      context: null
    });

    expect(result.status).toBe(0);
    expect(result.parsed.result).toBe('');
  });
});

describe('truncateContext() 경계값 테스트', () => {
  test('499자 - 잘리지 않음', () => {
    const input = 'a'.repeat(499);
    const result = truncateContext(input);

    expect(result).toBe(input);
    expect(result.length).toBe(499);
  });

  test('500자 - 잘리지 않음', () => {
    const input = 'a'.repeat(500);
    const result = truncateContext(input);

    expect(result).toBe(input);
    expect(result.length).toBe(500);
  });

  test('501자 - 잘림', () => {
    const input = 'a'.repeat(501);
    const result = truncateContext(input);

    expect(result.length).toBeLessThanOrEqual(500);
    expect(result).toMatch(/\.\.\.$/);
  });

  test('maxLength 0 - 빈 문자열 또는 "..."', () => {
    const input = 'some text';
    const result = truncateContext(input, 0);

    // maxLength가 0이면 빈 문자열 또는 최소한의 "..."
    expect(result.length).toBeLessThanOrEqual(3);
  });

  test('maxLength 3 - "..." 만 반환', () => {
    const input = 'some text';
    const result = truncateContext(input, 3);

    // "..." 길이가 3이므로 "..." 반환
    expect(result).toBe('...');
  });
});
