import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

export default function ExplorePage() {
  const { t } = useTranslation();
  const { t: tGye } = useTranslation("gye");

  return (
    <div className="py-6 space-y-6">
      {/* 검색바 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-tertiary" />
        <input
          type="text"
          placeholder={`${tGye("title")} ${t("search")}...`}
          className="w-full pl-12 pr-4 py-3 bg-surface-1 border border-surface-border rounded-xl text-content-primary placeholder:text-content-tertiary focus:border-woorido focus:ring-1 focus:ring-woorido/30 outline-none transition-all"
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {["all", "recruiting", "ongoing"].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              status === "all"
                ? "bg-woorido text-white"
                : "bg-surface-1 text-content-secondary border border-surface-border"
            }`}
          >
            {status === "all" ? t("all") : tGye(`status.${status}`)}
          </button>
        ))}
      </div>

      {/* 계모임 목록 플레이스홀더 */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-1 border border-surface-border rounded-2xl p-4 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-surface-2 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-surface-2 rounded w-3/4" />
                <div className="h-4 bg-surface-2 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
