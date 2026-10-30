import { Box } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell, PageTitle } from "@/components/ui/PageShell";

import { FaqAccordion } from "../components/FaqAccordion";

export default function FaqPage(): React.JSX.Element {
  const { t } = useTranslation("faq");

  return (
    <PageShell width="narrow">
      <Box>
        <PageMeta title={t("pageTitle")} />
        <PageTitle mb={32}>{t("pageTitle")}</PageTitle>
        <FaqAccordion />
      </Box>
    </PageShell>
  );
}
