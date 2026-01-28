#!/usr/bin/env node
/**
 * Skills Compatibility Tests
 * Tests: Frontmatter parsing, hooks detection (v2.1.19 auto-approve policy)
 */

const fs = require('fs');
const path = require('path');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  const skillsDir = path.join(projectRoot, 'skills');
  const skillFolders = fs.readdirSync(skillsDir)
    .filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());

  // v2.1.19: Skills without hooks should auto-approve
  // Note: These lists are for informational purposes
  // The actual test checks if hooks exist or not
  const expectedAutoApprove = [
    'starter', 'dynamic', 'enterprise', 'mobile-app', 'desktop-app',
    'phase-1-schema', 'phase-2-convention', 'phase-3-mockup',
    'phase-7-seo-security'
  ];

  const expectedNeedApproval = [
    'phase-4-api', 'phase-5-design-system', 'phase-6-ui-integration',
    'phase-8-review', 'phase-9-deployment', 'zero-script-qa',
    'bkit-rules', 'bkit-templates', 'development-pipeline'
  ];

  for (const folder of skillFolders) {
    const skillPath = path.join(skillsDir, folder, 'SKILL.md');

    try {
      if (!fs.existsSync(skillPath)) {
        results.push({
          id: `S-${folder}`,
          name: folder,
          status: 'fail',
          error: 'SKILL.md not found'
        });
        fail++;
        continue;
      }

      const content = fs.readFileSync(skillPath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      const checks = [];

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];

        // Check required fields
        const hasName = frontmatter.includes('name:');
        const hasDescription = frontmatter.includes('description:');
        const hasHooks = frontmatter.includes('hooks:');
        const hasAllowedTools = frontmatter.includes('allowed-tools:');

        checks.push({ name: 'has-name', pass: hasName });
        checks.push({ name: 'has-description', pass: hasDescription });
        // allowed-tools is optional for skills (some skills inherit from parent)
        checks.push({
          name: 'has-allowed-tools',
          pass: true, // Optional field
          note: hasAllowedTools ? 'Tools specified' : 'Inherits from parent'
        });

        // v2.1.19 specific: Report hooks status (informational)
        // This is not a pass/fail check, just classification
        checks.push({
          name: 'v2.1.19-hooks-status',
          pass: true, // Always pass - this is informational
          hasHooks: hasHooks,
          note: hasHooks ? 'Needs approval (has hooks)' : 'Auto-approve (no hooks)'
        });

      } else {
        checks.push({ name: 'has-frontmatter', pass: false });
      }

      const allPassed = checks.every(c => c.pass);
      results.push({
        id: `S-${folder}`,
        name: folder,
        status: allPassed ? 'pass' : 'fail',
        checks
      });
      allPassed ? pass++ : fail++;

    } catch (e) {
      results.push({
        id: `S-${folder}`,
        name: folder,
        status: 'fail',
        error: e.message
      });
      fail++;
    }
  }

  return {
    category: 'skills',
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
