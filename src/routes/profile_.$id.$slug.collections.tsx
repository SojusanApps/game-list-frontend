import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import CollectionsPage from "@/features/collections/pages/CollectionsPage";
import { getUserDetails } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";
import { lenientSearch } from "@/lib/searchSchema";
import { slugSchema, idSchema } from "@/lib/validation";
import { rethrowAsNotFound } from "@/utils/routeUtils";

// Filters, scope and page are part of the URL, so Back and shared links restore them.
const searchSchema = z.object({
  favorites: z.literal(true).optional(),
  shared: z.literal(true).optional(),
  visibility: z.enum(["PUB", "FRI", "PRI"]).optional(),
  mode: z.enum(["S", "C"]).optional(),
  type: z.enum(["NOR", "RNK", "TIE"]).optional(),
  name: z.string().optional(),
  page: z.number().int().positive().optional(),
});

export const Route = createFileRoute("/profile_/$id/$slug/collections")({
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
  component: CollectionsPage,
});
