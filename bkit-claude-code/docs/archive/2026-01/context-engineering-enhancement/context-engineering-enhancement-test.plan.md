# Context Engineering Enhancement Test Planning Document

> **Summary**: context-engineering-enhancement v1.4.2의 8개 FR(Functional Requirements)에 대한 종합 테스트 계획
>
> **Project**: bkit (Vibecoding Kit)
> **Version**: 1.4.2
> **Author**: AI Assistant
> **Date**: 2026-01-26
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Context Engineering Enhancement v1.4.2에서 구현된 8개 기능 요구사항(FR-01 ~ FR-08)의 품질을 검증하기 위한 테스트 전략과 시나리오를 정의합니다.

### 1.2 Background

v1.4.2는 다음 7개의 새 모듈과 4개의 수정 파일을 포함하며, 이들의 정확한 동작과 통합을 검증해야 합니다:

**신규 모듈 (1,382 lines):**
| 모듈 | Lines | FR |
|------|:-----:|-----|
| `lib/context-hierarchy.js` | 282 | FR-01 |
| `lib/import-resolver.js` | 272 | FR-02 |
| `lib/context-fork.js` | 228 | FR-03 |
| `lib/permission-manager.js` | 205 | FR-05 |
| `lib/memory-store.js` | 189 | FR-08 |
| `scripts/user-prompt-handler.js` | 110 | FR-04 |
| `scripts/context-compaction.js` | 96 | FR-07 |

**수정 파일:**
- `hooks/session-start.js` - FR-01/02/03/08 통합
- `scripts/pre-write.js` - FR-05 권한 체크
- `hooks/hooks.json` - UserPromptSubmit 이벤트
- `lib/common.js` - autoCreatePdcaTask() (FR-06)

### 1.3 Related Documents

- Plan: `docs/01-plan/features/context-engineering-enhancement.plan.md`
- Design: `docs/02-design/features/context-engineering-enhancement.design.md`
- Report: `docs/04-report/features/context-engineering-enhancement.report.md`

---

## 2. Scope

### 2.1 In Scope

- [x] **Unit Tests**: 각 모듈의 개별 함수 동작 검증
- [x] **Integration Tests**: 모듈 간 통합 및 Hook 연동 검증
- [x] **Regression Tests**: 기존 v1.4.1 기능 호환성 검증
- [x] **Platform Tests**: Claude Code / Gemini CLI 양 플랫폼 동작 검증
- [x] **Edge Cases**: 에러 핸들링, 경계값, 예외 상황 검증

### 2.2 Out of Scope

- Performance benchmarking (별도 성능 테스트 계획으로 분리)
- UI/UX 테스트 (CLI 기반이므로 해당 없음)
- Claude Code/Gemini CLI 내부 런타임 테스트

---

## 3. Test Requirements

### 3.1 Unit Test Requirements

