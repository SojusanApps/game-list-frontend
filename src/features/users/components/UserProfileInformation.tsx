import { ActionIcon, Box, Group, Stack, Text, Tooltip, VisuallyHidden } from "@mantine/core";
import { IconInfoCircle, IconGenderMale, IconGenderFemale, IconMinus } from "@tabler/icons-react";
import { TFunction } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail } from "@/client";
import { Panel } from "@/components/ui/Panel";
import { PanelHeader } from "@/components/ui/PanelHeader";
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
    <Panel
      p={0}
      style={{
        overflow: "hidden",
      }}
    >
      <PanelHeader title={t("info.title")} />
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
              <VisuallyHidden>{genderDisplay.label}</VisuallyHidden>
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
                <ActionIcon
                  variant="transparent"
                  size="sm"
                  aria-label={t("info.warningsExplanation", { max: WARNING_LIMIT })}
                  style={{ color: "var(--color-text-500)", cursor: "help" }}
                >
                  <IconInfoCircle size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Text c="var(--color-text-900)">
              {t("info.warningsCount", { count: userDetails.warning_count, max: WARNING_LIMIT })}
            </Text>
          </Group>
        )}
      </Stack>
    </Panel>
  );
}
