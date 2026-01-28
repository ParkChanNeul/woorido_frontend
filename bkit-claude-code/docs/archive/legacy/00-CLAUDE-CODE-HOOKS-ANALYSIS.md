# Claude Code Hooks 분석 문서

> **분석 대상 버전**: Claude Code v2.1.7 (2025년 1월 기준)
> **작성일**: 2026-01-15
> **목적**: Hooks 시스템의 동작 방식, 알려진 이슈, 안정적인 사용 방법 정리

---

## 1. Hooks 개요

Claude Code Hooks는 특정 이벤트(도구 실행, 프롬프트 제출, 세션 시작 등)에 반응하여 **결정적(deterministic) 응답**을 수행할 수 있는 메커니즘입니다.

### 1.1 사용 가능한 Hook 이벤트

| 이벤트 | 발동 시점 | 도입 버전 |
|--------|----------|----------|
| `SessionStart` | 세션 시작 시 | - |
| `SessionEnd` | 세션 종료 시 | - |
| `UserPromptSubmit` | 사용자 프롬프트 제출 직후 | - |
| `PreToolUse` | 도구 실행 전 | - |
| `PostToolUse` | 도구 실행 완료 후 | - |
| `PermissionRequest` | 권한 요청 시 | v2.0.45+ |
| `Stop` | Claude 응답 완료 후 | - |
| `SubagentStop` | 서브에이전트 완료 후 | v1.0.41+ |
| `PreCompact` | 컨텍스트 압축 전 | - |
| `Notification` | Claude가 알림 전송 시 | - |

### 1.2 설정 파일 위치

| 위치 | 범위 | 공유 |
|------|------|------|
| `.claude/settings.json` | 프로젝트 레벨 | 팀과 공유 가능 |
| `.claude/settings.local.json` | 프로젝트 레벨 | 개인용 (커밋 제외) |
| `~/.claude/settings.json` | 사용자 레벨 | 모든 프로젝트에 적용 |

---

## 2. Hook Type 비교

### 2.1 Command Type

쉘 명령어를 실행하고 stdin으로 JSON 컨텍스트를 받습니다.

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "python3 ./hooks/inject-context.py"
      }]
    }]
  }
}
```

**특징:**
- 모든 이벤트에서 지원
- stdin으로 hook context JSON 수신
- stdout/stderr + exit code로 결과 반환

### 2.2 Prompt Type

LLM(Haiku 또는 Sonnet)이 조건을 평가합니다.

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "model": "sonnet",
        "prompt": "사용자의 모든 요청이 완료되었는지 평가하세요."
      }]
    }]
  }
}
```

**특징:**
- **Stop, SubagentStop에서만 지원**
- Claude Code 내부 평가 프롬프트로 자동 래핑
- 응답은 `{"ok": true/false, "reason": "..."}` 형식으로 변환됨

---

## 3. Exit Code별 동작 (공식 문서 기준)

| Exit Code | stdout 처리 | stderr 처리 | 동작 |
|-----------|------------|-------------|------|
| **0** | JSON 파싱 시도 | 무시 | 정상 진행 |
| **2** | **완전히 무시** | Claude에 에러로 전달 | 차단 (blocking error) |
| **기타** | 무시 | verbose 모드에서만 표시 | 비차단 (non-blocking) |

> **중요**: JSON 출력은 **exit code 0일 때만** 파싱됩니다.

---

## 4. 이벤트별 JSON 응답 형식

### 4.1 UserPromptSubmit

#### Context 주입 (Plain Text - 권장)
```bash
#!/bin/bash
# stdout으로 출력한 텍스트가 자동으로 Claude context에 추가됨
cat ./project-context.md
exit 0
```

#### Context 주입 (JSON 방식)
```json
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "주입할 컨텍스트 내용"
  }
}
```

#### 프롬프트 차단
```json
{
  "decision": "block",
  "reason": "이 작업은 허용되지 않습니다"
}
```
- 프롬프트가 context에서 완전히 제거됨
- `reason`은 사용자에게만 표시 (Claude에게 전달 안됨)

### 4.2 PreToolUse / PermissionRequest

```json
{
  "decision": "allow" | "deny" | "ask",
  "reason": "결정 이유"
}
```

