import {
  buildDailyChallenge,
  buildShareText,
  classifyCalendarDay,
  createInitialDailyState,
  dayKey,
  getDailyStats,
  migrateDailyState,
  recordDailyCompletion,
  type DailyChallenge,
  type DailyDifficulty,
  type DailyState,
} from "../shared/daily";

declare global {
  interface Window {
    MapMasterDailyContent?: { capitalPool: string[] };
    MapMasterDailyRuntime?: {
      start(challenge: DailyChallenge & { pool: string[] }): boolean;
      clear(): void;
    };
    MapMasterDaily?: {
      recordTerminal(input: TerminalInput): DailyTerminal | null;
      renderTerminal(terminal: DailyTerminal | null, won: boolean): void;
      clearResult(): void;
      getState(): DailyState;
      replaceState(next: unknown): void;
    };
  }
}

interface TerminalInput {
  isWin: boolean;
  score: number;
  totalAttempts: number;
  bestStreak: number;
  elapsedSeconds: number;
  challenge: DailyChallenge;
}
interface DailyTerminal {
  progressionAllowed: boolean;
  claimLabel: string;
  summary: string;
  shareText: string;
}

const STORAGE_KEY = "mapmaster-daily-v1";
const calendar = document.querySelector<HTMLElement>("#dailyCalendar");
const availability = document.querySelector<HTMLElement>("#dailyAvailability");
const identityNode = document.querySelector<HTMLElement>("#dailyIdentity");
const calendarOrientation = document.querySelector<HTMLElement>(
  "#dailyCalendarOrientation",
);
const winSummary = document.querySelector<HTMLElement>("#dailyResultSummary");
const loseSummary = document.querySelector<HTMLElement>("#dailyLoseSummary");
const shareButton = document.querySelector<HTMLButtonElement>(
  "#shareDailyResultBtn",
);
let state = loadState();
let latestShareText = "";
let selectedDifficulty: DailyDifficulty = "medium";

