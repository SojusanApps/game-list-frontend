import { Paper, SimpleGrid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";

import { version as uiVersion } from "../../../../package.json";
import { useGetApiVersion } from "../hooks/adminQueries";

function VersionCard({
  label,
  value,
  isLoading,
}: Readonly<{ label: string; value: string | undefined; isLoading?: boolean }>): React.JSX.Element {
  return (
    <Paper withBorder p="xl" radius="md">
      <Text fz="sm" tt="uppercase" fw={700} c="dimmed" mb={4}>
        {label}
      </Text>
      <Skeleton visible={!!isLoading} width="auto">
        <Text fz="xl" fw={700}>
          {value ?? "—"}
        </Text>
      </Skeleton>
    </Paper>
  );
}

function AdminActionCard({
  label,
  description,
  to,
}: Readonly<{ label: string; description: string; to: string }>): React.JSX.Element {
  return (
    <Paper component={Link} to={to} withBorder p="xl" radius="md" style={{ display: "block", textDecoration: "none" }}>
      <Text fz="lg" fw={700} c="var(--color-text-900)" mb={4}>
        {label}
      </Text>
      <Text fz="sm" c="dimmed">
        {description}
      </Text>
    </Paper>
  );
}

export default function AdminPage(): React.JSX.Element {
  const { t } = useTranslation("admin");
  const { data: apiVersionData, isLoading } = useGetApiVersion();

  const adminActions = [
    {
      label: t("actions.translationSuggestions.label"),
      description: t("actions.translationSuggestions.description"),
      to: "/admin/translation-suggestions",
    },
    {
      label: t("actions.reports.label"),
      description: t("actions.reports.description"),
      to: "/admin/reports",
    },
  ];

  return (
    <Stack gap={40} maw={1280} mx="auto" px={16} w="100%" style={{ flexGrow: 1 }}>
      <PageMeta title={t("page.title")} />
      <Stack gap={8}>
        <Title order={2}>{t("page.title")}</Title>
        <Text c="dimmed">{t("page.subtitle")}</Text>
      </Stack>
      <Stack gap={16}>
        <Title order={4}>{t("actions.title")}</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {adminActions.map(action => (
            <AdminActionCard key={action.to} label={action.label} description={action.description} to={action.to} />
          ))}
        </SimpleGrid>
      </Stack>
      <Stack gap={16}>
        <Title order={4}>{t("versions")}</Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <VersionCard label={t("apiVersion")} value={apiVersionData?.version} isLoading={isLoading} />
          <VersionCard label={t("uiVersion")} value={uiVersion} />
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
