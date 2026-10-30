import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { HomePage } from "@/features/games";

// Set by gated routes: opens the sign-in prompt and says where to return to after signing in.
const searchSchema = z.object({
  login: z.literal("required").optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  component: HomePage,
});
