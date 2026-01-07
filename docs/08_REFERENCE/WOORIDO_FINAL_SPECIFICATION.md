# WOORIDO 최종 설계 명세서 (Final Specification)

> **Version**: v1.0 Final
> **Date**: 2025-12-30
> **Status**: Approved for Development
> **Deadline**: Demo Day 2026-02-25 (D-57)

---

## Executive Summary

**WOORIDO**는 "소모임 + 토스 = 우리두"라는 핵심 가치를 가진 **커뮤니티 기반 계모임 플랫폼**입니다.

### 해결하는 문제
1. **소모임/오픈채팅의 한계**: 회비를 걷을 수 없음
2. **토스 모임통장의 한계**: 계주가 독단적으로 출금 가능 → 먹튀 위험

### 우리두의 해답
- **SNS + 금융 통합**: 커뮤니티와 회비 관리가 하나의 플랫폼에서
- **선충전 락 시스템**: 1개월 보증금으로 이탈 방지
- **결제 감시 다각화**: 투표 기반 출금 승인으로 먹튀 원천 차단
- **장부 투명화**: 1원 단위까지 공개되는 오픈 원장

---

## Part 1: 핵심 시스템 설계

### 1.1 플랫폼 가상머니 시스템 (우리두 어카운트)

#### 개요
```
┌─────────────────────────────────────────────────────────────┐
│                    우리두 어카운트                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   총 잔액: 500,000원                                        │
│   ├── 가용 잔액: 300,000원 (출금/가입 가능)                  │
│   └── 락 잔액: 200,000원 (2개 모임 보증금)                   │
│                                                             │
│   가입 중인 모임:                                            │
│   ├── 책벌레들 (100,000원/월) → 보증금 락: 100,000원         │
│   └── 영화광들 (100,000원/월) → 보증금 락: 100,000원         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 충전
| 항목         | 스펙                            |
| ---------- | ----------------------------- |
| **충전 방법**  | 토스페이 API (MVP), 이후 카드/계좌이체 확장 |
| **최소 충전**  | 10,000원                       |
| **최대 충전**  | 1,000,000원                    |
| **충전 수수료** | 없음 (PG 비용 플랫폼 부담)             |

#### 출금
| 항목           | 스펙                          |
| ------------ | --------------------------- |
| **출금 가능 금액** | 가용 잔액 전액 (락 제외)             |
| **출금 시점**    | 언제든 가능                      |
| **출금 소요 시간** | 은행 영업일 기준 1~3일 (시스템은 즉시 처리) |
| **출금 수수료**   | 없음                          |

#### 자금 흐름 다이어그램
```
[유저 은행 계좌]
      │
      │ (1) 충전 (토스페이)
      ▼
┌─────────────────┐
│ 우리두 어카운트   │
│ (가용 잔액)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
(2) 모임     (5) 출금
가입 시      요청 시
    │         │
    ▼         ▼
┌─────────┐  [유저 은행 계좌]
│ 보증금   │
│ 락 잔액  │
└────┬────┘
     │
     │ (3) 매월 1일 자동 납입
     ▼
┌─────────────┐
│ 계모임 금고   │ → (4) 투표 승인 후 출금
└─────────────┘
```

---

### 1.2 계모임 가입 플로우

#### 기본 규칙
- **최소 납입금**: 10,000원/월
- **최대 납입금**: 제한 없음
- **보증금**: 1개월치 (고정 락)
- **가입 시 필요 금액**: 2개월치 (1개월 납입 + 1개월 보증금)

#### 가입 시나리오
```
[Step 1] 유저가 "책벌레들" 모임 발견 (월 100,000원)

[Step 2] "가입하기" 클릭
         ↓
         어카운트 잔액 확인
         필요 금액: 200,000원 (100k 납입 + 100k 보증금)
         ↓
         잔액 충분?
         YES → Step 3
         NO  → 충전 화면으로 이동 (부족 금액 안내)

[Step 3] 가입 확인 모달
         "책벌레들에 가입하시겠습니까?

          첫 달 납입금: 100,000원
          보증금 (락): 100,000원
          ─────────────────────
          총 차감액: 200,000원

          * 보증금은 완주/정상 탈퇴 시 반환됩니다
          * 중도 이탈 시 보증금이 몰수됩니다"

         [가입하기] [취소]

