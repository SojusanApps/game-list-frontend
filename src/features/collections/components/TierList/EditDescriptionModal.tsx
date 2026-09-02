import { Box, Group, Stack, Text, Textarea } from "@mantine/core";
import { schemaResolver } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { useModalDraft } from "@/hooks/useModalDraft";
import i18n from "@/lib/i18n";

const validationSchema = z.object({
  description: z.string().max(500, i18n.t("validation:descriptionMax")),
});

type ValidationSchema = z.infer<typeof validationSchema>;

interface EditDescriptionModalProps {
  itemId: number;
  isOpen: boolean;
  onClose: () => void;
  initialDescription?: string;
  gameName: string;
  onSave: (description: string) => void;
}

export const EditDescriptionModal = ({
  itemId,
  isOpen,
  onClose,
  initialDescription = "",
  gameName,
  onSave,
}: Readonly<EditDescriptionModalProps>) => {
  const { t } = useTranslation("collections");
  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<ValidationSchema>({
    draftKey: `tier-item-description:${itemId}`,
    opened: isOpen,
    baseline: { description: initialDescription },
    formOptions: { validate: schemaResolver(validationSchema) },
  });

  const onSubmit = (data: ValidationSchema) => {
    onSave(data.description);
    clearDraft();
    onClose();
  };

  return (
    <AppModal
      opened={isOpen}
      onClose={onClose}
      title={t("descriptionModal.tierTitle")}
      subtitle={gameName}
      size="xl"
      closeButtonLabel={t("descriptionModal.closeAria")}
      footer={
        <Group justify="flex-end" gap={12}>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("descriptionModal.cancelButton")}
          </Button>
          <Button type="submit" form="tier-description-form">
            {t("descriptionModal.saveTierButton")}
          </Button>
        </Group>
      }
    >
      <Box component="form" id="tier-description-form" onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap={16}>
          {hasDraft && <DraftNotice onDiscard={discardDraft} />}
          <Text size="xs" c="var(--color-text-500)">
            {t("descriptionModal.tierWhyPrompt")}
          </Text>

          <Textarea
            placeholder={t("descriptionModal.tierPlaceholder")}
            rows={6}
            style={{ width: "100%" }}
            {...form.getInputProps("description")}
          />

          <Text ta="right" size="xs" c="var(--color-text-500)">
            {form.values.description.length} / 500 {t("descriptionModal.characters")}
          </Text>
        </Stack>
      </Box>
    </AppModal>
  );
};
