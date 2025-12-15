/**
 * Spring Boot - SNS Comment API
 * 포스트 댓글 관리
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";
import type {
  Comment,
  CommentListResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentListParams,
} from "@/types";

/**
 * 댓글 목록 조회
 */
export async function getComments(
  params: CommentListParams
): Promise<CommentListResponse> {
  const { data } = await springClient.get<{ data: CommentListResponse }>(
    SPRING_ENDPOINTS.COMMENT.LIST(params.postId),
    { params: { cursor: params.cursor, limit: params.limit, parentCommentId: params.parentCommentId } }
  );
  return data.data;
}

/**
 * 대댓글 목록 조회
 */
export async function getReplies(
  commentId: string,
  params?: { cursor?: string; limit?: number }
): Promise<CommentListResponse> {
  const { data } = await springClient.get<{ data: CommentListResponse }>(
    SPRING_ENDPOINTS.COMMENT.REPLIES(commentId),
    { params }
  );
  return data.data;
}

/**
 * 댓글 생성
 */
export async function createComment(
  request: CreateCommentRequest
): Promise<Comment> {
  const { data } = await springClient.post<{ data: Comment }>(
    SPRING_ENDPOINTS.COMMENT.CREATE(request.postId),
    request
  );
  return data.data;
}

/**
 * 댓글 수정
 */
export async function updateComment(
  commentId: string,
  request: UpdateCommentRequest
): Promise<Comment> {
  const { data } = await springClient.put<{ data: Comment }>(
    SPRING_ENDPOINTS.COMMENT.UPDATE(commentId),
    request
  );
  return data.data;
}

/**
 * 댓글 삭제
 */
export async function deleteComment(commentId: string): Promise<void> {
  await springClient.delete(SPRING_ENDPOINTS.COMMENT.DELETE(commentId));
}

/**
 * 댓글 좋아요
 */
export async function likeComment(commentId: string): Promise<void> {
  await springClient.post(SPRING_ENDPOINTS.COMMENT.LIKE(commentId));
}

/**
 * 댓글 좋아요 취소
 */
export async function unlikeComment(commentId: string): Promise<void> {
  await springClient.delete(SPRING_ENDPOINTS.COMMENT.UNLIKE(commentId));
}
