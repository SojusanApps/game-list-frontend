import { Box, Group, Modal, Text, Textarea, Title, UnstyledButton } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import * as React from "react";

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
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="lg"
      size="md"
      centered
      overlayProps={{ backgroundOpacity: 0.5 }}
    >
      <Box style={{ background: "var(--color-background-100)", borderRadius: 16 }}>
        <Group
          justify="space-between"
          align="center"
          style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-background-200)" }}
        >
          <Title order={3} fz="lg" fw={800} c="var(--color-text-900)">
            {title}
          </Title>
          <UnstyledButton onClick={onClose} style={{ padding: 6, borderRadius: 8 }} aria-label={cancelLabel}>
            <IconX style={{ width: 18, height: 18, color: "var(--color-text-500)" }} />
          </UnstyledButton>
        </Group>

        <Box p={24}>
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

          <Group justify="flex-end" gap={12} mt={20}>
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button variant={isDestructive ? "destructive" : "default"} onClick={onConfirm} isLoading={isLoading}>
              {confirmLabel}
            </Button>
          </Group>
        </Box>
      </Box>
    </Modal>
  );
}
