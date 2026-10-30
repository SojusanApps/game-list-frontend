import { useCallback } from "react";

import { useAuthStore } from "../store/authStore";
import { type LoginReason, useLoginPromptStore } from "../store/loginPromptStore";

/**
 * Gates a gated action behind the login-required modal instead of performing it or redirecting
 * to Keycloak - see the "Gated action" entry in CONTEXT.md and ADR 0004. The optional `reason`
 * tells the prompt which action the user was trying to do. The action is not resumed after sign-in.
 */
export function useRequireAuth(): (action: () => void, reason?: LoginReason) => void {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openLoginPrompt = useLoginPromptStore(state => state.open);

  return useCallback(
    (action: () => void, reason?: LoginReason) => {
      if (isAuthenticated) {
        action();
      } else {
        openLoginPrompt({ reason });
      }
    },
    [isAuthenticated, openLoginPrompt],
  );
}
