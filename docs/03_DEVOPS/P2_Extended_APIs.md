# P2 Extended APIs (확장 기능)

> **목표**: 서비스 확장을 위한 부가 기능
> **특징**: Demo 제외, 정식 출시 이후 구현
> **Last Updated**: 2026-01-23

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 13개 |
| 도메인 | ACCOUNT, SNS, LEDGER, SYSTEM, DJANGO |
| Demo 필수 | ❌ |

---

## 어카운트 (ACCOUNT) - 1개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /accounts/fee-policy | 수수료 정책 조회 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#021-수수료-정책-조회) |

---

## SNS (POST/COMMENT) - 3개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| PUT | /posts/{id}/pin | 게시글 상단 고정 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#063-게시글-상단-고정) |
| GET | /posts/my | 내 게시글 목록 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#065-내-게시글-목록) |
| POST | /comments/{id}/like | 댓글 좋아요 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#070-댓글-좋아요) |

---

## 장부 (LEDGER) - 1개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /challenges/{id}/ledger/export | 장부 내보내기 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#053-장부-내보내기) |

---

## 시스템 (SYSTEM) - 3개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /reports/my | 내 신고 목록 조회 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#073-내-신고-목록) |
| GET | /refunds/{id} | 환불 상태 조회 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#080-환불-상태-조회) |
| GET/PUT | /notifications/settings | 알림 설정 조회/수정 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#078-알림-설정) |

---

## Django (ANALYTICS/RECOMMENDATION) - 5개

| Method | Endpoint | 설명 | 서버 | 상세 문서 |
|--------|----------|------|------|-----------|
| GET | /search/autocomplete | 검색어 자동완성 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#085-검색어-자동완성) |
| GET | /analytics/user/activity | 사용자 활동 통계 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#086-사용자-활동-통계) |
| GET | /analytics/challenge/{id} | 챌린지 분석 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#087-챌린지-분석) |
| GET | /analytics/dashboard | 전체 통계 대시보드 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#088-전체-통계-대시보드) |
| GET | /recommendations/challenges | 챌린지 추천 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#090-챌린지-추천) |

---

**관련 문서:**
- [P0_Core_APIs.md](./P0_Core_APIs.md) - 핵심 기능
- [P1_Essential_APIs.md](./P1_Essential_APIs.md) - 필수 확장 기능
- [P3_Future_APIs.md](./P3_Future_APIs.md) - 장기 계획 기능
