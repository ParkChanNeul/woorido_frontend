/**
 * Post (계 전용 피드) 관련 React Query hooks
 */

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGyePosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  uploadMedia,
  deleteMedia,
} from "@/lib/api";
import type {
  PostListParams,
  CreatePostRequest,
  UpdatePostRequest,
  MediaUploadRequest,
} from "@/types";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

/**
 * 계 피드 무한 스크롤 Query
 */
export function useGyeFeed(params: PostListParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.post.list(params.gyeId, {
      sortBy: params.sortBy,
      limit: params.limit,
    }),
    queryFn: ({ pageParam }) =>
      getGyePosts({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!params.gyeId,
  });
}

/**
 * 포스트 상세 조회 Query
 */
export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: queryKeys.post.detail(postId),
    queryFn: () => getPostDetail(postId),
    enabled: !!postId,
  });
}

/**
 * 포스트 생성 Mutation
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: (_, variables) => {
      // 해당 계의 피드 갱신
      queryClient.invalidateQueries({
        queryKey: queryKeys.post.list(variables.gyeId),
      });
      toast.success("포스트가 작성되었습니다");
    },
    onError: () => {
      toast.error("포스트 작성에 실패했습니다");
    },
  });
}

/**
 * 포스트 수정 Mutation
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: UpdatePostRequest }) =>
      updatePost(postId, data),
    onSuccess: (updatedPost) => {
      // 상세 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.post.detail(updatedPost.id),
        updatedPost
      );
      // 리스트 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.post.lists() });
      toast.success("포스트가 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "포스트 수정에 실패했습니다");
    },
  });
}

/**
 * 포스트 삭제 Mutation
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_, postId) => {
      // 상세 캐시 제거
      queryClient.removeQueries({ queryKey: queryKeys.post.detail(postId) });
      // 리스트 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.post.lists() });
      toast.success("포스트가 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "포스트 삭제에 실패했습니다");
    },
  });
}

/**
 * 포스트 좋아요 Mutation (Optimistic Update)
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onMutate: async (postId) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: queryKeys.post.detail(postId) });

      const previousPost = queryClient.getQueryData(queryKeys.post.detail(postId));

      queryClient.setQueryData(queryKeys.post.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: true,
          likeCount: old.likeCount + 1,
        };
      });

      return { previousPost };
    },
    onError: (_error, postId, context) => {
      // 실패 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.post.detail(postId), context.previousPost);
      }
      toast.error("좋아요에 실패했습니다");
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.detail(postId) });
    },
  });
}

/**
 * 포스트 좋아요 취소 Mutation (Optimistic Update)
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.post.detail(postId) });

      const previousPost = queryClient.getQueryData(queryKeys.post.detail(postId));

      queryClient.setQueryData(queryKeys.post.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: false,
          likeCount: Math.max(0, old.likeCount - 1),
        };
      });

      return { previousPost };
    },
    onError: (_error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.post.detail(postId), context.previousPost);
      }
      toast.error("좋아요 취소에 실패했습니다");
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.post.detail(postId) });
    },
  });
}

/**
 * 미디어 업로드 Mutation
 */
export function useUploadMedia() {
  return useMutation({
    mutationFn: (request: MediaUploadRequest) => uploadMedia(request),
    onError: (error: Error) => {
      toast.error(error.message || "미디어 업로드에 실패했습니다");
    },
  });
}

/**
 * 미디어 삭제 Mutation
 */
export function useDeleteMedia() {
  return useMutation({
    mutationFn: (mediaId: string) => deleteMedia(mediaId),
    onError: (error: Error) => {
      toast.error(error.message || "미디어 삭제에 실패했습니다");
    },
  });
}