| ID | Module | Test Requirement | Priority | Status |
|----|--------|------------------|----------|--------|
| **UT-01** | context-hierarchy.js | L1~L4 개별 레벨 로딩 테스트 | High | Pending |
| **UT-02** | context-hierarchy.js | 계층 병합 시 우선순위 테스트 (L4 > L3 > L2 > L1) | High | Pending |
| **UT-03** | context-hierarchy.js | 충돌 감지 및 기록 테스트 | Medium | Pending |
| **UT-04** | context-hierarchy.js | 누락 레벨 fallback 테스트 | Medium | Pending |
| **UT-05** | import-resolver.js | 상대 경로 해석 (`./`, `../`) | High | Pending |
| **UT-06** | import-resolver.js | 변수 치환 (`${PLUGIN_ROOT}`, `${PROJECT}`, `${USER_CONFIG}`) | High | Pending |
| **UT-07** | import-resolver.js | 순환 참조 감지 및 에러 반환 | High | Pending |
| **UT-08** | import-resolver.js | TTL 캐싱 동작 (30초) | Medium | Pending |
| **UT-09** | import-resolver.js | 존재하지 않는 파일 처리 | Medium | Pending |
| **UT-10** | context-fork.js | `forkContext()` 딥 클론 검증 | High | Pending |
| **UT-11** | context-fork.js | 포크 수정이 부모에 영향 없음 | High | Pending |
| **UT-12** | context-fork.js | `mergeForkedContext()` 배열 병합 (중복제거) | High | Pending |
| **UT-13** | context-fork.js | `mergeForkedContext()` 객체 병합 | High | Pending |
| **UT-14** | context-fork.js | `mergeResult: false` 시 병합 스킵 | Medium | Pending |
| **UT-15** | context-fork.js | `discardFork()` 동작 | Medium | Pending |
| **UT-16** | permission-manager.js | `allow` 권한 통과 | High | Pending |
| **UT-17** | permission-manager.js | `deny` 권한 차단 (exit code 2) | High | Pending |
| **UT-18** | permission-manager.js | `ask` 권한 컨텍스트 추가 | High | Pending |
| **UT-19** | permission-manager.js | 패턴 매칭 (`Bash(rm -rf*)`) | High | Pending |
| **UT-20** | permission-manager.js | specific 패턴 우선순위 | Medium | Pending |
| **UT-21** | memory-store.js | `setMemory()` / `getMemory()` 동작 | High | Pending |
| **UT-22** | memory-store.js | `deleteMemory()` 동작 | Medium | Pending |
| **UT-23** | memory-store.js | `clearMemory()` 동작 | Medium | Pending |
| **UT-24** | memory-store.js | 파일 영속성 (프로세스 재시작 후) | High | Pending |
| **UT-25** | user-prompt-handler.js | Feature Intent Detection 정확도 | High | Pending |
| **UT-26** | user-prompt-handler.js | Agent Trigger Detection 정확도 | High | Pending |
| **UT-27** | user-prompt-handler.js | Skill Trigger Detection 정확도 | High | Pending |
| **UT-28** | user-prompt-handler.js | Ambiguity Score 계산 | Medium | Pending |
| **UT-29** | context-compaction.js | 스냅샷 파일 생성 확인 | High | Pending |
| **UT-30** | context-compaction.js | 자동 정리 (10개 초과 시) | Medium | Pending |
| **UT-31** | context-compaction.js | 상태 요약 출력 형식 | Medium | Pending |
| **UT-32** | common.js | `autoCreatePdcaTask()` quick_fix → 미생성 | High | Pending |
| **UT-33** | common.js | `autoCreatePdcaTask()` minor_change → 미생성 | High | Pending |
| **UT-34** | common.js | `autoCreatePdcaTask()` feature → 생성, blockedBy 없음 | High | Pending |
| **UT-35** | common.js | `autoCreatePdcaTask()` major_feature → 생성, blockedBy 자동 | High | Pending |

### 3.2 Integration Test Requirements

| ID | Scenario | Test Requirement | Priority | Status |
|----|----------|------------------|----------|--------|
| **IT-01** | Session Start | 모든 레벨(L1~L4) 존재 시 올바른 병합 | High | Pending |
| **IT-02** | Session Start | 일부 레벨 누락 시 fallback 동작 | High | Pending |
| **IT-03** | Session Start | `hooks/session-start.js`에서 FR-01/02/03/08 초기화 | High | Pending |
| **IT-04** | Import Directive | SKILL.md frontmatter imports 해석 | High | Pending |
| **IT-05** | Import Directive | Agent.md frontmatter imports 해석 | High | Pending |
| **IT-06** | Import Directive | 실제 shared context files 로딩 | High | Pending |
| **IT-07** | Context Fork | `context: fork` frontmatter Agent 실행 | High | Pending |
| **IT-08** | Context Fork | 세션 시작 시 stale fork 정리 | Medium | Pending |
| **IT-09** | Permission | `pre-write.js`에서 권한 체크 동작 | High | Pending |
| **IT-10** | Permission | 계층별 권한 병합 (L1 < L2 < L3) | High | Pending |
| **IT-11** | Hook Events | `UserPromptSubmit` 이벤트 발생 확인 | High | Pending |
| **IT-12** | Hook Events | Hook output이 additionalContext로 전달 | High | Pending |
| **IT-13** | Task System | PDCA 단계 변경 시 Task 자동 생성 | High | Pending |
| **IT-14** | Task System | blockedBy가 강제 차단이 아님 확인 | High | Pending |
| **IT-15** | Memory | 세션 시작 시 memory 로딩 | High | Pending |
| **IT-16** | Memory | 세션 카운트 증가 확인 | Medium | Pending |
| **IT-17** | Compaction | Compaction 이벤트 트리거 시 동작 | Medium | Pending |

### 3.3 Regression Test Requirements

| ID | Feature | Test Requirement | Priority | Status |
|----|---------|------------------|----------|--------|
| **RT-01** | Existing Hooks | pre-write.js 기존 기능 유지 | High | Pending |
| **RT-02** | Existing Hooks | pdca-post-write.js 기존 기능 유지 | High | Pending |
| **RT-03** | PDCA Status | docs/.pdca-status.json 형식 호환 | High | Pending |
| **RT-04** | Agent Triggers | gap-detector Agent 트리거 동작 | High | Pending |
| **RT-05** | Agent Triggers | pdca-iterator Agent 트리거 동작 | High | Pending |
| **RT-06** | Intent Detection | 8개 언어 Intent Detection 정확도 | High | Pending |
| **RT-07** | Backward Compat | v1.4.1 bkit.config.json 호환 | High | Pending |

