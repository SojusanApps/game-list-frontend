import { Box, Group, Text, Tooltip } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail } from "@/client";
import { Panel } from "@/components/ui/Panel";
import { PanelHeader } from "@/components/ui/PanelHeader";
import { SafeImage } from "@/components/ui/SafeImage";

interface UserFriendsListProps {
  userDetails?: UserDetail;
}

export default function UserFriendsList({ userDetails }: Readonly<UserFriendsListProps>) {
  const { t } = useTranslation("users");
  return (
    <Panel
      p={0}
      style={{
        overflow: "hidden",
      }}
    >
      <PanelHeader
        title={t("friends.title")}
        action={
          <Link
            to={"/profile/$id/$slug/friends"}
            params={{ id: userDetails?.id?.toString() || "", slug: userDetails?.slug || "" }}
            style={{ fontSize: 12, fontWeight: 500, color: "var(--mantine-color-primary-6)" }}
          >
            {t("friends.viewAll")}
          </Link>
        }
      />
      <Box p={16}>
        {userDetails?.friends && userDetails.friends.length > 0 ? (
          <Group gap={12} wrap="wrap">
            {userDetails.friends.map(friend => (
              <Tooltip key={friend.id} label={friend.username}>
                <Link to={"/profile/$id/$slug"} params={{ id: friend.id?.toString() || "", slug: friend.slug || "" }}>
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid var(--color-background-300)",
                    }}
                  >
                    <SafeImage
                      style={{ width: "100%", height: "100%" }}
                      src={friend.gravatar_url || undefined}
                      alt={t("friends.avatarAlt", { name: friend.username })}
                    />
                  </Box>
                </Link>
              </Tooltip>
            ))}
          </Group>
        ) : (
          <Text size="sm" fs="italic" c="var(--color-text-500)">
            {t("friends.noFriendsYet")}
          </Text>
        )}
      </Box>
    </Panel>
  );
}
