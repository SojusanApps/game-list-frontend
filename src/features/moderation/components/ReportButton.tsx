import { ActionIcon, Group, Modal, Stack, Text, Textarea, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFlag } from "@tabler/icons-react";
import type { TFunction } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { ReportCreateWritable, TargetTypeEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { useCurrentUserId } from "@/features/auth";
import { useModalDraft } from "@/hooks/useModalDraft";

import { useCreateReport } from "../hooks/moderationQueries";
import { canReport, validateReportReason, type ReportReasonError } from "../utils/report";

function getReasonErrorMessage(error: ReportReasonError | null, t: TFunction<"moderation">): string | undefined {
  switch (error) {
    case "required": {
      return t("reportModal.reasonRequired");
    }
    case "tooShort": {
      return t("reportModal.reasonTooShort");
    }
    default: {
      return undefined;
    }
  }
}

function buildReportBody(targetType: TargetTypeEnum, targetId: number, reason: string): ReportCreateWritable {
  switch (targetType) {
    case TargetTypeEnum.REVIEW: {
      return { target_type: targetType, target_review: targetId, reason };
    }
    case TargetTypeEnum.TRANSLATION_SUGGESTION: {
      return { target_type: targetType, target_translation_suggestion: targetId, reason };
    }
    case TargetTypeEnum.GAME_LIST_NOTE: {
      return { target_type: targetType, target_game_list: targetId, reason };
    }
    case TargetTypeEnum.COLLECTION: {
      return { target_type: targetType, target_collection: targetId, reason };
    }
    case TargetTypeEnum.COLLECTION_ITEM_NOTE: {
      return { target_type: targetType, target_collection_item: targetId, reason };
    }
    case TargetTypeEnum.AVATAR:
    case TargetTypeEnum.USERNAME: {
      return { target_type: targetType, reported_user: targetId, reason };
    }
  }
}

interface ReportButtonProps {
  targetType: TargetTypeEnum;
  targetId: number;
  ownerId: number;
  ownerUsername: string;
  /**
   * Custom trigger element, e.g. a `Menu.Item` when embedding inside an existing
   * dropdown. Defaults to a standalone icon button.
   */
  renderTrigger?: (props: { onClick: () => void }) => React.ReactNode;
}

function DefaultTrigger({ label, onClick }: Readonly<{ label: string; onClick: () => void }>) {
  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant="subtle"
        color="gray"
        aria-label={label}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <IconFlag size={18} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

export function ReportButton({
  targetType,
  targetId,
  ownerId,
  ownerUsername,
  renderTrigger,
}: Readonly<ReportButtonProps>) {
  const { t } = useTranslation("moderation");
  const currentUserId = useCurrentUserId();
  const [opened, setOpened] = React.useState(false);
  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<{ reason: string }>({
    draftKey: `report:${targetType}:${targetId}`,
    opened,
    baseline: { reason: "" },
  });

  const { mutate: createReport, isPending } = useCreateReport();

  if (!canReport(ownerId, currentUserId)) {
    return null;
  }

  const targetTypeLabel = t(`targetType.${targetType}`);

  const close = () => {
    setOpened(false);
  };

  const handleSubmit = () => {
    const error = validateReportReason(form.values.reason);
    if (error) {
      form.setFieldError("reason", getReasonErrorMessage(error, t));
      return;
    }

    createReport(buildReportBody(targetType, targetId, form.values.reason), {
      onSuccess: () => {
        notifications.show({
          title: t("reportModal.successTitle"),
          message: t("reportModal.successMessage"),
          color: "green",
        });
        clearDraft();
        close();
      },
      onError: () => {
        // The mutation hook already shows the backend's own error notification
        // (e.g. the duplicate-pending-report message); keep the modal open so
        // the user can retry with a different reason if that's the issue.
      },
    });
  };

  const label = t("reportButton.ariaLabel");
  const openModal = () => setOpened(true);

  return (
    <>
      {renderTrigger ? renderTrigger({ onClick: openModal }) : <DefaultTrigger label={label} onClick={openModal} />}

      <Modal opened={opened} onClose={close} title={t("reportModal.title", { targetType: targetTypeLabel })} centered>
        <Stack gap={16}>
          {hasDraft && <DraftNotice onDiscard={discardDraft} />}
          <Text fz="sm" c="dimmed">
            {t("reportModal.disclaimer")}
          </Text>
          <Text fz="sm" fw={500}>
            {t("reportModal.context", { username: ownerUsername, targetType: targetTypeLabel })}
          </Text>
          <Textarea
            label={t("reportModal.reasonLabel")}
            placeholder={t("reportModal.reasonPlaceholder")}
            {...form.getInputProps("reason")}
            minRows={3}
            autosize
          />
          <Group justify="flex-end" gap={8}>
            <Button variant="outline" onClick={close} disabled={isPending}>
              {t("reportModal.cancelButton")}
            </Button>
            <Button onClick={handleSubmit} isLoading={isPending}>
              {t("reportModal.submitButton")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