### 3.4 Platform Test Requirements

| ID | Platform | Test Requirement | Priority | Status |
|----|----------|------------------|----------|--------|
| **PT-01** | Claude Code | hooks.json 이벤트 정상 발생 | High | Pending |
| **PT-02** | Claude Code | PLUGIN_ROOT 변수 정확한 해석 | High | Pending |
| **PT-03** | Gemini CLI | gemini-extension.json 이벤트 매핑 | High | Pending |
| **PT-04** | Gemini CLI | USER_CONFIG 경로 (~/.gemini/bkit/) | High | Pending |
| **PT-05** | Cross-Platform | lib/common.js BKIT_PLATFORM 분기 | High | Pending |

### 3.5 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | Hook 실행 시간 < 500ms | Debug logging timestamp |
| Reliability | 에러 시 graceful degradation | Error injection test |
| Maintainability | 신규 코드 테스트 커버리지 90%+ | Jest coverage report |
| Compatibility | v1.4.1 설정 파일 자동 마이그레이션 | Migration test |

---

## 4. Test Strategy

### 4.1 Test Framework Selection

| Category | Tool | Rationale |
|----------|------|-----------|
| Unit Test | Jest | Node.js 표준, 기존 프로젝트 호환 |
| Mocking | Jest mocks | 파일 시스템, 외부 모듈 mocking |
| Coverage | Jest --coverage | 내장 커버리지 리포터 |
| Integration | Manual + Scripted | Hook 시스템 특성상 실제 실행 필요 |

### 4.2 Test Environment

```
테스트 환경 구성
├── Unit Tests
│   ├── Mock: fs, path, os modules
│   ├── Mock: PDCA status data
│   └── Isolated: 각 모듈 독립 테스트
│
├── Integration Tests
│   ├── Real: 파일 시스템 접근
│   ├── Real: Hook 실행
│   └── Sandbox: 임시 디렉토리 사용
│
└── Platform Tests
    ├── Claude Code: macOS/Linux/Windows
    └── Gemini CLI: macOS/Linux
```

### 4.3 Test Data

**테스트 Fixture 구조:**

```
tests/
├── fixtures/
│   ├── context-hierarchy/
│   │   ├── l1-plugin-config.json       # L1 테스트 데이터
│   │   ├── l2-user-config.json         # L2 테스트 데이터
│   │   ├── l3-project-config.json      # L3 테스트 데이터
│   │   └── merged-expected.json        # 병합 결과 기대값
│   │
│   ├── import-resolver/
│   │   ├── skill-with-imports.md       # imports frontmatter 포함
│   │   ├── circular-a.md               # 순환 참조 A
│   │   ├── circular-b.md               # 순환 참조 B
│   │   └── shared-content.md           # 공유 컨텐츠
│   │
│   ├── permission/
│   │   ├── allow-all.json              # 전체 허용
│   │   ├── deny-patterns.json          # 패턴 차단
│   │   └── mixed-permissions.json      # 혼합 권한
│   │
│   └── pdca-status/
│       ├── v1.4.1-status.json          # 호환성 테스트용
│       └── v1.4.2-status.json          # 최신 형식
│
└── __tests__/
    ├── unit/
    │   ├── context-hierarchy.test.js
    │   ├── import-resolver.test.js
    │   ├── context-fork.test.js
    │   ├── permission-manager.test.js
    │   └── memory-store.test.js
    │
    └── integration/
        ├── session-start.test.js
        ├── pre-write-permission.test.js
        └── user-prompt-handler.test.js
```

---

## 5. Success Criteria

### 5.1 Definition of Done

- [ ] 모든 Unit Tests 통과 (35개)
- [ ] 모든 Integration Tests 통과 (17개)
- [ ] 모든 Regression Tests 통과 (7개)
- [ ] 모든 Platform Tests 통과 (5개)
- [ ] 테스트 커버리지 90%+ (신규 코드)
- [ ] Zero lint errors
- [ ] 테스트 실행 시간 < 60초

### 5.2 Quality Criteria

| Metric | Target | Acceptable |
|--------|:------:|:----------:|
| Unit Test Pass Rate | 100% | 100% |
| Integration Test Pass Rate | 100% | 95%+ |
| Regression Test Pass Rate | 100% | 100% |
| Code Coverage | 90%+ | 85%+ |
| Test Execution Time | < 30s | < 60s |

