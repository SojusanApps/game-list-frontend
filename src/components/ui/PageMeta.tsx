import { Helmet } from "@dr.pogodin/react-helmet";
import React from "react";
import { useTranslation } from "react-i18next";

import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/config/site";

interface PageMetaProps {
  title?: string;
  description?: string;
  /** Absolute or site-relative image URL. Falls back to the default branded 1200x630 image. */
  image?: string;
  /** Site-relative path used for the canonical URL. Defaults to the current location without the query string. */
  path?: string;
  /** Open Graph type, e.g. "website" or "profile". */
  type?: string;
  /** Ask search engines not to index the page (private or user-specific pages). */
  noindex?: boolean;
  /** Structured data serialized as JSON-LD. */
  jsonLd?: Record<string, unknown>;
}

function toAbsoluteUrl(value: string): string {
  return value.startsWith("/") ? `${SITE_URL}${value}` : value;
}

export function PageMeta({
  title,
  description,
  image,
  path,
  type = "website",
  noindex,
  jsonLd,
}: Readonly<PageMetaProps>) {
  const { t } = useTranslation();
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const defaultDescription = t("defaultDescription");
  const desc = description || defaultDescription;
  const currentPath = path ?? (typeof globalThis.window === "object" ? globalThis.location.pathname : "/");
  const canonicalUrl = `${SITE_URL}${currentPath === "/" ? "/" : currentPath.replace(/\/+$/, "")}`;
  const imageUrl = image ? toAbsoluteUrl(image) : DEFAULT_OG_IMAGE;
  const twitterCard = image ? "summary" : "summary_large_image";

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
