import {
  IconBooks,
  IconCalendar,
  IconDeviceGamepad2,
  IconHome,
  IconLogin,
  IconSearch,
  IconUserCircle,
  type TablerIcon,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useAuth, useCurrentUser } from "@/features/auth";

import styles from "./MobileTabBar.module.css";

const tabContent = (Icon: TablerIcon, label: string) => (
  <>
    <Icon size={22} stroke={1.75} aria-hidden />
    <span>{label}</span>
  </>
);

/** Bottom navigation for small screens, where the top bar's links are tucked into the burger menu. */
export default function MobileTabBar(): React.JSX.Element | null {
  const { t } = useTranslation();
  const { isAuthenticated, login } = useAuth();
  const { data: user } = useCurrentUser();

  const linkProps = { className: styles.tab, activeProps: { className: styles.active } };

  // Signed-out visitors get a reduced bar: the public destinations plus a way to sign in.
  if (!isAuthenticated || !user) {
    return (
      <>
        <nav className={styles.bar} aria-label={t("nav.mobileTabs")}>
          <Link to="/" activeOptions={{ exact: true }} {...linkProps}>
            {tabContent(IconHome, t("nav.home"))}
          </Link>
          <Link to="/search" {...linkProps}>
            {tabContent(IconSearch, t("nav.search"))}
          </Link>
          <Link to="/release-calendar" {...linkProps}>
            {tabContent(IconCalendar, t("nav.releaseCalendar"))}
          </Link>
          <button type="button" className={styles.tab} onClick={() => login()}>
            {tabContent(IconLogin, t("nav.signIn"))}
          </button>
        </nav>
        <div className={styles.spacer} />
      </>
    );
  }

  const params = { id: String(user.id), slug: user.slug || String(user.id) };

  return (
    <>
      <nav className={styles.bar} aria-label={t("nav.mobileTabs")}>
        <Link to="/" activeOptions={{ exact: true }} {...linkProps}>
          {tabContent(IconHome, t("nav.home"))}
        </Link>
        <Link to="/search" {...linkProps}>
          {tabContent(IconSearch, t("nav.search"))}
        </Link>
        <Link to="/game-list/$id/$slug" params={params} {...linkProps}>
          {tabContent(IconDeviceGamepad2, t("nav.gameList"))}
        </Link>
        <Link to="/profile/$id/$slug/collections" params={params} {...linkProps}>
          {tabContent(IconBooks, t("nav.collections"))}
        </Link>
        <Link to="/profile/$id/$slug" params={params} activeOptions={{ exact: true }} {...linkProps}>
          {tabContent(IconUserCircle, t("nav.profile"))}
        </Link>
      </nav>
      <div className={styles.spacer} />
    </>
  );
}
