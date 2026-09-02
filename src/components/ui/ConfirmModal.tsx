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
  confirmColor?: string;
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
  confirmColor = "var(--color-primary-600)",
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
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel ?? t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            isLoading={isLoading}
            style={{
              backgroundColor: isDestructive ? "var(--color-error-500)" : confirmColor,
            }}
          >
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
