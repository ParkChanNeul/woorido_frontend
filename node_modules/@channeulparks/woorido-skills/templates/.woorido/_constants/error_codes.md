# ⚠️ Error Codes (Standardized)

> **Format**: `DOMAIN_XXX`
> **Response**: `{ success: false, error: { code, message } }`

## 1. Domains

### AUTH (Authentication)
- `AUTH_001`: Credentials invalid.
- `AUTH_004`: Refresh token expired.
- `AUTH_015`: Admin privileges required.

### USER (User Management)
- `USER_004`: Brix < 0 (Banned from joining).
- `USER_005`: Pending Access (Withdrawal wait).
- `USER_009`: Settlement pending (Cannot leave).

### ACCOUNT (Money)
- `ACCOUNT_002`: Min charge 10,000 KRW.
- `ACCOUNT_004`: Insufficient Balance.
- `ACCOUNT_006`: Monthly withdrawal limit exceeded.

### CHALLENGE (Group)
- `CHALLENGE_005`: Full capacity.
- `CHALLENGE_010`: Cannot delete active challenge.

### VOTE (Consensus)
- `VOTE_002`: Deadline must be > 24h.
- `VOTE_006`: Already voted.

### MEETING (Event)
- `MEETING_003`: Already attending.
- `MEETING_006`: Not an attendee (Cannot vote).

## 2. Handling Strategy

- **UI**: Map `code` to user-friendly toast messages.
- **Logging**: Log `code` + `stacktrace` to Backend Logs.
- **Retry**: Auto-retry on `500` (Network), specific handling for `400` (Logic).
