import { Box, Loader, Modal, UnstyledButton } from "@mantine/core";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

interface ScreenshotModalProps {
  initialScreenshot: string;
  screenshots: string[];
  onClose: () => void;
}

export default function ScreenshotModal({ initialScreenshot, screenshots, onClose }: Readonly<ScreenshotModalProps>) {
  const { t } = useTranslation("games");
  const [currentIndex, setCurrentIndex] = React.useState(() => {
    const idx = screenshots.indexOf(initialScreenshot);
    return idx === -1 ? 0 : idx;
  });
  const [isLoaded, setIsLoaded] = React.useState(false);

  const handleNext = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsLoaded(false);
      setCurrentIndex(prev => (prev + 1) % screenshots.length);
    },
    [screenshots.length],
  );

  const handlePrevious = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsLoaded(false);
      setCurrentIndex(prev => (prev - 1 + screenshots.length) % screenshots.length);
    },
    [screenshots.length],
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious]);

  const currentScreenshot = screenshots[currentIndex];

  return (
    <Modal
      opened={true}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      size="auto"
      centered
      radius="md"
      overlayProps={{ backgroundOpacity: 0.9 }}
      styles={{
        content: { background: "transparent", boxShadow: "none", overflow: "visible" },
        body: { background: "transparent", overflow: "visible" },
      }}
    >
      {/* Close button — fixed to viewport top-right, perfect circle */}
      <UnstyledButton
        onClick={onClose}
        aria-label={t("screenshot.closeAria")}
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: "rgba(0,0,0,0.6)",
          border: "1.5px solid rgba(255,255,255,0.25)",
          borderRadius: "50%",
          color: "white",
          zIndex: 9999,
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        <IconX size={20} stroke={2.5} />
      </UnstyledButton>

      <Box
        onClick={onClose}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {screenshots.length > 1 && (
          <UnstyledButton
            onClick={handlePrevious}
            aria-label={t("screenshot.previousAria")}
            style={{
              position: "fixed",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              color: "white",
              zIndex: 9999,
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.4)")}
          >
            <IconChevronLeft size={28} stroke={2} />
          </UnstyledButton>
        )}

        <Box
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Spinner shown while image loads — sized so no scrollbars appear */}
          {!isLoaded && (
            <Box
              style={{
                width: 640,
                height: 360,
                maxWidth: "90vw",
                maxHeight: "85vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Loader color="white" size="lg" />
            </Box>
          )}

          <img
            src={getIGDBImageURL(currentScreenshot, IGDBImageSize.SCREENSHOT_HUGE_1280_720)}
            alt={t("screenshot.enlargedAlt")}
            onLoad={() => setIsLoaded(true)}
            style={{
              display: isLoaded ? "block" : "none",
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
            }}
          />
        </Box>

        {screenshots.length > 1 && (
          <UnstyledButton
            onClick={handleNext}
            aria-label={t("screenshot.nextAria")}
            style={{
              position: "fixed",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              color: "white",
              zIndex: 9999,
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.4)")}
          >
            <IconChevronRight size={28} stroke={2} />
          </UnstyledButton>
        )}
      </Box>
    </Modal>
  );
}
