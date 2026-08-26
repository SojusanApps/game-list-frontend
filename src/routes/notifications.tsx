import { createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { NotificationsPage } from "@/features/notifications";

export const Route = createFileRoute("/notifications")({
  beforeLoad: ({ context }) => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: context.auth.isAuthenticated }, "authenticated");
    if (outcome === "require-login") {
      throw redirect({ to: "/" });
    }
  },
  component: NotificationsPage,
});
