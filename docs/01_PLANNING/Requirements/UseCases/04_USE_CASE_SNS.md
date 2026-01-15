# SNS 도메인 유스케이스

> 관련 테이블: `posts`, `post_images`, `post_likes`, `comments`, `comment_likes`
> 개요 문서: [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md)
> 기준 문서: [DB_Schema_1.0.0.md](../../../02_ENGINEERING/DB_Schema_1.0.0.md)

---

## UC-SNS-01: 피드 작성

**액터**: 리더 또는 팔로워
**전제조건**: 챌린지 멤버
**관련 테이블**: `posts`, `post_images`

**성공 시나리오**:
1. 멤버가 "피드 작성" 클릭
2. 내용 입력
   - content: 텍스트 (최대 4000자 / P-0xx)
   - 이미지: 최대 10장 (P-0xx)
3. "게시" 클릭
4. 이미지 S3 업로드
5. posts 레코드 생성
   - challenge_id: 챌린지 ID (NULL이면 공개 피드)
   - is_notice: 'N' (공지사항 여부)
   - is_pinned: 'N' (상단 고정 여부)
   - like_count: 0
   - comment_count: 0
6. post_images 레코드 생성 (이미지별)
   - display_order: 순서
7. 피드 목록 최상단 표시

**사후조건**:
- `posts` 레코드 생성
- `post_images` 레코드 생성 (이미지 있으면)

---

## UC-SNS-02: 좋아요

**액터**: 리더 또는 팔로워
**관련 테이블**: `post_likes`, `posts`

**성공 시나리오**:
1. 멤버가 피드 "좋아요" 클릭
2. 시스템이 기존 좋아요 확인 (uk_post_user_like)
3. 좋아요 토글
   - 없으면: post_likes 생성, posts.like_count +1
   - 있으면: post_likes 삭제, posts.like_count -1 (GREATEST 0)
4. UI 즉시 반영

**사후조건**:
- `post_likes` 생성/삭제
- `posts.like_count` 증감 (Atomic Operations)

**정합성 보장**:
- 매일 새벽 3시 Scheduled Job으로 카운터 정합성 검증

---

## UC-SNS-03: 댓글 작성

**액터**: 리더 또는 팔로워
**관련 테이블**: `comments`, `posts`

**성공 시나리오**:
1. 멤버가 피드 "댓글" 영역 클릭
2. 댓글 입력 (최대 1000자)
3. "작성" 클릭
4. comments 레코드 생성
5. posts.comment_count +1 (Atomic)
6. 피드 작성자에게 알림

**사후조건**:
- `comments` 레코드 생성
- `posts.comment_count` 증가

---

**관련 문서**:
- [00_USE_CASES_OVERVIEW.md](./00_USE_CASES_OVERVIEW.md) - 개요
- [04_SCHEMA_SNS.md](../../../02_ENGINEERING/Database/04_SCHEMA_SNS.md) - ERD
