import { Center, SegmentedControl, Tooltip } from "@mantine/core";
import { IconLayoutGrid, IconTable } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { ListViewMode, useListViewStore } from "@/lib/listViewStore";

/**
 * App-wide toggle between infinite-scroll and paginated-table rendering of a
 * result list. Bound directly to the persisted `useListViewStore`. Icon-only,
 * with the mode name shown as a tooltip.
 */
export function ListViewModeToggle(): React.JSX.Element {
  const { t } = useTranslation("common");
  const mode = useListViewStore(state => state.mode);
  const setMode = useListViewStore(state => state.setMode);

  return (
    <SegmentedControl
      size="md"
      value={mode}
      onChange={value => setMode(value as ListViewMode)}
      aria-label={t("listView.label")}
      data={[
        {
          value: "infinite",
          label: (
            <Tooltip label={t("listView.infinite")} withArrow>
              <Center aria-label={t("listView.infinite")}>
                <IconLayoutGrid size={22} stroke={1.75} />
              </Center>
            </Tooltip>
          ),
        },
        {
          value: "table",
          label: (
            <Tooltip label={t("listView.table")} withArrow>
              <Center aria-label={t("listView.table")}>
                <IconTable size={22} stroke={1.75} />
              </Center>
            </Tooltip>
          ),
        },
      ]}
    />
  );
}
