import {
  Badge,
  Box,
  Group,
  NumberInput,
  Pagination,
  Paper,
  Popover,
  Select,
  Skeleton,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Report, ReportStatusEnum, TargetTypeEnum, type UserSimple } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { SafeImage } from "@/components/ui/SafeImage";
import { useIsStaff } from "@/features/auth";
import { useAcceptReport, useGetReports, useRejectReport } from "@/features/moderation/hooks/moderationQueries";
import { buildReportFilters, canModerateReport, ReportFilterState } from "@/features/moderation/utils/report";
import { formatDisplayDateTime } from "@/utils/dateUtils";

const STATUS_STYLES: Record<ReportStatusEnum, React.CSSProperties> = {
  [ReportStatusEnum.PENDING]: {
    background: "var(--color-secondary-tint-bg)",
    color: "var(--color-secondary-tint-text)",
    border: "1px solid var(--color-secondary-tint-border)",
  },
  [ReportStatusEnum.ACCEPTED]: {
    background: "var(--color-success-tint-bg)",
    color: "var(--color-success-tint-text)",
    border: "1px solid var(--color-success-tint-border)",
  },
  [ReportStatusEnum.REJECTED]: {
    background: "var(--color-error-tint-bg)",
    color: "var(--color-error-tint-text)",
    border: "1px solid var(--color-error-tint-border)",
  },
};

const STATUS_OPTIONS = [ReportStatusEnum.PENDING, ReportStatusEnum.ACCEPTED, ReportStatusEnum.REJECTED];

const TARGET_TYPE_OPTIONS = [
  TargetTypeEnum.AVATAR,
  TargetTypeEnum.USERNAME,
  TargetTypeEnum.REVIEW,
  TargetTypeEnum.TRANSLATION_SUGGESTION,
  TargetTypeEnum.GAME_LIST_NOTE,
  TargetTypeEnum.COLLECTION,
  TargetTypeEnum.COLLECTION_ITEM_NOTE,
];

function UserChip({ user, size = 20 }: Readonly<{ user: UserSimple; size?: number }>) {
  return (
    <Link
      to="/profile/$id/$slug"
      params={{ id: user.id.toString(), slug: user.slug || "" }}
      style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}
    >
      <Box style={{ width: size, height: size, borderRadius: "9999px", overflow: "hidden", flexShrink: 0 }}>
        <SafeImage
          src={user.gravatar_url || undefined}
          alt={user.username}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <Text fz="xs" c="dimmed">
        {user.username}
      </Text>
    </Link>
  );
}

