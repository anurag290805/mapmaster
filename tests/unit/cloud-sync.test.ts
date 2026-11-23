import { describe, expect, it, vi } from "vitest";
import { createCloudSave, type CloudSaveV1 } from "../../src/shared/cloud-save";
import {
  createCloudSyncCoordinator,
  type CloudSaveGateway,
} from "../../src/shared/cloud-sync";
import { createInitialProgress } from "../../src/shared/progression";

describe("cloud synchronization coordinator", () => {
  it("marks a save as saved only after the authenticated gateway acknowledges it", async () => {
    let resolveWrite!: () => void;
    const states: string[] = [];
    const gateway: CloudSaveGateway = {
      subscribe: () => () => {},
      write: () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        }),
    };
    const coordinator = createCloudSyncCoordinator(
      () => createCloudSave(),
      () => {},
      gateway,
      (state) => states.push(state),
      0,
    );
    coordinator.activate("player-a");
    const pending = coordinator.saveNow();
    expect(states).toContain("syncing");
    expect(states).not.toContain("saved");
    resolveWrite();
    await pending;
    expect(states.at(-1)).toBe("saved");
  });

  it("never reports saved when a cloud write is rejected", async () => {
    const states: string[] = [];
    const gateway: CloudSaveGateway = {
      subscribe: () => () => {},
      write: async () => {
        throw new Error("permission-denied");
      },
    };
    const coordinator = createCloudSyncCoordinator(
      () => createCloudSave(),
      () => {},
      gateway,
      (state) => states.push(state),
      0,
    );
    coordinator.activate("player-a");

    await expect(coordinator.saveNow()).rejects.toThrow("permission-denied");
    expect(states).toContain("error");
    expect(states).not.toContain("saved");
  });

  it("unsubscribes the previous account before subscribing to a new one", () => {
    const unsubs = [vi.fn(), vi.fn()];
    const gateway: CloudSaveGateway = {
      subscribe: vi.fn(
        () =>
          unsubs[
            (gateway.subscribe as ReturnType<typeof vi.fn>).mock.calls.length -
              1
          ] ?? (() => {}),
      ),
      write: async () => {},
    };
    const coordinator = createCloudSyncCoordinator(
      () => createCloudSave(),
      () => {},
      gateway,
      () => {},
      0,
    );
    coordinator.activate("player-a");
    coordinator.activate("player-b");
    expect(unsubs[0]).toHaveBeenCalledOnce();
    expect(
      (gateway.subscribe as ReturnType<typeof vi.fn>).mock.calls.map(
        (call) => call[0],
      ),
    ).toEqual(["player-a", "player-b"]);
  });

  it("merges a remote save into local state without calling a reward API", () => {
    let imported: CloudSaveV1 | undefined;
    let receive!: (save: CloudSaveV1 | null) => void;
    const local = createCloudSave({
      progress: { ...createInitialProgress(), totalXp: 25 },
    });
    const remote = createCloudSave({
      progress: { ...createInitialProgress(), totalXp: 40 },
    });
    const gateway: CloudSaveGateway = {
      subscribe: (_uid, listener) => {
        receive = listener;
        return () => {};
      },
      write: async () => {},
    };
    const coordinator = createCloudSyncCoordinator(
      () => local,
      (save) => {
        imported = save;
      },
      gateway,
      () => {},
      0,
    );
    coordinator.activate("player-a");
    receive(remote);
    expect(imported?.progress.totalXp).toBe(40);
  });

  it("marks an unchanged restored remote save as saved without another write", () => {
    let receive!: (save: CloudSaveV1 | null) => void;
    const states: string[] = [];
    const local = createCloudSave({
      progress: { ...createInitialProgress(), totalXp: 40 },
    });
    const gateway: CloudSaveGateway = {
      subscribe: (_uid, listener) => {
        receive = listener;
        return () => {};
      },
      write: vi.fn(async () => {}),
    };
    const coordinator = createCloudSyncCoordinator(
      () => local,
      () => {},
      gateway,
      (state) => states.push(state),
      0,
    );

    coordinator.activate("player-a");
    receive(createCloudSave({ ...local, updatedAt: local.updatedAt + 1 }));

    expect(states.at(-1)).toBe("saved");
    expect(gateway.write).not.toHaveBeenCalled();
  });

  it("does not write again when its own semantic snapshot is echoed back", async () => {
    vi.useFakeTimers();
    try {
      let receive!: (save: CloudSaveV1 | null) => void;
      const local = createCloudSave({
        progress: { ...createInitialProgress(), totalXp: 25 },
      });
      const gateway: CloudSaveGateway = {
        subscribe: (_uid, listener) => {
          receive = listener;
          return () => {};
        },
        write: vi.fn(async () => {}),
      };
      const coordinator = createCloudSyncCoordinator(
        () => local,
        () => {},
        gateway,
        () => {},
        5,
      );
      coordinator.activate("player-a");
      coordinator.schedule();
      await vi.advanceTimersByTimeAsync(5);
      expect(gateway.write).toHaveBeenCalledOnce();

      receive(createCloudSave({ ...local, updatedAt: local.updatedAt + 1 }));
      await vi.advanceTimersByTimeAsync(5);
      expect(gateway.write).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it("writes one genuine local edit, then settles after its echo", async () => {
    vi.useFakeTimers();
    try {
      let receive!: (save: CloudSaveV1 | null) => void;
      let local = createCloudSave();
      const gateway: CloudSaveGateway = {
        subscribe: (_uid, listener) => {
          receive = listener;
          return () => {};
        },
        write: vi.fn(async () => {}),
      };
      const coordinator = createCloudSyncCoordinator(
        () => local,
        () => {},
        gateway,
        () => {},
        5,
      );
      coordinator.activate("player-a");
      coordinator.schedule();
      await vi.advanceTimersByTimeAsync(5);

      local = createCloudSave({
        progress: { ...createInitialProgress(), totalXp: 85 },
      });
      coordinator.schedule();
      await vi.advanceTimersByTimeAsync(5);
      expect(gateway.write).toHaveBeenCalledTimes(2);

      receive(createCloudSave({ ...local, updatedAt: local.updatedAt + 1 }));
      await vi.advanceTimersByTimeAsync(5);
      expect(gateway.write).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("queues an edit that arrives while its prior save is pending", async () => {
    vi.useFakeTimers();
    try {
      let resolveWrite!: () => void;
      let local = createCloudSave();
      const gateway: CloudSaveGateway = {
        subscribe: () => () => {},
        write: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              resolveWrite = resolve;
            }),
        ),
      };
      const coordinator = createCloudSyncCoordinator(
        () => local,
        () => {},
        gateway,
        () => {},
        5,
      );
      coordinator.activate("player-a");
      coordinator.schedule();
      await vi.advanceTimersByTimeAsync(5);
      expect(gateway.write).toHaveBeenCalledOnce();

      local = createCloudSave({
        progress: { ...createInitialProgress(), totalXp: 85 },
      });
      coordinator.schedule();
      resolveWrite();
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(5);
      expect(gateway.write).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
