import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/features/auth/utils/loginRedirect";
import { ImportPage } from "@/features/games";

export const Route = createFileRoute("/import")({
  beforeLoad: ({ location }) => requireSignedIn(location),
  component: ImportPage,
});
