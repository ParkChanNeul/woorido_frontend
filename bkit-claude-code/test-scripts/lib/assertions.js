/**
 * bkit v1.4.0 테스트 단언 함수
 *
 * - 명확한 에러 메시지
 * - 다양한 타입 지원
 */

const assert = {
  // === 기본 단언 ===

  equal(actual, expected, msg = '') {
    if (actual !== expected) {
      throw new Error(
        `${msg}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`
      );
    }
  },

  notEqual(actual, expected, msg = '') {
    if (actual === expected) {
      throw new Error(
        `${msg}\n  Expected not equal to: ${JSON.stringify(expected)}`
      );
    }
  },

  deepEqual(actual, expected, msg = '') {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);
    if (actualStr !== expectedStr) {
      throw new Error(
        `${msg}\n  Expected: ${expectedStr}\n  Actual: ${actualStr}`
      );
    }
  },

  // === Boolean 단언 ===

  true(value, msg = '') {
    if (value !== true) {
      throw new Error(`${msg}\n  Expected: true\n  Actual: ${value}`);
    }
  },

  false(value, msg = '') {
    if (value !== false) {
      throw new Error(`${msg}\n  Expected: false\n  Actual: ${value}`);
    }
  },

  truthy(value, msg = '') {
    if (!value) {
      throw new Error(`${msg}\n  Expected truthy value, got: ${value}`);
    }
  },

  falsy(value, msg = '') {
    if (value) {
      throw new Error(`${msg}\n  Expected falsy value, got: ${value}`);
    }
  },

  // === 타입 단언 ===

  isString(value, msg = '') {
    if (typeof value !== 'string') {
      throw new Error(`${msg}\n  Expected string, got: ${typeof value}`);
    }
  },

  isNumber(value, msg = '') {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${msg}\n  Expected number, got: ${typeof value}`);
    }
  },

  isBoolean(value, msg = '') {
    if (typeof value !== 'boolean') {
      throw new Error(`${msg}\n  Expected boolean, got: ${typeof value}`);
    }
  },

  isArray(value, msg = '') {
    if (!Array.isArray(value)) {
      throw new Error(`${msg}\n  Expected array, got: ${typeof value}`);
    }
  },

  isObject(value, msg = '') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${msg}\n  Expected object, got: ${typeof value}`);
    }
  },

  isFunction(value, msg = '') {
    if (typeof value !== 'function') {
      throw new Error(`${msg}\n  Expected function, got: ${typeof value}`);
    }
  },

  // === 존재 단언 ===

  exists(value, msg = '') {
    if (value === undefined || value === null) {
      throw new Error(`${msg}\n  Expected value to exist, got: ${value}`);
    }
  },

  notExists(value, msg = '') {
    if (value !== undefined && value !== null) {
      throw new Error(`${msg}\n  Expected value to not exist, got: ${value}`);
    }
  },

  // === 범위 단언 ===

  greaterThan(actual, expected, msg = '') {
    if (actual <= expected) {
      throw new Error(`${msg}\n  Expected ${actual} > ${expected}`);
    }
  },

  greaterThanOrEqual(actual, expected, msg = '') {
    if (actual < expected) {
      throw new Error(`${msg}\n  Expected ${actual} >= ${expected}`);
    }
  },

  lessThan(actual, expected, msg = '') {
    if (actual >= expected) {
      throw new Error(`${msg}\n  Expected ${actual} < ${expected}`);
    }
  },

  lessThanOrEqual(actual, expected, msg = '') {
    if (actual > expected) {
      throw new Error(`${msg}\n  Expected ${actual} <= ${expected}`);
    }
  },

  // === 문자열 단언 ===

  includes(str, substr, msg = '') {
    if (typeof str !== 'string' || !str.includes(substr)) {
      throw new Error(`${msg}\n  Expected "${str}" to include "${substr}"`);
    }
  },

  notIncludes(str, substr, msg = '') {
    if (typeof str === 'string' && str.includes(substr)) {
      throw new Error(`${msg}\n  Expected "${str}" to not include "${substr}"`);
    }
  },

  startsWith(str, prefix, msg = '') {
    if (typeof str !== 'string' || !str.startsWith(prefix)) {
      throw new Error(`${msg}\n  Expected "${str}" to start with "${prefix}"`);
    }
  },

  endsWith(str, suffix, msg = '') {
    if (typeof str !== 'string' || !str.endsWith(suffix)) {
      throw new Error(`${msg}\n  Expected "${str}" to end with "${suffix}"`);
    }
  },

  matches(str, regex, msg = '') {
    if (typeof str !== 'string' || !regex.test(str)) {
      throw new Error(`${msg}\n  Expected "${str}" to match ${regex}`);
    }
  },

  // === 배열 단언 ===

  arrayIncludes(arr, item, msg = '') {
    if (!Array.isArray(arr) || !arr.includes(item)) {
      throw new Error(`${msg}\n  Expected array to include ${JSON.stringify(item)}`);
    }
  },

  arrayLength(arr, length, msg = '') {
    if (!Array.isArray(arr) || arr.length !== length) {
      throw new Error(
        `${msg}\n  Expected array length ${length}, got: ${arr ? arr.length : 'not array'}`
      );
    }
  },

  // === 예외 단언 ===

  throws(fn, expectedError = null, msg = '') {
    let threw = false;
    let actualError = null;

    try {
      fn();
    } catch (e) {
      threw = true;
      actualError = e;
    }

    if (!threw) {
      throw new Error(`${msg}\n  Expected function to throw`);
    }

    if (expectedError) {
      const errorMsg = actualError.message || String(actualError);
      if (!errorMsg.includes(expectedError)) {
        throw new Error(
          `${msg}\n  Expected error containing: ${expectedError}\n  Actual: ${errorMsg}`
        );
      }
    }
  },

  async rejects(promise, expectedError = null, msg = '') {
    let rejected = false;
    let actualError = null;

    try {
      await promise;
    } catch (e) {
      rejected = true;
      actualError = e;
    }

    if (!rejected) {
      throw new Error(`${msg}\n  Expected promise to reject`);
    }

    if (expectedError) {
      const errorMsg = actualError.message || String(actualError);
      if (!errorMsg.includes(expectedError)) {
        throw new Error(
          `${msg}\n  Expected rejection containing: ${expectedError}\n  Actual: ${errorMsg}`
        );
      }
    }
  },

  doesNotThrow(fn, msg = '') {
    try {
      fn();
    } catch (e) {
      throw new Error(`${msg}\n  Expected no throw, but got: ${e.message}`);
    }
  }
};

module.exports = { assert };
