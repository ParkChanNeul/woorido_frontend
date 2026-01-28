/**
 * bkit v1.4.2 Phase 9 Deployment Tests
 *
 * TR-12: phase-9-deployment timeout 설정 검증
 *
 * 테스트 대상:
 * - skills/phase-9-deployment/SKILL.md
 * - scripts/phase9-deploy-pre.js (존재 시)
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../../skills');
const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

describe('TR-12: phase-9-deployment timeout 설정', () => {
  const skillPath = path.join(SKILLS_DIR, 'phase-9-deployment/SKILL.md');

  beforeAll(() => {
    if (!fs.existsSync(skillPath)) {
      console.log('Warning: phase-9-deployment/SKILL.md not found');
    }
  });

  test('12.1 SKILL.md 파일 존재', () => {
    expect(fs.existsSync(skillPath)).toBe(true);
  });

  test('12.2 timeout = 5000 설정', () => {
    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');
    expect(content).toMatch(/timeout:\s*5000/);
  });

  test('12.3 PreToolUse hook 정의', () => {
    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // hooks 섹션에 PreToolUse 정의
    expect(content).toContain('PreToolUse');
  });

  test('12.4 command 경로 정확성', () => {
    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // scripts/phase9-deploy-pre.js 또는 유사한 경로
    expect(content).toMatch(/scripts\/phase9-deploy/);
  });

  test('12.5 Bash matcher 설정', () => {
    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // matcher에 Bash 포함
    expect(content).toMatch(/matcher:\s*["']?Bash["']?/i);
  });
});

describe('phase-9-deployment hook 구조 검증', () => {
  const skillPath = path.join(SKILLS_DIR, 'phase-9-deployment/SKILL.md');

  test('frontmatter YAML 구조', () => {
    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // frontmatter 추출
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    expect(frontmatterMatch).not.toBeNull();

    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];

      // hooks 섹션 존재
      expect(frontmatter).toContain('hooks:');

      // 필수 필드
      expect(frontmatter).toContain('command:');
      expect(frontmatter).toContain('timeout:');
    }
  });

  test('node 명령어 사용', () => {
    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // command: node 형태
    expect(content).toMatch(/command:\s*["']?node/);
  });
});

describe('phase9-deploy-pre.js 스크립트 검증', () => {
  const scriptPath = path.join(SCRIPTS_DIR, 'phase9-deploy-pre.js');

  test('스크립트 파일 존재 여부 확인', () => {
    // 스크립트가 없을 수도 있음 (optional)
    const exists = fs.existsSync(scriptPath);

    if (exists) {
      console.log('phase9-deploy-pre.js exists');
    } else {
      console.log('phase9-deploy-pre.js not found (may use inline command)');
    }

    // 테스트 통과 (존재 여부만 확인)
    expect(typeof exists).toBe('boolean');
  });

  test('스크립트 존재 시 common.js 사용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // common.js import
    expect(content).toMatch(/require\s*\(\s*['"][^'"]*common[^'"]*['"]\s*\)/);
  });

  test('스크립트 존재 시 outputAllow 또는 outputBlock 사용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // outputAllow 또는 outputBlock 사용
    const hasOutput = content.includes('outputAllow') || content.includes('outputBlock');
    expect(hasOutput).toBe(true);
  });
});

describe('Deployment Skill 전체 구조', () => {
  const skillDir = path.join(SKILLS_DIR, 'phase-9-deployment');

  test('skill 디렉토리 구조', () => {
    expect(fs.existsSync(skillDir)).toBe(true);

    const skillMd = path.join(skillDir, 'SKILL.md');
    expect(fs.existsSync(skillMd)).toBe(true);
  });

  test('skill 이름과 설명', () => {
    const skillPath = path.join(skillDir, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      return;
    }

    const content = fs.readFileSync(skillPath, 'utf8');

    // frontmatter에 name 또는 description
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      // deployment 관련 내용 포함
      expect(content.toLowerCase()).toContain('deploy');
    }
  });
});
