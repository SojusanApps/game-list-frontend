import { ActionIcon, Box, Group, Modal, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

type ModalSize = NonNullable<React.ComponentProps<typeof Modal>["size"]>;

interface AppModalProps {
  opened: boolean;
  onClose: () => void;
  /** Main heading. A plain string, or a node when part of the title needs its own styling. */
  title: React.ReactNode;
  /** Optional secondary line under the title (e.g. the game a form applies to). */
  subtitle?: React.ReactNode;
  size?: ModalSize;
  centered?: boolean;
  /**
   * Constrain the modal to the viewport and scroll the body between a fixed
   * header and footer. Use for long forms and lists.
   */
  scrollable?: boolean;
  /** Sticky bar at the bottom of the modal — usually the action buttons. */
  footer?: React.ReactNode;
  /**
   * Let content overflow the modal box (e.g. an autocomplete dropdown). Only
   * has an effect when {@link scrollable} is false.
   */
  overflowVisible?: boolean;
  /** Override the body padding (default 32). */
  bodyPadding?: number | string;
  closeButtonLabel?: string;
  children: React.ReactNode;
}

const HEADER_FOOTER_PADDING = "24px 32px";
const VEIL_BACKGROUND = "rgba(var(--color-veil-rgb), 0.5)";
const BORDER = "1px solid var(--color-background-100)";

/**
 * The shared modal shell: a rounded dialog with a veiled header (title + close
 * button), a padded body, and an optional sticky footer. Every product modal
 * should build on this so their chrome stays identical.
 */
export function AppModal({
  opened,
  onClose,
  title,
  subtitle,
  size = "lg",
  centered = false,
  scrollable = false,
  footer,
  overflowVisible = false,
  bodyPadding = 32,
  closeButtonLabel,
  children,
}: Readonly<AppModalProps>) {
  const { t } = useTranslation();

  const header = (
    <Group
      justify="space-between"
      wrap="nowrap"
      align="flex-start"
      style={{ padding: HEADER_FOOTER_PADDING, borderBottom: BORDER, background: VEIL_BACKGROUND }}
    >
      <Box style={{ minWidth: 0 }}>
        <Title order={2} fz={24} fw={900} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
          {title}
        </Title>
        {subtitle && (
          <Text size="sm" c="var(--color-text-500)" mt={4}>
            {subtitle}
          </Text>
        )}
      </Box>
      <ActionIcon
        onClick={onClose}
        variant="subtle"
        size="lg"
        aria-label={closeButtonLabel ?? t("closeModal")}
        style={{ borderRadius: "9999px", color: "var(--color-text-400)", flexShrink: 0 }}
      >
        <IconX style={{ width: 24, height: 24 }} />
      </ActionIcon>
    </Group>
  );

  const footerBar = footer ? (
    <Box style={{ padding: HEADER_FOOTER_PADDING, borderTop: BORDER, background: VEIL_BACKGROUND }}>{footer}</Box>
  ) : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="xl"
      size={size}
      centered={centered}
      overlayProps={{ backgroundOpacity: 0.6 }}
      styles={
        overflowVisible && !scrollable ? { content: { overflow: "visible" }, body: { overflow: "visible" } } : undefined
      }
    >
      <Stack gap={0} style={scrollable ? { height: "100%", maxHeight: "90vh" } : undefined}>
        {header}
        {scrollable ? (
          <ScrollArea
            style={{ flex: 1, height: 0, display: "flex", flexDirection: "column" }}
            viewportProps={{ style: { flex: 1, height: "auto", minHeight: 0, padding: bodyPadding } }}
          >
            {children}
          </ScrollArea>
        ) : (
          <Box style={{ padding: bodyPadding, overflow: overflowVisible ? "visible" : undefined }}>{children}</Box>
        )}
        {footerBar}
      </Stack>
    </Modal>
  );
}
