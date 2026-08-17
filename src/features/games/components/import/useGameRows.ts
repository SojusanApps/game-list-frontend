import * as React from "react";

import { GameListStatusEnum } from "@/client";

import { GameRow } from "./types";

/** Owns the list of configurable game rows shared by both import flows. */
export function useGameRows() {
  const [rows, setRows] = React.useState<GameRow[]>([]);

  const onStatusChange = React.useCallback((index: number, value: GameListStatusEnum) => {
    setRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status: value };
      return next;
    });
  }, []);

  const onScoreChange = React.useCallback((index: number, value: number | null) => {
    setRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], score: value };
      return next;
    });
  }, []);

  const onFieldChange = React.useCallback((index: number, field: keyof GameRow, value: unknown) => {
    setRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  return { rows, setRows, onStatusChange, onScoreChange, onFieldChange };
}
