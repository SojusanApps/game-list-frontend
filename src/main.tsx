import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TableDevtoolsPanel } from "@tanstack/react-table-devtools";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dates/styles.css";
import "./index.css";
import React from "react";

import "./lib/i18n";
import "./lib/appThemeStore";
import "dayjs/locale/pl";
import ReactDOM from "react-dom/client";

import App, { router } from "./App";
import clientSetup from "./clientSetup";
import { theme } from "./theme/theme";
import { ApiError } from "./utils/apiUtils";

clientSetup();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry if it's a 4xx or 5xx error
        if (error instanceof Response || error instanceof ApiError) {
          return error.status >= 400 ? false : failureCount < 3;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});
const colorSchemeManager = localStorageColorSchemeManager({ key: "colorScheme" });

const rootElement = document.querySelector("#root") as HTMLElement;
if (!rootElement) {
  throw new Error("Failed to find root element");
}
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto" colorSchemeManager={colorSchemeManager}>
      <Notifications position="bottom-right" autoClose={4000} />
      <QueryClientProvider client={queryClient}>
        <App />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel router={router} />,
            },
            {
              name: "TanStack Table",
              render: <TableDevtoolsPanel />,
            },
          ]}
        />
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
