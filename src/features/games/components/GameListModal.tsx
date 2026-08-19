import { Modal, Select, Group, Stack, Textarea, NumberInput, Box } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm, schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import { useCurrentUserId } from "@/features/auth";
import i18n from "@/lib/i18n";
import { idSchema } from "@/lib/validation";
import { parseDate, formatDate } from "@/utils/dateUtils";
import { getRatingColor } from "@/utils/ratingUtils";

import {
  useCreateGameList,
  useDeleteGameList,
  useGetGameListByFilters,
  useGetGameMediasInfiniteQuery,
  usePartialUpdateGameList,
} from "../hooks/gameQueries";
import code_to_value_mapping from "../utils/GameListStatuses";

const validationSchema = z.object({
  status: z.enum(GameListStatusEnum),
  score: z.coerce
    .number()
    .min(1, { message: i18n.t("validation:scoreMin") })
    .max(10, { message: i18n.t("validation:scoreMax") })
    .nullish(),
  owned_on: z.array(z.string()).optional(),
  description: z.string().max(200, i18n.t("validation:noteMax")).nullish(),
  started_at: z.date().nullish(),
  completed_at: z.date().nullish(),
  playtime: z.coerce.number().min(0, i18n.t("validation:playtimeMin")).nullish(),
});

type ValidationSchema = z.infer<typeof validationSchema>;

interface GameListModalProps {
  gameId: string | number;
  opened: boolean;
  onClose: () => void;
}

