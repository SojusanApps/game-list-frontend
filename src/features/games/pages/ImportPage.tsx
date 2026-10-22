import { Box, Stack, Title } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";

import { TitleImportFlow } from "../components/import/TitleImportFlow";

export default function ImportPage(): React.JSX.Element {
  const { t } = useTranslation("games");

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={t("import.title")} noindex />
      <Stack gap={40} maw={960} mx="auto" px={16}>
        {/* Header */}
        <Stack align="center" gap={8}>
          <Title order={1} fz={{ base: 28, md: 36 }} fw={800} c="var(--color-text-900)" ta="center">
            {t("import.title")}
          </Title>
        </Stack>

        <TitleImportFlow />
      </Stack>
    </Box>
  );
}
