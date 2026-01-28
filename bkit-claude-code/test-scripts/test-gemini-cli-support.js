#!/usr/bin/env node
/**
 * Gemini CLI Support Test Suite
 * Tests all FRs from the design document
 *
 * Usage: node scripts/test-gemini-cli-support.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

let PASS = 0;
let FAIL = 0;
const results = [];

function test(id, description, testFn) {
  process.stdout.write(`[${id}] ${description}... `);
  try {
    const result = testFn();
    if (result === true) {
      console.log('\x1b[32mPASS\x1b[0m');
      PASS++;
      results.push({ id, description, status: 'PASS' });
    } else {
      console.log('\x1b[31mFAIL\x1b[0m');
      console.log(`  Result: ${result}`);
      FAIL++;
      results.push({ id, description, status: 'FAIL', error: result });
    }
  } catch (e) {
    console.log('\x1b[31mFAIL\x1b[0m');
    console.log(`  Error: ${e.message}`);
    FAIL++;
    results.push({ id, description, status: 'FAIL', error: e.message });
  }
}

function runNode(code, env = {}) {
  const result = spawnSync('node', ['-e', code], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    cwd: ROOT
  });
  return (result.stdout || '').trim();
}

function runScript(script, input = '', env = {}) {
  const result = spawnSync('node', [script], {
    encoding: 'utf8',
    input: input,
    env: { ...process.env, ...env },
    cwd: ROOT
  });
  return (result.stdout || '').trim();
}

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Gemini CLI Support Test Suite v1.4.0                   ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// ============================================================
// Unit Tests
// ============================================================
console.log('\x1b[36m━━━ Unit Tests ━━━\x1b[0m');

// U-01: gemini-extension.json 스키마 검증
test('U-01', 'gemini-extension.json schema validation', () => {
  const json = require(path.join(ROOT, 'gemini-extension.json'));
  return json.name === 'bkit' &&
         json.version === '1.4.0' &&
         !!json.repository &&
         !!json.engines &&
         !!json.context &&
         !!json.commands &&
         !!json.hooks &&
         !!json.skills;
});

// U-02: TOML 명령어 파일 존재 확인
test('U-02', '20 TOML command files exist', () => {
  const tomlDir = path.join(ROOT, 'commands/gemini');
  const files = fs.readdirSync(tomlDir).filter(f => f.endsWith('.toml'));
  return files.length === 20;
});

// U-03: TOML 문법 검증
test('U-03', 'TOML files have required fields', () => {
  const tomlDir = path.join(ROOT, 'commands/gemini');
  const files = fs.readdirSync(tomlDir).filter(f => f.endsWith('.toml'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(tomlDir, file), 'utf8');
    if (!content.includes('description =') || !content.includes('prompt =')) {
      return `${file} missing required fields`;
    }
  }
  return true;
});

// U-04: detectPlatform() - Claude 환경
test('U-04', 'detectPlatform() returns "claude" for Claude env', () => {
  const result = runNode(
    "console.log(require('./lib/common.js').detectPlatform())",
    { CLAUDE_PLUGIN_ROOT: '/tmp', GEMINI_PROJECT_DIR: '', GEMINI_SESSION_ID: '', GEMINI_EXTENSION_PATH: '' }
  );
  return result === 'claude';
});

// U-05: detectPlatform() - Gemini 환경
test('U-05', 'detectPlatform() returns "gemini" for Gemini env', () => {
  const result = runNode(
    "console.log(require('./lib/common.js').detectPlatform())",
    { GEMINI_PROJECT_DIR: '/tmp', CLAUDE_PLUGIN_ROOT: '', CLAUDE_PROJECT_DIR: '' }
  );
  return result === 'gemini';
});

// U-06: isGeminiCli() / isClaudeCode()
test('U-06', 'isGeminiCli() / isClaudeCode() work correctly', () => {
  const geminiResult = runNode(
    "const c=require('./lib/common.js'); console.log(c.isGeminiCli(), c.isClaudeCode())",
    { BKIT_PLATFORM: 'gemini' }
  );
  const claudeResult = runNode(
    "const c=require('./lib/common.js'); console.log(c.isGeminiCli(), c.isClaudeCode())",
    { BKIT_PLATFORM: 'claude' }
  );
  return geminiResult === 'true false' && claudeResult === 'false true';
});

// U-07: getTemplatePath()
test('U-07', 'getTemplatePath() returns correct path', () => {
  const result = runNode("console.log(require('./lib/common.js').getTemplatePath('plan'))");
  return result.includes('templates') && result.includes('plan.template.md');
});

// U-08: detectLevel() - CLAUDE.md 인식
test('U-08', 'detectLevel() reads CLAUDE.md', () => {
  const testDir = '/tmp/bkit-test-u08';
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, 'CLAUDE.md'), 'level: Enterprise\n');

  const result = runNode(
    "console.log(require('" + ROOT + "/lib/common.js').detectLevel())",
    { CLAUDE_PROJECT_DIR: testDir, GEMINI_PROJECT_DIR: '' }
  );

  fs.rmSync(testDir, { recursive: true });
  return result === 'Enterprise';
});

// U-09: detectLevel() - GEMINI.md 인식
test('U-09', 'detectLevel() reads GEMINI.md', () => {
  const testDir = '/tmp/bkit-test-u09';
  fs.mkdirSync(testDir, { recursive: true });
  fs.writeFileSync(path.join(testDir, 'GEMINI.md'), 'level: Dynamic\n');

  const result = runNode(
    "console.log(require('" + ROOT + "/lib/common.js').detectLevel())",
    { CLAUDE_PROJECT_DIR: testDir, GEMINI_PROJECT_DIR: testDir }
  );

  fs.rmSync(testDir, { recursive: true });
  return result === 'Dynamic';
});

// U-10: getPluginPath() / getProjectPath()
test('U-10', 'getPluginPath() / getProjectPath() work', () => {
  const result = runNode("const c=require('./lib/common.js'); console.log(c.getPluginPath('skills').includes('skills'), c.getProjectPath('docs').includes('docs'))");
  return result === 'true true';
});

// U-11: Node.js 스크립트 문법 검증
test('U-11', 'All JS scripts pass syntax check', () => {
  const scripts = [
    'lib/common.js',
    'hooks/session-start.js',
    'scripts/pre-write.js',
    'scripts/pdca-post-write.js'
  ];
  for (const script of scripts) {
    const result = spawnSync('node', ['--check', script], { cwd: ROOT });
    if (result.status !== 0) {
      return `${script} failed syntax check`;
    }
  }
  return true;
});

// U-12: 환경 변수 Fallback Chain
test('U-12', 'Environment variable fallback chain works', () => {
  const claudeFirst = runNode(
    "console.log(require('./lib/common.js').PLUGIN_ROOT)",
    { CLAUDE_PLUGIN_ROOT: '/claude', GEMINI_EXTENSION_PATH: '/gemini' }
  );
  const geminiFallback = runNode(
    "console.log(require('./lib/common.js').PLUGIN_ROOT)",
    { CLAUDE_PLUGIN_ROOT: '', GEMINI_EXTENSION_PATH: '/gemini' }
  );
  return claudeFirst === '/claude' && geminiFallback === '/gemini';
});

console.log('');

// ============================================================
// Integration Tests
// ============================================================
console.log('\x1b[36m━━━ Integration Tests ━━━\x1b[0m');

// I-01: SessionStart 훅 - Claude 환경
test('I-01', 'SessionStart hook - Claude environment', () => {
  const result = runScript(
    'hooks/session-start.js',
    '',
    { CLAUDE_PLUGIN_ROOT: ROOT, BKIT_PLATFORM: 'claude' }
  );
  return result.includes('Claude Code') && result.includes('v1.4.0');
});

// I-02: SessionStart 훅 - Gemini 환경
test('I-02', 'SessionStart hook - Gemini environment', () => {
  const result = runScript(
    'hooks/session-start.js',
    '',
    { GEMINI_PROJECT_DIR: ROOT, BKIT_PLATFORM: 'gemini' }
  );
  return result.includes('Gemini Edition') && result.includes('v1.4.0');
});

// I-03: BeforeTool 훅 (pre-write.js)
test('I-03', 'BeforeTool hook (pre-write.js) executes', () => {
  const input = JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: 'src/test.ts', content: 'const x = 1;' }
  });
  const result = runScript('scripts/pre-write.js', input);
  return result === '{}' || result.startsWith('{');
});

// I-04: AfterTool 훅 (pdca-post-write.js)
test('I-04', 'AfterTool hook (pdca-post-write.js) executes', () => {
  const input = JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: 'src/features/login/index.ts' }
  });
  const result = runScript('scripts/pdca-post-write.js', input);
  return result === '{}' || result.startsWith('{');
});

// I-05: Skills autoActivate 설정 확인
test('I-05', 'autoActivate skills directories exist', () => {
  const json = require(path.join(ROOT, 'gemini-extension.json'));
  const skills = json.skills.autoActivate;
  for (const skill of skills) {
    if (!fs.existsSync(path.join(ROOT, 'skills', skill))) {
      return `Skill ${skill} not found`;
    }
  }
  return true;
});

// I-06: TOML 명령어 필수 필드 확인
test('I-06', 'TOML commands have description and prompt', () => {
  const tomlDir = path.join(ROOT, 'commands/gemini');
  const files = fs.readdirSync(tomlDir).filter(f => f.endsWith('.toml'));
  let valid = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(tomlDir, file), 'utf8');
    if (content.includes('description') && content.includes('prompt')) {
      valid++;
    }
  }
  return valid === 20;
});

// I-07: 다국어 트리거 키워드 확인
test('I-07', 'Multilingual triggers exist (EN, KO, JA, ZH)', () => {
  const agentDir = path.join(ROOT, 'agents');
  const files = fs.readdirSync(agentDir).filter(f => f.endsWith('.md'));
  let hasKorean = false, hasJapanese = false, hasChinese = false;

  for (const file of files) {
    const content = fs.readFileSync(path.join(agentDir, file), 'utf8');
    if (/[가-힣]/.test(content)) hasKorean = true;
    if (/[ぁ-んァ-ン]/.test(content)) hasJapanese = true;
    if (/[\u4e00-\u9fff]/.test(content)) hasChinese = true;
  }

  return hasKorean && hasJapanese && hasChinese;
});

// I-08: 템플릿 파일 존재 확인
test('I-08', 'PDCA template files exist', () => {
  const templates = ['plan', 'design', 'analysis', 'report'];
  for (const t of templates) {
    const p = path.join(ROOT, 'templates', `${t}.template.md`);
    if (!fs.existsSync(p)) {
      return `Template ${t} not found`;
    }
  }
  return true;
});

console.log('');

// ============================================================
// Regression Tests
// ============================================================
console.log('\x1b[36m━━━ Regression Tests ━━━\x1b[0m');

// R-01: Claude Code 환경 변수 유지
test('R-01', 'Claude env vars still work', () => {
  const result = runNode(
    "const c=require('./lib/common.js'); console.log(c.PLUGIN_ROOT, c.PROJECT_DIR)",
    { CLAUDE_PLUGIN_ROOT: '/test-plugin', CLAUDE_PROJECT_DIR: '/test-project' }
  );
  return result.includes('/test-plugin') && result.includes('/test-project');
});

// R-02: 기존 함수 export 유지
test('R-02', 'Legacy exports preserved', () => {
  const exports = runNode("console.log(Object.keys(require('./lib/common.js')).join(','))");
  const required = [
    'isSourceFile', 'isCodeFile', 'extractFeature',
    'findDesignDoc', 'findPlanDoc', 'classifyTask',
    'getPdcaLevel', 'detectLevel', 'outputAllow', 'outputBlock'
  ];
  for (const fn of required) {
    if (!exports.includes(fn)) {
      return `Missing export: ${fn}`;
    }
  }
  return true;
});

// R-03: hooks.json 구조 유지
test('R-03', 'hooks.json structure preserved', () => {
  const hooks = require(path.join(ROOT, 'hooks/hooks.json'));
  return !!hooks.hooks &&
         !!hooks.hooks.SessionStart &&
         !!hooks.hooks.PreToolUse &&
         !!hooks.hooks.PostToolUse;
});

// R-04: 기존 Markdown 명령어 유지
test('R-04', 'Markdown command files preserved', () => {
  const cmdDir = path.join(ROOT, 'commands');
  const mdFiles = fs.readdirSync(cmdDir).filter(f => f.endsWith('.md'));
  return mdFiles.length >= 20;
});

console.log('');

// ============================================================
// Summary
// ============================================================
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                      TEST RESULTS                          ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║  \x1b[32mPASS: ${PASS.toString().padStart(2)}\x1b[0m                                                   ║`);
console.log(`║  \x1b[31mFAIL: ${FAIL.toString().padStart(2)}\x1b[0m                                                   ║`);
console.log(`║  TOTAL: ${(PASS + FAIL).toString().padStart(2)}                                                 ║`);
console.log('╠════════════════════════════════════════════════════════════╣');

if (FAIL === 0) {
  console.log('║  \x1b[32m✓ ALL TESTS PASSED\x1b[0m                                        ║');
} else {
  console.log('║  \x1b[31m✗ SOME TESTS FAILED\x1b[0m                                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Failed Tests:                                             ║');
  for (const r of results.filter(r => r.status === 'FAIL')) {
    console.log(`║    - ${r.id}: ${r.description.substring(0, 45).padEnd(45)} ║`);
  }
}

console.log('╚════════════════════════════════════════════════════════════╝');

process.exit(FAIL > 0 ? 1 : 0);
