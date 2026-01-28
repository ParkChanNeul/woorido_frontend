/**
 * bkit v1.4.0 안전한 프로세스 실행 유틸리티
 *
 * - spawnSync 사용 (shell injection 방지)
 * - 테스트 전용 (controlled inputs only)
 */

const { spawnSync } = require('child_process');
const path = require('path');

/**
 * Node.js 스크립트를 안전하게 실행
 * @param {string} scriptPath - 스크립트 경로
 * @param {string} stdinData - stdin으로 전달할 데이터
 * @param {object} env - 추가 환경변수
 * @returns {object} { stdout, stderr, status }
 */
function runScript(scriptPath, stdinData = '', env = {}) {
  const absolutePath = path.isAbsolute(scriptPath)
    ? scriptPath
    : path.resolve(scriptPath);

  try {
    const result = spawnSync('node', [absolutePath], {
      input: stdinData,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      timeout: 10000, // 10초 타임아웃
      maxBuffer: 1024 * 1024 // 1MB
    });

    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.status
    };
  } catch (error) {
    return {
      stdout: '',
      stderr: error.message,
      status: 1
    };
  }
}

/**
 * JSON 입력으로 스크립트 실행
 * @param {string} scriptPath - 스크립트 경로
 * @param {object} inputData - JSON으로 변환할 입력 데이터
 * @param {object} env - 추가 환경변수
 * @returns {object} { stdout, stderr, status, parsed }
 */
function runScriptWithJson(scriptPath, inputData = {}, env = {}) {
  const stdinData = JSON.stringify(inputData);
  const result = runScript(scriptPath, stdinData, env);

  // JSON 출력 파싱 시도
  let parsed = null;
  try {
    const trimmed = result.stdout.trim();
    // JSON 시작/끝 찾기
    const jsonStart = trimmed.indexOf('{');
    const jsonEnd = trimmed.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      parsed = JSON.parse(trimmed.substring(jsonStart, jsonEnd + 1));
    }
  } catch (e) {
    // JSON 파싱 실패는 무시
  }

  return { ...result, parsed };
}

/**
 * 스크립트 존재 여부 확인
 * @param {string} scriptPath - 스크립트 경로
 * @returns {boolean}
 */
function scriptExists(scriptPath) {
  const fs = require('fs');
  const absolutePath = path.isAbsolute(scriptPath)
    ? scriptPath
    : path.resolve(scriptPath);
  return fs.existsSync(absolutePath);
}

module.exports = { runScript, runScriptWithJson, scriptExists };
