import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Settings, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const { t: tProfile } = useTranslation("profile");

  return (
    <div className="py-6 space-y-6">
      {/* 프로필 헤더 */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-surface-2 rounded-full" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-content-primary">사용자</h1>
          <p className="text-content-secondary text-sm">user@example.com</p>
        </div>
        <Link
          to="/settings"
          className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <Settings className="w-6 h-6 text-content-secondary" />
        </Link>
      </div>

      {/* 신용 온도 */}
      <div className="bg-surface-1 border border-surface-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-content-secondary text-sm">
            {tProfile("creditScore")}
          </span>
          <span className="text-woorido font-bold">36.5°C</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-woorido rounded-full transition-all"
            style={{ width: "36.5%" }}
          />
        </div>
      </div>

      {/* 메뉴 */}
      <div className="bg-surface-1 border border-surface-border rounded-2xl overflow-hidden">
        {[
          { label: tProfile("myGye"), href: "/explore" },
          { label: tProfile("badges"), href: "#" },
          { label: tProfile("settings"), href: "/settings" },
        ].map((item, index) => (
          <Link
            key={item.label}
            to={item.href}
            className={`flex items-center justify-between p-4 hover:bg-surface-2 transition-colors ${
              index !== 0 ? "border-t border-surface-border" : ""
            }`}
          >
            <span className="text-content-primary">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-content-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
