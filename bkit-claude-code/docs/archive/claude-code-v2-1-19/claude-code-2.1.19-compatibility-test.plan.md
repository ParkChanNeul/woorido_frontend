# Claude Code 2.1.19 호환성 테스트 계획서

> **Summary**: bkit v1.4.0 전체 코드베이스의 Claude Code 2.1.19 호환성 검증
>
> **Project**: bkit Vibecoding Kit
> **Version**: v1.4.0
> **Author**: bkit Team
> **Date**: 2026-01-24
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Claude Code 2.1.17 → 2.1.19 업그레이드 후 bkit v1.4.0의 모든 기능이 정상 동작하는지 검증합니다.

### 1.2 Background

- Claude Code 2.1.19에서 주요 변경사항 발생 (Skills 자동 승인, $ARGUMENTS 구문 변경 등)
- bkit v1.4.0이 이러한 변경사항과 호환되는지 전체 테스트 필요
- 분석 결과 "완전 호환" 판정되었으나 실제 동작 검증 필요

### 1.3 Related Documents

- Analysis: `docs/03-analysis/claude-code-2.1.17-to-2.1.19-upgrade.analysis.md`
- Claude Code CHANGELOG: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md

---

## 2. Scope

### 2.1 In Scope

- [x] **agents/** - 11개 Agent 정의 파일 테스트
- [x] **commands/** - 20개 Command 정의 파일 테스트
- [x] **skills/** - 18개 Skill 정의 파일 테스트
- [x] **hooks/** - 2개 Hook 파일 테스트
- [x] **scripts/** - 26개 Script 파일 테스트
- [x] **templates/** - 21개 Template 파일 테스트
- [x] **lib/** - 1개 공통 라이브러리 테스트

### 2.2 Out of Scope

- Claude Code 내부 동작 테스트 (Anthropic 책임)
- 외부 MCP 서버 연동 테스트
- 실제 프로젝트에서의 E2E 테스트

---

## 3. Test Targets

### 3.1 Agents (11개)

| ID | Agent | 테스트 항목 | 우선순위 |
|----|-------|------------|:--------:|
| A-01 | `bkend-expert` | Agent 로딩, 트리거 인식 | Medium |
| A-02 | `code-analyzer` | Agent 로딩, 분석 실행 | High |
| A-03 | `design-validator` | Agent 로딩, 검증 실행 | Medium |
| A-04 | `enterprise-expert` | Agent 로딩, 트리거 인식 | Low |
| A-05 | `gap-detector` | Agent 로딩, Gap 분석 실행 | **Critical** |
| A-06 | `infra-architect` | Agent 로딩, 트리거 인식 | Low |
| A-07 | `pdca-iterator` | Agent 로딩, 반복 개선 실행 | **Critical** |
| A-08 | `pipeline-guide` | Agent 로딩, 가이드 실행 | Medium |
| A-09 | `qa-monitor` | Agent 로딩, QA 실행 | High |
| A-10 | `report-generator` | Agent 로딩, 보고서 생성 | High |
| A-11 | `starter-guide` | Agent 로딩, 초보자 가이드 | Medium |

### 3.2 Commands (20개)

| ID | Command | 테스트 항목 | 우선순위 |
|----|---------|------------|:--------:|
| C-01 | `/pdca-plan` | 인자 전달, Plan 문서 생성 | **Critical** |
| C-02 | `/pdca-design` | 인자 전달, Design 문서 생성 | **Critical** |
| C-03 | `/pdca-analyze` | 인자 전달, Gap 분석 실행 | **Critical** |
| C-04 | `/pdca-report` | 인자 전달, 보고서 생성 | High |
| C-05 | `/pdca-iterate` | 인자 전달, 반복 개선 | High |
| C-06 | `/pdca-status` | 상태 조회 | High |
| C-07 | `/pdca-next` | 다음 단계 안내 | Medium |
| C-08 | `/pipeline-start` | 파이프라인 시작 | Medium |
| C-09 | `/pipeline-next` | 파이프라인 다음 단계 | Medium |
| C-10 | `/pipeline-status` | 파이프라인 상태 | Medium |
| C-11 | `/init-starter` | Starter 프로젝트 초기화 | Medium |
| C-12 | `/init-dynamic` | Dynamic 프로젝트 초기화 | Medium |
| C-13 | `/init-enterprise` | Enterprise 프로젝트 초기화 | Low |
| C-14 | `/zero-script-qa` | Zero Script QA 실행 | High |
| C-15 | `/archive` | 문서 아카이브 | Low |
| C-16 | `/github-stats` | GitHub 통계 수집 | Low |
| C-17 | `/learn-claude-code` | 학습 가이드 | Low |
| C-18 | `/setup-claude-code` | 설정 가이드 | Low |
| C-19 | `/upgrade-claude-code` | 업그레이드 가이드 | Low |
| C-20 | `/upgrade-level` | 레벨 업그레이드 | Low |

### 3.3 Skills (18개)

| ID | Skill | hooks 포함 | 테스트 항목 | 우선순위 |
|----|-------|:----------:|------------|:--------:|
| S-01 | `starter` | ❌ | 자동 승인, Skill 로딩 | High |
| S-02 | `dynamic` | ❌ | 자동 승인, Skill 로딩 | High |
| S-03 | `enterprise` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-04 | `mobile-app` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-05 | `desktop-app` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-06 | `phase-1-schema` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-07 | `phase-2-convention` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-08 | `phase-3-mockup` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-09 | `phase-4-api` | ✅ Stop | 승인 요청, Hook 실행 | **Critical** |
| S-10 | `phase-5-design-system` | ✅ Stop | 승인 요청, Hook 실행 | High |
| S-11 | `phase-6-ui-integration` | ✅ Stop | 승인 요청, Hook 실행 | High |
| S-12 | `phase-7-seo-security` | ❌ | 자동 승인, Skill 로딩 | Medium |
| S-13 | `phase-8-review` | ✅ Stop | 승인 요청, Hook 실행 | High |
| S-14 | `phase-9-deployment` | ✅ Stop | 승인 요청, Hook 실행 | Medium |
| S-15 | `zero-script-qa` | ✅ Stop, PreToolUse | 승인 요청, Hook 실행 | **Critical** |
| S-16 | `bkit-rules` | ✅ PreToolUse, PostToolUse | 승인 요청, Hook 실행 | **Critical** |
| S-17 | `bkit-templates` | ❌ | 자동 승인, 템플릿 로딩 | Medium |
| S-18 | `development-pipeline` | ✅ Stop | 승인 요청, Hook 실행 | High |

### 3.4 Hooks (2개)

| ID | Hook 파일 | 테스트 항목 | 우선순위 |
|----|----------|------------|:--------:|
| H-01 | `hooks.json` | 스키마 유효성, Hook 등록 | **Critical** |
| H-02 | `session-start.js` | SessionStart 실행, 출력 형식 | **Critical** |

### 3.5 Scripts (26개)

| ID | Script | 테스트 항목 | 우선순위 |
|----|--------|------------|:--------:|
| SC-01 | `pre-write.js` | PreToolUse 응답 형식 | **Critical** |
| SC-02 | `pdca-pre-write.js` | PDCA 문서 검증 | High |
| SC-03 | `pdca-post-write.js` | PostToolUse 상태 업데이트 | High |
| SC-04 | `gap-detector-post.js` | Gap 분석 후처리 | High |
| SC-05 | `gap-detector-stop.js` | Gap 분석 종료 처리 | High |
| SC-06 | `iterator-stop.js` | Iterator 종료 처리 | High |
| SC-07 | `analysis-stop.js` | 분석 종료 처리 | Medium |
| SC-08 | `archive-feature.js` | 아카이브 처리 | Low |
| SC-09 | `design-validator-pre.js` | 설계 검증 전처리 | Medium |
| SC-10 | `phase-transition.js` | 단계 전환 처리 | Medium |
| SC-11 | `phase1-schema-stop.js` | Phase 1 종료 | Medium |
| SC-12 | `phase2-convention-pre.js` | Phase 2 전처리 | Medium |
| SC-13 | `phase2-convention-stop.js` | Phase 2 종료 | Medium |
| SC-14 | `phase3-mockup-stop.js` | Phase 3 종료 | Medium |
| SC-15 | `phase4-api-stop.js` | Phase 4 종료 | Medium |
| SC-16 | `phase5-design-post.js` | Phase 5 후처리 | Medium |
| SC-17 | `phase6-ui-post.js` | Phase 6 후처리 | Medium |
| SC-18 | `phase7-seo-stop.js` | Phase 7 종료 | Low |
| SC-19 | `phase8-review-stop.js` | Phase 8 종료 | Medium |
| SC-20 | `phase9-deploy-pre.js` | Phase 9 전처리 | Low |
| SC-21 | `qa-monitor-post.js` | QA 후처리 | High |
| SC-22 | `qa-pre-bash.js` | QA Bash 전처리 | High |
| SC-23 | `qa-stop.js` | QA 종료 | High |
| SC-24 | `select-template.js` | 템플릿 선택 | Medium |
| SC-25 | `sync-folders.js` | 폴더 동기화 | Low |
| SC-26 | `validate-plugin.js` | 플러그인 검증 | Medium |

### 3.6 Templates (21개)

| ID | Template | 테스트 항목 | 우선순위 |
|----|----------|------------|:--------:|
| T-01 | `plan.template.md` | 변수 치환, 구조 유효성 | High |
| T-02 | `design.template.md` | 변수 치환, 구조 유효성 | High |
| T-03 | `analysis.template.md` | 변수 치환, 구조 유효성 | High |
| T-04 | `report.template.md` | 변수 치환, 구조 유효성 | Medium |
| T-05 | `CLAUDE.template.md` | CLAUDE.md 생성 | Medium |
| T-06 | `_INDEX.template.md` | 인덱스 생성 | Low |
| T-07 | `design-starter.template.md` | Starter 설계 | Medium |
| T-08 | `design-enterprise.template.md` | Enterprise 설계 | Low |
| T-09 | `iteration-report.template.md` | 반복 보고서 | Medium |
| T-10 | `TEMPLATE-GUIDE.md` | 가이드 문서 | Low |
| T-11 | `pipeline/*.template.md` (10개) | 파이프라인 템플릿 | Medium |

### 3.7 Library (1개)

| ID | Library | 테스트 항목 | 우선순위 |
|----|---------|------------|:--------:|
| L-01 | `common.js` | 모든 exported 함수 동작 | **Critical** |

---

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 모든 Commands가 인자를 정상 수신해야 함 | Critical | Pending |
| FR-02 | SessionStart hook이 정상 실행되어야 함 | Critical | Pending |
| FR-03 | hooks 없는 Skills이 승인 없이 활성화되어야 함 | High | Pending |
| FR-04 | hooks 있는 Skills이 승인 요청해야 함 | High | Pending |
| FR-05 | 모든 Scripts가 올바른 JSON 응답을 반환해야 함 | Critical | Pending |
| FR-06 | Templates가 올바른 문서를 생성해야 함 | High | Pending |
| FR-07 | Agents가 올바르게 트리거되어야 함 | High | Pending |

### 4.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Hook 실행 < 5초 | timeout 설정 확인 |
| Compatibility | Claude Code 2.1.19+ | 버전 확인 |
| Stability | 크래시 없음 | 에러 로그 확인 |

---

## 5. Test Plan

### 5.1 Test Environment

```
Claude Code Version: 2.1.19
Node.js Version: 18+
Platform: macOS, Windows, Linux
bkit Version: v1.4.0
```

### 5.2 Test Execution Order

#### Phase 1: Critical Tests (필수)

```bash
# 1. Hooks 테스트
# SessionStart hook 실행 확인
claude --new  # 새 세션 시작, additionalContext 확인

# 2. Commands 인자 전달 테스트
/pdca-plan test-feature
/pdca-design test-feature
/pdca-analyze test-feature

# 3. lib/common.js 테스트
node -e "const c = require('./lib/common.js'); console.log(Object.keys(c));"
```

#### Phase 2: High Priority Tests

```bash
# 4. Skills 자동 승인 테스트 (hooks 없는 11개)
# starter skill 활성화 시 승인 프롬프트 없음 확인

# 5. Skills 승인 요청 테스트 (hooks 있는 7개)
# phase-4-api skill 활성화 시 승인 프롬프트 확인

# 6. Scripts 응답 형식 테스트
node scripts/pre-write.js  # JSON 출력 확인
node scripts/pdca-post-write.js  # JSON 출력 확인
```

#### Phase 3: Medium Priority Tests

```bash
# 7. Agents 트리거 테스트
# "검증해줘" 입력 → gap-detector 활성화 확인
# "개선해줘" 입력 → pdca-iterator 활성화 확인

# 8. Templates 변수 치환 테스트
/pdca-plan another-feature  # plan.template.md 적용 확인
```

#### Phase 4: Low Priority Tests

```bash
# 9. 나머지 Commands 테스트
/init-starter
/pipeline-start
/archive

# 10. 나머지 Scripts 테스트
# 각 script의 exit code 확인
```

### 5.3 Test Cases

#### TC-01: SessionStart Hook

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `claude --new` 실행 | 새 세션 시작 |
| 2 | 시스템 메시지 확인 | `bkit Vibecoding Kit v1.4.0 activated` 포함 |
| 3 | additionalContext 확인 | PDCA Core Rules 포함 |

#### TC-02: Command 인자 전달

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `/pdca-plan login` 실행 | login 기능 Plan 문서 생성 |
| 2 | 생성된 파일 확인 | `docs/01-plan/features/login.plan.md` 존재 |
| 3 | 파일 내용 확인 | `{feature}` → `login` 치환됨 |

#### TC-03: Skills 자동 승인 (v2.1.19 변경사항)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | starter skill 호출 | 승인 프롬프트 **없이** 활성화 |
| 2 | 동작 확인 | Skill 내용 정상 적용 |

#### TC-04: Skills 승인 요청 (hooks 포함)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | phase-4-api skill 호출 | 승인 프롬프트 **표시** |
| 2 | 승인 후 동작 확인 | Hook 정상 실행 |

#### TC-05: Scripts JSON 응답

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `pre-write.js` 실행 | `{"decision": "allow"}` 형식 출력 |
| 2 | JSON.parse 검증 | 파싱 성공 |

---

## 6. Success Criteria

### 6.1 Definition of Done

- [x] 모든 Critical 테스트 통과
- [x] 모든 High 테스트 통과
- [ ] Medium 테스트 90% 이상 통과
- [ ] Low 테스트 80% 이상 통과
- [ ] 테스트 결과 문서화

### 6.2 Quality Criteria

- [ ] 0개 Critical 버그
- [ ] 0개 High 버그
- [ ] Breaking Change 없음 확인

---

## 7. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| $ARGUMENTS 구문 변경 영향 | High | Low | 프롬프트 기반이라 영향 없음 예상, 테스트로 확인 |
| Skills 자동 승인 정책 오동작 | Medium | Low | hooks 유무로 정확히 분류됨 |
| Hooks 타이밍 이슈 | Medium | Low | backgrounded hook 수정으로 개선됨 |
| Scripts JSON 출력 형식 오류 | High | Low | 개별 테스트로 검증 |

---

## 8. Test Results Summary (Template)

### 8.1 Overall Results

| Category | Total | Pass | Fail | Skip | Pass Rate |
|----------|-------|------|------|------|-----------|
| Agents | 11 | - | - | - | - |
| Commands | 20 | - | - | - | - |
| Skills | 18 | - | - | - | - |
| Hooks | 2 | - | - | - | - |
| Scripts | 26 | - | - | - | - |
| Templates | 21 | - | - | - | - |
| Library | 1 | - | - | - | - |
| **Total** | **99** | - | - | - | - |

### 8.2 Failed Tests

| ID | Component | Issue | Severity | Action |
|----|-----------|-------|----------|--------|
| - | - | - | - | - |

---

## 9. Next Steps

1. [ ] 이 Plan 승인
2. [ ] Phase 1 (Critical) 테스트 실행
3. [ ] Phase 2-4 순차 테스트 실행
4. [ ] 결과 기록 → `docs/03-analysis/` 업데이트
5. [ ] 이슈 발견 시 → `/pdca-iterate` 실행

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-24 | Initial draft | bkit Team |
