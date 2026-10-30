import { redirect } from "@tanstack/react-router";

import { resolveAuthGuardOutcome } from "@/features/auth/utils/authGuard";
import { getCurrentUser } from "@/features/users/api/user";
import { waitForSession } from "@/lib/keycloak";
import { userKeys } from "@/lib/queryKeys";
import type { MyRouterContext } from "@/routes/__root";

import { useAuthStore } from "../store/authStore";

interface RequireStaffArgs {
  context: MyRouterContext;
  location: { href: string };
}

/**
 * Route guard for `beforeLoad`: redirects home, in-app, whether signed out or signed in but not staff.
 * Never triggers a Keycloak redirect on its own - that only happens when the user clicks an
 * actual login control.
 */
export async function requireStaff({ context, location }: Readonly<RequireStaffArgs>): Promise<void> {
  // Routes render before the session check finishes, so wait for it instead of trusting a stale context.
  await waitForSession();
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (resolveAuthGuardOutcome({ isAuthenticated }, "authenticated") === "require-login") {
    throw redirect({ to: "/", search: { login: "required", redirect: location.href } });
  }

  const currentUser = await context.queryClient
    .query({ staleTime: "static", queryKey: userKeys.me(), queryFn: getCurrentUser })
    .catch(() => null);

  const outcome = resolveAuthGuardOutcome({ isAuthenticated, isStaff: !!currentUser?.is_staff }, "staff");
  if (outcome === "forbidden") {
    throw redirect({ to: "/" });
  }
}
