import { createFileRoute, notFound } from "@tanstack/react-router";

import { UserProfilePage } from "@/features/users";
import { getUserDetails } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";

export const Route = createFileRoute("/profile/$id/$slug")({
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
  component: UserProfilePage,
});
