/* ============================================================
   MapMaster | state.js
   Game state object and shared runtime variables.
   Depends on: data.js
   ============================================================ */

let currentMapKey = "india";
let previousScreen = "start";
let CURRENT_REGIONS = MAPS[currentMapKey].regions;
let svgLoaded = false;

const CONTINENT_KEYS = [
  "europe",
  "northAmerica",
  "southAmerica",
  "africa",
  "asia",
  "oceania",
];

/** Returns "Countries" for world/continent maps, "States" for country maps */
function regionLabel() {
  return currentMapKey === "world" || CONTINENT_KEYS.includes(currentMapKey)
    ? "Countries"
    : "States";
}

const normalize = (str) => str.toLowerCase().replace(/\s+/g, "");

/* ============================================================
   GAME STATE
   ============================================================ */
const gameState = {
  gameType: null, // "typing" | "locate" | "flag" | "capital" | "flagChoice" | "capitalChoice"
  gameMode: null, // "practice" | "challenge"
  selectedTime: null,
  selectedLives: null,
  timeLeft: 0,
  livesLeft: 0,
  score: 0,
  bonusPoints: 0, // UT easter egg bonus (India only)
  totalAttempts: 0,
  guessedStates: [],
  guessedUTs: [],
  missedRegions: [],
  unreviewableAttempts: 0,
  timerInterval: null,
  startTime: null,
  startedAt: null,
  currentTarget: null,
  // The immutable question is authoritative for choice sprints. The legacy
  // fields below remain compatibility mirrors for existing CP04 consumers.
  choiceQuestion: null,
  choiceQuestionVersion: 0,
  choiceAnswer: null,
  currentStreak: 0,
  bestStreak: 0,
  reviewMode: false,
  learningReviewIndex: 0,
  phase: "idle",
  sessionId: 0,
  deadline: null,
  progressionResultId: null,
  // CP10 only supplies an ordered question queue to the existing CP04/CP06
  // lifecycle; it never owns score, timer, attempts, or terminal state.
  dailyChallenge: null,
  dailyQuestions: [],
  dailyPool: [],
  dailyQuestionIndex: 0,
};
