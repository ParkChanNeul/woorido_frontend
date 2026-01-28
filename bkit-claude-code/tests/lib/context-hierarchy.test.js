/**
 * Unit Tests for lib/context-hierarchy.js (FR-01)
 * Multi-Level Context Hierarchy: Plugin → User → Project → Session
 *
 * @version 1.4.2
 * Test Cases: 15
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-hierarchy-' + Date.now());
const PLUGIN_DIR = path.join(TEST_DIR, 'plugin');
const PROJECT_DIR = path.join(TEST_DIR, 'project');
const USER_DIR = path.join(TEST_DIR, 'user');

// Mock common.js before requiring the module
let mockCommon = {
  PLUGIN_ROOT: PLUGIN_DIR,
  PROJECT_DIR: PROJECT_DIR,
  BKIT_PLATFORM: 'claude',
  debugLog: () => {}
};

// Override require for common.js
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === './common.js' || id.endsWith('/lib/common.js')) {
    return mockCommon;
  }
  return originalRequire.apply(this, arguments);
};

// Now require the module under test
const contextHierarchy = require('../../lib/context-hierarchy.js');

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
  // Create test directories
  fs.mkdirSync(PLUGIN_DIR, { recursive: true });
  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  fs.mkdirSync(USER_DIR, { recursive: true });

  // Invalidate cache
  contextHierarchy.invalidateCache();
  contextHierarchy.clearSessionContext();
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
console.log('Testing: lib/context-hierarchy.js (FR-01)');
console.log('='.repeat(60) + '\n');

setup();

// Test 1: LEVEL_PRIORITY constants
test('TC-CH-01: LEVEL_PRIORITY constants are correctly defined', () => {
  assertEqual(contextHierarchy.LEVEL_PRIORITY.plugin, 1);
  assertEqual(contextHierarchy.LEVEL_PRIORITY.user, 2);
  assertEqual(contextHierarchy.LEVEL_PRIORITY.project, 3);
  assertEqual(contextHierarchy.LEVEL_PRIORITY.session, 4);
});

// Test 2: getUserConfigDir returns platform-specific path
test('TC-CH-02: getUserConfigDir returns platform-specific path', () => {
  const configDir = contextHierarchy.getUserConfigDir();
  assert(configDir.includes('.claude') || configDir.includes('.gemini'),
    'Config dir should include platform folder');
  assert(configDir.includes('bkit'), 'Config dir should include bkit');
});

// Test 3: loadContextLevel returns null for missing files
test('TC-CH-03: loadContextLevel returns null for non-existent files', () => {
  const result = contextHierarchy.loadContextLevel('plugin');
  assertEqual(result, null, 'Should return null when plugin config does not exist');
});

// Test 4: loadContextLevel loads plugin level correctly
test('TC-CH-04: loadContextLevel loads plugin level when file exists', () => {
  const pluginConfig = { name: 'bkit', version: '1.4.2' };
  fs.writeFileSync(path.join(PLUGIN_DIR, 'bkit.config.json'), JSON.stringify(pluginConfig));
  contextHierarchy.invalidateCache();

  const result = contextHierarchy.loadContextLevel('plugin');
  assert(result !== null, 'Should return ContextLevel object');
  assertEqual(result.level, 'plugin');
  assertEqual(result.priority, 1);
  assertEqual(result.data.name, 'bkit');
});

// Test 5: loadContextLevel loads project level correctly
test('TC-CH-05: loadContextLevel loads project level when file exists', () => {
  const projectConfig = { project: 'test-project', level: 'Dynamic' };
  fs.writeFileSync(path.join(PROJECT_DIR, 'bkit.config.json'), JSON.stringify(projectConfig));
  contextHierarchy.invalidateCache();

  const result = contextHierarchy.loadContextLevel('project');
  assert(result !== null, 'Should return ContextLevel object');
  assertEqual(result.level, 'project');
  assertEqual(result.priority, 3);
  assertEqual(result.data.project, 'test-project');
});

// Test 6: Session level always returns object
test('TC-CH-06: loadContextLevel for session always returns object', () => {
  const result = contextHierarchy.loadContextLevel('session');
  assert(result !== null, 'Session level should always return object');
  assertEqual(result.level, 'session');
  assertEqual(result.priority, 4);
  assertEqual(result.source, 'memory');
});

// Test 7: setSessionContext sets values correctly
test('TC-CH-07: setSessionContext stores values correctly', () => {
  contextHierarchy.setSessionContext('testKey', 'testValue');
  const value = contextHierarchy.getSessionContext('testKey');
  assertEqual(value, 'testValue');
});

// Test 8: getSessionContext returns default for missing keys
test('TC-CH-08: getSessionContext returns default for missing keys', () => {
  const value = contextHierarchy.getSessionContext('nonExistentKey', 'defaultVal');
  assertEqual(value, 'defaultVal');
});

// Test 9: clearSessionContext removes all session data
test('TC-CH-09: clearSessionContext removes all session data', () => {
  contextHierarchy.setSessionContext('key1', 'value1');
  contextHierarchy.setSessionContext('key2', 'value2');
  contextHierarchy.clearSessionContext();

  const all = contextHierarchy.getAllSessionContext();
  assertEqual(Object.keys(all).length, 0, 'Session context should be empty');
});

// Test 10: getContextHierarchy returns merged result
test('TC-CH-10: getContextHierarchy returns merged hierarchy', () => {
  // Reset
  contextHierarchy.invalidateCache();
  contextHierarchy.clearSessionContext();

  const hierarchy = contextHierarchy.getContextHierarchy();
  assert(hierarchy !== null, 'Should return hierarchy object');
  assert('levels' in hierarchy, 'Should have levels array');
  assert('merged' in hierarchy, 'Should have merged object');
  assert('conflicts' in hierarchy, 'Should have conflicts array');
});

// Test 11: Hierarchy merging with priority (higher wins)
test('TC-CH-11: Higher priority level overrides lower', () => {
  // Set up plugin with setting=plugin
  fs.writeFileSync(
    path.join(PLUGIN_DIR, 'bkit.config.json'),
    JSON.stringify({ setting: 'plugin', pluginOnly: true })
  );

  // Set up project with setting=project
  fs.writeFileSync(
    path.join(PROJECT_DIR, 'bkit.config.json'),
    JSON.stringify({ setting: 'project', projectOnly: true })
  );

  contextHierarchy.invalidateCache();
  const hierarchy = contextHierarchy.getContextHierarchy();

  // Project (priority 3) should override plugin (priority 1)
  assertEqual(hierarchy.merged.setting, 'project',
    'Project setting should override plugin');
  assertEqual(hierarchy.merged.pluginOnly, true,
    'Plugin-only setting should be preserved');
  assertEqual(hierarchy.merged.projectOnly, true,
    'Project-only setting should be preserved');
});

// Test 12: getHierarchicalConfig with dot-separated path
test('TC-CH-12: getHierarchicalConfig with nested path', () => {
  fs.writeFileSync(
    path.join(PROJECT_DIR, 'bkit.config.json'),
    JSON.stringify({ pdca: { matchRateThreshold: 90 } })
  );
  contextHierarchy.invalidateCache();

  const value = contextHierarchy.getHierarchicalConfig('pdca.matchRateThreshold');
  assertEqual(value, 90);
});

// Test 13: getHierarchicalConfig returns default for missing path
test('TC-CH-13: getHierarchicalConfig returns default for missing path', () => {
  const value = contextHierarchy.getHierarchicalConfig('nonexistent.path', 'default');
  assertEqual(value, 'default');
});

// Test 14: Cache TTL works correctly
test('TC-CH-14: Cache is used within TTL period', () => {
  contextHierarchy.invalidateCache();

  // First call loads fresh
  const first = contextHierarchy.getContextHierarchy();

  // Modify file
  fs.writeFileSync(
    path.join(PROJECT_DIR, 'bkit.config.json'),
    JSON.stringify({ newKey: 'newValue' })
  );

  // Second call should use cache (within 5s TTL)
  const second = contextHierarchy.getContextHierarchy();

  // Cache should be same object reference or same data
  assert(!second.merged.newKey, 'Cached data should not have new key yet');
});

// Test 15: forceRefresh bypasses cache
test('TC-CH-15: forceRefresh bypasses cache', () => {
  fs.writeFileSync(
    path.join(PROJECT_DIR, 'bkit.config.json'),
    JSON.stringify({ refreshTest: 'fresh' })
  );

  const result = contextHierarchy.getContextHierarchy(true);  // forceRefresh=true
  assertEqual(result.merged.refreshTest, 'fresh',
    'Force refresh should load fresh data');
});

// Cleanup and summary
teardown();

// Restore original require
Module.prototype.require = originalRequire;

console.log('\n' + '='.repeat(60));
console.log(`Test Summary: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(60));

// Output JSON for integration
console.log('\n--- TEST_RESULTS_JSON ---');
console.log(JSON.stringify({
  module: 'lib/context-hierarchy.js',
  fr: 'FR-01',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
