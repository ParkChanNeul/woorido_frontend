---
description: Create a page component with layout and data fetching
---

# /page [PageName]

<!-- 페이지 컴포넌트 생성 (라우트, 레이아웃, 데이터 fetching 포함) -->

## Usage
```
/page ChallengeDetail
/page Home --no-auth
/page Settings --layout=sidebar
```

## Steps

// turbo
1. Create `src/pages/[PageName]Page.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import { Suspense } from 'react';
import styles from './[PageName]Page.module.css';
import { Skeleton } from '@/components/feedback';
import { Header } from '@/components/navigation';

export function [PageName]Page() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className={styles.page}>
      <Header title="[PageName]" showBack />
      
      <main className={styles.content}>
        <Suspense fallback={<[PageName]Skeleton />}>
          <[PageName]Content id={id} />
        </Suspense>
      </main>
    </div>
  );
}

function [PageName]Content({ id }: { id?: string }) {
  // Data fetching with React Query
  // const { data, isLoading } = useXxx(id);

  return (
    <section className={styles.section}>
      {/* Page content */}
    </section>
  );
}

function [PageName]Skeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={200} />
      <Skeleton height={100} />
      <Skeleton height={100} />
    </div>
  );
}
```

// turbo
2. Create `[PageName]Page.module.css`:

```css
.page {
  min-height: 100vh;
  background-color: var(--color-background);
}

.content {
  padding: var(--space-4);
  max-width: 640px;
  margin: 0 auto;
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

// turbo
3. Add route to `src/routes/index.tsx`:

```tsx
import { [PageName]Page } from '@/pages/[PageName]Page';

// In your routes array:
{
  path: '/[pagename]/:id?',
  element: <[PageName]Page />,
}
```

## Page Patterns

### List Page
```tsx
export function [PageName]ListPage() {
  const { data, isLoading, hasNextPage, fetchNextPage } = use[Resource]Infinite();
  
  return (
    <div className={styles.page}>
      <Header title="목록" />
      <main className={styles.content}>
        {data?.pages.map((page, i) => (
          <Fragment key={i}>
            {page.items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </Fragment>
        ))}
        {hasNextPage && (
          <button onClick={() => fetchNextPage()}>더 보기</button>
        )}
      </main>
    </div>
  );
}
```

### Detail Page
```tsx
export function [PageName]DetailPage() {
  const { id } = useParams();
  const { data, isLoading } = use[Resource](id!);
  
  if (isLoading) return <PageSkeleton />;
  if (!data) return <EmptyState />;
  
  return (
    <div className={styles.page}>
      <Header title={data.title} showBack />
      <main className={styles.content}>
        {/* Detail content */}
      </main>
    </div>
  );
}
```

## Page Layout Options

| Layout | Usage |
|--------|-------|
| Default | Full width with Header |
| `--layout=sidebar` | With SideNav (desktop) |
| `--layout=tabs` | With BottomNav tabs |
| `--no-auth` | Public page (no auth check) |
