import { Anchor, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as React from "react";
import { useTranslation } from "react-i18next";

import chromeLogo from "@/assets/browsers/chrome.svg";
import firefoxLogo from "@/assets/browsers/firefox.svg";
import { PlatformEnum, StoreEntry } from "@/client";
import { Button } from "@/components/ui/Button";

import {
  CHROME_EXTENSION_URL,
  FIREFOX_EXTENSION_URL,
  PLATFORM_LABELS,
  PLATFORM_LOGIN_URLS,
  SYNC_PLATFORMS,
  type SyncPlatform,
} from "../../extension/contract";
import { detectExtension, type ExtensionStatus, requestPlatformSync } from "../../extension/extensionClient";
import { useStoreImport } from "../../hooks/gameQueries";
import { chunkStoreEntries } from "../../utils/titleImport";
import { PLATFORM_ENUMS, PlatformLogo } from "./platformDisplay";

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
        <Text fz={12} lh={1.2} fw={400}>
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
  /** Receives the entries the backend could not match by store id; the caller sends them through title matching. */
  onUnmatched: (entries: StoreEntry[]) => void;
}

/** One button per platform that fills the titles textarea through the GameList browser extension. */
export const PlatformSyncButtons = ({ onUnmatched }: PlatformSyncButtonsProps) => {
  const { t } = useTranslation("games");
  const [extension, setExtension] = React.useState<ExtensionStatus | null>(null);
  const { mutateAsync: storeImport } = useStoreImport();
  const [syncing, setSyncing] = React.useState<SyncPlatform | null>(null);

  React.useEffect(() => {
    let active = true;
    void detectExtension().then(result => {
      if (active) {
        setExtension(result);
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
        const platformEnum = PLATFORM_ENUMS[platform];
        const entries: StoreEntry[] = result.entries.map(entry => ({
          platform: platformEnum,
          store_id: entry.storeId,
          title: entry.title,
          wishlisted: entry.wishlisted,
        }));
        let imported = 0;
        let alreadyAdded = 0;
        const unmatched: StoreEntry[] = [];
        try {
          for (const chunk of chunkStoreEntries(entries)) {
            // Chunks are sent sequentially on purpose to avoid flooding the backend.
            const response = await storeImport(chunk); // NOSONAR
            imported += response.imported.length;
            alreadyAdded += response.already_added.length;
            unmatched.push(...response.unmatched);
          }
        } finally {
          // Keep what earlier chunks produced even when a later one fails (its toast comes from useAppMutation).
          if (unmatched.length > 0) {
            onUnmatched(unmatched);
          }
        }
        notifications.show({
          message: t("import.platformSync.success", {
            count: imported,
            platform: platformName,
            alreadyAdded,
            unmatched: unmatched.length,
          }),
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
    } catch {
      // The failed backend request already showed a toast (useAppMutation).
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
            disabled={extension !== "ready" || (syncing !== null && syncing !== platform)}
            isLoading={syncing === platform}
            leftSection={<PlatformLogo platform={platform} />}
            onClick={() => handleSync(platform)}
          >
            {PLATFORM_LABELS[platform]}
          </Button>
        ))}
      </Group>
      {(extension === "missing" || extension === "outdated") && (
        <Stack gap={8}>
          <Text fz="sm" c="var(--color-text-700)">
            {t(extension === "outdated" ? "import.platformSync.outdated" : "import.platformSync.notInstalled")}
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
