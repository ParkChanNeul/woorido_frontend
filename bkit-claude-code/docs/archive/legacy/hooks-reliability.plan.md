# Hooks Reliability Improvement Planning Document

> **Summary**: bkit hooks 시스템의 신뢰성 개선 - Agent Stop Hooks 검증 및 PDCA Status 자동 관리
>
> **Project**: bkit-claude-code
> **Version**: 1.4.0
> **Author**: AI Assistant
> **Date**: 2026-01-24
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

bkit 플러그인의 hooks 시스템이 실제로 의도한 대로 동작하는지 검증하고, PDCA 상태 추적 시스템을 구현하여 자동화의 신뢰성을 높입니다.

### 1.2 Background

현재 코드베이스 분석 결과 다음 문제들이 발견되었습니다:

1. **Agent Stop Hooks 실행 여부 불확실**: `agents/*.md`에 정의된 Stop hooks가 실제로 트리거되는지 검증되지 않음
2. **PDCA Status 파일 미관리**: `docs/.pdca-status.json` 읽기만 하고 생성/업데이트 로직 부재
3. **디버그 로깅 부재**: Stop hook 스크립트에 로깅이 없어 실행 확인 불가

### 1.3 Related Documents

- 분석: `docs/03-analysis/gemini-cli-support.analysis.md`
- 기존 설계: `docs/archive/pdca-status-tracking.design.md`

---

## 2. Scope

### 2.1 In Scope

- [x] Issue 1: Agent Stop Hooks 검증 계획 수립 및 테스트 스크립트 작성
- [x] Issue 3: PDCA Status 자동 생성/업데이트 로직 구현
- [x] 크로스 플랫폼 지원 (Claude Code + Gemini CLI)

### 2.2 Out of Scope

- Issue 2 (Feature 이름 동적 추출): 보류 - 문서/코드베이스 이름 불일치 문제 해결 방안 추가 검토 필요
- 새로운 Agent 추가
- UI 변경

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | Agent Stop Hook이 실제로 실행되는지 검증하는 테스트 스크립트 작성 | High | Pending |
| FR-02 | Stop hook 스크립트에 debug logging 추가 | High | Pending |
| FR-03 | PDCA Status 파일 자동 생성 로직 구현 | High | Pending |
| FR-04 | PDCA 단계 변경 시 status 파일 자동 업데이트 | High | Pending |
| FR-05 | `/pdca-status` skill에서 status 파일 읽기/표시 | Medium | Pending |
| FR-06 | Claude Code와 Gemini CLI 모두에서 동작 확인 | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Reliability | Hook 실행 성공률 100% | Test script 실행 |
| Compatibility | Claude Code + Gemini CLI 지원 | 듀얼 플랫폼 테스트 |
| Logging | 모든 hook 실행에 대한 로그 기록 | `/tmp/bkit-hook-debug.log` 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] Agent Stop Hooks 검증 테스트 통과
- [x] PDCA Status 파일이 자동으로 생성됨
- [x] PDCA 단계 변경 시 status 파일이 업데이트됨
- [x] Debug 로그로 hook 실행 확인 가능
- [x] Claude Code와 Gemini CLI 모두에서 동작

### 4.2 Quality Criteria

- [x] 기존 hooks 동작에 영향 없음 (regression 없음)
- [x] 모든 스크립트에 에러 핸들링 포함

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Agent Stop Hook이 Claude Code에서 지원되지 않을 수 있음 | High | Medium | 공식 문서 확인 및 대안 검토 (PostToolUse 활용) |
| Gemini CLI의 hook 시스템이 다를 수 있음 | Medium | High | gemini-extension.json 설정 확인 |
| PDCA Status 파일 동시 접근 문제 | Low | Low | 파일 잠금 또는 원자적 쓰기 사용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, services layer | Web apps with backend, SaaS MVPs | ☒ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems, complex architectures | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Status File Format | JSON / YAML | JSON | 기존 설계와 일관성, Node.js 네이티브 지원 |
| Logging Location | /tmp / PROJECT_DIR/.bkit | /tmp | 크로스 플랫폼, 임시 파일로 적합 |
| Hook Registry | hooks.json / Agent YAML | 둘 다 | Claude Code는 hooks.json, Agent는 YAML 유지 |

### 6.3 File Structure

```
bkit-claude-code/
├── hooks/
│   ├── hooks.json              # 전역 hooks (SessionStart, PreToolUse, PostToolUse)
│   └── session-start.js        # 세션 시작 hook
├── scripts/
│   ├── gap-detector-stop.js    # [수정] Debug logging 추가
│   ├── iterator-stop.js        # [수정] Debug logging 추가
│   └── pdca-status-update.js   # [신규] PDCA status 업데이트 유틸리티
├── lib/
│   └── common.js               # [수정] PDCA status 관리 함수 추가
├── test-scripts/
│   └── verify-hooks.js         # [신규] Hook 실행 검증 스크립트
└── docs/
    └── .pdca-status.json       # [자동 생성] PDCA 상태 파일
```

