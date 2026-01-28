---
description: Create a form with react-hook-form and zod validation
---

# /form [FormName]

<!-- react-hook-form + zod 스키마 기반 폼 생성 -->

## Usage
```
/form CreateChallenge
/form EditProfile --edit
/form Login --simple
```

## Steps

// turbo
1. Create `src/components/forms/[FormName]Form.tsx`:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './[FormName]Form.module.css';

// Schema
const [formName]Schema = z.object({
  title: z.string().min(2, '제목은 2자 이상 입력해주세요'),
  description: z.string().optional(),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다'),
});

type [FormName]FormData = z.infer<typeof [formName]Schema>;

interface [FormName]FormProps {
  onSubmit: (data: [FormName]FormData) => void;
  defaultValues?: Partial<[FormName]FormData>;
  isLoading?: boolean;
}

export function [FormName]Form({ 
  onSubmit, 
  defaultValues,
  isLoading 
}: [FormName]FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<[FormName]FormData>({
    resolver: zodResolver([formName]Schema),
    defaultValues,
    mode: 'onChange',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>제목</label>
        <input
          {...register('title')}
          className={styles.input}
          placeholder="제목을 입력하세요"
        />
        {errors.title && (
          <span className={styles.error}>{errors.title.message}</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>설명</label>
        <textarea
          {...register('description')}
          className={styles.textarea}
          placeholder="설명을 입력하세요 (선택)"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>금액</label>
        <input
          {...register('amount', { valueAsNumber: true })}
          type="number"
          className={styles.input}
          placeholder="0"
        />
        {errors.amount && (
          <span className={styles.error}>{errors.amount.message}</span>
        )}
      </div>

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={!isValid || isLoading}
      >
        {isLoading ? '처리 중...' : '제출'}
      </button>
    </form>
  );
}
```

// turbo
2. Create `[FormName]Form.module.css`:

```css
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input, .textarea {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  transition: border-color var(--motion-duration-fast);
}

.input:focus, .textarea:focus {
  outline: none;
  border-color: var(--color-orange-500);
}

.textarea {
  min-height: 80px;
  resize: vertical;
}

.error {
  font-size: 12px;
  color: var(--color-error);
}

.submitButton {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-orange-500);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--motion-duration-fast);
}

.submitButton:hover:not(:disabled) {
  background-color: var(--color-orange-600);
}

.submitButton:disabled {
  background-color: var(--color-grey-300);
  cursor: not-allowed;
}
```

## Common Zod Patterns

<!-- 자주 사용하는 zod 스키마 패턴 -->

```tsx
// 이메일
email: z.string().email('올바른 이메일을 입력해주세요'),

// 비밀번호
password: z.string()
  .min(8, '8자 이상')
  .regex(/[A-Z]/, '대문자 포함')
  .regex(/[0-9]/, '숫자 포함'),

// 전화번호
phone: z.string().regex(/^01[0-9]-\d{3,4}-\d{4}$/, '올바른 전화번호'),

// 금액 (원)
amount: z.number().min(1000, '최소 1,000원').max(10000000, '최대 1,000만원'),

// 선택 필드
category: z.enum(['SAVING', 'INVESTMENT', 'TRAVEL']),

// 날짜
date: z.date().min(new Date(), '오늘 이후 날짜만 가능'),
```
