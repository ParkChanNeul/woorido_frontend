#!/usr/bin/env node
/**
 * outputBlock 테스트용 wrapper 스크립트
 * process.exit(2) 격리를 위해 별도 프로세스로 실행
 *
 * 입력 (stdin JSON):
 *   { reason: string }
 *
 * 출력:
 *   stderr: reason
 *   exit code: 2
 */

const { outputBlock, readStdinSync } = require('../../lib/common.js');

const input = readStdinSync();
const { reason } = input;

outputBlock(reason || 'blocked');
