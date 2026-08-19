import { Box, Group, Menu, Text, UnstyledButton, Burger, Drawer, Stack, useComputedColorScheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconUserCircle, IconSettings, IconLogout, IconShield } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import AppLogo from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { useAuth, useCurrentUser } from "@/features/auth";
import SearchBar from "@/features/games/components/SearchBar";
import NotificationBell from "@/features/notifications/components/NotificationBell";

import styles from "./TopBar.module.css";

function LoggedInView({ logout }: Readonly<{ logout: () => void }>): React.JSX.Element {
  const { data: currentUser } = useCurrentUser();
  const { t } = useTranslation();

  const profileParams: any = { id: currentUser?.id?.toString() || "", slug: currentUser?.slug || "" };

  return (
    <Group gap={16}>
      <NotificationBell />
      <Menu shadow="xl" width={220} position="bottom-end" withArrow>
        <Menu.Target>
          <UnstyledButton className={styles.userMenuBtn}>
            <Text component="span" fz="sm" fw={500} c="var(--color-primary-100)" visibleFrom="md">
              {currentUser?.username}
            </Text>
            <SafeImage
              src={currentUser?.gravatar_url || undefined}
              alt={t("userAvatarAlt")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9999px",
                outline: "2px solid rgba(255,255,255,0.2)",
                flexShrink: 0,
              }}
            />
            <IconChevronDown size={16} style={{ color: "var(--color-primary-300)" }} />
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            component={Link}
            to={"/profile/$id/$slug"}
            params={profileParams}
            leftSection={<IconUserCircle size={16} />}
          >
            {t("nav.profile")}
          </Menu.Item>
          <Menu.Item component={Link} to="/settings" leftSection={<IconSettings size={16} />}>
            {t("nav.accountSettings")}
          </Menu.Item>
          {currentUser?.is_staff && (
            <>
              <Menu.Divider />
              <Menu.Item component={Link} to="/admin" leftSection={<IconShield size={16} />}>
                {t("nav.adminPanel")}
              </Menu.Item>
            </>
          )}
          <Menu.Divider />
          <Menu.Item color="red" onClick={logout} leftSection={<IconLogout size={16} />}>
            {t("nav.logout")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

function NotLoggedInView(): React.JSX.Element {
  const { t } = useTranslation();
  const { login } = useAuth();
  return (
    <Group gap={12}>
      <Button size="sm" onClick={() => login()}>
        {t("nav.login")}
      </Button>
    </Group>
  );
}

function TopBar(): React.JSX.Element {
  const { isAuthenticated, logout } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;
  const userSlug = currentUser?.slug || currentUserId?.toString() || "";
  const [opened, { toggle, close }] = useDisclosure();
  const { t } = useTranslation();
  const colorScheme = useComputedColorScheme("light");

  return (
    <Box
      component="nav"
      pos="sticky"
      style={{
        top: 0,
        zIndex: 50,
        width: "100%",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: colorScheme === "dark" ? "#000000" : "var(--color-primary-950)",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
      }}
    >
      <Group justify="space-between" align="center" maw={1280} mx="auto" p={12}>
        <Group gap={32}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="lg" size="sm" color="var(--color-primary-100)" />
          <Link to="/home" className={styles.logoLink} aria-label={t("nav.gameListLogo")}>
            <AppLogo size="md" onDark />
          </Link>

          <Group component="ul" gap={32} visibleFrom="lg">
            <Box component="li" className={styles.navItem}>
              <Link to="/search" className={styles.navLink}>
                {t("nav.searchEngine")}
              </Link>
            </Box>
            <Box component="li" className={styles.navItem}>
              <Link to="/release-calendar" className={styles.navLink}>
                {t("nav.releaseCalendar")}
              </Link>
            </Box>

            {isAuthenticated && currentUserId && (
              <>
                <Box component="li" className={styles.navItem}>
                  <Link
                    to={"/game-list/$id/$slug"}
                    params={{ id: currentUserId.toString(), slug: userSlug }}
                    className={styles.navLink}
                  >
                    {t("nav.gameList")}
                  </Link>
                </Box>
                <Box component="li" className={styles.navItem}>
                  <Link
                    to={"/profile/$id/$slug/collections"}
                    params={{ id: currentUserId.toString(), slug: userSlug }}
                    className={styles.navLink}
                  >
                    {t("nav.collections")}
                  </Link>
                </Box>
              </>
            )}
          </Group>
        </Group>

        <Box visibleFrom="md" style={{ flex: 1, maxWidth: "448px", marginInline: "16px" }}>
          <SearchBar />
        </Box>

        <Group gap={16}>{isAuthenticated ? <LoggedInView logout={logout} /> : <NotLoggedInView />}</Group>
      </Group>

      <Drawer
        opened={opened}
        onClose={close}
        size="xs"
        padding="md"
        title={
          <Text fw={700} fz="lg" c="var(--color-text-900)">
            {t("nav.menu")}
          </Text>
        }
        hiddenFrom="lg"
        zIndex={1_000_000}
      >
        <Stack gap="sm" mt="md" component="ul" style={{ listStyle: "none", padding: 0 }}>
          <Box component="li" mb="md">
            <SearchBar variant="light" />
          </Box>
          <Box component="li">
            <Link to="/search" className={styles.mobileNavLink} onClick={close}>
              {t("nav.searchEngine")}
            </Link>
          </Box>
          <Box component="li">
            <Link to="/release-calendar" className={styles.mobileNavLink} onClick={close}>
              {t("nav.releaseCalendar")}
            </Link>
          </Box>

          {isAuthenticated && currentUserId && (
            <>
              <Box component="li">
                <Link
                  to={"/game-list/$id/$slug"}
                  params={{ id: currentUserId.toString(), slug: userSlug }}
                  className={styles.mobileNavLink}
                  onClick={close}
                >
                  {t("nav.gameList")}
                </Link>
              </Box>
              <Box component="li">
                <Link
                  to={"/profile/$id/$slug/collections"}
                  params={{ id: currentUserId.toString(), slug: userSlug }}
                  className={styles.mobileNavLink}
                  onClick={close}
                >
                  {t("nav.collections")}
                </Link>
              </Box>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}

export default TopBar;
