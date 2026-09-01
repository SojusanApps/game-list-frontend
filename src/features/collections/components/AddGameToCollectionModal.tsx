import { Loader, Stack, Box, ScrollArea, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { AppModal } from "@/components/ui/AppModal";
import { SafeImage } from "@/components/ui/SafeImage";
import { useGetGamesList } from "@/features/games/hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

import { useAddCollectionItem, useCollectionItemsInfiniteQuery } from "../hooks/useCollectionQueries";

interface AddGameToCollectionModalProps {
  onClose: () => void;
  collectionId: number;
}

export default function AddGameToCollectionModal({
  onClose,
  collectionId,
}: Readonly<AddGameToCollectionModalProps>): React.JSX.Element {
  const { t } = useTranslation("collections");
  const [search, setSearch] = React.useState<string>("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data: gamesDetails, isLoading: isSearchLoading } = useGetGamesList(
    { title: debouncedSearch },
    { enabled: debouncedSearch.length > 1 },
  );

  const { mutate: addItem } = useAddCollectionItem();
  const [pendingGameIds, setPendingGameIds] = React.useState<Set<number>>(new Set());

  const {
    data: collectionItemsData,
    fetchNextPage: fetchNextCollectionItemsPage,
    hasNextPage: hasNextCollectionItemsPage,
  } = useCollectionItemsInfiniteQuery(collectionId);

  React.useEffect(() => {
    if (hasNextCollectionItemsPage) {
      fetchNextCollectionItemsPage();
    }
  }, [hasNextCollectionItemsPage, fetchNextCollectionItemsPage, collectionItemsData]);

  const existingGameIds = React.useMemo(
    () => new Set(collectionItemsData?.pages.flatMap(page => page.results.map(item => item.game.id)) || []),
    [collectionItemsData],
  );

  React.useEffect(() => {
    setPendingGameIds(prev => {
      if (![...prev].some(id => existingGameIds.has(id))) {
        return prev;
      }
      const next = new Set([...prev].filter(id => !existingGameIds.has(id)));
      return next;
    });
  }, [existingGameIds]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleAddGame = (game: GameSimpleList) => {
    if (existingGameIds.has(game.id) || pendingGameIds.has(game.id)) {
      return;
    }

    setPendingGameIds(prev => new Set(prev).add(game.id));

    const clearPending = () => {
      setPendingGameIds(prev => {
        const next = new Set(prev);
        next.delete(game.id);
        return next;
      });
    };

    addItem(
      {
        collection: collectionId,
        game: game.id,
      },
      {
        onSuccess: () => {
          // Pending state is cleared once existingGameIds picks up the
          // invalidated query refetch, so the spinner stays until "Added" is real.
          notifications.show({
            title: t("addGame.successTitle"),
            message: t("addGame.successMessage", { title: game.title }),
            color: "green",
          });
          // Kept open for multiple adds as per user request
        },
        onError: error => {
          clearPending();
          notifications.show({
            title: t("addGame.errorTitle"),
            message: error.message || t("addGame.errorMessage"),
            color: "red",
          });
        },
      },
    );
  };

  const renderContent = () => {
    if (isSearchLoading) {
      return (
        <Text
          py={48}
          ta="center"
          c="var(--color-text-400)"
          fw={500}
          style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
        >
          {t("addGame.searching")}
        </Text>
      );
    }

    if (search.length > 1 && gamesDetails?.results) {
      if (gamesDetails.results.length === 0) {
        return (
          <Text py={48} ta="center" c="var(--color-text-400)" fw={500}>
            {t("addGame.noResults", { search })}
          </Text>
        );
      }

      return (
        <Stack gap={8}>
          {gamesDetails.results.map(game => {
            const isAlreadyAdded = existingGameIds.has(game.id);
            const isPendingAdd = pendingGameIds.has(game.id);
            const addButtonLabel = isAlreadyAdded ? t("addGame.addedButton") : t("addGame.addButton");

            return (
              <UnstyledButton
                key={game.id}
                onClick={() => handleAddGame(game)}
                disabled={isAlreadyAdded || isPendingAdd}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid transparent",
                  width: "100%",
                  textAlign: "left",
                  transition: "all 200ms",
                  opacity: isAlreadyAdded ? 0.6 : 1,
                  cursor: isAlreadyAdded || isPendingAdd ? "default" : "pointer",
                }}
              >
                <Box
                  style={{
                    position: "relative",
                    width: 48,
                    height: 64,
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                    background: "var(--color-background-200)",
                  }}
                >
                  <SafeImage
                    src={
                      game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.THUMB_90_90) : undefined
                    }
                    alt={game.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text span fw={700} c="var(--color-text-900)">
                    {game.title}
                  </Text>
                  {game.release_date && (
                    <Text span fz="xs" c="var(--color-text-500)" fw={500} style={{ letterSpacing: "0.05em" }}>
                      {new Date(game.release_date).getFullYear()}
                    </Text>
                  )}
                </Stack>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 64,
                    color: isAlreadyAdded ? "var(--color-text-500)" : "var(--color-primary-600)",
                    fontWeight: 700,
                    fontSize: "14px",
                    background: isAlreadyAdded ? "var(--color-background-200)" : "var(--color-primary-100)",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                  }}
                >
                  {isPendingAdd ? <Loader size={14} color="var(--color-primary-600)" /> : addButtonLabel}
                </Box>
              </UnstyledButton>
            );
          })}
        </Stack>
      );
    }

    return (
      <Stack align="center" justify="center" gap={16} py={48} c="var(--color-text-400)">
        <IconSearch style={{ width: 48, height: 48, opacity: 0.2 }} />
        <Text fw={500}>{t("addGame.typeToSearch")}</Text>
      </Stack>
    );
  };

  return (
    <AppModal
      opened={true}
      onClose={onClose}
      bodyPadding={0}
      title={
        <>
          {t("addGame.titlePrefix")}{" "}
          <Text span inherit c="var(--color-primary-600)">
            {t("addGame.titleHighlight")}
          </Text>
        </>
      }
    >
      <Stack gap={0}>
        {/* Search Input Area */}
        <Box p={32} pb={16}>
          <TextInput
            placeholder={t("addGame.searchPlaceholder")}
            leftSection={<IconSearch style={{ width: 24, height: 24, color: "var(--color-text-400)" }} />}
            autoComplete="off"
            size="lg"
            onChange={handleInputChange}
            value={search}
            style={{ width: "100%" }}
          />
        </Box>

        {/* Results List */}
        <ScrollArea.Autosize mah="55vh" viewportProps={{ style: { padding: "0 32px 32px" } }}>
          {renderContent()}
        </ScrollArea.Autosize>
      </Stack>
    </AppModal>
  );
}
