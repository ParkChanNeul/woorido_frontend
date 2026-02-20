# P1 Essential APIs (필수 확장)

> **목표**: Demo 이후 우선 구현할 필수 확장 기능
> **특징**: 서비스 완성도를 높이는 중요 기능
> **Last Updated**: 2026-02-18

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
| DELETE | /challenges/{challengeId} | 챌린지 삭제 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#026-챌린지-삭제) |
| PUT | /challenges/{challengeId}/support/settings | 자동 납입 설정 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#029-자동-납입-설정) |
| GET | /challenges/{challengeId}/members/{memberId} | 멤버 상세 조회 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#033-멤버-상세-조회) |
| POST | /challenges/{challengeId}/delegate | 리더 위임 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#034-리더-위임) |

---

## 모임 (MEETING) - 2개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| DELETE | /meetings/{meetingId} | 모임 삭제 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#041-모임-삭제) |
| DELETE | /meetings/{meetingId}/attendance | 참석 취소 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#092-참석-취소) |

---

## 투표 (VOTE) - 1개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /votes/{voteId}/result | 투표 결과 조회 | [06_API_VOTE.md](../02_ENGINEERING/Backend/API/06_API_VOTE.md#045-투표-결과-조회) |

---

## SNS (POST/COMMENT) - 7개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| PUT | /challenges/{challengeId}/posts/{postId} | 게시글 수정 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#060-게시글-수정) |
| DELETE | /challenges/{challengeId}/posts/{postId} | 게시글 삭제 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#061-게시글-삭제) |
| POST | /challenges/{challengeId}/posts/{postId}/like | 게시글 좋아요 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#062-게시글-좋아요) |
| DELETE | /challenges/{challengeId}/posts/{postId}/like | 게시글 좋아요 취소 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#063-게시글-좋아요-취소) |
| POST | /challenges/{challengeId}/posts/upload | 이미지 업로드 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#065-이미지-업로드) |
| PUT | /challenges/{challengeId}/posts/{postId}/comments/{commentId} | 댓글 수정 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#068-댓글-수정) |
| DELETE | /challenges/{challengeId}/posts/{postId}/comments/{commentId} | 댓글 삭제 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#069-댓글-삭제) |

---

## 장부 (LEDGER) - 4개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /challenges/{challengeId}/ledger | 장부 조회 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#052-장부-조회) |
| GET | /challenges/{challengeId}/ledger/summary | 장부 요약 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#054-장부-요약) |
| POST | /challenges/{challengeId}/ledger | 장부 등록 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#055-장부-등록) |
| PUT | /ledger/{entryId} | 장부 수정 | [09_API_LEDGER.md](../02_ENGINEERING/Backend/API/09_API_LEDGER.md#056-장부-수정) |

---

## 시스템 (SYSTEM) - 4개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| POST | /reports | 신고하기 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#072-신고하기) |
| GET | /notifications/{notificationId} | 알림 상세 조회 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#075-알림-상세-조회) |
| PUT | /notifications/read-all | 전체 알림 읽음 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#077-전체-알림-읽음) |
| POST | /refunds | 환불 요청 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#079-환불-요청) |

---

## Django (SEARCH) - 2개

| Method | Endpoint | 설명 | 서버 | 상세 문서 |
|--------|----------|------|------|-----------|
| GET | /search | 통합 검색 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#083-통합-검색) |
| GET | /search/challenges | 챌린지 검색 | Django | [10_API_DJANGO.md](../02_ENGINEERING/Backend/API/10_API_DJANGO.md#084-챌린지-검색) |

---

## 구현 메모

- 코드 우선 기준으로 경로/파라미터/응답 필드를 동기화한다.
- ID 타입 표기는 String 기준으로 통일한다.
- `/search`, `/search/challenges`는 Django 미연동 환경에서 `503 SEARCH_001`을 반환한다.

---

**관련 문서:**
- [P0_Core_APIs.md](./P0_Core_APIs.md) - 핵심 기능
- [P2_Extended_APIs.md](./P2_Extended_APIs.md) - 확장 기능
