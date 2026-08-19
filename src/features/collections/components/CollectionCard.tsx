import { Stack, Group, Box, Title, Text } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Collection, TypeEnum } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

interface CollectionCardProps {
  collection: Collection;
}

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 20, height: 20, color: filled ? "#ef4444" : "var(--color-text-400)" }}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z" />
  </svg>
);

export default function CollectionCard({ collection }: Readonly<CollectionCardProps>) {
  const { t } = useTranslation("collections");
  const { hovered, ref } = useHover<HTMLDivElement>();
  const images = collection.items_cover_image_ids || [];
  const deckLimit = 5;

  const visibilityStyle = React.useMemo((): React.CSSProperties => {
    if (collection.visibility === "PUB")
      return {
        background: "rgba(16,185,129,0.1)",
        color: "var(--color-success-600)",
        border: "1px solid rgba(16,185,129,0.1)",
      };
    if (collection.visibility === "FRI")
      return {
        background: "rgba(99,102,241,0.1)",
        color: "var(--color-primary-600)",
        border: "1px solid rgba(99,102,241,0.1)",
      };
    return {
      background: "rgba(100,116,139,0.1)",
      color: "var(--color-text-500)",
      border: "1px solid var(--color-background-300)",
    };
  }, [collection.visibility]);

  const modeStyle = React.useMemo((): React.CSSProperties => {
    return collection.mode === "S"
      ? {
          background: "rgba(249,115,22,0.1)",
          color: "var(--color-secondary-600)",
          border: "1px solid rgba(249,115,22,0.1)",
        }
      : { background: "rgba(234,179,8,0.1)", color: "#a16207", border: "1px solid rgba(234,179,8,0.1)" };
  }, [collection.mode]);

  const typeStyle = React.useMemo((): React.CSSProperties => {
    switch (collection.type) {
      case TypeEnum.RNK: {
        return {
          background: "var(--color-type-ranking-bg)",
          color: "var(--color-type-ranking-text)",
          border: "1px solid var(--color-type-ranking-border)",
        };
      }
      case TypeEnum.TIE: {
        return {
          background: "var(--color-type-tierlist-bg)",
          color: "var(--color-type-tierlist-text)",
          border: "1px solid var(--color-type-tierlist-border)",
        };
      }
      default: {
        return {
          background: "var(--color-type-normal-bg)",
          color: "var(--color-type-normal-text)",
          border: "1px solid var(--color-type-normal-border)",
        };
      }
    }
  }, [collection.type]);

  const typeDisplay = React.useMemo(() => {
    switch (collection.type) {
      case TypeEnum.RNK: {
        return t("type.ranking");
      }
      case TypeEnum.TIE: {
        return t("type.tierList");
      }
      default: {
        return t("type.normal");
      }
    }
  }, [collection.type, t]);

  const badgeStyle: React.CSSProperties = {
    padding: "2px 10px",
    borderRadius: "9999px",
    fontSize: "10px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <Stack ref={ref} align="center" pt={32} style={{ position: "relative" }}>
      {/* Deck View (Sits on top) */}
      <Link
        to={"/collection/$id/$slug"}
        params={{ id: collection.id.toString(), slug: collection.slug || "" }}
        style={{
          position: "relative",
          width: "75%",
          aspectRatio: "3/4",
          marginBottom: "-40px",
          zIndex: 10,
          transition: "transform 500ms ease-out",
          transform: hovered ? "translateY(-16px)" : "translateY(0)",
          display: "block",
        }}
      >
        {images.length === 0 ? (
          <Box
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              background: "var(--color-background-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed var(--color-background-300)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Text span fz={10} fw={900} c="var(--color-text-400)" tt="uppercase" style={{ letterSpacing: "0.1em" }}>
              Empty
            </Text>
          </Box>
        ) : (
          images
            .slice(0, deckLimit)
            .toReversed()
            .map((hash, index) => {
              const total = Math.min(images.length, deckLimit);
              const pos = total - 1 - index;
              return (
                <Box
                  key={`${collection.id}-preview-${hash}-${pos}`}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    transition: "all 500ms ease-out",
                    zIndex: index,
                    transform: `translateX(${pos * 14}px) translateY(${pos * -8}px) rotate(${pos * 4}deg)`,
                  }}
                >
                  <SafeImage
                    src={getIGDBImageURL(hash ?? "", IGDBImageSize.COVER_BIG_264_374)}
                    alt={`Game ${pos + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              );
            })
        )}

        {/* Favorite Badge */}
        {collection.is_favorite && (
          <Box
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              zIndex: 20,
              padding: "6px",
              borderRadius: "9999px",
              background: "var(--color-background-100)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              border: "1px solid var(--color-background-100)",
            }}
          >
            <HeartIcon filled />
          </Box>
        )}
      </Link>

      {/* Info Card (Base) */}
      <Box
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          paddingTop: "48px",
          paddingBottom: "20px",
          paddingInline: "20px",
          borderRadius: "24px",
          background: "var(--color-background-100)",
          border: `1px solid ${hovered ? "var(--color-primary-100)" : "var(--color-background-200)"}`,
          boxShadow: hovered ? "0 20px 25px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.06)",
          transition: "all 500ms",
          position: "relative",
          zIndex: 0,
        }}
      >
        <Stack align="center" gap={6} style={{ textAlign: "center" }}>
          <Link
            to={"/collection/$id/$slug"}
            params={{ id: collection.id.toString(), slug: collection.slug || "" }}
            style={{ display: "block" }}
          >
            <Title
              order={3}
              fz="lg"
              fw={900}
              c={hovered ? "var(--color-primary-600)" : "var(--color-text-900)"}
              style={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                transition: "color 200ms",
              }}
              title={collection.name}
            >
              {collection.name}
            </Title>
          </Link>

          <Stack align="center" justify="center" gap={8}>
            <Text size="xs" fw={500} c="var(--color-text-500)">
              by{" "}
              <Link
                to={"/profile/$id/$slug"}
                params={{ id: collection.user.id.toString(), slug: collection.user.slug || "" }}
                style={{ fontWeight: 700, color: "var(--color-text-700)" }}
              >
                {collection.user.username}
              </Link>
            </Text>

            <Group wrap="wrap" justify="center" gap={8} mt={4}>
              <Text span style={{ ...badgeStyle, ...visibilityStyle }}>
                {collection.visibility_display}
              </Text>
              <Text span style={{ ...badgeStyle, ...modeStyle }}>
                {collection.mode_display}
              </Text>
              <Text span style={{ ...badgeStyle, ...typeStyle }}>
                {typeDisplay}
              </Text>
              <Text span fz="xs" fw={900} c="var(--color-text-700)">
                {collection.items_count} {collection.items_count === 1 ? t("card.game") : t("card.games")}
              </Text>
            </Group>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
