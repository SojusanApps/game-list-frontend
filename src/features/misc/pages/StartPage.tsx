import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Box, Text } from "@mantine/core";
import { PageMeta } from "@/components/ui/PageMeta";
import { useAuth } from "@/features/auth";

export default function StartPage(): React.JSX.Element {
  const { login } = useAuth();

  return (
    <Box style={{ background: "#cbd5e1", maxWidth: "100%", padding: "16px" }}>
      <PageMeta title="Welcome" />
      <Text>Welcome to MyGameList Temporary Start Page - Early access!</Text>
      <Text>
        Log in:{" "}
        <button
          type="button"
          onClick={() => login()}
          style={{ color: "#3b82f6", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          here
        </button>
      </Text>
      <Text>
        Home:{" "}
        <Link to="/home" style={{ color: "#3b82f6" }}>
          here
        </Link>
      </Text>
    </Box>
  );
}
