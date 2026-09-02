import { Group, Text } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { Button } from "./Button";

interface DraftNoticeProps {
  onDiscard: () => void;
}

/**
 * Subtle bar shown at the top of a modal body when {@link useModalDraft} restored an
 * unsaved draft. The "Discard" action drops the draft and resets the form.
 */
export function DraftNotice({ onDiscard }: Readonly<DraftNoticeProps>) {
  const { t } = useTranslation();

  return (
    <Group
      justify="space-between"
      gap={8}
      wrap="nowrap"
      style={{
        padding: "6px 6px 6px 10px",
        borderRadius: 8,
        background: "var(--color-background-50)",
        border: "1px solid var(--color-background-200)",
      }}
    >
      <Group gap={6} wrap="nowrap">
        <IconPencil size={14} style={{ color: "var(--color-text-400)", flexShrink: 0 }} />
        <Text fz="xs" c="dimmed">
          {t("draft.restored")}
        </Text>
      </Group>
      <Button type="button" variant="link" size="sm" onClick={onDiscard}>
        {t("draft.discard")}
      </Button>
    </Group>
  );
}
