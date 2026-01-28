/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: [
    '**/test-scripts/unit/**/*.test.js',
    '**/test-scripts/integration/**/*.test.js',
    '**/test-scripts/regression/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    // 기존 TestRunner 기반 테스트 제외 (Jest 미호환)
    'test-scripts/unit/ambiguity.test.js',
    'test-scripts/unit/config.test.js',
    'test-scripts/unit/debug-logging.test.js',
    'test-scripts/unit/feature-detection.test.js',
    'test-scripts/unit/file-detection.test.js',
    'test-scripts/unit/input-helpers.test.js',
    'test-scripts/unit/intent-detection.test.js',
    'test-scripts/unit/json-output.test.js',
    'test-scripts/unit/level-detection.test.js',
    'test-scripts/unit/multi-feature.test.js',
    'test-scripts/unit/pdca-automation.test.js',
    'test-scripts/unit/pdca-status.test.js',
    'test-scripts/unit/phase-transition.test.js',
    'test-scripts/unit/requirement-fulfillment.test.js',
    'test-scripts/unit/task-classification.test.js',
    'test-scripts/unit/tier-detection.test.js',
    'test-scripts/integration/pdca-scripts.test.js',
    'test-scripts/integration/phase-scripts.test.js',
    'test-scripts/integration/qa-scripts.test.js',
    'test-scripts/integration/utility-scripts.test.js'
  ],
  verbose: true,
  collectCoverage: false
};
