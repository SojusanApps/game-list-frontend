import { Box, Text } from "@mantine/core";
import * as React from "react";

type AppLogoProps = {
  size?: "sm" | "md" | "lg";
  onDark?: boolean;
};

const sizeMap = {
  sm: { sojusan: "1.35rem", gameList: "0.85rem", spacing: "0.08em" },
  md: { sojusan: "1.85rem", gameList: "1.1rem", spacing: "0.1em" },
  lg: { sojusan: "2.5rem", gameList: "1.5rem", spacing: "0.12em" },
};

function AppLogo({ size = "md", onDark = false }: Readonly<AppLogoProps>): React.JSX.Element {
  const s = sizeMap[size];

  return (
    <Box style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0, overflow: "visible" }}>
      <Text
        component="span"
        fw={800}
        fs="italic"
        lh={1}
        style={{
          fontSize: s.sojusan,
          letterSpacing: s.spacing,
          paddingInline: "0.15em",
          paddingBottom: "0.2em",
          overflow: "visible",
          background: "linear-gradient(135deg, var(--mantine-color-primary-5), var(--mantine-color-primary-7))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Sojusan
      </Text>
      <Text
        component="span"
        fw={600}
        lh={1}
        style={{
          fontSize: s.gameList,
          letterSpacing: "0.22em",
          color: onDark ? "rgba(255,255,255,0.75)" : "var(--mantine-color-text-7, #334155)",
        }}
      >
        GameList
      </Text>
    </Box>
  );
}

export default AppLogo;
