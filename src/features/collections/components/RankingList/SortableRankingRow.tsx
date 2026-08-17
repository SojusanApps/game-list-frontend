import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { Box } from "@mantine/core";
import * as React from "react";

import type { User } from "@/client";

import { RankingRow } from "./RankingRow";

interface SortableRankingRowProps {
  id: string;
  itemId: number;
  addedBy: User;
  gameId: number;
  gameSlug: string;
  rank: number;
  totalItems: number;
  title: string;
  coverImageId?: string | null;
  description?: string;
  onDescriptionClick?: () => void;
  className?: string;
  isOwner: boolean;
  onRemove?: () => void;
  onItemMove?: (draggedId: string, targetIndex: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onPositionChange?: (newPosition: number) => void;
}

export const SortableRankingRow = React.memo(function SortableRankingRowInner({
  id,
  itemId,
  addedBy,
  gameId,
  rank,
  totalItems,
  title,
  gameSlug,
  coverImageId,
  description,
  onDescriptionClick,
  className,
  isOwner,
  onRemove,
  onItemMove,
  onMoveUp,
  onMoveDown,
  onPositionChange,
}: Readonly<SortableRankingRowProps>) {
  const dragRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [closestEdge, setClosestEdge] = React.useState<Edge | null>(null);

  React.useEffect(() => {
    const element = dragRef.current;
    if (!element || !isOwner) {
      return;
    }

    return combine(
      draggable({
        element,
        getInitialData: () => ({ type: "ranking-item", itemId: id, index: rank - 1 }),
        onGenerateDragPreview: ({ nativeSetDragImage, location, source }) => {
          setCustomNativeDragPreview({
            render: ({ container }) => {
              // Clone the element to create an accurate preview
              const preview = element.cloneNode(true) as HTMLElement;
              preview.style.cssText = `
                width: ${element.offsetWidth}px;
                height: ${element.offsetHeight}px;
                border: 2px solid var(--color-primary-500);
                border-radius: 16px;
                background: white;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                transform: rotate(2deg);
                opacity: 0.95;
                pointer-events: none;
              `;
              container.append(preview);
            },
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: source.element,
              input: location.current.input,
            }),
          });
        },
        onDragStart: () => {
          setIsDragging(true);
        },
        onDrop: () => {
          setIsDragging(false);
        },
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) => source.data.type === "ranking-item" && source.data.itemId !== id,
        getData: ({ input }) => {
          const data = { index: rank - 1 };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        onDragEnter: ({ self }) => {
          const edge = extractClosestEdge(self.data);
          setClosestEdge(edge);
        },
        onDrag: ({ self, source }) => {
          const edge = extractClosestEdge(self.data);
          const sourceIndex = source.data.index as number;

          // Hide indicator for no-op drops
          if (
            rank - 1 === sourceIndex ||
            (edge === "bottom" && rank - 1 === sourceIndex - 1) ||
            (edge === "top" && rank - 1 === sourceIndex + 1)
          ) {
            setClosestEdge(null);
          } else {
            setClosestEdge(edge);
          }
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: ({ source }) => {
          setClosestEdge(null);
          const sourceId = source.data.itemId as string;
          const targetIndex = rank - 1;

          onItemMove?.(sourceId, targetIndex);
        },
      }),
    );
  }, [id, rank, isOwner, onItemMove, title]);

  return (
    <Box
      ref={dragRef}
      className={className}
      style={{
        position: "relative",
        cursor: isOwner ? "grab" : "default",
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <RankingRow
        isDragging={isDragging}
        itemId={itemId}
        addedBy={addedBy}
        gameId={gameId}
        gameSlug={gameSlug}
        rank={rank}
        totalItems={totalItems}
        title={title}
        coverImageId={coverImageId}
        description={description}
        onDescriptionClick={onDescriptionClick}
        isOwner={isOwner}
        onRemove={onRemove}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onPositionChange={onPositionChange}
      />
      {/* Show placeholder box at destination */}
      {closestEdge && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed var(--color-primary-400)",
            borderRadius: 16,
            pointerEvents: "none",
          }}
        />
      )}
      {/* Show drop indicator line at destination */}
      {closestEdge && <DropIndicator edge={closestEdge} gap="8px" />}
      {/* Show dashed border at source when dragging */}
      {isDragging && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed var(--color-primary-400)",
            borderRadius: 16,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
});
