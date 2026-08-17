import { Badge, Box, Table, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { GameListCompareRow, UserDetail } from "@/client";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { SafeImage } from "@/components/ui/SafeImage";
import { getRatingColor } from "@/utils/ratingUtils";

import { CompareSection } from "../utils/gameListCompare";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { getStatusConfig } from "../utils/statusConfig";
import { CompareUserChip } from "./CompareUserChip";

import styles from "./GameListCompareTable.module.css";

interface GameListCompareTableProps {
  section: CompareSection;
  firstUserDetails: UserDetail;
  secondUserDetails: UserDetail;
}

function CompareStatusCell({ statusCode, score }: Readonly<{ statusCode: string | null; score: number | null }>) {
  if (!statusCode) {
    return <Text c="var(--color-text-400)">—</Text>;
  }

  const statusConfig = getStatusConfig(statusCode);

  return (
    <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {statusConfig && (
        <Badge
          variant="light"
          size="sm"
          style={{ ...statusConfig.badgeStyle, borderWidth: "1px", borderStyle: "solid" }}
        >
          {statusConfig.emoji} {statusConfig.label}
        </Badge>
      )}
      {score !== null && score !== undefined && (
        <Box className={styles.scoreBadge} style={{ backgroundColor: getRatingColor(score) }}>
          {score}
        </Box>
      )}
    </Box>
  );
}

function GameCell({ row }: Readonly<{ row: GameListCompareRow }>) {
  const coverUrl = getIGDBImageURL(row.game_cover_image ?? "", IGDBImageSize.COVER_SMALL_90_128);

  return (
    <Box
      component={Link}
      to={`/game/${row.game_id}/${row.game_slug}`}
      style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
    >
      <Box className={styles.coverWrapper}>
        <SafeImage src={coverUrl} alt={row.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>
      <Text fw={600} c="var(--color-text-900)">
        {row.title}
      </Text>
    </Box>
  );
}

export function GameListCompareTable({
  section,
  firstUserDetails,
  secondUserDetails,
}: Readonly<GameListCompareTableProps>) {
  const { t } = useTranslation("games");

  let headingUsername = "";
  if (section.key === "firstUserUnique") {
    headingUsername = firstUserDetails.username;
  } else if (section.key === "secondUserUnique") {
    headingUsername = secondUserDetails.username;
  }

  const heading =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t(section.headingKey as any, { username: headingUsername });

  return (
    <CollapsibleSection title={heading} count={section.count} defaultOpen>
      {section.rows.length === 0 ? (
        <Text c="var(--color-text-500)" fs="italic">
          {t("compare.emptySection")}
        </Text>
      ) : (
        <Box className={styles.scrollContainer}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={styles.stickyHeaderCell}>{t("compare.gameColumn")}</Table.Th>
                <Table.Th className={styles.stickyHeaderCell}>
                  <CompareUserChip userDetails={firstUserDetails} />
                </Table.Th>
                <Table.Th className={styles.stickyHeaderCell}>
                  <CompareUserChip userDetails={secondUserDetails} />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {section.rows.map(row => (
                <Table.Tr key={row.game_id}>
                  <Table.Td>
                    <GameCell row={row} />
                  </Table.Td>
                  <Table.Td>
                    <CompareStatusCell statusCode={row.first_user_status_code} score={row.first_user_score} />
                  </Table.Td>
                  <Table.Td>
                    <CompareStatusCell statusCode={row.second_user_status_code} score={row.second_user_score} />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}
    </CollapsibleSection>
  );
}
