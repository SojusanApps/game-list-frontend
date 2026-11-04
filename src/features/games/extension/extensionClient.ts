import {
  EXTENSION_CONTRACT_VERSION,
  MIN_EXTENSION_CONTRACT_VERSION,
  type SyncPlatform,
  type SyncProgress,
  type SyncResult,
} from "./contract";

const PING_TIMEOUT_MS = 1000;
/**
 * How long a sync may stay silent before it is given up on. Syncs can page through large libraries and open background
 * tabs, so allow plenty of time; every progress message from the extension starts the wait again.
 */
const SYNC_TIMEOUT_MS = 120_000;

type MessageTarget = Pick<Window, "postMessage" | "addEventListener" | "removeEventListener"> & {
  location: { origin: string };
};

interface ExtensionEnvelope {
  source: "gamelist-extension";
  version?: number;
  type: string;
  requestId?: string;
  result?: SyncResult;
  progress?: SyncProgress;
}

function isExtensionMessage(data: unknown): data is ExtensionEnvelope {
  return typeof data === "object" && data !== null && (data as { source?: unknown }).source === "gamelist-extension";
}

/**
 * Posts `message` and resolves with the first extension reply `match` accepts, or `null` after `timeoutMs` without
 * one. A reply `isActivity` accepts shows the extension is still working and restarts the wait.
 */
function request<T>(
  target: MessageTarget,
  message: Record<string, unknown>,
  match: (reply: ExtensionEnvelope) => T | null,
  timeoutMs: number,
  isActivity: (reply: ExtensionEnvelope) => boolean = () => false,
): Promise<T | null> {
  return new Promise(resolve => {
    const cleanups: Array<() => void> = [];
    const finish = (value: T | null) => {
      for (const cleanup of cleanups) {
        cleanup();
      }
      resolve(value);
    };
    let timer: ReturnType<typeof setTimeout>;
    const armTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => finish(null), timeoutMs);
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
      } else if (isActivity(event.data)) {
        armTimer();
      }
    };
    armTimer();
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

export type ExtensionStatus = "missing" | "outdated" | "ready";

/**
 * Whether the extension answers a PING within the timeout, and if so whether it speaks a usable contract version.
 * An older extension returns titles instead of entries, so it has to be updated before it can be used.
 */
export async function detectExtension(target: MessageTarget = globalThis.window): Promise<ExtensionStatus> {
  const version = await request(
    target,
    { type: "PING" },
    r => {
      if (r.type !== "READY") {
        return null;
      }
      return typeof r.version === "number" ? r.version : 0;
    },
    PING_TIMEOUT_MS,
  );
  if (version === null) {
    return "missing";
  }
  return version >= MIN_EXTENSION_CONTRACT_VERSION ? "ready" : "outdated";
}

/**
 * Runs one Platform Sync, passing its progress to `onProgress` while it runs. Resolves with an `error` result if the
 * extension goes quiet for `timeoutMs`.
 */
export async function requestPlatformSync(
  platform: SyncPlatform,
  target: MessageTarget = globalThis.window,
  timeoutMs: number = SYNC_TIMEOUT_MS,
  onProgress?: (progress: SyncProgress) => void,
): Promise<SyncResult> {
  const requestId = crypto.randomUUID();
  const result = await request(
    target,
    { type: "SYNC", requestId, platform },
    r => (r.type === "SYNC_RESULT" && r.requestId === requestId && r.result ? r.result : null),
    timeoutMs,
    r => {
      if (r.type !== "SYNC_PROGRESS" || r.requestId !== requestId || !r.progress) {
        return false;
      }
      onProgress?.(r.progress);
      return true;
    },
  );
  return result ?? { platform, status: "error", entries: [], count: 0, error: "timeout" };
}
