#!/usr/bin/env node
/**
 * verify-hooks.js - Hook Execution Verification Script (v1.4.0)
 *
 * Purpose: Verify that all bkit hooks execute correctly and produce expected results
 * Tests: Debug logging, PDCA status management, hook output, dual platform support
 *
 * Usage: node test-scripts/verify-hooks.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Test configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEBUG_LOG_PATH = process.platform === 'win32'
  ? path.join(process.env.TEMP || 'C:\\Temp', 'bkit-hook-debug.log')
  : '/tmp/bkit-hook-debug.log';
const PDCA_STATUS_PATH = path.join(PROJECT_ROOT, 'docs/.pdca-status.json');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logResult(testName, passed, detail = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${testName}${detail ? ': ' + detail : ''}`, color);
  return passed;
}

// Clear debug log before tests
function clearDebugLog() {
  try {
    if (fs.existsSync(DEBUG_LOG_PATH)) {
      fs.unlinkSync(DEBUG_LOG_PATH);
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Read debug log contents
function readDebugLog() {
  try {
    if (fs.existsSync(DEBUG_LOG_PATH)) {
      return fs.readFileSync(DEBUG_LOG_PATH, 'utf8');
    }
    return '';
  } catch (e) {
    return '';
  }
}

// Run a hook script with specified environment and input
function runHook(scriptPath, env = {}, input = '{}') {
  return spawnSync('node', [scriptPath], {
    cwd: PROJECT_ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    input: input
  });
}

// ============================================================
// Test Cases
// ============================================================

function testDebugLogging() {
  log('\n📋 Test 1: Debug Logging System', 'cyan');

  clearDebugLog();

  // Run session-start.js
  runHook('hooks/session-start.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  });

  const logContent = readDebugLog();
  const hasSessionStartLog = logContent.includes('[SessionStart]');

  return logResult('Debug log created with SessionStart entry', hasSessionStartLog,
    hasSessionStartLog ? 'Found SessionStart log entry' : 'No SessionStart entry found');
}

function testPreWriteHook() {
  log('\n📋 Test 2: PreToolUse Hook (pre-write.js)', 'cyan');

  clearDebugLog();

  const testInput = JSON.stringify({
    tool_name: 'Write',
    tool_input: {
      file_path: '/test/src/features/auth/login.ts',
      content: 'export function login() {\n  // implementation\n}\n'
    }
  });

  runHook('scripts/pre-write.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  }, testInput);

  const logContent = readDebugLog();

  const passed = logContent.includes('[PreToolUse]') && logContent.includes('Hook started');
  return logResult('PreToolUse hook logs execution', passed,
    passed ? 'Found PreToolUse log entry' : 'No PreToolUse entry found');
}

function testPostWriteHook() {
  log('\n📋 Test 3: PostToolUse Hook (pdca-post-write.js)', 'cyan');

  clearDebugLog();

  const testInput = JSON.stringify({
    tool_name: 'Write',
    tool_input: {
      file_path: '/test/src/features/auth/login.ts'
    }
  });

  runHook('scripts/pdca-post-write.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  }, testInput);

  const logContent = readDebugLog();

  const passed = logContent.includes('[PostToolUse]');
  return logResult('PostToolUse hook logs execution', passed,
    passed ? 'Found PostToolUse log entry' : 'No PostToolUse entry found');
}

function testGapDetectorStopHook() {
  log('\n📋 Test 4: gap-detector Stop Hook', 'cyan');

  clearDebugLog();

  const testInput = JSON.stringify({
    output: 'Gap Analysis Result:\nOverall Match Rate: 85%\nFeature: hooks-reliability'
  });

  runHook('scripts/gap-detector-stop.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  }, testInput);

  const logContent = readDebugLog();

  const hasStopLog = logContent.includes('[Agent:gap-detector:Stop]');
  const hasMatchRate = logContent.includes('matchRate');

  const passed = hasStopLog && hasMatchRate;
  return logResult('gap-detector-stop.js logs execution with matchRate', passed,
    passed ? 'Found stop hook log with matchRate' : 'Missing expected log entries');
}

function testIteratorStopHook() {
  log('\n📋 Test 5: pdca-iterator Stop Hook', 'cyan');

  clearDebugLog();

  const testInput = JSON.stringify({
    output: 'Iteration completed. Match Rate improved to 92%.'
  });

  runHook('scripts/iterator-stop.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  }, testInput);

  const logContent = readDebugLog();

  const hasStopLog = logContent.includes('[Agent:pdca-iterator:Stop]');
  const passed = hasStopLog;
  return logResult('iterator-stop.js logs execution', passed,
    passed ? 'Found iterator stop hook log' : 'Missing expected log entries');
}

function testPdcaStatusCreation() {
  log('\n📋 Test 6: PDCA Status File Creation', 'cyan');

  // Backup existing status if present
  let backup = null;
  if (fs.existsSync(PDCA_STATUS_PATH)) {
    backup = fs.readFileSync(PDCA_STATUS_PATH, 'utf8');
    fs.unlinkSync(PDCA_STATUS_PATH);
  }

  // Run session-start which should create status file
  runHook('hooks/session-start.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  });

  const created = fs.existsSync(PDCA_STATUS_PATH);

  // Restore backup if existed
  if (backup) {
    fs.writeFileSync(PDCA_STATUS_PATH, backup);
  }

  return logResult('PDCA status file created by SessionStart', created,
    created ? 'Status file created successfully' : 'Status file not created');
}

function testPdcaStatusUpdate() {
  log('\n📋 Test 7: PDCA Status Update', 'cyan');

  // First ensure status file exists
  runHook('hooks/session-start.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  });

  // Then run pre-write which should update status
  const testInput = JSON.stringify({
    tool_name: 'Write',
    tool_input: {
      file_path: '/project/src/features/test-feature/index.ts',
      content: 'export const test = true;'
    }
  });

  runHook('scripts/pre-write.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  }, testInput);

  // Check if status was updated
  let updated = false;
  try {
    if (fs.existsSync(PDCA_STATUS_PATH)) {
      const status = JSON.parse(fs.readFileSync(PDCA_STATUS_PATH, 'utf8'));
      updated = status.currentFeature !== null || Object.keys(status.features).length > 0;
    }
  } catch (e) {
    // Ignore
  }

  return logResult('PDCA status updated by PreToolUse', updated,
    updated ? 'Status contains feature data' : 'Status not updated');
}

function testClaudeCodeOutput() {
  log('\n📋 Test 8: Claude Code JSON Output', 'cyan');

  const result = runHook('hooks/session-start.js', {
    BKIT_PLATFORM: 'claude',
    CLAUDE_PLUGIN_ROOT: PROJECT_ROOT,
    CLAUDE_PROJECT_DIR: PROJECT_ROOT
  });

  let isValidJson = false;
  try {
    const json = JSON.parse(result.stdout);
    isValidJson = json.systemMessage && json.hookSpecificOutput;
  } catch (e) {
    // Not valid JSON
  }

  return logResult('Claude Code produces valid JSON output', isValidJson,
    isValidJson ? 'JSON output with required fields' : 'Invalid or missing JSON fields');
}

function testGeminiCliOutput() {
  log('\n📋 Test 9: Gemini CLI Plain Text Output', 'cyan');

  const result = runHook('hooks/session-start.js', {
    BKIT_PLATFORM: 'gemini',
    GEMINI_PROJECT_DIR: PROJECT_ROOT,
    GEMINI_EXTENSION_PATH: PROJECT_ROOT
  });

  const isPlainText = !result.stdout.trim().startsWith('{') &&
    result.stdout.includes('Gemini Edition');

  return logResult('Gemini CLI produces plain text output', isPlainText,
    isPlainText ? 'Plain text with Gemini message' : 'Output format incorrect');
}

function testOutputAllowGemini() {
  log('\n📋 Test 10: outputAllow on Gemini CLI', 'cyan');

  const testInput = JSON.stringify({
    tool_name: 'Write',
    tool_input: {
      file_path: '/test/src/features/auth/login.ts',
      content: 'export function login() {}\n'.repeat(50) // 50 lines to trigger guidance
    }
  });

  const result = runHook('scripts/pre-write.js', {
    BKIT_PLATFORM: 'gemini',
    GEMINI_PROJECT_DIR: PROJECT_ROOT,
    GEMINI_EXTENSION_PATH: PROJECT_ROOT
  }, testInput);

  // Should NOT contain Claude JSON structure
  const notClaudeJson = !result.stdout.includes('"decision"');

  return logResult('outputAllow does not output Claude JSON on Gemini', notClaudeJson,
    notClaudeJson ? 'Correct format for Gemini' : 'Contains Claude JSON structure');
}

// ============================================================
// Run All Tests
// ============================================================

function runAllTests() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('   bkit Hook Verification Tests (v1.4.0)', 'cyan');
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log(`Debug Log Path: ${DEBUG_LOG_PATH}`, 'dim');
  log(`PDCA Status Path: ${PDCA_STATUS_PATH}`, 'dim');

  const results = [];

  results.push(testDebugLogging());
  results.push(testPreWriteHook());
  results.push(testPostWriteHook());
  results.push(testGapDetectorStopHook());
  results.push(testIteratorStopHook());
  results.push(testPdcaStatusCreation());
  results.push(testPdcaStatusUpdate());
  results.push(testClaudeCodeOutput());
  results.push(testGeminiCliOutput());
  results.push(testOutputAllowGemini());

  const passed = results.filter(r => r).length;
  const total = results.length;

  log('\n═══════════════════════════════════════════════════════════', 'cyan');
  if (passed === total) {
    log(`   ✅ All tests passed: ${passed}/${total}`, 'green');
  } else {
    log(`   ⚠️ Results: ${passed}/${total} tests passed`, 'yellow');
  }
  log('═══════════════════════════════════════════════════════════', 'cyan');

  // Show debug log preview
  log('\n📄 Debug Log Preview (last 10 lines):', 'cyan');
  const logContent = readDebugLog();
  if (logContent) {
    const lines = logContent.split('\n').filter(l => l.trim()).slice(-10);
    lines.forEach(line => log(`   ${line}`, 'dim'));
  } else {
    log('   (empty)', 'yellow');
  }

  return passed === total;
}

// Run tests
const success = runAllTests();
process.exit(success ? 0 : 1);
