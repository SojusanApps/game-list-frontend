import { createFileRoute } from "@tanstack/react-router";

import { ReleaseCalendarPage } from "@/features/games";

export const Route = createFileRoute("/release-calendar")({
  component: ReleaseCalendarPage,
});
