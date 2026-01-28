# Plan: Gemini CLI Hook Support Fix

> **Feature**: gemini-cli-hook-fix
> **Author**: bkit-agent
> **Date**: 2026-01-24
> **Status**: Planning

## 1. Executive Summary
현재 `bkit` 플러그인은 Claude Code 환경에 최적화되어 있으며, Gemini CLI 환경에서는 훅(Hook)의 출력이 JSON 형식 그대로 노출되거나 의도한 대로 동작하지 않는 문제가 식별되었습니다. 본 계획은 `lib/common.js` 및 주요 훅 스크립트를 리팩토링하여 Gemini CLI 환경에서 사용자 친화적인 메시지 출력과 올바른 동작을 보장하는 것을 목표로 합니다.

## 2. Problem Statement
- **가독성 문제**: `SessionStart` 훅 실행 시 Gemini CLI 사용자에게 Claude Code용 JSON 객체가 그대로 출력됨.
- **호환성 문제**: `outputAllow`, `outputBlock` 함수가 Claude Code 전용 JSON 스키마(`hookSpecificOutput`)를 반환하여 Gemini CLI가 이를 해석하지 못할 가능성이 높음.
- **플랫폼 파편화**: 단일 코드베이스에서 두 플랫폼의 상이한 입출력 방식을 처리하기 위한 추상화 계층이 불완전함.

## 3. Objectives
1. **Platform-Aware Output**: `lib/common.js`에서 실행 플랫폼(`BKIT_PLATFORM`)을 감지하여 적절한 출력 포맷(JSON vs Plain Text)을 자동 선택.
2. **Interactive Session Start**: Gemini CLI에서 세션 시작 시 명확한 텍스트 가이드와 도움말 제공.
3. **Seamless Tool Hooks**: `BeforeTool`/`AfterTool` 훅이 Gemini CLI에서도 적절한 컨텍스트 가이드(PDCA 알림 등)를 제공하도록 개선.

## 4. Scope
### In Scope
- `lib/common.js`: 출력 유틸리티(`outputAllow`, `outputBlock`, `outputEmpty`) 리팩토링.
- `hooks/session-start.js`: Gemini CLI용 분기 처리 추가.
- `scripts/*.js`: 공통 라이브러리 변경에 따른 영향도 확인 (대부분 `lib/common.js` 의존하므로 자동 해결 예상).

### Out of Scope
- Gemini CLI 자체의 익스텐션 로딩 로직 수정 (플러그인 코드 수정에 집중).
- Claude Code 관련 로직 변경 (기존 동작 유지 필수).

## 5. Implementation Strategy
1. **Analyze**: `lib/common.js`의 출력 로직 분석 (완료).
2. **Design**: 플랫폼별 출력 전략 설계 문서 작성.
3. **Develop**:
    - `lib/common.js` 수정.
    - `hooks/session-start.js` 수정.
4. **Verify**: 테스트 스크립트를 통한 듀얼 플랫폼 출력 검증.

## 6. Milestones
- [x] Gap Analysis (Done)
- [ ] Design Document Creation
- [ ] Implementation
- [ ] Verification
