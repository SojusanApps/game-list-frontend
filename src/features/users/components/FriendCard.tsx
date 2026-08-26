import { Box, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Friendship } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatDisplayDate } from "@/utils/dateUtils";

import styles from "./FriendCard.module.css";

interface FriendCardProps {
  friendship: Friendship;
}

export default function FriendCard({ friendship }: Readonly<FriendCardProps>) {
  const { friend, created_at } = friendship;
  const { t } = useTranslation("users");

  return (
    <Box className={styles.card}>
      <Stack align="center" gap={12} p={16}>
        <Link
          to={"/profile/$id/$slug"}
          params={{ id: friend.id.toString(), slug: friend.slug || "" }}
          className={styles.avatarLink}
        >
          <Box className={styles.avatarWrapper}>
            <SafeImage
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              src={friend.gravatar_url || undefined}
              alt={`${friend.username}'s avatar`}
            />
          </Box>
        </Link>

        <Box style={{ textAlign: "center" }}>
          <Link
            to={"/profile/$id/$slug"}
            params={{ id: friend.id.toString(), slug: friend.slug || "" }}
            className={styles.usernameLink}
          >
            {friend.username}
          </Link>
          <Text size="xs" c="var(--color-text-500)">
            {t("friends.since", { date: formatDisplayDate(created_at) })}
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
