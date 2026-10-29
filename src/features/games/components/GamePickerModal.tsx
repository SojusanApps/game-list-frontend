import * as React from "react";

import { GameSimpleList } from "@/client";
import { AppModal } from "@/components/ui/AppModal";

import { GameCatalogueSearch } from "./GameCatalogueSearch";

interface GamePickerModalProps {
  opened: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** Called with the picked game; the modal closes afterwards. */
  onPick: (game: GameSimpleList) => void;
}

function GamePickerBody({ onPick }: Readonly<{ onPick: (game: GameSimpleList) => void }>) {
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<Record<string, unknown>>({});
  return (
    <GameCatalogueSearch
      search={search}
      onSearchChange={setSearch}
      filters={filters}
      onFiltersChange={setFilters}
      onSelect={onPick}
      columnCount={4}
      gridHeight="60vh"
    />
  );
}

/** Modal to find a catalogue game with the Search Engine's text search and filters, and pick one. */
export function GamePickerModal({ opened, onClose, title, onPick }: Readonly<GamePickerModalProps>) {
  return (
    <AppModal opened={opened} onClose={onClose} title={title} size="xl" centered bodyPadding={24}>
      {/* Mounted only while open, so the search starts fresh each time. */}
      <GamePickerBody
        onPick={game => {
          onPick(game);
          onClose();
        }}
      />
    </AppModal>
  );
}
