import { Box, Stack, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import React from "react";

import AppLogo from "./AppLogo";

interface ImageFallbackProps {
  className?: string;
}

const REFERENCE_SIZE = 200;

export function ImageFallback({ className }: Readonly<ImageFallbackProps>) {
  const { ref, width } = useElementSize();
  const scale = width > 0 ? width / REFERENCE_SIZE : 1;

  return (
    <Stack
      ref={ref}
      align="center"
      justify="center"
      w="100%"
      h="100%"
      bg="var(--color-background-100)"
      c="var(--color-text-500)"
      className={className}
      style={{ overflow: "hidden" }}
    >
      <Box style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        <Stack align="center" gap={4} p={8}>
          <AppLogo size="sm" />
          <Text component="span" fz="lg" fw={500} tt="uppercase" style={{ letterSpacing: "0.1em", opacity: 0.7 }}>
            No Image
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
}
