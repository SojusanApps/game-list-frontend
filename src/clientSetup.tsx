import { client } from "./client/client.gen";
import { env } from "./config/env";
import { keycloak } from "./lib/keycloak";
import { useLanguageStore } from "./lib/languageStore";

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = new Request(input, init);

  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30);
    } catch {
      // Refresh failed (e.g. Keycloak session expired) - proceed without a token;
      // a request that required auth will 401, same as an anonymous caller.
    }
    if (keycloak.token) {
      request.headers.set("Authorization", `Bearer ${keycloak.token}`);
    }
  }
  request.headers.set("Accept-Language", useLanguageStore.getState().language);

  return fetch(request);
};

export default function clientSetup() {
  client.setConfig({
    baseUrl: env.VITE_API_URL,
    fetch: customFetch,
  });
}
