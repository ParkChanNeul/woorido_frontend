# WOORIDO ERD Mermaid 다이어그램

## 문서 정보

| 항목 | 내용 |
|------|------|
| 작성일 | 2026-01-16 |
| 버전 | 1.0.0 |
| 기준 문서 | DB_Schema_1.0.0.md, BACKLOG.md |
| 테이블 수 | 32개 |
| FK 관계 | 56개 |
| 도메인 | 8개 |

---

## 통계 요약

| 도메인 | 테이블 수 | 파일 |
|--------|-----------|------|
| 사용자 (User) | 4 | 1-2_ERD_USER.mmd |
| 챌린지 (Challenge) | 2 | 1-2_ERD_CHALLENGE.mmd |
| 모임 (Meeting) | 3 | 1-2_ERD_MEETING.mmd |
| 지출 (Expense) | 6 | 1-2_ERD_EXPENSE.mmd |
| 일반투표 (Vote) | 2 | 1-2_ERD_VOTE.mmd |
| SNS | 5 | 1-2_ERD_SNS.mmd |
| 시스템 (System) | 5 | 1-2_ERD_SYSTEM.mmd |
| 관리자 (Admin) | 5 | 1-2_ERD_ADMIN.mmd |
| **합계** | **32** | - |

---

## 전체 관계도

전체 테이블 간 관계는 `1-2_ERD_FULL.mmd` 참조.

---

## 용어 정의

| 용어 | 설명 |
|------|------|
| member | 챌린지 참여자 전체 (리더 + 팔로워) |
| leader | 챌린지 생성자/관리자 (role = 'LEADER') |
| follower | 일반 참여자 (role = 'FOLLOWER') |
| gye | 레거시 용어, challenges로 대체됨 |

---

## 파일 목록

1. `1-2_ERD_OVERVIEW.md` - 본 문서
2. `1-2_ERD_FULL.mmd` - 전체 관계도
3. `1-2_ERD_USER.mmd` - 사용자 도메인
4. `1-2_ERD_CHALLENGE.mmd` - 챌린지 도메인
5. `1-2_ERD_MEETING.mmd` - 모임 도메인
6. `1-2_ERD_EXPENSE.mmd` - 지출 도메인
7. `1-2_ERD_VOTE.mmd` - 일반투표 도메인
8. `1-2_ERD_SNS.mmd` - SNS 도메인
9. `1-2_ERD_SYSTEM.mmd` - 시스템 도메인
10. `1-2_ERD_ADMIN.mmd` - 관리자 도메인

---

## 관련 문서

- [DB_Schema_1.0.0.md](./DB_Schema_1.0.0.md)
- [BACKLOG.md](./BACKLOG.md)
- [POLICY_DEFINITION.md](./POLICY_DEFINITION.md)