---
description: Create a React Query hook for API calls
---

# /api-hook [ResourceName]

<!-- React Query 기반 API 훅 생성 -->

## Usage
```
/api-hook challenge
/api-hook user --mutations
/api-hook ledger --infinite
```

## Steps

// turbo
1. Create `src/hooks/use[ResourceName].ts`:

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { [ResourceName] } from '@/types';

// Query Keys
export const [resourceName]Keys = {
  all: ['[resourceName]s'] as const,
  lists: () => [...[resourceName]Keys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...[resourceName]Keys.lists(), filters] as const,
  details: () => [...[resourceName]Keys.all, 'detail'] as const,
  detail: (id: string) => [...[resourceName]Keys.details(), id] as const,
};

// GET single
export function use[ResourceName](id: string) {
  return useQuery({
    queryKey: [resourceName]Keys.detail(id),
    queryFn: () => api.get<[ResourceName]>(`/[resourceName]s/${id}`),
    enabled: !!id,
  });
}

// GET list
export function use[ResourceName]List(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: [resourceName]Keys.list(filters ?? {}),
    queryFn: () => api.get<[ResourceName][]>('/[resourceName]s', { params: filters }),
  });
}
```

## Mutations (--mutations flag)

<!-- 생성/수정/삭제 뮤테이션 추가 -->

```tsx
// CREATE
export function useCreate[ResourceName]() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Create[ResourceName]Request) => 
      api.post<[ResourceName]>('/[resourceName]s', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName]Keys.lists() });
    },
  });
}

// UPDATE
export function useUpdate[ResourceName]() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update[ResourceName]Request }) =>
      api.put<[ResourceName]>(`/[resourceName]s/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [resourceName]Keys.detail(id) });
      queryClient.invalidateQueries({ queryKey: [resourceName]Keys.lists() });
    },
  });
}

// DELETE
export function useDelete[ResourceName]() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.delete(`/[resourceName]s/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceName]Keys.lists() });
    },
  });
}
```

## Infinite Query (--infinite flag)

<!-- 무한 스크롤 목록 조회 -->

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

export function use[ResourceName]Infinite(filters?: Record<string, unknown>) {
  return useInfiniteQuery({
    queryKey: [...[resourceName]Keys.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 0 }) => 
      api.get<PaginatedResponse<[ResourceName]>>('/[resourceName]s', {
        params: { ...filters, page: pageParam, size: 20 }
      }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
  });
}
```

## API Client Reference

```tsx
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (error) => Promise.reject(error.response?.data ?? error)
);
```
