# 🏗️ Information Architecture (IA)

> **Based on:** `IA_SPECIFICATION.md` v2.4 (SNS-First)
> **Goal:** "SNS Experience" -> "Trust Building" -> "Finance Integration"

## 1. Structure Overview

```text
WOORIDO
├── [Global] Header, BottomNav (Mobile), Footer
├── [Auth]   Login, SignUp (Term -> Info -> Complete)
├── [Core]   Home (Integrated Feed), Discovery (Search)
├── [Group]  Detail (Public), Community (Private Tabs)
└── [My]     My Groups, Account Dashboard
```

## 2. Key Flows

### A. Community Home (Group Detail)
**Tabs (Priority Order):**
1.  **Feed (SNS)**: Main activity stream. Posts, notices, comments.
2.  **Meeting**: Regular meeting schedule & attendance voting.
3.  **Ledger**: Financial transparency. Approved expenses & charts.
4.  **Vote**: Consensus Pay system. Open/Kick/Dissolve votes.
5.  **Members**: List with Brix scores & roles.

### B. WooriDo Account
**Concept**: Wallet for "Support" & "Deposit Lock".
- **Dashboard**: Total Credit = Available + Locked.
- **Charge**: Toss Pay integration.
- **Withdraw**: Transfer to real bank account (1-3 days).

### C. Onboarding (Join Challenge)
1.  **View Detail**: Public info (Title, Fee, Rule).
2.  **Join Request**:
    - Check `Available Credit` >= `Support` + `Deposit` + `Entry Fee`.
    - If insufficient -> Prompt Charge.
    - If sufficient -> Lock Deposit -> Deduct Support/Entry Fee -> Join.

## 3. Navigation Rules
- **Mobile**: Bottom Tab (`Home`, `Discover`, `Create`, `MyGroups`, `MyProfile`).
- **Desktop**: Header Menu.
- **Auth**: Redirect to `/login` if protected route accessed.
