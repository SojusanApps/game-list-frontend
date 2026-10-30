import { redirect } from "@tanstack/react-router";

import { waitForSession } from "@/lib/keycloak";

import { useAuthStore } from "../store/authStore";

/** `redirect` is only honoured when it is an in-app path; anything else (absolute or protocol-relative URLs) is dropped. */
export function sanitizeLoginRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

/**
 * For `beforeLoad`: waits for the session check, then sends signed-out visitors home with a search param that
 * opens the sign-in prompt (and returns them here afterwards). Never redirects to Keycloak on its own - ADR 0004.
 */
export async function requireSignedIn(location: Readonly<{ href: string }>): Promise<void> {
  await waitForSession();
  if (!useAuthStore.getState().isAuthenticated) {
    throw redirect({ to: "/", search: { login: "required", redirect: location.href } });
  }
}
