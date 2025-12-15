import type { User } from "./user";

/**
 * 공지사항 중요도
 */
export type AnnouncementPriority = "normal" | "important" | "urgent";

/**
 * 공지사항 (계 운영 관련)
 */
export interface Announcement {
  id: string;
  gyeId: string;
  authorId: string;
  author: Pick<User, "id" | "nickname" | "profileImage">;
  title: string;
  content: string;
  priority: AnnouncementPriority;

  // 고정 여부 (상단 고정)
  isPinned: boolean;

  // 읽음 통계
  viewCount: number;
  isRead: boolean; // 현재 사용자가 읽었는지

  createdAt: string;
  updatedAt: string;
}

/**
 * 공지사항 목록 응답
 */
export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
}

/**
 * 공지사항 생성 요청 (계주만 가능)
 */
export interface CreateAnnouncementRequest {
  gyeId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  isPinned?: boolean;
}

/**
 * 공지사항 수정 요청
 */
export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
}

/**
 * 공지사항 목록 조회 파라미터
 */
export interface AnnouncementListParams {
  gyeId: string;
  page?: number;
  limit?: number;
}
