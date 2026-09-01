import { Box, Group, Text, Textarea } from "@mantine/core";
import * as React from "react";

import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import { DraftNotice } from "@/components/ui/DraftNotice";

export interface AdminActionModalProps {
  opened: boolean;
  title: string;
  description: React.ReactNode;
  reason: string;
  onReasonChange: (value: string) => void;
  reasonError?: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  confirmLabel: string;
  cancelLabel: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  /** Shows the "unsaved draft restored" bar above the reason field when true. */
  hasDraft?: boolean;
  onDiscardDraft?: () => void;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Reason-required confirmation modal shared by every staff action that bypasses the
 * report queue (Warn & Remove, Ban) — mirrors ConfirmModal's chrome, plus the reason
 * Textarea both backend endpoints require.
 */
export function AdminActionModal({
  opened,
  title,
  description,
  reason,
  onReasonChange,
  reasonError,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isLoading = false,
  hasDraft = false,
  onDiscardDraft,
  onConfirm,
  onClose,
}: Readonly<AdminActionModalProps>) {
  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      centered
      closeButtonLabel={cancelLabel}
      footer={
        <Group justify="flex-end" gap={12}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={isDestructive ? "destructive" : "default"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </Group>
      }
    >
      {hasDraft && onDiscardDraft && (
        <Box mb={12}>
          <DraftNotice onDiscard={onDiscardDraft} />
        </Box>
      )}

      <Text c="var(--color-text-500)" size="sm" style={{ lineHeight: 1.5, marginBottom: 16 }}>
        {description}
      </Text>

      <Textarea
        label={reasonLabel}
        placeholder={reasonPlaceholder}
        value={reason}
        onChange={event => onReasonChange(event.currentTarget.value)}
        error={reasonError}
        minRows={3}
        autosize
      />
    </AppModal>
  );
}
