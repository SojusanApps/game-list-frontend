import { Group, Stack, Title, Box, UnstyledButton, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconUserOff } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { getStatusConfig } from "@/features/games/utils/statusConfig";
import { cn } from "@/utils/cn";
import { formatDisplayDate } from "@/utils/dateUtils";
import { getRatingColor, getRatingTextColor } from "@/utils/ratingUtils";

import { SafeImage } from "./SafeImage";

import styles from "./ItemOverlay.module.css";

type ItemOverlayProps = {
  className?: string;
  style?: React.CSSProperties;
  /** Where the card links to. Omit to render a button instead — pair with `onClick`. */
  itemPageUrl?: string;
  /** Click handler used when `itemPageUrl` is omitted (selection-style cards). */
  onClick?: () => void;
  itemCoverUrl?: string | null;
  name: string;
  variant?: "cover" | "logo";
  gameType?: string | null;
  releaseDate?: string | null;
  rating?: number | null;
  status?: string | null;
  showFullReleaseDate?: boolean;
  actionSlot?: React.ReactNode | ((hovered: boolean) => React.ReactNode);
  isInactive?: boolean;
};

function ItemOverlay({
  className,
  style,
  name = "Name Placeholder",
  itemPageUrl,
  onClick,
  itemCoverUrl,
  variant = "cover",
  gameType,
  releaseDate,
  rating,
  status,
  showFullReleaseDate = false,
  actionSlot,
  isInactive = false,
}: Readonly<ItemOverlayProps>): React.JSX.Element {
  const { t } = useTranslation("common"); // also subscribes to language changes so status ribbon label re-renders
  const isLogo = variant === "logo";
  const { hovered, ref } = useHover<HTMLDivElement>();

  const releaseDisplay = React.useMemo(() => {
    if (!releaseDate) {
      return null;
    }
    try {
      const date = new Date(releaseDate);
      if (Number.isNaN(date.getTime())) {
        return null;
      }
      return showFullReleaseDate ? formatDisplayDate(date) : date.getFullYear().toString();
    } catch {
      return null;
    }
  }, [releaseDate, showFullReleaseDate]);

  const ratingBg = React.useMemo(() => getRatingColor(rating), [rating]);
  const ratingText = React.useMemo(() => getRatingTextColor(rating), [rating]);

  const innerStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  };

  const content = (
    <>
      {/* Poster Image */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <SafeImage
          containerStyle={{ width: "100%", height: "100%" }}
          src={itemCoverUrl || undefined}
          alt={name}
          loading="lazy"
          objectFit={isLogo ? "contain" : "cover"}
        />
      </Box>

      {/* Top Badges (Floating Chips) & Right Ribbon */}
      {rating !== null && rating !== undefined && (
        <Box
          className={styles.scoreBadge}
          style={{
            background: ratingBg,
            color: ratingText,
          }}
        >
          {rating.toFixed(1)}
        </Box>
      )}

      {status && getStatusConfig(status) && (
        <Box
          className={styles.statusRibbon}
          style={{
            background: getStatusConfig(status)?.badgeStyle.background,
            color: getStatusConfig(status)?.badgeStyle.color,
            border: `1px solid ${getStatusConfig(status)?.badgeStyle.borderColor || "transparent"}`,
          }}
        >
          {getStatusConfig(status)?.label}
        </Box>
      )}

      {isInactive && (
        <Tooltip label={t("inactiveUser")} withArrow>
          <Box className={styles.inactiveBadge}>
            <IconUserOff size={14} />
          </Box>
        </Tooltip>
      )}

      {/* Dynamic Info Anchor (Bottom) */}
      <Box
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.8) 60%, transparent 100%)",
          padding: "16px",
          paddingTop: "64px",
        }}
      >
        <Stack gap={6}>
          {gameType && (
            <Box
              component="span"
              style={{
                background: "rgba(79,70,229,0.9)",
                color: "white",
                fontSize: "8px",
                padding: "2px 8px",
                borderRadius: "6px",
                textTransform: "uppercase",
                fontWeight: 900,
                letterSpacing: "-0.05em",
                border: "1px solid rgba(255,255,255,0.1)",
                width: "fit-content",
                marginBottom: "2px",
              }}
            >
              {gameType}
            </Box>
          )}
          <Title
            order={2}
            lineClamp={2}
            style={{
              fontSize: "11px",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "white",
              letterSpacing: "-0.025em",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {name}
          </Title>

          <Group gap={8}>
            {releaseDisplay && (
              <Box
                component="span"
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {releaseDisplay}
              </Box>
            )}
            <Box
              style={{
                height: "1px",
                flex: 1,
                background: "rgba(255,255,255,0.1)",
              }}
            />
          </Group>
        </Stack>
      </Box>

      {/* Overlay Lens */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          pointerEvents: "none",
        }}
      />
    </>
  );

  return (
    <Box
      ref={ref}
      style={{
        aspectRatio: isLogo ? "3/2" : "264/374",
        ...style,
      }}
      className={cn(styles.card, className)}
    >
      {itemPageUrl ? (
        <Link to={itemPageUrl} style={innerStyle}>
          {content}
        </Link>
      ) : (
        <UnstyledButton type="button" onClick={onClick} style={innerStyle}>
          {content}
        </UnstyledButton>
      )}
      {typeof actionSlot === "function" ? actionSlot(hovered) : actionSlot}
    </Box>
  );
}

export default ItemOverlay;
