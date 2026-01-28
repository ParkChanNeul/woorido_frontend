/**
 * bkit v1.4.2 qa-pre-bash.js Integration Tests
 *
 * QA Bash 명령어 검증 스크립트 통합 테스트
 * FR-02 준수: 차단 시 stderr + exit 2
 *
 * 테스트 대상: scripts/qa-pre-bash.js
 */

const fs = require('fs');
const path = require('path');
const { runScriptWithJson } = require('../lib/safe-exec');

const SCRIPTS_DIR = path.join(__dirname, '../../scripts');
const scriptPath = path.join(SCRIPTS_DIR, 'qa-pre-bash.js');

describe('qa-pre-bash.js 통합 테스트', () => {
  beforeAll(() => {
    if (!fs.existsSync(scriptPath)) {
      console.log('Warning: qa-pre-bash.js not found, tests will be skipped');
    }
  });

  test('스크립트 파일 존재', () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  test('안전한 docker 명령어 - 허용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'docker logs app'
      }
    });

    expect(result.status).toBe(0);

    // stdout에 허용 메시지 또는 빈 JSON
    if (result.stdout.trim() && result.stdout.trim() !== '{}') {
      expect(result.stdout.toLowerCase()).toMatch(/safe|validated|allow/i);
    }
  });

  test('docker ps 명령어 - 허용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'docker ps -a'
      }
    });

    expect(result.status).toBe(0);
  });

  test('docker compose logs 명령어 - 허용', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'docker compose logs -f api'
      }
    });

    expect(result.status).toBe(0);
  });
});

describe('qa-pre-bash.js 위험 명령어 차단', () => {
  test('rm -rf 명령어 - 차단 (exit 2)', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'rm -rf /tmp/test'
      }
    });

    expect(result.status).toBe(2);
    expect(result.stderr.toLowerCase()).toContain('destructive');
  });

  test('rm -r 명령어 - 차단', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'rm -r /data'
      }
    });

    expect(result.status).toBe(2);
  });

  test('DROP TABLE SQL - 차단', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'psql -c "DROP TABLE users"'
      }
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toBeTruthy();
  });

  test('DELETE FROM SQL - 차단', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'mysql -e "DELETE FROM users"'
      }
    });

    expect(result.status).toBe(2);
  });

  test('TRUNCATE TABLE SQL - 차단', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'psql -c "TRUNCATE TABLE logs"'
      }
    });

    expect(result.status).toBe(2);
  });

  test('dd 명령어 - 차단', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'dd if=/dev/zero of=/disk'
      }
    });

    expect(result.status).toBe(2);
  });

  // 여러 위험 명령어 일괄 테스트
  const destructiveCommands = [
    { cmd: 'rm -rf /', desc: 'rm -rf root' },
    { cmd: 'rm -r ./data', desc: 'rm -r directory' },
    { cmd: 'DROP DATABASE test', desc: 'DROP DATABASE' },
    { cmd: "mysql -e 'DELETE FROM users WHERE 1=1'", desc: 'DELETE all' },
    { cmd: 'sudo rm -rf /var/log', desc: 'sudo rm' },
    { cmd: 'mkfs.ext4 /dev/sda1', desc: 'mkfs format' }
  ];

  test.each(destructiveCommands)(
    '위험 명령어 차단: $desc',
    ({ cmd }) => {
      if (!fs.existsSync(scriptPath)) {
        return;
      }

      const result = runScriptWithJson(scriptPath, {
        tool_input: { command: cmd }
      });

      expect(result.status).toBe(2);
    }
  );
});

describe('qa-pre-bash.js FR-02 준수 검증', () => {
  test('차단 시 stdout 비어있음', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'rm -rf /important'
      }
    });

    expect(result.status).toBe(2);
    // FR-02: stdout에 JSON 없음
    expect(result.stdout.trim()).toBe('');
  });

  test('차단 시 stderr에 이유 출력', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'DROP TABLE users'
      }
    });

    expect(result.status).toBe(2);
    // stderr에 차단 이유 포함
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  test('outputBlock 함수 사용 확인', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const content = fs.readFileSync(scriptPath, 'utf8');

    // outputBlock 사용
    expect(content).toContain('outputBlock');
  });
});

describe('qa-pre-bash.js 경계값 테스트', () => {
  test('빈 명령어 - 허용 또는 무시', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: ''
      }
    });

    // 빈 명령어는 허용되거나 무시됨
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });

  test('공백만 있는 명령어', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: '   '
      }
    });

    // 공백 명령어는 허용되거나 무시됨
    expect(result.status === 0 || result.status === null).toBeTruthy();
  });

  test('echo 명령어 - 안전', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'echo "Hello World"'
      }
    });

    expect(result.status).toBe(0);
  });

  test('ls 명령어 - 안전', () => {
    if (!fs.existsSync(scriptPath)) {
      return;
    }

    const result = runScriptWithJson(scriptPath, {
      tool_input: {
        command: 'ls -la /tmp'
      }
    });

    expect(result.status).toBe(0);
  });
});
