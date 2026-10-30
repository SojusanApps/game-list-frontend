import { Stack } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell, PageTitle } from "@/components/ui/PageShell";

import { TitleImportFlow } from "../components/import/TitleImportFlow";

export default function ImportPage(): React.JSX.Element {
  const { t } = useTranslation("games");

  return (
    <PageShell width="default">
      <PageMeta title={t("import.title")} noindex />
      <Stack gap={40}>
        {/* Header */}
        <Stack align="center" gap={8}>
          <PageTitle ta="center">{t("import.title")}</PageTitle>
        </Stack>

        <TitleImportFlow />
      </Stack>
    </PageShell>
  );
}
