import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { UserFriendsPage } from "@/features/users";
import { getUserDetails } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";
import { lenientSearch } from "@/lib/searchSchema";
import { slugSchema, idSchema } from "@/lib/validation";
import { rethrowAsNotFound } from "@/utils/routeUtils";

const searchSchema = z.object({ page: z.number().int().positive().optional() });

export const Route = createFileRoute("/profile_/$id/$slug/friends")({
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
  component: UserFriendsPage,
});
