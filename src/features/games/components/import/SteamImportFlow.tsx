import { Box, Stack, Text, Stepper, TextInput, Group, Accordion, Badge } from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconCheck, IconInfoCircle } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { GameListCreateWritable, SteamImportNotFound } from "@/client";
import { Button } from "@/components/ui/Button";
import { useCurrentUserId } from "@/features/auth";
import i18n from "@/lib/i18n";
import { playtimeHoursToMinutes } from "@/utils/playtimeUtils";

import { useSteamImport, useBulkCreateGameList, useGetGameMediasByName } from "../../hooks/gameQueries";
import { ConfigureGameList } from "./ConfigureGameList";
import { SuccessStep } from "./SuccessStep";
import { createGameRow } from "./types";
import { useGameRows } from "./useGameRows";

import styles from "./SteamImportFlow.module.css";

const steamFormSchema = z.object({
  steamProfileId: z.string().min(1, { message: i18n.t("validation:steamProfileIdRequired") }),
});
type SteamFormValues = z.infer<typeof steamFormSchema>;

interface SteamImportFlowProps {
  sourceSelector: React.ReactNode;
}

export const SteamImportFlow = ({ sourceSelector }: SteamImportFlowProps) => {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();

  const [activeStep, setActiveStep] = React.useState(0);
  const { rows, setRows, onStatusChange, onScoreChange, onFieldChange } = useGameRows();
  const [notFound, setNotFound] = React.useState<SteamImportNotFound[]>([]);
  const [totalImported, setTotalImported] = React.useState(0);
  const [importedCount, setImportedCount] = React.useState(0);

  const { mutateAsync: runSteamImport, isPending: isFetching } = useSteamImport();
  const { mutateAsync: runBulkCreate, isPending: isImporting } = useBulkCreateGameList();

  // Fetch Steam media ID to pre-fill owned_on for all Steam imports
  const { data: steamMediaData } = useGetGameMediasByName("Steam");
  const steamMediaId = steamMediaData?.results.find(m => m.name.toLowerCase() === "steam")?.id;

  const form = useForm<SteamFormValues>({
    initialValues: { steamProfileId: "" },
    validate: schemaResolver(steamFormSchema),
  });

  // ── Step 1: Fetch from Steam ─────────────────────────────────────────────
  const handleFetch = async (values: SteamFormValues) => {
    try {
      const result = await runSteamImport(values.steamProfileId);
      setTotalImported(result.total_imported);
      setNotFound(result.not_found);
      setRows(result.matched.map(game => createGameRow(game, steamMediaId ? [steamMediaId.toString()] : [])));
      setActiveStep(1);
    } catch {
      // error is handled by useAppMutation (shows a toast automatically)
    }
  };

  // ── Step 2: Bulk import ─────────────────────────────────────────────────
  const handleImport = async () => {
    if (!currentUserId) {
      notifications.show({ title: "Error", message: "User not identified.", color: "red" });
      return;
    }
    const body: GameListCreateWritable[] = rows.map(row => ({
      game: row.game.id,
      status: row.status,
      score: row.score,
      owned_on: row.owned_on.map(Number),
      started_at: row.started_at || null,
      completed_at: row.completed_at || null,
      playtime: playtimeHoursToMinutes(row.playtime),
      description: row.description || undefined,
    }));
    try {
      await runBulkCreate(body);
      setImportedCount(rows.length);
      setActiveStep(2);
    } catch {
      // handled by useAppMutation
    }
  };

  return (
    <>
      <Stepper active={activeStep} className={styles.stepperWrapper}>
        <Stepper.Step label={t("import.stepConnect")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepConfigure")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepDone")} completedIcon={<IconCheck size={16} />} />
      </Stepper>

      {/* ── Step 0: Connect ─────────────────────────────── */}
      {activeStep === 0 && (
        <Box className={styles.card}>
          <form onSubmit={form.onSubmit(handleFetch)} noValidate>
            <Stack gap={24}>
              {sourceSelector}

              <TextInput
                id="steam-profile-id"
                label={t("import.steamIdLabel")}
                placeholder={t("import.steamIdPlaceholder")}
                {...form.getInputProps("steamProfileId")}
              />

              {/* Notice */}
              <div className={styles.noticeBox}>
                <IconInfoCircle size={20} style={{ color: "var(--color-primary-tint-text)", flexShrink: 0 }} />
                <Text fz="sm" c="var(--color-text-700)">
                  {t("import.steamNotice")}
                </Text>
              </div>

              <Group justify="flex-end">
                <Button type="submit" isLoading={isFetching} leftSection={<IconDownload size={16} />}>
                  {t("import.fetchButton")}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      )}

      {/* ── Step 1: Configure ───────────────────────────── */}
      {activeStep === 1 && (
        <Stack gap={24}>
          {/* Stats box */}
          <div className={styles.statsBox}>
            <Text className={styles.statNumber}>{totalImported}</Text>
            <Stack gap={2}>
              <Text fw={600} c="var(--color-text-900)">
                {t("import.totalImported", { count: totalImported })}
              </Text>
            </Stack>
          </div>

          <ConfigureGameList
            rows={rows}
            onStatusChange={onStatusChange}
            onScoreChange={onScoreChange}
            onFieldChange={onFieldChange}
          />

          {/* Not found accordion */}
          {notFound.length > 0 && (
            <Accordion variant="separated" radius="md">
              <Accordion.Item value="not-found">
                <Accordion.Control icon="⚠️">
                  <Group gap={8}>
                    <Text fw={600}>{t("import.notFoundTitle")}</Text>
                    <Badge
                      size="sm"
                      style={{
                        background: "var(--color-secondary-tint-bg)",
                        color: "var(--color-secondary-tint-text)",
                        border: "1px solid var(--color-secondary-tint-border)",
                      }}
                    >
                      {notFound.length}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={8}>
                    <Text fz="sm" c="dimmed" mb={8}>
                      {t("import.notFoundDescription")}
                    </Text>
                    {notFound.map(item => (
                      <div key={item.appid} className={styles.notFoundItem}>
                        <Text fz="sm" c="var(--color-text-700)">
                          {item.name}
                        </Text>
                        <Text fz="xs" c="dimmed" ml="auto">
                          AppID: {item.appid}
                        </Text>
                      </div>
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          )}

          <Group justify="space-between">
            <Button variant="outline" onClick={() => setActiveStep(0)}>
              ← {t("import.stepConnect")}
            </Button>
            <Button
              onClick={handleImport}
              isLoading={isImporting}
              disabled={rows.length === 0}
              leftSection={<IconDownload size={16} />}
            >
              {t("import.importButton", { count: rows.length })}
            </Button>
          </Group>
        </Stack>
      )}

      {/* ── Step 2: Success ─────────────────────────────── */}
      {activeStep === 2 && <SuccessStep importedCount={importedCount} />}
    </>
  );
};
