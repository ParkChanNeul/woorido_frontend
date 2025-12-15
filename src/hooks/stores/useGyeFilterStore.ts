/**
 * Gye 필터 UI 상태 관리 Store
 * 계 목록 필터링, 정렬, 선택된 계 ID 등 UI 상태만 관리
 */

import { create } from "zustand";

export type GyeSortBy = "createdAt" | "memberCount" | "monthlyAmount";
export type GyeFilterStatus = "all" | "active" | "completed" | "recruiting";

interface GyeFilterState {
  selectedGyeId: string | null;
  sortBy: GyeSortBy;
  filterStatus: GyeFilterStatus;
  searchKeyword: string;

  setSelectedGyeId: (gyeId: string | null) => void;
  setSortBy: (sortBy: GyeSortBy) => void;
  setFilterStatus: (status: GyeFilterStatus) => void;
  setSearchKeyword: (keyword: string) => void;
  resetFilters: () => void;
}

export const useGyeFilterStore = create<GyeFilterState>((set) => ({
  selectedGyeId: null,
  sortBy: "createdAt",
  filterStatus: "all",
  searchKeyword: "",

  setSelectedGyeId: (gyeId) => set({ selectedGyeId: gyeId }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  resetFilters: () => set({
    sortBy: "createdAt",
    filterStatus: "all",
    searchKeyword: "",
  }),
}));
