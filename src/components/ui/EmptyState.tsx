import { Box, Stack, Text, Title } from "@mantine/core";
import * as React from "react";

interface EmptyStateProps {
  /** A Tabler icon element, e.g. `<IconSearchOff />`. */
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Call to action, usually a `Button`. */
  action?: React.ReactNode;
}

/** The one "nothing here" block: round icon, title, optional explanation and action. */
export function EmptyState({ icon, title, description, action }: Readonly<EmptyStateProps>): React.JSX.Element {
  return (
    <Stack align="center" justify="center" gap={24} style={{ paddingBlock: "80px", textAlign: "center" }}>
      <Box
        aria-hidden
        style={{
          width: 80,
          height: 80,
          background: "var(--color-primary-tint-bg)",
          color: "var(--color-primary-tint-text)",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Stack gap={8}>
        <Title order={3} fz={24} fw={700} c="var(--color-text-900)">
          {title}
        </Title>
        {description && (
          <Text c="var(--color-text-500)" maw={384} mx="auto">
            {description}
          </Text>
        )}
      </Stack>
      {action}
    </Stack>
  );
}