[Step 4] 가입 완료
         - 어카운트에서 200,000원 차감
           → 100,000원: 계모임 금고로 이동 (첫 달 납입)
           → 100,000원: 락 상태로 전환 (보증금)
         - 멤버 리스트에 추가
         - SNS 피드에 "OOO님이 가입했습니다" 자동 게시
```

#### 다중 가입
```
유저 어카운트: 500,000원

가입 시도:
├── 모임 A: 100,000원/월 → 필요 200,000원 ✅
├── 모임 B: 100,000원/월 → 필요 200,000원 ✅
└── 모임 C: 100,000원/월 → 필요 200,000원 ❌ (잔액 부족)

결과:
- A, B 가입 성공
- C 가입 시도 → "잔액이 부족합니다. 100,000원 충전이 필요합니다"
```

---

### 1.3 선충전 락 시스템 (Deposit Lock)

#### 락 메커니즘: 고정 락 (Scenario 1)
```
┌────────────────────────────────────────────────────────────┐
│ Timeline: 10개월 계모임 (월 100,000원)                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ [가입 시점]                                                 │
│  └─ 납입: 100,000원 → 계 금고                              │
│  └─ 락: 100,000원 → 보증금 (10개월간 유지)                  │
│                                                            │
│ [2~10개월차] 매월 1일                                       │
│  └─ 납입: 100,000원 → 계 금고 (어카운트에서 자동 차감)       │
│  └─ 락: 100,000원 유지 (변동 없음)                          │
│                                                            │
│ [완주 시점]                                                 │
│  └─ 락 해제: 100,000원 → 어카운트 가용 잔액으로 복귀         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### 이탈/퇴출 시 처리
```
[자발적 탈퇴 또는 투표 퇴출]
  ↓
보증금 100,000원 몰수
  ↓
남은 멤버들에게 균등 분배
  ↓
계모임 계속 진행 (정원 -1)

예시: 10명 → 1명 탈퇴
- 몰수 보증금: 100,000원
- 9명에게 분배: 각 11,111원
- 계모임은 9명으로 계속 진행
```

#### 미납 시 자동 처리
```
[매월 1일] 자동 납입 시도
  ↓
[잔액 부족 감지]
  ↓
[경고 알림 발송]
  "7일 내 충전하지 않으면 보증금에서 차감됩니다"
  ↓
[7일 후 미충전]
  → 보증금 100,000원에서 해당월 납입금 차감
  → 보증금 잔액: 0원
  → 경고: "3주 내 보증금 재충전 필요"
  ↓
[3주 후 미충전]
  → 자동 탈퇴 처리
  → 보증금 0원이므로 분배 없음

* MVP: 수동 충전만 지원
* 추후: CMS 자동 출금 도입
```

---

### 1.4 수수료 모델

#### 3단계 수수료 체계
| 구분 | 월 납입금 | 수수료율 | 예시 |
|------|----------|---------|------|
| **소액** | 10,000원 미만 | 1% | 5,000원 → 50원 |
| **일반** | 10,000~200,000원 | 3% | 100,000원 → 3,000원 |
| **고액** | 200,000원 초과 | 1.5% | 500,000원 → 7,500원 |

#### 수수료 적용 시점
```
[매월 1일 자동 납입]
  ↓
월 납입금: 100,000원
수수료 (3%): 3,000원
  ↓
어카운트에서 차감: 100,000원
  ↓
계모임 금고 적립: 97,000원
플랫폼 수익: 3,000원
```

#### 수수료 표시 (투명성)
```
[가입 화면]
월 납입금: 100,000원
플랫폼 수수료 (3%): -3,000원
────────────────────────
실제 계모임 적립: 97,000원

[10개월 예상]
총 납입: 1,000,000원
총 수수료: 30,000원
예상 적립금: 970,000원 × 10명 = 9,700,000원
```

---

## Part 2: 역할과 권한

### 2.1 CP (Community Producer) = 계주

#### 권한 매트릭스
| 기능 | CP 권한 | 비고 |
|------|---------|------|
| 모임 생성 | ✅ | 모임 개설자가 CP |
| 모임 정보 수정 | ✅ | 이름, 설명, 규칙 등 |
| 월 납입금 변경 | ✅ | 모집 중에만 가능 |
| 공지사항 작성 | ✅ | 피드 상단 고정 |
| 지출 요청 등록 | ✅ | 투표 안건 등록 |
| 멤버 강제 퇴출 | ❌ | 투표 필요 (70%) |
| 장부 금액 수정 | ❌ | 시스템만 가능 |
| 장부 메모 수정 | ✅ | 카테고리/메모만, 감사 로그 기록 |
| 긴급 신고 처리 | ⚠️ | 악성 유저 신고 가능 |

