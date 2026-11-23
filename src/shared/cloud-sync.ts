import {
  createCloudSave,
  mergeCloudSaves,
  sameCloudSaveContent,
  type CloudSaveV1,
} from "./cloud-save";

export type CloudSyncState =
  "local-only" | "syncing" | "saved" | "offline" | "error";

export interface CloudSaveGateway {
  subscribe(
    uid: string,
    listener: (save: CloudSaveV1 | null) => void,
    onError?: (error: unknown) => void,
  ): () => void;
  write(uid: string, save: CloudSaveV1): Promise<void>;
}

export interface CloudSyncCoordinator {
  activate(uid: string | null): void;
  schedule(): void;
  saveNow(): Promise<void>;
  dispose(): void;
}

export function createCloudSyncCoordinator(
  getLocal: () => CloudSaveV1,
  replaceLocal: (save: CloudSaveV1) => void,
  gateway: CloudSaveGateway,
  onState: (state: CloudSyncState, detail?: string) => void,
  delayMs = 750,
): CloudSyncCoordinator {
  let uid: string | null = null;
  let unsubscribe: (() => void) | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending = false;
  let dirty = false;

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  const saveNow = async () => {
    clearTimer();
    if (!uid) {
      onState("local-only");
      return;
    }
    const activeUid = uid;
    pending = true;
    dirty = false;
    onState(navigator.onLine === false ? "offline" : "syncing");
    let acknowledged = false;
    try {
      await gateway.write(activeUid, createCloudSave(getLocal()));
      acknowledged = true;
      if (uid === activeUid) onState("saved");
    } catch (error) {
      if (uid === activeUid)
        onState(
          navigator.onLine === false ? "offline" : "error",
          error instanceof Error ? error.message : "Cloud save failed.",
        );
      throw error;
    } finally {
      pending = false;
      if (acknowledged && dirty && uid === activeUid) schedule();
    }
  };
  const schedule = () => {
    if (!uid) return;
    dirty = true;
    if (pending) return;
    clearTimer();
    timer = setTimeout(() => {
      void saveNow().catch(() => {});
    }, delayMs);
  };
  const activate = (nextUid: string | null) => {
    clearTimer();
    unsubscribe?.();
    unsubscribe = null;
    uid = nextUid;
    if (!uid) {
      onState("local-only");
      return;
    }
    onState(navigator.onLine === false ? "offline" : "syncing");
    const subscribedUid = uid;
    unsubscribe = gateway.subscribe(
      subscribedUid,
      (remote) => {
        if (uid !== subscribedUid) return;
        if (!remote) {
          schedule();
          return;
        }
        const local = getLocal();
        const merged = mergeCloudSaves(local, remote);
        const remoteNeedsWrite = !sameCloudSaveContent(remote, merged);
        if (!sameCloudSaveContent(local, merged)) replaceLocal(merged);
        if (remoteNeedsWrite) schedule();
        else onState("saved");
      },
      (error) => {
        if (uid === subscribedUid)
          onState(
            navigator.onLine === false ? "offline" : "error",
            error instanceof Error ? error.message : "Cloud sync failed.",
          );
      },
    );
  };
  return { activate, schedule, saveNow, dispose: () => activate(null) };
}
