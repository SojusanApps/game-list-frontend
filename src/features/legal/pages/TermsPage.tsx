import * as React from "react";
import { useTranslation } from "react-i18next";

import { LegalDocument } from "../components/LegalDocument";
import termsEn from "../content/terms.en.md?raw";
import termsPl from "../content/terms.pl.md?raw";

export default function TermsPage(): React.JSX.Element {
  const { t } = useTranslation();

  return <LegalDocument title={t("legal.termsTitle")} contentEn={termsEn} contentPl={termsPl} />;
}
