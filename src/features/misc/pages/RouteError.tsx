import { Center, Stack } from "@mantine/core";
import { ErrorComponentProps, Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageMeta } from "@/components/ui/PageMeta";
import { fireAndForget } from "@/utils/promiseUtils";

/** Fallback for any route whose loader or render throws (anything but a 404, which renders NotFound). */
export default function RouteError({ error, reset }: Readonly<ErrorComponentProps>): React.JSX.Element {
  const { t } = useTranslation();
  const router = useRouter();

  React.useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = () => {
    reset();
    fireAndForget(router.invalidate());
  };

  return (
    <Center style={{ minHeight: "70vh" }} px={16}>
      <PageMeta title={t("error.title")} noindex />
      <Stack w="100%" maw={560}>
        <ErrorState title={t("error.title")} message={t("error.message")} onRetry={retry}>
          <Link to="/">
            <Button component="span" variant="outline">
              {t("error.goHome")}
            </Button>
          </Link>
        </ErrorState>
      </Stack>
    </Center>
  );
}
