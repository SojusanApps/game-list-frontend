// i18n is configured via .use().init() below, not merely re-exported;
// `export { default } from "i18next"` would skip that setup entirely.
// oxlint-disable-next-line unicorn/prefer-export-from
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enAdmin from "@/locales/en/admin.json";
import enAuth from "@/locales/en/auth.json";
import enCollections from "@/locales/en/collections.json";
import enCommon from "@/locales/en/common.json";
import enFaq from "@/locales/en/faq.json";
import enGames from "@/locales/en/games.json";
import enModeration from "@/locales/en/moderation.json";
import enNotifications from "@/locales/en/notifications.json";
import enRanking from "@/locales/en/ranking.json";
import enUsers from "@/locales/en/users.json";
import enValidation from "@/locales/en/validation.json";
import plAdmin from "@/locales/pl/admin.json";
import plAuth from "@/locales/pl/auth.json";
import plCollections from "@/locales/pl/collections.json";
import plCommon from "@/locales/pl/common.json";
import plFaq from "@/locales/pl/faq.json";
import plGames from "@/locales/pl/games.json";
import plModeration from "@/locales/pl/moderation.json";
import plNotifications from "@/locales/pl/notifications.json";
import plRanking from "@/locales/pl/ranking.json";
import plUsers from "@/locales/pl/users.json";
import plValidation from "@/locales/pl/validation.json";
import { getStoredLanguage } from "@/utils/languageUtils";

i18n.use(initReactI18next).init({
  lng: getStoredLanguage(),
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: enCommon,
      faq: enFaq,
      auth: enAuth,
      validation: enValidation,
      admin: enAdmin,
      games: enGames,
      collections: enCollections,
      users: enUsers,
      notifications: enNotifications,
      ranking: enRanking,
      moderation: enModeration,
    },
    pl: {
      common: plCommon,
      faq: plFaq,
      auth: plAuth,
      validation: plValidation,
      admin: plAdmin,
      games: plGames,
      collections: plCollections,
      users: plUsers,
      notifications: plNotifications,
      ranking: plRanking,
      moderation: plModeration,
    },
  },
});

export default i18n;
