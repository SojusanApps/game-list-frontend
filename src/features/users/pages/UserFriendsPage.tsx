import { Box, SimpleGrid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";
import { VirtualGridList } from "@/components/ui/VirtualGridList";

import FriendCard from "../components/FriendCard";
import { useGetFriendshipsInfiniteQuery } from "../hooks/friendshipQueries";
import { useGetUserDetails } from "../hooks/userQueries";

const routeApi = getRouteApi("/profile_/$id/$slug/friends");

export default function UserFriendsPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const userId = Number(id);

  const { data: userDetails, isLoading: isUserLoading } = useGetUserDetails(userId);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFriendsQueryLoading,
  } = useGetFriendshipsInfiniteQuery({ user: userId.toString() });

  const isFriendsLoading = isFriendsQueryLoading || isUserLoading;

  const { t } = useTranslation("users");

  const allFriendships = data?.pages.flatMap(page => page.results) || [];
  const totalFriends = data?.pages[0]?.count ?? 0;

  const pageTitle = isUserLoading ? t("friends.loading") : t("friends.pageTitle", { username: userDetails?.username });

  const renderFriendsContent = () => {
    if (isFriendsLoading) {
      return (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 7 }} spacing="md">
          {Array.from({ length: 14 }).map((_, i) => {
            const skeletonKey = `friend-skeleton-${i}`;
            return <Skeleton key={skeletonKey} style={{ height: "220px", width: "100%", borderRadius: "12px" }} />;
          })}
        </SimpleGrid>
      );
    }

    if (allFriendships.length === 0) {
      return (
        <Box
          style={{
            textAlign: "center",
            paddingBlock: "48px",
            background: "var(--color-background-50)",
            borderRadius: "12px",
            border: "1px dashed var(--color-background-300)",
          }}
        >
          <Text c="var(--color-text-500)">{t("friends.noFriendsFound")}</Text>
        </Box>
      );
    }

    return (
      <VirtualGridList
        items={allFriendships}
        renderItem={friendship => <FriendCard friendship={friendship} />}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        rowHeight={220}
      />
    );
  };

  return (
    <Box py={48} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PageMeta title={pageTitle} />
      <Stack gap={40} maw={1280} mx="auto" px={16} w="100%" style={{ flexGrow: 1 }}>
        <Stack align="center" gap={32}>
          <Stack align="center">
            <Title
              order={1}
              fz={{ base: 30, md: 36 }}
              fw={900}
              c="var(--color-text-900)"
              ta="center"
              style={{ letterSpacing: "-0.025em" }}
            >
              {isUserLoading ? (
                <Skeleton style={{ width: "256px", height: "40px" }} />
              ) : (
                <Trans
                  i18nKey="friends.friendsTitle"
                  ns="users"
                  values={{ username: userDetails?.username }}
                  components={[<span style={{ color: "var(--mantine-color-primary-6)" }} key="username" />]}
                />
              )}
            </Title>
            {!isFriendsLoading && (
              <Box
                style={{
                  fontSize: "10px",
                  fontWeight: 900,
                  color: "var(--mantine-color-primary-6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: "8px",
                  padding: "4px 12px",
                  background: "var(--mantine-color-primary-0)",
                  borderRadius: "9999px",
                  border: "1px solid var(--mantine-color-primary-1)",
                }}
              >
                {t("friends.friendCount", { count: totalFriends })}
              </Box>
            )}
          </Stack>
        </Stack>

        <Box style={{ flexGrow: 1, minHeight: 600 }}>{renderFriendsContent()}</Box>
      </Stack>
    </Box>
  );
}
