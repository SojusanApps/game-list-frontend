import { createFileRoute } from "@tanstack/react-router";

import { AdminReportsPage } from "@/features/admin";
import { requireStaff } from "@/features/auth";

export const Route = createFileRoute("/admin_/reports")({
  beforeLoad: requireStaff,
  component: AdminReportsPage,
});
