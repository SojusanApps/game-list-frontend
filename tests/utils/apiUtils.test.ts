import { describe, expect, it } from "vitest";

import i18n from "@/lib/i18n";
import { ApiError, apiErrorFallbackMessage, handleApiError } from "@/utils/apiUtils";

function fakeResponse(status: number, statusText = ""): Response {
  return new Response(null, { status, statusText });
}

async function captureApiError(errorData: unknown, response: Response | undefined): Promise<ApiError> {
  const result = await handleApiError(errorData, response).then(
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

    const error = await captureApiError(errorData, fakeResponse(400));

    expect(error.fieldErrors).toEqual({
      new_password: ["This password is too short.", "This password is entirely numeric."],
      current_password: ["Current password is incorrect."],
    });
  });

  it("parses non_field_errors like any other field", async () => {
    const errorData = {
      non_field_errors: ["The new password and its confirmation do not match."],
    };

    const error = await captureApiError(errorData, fakeResponse(400));

    expect(error.fieldErrors).toEqual({
      non_field_errors: ["The new password and its confirmation do not match."],
    });
  });

  it("does not populate fieldErrors for a {detail: ...} body", async () => {
    const error = await captureApiError({ detail: "Not found." }, fakeResponse(404));

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Not found.");
  });

  it("surfaces a plain-string error body as the message", async () => {
    const error = await captureApiError("Pola collection, game muszą tworzyć unikalny zestaw.", fakeResponse(400));

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe("Pola collection, game muszą tworzyć unikalny zestaw.");
  });

  it("joins field-error messages without the API field names", async () => {
    const error = await captureApiError(
      { score: ["Ensure this value is less than or equal to 10."], owned_on: ["Invalid pk."] },
      fakeResponse(400),
    );

    expect(error.message).toBe("Ensure this value is less than or equal to 10. Invalid pk.");
  });

  it("uses a localized message chosen by status, not the English status text, when the body is empty", async () => {
    const error = await captureApiError({}, fakeResponse(500, "Internal Server Error"));

    expect(error.fieldErrors).toBeUndefined();
    expect(error.message).toBe(i18n.t("apiError.server"));
  });

  it("reports a network failure when there is no response at all", async () => {
    await expect(handleApiError(new TypeError("Failed to fetch"))).rejects.toThrow(i18n.t("apiError.network"));
  });

  it("gives the fallback message in the interface language", async () => {
    await i18n.changeLanguage("pl");
    try {
      const error = await captureApiError({}, fakeResponse(404));
      expect(error.message).toBe("Nie znaleziono. Mogło zostać usunięte.");
    } finally {
      await i18n.changeLanguage("en");
    }
  });
});

describe("apiErrorFallbackMessage", () => {
  it.each([
    [undefined, "apiError.network"],
    [401, "apiError.unauthorized"],
    [403, "apiError.forbidden"],
    [404, "apiError.notFound"],
    [429, "apiError.tooManyRequests"],
    [500, "apiError.server"],
    [503, "apiError.server"],
    [400, "apiError.generic"],
    [409, "apiError.generic"],
  ] as const)("maps status %s to %s", (status, key) => {
    expect(apiErrorFallbackMessage(status)).toBe(i18n.t(key));
  });
});
