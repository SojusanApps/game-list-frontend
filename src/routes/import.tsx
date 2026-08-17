import { createFileRoute } from "@tanstack/react-router";
import { ImportPage } from "@/features/games";
import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";

export const Route = createFileRoute("/import")({
  beforeLoad: ({ context, location }) => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: context.auth.isAuthenticated }, "authenticated");
    if (outcome === "require-login") {
      context.auth.login(location.pathname);
      return new Promise<never>(() => {});
    }
  },
  component: ImportPage,
});
