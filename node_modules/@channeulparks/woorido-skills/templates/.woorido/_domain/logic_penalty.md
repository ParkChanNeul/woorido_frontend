# ⚖️ Penalty & Restriction Logic

> **Related Policies:** P-018~P-021, P-030~P-031, P-052~P-056
> **Purpose:** Define automated sanctions for rule violations.

## 1. Deposit Lock System (Critical)

### Trigger
- **Condition**: `credits.balance` < `monthly_support_amount` at auto-payment time (P-017)
- **Action**: Auto-withdraw from `locked_balance` (Deposit)

### Sanctions (State Transition)
1. **Immediate Revocation** (P-018)
    - `privilege_status` → `REVOKED`
    - Cannot vote `MEETING_ATTENDANCE`
    - Cannot vote `EXPENSE` (except Read-only)
2. **Grace Period (7 Days)** (P-021)
    - Pushed notification sent.
    - If recharged within 7 days: Status restored immediately.
3. **Meeting Exclusion (> 7 Days)**
    - Auto-removed from all upcoming meetings.
    - `meeting_attendees` status → `CANCELED_System`
4. **Auto Leave (> 60 Days)** (P-022)
    - `challenge_members` status → `AUTO_LEAVE`
    - Deposit **Confiscated** (P-052) -> WooriDo System Revenue.

## 2. Report System (False Reports)

### Sanction Steps (P-055)
| Count | Action | Status Code | Duration |
|:---:|:---|:---|:---|
| **1** | Warning Notification | `FALSE_REPORT` | - |
| **3** | Account Suspension | `SUSPENDED` | 7 Days |
| **5+** | Permanent Ban | `BANNED` | Permanent |

- **Counting**: `reports` table where `status = FALSE_REPORT`.
- **Reset**: No auto-reset defined (Lifetime count).

## 3. No-Show Penalty

- **Trigger**: Meeting status marked `COMPLETED` but user status is `NO_SHOW`.
- **Penalty**:
    - **Score**: -0.09 Brix (P-054)
    - **No Refund**: Meeting fee (if any) is not refunded.

## 4. Leader Inactivity (P-033 ~ P-035)

- **Condition**: `leader_last_active_at` > 30 days ago.
- **Action**:
    - "Kick Leader" vote becomes available (P-040).
    - If successful (>70%), Leadership transferred to highest scoring member.
