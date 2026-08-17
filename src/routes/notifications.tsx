import { createFileRoute } from "@tanstack/react-router";

import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { NotificationsPage } from "@/features/notifications";

export const Route = createFileRoute("/notifications")({
  beforeLoad: ({ context, location }) => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: context.auth.isAuthenticated }, "authenticated");
    if (outcome === "require-login") {
      context.auth.login(location.pathname);
      return new Promise<never>(() => {});
    }
  },
  component: NotificationsPage,
});
