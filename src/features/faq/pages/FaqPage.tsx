import { Box, Title } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";

import { FaqAccordion } from "../components/FaqAccordion";

export default function FaqPage(): React.JSX.Element {
  const { t } = useTranslation("faq");

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Box maw={720} mx="auto" px={16}>
        <PageMeta title={t("pageTitle")} />
        <Title order={1} fz={28} fw={700} c="var(--color-text-900)" mb={32}>
          {t("pageTitle")}
        </Title>
        <FaqAccordion />
      </Box>
    </Box>
  );
}
