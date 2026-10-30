import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { getCollectionDetail } from "@/features/collections/api/collection";
import CollectionPage from "@/features/collections/pages/CollectionPage";
import { collectionKeys } from "@/lib/queryKeys";
import { lenientSearch } from "@/lib/searchSchema";
import { idSchema, slugSchema } from "@/lib/validation";
import { rethrowAsNotFound } from "@/utils/routeUtils";

const searchSchema = z.object({ page: z.number().int().positive().optional() });

export const Route = createFileRoute("/collection/$id/$slug")({
  validateSearch: lenientSearch(searchSchema),
  beforeLoad: ({ params }) => {
    const parsedId = idSchema.safeParse(params.id);
    const parsedSlug = slugSchema.safeParse(params.slug);
    if (!parsedId.success || !parsedSlug.success) {
      throw notFound();
    }
  },
  loader: async ({ context: { queryClient }, params }) => {
    try {
      await queryClient.query({
        staleTime: "static",
        queryKey: collectionKeys.detail(Number(params.id)),
        queryFn: () => getCollectionDetail(Number(params.id)),
      });
    } catch (error) {
      rethrowAsNotFound(error);
    }
  },
  component: CollectionPage,
});
