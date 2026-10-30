import { Box, Loader, Modal, UnstyledButton } from "@mantine/core";
import { IconX, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

interface ScreenshotModalProps {
  initialScreenshot: string;
  screenshots: string[];
  gameTitle?: string;
  onClose: () => void;
}

const FULL_SIZE = IGDBImageSize.SCREENSHOT_HUGE_1280_720;
/** How many screenshots on each side of the current one are fetched ahead of time. */
const PRELOAD_RADIUS = 2;
/** Horizontal distance a touch must travel to count as a swipe. */
const SWIPE_THRESHOLD_PX = 50;

/** URLs the browser has already fetched, kept across modal openings. */
const loadedUrls = new Set<string>();

function preload(url: string, onDone?: () => void) {
  if (loadedUrls.has(url)) return;
  const img = new Image();
  img.addEventListener(
    "load",
    () => {
      loadedUrls.add(url);
      onDone?.();
    },
    { once: true },
  );
  img.src = url;
}

export default function ScreenshotModal({
  initialScreenshot,
  screenshots,
  gameTitle = "",
  onClose,
}: Readonly<ScreenshotModalProps>) {
  const { t } = useTranslation("games");
  const [currentIndex, setCurrentIndex] = React.useState(() => {
    const idx = screenshots.indexOf(initialScreenshot);
    return idx === -1 ? 0 : idx;
  });
  // Bumped when a preloaded image finishes so the current one can show without waiting for its own onLoad.
  const [, setLoadTick] = React.useState(0);

  const handleNext = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex(prev => (prev + 1) % screenshots.length);
    },
    [screenshots.length],
  );

  const handlePrevious = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setCurrentIndex(prev => (prev - 1 + screenshots.length) % screenshots.length);
    },
    [screenshots.length],
  );

  // Swipe left/right on touch screens; the arrow buttons stay as the visible alternative.
  const touchStartX = React.useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    const end = e.changedTouches[0]?.clientX;
    if (start === null || end === undefined || screenshots.length < 2) return;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) handleNext();
    else handlePrevious();
  };

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
  const currentUrl = getIGDBImageURL(currentScreenshot, FULL_SIZE);
  const isLoaded = loadedUrls.has(currentUrl);

  // Current image first, then its neighbours (nearest first) so arrow navigation is instant.
  React.useEffect(() => {
    const count = screenshots.length;
    const tick = () => setLoadTick(n => n + 1);
    preload(getIGDBImageURL(screenshots[currentIndex], FULL_SIZE), tick);
    for (let offset = 1; offset <= PRELOAD_RADIUS; offset++) {
      for (const idx of [(currentIndex + offset) % count, (currentIndex - offset + count * offset) % count]) {
        preload(getIGDBImageURL(screenshots[idx], FULL_SIZE), tick);
      }
    }
  }, [currentIndex, screenshots]);

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

      {/* Announced politely whenever the shown screenshot changes. */}
      <Box
        aria-live="polite"
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "4px 12px",
          borderRadius: 9999,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          fontSize: 14,
          fontWeight: 600,
          zIndex: 9999,
        }}
      >
        {t("screenshot.position", { current: currentIndex + 1, total: screenshots.length })}
      </Box>

      <Box
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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
            src={currentUrl}
            alt={t("screenshot.alt", { title: gameTitle, index: currentIndex + 1 })}
            onLoad={() => {
              loadedUrls.add(currentUrl);
              setLoadTick(n => n + 1);
            }}
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
