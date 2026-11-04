import { useTranslation } from "react-i18next";

import { TruncatedText } from "@/components/ui/TruncatedText";

import { StoreRef } from "../../utils/titleImport";
import { EnumPlatformLogo, platformLabel } from "./platformDisplay";

import styles from "./StoreRefList.module.css";

interface StoreRefListProps {
  refs: readonly StoreRef[];
  /** Renders the store id as selectable text (one click selects it for copying). Only use outside buttons. */
  selectable?: boolean;
}

/**
 * The store games an import item came from: shop logo, shop name and store id.
 * Made of spans only, so it can sit inside buttons.
 */
export const StoreRefList = ({ refs, selectable = false }: StoreRefListProps) => {
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
          {selectable ? (
            <TruncatedText span className={styles.storeId} truncate="end">
              {t("import.storeIdLabel")}{" "}
              <span className={styles.selectableId} data-no-activate>
                {ref.store_id}
              </span>
            </TruncatedText>
          ) : (
            <TruncatedText span className={styles.storeId} truncate="end">
              {t("import.storeId", { id: ref.store_id })}
            </TruncatedText>
          )}
        </span>
      ))}
    </span>
  );
};
