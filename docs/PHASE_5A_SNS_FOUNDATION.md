# Phase 5A: SNS Foundation 완료 보고서

## 📋 개요

**단계**: Phase 5A - SNS Foundation (기반 구축)
**완료일**: 2025-12-12
**상태**: ✅ 완료 (타입 에러 0개)

---

## 🎯 목표

계 전용 SNS 기능의 **타입 안전한 기반** 구축:
- 포스트/댓글/좋아요/공지사항 타입 정의
- API 엔드포인트 및 함수 구현
- React Query hooks (무한 스크롤, 낙관적 업데이트)
- Zustand UI stores (에디터, 필터)

---

## ✅ 완료된 작업

### 1. 타입 정의 (4개 파일)

#### 1.1 Post 타입 ([src/types/post.ts](src/types/post.ts))
```typescript
- Post (계 전용 포스트)
- PostMedia (이미지/동영상)
- PostType (normal, quote - 인용 포스트)
- CreatePostRequest, UpdatePostRequest
- PostListParams (무한 스크롤 커서 지원)
- MediaUploadRequest/Response
- MEDIA_CONSTRAINTS (최대 10개, 10MB 제한)
```

**핵심 기능**:
- 인용 포스트 (quotedPost) 지원
- 미디어 최대 10개 제한
- 무한 스크롤 커서 기반 페이지네이션
- 좋아요/댓글 카운트 + isLiked 플래그

#### 1.2 Comment 타입 ([src/types/comment.ts](src/types/comment.ts))
```typescript
- Comment (댓글)
- parentCommentId (대댓글 지원)
- CreateCommentRequest, UpdateCommentRequest
- CommentListParams (커서 기반)
```

**핵심 기능**:
- 대댓글 (replies) 지원
- 댓글에도 좋아요 기능
- 무한 스크롤 지원

#### 1.3 Like 타입 ([src/types/like.ts](src/types/like.ts))
```typescript
- LikeTargetType (post, comment)
- CreateLikeRequest, DeleteLikeRequest
```

**핵심 기능**:
- 포스트와 댓글 모두 좋아요 가능
- 단일 타입으로 통합 관리

#### 1.4 Announcement 타입 ([src/types/announcement.ts](src/types/announcement.ts))
```typescript
- Announcement (공지사항 - Post와 별도 타입)
- AnnouncementPriority (normal, important, urgent)
- isPinned (상단 고정)
- isRead, viewCount (읽음 추적)
```

**핵심 기능**:
- 포스트와 완전 분리된 공지사항
- 중요도별 표시 (일반/중요/긴급)
- 상단 고정 + 읽음 추적

---

### 2. API 엔드포인트 상수 ([src/constants/api.ts](src/constants/api.ts))

#### 추가된 Spring Boot 엔드포인트:

**POST (계 전용 피드)**:
```typescript
POST.LIST: (gyeId) => `/api/gye/${gyeId}/posts`
POST.DETAIL: (postId) => `/api/posts/${postId}`
POST.CREATE: (gyeId) => `/api/gye/${gyeId}/posts`
POST.UPDATE: (postId) => `/api/posts/${postId}`
POST.DELETE: (postId) => `/api/posts/${postId}`
POST.LIKE: (postId) => `/api/posts/${postId}/like`
POST.UNLIKE: (postId) => `/api/posts/${postId}/like`
```

**COMMENT**:
```typescript
COMMENT.LIST: (postId) => `/api/posts/${postId}/comments`
COMMENT.CREATE: (postId) => `/api/posts/${postId}/comments`
COMMENT.UPDATE: (commentId) => `/api/comments/${commentId}`
COMMENT.DELETE: (commentId) => `/api/comments/${commentId}`
COMMENT.LIKE: (commentId) => `/api/comments/${commentId}/like`
COMMENT.REPLIES: (commentId) => `/api/comments/${commentId}/replies`
```

**MEDIA (업로드)**:
```typescript
MEDIA.UPLOAD: (gyeId) => `/api/gye/${gyeId}/media`
MEDIA.DELETE: (mediaId) => `/api/media/${mediaId}`
```

**ANNOUNCEMENT (공지사항)**:
```typescript
ANNOUNCEMENT.LIST: (gyeId) => `/api/gye/${gyeId}/announcements`
ANNOUNCEMENT.CREATE: (gyeId) => `/api/gye/${gyeId}/announcements`
ANNOUNCEMENT.UPDATE: (announcementId) => `/api/announcements/${announcementId}`
ANNOUNCEMENT.DELETE: (announcementId) => `/api/announcements/${announcementId}`
ANNOUNCEMENT.READ: (announcementId) => `/api/announcements/${announcementId}/read`
```

