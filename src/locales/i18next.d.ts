import type enAdmin from "./en/admin.json";
import type enAuth from "./en/auth.json";
import type enCollections from "./en/collections.json";
import type enCommon from "./en/common.json";
import type enGames from "./en/games.json";
import type enModeration from "./en/moderation.json";
import type enNotifications from "./en/notifications.json";
import type enRanking from "./en/ranking.json";
import type enUsers from "./en/users.json";
import type enValidation from "./en/validation.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof enCommon;
      auth: typeof enAuth;
      validation: typeof enValidation;
      admin: typeof enAdmin;
      games: typeof enGames;
      collections: typeof enCollections;
      users: typeof enUsers;
      notifications: typeof enNotifications;
      ranking: typeof enRanking;
      moderation: typeof enModeration;
    };
  }
}
