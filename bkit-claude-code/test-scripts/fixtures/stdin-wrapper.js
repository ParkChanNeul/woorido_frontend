#!/usr/bin/env node
/**
 * readStdinSync 테스트용 wrapper 스크립트
 * stdin 파싱 테스트를 위해 별도 프로세스로 실행
 *
 * 입력 (stdin):
 *   임의의 문자열 또는 JSON
 *
 * 출력 (stdout):
 *   파싱된 결과 JSON
 */

const { readStdinSync } = require('../../lib/common.js');

const result = readStdinSync();
console.log(JSON.stringify(result));
