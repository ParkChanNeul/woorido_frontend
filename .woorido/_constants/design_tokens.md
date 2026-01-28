# 🎨 Design Tokens (WDS v2.0)

> **Philosophy**: Warm Tone-on-Tone (Orange + Grey)
> **Implementation**: CSS Variables (`--color-*`)

## 1. Color Palette

### Primary (Mandarin Orange)
- Main: `#E9481E` (`--color-orange-500`)
- Hover: `#D43D16` (`--color-orange-600`)
- Bg: `#FFF7ED` (`--color-orange-50`)

### Semantic Colors
- **Financial**:
  - `Income` (+): `#F59E0B` (Honey)
  - `Expense` (-): `#1C1917` (Grey900) - *Not Red*
  - `Locked`: `#78716C` (Grey500)
- **Status**:
  - `Success`: `#16A34A`
  - `Error`: `#DC2626`

### Brix Scale (Sweetness)
| Level | Color | Hex | Emoji |
|:---:|:---|:---|:---:|
| Honey | `--color-brix-honey` | `#F59E0B` | 🍯 |
| Grape | `--color-brix-grape` | `#9333EA` | 🍇 |
| Apple | `--color-brix-apple` | `#F43F5E` | 🍎 |
| Mandarin| `--color-brix-mandarin`| `#E9481E` | 🍊 |
| Tomato | `--color-brix-tomato` | `#FCA5A5` | 🍅 |

## 2. Typography (Pretendard)

### Financial Text (Critical)
**Rule**: Always use `tabular-nums` for money.
```css
.financial {
  font-family: var(--font-sans);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
```

### Weights
- **W1 (Headline)**: 28px/Bold
- **W4 (Body)**: 17px/Regular
- **W6 (Label)**: 13px/Medium

## 3. Shapes
- **Radius**: Large rounded corners (Toss-like).
  - Card: `20px` (`--radius-lg`)
  - Modal: `24px` (`--radius-xl`)

## 4. Animation
- **Duration**: Fast 150ms / Normal 250ms / Slow 400ms.
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)`.
