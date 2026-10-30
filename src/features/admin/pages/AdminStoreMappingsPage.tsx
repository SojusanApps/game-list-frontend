import {
  Badge,
  Checkbox,
  CloseButton,
  Group,
  Paper,
  Popover,
  Select,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { schemaResolver, useForm } from "@mantine/form";
import { useDebouncedValue } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { PlatformEnum, ReportStatusEnum, StoreMapping } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell } from "@/components/ui/PageShell";
import { derivePageCount, LIST_PAGE_SIZE, PaginationControls } from "@/components/ui/PaginatedTable";
import { UserChip } from "@/components/ui/UserChip";
import { GamePickerModal } from "@/features/games/components/GamePickerModal";
import { EnumPlatformLogo } from "@/features/games/components/import/platformDisplay";
import i18n from "@/lib/i18n";
import { formatDisplayDateTime } from "@/utils/dateUtils";

import {
  useAcceptStoreMapping,
  useCreateStoreMapping,
  useGetStoreMappings,
  useRejectStoreMapping,
} from "../hooks/storeMappingQueries";

// The generated client shares one enum between every pending/accepted/rejected status.
const StoreMappingStatusEnum = ReportStatusEnum;
type StoreMappingStatusEnum = ReportStatusEnum;

const STATUS_OPTIONS = [
  StoreMappingStatusEnum.PENDING,
  StoreMappingStatusEnum.ACCEPTED,
  StoreMappingStatusEnum.REJECTED,
];
const PLATFORM_OPTIONS = Object.values(PlatformEnum);

const STATUS_COLORS: Record<StoreMappingStatusEnum, string> = {
  [StoreMappingStatusEnum.PENDING]: "yellow",
  [StoreMappingStatusEnum.ACCEPTED]: "green",
  [StoreMappingStatusEnum.REJECTED]: "red",
};

