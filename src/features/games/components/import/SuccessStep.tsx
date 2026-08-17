import { Box, Stack, Title, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useCurrentUserId } from "@/features/auth";
import { useGetUserDetails } from "@/features/users/hooks/userQueries";

import styles from "./SuccessStep.module.css";

interface SuccessStepProps {
  importedCount: number;
}

/** The final "import successful" card with a link back to the user's game list. */
export const SuccessStep = ({ importedCount }: SuccessStepProps) => {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();
  const { data: userDetails } = useGetUserDetails(currentUserId || undefined);
  const userSlug = userDetails?.slug || currentUserId?.toString() || "";

  return (
    <Box className={styles.card}>
      <Stack align="center" gap={24} className={styles.successCard}>
        <div className={styles.successIcon}>🏆</div>
        <Title order={2} fw={800} c="var(--color-text-900)">
          {t("import.successTitle")}
        </Title>
        <Text ta="center" c="dimmed" fz="lg">
          {t("import.successMessage", { count: importedCount })}
        </Text>
        {currentUserId && userSlug && (
          <Link to="/game-list/$id/$slug" params={{ id: currentUserId.toString(), slug: userSlug }}>
            <Button leftSection={<IconCheck size={16} />}>{t("import.backButton")}</Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
};
