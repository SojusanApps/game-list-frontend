import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { DatesProvider } from "@mantine/dates";
import { useQueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";

import "./index.css";
import { PageMeta } from "./components/ui/PageMeta";
import { useAuth, SessionGate } from "./features/auth";
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

  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

function App(): React.JSX.Element {
  const { language } = useLanguageStore();
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