| Decision | 동작 |
|----------|------|
| `allow` | 권한 시스템 우회, 즉시 실행 |
| `deny` | 도구 호출 차단, reason을 Claude에 전달 |
| `ask` | 사용자에게 확인 요청 |

#### 도구 입력 수정 (v2.0.10+)
```json
{
  "decision": "allow",
  "updatedInput": {
    "file_path": "/safe/path/file.txt"
  }
}
```

### 4.3 PostToolUse

```json
{
  "decision": "block",
  "reason": "도구 실행 결과에 문제가 있습니다"
}
```

### 4.4 Stop / SubagentStop

#### Command Type 사용 시
```json
{
  "continue": true,
  "stopReason": "테스트가 아직 실행되지 않았습니다"
}
```

| 필드 | 설명 |
|------|------|
| `continue` | `true`면 Claude가 계속 작업 |
| `stopReason` | `continue: false`일 때 표시 메시지 |
| `suppressOutput` | transcript에서 출력 숨김 |
| `systemMessage` | 사용자에게 표시할 경고 메시지 |

#### Prompt Type 사용 시 (내부 스키마)
```json
// 작업 완료 → 종료
{"ok": true}

// 작업 미완료 → 계속 진행 강제
{"ok": false, "reason": "테스트가 통과하지 않았습니다"}
```

> **주의**: `{"decision": "approve"}` 형식은 작동하지 않음. 반드시 `{"ok": boolean}` 스키마 사용

---

## 5. 알려진 이슈 및 버그 (v2.1.7 기준)

### 5.1 심각한 버그 (해결되지 않음)

