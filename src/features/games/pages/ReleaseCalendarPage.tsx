import { Box, Stack, SegmentedControl } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell, PageTitle } from "@/components/ui/PageShell";
import { useUrlState } from "@/hooks/useUrlState";

import CalendarView from "../components/ReleaseCalendar/CalendarView";
import ListView from "../components/ReleaseCalendar/ListView";

export default function ReleaseCalendarPage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const { search, update } = useUrlState();
  const viewMode: "calendar" | "list" = search.view === "list" ? "list" : "calendar";
  const setViewMode = (next: string) => update({ view: next === "list" ? "list" : undefined });

  return (
    <>
      <PageMeta title={t("calendar.title")} />
      <PageShell width="wide">
        <Stack gap={24}>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <PageTitle>{t("calendar.title")}</PageTitle>
            <SegmentedControl
              value={viewMode}
              onChange={val => setViewMode(val)}
              data={[
                { label: t("calendar.calendarTab"), value: "calendar" },
                { label: t("calendar.listTab"), value: "list" },
              ]}
              w={{ base: "100%", sm: "auto" }}
            />
          </Box>

          {viewMode === "calendar" ? <CalendarView /> : <ListView />}
        </Stack>
      </PageShell>
    </>
  );
}
