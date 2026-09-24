import i18n from "@/lib/i18n";

export class ApiError extends Error {
  status: number;
  response: Response;
  /**
   * DRF-style per-field validation errors ({ "field": ["msg", ...] }), when the
   * error body was shaped that way. Undefined for {detail: ...}, plain-string,
   * or non-JSON bodies — callers that want inline field errors must check for it.
   */
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status: number, response: Response, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Localized fallback for when the backend gave no usable message: a network failure (no response)
 * or an empty/unparseable body. Chosen by HTTP status, since the raw `statusText` is always English.
 */
export function apiErrorFallbackMessage(status?: number): string {
  if (status === undefined) return i18n.t("apiError.network");
  if (status === 401) return i18n.t("apiError.unauthorized");
  if (status === 403) return i18n.t("apiError.forbidden");
  if (status === 404) return i18n.t("apiError.notFound");
  if (status === 429) return i18n.t("apiError.tooManyRequests");
  if (status >= 500) return i18n.t("apiError.server");
  return i18n.t("apiError.generic");
}

/**
 * Utility to handle API errors consistently across the application.
 * Parses backend error responses (e.g. from Django REST Framework)
 * and returns a standard Error object with a user-friendly message.
 *
 * The backend localizes its own messages (the client sends `Accept-Language`); when it gives
 * none, the message falls back to {@link apiErrorFallbackMessage}.
 *
 * `errorData` must be the already-parsed error body from the generated API
 * client (its `error` field) — the underlying `response`'s body stream has
 * already been consumed by the client and cannot be read again here.
 */
export async function handleApiError(errorData: unknown, response?: Response): Promise<never> {
  if (!response) {
    // The generated client returns `{ error, response: undefined }` when `fetch` itself rejects.
    throw new Error(apiErrorFallbackMessage());
  }

  let errorMessage = apiErrorFallbackMessage(response.status);
  let fieldErrors: Record<string, string[]> | undefined;

  if (typeof errorData === "string" && errorData) {
    errorMessage = errorData;
  } else if (errorData && typeof errorData === "object" && Object.keys(errorData).length > 0) {
    const data = errorData as Record<string, unknown>;
    if (typeof data.detail === "string") {
      errorMessage = data.detail;
    } else {
      // Handle DRF validation errors: { "field": ["error"] }
      fieldErrors = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, Array.isArray(value) ? value.map(String) : [String(value)]]),
      );
      // Field names are API identifiers (`owned_on`), not UI labels, so only the (already
      // localized) messages go into the text; forms that show errors inline use `fieldErrors`.
      const messages = Object.values(fieldErrors).flat();
      if (messages.length > 0) {
        errorMessage = messages.join(" ");
      }
    }
  }

  throw new ApiError(errorMessage, response.status, response, fieldErrors);
}
