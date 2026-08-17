import Keycloak from "keycloak-js";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/store/authStore";

export const keycloak = new Keycloak({
  url: env.VITE_KEYCLOAK_URL,
  realm: env.VITE_KEYCLOAK_REALM,
  clientId: env.VITE_KEYCLOAK_CLIENT_ID,
});

keycloak.onAuthSuccess = () => useAuthStore.getState().setAuthenticated(true);
keycloak.onAuthRefreshSuccess = () => useAuthStore.getState().setAuthenticated(true);
keycloak.onAuthLogout = () => useAuthStore.getState().setAuthenticated(false);
keycloak.onAuthRefreshError = () => useAuthStore.getState().setAuthenticated(false);

let initPromise: Promise<void> | null = null;

/** Idempotent: safe to call more than once (e.g. React StrictMode's double-invoked effects). */
export function initKeycloak(): Promise<void> {
  initPromise ??= keycloak
    .init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: `${globalThis.location.origin}/silent-check-sso.html`,
      pkceMethod: "S256",
    })
    .then(authenticated => {
      useAuthStore.getState().setAuthenticated(authenticated);
    });
  return initPromise;
}
