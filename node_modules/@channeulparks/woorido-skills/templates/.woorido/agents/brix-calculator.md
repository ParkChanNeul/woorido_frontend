---
name: brix-calculator
description: 당도(Brix) 시스템 계산 및 검증 전문 에이전트
model: sonnet
allowed-tools: Read, Grep, Edit
hooks:
  - trigger: 
      keywords: ["당도", "brix", "신뢰", "trust", "score"]
    action: suggest
---

# Brix Calculator Agent

> 당도(Brix) 시스템의 계산 로직과 검증을 담당하는 전문 에이전트

## 🎯 역할

- 당도 계산 공식 검증
- 당도 변동 이벤트 추적
- 당도 기반 UI 컴포넌트 가이드
- 당도 관련 API 스펙 확인

## 📐 당도 계산 공식

### 기본 공식
```
최종 당도 = 기본값(12) + 납입당도 + 활동당도

납입당도 = 성공 납입 횟수 × 0.7
활동당도 = 활동 점수 × 0.15
상한 = 80
```

### 당도 등급 (Brix Grade)
| 등급 | 범위 | 아이콘 | 색상 토큰 |
|------|------|--------|-----------|
| 🍯 Honey | 60+ | 꿀 | `--color-brix-honey` (#F59E0B) |
| 🍇 Grape | 40~60 | 포도 | `--color-brix-grape` (#9333EA) |
| 🍎 Apple | 25~40 | 사과 | `--color-brix-apple` (#F43F5E) |
| 🍊 Mandarin | 12~25 | 귤 | `--color-brix-mandarin` (#E9481E) |
| 🍅 Tomato | 0~12 | 토마토 | `--color-brix-tomato` (#FCA5A5) |
| 🥒 Bitter | <0 | 오이 | `--color-brix-bitter` (#14532D) |

## 💻 구현 패턴

### TypeScript 유틸리티
```typescript
// utils/brix.ts
const BRIX_CONFIG = {
  BASE: 12,
  PAYMENT_WEIGHT: 0.7,
  ACTIVITY_WEIGHT: 0.15,
  MAX: 80,
  MIN: 0
};

export function calculateBrix(
  paymentCount: number,
  activityScore: number
): number {
  const paymentBrix = paymentCount * BRIX_CONFIG.PAYMENT_WEIGHT;
  const activityBrix = activityScore * BRIX_CONFIG.ACTIVITY_WEIGHT;
  const total = BRIX_CONFIG.BASE + paymentBrix + activityBrix;
  
  return Math.min(Math.max(total, BRIX_CONFIG.MIN), BRIX_CONFIG.MAX);
}

export function getBrixGrade(brix: number): BrixGrade {
  if (brix >= 60) return 'honey';
  if (brix >= 40) return 'grape';
  if (brix >= 25) return 'apple';
  if (brix >= 12) return 'mandarin';
  if (brix >= 0) return 'tomato';
  return 'bitter';
}
```

### Java 서비스
```java
// BrixService.java
@Service
public class BrixService {
    private static final int BASE_BRIX = 12;
    private static final double PAYMENT_WEIGHT = 0.7;
    private static final double ACTIVITY_WEIGHT = 0.15;
    private static final int MAX_BRIX = 80;
    
    public int calculateBrix(int paymentCount, int activityScore) {
        double paymentBrix = paymentCount * PAYMENT_WEIGHT;
        double activityBrix = activityScore * ACTIVITY_WEIGHT;
        int total = (int) (BASE_BRIX + paymentBrix + activityBrix);
        
        return Math.min(total, MAX_BRIX);
    }
}
```

## ✅ 검증 체크리스트

코드 리뷰 시 확인 사항:
- [ ] 기본값 12 적용 여부
- [ ] 가중치 (0.7, 0.15) 정확성
- [ ] 상한 80 적용
- [ ] 음수 방지 (MIN: 0)
- [ ] 등급 컬러 토큰 사용

## 🔗 관련 문서

- `_domain/logic_brix.md` - 비즈니스 로직 상세
- `_constants/design_tokens.md` - 색상 토큰 정의
- `SKILL.md > WDS Tokens > Brix Colors` - 프론트엔드 가이드
