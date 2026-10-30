import { useTranslation } from "react-i18next";

import { TruncatedText } from "@/components/ui/TruncatedText";

import { StoreRef } from "../../utils/titleImport";
import { EnumPlatformLogo, platformLabel } from "./platformDisplay";

import styles from "./StoreRefList.module.css";

interface StoreRefListProps {
  refs: readonly StoreRef[];
}

/**
 * The store games an import item came from: shop logo, shop name and store id.
 * Made of spans only, so it can sit inside buttons.
 */
export const StoreRefList = ({ refs }: StoreRefListProps) => {
  const { t } = useTranslation("games");

  if (refs.length === 0) {
    return null;
  }

  return (
    <span className={styles.list}>
      {refs.map(ref => (
        <span key={`${ref.platform}:${ref.store_id}`} className={styles.item}>
          <EnumPlatformLogo platform={ref.platform} />
          {platformLabel(ref.platform)}
          <TruncatedText span className={styles.storeId} truncate="end">
            {t("import.storeId", { id: ref.store_id })}
          </TruncatedText>
        </span>
      ))}
    </span>
  );
};