#### CP 전환/위임
```
[CP 자진 사임]
  → 다른 멤버에게 위임 (멤버 동의 필요)

[CP 탄핵]
  → 멤버 70% 찬성 투표로 CP 교체
  → 새 CP는 신뢰 점수 상위 멤버 중 선출
```

### 2.2 멤버 (Member)

#### 권한 매트릭스
| 기능 | 멤버 권한 | 비고 |
|------|-----------|------|
| 피드/댓글 작성 | ✅ | SNS 활동 |
| 좋아요 | ✅ | |
| 투표 참여 | ✅ | 지출 승인, 퇴출 투표 |
| 지출 요청 | ✅ | 본인 건만 등록 가능 |
| 장부 조회 | ✅ | 읽기 전용 |
| 탈퇴 | ✅ | 보증금 몰수 조건 |
| 신고 | ✅ | 악성 유저 신고 |

### 2.3 악성 유저 처리

#### 신고 시스템
```
[신고 사유]
- 보험/투자 영업
- 종교 전파
- 욕설/비방/혐오 발언
- 사기 의심 행위
- 기타 커뮤니티 규칙 위반

[처리 프로세스]
신고 접수 (CP 또는 멤버)
  ↓
신고 누적 카운트
  ↓
3건 누적 시 자동 일시정지 (7일)
  ↓
플랫폼 검토 (CS팀)
  ├─ 허위 신고 판정 → 복구 + 신고자 경고
  └─ 위반 확인 → 영구 퇴출 + 보증금 몰수
```

---

## Part 3: 결제 감시 다각화 (Consensus Pay)

### 3.1 지출 요청 & 투표 시스템

#### 지출 요청 플로우
```
[CP 또는 멤버]
  ↓
지출 요청 등록
├─ 금액: 50,000원
├─ 목적: "1월 모임 장소 대관료"
├─ 카테고리: 장소 대관
└─ 첨부: 견적서 이미지 (선택)
  ↓
[투표 생성]
  ↓
[멤버들 투표]
├─ 찬성 / 반대 / 기권
├─ 투표 기간: 72시간
└─ 기간 내 미투표 = 기권 처리
  ↓
[결과 판정]
├─ 과반수 찬성 → 승인 → 계 금고에서 차감
└─ 과반수 미달 → 거절 → 금액 유지
```

#### 투표 규칙
| 안건 유형 | 필요 찬성률 | 투표 기간 |
|----------|------------|----------|
| 일반 지출 (<100,000원) | 과반수 (50%+1) | 72시간 |
| 대형 지출 (≥100,000원) | 2/3 이상 | 72시간 |
| 멤버 퇴출 | 70% 이상 | 72시간 |
| 규칙 변경 | 80% 이상 | 7일 |
| 모임 해체 | 전원 동의 | 7일 |

#### 장부 기록
```
[지출 승인 시 자동 기록]

장부 Entry:
├─ 날짜: 2026-01-15
├─ 유형: 지출
├─ 금액: -50,000원
├─ 카테고리: 장소 대관
├─ 메모: "1월 모임 장소 대관료"
├─ 요청자: 김철수 (CP)
├─ 승인 투표: 찬성 7 / 반대 2 / 기권 1
└─ 잔액: 450,000원
```

---

### 3.2 정기 모임 시스템 (Regular Meetings) ⭐ 신규

> **핵심 가치**: 챌린지(계모임)의 핵심은 "실제 만남"
>
> 챌린지 잔액의 주요 지출처는 정기 모임 대관료, 식비 등입니다.

#### 정기 모임 투표 플로우

```
[리더가 정기 모임 참석 투표 생성]
├─ 제목: "2월 독서 토론회"
├─ 날짜: 2026-02-15 14:00
├─ 장소: "강남역 스터디카페"
└─ ❌ 예상 비용 기재 안 함 (비용은 별도 지출 투표로 처리)
  ↓
[팔로워들이 참석/불참 투표]
├─ 참석 / 불참
├─ 투표 기간: 72시간
└─ 기간 내 미투표 = 불참 처리
  ↓
[결과 판정]
├─ ⭐ 과반수 참석 → 모임 확정 (CONFIRMED)
└─ 과반수 미달 → 모임 취소 (CANCELLED)
```

