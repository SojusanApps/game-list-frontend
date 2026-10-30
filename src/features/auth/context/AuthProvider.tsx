import { notifications } from "@mantine/notifications";
import { useCallback, useMemo } from "react";

import i18n from "@/lib/i18n";
import { keycloak } from "@/lib/keycloak";
import { fireAndForget } from "@/utils/promiseUtils";

import { useAuthStore } from "../store/authStore";

function notifyLoginUnavailable(): void {
  notifications.show({ message: i18n.t("auth:sessionCheck.loginUnavailable"), color: "red" });
}

/**
 * `async` so that keycloak-js throwing synchronously (it has no adapter until the session check has
 * initialised) becomes a rejection like any other login failure.
 */
async function startLogin(redirectTo?: string): Promise<void> {
  await keycloak.login({ redirectUri: `${globalThis.location.origin}${redirectTo ?? globalThis.location.pathname}` });
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: () => void;
}

export function useAuth(): AuthContextType {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const login = useCallback((redirectTo?: string) => {
    startLogin(redirectTo).catch(notifyLoginUnavailable);
  }, []);

  const logout = useCallback(() => {
    fireAndForget(keycloak.logout({ redirectUri: globalThis.location.origin }));
  }, []);

  return useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);
}
