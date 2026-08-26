import { GravatarQuickEditorCore } from "@gravatar-com/quick-editor";
import { Box, Stack, Text, Title } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { SafeImage } from "@/components/ui/SafeImage";
import { env } from "@/config/env";
import { useCurrentUserId } from "@/features/auth";
import { userKeys } from "@/lib/queryKeys";

import { useGetUserDetails } from "../hooks/userQueries";

const KEYCLOAK_ACCOUNT_CONSOLE_URL = `${env.VITE_KEYCLOAK_URL}/realms/${env.VITE_KEYCLOAK_REALM}/account`;

export default function UserSettingsPage(): React.JSX.Element {
  const { t, i18n } = useTranslation("users");
  const currentUserId = useCurrentUserId();
  const { data: userDetails } = useGetUserDetails(currentUserId || undefined);
  const queryClient = useQueryClient();
  const editorRef = React.useRef<GravatarQuickEditorCore | null>(null);

  React.useEffect(() => {
    if (!userDetails?.email) {
      return;
    }

    editorRef.current = new GravatarQuickEditorCore({
      email: userDetails.email,
      scope: ["avatars"],
      locale: i18n.language,
      onProfileUpdated: () => {
        queryClient.invalidateQueries({ queryKey: userKeys.detail(currentUserId as number) });
      },
    });

    return () => {
      editorRef.current?.close();
    };
  }, [userDetails?.email, i18n.language, currentUserId, queryClient]);

  const handleOpenEditor = () => {
    editorRef.current?.open();
  };

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Box maw={720} mx="auto" px={16}>
        <PageMeta title={t("settings.title")} />
        <Title order={1} fz={28} fw={700} c="var(--color-text-900)" mb={32}>
          {t("settings.title")}
        </Title>

        <Box
          style={{
            background: "var(--color-background-100)",
            borderRadius: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid var(--color-background-200)",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              background: "var(--color-background-50)",
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-background-200)",
            }}
          >
            <Text fw={600} c="var(--color-text-900)">
              {t("settings.avatar.sectionTitle")}
            </Text>
          </Box>

          <Stack align="center" gap={16} p={24}>
            <Box
              style={{
                width: 160,
                height: 160,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--color-background-200)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}
            >
              <SafeImage
                src={userDetails?.gravatar_url || undefined}
                alt={t("profile.userAvatarAlt")}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>

            <Text fz="sm" c="var(--color-text-500)" ta="center" maw={400}>
              {t("settings.avatar.description")}
            </Text>

            <Button variant="default" onClick={handleOpenEditor} disabled={!userDetails?.email}>
              {t("settings.avatar.changeButton")}
            </Button>
          </Stack>
        </Box>

        {userDetails && currentUserId && (
          <Box
            style={{
              background: "var(--color-background-100)",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid var(--color-background-200)",
              overflow: "hidden",
            }}
            mt={24}
          >
            <Box
              style={{
                background: "var(--color-background-50)",
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-background-200)",
              }}
            >
              <Text fw={600} c="var(--color-text-900)">
                {t("settings.credentials.sectionTitle")}
              </Text>
            </Box>

            <Stack gap={16} p={24}>
              <Text fz="sm" c="var(--color-text-500)">
                {t("settings.credentials.description")}
              </Text>
              <Box
                style={{
                  background: "var(--color-error-tint-bg)",
                  border: "1px solid var(--color-error-tint-border)",
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <Text fw={600} c="var(--color-error-tint-text)" mb={4}>
                  {t("settings.credentials.deleteAccount.title")}
                </Text>
                <Text fz="sm" c="var(--color-error-tint-text)" mb={16}>
                  {t("settings.credentials.deleteAccount.description")}
                </Text>
              </Box>
              <a
                href={KEYCLOAK_ACCOUNT_CONSOLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button variant="default" fullWidth>
                  {t("settings.credentials.manageAccountButton")}
                </Button>
              </a>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