> ⚠️ **왜 과반수 참석이 필수인가?**
>
> 과반수 이하에서도 모임이 개최된다면, 리더가 "본인만 참석 가능한 날짜"를
> 파악한 뒤 해당 날짜에 누적 금액 전액을 사용하거나 인출 후 도주하는
> "먹튀" 현상이 발생할 수 있습니다.
>
> **"금전적으로 신뢰할 수 있는" 서비스 구조를 위한 핵심 안전장치입니다.**

#### 모임 관련 지출 투표 규칙

| 규칙 | 상세 |
|------|------|
| **투표 참여 자격** | ⭐ **해당 모임 참석자만** 투표 가능 |
| **투표 빈도** | 지출할 **때마다** 별도 투표 |
| **일반 지출과의 차이** | 전체 챌린지 멤버가 아닌 **참석자 기준** |

> ⚠️ **왜 지출마다 투표하는가?**
>
> 한 번에 큰 금액을 승인받으면, 승인된 결제 수단(바코드 등)으로
> 무분별한 지출이 가능해집니다. 건별 승인으로 금전적 신뢰 구조를 유지합니다.

#### 투표 타입

| 타입 | 투표 내용 | 참여자 |
|------|----------|-------|
| `MEETING_ATTENDANCE` | 참석/불참 | 전체 팔로워 |
| `EXPENSE` (with meeting_id) | 지출 승인 | 해당 모임 참석자 |

#### API 엔드포인트 (정기 모임)

```
# 정기 모임 투표
POST   /api/challenges/{id}/meetings/vote  # 모임 참석 투표 생성 (리더)

# 모임 관리
GET    /api/challenges/{id}/meetings       # 모임 목록
GET    /api/meetings/{meetingId}           # 모임 상세
POST   /api/meetings/{meetingId}/attend    # 참석 등록
DELETE /api/meetings/{meetingId}/attend    # 참석 취소
```

---

## Part 4: SNS 기능 (커뮤니티)

### 4.1 MVP 범위

#### 포함 기능
| 기능 | 상세 | 구현 방식 |
|------|------|----------|
| **피드** | 텍스트 + 이미지 | 최대 2,000자, 이미지 10장 |
| **댓글** | 댓글 + 대댓글 | 2단계까지 |
| **좋아요** | 피드/댓글 좋아요 | 토글 방식 |
| **공지사항** | CP 전용 고정 글 | 피드 상단 핀 |
| **이미지 업로드** | 다중 이미지 | S3 저장 |
| **페이지네이션** | 피드 목록 | 20개씩 로드 |

#### 제외 기능 (Post-Demo)
- 무한 스크롤 → 페이지네이션으로 대체
- 해시태그
- 멘션 (@)
- 이미지 외 미디어 (동영상)
- 실시간 알림 (웹소켓)

### 4.2 피드 구조
```
┌────────────────────────────────────────────────┐
│ [공지] 1월 모임 장소 안내 📌                      │
│ 김철수 (CP) · 2시간 전                          │
│                                                │
│ 이번 달 모임은 강남 스터디카페에서 진행합니다.     │
│ 일시: 1월 20일 (토) 오후 2시                     │
│ 장소: 강남역 3번 출구 도보 5분                    │
│                                                │
│ [이미지: 카페 지도]                              │
│                                                │
│ ❤️ 8  💬 5                                      │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 이영희 · 30분 전                                │
│                                                │
│ 이번에 읽은 책 완독 인증합니다! 📚               │
│                                                │
│ [이미지: 책 표지]                               │
│                                                │
│ ❤️ 12  💬 3                                     │
│                                                │
│ └─ 박민수: 저도 다 읽었어요! 👏                  │
│    └─ 이영희: @박민수 고생하셨어요~              │
│ └─ 김철수: 독후감 공유해주세요!                  │
│ └─ [댓글 더보기]                                │
└────────────────────────────────────────────────┘
```

### 4.3 API 엔드포인트 (SNS)

