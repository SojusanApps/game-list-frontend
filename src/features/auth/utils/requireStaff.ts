import { redirect } from "@tanstack/react-router";
import type { MyRouterContext } from "@/routes/__root";
import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { getCurrentUser } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";

interface RequireStaffArgs {
  context: MyRouterContext;
  location: { pathname: string };
}

/**
 * Route guard for `beforeLoad`: sends to Keycloak login (preserving the return path) when
 * signed out, or redirects home when signed in but not staff.
 */
export async function requireStaff({ context, location }: Readonly<RequireStaffArgs>): Promise<void> {
  const isAuthenticated = context.auth.isAuthenticated;

  if (resolveAuthGuardOutcome({ isAuthenticated }, "authenticated") === "require-login") {
    context.auth.login(location.pathname);
    // Keycloak's login redirect is a real browser navigation, not a router transition - never
    // resolve so the route's component doesn't flash while that navigation is in flight.
    await new Promise<never>(() => {});
    return;
  }

  const currentUser = await context.queryClient
    .ensureQueryData({ queryKey: userKeys.me(), queryFn: getCurrentUser })
    .catch(() => null);

  const outcome = resolveAuthGuardOutcome({ isAuthenticated, isStaff: !!currentUser?.is_staff }, "staff");
  if (outcome === "forbidden") {
    throw redirect({ to: "/" });
  }
}
