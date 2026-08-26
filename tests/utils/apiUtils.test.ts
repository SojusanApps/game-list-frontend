import { describe, expect, it } from "vitest";

import { ApiError, handleApiError } from "@/utils/apiUtils";

function fakeResponse(status: number, statusText = ""): Response {
  return new Response(null, { status, statusText });
}

async function captureApiError(
  errorData: unknown,
  response: Response | undefined,
  defaultMessage: string,
): Promise<ApiError> {
  const result = await handleApiError(errorData, response, defaultMessage).then(
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
    const errorData = {
      new_password: ["This password is too short.", "This password is entirely numeric."],
      current_password: ["Current password is incorrect."],
    };

    const error = await captureApiError(errorData, fakeResponse(400), "default");

    expect(error.fieldErrors).toEqual({
      new_password: ["This password is too short.", "This password is entirely numeric."],
      current_password: ["Current password is incorrect."],
    });
  });

  it("parses non_field_errors like any other field", async () => {
    const errorData = {
      non_field_errors: ["The new password and its confirmation do not match."],
    };

    const error = await captureApiError(errorData, fakeResponse(400), "default");

    expect(error.fieldErrors).toEqual({
      non_field_errors: ["The new password and its confirmation do not match."],
    });
  });

  it("does not populate fieldErrors for a {detail: ...} body", async () => {
    const error = await captureApiError({ detail: "Not found." }, fakeResponse(404), "default");

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Not found.");
  });

  it("surfaces a plain-string error body as the message", async () => {
    const error = await captureApiError(
      "Pola collection, game muszą tworzyć unikalny zestaw.",
      fakeResponse(400),
      "default",
    );

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Pola collection, game muszą tworzyć unikalny zestaw.");
  });

  it("falls back to the response status text when the body could not be parsed", async () => {
    const error = await captureApiError({}, fakeResponse(500, "Internal Server Error"), "default message");

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Internal Server Error");
  });

  it("falls back to the default message when there is no response at all", async () => {
    await expect(handleApiError(undefined, undefined, "network error")).rejects.toThrow("network error");
  });
});
