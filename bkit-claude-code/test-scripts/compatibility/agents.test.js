#!/usr/bin/env node
/**
 * Agents Compatibility Tests
 * Tests: Agent frontmatter, trigger keywords
 */

const fs = require('fs');
const path = require('path');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  const agentsDir = path.join(projectRoot, 'agents');
  const agentFiles = fs.readdirSync(agentsDir)
    .filter(f => f.endsWith('.md'));

  for (const file of agentFiles) {
    const agentPath = path.join(agentsDir, file);
    const agentName = file.replace('.md', '');

    try {
      const content = fs.readFileSync(agentPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      const checks = [];

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];

        // Required fields for agents
        const hasName = frontmatter.includes('name:');
        const hasDescription = frontmatter.includes('description:');
        const hasModel = frontmatter.includes('model:');
        // Agents use 'tools:' not 'allowed-tools:'
        const hasTools = frontmatter.includes('tools:') || frontmatter.includes('allowed-tools:');

        checks.push({ name: 'has-name', pass: hasName });
        checks.push({ name: 'has-description', pass: hasDescription });
        checks.push({ name: 'has-tools', pass: hasTools });

        // Model field is optional but recommended
        checks.push({
          name: 'has-model',
          pass: true, // Optional, so always pass
          note: hasModel ? 'Model specified' : 'Uses default (inherit)'
        });

        // v2.1.19: Check for trigger keywords in description
        const hasTriggers = frontmatter.includes('Triggers:') ||
          frontmatter.includes('trigger');
        checks.push({
          name: 'has-triggers',
          pass: true, // Informational
          note: hasTriggers ? 'Has trigger keywords' : 'No explicit triggers'
        });

      } else {
        checks.push({ name: 'has-frontmatter', pass: false });
      }

      const allPassed = checks.filter(c => c.name !== 'has-model' && c.name !== 'has-triggers')
        .every(c => c.pass);

      results.push({
        id: `A-${agentName}`,
        name: agentName,
        status: allPassed ? 'pass' : 'fail',
        checks
      });
      allPassed ? pass++ : fail++;

    } catch (e) {
      results.push({
        id: `A-${agentName}`,
        name: agentName,
        status: 'fail',
        error: e.message
      });
      fail++;
    }
  }

  return {
    category: 'agents',
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
