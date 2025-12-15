import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Globe } from "lucide-react";

export function Header() {
  const { i18n } = useTranslation();

  const toggleLocale = () => {
    const newLocale = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLocale);
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-bg/80 backdrop-blur-lg border-b border-surface-border">
      <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-woorido flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-content-primary font-bold text-lg hidden sm:block">
            WOORIDO
          </span>
        </Link>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {/* 언어 토글 */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-2 transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium uppercase">
              {i18n.language === "ko" ? "EN" : "한"}
            </span>
          </button>

          {/* 알림 */}
          <button
            className="relative p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-2 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* 알림 뱃지 */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-woorido rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
