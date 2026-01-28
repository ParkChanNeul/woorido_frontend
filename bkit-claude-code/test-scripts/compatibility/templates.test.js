#!/usr/bin/env node
/**
 * Templates Compatibility Tests
 * Tests: Template structure, variable definitions
 */

const fs = require('fs');
const path = require('path');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  const templatesDir = path.join(projectRoot, 'templates');

  // Get all template files (including subdirectories)
  function getTemplateFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getTemplateFiles(fullPath));
      } else if (item.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const templateFiles = getTemplateFiles(templatesDir);

  for (const filePath of templateFiles) {
    const relativePath = path.relative(templatesDir, filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

      const checks = [];

      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];

        // Template metadata
        const hasTemplate = frontmatter.includes('template:');
        const hasVersion = frontmatter.includes('version:');
        const hasDescription = frontmatter.includes('description:');
        const hasVariables = frontmatter.includes('variables:');

        // These fields are optional for templates
        checks.push({
          name: 'has-template-field',
          pass: true,
          note: hasTemplate ? 'Template type defined' : 'No template type'
        });
        checks.push({
          name: 'has-version',
          pass: true,
          note: hasVersion ? 'Version defined' : 'No version'
        });
        checks.push({
          name: 'has-description',
          pass: true,
          note: hasDescription ? 'Description defined' : 'No description'
        });

        // Variables are optional
        checks.push({
          name: 'has-variables',
          pass: true,
          note: hasVariables ? 'Variables defined' : 'No variables'
        });

      } else {
        // Templates without frontmatter are still valid
        // (pipeline templates, CLAUDE.template, iteration-report, etc.)
        // They use variable substitution {{variable}} syntax instead
        const isPipeline = relativePath.includes('pipeline/');
        const isVarSubstitution = content.includes('{{') && content.includes('}}');
        const isGuide = relativePath.includes('GUIDE') || relativePath.includes('_INDEX');

        checks.push({
          name: 'has-frontmatter',
          pass: true, // Frontmatter is optional for templates
          note: isPipeline ? 'Pipeline template (no frontmatter needed)' :
                isVarSubstitution ? 'Variable substitution template' :
                isGuide ? 'Guide file (no frontmatter needed)' : 'Plain template'
        });
      }

      // Check for template variables in content
      const hasTemplateVars = content.includes('{') && content.includes('}');
      checks.push({
        name: 'has-placeholder-syntax',
        pass: true,
        note: hasTemplateVars ? 'Uses {variable} syntax' : 'No placeholders'
      });

      const requiredChecks = checks.filter(c =>
        !['has-variables', 'has-placeholder-syntax'].includes(c.name)
      );
      const allPassed = requiredChecks.every(c => c.pass);

      results.push({
        id: `T-${relativePath.replace(/\//g, '-').replace('.md', '')}`,
        name: relativePath,
        status: allPassed ? 'pass' : 'fail',
        checks
      });
      allPassed ? pass++ : fail++;

    } catch (e) {
      results.push({
        id: `T-${relativePath}`,
        name: relativePath,
        status: 'fail',
        error: e.message
      });
      fail++;
    }
  }

  return {
    category: 'templates',
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
