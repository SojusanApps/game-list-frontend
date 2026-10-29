import epicLogo from "@/assets/platforms/epicgames.svg";
import gogLogo from "@/assets/platforms/gog.svg";
import nintendoLogo from "@/assets/platforms/nintendo.svg";
import playstationLogo from "@/assets/platforms/playstation.svg";
import steamLogo from "@/assets/platforms/steam.svg";
import { PlatformEnum } from "@/client";

import { PLATFORM_LABELS, type SyncPlatform } from "../../extension/contract";

export const PLATFORM_ENUMS: Record<SyncPlatform, PlatformEnum> = {
  steam: PlatformEnum.STEAM,
  epic: PlatformEnum.EPIC,
  playstation: PlatformEnum.PLAYSTATION,
  nintendo: PlatformEnum.NINTENDO,
  gog: PlatformEnum.GOG,
};

const SYNC_PLATFORMS_BY_ENUM: Record<PlatformEnum, SyncPlatform> = {
  [PlatformEnum.STEAM]: "steam",
  [PlatformEnum.EPIC]: "epic",
  [PlatformEnum.PLAYSTATION]: "playstation",
  [PlatformEnum.NINTENDO]: "nintendo",
  [PlatformEnum.GOG]: "gog",
};

const PLATFORM_LOGOS: Record<SyncPlatform, string> = {
  steam: steamLogo,
  epic: epicLogo,
  playstation: playstationLogo,
  nintendo: nintendoLogo,
  gog: gogLogo,
};

export const platformLabel = (platform: PlatformEnum) => PLATFORM_LABELS[SYNC_PLATFORMS_BY_ENUM[platform]];

/** Brand logo painted in the current text color, so it follows the theme. */
export const PlatformLogo = ({ platform }: { platform: SyncPlatform }) => {
  // Quoted: Vite inlines small SVGs as data URLs whose quotes would otherwise break an unquoted url().
  const mask = `url("${PLATFORM_LOGOS[platform]}") center / contain no-repeat`;
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        flexShrink: 0,
        backgroundColor: "currentColor",
        mask,
        WebkitMask: mask,
      }}
    />
  );
};

export const EnumPlatformLogo = ({ platform }: { platform: PlatformEnum }) => (
  <PlatformLogo platform={SYNC_PLATFORMS_BY_ENUM[platform]} />
);
