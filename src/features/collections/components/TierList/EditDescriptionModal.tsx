import { Box, Group, Modal, Stack, Text, Title, Textarea, UnstyledButton } from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import i18n from "@/lib/i18n";

const validationSchema = z.object({
  description: z.string().max(500, i18n.t("validation:descriptionMax")),
});

type ValidationSchema = z.infer<typeof validationSchema>;

interface EditDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDescription?: string;
  gameName: string;
  onSave: (description: string) => void;
}

export const EditDescriptionModal = ({
  isOpen,
  onClose,
  initialDescription = "",
  gameName,
  onSave,
}: Readonly<EditDescriptionModalProps>) => {
  const { t } = useTranslation("collections");
  const form = useForm<ValidationSchema>({
    initialValues: {
      description: initialDescription,
    },
    validate: schemaResolver(validationSchema),
  });

  const onSubmit = (data: ValidationSchema) => {
    onSave(data.description);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="xl"
      size="xl"
      overlayProps={{ backgroundOpacity: 0.6 }}
    >
      <Box component="form" onSubmit={form.onSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Group
          justify="space-between"
          align="center"
          style={{ padding: 24, borderBottom: "1px solid var(--color-background-200)" }}
        >
          <Title order={2} fz="xl" fw={700} c="var(--color-text-900)">
            {t("descriptionModal.tierTitle")}
          </Title>
          <UnstyledButton
            onClick={onClose}
            style={{ padding: 8, borderRadius: "9999px" }}
            aria-label={t("descriptionModal.closeAria")}
          >
            <IconX style={{ width: 20, height: 20 }} />
          </UnstyledButton>
        </Group>

        {/* Body */}
        <Stack gap={16} p={24}>
          <Box>
            <Text fz="sm" fw={600} c="var(--color-text-700)" mb={8}>
              {t("descriptionModal.gameLabel", { name: gameName })}
            </Text>
            <Text size="xs" c="var(--color-text-500)" mb={16}>
              {t("descriptionModal.tierWhyPrompt")}
            </Text>
          </Box>

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

        {/* Footer */}
        <Group
          justify="flex-end"
          gap={12}
          style={{
            padding: 24,
            borderTop: "1px solid var(--color-background-200)",
            background: "var(--color-background-50)",
          }}
        >
          <Button type="button" variant="outline" onClick={onClose}>
            {t("descriptionModal.cancelButton")}
          </Button>
          <Button type="submit">{t("descriptionModal.saveTierButton")}</Button>
        </Group>
      </Box>
    </Modal>
  );
};
