const { detectPlatform, isGeminiCli, BKIT_PLATFORM } = require('./lib/common.js');

console.log('--- Debug Info ---');
console.log('BKIT_PLATFORM:', BKIT_PLATFORM);
console.log('Detected Platform:', detectPlatform());
console.log('isGeminiCli():', isGeminiCli());
console.log('GEMINI_PROJECT_DIR:', process.env.GEMINI_PROJECT_DIR);
console.log('GEMINI_EXTENSION_PATH:', process.env.GEMINI_EXTENSION_PATH);
console.log('CLAUDE_PROJECT_DIR:', process.env.CLAUDE_PROJECT_DIR);
console.log('BKIT_DEBUG:', process.env.BKIT_DEBUG);
