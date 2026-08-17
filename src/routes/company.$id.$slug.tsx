import { createFileRoute, notFound } from "@tanstack/react-router";

import { CompanyDetailPage } from "@/features/games";
import { getCompanyDetail } from "@/features/games/api/game";
import { gameKeys } from "@/lib/queryKeys";
import { slugSchema, idSchema } from "@/lib/validation";

export const Route = createFileRoute("/company/$id/$slug")({
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
        queryKey: gameKeys.companyDetail(Number(params.id)),
        queryFn: () => getCompanyDetail(Number(params.id)),
      });
    } catch {
      throw notFound();
    }
  },
  component: CompanyDetailPage,
});
