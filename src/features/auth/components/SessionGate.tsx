import { Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { initKeycloak } from "@/lib/keycloak";
import { fireAndForget } from "@/utils/promiseUtils";

import { useAuthStore } from "../store/authStore";

/**
 * Renders the app immediately and checks the Keycloak session in the background, so the public catalogue
 * doesn't depend on the identity provider being reachable. A failed check is treated as "signed out" and
 * shown as a dismissible banner. Route guards await the check themselves (see `waitForSession`).
 */
export function SessionGate({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const { t } = useTranslation("auth");
  const queryClient = useQueryClient();
  const [failed, setFailed] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    initKeycloak()
      .then(() => {
        // Queries that ran before the session resolved were sent without a token; refetch what's on screen.
        if (!cancelled && useAuthStore.getState().isAuthenticated) {
          fireAndForget(queryClient.invalidateQueries({ refetchType: "active" }));
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  return (
    <>
      {failed && !dismissed && (
        <Alert
          color="error"
          variant="light"
          radius={0}
          icon={<IconAlertTriangle size={18} />}
          withCloseButton
          closeButtonLabel={t("sessionCheck.dismiss")}
          onClose={() => setDismissed(true)}
        >
          {t("sessionCheck.bannerMessage")}
        </Alert>
      )}
      {children}
    </>
  );
}
