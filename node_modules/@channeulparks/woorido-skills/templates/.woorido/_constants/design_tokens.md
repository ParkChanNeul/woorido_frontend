# 🎨 Design Tokens (WDS v2.1)

> **Philosophy**: Warm Tone-on-Tone (Orange + Grey)
> **Implementation**: CSS Variables (`--color-*`) / TypeScript (`colors.*`)
> **Synced with**: `docs/02_ENGINEERING/Frontend/DesignSystem/DESIGN_TOKENS.md`

---

## 1. Color Palette

### Primary (Mandarin Orange)
| Token (CSS) | Token (JS) | Hex | Usage |
|-------------|------------|-----|-------|
| `--color-orange-500` | `colors.orange500` | **#E9481E** | Primary/Brand |
| `--color-orange-600` | `colors.orange600` | #D43D16 | Hover |
| `--color-orange-50` | `colors.orange50` | #FFF7ED | Background |

### Grey Scale
| Token (CSS) | Token (JS) | Hex | Usage |
|-------------|------------|-----|-------|
| `--color-grey-900` | `colors.grey900` | #1C1917 | Text Primary |
| `--color-grey-500` | `colors.grey500` | #78716C | Text Secondary |
| `--color-grey-100` | `colors.grey100` | #F5F5F4 | Background |

### Semantic Colors
| Category | Token | Hex | Usage |
|----------|-------|-----|-------|
| Income (+) | `colors.income` | #F59E0B | 수입 표시 |
| Expense (-) | `colors.expense` | #1C1917 | 지출 표시 (Red 아님) |
| Locked | `colors.locked` | #78716C | 보증금 락 |
| Success | `colors.success` | #16A34A | 성공 상태 |
| Error | `colors.error` | #DC2626 | 에러 상태 |
| Info | `colors.info` | #E9481E | 정보 (Primary) |

### Brix Scale (Sweetness)
| Level | Token (CSS) | Token (JS) | Hex | Range | Emoji |
|:---:|:---|:---|:---|:---|:---:|
| Honey | `--color-brix-honey` | `colors.brixHoney` | #F59E0B | 60+ | 🍯 |
| Grape | `--color-brix-grape` | `colors.brixGrape` | #9333EA | 40~60 | 🍇 |
| Apple | `--color-brix-apple` | `colors.brixApple` | #F43F5E | 25~40 | 🍎 |
| Mandarin | `--color-brix-mandarin` | `colors.brixMandarin` | #E9481E | 12~25 | 🍊 |
| Tomato | `--color-brix-tomato` | `colors.brixTomato` | #FCA5A5 | 0~12 | 🍅 |
| Bitter | `--color-brix-bitter` | `colors.brixBitter` | #14532D | <0 | 🥒 |

---

## 2. Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Minimal gap |
| `--space-2` | 8px | Icon gap |
| `--space-3` | 12px | Button padding (vertical) |
| `--space-4` | 16px | Section gap, Button padding (horizontal) |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Page margin |

---

## 3. Typography (Pretendard)

### Font Weights
| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--font-w1` | 28px | Bold (700) | 1.3 | Headline |
| `--font-w2` | 24px | Semibold (600) | 1.35 | Section Title |
| `--font-w3` | 20px | Semibold (600) | 1.4 | Card Title |
| `--font-w4` | 17px | Regular (400) | 1.5 | Body |
| `--font-w5` | 15px | Regular (400) | 1.5 | Body Small |
| `--font-w6` | 13px | Medium (500) | 1.4 | Label |
| `--font-w7` | 11px | Regular (400) | 1.4 | Caption |

### Financial Text (Critical)
**Rule**: Always use `tabular-nums` for money.
```css
.financial {
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

---

## 4. Shapes

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Small buttons |
| `--radius-md` | 12px | Default |
| `--radius-lg` | 20px | Card |
| `--radius-xl` | 24px | Modal, BottomSheet |

---

## 5. Animation

| Token | Value | Usage |
|-------|-------|-------|
| `--motion-duration-fast` | 150ms | Hover, Toggle |
| `--motion-duration-normal` | 250ms | Default |
| `--motion-duration-slow` | 400ms | Page transition |
| `--motion-ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default |

---

## 6. Token Mapping (CSS ↔ TypeScript)

```typescript
// styles/tokens.ts
export const colors = {
  orange500: '#E9481E',
  orange600: '#D43D16',
  orange50: '#FFF7ED',
  grey900: '#1C1917',
  grey500: '#78716C',
  grey100: '#F5F5F4',
  // Semantic
  income: '#F59E0B',
  expense: '#1C1917',
  locked: '#78716C',
  success: '#16A34A',
  error: '#DC2626',
  info: '#E9481E',
  // Brix
  brixHoney: '#F59E0B',
  brixGrape: '#9333EA',
  brixApple: '#F43F5E',
  brixMandarin: '#E9481E',
  brixTomato: '#FCA5A5',
  brixBitter: '#14532D',
};

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
};
```
