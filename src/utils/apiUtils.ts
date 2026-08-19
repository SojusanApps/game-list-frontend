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
 * Utility to handle API errors consistently across the application.
 * Parses backend error responses (e.g. from Django REST Framework)
 * and returns a standard Error object with a user-friendly message.
 *
 * `errorData` must be the already-parsed error body from the generated API
 * client (its `error` field) — the underlying `response`'s body stream has
 * already been consumed by the client and cannot be read again here.
 */
export async function handleApiError(
  errorData: unknown,
  response: Response | undefined,
  defaultMessage: string,
): Promise<never> {
  if (!response) {
    throw new Error(defaultMessage || "Network error or no response received");
  }

  let errorMessage = defaultMessage;
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
      const messages = Object.entries(fieldErrors).map(([key, value]) => `${key}: ${value.join(", ")}`);
      if (messages.length > 0) {
        errorMessage = messages.join(" | ");
      }
    }
  } else if (response.statusText) {
    errorMessage = response.statusText;
  }

  throw new ApiError(errorMessage, response.status, response, fieldErrors);
}
