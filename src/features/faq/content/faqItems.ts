import { GameListStatusEnum } from "@/client";

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
  | "gameData"
  | "statuses";

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
  "statuses",
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
    {
      labelKey: "items.reportIssues.linkLabel",
      href: "https://github.com/SojusanApps/game-list-community/discussions",
    },
  ],
  openSource: [{ labelKey: "items.openSource.linkLabel", href: "https://github.com/SojusanApps" }],
  deleteAccount: [{ labelKey: "items.deleteAccount.linkLabel", to: "/privacy" }],
  gameData: [{ labelKey: "items.gameData.linkLabel", href: "https://www.igdb.com/" }],
};

export type FaqStatusDescriptionKey =
  | "items.statuses.list.playing"
  | "items.statuses.list.completed"
  | "items.statuses.list.planToPlay"
  | "items.statuses.list.onHold"
  | "items.statuses.list.dropped"
  | "items.statuses.list.notPlanned";

export interface FaqStatusListItem {
  status: GameListStatusEnum;
  descriptionKey: FaqStatusDescriptionKey;
}

/** Statuses shown as an icon + label + description bullet list under the "statuses" FAQ item. */
export const FAQ_STATUS_LIST: FaqStatusListItem[] = [
  { status: GameListStatusEnum.P, descriptionKey: "items.statuses.list.playing" },
  { status: GameListStatusEnum.C, descriptionKey: "items.statuses.list.completed" },
  { status: GameListStatusEnum.PTP, descriptionKey: "items.statuses.list.planToPlay" },
  { status: GameListStatusEnum.OH, descriptionKey: "items.statuses.list.onHold" },
  { status: GameListStatusEnum.D, descriptionKey: "items.statuses.list.dropped" },
  { status: GameListStatusEnum.NP, descriptionKey: "items.statuses.list.notPlanned" },
];
