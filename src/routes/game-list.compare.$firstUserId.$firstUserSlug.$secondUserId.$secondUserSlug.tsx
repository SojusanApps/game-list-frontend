import { createFileRoute, notFound } from "@tanstack/react-router";

import { GameListComparePage } from "@/features/games";
import { getGameListCompare } from "@/features/games/api/game";
import { getUserDetails } from "@/features/users/api/user";
import { gameListKeys, userKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";

export const Route = createFileRoute("/game-list/compare/$firstUserId/$firstUserSlug/$secondUserId/$secondUserSlug")({
  beforeLoad: ({ params }) => {
    const parsedFirstUserId = idSchema.safeParse(params.firstUserId);
    const parsedFirstUserSlug = slugSchema.safeParse(params.firstUserSlug);
    const parsedSecondUserId = idSchema.safeParse(params.secondUserId);
    const parsedSecondUserSlug = slugSchema.safeParse(params.secondUserSlug);
    if (
      !parsedFirstUserId.success ||
      !parsedFirstUserSlug.success ||
      !parsedSecondUserId.success ||
      !parsedSecondUserSlug.success
    ) {
      throw notFound();
    }
  },
  loader: async ({ context: { queryClient }, params }) => {
    const firstUserId = Number(params.firstUserId);
    const secondUserId = Number(params.secondUserId);
    try {
      await Promise.all([
        queryClient.ensureQueryData({
          queryKey: userKeys.detail(firstUserId),
          queryFn: () => getUserDetails(firstUserId),
        }),
        queryClient.ensureQueryData({
          queryKey: userKeys.detail(secondUserId),
          queryFn: () => getUserDetails(secondUserId),
        }),
        queryClient.ensureQueryData({
          queryKey: gameListKeys.compare(firstUserId, secondUserId),
          queryFn: () => getGameListCompare(firstUserId, secondUserId),
        }),
      ]);
    } catch {
      throw notFound();
    }
  },
  component: GameListComparePage,
});
