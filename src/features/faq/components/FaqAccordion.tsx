import { Accordion, Anchor, Stack, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { FAQ_ITEM_LINKS, FAQ_ITEM_ORDER } from "../content/faqItems";

export function FaqAccordion(): React.JSX.Element {
  const { t } = useTranslation("faq");

  return (
    <Accordion
      multiple
      chevronPosition="right"
      styles={{
        root: { display: "flex", flexDirection: "column", gap: 12 },
        item: {
          background: "var(--color-background-100)",
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid var(--color-background-200)",
          overflow: "hidden",
        },
        control: { padding: "16px 24px" },
        chevron: { color: "var(--color-text-400)" },
        label: { padding: 0 },
        panel: { padding: "0 24px 20px" },
      }}
    >
      {FAQ_ITEM_ORDER.map((id) => {
        const links = FAQ_ITEM_LINKS[id];

        return (
          <Accordion.Item key={id} value={id}>
            <Accordion.Control>
              <Text fw={700} c="var(--color-text-900)">
                {t(`items.${id}.question`)}
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap={8}>
                <Text c="var(--color-text-700)">{t(`items.${id}.answer`)}</Text>
                {links && (
                  <Stack gap={4}>
                    {links.map((link) =>
                      link.to ? (
                        <Anchor key={link.labelKey} component={Link} to={link.to} fw={600}>
                          {t(link.labelKey)}
                        </Anchor>
                      ) : (
                        <Anchor key={link.labelKey} href={link.href} target="_blank" rel="noopener noreferrer" fw={600}>
                          {t(link.labelKey)}
                        </Anchor>
                      ),
                    )}
                  </Stack>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}
