import { Select, Box, Group, Stack } from "@mantine/core";
import { YearPickerInput } from "@mantine/dates";
import { useForm, schemaResolver } from "@mantine/form";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Company, Platform, Genre, GameEngine, GameMode, GameStatus, GameType, PlayerPerspective } from "@/client";
import { Button } from "@/components/ui/Button";
import AsyncAutocomplete from "@/components/ui/Form/AsyncAutocomplete";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import i18n from "@/lib/i18n";

import {
  useGetGenresInfiniteQuery,
  useGetPlatformsInfiniteQuery,
  useGetCompaniesInfiniteQuery,
  useGetGameEnginesInfiniteQuery,
  useGetGameModesInfiniteQuery,
  useGetGameStatusesInfiniteQuery,
  useGetGameTypesInfiniteQuery,
  useGetPlayerPerspectivesInfiniteQuery,
} from "../hooks/gameQueries";

const ORDERING_OPTIONS = [
  "-created_at",
  "created_at",
  "-rank_position",
  "rank_position",
  "-popularity",
  "popularity",
] as const;

const dateField = z
  .preprocess(val => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") return new Date(val);
    return val;
  }, z.date().nullable())
  .optional();

const validationSchema = z
  .object({
    release_date_after: dateField,
    release_date_before: dateField,
    publisher: z.string().optional(),
    developer: z.string().optional(),
    platforms: z.string().array().optional(),
    genres: z.string().array().optional(),
    game_engines: z.string().array().optional(),
    game_modes: z.string().array().optional(),
    game_status: z.string().array().optional(),
    game_type: z.string().array().optional(),
    player_perspectives: z.string().array().optional(),
    ordering: z.enum(ORDERING_OPTIONS).optional().or(z.literal("")),
  })
  .refine(
    data => {
      if (data.release_date_after === undefined || data.release_date_after === null) {
        return true;
      }
      if (data.release_date_before === undefined || data.release_date_before === null) {
        return true;
      }
      return data.release_date_before > data.release_date_after;
    },
    {
      message: i18n.t("validation:dateRangeInvalid"),
      path: ["release_date_before"],
    },
  );

export type ValidationSchema = z.output<typeof validationSchema>;
export type ValidationInput = z.input<typeof validationSchema>;

