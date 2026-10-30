import { useRouterState } from "@tanstack/react-router";
import * as React from "react";

import styles from "./RouteProgress.module.css";

/** Thin bar at the top of the viewport while a navigation is loading, so route changes never feel frozen. */
export default function RouteProgress(): React.JSX.Element | null {
  const isLoading = useRouterState({ select: state => state.isLoading });
  const [visible, setVisible] = React.useState(false);

  // Only show for loads that outlast a quick transition, to avoid a flash on instant navigations.
  React.useEffect(() => {
    if (!isLoading) {
      return;
    }
    const timer = setTimeout(() => setVisible(true), 150);
    return () => {
      clearTimeout(timer);
      setVisible(false);
    };
  }, [isLoading]);

  if (!isLoading || !visible) {
    return null;
  }

  return <div className={styles.bar} aria-hidden="true" />;
}
