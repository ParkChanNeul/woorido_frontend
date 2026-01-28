#!/usr/bin/env node
/**
 * Library Compatibility Tests
 * Tests: lib/common.js functions
 */

const path = require('path');

async function run(options = {}) {
  const { projectRoot = path.resolve(__dirname, '../..') } = options;
  const results = [];
  let pass = 0;
  let fail = 0;

  // Set up environment
  process.env.CLAUDE_PLUGIN_ROOT = projectRoot;
  process.env.CLAUDE_PROJECT_DIR = projectRoot;

  try {
    // Clear cache and require
    const commonPath = path.join(projectRoot, 'lib/common.js');
    delete require.cache[require.resolve(commonPath)];
    const common = require(commonPath);

    const functions = [
      { name: 'detectPlatform', args: [], expectedType: 'string' },
      { name: 'detectLevel', args: [], expectedType: 'string' },
      { name: 'loadConfig', args: [], expectedType: 'object' },
      { name: 'getConfig', args: ['test.key', 'default'], expectedType: 'string' },
      { name: 'debugLog', args: ['Test', 'message', {}], expectedType: 'undefined' },
      { name: 'isGeminiCli', args: [], expectedType: 'boolean' },
    ];

    for (const fn of functions) {
      try {
        if (typeof common[fn.name] !== 'function') {
          results.push({
            id: `L-${fn.name}`,
            name: `${fn.name}()`,
            status: 'fail',
            error: 'Function not exported'
          });
          fail++;
          continue;
        }

        const result = common[fn.name](...fn.args);
        const actualType = typeof result;
        const passed = actualType === fn.expectedType;

        results.push({
          id: `L-${fn.name}`,
          name: `${fn.name}()`,
          status: passed ? 'pass' : 'fail',
          checks: [
            { name: 'returns-correct-type', pass: passed, expected: fn.expectedType, actual: actualType }
          ]
        });
        passed ? pass++ : fail++;
      } catch (e) {
        results.push({
          id: `L-${fn.name}`,
          name: `${fn.name}()`,
          status: 'fail',
          error: e.message
        });
        fail++;
      }
    }

    // Additional check: exports exist
    const expectedExports = [
      'BKIT_PLATFORM', 'PLUGIN_ROOT', 'PROJECT_DIR',
      'detectPlatform', 'detectLevel', 'loadConfig', 'getConfig',
      'debugLog', 'isGeminiCli', 'getPdcaStatusFull'
    ];

    const missingExports = expectedExports.filter(e => !(e in common));
    results.push({
      id: 'L-exports',
      name: 'All expected exports exist',
      status: missingExports.length === 0 ? 'pass' : 'fail',
      checks: expectedExports.map(e => ({
        name: e,
        pass: e in common
      }))
    });
    missingExports.length === 0 ? pass++ : fail++;

  } catch (e) {
    results.push({
      id: 'L-load',
      name: 'Load lib/common.js',
      status: 'fail',
      error: e.message
    });
    fail++;
  }

  return {
    category: 'library',
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
