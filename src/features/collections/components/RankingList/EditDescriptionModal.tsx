import { Group, Loader, Stack, Textarea } from "@mantine/core";
import { schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { useModalDraft } from "@/hooks/useModalDraft";
import i18n from "@/lib/i18n";

const validationSchema = z.object({
  description: z.string().max(500, i18n.t("validation:descriptionMax")).optional(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

interface EditDescriptionModalProps {
  itemId: number;
  gameTitle: string;
  currentDescription?: string;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
}

export default function EditDescriptionModal({
  itemId,
  gameTitle,
  currentDescription,
  onClose,
  onSave,
}: Readonly<EditDescriptionModalProps>) {
  const { t } = useTranslation("collections");
  const [isSaving, setIsSaving] = React.useState(false);

  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<ValidationSchema>({
    draftKey: `ranking-item-description:${itemId}`,
    opened: true,
    baseline: { description: currentDescription ?? "" },
    formOptions: { validate: schemaResolver(validationSchema) },
  });

  const onSubmit = async (data: ValidationSchema) => {
    setIsSaving(true);
    try {
      await onSave(data.description ?? "");
      notifications.show({
        title: t("descriptionModal.successTitle"),
        message: t("descriptionModal.updateSuccess"),
        color: "green",
      });
      clearDraft();
      onClose();
    } catch (error) {
      notifications.show({
        title: t("descriptionModal.errorTitle"),
        message: t("descriptionModal.updateFailed"),
        color: "red",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppModal
      opened={true}
      onClose={onClose}
      title={t("descriptionModal.rankingTitle")}
      subtitle={gameTitle}
      size="xl"
      closeButtonLabel={t("descriptionModal.closeAria")}
      footer={
        <Group justify="flex-end" gap={12}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving} style={{ paddingInline: 24 }}>
            {t("descriptionModal.cancelButton")}
          </Button>
          <Button
            type="submit"
            form="ranking-description-form"
            variant="default"
            disabled={isSaving}
            style={{ paddingInline: 24 }}
          >
            {isSaving ? (
              <>
                <Loader size="xs" style={{ marginRight: 8 }} /> {t("descriptionModal.savingButton")}
              </>
            ) : (
              t("descriptionModal.saveButton")
            )}
          </Button>
        </Group>
      }
    >
      <form id="ranking-description-form" onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap={16}>
          {hasDraft && <DraftNotice onDiscard={discardDraft} />}
          <Textarea
            label={t("descriptionModal.rankingTextarea")}
            placeholder={t("descriptionModal.rankingPlaceholder")}
            rows={8}
            style={{ width: "100%" }}
            {...form.getInputProps("description")}
          />
        </Stack>
      </form>
    </AppModal>
  );
}
