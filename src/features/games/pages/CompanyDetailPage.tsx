import { Box, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { getRouteApi } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { PageMeta } from "@/components/ui/PageMeta";
import { SafeImage } from "@/components/ui/SafeImage";
import { VirtualGridList } from "@/components/ui/VirtualGridList";

import { useGetCompanyDetail } from "../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

const routeApi = getRouteApi("/company/$id/$slug");

export default function CompanyDetailPage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const { id } = routeApi.useParams();
  const companyId = Number(id);
  const { data: companyDetails, isLoading: isCompanyLoading } = useGetCompanyDetail(companyId);

  const developedGamesList = companyDetails?.games_developed || [];
  const publishedGamesList = companyDetails?.games_published || [];

  const developedCount = developedGamesList.length;
  const publishedCount = publishedGamesList.length;

  const pageTitle = isCompanyLoading ? t("company.loading") : companyDetails?.name;

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Stack gap={24} maw={1152} mx="auto" px={16}>
        <PageMeta title={pageTitle} />

        {isCompanyLoading ? (
          <Stack gap={24}>
            <Group align="flex-start" gap={24} wrap="wrap">
              <Skeleton w={128} h={128} style={{ borderRadius: 12, flexShrink: 0 }} />
              <Stack gap={16} style={{ flex: 1 }}>
                <Skeleton w="50%" h={40} style={{ borderRadius: 8 }} />
                <Skeleton w="100%" h={96} style={{ borderRadius: 12 }} />
              </Stack>
            </Group>
            <Skeleton w="100%" h={64} style={{ borderRadius: 12 }} />
            <Skeleton w="100%" h={64} style={{ borderRadius: 12 }} />
          </Stack>
        ) : (
          <>
            <Box
              style={{
                background: "white",
                borderRadius: 16,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)",
                border: "1px solid var(--color-background-200)",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  height: 128,
                  background:
                    "linear-gradient(to right, var(--mantine-color-primary-7), var(--mantine-color-primary-9))",
                }}
              />
              <Box style={{ padding: "0 32px 32px", marginTop: -64 }}>
                <Group align="flex-end" wrap="wrap" gap={32}>
                  <Box
                    style={{
                      width: 128,
                      height: 128,
                      flexShrink: 0,
                      borderRadius: 16,
                      overflow: "hidden",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
                      border: "4px solid white",
                      background: "white",
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SafeImage
                      style={{ width: "100%", height: "100%" }}
                      objectFit="contain"
                      src={
                        companyDetails?.company_logo_id
                          ? `${getIGDBImageURL(companyDetails.company_logo_id, IGDBImageSize.LOGO_MED_284_160)}`
                          : undefined
                      }
                      alt={companyDetails?.name}
                    />
                  </Box>

                  <Stack gap={12} pb={8} style={{ flex: 1 }}>
                    <Group gap={12}>
                      <Text
                        component="span"
                        style={{
                          background: "var(--mantine-color-primary-6)",
                          color: "white",
                          fontSize: 10,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          padding: "3px 10px",
                          borderRadius: 6,
                        }}
                      >
                        {t("company.badge")}
                      </Text>
                    </Group>
                    <Title
                      order={1}
                      fz={{ base: 32, md: 44 }}
                      fw={900}
                      c="var(--color-text-900)"
                      style={{ letterSpacing: "-0.03em", lineHeight: 1 }}
                    >
                      {companyDetails?.name}
                    </Title>
                  </Stack>
                </Group>
              </Box>
            </Box>

            <CollapsibleSection title={t("company.gamesDeveloped")} count={developedCount} defaultOpen={false}>
              {developedGamesList.length > 0 ? (
                <VirtualGridList
                  items={developedGamesList}
                  hasNextPage={false}
                  isFetchingNextPage={false}
                  fetchNextPage={() => {}}
                  style={{ height: 600 }}
                  renderItem={game => (
                    <ItemOverlay
                      itemPageUrl={`/game/${game.id}/${game.slug}`}
                      itemCoverUrl={
                        game.cover_image_id
                          ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
                          : null
                      }
                      name={game.title}
                    />
                  )}
                />
              ) : (
                <Text fs="italic" c="var(--color-text-500)">
                  {t("company.noGamesDeveloped")}
                </Text>
              )}
            </CollapsibleSection>

            <CollapsibleSection title={t("company.gamesPublished")} count={publishedCount} defaultOpen={false}>
              {publishedGamesList.length > 0 ? (
                <VirtualGridList
                  items={publishedGamesList}
                  hasNextPage={false}
                  isFetchingNextPage={false}
                  fetchNextPage={() => {}}
                  style={{ height: 600 }}
                  renderItem={game => (
                    <ItemOverlay
                      itemPageUrl={`/game/${game.id}/${game.slug}`}
                      itemCoverUrl={
                        game.cover_image_id
                          ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
                          : null
                      }
                      name={game.title}
                    />
                  )}
                />
              ) : (
                <Text fs="italic" c="var(--color-text-500)">
                  {t("company.noGamesPublished")}
                </Text>
              )}
            </CollapsibleSection>
          </>
        )}
      </Stack>
    </Box>
  );
}
