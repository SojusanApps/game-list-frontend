import { SimpleGrid } from "@mantine/core";
import React from "react";

interface GridListProps {
  children: React.ReactNode;
  className?: string;
  columnCount?: number;
}

export function GridList({ children, className, columnCount = 7 }: Readonly<GridListProps>) {
  const getCols = () => {
    switch (columnCount) {
      case 7: {
        return { base: 2, sm: 3, md: 4, lg: 5, xl: 7 } as const;
      }
      case 5: {
        return { base: 2, sm: 3, md: 4, xl: 5 } as const;
      }
      case 4: {
        return { base: 1, sm: 2, md: 3, lg: 4 } as const;
      }
      case 8: {
        return { base: 2, sm: 3, md: 4, lg: 6, xl: 8 } as const;
      }
      default: {
        return { base: columnCount } as const;
      }
    }
  };

  return (
    <SimpleGrid cols={getCols()} spacing="md" className={className}>
      {children}
    </SimpleGrid>
  );
}
