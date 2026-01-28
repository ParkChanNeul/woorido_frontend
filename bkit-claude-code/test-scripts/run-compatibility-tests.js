#!/usr/bin/env node
/**
 * Claude Code 2.1.19 호환성 테스트 실행기
 * bkit v1.4.0 전체 코드베이스 검증
 *
 * Usage:
 *   node test-scripts/run-compatibility-tests.js              # 전체 테스트
 *   node test-scripts/run-compatibility-tests.js --phase1     # Critical만
 *   node test-scripts/run-compatibility-tests.js --phase2     # High만
 *   node test-scripts/run-compatibility-tests.js --verbose    # 상세 출력
 *   node test-scripts/run-compatibility-tests.js --json       # JSON 결과 출력
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const phase1Only = args.includes('--phase1');
const phase2Only = args.includes('--phase2');
const phase3Only = args.includes('--phase3');
const phase4Only = args.includes('--phase4');
const verbose = args.includes('--verbose');
const jsonOutput = args.includes('--json');

const hasPhaseFilter = phase1Only || phase2Only || phase3Only || phase4Only;

const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPAT_DIR = path.join(__dirname, 'compatibility');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  if (!jsonOutput) {
    console.log(`${colors[color]}${msg}${colors.reset}`);
  }
}

// ============================================================
// Test Runners
// ============================================================

async function runTestFile(filePath, label) {
  try {
    delete require.cache[require.resolve(filePath)];
    const testModule = require(filePath);
    return await testModule.run({ verbose, projectRoot: PROJECT_ROOT });
  } catch (e) {
    return {
      category: label,
      total: 1,
      pass: 0,
      fail: 1,
      results: [{
        id: 'LOAD',
        name: `Load ${label}`,
        status: 'fail',
        error: e.message
      }]
    };
  }
}

// ============================================================
// Main Execution
// ============================================================

async function runAllTests() {
  const startTime = Date.now();
  const allResults = {
    startTime: new Date().toISOString(),
    claudeCodeVersion: '2.1.19',
    bkitVersion: '1.4.0',
    summary: { total: 0, pass: 0, fail: 0, skip: 0 },
    phases: {},
    categories: {}
  };

  log('');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  Claude Code 2.1.19 Compatibility Tests', 'bold');
  log('  bkit Vibecoding Kit v1.4.0', 'dim');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log(`  Started: ${new Date().toLocaleTimeString()}`, 'dim');
  log('');

  // Phase 1: Critical (Hooks, Commands, Library)
  if (!hasPhaseFilter || phase1Only) {
    log('📌 Phase 1: Critical Tests', 'yellow');
    log('───────────────────────────────────────────────────────────────');

    const phase1Results = [];

    // Hooks
    const hooksResult = await runTestFile(
      path.join(COMPAT_DIR, 'hooks.test.js'),
      'hooks'
    );
    phase1Results.push(hooksResult);
    log(`  Hooks: ${hooksResult.pass}/${hooksResult.total} passed`);

    // Commands
    const commandsResult = await runTestFile(
      path.join(COMPAT_DIR, 'commands.test.js'),
      'commands'
    );
    phase1Results.push(commandsResult);
    log(`  Commands: ${commandsResult.pass}/${commandsResult.total} passed`);

    // Library
    const libraryResult = await runTestFile(
      path.join(COMPAT_DIR, 'library.test.js'),
      'library'
    );
    phase1Results.push(libraryResult);
    log(`  Library: ${libraryResult.pass}/${libraryResult.total} passed`);

    allResults.phases.phase1 = phase1Results;
    phase1Results.forEach(r => {
      allResults.categories[r.category] = r;
      allResults.summary.total += r.total;
      allResults.summary.pass += r.pass;
      allResults.summary.fail += r.fail;
    });
    log('');
  }

  // Phase 2: High (Skills, Scripts)
  if (!hasPhaseFilter || phase2Only) {
    log('📌 Phase 2: High Priority Tests', 'yellow');
    log('───────────────────────────────────────────────────────────────');

    const phase2Results = [];

    // Skills
    const skillsResult = await runTestFile(
      path.join(COMPAT_DIR, 'skills.test.js'),
      'skills'
    );
    phase2Results.push(skillsResult);
    log(`  Skills: ${skillsResult.pass}/${skillsResult.total} passed`);

    // Scripts
    const scriptsResult = await runTestFile(
      path.join(COMPAT_DIR, 'scripts.test.js'),
      'scripts'
    );
    phase2Results.push(scriptsResult);
    log(`  Scripts: ${scriptsResult.pass}/${scriptsResult.total} passed`);

    allResults.phases.phase2 = phase2Results;
    phase2Results.forEach(r => {
      allResults.categories[r.category] = r;
      allResults.summary.total += r.total;
      allResults.summary.pass += r.pass;
      allResults.summary.fail += r.fail;
    });
    log('');
  }

  // Phase 3: Medium (Agents, Templates)
  if (!hasPhaseFilter || phase3Only) {
    log('📌 Phase 3: Medium Priority Tests', 'yellow');
    log('───────────────────────────────────────────────────────────────');

    const phase3Results = [];

    // Agents
    const agentsResult = await runTestFile(
      path.join(COMPAT_DIR, 'agents.test.js'),
      'agents'
    );
    phase3Results.push(agentsResult);
    log(`  Agents: ${agentsResult.pass}/${agentsResult.total} passed`);

    // Templates
    const templatesResult = await runTestFile(
      path.join(COMPAT_DIR, 'templates.test.js'),
      'templates'
    );
    phase3Results.push(templatesResult);
    log(`  Templates: ${templatesResult.pass}/${templatesResult.total} passed`);

    allResults.phases.phase3 = phase3Results;
    phase3Results.forEach(r => {
      allResults.categories[r.category] = r;
      allResults.summary.total += r.total;
      allResults.summary.pass += r.pass;
      allResults.summary.fail += r.fail;
    });
    log('');
  }

  // Phase 4: v2.1.19 Specific Tests
  if (!hasPhaseFilter || phase4Only) {
    log('📌 Phase 4: v2.1.19 Specific Tests', 'yellow');
    log('───────────────────────────────────────────────────────────────');

    const phase4Results = [];

    // v2.1.19 specific
    const v219Result = await runTestFile(
      path.join(COMPAT_DIR, 'v2.1.19-specific.test.js'),
      'v2.1.19-specific'
    );
    phase4Results.push(v219Result);
    log(`  v2.1.19 Specific: ${v219Result.pass}/${v219Result.total} passed`);

    allResults.phases.phase4 = phase4Results;
    phase4Results.forEach(r => {
      allResults.categories[r.category] = r;
      allResults.summary.total += r.total;
      allResults.summary.pass += r.pass;
      allResults.summary.fail += r.fail;
    });
    log('');
  }

  // Summary
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passRate = allResults.summary.total > 0
    ? ((allResults.summary.pass / allResults.summary.total) * 100).toFixed(1)
    : 0;

  allResults.endTime = new Date().toISOString();
  allResults.duration = duration;
  allResults.passRate = parseFloat(passRate);

  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('  Test Results Summary', 'bold');
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log(`  Total:     ${allResults.summary.total}`, 'dim');
  log(`  ✅ Passed:  ${allResults.summary.pass}`, 'green');
  log(`  ❌ Failed:  ${allResults.summary.fail}`, allResults.summary.fail > 0 ? 'red' : 'dim');
  log(`  📊 Rate:    ${passRate}%`, passRate >= 98 ? 'green' : 'yellow');
  log(`  ⏱️  Duration: ${duration}s`, 'dim');
  log('───────────────────────────────────────────────────────────────');

  // Failed tests detail
  if (verbose || allResults.summary.fail > 0) {
    const failedTests = [];
    Object.values(allResults.categories).forEach(cat => {
      cat.results?.filter(r => r.status === 'fail').forEach(r => {
        failedTests.push({ category: cat.category, ...r });
      });
    });

    if (failedTests.length > 0) {
      log('\n📋 Failed Tests:', 'red');
      failedTests.forEach(t => {
        log(`  • [${t.category}] ${t.id}: ${t.name}`, 'red');
        if (verbose && t.error) {
          log(`    Error: ${t.error}`, 'dim');
        }
      });
    }
  }

  // Compatibility verdict
  log('');
  if (allResults.summary.fail === 0) {
    log('✅ VERDICT: bkit v1.4.0 is FULLY COMPATIBLE with Claude Code 2.1.19', 'green');
  } else if (passRate >= 95) {
    log('⚠️ VERDICT: Minor issues detected, mostly compatible', 'yellow');
  } else {
    log('❌ VERDICT: Compatibility issues detected', 'red');
  }
  log('');

  // Save results
  const resultsPath = path.join(PROJECT_ROOT, 'docs/03-analysis/compatibility-test-results.json');
  try {
    fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
    fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
    log(`📄 Results saved to: ${resultsPath}`, 'dim');
  } catch (e) {
    log(`⚠️ Could not save results: ${e.message}`, 'yellow');
  }

  // JSON output mode
  if (jsonOutput) {
    console.log(JSON.stringify(allResults, null, 2));
  }

  return allResults.summary.fail === 0;
}

// Run
runAllTests()
  .then(success => process.exit(success ? 0 : 1))
  .catch(e => {
    console.error('Runner error:', e);
    process.exit(1);
  });
