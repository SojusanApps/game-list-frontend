import { Box, Stack, SegmentedControl, Title, Container } from "@mantine/core";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";

import CalendarView from "../components/ReleaseCalendar/CalendarView";
import ListView from "../components/ReleaseCalendar/ListView";

export default function ReleaseCalendarPage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  return (
    <>
      <PageMeta title={t("calendar.title")} />
      <Container size="xl" py="xl">
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
            <Title order={1}>{t("calendar.title")}</Title>
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
      </Container>
    </>
  );
}
