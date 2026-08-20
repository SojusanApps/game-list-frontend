import { createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { ImportPage } from "@/features/games";

export const Route = createFileRoute("/import")({
  beforeLoad: ({ context }) => {
    const outcome = resolveAuthGuardOutcome({ isAuthenticated: context.auth.isAuthenticated }, "authenticated");
    if (outcome === "require-login") {
      throw redirect({ to: "/" });
    }
  },
  component: ImportPage,
});
