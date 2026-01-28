#!/usr/bin/env node
/**
 * Commands Compatibility Tests
 * Tests: Frontmatter parsing, $ARGUMENTS usage
 */

const fs = require('fs');
const path = require('path');
const glob = require('path');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  const commandsDir = path.join(projectRoot, 'commands');
  const commandFiles = fs.readdirSync(commandsDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsDir, file);
    const commandName = file.replace('.md', '');

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Parse frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      const checks = [];

      // Check 1: Frontmatter exists
      if (frontmatterMatch) {
        checks.push({ name: 'has-frontmatter', pass: true });

        // Parse YAML-like frontmatter (simple parsing)
        const frontmatter = frontmatterMatch[1];
        const hasDescription = frontmatter.includes('description:');
        const hasAllowedTools = frontmatter.includes('allowed-tools:');

        checks.push({ name: 'has-description', pass: hasDescription });
        // allowed-tools is optional for commands
        checks.push({
          name: 'has-allowed-tools',
          pass: true, // Optional field
          note: hasAllowedTools ? 'Tools specified' : 'No tools restriction'
        });
      } else {
        checks.push({ name: 'has-frontmatter', pass: false });
      }

      // Check 2: $ARGUMENTS usage (v2.1.19 - should be in prose, not frontmatter)
      const hasArgumentsInFrontmatter = frontmatterMatch
        ? frontmatterMatch[1].includes('$ARGUMENTS')
        : false;
      const hasArgumentsInBody = content.includes('$ARGUMENTS');

      // In bkit, $ARGUMENTS is mentioned in documentation, not in frontmatter syntax
      // This is expected and correct
      checks.push({
        name: 'arguments-usage-correct',
        pass: !hasArgumentsInFrontmatter, // Should NOT be in frontmatter
        note: hasArgumentsInBody ? 'Mentioned in docs (OK)' : 'Not used'
      });

      const allPassed = checks.every(c => c.pass);
      results.push({
        id: `C-${commandName}`,
        name: `/${commandName}`,
        status: allPassed ? 'pass' : 'fail',
        checks
      });
      allPassed ? pass++ : fail++;

    } catch (e) {
      results.push({
        id: `C-${commandName}`,
        name: `/${commandName}`,
        status: 'fail',
        error: e.message
      });
      fail++;
    }
  }

  return {
    category: 'commands',
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
