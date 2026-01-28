/**
 * bkit v1.4.0 테스트 Mock 유틸리티
 *
 * - MockFS: 가상 파일 시스템
 * - MockEnv: 환경변수 Mock
 * - spy: 스파이 함수
 */

const path = require('path');

/**
 * 가상 파일 시스템 Mock
 */
class MockFS {
  constructor() {
    this.files = new Map();
  }

  /**
   * 가상 파일 추가
   */
  addFile(filePath, content) {
    this.files.set(path.resolve(filePath), content);
  }

  /**
   * 가상 파일 제거
   */
  removeFile(filePath) {
    this.files.delete(path.resolve(filePath));
  }

  /**
   * 가상 파일 존재 여부
   */
  exists(filePath) {
    return this.files.has(path.resolve(filePath));
  }

  /**
   * 가상 파일 읽기
   */
  read(filePath) {
    return this.files.get(path.resolve(filePath));
  }

  /**
   * 모든 가상 파일 초기화
   */
  clear() {
    this.files.clear();
  }

  /**
   * 가상 파일 목록
   */
  list() {
    return Array.from(this.files.keys());
  }
}

/**
 * 환경변수 Mock
 */
class MockEnv {
  constructor() {
    this.originalEnv = { ...process.env };
    this.addedKeys = new Set();
  }

  /**
   * 환경변수 설정
   */
  set(key, value) {
    if (!(key in this.originalEnv)) {
      this.addedKeys.add(key);
    }
    process.env[key] = value;
  }

  /**
   * 환경변수 제거
   */
  unset(key) {
    delete process.env[key];
    this.addedKeys.delete(key);
  }

  /**
   * 원래 환경변수로 복원
   */
  restore() {
    // 추가된 키 제거
    for (const key of this.addedKeys) {
      delete process.env[key];
    }

    // 원래 값 복원
    for (const [key, value] of Object.entries(this.originalEnv)) {
      process.env[key] = value;
    }

    this.addedKeys.clear();
  }

  /**
   * 현재 환경변수 스냅샷
   */
  snapshot() {
    return { ...process.env };
  }
}

/**
 * 스파이 함수 생성
 * @param {function} fn - 원본 함수 (없으면 빈 함수)
 * @returns {function} 스파이 함수
 */
function spy(fn = null) {
  const calls = [];

  const spyFn = function (...args) {
    calls.push({
      args,
      timestamp: Date.now()
    });
    return fn ? fn.apply(this, args) : undefined;
  };

  // 호출 정보
  spyFn.calls = calls;

  // 호출 횟수
  spyFn.callCount = () => calls.length;

  // 특정 인자로 호출되었는지
  spyFn.calledWith = (...expectedArgs) =>
    calls.some(
      c => JSON.stringify(c.args) === JSON.stringify(expectedArgs)
    );

  // 첫 번째 호출
  spyFn.firstCall = () => calls[0] || null;

  // 마지막 호출
  spyFn.lastCall = () => calls[calls.length - 1] || null;

  // 호출 기록 초기화
  spyFn.reset = () => {
    calls.length = 0;
  };

  return spyFn;
}

/**
 * 모듈 캐시 초기화
 * @param {string} modulePath - 모듈 경로
 */
function clearModuleCache(modulePath) {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
}

module.exports = { MockFS, MockEnv, spy, clearModuleCache };