**에러 코드 추가**:
```typescript
POST_NOT_FOUND: "POST-001"
POST_UNAUTHORIZED: "POST-002"
POST_INVALID_MEDIA: "POST-003"
COMMENT_NOT_FOUND: "COMMENT-001"
COMMENT_UNAUTHORIZED: "COMMENT-002"
```

---

### 3. API 함수 구현 (3개 파일)

#### 3.1 Post API ([src/lib/api/spring/post.ts](src/lib/api/spring/post.ts))
- `getGyePosts()` - 계 피드 조회 (커서 기반)
- `getPostDetail()` - 포스트 상세
- `createPost()` - 포스트 생성
- `updatePost()` - 포스트 수정
- `deletePost()` - 포스트 삭제
- `likePost()` / `unlikePost()` - 좋아요
- `uploadMedia()` - FormData로 미디어 업로드
- `deleteMedia()` - 미디어 삭제

#### 3.2 Comment API ([src/lib/api/spring/comment.ts](src/lib/api/spring/comment.ts))
- `getComments()` - 댓글 목록
- `getReplies()` - 대댓글 목록
- `createComment()` - 댓글 생성
- `updateComment()` - 댓글 수정
- `deleteComment()` - 댓글 삭제
- `likeComment()` / `unlikeComment()` - 댓글 좋아요

#### 3.3 Announcement API ([src/lib/api/spring/announcement.ts](src/lib/api/spring/announcement.ts))
- `getAnnouncements()` - 공지사항 목록
- `getAnnouncementDetail()` - 공지사항 상세
- `createAnnouncement()` - 공지사항 생성 (계주만)
- `updateAnnouncement()` - 공지사항 수정 (계주만)
- `deleteAnnouncement()` - 공지사항 삭제 (계주만)
- `markAnnouncementAsRead()` - 읽음 처리

---

### 4. React Query 키 팩토리 ([src/lib/queryClient.ts](src/lib/queryClient.ts))

```typescript
post: {
  all: ["post"]
  lists: () => ["post", "list"]
  list: (gyeId, params) => ["post", "list", gyeId, params]
  details: () => ["post", "detail"]
  detail: (postId) => ["post", "detail", postId]
}

comment: {
  all: ["comment"]
  lists: () => ["comment", "list"]
  list: (postId) => ["comment", "list", postId]
  replies: (commentId) => ["comment", "replies", commentId]
}

announcement: {
  all: ["announcement"]
  lists: () => ["announcement", "list"]
  list: (gyeId) => ["announcement", "list", gyeId]
  details: () => ["announcement", "detail"]
  detail: (announcementId) => ["announcement", "detail", announcementId]
}
```

---

### 5. React Query Hooks (3개 파일)

#### 5.1 Post Hooks ([src/hooks/queries/usePostQuery.ts](src/hooks/queries/usePostQuery.ts))

**Queries**:
- `useGyeFeed()` - 무한 스크롤 피드 (useInfiniteQuery)
- `usePostDetail()` - 포스트 상세

**Mutations**:
- `useCreatePost()` - 포스트 생성 + 캐시 무효화
- `useUpdatePost()` - 포스트 수정 + 낙관적 업데이트
- `useDeletePost()` - 포스트 삭제 + 캐시 제거
- `useLikePost()` - 좋아요 + **낙관적 업데이트**
- `useUnlikePost()` - 좋아요 취소 + **낙관적 업데이트**
- `useUploadMedia()` - 미디어 업로드
- `useDeleteMedia()` - 미디어 삭제

**핵심 기능**:
- 무한 스크롤: `getNextPageParam` + cursor
- 낙관적 업데이트: 좋아요 즉시 반영 후 롤백 가능
- 자동 캐시 무효화: 생성/수정/삭제 시 관련 쿼리 갱신

#### 5.2 Comment Hooks ([src/hooks/queries/useCommentQuery.ts](src/hooks/queries/useCommentQuery.ts))

**Queries**:
- `useComments()` - 댓글 목록
- `useReplies()` - 대댓글 목록

**Mutations**:
- `useCreateComment()` - 댓글 생성 + 포스트 댓글 카운트 갱신
- `useUpdateComment()` - 댓글 수정
- `useDeleteComment()` - 댓글 삭제
- `useLikeComment()` - 댓글 좋아요
- `useUnlikeComment()` - 댓글 좋아요 취소

**핵심 기능**:
- 대댓글 생성 시 부모 댓글 + 포스트 모두 갱신
- 댓글 삭제 시 포스트 댓글 카운트 자동 갱신

