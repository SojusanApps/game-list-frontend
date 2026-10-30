import { ActionIcon, Affix, Tooltip, Transition } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { IconArrowUp } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/** Minimum distance from the top before the button appears. */
const MIN_SCROLL_PX = 300;

const ScrollToTopButton = (): React.JSX.Element => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      // Offered once the reader has left the top of the page. Half a screen (never under 300px) keeps it
      // available on ordinary pages, which are only a screen or two long.
      setVisible(window.scrollY > Math.max(MIN_SCROLL_PX, window.innerHeight * 0.5));
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Affix position={{ bottom: 80, right: 20 }}>
      <Transition transition="slide-up" mounted={visible}>
        {styles => (
          <Tooltip label={t("scrollToTop")} position="left">
            <ActionIcon
              style={styles}
              size="xl"
              radius="xl"
              onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
              aria-label={t("scrollToTop")}
            >
              <IconArrowUp size={20} />
            </ActionIcon>
          </Tooltip>
        )}
      </Transition>
    </Affix>
  );
};

export default ScrollToTopButton;
