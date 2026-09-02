import { Box, Group, Stack } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game, CompanyGame } from "@/client";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { ClientPaginatedTable } from "@/components/ui/PaginatedTable";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useListViewStore } from "@/lib/listViewStore";

import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { createCompanyGameColumns } from "./companyGameColumns";

interface GameDetailsRelatedTabProps {
  gameDetails?: Game;
}

export default function GameDetailsRelatedTab({ gameDetails }: Readonly<GameDetailsRelatedTabProps>) {
  const { t } = useTranslation("games");
  const navigate = useNavigate();
  const renderMode = useListViewStore(state => state.mode);
  const columns = React.useMemo(() => createCompanyGameColumns(), []);

  const sections: { title: string; games: CompanyGame[] | undefined }[] = [
    { title: t("related.dlcs"), games: gameDetails?.dlcs },
    { title: t("related.expansions"), games: gameDetails?.expansions },
    { title: t("related.standaloneExpansions"), games: gameDetails?.standalone_expansions },
    { title: t("related.bundles"), games: gameDetails?.bundles },
    { title: t("related.expandedGames"), games: gameDetails?.expanded_games },
    { title: t("related.forks"), games: gameDetails?.forks },
    { title: t("related.ports"), games: gameDetails?.ports },
  ];

  const hasAnyList = sections.some(section => section.games && section.games.length > 0);

  const renderSection = ({ title, games }: { title: string; games: CompanyGame[] | undefined }) => {
    if (!games || games.length === 0) {
      return null;
    }
    return (
      <CollapsibleSection key={title} title={title} count={games.length}>
        {renderMode === "table" ? (
          <ClientPaginatedTable
            rows={games}
            columns={columns}
            getRowId={row => String(row.id)}
            onRowClick={row =>
              navigate({ to: "/game/$id/$slug", params: { id: String(row.id), slug: row.slug ?? "" } })
            }
          />
        ) : (
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
        )}
      </CollapsibleSection>
    );
  };

  return (
    <Stack gap={16}>
      {hasAnyList && (
        <Group justify="flex-end">
          <ListViewModeToggle />
        </Group>
      )}

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

      {sections.map(section => renderSection(section))}

      {!gameDetails?.parent_game && !hasAnyList && (
        <Box
          style={{
            background: "var(--color-background-100)",
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
