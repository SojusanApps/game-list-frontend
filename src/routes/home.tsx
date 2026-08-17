import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/features/games";
import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context, location }) => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: context.auth.isAuthenticated }, "authenticated");
    if (outcome === "require-login") {
      context.auth.login(location.pathname);
      return new Promise<never>(() => {});
    }
  },
  component: HomePage,
});
