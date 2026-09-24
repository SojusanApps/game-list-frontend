import { SegmentedControl } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  ALL_REVIEW_LANGUAGES,
  isReviewLanguageFilter,
  REVIEW_LANGUAGE_ORDER,
  type ReviewLanguageFilter as ReviewLanguageFilterValue,
} from "../utils/reviewLanguage";

interface ReviewLanguageFilterProps {
  value: ReviewLanguageFilterValue;
  onChange: (value: ReviewLanguageFilterValue) => void;
}

export default function ReviewLanguageFilter({
  value,
  onChange,
}: Readonly<ReviewLanguageFilterProps>): React.JSX.Element {
  const { t } = useTranslation("games");

  return (
    <SegmentedControl
      size="xs"
      aria-label={t("reviewLanguage.filterLabel")}
      value={value}
      onChange={next => {
        if (isReviewLanguageFilter(next)) {
          onChange(next);
        }
      }}
      data={[
        ...REVIEW_LANGUAGE_ORDER.map(language => ({ value: language, label: t(`reviewLanguage.${language}`) })),
        { value: ALL_REVIEW_LANGUAGES, label: t("reviewLanguage.all") },
      ]}
    />
  );
}
