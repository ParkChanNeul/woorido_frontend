const fs = require('fs');
const path = require('path');

/**
 * Prompt Compiler (Import Resolver)
 * Recursively resolves {{include:path/to/file.md}} directives.
 */

const BASE_DIR = path.resolve(__dirname, '..');
const MAX_DEPTH = 5;

function resolvePath(includePath, sourceDir) {
  // 1. Try relative to .woorido root
  let absPath = path.join(BASE_DIR, includePath);
  if (fs.existsSync(absPath)) return absPath;

  // 2. Try relative to the source file
  absPath = path.join(sourceDir, includePath);
  if (fs.existsSync(absPath)) return absPath;

  return null;
}

function compileMarkdown(filePath, depth = 0) {
  if (depth > MAX_DEPTH) {
    return `<!-- Error: Max recursion depth (${MAX_DEPTH}) exceeded -->`;
  }

  if (!fs.existsSync(filePath)) {
    return `<!-- Error: File not found '${filePath}' -->`;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const fileDir = path.dirname(filePath);

  // Regex to match {{include:path}}
  // Supports optional whitespace: {{ include : path }}
  const includeRegex = /\{\{\s*include\s*:\s*(.+?)\s*\}\}/g;

  content = content.replace(includeRegex, (match, includePath) => {
    const resolvedPath = resolvePath(includePath, fileDir);
    
    if (!resolvedPath) {
      console.warn(`[Warning] Could not resolve import: ${includePath} in ${filePath}`);
      return `<!-- Error: Could not resolve import '${includePath}' -->`;
    }

    // Recursively compile the included file
    const includedContent = compileMarkdown(resolvedPath, depth + 1);
    
    // Add a wrapper comment for debugging (optional, can be removed by minifier)
    const relativePath = path.relative(BASE_DIR, resolvedPath).replace(/\\/g, '/');
    return `\n<!-- BEGIN INCLUDE: ${relativePath} -->\n${includedContent}\n<!-- END INCLUDE: ${relativePath} -->\n`;
  });

  return content;
}

module.exports = { compileMarkdown };

// CLI support for testing
if (require.main === module) {
  const targetFile = process.argv[2];
  if (targetFile) {
    console.log(compileMarkdown(targetFile));
  } else {
    console.log("Usage: node compiler.js <path/to/markdown.md>");
  }
}
