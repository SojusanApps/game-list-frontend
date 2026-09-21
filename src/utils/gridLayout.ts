import type React from "react";

/** Height of a poster card relative to its width (264x374 IGDB cover). */
export const CARD_HEIGHT_TO_WIDTH_RATIO = 374 / 264;

/** Height of a viewport-sized grid area: fits the screen, but never below 500px or above 850px. */
export const GRID_VIEWPORT_HEIGHT = "clamp(500px, calc(100vh - 250px), 850px)";

/**
 * Style for the box that wraps a `VirtualGridList`. The grid stretches to fill it, so the box
 * decides how much of the list is visible. Spread it in place of a fixed `minHeight`.
 */
export const GRID_BOX_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: GRID_VIEWPORT_HEIGHT,
};

interface CardRowHeightParams {
  /** Inner width of the grid, in px. */
  gridWidth: number;
  columnCount: number;
  /** Space between columns, in px. The same space is kept between rows. */
  columnGap: number;
}

/**
 * Height of one grid row of poster cards: the real card height plus one gap, so the space
 * between rows matches the space between columns. Returns 0 while the width is unknown.
 */
export function computeCardRowHeight({ gridWidth, columnCount, columnGap }: CardRowHeightParams): number {
  if (gridWidth <= 0 || columnCount <= 0) {
    return 0;
  }
  const cardWidth = (gridWidth - (columnCount - 1) * columnGap) / columnCount;
  if (cardWidth <= 0) {
    return 0;
  }
  return cardWidth * CARD_HEIGHT_TO_WIDTH_RATIO + columnGap;
}
