/**
 * Unit Tests for scripts/user-prompt-handler.js (FR-04)
 * UserPromptSubmit Hook - Feature/Agent/Skill Detection
 *
 * @version 1.4.2
 * Test Cases: 9
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

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
console.log('Testing: scripts/user-prompt-handler.js (FR-04)');
console.log('='.repeat(60) + '\n');

// Test 1: Feature Intent Detection - New Feature
test('UT-UPH-01: Feature Intent Detection - "로그인 기능 만들어줘"', () => {
  const result = common.detectNewFeatureIntent('로그인 기능 만들어줘');
  assert(result !== null, 'Should detect feature intent');
  assert(result.isNewFeature === true, 'Should be new feature');
  // featureName extracts keyword "기능" from the prompt
  assert(result.featureName && result.featureName.length > 0, 'Should extract feature name');
  assert(result.confidence > 0.7, 'Should have high confidence');
});

// Test 2: Feature Intent Detection - Bug Fix (not new feature)
test('UT-UPH-02: Feature Intent Detection - "버그 수정해줘" (no feature intent)', () => {
  const result = common.detectNewFeatureIntent('버그 수정해줘');
  // Bug fix should not be detected as new feature
  if (result) {
    assert(result.isNewFeature === false || result.confidence < 0.5,
           'Bug fix should not be detected as new feature');
  }
});

// Test 3: Agent Trigger Detection - gap-detector
test('UT-UPH-03: Agent Trigger Detection - "코드 검증해줘"', () => {
  const result = common.matchImplicitAgentTrigger('코드 검증해줘');
  assert(result !== null, 'Should detect agent trigger');
  assertEqual(result.agent, 'gap-detector', 'Should suggest gap-detector');
  assert(result.confidence > 0.7, 'Should have high confidence');
});

// Test 4: Agent Trigger Detection - code-analyzer
test('UT-UPH-04: Agent Trigger Detection - "분석해줘"', () => {
  const result = common.matchImplicitAgentTrigger('코드 품질 분석해줘');
  assert(result !== null, 'Should detect agent trigger');
  assertEqual(result.agent, 'code-analyzer', 'Should suggest code-analyzer');
});

// Test 5: Skill Trigger Detection - phase-4-api
test('UT-UPH-05: Skill Trigger Detection - "API 설계"', () => {
  const result = common.matchImplicitSkillTrigger('API 엔드포인트 설계해줘');
  assert(result !== null, 'Should detect skill trigger');
  assert(result.skill === 'phase-4-api' || result.skill.includes('api'),
         'Should suggest API-related skill');
});

// Test 6: Ambiguity Detection - Ambiguous
test('UT-UPH-06: Ambiguity Detection - "이거 고쳐줘" (ambiguous)', () => {
  const result = common.calculateAmbiguityScore('이거 고쳐줘', {});
  assert(result !== null, 'Should calculate ambiguity');
  // Short vague prompts get ambiguity score > 0 with scope/length factors
  assert(result.score > 0, 'Ambiguous prompt should have score > 0');
  assert(result.factors && result.factors.length > 0, 'Should have ambiguity factors');
});

// Test 7: Ambiguity Detection - Clear
test('UT-UPH-07: Ambiguity Detection - "src/app.js의 login 함수 수정" (clear)', () => {
  const result = common.calculateAmbiguityScore('src/app.js 파일의 login 함수에서 null 체크 추가해줘', {});
  assert(result !== null, 'Should calculate ambiguity');
  assert(result.score < 50, 'Clear prompt should have score < 50');
});

// Test 8: Short prompt handling
test('UT-UPH-08: Short prompt handling - "hi"', () => {
  // Very short prompts should be handled gracefully
  const featureResult = common.detectNewFeatureIntent('hi');
  const agentResult = common.matchImplicitAgentTrigger('hi');
  // Should not throw errors and either return null or low confidence
  assert(
    featureResult === null || featureResult.confidence < 0.5,
    'Short prompt should not trigger high-confidence feature detection'
  );
});

// Test 9: Multi-language support
test('UT-UPH-09: Multi-language - "verify this code" (English)', () => {
  const result = common.matchImplicitAgentTrigger('verify this code');
  assert(result !== null, 'Should detect English agent trigger');
  assertEqual(result.agent, 'gap-detector', 'Should suggest gap-detector for "verify"');
});

// ==================== Summary ====================

console.log('\n' + '='.repeat(60));
console.log(`Test Summary: ${passCount} passed, ${failCount} failed`);
console.log('='.repeat(60) + '\n');

// Output JSON results for aggregation
console.log('--- TEST_RESULTS_JSON ---');
console.log(JSON.stringify({
  module: 'scripts/user-prompt-handler.js',
  fr: 'FR-04',
  total: testResults.length,
  passed: passCount,
  failed: failCount,
  tests: testResults
}));
