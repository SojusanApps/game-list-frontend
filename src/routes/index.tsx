import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/features/games";

export const Route = createFileRoute("/")({
  component: HomePage,
});
