import { ActionIcon, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShieldExclamation } from "@tabler/icons-react";
import type { TFunction } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { ReportDirectModerateWritable, TargetTypeEnum } from "@/client";
import { useCurrentUserId, useIsStaff } from "@/features/auth";
import { useModalDraft } from "@/hooks/useModalDraft";

import { useCreateDirectModerateReport } from "../hooks/moderationQueries";
import { canWarnAndRemove, validateReportReason, type ReportReasonError } from "../utils/report";
import { AdminActionModal } from "./AdminActionModal";

function getReasonErrorMessage(error: ReportReasonError | null, t: TFunction<"moderation">): string | undefined {
  switch (error) {
    case "required": {
      return t("adminActionModal.reasonRequired");
    }
    case "tooShort": {
      return t("adminActionModal.reasonTooShort");
    }
    default: {
      return undefined;
    }
  }
}

function buildDirectModerateBody(
  targetType: TargetTypeEnum,
  targetId: number,
  reason: string,
): ReportDirectModerateWritable {
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

interface WarnAndRemoveButtonProps {
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
        color="orange"
        aria-label={label}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
      >
        <IconShieldExclamation size={18} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * Staff-only action that skips the report queue: immediately masks a Target's content
 * and issues a Warning to its author. Self-hides for non-staff and for staff viewing
 * their own content — the backend refuses staff-authored targets on submit.
 */
export function WarnAndRemoveButton({
  targetType,
  targetId,
  ownerId,
  ownerUsername,
  renderTrigger,
}: Readonly<WarnAndRemoveButtonProps>) {
  const { t } = useTranslation("moderation");
  const currentUserId = useCurrentUserId();
  const isStaff = useIsStaff();
  const [opened, setOpened] = React.useState(false);
  const { form, hasDraft, discardDraft, clearDraft } = useModalDraft<{ reason: string }>({
    draftKey: `warn-and-remove:${targetType}:${targetId}`,
    opened,
    baseline: { reason: "" },
  });

  const { mutate: createDirectModerateReport, isPending } = useCreateDirectModerateReport();

  if (!canWarnAndRemove(ownerId, currentUserId, isStaff)) {
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

    createDirectModerateReport(buildDirectModerateBody(targetType, targetId, form.values.reason), {
      onSuccess: () => {
        notifications.show({
          title: t("warnAndRemoveModal.successTitle"),
          message: t("warnAndRemoveModal.successMessage"),
          color: "green",
        });
        clearDraft();
        close();
      },
      onError: () => {
        // The mutation hook already shows the backend's own error notification
        // (e.g. a staff-target refusal); keep the modal open so staff can retry.
      },
    });
  };

  const label = t("warnAndRemoveButton.ariaLabel");
  const openModal = () => setOpened(true);

  return (
    <>
      {renderTrigger ? renderTrigger({ onClick: openModal }) : <DefaultTrigger label={label} onClick={openModal} />}

      <AdminActionModal
        opened={opened}
        title={t("warnAndRemoveModal.title", { targetType: targetTypeLabel })}
        description={t("warnAndRemoveModal.description", { username: ownerUsername, targetType: targetTypeLabel })}
        reason={form.values.reason}
        onReasonChange={value => form.setFieldValue("reason", value)}
        reasonError={typeof form.errors.reason === "string" ? form.errors.reason : undefined}
        reasonLabel={t("adminActionModal.reasonLabel")}
        reasonPlaceholder={t("warnAndRemoveModal.reasonPlaceholder")}
        confirmLabel={t("warnAndRemoveModal.confirmButton")}
        cancelLabel={t("adminActionModal.cancelButton")}
        isLoading={isPending}
        hasDraft={hasDraft}
        onDiscardDraft={discardDraft}
        onConfirm={handleSubmit}
        onClose={close}
      />
    </>
  );
}
