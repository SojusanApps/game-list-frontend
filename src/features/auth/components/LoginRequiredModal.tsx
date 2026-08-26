import { Group, Modal, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";

import { useAuth } from "../context/AuthProvider";
import { useLoginPromptStore } from "../store/loginPromptStore";

export function LoginRequiredModal(): React.JSX.Element {
  const { t } = useTranslation("auth");
  const { login } = useAuth();
  const isOpen = useLoginPromptStore(state => state.isOpen);
  const close = useLoginPromptStore(state => state.close);

  return (
    <Modal opened={isOpen} onClose={close} title={t("loginRequired.title")} size="sm" centered>
      <Text c="var(--color-text-700)" mb={24}>
        {t("loginRequired.message")}
      </Text>
      <Group justify="flex-end">
        <Button variant="outline" onClick={close}>
          {t("loginRequired.cancel")}
        </Button>
        <Button
          onClick={() => {
            close();
            login();
          }}
        >
          {t("loginRequired.login")}
        </Button>
      </Group>
    </Modal>
  );
}
