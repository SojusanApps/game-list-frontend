import { Accordion, Group, Text, Title } from "@mantine/core";
import * as React from "react";

export function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: Readonly<{
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}>) {
  return (
    <Accordion
      defaultValue={defaultOpen ? "section" : undefined}
      styles={{
        root: {
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid var(--color-background-200)",
          overflow: "hidden",
        },
        item: { border: "none" },
        control: { padding: "16px 24px" },
        chevron: { color: "var(--color-text-400)" },
        label: { padding: 0 },
        panel: { paddingTop: 0 },
      }}
    >
      <Accordion.Item value="section">
        <Accordion.Control>
          <Group gap={8}>
            <Title order={2} fz="lg" fw={700} c="var(--color-text-900)">
              {title}
            </Title>
            {count !== undefined && (
              <Text
                component="span"
                fz="xs"
                fw={700}
                style={{
                  background: "var(--color-primary-100)",
                  color: "var(--color-primary-700)",
                  padding: "2px 8px",
                  borderRadius: "9999px",
                }}
              >
                {count}
              </Text>
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
