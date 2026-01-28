---
description: 설계-구현 Gap 분석 실행 (PDCA Check Phase)
---

# PDCA Analyze Workflow

> 설계 문서와 실제 구현 간의 Gap을 분석합니다.

## 사용법

```bash
/pdca-analyze {feature-name}
```

## 워크플로우 단계

### 1. 문서 수집

| 문서 유형 | 경로 |
|----------|------|
| 계획서 | `docs/01-plan/features/{feature-name}.plan.md` |
| 설계서 | `docs/02-design/features/{feature-name}.design.md` |
| 구현 코드 | `src/` 관련 디렉토리 |

### 2. Gap 분석 수행

#### 2.1 기능 완성도 체크
- 설계서의 각 기능 요구사항 vs 실제 구현 코드 매핑
- 누락된 기능 식별
- 추가된 기능 식별

#### 2.2 WooriDo 규칙 준수 체크

**당도(Brix) 시스템:**
```
☑ 당도 계산 공식 준수: 납입당도(0.7) + 활동당도(0.15) + 기본값(12)
☑ 당도 상한(80) 적용
☑ 당도 변동 이벤트 로깅
```

**Fintech 규칙:**
```
☑ READ_COMMITTED 격리 수준
☑ 비관적 락(SELECT FOR UPDATE) 사용
☑ BigDecimal 금액 처리
☑ 트랜잭션 롤백 처리
```

**WDS 토큰 사용:**
```
☑ var(--color-*) 색상 토큰
☑ var(--space-*) 간격 토큰
☑ var(--radius-*) 모서리 토큰
☑ CSS Modules 사용
```

### 3. 일치율 계산

```
Match Rate = (완료된 항목 / 전체 항목) × 100

90% 이상: ✅ PASS - 릴리스 준비 완료
70-89%:   ⚠️ WARN - 개선 권장
70% 미만: ❌ FAIL - 반복 필요
```

### 4. 분석 결과 저장

```
docs/03-analysis/{feature-name}.analysis.md
```

### 5. 결과 템플릿

```markdown
# {Feature Name} Gap 분석 결과

## 분석 개요
- **분석일**: {date}
- **일치율**: {match_rate}%
- **상태**: PASS / WARN / FAIL

## 기능 완성도

| 요구사항 | 상태 | 구현 위치 | 비고 |
|----------|------|----------|------|
| FR-001 | ✅ 완료 | `src/...` | |
| FR-002 | ⚠️ 부분 | `src/...` | 추가 작업 필요 |
| FR-003 | ❌ 미완 | - | 다음 스프린트 |

## WooriDo 규칙 준수

### 당도(Brix) 시스템
- [x] 당도 계산 공식 준수
- [ ] 당도 상한 적용 ← 누락

### Fintech 규칙
- [x] 격리 수준 확인
- [x] 비관적 락 사용

### WDS 토큰
- [x] 색상 토큰 사용
- [ ] 하드코딩된 값 3개 발견

## 개선 필요 사항

1. **[High]** 당도 상한 적용 누락
   - 파일: `src/utils/brix.ts`
   - 조치: `Math.min(brix, 80)` 추가

2. **[Medium]** 하드코딩된 색상
   - 파일: `src/components/Card.module.css`
   - 조치: `#E9481E` → `var(--color-orange-500)`

## 다음 단계

- [ ] 일치율 90% 이상: `/pdca-report {feature-name}`
- [ ] 일치율 90% 미만: 개선 후 재분석
```

### 6. 자동 권장 액션

- **PASS (≥90%)**: `/pdca-report` 실행 제안
- **WARN (70-89%)**: 개선 항목 목록과 예상 작업량 제시
- **FAIL (<70%)**: 설계 재검토 또는 스코프 조정 권장
