#!/usr/bin/env node

/**
 * bkit v1.4.0 전체 테스트 실행기
 *
 * Usage:
 *   node test-scripts/run-all.js              # 전체 테스트
 *   node test-scripts/run-all.js --unit       # 단위 테스트만
 *   node test-scripts/run-all.js --integration # 통합 테스트만
 *   node test-scripts/run-all.js --hooks      # Hook 테스트만
 *   node test-scripts/run-all.js --verbose    # 상세 출력
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const hasFilter = args.some(a => ['--unit', '--integration', '--hooks'].includes(a));
const runUnit = args.includes('--unit') || !hasFilter;
const runIntegration = args.includes('--integration') || !hasFilter;
const runHooks = args.includes('--hooks') || !hasFilter;
const verbose = args.includes('--verbose');

const TEST_DIR = __dirname;

async function loadAndRunTests(dir, label) {
  const stats = { passed: 0, failed: 0 };
  const results = [];

  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️ Directory not found: ${dir}`);
    return { stats, results };
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.js'));

  if (files.length === 0) {
    console.log(`  ⚠️ No test files found in ${label}`);
    return { stats, results };
  }

  for (const file of files) {
    try {
      // 캐시 클리어
      const filePath = path.join(dir, file);
      delete require.cache[require.resolve(filePath)];

      const runner = require(filePath);
      const { stats: s, results: r } = await runner.run();

      stats.passed += s.passed;
      stats.failed += s.failed;
      results.push(...r);
    } catch (e) {
      console.log(`  ❌ Error in ${file}: ${e.message}`);
      if (verbose) {
        console.log(`     Stack: ${e.stack}`);
      }
      stats.failed++;
      results.push({
        suite: file,
        test: 'load',
        status: 'failed',
        error: e.message
      });
    }
  }

  return { stats, results };
}

async function runAllTests() {
  const startTime = Date.now();
  const allStats = { passed: 0, failed: 0 };
  const allResults = [];

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  bkit v1.4.0 종합 테스트');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  시작: ${new Date().toLocaleTimeString()}`);
  console.log('───────────────────────────────────────────────────────────');

  if (runUnit) {
    console.log('\n📦 UNIT TESTS');
    console.log('───────────────────────────────────────────────────────────');
    const { stats, results } = await loadAndRunTests(
      path.join(TEST_DIR, 'unit'),
      'Unit'
    );
    allStats.passed += stats.passed;
    allStats.failed += stats.failed;
    allResults.push(...results);
  }

  if (runIntegration) {
    console.log('\n📦 INTEGRATION TESTS');
    console.log('───────────────────────────────────────────────────────────');
    const { stats, results } = await loadAndRunTests(
      path.join(TEST_DIR, 'integration'),
      'Integration'
    );
    allStats.passed += stats.passed;
    allStats.failed += stats.failed;
    allResults.push(...results);
  }

  if (runHooks) {
    console.log('\n📦 HOOK TESTS');
    console.log('───────────────────────────────────────────────────────────');
    const { stats, results } = await loadAndRunTests(
      path.join(TEST_DIR, 'hooks'),
      'Hooks'
    );
    allStats.passed += stats.passed;
    allStats.failed += stats.failed;
    allResults.push(...results);
  }

  // 결과 요약
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const total = allStats.passed + allStats.failed;
  const passRate = total > 0 ? ((allStats.passed / total) * 100).toFixed(1) : 0;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  테스트 결과');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  ✅ 성공: ${allStats.passed}`);
  console.log(`  ❌ 실패: ${allStats.failed}`);
  console.log(`  📊 통과율: ${passRate}%`);
  console.log(`  ⏱️  소요: ${duration}s`);
  console.log('───────────────────────────────────────────────────────────');

  // 실패한 테스트 상세
  const failed = allResults.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    console.log('\n📋 실패 목록:');
    failed.forEach(r => {
      console.log(`  • ${r.suite} > ${r.test}`);
      if (verbose && r.error) {
        console.log(`    Error: ${r.error}`);
      }
    });
  }

  console.log('');

  // 종료 코드
  process.exit(allStats.failed > 0 ? 1 : 0);
}

runAllTests().catch(e => {
  console.error('Runner error:', e);
  process.exit(1);
});
