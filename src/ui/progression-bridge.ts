import {
  applyTerminalResult,
  createInitialProgress,
  levelProgress,
  migrateProgress,
  recordKey,
} from "../shared/progression";

Object.assign(window, {
  MapMasterProgressionCore: {
    applyTerminalResult,
    createInitialProgress,
    levelProgress,
    migrateProgress,
    recordKey,
  },
});
document.dispatchEvent(new Event("mapmaster:progression-ready"));
