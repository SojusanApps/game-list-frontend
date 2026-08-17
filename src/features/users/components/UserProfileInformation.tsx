import { Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail } from "@/client";
import { timeAgo } from "@/utils/dateUtils";

const WARNING_LIMIT = 3;

interface UserProfileInformationProps {
  userDetails?: UserDetail;
}

export default function UserProfileInformation({ userDetails }: Readonly<UserProfileInformationProps>) {
  const { t } = useTranslation("users");
  return (
    <Box
      style={{
        background: "white",
        borderRadius: "12px",
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
          {t("info.title")}
        </Text>
      </Box>
      <Stack gap={12} p={16}>
        <Group justify="space-between" fz="sm">
          <Text fw={500} c="var(--color-text-600)">
            {t("info.joined")}
          </Text>
          <Text c="var(--color-text-900)">{new Date(userDetails?.date_joined || "").toLocaleDateString()}</Text>
        </Group>
        <Group justify="space-between" fz="sm">
          <Text fw={500} c="var(--color-text-600)">
            {t("info.gender")}
          </Text>
          <Text c="var(--color-text-900)">{t("info.private")}</Text>
        </Group>
        <Group justify="space-between" fz="sm">
          <Text fw={500} c="var(--color-text-600)">
            {t("info.lastActive")}
          </Text>
          <Text c="var(--color-text-900)">{timeAgo(userDetails?.last_active) || t("info.never")}</Text>
        </Group>
        {userDetails?.warning_count !== null && userDetails?.warning_count !== undefined && (
          <Group justify="space-between" fz="sm">
            <Group gap={4} align="center">
              <Text fw={500} c="var(--color-text-600)">
                {t("info.warnings")}
              </Text>
              <Tooltip label={t("info.warningsExplanation", { max: WARNING_LIMIT })} multiline w={280} withArrow>
                <IconInfoCircle size={14} style={{ color: "var(--color-text-400)", cursor: "help" }} />
              </Tooltip>
            </Group>
            <Text c="var(--color-text-900)">
              {t("info.warningsCount", { count: userDetails.warning_count, max: WARNING_LIMIT })}
            </Text>
          </Group>
        )}
      </Stack>
    </Box>
  );
}
