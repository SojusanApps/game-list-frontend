import { Box, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";

export default function NotFound(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Center style={{ minHeight: "70vh" }}>
      <PageMeta title={t("notFound.title")} />

      <Paper p="xl" radius="md" style={{ textAlign: "center", maxWidth: 500 }} w="100%">
        <Stack align="center" gap="md">
          <Text fw={900} c="var(--color-primary-600)" style={{ fontSize: "6rem", lineHeight: 1 }}>
            404
          </Text>
          <Title order={1} c="var(--color-text-900)">
            {t("notFound.heading")}
          </Title>
          <Text size="lg" c="var(--color-text-600)">
            {t("notFound.description")}
          </Text>
          <Box mt="md">
            <Link to="/">
              <Button size="lg">{t("notFound.goHome")}</Button>
            </Link>
          </Box>
        </Stack>
      </Paper>
    </Center>
  );
}
