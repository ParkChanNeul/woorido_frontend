# 🗣️ WooriDo Terminology (Strict Enforcement)

> **Version**: v2.2 (Synced with docs/TERMINOLOGY.md)
> **Purpose**: Legal compliance & Domain clarity.

---

## 1. 🚫 Legal & Rebranding (Forbidden vs Standard)

| Forbidden (Finance Law Risk) | Standard (Community Concept) | Definition |
| :--- | :--- | :--- |
| **계모임 (Gye-moim)** | **Challenge (챌린지)** | Group channel for shared goals. |
| **계주 (Gye-ju)** | **Leader (리더)** | Creator/Admin of the challenge. |
| **계원 (Gye-won)** | **Follower (팔로워)** | Participant of the challenge. |
| **회비 납부 (Payment)** | **Support (서포트)** | Monthly contribution act. |
| **지출 요청/승인** | **Open (오픈)** | Voting process for spending. |
| **리워드/수익금** | **Benefit (베네핏)** | Leader's incentive (discount). |

---

## 2. 💎 Core Domain Concepts

### Platform Currency
- **Credit (크레딧)**: Virtual currency (1:1 KRW).
- **Deposit (보증금)**: Locked credits for reliability (Safety Net).

### Challenge Mechanics
- **Challenge Account**: Where Support + Entry Fee gathers.
- **Entry Fee (입회비)**: Fairness cost for new members.
  - **Formula**: `Balance / Followers Count` (리더 제외)
- **Completion (완주)**: 1-year operation milestone.
  - **NOT** dissolution, but certification mark (like Instagram blue check)
  - Challenge continues after completion.

---

## 3. 💰 Deposit Lock System (보증금 락)

### Concept
Deposit is NOT transferred to Challenge Account.
It stays **locked** in user's personal Account.

### Flow
```
[가입 시]
└─ 1개월분 보증금이 "락" 상태로 전환
└─ 실제로 빠져나가지 않음, 챌린지 금고에 합산 안됨

[미납 발생 시]
└─ 보증금에서 자동 서포트 납입
└─ "보증금 충전 필요" 안내
└─ 미충전 시 → 자동 탈퇴 (리더만 알림)

[정상 탈퇴 시]
└─ 보증금 락 해제 → 가용 크레딧 복귀
```

### Key Points
| Item | Description |
|------|-------------|
| **Location** | User's personal Account (locked) |
| **Challenge Account** | ❌ Not included |
| **Return** | On normal exit (no defaults) |
| **Forfeit** | On exit with unpaid Support |

---

## 4. 🏆 Completion System (완주 시스템)

### Condition
- **1 year continuous operation**
- Independent of default history

### Effect
- **Certification Mark** on Challenge (블루체크 컨셉)
- Challenge continues (❌ NOT dissolved)
- Support continues

---

## 5. 👥 User Types

| Type | Description | Permissions |
|------|-------------|-------------|
| **Leader** | Challenge creator | Full control |
| **Follower** | Participant | Read, Vote |
| **Revoked (권한박탈)** | Deposit used for default | Limited (7-day grace period) |
| **Attendee (참석자)** | Registered for meeting | Meeting-specific |

### Revoked State
- Triggered when Deposit is used to cover default
- **7-day grace period** to recharge
- If not recharged → automatic exit

---

## 6. 📱 UI Copy Guidelines

### Button Actions
| 기존 | 변경 후 |
|------|--------|
| "계모임 만들기" | "챌린지 시작하기" |
| "계모임 가입" | "챌린지 참여하기" |
| "회비 납부" | "서포트하기" |
| "지출 요청" | "오픈 사용 신청" |

### Screen Titles
| 기존 | 변경 후 |
|------|--------|
| "내 계모임" | "내 챌린지" |
| "장부" | "거래 내역" |
| "잔액" | "오픈 잔액" |
