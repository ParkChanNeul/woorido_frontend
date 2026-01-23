# P0 Core APIs (Demo 필수)

> **목표**: 핵심 MVP 기능 - Demo 시연 필수 API
> **특징**: 서비스 기본 동작에 필수적인 CRUD 기능
> **Last Updated**: 2026-01-23

---

## 개요

| 항목 | 값 |
|------|-----|
| 총 API 수 | 40개 |
| 도메인 | AUTH, USER, ACCOUNT, CHALLENGE, MEETING, VOTE, SNS, SYSTEM |
| Demo 필수 | ✅ 전체 |

---

## 인증 (AUTH) - 5개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| POST | /auth/signup | 회원가입 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#001-회원가입) |
| POST | /auth/login | JWT 로그인 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#002-로그인) |
| POST | /auth/logout | 로그아웃 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#003-로그아웃) |
| POST | /auth/refresh | 토큰 갱신 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#004-토큰-갱신) |
| POST | /auth/password/reset | 비밀번호 재설정 요청 | [01_API_AUTH.md](../02_ENGINEERING/Backend/API/01_API_AUTH.md#007-비밀번호-재설정-요청) |

---

## 사용자 (USER) - 3개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /users/me | 내 정보 조회 | [02_API_USER.md](../02_ENGINEERING/Backend/API/02_API_USER.md#009-내-정보-조회) |
| PATCH | /users/me | 내 정보 수정 | [02_API_USER.md](../02_ENGINEERING/Backend/API/02_API_USER.md#010-내-정보-수정) |
| GET | /users/check-nickname | 닉네임 중복 체크 | [02_API_USER.md](../02_ENGINEERING/Backend/API/02_API_USER.md#014-닉네임-중복-체크) |

---

## 어카운트 (ACCOUNT) - 6개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /accounts/me | 내 어카운트 조회 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#015-내-어카운트-조회) |
| GET | /accounts/me/transactions | 거래 내역 조회 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#016-거래-내역-조회) |
| POST | /accounts/charge | 크레딧 충전 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#017-크레딧-충전) |
| POST | /accounts/charge/callback | 충전 콜백 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#018-충전-콜백) |
| POST | /accounts/withdraw | 출금 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#019-출금) |
| POST | /accounts/support | 서포트 수동 납입 | [03_API_ACCOUNT.md](../02_ENGINEERING/Backend/API/03_API_ACCOUNT.md#020-서포트-수동-납입) |

---

## 챌린지 (CHALLENGE) - 9개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| POST | /challenges | 챌린지 생성 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#022-챌린지-생성) |
| GET | /challenges | 챌린지 목록 조회 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#023-챌린지-목록-조회) |
| GET | /challenges/{id} | 챌린지 상세 조회 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#024-챌린지-상세-조회) |
| PATCH | /challenges/{id} | 챌린지 수정 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#025-챌린지-수정) |
| GET | /challenges/me | 내 챌린지 목록 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#027-내-챌린지-목록) |
| GET | /challenges/{id}/account | 챌린지 어카운트 조회 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#028-챌린지-어카운트-조회) |
| POST | /challenges/{id}/join | 챌린지 가입 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#030-챌린지-가입) |
| DELETE | /challenges/{id}/leave | 챌린지 탈퇴 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#031-챌린지-탈퇴) |
| GET | /challenges/{id}/members | 멤버 목록 조회 | [04_API_CHALLENGE.md](../02_ENGINEERING/Backend/API/04_API_CHALLENGE.md#032-멤버-목록-조회) |

---

## 모임 (MEETING) - 6개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /challenges/{id}/meetings | 모임 목록 조회 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#035-모임-목록-조회) |
| GET | /meetings/{id} | 모임 상세 조회 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#036-모임-상세-조회) |
| POST | /challenges/{id}/meetings | 모임 생성 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#037-모임-생성) |
| PUT | /meetings/{id} | 모임 수정 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#038-모임-수정) |
| POST | /meetings/{id}/attendance | 참석 의사 표시 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#039-참석-의사-표시) |
| POST | /meetings/{id}/complete | 모임 완료 처리 | [05_API_MEETING.md](../02_ENGINEERING/Backend/API/05_API_MEETING.md#040-모임-완료-처리) |

---

## 투표 (VOTE) - 4개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /challenges/{id}/votes | 투표 목록 조회 | [06_API_VOTE.md](../02_ENGINEERING/Backend/API/06_API_VOTE.md#041-투표-목록-조회) |
| GET | /votes/{id} | 투표 상세 조회 | [06_API_VOTE.md](../02_ENGINEERING/Backend/API/06_API_VOTE.md#042-투표-상세-조회) |
| POST | /challenges/{id}/votes | 투표 생성 | [06_API_VOTE.md](../02_ENGINEERING/Backend/API/06_API_VOTE.md#043-투표-생성) |
| PUT | /votes/{id}/cast | 투표하기 | [06_API_VOTE.md](../02_ENGINEERING/Backend/API/06_API_VOTE.md#044-투표하기) |

---

## SNS (POST/COMMENT) - 5개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /challenges/{id}/posts | 게시글 목록 조회 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#057-게시글-목록-조회) |
| GET | /posts/{id} | 게시글 상세 조회 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#058-게시글-상세-조회) |
| POST | /challenges/{id}/posts | 게시글 작성 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#059-게시글-작성) |
| GET | /posts/{id}/comments | 댓글 목록 조회 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#066-댓글-목록-조회) |
| POST | /posts/{id}/comments | 댓글 작성 | [07_API_SNS.md](../02_ENGINEERING/Backend/API/07_API_SNS.md#067-댓글-작성) |

---

## 시스템 (SYSTEM) - 2개

| Method | Endpoint | 설명 | 상세 문서 |
|--------|----------|------|-----------|
| GET | /notifications | 알림 목록 조회 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#074-알림-목록-조회) |
| PUT | /notifications/{id}/read | 알림 읽음 처리 | [08_API_SYSTEM.md](../02_ENGINEERING/Backend/API/08_API_SYSTEM.md#076-알림-읽음-처리) |

---

**관련 문서:**
- [P1_Essential_APIs.md](./P1_Essential_APIs.md) - 필수 확장 기능
- [P2_Extended_APIs.md](./P2_Extended_APIs.md) - 확장 기능
