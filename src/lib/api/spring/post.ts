/**
 * Spring Boot - SNS Post API
 * 계 전용 피드 포스트 관리
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";
import type {
  Post,
  PostListResponse,
  CreatePostRequest,
  UpdatePostRequest,
  PostListParams,
  MediaUploadRequest,
  MediaUploadResponse,
} from "@/types";

/**
 * 계 포스트 목록 조회 (무한 스크롤)
 */
export async function getGyePosts(
  params: PostListParams
): Promise<PostListResponse> {
  const { data } = await springClient.get<{ data: PostListResponse }>(
    SPRING_ENDPOINTS.POST.LIST(params.gyeId),
    { params: { cursor: params.cursor, limit: params.limit, sortBy: params.sortBy } }
  );
  return data.data;
}

/**
 * 포스트 상세 조회
 */
export async function getPostDetail(postId: string): Promise<Post> {
  const { data } = await springClient.get<{ data: Post }>(
    SPRING_ENDPOINTS.POST.DETAIL(postId)
  );
  return data.data;
}

/**
 * 포스트 생성
 */
export async function createPost(request: CreatePostRequest): Promise<Post> {
  const { data } = await springClient.post<{ data: Post }>(
    SPRING_ENDPOINTS.POST.CREATE(request.gyeId),
    request
  );
  return data.data;
}

/**
 * 포스트 수정
 */
export async function updatePost(
  postId: string,
  request: UpdatePostRequest
): Promise<Post> {
  const { data } = await springClient.put<{ data: Post }>(
    SPRING_ENDPOINTS.POST.UPDATE(postId),
    request
  );
  return data.data;
}

/**
 * 포스트 삭제
 */
export async function deletePost(postId: string): Promise<void> {
  await springClient.delete(SPRING_ENDPOINTS.POST.DELETE(postId));
}

/**
 * 포스트 좋아요
 */
export async function likePost(postId: string): Promise<void> {
  await springClient.post(SPRING_ENDPOINTS.POST.LIKE(postId));
}

/**
 * 포스트 좋아요 취소
 */
export async function unlikePost(postId: string): Promise<void> {
  await springClient.delete(SPRING_ENDPOINTS.POST.UNLIKE(postId));
}

/**
 * 미디어 업로드
 */
export async function uploadMedia(
  request: MediaUploadRequest
): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", request.file);

  const { data } = await springClient.post<{ data: MediaUploadResponse }>(
    SPRING_ENDPOINTS.MEDIA.UPLOAD(request.gyeId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data.data;
}

/**
 * 미디어 삭제
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  await springClient.delete(SPRING_ENDPOINTS.MEDIA.DELETE(mediaId));
}
