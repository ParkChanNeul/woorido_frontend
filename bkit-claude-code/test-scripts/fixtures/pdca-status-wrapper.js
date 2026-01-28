#!/usr/bin/env node
/**
 * updatePdcaStatus 테스트용 wrapper 스크립트
 * PDCA 상태 업데이트 테스트를 위해 별도 프로세스로 실행
 *
 * 입력 (stdin JSON):
 *   { action: 'update', feature: string, phase: string, data?: object }
 *
 * 출력 (stdout):
 *   { success: boolean, feature?: string, phase?: string, error?: string }
 */

const { updatePdcaStatus, readStdinSync, initPdcaStatusIfNotExists } = require('../../lib/common.js');

const input = readStdinSync();
const { action, feature, phase, data } = input;

if (action === 'update') {
  // 상태 파일 초기화
  initPdcaStatusIfNotExists();

  const result = updatePdcaStatus(feature, phase, data || {});
  console.log(JSON.stringify(result));
} else {
  console.log(JSON.stringify({ error: 'Unknown action' }));
}
