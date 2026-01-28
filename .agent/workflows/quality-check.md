---
description: 코드 품질 자동 검사 워크플로우
---

# Quality Check Workflow

> 코드 품질을 자동으로 검사하고 보고서를 생성합니다.

## 사용법

```bash
/quality-check
/quality-check {path}  # 특정 경로만
```

## 워크플로우 단계

### 1. 린트 검사 (Lint)

```bash
# Frontend
npm run lint
npx tsc --noEmit

# Backend (Spring)
./gradlew checkstyle

# Backend (Django)
ruff check .
```

### 2. WDS 토큰 검증

`wds-auditor` 에이전트 호출:
- CSS 파일 스캔
- 하드코딩된 값 검출
- 토큰 사용률 계산

### 3. 도메인 용어 일관성

`_constants/terminology.md` 기반:
- 코드 내 용어 일관성 검사
- 한글/영문 혼용 체크
- 도메인 용어 오타 검출

### 4. 아키텍처 규칙

- 레이어 의존성 위반 검사
- 순환 참조 검출
- 파일 명명 규칙 준수

## 검사 항목

### Frontend
| 항목 | 도구 | 기준 |
|------|------|------|
| ESLint | eslint | 0 errors |
| TypeScript | tsc | 0 errors |
| WDS Tokens | wds-auditor | ≥80% |
| Bundle Size | vite-build | <500KB |

### Backend (Spring)
| 항목 | 도구 | 기준 |
|------|------|------|
| Checkstyle | checkstyle | 0 violations |
| Fintech Rules | fintech-guardian | PASS |
| Test Coverage | jacoco | ≥70% |

### Backend (Django)
| 항목 | 도구 | 기준 |
|------|------|------|
| Ruff | ruff | 0 errors |
| Type Check | mypy | 0 errors |
| Test Coverage | pytest-cov | ≥70% |

## 출력 형식

```
📋 품질 검사 결과
─────────────────────────

✅ 통과 (5)
├── ESLint: 0 errors
├── TypeScript: 0 errors
├── Checkstyle: 0 violations
├── Ruff: 0 errors
└── Fintech Rules: PASS

⚠️ 경고 (2)
├── WDS Tokens: 75% (80% 필요)
└── Test Coverage: 65% (70% 필요)

❌ 실패 (0)

📊 전체 점수: 85/100
```

## 자동 수정

가능한 항목은 자동 수정 제안:

```bash
# ESLint 자동 수정
npm run lint -- --fix

# Prettier 포맷팅
npm run format

# Ruff 자동 수정
ruff check . --fix
```
