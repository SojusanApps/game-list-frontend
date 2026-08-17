import { createFileRoute } from "@tanstack/react-router";

import { NotFound } from "@/features/misc";

export const Route = createFileRoute("/$")({
  component: NotFound,
});
