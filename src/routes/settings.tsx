import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/features/auth/utils/loginRedirect";
import { UserSettingsPage } from "@/features/users";

export const Route = createFileRoute("/settings")({
  beforeLoad: ({ location }) => requireSignedIn(location),
  component: UserSettingsPage,
});