```
# 피드
GET    /api/gye/{gyeId}/posts          # 피드 목록 (페이지네이션)
POST   /api/gye/{gyeId}/posts          # 피드 작성
GET    /api/posts/{postId}             # 피드 상세
PUT    /api/posts/{postId}             # 피드 수정
DELETE /api/posts/{postId}             # 피드 삭제

# 좋아요
POST   /api/posts/{postId}/like        # 피드 좋아요
DELETE /api/posts/{postId}/like        # 피드 좋아요 취소

# 댓글
GET    /api/posts/{postId}/comments    # 댓글 목록
POST   /api/posts/{postId}/comments    # 댓글 작성
PUT    /api/comments/{commentId}       # 댓글 수정
DELETE /api/comments/{commentId}       # 댓글 삭제

# 댓글 좋아요
POST   /api/comments/{commentId}/like
DELETE /api/comments/{commentId}/like

# 대댓글
GET    /api/comments/{commentId}/replies
POST   /api/comments/{commentId}/replies

# 공지사항
GET    /api/gye/{gyeId}/announcements
POST   /api/gye/{gyeId}/announcements  # CP만
PUT    /api/announcements/{id}         # CP만
DELETE /api/announcements/{id}         # CP만

# 미디어
POST   /api/gye/{gyeId}/media          # 이미지 업로드
DELETE /api/media/{mediaId}

총 API: 18개
```

---

## Part 5: 장부 투명화 (Open Ledger)

### 5.1 장부 구조

#### 장부 타임라인
```
┌────────────────────────────────────────────────────────────┐
│ 📊 책벌레들 장부                              잔액: 500,000원│
├────────────────────────────────────────────────────────────┤
│                                                            │
│ 2026-01-15  지출  장소 대관료           -50,000원  450,000원│
│             [투표 승인: 찬성 7/반대 2]                       │
│                                                            │
│ 2026-01-05  입금  1월 회비 (이영희)    +100,000원  500,000원│
│                                                            │
│ 2026-01-05  입금  1월 회비 (박민수)    +100,000원  400,000원│
│                                                            │
│ 2026-01-05  입금  1월 회비 (김철수)    +100,000원  300,000원│
│                                                            │
│ ... (이전 내역)                                             │
│                                                            │
│ [이전 페이지] [1] [2] [3] [다음 페이지]                      │
└────────────────────────────────────────────────────────────┘
```

#### 장부 요약 (대시보드)
```
┌─────────────────┬─────────────────┬─────────────────┐
│    총 수입       │    총 지출       │   현재 잔액     │
│   1,000,000원   │    200,000원    │   800,000원     │
│   (10명 납입)    │   (2건 승인)     │                │
└─────────────────┴─────────────────┴─────────────────┘

┌───────────────────────────────────────────────────────────┐
│  📈 월별 지출 추이                                         │
│                                                           │
│  250k ┤                                                   │
│  200k ┤     ╭─╮                                           │
│  150k ┤  ╭──╯ │                                           │
│  100k ┤──╯    ╰──╮                                        │
│   50k ┤          ╰──                                      │
│     0 ┼────┬────┬────┬────┬────                          │
│       10월  11월  12월  1월   2월                          │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  🥧 카테고리별 지출 비율                                    │
│                                                           │
│  ████████████████████░░░░░░░░░░  장소 대관 (60%)          │
│  ████████░░░░░░░░░░░░░░░░░░░░░░  다과비 (25%)             │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░  도서 구입 (15%)          │
└───────────────────────────────────────────────────────────┘
```

### 5.2 Recharts 차트 구현

```typescript
// 월별 지출 추이 (LineChart)
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={monthlyData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
    <Line type="monotone" dataKey="expense" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>

// 카테고리별 비율 (PieChart)
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={categoryData}
      dataKey="amount"
      nameKey="category"
      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
    />
    <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
  </PieChart>
</ResponsiveContainer>
```

---

## Part 6: 기술 스택 & API

### 6.1 확정 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| **Frontend** | React 18 + TypeScript | Vite 빌드 |
| | Tailwind CSS | 반응형 |
| | Radix UI | 접근성 컴포넌트 |
| | Recharts | 차트 시각화 |
| | React Query | 서버 상태 관리 |
| | Zustand | 클라이언트 상태 |
| **Backend** | Spring Boot 3.2 | REST API |
| | Spring Security + JWT | 인증/인가 |
| | Spring Data JPA | ORM |
| **Database** | Oracle 21c XE | Docker |
| **Storage** | AWS S3 | 이미지 저장 |
| **Payment** | 토스페이먼츠 | MVP 결제 |
| **Deployment** | Vercel (FE) | |
| | Docker (BE) | |

