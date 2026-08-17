import { notifications } from "@mantine/notifications";
import { useMutation, UseMutationOptions, DefaultError } from "@tanstack/react-query";

/**
 * Custom wrapper around useMutation that provides consistent error handling
 * by automatically showing a notification on failure.
 *
 * Pass `showErrorToast` to opt out of the toast for errors a caller renders
 * inline instead (e.g. per-field form errors) — defaults to always showing it.
 */
export function useAppMutation<TData = unknown, TError = DefaultError, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    showErrorToast?: (error: TError) => boolean;
  },
) {
  const { showErrorToast, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    onError: (...args) => {
      const [error] = args;
      if (showErrorToast?.(error) ?? true) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        notifications.show({ title: "Error", message, color: "red" });
      }

      if (options.onError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options.onError as any)(...args);
      }
    },
  });
}
