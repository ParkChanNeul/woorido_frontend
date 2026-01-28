# Design: Gemini CLI Hook Support Fix

> **Feature**: gemini-cli-hook-fix
> **Author**: bkit-agent
> **Date**: 2026-01-24
> **Plan**: [gemini-cli-hook-fix.plan.md](../../01-plan/features/gemini-cli-hook-fix.plan.md)

## 1. Overview
Gemini CLI 환경에서 `bkit` 플러그인의 훅 스크립트들이 JSON 대신 사용자 친화적인 텍스트(ANSI Color 지원)를 출력하도록 `lib/common.js`의 출력 함수들을 다형성(Polymorphism) 있게 개선합니다.

## 2. Architecture Changes

### 2.1 `lib/common.js` Output System
기존의 단일 JSON 출력 방식을 플랫폼 감지 기반의 분기 로직으로 변경합니다.

```javascript
// Pseudo-code for outputAllow
function outputAllow(context) {
  if (isClaudeCode()) {
    // Existing JSON format
    console.log(JSON.stringify({ ... }));
  } else {
    // Gemini CLI format
    if (context) console.log(formatForGemini(context));
    process.exit(0);
  }
}
```

### 2.2 `hooks/session-start.js`
`SessionStart` 이벤트는 사용자와의 첫 접점이므로 플랫폼별로 완전히 다른 경험을 제공합니다.

- **Claude Code**: Tool Call을 유도하기 위한 메타데이터 JSON 반환.
- **Gemini CLI**: 즉시 읽을 수 있는 환영 메시지와 시작 가이드(명령어 목록) 출력.

## 3. Detailed Design

### 3.1 Output Functions (`lib/common.js`)

| Function | Claude Code Behavior | Gemini CLI Behavior |
|----------|----------------------|---------------------|
| `outputAllow(msg)` | Print JSON `{ decision: 'allow', ... }` | Print `msg` (with colors) to stdout, Exit 0 |
| `outputBlock(reason)` | Print JSON `{ decision: 'block', ... }`, Exit 2 | Print `🔴 Blocked: reason` to stderr, Exit 1 |
| `outputEmpty()` | Print `{}` | Do nothing, Exit 0 |

### 3.2 Session Start Message (`hooks/session-start.js`)

Gemini CLI용 출력 템플릿:
```text
🤖 bkit Vibecoding Kit v1.4.0 (Gemini CLI)
===========================================
PDCA Cycle & AI-Native Development Environment

[권장 시작 명령]
- 🆕 프로젝트 시작: /init-starter
- 📚 학습 가이드: /pipeline-start
- 🔄 작업 재개: /pdca-status
...
```

### 3.3 Visual Enhancements
- Gemini CLI 출력 시 **ANSI Escape Codes**를 사용하여 가독성 확보.
- `\x1b[36m` (Cyan): 제목
- `\x1b[33m` (Yellow): 중요 강조
- `\x1b[31m` (Red): 에러/차단

## 4. Impact Analysis
- **scripts/pre-write.js**: `outputAllow` 변경으로 인해 Gemini에서 파일 저장 시 PDCA 가이드가 터미널에 텍스트로 표시됨. (긍정적 효과)
- **scripts/pdca-post-write.js**: 저장 후 분석 제안 메시지가 터미널에 표시됨. (긍정적 효과)
- **scripts/qa-pre-bash.js**: 위험 명령어 차단 시 명확한 에러 메시지와 함께 실행 중단.

## 5. Verification Plan
1. `BKIT_PLATFORM=gemini` 환경 변수 설정 후 스크립트 실행.
2. 출력값이 JSON이 아닌 텍스트인지 확인.
3. `outputBlock` 호출 시 종료 코드(Exit Code)가 0이 아닌지 확인.