### 6.2 전체 API 엔드포인트 (MVP)

```
# 인증 (3개)
POST   /api/auth/signup               # 회원가입
POST   /api/auth/login                # 로그인
POST   /api/auth/refresh              # 토큰 갱신

# 유저 (4개)
GET    /api/users/me                  # 내 정보
PUT    /api/users/me                  # 내 정보 수정
GET    /api/users/me/account          # 어카운트 조회
POST   /api/users/me/account/charge   # 충전

# 계모임 (8개)
GET    /api/gye                       # 목록 조회
POST   /api/gye                       # 생성
GET    /api/gye/{id}                  # 상세 조회
PUT    /api/gye/{id}                  # 수정 (CP)
POST   /api/gye/{id}/join             # 가입
POST   /api/gye/{id}/leave            # 탈퇴
GET    /api/gye/{id}/members          # 멤버 목록
DELETE /api/gye/{id}/members/{userId} # 멤버 퇴출 (투표 후)

# 장부 (4개)
GET    /api/gye/{id}/ledger           # 타임라인
GET    /api/gye/{id}/ledger/summary   # 요약 (차트 데이터)
POST   /api/gye/{id}/ledger           # 수동 기록 (개발용)
PUT    /api/ledger/{entryId}          # 메모 수정 (CP)

# 투표 (5개)
GET    /api/gye/{id}/votes            # 투표 목록
POST   /api/gye/{id}/votes            # 투표 생성 (지출 요청)
GET    /api/votes/{voteId}            # 투표 상세
POST   /api/votes/{voteId}/cast       # 투표 참여
GET    /api/votes/{voteId}/result     # 투표 결과

# SNS (18개) - Part 4 참조

# 신고 (2개)
POST   /api/reports                   # 신고 접수
GET    /api/reports/me                # 내 신고 내역

총 API: 44개
```

### 6.3 DB 스키마 (핵심)

```sql
-- 유저
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  profile_image VARCHAR(500),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 어카운트 (가상머니)
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  balance BIGINT NOT NULL DEFAULT 0,           -- 가용 잔액
  locked_balance BIGINT NOT NULL DEFAULT 0,    -- 락 잔액
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 계모임
CREATE TABLE gye (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  monthly_amount BIGINT NOT NULL,              -- 월 납입금
  deposit_amount BIGINT NOT NULL,              -- 보증금 (= monthly_amount)
  max_members INT NOT NULL,
  current_members INT NOT NULL DEFAULT 0,
  balance BIGINT NOT NULL DEFAULT 0,           -- 계 금고 잔액
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting',
  cp_id UUID NOT NULL REFERENCES users(id),
  payment_day INT NOT NULL DEFAULT 1,          -- 납입일 (1일 고정)
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 계모임 멤버
CREATE TABLE gye_members (
  id UUID PRIMARY KEY,
  gye_id UUID REFERENCES gye(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) NOT NULL DEFAULT 'member',  -- 'cp' or 'member'
  deposit_locked BIGINT NOT NULL,              -- 락된 보증금
  joined_at TIMESTAMP NOT NULL,
  left_at TIMESTAMP,
  UNIQUE (gye_id, user_id)
);

-- 장부
CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  gye_id UUID REFERENCES gye(id),
  user_id UUID REFERENCES users(id),           -- 납입자/요청자
  type VARCHAR(20) NOT NULL,                   -- 'income', 'expense', 'deposit_in', 'deposit_out'
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,               -- 거래 후 잔액
  category VARCHAR(50),
  memo TEXT,
  vote_id UUID REFERENCES votes(id),           -- 지출인 경우 연결된 투표
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 투표
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  gye_id UUID REFERENCES gye(id),
  type VARCHAR(30) NOT NULL,                   -- 'expense', 'kick', 'rule_change', 'dissolve'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  amount BIGINT,                               -- expense인 경우
  target_user_id UUID REFERENCES users(id),   -- kick인 경우
  required_ratio DECIMAL(3,2) NOT NULL,        -- 필요 찬성률
  status VARCHAR(20) NOT NULL DEFAULT 'open',  -- 'open', 'approved', 'rejected', 'expired'
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- 투표 참여
CREATE TABLE vote_casts (
  id UUID PRIMARY KEY,
  vote_id UUID REFERENCES votes(id),
  user_id UUID REFERENCES users(id),
  choice VARCHAR(10) NOT NULL,                 -- 'approve', 'reject', 'abstain'
  created_at TIMESTAMP NOT NULL,
  UNIQUE (vote_id, user_id)
);

-- 피드
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  gye_id UUID REFERENCES gye(id),
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_announcement BOOLEAN NOT NULL DEFAULT FALSE,
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- 미디어
CREATE TABLE post_media (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  url VARCHAR(500) NOT NULL,
  type VARCHAR(20) NOT NULL,                   -- 'image'
  display_order INT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- 댓글
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  parent_id UUID REFERENCES comments(id),      -- 대댓글인 경우
  author_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP
);

-- 좋아요 (피드)
CREATE TABLE post_likes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  UNIQUE (post_id, user_id)
);

-- 좋아요 (댓글)
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY,
  comment_id UUID REFERENCES comments(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL,
  UNIQUE (comment_id, user_id)
);

-- 신고
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  gye_id UUID REFERENCES gye(id),
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP
);
```

