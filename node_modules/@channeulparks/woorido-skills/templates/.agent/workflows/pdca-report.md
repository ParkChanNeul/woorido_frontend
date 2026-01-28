---
description: 기능 개발 완료 보고서 생성 (PDCA Act Phase)
---

# PDCA Report Workflow

> 기능 개발 완료 보고서를 생성합니다.

## 사용법

```bash
/pdca-report {feature-name}
```

## 전제 조건

- `/pdca-analyze` 결과 일치율 ≥ 90%
- 또는 사용자가 명시적으로 보고서 생성 요청

## 워크플로우 단계

### 1. 문서 수집

```
docs/01-plan/features/{feature-name}.plan.md
docs/02-design/features/{feature-name}.design.md
docs/03-analysis/{feature-name}.analysis.md
```

### 2. 보고서 생성

```
docs/04-report/{feature-name}.report.md
```

### 3. 보고서 템플릿

```markdown
# {Feature Name} 개발 완료 보고서

## 1. 요약

| 항목 | 내용 |
|------|------|
| **기능명** | {feature-name} |
| **개발 기간** | {start_date} ~ {end_date} |
| **최종 일치율** | {match_rate}% |
| **상태** | ✅ 완료 / ⚠️ 부분완료 |

## 2. 구현 결과

### 2.1 완료된 기능
- ✅ FR-001: 설명
- ✅ FR-002: 설명

### 2.2 변경 사항
- 원래 계획에서 변경된 내용

### 2.3 제외된 항목 (다음 반복으로 이월)
- FR-003: 사유

## 3. 기술 구현 상세

### 3.1 아키텍처
<!-- Mermaid 다이어그램 또는 설명 -->

### 3.2 주요 파일

| 파일 | 역할 | LOC |
|------|------|-----|
| `src/components/...` | | |
| `src/hooks/...` | | |

### 3.3 API 변경

| Endpoint | Method | 변경 내용 |
|----------|--------|----------|
| | | |

## 4. WooriDo 규칙 준수 현황

### 4.1 당도(Brix) 시스템
- ✅ 적용됨 / ⬜ 해당없음
- 상세: 

### 4.2 Fintech 규칙
- ✅ 준수 / ⬜ 해당없음
- 격리 수준: READ_COMMITTED
- 락 전략: 비관적 락

### 4.3 WDS 토큰
- ✅ 100% 사용 / ⚠️ 부분 사용
- 상세: 

## 5. 테스트 결과

| 테스트 유형 | 결과 | 커버리지 |
|------------|------|----------|
| Unit Test | ✅ PASS | 80% |
| Integration | ✅ PASS | - |
| E2E | ✅ PASS | - |

## 6. 성능 지표

| 지표 | 목표 | 실제 |
|------|------|------|
| 응답 시간 | < 200ms | 150ms |
| 메모리 | < 50MB | 35MB |

## 7. 학습 및 개선점

### 7.1 잘된 점
- 

### 7.2 개선할 점
- 

### 7.3 다음 반복에 적용할 사항
- 

## 8. 다음 단계

- [ ] 코드 리뷰 완료
- [ ] QA 테스트 통과
- [ ] 프로덕션 배포
- [ ] `/archive {feature-name}` 실행
```

### 4. 아카이브 제안

보고서 생성 완료 후:
- PDCA 문서 아카이브 여부 확인
- `/archive {feature-name}` 명령어 안내

### 5. 메트릭스 수집 (선택)

- 총 개발 시간
- 커밋 횟수
- 변경된 파일 수
- 코드 라인 수 (추가/삭제)
