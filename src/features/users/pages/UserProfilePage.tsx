import { Box, Grid, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { getRouteApi, Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { TargetTypeEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCurrentUserId } from "@/features/auth";
import { ReportButton } from "@/features/moderation/components/ReportButton";
import { WarnAndRemoveButton } from "@/features/moderation/components/WarnAndRemoveButton";

import { AdminActionsPanel } from "../components/AdminActionsPanel";
import FriendshipButtons from "../components/FriendshipButtons";
import GameListUpdate from "../components/GameListUpdate";
import UserFriendsList from "../components/UserFriendsList";
import UserProfileInformation from "../components/UserProfileInformation";
import UserStatistics from "../components/UserStatistics";
import { useGetUserDetails } from "../hooks/userQueries";

const routeApi = getRouteApi("/profile/$id/$slug");

export default function UserProfilePage(): React.JSX.Element {
  const { id, slug } = routeApi.useParams();
  const validUserId = Number(id);

  const { data: userDetails, isLoading: isUserDetailsLoading } = useGetUserDetails(validUserId);
  const currentUserId = useCurrentUserId();
  const { data: currentUserDetails } = useGetUserDetails(currentUserId ?? undefined);
  const { t } = useTranslation("users");

  const pageTitle = isUserDetailsLoading
    ? t("profile.loading")
    : t("profile.pageTitle", { username: userDetails?.username });

  const isOwnProfile = Number(currentUserId) === Number(validUserId);

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Grid gap={24} maw={1152} mx="auto" px={16}>
        <PageMeta title={pageTitle} />

        {isUserDetailsLoading ? (
          <>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Stack gap={16}>
                <Skeleton w="100%" h={192} style={{ borderRadius: 12 }} />
                <Skeleton w="100%" h={40} style={{ borderRadius: 8 }} />
                <Skeleton w="100%" h={40} style={{ borderRadius: 8 }} />
                <Skeleton w="100%" h={128} style={{ borderRadius: 12 }} />
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 9 }}>
              <Stack gap={16}>
                <Skeleton w="33%" h={32} style={{ borderRadius: 8 }} />
                <Skeleton w="100%" h={192} style={{ borderRadius: 12 }} />
                <Skeleton w="100%" h={256} style={{ borderRadius: 12 }} />
              </Stack>
            </Grid.Col>
          </>
        ) : (
          <>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Stack gap={16}>
                <Box
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: "1px solid var(--color-background-200)",
                  }}
                >
                  <SafeImage
                    style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
                    src={userDetails?.gravatar_url || undefined}
                    alt={t("profile.userAvatarAlt")}
                  />
                  <Group gap={4} style={{ position: "absolute", top: 8, right: 8 }}>
                    <ReportButton
                      targetType={TargetTypeEnum.AVATAR}
                      targetId={validUserId}
                      ownerId={validUserId}
                      ownerUsername={userDetails?.username ?? ""}
                    />
                    <WarnAndRemoveButton
                      targetType={TargetTypeEnum.AVATAR}
                      targetId={validUserId}
                      ownerId={validUserId}
                      ownerUsername={userDetails?.username ?? ""}
                    />
                  </Group>
                </Box>

                {!isOwnProfile && <FriendshipButtons currentUserId={currentUserId} userId={validUserId} />}

                <Link
                  to={"/game-list/$id/$slug"}
                  params={{ id, slug }}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <Button fullWidth variant="default">
                    {t("profile.gameListButton")}
                  </Button>
                </Link>

                <Link
                  to={"/profile/$id/$slug/collections"}
                  params={{ id, slug }}
                  style={{ width: "100%", textDecoration: "none" }}
                >
                  <Button fullWidth variant="outline">
                    {t("profile.collectionsButton")}
                  </Button>
                </Link>

                {!isOwnProfile && currentUserId && (
                  <Link
                    to={"/game-list/compare/$firstUserId/$firstUserSlug/$secondUserId/$secondUserSlug"}
                    params={{
                      firstUserId: String(currentUserId),
                      firstUserSlug: currentUserDetails?.slug ?? "",
                      secondUserId: id,
                      secondUserSlug: slug,
                    }}
                    style={{ width: "100%", textDecoration: "none" }}
                  >
                    <Button fullWidth variant="outline">
                      {t("profile.compareButton")}
                    </Button>
                  </Link>
                )}

                <UserProfileInformation userDetails={userDetails} />
                {userDetails && (
                  <AdminActionsPanel userId={validUserId} isTargetStaff={!!userDetails.is_staff} />
                )}
                <UserFriendsList userDetails={userDetails} />
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
              <Stack gap={24}>
                <Group gap={8} align="center">
                  <Title order={1} fz={30} fw={700} c="var(--color-text-900)">
                    {userDetails?.username}
                  </Title>
                  <ReportButton
                    targetType={TargetTypeEnum.USERNAME}
                    targetId={validUserId}
                    ownerId={validUserId}
                    ownerUsername={userDetails?.username ?? ""}
                  />
                  <WarnAndRemoveButton
                    targetType={TargetTypeEnum.USERNAME}
                    targetId={validUserId}
                    ownerId={validUserId}
                    ownerUsername={userDetails?.username ?? ""}
                  />
                </Group>

                <Box
                  component="section"
                  style={{
                    background: "var(--color-background-100)",
                    borderRadius: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    border: "1px solid var(--color-background-200)",
                    padding: 24,
                  }}
                >
                  <Title order={2} fz={18} fw={700} c="var(--color-text-900)" mb={16}>
                    {t("profile.statistics")}
                  </Title>
                  <UserStatistics userDetails={userDetails} />
                </Box>

                <Box
                  component="section"
                  style={{
                    background: "var(--color-background-100)",
                    borderRadius: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    border: "1px solid var(--color-background-200)",
                    padding: 24,
                  }}
                >
                  <Group
                    justify="space-between"
                    align="center"
                    pb={16}
                    mb={16}
                    style={{ borderBottom: "1px solid var(--color-background-200)" }}
                  >
                    <Title order={2} fz={18} fw={700} c="var(--color-text-900)">
                      {t("profile.lastUpdates")}
                    </Title>
                    <Link
                      to={"/game-list/$id/$slug"}
                      params={{ id, slug }}
                      style={{ fontSize: 13, fontWeight: 500, color: "var(--mantine-color-primary-6)" }}
                    >
                      {t("profile.viewHistory")}
                    </Link>
                  </Group>

                  <Stack gap={12}>
                    {userDetails?.latest_game_list_updates.length === 0 ? (
                      <Text size="sm" fs="italic" c="var(--color-text-500)">
                        {t("profile.noLastUpdates")}
                      </Text>
                    ) : (
                      userDetails?.latest_game_list_updates.map(latestGameListUpdate => (
                        <GameListUpdate key={latestGameListUpdate.id} latestGameListUpdate={latestGameListUpdate} />
                      ))
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid.Col>
          </>
        )}
      </Grid>
    </Box>
  );
}
