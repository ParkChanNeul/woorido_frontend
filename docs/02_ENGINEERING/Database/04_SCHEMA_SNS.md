# WOORIDO ERD - SNS 도메인
**posts, post_images, post_likes, comments, comment_likes**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)

---

## 1. 게시글 (posts)

```sql
CREATE TABLE posts (
  id VARCHAR2(36) PRIMARY KEY,                    -- 피드 ID (UUID)
  challenge_id VARCHAR2(36) REFERENCES challenges(id),  -- 챌린지 ID (NULL이면 공개)
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id),

  -- 내용
  content VARCHAR2(4000) NOT NULL,

  -- 공지/고정 (신규 추가)
  is_notice CHAR(1) DEFAULT 'N',                  -- 공지사항 여부
  is_pinned CHAR(1) DEFAULT 'N',                  -- 상단 고정 여부

  -- 비정규화 카운터 (Atomic Operations)
  like_count NUMBER(10) DEFAULT 0,
  comment_count NUMBER(10) DEFAULT 0,
  view_count NUMBER(10) DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP                            -- Soft Delete (신규 추가)
);

-- 인덱스
CREATE INDEX idx_posts_challenge_id ON posts(challenge_id);
CREATE INDEX idx_posts_created_by ON posts(created_by);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_is_notice ON posts(is_notice);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
```

**컬럼값 정의:**
| 컬럼 | 값 |
|------|-----|
| `is_notice` | Y(공지사항), N(일반 피드) |
| `is_pinned` | Y(상단고정), N(일반) |

**비정규화 카운터 관리:**
- `like_count`, `comment_count`는 Atomic Operations로 증감
- 매일 새벽 3시 Scheduled Job으로 정합성 검증

---

## 2. 게시글 이미지 (post_images)

```sql
CREATE TABLE post_images (
  id VARCHAR2(36) PRIMARY KEY,                    -- 이미지 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id),
  image_url VARCHAR2(500) NOT NULL,
  display_order NUMBER(10) NOT NULL,

  created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_post_images_post_id ON post_images(post_id);
```

---

## 3. 게시글 좋아요 (post_likes)

```sql
CREATE TABLE post_likes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 좋아요 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id),
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),


  created_at TIMESTAMP NOT NULL,

  CONSTRAINT uk_post_likes_post_user UNIQUE (post_id, user_id)
);

CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
```

---

## 4. 댓글 (comments)

```sql
CREATE TABLE comments (
  id VARCHAR2(36) PRIMARY KEY,                    -- 댓글 ID (UUID)
  post_id VARCHAR2(36) NOT NULL REFERENCES posts(id),
  parent_id VARCHAR2(36) REFERENCES comments(id), -- 부모 댓글 ID (대댓글용, 신규 추가)
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id),

  -- 내용
  content VARCHAR2(1000) NOT NULL,

  -- 좋아요 카운트 (신규 추가)
  like_count NUMBER(10) DEFAULT 0,

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP                            -- Soft Delete (신규 추가)
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_by ON comments(created_by);
```

---

## 5. 댓글 좋아요 (comment_likes) - 신규 테이블

```sql
CREATE TABLE comment_likes (
  id VARCHAR2(36) PRIMARY KEY,                    -- 좋아요 ID (UUID)
  comment_id VARCHAR2(36) NOT NULL REFERENCES comments(id),
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id),

  created_at TIMESTAMP NOT NULL,

  CONSTRAINT uk_comment_likes_comment_user UNIQUE (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);
```

---

**최종 수정**: 2026-01-15
**기준 문서**: DB_Schema_1.0.0.md
