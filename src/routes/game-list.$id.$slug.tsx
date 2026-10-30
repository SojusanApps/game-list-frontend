import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { GameListStatusEnum } from "@/client";
import { GameListPage } from "@/features/games";
import { GAME_LIST_ORDERING_VALUES } from "@/features/games/utils/gameListOrdering";
import { getUserDetails } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";
import { lenientSearch } from "@/lib/searchSchema";
import { slugSchema, idSchema } from "@/lib/validation";
import { rethrowAsNotFound } from "@/utils/routeUtils";

const stringList = z.array(z.string());

// Status, title search, sort, filters and page are all part of the URL, so Back and shared links restore them.
const searchSchema = z.object({
  status: z.enum(GameListStatusEnum).optional(),
  q: z.string().optional(),
  page: z.number().int().positive().optional(),
  ordering: z.enum(GAME_LIST_ORDERING_VALUES).optional(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  platforms: stringList.optional(),
  genres: stringList.optional(),
  game_engines: stringList.optional(),
  game_modes: stringList.optional(),
  game_status: stringList.optional(),
  game_type: stringList.optional(),
  player_perspectives: stringList.optional(),
  release_date_after: z.string().optional(),
  release_date_before: z.string().optional(),
});

export const Route = createFileRoute("/game-list/$id/$slug")({
  validateSearch: lenientSearch(searchSchema),
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
        queryKey: userKeys.detail(Number(params.id)),
        queryFn: () => getUserDetails(Number(params.id)),
      });
    } catch (error) {
      rethrowAsNotFound(error);
    }
  },
  component: GameListPage,
});
