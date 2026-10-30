import { Text, Tooltip, type TextProps } from "@mantine/core";
import { useState, type MouseEvent, type ReactNode } from "react";

interface TruncatedTextProps extends TextProps {
  children: ReactNode;
  /** Tooltip content. Defaults to `children` when it is a string or number. */
  label?: ReactNode;
}

/** Tracks whether an element is clipped; check happens on hover so layout is current. */
export function useClippedTooltip() {
  const [isClipped, setIsClipped] = useState(false);

  const onMouseEnter = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    setIsClipped(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
  };

  return { isClipped, onMouseEnter };
}

/**
 * Text that is cut off with an ellipsis (via `truncate`, `lineClamp` or a CSS class)
 * and shows the full value in a tooltip — but only when it is actually clipped.
 */
export function TruncatedText({ children, label, ...textProps }: Readonly<TruncatedTextProps>) {
  const { isClipped, onMouseEnter } = useClippedTooltip();

  const content = label ?? (typeof children === "string" || typeof children === "number" ? children : null);

  return (
    <Tooltip label={content} disabled={!isClipped || !content} multiline withArrow style={{ maxWidth: 320 }}>
      <Text {...textProps} onMouseEnter={onMouseEnter}>
        {children}
      </Text>
    </Tooltip>
  );
}
