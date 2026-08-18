import { Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game, GameEngine, GameMode, Genre, Platform, PlayerPerspective } from "@/client";
import { useLanguageStore } from "@/lib/languageStore";
import { formatDisplayDate } from "@/utils/dateUtils";

import { ExternalLinksSection } from "./ExternalLinksSection";

interface GameInformationProps {
  gameDetails?: Game;
}

function GameInfoRow({
  label,
  value,
  children,
}: Readonly<{
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}>) {
  return (
    <Group justify="space-between" align="flex-start" gap="md">
      <Text size="sm" fw={500} c="var(--color-text-600)" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" ta="right" c="var(--color-text-900)" style={{ flex: 1, wordBreak: "break-all" }}>
        {children ?? value ?? "---"}
      </Text>
    </Group>
  );
}

function GameTags<T>({
  title,
  items,
  renderItem,
}: Readonly<{
  title: string;
  items?: T[];
  renderItem: (item: T) => React.ReactNode;
}>) {
  return (
    <Stack gap={4}>
      <Text size="sm" fw={500} c="var(--color-text-600)">
        {title}
      </Text>
      <Group gap={8} wrap="wrap">
        {items && items.length > 0 ? (
          items.map(item => renderItem(item))
        ) : (
          <Text size="sm" c="var(--color-text-900)">
            ---
          </Text>
        )}
      </Group>
    </Stack>
  );
}

function IgdbLink({ id, slug }: Readonly<{ id: string; slug: string }>) {
  return (
    <a href={`https://www.igdb.com/games/${slug}`} target="_blank" rel="noopener noreferrer">
      {id}
    </a>
  );
}

export default function GameInformation({ gameDetails }: Readonly<GameInformationProps>) {
  const { t } = useTranslation("games");
  const language = useLanguageStore(state => state.language);
  const externalGames = gameDetails?.external_games || [];
  return (
    <Box
      style={{
        background: "white",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid var(--color-background-200)",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          background: "var(--color-background-50)",
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-background-200)",
        }}
      >
        <Text fw={600} c="var(--color-text-900)">
          {t("info.title")}
        </Text>
      </Box>
      <Stack gap={12} p="md">
        <GameInfoRow label={t("info.igdbId")}>
          <IgdbLink id={gameDetails?.id.toString() || ""} slug={gameDetails?.slug || ""} />
        </GameInfoRow>
        {language === "pl" && gameDetails?.title_en && (
          <GameInfoRow label={t("info.titleEn")} value={gameDetails.title_en} />
        )}
        <GameInfoRow
          label={t("info.releaseDate")}
          value={formatDisplayDate(gameDetails?.release_date) ?? undefined}
        />
        <GameInfoRow label={t("info.gameStatus")} value={gameDetails?.game_status?.status || t("info.released")} />
        <GameInfoRow label={t("info.gameType")} value={gameDetails?.game_type?.type} />
        <GameInfoRow label={t("info.publisher")}>
          {gameDetails?.publisher ? (
            <Link
              to={"/company/$id/$slug"}
              params={{ id: gameDetails.publisher.id.toString(), slug: gameDetails.publisher.slug || "" }}
              style={{ color: "var(--mantine-color-primary-6)", fontWeight: 600 }}
            >
              {gameDetails.publisher.name}
            </Link>
          ) : undefined}
        </GameInfoRow>
        <GameInfoRow label={t("info.developer")}>
          {gameDetails?.developer ? (
            <Link
              to={"/company/$id/$slug"}
              params={{ id: gameDetails.developer.id.toString(), slug: gameDetails.developer.slug || "" }}
              style={{ color: "var(--mantine-color-primary-6)", fontWeight: 600 }}
            >
              {gameDetails.developer.name}
            </Link>
          ) : undefined}
        </GameInfoRow>

        <GameTags
          title={t("info.genres")}
          items={gameDetails?.genres}
          renderItem={(genre: Genre) => (
            <Text
              component="span"
              key={genre.id}
              size="xs"
              fw={500}
              style={{
                background: "var(--mantine-color-primary-0)",
                color: "var(--mantine-color-primary-7)",
                border: "1px solid var(--mantine-color-primary-2)",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              {genre.name}
            </Text>
          )}
        />
        <GameTags
          title={t("info.platforms")}
          items={gameDetails?.platforms}
          renderItem={(platform: Platform) => (
            <Tooltip key={platform.id} label={platform.name}>
              <Text
                component="span"
                size="xs"
                fw={500}
                style={{
                  background: "var(--mantine-color-secondary-0, #fffbeb)",
                  color: "var(--mantine-color-secondary-7, #92400e)",
                  border: "1px solid var(--mantine-color-secondary-2, #fde68a)",
                  borderRadius: 6,
                  padding: "2px 8px",
                }}
              >
                {platform.abbreviation === "" ? platform.name : platform.abbreviation}
              </Text>
            </Tooltip>
          )}
        />
        <GameTags
          title={t("info.engines")}
          items={gameDetails?.game_engines}
          renderItem={(engine: GameEngine) => (
            <Text
              component="span"
              key={engine.id}
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
              {engine.name}
            </Text>
          )}
        />
        <GameTags
          title={t("info.gameModes")}
          items={gameDetails?.game_modes}
          renderItem={(mode: GameMode) => (
            <Text
              component="span"
              key={mode.id}
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
              {mode.name}
            </Text>
          )}
        />
        <GameTags
          title={t("info.playerPerspectives")}
          items={gameDetails?.player_perspectives}
          renderItem={(perspective: PlayerPerspective) => (
            <Text
              component="span"
              key={perspective.id}
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
              {perspective.name}
            </Text>
          )}
        />

        <ExternalLinksSection externalGames={externalGames} />
      </Stack>
    </Box>
  );
}
