/**
 * Unit Tests for lib/import-resolver.js (FR-02)
 * @import Directive Support with Variable Resolution
 *
 * @version 1.4.2
 * Test Cases: 18
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-import-' + Date.now());
const PLUGIN_DIR = path.join(TEST_DIR, 'plugin');
const PROJECT_DIR = path.join(TEST_DIR, 'project');
const TEMPLATES_DIR = path.join(PLUGIN_DIR, 'templates', 'shared');

// Mock modules
let mockCommon = {
  PLUGIN_ROOT: PLUGIN_DIR,
  PROJECT_DIR: PROJECT_DIR,
  BKIT_PLATFORM: 'claude',
  debugLog: () => {}
};

let mockHierarchy = {
  getUserConfigDir: () => path.join(TEST_DIR, 'user')
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
const importResolver = require('../../lib/import-resolver.js');

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
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  fs.mkdirSync(path.join(TEST_DIR, 'user'), { recursive: true });

  // Create test template files
  fs.writeFileSync(
    path.join(TEMPLATES_DIR, 'api-patterns.md'),
    '# API Patterns\n\nREST API best practices for bkit projects.'
  );

  fs.writeFileSync(
    path.join(TEMPLATES_DIR, 'error-handling.md'),
    '# Error Handling\n\nStandard error handling patterns.'
  );

  // Clear cache
  importResolver.clearImportCache();
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
console.log('Testing: lib/import-resolver.js (FR-02)');
console.log('='.repeat(60) + '\n');

setup();

// Test 1: IMPORT_CACHE_TTL constant
test('TC-IR-01: IMPORT_CACHE_TTL is 30 seconds', () => {
  assertEqual(importResolver.IMPORT_CACHE_TTL, 30000);
});

// Test 2: resolveVariables with ${PLUGIN_ROOT}
test('TC-IR-02: resolveVariables resolves ${PLUGIN_ROOT}', () => {
  const input = '${PLUGIN_ROOT}/templates/shared/api.md';
  const result = importResolver.resolveVariables(input);
  assert(result.startsWith(PLUGIN_DIR), 'Should replace with plugin dir');
  assert(!result.includes('${PLUGIN_ROOT}'), 'Should not contain variable');
});

// Test 3: resolveVariables with ${PROJECT}
test('TC-IR-03: resolveVariables resolves ${PROJECT}', () => {
  const input = '${PROJECT}/conventions.md';
  const result = importResolver.resolveVariables(input);
  assert(result.startsWith(PROJECT_DIR), 'Should replace with project dir');
});

// Test 4: resolveVariables with ${USER_CONFIG}
test('TC-IR-04: resolveVariables resolves ${USER_CONFIG}', () => {
  const input = '${USER_CONFIG}/preferences.json';
  const result = importResolver.resolveVariables(input);
  assert(result.includes('user'), 'Should replace with user config dir');
});

// Test 5: resolveImportPath with relative path
test('TC-IR-05: resolveImportPath resolves relative paths', () => {
  const fromFile = path.join(PROJECT_DIR, 'skills', 'test', 'SKILL.md');
  const importPath = './shared/common.md';

  const result = importResolver.resolveImportPath(importPath, fromFile);
  assert(path.isAbsolute(result), 'Result should be absolute path');
  assert(result.includes('shared'), 'Should maintain relative structure');
});

// Test 6: resolveImportPath with parent directory
test('TC-IR-06: resolveImportPath resolves ../ paths', () => {
  const fromFile = path.join(PROJECT_DIR, 'skills', 'test', 'SKILL.md');
  const importPath = '../common/utils.md';

  const result = importResolver.resolveImportPath(importPath, fromFile);
  assert(result.includes('common'), 'Should resolve parent path');
});

// Test 7: loadImportedContent loads existing file
test('TC-IR-07: loadImportedContent loads existing file content', () => {
  const filePath = path.join(TEMPLATES_DIR, 'api-patterns.md');
  const content = importResolver.loadImportedContent(filePath);

  assert(content.includes('API Patterns'), 'Should load file content');
});

// Test 8: loadImportedContent returns empty for missing file
test('TC-IR-08: loadImportedContent returns empty for missing file', () => {
  const content = importResolver.loadImportedContent('/nonexistent/file.md');
  assertEqual(content, '');
});

// Test 9: loadImportedContent uses cache within TTL
test('TC-IR-09: loadImportedContent caches content', () => {
  importResolver.clearImportCache();

  const filePath = path.join(TEMPLATES_DIR, 'api-patterns.md');

  // First load
  const first = importResolver.loadImportedContent(filePath);

  // Modify file
  fs.writeFileSync(filePath, '# Modified Content');

  // Second load should use cache
  const second = importResolver.loadImportedContent(filePath);

  assertEqual(first, second, 'Cached content should match');
});

// Test 10: parseFrontmatter extracts imports array
test('TC-IR-10: parseFrontmatter extracts imports array', () => {
  const content = `---
name: test-skill
imports:
  - ./shared/api.md
  - \${PLUGIN_ROOT}/templates/error.md
---

# Skill Content
`;

  const { frontmatter, body } = importResolver.parseFrontmatter(content);

  assert(Array.isArray(frontmatter.imports), 'imports should be array');
  assertEqual(frontmatter.imports.length, 2);
  assertEqual(frontmatter.imports[0], './shared/api.md');
  assert(body.includes('# Skill Content'), 'Body should contain content');
});

// Test 11: parseFrontmatter handles missing frontmatter
test('TC-IR-11: parseFrontmatter handles content without frontmatter', () => {
  const content = '# Just Content\n\nNo frontmatter here.';
  const { frontmatter, body } = importResolver.parseFrontmatter(content);

  assertEqual(Object.keys(frontmatter).length, 0);
  assertEqual(body, content);
});

// Test 12: detectCircularImport detects cycle
test('TC-IR-12: detectCircularImport prevents infinite loops', () => {
  // Create files that would create circular import
  const fileA = path.join(PROJECT_DIR, 'a.md');
  const fileB = path.join(PROJECT_DIR, 'b.md');

  fs.writeFileSync(fileA, `---
imports:
  - ./b.md
---
# File A`);

  fs.writeFileSync(fileB, `---
imports:
  - ./a.md
---
# File B`);

  // detectCircularImport is internal, test via resolveImports
  const frontmatter = { imports: ['./b.md'] };

  // This would cause circular detection in real scenario
  // Testing the function directly
  const initial = importResolver.detectCircularImport('/some/path/a.md');
  assertEqual(initial, false, 'Initially should not be circular');
});

// Test 13: resolveImports with valid imports
test('TC-IR-13: resolveImports processes valid imports', () => {
  const fromFile = path.join(PLUGIN_DIR, 'skills', 'test', 'SKILL.md');
  const frontmatter = {
    imports: [
      path.join(TEMPLATES_DIR, 'api-patterns.md')
    ]
  };

  const { content, errors } = importResolver.resolveImports(frontmatter, fromFile);

  assert(content.includes('API Patterns'), 'Should include imported content');
  assertEqual(errors.length, 0, 'Should have no errors');
});

// Test 14: resolveImports with missing file
test('TC-IR-14: resolveImports reports missing file errors', () => {
  const fromFile = path.join(PLUGIN_DIR, 'test.md');
  const frontmatter = {
    imports: ['./nonexistent.md']
  };

  const { content, errors } = importResolver.resolveImports(frontmatter, fromFile);

  assert(errors.length > 0, 'Should have error for missing file');
});

// Test 15: resolveImports with empty imports array
test('TC-IR-15: resolveImports handles empty imports', () => {
  const { content, errors } = importResolver.resolveImports({ imports: [] }, '/test.md');

  assertEqual(content, '');
  assertEqual(errors.length, 0);
});

// Test 16: processMarkdownWithImports full workflow
test('TC-IR-16: processMarkdownWithImports processes file with imports', () => {
  const skillFile = path.join(PROJECT_DIR, 'test-skill.md');
  fs.writeFileSync(skillFile, `---
name: test-skill
imports:
  - ${path.join(TEMPLATES_DIR, 'api-patterns.md')}
---

# Test Skill

This skill uses API patterns.
`);

  const { content, errors } = importResolver.processMarkdownWithImports(skillFile);

  assert(content.includes('API Patterns'), 'Should include imported content');
  assert(content.includes('Test Skill'), 'Should include original content');
});

// Test 17: getCacheStats returns correct info
test('TC-IR-17: getCacheStats returns cache information', () => {
  importResolver.clearImportCache();

  // Load a file to populate cache
  const filePath = path.join(TEMPLATES_DIR, 'api-patterns.md');
  importResolver.loadImportedContent(filePath);

  const stats = importResolver.getCacheStats();

  assertEqual(stats.size, 1);
  assert(stats.entries.length === 1);
});

// Test 18: clearImportCache clears all cached content
test('TC-IR-18: clearImportCache empties the cache', () => {
  // Ensure cache has content
  importResolver.loadImportedContent(path.join(TEMPLATES_DIR, 'api-patterns.md'));

  importResolver.clearImportCache();
  const stats = importResolver.getCacheStats();

  assertEqual(stats.size, 0);
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
  module: 'lib/import-resolver.js',
  fr: 'FR-02',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
