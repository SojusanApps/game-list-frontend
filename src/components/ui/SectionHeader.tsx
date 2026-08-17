import { Box, Group, Text, Title } from "@mantine/core";
import { Link, LinkComponentProps } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: string;
  viewMoreHref?: string | LinkComponentProps<"a">;
  className?: string;
}

export function SectionHeader({ title, viewMoreHref, className }: Readonly<SectionHeaderProps>) {
  const { t } = useTranslation();
  const isObj = typeof viewMoreHref === "object" && viewMoreHref !== null;
  const linkProps = isObj ? viewMoreHref : { to: viewMoreHref };

  return (
    <Group
      justify="space-between"
      align="flex-end"
      mb={24}
      pb={8}
      style={{ borderBottom: "1px solid var(--color-background-400)" }}
      className={className}
    >
      <Group gap={12}>
        <Box
          style={{
            width: "6px",
            height: "32px",
            background: "var(--mantine-color-primary-6)",
            borderRadius: "9999px",
          }}
        />
        <Title order={2} fz={24} fw={700} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
          {title}
        </Title>
      </Group>
      {viewMoreHref && (
        <Link
          to={linkProps.to as "/"}
          search={"search" in linkProps ? linkProps.search : undefined}
          className={styles.viewMoreLink}
        >
          {t("viewMore")}{" "}
          <Text component="span" fz="lg">
            →
          </Text>
        </Link>
      )}
    </Group>
  );
}
