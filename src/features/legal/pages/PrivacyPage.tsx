import * as React from "react";
import { useTranslation } from "react-i18next";

import { LegalDocument } from "../components/LegalDocument";
import privacyEn from "../content/privacy.en.md?raw";
import privacyPl from "../content/privacy.pl.md?raw";

export default function PrivacyPage(): React.JSX.Element {
  const { t } = useTranslation();

  return <LegalDocument title={t("legal.privacyTitle")} contentEn={privacyEn} contentPl={privacyPl} />;
}
