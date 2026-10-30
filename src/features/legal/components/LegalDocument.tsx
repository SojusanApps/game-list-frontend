import { Box } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell, PageTitle } from "@/components/ui/PageShell";

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
    <PageShell width="narrow">
      <Box>
        <PageMeta title={title} />
        <PageTitle mb={32}>{title}</PageTitle>
        <Box className={styles.prose}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
      </Box>
    </PageShell>
  );
}
