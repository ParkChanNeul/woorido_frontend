import "i18next";

import type koCommon from "./ko/common.json";
import type koNav from "./ko/nav.json";
import type koAuth from "./ko/auth.json";
import type koGye from "./ko/gye.json";
import type koWallet from "./ko/wallet.json";
import type koProfile from "./ko/profile.json";
import type koValidation from "./ko/validation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof koCommon;
      nav: typeof koNav;
      auth: typeof koAuth;
      gye: typeof koGye;
      wallet: typeof koWallet;
      profile: typeof koProfile;
      validation: typeof koValidation;
    };
  }
}
