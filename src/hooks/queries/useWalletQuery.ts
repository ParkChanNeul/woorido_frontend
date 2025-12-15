/**
 * Wallet (지갑) 관련 React Query hooks
 */

import { useQuery } from "@tanstack/react-query";
import { getWalletBalance, getTransactions } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";

/**
 * 지갑 잔액 조회 Query
 */
export function useWalletBalance() {
  return useQuery({
    queryKey: queryKeys.wallet.balance(),
    queryFn: () => getWalletBalance(),
  });
}

/**
 * 거래 내역 조회 Query
 */
export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.wallet.transactions(),
    queryFn: () => getTransactions(),
  });
}
