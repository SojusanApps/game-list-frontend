import { Box, Stack, Text, Group } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCheck, IconSearch } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";

import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";
import { DuplicateGroup } from "../../utils/titleImport";
import { ImportedGame } from "./types";

import styles from "./TitleMergeStep.module.css";

interface TitleMergeStepProps {
  groups: Array<DuplicateGroup<ImportedGame>>;
  onBack: () => void;
  onConfirm: () => void;
}

/**
 * Confirm-only step shown when several titles resolved to the same game:
 * each duplicated game will be imported once.
 */
export const TitleMergeStep = ({ groups, onBack, onConfirm }: TitleMergeStepProps) => {
  const { t } = useTranslation("games");

  return (
    <Stack gap={24}>
      <Box className={styles.card}>
        <Stack gap={16}>
          <Text fz={20} fw={700} c="var(--color-text-900)">
            {t("import.duplicatesTitle")}
          </Text>
          <Text fz="sm" c="dimmed">
            {t("import.duplicatesDescription")}
          </Text>

          <Stack gap={12}>
            {groups.map(group => {
              const imageUrl = getIGDBImageURL(group.game.cover_image_id ?? "", IGDBImageSize.COVER_SMALL_90_128);
              return (
                <div key={group.game.id} className={styles.duplicateGroup}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={group.game.title} className={styles.coverThumb} />
                  ) : (
                    <div className={styles.coverThumbPlaceholder}>
                      <IconSearch size={18} color="var(--color-text-400)" />
                    </div>
                  )}
                  <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={600} c="var(--color-text-900)">
                      {group.game.title}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {t("import.duplicatesChosenFor", { titles: group.titles.join(", ") })}
                    </Text>
                  </Stack>
                </div>
              );
            })}
          </Stack>
        </Stack>
      </Box>

      <Group justify="space-between">
        <Button variant="outline" onClick={onBack} leftSection={<IconArrowLeft size={16} stroke={1.5} />}>
          {t("import.backStepButton")}
        </Button>
        <Button
          onClick={onConfirm}
          leftSection={<IconCheck size={16} />}
          rightSection={<IconArrowRight size={16} stroke={1.5} />}
        >
          {t("import.continueButton")}
        </Button>
      </Group>
    </Stack>
  );
};
