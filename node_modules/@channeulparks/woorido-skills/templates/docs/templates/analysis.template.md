# {Feature Name} Gap 분석 결과

## 1. 분석 개요
- **분석일**: {YYYY-MM-DD}
- **설계서**: [design.md](../02-design/features/{feature-name}.design.md)
- **일치율**: {XX}%
- **상태**: ✅ PASS / ⚠️ WARN / ❌ FAIL

## 2. 기능 완성도

| 요구사항 | 상태 | 구현 위치 | 비고 |
|----------|------|----------|------|
| FR-001 | ✅ 완료 | `src/...` | |
| FR-002 | ⚠️ 부분 | `src/...` | 추가 작업 필요 |
| FR-003 | ❌ 미완 | - | 다음 스프린트 |

## 3. WooriDo 규칙 준수

### 3.1 당도(Brix) 시스템
- [ ] 당도 계산 공식 준수 (12 + 납입×0.7 + 활동×0.15)
- [ ] 당도 상한(80) 적용
- [ ] 당도 변동 이벤트 로깅

### 3.2 Fintech 규칙
- [ ] READ_COMMITTED 격리 수준
- [ ] 비관적 락 (SELECT FOR UPDATE)
- [ ] BigDecimal 금액 처리
- [ ] 트랜잭션 롤백 처리

### 3.3 WDS 토큰
- [ ] var(--color-*) 색상 토큰
- [ ] var(--space-*) 간격 토큰
- [ ] CSS Modules 사용
- [ ] 하드코딩된 값 없음

## 4. 개선 필요 사항

### 4.1 High Priority
1. **[파일명]** - 설명
   - 조치: 

### 4.2 Medium Priority
1. **[파일명]** - 설명
   - 조치: 

### 4.3 Low Priority
1. **[파일명]** - 설명
   - 조치: 

## 5. 권장 액션

- 일치율 ≥ 90%: `/pdca-report {feature-name}` 실행
- 일치율 < 90%: 개선 후 `/pdca-analyze {feature-name}` 재실행
