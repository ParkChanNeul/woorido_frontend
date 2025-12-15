/**
 * Comment (댓글) 관련 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  getReplies,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from "@/lib/api";
import type {
  CommentListParams,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

/**
 * 댓글 목록 조회 Query
 */
export function useComments(params: CommentListParams) {
  return useQuery({
    queryKey: queryKeys.comment.list(params.postId),
    queryFn: () => getComments(params),
    enabled: !!params.postId,
  });
}

/**
 * 대댓글 목록 조회 Query
 */
export function useReplies(commentId: string) {
  return useQuery({
    queryKey: queryKeys.comment.replies(commentId),
    queryFn: () => getReplies(commentId),
    enabled: !!commentId,
  });
}

/**
 * 댓글 생성 Mutation
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => createComment(data),
    onSuccess: (_, variables) => {
      // 댓글 목록 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.comment.list(variables.postId),
      });

      // 대댓글인 경우 대댓글 목록도 갱신
      if (variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comment.replies(variables.parentCommentId),
        });
      }

      // 포스트의 댓글 카운트 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.detail(variables.postId),
      });

      toast.success("댓글이 작성되었습니다");
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다");
    },
  });
}

/**
 * 댓글 수정 Mutation
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      updateComment(commentId, data),
    onSuccess: (updatedComment) => {
      // 댓글 목록 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.comment.list(updatedComment.postId),
      });
      toast.success("댓글이 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "댓글 수정에 실패했습니다");
    },
  });
}

/**
 * 댓글 삭제 Mutation
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      // 모든 댓글 목록 갱신 (어느 포스트의 댓글인지 모르므로)
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.lists() });
      // 포스트 목록도 갱신 (댓글 카운트 변경)
      queryClient.invalidateQueries({ queryKey: queryKeys.post.lists() });
      toast.success("댓글이 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "댓글 삭제에 실패했습니다");
    },
  });
}

/**
 * 댓글 좋아요 Mutation (Optimistic Update)
 */
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => likeComment(commentId),
    onSuccess: () => {
      // 댓글 목록 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.lists() });
    },
    onError: () => {
      toast.error("좋아요에 실패했습니다");
    },
  });
}

/**
 * 댓글 좋아요 취소 Mutation (Optimistic Update)
 */
export function useUnlikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => unlikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comment.lists() });
    },
    onError: () => {
      toast.error("좋아요 취소에 실패했습니다");
    },
  });
}
