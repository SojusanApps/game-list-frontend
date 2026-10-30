import { createFileRoute } from "@tanstack/react-router";

import { AdminStoreMappingsPage } from "@/features/admin";
import { requireStaff } from "@/features/auth";

export const Route = createFileRoute("/admin_/store-mappings")({
  beforeLoad: requireStaff,
  component: AdminStoreMappingsPage,
});
