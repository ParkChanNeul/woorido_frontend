/**
 * Wallet UI 상태 관리 Store
 * 지갑 화면의 탭, 날짜 범위 등 UI 상태만 관리
 */

import { create } from "zustand";

export type WalletTab = "balance" | "transactions" | "deposit";

interface WalletUIState {
  currentTab: WalletTab;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  transactionFilter: "all" | "deposit" | "withdrawal" | "transfer";

  setCurrentTab: (tab: WalletTab) => void;
  setDateRange: (start: string | null, end: string | null) => void;
  setTransactionFilter: (filter: "all" | "deposit" | "withdrawal" | "transfer") => void;
  resetFilters: () => void;
}

export const useWalletUIStore = create<WalletUIState>((set) => ({
  currentTab: "balance",
  dateRange: {
    start: null,
    end: null,
  },
  transactionFilter: "all",

  setCurrentTab: (tab) => set({ currentTab: tab }),

  setDateRange: (start, end) => set({
    dateRange: { start, end },
  }),

  setTransactionFilter: (filter) => set({ transactionFilter: filter }),

  resetFilters: () => set({
    dateRange: { start: null, end: null },
    transactionFilter: "all",
  }),
}));
