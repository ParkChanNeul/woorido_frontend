import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus, TrendingUp, Users } from "lucide-react";

export default function HomePage() {
  const { t } = useTranslation();
  const { t: tGye } = useTranslation("gye");
  const { t: tNav } = useTranslation("nav");

  return (
    <div className="py-6 space-y-8">
      {/* 환영 메시지 */}
      <section>
        <h1 className="text-2xl font-bold text-content-primary mb-2">
          안녕하세요! 👋
        </h1>
        <p className="text-content-secondary">
          WOORIDO에서 새로운 계모임을 시작해보세요.
        </p>
      </section>

      {/* 빠른 액션 */}
      <section className="grid grid-cols-2 gap-4">
        <Link
          to="/create"
          className="flex items-center gap-3 p-4 bg-woorido rounded-2xl text-white"
        >
          <Plus className="w-6 h-6" />
          <div>
            <p className="font-semibold">{tNav("create")}</p>
            <p className="text-sm opacity-80">새로운 계 시작하기</p>
          </div>
        </Link>

        <Link
          to="/explore"
          className="flex items-center gap-3 p-4 bg-surface-1 border border-surface-border rounded-2xl"
        >
          <Users className="w-6 h-6 text-woorido" />
          <div>
            <p className="font-semibold text-content-primary">{tNav("explore")}</p>
            <p className="text-sm text-content-secondary">계모임 찾기</p>
          </div>
        </Link>
      </section>

      {/* 내 계모임 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-content-primary">
            {tGye("title")}
          </h2>
          <Link to="/explore" className="text-sm text-woorido">
            {t("more")}
          </Link>
        </div>

        {/* Empty State */}
        <div className="bg-surface-1 border border-surface-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-2 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-content-tertiary" />
          </div>
          <h3 className="text-content-primary font-medium mb-2">
            {tGye("empty.title")}
          </h3>
          <p className="text-content-secondary text-sm mb-4">
            {tGye("empty.description")}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center justify-center px-4 py-2 bg-woorido text-white rounded-xl text-sm font-medium"
          >
            {tGye("empty.action")}
          </Link>
        </div>
      </section>
    </div>
  );
}
