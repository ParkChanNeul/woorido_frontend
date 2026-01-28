#!/usr/bin/env node
/**
 * Hooks Compatibility Tests
 * Tests: hooks.json schema, session-start.js execution
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  // H-01: hooks.json schema validation
  try {
    const hooksPath = path.join(projectRoot, 'hooks/hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checks = [
      { name: 'has-$schema', pass: !!hooks.$schema },
      { name: 'has-hooks-object', pass: typeof hooks.hooks === 'object' },
      { name: 'has-SessionStart', pass: Array.isArray(hooks.hooks?.SessionStart) },
      { name: 'has-PreToolUse', pass: Array.isArray(hooks.hooks?.PreToolUse) },
      { name: 'has-PostToolUse', pass: Array.isArray(hooks.hooks?.PostToolUse) },
    ];

    const allPassed = checks.every(c => c.pass);
    results.push({
      id: 'H-01',
      name: 'hooks.json schema validation',
      status: allPassed ? 'pass' : 'fail',
      checks
    });
    allPassed ? pass++ : fail++;
  } catch (e) {
    results.push({
      id: 'H-01',
      name: 'hooks.json schema validation',
      status: 'fail',
      error: e.message
    });
    fail++;
  }

  // H-02: session-start.js execution
  try {
    const result = spawnSync('node', ['hooks/session-start.js'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        CLAUDE_PLUGIN_ROOT: projectRoot,
        CLAUDE_PROJECT_DIR: projectRoot,
        BKIT_PLATFORM: 'claude'
      },
      encoding: 'utf8',
      timeout: 5000
    });

    const output = result.stdout.trim();
    let parsed = null;
    let checks = [];

    try {
      parsed = JSON.parse(output);
      checks = [
        { name: 'valid-json', pass: true },
        { name: 'has-systemMessage', pass: !!parsed.systemMessage },
        { name: 'has-hookSpecificOutput', pass: !!parsed.hookSpecificOutput },
        { name: 'has-additionalContext', pass: !!parsed.hookSpecificOutput?.additionalContext },
      ];
    } catch (e) {
      checks = [{ name: 'valid-json', pass: false, error: 'Invalid JSON output' }];
    }

    const allPassed = checks.every(c => c.pass);
    results.push({
      id: 'H-02',
      name: 'session-start.js execution',
      status: allPassed ? 'pass' : 'fail',
      checks
    });
    allPassed ? pass++ : fail++;
  } catch (e) {
    results.push({
      id: 'H-02',
      name: 'session-start.js execution',
      status: 'fail',
      error: e.message
    });
    fail++;
  }

  return {
    category: 'hooks',
    total: results.length,
    pass,
    fail,
    results
  };
}

module.exports = { run };

// Direct execution
if (require.main === module) {
  run({ verbose: true }).then(r => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.fail > 0 ? 1 : 0);
  });
}
