# WOORIDO 공통 UX 플로우 v3.0

> **Purpose:** 플랫폼 공통 사용자 여정 및 화면별 상태 정의
> **Last Updated:** 2026-01-21
> **Status:** 확장됨 (Phase별 분리)
> **관련 문서:** [P0 플로우](./UX_FLOW_P0.md) | [P1 플로우](./UX_FLOW_P1.md)

---

## 1. 핵심 사용자 여정 (User Journey)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WOORIDO 사용자 여정                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [발견]        [가입]        [활동]        [성장]        [완주]     │
│    │            │            │            │            │           │
│    ▼            ▼            ▼            ▼            ▼           │
│  검색/추천   회원가입      SNS 활동     정기 모임     1년 달성     │
│     │        충전         투표 참여     리더 활동     인증 마크     │
│     │        챌린지 가입   장부 확인                               │
│     │                                                              │
│     └──────────────────────────────────────────────────────────────│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 플로우

### 2.1 신규 가입 → 첫 챌린지 가입 (웹 진입)

```mermaid
flowchart TD
    A[검색/URL 진입] --> B{기존 회원?}
    B -->|No| C[회원가입]
    C --> D[Trust Triangle 온보딩]
    D --> E[충전 유도]
    E --> F[챌린지 탐색]
    F --> G[챌린지 선택]
    G --> H[가입 플로우]
    H --> I{잔액 충분?}
    I -->|No| J[충전 모달]
    J --> H
    I -->|Yes| K[보증금 + 입회비 결제]
    K --> L[가입 완료 🎉]
    L --> M[챌린지 피드]
    
    B -->|Yes| F
```

### 2.2 보증금 충당 → 권한 복구

```mermaid
flowchart TD
    A[매월 1일 자동 서포트] --> B{크레딧 충분?}
    B -->|Yes| C[정상 납입]
    B -->|No| D[보증금에서 납입]
    D --> E[권한 박탈]
    E --> F[Alert Banner 표시]
    
    F --> G{60일 이내 충전?}
    G -->|Yes| H[충전]
    H --> I[보증금 우선 복구]
    I --> J[권한 복구 🎉]
    
    G -->|No| K[자동 탈퇴]
    K --> L[리더 알림]
```

### 2.3 정기 모임 → 지출 승인

```mermaid
flowchart TD
    A[리더: 모임 제안] --> B[MEETING_ATTENDANCE 투표]
    B --> C{과반수 참석?}
    C -->|No| D[모임 취소]
    C -->|Yes| E[모임 확정]
    E --> F[모임 진행]
    F --> G[리더: 지출 투표 생성]
    G --> H{참석자 과반수 승인?}
    H -->|No| I[지출 거절]
    H -->|Yes| J[오픈에서 차감]
    J --> K[장부 자동 기록]
    K --> L[바코드 발급]
```

### 2.4 챌린지 해산 플로우 (신규)

```mermaid
flowchart TD
    A[리더: 해산 요청] --> B[최종 경고 모달]
    B --> C[DISSOLVE 투표 생성]
    C --> D[전체 멤버 투표]
    D --> E{전원 동의?}
    E -->|No| F[해산 취소]
    E -->|Yes| G[잔액 N분의 1 계산]
    G --> H[각 어카운트에 분배]
    H --> I[챌린지 COMPLETED]
```

---

## 3. 투표 플로우

### 3.1 투표 타입별 요약

| 타입 | 생성자 | 대상 | 승인 조건 | 결과 |
|------|--------|------|----------|------|
| EXPENSE | 리더 | **참석자만** | 과반수~70% | 오픈 차감 |
| MEETING_ATTENDANCE | 리더 | 전체 | 과반수 | 모임 확정 |
| KICK | 리더/멤버 | 전체 | 70% | 강퇴 |
| LEADER_KICK | 팔로워 | 팔로워만 | 70% | 리더 교체 |
| DISSOLVE | 리더 | 전체 | **100%** | 해산 + 분배 |

### 3.2 투표 상태 전이

```mermaid
stateDiagram-v2
    [*] --> IN_PROGRESS: 투표 생성
    IN_PROGRESS --> APPROVED: 승인 조건 충족
    IN_PROGRESS --> REJECTED: 거절 조건 충족
    IN_PROGRESS --> EXPIRED: 기한 만료
    IN_PROGRESS --> CANCELLED: 생성자 취소
```

### 3.3 EXPENSE 투표 플로우 (지출 승인)

