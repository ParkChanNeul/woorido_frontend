#!/usr/bin/env node
/**
 * pdca-post-write.js - Guide next steps after Write operation (v1.4.0)
 * Supports: Claude Code (PostToolUse), Gemini CLI (AfterTool)
 *
 * Purpose: Suggest gap analysis after source file modifications
 * Hook: PostToolUse (Claude Code) / AfterTool (Gemini CLI)
 *
 * v1.4.0 Changes:
 * - Added debug logging for hook verification
 *
 * Converted from: scripts/pdca-post-write.sh
 */

const fs = require('fs');
const path = require('path');
const {
  readStdinSync,
  parseHookInput,
  isSourceFile,
  extractFeature,
  outputAllow,
  outputEmpty,
  generateTaskGuidance,
  debugLog,
  PROJECT_DIR
} = require('../lib/common.js');

// Read input from stdin
const input = readStdinSync();
const { filePath } = parseHookInput(input);

// Debug log hook execution
debugLog('PostToolUse', 'Hook started', { filePath: filePath || 'none' });

// Skip non-source files
if (!isSourceFile(filePath)) {
  debugLog('PostToolUse', 'Skipped - not a source file');
  outputEmpty();
  process.exit(0);
}

// Extract feature name
const feature = extractFeature(filePath);

// Skip if no feature detected
if (!feature) {
  outputEmpty();
  process.exit(0);
}

// Check if design doc exists for gap analysis suggestion
const designDocPaths = [
  path.join(PROJECT_DIR, `docs/02-design/features/${feature}.design.md`),
  path.join(PROJECT_DIR, `docs/02-design/${feature}.design.md`)
];

const hasDesignDoc = designDocPaths.some(p => fs.existsSync(p));

if (hasDesignDoc) {
  // Generate Task guidance for PDCA workflow
  const taskGuidance = generateTaskGuidance('do', feature, 'design');
  const context = `Write completed: ${filePath}\n\nWhen implementation is finished, run /pdca-analyze ${feature} to verify design-implementation alignment.\n\n${taskGuidance}`;

  debugLog('PostToolUse', 'Hook completed', {
    feature,
    hasDesignDoc: true,
    guidanceProvided: true
  });

  outputAllow(context, 'PostToolUse');
} else {
  debugLog('PostToolUse', 'Hook completed', {
    feature: feature || 'none',
    hasDesignDoc: false,
    guidanceProvided: false
  });

  outputEmpty();
}
