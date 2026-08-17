import { Box, Flex, Group, Kbd, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";

import type { CurrentDuel, DuelChoice } from "../types";
import { DuelGameCard } from "./DuelGameCard";

interface DuelViewProps {
  duel: CurrentDuel;
  onChoice: (choice: DuelChoice) => void;
  onSkip: () => void;
}

export const DuelView = React.memo(function ({ duel, onChoice, onSkip }: Readonly<DuelViewProps>) {
  const { t } = useTranslation("ranking");
  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "1": {
          e.preventDefault();
          onChoice("A");
          break;
        }
        case "ArrowRight":
        case "2": {
          e.preventDefault();
          onChoice("B");
          break;
        }
        case "Enter":
        case "3": {
          e.preventDefault();
          onChoice("tie");
          break;
        }
        case "s": {
          e.preventDefault();
          onSkip();
          break;
        }
      }
    };

    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [onChoice, onSkip]);

  return (
    <Stack align="center" gap={16} style={{ animation: "fade-in 300ms ease-in-out" }}>
      {/* Cards */}
      <Flex
        align="center"
        gap={{ base: 16, sm: 32 }}
        direction={{ base: "column", sm: "row" }}
        justify="center"
        w="100%"
      >
        <DuelGameCard item={duel.itemA} side="left" onClick={() => onChoice("A")} />

        {/* VS divider */}
        <Group justify="center" align="center" style={{ flexShrink: 0 }}>
          <Box
            w={{ base: 40, sm: 56 }}
            h={{ base: 40, sm: 56 }}
            bg="var(--color-background-50)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              border: "2px solid var(--color-background-200)",
              boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
            }}
          >
            <Text
              component="span"
              fz={{ base: "sm", sm: "xl" }}
              fw={900}
              c="var(--color-text-400)"
              style={{ letterSpacing: "-0.05em" }}
            >
              VS
            </Text>
          </Box>
        </Group>

        <DuelGameCard item={duel.itemB} side="right" onClick={() => onChoice("B")} />
      </Flex>

      {/* Action buttons */}
      <Stack align="center" gap={16} w="100%">
        <Flex gap={12} justify="center" direction={{ base: "column", xs: "row" }} w="100%">
          <Button
            onClick={() => onChoice("A")}
            style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingInline: 8 }}
            fullWidth
          >
            <Text component="span" hiddenFrom="sm">
              {t("duel.chooseTop")}
            </Text>
            <Text component="span" visibleFrom="sm" lh={1} style={{ display: "flex", alignItems: "center" }}>
              {t("duel.chooseLeft")}
              <Kbd
                size="xs"
                ml={6}
                style={{ opacity: 0.6, background: "rgba(255,255,255,0.2)", verticalAlign: "middle" }}
              >
                ←
              </Kbd>
            </Text>
          </Button>
          <Button
            onClick={() => onChoice("tie")}
            variant="outline"
            style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingInline: 8 }}
            fullWidth
          >
            <Text component="span" lh={1} style={{ display: "flex", alignItems: "center" }}>
              {t("duel.tie")}
              <Kbd size="xs" ml={6} style={{ opacity: 0.6, verticalAlign: "middle" }} visibleFrom="sm">
                Enter
              </Kbd>
            </Text>
          </Button>
          <Button
            onClick={() => onChoice("B")}
            style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingInline: 8 }}
            fullWidth
          >
            <Text component="span" hiddenFrom="sm">
              {t("duel.chooseBottom")}
            </Text>
            <Text component="span" visibleFrom="sm" lh={1} style={{ display: "flex", alignItems: "center" }}>
              {t("duel.chooseRight")}
              <Kbd
                size="xs"
                ml={6}
                style={{ opacity: 0.6, background: "rgba(255,255,255,0.2)", verticalAlign: "middle" }}
              >
                →
              </Kbd>
            </Text>
          </Button>
        </Flex>

        <Button onClick={onSkip} variant="ghost" size="sm" style={{ color: "var(--color-text-400)" }}>
          <Text component="span" style={{ display: "flex", alignItems: "center" }}>
            {t("duel.skipPair")}
            <Kbd size="xs" ml={6} style={{ opacity: 0.6, verticalAlign: "middle" }} visibleFrom="sm">
              S
            </Kbd>
          </Text>
        </Button>
      </Stack>

      {/* Keyboard hint */}
      <Text size="xs" style={{ color: "var(--color-text-400)" }} ta="center" visibleFrom="sm">
        {t("duel.useKeyboard")}{" "}
        <Text component="span" fw={700}>
          ← / 1
        </Text>{" "}
        {t("duel.left")} &middot;{" "}
        <Text component="span" fw={700}>
          → / 2
        </Text>{" "}
        {t("duel.right")} &middot;{" "}
        <Text component="span" fw={700}>
          Enter / 3
        </Text>{" "}
        {t("duel.tie")} &middot;{" "}
        <Text component="span" fw={700}>
          S
        </Text>{" "}
        {t("duel.skip")}
      </Text>
    </Stack>
  );
});

DuelView.displayName = "DuelView";
