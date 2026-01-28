/**
 * Unit Tests for lib/permission-manager.js (FR-05)
 * Permission Hierarchy: deny → ask → allow
 *
 * @version 1.4.2
 * Test Cases: 10
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-permission-' + Date.now());

// Mock hierarchy module
let mockPermissions = {
  Write: 'allow',
  Edit: 'allow',
  Read: 'allow',
  Bash: 'allow',
  'Bash(rm -rf*)': 'deny',
  'Bash(rm -r*)': 'ask',
  'Bash(git push --force*)': 'deny',
  'Bash(git reset --hard*)': 'ask'
};

let mockHierarchy = {
  getHierarchicalConfig: (key, defaultValue) => {
    if (key === 'permissions') {
      return mockPermissions;
    }
    return defaultValue;
  }
};

let mockCommon = {
  debugLog: () => {}
};

// Override require
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === './common.js' || id.endsWith('/lib/common.js')) {
    return mockCommon;
  }
  if (id === './context-hierarchy.js' || id.endsWith('/lib/context-hierarchy.js')) {
    return mockHierarchy;
  }
  return originalRequire.apply(this, arguments);
};

// Require module under test
const permissionManager = require('../../lib/permission-manager.js');

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

// ==================== Test Cases ====================

console.log('\n' + '='.repeat(60));
console.log('Testing: lib/permission-manager.js (FR-05)');
console.log('='.repeat(60) + '\n');

// Test 1: PERMISSION_LEVELS constants
test('TC-PM-01: PERMISSION_LEVELS defined correctly', () => {
  assertEqual(permissionManager.PERMISSION_LEVELS.deny, 0);
  assertEqual(permissionManager.PERMISSION_LEVELS.ask, 1);
  assertEqual(permissionManager.PERMISSION_LEVELS.allow, 2);
});

// Test 2: DEFAULT_PERMISSIONS contains expected defaults
test('TC-PM-02: DEFAULT_PERMISSIONS has expected entries', () => {
  const defaults = permissionManager.DEFAULT_PERMISSIONS;

  assertEqual(defaults.Write, 'allow');
  assertEqual(defaults['Bash(rm -rf*)'], 'deny');
  assertEqual(defaults['Bash(rm -r*)'], 'ask');
});

// Test 3: checkPermission returns allow for basic Write
test('TC-PM-03: checkPermission returns allow for basic Write', () => {
  const permission = permissionManager.checkPermission('Write', '/path/to/file.js');
  assertEqual(permission, 'allow');
});

// Test 4: checkPermission returns deny for rm -rf
test('TC-PM-04: checkPermission returns deny for dangerous rm -rf', () => {
  const permission = permissionManager.checkPermission('Bash', 'rm -rf /');
  assertEqual(permission, 'deny');
});

// Test 5: checkPermission returns ask for rm -r (less dangerous)
test('TC-PM-05: checkPermission returns ask for rm -r', () => {
  const permission = permissionManager.checkPermission('Bash', 'rm -r ./temp');
  assertEqual(permission, 'ask');
});

// Test 6: checkPermission with git push --force
test('TC-PM-06: checkPermission returns deny for git push --force', () => {
  const permission = permissionManager.checkPermission('Bash', 'git push --force origin main');
  assertEqual(permission, 'deny');
});

// Test 7: shouldBlock returns correct structure
test('TC-PM-07: shouldBlock returns blocked:true for denied actions', () => {
  const result = permissionManager.shouldBlock('Bash', 'rm -rf /important');

  assert(result.blocked === true, 'Should be blocked');
  assertEqual(result.permission, 'deny');
  assert(result.reason.includes('denied'), 'Should have denial reason');
});

// Test 8: shouldBlock returns blocked:false for allowed actions
test('TC-PM-08: shouldBlock returns blocked:false for allowed actions', () => {
  const result = permissionManager.shouldBlock('Write', '/some/file.js');

  assertEqual(result.blocked, false);
  assertEqual(result.permission, 'allow');
  assertEqual(result.reason, null);
});

// Test 9: requiresConfirmation for ask permission
test('TC-PM-09: requiresConfirmation returns true for ask permission', () => {
  const result = permissionManager.requiresConfirmation('Bash', 'rm -r ./temp');

  assertEqual(result.requiresConfirmation, true);
  assertEqual(result.permission, 'ask');
});

// Test 10: getPermissionLevel returns numeric values
test('TC-PM-10: getPermissionLevel returns correct numeric values', () => {
  assertEqual(permissionManager.getPermissionLevel('deny'), 0);
  assertEqual(permissionManager.getPermissionLevel('ask'), 1);
  assertEqual(permissionManager.getPermissionLevel('allow'), 2);
  assertEqual(permissionManager.getPermissionLevel('unknown'), 2);  // defaults to allow
});

// Restore original require
Module.prototype.require = originalRequire;

console.log('\n' + '='.repeat(60));
console.log(`Test Summary: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(60));

// Output JSON for integration
console.log('\n--- TEST_RESULTS_JSON ---');
console.log(JSON.stringify({
  module: 'lib/permission-manager.js',
  fr: 'FR-05',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
