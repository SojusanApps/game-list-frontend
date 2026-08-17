import { Box, Group, Loader, Modal, Stack, Text, Title, Textarea, UnstyledButton } from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import i18n from "@/lib/i18n";

const validationSchema = z.object({
  description: z.string().max(500, i18n.t("validation:descriptionMax")).optional(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

interface EditDescriptionModalProps {
  gameTitle: string;
  currentDescription?: string;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
}

export default function EditDescriptionModal({
  gameTitle,
  currentDescription,
  onClose,
  onSave,
}: Readonly<EditDescriptionModalProps>) {
  const { t } = useTranslation("collections");
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ValidationSchema>({
    initialValues: {
      description: currentDescription ?? "",
    },
    validate: schemaResolver(validationSchema),
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
    <Modal
      opened={true}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="lg"
      size="xl"
      overlayProps={{ backgroundOpacity: 0.5 }}
    >
      <Box style={{ background: "white", borderRadius: 16 }}>
        <Group
          justify="space-between"
          align="center"
          style={{ padding: 24, borderBottom: "1px solid var(--color-background-200)" }}
        >
          <Box>
            <Title order={2} fz="xl" fw={900} c="var(--color-text-900)">
              {t("descriptionModal.rankingTitle")}
            </Title>
            <Text size="sm" c="var(--color-text-500)" mt={4}>
              {gameTitle}
            </Text>
          </Box>
          <UnstyledButton
            onClick={onClose}
            style={{ padding: 8, borderRadius: 12 }}
            aria-label={t("descriptionModal.closeAria")}
          >
            <IconX style={{ width: 20, height: 20 }} />
          </UnstyledButton>
        </Group>

        <Box component="form" onSubmit={form.onSubmit(onSubmit)} p={24}>
          <Stack gap={16}>
            <Textarea
              label={t("descriptionModal.rankingTextarea")}
              placeholder={t("descriptionModal.rankingPlaceholder")}
              rows={8}
              style={{ width: "100%" }}
              {...form.getInputProps("description")}
            />
          </Stack>

          <Group
            justify="flex-end"
            gap={12}
            style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--color-background-200)" }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
              style={{ paddingInline: 24 }}
            >
              {t("descriptionModal.cancelButton")}
            </Button>
            <Button type="submit" variant="default" disabled={isSaving} style={{ paddingInline: 24 }}>
              {isSaving ? (
                <>
                  <Loader size="xs" style={{ marginRight: 8 }} /> {t("descriptionModal.savingButton")}
                </>
              ) : (
                t("descriptionModal.saveButton")
              )}
            </Button>
          </Group>
        </Box>
      </Box>
    </Modal>
  );
}
