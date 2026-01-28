# 🔐 Access Control (RBAC)

> **Roles**: Leader 👑, Follower 👤, Revoked ⚠️, Attendee ✅, Non-Member

## 1. Challenge Permissions

| Feature | Leader | Follower | Revoked | Non-Member |
| :--- | :---: | :---: | :---: | :---: |
| **View Info** | ✅ | ✅ | ✅ | ✅ |
| **Edit Info** | ✅ | ❌ | ❌ | ❌ |
| **Create Meeting** | ✅ | ❌ | ❌ | ❌ |
| **Join Meeting** | - | ✅ | ❌ | ❌ |
| **Create Vote** | ✅ | ❌ | ❌ | ❌ |
| **Cast Vote** | ✅ | ✅ | ❌ | ❌ |
| **View Ledger** | ✅ | ✅ | ✅ | ❌ |
| **Edit Ledger** | ✅ (Memo) | ❌ | ❌ | ❌ |
| **Kick Member** | ✅ (Vote) | ❌ | ❌ | ❌ |

## 2. Special States

### A. Revoked (권한 박탈)
- **Cause**: Deposit Lock used for default payment.
- **Restriction**:
    - Cannot Vote (Attendance or Expense).
    - Cannot Attend Meetings.
    - **Can** View Feed/Ledger (Read-only).
- **Recovery**: Recharge credit >= Lock amount. (Auto-restore).

### B. Attendee (참석자)
- **Scope**: Specific Meeting Instance.
- **Privilege**: Can vote on `EXPENSE` type votes linked to that meeting (`meeting_id`).
- **Logic**: Only those who go to the venue should decide how to spend money there.

## 3. Admin (System)
- **Override**: Admin can FORCE KICK or FREEZE challenges if `fintech_rules` violations are detected (e.g., gambling keywords).
- **Audit**: Full read access to all Ledgers.
