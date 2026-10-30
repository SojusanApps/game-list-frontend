import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { DatesProvider } from "@mantine/dates";
import { useQueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";

import "./index.css";
import { PageMeta } from "./components/ui/PageMeta";
import { useAuth, SessionGate, LoginRequiredModal } from "./features/auth";
import { RouteError } from "./features/misc";
import { useLanguageStore } from "./lib/languageStore";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined!,
    auth: undefined!,
  },
  defaultPreload: "intent",
  defaultErrorComponent: RouteError,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  const queryClient = useQueryClient();

  return (
    <>
      <RouterProvider router={router} context={{ auth, queryClient }} />
      <LoginRequiredModal />
    </>
  );
}

function App(): React.JSX.Element {
  const { language } = useLanguageStore();
  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <HelmetProvider>
      <DatesProvider settings={{ locale: language }}>
        <PageMeta />
        <SessionGate>
          <InnerApp />
        </SessionGate>
      </DatesProvider>
    </HelmetProvider>
  );
}

export default App;
