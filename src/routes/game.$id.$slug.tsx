import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { GameDetailPage } from "@/features/games";
import { getGamesDetail } from "@/features/games/api/game";
import { gameKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";
import { rethrowAsNotFound } from "@/utils/routeUtils";

const searchSchema = z.object({
  // Zod's `.catch()` fallback-value method, not a Promise; there is no actual await to hoist here.
  // oxlint-disable-next-line unicorn/prefer-top-level-await
  tab: z.enum(["main", "related", "screenshots"]).optional().catch("main"), // NOSONAR
});

export const Route = createFileRoute("/game/$id/$slug")({
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
      await queryClient.query({
        staleTime: "static",
        queryKey: gameKeys.detail(Number(params.id)),
        queryFn: () => getGamesDetail(Number(params.id)),
      });
    } catch (error) {
      rethrowAsNotFound(error);
    }
  },
  component: GameDetailPage,
});
