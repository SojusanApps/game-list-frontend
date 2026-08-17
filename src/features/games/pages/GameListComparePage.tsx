import { Box, Skeleton, Stack, Title } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { PageMeta } from "@/components/ui/PageMeta";
import { useGetUserDetails } from "@/features/users/hooks/userQueries";

import { CompareUserChip } from "../components/CompareUserChip";
import { GameListCompareTable } from "../components/GameListCompareTable";
import { useGameListCompareQuery } from "../hooks/useGameListQueries";
import { buildCompareSections } from "../utils/gameListCompare";

const routeApi = getRouteApi("/game-list/compare/$firstUserId/$firstUserSlug/$secondUserId/$secondUserSlug");

export default function GameListComparePage(): React.JSX.Element {
  const { firstUserId, secondUserId } = routeApi.useParams();
  const firstId = Number(firstUserId);
  const secondId = Number(secondUserId);

  const { data: firstUserDetails, isLoading: isFirstUserLoading } = useGetUserDetails(firstId);
  const { data: secondUserDetails, isLoading: isSecondUserLoading } = useGetUserDetails(secondId);
  const { data: compareData, isLoading: isCompareLoading } = useGameListCompareQuery(firstId, secondId);
  const { t } = useTranslation("games");

  const isLoading = isFirstUserLoading || isSecondUserLoading || isCompareLoading;
  const hasUserDetails = !!firstUserDetails && !!secondUserDetails;

  const pageTitle = hasUserDetails
    ? t("compare.pageTitle", {
        firstUsername: firstUserDetails.username,
        secondUsername: secondUserDetails.username,
      })
    : t("compare.loading");

  const sections = compareData ? buildCompareSections(compareData) : [];

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={pageTitle} />
      <Stack gap={40} maw={1280} mx="auto" px={16}>
        <Title
          order={1}
          fz={{ base: 30, md: 36 }}
          fw={700}
          c="var(--color-text-900)"
          ta="center"
          style={{ letterSpacing: "-0.025em" }}
        >
          {hasUserDetails ? (
            <Trans
              i18nKey="compare.title"
              ns="games"
              components={[
                <CompareUserChip userDetails={firstUserDetails} key="first" />,
                <CompareUserChip userDetails={secondUserDetails} key="second" />,
              ]}
            />
          ) : (
            pageTitle
          )}
        </Title>

        {isLoading || !hasUserDetails ? (
          <Stack gap={24}>
            <Skeleton height={32} width="40%" mx="auto" />
            <Skeleton height={300} />
          </Stack>
        ) : (
          <Stack gap={24}>
            {sections.map(section => (
              <GameListCompareTable
                key={section.key}
                section={section}
                firstUserDetails={firstUserDetails}
                secondUserDetails={secondUserDetails}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
