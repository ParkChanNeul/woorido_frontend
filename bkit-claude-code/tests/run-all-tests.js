#!/usr/bin/env node
/**
 * Test Runner for Context Engineering Enhancement v1.4.2
 * Runs all unit tests and generates summary report
 *
 * @version 1.4.2
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPORT_DIR = path.join(__dirname, '..', 'docs', '04-report', 'test-results');

// Test files to run - organized by category
const TEST_CATEGORIES = {
  'Unit Tests (lib/)': {
    dir: 'lib',
    files: [
      'context-hierarchy.test.js',
      'import-resolver.test.js',
      'context-fork.test.js',
      'permission-manager.test.js',
      'memory-store.test.js',
      'user-prompt-handler.test.js',
      'auto-create-task.test.js',
      'lazy-loading.test.js'
    ]
  },
  'Integration Tests': {
    dir: 'integration',
    files: [
      'session-start.integration.test.js'
    ]
  },
  'Regression Tests': {
    dir: 'regression',
    files: [
      'bkit-existing-features.test.js'
    ]
  }
};

// Results collection
const results = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    modules: []
  },
  details: []
};

console.log('\n' + '═'.repeat(70));
console.log('  Context Engineering Enhancement v1.4.2 - Test Suite');
console.log('═'.repeat(70) + '\n');

// Run tests by category
for (const [categoryName, category] of Object.entries(TEST_CATEGORIES)) {
  console.log(`\n${'▶'.repeat(3)} ${categoryName}`);
  console.log('━'.repeat(50));

  for (const testFile of category.files) {
    const testPath = path.join(__dirname, category.dir, testFile);

    if (!fs.existsSync(testPath)) {
      console.log(`⚠️  Skipping: ${testFile} (not found)`);
      continue;
    }

    console.log(`\n📋 Running: ${testFile}`);
    console.log('─'.repeat(50));

    try {
      // Use execFileSync for safer execution (no shell injection risk)
      const output = execFileSync('node', [testPath], {
        cwd: __dirname,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Parse JSON result from output
      const jsonMatch = output.match(/--- TEST_RESULTS_JSON ---\n([\s\S]+)$/);
      if (jsonMatch) {
        const testResult = JSON.parse(jsonMatch[1]);
        results.summary.total += testResult.total;
        results.summary.passed += testResult.passed;
        results.summary.failed += testResult.failed;
        results.summary.modules.push({
          module: testResult.module,
          fr: testResult.fr,
          passed: testResult.passed,
          failed: testResult.failed,
          total: testResult.total,
          category: categoryName
        });
        results.details.push(testResult);
      }

      // Print output (without JSON)
      const displayOutput = output.replace(/--- TEST_RESULTS_JSON ---[\s\S]+$/, '');
      console.log(displayOutput);

    } catch (error) {
      console.log(`❌ Test execution failed: ${testFile}`);
      console.log(error.stdout || error.message);

      // Try to parse partial results
      const stdout = error.stdout || '';
      const jsonMatch = stdout.match(/--- TEST_RESULTS_JSON ---\n([\s\S]+)$/);
      if (jsonMatch) {
        try {
          const testResult = JSON.parse(jsonMatch[1]);
          results.summary.total += testResult.total;
          results.summary.passed += testResult.passed;
          results.summary.failed += testResult.failed;
          results.summary.modules.push({
            module: testResult.module,
            fr: testResult.fr,
            passed: testResult.passed,
            failed: testResult.failed,
            total: testResult.total,
            category: categoryName,
            error: true
          });
          results.details.push(testResult);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }
}

// Calculate match rate
const matchRate = results.summary.total > 0
  ? Math.round((results.summary.passed / results.summary.total) * 100)
  : 0;

// Print final summary
console.log('\n' + '═'.repeat(70));
console.log('  TEST SUMMARY');
console.log('═'.repeat(70));
console.log(`\n  Total Tests:  ${results.summary.total}`);
console.log(`  Passed:       ${results.summary.passed} ✅`);
console.log(`  Failed:       ${results.summary.failed} ❌`);
console.log(`  Match Rate:   ${matchRate}%`);
console.log('\n  Module Results:');
console.log('  ─'.repeat(35));

for (const mod of results.summary.modules) {
  const status = mod.failed === 0 ? '✅' : '❌';
  const rate = Math.round((mod.passed / mod.total) * 100);
  console.log(`  ${status} ${mod.module.padEnd(40)} ${mod.passed}/${mod.total} (${rate}%)`);
}

console.log('\n' + '═'.repeat(70) + '\n');

// Save results to file
try {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const reportPath = path.join(REPORT_DIR, `test-results-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Results saved: ${reportPath}`);

  // Save latest results
  const latestPath = path.join(REPORT_DIR, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(results, null, 2));
  console.log(`📄 Latest results: ${latestPath}\n`);

} catch (e) {
  console.log(`⚠️  Could not save results: ${e.message}\n`);
}

// Exit with appropriate code
process.exit(results.summary.failed > 0 ? 1 : 0);
