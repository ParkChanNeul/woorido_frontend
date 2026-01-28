#!/usr/bin/env node
/**
 * truncateContext 테스트용 wrapper 스크립트
 * 직접 함수 테스트를 위해 별도 프로세스로 실행
 *
 * 입력 (stdin JSON):
 *   { context: string | any, maxLength?: number }
 *
 * 출력 (stdout):
 *   truncateContext() 결과
 */

const { truncateContext, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { context, maxLength } = input;

const result = truncateContext(context, maxLength);
console.log(JSON.stringify({ result, length: result ? result.length : 0 }));
