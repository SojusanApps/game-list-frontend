import { Modal, Textarea, Stack, Group, Text, Select, Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";

import { RecommendationEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { useCurrentUserId } from "@/features/auth";
import { useModalDraft } from "@/hooks/useModalDraft";

import { useCreateGameReview, useUpdateGameReview, useDeleteGameReview } from "../hooks/gameQueries";
import { getRecommendationConfig, RECOMMENDATION_ORDER } from "../utils/recommendationConfig";

const MAX_REVIEW_LENGTH = 1000;

type ReviewFormValues = { review: string; recommendation: RecommendationEnum | null };

interface GameReviewModalProps {
  gameId: number;
  existingReviewId?: number;
  existingReviewText?: string;
  existingRecommendation?: RecommendationEnum;
  opened: boolean;
  onClose: () => void;
}

export function GameReviewModal({
  gameId,
  existingReviewId,
  existingReviewText,
  existingRecommendation,
  opened,
  onClose,
}: Readonly<GameReviewModalProps>) {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();
  const isEditing = !!existingReviewId;

  const validateReview = (value: string) => {
    if (value.trim().length === 0) {
      return t("reviewModal.validationRequired");
    }
    if (value.length > MAX_REVIEW_LENGTH) {
      return t("reviewModal.validationMaxLength", { max: MAX_REVIEW_LENGTH });
    }
    return null;
  };

  const validateRecommendation = (value: RecommendationEnum | null) => {
    if (!value) {
      return t("reviewModal.validationRecommendationRequired");
    }
    return null;
  };

  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<ReviewFormValues>({
    draftKey: `game-review:${gameId}`,
    opened,
    baseline: {
      review: existingReviewText ?? "",
      recommendation: existingRecommendation ?? null,
    },
    formOptions: {
      validate: { review: validateReview, recommendation: validateRecommendation },
    },
  });

  const { mutateAsync: createReview, isPending: isCreating } = useCreateGameReview();
  const { mutateAsync: updateReview, isPending: isUpdating } = useUpdateGameReview();
  const { mutateAsync: deleteReview, isPending: isDeleting } = useDeleteGameReview();
  const isPending = isCreating || isUpdating || isDeleting;

  const handleSubmit = async (values: ReviewFormValues) => {
    if (!currentUserId || !values.recommendation) {
      return;
    }
    try {
      // Both branches are side-effecting calls with no value to assign; a ternary statement
      // here would trip no-unused-expressions instead.
      // oxlint-disable-next-line unicorn/prefer-ternary
      if (isEditing) {
        await updateReview({
          id: existingReviewId,
          body: { review: values.review, recommendation: values.recommendation },
        });
      } else {
        await createReview({
          review: values.review,
          recommendation: values.recommendation,
          game: gameId,
        });
      }
      notifications.show({
        title: t("reviewModal.successTitle"),
        message: isEditing ? t("reviewModal.updateSuccess") : t("reviewModal.createSuccess"),
        color: "green",
      });
      clearDraft();
      onClose();
    } catch {
      notifications.show({
        title: t("reviewModal.errorTitle"),
        message: t("reviewModal.errorMessage"),
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    if (!existingReviewId) {
      return;
    }
    try {
      await deleteReview(existingReviewId);
      notifications.show({
        title: t("reviewModal.successTitle"),
        message: t("reviewModal.deleteSuccess"),
        color: "green",
      });
      clearDraft();
      onClose();
    } catch {
      notifications.show({
        title: t("reviewModal.errorTitle"),
        message: t("reviewModal.errorMessage"),
        color: "red",
      });
    }
  };

  const charCount = form.values.review.length;
  const isOverLimit = charCount > MAX_REVIEW_LENGTH;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? t("reviewModal.editTitle") : t("reviewModal.addTitle")}
      size="lg"
      overlayProps={{ opacity: 0.4, blur: 2 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={16}>
          {hasDraft && <DraftNotice onDiscard={discardDraft} />}
          <Select
            label={t("reviewModal.recommendationLabel")}
            placeholder={t("reviewModal.recommendationPlaceholder")}
            data={RECOMMENDATION_ORDER.map(value => ({
              value,
              label: getRecommendationConfig(value)?.label ?? value,
            }))}
            renderOption={({ option }) => (
              <Box
                style={{
                  ...getRecommendationConfig(option.value as RecommendationEnum)?.badgeStyle,
                  fontSize: "12px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "6px",
                  display: "inline-block",
                }}
              >
                {option.label}
              </Box>
            )}
            styles={{
              input: {
                ...getRecommendationConfig(form.values.recommendation ?? undefined)?.badgeStyle,
                fontWeight: 700,
              },
            }}
            {...form.getInputProps("recommendation")}
          />
          <Stack gap={4}>
            <Textarea
              {...form.getInputProps("review")}
              placeholder={t("reviewModal.reviewPlaceholder")}
              minRows={6}
              autosize
              maxRows={16}
            />
            <Group justify="flex-end">
              <Text fz="xs" c={isOverLimit ? "red" : "dimmed"}>
                {charCount} / {MAX_REVIEW_LENGTH}
              </Text>
            </Group>
          </Stack>
          <Group justify="space-between" gap={8}>
            {isEditing && (
              <Button variant="outline" color="red" onClick={handleDelete} isLoading={isDeleting} disabled={isPending}>
                {t("reviewModal.removeButton")}
              </Button>
            )}
            <Group gap={8} ml="auto">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                {t("reviewModal.cancelButton")}
              </Button>
              <Button type="submit" isLoading={isCreating || isUpdating} disabled={isOverLimit || isPending}>
                {isEditing ? t("reviewModal.saveButton") : t("reviewModal.submitButton")}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
