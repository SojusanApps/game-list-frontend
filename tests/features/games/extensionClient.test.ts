import { describe, expect, it, vi } from "vitest";

import { isExtensionInstalled, requestPlatformSync } from "@/features/games/extension/extensionClient";
import { appendTitles } from "@/features/games/utils/titleImport";

const ORIGIN = "http://localhost:5173";

/** A fake window whose postMessage is answered by `reply`. */
function fakeWindow(reply: (message: Record<string, unknown>) => Record<string, unknown> | null) {
  let listener: ((event: MessageEvent) => void) | undefined;
  const win = {
    location: { origin: ORIGIN },
    addEventListener: (_: string, fn: (event: MessageEvent) => void) => {
      listener = fn;
    },
    removeEventListener: vi.fn<() => void>(),
    postMessage: vi.fn<(message: Record<string, unknown>) => void>(message => {
      const answer = reply(message);
      if (answer) {
        queueMicrotask(() => listener?.({ data: answer, source: win, origin: ORIGIN } as unknown as MessageEvent));
      }
    }),
  };
  return win;
}

describe("isExtensionInstalled", () => {
  it("is true when the extension answers PING with READY", async () => {
    const win = fakeWindow(m => (m.type === "PING" ? { source: "gamelist-extension", type: "READY" } : null));
    expect(await isExtensionInstalled(win as never)).toBe(true);
  });

  it("is false when nothing answers before the timeout", async () => {
    vi.useFakeTimers();
    const pending = isExtensionInstalled(fakeWindow(() => null) as never);
    await vi.advanceTimersByTimeAsync(1500);
    expect(await pending).toBe(false);
    vi.useRealTimers();
  });
});

describe("requestPlatformSync", () => {
  it("resolves with the result carrying the same requestId", async () => {
    const result = { platform: "steam", status: "ok", titles: ["Hades"], count: 1 };
    const win = fakeWindow(m =>
      m.type === "SYNC" ? { source: "gamelist-extension", type: "SYNC_RESULT", requestId: m.requestId, result } : null,
    );
    expect(await requestPlatformSync("steam", win as never)).toEqual(result);
  });

  it("ignores results for other requests and reports a timeout error", async () => {
    vi.useFakeTimers();
    const win = fakeWindow(() => ({
      source: "gamelist-extension",
      type: "SYNC_RESULT",
      requestId: "someone-else",
      result: { platform: "steam", status: "ok", titles: ["X"], count: 1 },
    }));
    const pending = requestPlatformSync("steam", win as never, 5000);
    await vi.advanceTimersByTimeAsync(6000);
    expect(await pending).toMatchObject({ status: "error", error: "timeout" });
    vi.useRealTimers();
  });
});

describe("appendTitles", () => {
  it("appends one per line and skips titles already present, ignoring case", () => {
    expect(appendTitles("Hades\nCeleste", ["celeste", "Hollow Knight"])).toBe("Hades\nCeleste\nHollow Knight");
  });

  it("works on an empty textarea", () => {
    expect(appendTitles("", ["A", "B", "A"])).toBe("A\nB");
  });
});
