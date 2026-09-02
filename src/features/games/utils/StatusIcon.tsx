import type { IconProps } from "@tabler/icons-react";

import { GameListStatusEnum } from "@/client";

import { getStatusConfig } from "./statusConfig";

interface StatusIconProps extends IconProps {
  status: GameListStatusEnum | string | undefined;
  /** Render the icon as a glowing "neon sign" in the status' hue. */
  neon?: boolean;
}

/** Renders the Tabler icon mapped to a game list status. */
export function StatusIcon({
  status,
  size = 16,
  stroke = 1.5,
  neon = false,
  style,
  ...rest
}: Readonly<StatusIconProps>) {
  const config = getStatusConfig(status);
  if (!config) {
    return null;
  }
  const Icon = config.icon;
  return <Icon size={size} stroke={stroke} style={{ ...(neon ? config.neonStyle : undefined), ...style }} {...rest} />;
}