function ReportRow({ report }: Readonly<{ report: Report }>) {
  const { t } = useTranslation("admin");
  const { t: tModeration } = useTranslation("moderation");
  const isStaff = useIsStaff();

  const [rejectOpened, setRejectOpened] = React.useState(false);
  const [acceptOpened, setAcceptOpened] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const { mutate: acceptReport, isPending: isAccepting } = useAcceptReport();
  const { mutate: rejectReport, isPending: isRejecting } = useRejectReport();

  const showModerate = canModerateReport(report, isStaff);

  const showError = () =>
    notifications.show({ title: t("reports.errorTitle"), message: t("reports.errorMessage"), color: "red" });

  const handleAccept = () => {
    acceptReport(report.id, {
      onSuccess: () => {
        notifications.show({ title: t("reports.successTitle"), message: t("reports.acceptSuccess"), color: "green" });
        setAcceptOpened(false);
      },
      onError: showError,
    });
  };

  const handleReject = () => {
    rejectReport(
      { id: report.id, rejection_reason: rejectReason || undefined },
      {
        onSuccess: () => {
          notifications.show({ title: t("reports.successTitle"), message: t("reports.rejectSuccess"), color: "green" });
          setRejectOpened(false);
          setRejectReason("");
        },
        onError: showError,
      },
    );
  };

  return (
    <Paper
      withBorder
      p={12}
      radius="md"
      style={{ background: "var(--color-background-100)", borderColor: "var(--color-background-200)" }}
    >
      <Stack gap={8}>
        <Group justify="space-between" align="center">
          <Group gap={8} align="center">
            <Box
              style={{
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 700,
                ...STATUS_STYLES[report.status],
              }}
            >
              {t(`reports.status.${report.status}`)}
            </Box>
            <Badge
              style={{
                background: "var(--color-primary-tint-bg)",
                color: "var(--color-primary-tint-text)",
                border: "1px solid var(--color-primary-tint-border)",
              }}
            >
              {tModeration(`targetType.${report.target_type}`)}
            </Badge>
          </Group>
          <Text fz="xs" c="dimmed">
            {t("reports.submittedAtLabel", { date: formatDisplayDateTime(report.submitted_at) })}
          </Text>
        </Group>

        <Group gap={16}>
          <Group gap={4} align="center">
            <Text fz="xs" c="dimmed">
              {t("reports.reportedByLabel")}
            </Text>
            <UserChip user={report.reported_by} />
          </Group>
          <Group gap={4} align="center">
            <Text fz="xs" c="dimmed">
              {t("reports.reportedUserLabel")}
            </Text>
            <UserChip user={report.reported_user} />
          </Group>
        </Group>

        <Stack gap={4}>
          <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
            {t("reports.reasonLabel")}
          </Text>
          <Text fz="sm">{report.reason}</Text>
        </Stack>

        <Stack gap={4}>
          <Text fz="xs" fw={700} c="dimmed" tt="uppercase">
            {t("reports.snapshotLabel")}
          </Text>
          <Text
            fz="sm"
            fs={report.reported_value ? undefined : "italic"}
            c={report.reported_value ? undefined : "dimmed"}
          >
            {report.reported_value || t("reports.noSnapshot")}
          </Text>
        </Stack>

        {report.status !== ReportStatusEnum.PENDING && report.reviewed_by && (
          <Group gap={4} align="center">
            <Text fz="xs" c="dimmed">
              {t("reports.reviewedByLabel")}
            </Text>
            <UserChip user={report.reviewed_by} size={18} />
            {report.reviewed_at && (
              <Text fz="xs" c="dimmed">
                {t("reports.reviewedAtLabel", { date: formatDisplayDateTime(report.reviewed_at) })}
              </Text>
            )}
          </Group>
        )}

        {showModerate && (
          <Group justify="flex-end" gap={8} mt={4}>
            <Popover opened={rejectOpened} onChange={setRejectOpened} withArrow>
              <Popover.Target>
                <Button variant="outline" color="red" size="sm" onClick={() => setRejectOpened(o => !o)}>
                  {t("reports.rejectButton")}
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={8} w={240}>
                  <Textarea
                    placeholder={t("reports.rejectReasonPlaceholder")}
                    value={rejectReason}
                    onChange={event => setRejectReason(event.currentTarget.value)}
                    minRows={2}
                    autosize
                  />
                  <Group justify="flex-end" gap={8}>
                    <Button variant="outline" size="sm" onClick={() => setRejectOpened(false)}>
                      {t("reports.cancelButton")}
                    </Button>
                    <Button size="sm" color="red" onClick={handleReject} isLoading={isRejecting}>
                      {t("reports.confirmRejectButton")}
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>

            <Popover opened={acceptOpened} onChange={setAcceptOpened} withArrow>
              <Popover.Target>
                <Button size="sm" onClick={() => setAcceptOpened(o => !o)}>
                  {t("reports.acceptButton")}
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap={8} w={220}>
                  <Text fz="sm">{t("reports.acceptConfirmText")}</Text>
                  <Group justify="flex-end" gap={8}>
                    <Button variant="outline" size="sm" onClick={() => setAcceptOpened(false)}>
                      {t("reports.cancelButton")}
                    </Button>
                    <Button size="sm" onClick={handleAccept} isLoading={isAccepting}>
                      {t("reports.confirmAcceptButton")}
                    </Button>
                  </Group>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}

export default function AdminReportsPage(): React.JSX.Element {
  const { t } = useTranslation("admin");
  const { t: tModeration } = useTranslation("moderation");
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<ReportStatusEnum | "all">(ReportStatusEnum.PENDING);
  const [targetType, setTargetType] = React.useState<TargetTypeEnum | undefined>();
  const [reportedUser, setReportedUser] = React.useState<number | undefined>();

  const filterState: ReportFilterState = { status, targetType, reportedUser, page };
  const query = buildReportFilters(filterState);

  const { data, isLoading, isFetching } = useGetReports(query);
  const reports = data?.results ?? [];
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const addToPage = hasNext ? 1 : 0;
  const totalPages = hasNext || hasPrevious ? Math.max(page + addToPage, page) : 1;

  const isFiltered = status !== ReportStatusEnum.PENDING || targetType !== undefined || reportedUser !== undefined;

  const clearFilters = () => {
    setStatus(ReportStatusEnum.PENDING);
    setTargetType(undefined);
    setReportedUser(undefined);
    setPage(1);
  };

  return (
    <Stack gap={24} maw={1024} mx="auto" px={16} w="100%" style={{ flexGrow: 1 }}>
      <PageMeta title={t("reports.title")} />
      <Stack gap={8}>
        <Title order={2}>{t("reports.title")}</Title>
        <Text c="dimmed">{t("reports.subtitle")}</Text>
      </Stack>

      <Group gap={16} align="flex-end" wrap="wrap">
        <Select
          label={t("reports.statusFilterLabel")}
          value={status}
          onChange={value => {
            setStatus((value as ReportStatusEnum | "all" | null) ?? "all");
            setPage(1);
          }}
          data={[
            { value: "all", label: t("reports.statusAll") },
            ...STATUS_OPTIONS.map(option => ({ value: option, label: t(`reports.status.${option}`) })),
          ]}
          allowDeselect={false}
          style={{ width: 200 }}
        />
        <Select
          label={t("reports.targetTypeFilterLabel")}
          value={targetType ?? "all"}
          onChange={value => {
            setTargetType(value === "all" || !value ? undefined : (value as TargetTypeEnum));
            setPage(1);
          }}
          data={[
            { value: "all", label: t("reports.targetTypeAll") },
            ...TARGET_TYPE_OPTIONS.map(option => ({ value: option, label: tModeration(`targetType.${option}`) })),
          ]}
          allowDeselect={false}
          style={{ width: 220 }}
        />
        <NumberInput
          label={t("reports.reportedUserFilterLabel")}
          value={reportedUser}
          onChange={value => {
            setReportedUser(typeof value === "number" ? value : undefined);
            setPage(1);
          }}
          min={1}
          style={{ width: 180 }}
        />
        {isFiltered && (
          <Button variant="ghost" onClick={clearFilters}>
            {t("reports.clearFilters")}
          </Button>
        )}
      </Group>

      {isLoading ? (
        <Skeleton h={200} radius="md" />
      ) : (
        <Stack gap={16}>
          {isFetching && (
            <Text c="dimmed" fz="xs">
              {t("reports.loading")}
            </Text>
          )}
          {reports.length === 0 ? (
            <Text c="dimmed" fs="italic">
              {t("reports.empty")}
            </Text>
          ) : (
            reports.map(report => <ReportRow key={report.id} report={report} />)
          )}
        </Stack>
      )}

      {(hasNext || hasPrevious) && (
        <Group justify="center">
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}
    </Stack>
  );
}
