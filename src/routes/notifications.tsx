import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/features/notifications";
import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";

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