function MappingCard({ mapping }: Readonly<{ mapping: StoreMapping }>): React.JSX.Element {
  const { t } = useTranslation("admin");
  const { mutateAsync: acceptMapping, isPending: isAccepting } = useAcceptStoreMapping();
  const { mutateAsync: rejectMapping, isPending: isRejecting } = useRejectStoreMapping();
  const [rejectOpened, setRejectOpened] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const isPending = mapping.status === StoreMappingStatusEnum.PENDING;

  const handleAccept = async () => {
    try {
      await acceptMapping({ id: mapping.id });
    } catch {
      // toast shown by useAppMutation
    }
  };

  const handleReject = async () => {
    try {
      await rejectMapping({ id: mapping.id, rejection_reason: rejectReason.trim() || undefined });
      setRejectOpened(false);
      setRejectReason("");
    } catch {
      // toast shown by useAppMutation
    }
  };

  return (
    <Paper
      withBorder
      p={16}
      radius="md"
      style={{ background: "var(--color-background-100)", borderColor: "var(--color-background-200)" }}
    >
      <Stack gap={8}>
        <Group gap={8} align="center" wrap="wrap">
          <Badge variant="light" leftSection={<EnumPlatformLogo platform={mapping.platform} />}>
            {t(`storeMappings.platform.${mapping.platform}`)}
          </Badge>
          <Text fw={700}>{mapping.store_title || mapping.store_id}</Text>
          <Text fz="sm" c="dimmed">
            {t("storeMappings.storeIdLabel", { id: mapping.store_id })}
          </Text>
          <Badge color={STATUS_COLORS[mapping.status]} variant="light">
            {t(`storeMappings.status.${mapping.status}`)}
          </Badge>
        </Group>
        <Group gap={8}>
          <Text fz="sm">{t("storeMappings.mappedToLabel")}</Text>
          {mapping.game ? (
            <Link
              to="/game/$id/$slug"
              params={{ id: mapping.game.id.toString(), slug: mapping.game.slug || "" }}
              style={{ fontWeight: 700, color: "var(--color-text-900)" }}
            >
              {mapping.game.title}
            </Link>
          ) : (
            <Text fw={700}>{t("storeMappings.notAGame")}</Text>
          )}
        </Group>
        <Group gap={4} align="center">
          <Text fz="xs" c="dimmed">
            {t("storeMappings.submittedByLabel")}
          </Text>
          <UserChip user={mapping.submitted_by} />
          <Text fz="xs" c="dimmed">
            {t("storeMappings.submittedOn", { date: formatDisplayDateTime(mapping.submitted_at) })}
          </Text>
        </Group>
        {mapping.rejection_reason && (
          <Text fz="xs" c="dimmed">
            {t("storeMappings.rejectionReason", { reason: mapping.rejection_reason })}
          </Text>
        )}
        {isPending && (
          <Group gap={8} justify="flex-end">
            <Popover opened={rejectOpened} onChange={setRejectOpened} withArrow>
              <Popover.Target>
                <Button variant="outline" color="error" size="sm" onClick={() => setRejectOpened(o => !o)}>
                  {t("storeMappings.rejectButton")}
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={8} w={240}>
                  <Textarea
                    placeholder={t("storeMappings.rejectReasonPlaceholder")}
                    value={rejectReason}
                    onChange={event => setRejectReason(event.currentTarget.value)}
                    minRows={2}
                    autosize
                  />
                  <Group justify="flex-end" gap={8}>
                    <Button variant="outline" size="sm" onClick={() => setRejectOpened(false)}>
                      {t("storeMappings.cancelButton")}
                    </Button>
                    <Button size="sm" color="error" onClick={handleReject} isLoading={isRejecting}>
                      {t("storeMappings.confirmRejectButton")}
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
            <Button size="sm" onClick={handleAccept} isLoading={isAccepting}>
              {t("storeMappings.acceptButton")}
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

const addMappingSchema = z
  .object({
    platform: z
      .string()
      .nullable()
      .refine(value => value !== null, i18n.t("validation:storePlatformRequired")),
    storeId: z.string().trim().min(1, i18n.t("validation:storeIdRequired")),
    storeTitle: z.string(),
    gameId: z.string().nullable(),
    notAGame: z.boolean(),
  })
  .refine(values => values.notAGame || values.gameId !== null, {
    message: i18n.t("validation:storeGameRequired"),
    path: ["gameId"],
  });

interface AddMappingValues {
  platform: string | null;
  storeId: string;
  storeTitle: string;
  gameId: string | null;
  notAGame: boolean;
}

const ADD_MAPPING_INITIAL_VALUES: AddMappingValues = {
  platform: null,
  storeId: "",
  storeTitle: "",
  gameId: null,
  notAGame: false,
};

/** Admin form that creates an already accepted mapping for a game picked from the catalogue. */
function AddMappingForm(): React.JSX.Element {
  const { t } = useTranslation("admin");
  const { mutateAsync: createMapping, isPending } = useCreateStoreMapping();
  const form = useForm<AddMappingValues>({
    initialValues: ADD_MAPPING_INITIAL_VALUES,
    validate: schemaResolver(addMappingSchema),
  });
  const [pickerOpened, setPickerOpened] = React.useState(false);
  const [selectedTitle, setSelectedTitle] = React.useState("");

  const handleSubmit = async (values: AddMappingValues) => {
    try {
      await createMapping({
        platform: values.platform as PlatformEnum,
        store_id: values.storeId.trim(),
        store_title: values.storeTitle.trim(),
        ...(values.notAGame ? { not_a_game: true } : { game: Number(values.gameId) }),
      });
      form.reset();
      setSelectedTitle("");
    } catch {
      // toast shown by useAppMutation
    }
  };

  return (
    <Paper withBorder p={16} radius="md" component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={12}>
        <Title order={2} size="h4">
          {t("storeMappings.addTitle")}
        </Title>
        <Text fz="sm" c="dimmed">
          {t("storeMappings.addDescription")}
        </Text>
        <Group gap={16} align="flex-start" wrap="wrap">
          <Select
            label={t("storeMappings.platformLabel")}
            data={PLATFORM_OPTIONS.map(option => ({ value: option, label: t(`storeMappings.platform.${option}`) }))}
            style={{ width: 180 }}
            {...form.getInputProps("platform")}
          />
          <TextInput
            label={t("storeMappings.storeIdField")}
            style={{ width: 220 }}
            {...form.getInputProps("storeId")}
          />
          <TextInput
            label={t("storeMappings.storeTitleField")}
            style={{ width: 240 }}
            {...form.getInputProps("storeTitle")}
          />
          <TextInput
            label={t("storeMappings.gameField")}
            placeholder={t("storeMappings.gamePlaceholder")}
            readOnly
            value={selectedTitle}
            disabled={form.values.notAGame}
            onClick={() => setPickerOpened(true)}
            error={form.errors.gameId}
            style={{ width: 280, cursor: "pointer" }}
            styles={{ input: { cursor: "pointer" } }}
            rightSection={
              form.values.gameId ? (
                <CloseButton
                  size="sm"
                  aria-label={t("storeMappings.clearGame")}
                  onClick={event => {
                    event.stopPropagation();
                    form.setFieldValue("gameId", null);
                    setSelectedTitle("");
                  }}
                />
              ) : undefined
            }
          />
          <Checkbox
            label={t("storeMappings.notAGameField")}
            description={t("storeMappings.notAGameHint")}
            style={{ marginTop: 28 }}
            {...form.getInputProps("notAGame", { type: "checkbox" })}
          />
          <Button type="submit" isLoading={isPending} style={{ marginTop: 25 }}>
            {t("storeMappings.addButton")}
          </Button>
        </Group>
      </Stack>
      <GamePickerModal
        opened={pickerOpened}
        onClose={() => setPickerOpened(false)}
        title={t("storeMappings.pickGameTitle")}
        onPick={game => {
          form.setFieldValue("gameId", String(game.id));
          setSelectedTitle(game.title);
        }}
      />
    </Paper>
  );
}

export default function AdminStoreMappingsPage(): React.JSX.Element {
  const { t } = useTranslation("admin");
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<StoreMappingStatusEnum | "all">(StoreMappingStatusEnum.PENDING);
  const [platform, setPlatform] = React.useState<PlatformEnum | "all">("all");
  const [storeId, setStoreId] = React.useState("");
  const [debouncedStoreId] = useDebouncedValue(storeId.trim(), 300);

  const { data, isLoading, isFetching } = useGetStoreMappings({
    page,
    status: status === "all" ? undefined : status,
    platform: platform === "all" ? undefined : platform,
    store_id: debouncedStoreId || undefined,
  });
  const mappings = data?.results ?? [];
  const totalPages = derivePageCount({ count: data?.count, pageSize: LIST_PAGE_SIZE, page });

  const isFiltered = status !== StoreMappingStatusEnum.PENDING || platform !== "all" || storeId !== "";

  const clearFilters = () => {
    setStatus(StoreMappingStatusEnum.PENDING);
    setPlatform("all");
    setStoreId("");
    setPage(1);
  };

  return (
    <PageShell width="default">
      <Stack gap={24}>
        <PageMeta title={t("storeMappings.title")} noindex />
        <Stack gap={8}>
          <Title order={1} size="h2">
            {t("storeMappings.title")}
          </Title>
          <Text c="dimmed">{t("storeMappings.subtitle")}</Text>
        </Stack>

        <AddMappingForm />

        <Group gap={16} align="flex-end" wrap="wrap">
          <Select
            label={t("storeMappings.statusFilterLabel")}
            value={status}
            onChange={value => {
              setStatus((value as StoreMappingStatusEnum | "all" | null) ?? "all");
              setPage(1);
            }}
            data={[
              { value: "all", label: t("storeMappings.filterAll") },
              ...STATUS_OPTIONS.map(option => ({ value: option, label: t(`storeMappings.status.${option}`) })),
            ]}
            allowDeselect={false}
            style={{ width: 180 }}
          />
          <Select
            label={t("storeMappings.platformFilterLabel")}
            value={platform}
            onChange={value => {
              setPlatform((value as PlatformEnum | "all" | null) ?? "all");
              setPage(1);
            }}
            data={[
              { value: "all", label: t("storeMappings.filterAll") },
              ...PLATFORM_OPTIONS.map(option => ({ value: option, label: t(`storeMappings.platform.${option}`) })),
            ]}
            allowDeselect={false}
            style={{ width: 180 }}
          />
          <TextInput
            label={t("storeMappings.storeIdFilterLabel")}
            value={storeId}
            onChange={event => {
              setStoreId(event.currentTarget.value);
              setPage(1);
            }}
            style={{ width: 200 }}
          />
          {isFiltered && (
            <Button variant="ghost" onClick={clearFilters}>
              {t("storeMappings.clearFilters")}
            </Button>
          )}
        </Group>

        {isLoading ? (
          <Skeleton h={200} radius="md" />
        ) : (
          <Stack gap={16}>
            {isFetching && (
              <Text c="dimmed" fz="xs">
                {t("storeMappings.loading")}
              </Text>
            )}
            {mappings.length === 0 ? (
              <Text c="dimmed" fs="italic">
                {t("storeMappings.empty")}
              </Text>
            ) : (
              mappings.map(mapping => <MappingCard key={mapping.id} mapping={mapping} />)
            )}
          </Stack>
        )}

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </Stack>
    </PageShell>
  );
}
