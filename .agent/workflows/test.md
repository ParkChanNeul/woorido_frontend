---
description: Create Vitest unit tests for components and hooks
---

# /test [TargetName]

<!-- Vitest 기반 단위 테스트 생성 -->

## Usage
```
/test Button
/test useChallenge --hook
/test challengeApi --api
```

## Steps

// turbo
1. Create test file next to target:

For component: `src/components/[Target]/[Target].test.tsx`
For hook: `src/hooks/[Target].test.ts`

## Component Test Template

```tsx
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('primary');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## Hook Test Template (--hook flag)

```tsx
// useChallenge.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChallenge } from './useChallenge';

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from '@/lib/api';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches challenge data successfully', async () => {
    const mockData = { id: '1', title: 'Test Challenge' };
    vi.mocked(api.get).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useChallenge('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });

  it('handles error state', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useChallenge('invalid'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

## API Test Template (--api flag)

```tsx
// challengeApi.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { challengeApi } from './challengeApi';

const server = setupServer(
  http.get('/api/challenges/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Mock Challenge',
    });
  }),
  
  http.post('/api/challenges', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-id', ...body }, { status: 201 });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('challengeApi', () => {
  it('fetches a challenge by id', async () => {
    const result = await challengeApi.getById('123');
    expect(result.id).toBe('123');
    expect(result.title).toBe('Mock Challenge');
  });

  it('creates a new challenge', async () => {
    const result = await challengeApi.create({ title: 'New' });
    expect(result.id).toBe('new-id');
  });
});
```

## Test Patterns

| Pattern | When to use |
|---------|-------------|
| `screen.getByRole` | Interactive elements (button, input) |
| `screen.getByText` | Static text content |
| `screen.getByTestId` | Complex selectors (last resort) |
| `waitFor` | Async state changes |
| `vi.fn()` | Mock functions |
| `msw` | Mock HTTP requests |
