import { createFileRoute } from "@tanstack/react-router";

import { AdminTranslationSuggestionsPage } from "@/features/admin";
import { requireStaff } from "@/features/auth";

export const Route = createFileRoute("/admin_/translation-suggestions")({
  beforeLoad: requireStaff,
  component: AdminTranslationSuggestionsPage,
});
