import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  Group,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconChevronDown } from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { FieldEnum } from "@/client";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { useCurrentUserId } from "@/features/auth";
import { useModalDraft } from "@/hooks/useModalDraft";

import { useCreateTranslationSuggestion, useGetTranslationSuggestions } from "../hooks/translationSuggestionQueries";
import {
  PROPOSED_VALUE_MAX_LENGTH,
  findOwnPendingSuggestion,
  validateProposedValue,
} from "../utils/translationSuggestion";
import { SuggestionRow } from "./SuggestionRow";

const REFERENCE_VALUE_STYLE: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontSize: "13px",
  background: "var(--color-background-200)",
  border: "1px solid var(--color-background-200)",
  borderRadius: 6,
  padding: "8px 10px",
};

type SuggestionFormValues = {
  field: FieldEnum;
  proposedValue: string;
  isOfficialTitleConfirmed: boolean;
};

interface TranslationSuggestionModalProps {
  gameId: number;
  currentTitle: string;
  currentSummary: string;
  opened: boolean;
  onClose: () => void;
}

export function TranslationSuggestionModal({
  gameId,
  currentTitle,
  currentSummary,
  opened,
  onClose,
}: Readonly<TranslationSuggestionModalProps>) {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

  const currentValueForField = (targetField: FieldEnum) =>
    targetField === FieldEnum.TITLE ? currentTitle : currentSummary;

  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<SuggestionFormValues>({
    draftKey: `translation-suggestion:${gameId}`,
    opened,
    baseline: {
      field: FieldEnum.SUMMARY,
      proposedValue: currentSummary,
      isOfficialTitleConfirmed: false,
    },
    formOptions: {
      validate: {
        proposedValue: (value, values) => {
          const error = validateProposedValue(values.field, value);
          if (error === "required") {
            return t("translationSuggestionModal.validationRequired");
          }
          if (error === "tooLong") {
            return t("translationSuggestionModal.validationTooLong", {
              max: PROPOSED_VALUE_MAX_LENGTH[values.field],
            });
          }
          return null;
        },
      },
    },
  });
  const field = form.values.field;
  const isOfficialTitleConfirmed = form.values.isOfficialTitleConfirmed;

  const { data, isLoading } = useGetTranslationSuggestions({ game: String(gameId), field }, { enabled: opened });
  const suggestions = React.useMemo(() => data?.results ?? [], [data?.results]);

  const ownPendingSuggestion = currentUserId ? findOwnPendingSuggestion(suggestions, currentUserId, field) : undefined;

  const handleFieldChange = (value: string | null) => {
    if (!value) {
      return;
    }
    const newField = value as FieldEnum;
    form.setValues({
      field: newField,
      proposedValue: currentValueForField(newField),
      isOfficialTitleConfirmed: false,
    });
  };

  const showTranslationArea = field !== FieldEnum.TITLE || isOfficialTitleConfirmed;

  const { mutateAsync: createSuggestion, isPending: isCreating } = useCreateTranslationSuggestion();

  const handleSubmit = async (values: SuggestionFormValues) => {
    try {
      await createSuggestion({ game: gameId, field: values.field, proposed_value: values.proposedValue });
      notifications.show({
        title: t("translationSuggestionModal.successTitle"),
        message: t("translationSuggestionModal.createSuccess"),
        color: "green",
      });
      clearDraft();
    } catch {
      notifications.show({
        title: t("translationSuggestionModal.errorTitle"),
        message: t("translationSuggestionModal.errorMessage"),
        color: "red",
      });
    }
  };

  const charCount = form.values.proposedValue.length;
  const maxLength = PROPOSED_VALUE_MAX_LENGTH[field];
  const isOverLimit = charCount > maxLength;

  return (
    <AppModal opened={opened} onClose={onClose} title={t("translationSuggestionModal.title")} scrollable>
      <Stack gap={16}>
        {hasDraft && <DraftNotice onDiscard={discardDraft} />}
        <Select
          label={t("translationSuggestionModal.fieldLabel")}
          data={[
            { value: FieldEnum.SUMMARY, label: t("translationSuggestionModal.fieldSummary") },
            { value: FieldEnum.TITLE, label: t("translationSuggestionModal.fieldTitle") },
          ]}
          value={field}
          onChange={handleFieldChange}
          allowDeselect={false}
        />

        <Stack gap={8}>
          <UnstyledButton
            onClick={() => setIsHistoryOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Text fw={700} fz="sm">
              {t("translationSuggestionModal.historyTitle")}
            </Text>
            <IconChevronDown
              size={16}
              style={{
                transform: isHistoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 150ms",
              }}
            />
          </UnstyledButton>
          <Collapse expanded={isHistoryOpen}>
            <ScrollArea.Autosize mah={240}>
              <Stack gap={12}>
                {isLoading && (
                  <Text c="dimmed" fz="sm">
                    {t("translationSuggestionModal.loading")}
                  </Text>
                )}
                {!isLoading && suggestions.length === 0 && (
                  <Text c="dimmed" fz="sm" fs="italic">
                    {t("translationSuggestionModal.historyEmpty")}
                  </Text>
                )}
                {suggestions.map(suggestion => (
                  <SuggestionRow key={suggestion.id} suggestion={suggestion} />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Collapse>
        </Stack>

        <Divider />

        {ownPendingSuggestion ? (
          <Text fz="sm" c="dimmed" fs="italic">
            {t("translationSuggestionModal.pendingSuggestionNotice")}
          </Text>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap={16}>
              {field === FieldEnum.TITLE && (
                <Stack gap={4}>
                  <Checkbox
                    {...form.getInputProps("isOfficialTitleConfirmed", { type: "checkbox" })}
                    label={t("translationSuggestionModal.officialTranslationCheckbox")}
                  />
                  <Text fz="xs" c="dimmed">
                    {t("translationSuggestionModal.officialTranslationNote")}
                  </Text>
                </Stack>
              )}

              {showTranslationArea && (
                <>
                  <Stack gap={4}>
                    <Text fw={600} fz="sm">
                      {t("translationSuggestionModal.currentValueLabel")}
                    </Text>
                    <Box style={REFERENCE_VALUE_STYLE}>{currentValueForField(field)}</Box>
                  </Stack>

                  <Stack gap={4}>
                    <Text fw={600} fz="sm">
                      {t("translationSuggestionModal.polishTranslationLabel")}
                    </Text>
                    <Textarea
                      {...form.getInputProps("proposedValue")}
                      placeholder={t("translationSuggestionModal.proposedValuePlaceholder")}
                      rows={4}
                      resize="vertical"
                    />
                    <Group justify="flex-end">
                      <Text fz="xs" c={isOverLimit ? "red" : "dimmed"}>
                        {charCount} / {maxLength}
                      </Text>
                    </Group>
                  </Stack>
                </>
              )}

              <Group justify="flex-end" gap={8}>
                <Button variant="outline" onClick={onClose} disabled={isCreating}>
                  {t("translationSuggestionModal.cancelButton")}
                </Button>
                {showTranslationArea && (
                  <Button type="submit" isLoading={isCreating} disabled={isOverLimit}>
                    {t("translationSuggestionModal.submitButton")}
                  </Button>
                )}
              </Group>
            </Stack>
          </form>
        )}
      </Stack>
    </AppModal>
  );
}
