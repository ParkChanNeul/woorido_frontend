# P3 Future APIs (장기 계획)

> **목표**: 장기적으로 구현할 AI 기반 고급 기능
> **특징**: MVP 이후 로드맵, AI/ML 활용 기능
> **Last Updated**: 2026-01-23

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 9개 |
| 도메인 | DJANGO (AI/분석), 추가 확장 |
| Demo 필수 | ❌ |

---

## Django (AI/ANALYTICS) - 2개

| Method | Endpoint | 설명 | 서버 | 상세 문서 |
|--------|----------|------|------|-----------|
| GET | /analytics/user/report | 개인 리포트 생성 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#089-개인-리포트-생성) |
| GET | /recommendations/users | 유사 사용자 추천 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#091-유사-사용자-추천) |

---

## 추가 확장 API (P0~P2 미포함) - 7개

> 아래 API들은 API_SCHEMA_1.0.0.md에 정의되어 있으나 P0~P2에 미포함된 항목입니다.

| Method | Endpoint | 설명 | 도메인 |
|--------|----------|------|--------|
| GET | /posts/feed | 피드 조회 | POST |
| POST | /comments/{id}/replies | 대댓글 작성 | COMMENT |
| DELETE | /comments/{id}/like | 댓글 좋아요 취소 | COMMENT |
| POST | /challenges/{id}/settle | 챌린지 정산 | SETTLEMENT |
| GET | /challenges/{id}/settlement | 정산 내역 조회 | SETTLEMENT |
| GET | /expenses/{id} | 지출 상세 조회 | EXPENSE |
| POST | /expenses/{id}/execute | 지출 실행 | EXPENSE |

---

## 주요 기능 설명

### 개인 리포트 생성
- 월간/분기별/연간 개인 활동 리포트 자동 생성
- PDF 다운로드 지원
- 성취 뱃지 및 추천 사항 포함

### 유사 사용자 추천
- AI 기반 사용자 지출 패턴 분석
- 유사한 관심사/활동 패턴의 사용자 추천
- 챌린지 매칭 최적화

---

**관련 문서:**
- [P0_Core_APIs.md](./P0_Core_APIs.md) - 핵심 기능
- [P1_Essential_APIs.md](./P1_Essential_APIs.md) - 필수 확장 기능
- [P2_Extended_APIs.md](./P2_Extended_APIs.md) - 확장 기능
