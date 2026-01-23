# P1 Essential APIs (필수 확장)

> **목표**: Demo 이후 우선 구현할 필수 확장 기능
> **특징**: 서비스 완성도를 높이는 중요 기능
> **Last Updated**: 2026-01-23

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 30개 |
| 도메인 | AUTH, USER, CHALLENGE, MEETING, VOTE, SNS, LEDGER, SYSTEM, DJANGO |
| Demo 필수 | ❌ |

---

## 인증 (AUTH) - 3개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| POST | /auth/email/verify | 인증 코드 발송 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#005-인증-코드-발송) |
| POST | /auth/email/confirm | 인증 코드 확인 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#006-인증-코드-확인) |
| PUT | /auth/password/reset | 비밀번호 재설정 실행 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#008-비밀번호-재설정-실행) |

---

## 사용자 (USER) - 3개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| PUT | /users/me/password | 비밀번호 변경 | [02_API_USER.md](../02_ENGINEERING/Backend/API/02_API_USER.md#011-비밀번호-변경) |
| DELETE | /users/me | 회원 탈퇴 | [02_API_USER.md](../02_ENGINEERING/Backend/API/02_API_USER.md#012-회원-탈퇴) |
| GET | /users/{userId} | 사용자 조회 | [02_API_USER.md](../02_ENGINEERING/Backend/API/02_API_USER.md#013-사용자-조회) |

---

## 챌린지 (CHALLENGE) - 4개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| DELETE | /challenges/{id} | 챌린지 삭제 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#026-챌린지-삭제) |
| PUT | /challenges/{id}/support/settings | 자동 납입 설정 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#029-자동-납입-설정) |
| GET | /challenges/{id}/members/{memberId} | 멤버 상세 조회 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#033-멤버-상세-조회) |
| POST | /challenges/{id}/delegate | 리더 위임 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#034-리더-위임) |

---

## 모임 (MEETING) - 2개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| DELETE | /meetings/{id} | 모임 삭제 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#041-모임-삭제) |
| DELETE | /meetings/{id}/attendance | 참석 취소 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#092-참석-취소) |

---

## 투표 (VOTE) - 1개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /votes/{id}/result | 투표 결과 조회 | [06_API_VOTE.md](../02_ENGINEERING/Backend/API/06_API_VOTE.md#045-투표-결과-조회) |

---

## SNS (POST/COMMENT) - 7개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| PUT | /posts/{id} | 게시글 수정 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#060-게시글-수정) |
| DELETE | /posts/{id} | 게시글 삭제 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#061-게시글-삭제) |
| POST | /posts/{id}/like | 게시글 좋아요 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#062-게시글-좋아요) |
| DELETE | /posts/{id}/like | 게시글 좋아요 취소 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#063-게시글-좋아요-취소) |
| POST | /upload/image | 이미지 업로드 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#065-이미지-업로드) |
| PUT | /comments/{id} | 댓글 수정 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#068-댓글-수정) |
| DELETE | /comments/{id} | 댓글 삭제 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#069-댓글-삭제) |

---

## 장부 (LEDGER) - 4개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /challenges/{id}/ledger | 장부 조회 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#052-장부-조회) |
| GET | /challenges/{id}/ledger/summary | 장부 요약 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#054-장부-요약) |
| POST | /challenges/{id}/ledger | 장부 등록 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#055-장부-등록) |
| PUT | /ledger/{entryId} | 장부 수정 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#056-장부-수정) |

---

## 시스템 (SYSTEM) - 4개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| POST | /reports | 신고하기 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#072-신고하기) |
| GET | /notifications/{id} | 알림 상세 조회 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#075-알림-상세-조회) |
| PUT | /notifications/read-all | 전체 알림 읽음 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#077-전체-알림-읽음) |
| POST | /refunds | 환불 요청 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#079-환불-요청) |

---

## Django (SEARCH) - 2개

| Method | Endpoint | 설명 | 서버 | 상세 문서 |
|--------|----------|------|------|-----------|
| GET | /search | 통합 검색 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#083-통합-검색) |
| GET | /search/challenges | 챌린지 검색 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#084-챌린지-검색) |

---

**관련 문서:**
- [P0_Core_APIs.md](./P0_Core_APIs.md) - 핵심 기능
- [P2_Extended_APIs.md](./P2_Extended_APIs.md) - 확장 기능
