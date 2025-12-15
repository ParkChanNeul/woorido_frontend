import type { User } from "./user";

/**
 * 포스트 미디어 타입
 */
export type PostMediaType = "image" | "video";

/**
 * 포스트 미디어
 */
export interface PostMedia {
  id: string;
  type: PostMediaType;
  url: string;
  thumbnailUrl?: string; // 동영상의 경우 썸네일
  width?: number;
  height?: number;
  size: number; // bytes
  order: number; // 미디어 순서
}

/**
 * 포스트 타입
 */
export type PostType = "normal" | "quote"; // 일반 포스트, 인용 포스트

/**
 * 계 전용 포스트
 */
export interface Post {
  id: string;
  gyeId: string;
  authorId: string;
  author: Pick<User, "id" | "nickname" | "profileImage" | "creditScore">;
  type: PostType;
  content: string;
  media: PostMedia[];

  // 인용 포스트 정보
  quotedPostId?: string;
  quotedPost?: Pick<Post, "id" | "content" | "author" | "createdAt" | "media">;

  // 통계
  likeCount: number;
  commentCount: number;
  isLiked: boolean; // 현재 사용자가 좋아요 했는지

  createdAt: string;
  updatedAt: string;
}

/**
 * 포스트 목록 응답
 */
export interface PostListResponse {
  posts: Post[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * 포스트 생성 요청
 */
export interface CreatePostRequest {
  gyeId: string;
  content: string;
  mediaIds?: string[]; // 업로드된 미디어 ID 목록
  quotedPostId?: string; // 인용할 포스트 ID
}

/**
 * 포스트 수정 요청
 */
export interface UpdatePostRequest {
  content: string;
  // 미디어는 수정 불가 (삭제 후 재생성 권장)
}

/**
 * 포스트 목록 조회 파라미터
 */
export interface PostListParams {
  gyeId: string;
  cursor?: string; // 무한 스크롤 커서
  limit?: number;
  sortBy?: "latest" | "popular"; // 최신순, 인기순
}

/**
 * 미디어 업로드 요청
 */
export interface MediaUploadRequest {
  gyeId: string;
  file: File;
}

/**
 * 미디어 업로드 응답
 */
export interface MediaUploadResponse {
  id: string;
  type: PostMediaType;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  size: number;
}

/**
 * 미디어 업로드 제약
 */
export const MEDIA_CONSTRAINTS = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],
} as const;
