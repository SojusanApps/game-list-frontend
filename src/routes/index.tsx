import { createFileRoute } from "@tanstack/react-router";

import { StartPage } from "@/features/misc";

export const Route = createFileRoute("/")({
  component: StartPage,
});
