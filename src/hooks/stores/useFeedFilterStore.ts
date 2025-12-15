/**
 * Feed Filter UI 상태 관리 Store
 * 계 피드의 정렬, 필터 상태 관리
 */

import { create } from "zustand";

export type FeedSortBy = "latest" | "popular";

export interface FeedFilterState {
  sortBy: FeedSortBy;
  showAnnouncementsOnly: boolean;

  setSortBy: (sortBy: FeedSortBy) => void;
  setShowAnnouncementsOnly: (show: boolean) => void;
  reset: () => void;
}

export const useFeedFilterStore = create<FeedFilterState>((set) => ({
  sortBy: "latest",
  showAnnouncementsOnly: false,

  setSortBy: (sortBy) => set({ sortBy }),
  setShowAnnouncementsOnly: (show) => set({ showAnnouncementsOnly: show }),

  reset: () =>
    set({
      sortBy: "latest",
      showAnnouncementsOnly: false,
    }),
}));
