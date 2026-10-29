import { Box, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import type { UserSimple } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";

/** A user's avatar followed by their username, linking to their profile. */
export function UserChip({ user, size = 20 }: Readonly<{ user: UserSimple; size?: number }>) {
  return (
    <Link
      to="/profile/$id/$slug"
      params={{ id: user.id.toString(), slug: user.slug || "" }}
      style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
    >
      <Box style={{ width: size, height: size, borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
        <SafeImage
          src={user.gravatar_url || undefined}
          alt={user.username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <Text fz="xs" c="dimmed">
        {user.username}
      </Text>
    </Link>
  );
}
