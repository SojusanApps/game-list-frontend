import * as React from "react";
import { Box, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import ItemOverlay from "@/components/ui/ItemOverlay";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { Game, CompanyGame } from "@/client";

interface GameDetailsRelatedTabProps {
  gameDetails?: Game;
}

function renderRelatedGamesSection(title: string, games: CompanyGame[] | undefined) {
  if (!games || games.length === 0) return null;
  return (
    <CollapsibleSection title={title} count={games.length}>
      <VirtualGridList
        items={games}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        style={{ height: "400px" }}
        renderItem={(game: CompanyGame) => (
          <ItemOverlay
            itemPageUrl={`/game/${game.id}/${game.slug}`}
            itemCoverUrl={
              game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374) : null
            }
            name={game.title}
          />
        )}
      />
    </CollapsibleSection>
  );
}

export default function GameDetailsRelatedTab({ gameDetails }: Readonly<GameDetailsRelatedTabProps>) {
  const { t } = useTranslation("games");

  return (
    <Stack gap={16}>
      {gameDetails?.parent_game && (
        <CollapsibleSection title={t("related.parentGame")} defaultOpen={true}>
          <Box maw={200}>
            <ItemOverlay
              itemPageUrl={`/game/${gameDetails.parent_game.id}/${gameDetails.parent_game.slug}`}
              itemCoverUrl={
                gameDetails.parent_game.cover_image_id
                  ? getIGDBImageURL(gameDetails.parent_game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
                  : null
              }
              name={gameDetails.parent_game.title}
            />
          </Box>
        </CollapsibleSection>
      )}
      {renderRelatedGamesSection(t("related.dlcs"), gameDetails?.dlcs)}
      {renderRelatedGamesSection(t("related.expansions"), gameDetails?.expansions)}
      {renderRelatedGamesSection(t("related.standaloneExpansions"), gameDetails?.standalone_expansions)}
      {renderRelatedGamesSection(t("related.bundles"), gameDetails?.bundles)}
      {renderRelatedGamesSection(t("related.expandedGames"), gameDetails?.expanded_games)}
      {renderRelatedGamesSection(t("related.forks"), gameDetails?.forks)}
      {renderRelatedGamesSection(t("related.ports"), gameDetails?.ports)}

      {!gameDetails?.parent_game &&
        (!gameDetails?.dlcs || gameDetails.dlcs.length === 0) &&
        (!gameDetails?.expansions || gameDetails.expansions.length === 0) &&
        (!gameDetails?.standalone_expansions || gameDetails.standalone_expansions.length === 0) &&
        (!gameDetails?.bundles || gameDetails.bundles.length === 0) &&
        (!gameDetails?.expanded_games || gameDetails.expanded_games.length === 0) &&
        (!gameDetails?.forks || gameDetails.forks.length === 0) &&
        (!gameDetails?.ports || gameDetails.ports.length === 0) && (
          <Box
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid var(--color-background-200)",
              padding: "32px",
              textAlign: "center",
              color: "var(--color-text-500)",
              fontStyle: "italic",
            }}
          >
            {t("related.noRelatedGames")}
          </Box>
        )}
    </Stack>
  );
}
