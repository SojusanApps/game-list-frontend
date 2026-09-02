import { Box } from "@mantine/core";

import { SafeImage } from "@/components/ui/SafeImage";

interface CoverThumbProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  radius?: number;
  fit?: "cover" | "contain";
  background?: string;
}

/** Fixed-size image cell used by the paginated result tables (covers, logos, avatars). */
export function CoverThumb({
  src,
  alt,
  width,
  height,
  radius = 6,
  fit = "cover",
  background,
}: Readonly<CoverThumbProps>): React.JSX.Element {
  return (
    <Box style={{ width, height, borderRadius: radius, overflow: "hidden", flexShrink: 0, background }}>
      <SafeImage src={src || undefined} alt={alt} objectFit={fit} containerStyle={{ width, height }} />
    </Box>
  );
}
