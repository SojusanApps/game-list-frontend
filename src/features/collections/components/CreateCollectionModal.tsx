import {
  TextInput,
  Select,
  Checkbox,
  ActionIcon,
  Modal,
  Stack,
  Group,
  Box,
  ScrollArea,
  Title,
  Text,
} from "@mantine/core";
import { schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { VisibilityEnum, ModeEnum, TypeEnum, Friendship, CollectionDetail } from "@/client";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import { SafeImage } from "@/components/ui/SafeImage";
import { useModalDraft } from "@/hooks/useModalDraft";
import i18n from "@/lib/i18n";

import { useCreateCollection, useFriendSearch, useUpdateCollection } from "../hooks/useCollectionQueries";

const validationSchema = z.object({
  name: z.string().min(1, i18n.t("validation:nameRequired")).max(100),
  description: z.string().max(500).optional(),
  is_favorite: z.boolean(),
  visibility: z.enum(VisibilityEnum),
  mode: z.enum(ModeEnum),
  type: z.enum(TypeEnum),
  collaborators: z.array(z.string()),
});

type ValidationSchema = z.infer<typeof validationSchema>;

// `collaboratorObjects` carries the friend records behind the collaborator id list so
// the chips can be re-rendered when a draft is restored (the ids alone have no labels
// until re-searched). It is not sent to the backend — see `onSubmit`.
type CollectionFormValues = ValidationSchema & { collaboratorObjects: Friendship[] };

const collaboratorsToObjects = (collaborators: CollectionDetail["collaborators"] | undefined): Friendship[] =>
  (collaborators ?? []).map(user => ({ friend: user, user, id: -1, created_at: "" }) as unknown as Friendship);

interface CreateCollectionModalProps {
  onClose: () => void;
  initialData?: CollectionDetail;
  mode?: "create" | "edit";
}

export default function CreateCollectionModal({
  onClose,
  initialData,
  mode = "create",
}: Readonly<CreateCollectionModalProps>) {
  const { t } = useTranslation("collections");
  const { mutate: createCollection, isPending: isCreatePending } = useCreateCollection();
  const { mutate: updateCollection, isPending: isUpdatePending } = useUpdateCollection();

  const isPending = isCreatePending || isUpdatePending;

  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<CollectionFormValues>({
    draftKey: mode === "edit" && initialData ? `collection:${initialData.id}` : "collection:new",
    opened: true,
    baseline: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      is_favorite: initialData?.is_favorite ?? false,
      visibility: initialData?.visibility ?? VisibilityEnum.PUB,
      mode: initialData?.mode ?? ModeEnum.S,
      type: initialData?.type ?? TypeEnum.NOR,
      collaborators: initialData?.collaborators?.map(u => u.id.toString()) ?? [],
      collaboratorObjects: collaboratorsToObjects(initialData?.collaborators),
    },
    formOptions: { validate: schemaResolver(validationSchema) },
  });

  const selectedMode = form.values.mode;
  const selectedCollaboratorObjects = form.values.collaboratorObjects;
  const [prevSelectedMode, setPrevSelectedMode] = React.useState(selectedMode);

  if (selectedMode !== prevSelectedMode) {
    setPrevSelectedMode(selectedMode);
    if (selectedMode === ModeEnum.S) {
      form.setFieldValue("collaborators", []);
      form.setFieldValue("collaboratorObjects", []);
    }
  }

  const handleAddCollaborator = (friendship: Friendship) => {
    form.setFieldValue("collaboratorObjects", [...form.values.collaboratorObjects, friendship]);
  };

  const handleRemoveCollaborator = (friendship: Friendship) => {
    form.setFieldValue(
      "collaboratorObjects",
      form.values.collaboratorObjects.filter(f => f.friend.id !== friendship.friend.id),
    );
  };

  const removeCollaborator = (friendId: number) => {
    form.setFieldValue(
      "collaborators",
      form.values.collaborators.filter(id => id !== friendId.toString()),
    );
    form.setFieldValue(
      "collaboratorObjects",
      form.values.collaboratorObjects.filter(f => f.friend.id !== friendId),
    );
  };

  const onSubmit = (data: CollectionFormValues) => {
    const payload = {
      name: data.name,
      description: data.description,
      is_favorite: data.is_favorite,
      visibility: data.visibility,
      mode: data.mode,
      type: data.type,
      collaborators: data.collaborators.map(Number),
    };

    if (mode === "edit" && initialData) {
      updateCollection(
        { id: initialData.id, body: payload },
        {
          onSuccess: () => {
            notifications.show({
              title: t("createModal.successTitle"),
              message: t("createModal.updateSuccess"),
              color: "green",
            });
            clearDraft();
            onClose();
          },
          onError: error => {
            notifications.show({
              title: t("createModal.errorTitle"),
              message: error.message || t("createModal.updateFailed"),
              color: "red",
            });
          },
        },
      );
    } else {
      createCollection(payload, {
        onSuccess: () => {
          notifications.show({
            title: t("createModal.successTitle"),
            message: t("createModal.createSuccess"),
            color: "green",
          });
          clearDraft();
          onClose();
        },
        onError: error => {
          notifications.show({
            title: t("createModal.errorTitle"),
            message: error.message || t("createModal.createFailed"),
            color: "red",
          });
        },
      });
    }
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
            background: "rgba(var(--color-veil-rgb), 0.5)",
          }}
        >
          <Title order={2} fz={24} fw={900} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
            {mode === "create" ? t("createModal.createTitle") : t("createModal.editTitle")}{" "}
            <Text fz={24} fw={900} span c="var(--color-primary-600)">
              {t("createModal.collection")}
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

        {/* Body */}
        <ScrollArea
          style={{ flex: 1, height: 0, display: "flex", flexDirection: "column" }}
          viewportProps={{ style: { flex: 1, height: "auto", minHeight: 0, padding: 32 } }}
        >
          <form id="create-collection-form" onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="lg">
              {hasDraft && <DraftNotice onDiscard={discardDraft} />}
              <TextInput
                id="name-input"
                label={t("createModal.nameLabel")}
                name="name"
                placeholder={t("createModal.namePlaceholder")}
                required
                {...form.getInputProps("name")}
              />

              <TextInput
                id="description-input"
                label={t("createModal.descriptionLabel")}
                name="description"
                placeholder={t("createModal.descriptionPlaceholder")}
                {...form.getInputProps("description")}
              />

              <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Select
                  id="visibility-select"
                  label={t("createModal.visibilityLabel")}
                  name="visibility"
                  placeholder={t("createModal.visibilityPlaceholder")}
                  searchable
                  clearable
                  data={[
                    { value: VisibilityEnum.PUB, label: t("visibility.public") },
                    { value: VisibilityEnum.FRI, label: t("visibility.friendsOnly") },
                    { value: VisibilityEnum.PRI, label: t("visibility.private") },
                  ]}
                  {...form.getInputProps("visibility")}
                />
                <Select
                  id="mode-select"
                  label={t("createModal.modeLabel")}
                  name="mode"
                  placeholder={t("createModal.modePlaceholder")}
                  searchable
                  clearable
                  data={[
                    { value: ModeEnum.S, label: t("mode.solo") },
                    { value: ModeEnum.C, label: t("mode.collaborative") },
                  ]}
                  {...form.getInputProps("mode")}
                />
              </Box>

              <Select
                id="type-select"
                label={t("createModal.typeLabel")}
                name="type"
                placeholder={t("createModal.typePlaceholder")}
                searchable
                clearable
                data={[
                  { value: TypeEnum.NOR, label: t("type.normal") },
                  { value: TypeEnum.RNK, label: t("type.ranking") },
                  { value: TypeEnum.TIE, label: t("type.tierList") },
                ]}
                {...form.getInputProps("type")}
              />

              {selectedMode === ModeEnum.C && (
                <Stack gap="md">
                  <AsyncMultiSelectAutocomplete<Friendship>
                    id="collaborators"
                    name="collaborators"
                    label={t("createModal.collaboratorsLabel")}
                    placeholder={t("createModal.collaboratorsPlaceholder")}
                    useInfiniteQueryHook={useFriendSearch}
                    getOptionLabel={item => item.friend.username}
                    getOptionValue={item => item.friend.id}
                    hideTags
                    onAdd={handleAddCollaborator}
                    onRemove={handleRemoveCollaborator}
                    selectedItems={selectedCollaboratorObjects}
                    // The modal body scrolls and has a sticky footer, so the dropdown
                    // must portal out (and be allowed to flip) or it hides behind the buttons.
                    comboboxProps={{ withinPortal: true, middlewares: { flip: true, shift: true } }}
                    renderOption={item => (
                      <Group gap={12}>
                        <Box
                          style={{ width: 24, height: 24, borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}
                        >
                          <SafeImage src={item.friend.gravatar_url} alt={item.friend.username} />
                        </Box>
                        <Text span fw={500}>
                          {item.friend.username}
                        </Text>
                      </Group>
                    )}
                    {...form.getInputProps("collaborators")}
                  />

                  {/* Selected Collaborators Special Area */}
                  {selectedCollaboratorObjects.length > 0 && (
                    <Stack
                      gap="xs"
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        background: "var(--color-background-50)",
                        border: "1px solid var(--color-background-100)",
                      }}
                    >
                      <Text
                        fz={10}
                        fw={700}
                        c="var(--color-text-400)"
                        style={{ textTransform: "uppercase", letterSpacing: "0.1em", paddingInline: 4 }}
                      >
                        {t("createModal.selectedCollaborators")}
                      </Text>
                      <Group wrap="wrap" gap={8}>
                        {selectedCollaboratorObjects.map(f => (
                          <Group
                            key={f.friend.id}
                            gap={8}
                            style={{
                              paddingLeft: 6,
                              paddingRight: 10,
                              paddingBlock: 6,
                              background: "var(--color-background-100)",
                              borderRadius: "9999px",
                              border: "1px solid var(--color-background-200)",
                            }}
                          >
                            <Box
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "9999px",
                                overflow: "hidden",
                                flexShrink: 0,
                                boxShadow: "0 0 0 1px var(--color-background-100)",
                              }}
                            >
                              <SafeImage src={f.friend.gravatar_url} alt={f.friend.username} />
                            </Box>
                            <Text span fz="xs" fw={700} c="var(--color-text-700)">
                              {f.friend.username}
                            </Text>
                            <ActionIcon
                              type="button"
                              onClick={() => removeCollaborator(f.friend.id)}
                              variant="subtle"
                              size="xs"
                              style={{ borderRadius: "9999px", color: "var(--color-text-400)" }}
                            >
                              <IconX style={{ width: 14, height: 14 }} />
                            </ActionIcon>
                          </Group>
                        ))}
                      </Group>
                    </Stack>
                  )}
                </Stack>
              )}

              <Checkbox
                id="is_favorite_checkbox"
                label={t("createModal.favoriteLabel")}
                name="is_favorite"
                {...form.getInputProps("is_favorite", { type: "checkbox" })}
              />
            </Stack>
          </form>
        </ScrollArea>

        {/* Footer */}
        <Group
          gap={12}
          style={{
            padding: "24px 32px",
            borderTop: "1px solid var(--color-background-100)",
            background: "rgba(var(--color-veil-rgb), 0.5)",
          }}
        >
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            style={{ fontWeight: 700, paddingBlock: 12 }}
          >
            {t("createModal.cancelButton")}
          </Button>
          <Button
            form="create-collection-form"
            type="submit"
            fullWidth
            isLoading={isPending}
            style={{ fontWeight: 900, paddingBlock: 12 }}
          >
            {mode === "create" ? t("createModal.createButton") : t("createModal.saveButton")}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
