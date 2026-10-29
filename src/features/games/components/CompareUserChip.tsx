import { Box, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";

import { UserDetail } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { TruncatedText } from "@/components/ui/TruncatedText";

import styles from "./CompareUserChip.module.css";

interface CompareUserChipProps {
  userDetails: UserDetail;
}

export function CompareUserChip({ userDetails }: Readonly<CompareUserChipProps>) {
  return (
    <Link
      to={"/profile/$id/$slug"}
      params={{ id: String(userDetails.id), slug: userDetails.slug ?? "" }}
      className={styles.chip}
    >
      <Box className={styles.avatarWrapper}>
        <SafeImage
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          src={userDetails.gravatar_url || undefined}
          alt={`${userDetails.username}'s avatar`}
        />
      </Box>
      <TruncatedText className={styles.username}>{userDetails.username}</TruncatedText>
    </Link>
  );
}
