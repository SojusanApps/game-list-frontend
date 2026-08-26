import { Box, Group, Text } from "@mantine/core";
import * as React from "react";

interface CollectionStatsBannerProps {
  icon: React.ReactNode;
  iconBackground: string;
  bannerBackground: string;
  borderColor: string;
  textColor: string;
  count: number;
  label: string;
  typeLabel?: string;
  extra?: React.ReactNode;
}

export function CollectionStatsBanner({
  icon,
  iconBackground,
  bannerBackground,
  borderColor,
  textColor,
  count,
  label,
  typeLabel,
  extra,
}: Readonly<CollectionStatsBannerProps>) {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        background: bannerBackground,
        padding: 16,
        borderRadius: 16,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Group gap={12} wrap="nowrap">
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 12,
            background: iconBackground,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text fw={900} fz={24} c={textColor} style={{ lineHeight: 1 }}>
            {count}
          </Text>
          <Text
            size="xs"
            fw={600}
            c="var(--color-text-700)"
            style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}
          >
            {label}
          </Text>
        </Box>
      </Group>

      <Box style={{ flex: 1, textAlign: "center" }}>
        {typeLabel && (
          <Text fw={800} fz={13} c={textColor} tt="uppercase" style={{ letterSpacing: "0.08em", opacity: 0.85 }}>
            {typeLabel}
          </Text>
        )}
      </Box>

      {extra && <Group gap={12}>{extra}</Group>}
    </Box>
  );
}
