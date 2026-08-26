import { Box, Flex, Group, Modal, ScrollArea, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { CollectionItem } from "@/client";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useBulkReorderCollectionItems } from "@/features/collections/hooks/useCollectionQueries";

import { useRankingSession } from "../hooks/useRankingSession";
import { getTotalRounds, getTotalDuels } from "../utils/swissTournament";
import { DuelView } from "./DuelView";
import { PairwiseRankingResults } from "./PairwiseRankingResults";
import { ProgressBar } from "./ProgressBar";

interface PairwiseRankingModalProps {
  collectionId: number;
  collectionItems: CollectionItem[];
  onClose: () => void;
}

export default function PairwiseRankingModal({
  collectionId,
  collectionItems,
  onClose,
}: Readonly<PairwiseRankingModalProps>) {
  const { t } = useTranslation("ranking");
  const [isApplying, setIsApplying] = React.useState(false);
  const [confirmConfig, setConfirmConfig] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDestructive?: boolean;
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

  const {
    state,
    currentDuel,
    rankedItems,
    progress,
    hasExistingProfile,
    startNew,
    resume,
    submitChoice,
    skipDuel,
    viewResults,
    continueDueling,
    reset,
  } = useRankingSession(collectionId, collectionItems);

  const { mutateAsync: bulkReorderItems } = useBulkReorderCollectionItems();

  // Apply ranking order to the actual collection
  const handleApplyToCollection = React.useCallback(async () => {
    setIsApplying(true);
    try {
      await bulkReorderItems({
        collectionId,
        items: rankedItems.map((item, i) => ({ id: item.itemId, position: i })),
      });
      notifications.show({ title: t("modal.successTitle"), message: t("modal.applySuccess"), color: "green" });
      onClose();
    } catch (error) {
      console.error("Failed to apply ranking:", error);
      notifications.show({ title: t("modal.errorTitle"), message: t("modal.applyFailed"), color: "red" });
    } finally {
      setIsApplying(false);
    }
  }, [rankedItems, collectionId, bulkReorderItems, onClose, t]);

  // Handle "Start Fresh" with confirmation if existing profile
  const handleStartFresh = React.useCallback(() => {
    if (hasExistingProfile) {
      setConfirmConfig({
        isOpen: true,
        title: t("modal.confirmStartFreshTitle"),
        message: t("modal.confirmStartFreshMessage"),
        confirmLabel: t("modal.confirmStartFreshButton"),
        isDestructive: true,
        action: () => {
          startNew();
          closeConfirm();
        },
      });
    } else {
      startNew();
    }
  }, [hasExistingProfile, startNew, t]);

  const handleReset = React.useCallback(() => {
    setConfirmConfig({
      isOpen: true,
      title: t("modal.confirmResetTitle"),
      message: t("modal.confirmResetMessage"),
      confirmLabel: t("modal.confirmResetButton"),
      isDestructive: true,
      action: () => {
        reset();
        closeConfirm();
      },
    });
  }, [reset, t]);

  const handleClose = React.useCallback(() => {
    if (state === "dueling" && progress.duelsCompleted > 0) {
      setConfirmConfig({
        isOpen: true,
        title: t("modal.confirmCloseTitle"),
        message: t("modal.confirmCloseMessage"),
        confirmLabel: t("modal.confirmCloseButton"),
        action: () => {
          onClose();
          closeConfirm();
        },
      });
    } else {
      onClose();
    }
  }, [state, progress.duelsCompleted, onClose, t]);

  const tooFewItems = collectionItems.length < 2;

  const renderBody = () => {
    if (tooFewItems) {
      return (
        <Stack align="center" justify="center" h="100%" style={{ textAlign: "center" }}>
          <Box
            w={80}
            h={80}
            bg="var(--color-background-50)"
            style={{
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text component="span" fz={36}>
              ⚖️
            </Text>
          </Box>
          <Title order={3} fz="lg" fw={700} c="var(--color-text-900)">
            {t("modal.notEnoughTitle")}
          </Title>
          <Text c="var(--color-text-500)" maw={320} mt={8}>
            {t("modal.notEnoughMessage")}
          </Text>
        </Stack>
      );
    }

    if (state === "idle") {
      return (
        <Stack align="center" justify="center" gap={24} h="100%" style={{ textAlign: "center" }}>
          <Box
            w={80}
            h={80}
            bg="var(--color-primary-tint-bg)"
            style={{ borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Text component="span" fz={36}>
              ⚔️
            </Text>
          </Box>
          <Box>
            <Title
              order={3}
              fz="xl"
              fw={900}
              c="var(--color-text-900)"
              style={{ textTransform: "uppercase", letterSpacing: "-0.025em" }}
            >
              {t("modal.rankTitle")}
            </Title>
            <Text c="var(--color-text-500)" maw={448} mt={8} style={{ lineHeight: 1.625 }}>
              {t("modal.rankDescription")}
            </Text>
            <Text size="xs" c="var(--color-text-400)" mt={12}>
              {t("modal.gamesCount", { count: collectionItems.length })} &middot;{" "}
              {t("modal.roundsCount", { count: getTotalRounds(collectionItems.length) })} &middot; ~
              {t("modal.duelsCount", { count: getTotalDuels(collectionItems.length) })}
            </Text>
          </Box>

          <Group gap={12}>
            {hasExistingProfile ? (
              <>
                <Button
                  onClick={resume}
                  style={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    paddingInline: 32,
                    boxShadow: "var(--shadow-button-glow)",
                  }}
                >
                  {t("modal.resumeSession")}
                </Button>
                <Button
                  onClick={handleStartFresh}
                  variant="outline"
                  style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingInline: 24 }}
                >
                  {t("modal.startFreshButton")}
                </Button>
              </>
            ) : (
              <Button
                onClick={startNew}
                style={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  paddingInline: 32,
                  boxShadow: "var(--shadow-button-glow)",
                }}
              >
                {t("modal.startRanking")}
              </Button>
            )}
          </Group>
        </Stack>
      );
    }

    if (state === "dueling" && currentDuel) {
      return (
        <Box style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
          <Box style={{ margin: "auto", width: "100%", paddingBlock: "8px" }}>
            <DuelView duel={currentDuel} onChoice={submitChoice} onSkip={skipDuel} />
          </Box>
        </Box>
      );
    }

    if (state === "results") {
      return (
        <PairwiseRankingResults
          items={rankedItems}
          onContinueDueling={continueDueling}
          onApplyToCollection={handleApplyToCollection}
          isApplying={isApplying}
        />
      );
    }

    return null;
  };

  return (
    <>
      <Modal
        opened={true}
        onClose={handleClose}
        withCloseButton={false}
        padding={0}
        radius="xl"
        size="80rem"
        overlayProps={{ backgroundOpacity: 0.6 }}
        styles={{
          content: { height: "85vh", background: "var(--color-background-100)" },
          body: { height: "100%", padding: 0 },
        }}
      >
        <Stack gap={0} style={{ height: "100%" }}>
          {/* Header */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "stretch", sm: "center" }}
            gap={{ base: 12, sm: 16 }}
            p={{ base: 16, sm: 24 }}
            pb={{ base: 12, sm: 16 }}
            style={{ borderBottom: "1px solid var(--color-background-100)" }}
          >
            <Stack gap={12} style={{ flex: 1, minWidth: 0 }}>
              <Group justify="space-between" wrap="nowrap">
                <Title
                  order={2}
                  fz={{ base: "lg", sm: "xl" }}
                  fw={900}
                  c="var(--color-text-900)"
                  style={{ textTransform: "uppercase", letterSpacing: "-0.025em" }}
                >
                  {t("modal.title")}
                </Title>
                <UnstyledButton
                  hiddenFrom="sm"
                  onClick={handleClose}
                  p={6}
                  bg="var(--color-background-50)"
                  c="var(--color-text-400)"
                  style={{ borderRadius: 12, border: "1px solid var(--color-background-100)" }}
                >
                  <IconX size={18} />
                </UnstyledButton>
              </Group>
              {state !== "idle" && (
                <Box w="100%" maw={384}>
                  <ProgressBar progress={progress} />
                </Box>
              )}
            </Stack>

            <Flex gap={8} justify={{ base: "flex-start", sm: "flex-end" }} align="center">
              {state === "dueling" && (
                <Button
                  onClick={viewResults}
                  variant="outline"
                  size="sm"
                  style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                  {t("modal.viewResults")}
                </Button>
              )}
              {state !== "idle" && (
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  style={{ fontWeight: 500, color: "var(--color-error-500)" }}
                >
                  {t("modal.resetButton")}
                </Button>
              )}
              <UnstyledButton
                visibleFrom="sm"
                onClick={handleClose}
                p={8}
                bg="var(--color-background-50)"
                c="var(--color-text-400)"
                style={{ borderRadius: 12, border: "1px solid var(--color-background-100)", transition: "color 200ms" }}
              >
                <IconX size={20} />
              </UnstyledButton>
            </Flex>
          </Flex>

          {/* Body */}
          <ScrollArea
            style={{ flex: 1, height: 0, display: "flex", flexDirection: "column" }}
            viewportProps={{ style: { flex: 1, height: "auto", minHeight: 0, padding: "16px" } }}
          >
            {renderBody()}
          </ScrollArea>
        </Stack>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        opened={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.action}
        onClose={closeConfirm}
        isDestructive={confirmConfig.isDestructive}
        confirmLabel={confirmConfig.confirmLabel}
      />
    </>
  );
}
