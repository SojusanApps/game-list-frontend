import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Box } from "@mantine/core";
import * as React from "react";

import { cn } from "@/utils/cn";

import classes from "./TierDropZone.module.css";

interface TierDropZoneProps {
  tierId: string;
  isEmpty: boolean;
  isOwner: boolean;
  children: React.ReactNode;
  onItemMove?: (itemId: string, sourceTierId: string, targetTierId: string) => void;
}

export const TierDropZone = React.memo(function TierDropZoneInner({
  tierId,
  isEmpty,
  isOwner,
  children,
  onItemMove,
}: Readonly<TierDropZoneProps>) {
  const dropRef = React.useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = React.useState(false);

  React.useEffect(() => {
    const element = dropRef.current;
    if (!element || !isOwner) {
      return;
    }

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => {
        // Only accept tier items
        if (source.data.type !== "tier-item") {
          return false;
        }

        // Allow dropping from any tier (including same tier)
        return true;
      },
      getData: () => ({ tierId }),
      onDragEnter: ({ source }) => {
        // Only show highlight if dropping into empty tier or different tier
        const sourceTierId = source.data.tierId as string;
        if (isEmpty || sourceTierId !== tierId) {
          setIsDraggedOver(true);
        }
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
      },
      onDrop: ({ source, location }) => {
        setIsDraggedOver(false);
        const sourceItemId = source.data.itemId as string;
        const sourceTierId = source.data.tierId as string;

        // Only trigger if:
        // 1. Moving to a different tier or to an empty tier
        // 2. AND the drop was not on a nested card (dropTargets length would be > 1 if dropped on card)
        const droppedOnCard = location.current.dropTargets.length > 1;

        if (onItemMove && (isEmpty || sourceTierId !== tierId) && !droppedOnCard) {
          onItemMove(sourceItemId, sourceTierId, tierId);
        }
      },
    });
  }, [tierId, isEmpty, isOwner, onItemMove]);

  return (
    <Box
      ref={dropRef}
      className={cn(classes.dropZone, isDraggedOver && classes.dropZoneActive)}
    >
      {children}
    </Box>
  );
});
