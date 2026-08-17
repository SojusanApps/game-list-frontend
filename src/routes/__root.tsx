import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import React from "react";

import Layout from "@/components/layout/Layout";
import { PageMeta } from "@/components/ui/PageMeta";
import { AuthContextType } from "@/features/auth/context/AuthProvider";
import { NotFound } from "@/features/misc";

export interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <HelmetProvider>
      <PageMeta />
      <Layout />
    </HelmetProvider>
  ),
  notFoundComponent: NotFound,
});
