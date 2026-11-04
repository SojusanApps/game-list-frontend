import { createFileRoute } from "@tanstack/react-router";

import { AdminPage } from "@/features/admin";
import { requireStaff } from "@/features/auth";

export const Route = createFileRoute("/admin-panel")({
  beforeLoad: requireStaff,
  component: AdminPage,
});
