import { ActionIcon, Badge, Group, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { StoreEntry } from "@/client";
import { Button } from "@/components/ui/Button";
import { TruncatedText } from "@/components/ui/TruncatedText";

import { EnumPlatformLogo, platformLabel } from "./platformDisplay";

import styles from "./ImportEntryList.module.css";

interface ImportEntryListProps {
  entries: readonly StoreEntry[];
  onRemove: (entry: StoreEntry) => void;
  onClear: () => void;
}

/** Read-only list of the store games waiting to be matched: the shop they come from, their title and store id. */
export const ImportEntryList = ({ entries, onRemove, onClear }: ImportEntryListProps) => {
  const { t } = useTranslation("games");

  return (
    <div>
      <Group justify="space-between" mb={8}>
        <Text fw={500} fz="sm">
          {t("import.entriesLabel", { count: entries.length })}
        </Text>
        {entries.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            {t("import.clearEntries")}
          </Button>
        )}
      </Group>
      {entries.length === 0 ? (
        <div className={styles.list}>
          <Text className={styles.empty} fz="sm">
            {t("import.entriesEmpty")}
          </Text>
        </div>
      ) : (
        <ul className={styles.list} style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {entries.map(entry => (
            <li key={`${entry.platform}:${entry.store_id}`} className={styles.row}>
              <span className={styles.store}>
                <EnumPlatformLogo platform={entry.platform} />
                {platformLabel(entry.platform)}
              </span>
              <TruncatedText className={styles.title} fz="sm" fw={600} truncate="end">
                {entry.title}
              </TruncatedText>
              {entry.wishlisted && (
                <Badge variant="light" size="sm">
                  {t("import.wishlisted")}
                </Badge>
              )}
              <TruncatedText className={styles.storeId} truncate="end">
                {t("import.storeId", { id: entry.store_id })}
              </TruncatedText>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={t("import.removeEntry", { title: entry.title })}
                onClick={() => onRemove(entry)}
              >
                <IconX size={16} stroke={1.5} />
              </ActionIcon>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
