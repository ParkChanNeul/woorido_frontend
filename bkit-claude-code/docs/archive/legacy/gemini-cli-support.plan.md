# Gemini CLI Support Planning Document

> **Summary**: bkit 플러그인을 Gemini CLI에서도 사용할 수 있도록 듀얼 플랫폼 지원 구현
>
> **Project**: bkit-claude-code
> **Version**: 1.3.2 → 1.4.0
> **Author**: POPUP STUDIO
> **Date**: 2026-01-23
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

bkit (Vibecoding Kit) 플러그인을 Claude Code 전용에서 **Claude Code + Gemini CLI 듀얼 플랫폼**으로 확장하여, 더 넓은 사용자층에게 PDCA 방법론과 AI-Native 개발 도구를 제공한다.

### 1.2 Background

- **시장 확대**: Gemini CLI 사용자층 증가 (Google의 공식 AI 코딩 도구)
- **MCP 표준화**: 두 플랫폼 모두 Model Context Protocol 지원으로 ~85% 코드 재사용 가능
- **경쟁 우위**: skill-porter, HuggingFace Skills 등 이미 듀얼 플랫폼 지원 사례 존재
- **사용자 요청**: Gemini CLI 환경에서도 bkit 사용 요청

### 1.3 Related Documents

- bkit 현재 구조 분석 (조사 완료)
- [Gemini CLI Extensions 공식 문서](https://geminicli.com/docs/extensions/)
- [Gemini CLI GitHub 이슈 조사](https://github.com/google-gemini/gemini-cli/issues)
- [skill-porter 참조 구현](https://github.com/jduncan-rva/skill-porter)
- [HuggingFace Skills 참조 구현](https://github.com/huggingface/skills)

---

## 2. Scope

### 2.1 In Scope

- [x] **매니페스트 생성**: `gemini-extension.json` 파일 생성
- [x] **컨텍스트 파일**: `GEMINI.md` 생성 (instructions/ 기반)
- [x] **명령어 변환**: 20개 commands를 TOML 형식으로 변환
- [x] **스킬 호환**: 18개 skills의 Gemini 호환성 확보
- [x] **훅 변환**: hooks.json을 Gemini 형식으로 변환
- [x] **스크립트 호환**: 21개 Node.js 스크립트의 환경 변수 호환
- [x] **문서 업데이트**: README, 설치 가이드 업데이트
- [x] **테스트**: 양 플랫폼에서 기능 검증

### 2.2 Out of Scope

- **Agents 시스템**: Gemini CLI에는 별도 Agent 시스템이 없음 (Skills로 대체)
- **MCP 서버 개발**: 별도 MCP 서버 개발 없이 기존 기능 활용
- **skill-porter 사용**: 수동 변환으로 품질 관리
- **Gemini 전용 기능**: Gemini만의 특수 기능 추가 (향후 과제)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Gemini CLI에서 `gemini extensions install` 명령으로 설치 가능 | High | Pending |
| FR-02 | 20개 명령어 모두 `/command` 형식으로 실행 가능 | High | Pending |
| FR-03 | 18개 스킬이 자동 또는 수동으로 활성화됨 | High | Pending |
| FR-04 | SessionStart 훅이 세션 시작 시 실행됨 | High | Pending |
| FR-05 | PreToolUse/PostToolUse 훅이 도구 사용 시 실행됨 | Medium | Pending |
| FR-06 | PDCA 문서 생성 템플릿이 정상 작동 | High | Pending |
| FR-07 | 프로젝트 레벨 감지 (Starter/Dynamic/Enterprise) 정상 작동 | Medium | Pending |
| FR-08 | 다국어 트리거 키워드 정상 작동 | Medium | Pending |
| FR-09 | Claude Code에서 기존 기능 유지 (regression 없음) | High | Pending |
| FR-10 | GitHub에서 직접 설치 가능 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 호환성 | Windows, macOS, Linux 모두 지원 | 각 OS에서 설치/실행 테스트 |
| 성능 | SessionStart 훅 5초 이내 완료 | timeout 설정 검증 |
| 유지보수성 | 코드 재사용률 85% 이상 | 중복 코드 분석 |
| 문서화 | README에 양 플랫폼 설치 방법 명시 | 문서 검토 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `gemini extensions install` 명령으로 설치 성공
- [ ] 모든 20개 명령어가 Gemini CLI에서 실행됨
- [ ] SessionStart 훅이 정상 작동
- [ ] PDCA 워크플로우 전체 테스트 통과
- [ ] Claude Code에서 기존 기능 regression 없음
- [ ] README 업데이트 완료
- [ ] 양 플랫폼에서 E2E 테스트 통과

### 4.2 Quality Criteria

- [ ] 모든 TOML 명령어 문법 검증 통과
- [ ] gemini-extension.json 스키마 검증 통과
- [ ] Cross-platform 경로 처리 검증
- [ ] 환경 변수 호환성 검증

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Gemini Hooks 실험적 기능** | High | High | `enableHooks: true` 설정 필수 문서화, 대체 방안 준비 |
| **TOML 명령어 로드 실패 (#14453)** | High | Medium | 명령어 로드 테스트 자동화, 경로 권한 검증 |
| **Windows 경로 처리 문제** | Medium | High | path 모듈 사용 철저히, Unix 경로 제거 |
| **MCP 비대화형 모드 이슈 (#17371)** | Medium | Medium | 초기화 대기 로직 추가 |
| **확장 설정 유실 (#12704)** | Low | Medium | .env 백업 로직, 사용자 가이드 제공 |
| **API 변경 가능성** | Medium | Medium | Gemini CLI 버전 명시, 호환성 레이어 |

---

## 6. Architecture Considerations

### 6.1 듀얼 플랫폼 구조

```
bkit/
├── .claude-plugin/              # Claude Code 전용
│   ├── plugin.json
│   └── marketplace.json
├── gemini-extension.json        # Gemini CLI 전용 (NEW)
├── GEMINI.md                    # Gemini CLI 컨텍스트 (NEW)
├── commands/
│   ├── *.md                     # Claude Code용 (기존)
│   └── *.toml                   # Gemini CLI용 (NEW)
├── skills/                      # 공유 (SKILL.md 형식 호환)
├── agents/                      # Claude Code 전용 (유지)
├── hooks/
│   └── hooks.json              # 양쪽 형식 지원 필요
├── scripts/                     # 공유 (Node.js)
├── lib/
│   └── common.js               # 공유 (환경변수 분기)
└── templates/                   # 공유
```

### 6.2 환경 변수 매핑

| Claude Code | Gemini CLI | 용도 |
|-------------|------------|------|
| `CLAUDE_PLUGIN_ROOT` | `${extensionPath}` | 플러그인 설치 경로 |
| `CLAUDE_PROJECT_DIR` | `GEMINI_PROJECT_DIR` (+ `CLAUDE_PROJECT_DIR` 별칭) | 프로젝트 루트 |
| - | `GEMINI_SESSION_ID` | 세션 ID |
| - | `GEMINI_CWD` | 현재 작업 디렉토리 |

### 6.3 Hooks 매핑

| Claude Code | Gemini CLI | 비고 |
|-------------|------------|------|
| `SessionStart` | `SessionStart` | 동일 |
| `PreToolUse` | `BeforeTool` | 이름 변경 |
| `PostToolUse` | `AfterTool` | 이름 변경 |
| - | `BeforeModel` | Gemini 전용 (미사용) |
| - | `AfterModel` | Gemini 전용 (미사용) |
| - | `BeforeAgent` | Gemini 전용 (미사용) |
| - | `AfterAgent` | Gemini 전용 (미사용) |

### 6.4 Commands 변환 규칙

**Claude Code (Markdown)**:
```markdown
---
name: pdca-status
description: Check PDCA progress
allowed-tools:
  - Read
  - Glob
---
# Instructions...
```

**Gemini CLI (TOML)**:
```toml
# pdca-status.toml
prompt = """
# pdca-status
Check PDCA progress...
"""
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] Node.js 스크립트 표준 (v1.3.1에서 완료)
- [x] Cross-platform 경로 처리 (lib/common.js)
- [x] JSON 스키마 검증 사용

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **TOML 명령어 형식** | missing | 표준 템플릿 정의 | High |
| **환경 변수 분기** | partial | 플랫폼 감지 로직 | High |
| **Hooks JSON 형식** | Claude only | Gemini 호환 형식 | High |
| **설치 문서** | Claude only | 듀얼 플랫폼 가이드 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `GEMINI_PROJECT_DIR` | 프로젝트 루트 (Gemini) | Runtime | ☐ (자동) |
| `CLAUDE_PROJECT_DIR` | 프로젝트 루트 (Claude/호환) | Runtime | ☐ (자동) |
| `BKIT_PLATFORM` | 플랫폼 감지 | Internal | ☑ |

---

## 8. Implementation Phases

### Phase 1: 기본 구조 생성 (Core)
1. `gemini-extension.json` 생성
2. `GEMINI.md` 생성 (instructions/ 통합)
3. lib/common.js 환경 변수 분기 추가

### Phase 2: Commands 변환
1. 20개 명령어를 TOML 형식으로 변환
2. commands/ 폴더에 `.toml` 파일 추가
3. 명령어 네임스페이스 정의

### Phase 3: Hooks 변환
1. hooks/hooks.json Gemini 형식 추가
2. 스크립트 환경 변수 호환성 확보
3. BeforeTool/AfterTool 매핑

### Phase 4: Skills 호환성
1. SKILL.md frontmatter Gemini 호환 검증
2. 트리거 키워드 작동 확인
3. 조건부 활성화 테스트

### Phase 5: 테스트 및 문서화
1. 양 플랫폼 설치 테스트
2. PDCA 워크플로우 E2E 테스트
3. README 업데이트
4. 설치 가이드 작성

---

## 9. Component Mapping (90개)

### 9.1 공유 가능 (변환 불필요)

| Component | Count | Reason |
|-----------|-------|--------|
| Scripts (Node.js) | 21 | 환경 변수 분기만 추가 |
| Templates | 20 | 플랫폼 무관 |
| lib/common.js | 1 | 환경 변수 분기만 추가 |
| bkit.config.json | 1 | 플랫폼 무관 |
| Skills (SKILL.md) | 18 | frontmatter 호환 |

### 9.2 변환 필요

| Component | Count | Claude Format | Gemini Format |
|-----------|-------|---------------|---------------|
| Commands | 20 | `.md` (Markdown) | `.toml` (TOML) |
| Hooks config | 1 | `hooks.json` | `hooks/hooks.json` (다른 구조) |
| Manifest | 1 | `plugin.json` | `gemini-extension.json` |
| Context | 0→1 | (instructions/) | `GEMINI.md` |

### 9.3 Claude Code 전용 (유지)

| Component | Count | Reason |
|-----------|-------|--------|
| Agents | 11 | Gemini에 Agent 시스템 없음 |
| marketplace.json | 1 | Claude 마켓플레이스 전용 |

---

## 10. Gemini CLI 주의사항 (GitHub 이슈 기반)

### 10.1 Critical Issues

| Issue | Description | Mitigation |
|-------|-------------|------------|
| #14453 | Custom commands 로드 실패 | 경로 권한 검증, 테스트 자동화 |
| #14932 | Hooks 작동 안함 | `enableHooks: true` 문서화 |
| #17371 | MCP 비대화형 모드 문제 | 초기화 대기 로직 |
| #12704 | 설정 유실 | .env 백업 가이드 |

### 10.2 Cross-platform Issues

| Issue | Platform | Mitigation |
|-------|----------|------------|
| #12373 | Windows | Shell 명령어 호환성 검증 |
| #15193 | Windows | `/dev/tty` 같은 Unix 경로 제거 |
| #16129 | Windows | 개행 문자 정규화 |
| #12678 | Windows | PowerShell/Git Bash 분기 |

### 10.3 Required Settings

```json
// ~/.gemini/settings.json
{
  "tools": {
    "enableHooks": true
  }
}
```

---

## 11. Next Steps

1. [ ] **Plan 문서 리뷰** (현재)
2. [ ] **Design 문서 작성** (다음)
   - gemini-extension.json 상세 스키마
   - TOML 명령어 변환 규칙
   - Hooks 변환 규칙
   - 테스트 계획
3. [ ] Team review and approval
4. [ ] Implementation 시작

---

## 12. Estimated Effort

| Phase | Components | Estimated Files |
|-------|------------|-----------------|
| Phase 1 (Core) | 3개 파일 생성 | 3 |
| Phase 2 (Commands) | 20개 TOML 변환 | 20 |
| Phase 3 (Hooks) | 1개 파일 수정, 21개 스크립트 검토 | 22 |
| Phase 4 (Skills) | 18개 검증 | 18 |
| Phase 5 (Docs) | README, 가이드 | 3 |
| **Total** | - | **~66개 파일** |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-23 | Initial draft | Claude |
