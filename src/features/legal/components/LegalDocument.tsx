import { Box, Title } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { PageMeta } from "@/components/ui/PageMeta";

import styles from "./LegalDocument.module.css";

type LegalDocumentProps = {
  title: string;
  contentEn: string;
  contentPl: string;
};

export function LegalDocument({ title, contentEn, contentPl }: Readonly<LegalDocumentProps>): React.JSX.Element {
  const { i18n } = useTranslation();
  const content = i18n.language === "pl" ? contentPl : contentEn;

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Box maw={720} mx="auto" px={16}>
        <PageMeta title={title} />
        <Title order={1} fz={28} fw={700} c="var(--color-text-900)" mb={32}>
          {title}
        </Title>
        <Box className={styles.prose}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
      </Box>
    </Box>
  );
}
