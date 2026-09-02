import { GameListStatusEnum } from "@/client";

import { getStatusConfig } from "./statusConfig";

export default function code_to_value_mapping() {
  return Object.values(GameListStatusEnum).map(code => {
    const config = getStatusConfig(code);
    return {
      code,
      value: config ? config.label : code,
    };
  });
}
