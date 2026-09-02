import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * How a result list is rendered:
 * - `infinite` — infinite-scroll grid/list (the default)
 * - `table` — page-number-paginated table
 *
 * The choice is app-wide and persisted, so a user who prefers tables gets them
 * everywhere the toggle is offered.
 */
export type ListViewMode = "infinite" | "table";

interface ListViewState {
  mode: ListViewMode;
  setMode: (mode: ListViewMode) => void;
}

export const useListViewStore = create<ListViewState>()(
  persist(
    set => ({
      mode: "infinite",
      setMode: mode => set({ mode }),
    }),
    {
      name: "list-view-mode",
    },
  ),
);
