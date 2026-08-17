import { useCallback, useMemo } from "react";

import { keycloak } from "@/lib/keycloak";

import { useAuthStore } from "../store/authStore";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: () => void;
}

export function useAuth(): AuthContextType {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const login = useCallback((redirectTo?: string) => {
    keycloak.login({ redirectUri: `${globalThis.location.origin}${redirectTo ?? globalThis.location.pathname}` });
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: globalThis.location.origin });
  }, []);

  return useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);
}
