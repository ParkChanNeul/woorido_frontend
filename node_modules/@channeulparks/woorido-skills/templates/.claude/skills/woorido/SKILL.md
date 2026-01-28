---
name: woorido
description: WooriDo AI Coding Rules - React/Vite frontend + Spring Boot/Django backend
allowed-tools: Read, Grep, Glob, Edit, Write
---

# WooriDo Coding Rules

<!-- 이 스킬은 WooriDo 프로젝트의 코딩 규칙을 정의합니다 -->
<!-- Claude, Gemini, Antigravity 등 모든 AI 코딩 도구에서 사용 가능 -->

## 1. Project Overview

- **Frontend**: React 18 + Vite + TypeScript
- **Backend Main**: Spring Boot 3.2 + Java 21 + MyBatis + Oracle
- **Backend Sub**: Django 5.0 + Elasticsearch
- **Design System**: WDS (WooriDo Design System)

---

## 2. Frontend Rules

### 2.1 Component Pattern

<!-- 컴포넌트는 반드시 CSS Modules + WDS 토큰 사용 -->

**Structure:**
```
src/components/[ComponentName]/
├── [ComponentName].tsx
├── [ComponentName].module.css
└── index.ts
```

**Rules:**
1. Use CSS Modules with WDS token variables
2. Wrap Radix UI primitives with WDS styling
3. Use `clsx` for conditional class merging
4. Tailwind only for layout utilities (flex, gap, grid)

**Example:**
```tsx
// Button.tsx
import styles from './Button.module.css';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  fullWidth,
  children 
}: ButtonProps) {
  return (
    <button 
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && 'w-full'
      )}
    >
      {children}
    </button>
  );
}
```

```css
/* Button.module.css */
.button {
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: background-color var(--motion-duration-fast);
  cursor: pointer;
  border: none;
}

.primary {
  background-color: var(--color-orange-500);
  color: white;
}
.primary:hover {
  background-color: var(--color-orange-600);
}

.secondary {
  background-color: var(--color-grey-100);
  color: var(--color-text-primary);
}

.ghost {
  background-color: transparent;
  color: var(--color-orange-500);
}

.sm { padding: var(--space-2) var(--space-3); font-size: 13px; }
.md { padding: var(--space-3) var(--space-4); font-size: 15px; }
.lg { padding: var(--space-4) var(--space-6); font-size: 17px; }
```

### 2.2 State Management

<!-- 서버 상태는 React Query, 클라이언트 상태는 Zustand -->

**Server State (React Query):**
```tsx
// hooks/useChallenge.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useChallenge(id: string) {
  return useQuery({
    queryKey: ['challenge', id],
    queryFn: () => api.get(`/challenges/${id}`),
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.post(`/challenges/${id}/join`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    },
  });
}
```

**Client State (Zustand):**
```tsx
// store/appStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: AppState['theme']) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'woorido-app' }
  )
);
```

### 2.3 Form Pattern

<!-- react-hook-form + zod 스키마 검증 -->

```tsx
// CreateChallengeForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(2, '제목은 2자 이상'),
  deposit: z.number().min(10000, '최소 1만원'),
  maxMembers: z.number().min(3).max(30),
});

type FormData = z.infer<typeof schema>;

export function CreateChallengeForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  );
}
```

### 2.4 WDS Tokens Reference

<!-- CSS 변수로 정의된 WDS 토큰 참조 -->

