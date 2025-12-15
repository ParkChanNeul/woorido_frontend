import { useTranslation } from "react-i18next";
import { formatAmount } from "@/lib/utils";

export default function WalletPage() {
  const { t: tWallet } = useTranslation("wallet");

  // 임시 데이터
  const balance = 1250000;

  return (
    <div className="py-6 space-y-6">
      {/* 잔액 카드 */}
      <div className="bg-surface-1 border border-surface-border rounded-2xl p-6">
        <p className="text-content-secondary text-sm mb-2">
          {tWallet("balance")}
        </p>
        <p className="text-3xl font-bold text-content-primary text-amount">
          {formatAmount(balance)}
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="grid grid-cols-2 gap-4">
        <button className="py-4 bg-woorido text-white rounded-xl font-semibold">
          {tWallet("charge")}
        </button>
        <button className="py-4 bg-surface-2 text-content-primary border border-surface-border rounded-xl font-semibold">
          {tWallet("withdraw")}
        </button>
      </div>

      {/* 거래 내역 */}
      <div>
        <h2 className="text-lg font-bold text-content-primary mb-4">
          {tWallet("history")}
        </h2>
        <div className="bg-surface-1 border border-surface-border rounded-2xl p-8 text-center">
          <p className="text-content-secondary">{tWallet("empty.title")}</p>
        </div>
      </div>
    </div>
  );
}
