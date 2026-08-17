import { Center, Loader, Paper, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import AppLogo from "@/components/ui/AppLogo";
import { Button } from "@/components/ui/Button";
import i18n from "@/lib/i18n";
import { initKeycloak } from "@/lib/keycloak";
import { useLanguageStore, type Language } from "@/lib/languageStore";

type SessionState = "pending" | "ready" | "error";

/** Blocks rendering `children` until the Keycloak session check resolves. Fails closed on error. */
export function SessionGate({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const { t } = useTranslation("auth");
  const { language, setLanguage } = useLanguageStore();
  const [state, setState] = React.useState<SessionState>("pending");

  const handleLanguageChange = (value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    void i18n.changeLanguage(lang);
  };

  React.useEffect(() => {
    let cancelled = false;
    initKeycloak()
      .then(() => {
        if (!cancelled) setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "pending") {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  if (state === "error") {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Paper p="xl" radius="md" style={{ textAlign: "center", maxWidth: 500 }} w="100%">
          <Stack align="center" gap="md">
            <AppLogo size="md" />
            <Title order={1} c="var(--color-text-900)">
              {t("sessionCheck.errorTitle")}
            </Title>
            <Text size="lg" c="var(--color-text-600)">
              {t("sessionCheck.errorMessage")}
            </Text>
            <Button size="lg" onClick={() => globalThis.location.reload()}>
              {t("sessionCheck.retry")}
            </Button>
            <SegmentedControl
              value={language}
              onChange={handleLanguageChange}
              size="xs"
              data={[
                { label: "EN", value: "en" },
                { label: "PL", value: "pl" },
              ]}
            />
          </Stack>
        </Paper>
      </Center>
    );
  }

  return <>{children}</>;
}
