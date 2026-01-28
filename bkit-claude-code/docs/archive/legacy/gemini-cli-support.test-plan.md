# Gemini CLI Support Test Plan

> **Summary**: bkit 플러그인 Gemini CLI 듀얼 플랫폼 지원 테스트 계획서
>
> **Project**: bkit-claude-code
> **Version**: 1.4.0
> **Author**: Claude
> **Date**: 2026-01-23
> **Design Document**: [gemini-cli-support.design.md](../02-design/features/gemini-cli-support.design.md)

---

## 1. Test Scope

### 1.1 In Scope

| Category | Items |
|----------|-------|
| Unit Tests | 플랫폼 감지, 환경 변수, 유틸리티 함수 |
| Integration Tests | Hooks 실행, 명령어 로드, 스킬 활성화 |
| Regression Tests | Claude Code 기존 기능 유지 |
| Cross-platform Tests | Windows/macOS/Linux 호환성 |

### 1.2 Out of Scope

- Gemini CLI 내부 동작 테스트 (외부 의존성)
- 네트워크 관련 테스트
- 성능 테스트

---

## 2. Test Cases

### 2.1 Unit Tests (U-01 ~ U-12)

#### U-01: gemini-extension.json 스키마 검증
| Item | Value |
|------|-------|
| **ID** | U-01 |
| **Category** | Unit |
| **FR** | FR-01 |
| **Description** | gemini-extension.json이 유효한 JSON이고 필수 필드를 포함하는지 확인 |
| **Test Method** | JSON 파싱 + 필수 필드 존재 확인 |
| **Expected Result** | 파싱 성공, name/version/repository/engines/context/commands/hooks 존재 |
| **Command** | `node -e "const j=require('./gemini-extension.json'); console.log(j.name, j.version, !!j.repository, !!j.engines, !!j.context, !!j.commands, !!j.hooks)"` |

#### U-02: TOML 명령어 파일 존재 확인
| Item | Value |
|------|-------|
| **ID** | U-02 |
| **Category** | Unit |
| **FR** | FR-02 |
| **Description** | 20개 TOML 명령어 파일이 모두 존재하는지 확인 |
| **Test Method** | 파일 존재 확인 |
| **Expected Result** | 20개 파일 모두 존재 |
| **Command** | `ls commands/gemini/*.toml \| wc -l` |

#### U-03: TOML 문법 검증
| Item | Value |
|------|-------|
| **ID** | U-03 |
| **Category** | Unit |
| **FR** | FR-02 |
| **Description** | 모든 TOML 파일이 유효한 문법인지 확인 |
| **Test Method** | TOML 파싱 시도 |
| **Expected Result** | 모든 파일 파싱 성공 |
| **Command** | `npx toml-cli --check commands/gemini/*.toml` 또는 수동 검증 |

#### U-04: detectPlatform() - Claude 환경
| Item | Value |
|------|-------|
| **ID** | U-04 |
| **Category** | Unit |
| **FR** | FR-09 |
| **Description** | Claude Code 환경 변수로 'claude' 반환 확인 |
| **Test Method** | 환경 변수 설정 후 함수 호출 |
| **Expected Result** | 'claude' 반환 |
| **Command** | `CLAUDE_PLUGIN_ROOT=/tmp node -e "console.log(require('./lib/common.js').detectPlatform())"` |

#### U-05: detectPlatform() - Gemini 환경
| Item | Value |
|------|-------|
| **ID** | U-05 |
| **Category** | Unit |
| **FR** | FR-01 |
| **Description** | Gemini CLI 환경 변수로 'gemini' 반환 확인 |
| **Test Method** | 환경 변수 설정 후 함수 호출 |
| **Expected Result** | 'gemini' 반환 |
| **Command** | `GEMINI_PROJECT_DIR=/tmp node -e "console.log(require('./lib/common.js').detectPlatform())"` |

#### U-06: isGeminiCli() / isClaudeCode()
| Item | Value |
|------|-------|
| **ID** | U-06 |
| **Category** | Unit |
| **FR** | FR-01, FR-09 |
| **Description** | 플랫폼 판별 함수 정상 작동 확인 |
| **Test Method** | 각 환경에서 함수 호출 |
| **Expected Result** | 해당 환경에서 true 반환 |
| **Command** | `BKIT_PLATFORM=gemini node -e "const c=require('./lib/common.js'); console.log(c.isGeminiCli(), c.isClaudeCode())"` |

