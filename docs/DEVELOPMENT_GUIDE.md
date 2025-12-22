# WOORIDO Frontend 개발 환경 가이드

> **작성일**: 2025-12-16
> **대상**: 프론트엔드 개발자
> **목적**: 로컬 개발 환경 설정 및 Storybook을 활용한 컴포넌트 개발

---

## 📋 목차

1. [개발 환경 요구사항](#개발-환경-요구사항)
2. [프로젝트 설정](#프로젝트-설정)
3. [개발 서버 실행](#개발-서버-실행)
4. [Storybook 사용 가이드](#storybook-사용-가이드)
5. [빌드 및 배포](#빌드-및-배포)
6. [코드 품질 관리](#코드-품질-관리)
7. [트러블슈팅](#트러블슈팅)

---

## 개발 환경 요구사항

### 필수 설치 항목

- **Node.js**: 18.x 이상 (LTS 권장)
- **npm**: 9.x 이상
- **Git**: 형상 관리
- **VS Code**: 권장 IDE (ESLint, Prettier 플러그인 설치)

### 권장 VS Code 확장

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## 프로젝트 설정

### 1. 저장소 클론

```bash
git clone https://github.com/woorido/woorido-frontend.git
cd woorido-frontend
```

### 2. 의존성 설치

```bash
npm install
```

**설치되는 패키지**:
- 총 711개 패키지
- Storybook 관련: 218개
- 주요 의존성: React, TypeScript, Vite, Tailwind CSS

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

**환경 변수 설정**:
```env
# API 엔드포인트
VITE_API_BASE_URL=http://localhost:8080
VITE_DJANGO_API_BASE_URL=http://localhost:8000

# 기타 설정
VITE_APP_NAME=WOORIDO
```

---

## 개발 서버 실행

### 메인 애플리케이션 실행

```bash
npm run dev
```

- 로컬 서버: `http://localhost:3000`
- Hot Module Replacement (HMR) 지원
- 자동 리로드

### 빌드 시간

- **개발 서버 시작**: ~2초
- **프로덕션 빌드**: ~3.5초

---

## Storybook 사용 가이드

### Storybook이란?

Storybook은 **독립적인 컴포넌트 개발 환경**입니다.

**장점**:
1. 백엔드 API 없이도 컴포넌트 개발 가능
2. 모든 컴포넌트 상태를 시각적으로 확인
3. 자동 문서 생성
4. MSW를 통한 API 모킹

### Storybook 실행

```bash
npm run storybook
```

- 로컬 서버: `http://localhost:6006`
- Hot reload 지원
- MSW (Mock Service Worker) 활성화

**실행 화면**:
```
╭──────────────────────────────────────────────────╮
│                                                  │
│   Storybook 10.1.8 for react-vite started       │
│   6.8 s for preview                              │
│                                                  │
│    Local:            http://localhost:6006       │
│    On your network:  http://192.168.x.x:6006     │
│                                                  │
╰──────────────────────────────────────────────────╯
```

### Storybook 구조

```
Storybook
├─ Domain
│  └─ SNS
│     ├─ PostCard (15 stories)
│     ├─ FeedTimeline (12 stories)
│     ├─ CommentList (14 stories)
│     ├─ MediaUploader (13 stories)
│     └─ AnnouncementBanner (18 stories)
├─ UI Components (향후 추가 예정)
└─ Common Components (향후 추가 예정)
```

**총 스토리**: 67개 (Phase 5B 컴포넌트)

### Storybook 사용 예시

#### 1. 컴포넌트 탐색

좌측 사이드바에서 컴포넌트 선택:
- `Domain/SNS/PostCard` → 15개 스토리 확인
- 각 스토리는 다른 상태를 시뮬레이션 (기본, 좋아요, 이미지 포함 등)

#### 2. 인터랙션 테스트

- **좋아요 버튼** 클릭 → MSW가 API 응답 모킹
- **댓글 작성** → 실제와 동일한 동작 확인
- **미디어 업로드** → 드래그 앤 드롭 테스트

#### 3. 반응형 테스트

상단 툴바에서 뷰포트 변경:
- 📱 Mobile (375px)
- 💻 Desktop (1280px)
- 🖥️ Large Desktop (1920px)

#### 4. 접근성 테스트

Accessibility 탭에서:
- 색상 대비 검사
- ARIA 라벨 확인
- 키보드 네비게이션 테스트

### MSW (Mock Service Worker) 통합

Storybook의 모든 API 요청은 MSW로 모킹됩니다.

**예시** (PostCard.stories.tsx):
```typescript
export const WithImages: Story = {
  args: {
    post: mockPost,
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/posts/:postId/like`, async () => {
          await delay(500);
          return HttpResponse.json({ success: true });
        }),
      ],
    },
  },
};
```

**지원되는 API**:
- POST `/api/v1/posts/:postId/like` - 좋아요
- DELETE `/api/v1/posts/:postId/like` - 좋아요 취소
- GET `/api/v1/gyes/:gyeId/feed` - 피드 조회
- POST `/api/v1/comments` - 댓글 작성
- POST `/api/v1/gyes/:gyeId/media` - 미디어 업로드
- 기타 17개 API

### Storybook 빌드 (정적 배포)

```bash
npm run build-storybook
```

**출력**:
- 디렉토리: `storybook-static/`
- 빌드 시간: ~17초
- 번들 크기: ~1.5MB (gzip 후 ~500KB)

**배포 방법**:
```bash
# Vercel
vercel storybook-static

# Netlify
netlify deploy --dir=storybook-static --prod

# GitHub Pages
npx gh-pages -d storybook-static
```

---

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

**출력**:
- 디렉토리: `dist/`
- 빌드 시간: ~3.5초
- 번들 크기:
  - `index.html`: 0.46 kB
  - `index.js`: 84.43 kB (gzip: 26.47 kB)
  - `react-vendor.js`: 207.60 kB (gzip: 67.83 kB)

### 로컬에서 프로덕션 빌드 테스트

```bash
npm run preview
```

- 로컬 서버: `http://localhost:4173`

### Vercel 배포 (Frontend)

**자동 배포** (권장):
1. GitHub `main` 브랜치에 Push
2. Vercel이 자동으로 감지 및 배포
3. HTTPS 자동 적용

**환경 변수 설정** (Vercel Dashboard):
```
VITE_API_BASE_URL=https://api.woorido.com
VITE_DJANGO_API_BASE_URL=https://brain.woorido.com
```

---

## 코드 품질 관리

### NPM Scripts

```json
{
  "lint": "eslint . --ext ts,tsx",
  "lint:fix": "eslint . --ext ts,tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
  "type-check": "tsc --noEmit"
}
```

### ESLint 검사

```bash
npm run lint
```

**자동 수정**:
```bash
npm run lint:fix
```

### Prettier 포맷팅

```bash
npm run format
```

**검사만** (CI/CD용):
```bash
npm run format:check
```

### TypeScript 타입 체크

```bash
npm run type-check
```

- Strict Mode 활성화
- 빌드 전 타입 에러 확인

### Pre-commit Hooks (Husky + lint-staged)

Git commit 시 자동 실행:

```bash
git commit -m "feat: 새 기능 추가"
```

**자동 실행 항목**:
1. Prettier 포맷팅
2. ESLint 검사 및 수정
3. TypeScript 타입 체크
4. 실패 시 커밋 거부

---

## 트러블슈팅

### 1. 포트 충돌

**문제**: `Port 3000 is already in use`

**해결**:
```bash
# 프로세스 종료 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 프로세스 종료 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

### 2. 의존성 설치 실패

**문제**: `npm install` 에러

**해결**:
```bash
# 캐시 삭제
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 3. Storybook 빌드 에러

**문제**: Storybook이 실행되지 않음

**해결**:
```bash
# Storybook 캐시 삭제
rm -rf node_modules/.cache/storybook

# 재시작
npm run storybook
```

### 4. 타입 에러

**문제**: TypeScript 타입 에러

**해결**:
```bash
# 타입 선언 파일 재생성
rm -rf node_modules/@types
npm install

# tsconfig.json 확인
npm run type-check
```

### 5. Hot Reload 작동 안 함

**문제**: 파일 수정해도 자동 리로드 안 됨

**해결**:
```bash
# Vite 개발 서버 재시작
Ctrl+C
npm run dev
```

### 6. API 연결 실패

**문제**: 백엔드 API 연결 안 됨

**확인 사항**:
1. `.env` 파일의 `VITE_API_BASE_URL` 확인
2. 백엔드 서버 실행 상태 확인
3. CORS 설정 확인

**임시 해결** (Storybook 사용):
```bash
# MSW를 사용한 API 모킹으로 개발
npm run storybook
```

---

## 개발 워크플로우

### 권장 개발 순서

1. **컴포넌트 설계**
   - Storybook에서 스토리 작성
   - 다양한 상태 시뮬레이션

2. **컴포넌트 개발**
   - Storybook에서 실시간 확인
   - MSW로 API 모킹

3. **통합 테스트**
   - 메인 앱에서 동작 확인
   - 백엔드 API 연동

4. **코드 리뷰**
   - ESLint + Prettier 통과 확인
   - TypeScript 타입 체크

5. **배포**
   - `main` 브랜치에 머지
   - Vercel 자동 배포

### Git 브랜치 전략

```
main (프로덕션)
  ↑
develop (개발)
  ↑
feature/xxx (기능 개발)
```

**브랜치 명명 규칙**:
- `feature/login-page` - 새 기능
- `fix/button-color` - 버그 수정
- `refactor/api-client` - 리팩토링
- `docs/readme-update` - 문서 수정

---

## 참고 자료

### 프로젝트 문서
- `project_woorido_guideline.md` - 프로젝트 전체 가이드라인
- `IMPLEMENTATION_HISTORY.md` - 구현 히스토리
- `API_SPEC_COMPLETE.md` - API 명세서

### 외부 문서
- [Vite 공식 문서](https://vitejs.dev/)
- [Storybook 공식 문서](https://storybook.js.org/)
- [React Query 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [Radix UI 문서](https://www.radix-ui.com/)

---

## 개발 팁

### 1. Storybook을 활용한 컴포넌트 개발

**장점**:
- 백엔드 없이 독립 개발
- 모든 상태를 시각적으로 확인
- 자동 문서화

**예시**:
```typescript
// MyComponent.stories.tsx
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/data', async () => {
          await delay(5000); // 느린 응답 시뮬레이션
          return HttpResponse.json(mockData);
        }),
      ],
    },
  },
};
```

### 2. React Query Devtools 활용

개발 중 React Query 캐시 확인:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 3. Tailwind CSS IntelliSense

VS Code에서 Tailwind 클래스 자동완성:

```json
// .vscode/settings.json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

**마지막 업데이트**: 2025-12-16
**작성자**: Claude Sonnet 4.5
**버전**: 1.0 (Storybook 10.1.8 통합)
