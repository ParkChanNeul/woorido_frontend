import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Korean
import koCommon from "./ko/common.json";
import koNav from "./ko/nav.json";
import koAuth from "./ko/auth.json";
import koGye from "./ko/gye.json";
import koWallet from "./ko/wallet.json";
import koProfile from "./ko/profile.json";
import koValidation from "./ko/validation.json";

// English
import enCommon from "./en/common.json";
import enNav from "./en/nav.json";
import enAuth from "./en/auth.json";
import enGye from "./en/gye.json";
import enWallet from "./en/wallet.json";
import enProfile from "./en/profile.json";
import enValidation from "./en/validation.json";

const resources = {
  ko: {
    common: koCommon,
    nav: koNav,
    auth: koAuth,
    gye: koGye,
    wallet: koWallet,
    profile: koProfile,
    validation: koValidation,
  },
  en: {
    common: enCommon,
    nav: enNav,
    auth: enAuth,
    gye: enGye,
    wallet: enWallet,
    profile: enProfile,
    validation: enValidation,
  },
};

// 브라우저 언어 감지
function getInitialLanguage(): string {
  const stored = localStorage.getItem("woorido-locale");
  if (stored && (stored === "ko" || stored === "en")) {
    return stored;
  }

  const browserLang = navigator.language.split("-")[0];
  return browserLang === "en" ? "en" : "ko";
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "ko",
  defaultNS: "common",
  ns: ["common", "nav", "auth", "gye", "wallet", "profile", "validation"],

  interpolation: {
    escapeValue: false, // React는 자동 이스케이프
  },

  react: {
    useSuspense: true,
  },
});

// 언어 변경 시 localStorage 저장
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("woorido-locale", lng);
  document.documentElement.lang = lng;
});

export default i18n;
