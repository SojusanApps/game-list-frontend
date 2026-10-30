import { Box, Title } from "@mantine/core";
import * as React from "react";

type PageWidth = "narrow" | "default" | "wide";

const MAX_WIDTH: Record<PageWidth, number> = {
  narrow: 720,
  default: 1152,
  wide: 1280,
};

interface PageShellProps {
  width?: PageWidth;
  children: React.ReactNode;
}

/** Outer container for a page: vertical rhythm, side gutters and one of three content widths. */
export function PageShell({ width = "default", children }: Readonly<PageShellProps>): React.JSX.Element {
  return (
    <Box py={48} px={16} style={{ minHeight: "100vh" }}>
      <Box maw={MAX_WIDTH[width]} mx="auto">
        {children}
      </Box>
    </Box>
  );
}

/** The page's single `h1`, at one shared responsive size. */
export function PageTitle({
  children,
  ta,
  mb,
}: Readonly<{ children: React.ReactNode; ta?: "center"; mb?: number }>): React.JSX.Element {
  return (
    <Title
      order={1}
      fz={{ base: 28, md: 36 }}
      fw={800}
      c="var(--color-text-900)"
      ta={ta}
      mb={mb}
      style={{ letterSpacing: "-0.025em" }}
    >
      {children}
    </Title>
  );
}