**Colors (Primary & Grey):**
- `--color-orange-500` (#E9481E) - Primary brand
- `--color-orange-600` (#D43D16) - Hover state
- `--color-grey-50` ~ `--color-grey-900` - Warm grey scale
- `--color-success` (#16A34A) / `--color-warning` (#F59E0B) / `--color-error` (#DC2626)

**Financial Colors:**
- `--color-income` (#F59E0B) - 입금, 충전, 이익 (+)
- `--color-expense` (#1C1917) - 지출, 출금 (-)
- `--color-locked` (#78716C) - 보증금, 잠긴 금액

**Brix Colors (당도 시스템):**
- `--color-brix-honey` (#F59E0B) - 60+ 🍯
- `--color-brix-grape` (#9333EA) - 40~60 🍇
- `--color-brix-apple` (#F43F5E) - 25~40 🍎
- `--color-brix-mandarin` (#E9481E) - 12~25 🍊
- `--color-brix-tomato` (#FCA5A5) - 0~12 🍅
- `--color-brix-bitter` (#14532D) - <0 🥒

**Typography:**
- `--font-w1` (28px/Bold) - 마케팅 헤드라인
- `--font-w2` (24px/SemiBold) - 화면 타이틀
- `--font-w3` (20px/SemiBold) - 섹션 헤더
- `--font-w4` (17px/Regular) - 본문 (Default)
- `--font-w5` (15px/Regular) - 보조 본문
- `--font-w6` (13px/Medium) - 캡션, 라벨
- `--font-w7` (11px/Medium) - 작은 캡션
- `--font-financial-large/medium/small` - 금액 표시 (tabular-nums)

**Shape:**
- `--radius-sm` (8px) / `--radius-md` (12px) / `--radius-lg` (20px) / `--radius-xl` (24px)
- `--shadow-sm/md/lg/xl` - Elevation

**Motion:**
- `--motion-duration-fast` (150ms) / `--motion-duration-normal` (250ms) / `--motion-duration-slow` (400ms)
- `--motion-ease-standard/decel/accel/spring`

### 2.5 Overlay Libraries

<!-- BottomSheet, Toast, Animation 라이브러리 -->

| 용도 | 라이브러리 | 사용법 |
|------|------------|--------|
| BottomSheet | `vaul` | `<Drawer.Root>` |
| Toast | `sonner` | `toast('메시지')` |
| Animation | `framer-motion` | `<motion.div>` |

```tsx
// BottomSheet 예시
import { Drawer } from 'vaul';

<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay className={styles.overlay} />
    <Drawer.Content className={styles.content}>
      {/* Content */}
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>

// Toast 예시
import { toast } from 'sonner';
toast.success('저장되었습니다');
toast.error('오류가 발생했습니다');
```

---

## 3. Backend Rules (Spring Boot)

### 3.1 API Controller

<!-- RESTful 패턴 + 표준 응답 래퍼 -->

```java
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping("/{id}")
    public ApiResponse<ChallengeDto> getChallenge(@PathVariable String id) {
        return ApiResponse.success(challengeService.findById(id));
    }

    @PostMapping
    public ApiResponse<ChallengeDto> createChallenge(
        @Valid @RequestBody CreateChallengeRequest request
    ) {
        return ApiResponse.success(challengeService.create(request));
    }
}
```

### 3.2 MyBatis Mapper

<!-- XML 매퍼 + Oracle 문법 -->

```xml
<!-- ChallengeMapper.xml -->
<mapper namespace="com.woorido.mapper.ChallengeMapper">
    <select id="findById" resultType="Challenge">
        SELECT challenge_id, title, deposit, created_at
        FROM challenges
        WHERE challenge_id = #{id}
    </select>

    <insert id="insert" parameterType="Challenge">
        INSERT INTO challenges (challenge_id, title, deposit, created_at)
        VALUES (#{challengeId}, #{title}, #{deposit}, SYSDATE)
    </insert>
</mapper>
```

---

## 4. Backend Rules (Django)

### 4.1 DRF ViewSet

<!-- Django REST Framework ViewSet 패턴 -->

```python
# views.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class RecommendationViewSet(viewsets.ViewSet):
    """
    추천 API - Elasticsearch 기반
    """
    
    @action(detail=False, methods=['get'])
    def challenges(self, request):
        user_id = request.user.id
        recommendations = self.recommender.get_for_user(user_id)
        return Response({'results': recommendations})
```

### 4.2 Elasticsearch Query

```python
# search/queries.py
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://elasticsearch:9200'])

def search_challenges(keyword: str, filters: dict):
    query = {
        "bool": {
            "must": [
                {"multi_match": {
                    "query": keyword,
                    "fields": ["title^3", "description"],
                    "analyzer": "korean"
                }}
            ]
        }
    }
    
    return es.search(index="challenges", query=query)
```

---

## 5. File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase | `Button.tsx` |
| Hook | camelCase + use | `useChallenge.ts` |
| Store | camelCase + Store | `appStore.ts` |
| API | camelCase + api | `challengeApi.ts` |
| Type | PascalCase | `Challenge.types.ts` |
| CSS Module | Same as component | `Button.module.css` |

---

## 6. Checklist

### Component Creation
- [ ] CSS Modules with WDS tokens
- [ ] TypeScript props interface
- [ ] Radix UI wrapping if applicable
- [ ] Export from index.ts

### API Hook Creation
- [ ] React Query useQuery/useMutation
- [ ] Proper queryKey structure
- [ ] Error handling
- [ ] Cache invalidation

### Form Creation
- [ ] Zod schema validation
- [ ] react-hook-form integration
- [ ] Error message display
- [ ] Loading state handling
