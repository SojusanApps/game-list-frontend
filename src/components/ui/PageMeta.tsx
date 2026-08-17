import { Helmet } from "@dr.pogodin/react-helmet";
import React from "react";

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function PageMeta({ title, description, image, url }: Readonly<PageMetaProps>) {
  const fullTitle = title ? `${title} | MyGameList` : "MyGameList";
  const defaultDescription = "Keep track of your gaming progress and discover new titles.";
  const desc = description || defaultDescription;
  const currentUrl = url || (typeof globalThis.window === "object" ? globalThis.location.href : "");
  const imageUrl = image || "/app-logo.svg";

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