#### U-07: getTemplatePath()
| Item | Value |
|------|-------|
| **ID** | U-07 |
| **Category** | Unit |
| **FR** | FR-06 |
| **Description** | 템플릿 경로 반환 함수 정상 작동 확인 |
| **Test Method** | 함수 호출 후 경로 확인 |
| **Expected Result** | templates/{name}.template.md 경로 반환 |
| **Command** | `node -e "console.log(require('./lib/common.js').getTemplatePath('plan'))"` |

#### U-08: detectLevel() - CLAUDE.md 인식
| Item | Value |
|------|-------|
| **ID** | U-08 |
| **Category** | Unit |
| **FR** | FR-07 |
| **Description** | CLAUDE.md에서 level 선언 인식 확인 |
| **Test Method** | 테스트 CLAUDE.md 생성 후 함수 호출 |
| **Expected Result** | 선언된 level 반환 |
| **Command** | 스크립트로 테스트 |

#### U-09: detectLevel() - GEMINI.md 인식
| Item | Value |
|------|-------|
| **ID** | U-09 |
| **Category** | Unit |
| **FR** | FR-07 |
| **Description** | GEMINI.md에서 level 선언 인식 확인 |
| **Test Method** | 테스트 GEMINI.md 생성 후 함수 호출 |
| **Expected Result** | 선언된 level 반환 |
| **Command** | 스크립트로 테스트 |

#### U-10: getPluginPath() / getProjectPath()
| Item | Value |
|------|-------|
| **ID** | U-10 |
| **Category** | Unit |
| **FR** | FR-06 |
| **Description** | 경로 유틸리티 함수 정상 작동 확인 |
| **Test Method** | 함수 호출 후 경로 확인 |
| **Expected Result** | 올바른 절대 경로 반환 |
| **Command** | `node -e "const c=require('./lib/common.js'); console.log(c.getPluginPath('skills'), c.getProjectPath('docs'))"` |

#### U-11: Node.js 스크립트 문법 검증
| Item | Value |
|------|-------|
| **ID** | U-11 |
| **Category** | Unit |
| **FR** | FR-04, FR-05 |
| **Description** | 모든 JS 스크립트 문법 오류 없음 확인 |
| **Test Method** | node --check |
| **Expected Result** | 모든 파일 통과 |
| **Command** | `node --check lib/common.js hooks/session-start.js scripts/pre-write.js scripts/pdca-post-write.js` |

#### U-12: 환경 변수 Fallback Chain
| Item | Value |
|------|-------|
| **ID** | U-12 |
| **Category** | Unit |
| **FR** | FR-01, FR-09 |
| **Description** | PLUGIN_ROOT, PROJECT_DIR fallback 체인 동작 확인 |
| **Test Method** | 다양한 환경 변수 조합 테스트 |
| **Expected Result** | 우선순위대로 fallback |
| **Command** | 스크립트로 테스트 |

---

### 2.2 Integration Tests (I-01 ~ I-08)

#### I-01: SessionStart 훅 - Claude 환경
| Item | Value |
|------|-------|
| **ID** | I-01 |
| **Category** | Integration |
| **FR** | FR-04, FR-09 |
| **Description** | Claude Code 환경에서 SessionStart 훅 정상 실행 |
| **Test Method** | Claude 환경 변수로 스크립트 실행 |
| **Expected Result** | "Claude Code" 포함된 JSON 출력 |
| **Command** | `CLAUDE_PLUGIN_ROOT=$(pwd) node hooks/session-start.js` |

#### I-02: SessionStart 훅 - Gemini 환경
| Item | Value |
|------|-------|
| **ID** | I-02 |
| **Category** | Integration |
| **FR** | FR-04 |
| **Description** | Gemini CLI 환경에서 SessionStart 훅 정상 실행 |
| **Test Method** | Gemini 환경 변수로 스크립트 실행 |
| **Expected Result** | "Gemini CLI" 포함된 JSON 출력 |
| **Command** | `GEMINI_PROJECT_DIR=$(pwd) BKIT_PLATFORM=gemini node hooks/session-start.js` |

