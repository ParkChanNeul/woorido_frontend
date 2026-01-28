---
description: Docker 로그 기반 Zero Script QA
---

# Zero Script QA Workflow

> 스크립트 없이 Docker 로그만으로 QA를 수행합니다.

## 사용법

```bash
/zero-script-qa
/zero-script-qa {service}  # 특정 서비스만
```

## 개념

전통적인 테스트 스크립트 없이:
1. Docker 컨테이너 로그 수집
2. 에러 패턴 자동 분석
3. 원인 추론 및 해결책 제안

## 워크플로우 단계

### 1. 컨테이너 상태 확인

```bash
docker compose ps
```

예상 출력:
```
NAME                STATUS              PORTS
woorido-spring      Up 5 minutes        0.0.0.0:8080->8080/tcp
woorido-django      Up 5 minutes        0.0.0.0:8000->8000/tcp
woorido-oracle      Up 10 minutes       0.0.0.0:1521->1521/tcp
woorido-elastic     Up 10 minutes       0.0.0.0:9200->9200/tcp
```

### 2. 로그 수집

```bash
# 최근 100줄
docker compose logs --tail=100 {service}

# 에러만 필터링
docker compose logs {service} 2>&1 | grep -i "error\|exception\|fail"
```

### 3. 에러 패턴 분석

| 패턴 | 가능한 원인 | 해결책 |
|------|------------|--------|
| `Connection refused` | DB/서비스 미시작 | docker compose up -d |
| `ORA-12162` | Oracle 리스너 문제 | ORACLE_SID 환경변수 확인 |
| `Elasticsearch down` | ES 메모리 부족 | vm.max_map_count 설정 |
| `OutOfMemoryError` | JVM 힙 부족 | JAVA_OPTS -Xmx 증가 |
| `deadlock detected` | 동시성 이슈 | 락 순서 검토 |

### 4. 서비스별 헬스 체크

```bash
# Spring Actuator
curl http://localhost:8080/actuator/health

# Django
curl http://localhost:8000/health/

# Elasticsearch
curl http://localhost:9200/_cluster/health
```

### 5. WooriDo 특화 검사

#### 금융 트랜잭션 검증
```bash
# 결제 로그 확인
docker compose logs spring | grep "PAYMENT\|SETTLEMENT\|TRANSACTION"

# 동시성 이슈 검출
docker compose logs spring | grep -i "deadlock\|lock timeout\|concurrent"
```

#### 당도(Brix) 계산 검증
```bash
# Brix 계산 로그
docker compose logs spring | grep "BrixService\|calculateBrix"
```

#### Django 분석 검사
```bash
# Elasticsearch 쿼리 로그
docker compose logs django | grep "elasticsearch\|search_challenges"
```

## 출력 형식

```
🔍 Zero Script QA 결과
─────────────────────────

🐳 컨테이너 상태
├── spring:  ✅ Running (5m)
├── django:  ✅ Running (5m)
├── oracle:  ✅ Running (10m)
└── elastic: ✅ Running (10m)

📋 헬스 체크
├── Spring Actuator: ✅ UP
├── Django Health:   ✅ OK
└── ES Cluster:      ✅ green

⚠️ 발견된 이슈 (2)

1. [WARN] 느린 쿼리 감지
   서비스: spring
   로그: "Slow query detected: 1523ms"
   권장: 인덱스 최적화 검토

2. [ERROR] Elasticsearch 연결 재시도
   서비스: django
   로그: "ConnectionError: Retry 3/5"
   권장: ES 클러스터 상태 확인

📊 QA 점수: 90/100
```

## 자동화 팁

CI/CD 통합 시:
```yaml
# GitHub Actions
- name: Zero Script QA
  run: |
    docker compose up -d
    sleep 30
    docker compose logs --tail=100 | grep -i "error" && exit 1 || exit 0
```