#### 5.3 Announcement Hooks ([src/hooks/queries/useAnnouncementQuery.ts](src/hooks/queries/useAnnouncementQuery.ts))

**Queries**:
- `useAnnouncements()` - 공지사항 목록
- `useAnnouncementDetail()` - 공지사항 상세

**Mutations**:
- `useCreateAnnouncement()` - 공지사항 생성 (계주만)
- `useUpdateAnnouncement()` - 공지사항 수정 (계주만)
- `useDeleteAnnouncement()` - 공지사항 삭제 (계주만)
- `useMarkAnnouncementAsRead()` - 읽음 처리 + viewCount 증가

---

### 6. Zustand UI Stores (3개 파일)

#### 6.1 Post Editor Store ([src/hooks/stores/usePostEditorStore.ts](src/hooks/stores/usePostEditorStore.ts))

```typescript
interface PostEditorState {
  content: string                      // 작성 중인 내용
  uploadedMedia: MediaUploadResponse[] // 업로드된 미디어
  quotedPostId?: string                // 인용할 포스트
  isUploading: boolean                 // 업로드 진행 중
  uploadProgress: number               // 업로드 진행률

  setContent, addMedia, removeMedia, setQuotedPostId
  setUploadProgress, setIsUploading, reset
}
```

**용도**: 포스트 작성 모달/페이지의 임시 저장 상태

#### 6.2 Feed Filter Store ([src/hooks/stores/useFeedFilterStore.ts](src/hooks/stores/useFeedFilterStore.ts))

```typescript
interface FeedFilterState {
  sortBy: "latest" | "popular"         // 정렬 방식
  showAnnouncementsOnly: boolean       // 공지사항만 보기

  setSortBy, setShowAnnouncementsOnly, reset
}
```

**용도**: 계 피드의 정렬/필터 UI 상태

#### 6.3 Comment Editor Store ([src/hooks/stores/useCommentEditorStore.ts](src/hooks/stores/useCommentEditorStore.ts))

```typescript
interface CommentEditorState {
  commentDrafts: Record<postId, string> // 포스트별 작성 중인 댓글
  replyingToCommentId?: string          // 대댓글 대상

  setCommentDraft, clearCommentDraft
  setReplyingToCommentId, reset
}
```

**용도**: 포스트별 댓글 임시 저장 + 대댓글 작성 모드 관리

---

## 📊 통계

### 생성된 파일
- **타입**: 4개 (post, comment, like, announcement)
- **API 함수**: 3개 (post, comment, announcement)
- **React Query Hooks**: 3개 (총 22개 hooks)
- **Zustand Stores**: 3개
- **총**: 13개 파일

### 수정된 파일
- `src/types/index.ts` - 4개 타입 export 추가
- `src/constants/api.ts` - 4개 섹션 + 에러 코드 추가
- `src/lib/api/spring/index.ts` - 3개 API export 추가
- `src/lib/queryClient.ts` - 3개 쿼리 키 팩토리 추가
- `src/hooks/queries/index.ts` - 3개 hooks export 추가
- `src/hooks/stores/index.ts` - 3개 stores export 추가

### TypeScript 에러
- ✅ **0개** (Phase 5A 코드 모두 타입 안전)
- ⚠️ 1개 pre-existing (ExplorePage.tsx i18next 이슈)

---

## 🏗️ 아키텍처 특징

### 1. 무한 스크롤 (Infinite Query)

```typescript
useInfiniteQuery({
  queryFn: ({ pageParam }) => getGyePosts({ ...params, cursor: pageParam }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
})
```

- 커서 기반 페이지네이션
- `hasMore` + `nextCursor` 패턴
- 자동 다음 페이지 fetch

### 2. 낙관적 업데이트 (Optimistic Update)

```typescript
useMutation({
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.post.detail(postId) });
    const previousPost = queryClient.getQueryData(queryKeys.post.detail(postId));

    queryClient.setQueryData(queryKeys.post.detail(postId), (old) => ({
      ...old,
      isLiked: true,
      likeCount: old.likeCount + 1,
    }));

    return { previousPost };
  },
  onError: (error, postId, context) => {
    // 실패 시 롤백
    if (context?.previousPost) {
      queryClient.setQueryData(queryKeys.post.detail(postId), context.previousPost);
    }
  },
})
```

- 좋아요 즉시 반영 → UX 향상
- 실패 시 자동 롤백
- `cancelQueries`로 race condition 방지

### 3. 자동 캐시 무효화

