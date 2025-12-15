import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { t: tAuth } = useTranslation("auth");
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-content-primary mb-2">
          {tAuth("welcomeBack")}
        </h1>
        <p className="text-content-secondary">
          WOORIDO에 로그인하세요
        </p>
      </div>

      {/* 폼 */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">
            {tAuth("email")}
          </label>
          <input
            type="email"
            placeholder={tAuth("emailPlaceholder")}
            className="w-full px-4 py-3 bg-surface-1 border border-surface-border rounded-xl text-content-primary placeholder:text-content-tertiary focus:border-woorido focus:ring-1 focus:ring-woorido/30 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-content-secondary mb-2">
            {tAuth("password")}
          </label>
          <input
            type="password"
            placeholder={tAuth("passwordPlaceholder")}
            className="w-full px-4 py-3 bg-surface-1 border border-surface-border rounded-xl text-content-primary placeholder:text-content-tertiary focus:border-woorido focus:ring-1 focus:ring-woorido/30 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-woorido text-white rounded-xl font-semibold hover:bg-woorido-light transition-colors"
        >
          {tAuth("loginButton")}
        </button>
      </form>

      {/* 링크 */}
      <div className="text-center space-y-4">
        <Link to="#" className="text-woorido text-sm">
          {tAuth("forgotPassword")}
        </Link>

        <p className="text-content-secondary text-sm">
          {tAuth("noAccount")}{" "}
          <Link to="/auth/register" className="text-woorido font-medium">
            {t("register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