#### I-03: BeforeTool 훅 (pre-write.js) - 소스 파일
| Item | Value |
|------|-------|
| **ID** | I-03 |
| **Category** | Integration |
| **FR** | FR-05 |
| **Description** | Write 도구 사용 시 pre-write.js 정상 실행 |
| **Test Method** | JSON 입력으로 스크립트 실행 |
| **Expected Result** | PDCA 가이던스 포함 JSON 또는 빈 JSON |
| **Command** | `echo '{"tool_name":"Write","tool_input":{"file_path":"src/test.ts","content":"..."}}' \| node scripts/pre-write.js` |

#### I-04: AfterTool 훅 (pdca-post-write.js)
| Item | Value |
|------|-------|
| **ID** | I-04 |
| **Category** | Integration |
| **FR** | FR-05 |
| **Description** | Write 완료 후 pdca-post-write.js 정상 실행 |
| **Test Method** | JSON 입력으로 스크립트 실행 |
| **Expected Result** | 가이던스 또는 빈 JSON |
| **Command** | `echo '{"tool_name":"Write","tool_input":{"file_path":"src/features/login/index.ts"}}' \| node scripts/pdca-post-write.js` |

#### I-05: Skills autoActivate 설정 확인
| Item | Value |
|------|-------|
| **ID** | I-05 |
| **Category** | Integration |
| **FR** | FR-03 |
| **Description** | gemini-extension.json의 autoActivate 스킬이 존재하는지 확인 |
| **Test Method** | 설정된 스킬 디렉토리 존재 확인 |
| **Expected Result** | bkit-rules, development-pipeline 폴더 존재 |
| **Command** | `ls -d skills/bkit-rules skills/development-pipeline` |

#### I-06: TOML 명령어 필수 필드 확인
| Item | Value |
|------|-------|
| **ID** | I-06 |
| **Category** | Integration |
| **FR** | FR-02 |
| **Description** | 모든 TOML 파일에 description과 prompt 필드 존재 |
| **Test Method** | 파일 내용 검색 |
| **Expected Result** | 모든 파일에 두 필드 존재 |
| **Command** | `for f in commands/gemini/*.toml; do grep -l "description" "$f" && grep -l "prompt" "$f"; done` |

#### I-07: 다국어 트리거 키워드 확인
| Item | Value |
|------|-------|
| **ID** | I-07 |
| **Category** | Integration |
| **FR** | FR-08 |
| **Description** | 스킬/에이전트에 다국어 트리거 포함 확인 |
| **Test Method** | Triggers 패턴 검색 |
| **Expected Result** | EN, KO, JA, ZH 키워드 포함 |
| **Command** | `grep -r "Triggers:" skills/ agents/ \| head -10` |

#### I-08: 템플릿 파일 존재 확인
| Item | Value |
|------|-------|
| **ID** | I-08 |
| **Category** | Integration |
| **FR** | FR-06 |
| **Description** | PDCA 템플릿 파일 모두 존재 확인 |
| **Test Method** | 파일 존재 확인 |
| **Expected Result** | 4개 템플릿 파일 존재 |
| **Command** | `ls templates/*.template.md` |

---

### 2.3 Regression Tests (R-01 ~ R-04)

#### R-01: Claude Code 환경 변수 유지
| Item | Value |
|------|-------|
| **ID** | R-01 |
| **Category** | Regression |
| **FR** | FR-09 |
| **Description** | CLAUDE_PLUGIN_ROOT, CLAUDE_PROJECT_DIR 여전히 작동 |
| **Test Method** | Claude 환경 변수로 lib/common.js 테스트 |
| **Expected Result** | 올바른 경로 반환 |
| **Command** | `CLAUDE_PLUGIN_ROOT=/test CLAUDE_PROJECT_DIR=/proj node -e "const c=require('./lib/common.js'); console.log(c.PLUGIN_ROOT, c.PROJECT_DIR)"` |

#### R-02: 기존 함수 export 유지
| Item | Value |
|------|-------|
| **ID** | R-02 |
| **Category** | Regression |
| **FR** | FR-09 |
| **Description** | lib/common.js의 기존 export 함수 모두 유지 |
| **Test Method** | export 목록 확인 |
| **Expected Result** | 기존 함수 모두 존재 |
| **Command** | `node -e "const c=require('./lib/common.js'); console.log(Object.keys(c).sort().join(', '))"` |