```mermaid
flowchart TD
    A[리더: 지출 요청] --> B[금액/카테고리/영수증 입력]
    B --> C[연결 모임 선택]
    C --> D[참석자 자동 필터링]
    D --> E[EXPENSE 투표 생성]
    E --> F[참석자만 투표 가능]
    
    F --> G{금액 기준}
    G -->|<100k| H[과반수 필요]
    G -->|≥100k| I[70% 필요]
    
    H --> J{72시간 내 조건 충족?}
    I --> J
    
    J -->|No| K[지출 거절]
    J -->|Yes| L[지출 승인]
    L --> M[오픈에서 차감]
    M --> N[장부 자동 기록]
    N --> O[바코드 발급]
```

### 3.4 MEETING_ATTENDANCE 투표 플로우 (모임 참석)

```mermaid
flowchart TD
    A[리더: 모임 제안] --> B[제목/날짜/장소 입력]
    B --> C[MEETING_ATTENDANCE 투표 생성]
    C --> D[전체 멤버 알림]
    D --> E[참석/불참 투표]
    
    E --> F{과반수 참석?}
    F -->|No| G[모임 자동 취소]
    G --> H["참석자 부족으로 취소" 알림]
    
    F -->|Yes| I[모임 확정]
    I --> J[참석 확정자 표시]
    J --> K[모임 당일]
    K --> L[지출 발생 시 EXPENSE 투표]
```

### 3.5 KICK 투표 플로우 (멤버 강퇴)

