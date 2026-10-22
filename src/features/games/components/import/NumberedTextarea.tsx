import { Textarea, type TextareaProps } from "@mantine/core";
import * as React from "react";

import styles from "./NumberedTextarea.module.css";

const MIN_ROWS = 6;

interface LineNumberGutterProps {
  lineCount: number;
  scrollTop: number;
}

const LineNumberGutter = ({ lineCount, scrollTop }: LineNumberGutterProps) => (
  <div className={styles.gutter} aria-hidden>
    <div style={{ transform: `translateY(${-scrollTop}px)` }}>
      {Array.from({ length: lineCount }, (_, index) => (
        <div key={index} className={styles.number}>
          {index + 1}
        </div>
      ))}
    </div>
  </div>
);

/** A textarea with a line-number gutter. Lines never wrap, so one number always means one title. */
export const NumberedTextarea = (props: TextareaProps) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const value = typeof props.value === "string" ? props.value : "";
  const lineCount = Math.max(value.split("\n").length, MIN_ROWS);

  return (
    <Textarea
      {...props}
      autosize
      minRows={MIN_ROWS}
      wrap="off"
      classNames={{ input: styles.input }}
      onScroll={event => setScrollTop(event.currentTarget.scrollTop)}
      leftSection={<LineNumberGutter lineCount={lineCount} scrollTop={scrollTop} />}
      leftSectionWidth={0}
      leftSectionPointerEvents="none"
    />
  );
};