#### R-03: hooks.json 구조 유지
| Item | Value |
|------|-------|
| **ID** | R-03 |
| **Category** | Regression |
| **FR** | FR-09 |
| **Description** | Claude Code용 hooks.json 구조 변경 없음 |
| **Test Method** | JSON 파싱 및 구조 확인 |
| **Expected Result** | 기존 구조 유지 |
| **Command** | `node -e "const h=require('./hooks/hooks.json'); console.log(!!h.hooks.SessionStart, !!h.hooks.PreToolUse, !!h.hooks.PostToolUse)"` |

#### R-04: 기존 Markdown 명령어 유지
| Item | Value |
|------|-------|
| **ID** | R-04 |
| **Category** | Regression |
| **FR** | FR-09 |
| **Description** | Claude Code용 Markdown 명령어 파일 유지 |
| **Test Method** | 파일 존재 확인 |
| **Expected Result** | 20개 MD 파일 존재 |
| **Command** | `ls commands/*.md \| wc -l` |

---

## 3. Test Execution

### 3.1 Test Environment

| Environment | Method |
|-------------|--------|
| macOS (현재) | 직접 실행 |
| Gemini 시뮬레이션 | 환경 변수 설정 |
| Claude 시뮬레이션 | 환경 변수 설정 |

### 3.2 Test Script

모든 테스트를 자동으로 실행하는 스크립트:

```bash
#!/bin/bash
# test-gemini-cli-support.sh

PASS=0
FAIL=0

test_case() {
  local id=$1
  local desc=$2
  local cmd=$3
  local expected=$4

  echo -n "[$id] $desc... "
  result=$(eval "$cmd" 2>&1)
  if [[ "$result" == *"$expected"* ]] || [[ "$expected" == "EXISTS" && -n "$result" ]]; then
    echo "PASS"
    ((PASS++))
  else
    echo "FAIL"
    echo "  Expected: $expected"
    echo "  Got: $result"
    ((FAIL++))
  fi
}

echo "=== Gemini CLI Support Test Suite ==="
echo ""

# Unit Tests
echo "--- Unit Tests ---"
# ... test cases

# Integration Tests
echo "--- Integration Tests ---"
# ... test cases

# Regression Tests
echo "--- Regression Tests ---"
# ... test cases

echo ""
echo "=== Results ==="
echo "PASS: $PASS"
echo "FAIL: $FAIL"
```

---

## 4. Pass/Fail Criteria

### 4.1 Individual Test

- **PASS**: 예상 결과와 일치
- **FAIL**: 예상 결과와 불일치 또는 오류 발생

### 4.2 Overall

| Criteria | Threshold |
|----------|-----------|
| Unit Tests | 100% Pass |
| Integration Tests | 100% Pass |
| Regression Tests | 100% Pass |
| **Overall** | **100% Pass Required** |

---

## 5. Test Checklist

### 5.1 Unit Tests

- [ ] U-01: gemini-extension.json 스키마
- [ ] U-02: TOML 파일 20개 존재
- [ ] U-03: TOML 문법 검증
- [ ] U-04: detectPlatform() Claude
- [ ] U-05: detectPlatform() Gemini
- [ ] U-06: isGeminiCli() / isClaudeCode()
- [ ] U-07: getTemplatePath()
- [ ] U-08: detectLevel() CLAUDE.md
- [ ] U-09: detectLevel() GEMINI.md
- [ ] U-10: getPluginPath() / getProjectPath()
- [ ] U-11: Node.js 스크립트 문법
- [ ] U-12: 환경 변수 Fallback

### 5.2 Integration Tests

- [ ] I-01: SessionStart Claude
- [ ] I-02: SessionStart Gemini
- [ ] I-03: BeforeTool 훅
- [ ] I-04: AfterTool 훅
- [ ] I-05: Skills autoActivate
- [ ] I-06: TOML 필수 필드
- [ ] I-07: 다국어 트리거
- [ ] I-08: 템플릿 파일

### 5.3 Regression Tests

- [ ] R-01: Claude 환경 변수
- [ ] R-02: 기존 함수 export
- [ ] R-03: hooks.json 구조
- [ ] R-04: Markdown 명령어

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-23 | Initial test plan | Claude |
