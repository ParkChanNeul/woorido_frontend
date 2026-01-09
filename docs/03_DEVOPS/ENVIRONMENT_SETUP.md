# WOORIDO 개발 환경 및 의존성 명세서

> **Project:** WOORIDO (Frontend + Backend + Analytics)
> **Version:** v3.0 - Team Confirmed Specification
> **Last Updated:** 2026-01-09
> **Status:** Development Ready
> **Based On:** Team Decision (Dependency Matrix v2.0), ToT Validation

---

## 목차

- [1. 개요](#1-개요)
- [2. 동시성 제어 전략](#2-동시성-제어-전략)
- [3. 확정 기술 스택 (Dependency Matrix v2.0)](#3-확정-기술-스택-dependency-matrix-v20)
- [4. 프론트엔드 환경](#4-프론트엔드-환경)
- [5. 백엔드 환경 (Spring Boot)](#5-백엔드-환경-spring-boot)
- [6. 서브 백엔드 환경 (Django)](#6-서브-백엔드-환경-django)
- [7. 데이터베이스 및 검색](#7-데이터베이스-및-검색)
- [8. 인프라 환경](#8-인프라-환경)
- [9. 버전 호환성 매트릭스](#9-버전-호환성-매트릭스)
- [10. 환경 변수 설정](#10-환경-변수-설정)
- [11. 보안 체크리스트](#11-보안-체크리스트)

---

## 1. 개요

### 1.1 설계 원칙

WOORIDO 프로젝트는 다음 원칙에 따라 개발 환경을 구성합니다:

1. **금융 무결성**: 비관적 락을 통한 돈 복사 버그 원천 차단
2. **고성능 처리**: 가상 스레드를 통한 대용량 트래픽 처리
3. **안정성 중심**: 검증된 LTS/안정 버전 사용
4. **호환성 보장**: 레이어 간 의존성 충돌 방지

### 1.2 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Layer                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  React 18.2.0 + TypeScript 5.3.3                            ││
│  │  Vite 5.0.12 | Tailwind CSS 3.4.1                           ││
│  │  React Query 5.17.19 | Zustand 4.5.0 | Recharts 2.10.4      ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS (REST API)
┌─────────────────────────▼───────────────────────────────────────┐
│  Reverse Proxy: Nginx 1.25.3                                     │
│  - SSL/TLS Termination                                           │
│  - Load Balancing                                                │
│  - Static File Serving                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Main Backend           │   │  Sub Backend            │
│  ─────────────────────  │   │  ─────────────────────  │
│  Java 21.0.2 LTS        │   │  Python 3.11.7          │
│  Spring Boot 3.2.3      │   │  Django 5.0.1           │
│  Gradle 8.5             │   │  ─────────────────────  │
│  ─────────────────────  │   │  pandas 2.1.4           │
│  MyBatis 3.0.3          │◄──│  elasticsearch 8.11.1   │
│  JWT Authentication     │   │  uvicorn 0.25.0         │
│  TossPay Integration    │   │                         │
│  ─────────────────────  │   │  [분석 전용 서비스]     │
│  Virtual Threads +      │   │  - 재정 분석            │
│  Pessimistic Lock       │   │  - 검색 쿼리            │
└───────────┬─────────────┘   └───────────┬─────────────┘
            │                             │
            │ JDBC (ojdbc11)              │ elasticsearch-py
            ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│  Oracle 21c XE          │   │  Elasticsearch 8.11.3   │
│  (Main Database)        │   │  (Search Engine)        │
│  ─────────────────────  │   │  ─────────────────────  │
│  - 트랜잭션 데이터      │   │  - 한글 형태소 분석     │
│  - 유저/챌린지/장부     │   │  - 실시간 검색          │
│  - FOR UPDATE Lock      │   │  - nori_tokenizer       │
└─────────────────────────┘   └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  External Services                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  TossPay API    │  │  AWS S3         │  │  OAuth 2.0      │  │
│  │  (Payment)      │  │  (Image Storage)│  │  (Google/Kakao) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 동시성 제어 전략

### 2.1 Hybrid High-End 전략

**배경**: 핀테크의 핵심인 '돈 복사 버그' 방지와 '대용량 트래픽 처리' 두 마리 토끼를 잡아야 함.

**결정**: **JDK 21 가상 스레드 + 비관적 락** 조합 확정

| 구성 요소 | 역할 | 효과 |
|----------|------|------|
| **비관적 락 (Pessimistic Lock)** | DB Row 잠금 | 데이터 무결성 100% 보장 |
| **가상 스레드 (Virtual Threads)** | I/O 대기 최적화 | 처리량 10배+ 향상 |

### 2.2 구현 패턴

```java
// 계좌 잔액 변경 시 비관적 락 적용
@Transactional
public void transfer(UUID fromAccountId, UUID toAccountId, long amount) {
    // 비관적 락: SELECT ... FOR UPDATE
    Account from = accountMapper.selectForUpdate(fromAccountId);
    Account to = accountMapper.selectForUpdate(toAccountId);

    if (from.getBalance() < amount) {
        throw new InsufficientBalanceException();
    }

    accountMapper.decreaseBalance(fromAccountId, amount);
    accountMapper.increaseBalance(toAccountId, amount);

    // 트랜잭션 로그 기록
    transactionMapper.insert(new AccountTransaction(/*...*/));
}
```

```yaml
# application.yml - 가상 스레드 활성화
spring:
  threads:
    virtual:
      enabled: true  # JDK 21 Virtual Threads
```

### 2.3 SERIALIZABLE 격리 수준을 선택하지 않은 이유

| 격리 수준 | 장점 | 단점 |
|----------|------|------|
| SERIALIZABLE | 완벽한 직렬화 | 성능 저하 심각, 데드락 빈번 |
| READ_COMMITTED + 비관적 락 | 필요한 부분만 락 | **선택됨** - 성능과 안정성 균형 |

---

## 3. 확정 기술 스택 (Dependency Matrix v2.0)

### 3.1 팀 확정 버전

| 레이어 | 기술 | 확정 버전 | 상태 |
|--------|------|----------|------|
| **Main Backend** | Java | 21 (JDK 21) | ✅ 확정 |
| | Spring Boot | 3.2.1 | ✅ 확정 |
| | Build Tool | Gradle | ✅ 확정 |
| **Sub Backend** | Python | 3.11 | ✅ 확정 |
| | Django | 5.0.1 | ✅ 확정 |
| | Package Manager | pip | ✅ 확정 |
| **Frontend** | Node.js | 20 (LTS) | ✅ 확정 |
| | React | 18.2 | ✅ 확정 |
| | Vite | 5.0 | ✅ 확정 |
| **Database** | Oracle | 21c XE | ✅ 확정 |
| | Elasticsearch | 8.11.3 | ✅ 확정 |

### 3.2 ToT 검증 상세 버전

팀 확정 버전을 기반으로 **호환성 검증된 구체적 패치 버전**:

| 구분 | 패키지 | 팀 확정 | ToT 검증 버전 | 비고 |
|------|--------|---------|--------------|------|
| **Java** | JDK | 21 | **21.0.2** | LTS, 가상 스레드 정식 지원 |
| **Spring** | Spring Boot | 3.2.1 | **3.2.3** | 보안 패치 포함 |
| | spring-dependency-management | - | **1.1.4** | 최신 안정 |
| | mybatis-spring-boot-starter | - | **3.0.3** | Spring Boot 3.2.x 호환 |
| **Build** | Gradle | - | **8.5** | Java 21 필수 |
| **Python** | Python | 3.11 | **3.11.7** | 안정 패치 |
| | Django | 5.0.1 | **5.0.1** | 그대로 유지 |
| | pandas | - | **2.1.4** | 성능 최적화 |
| | python-oracledb | - | **2.0.1** | cx_Oracle 후속 |
| | elasticsearch | - | **8.11.1** | 서버 버전 매칭 |
| | uvicorn | - | **0.25.0** | ASGI 서버 |
| **Node.js** | Node.js | 20 LTS | **20.11.0** | LTS 패치 |
| | React | 18.2 | **18.2.0** | 안정 버전 |
| | Vite | 5.0 | **5.0.12** | 버그 수정 포함 |
| | TypeScript | - | **5.3.3** | React 18.2 호환 |
| **DB** | Oracle | 21c XE | **21.3.0** | Express Edition |
| | Elasticsearch | 8.11.3 | **8.11.3** | 한글 형태소 포함 |
| **Infra** | Nginx | - | **1.25.3** | 리버스 프록시 |

---

## 4. 프론트엔드 환경

### 4.1 핵심 프레임워크

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| **Node.js** | 20.11.0 LTS | 런타임 | Vite 5.x 필수 조건 |
| **React** | 18.2.0 | UI 프레임워크 | Concurrent Features 지원 |
| **React-DOM** | 18.2.0 | DOM 렌더링 | React 버전 일치 |
| **TypeScript** | 5.3.3 | 정적 타입 | satisfies 키워드 지원 |
| **Vite** | 5.0.12 | 빌드 도구 | 5.0.0~5.0.9 버그 회피 |

### 4.2 UI/스타일링

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **tailwindcss** | 3.4.1 | CSS 프레임워크 |
| **postcss** | 8.4.33 | CSS 후처리 |
| **autoprefixer** | 10.4.17 | 벤더 프리픽스 |
| **@radix-ui/react-*** | 1.x-2.x | Headless UI |
| **framer-motion** | 11.0.3 | 애니메이션 |
| **lucide-react** | 0.312.0 | 아이콘 |

### 4.3 상태 관리 및 데이터 페칭

| 패키지 | 버전 | 용도 | 비고 |
|--------|------|------|------|
| **@tanstack/react-query** | 5.17.19 | 서버 상태 | v5 API 사용 |
| **zustand** | 4.5.0 | 클라이언트 상태 | React 18 호환 |
| **axios** | 1.6.5 | HTTP 클라이언트 | Spring Boot 통신 |
| **react-hook-form** | 7.49.3 | 폼 상태 | 모임 생성, 회원가입 |
| **zod** | 3.22.4 | 스키마 검증 | 폼 유효성 검사 |

### 4.4 차트 및 시각화

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **recharts** | 2.10.4 | 차트 라이브러리 |
| **react-circular-progressbar** | 2.1.0 | 진행률 표시 |

### 4.5 개발 도구

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **@vitejs/plugin-react** | 4.2.1 | Vite React 플러그인 |
| **eslint** | 8.56.0 | 코드 린팅 |
| **prettier** | 3.2.4 | 코드 포매팅 |
| **vitest** | 1.2.1 | 테스트 프레임워크 |
| **msw** | 2.1.4 | API 모킹 |

### 4.6 package.json 예시

```json
{
  "name": "woorido-frontend",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=20.11.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@tanstack/react-query": "5.17.19",
    "zustand": "4.5.0",
    "axios": "1.6.5",
    "react-hook-form": "7.49.3",
    "zod": "3.22.4",
    "recharts": "2.10.4",
    "tailwindcss": "3.4.1",
    "framer-motion": "11.0.3",
    "lucide-react": "0.312.0",
    "@radix-ui/react-dialog": "1.0.5",
    "@radix-ui/react-tabs": "1.0.4",
    "@radix-ui/react-select": "2.0.0",
    "@radix-ui/react-avatar": "1.0.4",
    "@radix-ui/react-progress": "1.0.3"
  },
  "devDependencies": {
    "typescript": "5.3.3",
    "vite": "5.0.12",
    "@vitejs/plugin-react": "4.2.1",
    "eslint": "8.56.0",
    "prettier": "3.2.4",
    "vitest": "1.2.1",
    "msw": "2.1.4",
    "postcss": "8.4.33",
    "autoprefixer": "10.4.17"
  }
}
```

---

## 5. 백엔드 환경 (Spring Boot)

### 5.1 핵심 버전

| 항목 | 버전 | 비고 |
|------|------|------|
| **Java** | 21.0.2 LTS | 가상 스레드 필수 |
| **Spring Boot** | 3.2.3 | 가상 스레드 공식 지원 |
| **Gradle** | 8.5 | Java 21 호환 |
| **spring-dependency-management** | 1.1.4 | BOM 관리 |

### 5.2 핵심 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **mybatis-spring-boot-starter** | 3.0.3 | ORM |
| **ojdbc11** | 23.3.0.23.09 | Oracle JDBC (Java 11+) |
| **elasticsearch-java** | 8.11.3 | ES Java Client |
| **spring-boot-starter-security** | 3.2.3 | 보안 |
| **jjwt-api** | 0.12.3 | JWT 토큰 |
| **spring-boot-starter-validation** | 3.2.3 | 입력 검증 |

### 5.3 build.gradle 예시

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.3'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.woorido'
version = '1.0.0'

java {
    sourceCompatibility = '21'
    targetCompatibility = '21'
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // MyBatis
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'

    // Oracle JDBC
    implementation 'com.oracle.database.jdbc:ojdbc11:23.3.0.23.09'

    // Elasticsearch
    implementation 'co.elastic.clients:elasticsearch-java:8.11.3'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // Test
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter-test:3.0.3'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### 5.4 application.yml 예시

```yaml
spring:
  application:
    name: woorido-backend

  # 가상 스레드 활성화 (JDK 21)
  threads:
    virtual:
      enabled: true

  datasource:
    url: jdbc:oracle:thin:@localhost:1521:XE
    username: woorido
    password: ${DB_PASSWORD}
    driver-class-name: oracle.jdbc.OracleDriver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000

mybatis:
  mapper-locations: classpath:mapper/**/*.xml
  type-aliases-package: com.woorido.domain
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 100
    default-statement-timeout: 30

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000  # 24시간

# Django 분석 서비스 연동
django:
  api:
    base-url: http://localhost:8000
    timeout: 5000
```

---

## 6. 서브 백엔드 환경 (Django)

### 6.1 핵심 버전

| 항목 | 버전 | 비고 |
|------|------|------|
| **Python** | 3.11.7 | Django 5.0 호환 |
| **Django** | 5.0.1 | ASGI 완벽 지원 |
| **uvicorn** | 0.25.0 | ASGI 서버 |
| **gunicorn** | 21.2.0 | 프로덕션 서버 |

### 6.2 핵심 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| **djangorestframework** | 3.14.0 | REST API |
| **pandas** | 2.1.4 | 데이터 분석 |
| **numpy** | 1.26.3 | 수치 계산 |
| **elasticsearch** | 8.11.1 | ES Python Client |
| **elasticsearch-dsl** | 8.11.0 | ES 쿼리 DSL |
| **python-oracledb** | 2.0.1 | Oracle 연동 (필요 시) |

### 6.3 requirements.txt 예시

```txt
# Core
Django==5.0.1
djangorestframework==3.14.0
uvicorn==0.25.0
gunicorn==21.2.0

# Data Analysis
pandas==2.1.4
numpy==1.26.3

# Elasticsearch
elasticsearch==8.11.1
elasticsearch-dsl==8.11.0

# Database (Optional - Spring 경유 권장)
python-oracledb==2.0.1

# Utilities
python-dateutil==2.8.2
pytz==2024.1
requests==2.31.0

# Security
python-dotenv==1.0.0
```

### 6.4 Django 역할

**Django는 분석 전용 마이크로서비스**:

```
Spring Boot → Django 호출 흐름
─────────────────────────────────
1. 사용자 요청 → Spring Boot
2. Spring Boot → Oracle 데이터 조회
3. Spring Boot → Django API 호출 (분석 데이터 전달)
4. Django → pandas/numpy 분석
5. Django → 분석 결과 반환
6. Spring Boot → 클라이언트 응답
```

**제공 API**:

| 엔드포인트 | 기능 |
|-----------|------|
| `POST /api/analyze/monthly-trend` | 월별 지출 추이 |
| `POST /api/analyze/category-ratio` | 카테고리별 비율 |
| `POST /api/analyze/financial-health` | 재정 건전성 분석 |
| `GET /api/search/challenges` | 챌린지 검색 (ES 연동) |

---

## 7. 데이터베이스 및 검색

### 7.1 Oracle Database

| 항목 | 버전 | 비고 |
|------|------|------|
| **Oracle** | 21c XE (21.3.0) | Express Edition |
| **JDBC Driver** | ojdbc11:23.3.0.23.09 | Java 11+ 전용 |

**선정 이유**:
- 트랜잭션 안정성 (ACID 완벽 보장)
- 비관적 락 (`SELECT ... FOR UPDATE`) 지원
- 엔터프라이즈급 성능

**Docker 설치 (개발 환경)**:
```bash
docker pull gvenzl/oracle-xe:21-slim
docker run -d -p 1521:1521 -e ORACLE_PASSWORD=woorido123 \
  --name oracle-xe gvenzl/oracle-xe:21-slim
```

### 7.2 Elasticsearch

| 항목 | 버전 | 비고 |
|------|------|------|
| **Elasticsearch** | 8.11.3 | 검색 엔진 |
| **Java Client** | 8.11.3 | Spring Boot 연동 |
| **Python Client** | 8.11.1 | Django 연동 |
| **분석 플러그인** | analysis-nori 8.11.3 | 한글 형태소 분석 |

**Docker 설치 (개발 환경)**:
```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.11.3
docker run -d -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  --name elasticsearch elasticsearch:8.11.3

# Nori 플러그인 설치
docker exec -it elasticsearch bin/elasticsearch-plugin install analysis-nori
docker restart elasticsearch
```

---

## 8. 인프라 환경

### 8.1 Reverse Proxy

| 항목 | 버전 | 용도 |
|------|------|------|
| **Nginx** | 1.25.3 | 리버스 프록시, SSL |

**nginx.conf 예시**:
```nginx
upstream spring_backend {
    server localhost:8080;
}

upstream django_backend {
    server localhost:8000;
}

server {
    listen 443 ssl http2;
    server_name woorido.com;

    ssl_certificate /etc/ssl/certs/woorido.crt;
    ssl_certificate_key /etc/ssl/private/woorido.key;

    # React Static Files
    location / {
        root /var/www/woorido/dist;
        try_files $uri $uri/ /index.html;
    }

    # Spring Boot API
    location /api/ {
        proxy_pass http://spring_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django Analytics API (내부용)
    location /analytics/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
    }
}
```

### 8.2 외부 서비스

| 서비스 | 용도 | 비고 |
|--------|------|------|
| **TossPay API** | 결제 | 충전/환불 |
| **AWS S3** | 이미지 저장 | 게시글/프로필 |
| **Google OAuth 2.0** | 소셜 로그인 | |
| **Kakao OAuth 2.0** | 소셜 로그인 | |

---

## 9. 버전 호환성 매트릭스

### 9.1 레이어 간 호환성

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERSION COMPATIBILITY MATRIX                  │
├─────────────────────────────────────────────────────────────────┤
│  Frontend          │  Backend (Spring)  │  Backend (Django)      │
│  ─────────────────────────────────────────────────────────────  │
│  Node.js 20.11.0   │  Java 21.0.2       │  Python 3.11.7         │
│  React 18.2.0      │  Spring Boot 3.2.3 │  Django 5.0.1          │
│  Vite 5.0.12       │  Gradle 8.5        │  uvicorn 0.25.0        │
│  TypeScript 5.3.3  │  MyBatis 3.0.3     │  pandas 2.1.4          │
├─────────────────────────────────────────────────────────────────┤
│                           Database                               │
│  ─────────────────────────────────────────────────────────────  │
│  Oracle 21c XE (21.3.0)          │  Elasticsearch 8.11.3        │
│  JDBC: ojdbc11:23.3.0.23.09      │  nori_tokenizer (한글)       │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 주요 제약 조건

| 조건 | 설명 |
|------|------|
| Java 21 필수 | 가상 스레드 사용 (Spring Boot 3.2+) |
| Spring Boot 3.2+ 필수 | `spring.threads.virtual.enabled=true` |
| ojdbc11 필수 | ojdbc8은 Java 21 미지원 |
| ES 클라이언트 버전 매칭 | 서버 8.11.3 ↔ 클라이언트 8.11.x |
| Vite 5.0.10+ 권장 | 5.0.0~5.0.9 버그 있음 |

---

## 10. 환경 변수 설정

### 10.1 프론트엔드 (.env)

```bash
# API Endpoints
VITE_API_BASE_URL=http://localhost:8080/api
VITE_DJANGO_API_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_MSW=true
VITE_ENABLE_DEVTOOLS=true

# OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_KAKAO_CLIENT_ID=your_kakao_client_id
```

### 10.2 백엔드 Spring Boot (.env)

```bash
# Database
DB_PASSWORD=woorido123
ORACLE_URL=jdbc:oracle:thin:@localhost:1521:XE

# JWT
JWT_SECRET=your-256-bit-secret-key-here

# Django
DJANGO_API_URL=http://localhost:8000

# Elasticsearch
ES_HOST=localhost
ES_PORT=9200

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=woorido-images

# TossPay
TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key
```

### 10.3 백엔드 Django (.env)

```bash
# Django
DJANGO_SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Spring Boot API
SPRING_BOOT_API_URL=http://localhost:8080

# Elasticsearch
ES_HOST=localhost
ES_PORT=9200
```

---

## 11. 보안 체크리스트

### 11.1 프론트엔드 보안

- [ ] XSS 방지: React 자동 이스케이핑 활용
- [ ] CSRF 방지: Spring Security 토큰 검증
- [ ] JWT 저장: httpOnly Cookie (LocalStorage 금지)
- [ ] 환경 변수: `.env` 파일 `.gitignore` 등록

### 11.2 백엔드 보안

- [ ] SQL Injection 방지: MyBatis PreparedStatement
- [ ] 비밀번호 암호화: BCrypt (strength 12)
- [ ] CORS 설정: 프론트엔드 도메인만 허용
- [ ] Rate Limiting: API 호출 제한

### 11.3 의존성 보안 점검

```bash
# Frontend
npm audit
npm audit fix

# Spring Boot
./gradlew dependencyCheckAnalyze

# Django
pip-audit
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-26 | v1.0 | 초안 작성 |
| 2025-12-30 | v2.0 | Final Specification 정렬 |
| 2026-01-09 | **v3.0** | **팀 확정 스택 반영**: Java 21 + Spring Boot 3.2.3 + 가상 스레드, Python 3.11 + Django 5.0.1, Node.js 20 + React 18.2, ToT 검증 상세 버전 명시, 동시성 전략 (Hybrid High-End) 추가, 기존 개발 일정/UI 트렌드/보안 분석 내용은 [BACKLOG.md](../BACKLOG.md)로 이관 |

---

**관련 문서:**
- [00_ERD_OVERVIEW.md](../02_ENGINEERING/Database/00_ERD_OVERVIEW.md) - ERD 개요
- [PRODUCT_AGENDA.md](../01_PLANNING/Product/PRODUCT_AGENDA.md) - 프로젝트 아젠다
- [USE_CASES.md](../01_PLANNING/Requirements/USE_CASES.md) - 유스케이스 명세
- [BACKLOG.md](../BACKLOG.md) - 이관된 개발 계획 및 UI/UX 트렌드
