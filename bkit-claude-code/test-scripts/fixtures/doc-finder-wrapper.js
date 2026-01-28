#!/usr/bin/env node
/**
 * findDesignDoc/findPlanDoc 테스트용 wrapper 스크립트
 * 파일 탐색 테스트를 위해 별도 프로세스로 실행
 *
 * 입력 (stdin JSON):
 *   { action: 'findDesignDoc' | 'findPlanDoc', feature: string }
 *
 * 출력 (stdout):
 *   찾은 파일 경로 또는 빈 문자열
 */

const { findDesignDoc, findPlanDoc, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { action, feature } = input;

let result = '';
if (action === 'findDesignDoc') {
  result = findDesignDoc(feature);
} else if (action === 'findPlanDoc') {
  result = findPlanDoc(feature);
}

console.log(result);
