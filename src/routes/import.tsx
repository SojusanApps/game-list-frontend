import { createFileRoute } from "@tanstack/react-router";

import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { ImportPage } from "@/features/games";

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
