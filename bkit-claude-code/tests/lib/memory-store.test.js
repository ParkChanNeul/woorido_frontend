/**
 * Unit Tests for lib/memory-store.js (FR-08)
 * MEMORY Variable Support - Cross-session Persistence
 *
 * @version 1.4.2
 * Test Cases: 8
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-memory-' + Date.now());
const PROJECT_DIR = path.join(TEST_DIR, 'project');
const MEMORY_FILE = path.join(PROJECT_DIR, 'docs', '.bkit-memory.json');

// Mock common.js
let mockCommon = {
  PROJECT_DIR: PROJECT_DIR,
  debugLog: () => {}
};

// Override require
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === './common.js' || id.endsWith('/lib/common.js')) {
    return mockCommon;
  }
  return originalRequire.apply(this, arguments);
};

// Require module under test
const memoryStore = require('../../lib/memory-store.js');

// Test utilities
let testResults = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    testResults.push({ name, status: 'PASS' });
    passCount++;
    console.log(`✅ PASS: ${name}`);
  } catch (e) {
    testResults.push({ name, status: 'FAIL', error: e.message });
    failCount++;
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${e.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function setup() {
  // Create directory structure
  fs.mkdirSync(path.join(PROJECT_DIR, 'docs'), { recursive: true });

  // Clear cache and memory
  memoryStore.invalidateCache();
  memoryStore.clearMemory();
}

function teardown() {
  try {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  } catch (e) {
    console.log('Cleanup warning:', e.message);
  }
}

// ==================== Test Cases ====================

console.log('\n' + '='.repeat(60));
console.log('Testing: lib/memory-store.js (FR-08)');
console.log('='.repeat(60) + '\n');

setup();

// Test 1: setMemory stores value
test('TC-MS-01: setMemory stores value correctly', () => {
  memoryStore.setMemory('testKey', 'testValue');
  const value = memoryStore.getMemory('testKey');

  assertEqual(value, 'testValue');
});

// Test 2: getMemory returns default for missing key
test('TC-MS-02: getMemory returns default for missing key', () => {
  const value = memoryStore.getMemory('nonExistent', 'defaultVal');
  assertEqual(value, 'defaultVal');
});

// Test 3: setMemory persists to file
test('TC-MS-03: setMemory persists to disk file', () => {
  memoryStore.clearMemory();
  memoryStore.setMemory('persistKey', 'persistValue');

  // Check file exists and contains data
  assert(fs.existsSync(MEMORY_FILE), 'Memory file should exist');

  const fileContent = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'));
  assertEqual(fileContent.persistKey, 'persistValue');
});

// Test 4: deleteMemory removes key
test('TC-MS-04: deleteMemory removes key correctly', () => {
  memoryStore.setMemory('deleteKey', 'deleteValue');
  const deleted = memoryStore.deleteMemory('deleteKey');

  assertEqual(deleted, true);
  assertEqual(memoryStore.getMemory('deleteKey'), null);
});

// Test 5: hasMemory checks key existence
test('TC-MS-05: hasMemory checks key existence', () => {
  memoryStore.setMemory('existsKey', 'value');

  assert(memoryStore.hasMemory('existsKey'), 'Should return true for existing key');
  assert(!memoryStore.hasMemory('missingKey'), 'Should return false for missing key');
});

// Test 6: getAllMemory returns all entries
test('TC-MS-06: getAllMemory returns all stored entries', () => {
  memoryStore.clearMemory();
  memoryStore.setMemory('key1', 'value1');
  memoryStore.setMemory('key2', 'value2');

  const all = memoryStore.getAllMemory();

  assertEqual(Object.keys(all).length, 2);
  assertEqual(all.key1, 'value1');
  assertEqual(all.key2, 'value2');
});

// Test 7: updateMemory merges partial updates
test('TC-MS-07: updateMemory merges partial updates', () => {
  memoryStore.clearMemory();
  memoryStore.setMemory('existing', 'original');

  memoryStore.updateMemory({
    existing: 'modified',
    newKey: 'newValue'
  });

  assertEqual(memoryStore.getMemory('existing'), 'modified');
  assertEqual(memoryStore.getMemory('newKey'), 'newValue');
});

// Test 8: clearMemory removes all entries
test('TC-MS-08: clearMemory removes all entries', () => {
  memoryStore.setMemory('key1', 'value1');
  memoryStore.setMemory('key2', 'value2');

  memoryStore.clearMemory();

  const keys = memoryStore.getMemoryKeys();
  assertEqual(keys.length, 0);
});

// Cleanup
teardown();

// Restore original require
Module.prototype.require = originalRequire;

console.log('\n' + '='.repeat(60));
console.log(`Test Summary: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(60));

// Output JSON for integration
console.log('\n--- TEST_RESULTS_JSON ---');
console.log(JSON.stringify({
  module: 'lib/memory-store.js',
  fr: 'FR-08',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
