---
description: Create a WDS-based React component with CSS Modules
---

# /component [ComponentName]

<!-- WDS 디자인 시스템 기반 React 컴포넌트 생성 -->

## Usage
```
/component Button
/component Modal --radix
/component UserCard --domain
```

## Steps

// turbo
1. Create folder `src/components/[ComponentName]/`

// turbo
2. Create `[ComponentName].tsx` with this template:

```tsx
import styles from './[ComponentName].module.css';
import clsx from 'clsx';

interface [ComponentName]Props {
  className?: string;
  children?: React.ReactNode;
}

export function [ComponentName]({ className, children }: [ComponentName]Props) {
  return (
    <div className={clsx(styles.root, className)}>
      {children}
    </div>
  );
}
```

// turbo
3. Create `[ComponentName].module.css` with WDS tokens:

```css
.root {
  /* Layout */
  display: flex;
  
  /* Spacing - use WDS tokens */
  padding: var(--space-4);
  gap: var(--space-2);
  
  /* Shape */
  border-radius: var(--radius-md);
  
  /* Colors */
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  
  /* Shadow */
  box-shadow: var(--shadow-sm);
  
  /* Motion */
  transition: box-shadow var(--motion-duration-fast) var(--motion-ease-standard);
}

.root:hover {
  box-shadow: var(--shadow-md);
}
```

// turbo
4. Create `index.ts` for re-export:

```ts
export { [ComponentName] } from './[ComponentName]';
export type { [ComponentName]Props } from './[ComponentName]';
```

## Radix UI Wrapping (--radix flag)

<!-- Radix UI 컴포넌트 래핑 시 적용 -->

```tsx
import * as Dialog from '@radix-ui/react-dialog';
import styles from './Modal.module.css';

export function Modal({ open, onOpenChange, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

## Domain Component (--domain flag)

<!-- 도메인 특화 컴포넌트 (BrixBadge, FinancialText 등) -->

Place in `src/components/domain/` folder.

## WDS Token Reference

| Category | Tokens |
|----------|--------|
| Colors | `--color-orange-*`, `--color-grey-*` |
| Spacing | `--space-1` ~ `--space-12` |
| Radius | `--radius-sm/md/lg/xl/full` |
| Shadow | `--shadow-sm/md/lg/xl` |
| Motion | `--motion-duration-*`, `--motion-ease-*` |
