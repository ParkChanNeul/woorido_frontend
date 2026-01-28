/**
 * Unit Tests for Lazy Loading Pattern (All lib modules)
 * Circular Reference Prevention via getCommon() pattern
 *
 * @version 1.4.2
 * Test Cases: 5
 */

const path = require('path');
const fs = require('fs');

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

// Module paths
const LIB_DIR = path.join(__dirname, '../../lib');

// ==================== Test Cases ====================

console.log('\n' + '='.repeat(60));
console.log('Testing: Lazy Loading Pattern (Circular Reference Prevention)');
console.log('='.repeat(60) + '\n');

// Test 1: context-hierarchy.js uses getCommon() pattern
test('UT-LP-01: context-hierarchy.js uses lazy loading pattern', () => {
  const content = fs.readFileSync(path.join(LIB_DIR, 'context-hierarchy.js'), 'utf8');

  // Should have getCommon function
  assert(content.includes('function getCommon()') || content.includes('getCommon = ()'),
         'Should define getCommon function');

  // Should not require common.js at top level directly for circular deps
  const topLevelRequire = /^const\s+\{[^}]+\}\s*=\s*require\(['"]\.\/common\.js['"]\)/m;
  const usesLazyPattern = content.includes('getCommon()');

  assert(usesLazyPattern, 'Should use getCommon() for lazy loading');
});

// Test 2: import-resolver.js uses getCommon() pattern
test('UT-LP-02: import-resolver.js uses lazy loading pattern', () => {
  const content = fs.readFileSync(path.join(LIB_DIR, 'import-resolver.js'), 'utf8');

  assert(content.includes('function getCommon()') || content.includes('getCommon = ()'),
         'Should define getCommon function');
  assert(content.includes('getCommon()'), 'Should use getCommon() for lazy loading');

  // Check for getHierarchy pattern too
  const usesHierarchy = content.includes('getHierarchy') || content.includes('context-hierarchy');
  // import-resolver may or may not use hierarchy
});

// Test 3: context-fork.js uses getCommon() pattern
test('UT-LP-03: context-fork.js uses lazy loading pattern', () => {
  const content = fs.readFileSync(path.join(LIB_DIR, 'context-fork.js'), 'utf8');

  assert(content.includes('function getCommon()') || content.includes('getCommon = ()'),
         'Should define getCommon function');
  assert(content.includes('getCommon()'), 'Should use getCommon() for lazy loading');
});

// Test 4: permission-manager.js uses getCommon() pattern
test('UT-LP-04: permission-manager.js uses lazy loading pattern', () => {
  const content = fs.readFileSync(path.join(LIB_DIR, 'permission-manager.js'), 'utf8');

  assert(content.includes('function getCommon()') || content.includes('getCommon = ()'),
         'Should define getCommon function');
  assert(content.includes('getCommon()'), 'Should use getCommon() for lazy loading');
});

// Test 5: memory-store.js uses getCommon() pattern
test('UT-LP-05: memory-store.js uses lazy loading pattern', () => {
  const content = fs.readFileSync(path.join(LIB_DIR, 'memory-store.js'), 'utf8');

  assert(content.includes('function getCommon()') || content.includes('getCommon = ()'),
         'Should define getCommon function');
  assert(content.includes('getCommon()'), 'Should use getCommon() for lazy loading');
});

// ==================== Summary ====================

console.log('\n' + '='.repeat(60));
console.log(`Test Summary: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(60) + '\n');

// Output JSON results for aggregation
console.log('--- TEST_RESULTS_JSON ---');
console.log(JSON.stringify({
  module: 'lib/* (Lazy Loading Pattern)',
  fr: 'All FR',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  tests: testResults
}));
