import { Badge, Box, Group, NumberInput, Paper, Select, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { FieldEnum, TranslationSuggestion, TranslationSuggestionStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { derivePageCount, LIST_PAGE_SIZE, PaginationControls } from "@/components/ui/PaginatedTable";
import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { SuggestionRow } from "@/features/translationSuggestions/components/SuggestionRow";
import { useGetTranslationSuggestions } from "@/features/translationSuggestions/hooks/translationSuggestionQueries";
import {
  buildSuggestionFilters,
  SuggestionFilterState,
} from "@/features/translationSuggestions/utils/translationSuggestion";

const STATUS_OPTIONS = [
  TranslationSuggestionStatusEnum.PENDING,
  TranslationSuggestionStatusEnum.ACCEPTED,
  TranslationSuggestionStatusEnum.REJECTED,
  TranslationSuggestionStatusEnum.WITHDRAWN,
];

function GameSuggestionCard({ suggestion }: Readonly<{ suggestion: TranslationSuggestion }>): React.JSX.Element {
  const { t } = useTranslation("admin");
  const { game } = suggestion;
  const coverUrl = game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_SMALL_90_128) : "";
  const fieldLabel =
    suggestion.field === FieldEnum.TITLE
      ? t("translationSuggestions.fieldTitle")
      : t("translationSuggestions.fieldSummary");

  return (
    <Paper
      withBorder
      p={16}
      radius="md"
      style={{ background: "var(--color-background-100)", borderColor: "var(--color-background-200)" }}
    >
      <Group align="flex-start" gap={16} wrap="nowrap">
        <Link to="/game/$id/$slug" params={{ id: game.id.toString(), slug: game.slug || "" }} style={{ flexShrink: 0 }}>
          <Box style={{ width: 64, height: 91, borderRadius: 6, overflow: "hidden" }}>
            <SafeImage
              src={coverUrl || undefined}
              alt={game.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        </Link>
        <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={8} align="center" wrap="wrap">
            <Link
              to="/game/$id/$slug"
              params={{ id: game.id.toString(), slug: game.slug || "" }}
              style={{ fontWeight: 700, color: "var(--color-text-900)", textDecoration: "none" }}
            >
              {game.title}
            </Link>
            <Badge variant="light">{fieldLabel}</Badge>
          </Group>
          <SuggestionRow suggestion={suggestion} />
        </Stack>
      </Group>
    </Paper>
  );
}

export default function AdminTranslationSuggestionsPage(): React.JSX.Element {
  const { t } = useTranslation("admin");
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<TranslationSuggestionStatusEnum | "all">(
    TranslationSuggestionStatusEnum.PENDING,
  );
  const [game, setGame] = React.useState<number | undefined>();
  const [submittedBy, setSubmittedBy] = React.useState<number | undefined>();

  const filterState: SuggestionFilterState = { status, game, submittedBy, page };
  const query = buildSuggestionFilters(filterState);

  const { data, isLoading, isFetching } = useGetTranslationSuggestions(query);
  const suggestions = data?.results ?? [];
  const totalPages = derivePageCount({ count: data?.count, pageSize: LIST_PAGE_SIZE, page });

  const isFiltered =
    status !== TranslationSuggestionStatusEnum.PENDING || game !== undefined || submittedBy !== undefined;

  const clearFilters = () => {
    setStatus(TranslationSuggestionStatusEnum.PENDING);
    setGame(undefined);
    setSubmittedBy(undefined);
    setPage(1);
  };

  return (
    <Stack gap={24} maw={1024} mx="auto" px={16} w="100%" style={{ flexGrow: 1 }}>
      <PageMeta title={t("translationSuggestions.title")} />
      <Stack gap={8}>
        <Title order={2}>{t("translationSuggestions.title")}</Title>
        <Text c="dimmed">{t("translationSuggestions.subtitle")}</Text>
      </Stack>

      <Group gap={16} align="flex-end" wrap="wrap">
        <Select
          label={t("translationSuggestions.statusFilterLabel")}
          value={status}
          onChange={value => {
            setStatus((value as TranslationSuggestionStatusEnum | "all" | null) ?? "all");
            setPage(1);
          }}
          data={[
            { value: "all", label: t("translationSuggestions.statusAll") },
            ...STATUS_OPTIONS.map(option => ({
              value: option,
              label: t(`translationSuggestions.status.${option}`),
            })),
          ]}
          allowDeselect={false}
          style={{ width: 200 }}
        />
        <NumberInput
          label={t("translationSuggestions.gameFilterLabel")}
          value={game}
          onChange={value => {
            setGame(typeof value === "number" ? value : undefined);
            setPage(1);
          }}
          min={1}
          style={{ width: 160 }}
        />
        <NumberInput
          label={t("translationSuggestions.submittedByFilterLabel")}
          value={submittedBy}
          onChange={value => {
            setSubmittedBy(typeof value === "number" ? value : undefined);
            setPage(1);
          }}
          min={1}
          style={{ width: 160 }}
        />
        {isFiltered && (
          <Button variant="ghost" onClick={clearFilters}>
            {t("translationSuggestions.clearFilters")}
          </Button>
        )}
      </Group>

      {isLoading ? (
        <Skeleton h={200} radius="md" />
      ) : (
        <Stack gap={16}>
          {isFetching && (
            <Text c="dimmed" fz="xs">
              {t("translationSuggestions.loading")}
            </Text>
          )}
          {suggestions.length === 0 ? (
            <Text c="dimmed" fs="italic">
              {t("translationSuggestions.empty")}
            </Text>
          ) : (
            suggestions.map(suggestion => <GameSuggestionCard key={suggestion.id} suggestion={suggestion} />)
          )}
        </Stack>
      )}

      <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
    </Stack>
  );
}