| 이슈 | 내용 | 상태 | 영향 |
|------|------|------|------|
| [#13155](https://github.com/anthropics/claude-code/issues/13155) | **Plugin에서 `type: "prompt"` hook 완전히 무시됨** | 🔴 Open | 높음 |
| [#11544](https://github.com/anthropics/claude-code/issues/11544) | settings.json의 hooks가 로드되지 않음 | 🔴 Open | 높음 |
| [#8810](https://github.com/anthropics/claude-code/issues/8810) | 하위 디렉토리에서 UserPromptSubmit 작동 안함 | 🔴 Open | 중간 |
| [#5176](https://github.com/anthropics/claude-code/issues/5176) | `cd` 명령 후 hooks 경로를 찾지 못함 | 🔴 Open | 중간 |

### 5.2 해결된 버그

| 이슈 | 내용 | 해결 버전 |
|------|------|----------|
| [#14281](https://github.com/anthropics/claude-code/issues/14281) | additionalContext 중복 주입 | v2.1 |
| [#10814](https://github.com/anthropics/claude-code/issues/10814) | v2.0.31 hooks 전체 고장 (regression) | v2.0.32+ |
| [#10936](https://github.com/anthropics/claude-code/issues/10936) | 성공한 hook이 "hook error"로 표시 | 수정됨 |

### 5.3 버전별 안정성 이력

```
v2.0.25  ✅ hooks 정상 작동
v2.0.27-29  ❌ hooks 고장
v2.0.30  ✅ 수정됨
v2.0.31  ❌ regression 발생
v2.0.32+  ✅ 수정됨
v2.1.x  ✅ additionalContext 중복 버그 수정
```

---

## 6. 안정적인 사용 권장 사항

### 6.1 권장하는 방식

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "cat $CLAUDE_PROJECT_DIR/context/project-info.md"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "python3 $CLAUDE_PROJECT_DIR/hooks/check-completion.py"
      }]
    }]
  }
}
```

### 6.2 권장 사항 체크리스트

| 항목 | 권장 | 이유 |
|------|------|------|
| Hook Type | `type: "command"` | prompt type은 plugin에서 버그 |
| 경로 | 절대 경로 또는 `$CLAUDE_PROJECT_DIR` | cd 후 경로 문제 회피 |
| Context 주입 | Plain text stdout | JSON 파싱 이슈 회피 |
| Exit Code | 0 또는 2만 사용 | 동작이 명확함 |
| Model (prompt type) | `sonnet` | Haiku는 불안정 |

### 6.3 피해야 할 패턴

```json
// ❌ Plugin에서 prompt type 사용 - 무시될 수 있음
{
  "type": "prompt",
  "prompt": "..."
}

// ❌ 상대 경로 사용 - cd 후 실패
{
  "command": "./hooks/check.py"
}

// ❌ Stop hook에서 잘못된 JSON 스키마
{
  "decision": "approve"  // ❌ 작동 안함
}

// ✅ 올바른 방식
{
  "ok": true  // ✅ 또는 {"ok": false, "reason": "..."}
}
```

---

## 7. 대화 간섭 및 응답 강제 방법 정리

### 7.1 Context Injection (대화 간섭)

| 방법 | Hook | 구현 |
|------|------|------|
| 세션 시작 시 주입 | `SessionStart` | stdout → context |
| 매 프롬프트마다 주입 | `UserPromptSubmit` | stdout → context |
| 도구 실행 후 주입 | `PostToolUse` | additionalContext |

**예시: 매 프롬프트마다 프로젝트 컨텍스트 주입**
```json
{
  "UserPromptSubmit": [{
    "hooks": [{
      "type": "command",
      "command": "echo '## 프로젝트 규칙\n- 테스트 필수\n- 한글 주석 사용'"
    }]
  }]
}
```

### 7.2 응답 강제 (Continue)

**Claude가 계속 작업하도록 강제하는 Stop Hook:**

```python
#!/usr/bin/env python3
# hooks/check-completion.py
import sys
import json

# stdin에서 hook context 읽기
context = json.load(sys.stdin)
transcript = context.get('transcript', [])

# 조건 검사 (예: 테스트 실행 여부)
has_test_run = any('npm test' in str(msg) or 'pytest' in str(msg)
                   for msg in transcript)

if not has_test_run:
    # Claude가 계속 작업하도록 강제
    print(json.dumps({
        "continue": True,
        "stopReason": "테스트가 아직 실행되지 않았습니다. 테스트를 실행해주세요."
    }))
else:
    # 종료 허용
    print(json.dumps({"continue": False}))
```

### 7.3 프롬프트 차단

```python
#!/usr/bin/env python3
# hooks/validate-prompt.py
import sys
import json

context = json.load(sys.stdin)
prompt = context.get('prompt', '')

# 위험한 키워드 검사
dangerous_keywords = ['rm -rf', 'DROP TABLE', 'format']
for keyword in dangerous_keywords:
    if keyword.lower() in prompt.lower():
        print(json.dumps({
            "decision": "block",
            "reason": f"위험한 명령어 '{keyword}'가 감지되었습니다."
        }))
        sys.exit(0)

# 정상 진행
sys.exit(0)
```

---

## 8. 참고 자료

### 공식 문서
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Blog - How to Configure Hooks](https://claude.com/blog/how-to-configure-hooks)

### GitHub Issues
- [#13155 - Prompt hooks ignored in plugins](https://github.com/anthropics/claude-code/issues/13155)
- [#14281 - additionalContext duplication](https://github.com/anthropics/claude-code/issues/14281)
- [#11544 - Hooks not loading](https://github.com/anthropics/claude-code/issues/11544)
- [#11947 - Stop hook JSON format](https://github.com/anthropics/claude-code/issues/11947)

### 커뮤니티 자료
- [Claude Code Hooks Mastery (GitHub)](https://github.com/disler/claude-code-hooks-mastery)
- [ClaudeLog - Hooks Guide](https://claudelog.com/mechanics/hooks/)

---

## 9. 결론

Claude Code Hooks 시스템은 강력한 기능을 제공하지만, **불안정한 부분이 존재**합니다.

### 안정적 사용을 위한 핵심 원칙:
1. **`type: "command"`만 사용** (prompt type은 plugin에서 버그)
2. **절대 경로 사용** (`$CLAUDE_PROJECT_DIR` 활용)
3. **Plain text stdout** 선호 (JSON 파싱 이슈 회피)
4. **버전 업그레이드 전 릴리스 노트 확인** (regression 가능성)

### bkit 플러그인에서의 적용:
현재 bkit 플러그인은 `type: "command"`를 사용하여 안정성을 확보하고 있으며, Stop hook에서의 PDCA 강제는 command type으로 구현되어 있습니다.
