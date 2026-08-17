import { createFileRoute } from "@tanstack/react-router";

import { UserSettingsPage } from "@/features/users";

export const Route = createFileRoute("/settings")({
  component: UserSettingsPage,
});
