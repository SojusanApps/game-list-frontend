import { Stack, Text } from "@mantine/core";
import { schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Collection, ModeEnum } from "@/client";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import { useCurrentUserId } from "@/features/auth";
import { useModalDraft } from "@/hooks/useModalDraft";
import i18n from "@/lib/i18n";

import { useCollectionsInfiniteQuery, useAddCollectionItem } from "../hooks/useCollectionQueries";
import { COLLECTION_BADGE_STYLE, getModeBadgeStyle } from "../utils/collectionBadgeStyles";
import { isSharedCollection } from "../utils/sharedCollection";

const validationSchema = z.object({
  collections: z.array(z.string()).min(1, i18n.t("validation:selectAtLeastOne")),
});

type ValidationSchema = z.infer<typeof validationSchema>;

interface AddToCollectionModalProps {
  onClose: () => void;
  gameId: number;
}

export default function AddToCollectionModal({ onClose, gameId }: Readonly<AddToCollectionModalProps>) {
  const currentUserId = useCurrentUserId();
  const { t } = useTranslation("collections");

  const { mutateAsync: addCollectionItem, isPending } = useAddCollectionItem();

  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<ValidationSchema>({
    draftKey: `add-to-collection:${gameId}`,
    opened: true,
    baseline: { collections: [] },
    formOptions: { validate: schemaResolver(validationSchema) },
  });

  // Wrapper hook for AsyncMultiSelectAutocomplete. The `member` scope covers the user's own collections plus
  // those shared with them (collaborative collections they were added to).
  const useMyCollectionsSearch = (searchTerm: string) => {
    return useCollectionsInfiniteQuery(currentUserId || undefined, { name: searchTerm }, "member");
  };

  const renderCollectionOption = (collection: Collection) => {
    if (!isSharedCollection(collection, currentUserId)) {
      return <Text span>{collection.name}</Text>;
    }
    return (
      <Stack gap={2}>
        <Text span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Text span truncate="end">
            {collection.name}
          </Text>
          <Text span style={{ ...COLLECTION_BADGE_STYLE, ...getModeBadgeStyle(ModeEnum.C), whiteSpace: "nowrap" }}>
            {t("addModal.shared")}
          </Text>
        </Text>
        <Text span fz="xs" c="dimmed">
          {t("addModal.sharedBy", { username: collection.user.username })}
        </Text>
      </Stack>
    );
  };

  const onSubmit = async (data: ValidationSchema) => {
    try {
      await Promise.all(
        data.collections.map(collectionId =>
          addCollectionItem({
            collection: Number(collectionId),
            game: gameId,
          }),
        ),
      );
      notifications.show({ title: t("addModal.successTitle"), message: t("addModal.addSuccess"), color: "green" });
      clearDraft();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("addModal.addFailed");
      notifications.show({ title: t("addModal.errorTitle"), message: errorMessage, color: "red" });
    }
  };

  return (
    <AppModal
      opened={true}
      onClose={onClose}
      title={t("addModal.title")}
      overflowVisible
      footer={
        <Button type="submit" form="add-to-collection-form" disabled={isPending} fullWidth>
          {isPending ? t("addModal.adding") : t("addModal.addButton")}
        </Button>
      }
    >
      <form id="add-to-collection-form" onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="lg">
          {hasDraft && <DraftNotice onDiscard={discardDraft} />}
          <AsyncMultiSelectAutocomplete
            id="collections"
            name="collections"
            label={t("addModal.selectLabel")}
            placeholder={t("addModal.selectPlaceholder")}
            useInfiniteQueryHook={useMyCollectionsSearch}
            getOptionLabel={(collection: Collection) => collection.name}
            getOptionValue={(collection: Collection) => collection.id}
            renderOption={renderCollectionOption}
            required
            {...form.getInputProps("collections")}
          />
        </Stack>
      </form>
    </AppModal>
  );
}
