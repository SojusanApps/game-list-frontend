import {
  Box,
  Group,
  ActionIcon,
  Title,
  SegmentedControl,
  Text,
  Loader,
  Center,
  Stack,
  Button,
  ScrollArea,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import * as React from "react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import ItemOverlay from "@/components/ui/ItemOverlay";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { useLanguageStore } from "@/lib/languageStore";
import { cn } from "@/utils/cn";

import { useGetReleaseCalendar } from "../../hooks/gameQueries";
import {
  getStartOfMonth,
  getEndOfMonth,
  addDays,
  addMonths,
  formatISODate,
  getCalendarGridDays,
  getWeekGridDays,
} from "../../utils/calendarUtils";
import DayDetailModal from "./DayDetailModal";

import styles from "./CalendarView.module.css";

export default function CalendarView(): React.JSX.Element {
  const { t } = useTranslation("games");
  const { language } = useLanguageStore();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const [selectedDayObj, setSelectedDayObj] = useState<{ opened: boolean; dateStr: string }>({
    opened: false,
    dateStr: "",
  });

  const { startDate, endDate, daysGrid } = useMemo(() => {
    let grid: Date[];
    let start: Date;
    let end: Date;

    if (viewMode === "month") {
      start = getStartOfMonth(currentDate);
      end = getEndOfMonth(currentDate);
      grid = getCalendarGridDays(start.getFullYear(), start.getMonth());
    } else {
      grid = getWeekGridDays(currentDate);
      start = grid[0];
      end = grid.at(-1)!;
    }

    return {
      startDate: formatISODate(start),
      endDate: formatISODate(end),
      daysGrid: grid,
    };
  }, [viewMode, currentDate]);

  const {
    data: items,
    isLoading,
    isError,
  } = useGetReleaseCalendar({
    start_date: startDate,
    end_date: endDate,
  });

  const gamesByDate = useMemo(() => {
    const map = new Map<string, GameSimpleList[]>();

    if (!items || items.length === 0) {
      return map;
    }

    for (const game of items) {
      if (!game.release_date) {
        continue;
      }
      // Expecting release_date to be at least YYYY-MM-DD
      const dStr = game.release_date.split("T")[0];
      if (!map.has(dStr)) {
        map.set(dStr, []);
      }
      map.get(dStr)?.push(game);
    }
    return map;
  }, [items]);

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, -1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const currentMonthName = currentDate.toLocaleString(language, { month: "long" });
  const currentYear = currentDate.getFullYear();

  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return `${currentMonthName} ${currentYear}`;
    }
    const startObj = daysGrid[0];
    const endObj = daysGrid.at(-1);
    if (!startObj || !endObj) {
      return "";
    }
    return `${startObj.toLocaleString(language, { month: "short" })} ${startObj.getDate()} - ${endObj.toLocaleString(language, { month: "short" })} ${endObj.getDate()}, ${currentYear}`;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center py="xl" style={{ minHeight: "400px" }}>
          <Loader size="lg" variant="dots" />
        </Center>
      );
    }
    if (isError) {
      return (
        <Center py="xl" style={{ minHeight: "400px" }}>
          <Text c="red" fw={500}>
            {t("calendar.loadError")}
          </Text>
        </Center>
      );
    }

    const isWeekView = viewMode === "week";
    const maxVisible = 2;

    return (
      <ScrollArea className={styles.calendarGridWrapper} scrollbars="x">
        <Box className={styles.calendarGridInner}>
          <Box className={styles.calendarGridHeader}>
            {[
              t("calendar.weekMon"),
              t("calendar.weekTue"),
              t("calendar.weekWed"),
              t("calendar.weekThu"),
              t("calendar.weekFri"),
              t("calendar.weekSat"),
              t("calendar.weekSun"),
            ].map((day, idx) => (
              <Text
                key={day}
                fw={700}
                ta="center"
                c="dimmed"
                size="sm"
                tt="uppercase"
                className={idx >= 5 ? styles.weekend : undefined}
              >
                {day}
              </Text>
            ))}
          </Box>
          <Box className={styles.calendarGrid} data-view={viewMode}>
            {daysGrid.map(dayObj => {
              const dStr = formatISODate(dayObj);
              const games = gamesByDate.get(dStr) || [];
              const isToday = formatISODate(new Date()) === dStr;
              const isCurrentMonth = dayObj.getMonth() === currentDate.getMonth();

              return (
                <Box
                  key={dStr}
                  className={cn(
                    styles.dayCell,
                    !isCurrentMonth && !isWeekView && styles.dayCellOut,
                    isToday && styles.dayCellToday,
                  )}
                >
                  <Box className={styles.dayHeader}>
                    <Text size="sm" fw={700} className={[0, 6].includes(dayObj.getDay()) ? styles.weekend : undefined}>
                      {dayObj.getDate()}
                    </Text>
                  </Box>
                  <Box className={styles.gameList} mt={8}>
                    {games.slice(0, maxVisible).map(game => (
                      <ItemOverlay
                        key={game.id}
                        itemPageUrl={`/game/${game.id}/${game.slug}`}
                        itemCoverUrl={
                          game.cover_image_id
                            ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
                            : undefined
                        }
                        name={game.title}
                        status={undefined}
                        rating={undefined}
                        releaseDate={game.release_date}
                        className={styles.overlayItem}
                      />
                    ))}
                    {games.length > maxVisible && (
                      <Text size="xs" ta="center" c="dimmed" mt={4}>
                        {t("calendar.moreGames")}
                      </Text>
                    )}
                  </Box>

                  {games.length > 0 && (
                    <Button
                      className={styles.seeAllButton}
                      onClick={() => setSelectedDayObj({ opened: true, dateStr: dStr })}
                    >
                      {t("calendar.seeAll")}
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </ScrollArea>
    );
  };

  return (
    <Stack gap={24} className={styles.calendarContainer}>
      <Group justify="space-between" align="center" wrap="wrap" gap={12}>
        <Group gap={8}>
          <ActionIcon variant="default" size="lg" radius="md" onClick={handlePrev}>
            <IconChevronLeft size={20} />
          </ActionIcon>
          <Title order={3} w={{ base: 180, sm: 240 }} fz={{ base: "md", sm: "lg" }} ta="center" fw={800}>
            {getHeaderTitle()}
          </Title>
          <ActionIcon variant="default" size="lg" radius="md" onClick={handleNext}>
            <IconChevronRight size={20} />
          </ActionIcon>
          <Button variant="light" size="sm" radius="md" onClick={() => setCurrentDate(new Date())}>
            {t("calendar.today")}
          </Button>
        </Group>

        <SegmentedControl
          size="md"
          radius="md"
          value={viewMode}
          onChange={val => setViewMode(val)}
          w={{ base: "100%", sm: "auto" }}
          data={[
            { label: t("calendar.month"), value: "month" },
            { label: t("calendar.week"), value: "week" },
          ]}
        />
      </Group>

      {renderContent()}

      {selectedDayObj.opened && (
        <DayDetailModal
          opened={selectedDayObj.opened}
          onClose={() => setSelectedDayObj({ ...selectedDayObj, opened: false })}
          dateStr={selectedDayObj.dateStr}
        />
      )}
    </Stack>
  );
}