### 5.3 Exit Criteria

| Phase | Criteria |
|-------|----------|
| Unit Test | 모든 UT-* 테스트 통과 |
| Integration Test | 모든 IT-* 테스트 통과 |
| Regression Test | 모든 RT-* 테스트 통과 |
| Platform Test | Claude Code + Gemini CLI 검증 |
| Final | 전체 테스트 스위트 통과 + 커버리지 달성 |

---

## 6. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Hook 시스템 변경 | High | Low | 버전 고정, Abstraction layer |
| 플랫폼별 동작 차이 | Medium | Medium | 조건부 테스트 스킵, Platform matrix |
| 테스트 환경 의존성 | Medium | Medium | Docker 컨테이너화, CI 환경 표준화 |
| 순환 참조 감지 실패 | High | Low | 강화된 테스트 케이스, 수동 검증 |
| 권한 체크 우회 | High | Low | Penetration testing, 보안 리뷰 |

---

## 7. Test Execution Plan

### 7.1 Phase 1: Unit Tests (FR별)

```
실행 순서:
1. lib/context-hierarchy.js (UT-01 ~ UT-04)
2. lib/import-resolver.js (UT-05 ~ UT-09)
3. lib/context-fork.js (UT-10 ~ UT-15)
4. lib/permission-manager.js (UT-16 ~ UT-20)
5. lib/memory-store.js (UT-21 ~ UT-24)
6. scripts/user-prompt-handler.js (UT-25 ~ UT-28)
7. scripts/context-compaction.js (UT-29 ~ UT-31)
8. lib/common.js autoCreatePdcaTask (UT-32 ~ UT-35)
```

### 7.2 Phase 2: Integration Tests

```
실행 순서:
1. Session Start 통합 (IT-01 ~ IT-03)
2. Import Directive 통합 (IT-04 ~ IT-06)
3. Context Fork 통합 (IT-07 ~ IT-08)
4. Permission 통합 (IT-09 ~ IT-10)
5. Hook Events 통합 (IT-11 ~ IT-12)
6. Task System 통합 (IT-13 ~ IT-14)
7. Memory 통합 (IT-15 ~ IT-16)
8. Compaction 통합 (IT-17)
```

### 7.3 Phase 3: Regression & Platform Tests

```
실행 순서:
1. Regression Tests (RT-01 ~ RT-07)
2. Claude Code Platform Tests (PT-01 ~ PT-02)
3. Gemini CLI Platform Tests (PT-03 ~ PT-04)
4. Cross-Platform Tests (PT-05)
```

---

## 8. Architecture Considerations

### 8.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites | ☐ |
| **Dynamic** | Feature-based modules | Web apps with backend | ☐ |
| **Enterprise** | Strict layer separation | High-traffic systems | ☑ |

### 8.2 Test Architecture

```
Enterprise Level Test Structure
┌─────────────────────────────────────────────────────────────────┐
│                        Test Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  Unit Tests          │  Integration Tests  │  E2E Tests         │
│  (Jest + Mocks)      │  (Real FS + Hooks)  │  (Platform Tests)  │
├─────────────────────────────────────────────────────────────────┤
│                     Test Utilities Layer                         │
│  • Fixture Loaders   • Mock Factories     • Assertion Helpers   │
├─────────────────────────────────────────────────────────────────┤
│                     Test Data Layer                              │
│  • JSON Fixtures     • MD Test Files      • Expected Results    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Convention Prerequisites

### 9.1 Existing Project Conventions

- [x] `CLAUDE.md` has coding conventions section
- [x] `bkit-system/` architecture documentation
- [x] ESLint configuration - N/A (plugin)
- [x] Node.js scripts convention (lib/common.js pattern)

### 9.2 Test Conventions to Follow

| Category | Convention |
|----------|------------|
| **Test File Naming** | `{module}.test.js` |
| **Test Suite Naming** | `describe('{ModuleName}', ...)` |
| **Test Case Naming** | `it('should {expected behavior} when {condition}', ...)` |
| **Fixture Naming** | `{category}/{scenario}.json` |
| **Mock Naming** | `mock{ModuleName}` |

---

## 10. Next Steps

1. [ ] Write test fixtures (`tests/fixtures/`)
2. [ ] Implement Unit Tests (`tests/__tests__/unit/`)
3. [ ] Implement Integration Tests (`tests/__tests__/integration/`)
4. [ ] Run full test suite and verify coverage
5. [ ] Create test design document (`context-engineering-enhancement-test.design.md`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-26 | Initial draft from deep analysis | AI Assistant |
