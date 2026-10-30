import { Box, type BoxProps } from "@mantine/core";
import * as React from "react";

import { cn } from "@/utils/cn";

import styles from "./Panel.module.css";

interface PanelProps extends BoxProps {
  children: React.ReactNode;
  component?: "div" | "section";
}

/** The standard content surface: bordered, rounded card with a soft shadow. */
export function Panel({ className, children, component = "div", ...props }: Readonly<PanelProps>) {
  return (
    <Box component={component} className={cn(styles.panel, className)} {...props}>
      {children}
    </Box>
  );
}
