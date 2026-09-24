import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { getGamesDetail } from "@/features/games/api/game";
import GameReviewsPage from "@/features/games/pages/GameReviewsPage";
import { gameKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";

const searchSchema = z.object({
  // Absent means "the reader's default" (their UI language); an unknown value is dropped.
  // oxlint-disable-next-line unicorn/prefer-top-level-await -- Zod's `.catch()` fallback, not a Promise.
  language: z
    .enum(["en", "pl", "all"])
    .optional()
    .catch(() => void 0), // NOSONAR
});

export const Route = createFileRoute("/game_/$id/$slug/reviews")({
  validateSearch: searchSchema,
  beforeLoad: ({ params }) => {
    const parsedSlug = slugSchema.safeParse(params.slug);
    const parsedId = idSchema.safeParse(params.id);
    if (!parsedSlug.success || !parsedId.success) {
      throw notFound();
    }
  },
  loader: async ({ context: { queryClient }, params }) => {
    try {
      await queryClient.ensureQueryData({
        queryKey: gameKeys.detail(Number(params.id)),
        queryFn: () => getGamesDetail(Number(params.id)),
      });
    } catch {
      throw notFound();
    }
  },
  component: GameReviewsPage,
});