---

## 7. Detailed Implementation Plan

### 7.1 Issue 1: Agent Stop Hooks 검증

#### 7.1.1 검증 방법

```markdown
검증 단계:
1. Stop hook 스크립트에 debug logging 추가
2. gap-detector agent 실행 (/pdca-analyze)
3. /tmp/bkit-hook-debug.log 확인
4. Stop hook 실행 여부 확인

예상 결과:
- Hook 실행됨 → 현재 구조 유지
- Hook 실행 안됨 → 대안 검토 (PostToolUse에서 Agent 완료 감지)
```

#### 7.1.2 테스트 스크립트 설계

```javascript
// test-scripts/verify-hooks.js
// 1. 테스트용 로그 파일 초기화
// 2. gap-detector 실행 시뮬레이션 (Task tool 호출)
// 3. Stop hook 로그 확인
// 4. 결과 리포트 출력
```

#### 7.1.3 Debug Logging 추가 위치

| 스크립트 | 추가 위치 | 로그 내용 |
|---------|----------|----------|
| gap-detector-stop.js | 시작/종료 | `[GAP-STOP] Started/Completed, matchRate: X%` |
| iterator-stop.js | 시작/종료 | `[ITER-STOP] Started/Completed, status: X` |
| analysis-stop.js | 시작/종료 | `[ANALYSIS-STOP] Started/Completed` |

### 7.2 Issue 3: PDCA Status 자동 관리

#### 7.2.1 Status 파일 스키마

```json
{
  "version": "1.0",
  "lastUpdated": "2026-01-24T10:30:00Z",
  "currentFeature": "login",
  "currentPhase": 3,
  "features": {
    "login": {
      "phase": "do",
      "phaseNumber": 3,
      "planDoc": "docs/01-plan/features/login.plan.md",
      "designDoc": "docs/02-design/features/login.design.md",
      "startedAt": "2026-01-24T09:00:00Z",
      "updatedAt": "2026-01-24T10:30:00Z"
    }
  },
  "history": [
    {
      "feature": "login",
      "phase": "plan",
      "timestamp": "2026-01-24T09:00:00Z",
      "action": "created"
    }
  ]
}
```

#### 7.2.2 Status 업데이트 트리거 포인트

| 이벤트 | 트리거 | 업데이트 내용 |
|--------|--------|-------------|
| `/pdca-plan {feature}` 실행 | Skill 내부 | phase: "plan", phaseNumber: 1 |
| `/pdca-design {feature}` 실행 | Skill 내부 | phase: "design", phaseNumber: 2 |
| 코드 작성 (Write/Edit) | PostToolUse hook | phase: "do", phaseNumber: 3 |
| `/pdca-analyze {feature}` 실행 | gap-detector-stop.js | phase: "check", phaseNumber: 4 |
| `/pdca-iterate {feature}` 완료 | iterator-stop.js | phase: "act", phaseNumber: 5 |
| `/pdca-report {feature}` 완료 | Skill 내부 | phase: "completed" |

#### 7.2.3 lib/common.js 추가 함수

```javascript
// PDCA Status 관리 함수들
function initPdcaStatus()           // status 파일 초기화
function updatePdcaStatus(feature, phase, data)  // 상태 업데이트
function getPdcaStatus(feature)     // 특정 feature 상태 조회
function addPdcaHistory(entry)      // 히스토리 추가
```

---

## 8. Test Plan

### 8.1 Unit Tests

| Test Case | 입력 | 예상 결과 |
|-----------|------|----------|
| TC-01: Debug log 생성 | gap-detector 실행 | /tmp/bkit-hook-debug.log에 로그 기록 |
| TC-02: Status 파일 생성 | 빈 프로젝트에서 /pdca-plan | docs/.pdca-status.json 생성 |
| TC-03: Status 업데이트 | /pdca-design 실행 | phase: "design" 업데이트 |
| TC-04: 히스토리 추가 | 여러 단계 진행 | history 배열에 기록 추가 |

### 8.2 Integration Tests

| Test Case | 시나리오 | 예상 결과 |
|-----------|----------|----------|
| TC-05: 전체 PDCA 사이클 | plan→design→do→check→act | 각 단계 status 업데이트 확인 |
| TC-06: 듀얼 플랫폼 | Claude + Gemini에서 동일 테스트 | 동일 결과 |

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`hooks-reliability.design.md`)
2. [ ] 구현 우선순위:
   - Step 1: Debug logging 추가 (빠른 검증)
   - Step 2: Hook 실행 여부 확인
   - Step 3: PDCA Status 관리 함수 구현
   - Step 4: Skills 수정하여 status 업데이트 호출
3. [ ] 테스트 및 검증

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-24 | Initial draft | AI Assistant |
