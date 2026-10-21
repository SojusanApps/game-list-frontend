import { EXTENSION_CONTRACT_VERSION, type SyncPlatform, type SyncResult } from "./contract";

const PING_TIMEOUT_MS = 1000;
/** Syncs can page through large libraries and open background tabs, so allow plenty of time. */
const SYNC_TIMEOUT_MS = 120_000;

type MessageTarget = Pick<Window, "postMessage" | "addEventListener" | "removeEventListener"> & {
  location: { origin: string };
};

interface ExtensionEnvelope {
  source: "gamelist-extension";
  type: string;
  requestId?: string;
  result?: SyncResult;
}

function isExtensionMessage(data: unknown): data is ExtensionEnvelope {
  return typeof data === "object" && data !== null && (data as { source?: unknown }).source === "gamelist-extension";
}

/** Posts `message` and resolves with the first extension reply `match` accepts, or `null` on timeout. */
function request<T>(
  target: MessageTarget,
  message: Record<string, unknown>,
  match: (reply: ExtensionEnvelope) => T | null,
  timeoutMs: number,
): Promise<T | null> {
  return new Promise(resolve => {
    const cleanups: Array<() => void> = [];
    const finish = (value: T | null) => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      resolve(value);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== (target as unknown) || event.origin !== target.location.origin) {
        return;
      }
      if (!isExtensionMessage(event.data)) {
        return;
      }
      const matched = match(event.data);
      if (matched !== null) {
        finish(matched);
      }
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    cleanups.push(
      () => clearTimeout(timer),
      () => target.removeEventListener("message", onMessage as EventListener),
    );
    target.addEventListener("message", onMessage as EventListener);
    target.postMessage(
      { source: "gamelist-frontend", version: EXTENSION_CONTRACT_VERSION, ...message },
      target.location.origin,
    );
  });
}

/** True when the extension answers a PING (or has already announced itself) within the timeout. */
export async function isExtensionInstalled(target: MessageTarget = globalThis.window): Promise<boolean> {
  const reply = await request(target, { type: "PING" }, r => (r.type === "READY" ? true : null), PING_TIMEOUT_MS);
  return reply === true;
}

/** Runs one Platform Sync. Resolves with an `error` result if the extension never answers. */
export async function requestPlatformSync(
  platform: SyncPlatform,
  target: MessageTarget = globalThis.window,
  timeoutMs: number = SYNC_TIMEOUT_MS,
): Promise<SyncResult> {
  const requestId = crypto.randomUUID();
  const result = await request(
    target,
    { type: "SYNC", requestId, platform },
    r => (r.type === "SYNC_RESULT" && r.requestId === requestId && r.result ? r.result : null),
    timeoutMs,
  );
  return result ?? { platform, status: "error", titles: [], count: 0, error: "timeout" };
}
