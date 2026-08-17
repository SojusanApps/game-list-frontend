import { Box, Skeleton } from "@mantine/core";
import React, { useState, useEffect, useRef } from "react";

import { ImageFallback } from "./ImageFallback";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  loader?: React.ReactNode;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  containerStyle?: React.CSSProperties;
}

export function SafeImage({
  src,
  alt,
  className,
  fallback = <ImageFallback />,
  loader,
  objectFit = "cover",
  containerStyle,
  style,
  ...props
}: Readonly<SafeImageProps>) {
  const [isLoading, setIsLoading] = useState(!!src);
  const [isError, setIsError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setIsLoading(!!src);
    setIsError(false);
  }

  useEffect(() => {
    const img = imgRef.current;
    if (src && img?.complete) {
      // Check if image is already cached
      setIsLoading(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  const showFallback = isError || !src;

  return (
    <Box pos="relative" style={{ overflow: "hidden", ...style, ...containerStyle }} className={className}>
      {isLoading &&
        (loader || <Skeleton style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 10 }} />)}

      {showFallback ? (
        <Box w="100%" h="100%">
          {fallback}
        </Box>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            transition: "opacity 300ms",
            objectFit: objectFit,
            opacity: isLoading ? 0 : 1,
          }}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </Box>
  );
}
