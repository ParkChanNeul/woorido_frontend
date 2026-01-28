/**
 * Unit Tests for lib/common.js - autoCreatePdcaTask (FR-06)
 * Task Management Integration - Automatic PDCA Task Creation
 *
 * @version 1.4.2
 * Test Cases: 7
 */

const path = require('path');

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

// Import common.js functions for testing
const common = require('../../lib/common.js');

// ==================== Test Cases ====================

console.log('\n' + '='.repeat(60));
console.log('Testing: lib/common.js - autoCreatePdcaTask (FR-06)');
console.log('='.repeat(60) + '\n');

// Test 1: quick_fix classification - no task
test('UT-ACT-01: quick_fix classification returns null (no task)', () => {
  const result = common.autoCreatePdcaTask('login', 'do', {
    classification: 'quick_fix'
  });
  assertEqual(result, null, 'quick_fix should not create task');
});

// Test 2: minor_change classification - no task
test('UT-ACT-02: minor_change classification returns null (no task)', () => {
  const result = common.autoCreatePdcaTask('auth', 'plan', {
    classification: 'minor_change'
  });
  assertEqual(result, null, 'minor_change should not create task');
});

// Test 3: feature classification - task created, no blockedBy
test('UT-ACT-03: feature classification creates task with empty blockedBy', () => {
  const result = common.autoCreatePdcaTask('payment', 'design', {
    classification: 'feature'
  });
  assert(result !== null, 'feature should create task guidance');
  assertEqual(result.action, 'TaskCreate', 'Should have TaskCreate action');
  assert(result.subject.includes('payment'), 'Subject should include feature name');
  assert(Array.isArray(result.blockedBy), 'blockedBy should be array');
  assertEqual(result.blockedBy.length, 0, 'feature should have empty blockedBy');
});

// Test 4: major_feature classification - task created with blockedBy
test('UT-ACT-04: major_feature classification creates task with blockedBy', () => {
  const result = common.autoCreatePdcaTask('checkout', 'design', {
    classification: 'major_feature'
  });
  assert(result !== null, 'major_feature should create task guidance');
  assertEqual(result.action, 'TaskCreate', 'Should have TaskCreate action');
  assert(result.blockedBy.length > 0, 'major_feature should have blockedBy');
  assert(result.blockedBy[0].toLowerCase().includes('plan'),
         'design phase should be blocked by plan phase');
});

// Test 5: skipTask option forces skip
test('UT-ACT-05: skipTask option forces null return', () => {
  const result = common.autoCreatePdcaTask('api', 'do', {
    classification: 'feature',
    skipTask: true
  });
  assertEqual(result, null, 'skipTask should force null return');
});

// Test 6: plan phase for major_feature - no blockedBy (first phase)
test('UT-ACT-06: major_feature plan phase has empty blockedBy', () => {
  const result = common.autoCreatePdcaTask('user-auth', 'plan', {
    classification: 'major_feature'
  });
  assert(result !== null, 'Should create task guidance');
  assertEqual(result.blockedBy.length, 0, 'plan phase should have no blockers');
});

// Test 7: do phase for major_feature - blockedBy design
test('UT-ACT-07: major_feature do phase is blocked by design', () => {
  const result = common.autoCreatePdcaTask('dashboard', 'do', {
    classification: 'major_feature'
  });
  assert(result !== null, 'Should create task guidance');
  assert(result.blockedBy.length > 0, 'do phase should have blocker');
  assert(result.blockedBy[0].toLowerCase().includes('design'),
         'do phase should be blocked by design phase');
});

// ==================== Summary ====================

console.log('\n' + '='.repeat(60));
console.log(`Test Summary: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(60) + '\n');

// Output JSON results for aggregation
console.log('--- TEST_RESULTS_JSON ---');
console.log(JSON.stringify({
  module: 'lib/common.js (autoCreatePdcaTask)',
  fr: 'FR-06',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  tests: testResults
}));
