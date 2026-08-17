import { Select, Group } from "@mantine/core";
import { IconBrandSteam, IconListDetails } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

export type ImportSource = "steam" | "title";

interface ImportSourceSelectProps {
  value: ImportSource;
  onChange: (value: ImportSource) => void;
}

const sourceIcons: Record<ImportSource, React.ReactNode> = {
  steam: <IconBrandSteam size={16} />,
  title: <IconListDetails size={16} />,
};

/** The import-source picker shown on the first step of every import flow. */
export const ImportSourceSelect = ({ value, onChange }: ImportSourceSelectProps) => {
  const { t } = useTranslation("games");

  return (
    <Select
      id="import-source"
      label={t("import.selectSource")}
      data={[
        { value: "steam", label: "Steam" },
        { value: "title", label: t("import.sourceTitleOption") },
      ]}
      value={value}
      onChange={val => onChange((val as ImportSource) ?? "steam")}
      allowDeselect={false}
      leftSection={sourceIcons[value]}
      leftSectionPointerEvents="none"
      renderOption={({ option }) => (
        <Group gap={8}>
          {sourceIcons[option.value as ImportSource]}
          <span>{option.label}</span>
        </Group>
      )}
    />
  );
};
