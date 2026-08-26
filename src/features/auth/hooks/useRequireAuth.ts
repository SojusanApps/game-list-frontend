import { useCallback } from "react";

import { useAuthStore } from "../store/authStore";
import { useLoginPromptStore } from "../store/loginPromptStore";

/**
 * Gates a gated action behind the login-required modal instead of performing it or redirecting
 * to Keycloak - see the "Gated action" entry in CONTEXT.md and ADR 0004.
 */
export function useRequireAuth(): (action: () => void) => void {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openLoginPrompt = useLoginPromptStore(state => state.open);

  return useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
      } else {
        openLoginPrompt();
      }
    },
    [isAuthenticated, openLoginPrompt],
  );
}
