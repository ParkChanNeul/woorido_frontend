/**
 * Announcement (공지사항) 관련 React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncements,
  getAnnouncementDetail,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAnnouncementAsRead,
} from "@/lib/api";
import type {
  AnnouncementListParams,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "@/types";
import { queryKeys } from "@/lib/queryClient";
import { toast } from "sonner";

/**
 * 공지사항 목록 조회 Query
 */
export function useAnnouncements(params: AnnouncementListParams) {
  return useQuery({
    queryKey: queryKeys.announcement.list(params.gyeId),
    queryFn: () => getAnnouncements(params),
    enabled: !!params.gyeId,
  });
}

/**
 * 공지사항 상세 조회 Query
 */
export function useAnnouncementDetail(announcementId: string) {
  return useQuery({
    queryKey: queryKeys.announcement.detail(announcementId),
    queryFn: () => getAnnouncementDetail(announcementId),
    enabled: !!announcementId,
  });
}

/**
 * 공지사항 생성 Mutation (계주만)
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => createAnnouncement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.announcement.list(variables.gyeId),
      });
      toast.success("공지사항이 작성되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "공지사항 작성에 실패했습니다");
    },
  });
}

/**
 * 공지사항 수정 Mutation (계주만)
 */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      announcementId,
      data,
    }: {
      announcementId: string;
      data: UpdateAnnouncementRequest;
    }) => updateAnnouncement(announcementId, data),
    onSuccess: (updatedAnnouncement) => {
      queryClient.setQueryData(
        queryKeys.announcement.detail(updatedAnnouncement.id),
        updatedAnnouncement
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.announcement.list(updatedAnnouncement.gyeId),
      });
      toast.success("공지사항이 수정되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "공지사항 수정에 실패했습니다");
    },
  });
}

/**
 * 공지사항 삭제 Mutation (계주만)
 */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => deleteAnnouncement(announcementId),
    onSuccess: (_, announcementId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.announcement.detail(announcementId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcement.lists() });
      toast.success("공지사항이 삭제되었습니다");
    },
    onError: (error: Error) => {
      toast.error(error.message || "공지사항 삭제에 실패했습니다");
    },
  });
}

/**
 * 공지사항 읽음 처리 Mutation
 */
export function useMarkAnnouncementAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) => markAnnouncementAsRead(announcementId),
    onSuccess: (_, announcementId) => {
      // 상세 캐시 업데이트
      queryClient.setQueryData(
        queryKeys.announcement.detail(announcementId),
        (old: any) => {
          if (!old) return old;
          return { ...old, isRead: true, viewCount: old.viewCount + 1 };
        }
      );
      // 목록도 갱신 (읽지 않은 공지사항 카운트 변경)
      queryClient.invalidateQueries({ queryKey: queryKeys.announcement.lists() });
    },
  });
}
