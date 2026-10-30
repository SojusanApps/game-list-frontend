import { Box, Group, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { Button } from "@/components/ui/Button";
import ItemOverlay from "@/components/ui/ItemOverlay";

import { formatISODate } from "../../utils/calendarUtils";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";

interface AgendaViewProps {
  days: Date[];
  gamesByDate: Map<string, GameSimpleList[]>;
  language: string;
  onSeeAll: (dateStr: string) => void;
  /** In month view only days of the viewed month are listed. */
  isInPeriod: (day: Date) => boolean;
}

const COVERS_PER_DAY = 3;

/** Phone layout of the release calendar: one row per day with releases instead of a seven-column grid. */
export function AgendaView({ days, gamesByDate, language, onSeeAll, isInPeriod }: Readonly<AgendaViewProps>) {
  const { t } = useTranslation("games");
  const visibleDays = days.filter(day => isInPeriod(day) && (gamesByDate.get(formatISODate(day))?.length ?? 0) > 0);

  if (visibleDays.length === 0) {
    return (
      <Text ta="center" c="dimmed" py={32}>
        {t("calendar.agendaEmpty")}
      </Text>
    );
  }

  return (
    <Stack gap={20}>
      {visibleDays.map(day => {
        const dateStr = formatISODate(day);
        const games = gamesByDate.get(dateStr) ?? [];
        return (
          <Stack key={dateStr} gap={8} component="section" aria-label={dateStr}>
            <Text fw={700} fz="md" c="var(--color-text-900)">
              {day.toLocaleDateString(language, { weekday: "long", day: "numeric", month: "long" })}
            </Text>
            <Group gap={8} wrap="nowrap" align="flex-start">
              {games.slice(0, COVERS_PER_DAY).map(game => (
                <Box key={game.id} style={{ flex: 1, minWidth: 0, maxWidth: 140 }}>
                  <ItemOverlay
                    itemPageUrl={`/game/${game.id}/${game.slug}`}
                    itemCoverUrl={
                      game.cover_image_id
                        ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
                        : undefined
                    }
                    name={game.title}
                    releaseDate={game.release_date}
                  />
                </Box>
              ))}
            </Group>
            {games.length > COVERS_PER_DAY && (
              <Button variant="outline" size="sm" onClick={() => onSeeAll(dateStr)}>
                {t("calendar.agendaSeeAll", { count: games.length })}
              </Button>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}
