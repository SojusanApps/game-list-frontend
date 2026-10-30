import { Box, Text, VisuallyHidden } from "@mantine/core";
import { Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import RouteProgress from "@/components/layout/RouteProgress";
import TopBar from "@/components/layout/TopBar";
import ScrollToTopButton from "@/components/ui/ScrollToTopButton";
import { useLoginPromptStore } from "@/features/auth/store/loginPromptStore";
import { sanitizeLoginRedirect } from "@/features/auth/utils/loginRedirect";
import { fireAndForget } from "@/utils/promiseUtils";

import styles from "./Layout.module.css";

const Layout = (): React.JSX.Element => {
  const { t } = useTranslation();
  const router = useRouter();
  const [announcement, setAnnouncement] = React.useState("");
  const search = useRouterState({ select: state => state.location.search }) as { login?: string; redirect?: string };
  const openLoginPrompt = useLoginPromptStore(state => state.open);

  // Gated routes send signed-out visitors home with ?login=required&redirect=…: explain and offer sign-in.
  React.useEffect(() => {
    if (search.login !== "required") return;
    openLoginPrompt({ reason: "page", redirectTo: sanitizeLoginRedirect(search.redirect) });
    fireAndForget(router.navigate({ to: "/", search: {}, replace: true }));
  }, [search.login, search.redirect, openLoginPrompt, router]);

  // After a client-side navigation focus would stay on the clicked link, and nothing tells assistive
  // technology the page changed: move focus into the content and announce the new document title.
  React.useEffect(
    () =>
      router.subscribe("onResolved", ({ pathChanged }) => {
        if (!pathChanged) return;
        document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
        // The title is set by PageMeta after the route renders.
        globalThis.setTimeout(() => setAnnouncement(document.title), 150);
      }),
    [router],
  );
  return (
    <Box style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Text component="a" href="#main-content" className={styles.skipLink}>
        {t("skipToContent")}
      </Text>
      <RouteProgress />
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- live region */}
      <VisuallyHidden aria-live="polite" role="status">
        {announcement}
      </VisuallyHidden>
      <TopBar />
      <Box component="main" id="main-content" tabIndex={-1} className={styles.main} style={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <MobileTabBar />
      <ScrollToTopButton />
    </Box>
  );
};

export default Layout;
