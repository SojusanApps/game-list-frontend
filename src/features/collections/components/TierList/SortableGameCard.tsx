import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { DropIndicator } from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { pointerOutsideOfPreview } from "@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { Box } from "@mantine/core";
import * as React from "react";

import type { User } from "@/client";

import { GameCard } from "./GameCard";

interface SortableGameCardProps {
  id: string;
  collectionItemId: number;
  addedBy: User;
  gameId: number;
  gameSlug: string;
  tierId: string;
  index: number;
  title: string;
  coverImageId?: string | null;
  description?: string;
  onRemove?: () => void;
  onDescriptionChange?: (description: string) => void;
  isOwner: boolean;
  onReorder?: (
    itemId: string,
    sourceTierId: string,
    targetTierId: string,
    sourceIndex: number,
    targetIndex: number,
    edge: Edge | null,
  ) => void;
  onMoveToTier?: (targetTierId: string) => void;
}

export const SortableGameCard = React.memo(function SortableGameCardInner(props: SortableGameCardProps) {
  const {
    id,
    collectionItemId,
    addedBy,
    gameId,
    gameSlug,
    tierId,
    index,
    title,
    coverImageId,
    description,
    onRemove,
    onDescriptionChange,
    isOwner,
    onReorder,
    onMoveToTier,
  } = props;
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
        getInitialData: () => ({ type: "tier-item", itemId: id, tierId, index }),
        onGenerateDragPreview: ({ nativeSetDragImage }) => {
          setCustomNativeDragPreview({
            render: ({ container }) => {
              // Clone the element to create an accurate preview
              const preview = element.cloneNode(true) as HTMLElement;
              preview.style.cssText = `
                transform: rotate(3deg);
                opacity: 0.9;
                pointer-events: none;
              `;
              container.append(preview);
            },
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: "16px",
              y: "8px",
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
        canDrop: ({ source }) => {
          // Can drop any tier item except itself
          return source.data.type === "tier-item" && source.data.itemId !== id;
        },
        getData: ({ input }) => {
          const data = { itemId: id, tierId, index };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["left", "right"],
          });
        },
        onDrag: ({ self, source }) => {
          const edge = extractClosestEdge(self.data);
          const sourceIndex = source.data.index as number;
          const sourceTierId = source.data.tierId as string;

          // Hide indicator for no-op drops
          if (
            sourceTierId === tierId &&
            (index === sourceIndex ||
              (edge === "right" && index === sourceIndex - 1) ||
              (edge === "left" && index === sourceIndex + 1))
          ) {
            setClosestEdge(null);
          } else {
            setClosestEdge(edge);
          }
        },
        onDragEnter: ({ self }) => {
          const edge = extractClosestEdge(self.data);
          setClosestEdge(edge);
        },
        onDragLeave: () => {
          setClosestEdge(null);
        },
        onDrop: ({ source, self }) => {
          const edge = extractClosestEdge(self.data);
          setClosestEdge(null);

          const sourceItemId = source.data.itemId as string;
          const sourceTierId = source.data.tierId as string;
          const sourceIndex = source.data.index as number;

          if (sourceItemId && onReorder) {
            onReorder(sourceItemId, sourceTierId, tierId, sourceIndex, index, edge);
          }
        },
      }),
    );
  }, [id, tierId, index, isOwner, onReorder, title]);

  const draggingCursor = isDragging ? "grabbing" : "grab";

  return (
    <Box
      ref={dragRef}
      style={{
        cursor: isOwner ? draggingCursor : "default",
        opacity: isDragging ? 0.3 : 1,
        position: "relative",
        width: "100%",
        maxWidth: 140,
        aspectRatio: "3/4",
      }}
    >
      <GameCard
        collectionItemId={collectionItemId}
        addedBy={addedBy}
        gameId={gameId}
        gameSlug={gameSlug}
        title={title}
        coverImageId={coverImageId}
        description={description}
        isOwner={isOwner}
        onRemove={onRemove}
        onDescriptionChange={onDescriptionChange}
        onMoveToTier={onMoveToTier}
        currentTier={tierId}
      />
      {/* Show placeholder box at destination */}
      {closestEdge && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed var(--color-primary-400)",
            borderRadius: 12,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
      {/* Show drop indicator line at destination */}
      {closestEdge && <DropIndicator edge={closestEdge} gap="4px" />}
      {/* Show dashed border at source when dragging */}
      {isDragging && (
        <Box
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed var(--color-primary-400)",
            borderRadius: 12,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}
    </Box>
  );
});
