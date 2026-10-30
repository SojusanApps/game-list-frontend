import { Group, ScrollArea, UnstyledButton } from "@mantine/core";
import { IconInfinity } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatistics, GameListStatusEnum } from "@/client";
import { cn } from "@/utils/cn";

import { STATUS_CONFIG } from "../utils/statusConfig";
import { StatusIcon } from "../utils/StatusIcon";

import styles from "./GameListStatusTabs.module.css";

const STATUS_ORDER = [
  GameListStatusEnum.P,
  GameListStatusEnum.C,
  GameListStatusEnum.PTP,
  GameListStatusEnum.OH,
  GameListStatusEnum.D,
  GameListStatusEnum.NP,
] as const;

const STATISTICS_KEY: Record<GameListStatusEnum, keyof GameListStatistics> = {
  [GameListStatusEnum.P]: "playing",
  [GameListStatusEnum.C]: "completed",
  [GameListStatusEnum.PTP]: "plan_to_play",
  [GameListStatusEnum.OH]: "on_hold",
  [GameListStatusEnum.D]: "dropped",
  [GameListStatusEnum.NP]: "not_planned",
};

interface GameListStatusTabsProps {
  value: GameListStatusEnum | null;
  onChange: (status: GameListStatusEnum | null) => void;
  statistics?: GameListStatistics;
}

const DRAG_THRESHOLD = 4;

/** Lets mouse users drag a horizontally scrolling element, as touch users already can. */
function useDragScroll() {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef({ startX: 0, startScroll: 0, active: false, moved: false });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    drag.current = { startX: e.clientX, startScroll: ref.current.scrollLeft, active: true, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = d.startScroll - dx;
  };
  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (ref.current?.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId);
  };
  // A drag must not count as a click on the tab under the cursor.
  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  return { ref, handlers: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end, onClickCapture } };
}

/** The game list's primary navigation: one tab per status with the number of games in it. */
export function GameListStatusTabs({ value, onChange, statistics }: Readonly<GameListStatusTabsProps>) {
  const { t } = useTranslation("games");
  const { ref, handlers } = useDragScroll();
  const total = statistics
    ? STATUS_ORDER.reduce((sum, status) => sum + (statistics[STATISTICS_KEY[status]] ?? 0), 0)
    : undefined;

  const renderTab = (status: GameListStatusEnum | null, label: string, count: number | undefined) => (
    <UnstyledButton
      key={status ?? "all"}
      type="button"
      aria-pressed={value === status}
      className={cn(styles.tab, value === status && styles.active)}
      onClick={() => onChange(status)}
    >
      {status ? <StatusIcon status={status} size={16} neon /> : <IconInfinity size={16} stroke={1.5} />}
      <span>{label}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </UnstyledButton>
  );

  return (
    <ScrollArea
      type="never"
      w="100%"
      aria-label={t("gameList.statusTabs")}
      viewportRef={ref}
      className={styles.scroller}
      {...handlers}
    >
      <Group
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a button group, not a form fieldset
        role="group"
        aria-label={t("gameList.statusTabs")}
        gap={8}
        wrap="nowrap"
        justify="center"
        style={{ minWidth: "max-content", margin: "0 auto" }}
      >
        {renderTab(null, t("gameList.all"), total)}
        {STATUS_ORDER.map(status =>
          renderTab(status, STATUS_CONFIG[status].label, statistics?.[STATISTICS_KEY[status]]),
        )}
      </Group>
    </ScrollArea>
  );
}
