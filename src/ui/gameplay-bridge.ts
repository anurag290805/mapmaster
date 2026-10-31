import {
  accuracy,
  normalizeAnswer,
  remainingSeconds,
  resolveAnswer,
} from "../shared/gameplay";

Object.assign(window, {
  MapMasterGameplay: {
    accuracy,
    normalizeAnswer,
    remainingSeconds,
    resolveAnswer,
  },
});
document.dispatchEvent(new Event("mapmaster:gameplay-ready"));
