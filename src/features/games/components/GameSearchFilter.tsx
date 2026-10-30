import { Select, Box, Group, NumberInput, Stack } from "@mantine/core";
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

const dateField = z
  .preprocess(val => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") return new Date(val);
    return val;
  }, z.date().nullable())
  .optional();

// Clearing an async select sets its value to null.
const optionalString = z.preprocess(val => val ?? undefined, z.string().optional());

const validationSchema = z
  .object({
    release_date_after: dateField,
    release_date_before: dateField,
    publisher: optionalString,
    developer: optionalString,
    platforms: z.string().array().optional(),
    genres: z.string().array().optional(),
    game_engines: z.string().array().optional(),
    game_modes: z.string().array().optional(),
    game_status: z.string().array().optional(),
    game_type: z.string().array().optional(),
    player_perspectives: z.string().array().optional(),
    igdb_id: z.preprocess(
      val => (val === "" || val === null ? undefined : String(val)),
      z.string().regex(/^\d+$/).optional(),
    ),
    ordering: optionalString,
  })
  .refine(
    data => {
      if (data.release_date_after === undefined || data.release_date_after === null) {
        return true;
      }
      if (data.release_date_before === undefined || data.release_date_before === null) {
        return true;
      }
      // Both are year pickers, so choosing the same year twice is a valid single-year range.
      return data.release_date_before >= data.release_date_after;
    },
    {
      message: i18n.t("validation:dateRangeInvalid"),
      path: ["release_date_before"],
    },
  );

export type ValidationSchema = z.output<typeof validationSchema>;
export type ValidationInput = z.input<typeof validationSchema>;

const EMPTY_VALUES: ValidationInput = {
  release_date_after: null,
  release_date_before: null,
  publisher: "",
  developer: "",
  platforms: [],
  genres: [],
  game_engines: [],
  game_modes: [],
  game_status: [],
  game_type: [],
  player_perspectives: [],
  igdb_id: "",
  ordering: "",
};

/** `YYYY-MM-DD` as a local date; `new Date("2020-01-01")` is UTC midnight and shows as the previous year west of UTC. */
function parseLocalDate(value: unknown): Date | null {
  const match = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** "Released until 2020" is inclusive: the year picker yields 1 Jan, so widen it to the year's last day. */
function endOfYear(value: ValidationInput["release_date_before"]): ValidationInput["release_date_before"] {
  if (!(value instanceof Date)) {
    return value;
  }
  return new Date(value.getFullYear(), 11, 31);
}

function GameSearchFilter({
  onSubmitHandlerCallback,
  initialFilters,
  showOrdering = true,
  orderingOptions,
  orderingClearable = true,
  datePickerWithinPortal = false,
  showIgdbId = false,
}: Readonly<{
  onSubmitHandlerCallback: (data: ValidationSchema) => void;
  initialFilters?: Record<string, unknown>;
  showOrdering?: boolean;
  /** Overrides the default game-search sort options; each value is sent verbatim as the `ordering` param. */
  orderingOptions?: { value: string; label: string }[];
  orderingClearable?: boolean;
  datePickerWithinPortal?: boolean;
  /** Adds the IGDB id filter; only the games endpoint supports it, not a user's game list. */
  showIgdbId?: boolean;
}>) {
  const { t } = useTranslation("games");
  const form = useForm<ValidationInput>({
    initialValues: {
      release_date_after: parseLocalDate(initialFilters?.release_date_after),
      release_date_before: parseLocalDate(initialFilters?.release_date_before),
      publisher: (initialFilters?.publisher as string) ?? "",
      developer: (initialFilters?.developer as string) ?? "",
      platforms: (initialFilters?.platforms as string[]) ?? [],
      genres: (initialFilters?.genres as string[]) ?? [],
      game_engines: (initialFilters?.game_engines as string[]) ?? [],
      game_modes: (initialFilters?.game_modes as string[]) ?? [],
      game_status: (initialFilters?.game_status as string[]) ?? [],
      game_type: (initialFilters?.game_type as string[]) ?? [],
      player_perspectives: (initialFilters?.player_perspectives as string[]) ?? [],
      igdb_id: (initialFilters?.igdb_id as string | undefined) ?? "",
      ordering: (initialFilters?.ordering as string | undefined) ?? "",
    },
    validate: schemaResolver(validationSchema),
  });

  return (
    <Box
      component="form"
      onSubmit={form.onSubmit(data =>
        (onSubmitHandlerCallback as (data: ValidationInput) => void)({
          ...data,
          release_date_before: endOfYear(data.release_date_before),
        }),
      )}
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
              clearable={orderingClearable}
              allowDeselect={orderingClearable}
              data={
                orderingOptions ?? [
                  { value: "created_at", label: t("filter.createdAt") },
                  { value: "-created_at", label: t("filter.createdAtDesc") },
                  { value: "rank_position", label: t("filter.rankPosition") },
                  { value: "-rank_position", label: t("filter.rankPositionDesc") },
                  { value: "popularity", label: t("filter.popularity") },
                  { value: "-popularity", label: t("filter.popularityDesc") },
                ]
              }
              comboboxProps={{
                withinPortal: false,
                position: "bottom",
                middlewares: { flip: false, shift: false },
              }}
              {...form.getInputProps("ordering")}
              // Empty means "no sort chosen"; as "" Mantine would show the clear (X) button with nothing to clear.
              value={form.values.ordering || null}
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
          {showIgdbId && (
            <NumberInput
              id="igdb_id"
              name="igdb_id"
              label={t("filter.igdbId")}
              placeholder={t("filter.igdbIdPlaceholder")}
              hideControls
              allowDecimal={false}
              allowNegative={false}
              {...form.getInputProps("igdb_id")}
            />
          )}
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

      <Group
        justify="center"
        wrap="wrap"
        gap={12}
        pt={16}
        style={{ borderTop: "1px solid var(--color-background-100)" }}
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          style={{ flex: "0 0 auto" }}
          onClick={() => {
            form.setValues(EMPTY_VALUES);
            (onSubmitHandlerCallback as (data: ValidationInput) => void)(EMPTY_VALUES);
          }}
        >
          {t("filter.reset")}
        </Button>
        <Button
          type="submit"
          size="lg"
          // The basis keeps the longest (Polish) label whole; in a narrow sidebar the button wraps under Reset
          // instead of squeezing both.
          style={{ flex: "1 1 200px", maxWidth: "256px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
        >
          {t("filter.applyFilters")}
        </Button>
      </Group>
    </Box>
  );
}

export default GameSearchFilter;
