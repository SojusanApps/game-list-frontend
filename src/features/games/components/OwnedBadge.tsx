import { Badge, Tooltip } from "@mantine/core";
import { IconDeviceGamepad2Filled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { hasScore } from "@/utils/ratingUtils";

interface OwnedBadgeProps {
  /** The entry's score; the badge moves below the score badge when there is one. */
  score?: number | null;
}

/** Icon-only "Owned" marker for the top-left corner of an `ItemOverlay` card. */
export function OwnedBadge({ score }: Readonly<OwnedBadgeProps>) {
  const { t } = useTranslation("games");

  return (
    <Tooltip label={t("gameList.table.owned")} withArrow>
      <Badge
        variant="filled"
        color="green"
        size="lg"
        p={6}
        aria-label={t("gameList.table.owned")}
        style={{
          position: "absolute",
          top: hasScore(score) ? 40 : 8,
          left: 8,
          zIndex: 20,
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <IconDeviceGamepad2Filled size={14} aria-hidden />
      </Badge>
    </Tooltip>
  );
}
