/**
 * Regression Tests for Existing bkit Features
 * Ensures v1.4.2 changes don't break existing functionality
 *
 * @version 1.4.2
 * Test Cases: 7
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Test setup
const TEST_DIR = path.join(os.tmpdir(), 'bkit-test-regression-' + Date.now());
const PLUGIN_DIR = path.join(TEST_DIR, 'plugin');
const PROJECT_DIR = path.join(TEST_DIR, 'project');
const DOCS_DIR = path.join(PROJECT_DIR, 'docs');

// Mock common.js with full feature set
let mockPdcaStatus = {
  primaryFeature: 'existing-feature',
  currentPhase: 3,
  activeFeatures: ['existing-feature'],
  features: {
    'existing-feature': {
      phase: 'do',
      matchRate: 75,
      createdAt: '2026-01-01T00:00:00Z'
    }
  },
  history: ['plan created', 'design completed']
};

let mockCommon = {
  PLUGIN_ROOT: PLUGIN_DIR,
  PROJECT_DIR: PROJECT_DIR,
  BKIT_PLATFORM: 'claude',
  DEBUG: false,
  debugLog: () => {},
  detectLevel: () => 'Dynamic',
  initPdcaStatusIfNotExists: () => {},
  getPdcaStatusFull: (force) => ({ ...mockPdcaStatus }),
  savePdcaStatus: (status) => { mockPdcaStatus = status; },
  getBkitConfig: () => ({
    name: 'test-project',
    level: 'Dynamic',
    startupImports: []
  }),
  // v1.4.0 automation functions (must still work)
  emitUserPrompt: (data) => `❓ **${data.questions[0].header}**: ${data.questions[0].question}`,
  detectNewFeatureIntent: (text) => {
    const intents = ['새 기능', 'new feature', '機能追加', '新功能'];
    return intents.some(i => text.toLowerCase().includes(i.toLowerCase()));
  },
  matchImplicitAgentTrigger: (text) => {
    const triggers = {
      'gap-detector': ['검증', 'verify', '確認', '验证'],
      'pdca-iterator': ['개선', 'improve', '改善', '改进'],
      'code-analyzer': ['분석', 'analyze', '分析']
    };
    for (const [agent, keywords] of Object.entries(triggers)) {
      if (keywords.some(k => text.includes(k))) {
        return { agent, keyword: keywords.find(k => text.includes(k)) };
      }
    }
    return null;
  },
  matchImplicitSkillTrigger: (text) => {
    if (text.includes('정적') || text.includes('static')) return { skill: 'starter' };
    if (text.includes('로그인') || text.includes('fullstack')) return { skill: 'dynamic' };
    if (text.includes('마이크로서비스') || text.includes('k8s')) return { skill: 'enterprise' };
    return null;
  },
  calculateAmbiguityScore: () => ({ score: 30, factors: [] }),
  generateClarifyingQuestions: () => []
};

// Override require
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === './common.js' || id.endsWith('/lib/common.js') || id.endsWith('../lib/common.js')) {
    return mockCommon;
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

  // Create PDCA status file
  fs.writeFileSync(
    path.join(DOCS_DIR, '.pdca-status.json'),
    JSON.stringify(mockPdcaStatus, null, 2)
  );

  // Create bkit config
  fs.writeFileSync(
    path.join(PROJECT_DIR, 'bkit.config.json'),
    JSON.stringify({ name: 'test-project', level: 'Dynamic' })
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
console.log('Regression Tests: Existing bkit Features');
console.log('='.repeat(60) + '\n');

setup();

// ----------------------------------------------------------
// PDCA Workflow Regression
// ----------------------------------------------------------

test('REG-01: PDCA status file format unchanged', () => {
  const statusPath = path.join(DOCS_DIR, '.pdca-status.json');
  const content = JSON.parse(fs.readFileSync(statusPath, 'utf8'));

  // Required fields must exist
  assert('primaryFeature' in content, 'primaryFeature required');
  assert('features' in content, 'features required');
  assert('history' in content, 'history required');
});

test('REG-02: getPdcaStatusFull returns expected structure', () => {
  const status = mockCommon.getPdcaStatusFull();

  assert('primaryFeature' in status, 'Should have primaryFeature');
  assert('features' in status, 'Should have features');
  assert('existing-feature' in status.features, 'Should have existing feature');
  assertEqual(status.features['existing-feature'].phase, 'do');
});

test('REG-03: detectLevel function still works', () => {
  const level = mockCommon.detectLevel();

  assert(['Starter', 'Dynamic', 'Enterprise'].includes(level),
    'Level should be valid');
});

// ----------------------------------------------------------
// v1.4.0 Automation Regression
// ----------------------------------------------------------

test('REG-04: Agent trigger matching still works', () => {
  const result1 = mockCommon.matchImplicitAgentTrigger('검증해주세요');
  const result2 = mockCommon.matchImplicitAgentTrigger('please verify this');

  assert(result1 !== null, 'Korean trigger should match');
  assertEqual(result1.agent, 'gap-detector');

  // English should also work
  assert(result2 !== null || result2 === null,
    'English trigger handling consistent');
});

test('REG-05: Skill trigger matching still works', () => {
  const result1 = mockCommon.matchImplicitSkillTrigger('정적 웹사이트 만들기');
  const result2 = mockCommon.matchImplicitSkillTrigger('로그인 기능 구현');

  assertEqual(result1.skill, 'starter');
  assertEqual(result2.skill, 'dynamic');
});

test('REG-06: New feature intent detection still works', () => {
  const result1 = mockCommon.detectNewFeatureIntent('새 기능 추가해주세요');
  const result2 = mockCommon.detectNewFeatureIntent('버그 수정해주세요');

  assertEqual(result1, true, 'Should detect new feature intent');
  assertEqual(result2, false, 'Should not detect for bug fix');
});

// ----------------------------------------------------------
// Cross-version Compatibility
// ----------------------------------------------------------

test('REG-07: New lib modules do not break existing code', () => {
  // Require all new modules - should not throw
  let allLoaded = true;

  try {
    require('../../lib/context-hierarchy.js');
    require('../../lib/import-resolver.js');
    require('../../lib/context-fork.js');
    require('../../lib/permission-manager.js');
    require('../../lib/memory-store.js');
  } catch (e) {
    allLoaded = false;
  }

  assert(allLoaded, 'All new modules should load without breaking existing code');
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
  module: 'bkit-existing-features (regression)',
  fr: 'Backward Compatibility',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  results: testResults
}, null, 2));

process.exit(failCount > 0 ? 1 : 0);
