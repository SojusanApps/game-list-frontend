import { Box, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconInfoCircle, IconGenderMale, IconGenderFemale, IconMinus } from "@tabler/icons-react";
import { TFunction } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail } from "@/client";
import { formatDisplayDate, timeAgo } from "@/utils/dateUtils";

const WARNING_LIMIT = 3;

interface UserProfileInformationProps {
  userDetails?: UserDetail;
}

const MALE_VALUES = new Set(["male", "mężczyzna"]);
const FEMALE_VALUES = new Set(["female", "kobieta"]);

function getGenderDisplay(
  gender: string | undefined,
  t: TFunction<"users">,
): { icon: React.JSX.Element; label: string } {
  const normalizedGender = gender?.toLowerCase();
  if (normalizedGender && MALE_VALUES.has(normalizedGender)) {
    return {
      icon: <IconGenderMale size={24} style={{ color: "var(--mantine-color-blue-6)" }} />,
      label: t("info.genderMale"),
    };
  }
  if (normalizedGender && FEMALE_VALUES.has(normalizedGender)) {
    return {
      icon: <IconGenderFemale size={24} style={{ color: "var(--mantine-color-pink-6)" }} />,
      label: t("info.genderFemale"),
    };
  }
  return {
    icon: <IconMinus size={24} style={{ color: "var(--color-text-400)" }} />,
    label: t("info.genderNotSpecified"),
  };
}

export default function UserProfileInformation({ userDetails }: Readonly<UserProfileInformationProps>) {
  const { t } = useTranslation("users");
  const genderDisplay = getGenderDisplay(userDetails?.gender, t);
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
          <Text c="var(--color-text-900)">{formatDisplayDate(userDetails?.date_joined)}</Text>
        </Group>
        <Group justify="space-between" fz="sm">
          <Text fw={500} c="var(--color-text-600)">
            {t("info.gender")}
          </Text>
          <Tooltip label={genderDisplay.label} withArrow>
            <Box component="span" style={{ display: "inline-flex" }}>
              {genderDisplay.icon}
            </Box>
          </Tooltip>
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
