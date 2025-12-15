// @ts-nocheck
/**
 * MSW Handlers - SNS (Post, Comment, Announcement) API
 */

import { http, HttpResponse, delay } from "msw";
import {
  generateMockPost,
  generateMockComment,
  generateMockAnnouncement,
  generateId,
  CURRENT_USER,
} from "../data/generators";
import type {
  Post,
  Comment,
  Announcement,
  CreatePostRequest,
  CreateCommentRequest,
  CreateAnnouncementRequest,
} from "@/types";

const BASE_URL = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8080";

// In-memory storage
const posts: Map<string, Post[]> = new Map(); // gyeId -> Post[]
const comments: Map<string, Comment[]> = new Map(); // postId -> Comment[]
const announcements: Map<string, Announcement[]> = new Map(); // gyeId -> Announcement[]
const likes: Map<string, Set<string>> = new Map(); // targetId -> Set<userId>

export const snsHandlers = [
  // ============================================
  // Post APIs
  // ============================================

  // GET /api/gye/:gyeId/posts - 포스트 목록 조회 (무한 스크롤)
  http.get(`${BASE_URL}/api/gye/:gyeId/posts`, async ({ params, request }) => {
    await delay(500);

    const { gyeId } = params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const sortBy = url.searchParams.get("sortBy") || "latest";

    // 캐시된 데이터가 없으면 생성
    if (!posts.has(gyeId as string)) {
      posts.set(
        gyeId as string,
        Array.from({ length: 50 }, () => generateMockPost(gyeId as string))
      );
    }

    let allPosts = posts.get(gyeId as string) || [];

    // 정렬
    if (sortBy === "latest") {
      allPosts = [...allPosts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "popular") {
      allPosts = [...allPosts].sort((a, b) => b.likeCount - a.likeCount);
    }

    // 커서 페이지네이션
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = allPosts.findIndex((p) => p.id === cursor);
      startIndex = cursorIndex > -1 ? cursorIndex + 1 : 0;
    }

    const paginatedPosts = allPosts.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < allPosts.length;
    const nextCursor = hasMore ? paginatedPosts[paginatedPosts.length - 1]?.id : undefined;

    return HttpResponse.json({
      success: true,
      data: {
        posts: paginatedPosts,
        nextCursor,
        hasMore,
      },
    });
  }),

  // GET /api/posts/:postId - 포스트 상세 조회
  http.get(`${BASE_URL}/api/posts/:postId`, async ({ params }) => {
    await delay(200);

    const { postId } = params;

    // 모든 계의 포스트에서 검색
    let foundPost: Post | undefined;
    for (const gyePosts of posts.values()) {
      foundPost = gyePosts.find((p) => p.id === postId);
      if (foundPost) break;
    }

    if (!foundPost) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "POST_NOT_FOUND",
            message: "포스트를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: foundPost,
    });
  }),

  // POST /api/gye/:gyeId/posts - 포스트 생성
  http.post(`${BASE_URL}/api/gye/:gyeId/posts`, async ({ params, request }) => {
    await delay(600);

    const { gyeId } = params;
    const body = (await request.json()) as CreatePostRequest;

    const newPost: Post = generateMockPost(gyeId as string, {
      id: generateId(),
      author: {
        id: CURRENT_USER.id,
        nickname: CURRENT_USER.nickname,
        profileImage: CURRENT_USER.profileImage,
        creditScore: CURRENT_USER.creditScore,
      },
      content: body.content,
      media: body.mediaIds?.map((id) => ({
        id,
        type: "image",
        url: `https://picsum.photos/seed/${id}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${id}/200/150`,
      })) || [],
      quotedPostId: body.quotedPostId,
      type: body.quotedPostId ? "quote" : "normal",
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const gyePosts = posts.get(gyeId as string) || [];
    posts.set(gyeId as string, [newPost, ...gyePosts]);

    return HttpResponse.json({
      success: true,
      data: newPost,
    });
  }),

  // PUT /api/posts/:postId - 포스트 수정
  http.put(`${BASE_URL}/api/posts/:postId`, async ({ params, request }) => {
    await delay(400);

    const { postId } = params;
    const body = (await request.json()) as Partial<CreatePostRequest>;

    // 모든 계의 포스트에서 검색 및 수정
    let updated = false;
    for (const [gyeId, gyePosts] of posts.entries()) {
      const postIndex = gyePosts.findIndex((p) => p.id === postId);
      if (postIndex > -1) {
        gyePosts[postIndex] = {
          ...gyePosts[postIndex],
          content: body.content || gyePosts[postIndex].content,
          updatedAt: new Date().toISOString(),
        };
        posts.set(gyeId, gyePosts);
        updated = true;
        break;
      }
    }

    if (!updated) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "POST_NOT_FOUND",
            message: "포스트를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "포스트가 수정되었습니다" },
    });
  }),

  // DELETE /api/posts/:postId - 포스트 삭제
  http.delete(`${BASE_URL}/api/posts/:postId`, async ({ params }) => {
    await delay(400);

    const { postId } = params;

    let deleted = false;
    for (const [gyeId, gyePosts] of posts.entries()) {
      const filteredPosts = gyePosts.filter((p) => p.id !== postId);
      if (filteredPosts.length < gyePosts.length) {
        posts.set(gyeId, filteredPosts);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "POST_NOT_FOUND",
            message: "포스트를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "포스트가 삭제되었습니다" },
    });
  }),

  // POST /api/posts/:postId/like - 포스트 좋아요
  http.post(`${BASE_URL}/api/posts/:postId/like`, async ({ params }) => {
    await delay(300);

    const { postId } = params;

    // 좋아요 추가
    const postLikes = likes.get(postId as string) || new Set();
    postLikes.add(CURRENT_USER.id);
    likes.set(postId as string, postLikes);

    // 포스트 업데이트
    for (const [gyeId, gyePosts] of posts.entries()) {
      const postIndex = gyePosts.findIndex((p) => p.id === postId);
      if (postIndex > -1) {
        gyePosts[postIndex] = {
          ...gyePosts[postIndex],
          likeCount: gyePosts[postIndex].likeCount + 1,
          isLiked: true,
        };
        posts.set(gyeId, gyePosts);
        break;
      }
    }

    return HttpResponse.json({
      success: true,
      data: { message: "좋아요를 눌렀습니다" },
    });
  }),

  // DELETE /api/posts/:postId/like - 포스트 좋아요 취소
  http.delete(`${BASE_URL}/api/posts/:postId/like`, async ({ params }) => {
    await delay(300);

    const { postId } = params;

    // 좋아요 제거
    const postLikes = likes.get(postId as string);
    if (postLikes) {
      postLikes.delete(CURRENT_USER.id);
    }

    // 포스트 업데이트
    for (const [gyeId, gyePosts] of posts.entries()) {
      const postIndex = gyePosts.findIndex((p) => p.id === postId);
      if (postIndex > -1) {
        gyePosts[postIndex] = {
          ...gyePosts[postIndex],
          likeCount: Math.max(0, gyePosts[postIndex].likeCount - 1),
          isLiked: false,
        };
        posts.set(gyeId, gyePosts);
        break;
      }
    }

    return HttpResponse.json({
      success: true,
      data: { message: "좋아요를 취소했습니다" },
    });
  }),

  // ============================================
  // Comment APIs
  // ============================================

  // GET /api/posts/:postId/comments - 댓글 목록 조회
  http.get(`${BASE_URL}/api/posts/:postId/comments`, async ({ params, request }) => {
    await delay(400);

    const { postId } = params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);

    // 캐시된 데이터가 없으면 생성
    if (!comments.has(postId as string)) {
      comments.set(postId as string, generateMockComment(postId as string, 30));
    }

    let allComments = comments.get(postId as string) || [];

    // 최신순 정렬
    allComments = [...allComments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 커서 페이지네이션
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = allComments.findIndex((c) => c.id === cursor);
      startIndex = cursorIndex > -1 ? cursorIndex + 1 : 0;
    }

    const paginatedComments = allComments.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < allComments.length;
    const nextCursor = hasMore ? paginatedComments[paginatedComments.length - 1]?.id : undefined;

    return HttpResponse.json({
      success: true,
      data: {
        comments: paginatedComments,
        nextCursor,
        hasMore,
      },
    });
  }),

  // POST /api/posts/:postId/comments - 댓글 생성
  http.post(`${BASE_URL}/api/posts/:postId/comments`, async ({ params, request }) => {
    await delay(500);

    const { postId } = params;
    const body = (await request.json()) as CreateCommentRequest;

    const newComment: Comment = generateMockComment(postId as string, {
      id: generateId(),
      author: {
        id: CURRENT_USER.id,
        nickname: CURRENT_USER.nickname,
        profileImage: CURRENT_USER.profileImage,
        creditScore: CURRENT_USER.creditScore,
      },
      content: body.content,
      parentCommentId: body.parentCommentId,
      replyCount: 0,
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const postComments = comments.get(postId as string) || [];
    comments.set(postId as string, [newComment, ...postComments]);

    // 포스트의 댓글 카운트 증가
    for (const [gyeId, gyePosts] of posts.entries()) {
      const postIndex = gyePosts.findIndex((p) => p.id === postId);
      if (postIndex > -1) {
        gyePosts[postIndex] = {
          ...gyePosts[postIndex],
          commentCount: gyePosts[postIndex].commentCount + 1,
        };
        posts.set(gyeId, gyePosts);
        break;
      }
    }

    return HttpResponse.json({
      success: true,
      data: newComment,
    });
  }),

  // PUT /api/comments/:commentId - 댓글 수정
  http.put(`${BASE_URL}/api/comments/:commentId`, async ({ params, request }) => {
    await delay(400);

    const { commentId } = params;
    const body = (await request.json()) as { content: string };

    let updated = false;
    for (const [postId, postComments] of comments.entries()) {
      const commentIndex = postComments.findIndex((c) => c.id === commentId);
      if (commentIndex > -1) {
        postComments[commentIndex] = {
          ...postComments[commentIndex],
          content: body.content,
          updatedAt: new Date().toISOString(),
        };
        comments.set(postId, postComments);
        updated = true;
        break;
      }
    }

    if (!updated) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "COMMENT_NOT_FOUND",
            message: "댓글을 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "댓글이 수정되었습니다" },
    });
  }),

  // DELETE /api/comments/:commentId - 댓글 삭제
  http.delete(`${BASE_URL}/api/comments/:commentId`, async ({ params }) => {
    await delay(400);

    const { commentId } = params;

    let deleted = false;
    for (const [postId, postComments] of comments.entries()) {
      const filteredComments = postComments.filter((c) => c.id !== commentId);
      if (filteredComments.length < postComments.length) {
        comments.set(postId, filteredComments);
        deleted = true;

        // 포스트의 댓글 카운트 감소
        for (const [gyeId, gyePosts] of posts.entries()) {
          const postIndex = gyePosts.findIndex((p) => p.id === postId);
          if (postIndex > -1) {
            gyePosts[postIndex] = {
              ...gyePosts[postIndex],
              commentCount: Math.max(0, gyePosts[postIndex].commentCount - 1),
            };
            posts.set(gyeId, gyePosts);
            break;
          }
        }
        break;
      }
    }

    if (!deleted) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "COMMENT_NOT_FOUND",
            message: "댓글을 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "댓글이 삭제되었습니다" },
    });
  }),

  // POST /api/comments/:commentId/like - 댓글 좋아요
  http.post(`${BASE_URL}/api/comments/:commentId/like`, async ({ params }) => {
    await delay(300);

    const { commentId } = params;

    // 좋아요 추가
    const commentLikes = likes.get(commentId as string) || new Set();
    commentLikes.add(CURRENT_USER.id);
    likes.set(commentId as string, commentLikes);

    // 댓글 업데이트
    for (const [postId, postComments] of comments.entries()) {
      const commentIndex = postComments.findIndex((c) => c.id === commentId);
      if (commentIndex > -1) {
        postComments[commentIndex] = {
          ...postComments[commentIndex],
          likeCount: postComments[commentIndex].likeCount + 1,
          isLiked: true,
        };
        comments.set(postId, postComments);
        break;
      }
    }

    return HttpResponse.json({
      success: true,
      data: { message: "좋아요를 눌렀습니다" },
    });
  }),

  // DELETE /api/comments/:commentId/like - 댓글 좋아요 취소
  http.delete(`${BASE_URL}/api/comments/:commentId/like`, async ({ params }) => {
    await delay(300);

    const { commentId } = params;

    // 좋아요 제거
    const commentLikes = likes.get(commentId as string);
    if (commentLikes) {
      commentLikes.delete(CURRENT_USER.id);
    }

    // 댓글 업데이트
    for (const [postId, postComments] of comments.entries()) {
      const commentIndex = postComments.findIndex((c) => c.id === commentId);
      if (commentIndex > -1) {
        postComments[commentIndex] = {
          ...postComments[commentIndex],
          likeCount: Math.max(0, postComments[commentIndex].likeCount - 1),
          isLiked: false,
        };
        comments.set(postId, postComments);
        break;
      }
    }

    return HttpResponse.json({
      success: true,
      data: { message: "좋아요를 취소했습니다" },
    });
  }),

  // GET /api/comments/:commentId/replies - 대댓글 목록 조회
  http.get(`${BASE_URL}/api/comments/:commentId/replies`, async ({ params, request }) => {
    await delay(400);

    const { commentId } = params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // 부모 댓글이 속한 포스트 찾기
    let parentPostId: string | undefined;
    for (const [postId, postComments] of comments.entries()) {
      if (postComments.some((c) => c.id === commentId)) {
        parentPostId = postId;
        break;
      }
    }

    if (!parentPostId) {
      return HttpResponse.json({
        success: true,
        data: {
          comments: [],
          nextCursor: undefined,
          hasMore: false,
        },
      });
    }

    // 대댓글 필터링
    const allComments = comments.get(parentPostId) || [];
    const replies = allComments.filter((c) => c.parentCommentId === commentId);

    // 커서 페이지네이션
    let startIndex = 0;
    if (cursor) {
      const cursorIndex = replies.findIndex((c) => c.id === cursor);
      startIndex = cursorIndex > -1 ? cursorIndex + 1 : 0;
    }

    const paginatedReplies = replies.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < replies.length;
    const nextCursor = hasMore ? paginatedReplies[paginatedReplies.length - 1]?.id : undefined;

    return HttpResponse.json({
      success: true,
      data: {
        comments: paginatedReplies,
        nextCursor,
        hasMore,
      },
    });
  }),

  // ============================================
  // Announcement APIs
  // ============================================

  // GET /api/gye/:gyeId/announcements - 공지사항 목록 조회
  http.get(`${BASE_URL}/api/gye/:gyeId/announcements`, async ({ params }) => {
    await delay(300);

    const { gyeId } = params;

    // 캐시된 데이터가 없으면 생성
    if (!announcements.has(gyeId as string)) {
      announcements.set(gyeId as string, generateMockAnnouncement(gyeId as string, 10));
    }

    let allAnnouncements = announcements.get(gyeId as string) || [];

    // 정렬: 고정된 공지 먼저, 그 다음 우선순위, 그 다음 최신순
    allAnnouncements = [...allAnnouncements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const priorityOrder = { urgent: 0, important: 1, normal: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return HttpResponse.json({
      success: true,
      data: allAnnouncements,
    });
  }),

  // GET /api/announcements/:announcementId - 공지사항 상세 조회
  http.get(`${BASE_URL}/api/announcements/:announcementId`, async ({ params }) => {
    await delay(200);

    const { announcementId } = params;

    let foundAnnouncement: Announcement | undefined;
    for (const gyeAnnouncements of announcements.values()) {
      foundAnnouncement = gyeAnnouncements.find((a) => a.id === announcementId);
      if (foundAnnouncement) break;
    }

    if (!foundAnnouncement) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "ANNOUNCEMENT_NOT_FOUND",
            message: "공지사항을 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    // 조회수 증가
    foundAnnouncement.viewCount += 1;

    return HttpResponse.json({
      success: true,
      data: foundAnnouncement,
    });
  }),

  // POST /api/gye/:gyeId/announcements - 공지사항 생성
  http.post(`${BASE_URL}/api/gye/:gyeId/announcements`, async ({ params, request }) => {
    await delay(500);

    const { gyeId } = params;
    const body = (await request.json()) as CreateAnnouncementRequest;

    const newAnnouncement: Announcement = generateMockAnnouncement(gyeId as string, {
      id: generateId(),
      author: {
        id: CURRENT_USER.id,
        nickname: CURRENT_USER.nickname,
        profileImage: CURRENT_USER.profileImage,
      },
      title: body.title,
      content: body.content,
      priority: body.priority,
      isPinned: body.isPinned || false,
      viewCount: 0,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const gyeAnnouncements = announcements.get(gyeId as string) || [];
    announcements.set(gyeId as string, [newAnnouncement, ...gyeAnnouncements]);

    return HttpResponse.json({
      success: true,
      data: newAnnouncement,
    });
  }),

  // PUT /api/announcements/:announcementId - 공지사항 수정
  http.put(`${BASE_URL}/api/announcements/:announcementId`, async ({ params, request }) => {
    await delay(400);

    const { announcementId } = params;
    const body = (await request.json()) as Partial<CreateAnnouncementRequest>;

    let updated = false;
    for (const [gyeId, gyeAnnouncements] of announcements.entries()) {
      const announcementIndex = gyeAnnouncements.findIndex((a) => a.id === announcementId);
      if (announcementIndex > -1) {
        gyeAnnouncements[announcementIndex] = {
          ...gyeAnnouncements[announcementIndex],
          ...body,
          updatedAt: new Date().toISOString(),
        };
        announcements.set(gyeId, gyeAnnouncements);
        updated = true;
        break;
      }
    }

    if (!updated) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "ANNOUNCEMENT_NOT_FOUND",
            message: "공지사항을 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "공지사항이 수정되었습니다" },
    });
  }),

  // DELETE /api/announcements/:announcementId - 공지사항 삭제
  http.delete(`${BASE_URL}/api/announcements/:announcementId`, async ({ params }) => {
    await delay(400);

    const { announcementId } = params;

    let deleted = false;
    for (const [gyeId, gyeAnnouncements] of announcements.entries()) {
      const filteredAnnouncements = gyeAnnouncements.filter((a) => a.id !== announcementId);
      if (filteredAnnouncements.length < gyeAnnouncements.length) {
        announcements.set(gyeId, filteredAnnouncements);
        deleted = true;
        break;
      }
    }

    if (!deleted) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "ANNOUNCEMENT_NOT_FOUND",
            message: "공지사항을 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "공지사항이 삭제되었습니다" },
    });
  }),

  // POST /api/announcements/:announcementId/read - 공지사항 읽음 처리
  http.post(`${BASE_URL}/api/announcements/:announcementId/read`, async ({ params }) => {
    await delay(200);

    const { announcementId } = params;

    let updated = false;
    for (const [gyeId, gyeAnnouncements] of announcements.entries()) {
      const announcementIndex = gyeAnnouncements.findIndex((a) => a.id === announcementId);
      if (announcementIndex > -1) {
        gyeAnnouncements[announcementIndex] = {
          ...gyeAnnouncements[announcementIndex],
          isRead: true,
        };
        announcements.set(gyeId, gyeAnnouncements);
        updated = true;
        break;
      }
    }

    if (!updated) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "ANNOUNCEMENT_NOT_FOUND",
            message: "공지사항을 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "공지사항을 읽음 처리했습니다" },
    });
  }),

  // ============================================
  // Media Upload API (Mock)
  // ============================================

  // POST /api/gye/:gyeId/media - 미디어 업로드
  http.post(`${BASE_URL}/api/gye/:gyeId/media`, async ({ request }) => {
    await delay(1000); // 업로드는 시간이 걸림

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "FILE_REQUIRED",
            message: "파일이 필요합니다",
          },
        },
        { status: 400 }
      );
    }

    const mockMediaId = generateId();

    return HttpResponse.json({
      success: true,
      data: {
        id: mockMediaId,
        url: `https://picsum.photos/seed/${mockMediaId}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${mockMediaId}/200/150`,
        type: file.type.startsWith("video") ? "video" : "image",
        size: file.size,
        filename: file.name,
      },
    });
  }),

  // DELETE /api/media/:mediaId - 미디어 삭제
  http.delete(`${BASE_URL}/api/media/:mediaId`, async () => {
    await delay(300);

    return HttpResponse.json({
      success: true,
      data: { message: "미디어가 삭제되었습니다" },
    });
  }),
];