> 상세 플로우: [UX_FLOW_P0.md#강퇴kick-플로우](./UX_FLOW_P0.md#22-강퇴kick-플로우)

```mermaid
flowchart TD
    A[강퇴 요청] --> B[대상 선택 + 사유 입력]
    B --> C[KICK 투표 생성]
    C --> D[전체 멤버 투표]
    D --> E{72시간 내 70%?}
    E -->|No| F[강퇴 실패]
    E -->|Yes| G[강제 탈퇴]
    G --> H[보증금 처리]
    H --> I[피강퇴자 알림]
```

### 3.6 LEADER_KICK 투표 플로우 (리더 탄핵)

> 상세 플로우: [UX_FLOW_P1.md#리더-탄핵leader_kick-플로우](./UX_FLOW_P1.md#21-리더-탄핵leader_kick-플로우)

```mermaid
flowchart TD
    A[팔로워: 리더 교체 요청] --> B[사유 입력]
    B --> C[LEADER_KICK 투표 생성]
    C --> D[팔로워만 투표]
    D --> E{72시간 내 팔로워 70%?}
    E -->|No| F[탄핵 실패]
    E -->|Yes| G[리더 탄핵 승인]
    G --> H[새 리더 선출]
    H --> I[역할 변경 처리]
```

### 3.7 DISSOLVE 투표 플로우 (챌린지 해산)

```mermaid
flowchart TD
    A[리더: 해산 요청] --> B[최종 경고 모달]
    B --> C["전원 동의 필요" 안내]
    C --> D[DISSOLVE 투표 생성]
    D --> E[전체 멤버 투표]
    
    E --> F{100% 동의?}
    F -->|1명이라도 반대| G[해산 취소]
    G --> H["재논의가 필요합니다" 안내]
    
    F -->|전원 동의| I[잔액 계산]
    I --> J[오픈 / 멤버 수]
    J --> K[각 어카운트에 분배]
    K --> L[챌린지 COMPLETED]
    L --> M[해산 완료 알림]
```

---

## 4. 화면별 진입점 & 이탈점 (신규)

### 4.1 홈 화면

| 진입점 | 이탈점 |
|--------|--------|
| 앱 실행 | 챌린지 상세 (탭) |
| 로그인 완료 | 탐색 (탭) |
| 딥링크 | 마이페이지 (탭) |

### 4.2 챌린지 상세

| 진입점 | 이탈점 |
|--------|--------|
| 홈 GroupCard 탭 | 뒤로가기 (홈) |
| 탐색 검색 결과 탭 | 설정 (모달) |
| 초대 딥링크 | 외부 공유 |
| 푸시 알림 탭 | |

### 4.3 장부 탭

| 진입점 | 이탈점 |
|--------|--------|
| 챌린지 탭 전환 | 거래 상세 (모달) |
| 푸시 알림 | 투표 상세 (연결) |

---

## 5. 화면 상태 정의 (신규)

### 5.1 공통 상태

| 상태 | 트리거 | UI 표현 | 참조 |
|------|--------|---------|------|
| **Loading** | API 호출 중 | Skeleton / Spinner | WDS_FEEDBACK.md |
| **Error** | API 실패 | ErrorState + 재시도 | WDS_FEEDBACK.md |
| **Empty** | 데이터 없음 | EmptyState + CTA | WDS_FEEDBACK.md |
| **Success** | 작업 완료 | Toast / Confetti | WDS_FEEDBACK.md |

### 5.2 화면별 상태

| 화면 | Loading | Error | Empty |
|------|---------|-------|-------|
| **홈** | GroupCard Skeleton × 3 | 새로고침 CTA | "첫 챌린지를 찾아보세요" |
| **팔로우 피드** | PostCard Skeleton × 5 | 재시도 버튼 | "첫 글을 작성해보세요" |
| **장부** | ChartWrapper Skeleton | 재시도 버튼 | "아직 거래 내역이 없어요" |
| **투표** | VoteCard Skeleton × 3 | 재시도 버튼 | "진행 중인 투표가 없어요" |
| **모임** | MeetingCard Skeleton × 3 | 재시도 버튼 | "예정된 모임이 없어요" |

### 5.3 에러 복구 플로우

#### 5.3.1 네트워크 에러 복구

```mermaid
flowchart TD
    A[API 요청] --> B{응답?}
    B -->|타임아웃| C[네트워크 오류 화면]
    B -->|서버 에러 5xx| D[서버 오류 화면]
    B -->|성공| E[정상 처리]
    
    C --> F["연결이 끊겼어요" 표시]
    F --> G[재시도 버튼]
    G --> H{재시도?}
    H -->|Yes| A
    H -->|No - 3회 실패| I[오프라인 안내]
    I --> J[나중에 다시 시도 유도]
    
    D --> K["잠시 후 다시 시도해주세요"]
    K --> L[자동 재시도 - 3초 후]
    L --> A
```

#### 5.3.2 권한/상태 에러 복구

```mermaid
flowchart TD
    A[보호된 작업 시도] --> B{에러 타입?}
    
    B -->|401 인증 만료| C[토큰 갱신 시도]
    C --> D{갱신 성공?}
    D -->|Yes| E[원래 요청 재시도]
    D -->|No| F[로그인 화면]
    
    B -->|403 권한 없음| G["접근 권한이 없어요" Toast]
    G --> H[홈으로 리다이렉트]
    
    B -->|잔액 부족| I["잔액이 부족해요" 안내]
    I --> J[충전 모달 열기]
    J --> K[충전 완료]
    K --> E
    
    B -->|정원 초과| L["자리가 나면 알려드릴게요"]
    L --> M[대기열 등록 버튼]
    M --> N[알림 설정]
```

**에러 코드별 마이크로카피:**
| 상황 | 마이크로카피 |
|------|-------------|
| 결제 실패 | "다시 시도해보세요" |
| 네트워크 오류 | "연결이 끊겼어요" |
| 권한 없음 | "접근 권한이 없어요" |
| 잔액 부족 | "잔액이 부족해요" |
| 정원 초과 | "자리가 나면 알려드릴게요" |

---

## 6. 로딩 전략 (신규)

### 6.1 Skeleton 우선 적용 화면

- 홈 (GroupCard 목록)
- 피드 (PostCard 목록)
- 장부 (ChartWrapper + Timeline)
- 모임 (MeetingCard 목록)

### 6.2 Spinner 적용 액션

- 버튼 액션 (결제, 투표, 게시)
- 모달 내 API 호출
- 검색 결과 로딩

---

## 관련 문서

### Phase별 상세 플로우
- [UX_FLOW_P0.md](./UX_FLOW_P0.md) - **P0 Core 플로우** (Demo 필수 7개)
- [UX_FLOW_P1.md](./UX_FLOW_P1.md) - **P1 Essential 플로우** (필수 확장 7개)

### 참조 문서
- [UX_STRATEGY.md](../Strategy/UX_STRATEGY.md) - UX 전략 및 원칙
- [UX_SCENARIOS.md](../Strategy/UX_SCENARIOS.md) - 15개 시나리오
- [UX_EMOTION_MAP.md](../Strategy/UX_EMOTION_MAP.md) - 감정 맵핑
- [WDS_FEEDBACK.md](../../../02_ENGINEERING/Frontend/DesignSystem/WDS_FEEDBACK.md) - 피드백 컴포넌트
- [IA_SPECIFICATION.md](../Architecture/IA_SPECIFICATION.md) - 정보 구조

### API 문서
- [P0_Core_APIs.md](../../../03_DEVOPS/P0_Core_APIs.md) - P0 API 목록
- [P1_Essential_APIs.md](../../../03_DEVOPS/P1_Essential_APIs.md) - P1 API 목록

