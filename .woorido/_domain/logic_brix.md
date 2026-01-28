# 🍬 Brix (당도) System Logic

> **Related Policies:** P-051, P-054, P-061
> **Purpose:** Measure user reliability and activity level in 'Sweetness' (Brix).

## 1. Formula

$$Brix = (Score_{payment} \times 0.7) + (Score_{activity} \times 0.15) + 12$$

- **Base Score**: 12 Brix (Initial User)
- **Max Score**: 80 Brix
- **Update Cycle**: Monthly (1st day, 00:00 KST)

## 2. Components

### A. Payment Score (70% Weight)
- **Source**: `credits` transaction history
- **Factors**:
  - Regular Support payments (On-time)
  - No refund requests
  - High deposit ratio

### B. Activity Score (15% Weight)
- **Source**: `meeting_attendees` & `user_scores`
- **Factors**:
  - **Meeting Attendance**: +0.09 points per attendance (P-051)
  - **No-Show**: -0.09 points per no-show (P-054)
  - **Community**: Feed posts, comments, voting participation

## 3. Implementation Details

### Database (Oracle)
- Table: `user_scores`
- Columns: `total_score`, `activity_score`, `payment_score`, `calculated_at`
- Constraint: `total_score` BETWEEN 0 AND 80

### Calculation Job (Django)
- Batch Process: `calculate_monthly_brix_job`
- Lock: Pessimistic Lock on `user_scores` during update
- Caching: Redis stores daily increments (`activity_score_delta`) to prevent DB load

## 4. Visualization (WDS)
- **Colors**:
  - 🍯 60+: High Trust (`--color-brix-honey`)
  - 🍇 40~60: Good (`--color-brix-grape`)
  - 🍎 25~40: Normal (`--color-brix-apple`)
  - 🍊 12~25: Watch (`--color-brix-mandarin`)
  - 🍅 0~12: Warning (`--color-brix-tomato`)
  - 🥒 <0: Ban (`--color-brix-bitter`)
