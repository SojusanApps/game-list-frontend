import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { requireSignedIn } from "@/features/auth/utils/loginRedirect";
import { NotificationsPage } from "@/features/notifications";
import { lenientSearch } from "@/lib/searchSchema";

// Filters and page are part of the URL, so Back and shared links restore them.
const searchSchema = z.object({
  unread: z.enum(["unread", "read"]).optional(),
  category: z.enum(["system", "friendship", "game_release", "translation"]).optional(),
  level: z.enum(["info", "success", "warning", "error"]).optional(),
  page: z.number().int().positive().optional(),
});

export const Route = createFileRoute("/notifications")({
  validateSearch: lenientSearch(searchSchema),
  beforeLoad: ({ location }) => requireSignedIn(location),
  component: NotificationsPage,
});