export function GameListModal({ gameId, opened, onClose }: Readonly<GameListModalProps>) {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();
  const parsedGameIdResult = idSchema.safeParse(gameId);
  const parsedGameId = parsedGameIdResult.success ? parsedGameIdResult.data : undefined;

  const { data: gameListDetails } = useGetGameListByFilters(
    parsedGameId && currentUserId ? { game: String(parsedGameId), user: String(currentUserId) } : undefined,
    { enabled: !!parsedGameId && !!currentUserId && opened },
  );

  const { mutateAsync: deleteGameListItem, isPending: isDeleting } = useDeleteGameList();
  const { mutateAsync: createGameListItem, isPending: isCreating } = useCreateGameList();
  const { mutateAsync: partialUpdateGameListItem, isPending: isUpdating } = usePartialUpdateGameList();

  const isSubmitting = isCreating || isUpdating;

  const form = useForm<ValidationSchema>({
    initialValues: {
      status: GameListStatusEnum.PTP,
      score: null,
      owned_on: [],
      description: "",
      started_at: null,
      completed_at: null,
      playtime: null,
    },
    validate: schemaResolver(validationSchema),
  });

  // Populate form when data arrives or modal opens
  React.useEffect(() => {
    if (opened) {
      if (gameListDetails?.id) {
        form.setValues({
          status: gameListDetails.status_code as GameListStatusEnum,
          score: gameListDetails.score ?? null,
          owned_on: gameListDetails.owned_on.map(media => media.id.toString()),
          description: gameListDetails.description ?? "",
          started_at: parseDate(gameListDetails.started_at, "YYYY-MM-DD"),
          completed_at: parseDate(gameListDetails.completed_at, "YYYY-MM-DD"),
          playtime: gameListDetails.playtime ?? null,
        });
      } else {
        form.reset();
      }
    }
    // form is intentionally excluded: @mantine/form returns a new `form` object on every
    // render, so including it here would re-run this effect (and reset in-progress edits)
    // on every keystroke.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [gameListDetails, opened]);

  // Autopopulate dates when status changes
  React.useEffect(() => {
    if (form.isDirty("status")) {
      if (form.values.status === GameListStatusEnum.P && !form.values.started_at) {
        form.setFieldValue("started_at", new Date());
      } else if (form.values.status === GameListStatusEnum.C && !form.values.completed_at) {
        form.setFieldValue("completed_at", new Date());
      }
    }
    // Deliberately triggered only by status changes, not by started_at/completed_at themselves —
    // this is a one-time autofill, not a continuous sync, and including the date fields here would
    // re-fire on every manual edit to them and overwrite the user's own clearing of the field.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [form.values.status]);

  const onSubmitHandler = async (data: ValidationSchema) => {
    if (!parsedGameId || !currentUserId) {
      notifications.show({ title: t("modal.errorTitle"), message: t("modal.invalidContext"), color: "red" });
      return;
    }

    const payload = {
      status: data.status,
      score: data.score,
      owned_on: data.owned_on?.map(Number) ?? [],
      description: data.description || undefined,
      started_at: formatDate(data.started_at, "YYYY-MM-DD"),
      completed_at: formatDate(data.completed_at, "YYYY-MM-DD"),
      playtime: data.playtime,
    };

    try {
      if (gameListDetails?.id) {
        await partialUpdateGameListItem({
          id: gameListDetails.id,
          body: payload,
        });
        notifications.show({ title: t("modal.successTitle"), message: t("modal.updateSuccess"), color: "green" });
      } else {
        await createGameListItem({
          ...payload,
          game: parsedGameId,
          user: currentUserId,
        });
        notifications.show({ title: t("modal.successTitle"), message: t("modal.addSuccess"), color: "green" });
      }
      onClose();
    } catch (error: unknown) {
      notifications.show({
        title: t("modal.errorTitle"),
        message: error instanceof Error ? error.message : t("modal.errorMessage"),
        color: "red",
      });
    }
  };

  const handleRemove = async () => {
    if (gameListDetails?.id) {
      try {
        await deleteGameListItem(gameListDetails.id);
        notifications.show({ title: t("modal.successTitle"), message: t("modal.removeSuccess"), color: "green" });
        onClose();
      } catch (error: unknown) {
        notifications.show({
          title: t("modal.errorTitle"),
          message: error instanceof Error ? error.message : t("modal.removeFailed"),
          color: "red",
        });
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={gameListDetails?.id ? t("modal.editTitle") : t("modal.addTitle")}
      size="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <form onSubmit={form.onSubmit(onSubmitHandler)} noValidate>
        <Stack gap={16}>
          <Group align="flex-start" grow>
            <Select
              required
              id="status"
              label={t("modal.statusLabel")}
              name="status"
              searchable
              data={code_to_value_mapping().map(item => ({
                value: item.code,
                label: item.value,
              }))}
              {...form.getInputProps("status")}
            />
            <Select
              id="score"
              label={t("modal.scoreLabel")}
              name="score"
              searchable
              clearable
              data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => ({
                value: s.toString(),
                label: s.toString(),
              }))}
              renderOption={({ option }) => (
                <Box
                  style={{
                    background: getRatingColor(Number(option.value)),
                    color: "black",
                    fontSize: "12px",
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    display: "inline-block",
                  }}
                >
                  {option.label}
                </Box>
              )}
              value={form.values.score ? form.values.score.toString() : null}
              onChange={val => form.setFieldValue("score", val ? Number(val) : null)}
              error={form.errors.score}
              leftSection={
                form.values.score ? (
                  <Box
                    style={{
                      background: getRatingColor(form.values.score),
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      marginLeft: 10,
                    }}
                  />
                ) : null
              }
            />
          </Group>

          <AsyncMultiSelectAutocomplete
            placeholder={t("modal.ownedOnPlaceholder")}
            id="owned_on"
            label={t("modal.ownedOnLabel")}
            name="owned_on"
            useInfiniteQueryHook={useGetGameMediasInfiniteQuery}
            getOptionLabel={item => item.name}
            getOptionValue={item => item.id.toString()}
            {...form.getInputProps("owned_on")}
          />

          <Group align="flex-start" grow>
            <DateInput
              label={t("modal.startedAt")}
              placeholder={t("modal.pickDate")}
              clearable
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps("started_at")}
            />
            <DateInput
              label={t("modal.completedAt")}
              placeholder={t("modal.pickDate")}
              clearable
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps("completed_at")}
            />
            <NumberInput
              label={t("modal.playtime")}
              placeholder="0"
              min={0}
              allowNegative={false}
              {...form.getInputProps("playtime")}
            />
          </Group>

          <Textarea
            label={t("modal.noteLabel")}
            placeholder={t("modal.notePlaceholder")}
            maxLength={200}
            rows={3}
            {...form.getInputProps("description")}
          />

          <Group justify={gameListDetails?.id ? "space-between" : "flex-end"} mt="md">
            {gameListDetails?.id && (
              <Button type="button" onClick={handleRemove} variant="destructive" isLoading={isDeleting}>
                {t("modal.removeButton")}
              </Button>
            )}
            <Group>
              <Button type="button" onClick={onClose} variant="outline" disabled={isSubmitting}>
                {t("modal.cancelButton")}
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {gameListDetails?.id ? t("modal.saveButton") : t("modal.addButton")}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
