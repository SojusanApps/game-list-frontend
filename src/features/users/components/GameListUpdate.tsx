import { Group, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameList, GameListStatusEnum } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { getStatusConfig } from "@/features/games/utils/statusConfig";
import { formatDisplayDate } from "@/utils/dateUtils";

interface GameListUpdateProps {
  latestGameListUpdate: GameList;
}

export default function GameListUpdate({ latestGameListUpdate }: Readonly<GameListUpdateProps>) {
  const statusKey = latestGameListUpdate.status_code as GameListStatusEnum;
  const config = getStatusConfig(statusKey);
  const { t } = useTranslation("users");

  return (
    <Group
      gap={16}
      align="center"
      style={{
        padding: 12,
        borderRadius: 12,
        border: "1px solid var(--color-background-200)",
        background: "var(--color-background-50)",
      }}
    >
      <Link
        to="/game/$id/$slug"
        params={{ id: String(latestGameListUpdate.game_id), slug: latestGameListUpdate.game_slug }}
        style={{ flexShrink: 0, display: "block", borderRadius: 8, overflow: "hidden" }}
      >
        <SafeImage
          style={{ width: 48, height: 72, objectFit: "cover", display: "block" }}
          src={
            latestGameListUpdate.game_cover_image
              ? `${getIGDBImageURL(latestGameListUpdate.game_cover_image, IGDBImageSize.THUMB_90_90)}`
              : undefined
          }
          alt={`game cover ${latestGameListUpdate.id}`}
        />
      </Link>

      <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
        <Group justify="space-between" align="flex-start" gap={8}>
          <Text
            fw={700}
            size="sm"
            c="var(--color-text-900)"
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}
          >
            {latestGameListUpdate.title}
          </Text>
          <Text
            component="span"
            size="xs"
            c="var(--color-text-400)"
            style={{ whiteSpace: "nowrap", flexShrink: 0, opacity: 0.7 }}
          >
            {formatDisplayDate(latestGameListUpdate?.last_modified_at)}
          </Text>
        </Group>

        <Group gap={16} mt={4}>
          <Group
            gap={6}
            style={{
              padding: "2px 8px",
              borderRadius: 9999,
              border: "1px solid",
              ...(config?.badgeStyle ?? {
                background: "var(--color-background-100)",
                color: "var(--color-text-600)",
                borderColor: "var(--color-background-200)",
              }),
            }}
          >
            <Text component="span" size="sm">
              {config?.emoji}
            </Text>
            <Text style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {latestGameListUpdate.status}
            </Text>
          </Group>

          {latestGameListUpdate.score && (
            <Group gap={4} style={{ borderLeft: "1px solid rgba(0,0,0,0.1)", paddingLeft: 16 }}>
              <Text
                component="span"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  opacity: 0.6,
                }}
              >
                {t("profile.score")}
              </Text>
              <Text component="span" size="xs" fw={900}>
                {latestGameListUpdate.score}
              </Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Group>
  );
}
