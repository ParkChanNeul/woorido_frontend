/**
 * Spring Boot - Announcement API
 * 계 공지사항 관리 (계주만 생성/수정/삭제 가능)
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";
import type {
  Announcement,
  AnnouncementListResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementListParams,
} from "@/types";

/**
 * 공지사항 목록 조회
 */
export async function getAnnouncements(
  params: AnnouncementListParams
): Promise<AnnouncementListResponse> {
  const { data } = await springClient.get<{ data: AnnouncementListResponse }>(
    SPRING_ENDPOINTS.ANNOUNCEMENT.LIST(params.gyeId),
    { params: { page: params.page, limit: params.limit } }
  );
  return data.data;
}

/**
 * 공지사항 상세 조회
 */
export async function getAnnouncementDetail(
  announcementId: string
): Promise<Announcement> {
  const { data } = await springClient.get<{ data: Announcement }>(
    SPRING_ENDPOINTS.ANNOUNCEMENT.DETAIL(announcementId)
  );
  return data.data;
}

/**
 * 공지사항 생성 (계주만)
 */
export async function createAnnouncement(
  request: CreateAnnouncementRequest
): Promise<Announcement> {
  const { data } = await springClient.post<{ data: Announcement }>(
    SPRING_ENDPOINTS.ANNOUNCEMENT.CREATE(request.gyeId),
    request
  );
  return data.data;
}

/**
 * 공지사항 수정 (계주만)
 */
export async function updateAnnouncement(
  announcementId: string,
  request: UpdateAnnouncementRequest
): Promise<Announcement> {
  const { data } = await springClient.put<{ data: Announcement }>(
    SPRING_ENDPOINTS.ANNOUNCEMENT.UPDATE(announcementId),
    request
  );
  return data.data;
}

/**
 * 공지사항 삭제 (계주만)
 */
export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await springClient.delete(SPRING_ENDPOINTS.ANNOUNCEMENT.DELETE(announcementId));
}

/**
 * 공지사항 읽음 처리
 */
export async function markAnnouncementAsRead(
  announcementId: string
): Promise<void> {
  await springClient.post(SPRING_ENDPOINTS.ANNOUNCEMENT.READ(announcementId));
}
