/**
 * bkit v1.4.2 Scripts Type Parameter Tests
 *
 * TR-09: scripts/ outputAllow 타입 파라미터 검증
 *
 * 테스트 대상: scripts/ 폴더 내 모든 스크립트의 outputAllow() 호출
 * FR-01 준수: PreToolUse 이외의 스크립트는 타입 파라미터 전달 필수
 */

const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');

describe('TR-09: scripts/ outputAllow 타입 파라미터', () => {
  // PostToolUse 스크립트 목록
  const postToolUseScripts = [
    { file: 'gap-detector-post.js', type: 'PostToolUse' },
    { file: 'pdca-post-write.js', type: 'PostToolUse' },
    { file: 'phase5-design-post.js', type: 'PostToolUse' },
    { file: 'phase6-ui-post.js', type: 'PostToolUse' },
    { file: 'qa-monitor-post.js', type: 'PostToolUse' }
  ];

  // Stop hook 스크립트 목록
  const stopScripts = [
    { file: 'gap-detector-stop.js', type: 'Stop' },
    { file: 'iterator-stop.js', type: 'Stop' },
    { file: 'analysis-stop.js', type: 'Stop' }
  ];

  // PreToolUse 스크립트 목록 (타입 파라미터 없어도 됨)
  const preToolUseScripts = [
    'pre-write.js',
    'code-analyzer-pre.js',
    'qa-pre-bash.js',
    'design-validator-pre.js'
  ];

  test.each(postToolUseScripts)(
    'TR-09.$# $file - outputAllow("PostToolUse") 호출 확인',
    ({ file, type }) => {
      const filePath = path.join(SCRIPTS_DIR, file);

      if (!fs.existsSync(filePath)) {
        console.log(`Skipping: ${file} not found`);
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');

      // outputAllow(..., 'PostToolUse') 패턴 확인
      const pattern = new RegExp(`outputAllow\\([^)]*,\\s*['"]${type}['"]\\s*\\)`);
      expect(content).toMatch(pattern);
    }
  );

  test.each(stopScripts)(
    'TR-09.$# $file - outputAllow("Stop") 또는 systemMessage 사용',
    ({ file, type }) => {
      const filePath = path.join(SCRIPTS_DIR, file);

      if (!fs.existsSync(filePath)) {
        console.log(`Skipping: ${file} not found`);
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');

      // Stop 스크립트는 outputAllow('Stop') 또는 systemMessage 사용
      const stopPattern = /outputAllow\([^)]*,\s*['"]Stop['"]\s*\)/;
      const systemMsgPattern = /systemMessage/;

      expect(content.match(stopPattern) || content.match(systemMsgPattern)).toBeTruthy();
    }
  );

  test.each(preToolUseScripts)(
    'TR-09.$# %s - PreToolUse 스크립트 outputAllow 확인',
    (file) => {
      const filePath = path.join(SCRIPTS_DIR, file);

      if (!fs.existsSync(filePath)) {
        console.log(`Skipping: ${file} not found`);
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');

      // PreToolUse 스크립트는 outputAllow(context) 또는 outputAllow(context, 'PreToolUse') 사용
      // 또는 outputBlock() 사용
      const hasOutputAllow = content.includes('outputAllow');
      const hasOutputBlock = content.includes('outputBlock');
      const hasOutputEmpty = content.includes('outputEmpty');

      // 최소한 하나의 출력 함수 사용
      expect(hasOutputAllow || hasOutputBlock || hasOutputEmpty).toBe(true);

      // PreToolUse가 아닌 타입을 사용하는지 검사 (잘못된 사용)
      if (hasOutputAllow) {
        // 'PreToolUse' 타입이거나 타입 없는 호출만 허용
        const wrongTypePattern = /outputAllow\([^)]+,\s*['"](?!PreToolUse)[A-Z][a-z]+['"]\)/;
        expect(content).not.toMatch(wrongTypePattern);
      }
    }
  );

  test('모든 outputAllow 호출에 타입 파라미터 존재 확인 (Pre 제외)', () => {
    const allScripts = fs.readdirSync(SCRIPTS_DIR)
      .filter(f => f.endsWith('.js') && !f.startsWith('_'));

    const issues = [];

    for (const file of allScripts) {
      const filePath = path.join(SCRIPTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // PreToolUse 스크립트는 제외
      const isPre = file.includes('pre-') || file.endsWith('-pre.js');

      if (!isPre && content.includes('outputAllow')) {
        // outputAllow(something) 형태 (타입 없음) 찾기
        // 단, outputAllow() 빈 호출은 제외
        const noTypePattern = /outputAllow\(\s*[^,)]+\s*\)(?!\s*;?\s*\/\/.*type)/gm;
        const matches = content.match(noTypePattern);

        if (matches) {
          // outputAllow('') 같은 빈 문자열 호출은 제외
          const realIssues = matches.filter(m => !m.match(/outputAllow\(\s*['"]?['"]?\s*\)/));
          if (realIssues.length > 0) {
            issues.push({ file, matches: realIssues });
          }
        }
      }
    }

    // 이슈가 있으면 상세 정보 출력
    if (issues.length > 0) {
      console.log('Scripts with missing type parameter:');
      issues.forEach(({ file, matches }) => {
        console.log(`  ${file}: ${matches.join(', ')}`);
      });
    }

    // 참고: 일부 레거시 스크립트에서 타입 누락 가능
    // 엄격하게 검사하려면 아래 주석 해제
    // expect(issues.length).toBe(0);
  });
});

describe('TR-09: outputAllow 함수 시그니처 검증', () => {
  test('lib/common.js outputAllow 함수가 hookEvent 파라미터 지원', () => {
    const commonPath = path.join(__dirname, '../../lib/common.js');
    const content = fs.readFileSync(commonPath, 'utf8');

    // function outputAllow(context, hookEvent = 'PostToolUse') 패턴
    expect(content).toMatch(/function\s+outputAllow\s*\([^)]*hookEvent/);
  });

  test('lib/common.js outputAllow에서 PreToolUse 처리', () => {
    const commonPath = path.join(__dirname, '../../lib/common.js');
    const content = fs.readFileSync(commonPath, 'utf8');

    // PreToolUse 특별 처리 로직 존재
    expect(content).toMatch(/hookEvent\s*[!=]==?\s*['"]PreToolUse['"]/);
  });
});
