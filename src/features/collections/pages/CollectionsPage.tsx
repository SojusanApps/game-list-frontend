import { Skeleton, Stack, Group, Box, Title, Text, Select, TextInput, UnstyledButton } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";

import { Collection, CollectionCollectionsListData } from "@/client";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { GridList } from "@/components/ui/GridList";
import { PageMeta } from "@/components/ui/PageMeta";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useIsOwner } from "@/features/auth";
import { useGetUserDetails } from "@/features/users/hooks/userQueries";

import CollectionCard from "../components/CollectionCard";
import CreateCollectionModal from "../components/CreateCollectionModal";
import { useCollectionsInfiniteQuery } from "../hooks/useCollectionQueries";

const routeApi = getRouteApi("/profile_/$id/$slug/collections");

export default function CollectionsPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const userId = Number(id);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: userDetails, isLoading: isUserLoading } = useGetUserDetails(userId);

  const isOwner = useIsOwner(userId);
  const { t } = useTranslation("collections");

  const skeletonIds = React.useMemo(() => Array.from({ length: 8 }).map((_, i) => `skeleton-${i}`), []);

  const [isFavoriteFilter, setIsFavoriteFilter] = React.useState<boolean | null>(null);
  const [visibilityFilter, setVisibilityFilter] = React.useState<string | null>(null);
  const [modeFilter, setModeFilter] = React.useState<string | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null);
  const [useMember, setUseMember] = React.useState(false);
  const [nameInput, setNameInput] = React.useState("");
  const [nameFilter, setNameFilter] = React.useState("");

  const commitNameFilter = () => setNameFilter(nameInput.trim());

  const queryFilters = React.useMemo(() => {
    const filters: Required<CollectionCollectionsListData>["query"] = {};
    if (isFavoriteFilter !== null) {
      filters.is_favorite = String(isFavoriteFilter);
    }
    if (visibilityFilter !== null) {
      filters.visibility = visibilityFilter;
    }
    if (modeFilter !== null) {
      filters.mode = modeFilter;
    }
    if (typeFilter !== null) {
      filters.type = typeFilter;
    }
    if (nameFilter !== "") {
      filters.name = nameFilter;
    }
    return filters;
  }, [isFavoriteFilter, visibilityFilter, modeFilter, typeFilter, nameFilter]);

  const {
    data: collectionsResults,
    error: errorFetchingData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCollectionsInfiniteQuery(userId, queryFilters, useMember);

  const pageTitle = isUserLoading
    ? t("list.loading")
    : t("list.collectionsPageTitle", { username: userDetails?.username });

  const allItems = collectionsResults?.pages.flatMap(page => page.results) || [];

  const favoriteFilters = [
    { id: null, label: t("list.filterAll"), emoji: "📂" },
    { id: true, label: t("list.filterFavorites"), emoji: "❤️" },
  ];

  const scopeFilters = [
    { id: false, label: t("list.filterMyOnly") },
    { id: true, label: t("list.filterIncludeShared") },
  ];

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={pageTitle} />
      <Stack gap={40} maw={1280} mx="auto" px={16}>
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
              <Trans
                i18nKey="list.collectionsTitle"
                ns="collections"
                values={{ username: userDetails?.username }}
                components={[<span style={{ color: "var(--mantine-color-primary-6)" }} key="username" />]}
              />
            </Title>
            {isOwner && (
              <Text
                span
                style={{
                  fontSize: "10px",
                  fontWeight: 900,
                  color: "var(--color-primary-tint-text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: "8px",
                  padding: "4px 12px",
                  background: "var(--color-primary-tint-bg)",
                  borderRadius: "9999px",
                  border: "1px solid var(--color-primary-tint-border)",
                }}
              >
                {t("list.ownerView")}
              </Text>
            )}
          </Stack>

          <Stack w="100%" gap={16}>
            <CollapsibleSection title={t("list.filters")}>
              <Box
                component="form"
                w="100%"
                maw={480}
                mx="auto"
                mt={16}
                onSubmit={e => {
                  e.preventDefault();
                  commitNameFilter();
                }}
              >
                <TextInput
                  id="name-filter"
                  placeholder={t("list.namePlaceholder")}
                  value={nameInput}
                  onChange={e => setNameInput(e.currentTarget.value)}
                  onBlur={commitNameFilter}
                  leftSection={<IconSearch size={18} color="var(--color-text-400)" />}
                  styles={{
                    input: {
                      background: "var(--color-background-100)",
                      border: "1px solid var(--color-background-300)",
                      borderRadius: "12px",
                    },
                  }}
                />
              </Box>
              <Box
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "24px",
                  paddingBlock: "16px",
                }}
              >
                {/* Favorite Filters */}
                <Stack gap={12}>
                  <Text
                    span
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      color: "var(--color-text-400)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginLeft: "4px",
                    }}
                  >
                    {t("list.filterType")}
                  </Text>
                  <Group wrap="wrap" gap={8}>
                    {favoriteFilters.map(filter => (
                      <UnstyledButton
                        key={String(filter.id)}
                        onClick={() => setIsFavoriteFilter(filter.id)}
                        style={{
                          padding: "8px 20px",
                          fontSize: "12px",
                          fontWeight: 900,
                          borderRadius: "12px",
                          border: "1px solid",
                          transition: "all 300ms",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          ...(isFavoriteFilter === filter.id
                            ? {
                                background: "var(--mantine-color-primary-6)",
                                color: "white",
                                borderColor: "var(--mantine-color-primary-6)",
                                boxShadow: "0 4px 6px -1px rgba(99,102,241,0.3)",
                              }
                            : {
                                background: "var(--color-background-100)",
                                color: "var(--color-text-500)",
                                borderColor: "var(--color-background-200)",
                              }),
                        }}
                      >
                        <Text span style={{ marginRight: "8px" }}>
                          {filter.emoji}
                        </Text>
                        {filter.label}
                      </UnstyledButton>
                    ))}
                  </Group>
                </Stack>

                {/* Scope Filter */}
                <Stack gap={12}>
                  <Text
                    span
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      color: "var(--color-text-400)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginLeft: "4px",
                    }}
                  >
                    {t("list.filterScope")}
                  </Text>
                  <Group wrap="wrap" gap={8}>
                    {scopeFilters.map(filter => (
                      <UnstyledButton
                        key={String(filter.id)}
                        onClick={() => setUseMember(filter.id)}
                        style={{
                          padding: "8px 20px",
                          fontSize: "12px",
                          fontWeight: 900,
                          borderRadius: "12px",
                          border: "1px solid",
                          transition: "all 300ms",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          ...(useMember === filter.id
                            ? {
                                background: "var(--mantine-color-primary-6)",
                                color: "white",
                                borderColor: "var(--mantine-color-primary-6)",
                                boxShadow: "0 4px 6px -1px rgba(99,102,241,0.3)",
                              }
                            : {
                                background: "var(--color-background-100)",
                                color: "var(--color-text-500)",
                                borderColor: "var(--color-background-200)",
                              }),
                        }}
                      >
                        {filter.label}
                      </UnstyledButton>
                    ))}
                  </Group>
                </Stack>

                {/* Visibility Filter */}
                <Select
                  id="visibility-filter"
                  label={t("list.filterVisibility")}
                  value={visibilityFilter}
                  onChange={setVisibilityFilter}
                  clearable
                  placeholder={t("list.anyVisibility")}
                  data={[
                    { value: "PUB", label: t("visibility.public") },
                    { value: "FRI", label: t("visibility.friends") },
                    { value: "PRI", label: t("visibility.private") },
                  ]}
                />

                {/* Mode Filter */}
                <Select
                  id="mode-filter"
                  label={t("list.filterMode")}
                  value={modeFilter}
                  onChange={setModeFilter}
                  clearable
                  placeholder={t("list.anyMode")}
                  data={[
                    { value: "S", label: t("mode.solo") },
                    { value: "C", label: t("mode.collaborative") },
                  ]}
                />

                {/* Type Filter */}
                <Select
                  id="type-filter"
                  label={t("list.filterType")}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  clearable
                  placeholder={t("list.anyType")}
                  data={[
                    { value: "NOR", label: t("type.normal") },
                    { value: "RNK", label: t("type.ranking") },
                    { value: "TIE", label: t("type.tierList") },
                  ]}
                />
              </Box>
            </CollapsibleSection>

            {isOwner && (
              <Group justify="center">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  style={{
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    borderRadius: 12,
                  }}
                >
                  {t("list.createNew")}
                </Button>
              </Group>
            )}
          </Stack>
        </Stack>

        <Box
          style={{
            background: "var(--color-background-100)",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid var(--color-background-200)",
            padding: "24px",
            minHeight: "850px",
          }}
        >
          {isLoading && !isFetchingNextPage ? (
            <GridList columnCount={5}>
              {skeletonIds.map(skeletonId => (
                <Skeleton key={skeletonId} style={{ aspectRatio: "3/4", width: "100%", borderRadius: "24px" }} />
              ))}
            </GridList>
          ) : (
            <VirtualGridList
              items={allItems}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              columnCount={5}
              rowHeight={450}
              renderItem={(collection: Collection) => <CollectionCard key={collection.id} collection={collection} />}
            />
          )}
          {errorFetchingData && (
            <Box
              style={{
                background: "var(--color-error-50)",
                border: "1px solid var(--color-error-200)",
                borderRadius: "12px",
                padding: "16px",
                marginTop: "16px",
              }}
            >
              <Text c="var(--color-error-600)" ta="center" fw={500}>
                Error: {errorFetchingData.message}
              </Text>
            </Box>
          )}
          {!isLoading && allItems.length === 0 && (
            <Stack align="center" justify="center" gap={16} style={{ paddingBlock: "80px", textAlign: "center" }}>
              <Box
                style={{
                  width: "80px",
                  height: "80px",
                  background: "var(--color-background-50)",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text span fz={36}>
                  📂
                </Text>
              </Box>
              <Title order={3} fz="lg" fw={700} c="var(--color-text-900)">
                {t("list.noCollections")}
              </Title>
              <Text c="var(--color-text-500)" maw={320}>
                {t("list.noCollectionsDesc")}
              </Text>
              {isOwner && (
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(true)}
                  style={{ marginTop: 24, fontWeight: 700 }}
                >
                  {t("list.createFirst")}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Stack>

      {isModalOpen && <CreateCollectionModal onClose={() => setIsModalOpen(false)} />}
    </Box>
  );
}
