import { createFileRoute, notFound } from "@tanstack/react-router";

import CollectionsPage from "@/features/collections/pages/CollectionsPage";
import { getUserDetails } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";

export const Route = createFileRoute("/profile_/$id/$slug/collections")({
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
        queryKey: userKeys.detail(Number(params.id)),
        queryFn: () => getUserDetails(Number(params.id)),
      });
    } catch {
      throw notFound();
    }
  },
  component: CollectionsPage,
});
