import { Box, Stack, Title, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";

import { ImportSourceSelect, ImportSource } from "../components/import/ImportSourceSelect";
import { SteamImportFlow } from "../components/import/SteamImportFlow";
import { TitleImportFlow } from "../components/import/TitleImportFlow";

export default function ImportPage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const [source, setSource] = React.useState<ImportSource>("steam");

  const sourceSelector = <ImportSourceSelect value={source} onChange={setSource} />;

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={t("import.title")} />
      <Stack gap={40} maw={960} mx="auto" px={16}>
        {/* Header */}
        <Stack align="center" gap={8}>
          <Title order={1} fz={{ base: 28, md: 36 }} fw={800} c="var(--color-text-900)" ta="center">
            {t("import.title")}
          </Title>
          <Text c="dimmed" ta="center">
            {t("import.selectSource")}
          </Text>
        </Stack>

        {/* Switching source resets the flow via the key */}
        {source === "steam" ? (
          <SteamImportFlow key="steam" sourceSelector={sourceSelector} />
        ) : (
          <TitleImportFlow key="title" sourceSelector={sourceSelector} />
        )}
      </Stack>
    </Box>
  );
}
