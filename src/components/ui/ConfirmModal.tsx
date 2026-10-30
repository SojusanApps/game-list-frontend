import { Text, Group } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { AppModal } from "./AppModal";
import { Button } from "./Button";

export interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}: Readonly<ConfirmModalProps>) {
  const { t } = useTranslation();
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      centered
      footer={
        <Group justify="flex-end" gap={12}>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel ?? t("cancel")}
          </Button>
          <Button variant={isDestructive ? "destructive" : "default"} onClick={handleConfirm} isLoading={isLoading}>
            {confirmLabel ?? t("confirm")}
          </Button>
        </Group>
      }
    >
      {typeof message === "string" ? (
        <Text c="var(--color-text-500)" size="sm" style={{ lineHeight: 1.5 }}>
          {message}
        </Text>
      ) : (
        message
      )}
    </AppModal>
  );
}
