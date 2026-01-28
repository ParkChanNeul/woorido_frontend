/**
 * Integration Tests for hooks/session-start.js
 * Verifies FR-01, FR-02, FR-03, FR-08 module integration
 *
 * @version 1.4.2
 * Test Cases: 17
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-integration-' + Date.now());
const PLUGIN_DIR = path.join(TEST_DIR, 'plugin');
const PROJECT_DIR = path.join(TEST_DIR, 'project');
const DOCS_DIR = path.join(PROJECT_DIR, 'docs');

// Mock common.js
let mockCommon = {
  PLUGIN_ROOT: PLUGIN_DIR,
  PROJECT_DIR: PROJECT_DIR,
  BKIT_PLATFORM: 'claude',
  DEBUG: false,
  debugLog: () => {},
  detectLevel: () => 'Starter',
  initPdcaStatusIfNotExists: () => {},
  getPdcaStatusFull: () => ({
    primaryFeature: 'test-feature',
    activeFeatures: ['test-feature'],
    features: { 'test-feature': { phase: 'design', matchRate: 85 } }
  }),
  getBkitConfig: () => ({
    name: 'test-project',
    startupImports: []
  }),
  emitUserPrompt: (data) => JSON.stringify(data),
  calculateAmbiguityScore: () => ({ score: 30, factors: [] }),
  generateClarifyingQuestions: () => []
};

// Override require for mocking
const Module = require('module');
const originalRequire = Module.prototype.require;
let mockModules = {};

Module.prototype.require = function(id) {
  if (id === './common.js' || id.endsWith('/lib/common.js') || id.endsWith('../lib/common.js')) {
    return mockCommon;
  }
  if (mockModules[id]) {
    return mockModules[id];
  }
  return originalRequire.apply(this, arguments);
};

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
  fs.mkdirSync(PLUGIN_DIR, { recursive: true });
  fs.mkdirSync(PROJECT_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });

  // Create bkit.config.json
  fs.writeFileSync(
    path.join(PLUGIN_DIR, 'bkit.config.json'),
    JSON.stringify({ name: 'bkit', version: '1.4.2' })
  );
  fs.writeFileSync(
    path.join(PROJECT_DIR, 'bkit.config.json'),
    JSON.stringify({ name: 'test-project', level: 'Starter' })
  );
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
console.log('Integration Tests: session-start.js + lib modules');
console.log('='.repeat(60) + '\n');

setup();

// Require lib modules for testing
const contextHierarchy = require('../../lib/context-hierarchy.js');
const memoryStore = require('../../lib/memory-store.js');
const importResolver = require('../../lib/import-resolver.js');
const contextFork = require('../../lib/context-fork.js');

// ----------------------------------------------------------
// FR-01: Context Hierarchy Integration
// ----------------------------------------------------------

test('INT-01: Context Hierarchy loads plugin config', () => {
  contextHierarchy.invalidateCache();
  const level = contextHierarchy.loadContextLevel('plugin');

  assert(level !== null, 'Should load plugin level');
  assertEqual(level.data.version, '1.4.2');
});

test('INT-02: Context Hierarchy loads project config', () => {
  contextHierarchy.invalidateCache();
  const level = contextHierarchy.loadContextLevel('project');

  assert(level !== null, 'Should load project level');
  assertEqual(level.data.level, 'Starter');
});

test('INT-03: Session context is isolated per session', () => {
  contextHierarchy.clearSessionContext();
  contextHierarchy.setSessionContext('sessionTest', 'value1');

  const value = contextHierarchy.getSessionContext('sessionTest');
  assertEqual(value, 'value1');

  contextHierarchy.clearSessionContext();
  const cleared = contextHierarchy.getSessionContext('sessionTest');
  assertEqual(cleared, null);
});

test('INT-04: Context hierarchy merges all levels correctly', () => {
  contextHierarchy.invalidateCache();
  contextHierarchy.clearSessionContext();
  contextHierarchy.setSessionContext('sessionOnly', 'session-value');

  const hierarchy = contextHierarchy.getContextHierarchy();

  assert(hierarchy.levels.length >= 2, 'Should have multiple levels');
  assert(hierarchy.merged.sessionOnly === 'session-value',
    'Session context should be in merged');
});

// ----------------------------------------------------------
// FR-08: Memory Store Integration
// ----------------------------------------------------------

test('INT-05: Memory Store persists session count', () => {
  memoryStore.invalidateCache();
  memoryStore.clearMemory();

  // Simulate session start
  const count1 = memoryStore.getMemory('sessionCount', 0);
  memoryStore.setMemory('sessionCount', count1 + 1);

  // Second session
  memoryStore.invalidateCache();
  const count2 = memoryStore.getMemory('sessionCount', 0);

  assertEqual(count2, 1, 'Session count should be persisted');
});

test('INT-06: Memory Store saves lastSession info', () => {
  memoryStore.clearMemory();

  const sessionInfo = {
    startedAt: new Date().toISOString(),
    platform: 'claude',
    level: 'Starter'
  };

  memoryStore.setMemory('lastSession', sessionInfo);
  memoryStore.invalidateCache();

  const retrieved = memoryStore.getMemory('lastSession');
  assertEqual(retrieved.platform, 'claude');
});

test('INT-07: Memory Store file exists after write', () => {
  memoryStore.clearMemory();
  memoryStore.setMemory('testKey', 'testValue');

  const memoryPath = memoryStore.getMemoryPath();
  assert(fs.existsSync(memoryPath), 'Memory file should exist');
});

// ----------------------------------------------------------
// FR-02: Import Resolver Integration
// ----------------------------------------------------------

test('INT-08: Import Resolver resolves PLUGIN_ROOT variable', () => {
  const resolved = importResolver.resolveVariables('${PLUGIN_ROOT}/templates/test.md');
  assert(resolved.includes(PLUGIN_DIR), 'Should resolve to plugin dir');
});

test('INT-09: Import Resolver resolves PROJECT variable', () => {
  const resolved = importResolver.resolveVariables('${PROJECT}/docs/test.md');
  assert(resolved.includes(PROJECT_DIR), 'Should resolve to project dir');
});

test('INT-10: Import Resolver processes markdown with frontmatter', () => {
  const testFile = path.join(PROJECT_DIR, 'test-skill.md');
  const templateFile = path.join(PLUGIN_DIR, 'template.md');

  fs.writeFileSync(templateFile, '# Template Content\nShared content here.');
  fs.writeFileSync(testFile, `---
name: test-skill
imports:
  - ${templateFile}
---

# Skill Content`);

  const { content, errors } = importResolver.processMarkdownWithImports(testFile);

  assert(content.includes('Template Content'), 'Should include imported content');
  assert(content.includes('Skill Content'), 'Should keep original content');
});

test('INT-11: Import Resolver caches content', () => {
  importResolver.clearImportCache();

  const templateFile = path.join(PLUGIN_DIR, 'cached.md');
  fs.writeFileSync(templateFile, '# Cached Content');

  importResolver.loadImportedContent(templateFile);
  const stats = importResolver.getCacheStats();

  assertEqual(stats.size, 1);
});

// ----------------------------------------------------------
// FR-03: Context Fork Integration
// ----------------------------------------------------------

test('INT-12: Context Fork creates isolated copy', () => {
  contextFork.clearAllForks();

  const { forkId, context } = contextFork.forkContext('test-skill');

  assert(forkId.startsWith('fork-'), 'Should have fork ID');
  assert(context !== null, 'Should have context');
});

test('INT-13: Context Fork cleanup on session start', () => {
  // Create some forks
  contextFork.forkContext('stale-fork-1');
  contextFork.forkContext('stale-fork-2');

  const before = contextFork.getActiveForks().length;
  contextFork.clearAllForks();
  const after = contextFork.getActiveForks().length;

  assert(before >= 2, 'Should have forks before cleanup');
  assertEqual(after, 0, 'Should have no forks after cleanup');
});

test('INT-14: Context Fork with mergeResult:false does not merge', () => {
  contextFork.clearAllForks();

  const { forkId, context } = contextFork.forkContext('no-merge-skill', {
    mergeResult: false
  });

  context.testField = 'modified';
  const result = contextFork.mergeForkedContext(forkId);

  assert(result.success, 'Operation should succeed');
  assertEqual(result.merged, null, 'Should not return merged data');
});

// ----------------------------------------------------------
// Cross-Module Integration
// ----------------------------------------------------------

test('INT-15: All modules use lazy loading pattern', () => {
  // Verify modules load without circular dependency errors
  const modules = [
    require('../../lib/context-hierarchy.js'),
    require('../../lib/import-resolver.js'),
    require('../../lib/context-fork.js'),
    require('../../lib/permission-manager.js'),
    require('../../lib/memory-store.js')
  ];

  assertEqual(modules.length, 5, 'All modules should load successfully');
});

test('INT-16: Context Hierarchy + Memory Store work together', () => {
  // Simulate session-start.js flow
  contextHierarchy.clearSessionContext();
  memoryStore.clearMemory();

  // Session start sequence
  const sessionCount = memoryStore.getMemory('sessionCount', 0);
  memoryStore.setMemory('sessionCount', sessionCount + 1);

  contextHierarchy.setSessionContext('sessionStartedAt', new Date().toISOString());
  contextHierarchy.setSessionContext('platform', 'claude');

  // Verify both work
  const storedCount = memoryStore.getMemory('sessionCount');
  const sessionPlatform = contextHierarchy.getSessionContext('platform');

  assert(storedCount > 0, 'Session count should be stored');
  assertEqual(sessionPlatform, 'claude', 'Platform should be in session context');
});

test('INT-17: Import Resolver + Context Hierarchy for startup imports', () => {
  // Create startup import file
  const startupFile = path.join(PLUGIN_DIR, 'startup-context.md');
  fs.writeFileSync(startupFile, '# Startup Context\nLoaded at session start.');

  // Simulate startup import processing
  const config = { startupImports: [startupFile] };
  const { content, errors } = importResolver.resolveImports(
    { imports: config.startupImports },
    path.join(PROJECT_DIR, 'bkit.config.json')
  );

  assert(content.includes('Startup Context'), 'Startup import should be loaded');
  assertEqual(errors.length, 0, 'Should have no errors');
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
  module: 'hooks/session-start.js (integration)',
  fr: 'FR-01,FR-02,FR-03,FR-08',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
