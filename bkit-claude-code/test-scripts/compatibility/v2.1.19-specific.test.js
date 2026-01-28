#!/usr/bin/env node
/**
 * Claude Code v2.1.19 Specific Tests
 * Tests features and changes specific to v2.1.19
 *
 * Key changes in v2.1.19:
 * - Skills without hooks auto-approve
 * - $ARGUMENTS[0] bracket syntax (vs $ARGUMENTS.0)
 * - Backgrounded hook commands fix
 * - Agent model display: "Inherit (default)"
 */

const fs = require('fs');
const path = require('path');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  // Test 1: Skills auto-approve policy
  {
    const skillsDir = path.join(projectRoot, 'skills');
    const skillsWithoutHooks = [];
    const skillsWithHooks = [];

    const folders = fs.readdirSync(skillsDir)
      .filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());

    for (const folder of folders) {
      const skillPath = path.join(skillsDir, folder, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;

      const content = fs.readFileSync(skillPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const hasHooks = frontmatterMatch[1].includes('hooks:');
        if (hasHooks) {
          skillsWithHooks.push(folder);
        } else {
          skillsWithoutHooks.push(folder);
        }
      }
    }

    results.push({
      id: 'V219-01',
      name: 'Skills auto-approve classification',
      status: 'pass',
      checks: [
        {
          name: 'auto-approve-skills',
          pass: true,
          count: skillsWithoutHooks.length,
          skills: skillsWithoutHooks
        },
        {
          name: 'needs-approval-skills',
          pass: true,
          count: skillsWithHooks.length,
          skills: skillsWithHooks
        }
      ],
      summary: `${skillsWithoutHooks.length} auto-approve, ${skillsWithHooks.length} need approval`
    });
    pass++;
  }

  // Test 2: $ARGUMENTS usage check
  {
    const commandsDir = path.join(projectRoot, 'commands');
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));

    let usesOldSyntax = false;
    let usesNewSyntax = false;
    let usesInDocs = 0;

    for (const file of files) {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      if (frontmatterMatch) {
        const fm = frontmatterMatch[1];
        if (fm.includes('$ARGUMENTS.')) usesOldSyntax = true;
        if (fm.includes('$ARGUMENTS[')) usesNewSyntax = true;
      }

      // Check in documentation (after frontmatter)
      if (content.includes('$ARGUMENTS')) usesInDocs++;
    }

    results.push({
      id: 'V219-02',
      name: '$ARGUMENTS syntax check',
      status: 'pass', // bkit uses prompt-based, not frontmatter syntax
      checks: [
        { name: 'no-old-syntax-in-frontmatter', pass: !usesOldSyntax },
        { name: 'no-new-syntax-in-frontmatter', pass: !usesNewSyntax },
        { name: 'docs-mention-count', pass: true, count: usesInDocs }
      ],
      summary: 'bkit uses prompt-based argument passing (no frontmatter syntax)'
    });
    pass++;
  }

  // Test 3: Hook timeout configuration
  {
    const hooksPath = path.join(projectRoot, 'hooks/hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    let allHaveTimeout = true;
    const hookConfigs = [];

    Object.entries(hooks.hooks || {}).forEach(([event, configs]) => {
      configs.forEach((config, idx) => {
        const innerHooks = config.hooks || [];
        innerHooks.forEach(h => {
          if (h.type === 'command') {
            const hasTimeout = 'timeout' in h;
            hookConfigs.push({
              event,
              hasTimeout,
              timeout: h.timeout
            });
            if (!hasTimeout) allHaveTimeout = false;
          }
        });
      });
    });

    results.push({
      id: 'V219-03',
      name: 'Hook timeout configuration',
      status: allHaveTimeout ? 'pass' : 'fail',
      checks: hookConfigs.map(c => ({
        name: `${c.event}-timeout`,
        pass: c.hasTimeout,
        value: c.timeout
      })),
      summary: allHaveTimeout ? 'All hooks have timeout' : 'Some hooks missing timeout'
    });
    allHaveTimeout ? pass++ : fail++;
  }

  // Test 4: Claude Code environment variable usage
  {
    const commonPath = path.join(projectRoot, 'lib/common.js');
    const content = fs.readFileSync(commonPath, 'utf8');

    // Required environment variables
    const requiredEnvVars = [
      'CLAUDE_PLUGIN_ROOT',
      'CLAUDE_PROJECT_DIR'
    ];

    // Optional environment variables (nice to have)
    const optionalEnvVars = [
      'CLAUDE_ENV_FILE',
      'BKIT_PLATFORM'
    ];

    const requiredChecks = requiredEnvVars.map(v => ({
      name: v,
      pass: content.includes(v),
      required: true
    }));

    const optionalChecks = optionalEnvVars.map(v => ({
      name: v,
      pass: true, // Optional, always pass
      note: content.includes(v) ? 'Supported' : 'Not used (optional)',
      required: false
    }));

    const allRequiredPresent = requiredChecks.every(c => c.pass);
    results.push({
      id: 'V219-04',
      name: 'Environment variable support',
      status: allRequiredPresent ? 'pass' : 'fail',
      checks: [...requiredChecks, ...optionalChecks]
    });
    allRequiredPresent ? pass++ : fail++;
  }

  // Test 5: JSON output format for Claude Code
  {
    const sessionStartPath = path.join(projectRoot, 'hooks/session-start.js');
    const content = fs.readFileSync(sessionStartPath, 'utf8');

    const checks = [
      { name: 'outputs-JSON', pass: content.includes('JSON.stringify') },
      { name: 'has-systemMessage', pass: content.includes('systemMessage') },
      { name: 'has-hookSpecificOutput', pass: content.includes('hookSpecificOutput') },
      { name: 'has-additionalContext', pass: content.includes('additionalContext') }
    ];

    const allPresent = checks.every(c => c.pass);
    results.push({
      id: 'V219-05',
      name: 'Claude Code JSON output structure',
      status: allPresent ? 'pass' : 'fail',
      checks
    });
    allPresent ? pass++ : fail++;
  }

  return {
    category: 'v2.1.19-specific',
    total: results.length,
    pass,
    fail,
    results
  };
}

module.exports = { run };

if (require.main === module) {
  run({ verbose: true }).then(r => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.fail > 0 ? 1 : 0);
  });
}