function loadState(): DailyState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return migrateDailyState(raw ? JSON.parse(raw) : null);
  } catch {
    return createInitialDailyState();
  }
}
function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.dispatchEvent(new CustomEvent("mapmaster:local-save-changed"));
    return true;
  } catch {
    return false;
  }
}
function dateFromDay(day: string) {
  return new Date(`${day}T12:00:00`);
}
function dateLabel(day: string) {
  return dateFromDay(day).toLocaleDateString("en", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
function getPool() {
  return window.MapMasterDailyContent?.capitalPool ?? [];
}
function currentDay() {
  return dayKey();
}
function updateStats(today: string) {
  const stats = getDailyStats(state, today);
  document.querySelector("#dailyCurrentStreak")!.textContent = String(
    stats.currentStreak,
  );
  document.querySelector("#dailyLongestStreak")!.textContent = String(
    stats.longestStreak,
  );
  document.querySelector("#dailyCompletedDays")!.textContent = String(
    stats.completedDays,
  );
}
function renderCalendar(today: string) {
  if (!calendar) return;
  const completed = new Set(
    state.completions.map((completion) => completion.day),
  );
  calendar.replaceChildren();
  calendar.setAttribute("aria-rowcount", "4");
  calendar.setAttribute("aria-colcount", "7");
  const start = dateFromDay(today);
  start.setDate(start.getDate() - 21);
  for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
    const row = document.createElement("div");
    row.className = "daily-calendar-row";
    row.setAttribute("role", "row");
    row.setAttribute("aria-rowindex", String(rowIndex + 1));
    for (let columnIndex = 0; columnIndex < 7; columnIndex += 1) {
      const index = rowIndex * 7 + columnIndex;
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const day = dayKey(date);
      const calendarState = classifyCalendarDay(
        day,
        today,
        state.firstSeenDay,
        completed,
      );
      const cell = document.createElement("div");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-colindex", String(columnIndex + 1));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "daily-day";
      button.dataset.day = day;
      button.dataset.state = calendarState;
      button.textContent = String(date.getDate());
      button.setAttribute(
        "aria-label",
        `${dateLabel(day)}${day === today ? ", today, selected calendar day" : ""}: ${calendarState === "future" ? "locked future challenge" : calendarState}`,
      );
      if (day === today) button.setAttribute("aria-current", "date");
      if (calendarState === "future") button.disabled = true;
      button.addEventListener("click", () => {
        if (day === today)
          document
            .querySelector<HTMLButtonElement>(
              `[data-daily-difficulty='${selectedDifficulty}']`,
            )
            ?.focus();
      });
      cell.append(button);
      row.append(cell);
    }
    calendar.append(row);
  }
}
function render() {
  const today = currentDay();
  updateStats(today);
  renderCalendar(today);
  const preview = buildDailyChallenge(today, selectedDifficulty, getPool());
  if (identityNode)
    identityNode.textContent = preview
      ? `Today’s identity: ${preview.identity}`
      : "Daily content is unavailable on this device.";
  if (calendarOrientation)
    calendarOrientation.textContent = `Today, ${dateLabel(today)}, is the selected calendar day. Choose ${selectedDifficulty} to play its route.`;
  document
    .querySelectorAll<HTMLButtonElement>("[data-daily-difficulty]")
    .forEach((button) => {
      const selected = button.dataset.dailyDifficulty === selectedDifficulty;
      button.dataset.selected = String(selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  if (availability)
    availability.textContent = preview
      ? "Choose a difficulty to start. Future calendar dates remain locked."
      : "Daily challenge content is unavailable. Try reloading while offline content is available.";
}
function start(difficulty: DailyDifficulty) {
  selectedDifficulty = difficulty;
  render();
  const challenge = buildDailyChallenge(currentDay(), difficulty, getPool());
  if (!challenge || !window.MapMasterDailyRuntime?.start) {
    if (availability)
      availability.textContent =
        "This daily pool cannot provide distinct questions and choices.";
    return;
  }
  clearResult();
  window.MapMasterDailyRuntime.start({ ...challenge, pool: getPool() });
}
function clearResult() {
  latestShareText = "";
  winSummary?.classList.add("hidden");
  loseSummary?.classList.add("hidden");
  shareButton?.classList.add("hidden");
}
function previousComparison(
  challenge: DailyChallenge,
  score: number,
  elapsedSeconds: number,
) {
  const prior = [...state.completions]
    .reverse()
    .find(
      (entry) =>
        entry.identity !== challenge.identity &&
        entry.difficulty === challenge.difficulty,
    );
  if (!prior) return "This is your first recorded result at this difficulty.";
  const scoreDelta = score - prior.score;
  const timeDelta = elapsedSeconds - prior.elapsedSeconds;
  return `Compared with your last ${challenge.difficulty} result: ${scoreDelta >= 0 ? "+" : ""}${scoreDelta} correct, ${timeDelta <= 0 ? "" : "+"}${timeDelta}s.`;
}
function recordTerminal(input: TerminalInput): DailyTerminal | null {
  if (!input.challenge) return null;
  const today = currentDay();
  if (!input.isWin) {
    return {
      progressionAllowed: false,
      claimLabel: "Finish a replay to unlock this daily reward.",
      summary: `Daily ${input.challenge.difficulty} ended at ${input.score}/${input.challenge.questions.length}. Your daily reward remains available.`,
      shareText: "",
    };
  }
  const accuracy = input.totalAttempts
    ? Math.round((input.score / input.totalAttempts) * 100)
    : 100;
  const comparison = previousComparison(
    input.challenge,
    input.score,
    input.elapsedSeconds,
  );
  const outcome = recordDailyCompletion(state, {
    identity: input.challenge.identity,
    day: input.challenge.day,
    difficulty: input.challenge.difficulty,
    now: Date.now(),
    score: input.score,
    accuracy,
    elapsedSeconds: input.elapsedSeconds,
  });
  state = outcome.state;
  const persisted = saveState();
  const stats = getDailyStats(state, today);
  const claimLabel = outcome.claim.eligible
    ? persisted
      ? "Daily XP awarded once for this date and difficulty."
      : "Daily XP awarded for this visit; browser storage is unavailable."
    : outcome.claim.duplicate
      ? "Daily XP was already claimed for this date and difficulty; replay recorded."
      : "Daily XP is paused because your device date moved backwards recently.";
  const shareText = buildShareText({
    day: input.challenge.day,
    difficulty: input.challenge.difficulty,
    score: input.score,
    total: input.challenge.questions.length,
    accuracy,
    elapsedSeconds: input.elapsedSeconds,
    currentStreak: stats.currentStreak,
  });
  render();
  return {
    progressionAllowed: outcome.claim.eligible,
    claimLabel,
    summary: `${input.score}/${input.challenge.questions.length} correct · ${accuracy}% · ${input.elapsedSeconds}s · ${comparison}`,
    shareText,
  };
}
function renderTerminal(terminal: DailyTerminal | null, won: boolean) {
  if (!terminal) return;
  const destination = won ? winSummary : loseSummary;
  if (destination) {
    destination.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = "Daily Challenge";
    const summary = document.createElement("p");
    summary.textContent = terminal.summary;
    const claim = document.createElement("p");
    claim.textContent = terminal.claimLabel;
    destination.append(heading, summary, claim);
    destination.classList.remove("hidden");
  }
  if (won && terminal.shareText) {
    latestShareText = terminal.shareText;
    shareButton?.classList.remove("hidden");
  }
}
async function shareResult() {
  if (!latestShareText) return;
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({
        title: "MapMaster Daily",
        text: latestShareText,
      });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(latestShareText);
      if (shareButton) shareButton.textContent = "Copied daily result";
    } else {
      const area = document.createElement("textarea");
      area.value = latestShareText;
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      if (shareButton) shareButton.textContent = "Copied daily result";
    }
  } catch {
    if (shareButton) shareButton.textContent = "Couldn’t share — try again";
  }
}

document
  .querySelectorAll<HTMLButtonElement>("[data-daily-difficulty]")
  .forEach((button) => {
    const choose = () => {
      selectedDifficulty = button.dataset.dailyDifficulty as DailyDifficulty;
      render();
    };
    button.addEventListener("focus", choose);
    button.addEventListener("click", () =>
      start(button.dataset.dailyDifficulty as DailyDifficulty),
    );
  });
calendar?.addEventListener("keydown", (event) => {
  const target = event.target as HTMLButtonElement;
  if (!target.matches(".daily-day")) return;
  const offset =
    event.key === "ArrowRight"
      ? 1
      : event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowDown"
          ? 7
          : event.key === "ArrowUp"
            ? -7
            : 0;
  if (!offset) return;
  event.preventDefault();
  const days = [...calendar.querySelectorAll<HTMLButtonElement>(".daily-day")];
  days[
    Math.max(0, Math.min(days.length - 1, days.indexOf(target) + offset))
  ]?.focus();
});
shareButton?.addEventListener("click", () => {
  void shareResult();
});
document.addEventListener("mapmaster:screen", (event) => {
  if ((event as CustomEvent<{ screen?: string }>).detail?.screen === "daily")
    render();
});

window.MapMasterDaily = {
  recordTerminal,
  renderTerminal,
  clearResult,
  getState: () => state,
  replaceState(next: unknown) {
    state = migrateDailyState(next);
    saveState();
    render();
  },
};
render();
