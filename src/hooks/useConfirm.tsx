import * as React from "react";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

export interface ConfirmOptions {
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

/**
 * Drop-in async replacement for `window.confirm` backed by the app's themed ConfirmModal.
 * Render the returned `confirmModal` once in the component and `await confirm(...)`
 * wherever a native confirm() call would have been used.
 */
export function useConfirm() {
  const [options, setOptions] = React.useState<ConfirmOptions | null>(null);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((confirmOptions: ConfirmOptions) => {
    setOptions(confirmOptions);
    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = () => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setOptions(null);
  };

  const handleConfirm = () => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setOptions(null);
  };

  const confirmModal = (
    <ConfirmModal
      opened={options !== null}
      title={options?.title ?? ""}
      message={options?.message ?? ""}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      isDestructive={options?.isDestructive}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );

  return { confirm, confirmModal };
}