function GameSearchFilter({
  onSubmitHandlerCallback,
  initialFilters,
  showOrdering = true,
  datePickerWithinPortal = false,
}: Readonly<{
  onSubmitHandlerCallback: (data: ValidationSchema) => void;
  initialFilters?: Record<string, unknown>;
  showOrdering?: boolean;
  datePickerWithinPortal?: boolean;
}>) {
  const { t } = useTranslation("games");
  const form = useForm<ValidationInput>({
    initialValues: {
      release_date_after: initialFilters?.release_date_after
        ? new Date(initialFilters.release_date_after as string)
        : null,
      release_date_before: initialFilters?.release_date_before
        ? new Date(initialFilters.release_date_before as string)
        : null,
      publisher: (initialFilters?.publisher as string) ?? "",
      developer: (initialFilters?.developer as string) ?? "",
      platforms: (initialFilters?.platforms as string[]) ?? [],
      genres: (initialFilters?.genres as string[]) ?? [],
      game_engines: (initialFilters?.game_engines as string[]) ?? [],
      game_modes: (initialFilters?.game_modes as string[]) ?? [],
      game_status: (initialFilters?.game_status as string[]) ?? [],
      game_type: (initialFilters?.game_type as string[]) ?? [],
      player_perspectives: (initialFilters?.player_perspectives as string[]) ?? [],
      ordering:
        (initialFilters?.ordering as
          | "-created_at"
          | "created_at"
          | "-rank_position"
          | "rank_position"
          | "-popularity"
          | "popularity"
          | "") ?? "",
    },
    validate: schemaResolver(validationSchema),
  });

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(onSubmitHandlerCallback as (data: ValidationInput) => void)}
      style={{ display: "flex", flexDirection: "column", gap: "32px" }}
      noValidate
    >
      <Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px 32px" }}>
        {/* Group 1: Core Search & Ordering */}
        <Stack gap={16}>
          {showOrdering && (
            <Select
              placeholder={t("filter.sortPlaceholder")}
              id="ordering"
              label={t("filter.sortBy")}
              name="ordering"
              searchable
              clearable
              data={[
                { value: "created_at", label: t("filter.createdAt") },
                { value: "-created_at", label: t("filter.createdAtDesc") },
                { value: "rank_position", label: t("filter.rankPosition") },
                { value: "-rank_position", label: t("filter.rankPositionDesc") },
                { value: "popularity", label: t("filter.popularity") },
                { value: "-popularity", label: t("filter.popularityDesc") },
              ]}
              comboboxProps={{
                withinPortal: false,
                position: "bottom",
                middlewares: { flip: false, shift: false },
              }}
              {...form.getInputProps("ordering")}
            />
          )}
          <Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
            <YearPickerInput
              id="release_date_after"
              name="release_date_after"
              label={t("filter.releaseAfter")}
              placeholder={t("filter.yearPlaceholder")}
              clearable
              valueFormat="YYYY"
              popoverProps={{
                withinPortal: datePickerWithinPortal,
                position: "bottom",
                middlewares: { flip: false, shift: false },
              }}
              {...form.getInputProps("release_date_after")}
            />
            <YearPickerInput
              id="release_date_before"
              name="release_date_before"
              label={t("filter.releaseBefore")}
              placeholder={t("filter.yearPlaceholder")}
              clearable
              valueFormat="YYYY"
              popoverProps={{
                withinPortal: datePickerWithinPortal,
                position: "bottom",
                middlewares: { flip: false, shift: false },
              }}
              {...form.getInputProps("release_date_before")}
            />
          </Box>
        </Stack>

        {/* Group 2: Entities & Genres */}
        <Stack gap={16}>
          <AsyncAutocomplete
            id="developer"
            name="developer"
            label={t("filter.developer")}
            placeholder={t("filter.developerPlaceholder")}
            useInfiniteQueryHook={useGetCompaniesInfiniteQuery}
            getOptionLabel={(company: Company) => company.name}
            getOptionValue={(company: Company) => company.name}
            {...form.getInputProps("developer")}
          />

          <AsyncAutocomplete
            id="publisher"
            name="publisher"
            label={t("filter.publisher")}
            placeholder={t("filter.publisherPlaceholder")}
            useInfiniteQueryHook={useGetCompaniesInfiniteQuery}
            getOptionLabel={(company: Company) => company.name}
            getOptionValue={(company: Company) => company.name}
            {...form.getInputProps("publisher")}
          />

          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.genresPlaceholder")}
            id="genres"
            label={t("filter.genres")}
            name="genres"
            useInfiniteQueryHook={useGetGenresInfiniteQuery}
            getOptionLabel={(genre: Genre) => genre.name}
            getOptionValue={(genre: Genre) => genre.name}
            {...form.getInputProps("genres")}
          />

          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.platformsPlaceholder")}
            id="platforms"
            label={t("filter.platforms")}
            name="platforms"
            useInfiniteQueryHook={useGetPlatformsInfiniteQuery}
            getOptionLabel={(platform: Platform) => platform.name}
            getOptionValue={(platform: Platform) => platform.name}
            {...form.getInputProps("platforms")}
          />
        </Stack>

        {/* Group 3: Game Properties */}
        <Stack gap={16}>
          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.gameTypesPlaceholder")}
            id="game_type"
            label={t("filter.gameTypes")}
            name="game_type"
            useInfiniteQueryHook={useGetGameTypesInfiniteQuery}
            getOptionLabel={(type: GameType) => type.type}
            getOptionValue={(type: GameType) => type.type}
            {...form.getInputProps("game_type")}
          />
          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.gameStatusesPlaceholder")}
            id="game_status"
            label={t("filter.gameStatuses")}
            name="game_status"
            useInfiniteQueryHook={useGetGameStatusesInfiniteQuery}
            getOptionLabel={(status: GameStatus) => status.status}
            getOptionValue={(status: GameStatus) => status.status}
            {...form.getInputProps("game_status")}
          />
          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.enginesPlaceholder")}
            id="game_engines"
            label={t("filter.engines")}
            name="game_engines"
            useInfiniteQueryHook={useGetGameEnginesInfiniteQuery}
            getOptionLabel={(engine: GameEngine) => engine.name}
            getOptionValue={(engine: GameEngine) => engine.name}
            {...form.getInputProps("game_engines")}
          />
          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.modesPlaceholder")}
            id="game_modes"
            label={t("filter.modes")}
            name="game_modes"
            useInfiniteQueryHook={useGetGameModesInfiniteQuery}
            getOptionLabel={(mode: GameMode) => mode.name}
            getOptionValue={(mode: GameMode) => mode.name}
            {...form.getInputProps("game_modes")}
          />
          <AsyncMultiSelectAutocomplete
            placeholder={t("filter.perspectivesPlaceholder")}
            id="player_perspectives"
            label={t("filter.perspectives")}
            name="player_perspectives"
            useInfiniteQueryHook={useGetPlayerPerspectivesInfiniteQuery}
            getOptionLabel={(perspective: PlayerPerspective) => perspective.name}
            getOptionValue={(perspective: PlayerPerspective) => perspective.name}
            {...form.getInputProps("player_perspectives")}
          />
        </Stack>
      </Box>

      <Group justify="center" pt={16} style={{ borderTop: "1px solid var(--color-background-100)" }}>
        <Button
          type="submit"
          size="lg"
          style={{ width: "100%", maxWidth: "256px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
        >
          {t("filter.applyFilters")}
        </Button>
      </Group>
    </Box>
  );
}

export default GameSearchFilter;
