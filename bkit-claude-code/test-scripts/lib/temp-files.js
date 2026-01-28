/**
 * bkit v1.4.2 테스트용 임시 파일 관리 유틸리티
 *
 * - 임시 디렉토리 생성/삭제
 * - 테스트용 파일 생성
 * - PDCA 상태 파일 Mock
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * 임시 디렉토리 생성
 * @param {string} prefix - 디렉토리 접두사
 * @returns {string} 생성된 디렉토리 경로
 */
function createTempDir(prefix = 'bkit-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * 임시 파일 생성
 * @param {string} dir - 디렉토리 경로
 * @param {string} filename - 파일명 (경로 포함 가능)
 * @param {string} content - 파일 내용
 * @returns {string} 생성된 파일 경로
 */
function createTempFile(dir, filename, content = '') {
  const filePath = path.join(dir, filename);
  const parentDir = path.dirname(filePath);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  return filePath;
}

/**
 * 임시 디렉토리 재귀 삭제
 * @param {string} dir - 삭제할 디렉토리 경로
 */
function cleanupTempDir(dir) {
  if (dir && fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * PDCA 상태 파일 생성
 * @param {string} dir - 프로젝트 디렉토리
 * @param {object} status - PDCA 상태 객체
 * @returns {string} 생성된 파일 경로
 */
function createMockPdcaStatus(dir, status) {
  const docsDir = path.join(dir, 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const statusPath = path.join(docsDir, '.pdca-status.json');
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
  return statusPath;
}

/**
 * 테스트용 Design 문서 생성
 * @param {string} dir - 프로젝트 디렉토리
 * @param {string} feature - 기능명
 * @param {string} content - 문서 내용 (기본값 있음)
 * @returns {string} 생성된 파일 경로
 */
function createMockDesignDoc(dir, feature, content = null) {
  const docContent = content || `# ${feature} Design Document\n\n## Overview\n\nTest design document for ${feature}`;
  return createTempFile(dir, `docs/02-design/features/${feature}.design.md`, docContent);
}

/**
 * 테스트용 Plan 문서 생성
 * @param {string} dir - 프로젝트 디렉토리
 * @param {string} feature - 기능명
 * @param {string} content - 문서 내용 (기본값 있음)
 * @returns {string} 생성된 파일 경로
 */
function createMockPlanDoc(dir, feature, content = null) {
  const docContent = content || `# ${feature} Plan Document\n\n## Overview\n\nTest plan document for ${feature}`;
  return createTempFile(dir, `docs/01-plan/features/${feature}.plan.md`, docContent);
}

/**
 * 테스트용 소스 파일 생성
 * @param {string} dir - 프로젝트 디렉토리
 * @param {string} filePath - 상대 경로 (예: 'src/components/Button.tsx')
 * @param {string} content - 파일 내용
 * @returns {string} 생성된 파일 경로
 */
function createMockSourceFile(dir, filePath, content = '') {
  return createTempFile(dir, filePath, content);
}

/**
 * 기본 PDCA 상태 객체 생성
 * @param {object} overrides - 오버라이드할 필드
 * @returns {object} PDCA 상태 객체
 */
function createDefaultPdcaStatus(overrides = {}) {
  const now = new Date().toISOString();
  return {
    version: "2.0",
    primaryFeature: null,
    activeFeatures: [],
    features: {},
    pipeline: {
      currentPhase: 1,
      level: 'Dynamic',
      phaseHistory: []
    },
    session: {
      startedAt: now,
      lastActivity: now,
      onboardingCompleted: false
    },
    history: [],
    lastUpdated: now,
    ...overrides
  };
}

module.exports = {
  createTempDir,
  createTempFile,
  cleanupTempDir,
  createMockPdcaStatus,
  createMockDesignDoc,
  createMockPlanDoc,
  createMockSourceFile,
  createDefaultPdcaStatus
};
