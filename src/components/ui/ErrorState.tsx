import { Box, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Shows a "Try again" button when provided. */
  onRetry?: () => void;
  isRetrying?: boolean;
  /** Extra actions rendered after the retry button (e.g. a "Go home" link). */
  children?: React.ReactNode;
}

/** The one way to show "something broke" — never combine it with an empty state. */
export function ErrorState({
  title,
  message,
  onRetry,
  isRetrying = false,
  children,
}: Readonly<ErrorStateProps>): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <Box
      role="alert"
      p="xl"
      style={{
        background: "var(--color-error-tint-bg)",
        border: "1px solid var(--color-error-tint-border)",
        borderRadius: "var(--mantine-radius-lg)",
      }}
    >
      <Stack align="center" gap={12} ta="center">
        <IconAlertTriangle size={32} color="var(--color-error-tint-text)" aria-hidden />
        <Text fw={700} fz="lg" c="var(--color-error-tint-text)">
          {title ?? t("error.listTitle")}
        </Text>
        <Text fz="sm" c="var(--color-error-tint-text)" maw={480}>
          {message ?? t("error.message")}
        </Text>
        {(onRetry || children) && (
          <Stack gap={8} align="center">
            {onRetry && (
              <Button variant="destructive" onClick={onRetry} isLoading={isRetrying}>
                {t("error.retry")}
              </Button>
            )}
            {children}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
