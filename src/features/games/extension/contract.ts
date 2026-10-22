/**
 * Message contract with the GameList browser extension (version 1).
 * Mirror of game-list-browser-extension/docs/frontend-contract.md.
 */
export const EXTENSION_CONTRACT_VERSION = 1;

export const SYNC_PLATFORMS = ["steam", "epic", "playstation", "nintendo", "gog"] as const;
export type SyncPlatform = (typeof SYNC_PLATFORMS)[number];

export type SyncStatus = "ok" | "not_logged_in" | "error";

export interface SyncResult {
  platform: SyncPlatform;
  status: SyncStatus;
  titles: string[];
  count: number;
  error?: string;
}

export const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/sojusan-gamelist/pngolcdcdjlekmfmojdedcicnjhepkmf";
export const FIREFOX_EXTENSION_URL = "https://addons.mozilla.org/en-US/firefox/addon/sojusan-browser-extension/";

export const PLATFORM_LOGIN_URLS: Record<SyncPlatform, string> = {
  steam: "https://store.steampowered.com/login/",
  epic: "https://www.epicgames.com/id/login",
  playstation: "https://www.playstation.com/",
  nintendo: "https://accounts.nintendo.com/",
  gog: "https://www.gog.com/",
};

export const PLATFORM_LABELS: Record<SyncPlatform, string> = {
  steam: "Steam",
  epic: "Epic Games",
  playstation: "PlayStation",
  nintendo: "Nintendo",
  gog: "GOG",
};
