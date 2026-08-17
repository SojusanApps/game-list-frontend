import { Badge, Box, Group, Popover, Stack, Tabs, Text, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link } from "@tanstack/react-router";
import { diffWords, type Change } from "diff";
import React from "react";
import { useTranslation } from "react-i18next";

import { TargetTypeEnum, TranslationSuggestion, TranslationSuggestionStatusEnum, type UserSimple } from "@/client";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCurrentUserId, useIsStaff } from "@/features/auth";
import { ReportButton } from "@/features/moderation/components/ReportButton";

import {
  useAcceptTranslationSuggestion,
  useRejectTranslationSuggestion,
  useWithdrawTranslationSuggestion,
} from "../hooks/translationSuggestionQueries";
import { canModerate, canWithdraw } from "../utils/translationSuggestion";

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

const CODE_BLOCK_STYLE: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSize: "13px",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "var(--color-background-50, #f8fafc)",
  border: "1px solid var(--color-background-200)",
  borderRadius: 6,
  padding: "8px 10px",
};

function diffPartStyle(part: Change): React.CSSProperties {
  if (part.added) {
    return { backgroundColor: "var(--color-success-100)", color: "var(--color-success-900)" };
  }
  if (part.removed) {
    return {
      backgroundColor: "var(--color-error-100)",
      color: "var(--color-error-900)",
      textDecoration: "line-through",
    };
  }
  return {};
}

function ValueDiff({ current, proposed }: Readonly<{ current: string; proposed: string }>) {
  const parts = diffWords(current, proposed);
  return (
    <Box style={CODE_BLOCK_STYLE}>
      {parts.map((part, index) => (
        <Text
          // eslint-disable-next-line react/no-array-index-key -- diff chunks have no stable identity of their own
          key={index}
          component="span"
          style={diffPartStyle(part)}
        >
          {part.value}
        </Text>
      ))}
    </Box>
  );
}

function ValueTabs({ current, proposed }: Readonly<{ current: string; proposed: string }>) {
  const { t } = useTranslation("games");
  return (
    <Tabs defaultValue="diff" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="current">{t("translationSuggestionModal.currentTab")}</Tabs.Tab>
        <Tabs.Tab value="proposed">{t("translationSuggestionModal.proposedTab")}</Tabs.Tab>
        <Tabs.Tab value="diff">{t("translationSuggestionModal.diffTab")}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="current" pt={8}>
        <Box style={CODE_BLOCK_STYLE}>{current}</Box>
      </Tabs.Panel>
      <Tabs.Panel value="proposed" pt={8}>
        <Box style={CODE_BLOCK_STYLE}>{proposed}</Box>
      </Tabs.Panel>
      <Tabs.Panel value="diff" pt={8}>
        <ValueDiff current={current} proposed={proposed} />
      </Tabs.Panel>
    </Tabs>
  );
}

export const STATUS_COLORS: Record<TranslationSuggestionStatusEnum, string> = {
  [TranslationSuggestionStatusEnum.PENDING]: "yellow",
  [TranslationSuggestionStatusEnum.ACCEPTED]: "green",
  [TranslationSuggestionStatusEnum.REJECTED]: "red",
  [TranslationSuggestionStatusEnum.WITHDRAWN]: "gray",
};

interface SuggestionRowProps {
  suggestion: TranslationSuggestion;
}

