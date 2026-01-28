#!/usr/bin/env node
/**
 * outputAllow 테스트용 wrapper 스크립트
 * process.exit() 격리를 위해 별도 프로세스로 실행
 *
 * 입력 (stdin JSON):
 *   { context: string, hookEvent: string }
 *
 * 출력 (stdout):
 *   outputAllow()의 JSON 출력
 */

const { outputAllow, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { context, hookEvent } = input;

outputAllow(context, hookEvent || 'PostToolUse');
