/**
 * 좋아요 대상 타입
 */
export type LikeTargetType = "post" | "comment";

/**
 * 좋아요
 */
export interface Like {
  id: string;
  userId: string;
  targetType: LikeTargetType;
  targetId: string; // postId or commentId
  createdAt: string;
}

/**
 * 좋아요 생성 요청
 */
export interface CreateLikeRequest {
  targetType: LikeTargetType;
  targetId: string;
}

/**
 * 좋아요 삭제 요청
 */
export interface DeleteLikeRequest {
  targetType: LikeTargetType;
  targetId: string;
}
