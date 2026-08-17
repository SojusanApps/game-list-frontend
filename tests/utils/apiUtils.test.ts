import { describe, expect, it } from "vitest";

import { ApiError, handleApiError } from "@/utils/apiUtils";

function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

async function captureApiError(response: Response | undefined, defaultMessage: string): Promise<ApiError> {
  const result = await handleApiError(response, defaultMessage).then(
    () => {
      throw new Error("handleApiError did not throw");
    },
    (error: unknown) => error,
  );
  expect(result).toBeInstanceOf(ApiError);
  return result as ApiError;
}

describe("handleApiError", () => {
  it("parses a DRF field-error body into fieldErrors, preserving multiple messages per field", async () => {
    const response = jsonResponse(400, {
      new_password: ["This password is too short.", "This password is entirely numeric."],
      current_password: ["Current password is incorrect."],
    });

    const error = await captureApiError(response, "default");

    expect(error.fieldErrors).toEqual({
      new_password: ["This password is too short.", "This password is entirely numeric."],
      current_password: ["Current password is incorrect."],
    });
  });

  it("parses non_field_errors like any other field", async () => {
    const response = jsonResponse(400, {
      non_field_errors: ["The new password and its confirmation do not match."],
    });

    const error = await captureApiError(response, "default");

    expect(error.fieldErrors).toEqual({
      non_field_errors: ["The new password and its confirmation do not match."],
    });
  });

  it("does not populate fieldErrors for a {detail: ...} body", async () => {
    const response = jsonResponse(404, { detail: "Not found." });

    const error = await captureApiError(response, "default");

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Not found.");
  });

  it("falls back gracefully for a non-JSON body", async () => {
    const response = new Response("<html>Internal Server Error</html>", {
      status: 500,
      statusText: "Internal Server Error",
    });

    const error = await captureApiError(response, "default message");

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Internal Server Error");
  });

  it("falls back to the default message when there is no response at all", async () => {
    await expect(handleApiError(undefined, "network error")).rejects.toThrow("network error");
  });
});
