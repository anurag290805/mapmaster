import {
  accuracy,
  buildChoiceOptions,
  buildLearningRecord,
  normalizeAnswer,
  remainingSeconds,
  resolveAnswer,
} from "../shared/gameplay";

Object.assign(window, {
  MapMasterGameplay: {
    accuracy,
    buildChoiceOptions,
    buildLearningRecord,
    normalizeAnswer,
    remainingSeconds,
    resolveAnswer,
  },
});
document.dispatchEvent(new Event("mapmaster:gameplay-ready"));
