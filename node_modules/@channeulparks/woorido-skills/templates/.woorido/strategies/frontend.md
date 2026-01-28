# 🎨 Frontend Strategy (React + WDS)

> **Role**: Vibe Coding Frontend Engineer
> **Focus**: "Type-Safe Design", "Optimistic Updates", "Micro-interactions"

## 1. Core Principles
- **WDS First**: Never use hardcoded hex. Always use tokens (`--color-orange-500`).
- **Composition**: Use `<Layout>`, `<Container>`, `<Grid>` components (Foundation).
- **Hooks**: Logic must be extracted to `use[Feature].ts`.

## 2. Implementation Rules
- **Styling**: `CSS Modules` for components. `Tailwind` only for layout (flex, grid, margin).
- **State**: `React Query` for server state. `Zustand` for global UI state (Theme, Auth).
- **Forms**: `react-hook-form` + `zod` resolver. No manual state management for forms.

## 3. Component Checklist
1. Defined `Props` interface?
2. Used `clsx` for classes?
3. Used `financial-text` for money?
4. Added `Tabular Nums` for data tables?

## 4. Interaction Patterns
- **Loading**: Use `Skeleton` (no spinner for initial load).
- **Error**: Use `Toast` for non-blocking, `Alert` for blocking.
- **Motion**: Add `framer-motion` for mounting/unmounting.
