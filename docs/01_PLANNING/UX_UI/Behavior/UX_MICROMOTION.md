# WOORIDO UX 마이크로모션 (UX Micromotion)

> **Version**: 1.0.0
> **Last Updated**: 2026-01-16
> **Purpose**: 마이크로 애니메이션 및 피드백 정의
> **참조**: DESIGN_TOKENS.md motion 토큰

---

## 1. 모션 원칙

### 1.1 기본 원칙

| 원칙 | 설명 |
|------|------|
| **목적성** | 모션은 의미 있는 피드백을 제공해야 함 |
| **자연스러움** | 물리 법칙에 기반한 자연스러운 움직임 |
| **일관성** | 동일한 액션은 동일한 모션 |
| **성능** | 60fps 유지, 불필요한 리플로우 방지 |

### 1.2 모션 토큰 (from DESIGN_TOKENS.md)

```css
--motion-duration-instant: 100ms;
--motion-duration-fast: 200ms;
--motion-duration-standard: 300ms;
--motion-duration-slow: 500ms;

--motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
--motion-easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
--motion-easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
```

---

## 2. 상태 전환 애니메이션

### 2.1 페이드 전환

| 용도 | Duration | Easing |
|------|----------|--------|
| Toast 등장 | 200ms | ease-out |
| Toast 퇴장 | 150ms | ease-in |
| 모달 배경 | 300ms | standard |

```css
.fade-enter {
  opacity: 0;
}
.fade-enter-active {
  opacity: 1;
  transition: opacity 200ms ease-out;
}
```

### 2.2 슬라이드 전환

| 용도 | Direction | Duration |
|------|-----------|----------|
| BottomSheet 열기 | bottom → up | 300ms |
| 드롭다운 열기 | top → down | 200ms |
| 페이지 전환 | left/right | 300ms |

### 2.3 스케일 전환

| 용도 | Scale | Duration |
|------|-------|----------|
| 버튼 press | 0.98 | 100ms |
| 카드 hover | 1.02 | 200ms |
| 모달 등장 | 0.95 → 1 | 300ms |

---

## 3. 피드백 애니메이션

### 3.1 성공 피드백

#### Confetti (축하)

| 트리거 | 파티클 수 | Duration |
|--------|----------|----------|
| 가입 완료 | 50개 | 2000ms |
| 1년 완주 | 100개 | 3000ms |
| 투표 승인 | 30개 | 1500ms |

```
🎉 ✨ 🎊 ⭐ 💫
```

#### Check Animation (✓)

| 트리거 | Duration | Easing |
|--------|----------|--------|
| 투표 제출 | 400ms | spring |
| 폼 제출 | 300ms | ease-out |

### 3.2 오류 피드백

#### Shake Animation

| 트리거 | Amplitude | Duration |
|--------|-----------|----------|
| 유효성 오류 | ±10px | 400ms |
| 로그인 실패 | ±5px | 300ms |

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### 3.3 로딩 피드백

#### Skeleton Pulse

| Duration | Easing |
|----------|--------|
| 1500ms (loop) | ease-in-out |

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

#### Spinner

| Size | Duration |
|------|----------|
| sm (16px) | 800ms |
| md (24px) | 800ms |
| lg (40px) | 1000ms |

---

## 4. 인터랙션 피드백

### 4.1 좋아요 애니메이션

```
     💗
    /   \
   💗    💗  → 파티클 분산
    \   /
     ❤️      → 하트 커짐
```

| 단계 | Duration | 효과 |
|------|----------|------|
| 1. 탭 | 0ms | scale(1 → 0.8) |
| 2. 바운스 | 200ms | scale(0.8 → 1.2 → 1) |
| 3. 파티클 | 400ms | 분산 후 fade-out |

### 4.2 스와이프 삭제

| 단계 | 효과 |
|------|------|
| 스와이프 중 | 빨간 배경 드러남 |
| 릴리즈 | slide-out (200ms) |
| 완료 | height collapse (200ms) |

### 4.3 Pull to Refresh

| 단계 | 피드백 |
|------|--------|
| 당김 중 | 스피너 scale 증가 |
| 트리거 | 진동 (10ms) |
| 로딩 중 | 스피너 회전 |
| 완료 | 스피너 fade-out |

---

## 5. Brix 시스템 애니메이션

### 5.1 당도 변화

| 변화 | 애니메이션 |
|------|-----------|
| 점수 증가 | 숫자 count-up + 녹색 하이라이트 |
| 점수 감소 | 숫자 count-down + 빨간 하이라이트 |
| 등급 상승 | 과일 이모지 bounce + Confetti |

### 5.2 과일 등급 전환

```
🍅 → 🍊  (토마토 → 귤)
   bounce + scale(1 → 1.3 → 1)
   duration: 500ms
```

---

## 6. 페이지 전환

### 6.1 기본 전환

| 유형 | 효과 | Duration |
|------|------|----------|
| Push | slide-left | 300ms |
| Pop | slide-right | 300ms |
| Modal | fade + slide-up | 300ms |

### 6.2 공유 요소 전환 (Shared Element)

| 화면 | 공유 요소 |
|------|----------|
| 홈 → 챌린지 상세 | GroupCard 썸네일 → 헤더 이미지 |
| 피드 → 이미지 뷰어 | 게시글 이미지 → 풀스크린 이미지 |

---

## 7. Reduce Motion 지원

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

| 설정 | 동작 |
|------|------|
| **활성화** | 모든 애니메이션 최소화 |
| **예외** | 필수 피드백 (로딩 스피너) |

---

## 관련 문서

- [DESIGN_TOKENS.md](../../../02_ENGINEERING/Frontend/DesignSystem/DESIGN_TOKENS.md) - 모션 토큰
- [UX_INTERACTIONS.md](./UX_INTERACTIONS.md) - 인터랙션 패턴
- [WDS_FEEDBACK.md](../../../02_ENGINEERING/Frontend/DesignSystem/WDS_FEEDBACK.md) - 피드백 컴포넌트

