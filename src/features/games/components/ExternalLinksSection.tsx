import { Group, Stack, Text } from "@mantine/core";
import {
  IconBrandAndroid,
  IconBrandApple,
  IconBrandSteam,
  IconBrandTwitch,
  IconBrandXbox,
  IconExternalLink,
} from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { ExternalGame } from "@/client";
import {
  IconBrandEpic,
  IconBrandGog,
  IconBrandPlaystation,
  IconBrandNintendo,
  IconBrandYoutube,
  IconBrandMicrosoft,
  IconBrandAmazon,
} from "@/components/ui/CustomBrandIcons";

const getBrandDetails = (source: string) => {
  const lowerSource = source.toLowerCase();

  if (lowerSource.includes("youtube")) {
    return { icon: IconBrandYoutube, color: "#FF0000" };
  }
  if (lowerSource.includes("amazon")) {
    return { icon: IconBrandAmazon, color: "#FF9900" };
  }
  if (lowerSource.includes("microsoft") || lowerSource.includes("windows store")) {
    return { icon: IconBrandMicrosoft, color: "#0078D4" };
  }
  if (lowerSource.includes("steam")) {
    return { icon: IconBrandSteam, color: "#171A21" };
  }
  if (lowerSource.includes("twitch")) {
    return { icon: IconBrandTwitch, color: "#9146FF" };
  }
  if (lowerSource.includes("xbox")) {
    return { icon: IconBrandXbox, color: "#107C10" };
  }
  if (lowerSource.includes("playstation")) {
    return { icon: IconBrandPlaystation, color: "#003791" };
  }
  if (lowerSource.includes("nintendo")) {
    return { icon: IconBrandNintendo, color: "#E60012" };
  }
  if (lowerSource.includes("apple") || lowerSource.includes("ios") || lowerSource.includes("mac")) {
    return { icon: IconBrandApple, color: "#555555" };
  }
  if (lowerSource.includes("android") || lowerSource.includes("google play")) {
    return { icon: IconBrandAndroid, color: "#3DDC84" };
  }
  if (lowerSource.includes("gog")) {
    return { icon: IconBrandGog, color: "#8b34af" };
  }
  if (lowerSource.includes("epic")) {
    return { icon: IconBrandEpic, color: "#313131" };
  }

  // Fallback
  return { icon: IconExternalLink, color: "var(--mantine-color-primary-7)" };
};

export function ExternalLinksSection({ externalGames }: Readonly<{ externalGames: ExternalGame[] }>) {
  const { t } = useTranslation("games");
  const [showAllExternalLinks, setShowAllExternalLinks] = React.useState(false);
  const displayedExternalGames = showAllExternalLinks ? externalGames : externalGames.slice(0, 4);
  const hasMoreExternalGames = externalGames.length > 4;

  return (
    <Stack gap={4}>
      <Text size="sm" fw={500} c="var(--color-text-600)">
        {t("externalLinks.header")}
      </Text>
      <Group gap={8} wrap="wrap">
        {externalGames.length > 0 ? (
          <>
            {displayedExternalGames.map((extGame: ExternalGame) => {
              const { icon: BrandIcon, color } = getBrandDetails(extGame.external_game_source);
              return extGame.url ? (
                <Text
                  component="a"
                  href={extGame.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={extGame.id}
                  size="xs"
                  fw={500}
                  style={{
                    background: "var(--color-primary-chip-bg)",
                    color: color,
                    border: "1px solid var(--color-primary-chip-border)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {extGame.external_game_source}
                  <BrandIcon size={12} />
                </Text>
              ) : (
                <Text
                  component="span"
                  key={extGame.id}
                  size="xs"
                  fw={500}
                  style={{
                    background: "var(--color-background-100)",
                    color: "var(--color-text-700)",
                    border: "1px solid var(--color-background-300)",
                    borderRadius: 6,
                    padding: "2px 8px",
                  }}
                >
                  {extGame.external_game_source}
                </Text>
              );
            })}
            {hasMoreExternalGames && (
              <Text
                component="button"
                onClick={() => setShowAllExternalLinks(prev => !prev)}
                size="xs"
                fw={500}
                style={{
                  background: "transparent",
                  color: "var(--mantine-color-primary-7)",
                  border: "none",
                  padding: "2px 4px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "inline-block",
                  outline: "none",
                }}
              >
                {showAllExternalLinks
                  ? t("externalLinks.showLess")
                  : t("externalLinks.more", { count: externalGames.length - 4 })}
              </Text>
            )}
          </>
        ) : (
          <Text size="sm" c="var(--color-text-900)">
            ---
          </Text>
        )}
      </Group>
    </Stack>
  );
}
