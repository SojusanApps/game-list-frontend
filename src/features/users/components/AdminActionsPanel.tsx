import { Box, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import type { TFunction } from "i18next";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useCurrentUserId, useIsStaff } from "@/features/auth";
import { AdminActionModal } from "@/features/moderation/components/AdminActionModal";
import { validateReportReason, type ReportReasonError } from "@/features/moderation/utils/report";

import { useBanUser } from "../hooks/userQueries";

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

interface AdminActionsPanelProps {
  userId: number;
  isTargetStaff: boolean;
}

/**
 * Staff-only panel with account-level moderation actions (currently just Ban).
 * Self-hides for non-staff, for staff viewing their own profile, and for staff-owned
 * profiles — the backend refuses to ban staff accounts.
 */
export function AdminActionsPanel({ userId, isTargetStaff }: Readonly<AdminActionsPanelProps>) {
  const { t } = useTranslation("moderation");
  const currentUserId = useCurrentUserId();
  const isStaff = useIsStaff();
  const [opened, setOpened] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<ReportReasonError | null>(null);

  const { mutate: banUser, isPending } = useBanUser();

  if (!isStaff || isTargetStaff || currentUserId === userId) {
    return null;
  }

  const close = () => {
    setOpened(false);
    setReason("");
    setReasonError(null);
  };

  const handleSubmit = () => {
    const error = validateReportReason(reason);
    setReasonError(error);
    if (error) {
      return;
    }

    banUser(
      { id: userId, reason },
      {
        onSuccess: () => {
          notifications.show({
            title: t("banModal.successTitle"),
            message: t("banModal.successMessage"),
            color: "green",
          });
          close();
        },
        onError: () => {
          // The mutation hook already shows the backend's own error notification.
        },
      },
    );
  };

  return (
    <Box
      component="section"
      style={{
        background: "var(--color-background-100)",
        borderRadius: 12,
        border: "1px solid var(--color-error-tint-border)",
        padding: 16,
      }}
    >
      <Title order={2} fz={14} fw={700} c="var(--color-text-900)" mb={8}>
        {t("adminActionsPanel.title")}
      </Title>
      <Text fz="xs" c="dimmed" mb={12}>
        {t("adminActionsPanel.description")}
      </Text>
      <Button variant="outline" color="red" fullWidth onClick={() => setOpened(true)}>
        {t("banButton.label")}
      </Button>

      <AdminActionModal
        opened={opened}
        title={t("banModal.title")}
        description={t("banModal.description")}
        reason={reason}
        onReasonChange={value => {
          setReason(value);
          setReasonError(null);
        }}
        reasonError={getReasonErrorMessage(reasonError, t)}
        reasonLabel={t("adminActionModal.reasonLabel")}
        reasonPlaceholder={t("banModal.reasonPlaceholder")}
        confirmLabel={t("banModal.confirmButton")}
        cancelLabel={t("adminActionModal.cancelButton")}
        isDestructive
        isLoading={isPending}
        onConfirm={handleSubmit}
        onClose={close}
      />
    </Box>
  );
}
