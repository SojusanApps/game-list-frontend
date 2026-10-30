import { Group, Text } from "@mantine/core";
import * as React from "react";

interface PanelHeaderProps {
  title: React.ReactNode;
  /** Optional control on the right (a link or button). */
  action?: React.ReactNode;
}

/** The title bar at the top of an info `Panel` (game information, profile, friends, settings). */
export function PanelHeader({ title, action }: Readonly<PanelHeaderProps>): React.JSX.Element {
  return (
    <Group
      justify="space-between"
      align="center"
      style={{
        background: "var(--color-background-50)",
        padding: "var(--mantine-spacing-sm) var(--mantine-spacing-md)",
        borderBottom: "1px solid var(--color-background-200)",
      }}
    >
      <Text fw={600} c="var(--color-text-900)">
        {title}
      </Text>
      {action}
    </Group>
  );
}
