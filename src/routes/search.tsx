import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { SearchEnginePage } from "@/features/games";

const ORDERING_OPTIONS = [
  "-created_at",
  "created_at",
  "-rank_position",
  "rank_position",
  "-popularity",
  "popularity",
] as const;

const searchSchema = z.object({
  // Zod's `.catch()` fallback-value method, not a Promise; there is no actual await to hoist here.
  // oxlint-disable-next-line unicorn/prefer-top-level-await
  category: z.enum(["games", "companies", "users"]).optional().catch("games"), // NOSONAR
  q: z.string().optional(),
  release_date_after: z.string().optional(),
  release_date_before: z.string().optional(),
  publisher: z.string().optional(),
  developer: z.string().optional(),
  platforms: z.string().array().optional(),
  genres: z.string().array().optional(),
  game_engines: z.string().array().optional(),
  game_modes: z.string().array().optional(),
  game_status: z.string().array().optional(),
  game_type: z.string().array().optional(),
  player_perspectives: z.string().array().optional(),
  ordering: z.enum(ORDERING_OPTIONS).optional().or(z.literal("")),
  // Present only while the results are shown as a paginated table; dropped in infinite-scroll mode.
  // oxlint-disable-next-line unicorn/prefer-top-level-await -- Zod's `.catch()` fallback, not a Promise.
  page: z.number().int().positive().optional().catch(1), // NOSONAR
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  component: SearchEnginePage,
});
