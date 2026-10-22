import { Anchor, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as React from "react";
import { useTranslation } from "react-i18next";

import chromeLogo from "@/assets/browsers/chrome.svg";
import firefoxLogo from "@/assets/browsers/firefox.svg";
import epicLogo from "@/assets/platforms/epicgames.svg";
import gogLogo from "@/assets/platforms/gog.svg";
import nintendoLogo from "@/assets/platforms/nintendo.svg";
import playstationLogo from "@/assets/platforms/playstation.svg";
import steamLogo from "@/assets/platforms/steam.svg";
import { Button } from "@/components/ui/Button";

import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
  PLATFORM_LABELS,
  PLATFORM_LOGIN_URLS,
  SYNC_PLATFORMS,
  type SyncPlatform,
} from "../../extension/contract";
import { isExtensionInstalled, requestPlatformSync } from "../../extension/extensionClient";

const PLATFORM_LOGOS: Record<SyncPlatform, string> = {
  steam: steamLogo,
  epic: epicLogo,
  playstation: playstationLogo,
  nintendo: nintendoLogo,
  gog: gogLogo,
};

/** Brand logo painted in the current text color, so it follows the theme. */
const PlatformLogo = ({ platform }: { platform: SyncPlatform }) => {
  // Quoted: Vite inlines small SVGs as data URLs whose quotes would otherwise break an unquoted url().
  const mask = `url("${PLATFORM_LOGOS[platform]}") center / contain no-repeat`;
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        backgroundColor: "currentColor",
        mask,
        WebkitMask: mask,
      }}
    />
  );
};

interface ExtensionStoreButtonProps {
  logo: string;
  storeName: string;
  url: string;
}

/** Store badge: "Get it on" over the store name, opening the extension listing in a new tab. */
const ExtensionStoreButton = ({ logo, storeName, url }: ExtensionStoreButtonProps) => {
  const { t } = useTranslation("games");
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      leftSection={<img src={logo} alt="" width={28} height={28} />}
      style={{ height: "auto", paddingBlock: 8 }}
    >
      <Stack gap={0} align="flex-start">
        <Text fz={11} lh={1.2} fw={400}>
          {t("import.platformSync.getItOn")}
        </Text>
        <Text fz="md" lh={1.2} fw={500}>
          {storeName}
        </Text>
      </Stack>
    </Button>
  );
};

interface PlatformSyncButtonsProps {
  /** Receives the synced titles; the caller appends them to the textarea. */
  onTitles: (titles: string[]) => void;
}

/** One button per platform that fills the titles textarea through the GameList browser extension. */
export const PlatformSyncButtons = ({ onTitles }: PlatformSyncButtonsProps) => {
  const { t } = useTranslation("games");
  const [installed, setInstalled] = React.useState<boolean | null>(null);
  const [syncing, setSyncing] = React.useState<SyncPlatform | null>(null);

  React.useEffect(() => {
    let active = true;
    void isExtensionInstalled().then(result => {
      if (active) {
        setInstalled(result);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSync = async (platform: SyncPlatform) => {
    const platformName = PLATFORM_LABELS[platform];
    setSyncing(platform);
    try {
      const result = await requestPlatformSync(platform);
      if (result.status === "ok") {
        onTitles(result.titles);
        notifications.show({
          message: t("import.platformSync.success", { count: result.count, platform: platformName }),
          color: "green",
        });
      } else if (result.status === "not_logged_in") {
        notifications.show({
          title: t("import.platformSync.notLoggedInTitle", { platform: platformName }),
          message: (
            <Text fz="sm">
              {t("import.platformSync.notLoggedIn", { platform: platformName })}{" "}
              <Anchor href={PLATFORM_LOGIN_URLS[platform]} target="_blank" rel="noreferrer" fz="sm">
                {t("import.platformSync.loginLink")}
              </Anchor>
            </Text>
          ),
          color: "yellow",
        });
      } else {
        notifications.show({
          title: t("import.platformSync.errorTitle", { platform: platformName }),
          message: result.error ?? t("import.platformSync.errorUnknown"),
          color: "red",
        });
      }
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Stack gap={8}>
      <Text fw={500} fz="sm">
        {t("import.platformSync.label")}
      </Text>
      <Group gap={8}>
        {SYNC_PLATFORMS.map(platform => (
          <Button
            key={platform}
            type="button"
            variant="outline"
            size="sm"
            disabled={!installed || (syncing !== null && syncing !== platform)}
            isLoading={syncing === platform}
            leftSection={<PlatformLogo platform={platform} />}
            onClick={() => void handleSync(platform)}
          >
            {PLATFORM_LABELS[platform]}
          </Button>
        ))}
      </Group>
      {installed === false && (
        <Stack gap={8}>
          <Text fz="sm" c="var(--color-text-700)">
            {t("import.platformSync.notInstalled")}
          </Text>
          <Group gap={8}>
            <ExtensionStoreButton
              logo={chromeLogo}
              storeName={t("import.platformSync.chromeStore")}
              url={CHROME_EXTENSION_URL}
            />
            <ExtensionStoreButton
              logo={firefoxLogo}
              storeName={t("import.platformSync.firefoxStore")}
              url={FIREFOX_EXTENSION_URL}
            />
          </Group>
        </Stack>
      )}
    </Stack>
  );
};
