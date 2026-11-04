import { ActionIcon, Box, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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
  /** Sticky bar at the bottom of the modal — usually the action buttons. */
  footer?: React.ReactNode;
  /**
   * Take over the whole screen on phones (with a fixed header and footer around a scrolling body).
   * For long forms; small confirm/login dialogs should stay centered.
   */
  fullScreenOnMobile?: boolean;
  /** Override the body padding (default 32). */
  bodyPadding?: number | string;
  closeButtonLabel?: string;
  children: React.ReactNode;
}

const HEADER_FOOTER_PADDING = "24px 32px";
const HEADER_FOOTER_PADDING_MOBILE = "16px";
const VEIL_BACKGROUND = "rgba(var(--color-veil-rgb), 0.5)";
const BORDER = "1px solid var(--color-background-100)";

/**
 * The shared modal shell: a rounded dialog with a veiled header (title + close
 * button), a padded body that scrolls when the viewport is too short, and an
 * optional sticky footer, so actions are always reachable. Every product modal
 * should build on this so their chrome stays identical.
 */
export function AppModal({
  opened,
  onClose,
  title,
  subtitle,
  size = "lg",
  centered = false,
  footer,
  fullScreenOnMobile = false,
  bodyPadding,
  closeButtonLabel,
  children,
}: Readonly<AppModalProps>) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 36em)");
  const isFullScreen = fullScreenOnMobile && !!isMobile;
  const headerFooterPadding = isMobile ? HEADER_FOOTER_PADDING_MOBILE : HEADER_FOOTER_PADDING;
  const resolvedBodyPadding = bodyPadding ?? (isMobile ? 16 : 32);

  const header = (
    <Group
      justify="space-between"
      wrap="nowrap"
      align="flex-start"
      style={{ padding: headerFooterPadding, borderBottom: BORDER, background: VEIL_BACKGROUND }}
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
    <Box style={{ padding: headerFooterPadding, borderTop: BORDER, background: VEIL_BACKGROUND }}>{footer}</Box>
  ) : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius={isFullScreen ? 0 : "xl"}
      fullScreen={isFullScreen}
      size={size}
      centered={centered}
      overlayProps={{ backgroundOpacity: 0.6 }}
    >
      <Stack gap={0} style={isFullScreen ? { height: "100dvh" } : { maxHeight: "calc(100dvh - 10dvh)" }}>
        {header}
        <Box style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: resolvedBodyPadding }}>
          {children}
        </Box>
        {footerBar}
      </Stack>
    </Modal>
  );
}
