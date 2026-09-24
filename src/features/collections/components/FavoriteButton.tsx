import { ActionIcon, Tooltip } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { useRequireAuth } from "@/features/auth";

import { useSetCollectionFavorite } from "../hooks/useCollectionQueries";

interface FavoriteButtonProps {
  collectionId: number;
  isFavorite: boolean;
  iconSize?: number;
}

/**
 * Toggles the viewer's own Favorite on a Collection. Shown to anonymous visitors too: clicking it opens the
 * login-required modal instead of calling the API (ADR 0004).
 */
export function FavoriteButton({ collectionId, isFavorite, iconSize = 20 }: Readonly<FavoriteButtonProps>) {
  const { t } = useTranslation("collections");
  const requireAuth = useRequireAuth();
  const { mutate: setFavorite, isPending } = useSetCollectionFavorite();

  const label = isFavorite ? t("favorite.remove") : t("favorite.add");
  const Icon = isFavorite ? IconHeartFilled : IconHeart;

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        variant="subtle"
        color="gray"
        aria-label={label}
        aria-pressed={isFavorite}
        disabled={isPending}
        onClick={e => {
          // The button can sit inside a link or a clickable row; toggling must not navigate.
          e.preventDefault();
          e.stopPropagation();
          requireAuth(() => setFavorite({ id: collectionId, favorite: !isFavorite }));
        }}
      >
        <Icon
          size={iconSize}
          stroke={1.5}
          style={{ color: isFavorite ? "var(--mantine-color-red-6)" : "var(--color-text-400)" }}
        />
      </ActionIcon>
    </Tooltip>
  );
}
