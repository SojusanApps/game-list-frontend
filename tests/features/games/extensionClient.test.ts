import { describe, expect, it, vi } from "vitest";

import { PlatformEnum } from "@/client";
import { detectExtension, requestPlatformSync } from "@/features/games/extension/extensionClient";
import {
  addStoreRefs,
  mergeStoreEntries,
  storeRefsForTitles,
  storeRefsFromEntries,
} from "@/features/games/utils/titleImport";

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

describe("detectExtension", () => {
  it("is ready when the extension answers PING with READY at the current contract version", async () => {
    const win = fakeWindow(m =>
      m.type === "PING" ? { source: "gamelist-extension", version: 2, type: "READY" } : null,
    );
    expect(await detectExtension(win as never)).toBe("ready");
  });

  it("is outdated when the extension speaks an older contract version", async () => {
    const win = fakeWindow(m =>
      m.type === "PING" ? { source: "gamelist-extension", version: 1, type: "READY" } : null,
    );
    expect(await detectExtension(win as never)).toBe("outdated");
  });

  it("is outdated when READY carries no version", async () => {
    const win = fakeWindow(m => (m.type === "PING" ? { source: "gamelist-extension", type: "READY" } : null));
    expect(await detectExtension(win as never)).toBe("outdated");
  });

  it("is missing when nothing answers before the timeout", async () => {
    vi.useFakeTimers();
    const pending = detectExtension(fakeWindow(() => null) as never);
    await vi.advanceTimersByTimeAsync(1500);
    expect(await pending).toBe("missing");
    vi.useRealTimers();
  });
});

describe("requestPlatformSync", () => {
  it("resolves with the result carrying the same requestId", async () => {
    const result = {
      platform: "steam",
      status: "ok",
      entries: [{ storeId: "1145360", title: "Hades", wishlisted: false }],
      count: 1,
    };
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
      result: { platform: "steam", status: "ok", entries: [], count: 0 },
    }));
    const pending = requestPlatformSync("steam", win as never, 5000);
    await vi.advanceTimersByTimeAsync(6000);
    expect(await pending).toMatchObject({ status: "error", error: "timeout" });
    vi.useRealTimers();
  });
});

const entry = (platform: PlatformEnum, store_id: string, title = "Hades") => ({
  platform,
  store_id,
  title,
  wishlisted: false,
});

describe("mergeStoreEntries", () => {
  it("appends new entries after the current ones", () => {
    const merged = mergeStoreEntries([entry(PlatformEnum.STEAM, "1")], [entry(PlatformEnum.STEAM, "2", "Celeste")]);
    expect(merged.map(e => e.store_id)).toEqual(["1", "2"]);
  });

  it("skips entries with an already present platform and store id, including duplicates in the incoming list", () => {
    const merged = mergeStoreEntries(
      [entry(PlatformEnum.STEAM, "1")],
      [entry(PlatformEnum.STEAM, "1"), entry(PlatformEnum.GOG, "1"), entry(PlatformEnum.GOG, "1")],
    );
    expect(merged.map(e => `${e.platform}:${e.store_id}`)).toEqual(["steam:1", "gog:1"]);
  });
});

describe("storeRefsFromEntries", () => {
  it("collects a ref per entry under its lowercased title", () => {
    const refs = storeRefsFromEntries([
      { platform: PlatformEnum.STEAM, store_id: "1", title: "Hades", wishlisted: false },
      { platform: PlatformEnum.GOG, store_id: "9", title: "hades", wishlisted: true },
    ]);
    expect(refs.hades.map(ref => ref.store_id)).toEqual(["1", "9"]);
  });
});

describe("store refs", () => {
  it("adds one ref per store id, keyed by lowercased title, and never twice", () => {
    const entries = [
      { store_id: "1", title: "Hades" },
      { store_id: "1", title: "Hades" },
      { store_id: "2", title: " HADES " },
    ];
    const refs = addStoreRefs({}, PlatformEnum.STEAM, entries);
    expect(refs).toEqual({
      hades: [
        { platform: "steam", store_id: "1", store_title: "Hades" },
        { platform: "steam", store_id: "2", store_title: "HADES" },
      ],
    });
  });

  it("collects the refs of several titles picked for one game", () => {
    let refs = addStoreRefs({}, PlatformEnum.STEAM, [{ store_id: "1", title: "Hades" }]);
    refs = addStoreRefs(refs, PlatformEnum.GOG, [{ store_id: "9", title: "Hades (GOG)" }]);
    expect(storeRefsForTitles(refs, ["hades", "Hades (GOG)", "Unknown"]).map(ref => ref.store_id)).toEqual(["1", "9"]);
  });
});
