import { ActionIcon, Affix, Tooltip, Transition } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ScrollToTopButton = (): React.JSX.Element => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(totalHeight > 0 && scrolled >= totalHeight - 50);
    };

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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
