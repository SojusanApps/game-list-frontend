import { redirect } from "@tanstack/react-router";

import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { getCurrentUser } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";
import type { MyRouterContext } from "@/routes/__root";

interface RequireStaffArgs {
  context: MyRouterContext;
}

/**
 * Route guard for `beforeLoad`: redirects home, in-app, whether signed out or signed in but not staff.
 * Never triggers a Keycloak redirect on its own - that only happens when the user clicks an
 * actual login control.
 */
export async function requireStaff({ context }: Readonly<RequireStaffArgs>): Promise<void> {
  const isAuthenticated = context.auth.isAuthenticated;

  if (resolveAuthGuardOutcome({ isAuthenticated }, "authenticated") === "require-login") {
    throw redirect({ to: "/" });
  }

  const currentUser = await context.queryClient
    .ensureQueryData({ queryKey: userKeys.me(), queryFn: getCurrentUser })
    .catch(() => null);

  const outcome = resolveAuthGuardOutcome({ isAuthenticated, isStaff: !!currentUser?.is_staff }, "staff");
  if (outcome === "forbidden") {
    throw redirect({ to: "/" });
  }
}