export function SuggestionRow({ suggestion }: Readonly<SuggestionRowProps>) {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();
  const isStaff = useIsStaff();

  const [rejectOpened, setRejectOpened] = React.useState(false);
  const [acceptOpened, setAcceptOpened] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");

  const { mutateAsync: withdrawSuggestion, isPending: isWithdrawing } = useWithdrawTranslationSuggestion();
  const { mutateAsync: acceptSuggestion, isPending: isAccepting } = useAcceptTranslationSuggestion();
  const { mutateAsync: rejectSuggestion, isPending: isRejecting } = useRejectTranslationSuggestion();

  const showWithdraw = canWithdraw(suggestion, currentUserId);
  const showModerate = canModerate(suggestion, isStaff);

  const showError = () =>
    notifications.show({
      title: t("translationSuggestionModal.errorTitle"),
      message: t("translationSuggestionModal.errorMessage"),
      color: "red",
    });

  const handleWithdraw = async () => {
    try {
      await withdrawSuggestion({ id: suggestion.id });
      notifications.show({
        title: t("translationSuggestionModal.successTitle"),
        message: t("translationSuggestionModal.withdrawSuccess"),
        color: "green",
      });
    } catch {
      showError();
    }
  };

  const handleAccept = async () => {
    try {
      await acceptSuggestion({ id: suggestion.id, gameId: suggestion.game.id });
      notifications.show({
        title: t("translationSuggestionModal.successTitle"),
        message: t("translationSuggestionModal.acceptSuccess"),
        color: "green",
      });
      setAcceptOpened(false);
    } catch {
      showError();
    }
  };

  const handleReject = async () => {
    try {
      await rejectSuggestion({ id: suggestion.id, rejection_reason: rejectReason || undefined });
      notifications.show({
        title: t("translationSuggestionModal.successTitle"),
        message: t("translationSuggestionModal.rejectSuccess"),
        color: "green",
      });
      setRejectOpened(false);
      setRejectReason("");
    } catch {
      showError();
    }
  };

  return (
    <Stack gap={4} p={12} style={{ border: "1px solid var(--color-background-200)", borderRadius: 8 }}>
      <Group justify="space-between" align="center">
        <Badge color={STATUS_COLORS[suggestion.status]}>
          {t(`translationSuggestionModal.status.${suggestion.status}`)}
        </Badge>
        <Group gap={4} align="center">
          <Text fz="xs" c="dimmed">
            {t("translationSuggestionModal.submittedByLabel")}
          </Text>
          <UserChip user={suggestion.submitted_by} />
          <ReportButton
            targetType={TargetTypeEnum.TRANSLATION_SUGGESTION}
            targetId={suggestion.id}
            ownerId={suggestion.submitted_by.id}
            ownerUsername={suggestion.submitted_by.username}
          />
        </Group>
      </Group>
      <ValueTabs current={suggestion.current_value} proposed={suggestion.proposed_value} />
      {suggestion.status === TranslationSuggestionStatusEnum.REJECTED && suggestion.rejection_reason && (
        <Text fz="xs" c="dimmed">
          {t("translationSuggestionModal.rejectionReason", { reason: suggestion.rejection_reason })}
        </Text>
      )}
      {suggestion.status !== TranslationSuggestionStatusEnum.PENDING &&
        suggestion.status !== TranslationSuggestionStatusEnum.WITHDRAWN &&
        suggestion.reviewed_by && (
          <Group gap={4} align="center">
            <Text fz="xs" c="dimmed">
              {t("translationSuggestionModal.reviewedByLabel")}
            </Text>
            <UserChip user={suggestion.reviewed_by} size={18} />
          </Group>
        )}

      {(showWithdraw || showModerate) && (
        <Group justify="flex-end" gap={8} mt={4}>
          {showWithdraw && (
            <Button variant="outline" color="red" size="sm" onClick={handleWithdraw} isLoading={isWithdrawing}>
              {t("translationSuggestionModal.withdrawButton")}
            </Button>
          )}
          {showModerate && (
            <>
              <Popover opened={rejectOpened} onChange={setRejectOpened} withArrow>
                <Popover.Target>
                  <Button variant="outline" color="red" size="sm" onClick={() => setRejectOpened(o => !o)}>
                    {t("translationSuggestionModal.rejectButton")}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack gap={8} w={240}>
                    <Textarea
                      placeholder={t("translationSuggestionModal.rejectReasonPlaceholder")}
                      value={rejectReason}
                      onChange={event => setRejectReason(event.currentTarget.value)}
                      minRows={2}
                      autosize
                    />
                    <Group justify="flex-end" gap={8}>
                      <Button variant="outline" size="sm" onClick={() => setRejectOpened(false)}>
                        {t("translationSuggestionModal.cancelButton")}
                      </Button>
                      <Button size="sm" color="red" onClick={handleReject} isLoading={isRejecting}>
                        {t("translationSuggestionModal.confirmRejectButton")}
                      </Button>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>

              <Popover opened={acceptOpened} onChange={setAcceptOpened} withArrow>
                <Popover.Target>
                  <Button size="sm" onClick={() => setAcceptOpened(o => !o)}>
                    {t("translationSuggestionModal.acceptButton")}
                  </Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack gap={8} w={220}>
                    <Text fz="sm">{t("translationSuggestionModal.acceptConfirmText")}</Text>
                    <Group justify="flex-end" gap={8}>
                      <Button variant="outline" size="sm" onClick={() => setAcceptOpened(false)}>
                        {t("translationSuggestionModal.cancelButton")}
                      </Button>
                      <Button size="sm" onClick={handleAccept} isLoading={isAccepting}>
                        {t("translationSuggestionModal.confirmAcceptButton")}
                      </Button>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            </>
          )}
        </Group>
      )}
    </Stack>
  );
}
