export type FaqItemId =
  | "about"
  | "creator"
  | "behavior"
  | "warning"
  | "ban"
  | "reportIssues"
  | "openSource"
  | "auth"
  | "deleteAccount"
  | "listsVsCollections"
  | "friends"
  | "gameData";

export const FAQ_ITEM_ORDER: FaqItemId[] = [
  "about",
  "creator",
  "behavior",
  "warning",
  "ban",
  "reportIssues",
  "openSource",
  "auth",
  "deleteAccount",
  "listsVsCollections",
  "friends",
  "gameData",
];

export type FaqLinkLabelKey =
  | "items.about.termsLinkLabel"
  | "items.about.privacyLinkLabel"
  | "items.creator.githubLinkLabel"
  | "items.creator.youtubeLinkLabel"
  | "items.behavior.termsLinkLabel"
  | "items.reportIssues.linkLabel"
  | "items.openSource.linkLabel"
  | "items.deleteAccount.linkLabel"
  | "items.gameData.linkLabel";

export type FaqItemLink =
  | { labelKey: FaqLinkLabelKey; to: string; href?: never }
  | { labelKey: FaqLinkLabelKey; href: string; to?: never };

export const FAQ_ITEM_LINKS: Partial<Record<FaqItemId, FaqItemLink[]>> = {
  about: [
    { labelKey: "items.about.termsLinkLabel", to: "/terms" },
    { labelKey: "items.about.privacyLinkLabel", to: "/privacy" },
  ],
  creator: [
    { labelKey: "items.creator.githubLinkLabel", href: "https://github.com/Sojusan" },
    { labelKey: "items.creator.youtubeLinkLabel", href: "https://www.youtube.com/channel/UC_ENZnPld2X3sZGOEojVQeg" },
  ],
  behavior: [{ labelKey: "items.behavior.termsLinkLabel", to: "/terms" }],
  reportIssues: [
    { labelKey: "items.reportIssues.linkLabel", href: "https://github.com/SojusanApps/game-list-community/discussions" },
  ],
  openSource: [{ labelKey: "items.openSource.linkLabel", href: "https://github.com/SojusanApps" }],
  deleteAccount: [{ labelKey: "items.deleteAccount.linkLabel", to: "/privacy" }],
  gameData: [{ labelKey: "items.gameData.linkLabel", href: "https://www.igdb.com/" }],
};
