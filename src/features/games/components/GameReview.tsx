import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { GameReview as GameReviewType, TargetTypeEnum } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { ReportButton } from "@/features/moderation/components/ReportButton";
import { formatDisplayDate } from "@/utils/dateUtils";

import { getRecommendationConfig } from "../utils/recommendationConfig";

type GameReviewProps = {
  gameReview: GameReviewType;
};

function getScoreStyles(score: number): React.CSSProperties {
  if (score >= 8)
    return {
      background: "var(--color-success-100)",
      color: "var(--color-success-900)",
      border: "1px solid var(--color-success-200)",
    };
  if (score >= 5)
    return {
      background: "var(--color-secondary-100)",
      color: "var(--color-secondary-900)",
      border: "1px solid var(--color-secondary-200)",
    };
  return {
    background: "var(--color-error-100)",
    color: "var(--color-error-900)",
    border: "1px solid var(--color-error-200)",
  };
}

function getScoreLabelColor(score: number): string {
  if (score >= 8) return "var(--color-success-700)";
  if (score >= 5) return "var(--color-secondary-700)";
  return "var(--color-error-700)";
}

function GameReview({ gameReview }: Readonly<GameReviewProps>): React.JSX.Element {
  const { t } = useTranslation("games");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [shouldTruncate, setShouldTruncate] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const createdAt = formatDisplayDate(gameReview.created_at);

  React.useLayoutEffect(() => {
    // 160px is approx 6-7 lines
    if (contentRef.current && contentRef.current.scrollHeight > 160) {
      setShouldTruncate(true);
    }
  }, [gameReview.review]);

  return (
    <Box
      component="article"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid rgba(203,213,225,0.5)",
        background: "rgba(226,232,240,0.5)",
        transition: "background 200ms",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Group justify="space-between" align="center" gap={16}>
        <Group align="center" gap={12}>
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: "9999px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}
          >
            <SafeImage
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              src={gameReview?.user.gravatar_url || undefined}
              alt={gameReview?.user.username}
            />
          </Box>
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text
              fw={700}
              c="var(--color-text-900)"
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {gameReview?.user.username}
            </Text>
            <Text fz="xs" c="var(--color-text-500)" fw={500} fs="italic">
              {createdAt}
            </Text>
          </Stack>
        </Group>

        <Group gap={8} align="center">
          {gameReview?.recommendation && (
            <Box
              style={{
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 700,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                ...getRecommendationConfig(gameReview.recommendation)?.badgeStyle,
              }}
            >
              {getRecommendationConfig(gameReview.recommendation)?.label}
            </Box>
          )}

          {gameReview?.score && (
            <Stack
              align="center"
              justify="center"
              style={{
                padding: "4px 16px",
                borderRadius: "12px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "colors 300ms",
                ...getScoreStyles(gameReview.score),
              }}
            >
              <Text
                component="span"
                fz={10}
                fw={700}
                tt="uppercase"
                style={{
                  letterSpacing: "0.1em",
                  lineHeight: 1,
                  marginBottom: "2px",
                  color: getScoreLabelColor(gameReview.score),
                }}
              >
                {t("review.score")}
              </Text>
              <Text component="span" fz="xl" fw={900} style={{ lineHeight: 1 }}>
                {gameReview.score}
              </Text>
            </Stack>
          )}

          <ReportButton
            targetType={TargetTypeEnum.REVIEW}
            targetId={gameReview.id}
            ownerId={gameReview.user.id}
            ownerUsername={gameReview.user.username}
          />
        </Group>
      </Group>

      <Box style={{ position: "relative", width: "100%" }}>
        <Box
          ref={contentRef}
          style={{
            color: "var(--color-text-700)",
            lineHeight: 1.6,
            background: "rgba(255,255,255,0.6)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid var(--color-background-100)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "all 500ms ease-in-out",
            overflow: "hidden",
            maxHeight: shouldTruncate && !isExpanded ? "160px" : "1250px",
          }}
        >
          <ReactMarkdown>{gameReview?.review || ""}</ReactMarkdown>

          {shouldTruncate && !isExpanded && (
            <Box
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "96px",
                background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)",
                pointerEvents: "none",
              }}
            />
          )}
        </Box>

        {shouldTruncate && (
          <Group
            justify="center"
            style={{ position: "relative", zIndex: 10, marginTop: isExpanded ? "24px" : "-12px" }}
          >
            <UnstyledButton
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 24px",
                background: "white",
                border: "1px solid var(--color-background-200)",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--color-primary-600)",
                boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                transition: "all 200ms",
              }}
            >
              <Text component="span">{isExpanded ? t("review.showLess") : t("review.readFull")}</Text>
              <IconChevronDown
                style={{
                  width: 12,
                  height: 12,
                  transition: "transform 300ms",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </UnstyledButton>
          </Group>
        )}
      </Box>
    </Box>
  );
}

export default GameReview;
