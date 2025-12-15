import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  const { t: tProfile } = useTranslation("profile");

  return (
    <div className="py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link
          to="/profile"
          className="p-2 -ml-2 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-content-primary" />
        </Link>
        <h1 className="text-xl font-bold text-content-primary">
          {tProfile("settings")}
        </h1>
      </div>

      {/* 설정 목록 */}
      <div className="bg-surface-1 border border-surface-border rounded-2xl overflow-hidden">
        {[
          { label: tProfile("notification") },
          { label: tProfile("language") },
          { label: tProfile("theme") },
        ].map((item, index) => (
          <div
            key={item.label}
            className={`flex items-center justify-between p-4 ${
              index !== 0 ? "border-t border-surface-border" : ""
            }`}
          >
            <span className="text-content-primary">{item.label}</span>
            <span className="text-content-tertiary text-sm">설정</span>
          </div>
        ))}
      </div>

      {/* 위험 영역 */}
      <div className="bg-surface-1 border border-error/30 rounded-2xl p-4">
        <button className="text-error font-medium">
          {tProfile("deleteAccount")}
        </button>
        <p className="text-content-tertiary text-sm mt-1">
          {tProfile("deleteAccountWarning")}
        </p>
      </div>

      {/* 버전 */}
      <p className="text-center text-content-tertiary text-sm">
        {tProfile("version", { version: "0.1.0" })}
      </p>
    </div>
  );
}
