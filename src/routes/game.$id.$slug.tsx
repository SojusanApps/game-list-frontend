import { createFileRoute, notFound } from "@tanstack/react-router";

import { GameDetailPage } from "@/features/games";
import { getGamesDetail } from "@/features/games/api/game";
import { gameKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";

export const Route = createFileRoute("/game/$id/$slug")({
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
  component: GameDetailPage,
});
