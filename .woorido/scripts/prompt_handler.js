const fs = require('fs');
const path = require('path');
const { compileMarkdown } = require('./compiler');

/**
 * Prompt Handler (Trigger Engine)
 * Analyzes user input and assembles the final prompt based on profiles and triggers.
 */

const CONFIG_PATH = path.join(__dirname, '../config/woorido.config.json');
const BASE_DIR = path.resolve(__dirname, '..');

function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  return { profiles: {}, triggers: { keywords: {} } };
}

function detectTriggers(userInput, config) {
  const triggeredFiles = new Set();
  const keywords = config.triggers.keywords || {};

  for (const [pattern, files] of Object.entries(keywords)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(userInput)) {
      files.forEach(f => triggeredFiles.add(f));
    }
  }
  return Array.from(triggeredFiles);
}

function generateSystemPrompt(profileName, userInput) {
  const config = loadConfig();
  const profile = config.profiles[profileName] || config.profiles['default'] || [];

  // 1. Static Profile
  let fileList = [...profile];

  // 2. Dynamic Triggers
  if (userInput) {
    const dynamicFiles = detectTriggers(userInput, config);
    fileList = [...fileList, ...dynamicFiles];
  }

  // 3. Compile Content
  let finalContent = "";

  // Deduplicate files
  fileList = [...new Set(fileList)];

  fileList.forEach(filePath => {
    // Determine full path (handle _core shortcut vs absolute)
    let fullPath = path.join(BASE_DIR, filePath);

    // If it's a directory, maybe load all md files? (For now assume explicit paths or core shortcuts)
    // If it points to _core (directory), load essential files
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
      // logic to load all md in dir could be added, but manual list is safer
      // Skip for now, assume config points to files or we handle specific dirs
    } else if (!filePath.endsWith('.md')) {
      // Try adding .md extension
      if (fs.existsSync(fullPath + '.md')) fullPath += '.md';
    }

    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
      finalContent += compileMarkdown(fullPath) + "\n\n";
    }
  });

  // 4. Optimization (Minify)
  if (config.performance && config.performance.removeComments) {
    finalContent = finalContent.replace(/<!--[\s\S]*?-->/g, "");
  }
  if (config.performance && config.performance.minifyMarkdown) {
    finalContent = finalContent.replace(/\n\s*\n/g, "\n\n"); // Collapse multiple newlines
  }

  return finalContent.trim();
}

module.exports = { generateSystemPrompt };

// CLI support
if (require.main === module) {
  const profile = process.argv[2] || 'default';
  const input = process.argv[3] || '';
  console.log(generateSystemPrompt(profile, input));
}
