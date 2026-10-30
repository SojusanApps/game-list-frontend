import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ReleaseCalendarPage } from "@/features/games";
import { lenientSearch } from "@/lib/searchSchema";

// View, week/month span and the viewed date are part of the URL, so Back and shared links restore them.
const searchSchema = z.object({
  view: z.literal("list").optional(),
  span: z.literal("month").optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const Route = createFileRoute("/release-calendar")({
  validateSearch: lenientSearch(searchSchema),
  component: ReleaseCalendarPage,
});
