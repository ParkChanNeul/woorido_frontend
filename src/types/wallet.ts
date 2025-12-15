export interface Wallet {
  id: string;
  userId: string;
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  updatedAt: string;
}

export type TransactionType =
  | "charge"
  | "withdraw"
  | "payment"
  | "receive"
  | "refund";

export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balance: number; // 거래 후 잔액
  status: TransactionStatus;
  description?: string;
  gyeId?: string;
  gyeName?: string;
  createdAt: string;
}

export interface ChargeRequest {
  amount: number;
  paymentMethod: string;
}

export interface WithdrawRequest {
  amount: number;
  bankCode: string;
  accountNumber: string;
}
