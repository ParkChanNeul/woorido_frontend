/**
 * bkit v1.4.2 Code Analyzer Tests
 *
 * TR-10: code-analyzer-pre.js 차단 동작 검증
 * TR-11: code-analyzer.md hook 설정 검증
 *
 * 테스트 대상:
 * - scripts/code-analyzer-pre.js
 * - agents/code-analyzer.md
 */

const fs = require('fs');
const path = require('path');
const { runScript, runScriptWithJson } = require('../lib/safe-exec');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const AGENTS_DIR = path.join(__dirname, '../../agents');

describe('TR-10: code-analyzer-pre.js 차단 동작', () => {
  const scriptPath = path.join(SCRIPTS_DIR, 'code-analyzer-pre.js');

  beforeAll(() => {
    if (!fs.existsSync(scriptPath)) {
      console.log('Warning: code-analyzer-pre.js not found, tests will be skipped');
    }
  });

  test('10.1 Write 도구 호출 시 차단 (exit 2)', () => {
    if (!fs.existsSync(scriptPath)) {
      return; // Skip
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: {
        file_path: '/src/test.ts',
        content: 'const x = 1;'
      }
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('read-only');
  });

  test('10.2 Edit 도구 호출 시 차단 (exit 2)', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Edit',
      tool_input: {
        file_path: '/src/test.ts',
        old_string: 'old',
        new_string: 'new'
      }
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('read-only');
  });

  test('10.3 stdout에 JSON 출력 없음 (FR-02)', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: { file_path: '/test.ts', content: '' }
    });

    // stdout은 비어있어야 함
    expect(result.stdout.trim()).toBe('');
  });

  test('10.4 stderr에 에러 메시지 출력', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Write',
      tool_input: { file_path: '/test.ts', content: '' }
    });

    expect(result.stderr.length).toBeGreaterThan(0);
    expect(result.stderr.toLowerCase()).toContain('code analyzer');
  });

  test('10.5 Read 도구는 차단하지 않음', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_name: 'Read',
      tool_input: { file_path: '/src/test.ts' }
    });

    // Read는 허용되어야 함 (exit 0 또는 빈 출력)
    expect(result.status === 0 || result.stdout.trim() === '{}').toBeTruthy();
  });
});

describe('TR-11: code-analyzer.md hook 설정', () => {
  const agentPath = path.join(AGENTS_DIR, 'code-analyzer.md');

  beforeAll(() => {
    if (!fs.existsSync(agentPath)) {
      console.log('Warning: code-analyzer.md not found, tests will be skipped');
    }
  });

  test('11.1 PreToolUse hook 정의 존재', () => {
    if (!fs.existsSync(agentPath)) {
      return;
    }

    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toContain('PreToolUse');
  });

  test('11.2 matcher = "Write|Edit" 설정', () => {
    if (!fs.existsSync(agentPath)) {
      return;
    }

    const content = fs.readFileSync(agentPath, 'utf8');

    // matcher: "Write|Edit" 또는 matcher: Write|Edit 형태
    expect(content).toMatch(/matcher:\s*["']?Write\|Edit["']?/);
  });

  test('11.3 command = scripts/code-analyzer-pre.js', () => {
    if (!fs.existsSync(agentPath)) {
      return;
    }

    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toContain('scripts/code-analyzer-pre.js');
  });

  test('11.4 timeout = 5000 설정', () => {
    if (!fs.existsSync(agentPath)) {
      return;
    }

    const content = fs.readFileSync(agentPath, 'utf8');
    expect(content).toMatch(/timeout:\s*5000/);
  });

  test('11.5 node 명령어 사용', () => {
    if (!fs.existsSync(agentPath)) {
      return;
    }

    const content = fs.readFileSync(agentPath, 'utf8');

    // command: node 또는 command: "node 형태
    expect(content).toMatch(/command:\s*["']?node/);
  });

  test('11.6 PreToolUse hook YAML 구조 검증', () => {
    if (!fs.existsSync(agentPath)) {
      return;
    }

    const content = fs.readFileSync(agentPath, 'utf8');

    // frontmatter 추출
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    expect(frontmatterMatch).not.toBeNull();

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];

      // hooks 섹션 존재
      expect(frontmatter).toContain('hooks:');

      // PreToolUse 섹션
      expect(frontmatter).toContain('PreToolUse');

      // 필수 필드들
      expect(frontmatter).toContain('matcher:');
      expect(frontmatter).toContain('command:');
      expect(frontmatter).toContain('timeout:');
    }
  });
});

describe('code-analyzer 통합 검증', () => {
  test('Agent와 Script 연결 검증', () => {
    const agentPath = path.join(AGENTS_DIR, 'code-analyzer.md');
    const scriptPath = path.join(SCRIPTS_DIR, 'code-analyzer-pre.js');

    // 둘 다 존재해야 함
    const agentExists = fs.existsSync(agentPath);
    const scriptExists = fs.existsSync(scriptPath);

    if (!agentExists && !scriptExists) {
      console.log('Both agent and script missing - feature may not be implemented');
      return;
    }

    // 하나만 존재하면 불완전한 구현
    if (agentExists !== scriptExists) {
      console.warn('Incomplete implementation: agent and script should both exist');
    }

    expect(agentExists).toBe(scriptExists);
  });

  test('outputBlock 함수 사용 확인', () => {
    const scriptPath = path.join(SCRIPTS_DIR, 'code-analyzer-pre.js');

    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // outputBlock 사용해야 함 (FR-02)
    expect(content).toContain('outputBlock');

    // common.js에서 import
    expect(content).toMatch(/require\s*\(\s*['"][^'"]*common[^'"]*['"]\s*\)/);
  });
});