---

## Part 7: 개발 우선순위 (Demo Day)

### 7.1 1순위 (절대 필수)

| 순번 | 기능 | API 수 | 예상 기간 |
|------|------|--------|----------|
| 1 | **SNS (피드/댓글/좋아요/이미지)** | 18개 | 3주 |
| 2 | **계모임 가입 플로우** | 8개 | 1주 |
| 3 | **장부 + Recharts 차트** | 4개 | 1주 |
| 4 | **가상머니 충전/차감** | 4개 | 1주 |
| 5 | **보증금 락/해제** | (가입에 포함) | - |
| 6 | **투표 시스템** | 5개 | 1.5주 |

**총 예상: 7.5주**

### 7.2 2순위 (있으면 좋음)

| 순번 | 기능 | 비고 |
|------|------|------|
| 1 | 반응형 (Mobile + Desktop) | 동시 진행 |
| 2 | 재정 프로필 입력 | 선택 기능 |
| 3 | Django 분석 | 추천 알고리즘 |
| 4 | Elasticsearch 검색 | 태그 검색 |

### 7.3 3순위 (Post-Demo)

| 순번 | 기능 |
|------|------|
| 1 | 실제 결제 연동 (토스페이먼츠 라이브) |
| 2 | 푸시 알림 |
| 3 | 무한 스크롤 |
| 4 | CMS 자동 출금 |
| 5 | 금액별 차등 기능 |

---

## Part 8: 핵심 차별화 요약

### WOORIDO vs 경쟁사

| 기능 | 카카오 모임통장 | 토스 모임통장 | 소모임 | **WOORIDO** |
|------|---------------|--------------|--------|-------------|
| **SNS/커뮤니티** | ❌ (카톡 별도) | ❌ (게시판만) | ✅ | ✅ **통합** |
| **회비 수금** | ✅ | ✅ | ❌ | ✅ |
| **먹튀 방지** | ❌ | ❌ | N/A | ✅ **선충전 락** |
| **출금 통제** | ❌ (총무 독단) | ❌ (총무 독단) | N/A | ✅ **투표 승인** |
| **장부 투명화** | △ (내역만) | △ (내역만) | N/A | ✅ **시각화** |

### 핵심 메시지

> **"소모임처럼 모이고, 토스처럼 관리하되, 먹튀 걱정은 없다"**

1. **커뮤니티 = SNS**: 피드, 댓글, 공지로 소통
2. **자금 = 선충전 락**: 1개월 보증금으로 이탈 방지
3. **투명성 = 투표 + 장부**: 1원 단위까지 공개, 모든 지출 멤버 승인

---

## Appendix: 용어 정의

| 용어 | 정의 |
|------|------|
| **우리두 어카운트** | 플랫폼 가상머니 지갑 |
| **가용 잔액** | 출금/가입 가능한 금액 |
| **락 잔액** | 보증금으로 잠긴 금액 |
| **CP (Community Producer)** | 계주, 모임 관리자 |
| **선충전 락** | 가입 시 1개월 보증금 예치 |
| **결제 감시 다각화** | 투표 기반 지출 승인 시스템 |
| **장부 투명화** | Recharts 시각화된 오픈 원장 |

---

**Document Version**: 1.0 Final
**Approved By**: Project Owner
**Last Updated**: 2025-12-30
**Next Review**: Demo Day (2026-02-25)