```typescript
onSuccess: (_, variables) => {
  // 댓글 생성 시
  queryClient.invalidateQueries({ queryKey: queryKeys.comment.list(variables.postId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.post.detail(variables.postId) }); // 댓글 카운트

  // 대댓글인 경우
  if (variables.parentCommentId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.comment.replies(variables.parentCommentId) });
  }
}
```

- 관련 쿼리 자동 갱신
- 댓글 카운트 자동 동기화
- 대댓글 계층 구조 지원

### 4. UI 상태 분리

```typescript
// 서버 데이터: React Query
useGyeFeed(params)      // 피드 데이터
useComments(postId)     // 댓글 데이터

// UI 상태: Zustand
usePostEditorStore()    // 작성 중인 내용 (임시 저장)
useFeedFilterStore()    // 정렬/필터 선택
useCommentEditorStore() // 포스트별 댓글 임시 저장
```

---

## 🎯 설계 결정사항

### 1. 공지사항 vs 일반 포스트 분리

**결정**: 별도 타입 + 별도 API

**이유**:
- 공지사항은 계주만 작성 가능 (권한 분리)
- 다른 UI (상단 고정, 중요도 표시)
- 읽음 추적 필요
- 일반 포스트와 섞이면 필터링 복잡

### 2. 인용 포스트 (Quote Post)

**결정**: `quotedPost` 필드로 내장

**이유**:
- 트위터/X 스타일 인용
- 원본 포스트 미리보기 표시
- 별도 타입보다 단순

### 3. 미디어 최대 10개 제한

**결정**: `MEDIA_CONSTRAINTS.MAX_FILES = 10`

**이유**:
- 인스타그램 방식 (10개)
- API 트래픽 최소화 (사용자 답변)
- 백엔드 부하 방지

### 4. 댓글 무한 스크롤 미적용

**결정**: 댓글은 전체 로딩

**이유**:
- 대부분 포스트는 댓글 50개 미만
- 무한 스크롤 복잡도 vs 실익
- 대댓글은 접었다 펼치기로 처리

### 5. 좋아요 낙관적 업데이트

**결정**: 포스트/댓글 좋아요 모두 적용

**이유**:
- 즉각적인 피드백 (UX)
- 네트워크 지연 숨김
- 실패 시 롤백 가능

---

## 🚀 다음 단계: Phase 5B

### Phase 5B: SNS Core Components (필수 UI)

**구축할 컴포넌트**:
1. **PostCard** - 포스트 카드 (미디어, 좋아요, 댓글 표시)
2. **PostCreateModal** - 포스트 작성 모달
3. **CommentList** - 댓글 목록 + 대댓글
4. **CommentInput** - 댓글 작성 입력
5. **FeedTimeline** - 무한 스크롤 피드
6. **AnnouncementBanner** - 공지사항 배너
7. **MediaUploader** - 이미지/동영상 업로드 UI

**핵심 기능**:
- 무한 스크롤 구현 (react-intersection-observer)
- 이미지 그리드 레이아웃 (1~10개 대응)
- 댓글 접기/펼치기
- 인용 포스트 미리보기
- 낙관적 업데이트 애니메이션

---

## 📝 TODO (향후 작업)

### 백엔드 API 구현 필요
- Spring Boot에 Post/Comment/Announcement API 구현
- 미디어 업로드 S3 연동
- 계 멤버십 검증 (계 참여자만 피드 접근)
- 공지사항 권한 검증 (계주만 작성)

### Phase 6: SNS Extended (추후)
- 해시태그 시스템
- 사용자 검색
- 팔로우/팔로워
- 알림 시스템
- 프로필 페이지

### Phase 7: SNS Advanced (선택)
- DM (1:1 메시징)
- 스토리 기능
- 엘라스틱서치 연동 (검색 최적화)

---

## ✨ 핵심 성과

1. ✅ **타입 안전성**: 모든 SNS 코드 TypeScript strict mode 통과
2. ✅ **성능 최적화**: 무한 스크롤 + 낙관적 업데이트
3. ✅ **확장성**: 쿼리 키 팩토리로 캐시 관리 체계화
4. ✅ **사용자 경험**: 즉각적인 좋아요 반응 + 자동 캐시 갱신
5. ✅ **관심사 분리**: 서버 데이터(React Query) vs UI 상태(Zustand)
6. ✅ **충돌 방지**: 기존 Phase 1-4와 독립적으로 구축

---

**작성일**: 2025-12-12
**작성자**: Claude Sonnet 4.5
**상태**: ✅ Phase 5A 완료 → Phase 5B 준비됨
