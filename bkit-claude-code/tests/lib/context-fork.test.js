/**
 * Unit Tests for lib/context-fork.js (FR-03)
 * Context Fork Isolation for Skills/Agents
 *
 * @version 1.4.2
 * Test Cases: 12
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-fork-' + Date.now());
const PROJECT_DIR = path.join(TEST_DIR, 'project');

// Mock PDCA status
let mockPdcaStatus = {
  currentFeature: 'test-feature',
  currentPhase: 'design',
  features: { 'test-feature': { matchRate: 85 } },
  history: ['action1', 'action2']
};

// Mock common.js
let mockCommon = {
  PLUGIN_ROOT: path.join(TEST_DIR, 'plugin'),
  PROJECT_DIR: PROJECT_DIR,
  BKIT_PLATFORM: 'claude',
  debugLog: () => {},
  getPdcaStatusFull: (force) => ({ ...mockPdcaStatus }),
  savePdcaStatus: (status) => { mockPdcaStatus = status; }
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
const contextFork = require('../../lib/context-fork.js');

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
  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  contextFork.clearAllForks();

  // Reset mock status
  mockPdcaStatus = {
    currentFeature: 'test-feature',
    currentPhase: 'design',
    features: { 'test-feature': { matchRate: 85 } },
    history: ['action1', 'action2']
  };
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
console.log('Testing: lib/context-fork.js (FR-03)');
console.log('='.repeat(60) + '\n');

setup();

// Test 1: forkContext creates isolated copy
test('TC-CF-01: forkContext creates isolated context copy', () => {
  const { forkId, context } = contextFork.forkContext('test-skill');

  assert(forkId.startsWith('fork-'), 'Fork ID should have correct prefix');
  assert(context !== null, 'Context should not be null');
  assertEqual(context.currentFeature, 'test-feature');
});

// Test 2: forkContext returns unique IDs
test('TC-CF-02: forkContext returns unique fork IDs', () => {
  const { forkId: id1 } = contextFork.forkContext('skill-1');
  const { forkId: id2 } = contextFork.forkContext('skill-2');

  assert(id1 !== id2, 'Fork IDs should be unique');
});

// Test 3: Forked context is isolated (deep clone)
test('TC-CF-03: Forked context is isolated from original', () => {
  const { forkId, context } = contextFork.forkContext('isolation-test');

  // Modify forked context
  context.currentFeature = 'modified-feature';
  context.features['new-feature'] = { matchRate: 100 };

  // Original should not be affected
  const original = mockCommon.getPdcaStatusFull();
  assertEqual(original.currentFeature, 'test-feature',
    'Original should not be modified');
  assert(!('new-feature' in original.features),
    'Original should not have new feature');
});

// Test 4: getForkedContext retrieves fork by ID
test('TC-CF-04: getForkedContext retrieves forked context', () => {
  const { forkId } = contextFork.forkContext('retrieve-test');
  const retrieved = contextFork.getForkedContext(forkId);

  assert(retrieved !== null, 'Should retrieve forked context');
  assertEqual(retrieved.currentFeature, 'test-feature');
});

// Test 5: getForkedContext returns null for invalid ID
test('TC-CF-05: getForkedContext returns null for invalid ID', () => {
  const result = contextFork.getForkedContext('invalid-id');
  assertEqual(result, null);
});

// Test 6: updateForkedContext modifies fork
test('TC-CF-06: updateForkedContext modifies forked context', () => {
  const { forkId } = contextFork.forkContext('update-test');

  contextFork.updateForkedContext(forkId, {
    currentPhase: 'do',
    newField: 'newValue'
  });

  const updated = contextFork.getForkedContext(forkId);
  assertEqual(updated.currentPhase, 'do');
  assertEqual(updated.newField, 'newValue');
});

// Test 7: mergeForkedContext with mergeResult:true
test('TC-CF-07: mergeForkedContext merges back to parent', () => {
  const { forkId, context } = contextFork.forkContext('merge-test', {
    mergeResult: true,
    includeFields: ['history']
  });

  // Add to history in fork
  context.history.push('action3');
  contextFork.updateForkedContext(forkId, { history: context.history });

  const result = contextFork.mergeForkedContext(forkId);

  assert(result.success, 'Merge should succeed');
  assert(result.merged.history.includes('action3'),
    'Merged state should include new history');
});

// Test 8: mergeForkedContext with mergeResult:false
test('TC-CF-08: mergeForkedContext skips when mergeResult:false', () => {
  const { forkId, context } = contextFork.forkContext('no-merge-test', {
    mergeResult: false
  });

  context.currentPhase = 'check';

  const result = contextFork.mergeForkedContext(forkId);

  assert(result.success, 'Should succeed (cleanup only)');
  assertEqual(result.merged, null, 'Should not return merged data');
});

// Test 9: discardFork removes without merging
test('TC-CF-09: discardFork removes fork without merging', () => {
  const { forkId, context } = contextFork.forkContext('discard-test');
  context.currentPhase = 'discarded';

  contextFork.discardFork(forkId);

  const retrieved = contextFork.getForkedContext(forkId);
  assertEqual(retrieved, null, 'Fork should be removed');
});

// Test 10: getActiveForks returns all active forks
test('TC-CF-10: getActiveForks lists active forks', () => {
  contextFork.clearAllForks();

  contextFork.forkContext('fork-1');
  contextFork.forkContext('fork-2');

  const forks = contextFork.getActiveForks();

  assertEqual(forks.length, 2);
  assert(forks.some(f => f.name === 'fork-1'));
  assert(forks.some(f => f.name === 'fork-2'));
});

// Test 11: isForkedExecution checks fork existence
test('TC-CF-11: isForkedExecution checks if fork exists', () => {
  const { forkId } = contextFork.forkContext('existence-test');

  assert(contextFork.isForkedExecution(forkId), 'Should return true for existing fork');
  assert(!contextFork.isForkedExecution('invalid-id'), 'Should return false for invalid ID');
});

// Test 12: getForkMetadata returns fork info
test('TC-CF-12: getForkMetadata returns fork metadata', () => {
  const { forkId } = contextFork.forkContext('metadata-test', {
    mergeResult: true,
    includeFields: ['features']
  });

  const metadata = contextFork.getForkMetadata(forkId);

  assertEqual(metadata.id, forkId);
  assertEqual(metadata.name, 'metadata-test');
  assertEqual(metadata.mergeResult, true);
  assert(metadata.includeFields.includes('features'));
  assertEqual(metadata.merged, false);
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
  module: 'lib/context-fork.js',
  fr: 'FR-03',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
