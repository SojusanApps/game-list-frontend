import { TextInput, Select, Checkbox, ActionIcon, Modal, Stack, Group, Box, Title, Text } from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { VisibilityEnum, ModeEnum, TypeEnum, Friendship, CollectionDetail } from "@/client";
import { Button } from "@/components/ui/Button";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import { SafeImage } from "@/components/ui/SafeImage";
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

  const [selectedCollaboratorObjects, setSelectedCollaboratorObjects] = React.useState<Friendship[]>([]);
  const [prevMode, setPrevMode] = React.useState(mode);
  const [prevInitialData, setPrevInitialData] = React.useState(initialData);

  if (mode !== prevMode || initialData !== prevInitialData) {
    setPrevMode(mode);
    setPrevInitialData(initialData);
    if (mode === "edit" && initialData?.collaborators) {
      const initialCollaborators = initialData.collaborators.map(user => ({
        friend: user,
        user: user,
        id: -1,
        created_at: "",
      }));
      setSelectedCollaboratorObjects(initialCollaborators as Friendship[]);
    }
  }

  const form = useForm<ValidationSchema>({
    initialValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      is_favorite: initialData?.is_favorite ?? false,
      visibility: initialData?.visibility ?? VisibilityEnum.PUB,
      mode: initialData?.mode ?? ModeEnum.S,
      type: initialData?.type ?? TypeEnum.NOR,
      collaborators: initialData?.collaborators?.map(u => u.id.toString()) ?? [],
    },
    validate: schemaResolver(validationSchema),
  });

  const selectedMode = form.values.mode;
  const [prevSelectedMode, setPrevSelectedMode] = React.useState(form.values.mode);

  if (selectedMode !== prevSelectedMode) {
    setPrevSelectedMode(selectedMode);
    if (selectedMode === ModeEnum.S) {
      form.setFieldValue("collaborators", []);
      setSelectedCollaboratorObjects([]);
    }
  }

  const handleAddCollaborator = (friendship: Friendship) => {
    setSelectedCollaboratorObjects(prev => [...prev, friendship]);
  };

  const handleRemoveCollaborator = (friendship: Friendship) => {
    setSelectedCollaboratorObjects(prev => prev.filter(f => f.friend.id !== friendship.friend.id));
  };

  const removeCollaborator = (friendId: number) => {
    const currentCollaborators = form.values.collaborators;
    form.setFieldValue(
      "collaborators",
      currentCollaborators.filter(id => id !== friendId.toString()),
    );
    setSelectedCollaboratorObjects(prev => prev.filter(f => f.friend.id !== friendId));
  };

  const onSubmit = (data: ValidationSchema) => {
    const payload = {
      ...data,
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
            background: "rgba(248,250,252,0.5)",
          }}
        >
          <Title order={2} fz={24} fw={900} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
            {mode === "create" ? t("createModal.createTitle") : t("createModal.editTitle")}{" "}
            <Text span c="var(--color-primary-600)">
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
        <Box style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          <form id="create-collection-form" onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="lg">
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
                              background: "white",
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
        </Box>

        {/* Footer */}
        <Group
          gap={12}
          style={{
            padding: "24px 32px",
            borderTop: "1px solid var(--color-background-100)",
            background: "rgba(248,250,252,0.5)",
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
