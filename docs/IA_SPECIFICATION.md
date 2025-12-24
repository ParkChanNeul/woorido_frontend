# 📐 WOORIDO Information Architecture (IA) 명세서

> **Project:** WOORIDO Frontend
> **Version:** v1.0
> **Last Updated:** 2025-12-24
> **Status:** Draft → Development Ready

---

## 📋 목차

- [1. 개요](#1-개요)
- [2. 화면 타입 정의](#2-화면-타입-정의)
- [3. IA 구조 개요](#3-ia-구조-개요)
- [4. 상세 IA](#4-상세-ia)
  - [4.1 공통 (Global)](#41-공통-global)
  - [4.2 인증 (Auth)](#42-인증-auth)
  - [4.3 사용자 (User)](#43-사용자-user)
  - [4.4 홈 (Home)](#44-홈-home)
  - [4.5 모임 탐색 (Discovery)](#45-모임-탐색-discovery)
  - [4.6 모임 생성 (Create)](#46-모임-생성-create)
  - [4.7 모임 상세 - 공개 (Public)](#47-모임-상세---공개-public)
  - [4.8 모임 상세 - 멤버 (Member)](#48-모임-상세---멤버-member)
  - [4.9 나의 모임 (My Groups)](#49-나의-모임-my-groups)
- [5. 라우팅 구조](#5-라우팅-구조)
- [6. 개발 Phase별 매핑](#6-개발-phase별-매핑)
- [7. 우선순위 정의](#7-우선순위-정의)
- [8. 참고 사항](#8-참고-사항)

---

## 1. 개요

### 1.1 목적

본 문서는 WOORIDO 프론트엔드의 전체 정보 구조(Information Architecture)를 정의하고, 개발 단계별 구현 범위를 명확히 하기 위해 작성되었습니다.

### 1.2 IA 설계 원칙

1. **사용자 여정 중심**: 비로그인 → 로그인 → 탐색 → 가입 → 활동의 자연스러운 흐름
2. **권한 기반 구조**: 가입 전(Public) / 가입 후(Member) / 모임장(CP) 명확한 구분
3. **모바일 우선 (Mobile-First)**: 모든 화면은 반응형으로 설계
4. **컴포넌트 재사용성**: Type 구분을 통한 효율적인 컴포넌트 설계
5. **Demo Day 역산**: Phase별 우선순위를 통한 점진적 구현

### 1.3 용어 정리

- **CP (Community Producer)**: 모임장, 모임을 생성하고 관리하는 사용자
- **멤버 (Member)**: 일반 모임 참여자
- **모임 (Group)**: 계모임을 의미 (기존 "계"를 "모임"으로 통일)

---

## 2. 화면 타입 정의

각 화면/컴포넌트는 다음 타입으로 분류됩니다:

| Type | 설명 | 예시 | 라우트 여부 |
|------|------|------|------------|
| **Page** | 독립된 페이지 (URL 경로 존재) | 로그인 페이지, 대시보드 | ✅ |
| **Component** | 재사용 가능한 UI 컴포넌트 | 헤더, 모임 카드, 버튼 | ❌ |
| **Modal** | 모달 다이얼로그 (오버레이) | 출금 신청, 가입 신청 | ❌ |
| **Drawer** | 사이드 드로어 (주로 모바일) | 필터, 알림 목록 | ❌ |
| **Tab** | 탭 콘텐츠 (페이지 내 전환) | 소식/일정/멤버/회비 탭 | ❌ |
| **Section** | 페이지 내 섹션 (스크롤 영역) | 히어로 배너, 추천 모임 | ❌ |
| **Toast** | 토스트 알림 (일시적) | 가입 신청 완료 | ❌ |

---

## 3. IA 구조 개요

```
WOORIDO
├── 공통 (Global)                    - 모든 페이지 공통 요소
│   ├── 헤더 (Header)
│   ├── 레이아웃 (Layout)
│   └── 푸터 (Footer)
│
├── 인증 (Auth)                      - 비로그인 사용자 진입점
│   ├── 로그인 (Sign In)
│   └── 회원가입 (Sign Up)
│
├── 사용자 (User)                    - 로그인 후 개인 영역
│   ├── 마이페이지 (My Page)
│   ├── 충전 (Charge)
│   └── 알림 (Notification)
│
├── 홈 (Home)                        - 메인 페이지
│   └── 메인 (Main)
│
├── 모임 탐색 (Discovery)            - 모임 검색/탐색
│   ├── 검색 (Search)
│   ├── 필터 (Filter)
│   └── 모임 리스트 (List)
│
├── 모임 생성 (Create)               - 새 모임 만들기
│   ├── 기본 정보
│   ├── 카테고리/태그
│   ├── 운영 규칙
│   ├── 가입 조건
│   └── 생성 완료
│
├── 모임 상세 - 공개 (Public)        - 가입 전 모임 정보
│   ├── 모임 정보 (Info)
│   ├── 가입 신청 (Join)
│   └── 미리보기 (Preview)
│
├── 모임 상세 - 멤버 (Member)        - 가입 후 활동 공간
│   ├── 대시보드 (Dashboard)
│   ├── 소식 (Feed)
│   ├── 일정 (Schedule)
│   ├── 멤버 (Members)
│   ├── 회비 관리 (Finance)
│   ├── 출금 (Withdraw)
│   └── 설정 (Settings)
│
└── 나의 모임 (My Groups)            - 가입한 모임 관리
    ├── 모임 목록 (List)
    ├── 대기 중 신청
    └── 관심 모임
```

---

## 4. 상세 IA

### 4.1 공통 (Global)

모든 페이지에서 공통으로 사용되는 요소입니다.

#### 4.1.1 헤더 (Header)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 로고 | Component | `/` | 클릭 시 메인 페이지 이동 |
| 통합 검색 | Component | `/search` | 키워드 입력 및 모임 검색 |
| 사용자 메뉴 | Component | - | 로그인 전: 로그인/회원가입 버튼<br>로그인 후: 프로필/잔액/충전 버튼 |
| 내비게이션 메뉴 | Component | - | 홈, 모임 찾기, 나의 모임 |

#### 4.1.2 레이아웃 (Layout)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 반응형 처리 | Component | - | 모바일(<768px): 햄버거 메뉴<br>태블릿/데스크탑: 전체 메뉴 |
| 글로벌 오류 처리 | Component | - | 세션 만료, 네트워크 오류, 서버 오류 공통 처리 |

#### 4.1.3 푸터 (Footer)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 정보 | Component | - | 서비스 소개/이용약관/개인정보처리방침/고객센터 |

---

### 4.2 인증 (Auth)

#### 4.2.1 로그인 (Sign In)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 로그인 폼 | Page | `/login` | 일반 로그인(ID/PW), 소셜 로그인(Google/Kakao) |
| 로그인 유지 | Component | `/login` | 자동 로그인 체크박스 |
| 계정 찾기 | Page | `/find-account` | 아이디 찾기/비밀번호 재설정 (이메일 인증) |

#### 4.2.2 회원가입 (Sign Up)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 약관 동의 | Page | `/signup/terms` | 필수: 이용약관/개인정보처리방침<br>선택: 마케팅 수신 |
| 정보 입력 | Page | `/signup/info` | 아이디, 비밀번호, 이메일, 전화번호<br>(실시간 유효성/중복 검사) |
| 본인 인증 | Page | `/signup/verify` | 이메일 인증 코드 발송 및 확인 |
| 가입 완료 | Page | `/signup/complete` | 환영 메시지 및 메인 페이지 이동 |

---

### 4.3 사용자 (User)

#### 4.3.1 마이페이지 (My Page)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 내 정보 관리 | Page | `/mypage` | 프로필 이미지, 닉네임, 이메일, 전화번호 수정 |
| 계정 설정 | Page | `/mypage/settings` | 비밀번호 변경, 알림 설정 |
| 회원 탈퇴 | Modal | `/mypage/settings` | 탈퇴 사유 선택 및 최종 확인 |

**🌟 핵심 미션 - 재정 프로필 분석:**
- 온보딩 시 재정 정보 입력 (월 수입/지출/저축가능액)
- Django 분석 연동 → 적정 월 납입금 추천
- 재정 건전성 점수 표시

#### 4.3.2 충전 (Charge)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 충전하기 | Modal | `/charge` | 충전 금액 입력 (천원 단위) |
| 결제 수단 선택 | Modal | `/charge` | 카드, 계좌이체, 간편결제 (PG사 연동) |
| 결제 내역 | Page | `/charge/history` | 충전/사용 내역 조회 (날짜별 필터) |

#### 4.3.3 알림 (Notification)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 알림 목록 | Drawer | `/notifications` | 모임 초대, 납입 알림, 투표 알림, 공지사항 |
| 알림 설정 | Page | `/notifications/settings` | 푸시/이메일 알림 on/off |

---

### 4.4 홈 (Home)

#### 4.4.1 메인 (Main)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 히어로 배너 | Section | `/` | 이벤트/프로모션 배너 (자동 슬라이드, 터치 스와이프) |
| 카테고리 탐색 | Section | `/` | 취미별 카테고리 아이콘 (수평 스크롤)<br>클릭 시 해당 카테고리 모임 리스트 |
| 추천 모임 | Section | `/` | 내 성향 기반 추천, 인기 모임, 신규 모임<br>**🌟 재정 기반 추천 (Django 연동)** |
| 모임 생성 버튼 | Component (FAB) | `/groups/create` | 새로운 모임 만들기 (Floating Action Button) |

---

### 4.5 모임 탐색 (Discovery)

#### 4.5.1 검색 (Search)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 통합 검색 | Page | `/search` | 키워드 입력 및 실시간 자동완성 |
| 검색 결과 | Page | `/search` | 매칭된 모임 리스트, 결과 없음 안내 |

**🔍 Elasticsearch 연동:**
- 태그 검색 (독서, 영화, 운동 등)
- 텍스트 전문 검색 (모임 이름, 설명)
- 카테고리 필터

#### 4.5.2 필터 (Filter)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 조건 필터 | Drawer | `/search` | 카테고리, 지역(시/구), 회비 범위, 모집 상태 |
| 정렬 | Component | `/search` | 인기순/최신순/회비순 |

#### 4.5.3 모임 리스트 (List)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 모임 카드 | Component | `/search` | 썸네일, 제목, 카테고리<br>현재 인원/최대 인원, 회비, 지역 |
| 카드 액션 | Component | `/search` | 관심 등록(북마크)/바로 가입 신청 |

---

### 4.6 모임 생성 (Create)

**Multi-Step Form 구조 (4단계):**

#### Step 1: 기본 정보

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 모임 이름 | Page | `/groups/create/step1` | 최대 20자 |
| 모임 소개 | Page | `/groups/create/step1` | 최대 500자 |
| 대표 이미지 | Page | `/groups/create/step1` | 이미지 업로드 및 미리보기 |

#### Step 2: 카테고리/태그

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 주 카테고리 | Page | `/groups/create/step2` | 하나 선택 (운동/스터디/취미/친목 등) |
| 성향 태그 | Page | `/groups/create/step2` | 다중 선택 (진지한, 편한, 활발한 등) |

#### Step 3: 운영 규칙

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 회원 정보 | Page | `/groups/create/step3` | 최소 인원, 최대 인원 |
| 회비 설정 | Page | `/groups/create/step3` | 월 회비 금액 (천원 단위), 납입일 지정 |

#### Step 4: 가입 조건

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 제한 설정 | Page | `/groups/create/step4` | 연령 범위, 성별, 지역(시/구) 선택적 제한 |
| 승인 방식 | Page | `/groups/create/step4` | 자동 승인/수동 승인 |

#### 생성 완료

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 확인 및 생성 | Page | `/groups/create/confirm` | 입력 정보 최종 확인 후 모임 생성 |
| 생성 후 안내 | Modal | `/groups/create/complete` | 모임 상세 페이지 이동 및 초대 링크 공유 |

---

### 4.7 모임 상세 - 공개 (Public)

**가입 전 사용자가 볼 수 있는 모임 정보**

#### 4.7.1 모임 정보 (Info)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 배너 영역 | Section | `/groups/:id` | 대표 이미지, 모임명, 카테고리, 태그 |
| 기본 정보 | Section | `/groups/:id` | 소개글, 회비, 현재 인원/최대 인원<br>지역, 가입 조건 |
| 모임장 정보 | Section | `/groups/:id` | 프로필 사진/닉네임 |

#### 4.7.2 가입 신청 (Join)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 신청 버튼 | Modal | `/groups/:id/join` | 가입 신청 모달 (조건 확인) |
| 신청 완료 | Toast | `/groups/:id/join` | 승인 대기 상태 안내 |

#### 4.7.3 미리보기 (Preview)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 최근 소식 | Section | `/groups/:id` | 최근 게시글 3개 미리보기<br>(가입 후 전체 확인 가능) |
| 예정 일정 | Section | `/groups/:id` | 다가오는 일정 미리보기 |

---

### 4.8 모임 상세 - 멤버 (Member)

**가입 후 멤버가 활동하는 주요 공간**

#### 4.8.1 대시보드 (Dashboard)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 모임 현황 | Page | `/groups/:id/dashboard` | 총 적립금, 이번 달 납입률<br>다음 납입일, 참여율 |
| 빠른 액션 | Section | `/groups/:id/dashboard` | 출금 신청, 일정 투표, 공지 확인 |

#### 4.8.2 소식 (Feed)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 게시판 | Tab | `/groups/:id/feed` | 글 작성(텍스트/이미지), 수정/삭제 |
| 댓글/대댓글 | Component | `/groups/:id/feed` | 댓글 작성/삭제/좋아요 |
| 공지사항 | Component | `/groups/:id/feed` | 모임장 공지 (상단 고정) |

**Demo Day 범위:**
- ✅ 텍스트 글 작성/댓글
- ❌ 이미지 업로드 제외

#### 4.8.3 일정 (Schedule)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 캘린더 뷰 | Tab | `/groups/:id/schedule` | 월별 캘린더 (납입일/모임 일정 표시) |
| 일정 목록 | Section | `/groups/:id/schedule` | 다가오는 일정 리스트 |
| 일정 생성 | Modal | `/groups/:id/schedule/create` | 일정 제목/날짜/장소/설명 입력<br>(모임장/멤버) |
| 참석 투표 | Modal | `/groups/:id/schedule/:scheduleId` | 참석/불참/미정 투표 및 현황 확인 |

#### 4.8.4 멤버 (Members)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 멤버 리스트 | Tab | `/groups/:id/members` | 프로필, 닉네임, 가입일<br>역할(모임장/멤버) |
| 멤버 관리 | Modal | `/groups/:id/members` | (모임장) 멤버 강퇴<br>(전체) 멤버 추방 투표 |

#### 4.8.5 회비 관리 (Finance)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 장부 | Tab | `/groups/:id/finance` | 회비 납입 내역 (주차별/월별) |
| 지출 내역 | Section | `/groups/:id/finance` | 출금 내역 및 영수증 |
| 통계 | Section | `/groups/:id/finance` | 수입/지출 그래프 (월별/분기별)<br>**📊 Recharts 시각화** |

**🌟 Django 분석 연동:**
- 총 지출, 평균 일일 지출
- 카테고리별 비율 (Pie Chart)
- 일별 지출 추이 (Line Chart)

#### 4.8.6 출금 (Withdraw)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 출금 신청 | Modal | `/groups/:id/withdraw/create` | 금액 입력 및 사용 목적 작성 |
| 승인 관리 | Modal | `/groups/:id/withdraw/:id` | (모임장) 출금 승인/거절 |
| 바코드 생성 | Modal | `/groups/:id/withdraw/:id/barcode` | 승인된 출금 건에 대한 결제 바코드 생성 |

**🗳️ 투표 기반 승인 시스템:**
- 멤버들이 찬성/반대 투표
- 과반수 달성 시 자동 승인
- 장부에 자동 기록

#### 4.8.7 설정 (Settings)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 모임 정보 수정 | Tab | `/groups/:id/settings` | (모임장) 모임 정보, 회비, 인원 수정 |
| 모임 탈퇴 | Modal | `/groups/:id/settings/leave` | 탈퇴 확인 및 처리 |
| 모임 삭제 | Modal | `/groups/:id/settings/delete` | (모임장) 모임 해체 및 정산 |

---

### 4.9 나의 모임 (My Groups)

#### 4.9.1 모임 목록 (List)

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 가입한 모임 | Page | `/my-groups` | 내가 속한 모임 카드 리스트 |
| 역할 표시 | Component | `/my-groups` | 모임장/멤버 뱃지 |
| 상태 관리 | Component | `/my-groups` | 활동 중, 승인 대기, 승인 거절 |

#### 4.9.2 대기 중 신청

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 신청 현황 | Tab | `/my-groups/pending` | 승인 대기 중인 모임 목록 |
| 신청 취소 | Modal | `/my-groups/pending/:id` | 가입 신청 취소 |

#### 4.9.3 관심 모임

| Depth 3 | Type | Route | Description |
|---------|------|-------|-------------|
| 북마크 목록 | Tab | `/my-groups/bookmarks` | 관심 등록한 모임 리스트 |
| 빠른 신청 | Component | `/my-groups/bookmarks` | 북마크에서 바로 가입 신청 |

---

## 5. 라우팅 구조

### 5.1 Route Tree

```
/                              (홈)
├── /login                     (로그인)
├── /find-account              (계정 찾기)
├── /signup
│   ├── /terms                 (약관 동의)
│   ├── /info                  (정보 입력)
│   ├── /verify                (본인 인증)
│   └── /complete              (가입 완료)
│
├── /mypage                    (마이페이지)
│   └── /settings              (계정 설정)
│
├── /charge                    (충전)
│   └── /history               (결제 내역)
│
├── /notifications             (알림 목록)
│   └── /settings              (알림 설정)
│
├── /search                    (모임 검색)
│
├── /my-groups                 (나의 모임)
│   ├── /pending               (대기 중 신청)
│   └── /bookmarks             (관심 모임)
│
├── /groups
│   ├── /create
│   │   ├── /step1             (기본 정보)
│   │   ├── /step2             (카테고리/태그)
│   │   ├── /step3             (운영 규칙)
│   │   ├── /step4             (가입 조건)
│   │   ├── /confirm           (확인 및 생성)
│   │   └── /complete          (생성 완료)
│   │
│   └── /:id                   (모임 상세 - 공개)
│       ├── /join              (가입 신청)
│       ├── /dashboard         (대시보드 - 멤버)
│       ├── /feed              (소식 - 멤버)
│       ├── /schedule          (일정 - 멤버)
│       │   └── /create        (일정 생성)
│       ├── /members           (멤버 - 멤버)
│       ├── /finance           (회비 관리 - 멤버)
│       ├── /withdraw          (출금 - 멤버)
│       │   └── /create        (출금 신청)
│       └── /settings          (설정 - 멤버)
│           ├── /leave         (모임 탈퇴)
│           └── /delete        (모임 삭제)
```

### 5.2 Protected Routes

**인증 필요 (로그인 후):**
- `/mypage/*`
- `/charge/*`
- `/notifications/*`
- `/my-groups/*`
- `/groups/create/*`
- `/groups/:id/dashboard`
- `/groups/:id/feed`
- `/groups/:id/schedule`
- `/groups/:id/members`
- `/groups/:id/finance`
- `/groups/:id/withdraw`
- `/groups/:id/settings`

**Public (비로그인 가능):**
- `/`
- `/login`
- `/find-account`
- `/signup/*`
- `/search`
- `/groups/:id` (공개 정보만)

**CP 전용 (모임장만 접근):**
- `/groups/:id/withdraw/:id` (승인 관리)
- `/groups/:id/settings` (모임 정보 수정)
- `/groups/:id/settings/delete` (모임 삭제)

---

## 6. 개발 Phase별 매핑

### Phase 0: Week 0-1 (환경세팅 & 학습)

**기간:** 12/19 - 12/31 (12일)

**IA 범위:**
- 공통 (Global) > 헤더/레이아웃/푸터 (P0)

**목표:**
- Storybook 스켈레톤 작성 (Mobile + Desktop)
- 반응형 디자인 세팅

---

### Phase 1: Week 2-3 (핵심 CRUD)

**기간:** 1/1 - 1/15 (15일)

**IA 범위:**

| 대분류 | 중분류 | 우선순위 | 비고 |
|--------|--------|---------|------|
| 인증 (Auth) | 로그인 | P0 | JWT 토큰 발급 |
| 인증 (Auth) | 회원가입 | P1 | 시연 제외 (테스트 계정만) |
| 사용자 (User) | 마이페이지 > 내 정보 관리 | P1 | 기본 프로필만 |
| 사용자 (User) | 충전 > 충전하기 | P1 | 기본 충전 UI만 |
| 사용자 (User) | 충전 > 결제 수단 선택 | P1 | PG 연동 (간소화) |
| 홈 (Home) | 메인 > 히어로 배너 | P1 | 기본 슬라이드만 |
| 홈 (Home) | 메인 > 카테고리 탐색 | P1 | 하드코딩된 카테고리 |
| 홈 (Home) | 메인 > 추천 모임 | P1 | 더미 데이터 |
| 모임 생성 (Create) | 전체 | P0 | 기본 정보 + 회비 설정만 |
| 모임 상세 - 공개 (Public) | 모임 정보 | P0 | 가입 전 정보 조회 |
| 모임 상세 - 멤버 (Member) | 대시보드 | P0 | 잔액/멤버 목록만 |
| 나의 모임 (My Groups) | 모임 목록 | P0 | 가입한 모임 리스트 |
| 나의 모임 (My Groups) | 역할 표시 | P0 | CP/멤버 뱃지 |

**Checkpoint (1/15):**
- ✅ 로그인 → 모임 대시보드 진입 성공
- ✅ 모임 생성 기능 작동

---

### Phase 2: Week 4-5 (투표 + 장부 + 검색)

**기간:** 1/16 - 1/31 (16일)

**IA 범위:**

| 대분류 | 중분류 | 우선순위 | 비고 |
|--------|--------|---------|------|
| 모임 탐색 (Discovery) | 검색 | P0 | Elasticsearch 연동 |
| 모임 탐색 (Discovery) | 필터 | P1 | 카테고리 필터만 |
| 모임 탐색 (Discovery) | 모임 리스트 | P0 | 검색 결과 표시 |
| 모임 상세 - 멤버 (Member) | 회비 관리 > 장부 | P0 | 입출금 내역 CRUD |
| 모임 상세 - 멤버 (Member) | 출금 > 출금 신청 | P0 | 지출 요청 등록 |
| 모임 상세 - 멤버 (Member) | 출금 > 승인 관리 | P0 | 투표 기반 승인 |
| 모임 상세 - 멤버 (Member) | 일정 > 캘린더 뷰 | P1 | 월별 캘린더 |
| 모임 상세 - 멤버 (Member) | 일정 > 일정 목록 | P1 | 다가오는 일정 |
| 모임 상세 - 공개 (Public) | 미리보기 > 예정 일정 | P1 | 가입 전 일정 미리보기 |

**Checkpoint (1/31):**
- ✅ 지출 요청 → 투표 → 승인 Full Flow 작동
- ✅ 장부 내역 CRUD 성공
- ✅ Elasticsearch 검색 작동

---

### Phase 3: Week 6-7 (Recharts + Django)

**기간:** 2/1 - 2/10 (10일)

**IA 범위:**

| 대분류 | 중분류 | 우선순위 | 비고 |
|--------|--------|---------|------|
| 사용자 (User) | 마이페이지 > 내 정보 관리 | P0 | **재정 프로필 입력 (핵심 미션)** |
| 모임 상세 - 멤버 (Member) | 회비 관리 > 통계 | P0 | Django 분석 연동 |
| 모임 상세 - 멤버 (Member) | 회비 관리 > 지출 내역 | P0 | Recharts Line/Pie Chart |
| 홈 (Home) | 메인 > 추천 모임 | P0 | **재정 기반 추천 (Django 연동)** |

**Checkpoint (2/10):**
- ✅ 차트 정상 렌더링 (Mobile + Desktop 반응형)
- ✅ Django 분석 결과 3초 이내 표시

---

### Phase 4: Week 8 (SNS 기능)

**기간:** 2/11 - 2/15 (5일)

**IA 범위:**

| 대분류 | 중분류 | 우선순위 | 비고 |
|--------|--------|---------|------|
| 모임 상세 - 공개 (Public) | 미리보기 > 최근 소식 | P1 | 가입 전 피드 미리보기 |
| 모임 상세 - 멤버 (Member) | 소식 > 게시판 | P1 | 텍스트만 (이미지 제외) |
| 모임 상세 - 멤버 (Member) | 소식 > 댓글/대댓글 | P1 | 기본 댓글만 |
| 모임 상세 - 멤버 (Member) | 소식 > 공지사항 | P0 | CP 전용 핀 고정 |

**Checkpoint (2/15):**
- ✅ 피드 작성 → 댓글 달기 성공

---

### Demo Day 이후 (P2 기능)

**시연에서 제외되는 기능들:**

| 대분류 | 중분류 | 비고 |
|--------|--------|------|
| 사용자 (User) | 충전 > 결제 내역 | |
| 사용자 (User) | 알림 | |
| 나의 모임 (My Groups) | 관심 모임 | |
| 나의 모임 (My Groups) | 대기 중 신청 | |
| 모임 상세 - 멤버 (Member) | 멤버 > 멤버 관리 | 추방 투표 제외 |
| 모임 상세 - 멤버 (Member) | 설정 > 모임 정보 수정 | |
| 모임 상세 - 멤버 (Member) | 설정 > 모임 탈퇴 | |
| 모임 상세 - 멤버 (Member) | 설정 > 모임 삭제 | |
| 모임 생성 (Create) | 가입 조건 > 제한 설정 | 연령/성별/지역 제한 (간소화) |
| 모임 상세 - 멤버 (Member) | 일정 > 일정 생성 | |
| 모임 상세 - 멤버 (Member) | 일정 > 참석 투표 | |

---

## 7. 우선순위 정의

### 7.1 우선순위 레벨

| 레벨 | 정의 | Demo Day 포함 여부 | 예시 |
|------|------|------------------|------|
| **P0** | 필수 (Must Have) | ✅ 포함 | 로그인, 모임 생성, 장부, 투표, 검색, Django 분석 |
| **P1** | 중요 (Should Have) | ✅ 포함 (간소화 가능) | 회원가입, 홈 배너, SNS 피드 |
| **P2** | 선택 (Nice to Have) | ❌ 제외 | 알림, 북마크, 결제 내역 |

### 7.2 Demo Day 시연 시나리오 기준 우선순위

**시연 시나리오 (6분):**
1. 재정 프로필 설정 (P0)
2. 재정 기반 계모임 추천 (P0)
3. 계모임 가입 및 대시보드 (P0)
4. 투명 장부 확인 (P0)
5. 지출 요청 및 투표 승인 (P0)
6. SNS 소통 (P1)

---

## 8. 참고 사항

### 8.1 권한 구분

**Public (비로그인):**
- 홈, 검색, 모임 상세 - 공개 뷰

**Member (일반 멤버):**
- 투표 참여, SNS 피드/댓글 작성, 지출 요청(본인 건)
- 모임 조회 (대시보드, 장부, 피드)

**CP (모임장 = Community Producer):**
- Member 권한 + 추가:
  - 멤버 초대 및 강제 퇴출
  - 공지사항 작성 및 핀 고정
  - 지출 요청 등록 (모든 건)
  - 장부 수정 (오류 정정)
  - 모임 종료 및 정산 시작

### 8.2 반응형 Breakpoint

```css
/* Mobile First */
모바일: < 768px (기본 스타일)
데스크톱: ≥ 768px (@media 쿼리로 확장)

/* 주요 디바이스 */
iPhone SE: 375 x 667px
iPhone 14: 390 x 844px
Galaxy S23: 360 x 800px
Desktop: 1920 x 1080px
```

### 8.3 컴포넌트 재사용 전략

**재사용 가능한 공통 컴포넌트:**
- `GroupCard`: 모임 카드 (검색 결과, 추천 모임, 나의 모임)
- `CommentThread`: 댓글/대댓글 (SNS 피드, 공지사항)
- `VoteButton`: 투표 버튼 (지출 승인, 참석 투표, 추방 투표)
- `StatCard`: 통계 카드 (대시보드, 장부)
- `Badge`: 뱃지 (모임장/멤버, 승인 상태)

### 8.4 기술 스택 매핑

| IA Type | React 구현 | 라이브러리 |
|---------|----------|-----------|
| Page | React Router Route | `react-router-dom` |
| Modal | Dialog Component | Radix UI `<Dialog>` |
| Drawer | Drawer Component | Radix UI `<Sheet>` (모바일) |
| Tab | Tabs Component | Radix UI `<Tabs>` |
| Toast | Toast Component | Radix UI `<Toast>` |
| Component (FAB) | Floating Action Button | Custom Component |

### 8.5 데이터 흐름

```
Frontend (React)
    ↓ REST API
Spring Boot (Main Backend)
    ↓ JDBC
Oracle DB (단일 저장소)

Spring Boot → Django (HTTP API)
    ↓
Django pandas 분석
    ↓ JSON 응답
Spring Boot → Frontend

Spring Boot → Elasticsearch (REST API)
    ↓ 검색 결과
Frontend
```

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 2025-12-24 | v1.0 | 초안 작성 | Development Team |

---

**이 문서는 살아있는 문서(Living Document)입니다. 개발 진행에 따라 지속적으로 업데이트됩니다.**

**관련 문서:**
- [PRODUCT_AGENDA.md](./PRODUCT_AGENDA.md) - 프로젝트 전체 아젠다
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 개발 가이드
- [API_SPEC_COMPLETE.md](./API_SPEC_COMPLETE.md) - API 명세서
