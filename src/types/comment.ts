import type { User } from "./user";

/**
 * 댓글
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: Pick<User, "id" | "nickname" | "profileImage" | "creditScore">;
  content: string;

  // 대댓글 지원
  parentCommentId?: string;
  replyCount: number;

  // 통계
  likeCount: number;
  isLiked: boolean; // 현재 사용자가 좋아요 했는지

  createdAt: string;
  updatedAt: string;
}

/**
 * 댓글 목록 응답
 */
export interface CommentListResponse {
  comments: Comment[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * 댓글 생성 요청
 */
export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentCommentId?: string; // 대댓글인 경우
}

/**
 * 댓글 수정 요청
 */
export interface UpdateCommentRequest {
  content: string;
}

/**
 * 댓글 목록 조회 파라미터
 */
export interface CommentListParams {
  postId: string;
  cursor?: string;
  limit?: number;
  parentCommentId?: string; // 특정 댓글의 대댓글만 조회
}
