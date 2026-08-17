import { ActionIcon, Modal, Stack, Group, Box, Title, Text, TextInput, UnstyledButton } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { useGetGamesList } from "@/features/games/hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

import { useAddCollectionItem } from "../hooks/useCollectionQueries";

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

  const { mutate: addItem, isPending: isAdding } = useAddCollectionItem();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleAddGame = (game: GameSimpleList) => {
    addItem(
      {
        collection: collectionId,
        game: game.id,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: t("addGame.successTitle"),
            message: t("addGame.successMessage", { title: game.title }),
            color: "green",
          });
          // Kept open for multiple adds as per user request
        },
        onError: error => {
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
          {gamesDetails.results.map(game => (
            <UnstyledButton
              key={game.id}
              onClick={() => handleAddGame(game)}
              disabled={isAdding}
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
                  color: "var(--color-primary-600)",
                  fontWeight: 700,
                  fontSize: "14px",
                  background: "var(--color-primary-100)",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                }}
              >
                {t("addGame.addButton")}
              </Box>
            </UnstyledButton>
          ))}
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
    <Modal
      opened={true}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="xl"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.6 }}
    >
      <Stack gap={0} style={{ height: "100%", maxHeight: "90vh" }}>
        {/* Header */}
        <Group
          justify="space-between"
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid var(--color-background-100)",
            background: "rgba(248,250,252,0.5)",
          }}
        >
          <Title order={2} fz={24} fw={900} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
            {t("addGame.titlePrefix")}{" "}
            <Text span c="var(--color-primary-600)">
              {t("addGame.titleHighlight")}
            </Text>
          </Title>
          <ActionIcon
            onClick={onClose}
            variant="subtle"
            size="lg"
            style={{ borderRadius: "9999px", color: "var(--color-text-400)" }}
          >
            <IconX style={{ width: 24, height: 24 }} />
          </ActionIcon>
        </Group>

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
        <Box style={{ flex: 1, overflowY: "auto", padding: "0 32px 32px" }}>{renderContent()}</Box>
      </Stack>
    </Modal>
  );
}
