import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import React from "react";

import Layout from "@/components/layout/Layout";
import { PageMeta } from "@/components/ui/PageMeta";
import { AuthContextType } from "@/features/auth/context/AuthProvider";
import { NotFound } from "@/features/misc";

export interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthContextType;
}

function RootMeta() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  return <PageMeta path={pathname} />;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <HelmetProvider>
      <RootMeta />
      <Layout />
    </HelmetProvider>
  ),
  notFoundComponent: NotFound,
});
