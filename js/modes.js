/* ============================================================
   MapMaster | modes.js
   All four game mode handlers:
   Typing, Locate, Flag, Capital
   Depends on: data.js, state.js, ui.js, audio.js, game.js
   ============================================================ */

/* ============================================================
   TYPING MODE
   ============================================================ */
let isSubmitting = false;

function shareLearningCue(prompt, answer) {
  if (typeof showLearningCue === "function") showLearningCue(prompt, answer);
}

function hideLearningCueSafe() {
  if (typeof hideLearningCue === "function") hideLearningCue();
}

function clearLearningCueSafe() {
  if (typeof clearLearningCue === "function") clearLearningCue();
  else hideLearningCueSafe();
}

function handleTypingSubmit() {
  if (typeof canPlay === "function" && !canPlay()) return;
  if (isSubmitting) return;
  isSubmitting = true;
  const session = gameState.sessionId;
  setTimeout(() => {
    if (gameState.sessionId === session) isSubmitting = false;
  }, 200);

  const raw = stateInput.value.trim();
  const input = normalize(raw);
  stateInput.value = "";

  if (!input) return;

  if (gameState.gameType === "flag") {
    handleFlagSubmit(raw, input);
    return;
  }
  if (gameState.gameType === "capital") {
    handleCapitalSubmit(raw, input);
    return;
  }

  gameState.totalAttempts++;

  const alreadyGuessed = gameState.guessedStates.find(
    (s) => normalize(s) === input,
  );
  if (alreadyGuessed) {
    showFeedback(`Already guessed: ${alreadyGuessed}`, "wrong");
    gameState.totalAttempts--;
    return;
  }

  // India UT Easter Egg — exact match only (prevent fuzzy false positives)
  if (currentMapKey === "india") {
    const utMatch = INDIA_UTS.find((ut) => normalize(ut) === input);
    if (utMatch) {
      if (gameState.guessedUTs.includes(utMatch)) {
        showFeedback(`Already found: ${utMatch}`, "wrong");
        gameState.totalAttempts--;
        return;
      }
      gameState.guessedUTs.push(utMatch);
      gameState.bonusPoints += 2;
      colorState(utMatch, "#8b5cf6", true);
      showFeedback(`🌟 Union Territory Bonus! +2 — ${utMatch}`, "ut-bonus");
      playSound(sfxCorrect);
      gameState.currentStreak++;
      if (gameState.currentStreak > gameState.bestStreak)
        gameState.bestStreak = gameState.currentStreak;
      onStreakUpdate();
      updateHUD();
      if (gameState.guessedUTs.length === INDIA_UTS.length) showUTAchievement();
      return;
    }
  }

  const resolution = MapMasterGameplay.resolveAnswer(raw, CURRENT_REGIONS);
  const match = resolution.kind === "match" ? resolution.id : null;
  if (match && gameState.guessedStates.includes(match)) {
    gameState.totalAttempts--;
    showFeedback(`Already guessed: ${match}`, "wrong");
    return;
  }
  if (match) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak)
      gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(match);
    colorState(match, "#2D9E6B", true);
    showFeedback(`✓ ${match}`, "correct");
    shareLearningCue("Accepted name", match);
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();
    checkWin();
  } else {
    gameState.currentStreak = 0;
    gameState.unreviewableAttempts++;
    showFeedback(
      regionLabel() === "Countries"
        ? "✗ Not a valid country name."
        : "✗ Not a valid state name.",
      "wrong",
    );
    hideLearningCueSafe();
    playSound(sfxWrong);
    updateHUD();
  }
}

/* ============================================================
   LOCATE MODE
   ============================================================ */
function showLocateTarget(name) {
  if (!locatePrompt) return;
  const nameEl = locatePrompt.querySelector(".locate-name");
  if (nameEl) {
    nameEl.textContent = name;
  } else {
    locatePrompt.textContent = "Find: " + name;
  }
  locatePrompt.classList.remove("hidden");
  locatePrompt.style.animation = "none";
  void locatePrompt.offsetWidth;
  locatePrompt.style.animation = "";
}

// Names are eligible only when the configured pool is unique and a path exposes
// the same canonical identity. Repeated map paths can be island fragments.
function mapEligibleTargets(regions, labels) {
  const counts = new Map();
  regions.forEach((name) => counts.set(name, (counts.get(name) || 0) + 1));
  const available = new Set(labels);
  const unique = [...counts.keys()];
  return {
    eligible: unique.filter(
      (name) => counts.get(name) === 1 && available.has(name),
    ),
    missing: unique.filter((name) => !available.has(name)),
    duplicates: unique.filter((name) => counts.get(name) > 1),
  };
}

function getLocateRegions() {
  return locateEligible.filter((name) => CURRENT_REGIONS.includes(name));
}

let locateEligible = [];
let locateBinding = null;
const locateKeyboardAnswer = document.getElementById("locateKeyboardAnswer");
const locateAnswerSelect = document.getElementById("locateAnswerSelect");

function renderLocateKeyboardAnswer({ focus = false } = {}) {
  if (!locateKeyboardAnswer || !locateAnswerSelect) return;
  const isLocateSession =
    gameState.gameType === "locate" && gameState.phase === "active";
  locateKeyboardAnswer.classList.toggle("hidden", !isLocateSession);
  if (!isLocateSession) return;

  const selected = locateAnswerSelect.value;
  const remaining = getLocateRegions()
    .filter((name) => !gameState.guessedStates.includes(name))
    .sort((left, right) => left.localeCompare(right));
  locateAnswerSelect.replaceChildren(
    new Option("Choose a place", ""),
    ...remaining.map((name) => new Option(name, name)),
  );
  if (remaining.includes(selected)) locateAnswerSelect.value = selected;
  if (focus) locateAnswerSelect.focus({ preventScroll: true });
}

locateKeyboardAnswer?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!locateAnswerSelect?.value) {
    locateAnswerSelect?.focus({ preventScroll: true });
    return;
  }
  applyLocateSelection(locateAnswerSelect.value);
});

function detachLocateListener() {
  if (!locateBinding) return;
  locateBinding.doc.removeEventListener("click", locateBinding.listener);
  locateBinding = null;
}

function setupLocateMode() {
  const svgDoc = getSvgDoc();
  if (!svgDoc) return;

  // The CP05 candidate is mounted only by the localhost development path.
  // Its adapter owns pointer identity, while this CP04 setup owns the question
  // pool, target, timer and all scoring state.
  if (svgDoc.dataset?.mapmasterCandidate === "true") {
    let candidateNames = [];
    try {
      candidateNames = JSON.parse(svgDoc.dataset.mapmasterCandidates || "[]");
    } catch (_) {
      candidateNames = [];
    }
    const available = new Set(candidateNames);
    locateEligible = CURRENT_REGIONS.filter((name) => available.has(name));
    updateHUD();
    if (!locateEligible.length) {
      showFeedback(
        "No verified candidate targets are available for this development session.",
        "wrong",
      );
      return;
    }
    if (!gameState.currentTarget) gameState.currentTarget = pickRandomState();
    if (gameState.currentTarget) showLocateTarget(gameState.currentTarget);
    renderLocateKeyboardAnswer();
    if (
      gameState.phase === "active" &&
      gameState.gameMode === "challenge" &&
      gameState.deadline == null
    )
      startTimer();
    return;
  }

  const paths = Array.from(svgDoc.querySelectorAll("path"));
  const coverage = mapEligibleTargets(
    CURRENT_REGIONS,
    paths.map(getRegionName).filter(Boolean),
  );
  locateEligible = coverage.eligible;
  const coverageNotice = document.getElementById("mapCoverageNotice");
  if (coverageNotice) {
    const unavailable = [
      ...new Set([...coverage.missing, ...coverage.duplicates]),
    ];
    coverageNotice.textContent = unavailable.length
      ? `Unavailable on this map: ${unavailable.join(", ")}. These places are excluded from locate questions.`
      : "";
  }
  updateHUD();
  if (!locateEligible.length) {
    showFeedback(
      "No matching map targets are available for this edition.",
      "wrong",
    );
    return;
  }

  // Set cursor on all paths
  paths.forEach((path) => {
    path.style.cursor = "pointer";
    path.onclick = null; // clear any stale per-path handlers
  });

  // Use event delegation on the SVG document — far more reliable than
  // per-path onclick inside cross-origin <object> elements (esp. Safari/WebKit)
  detachLocateListener();
  const session = gameState.sessionId;
  const listener = (e) => {
    if (
      gameState.sessionId !== session ||
      gameState.gameType !== "locate" ||
      getSvgDoc() !== svgDoc
    )
      return;
    handleLocateClick(e);
  };
  locateBinding = { doc: svgDoc, listener };
  svgDoc.addEventListener("click", listener);

  if (!gameState.currentTarget) {
    gameState.currentTarget = pickRandomState();
  }
  if (gameState.currentTarget) showLocateTarget(gameState.currentTarget);
  renderLocateKeyboardAnswer();
  if (
    gameState.phase === "active" &&
    gameState.gameMode === "challenge" &&
    gameState.deadline == null
  )
    startTimer();
}

function handleLocateClick(e) {
  if (typeof canPlay === "function" && !canPlay()) return;
  // Walk up from the event target to find the nearest named path
  let el = e.target;
  while (el && el.tagName) {
    const name = getRegionName(el);
    if (name) {
      el = Object.assign(el, { _resolvedName: name });
      break;
    }
    el = el.parentElement;
  }
  const clicked = el?._resolvedName || getRegionName(e.target);
  applyLocateSelection(clicked);
}

// Shared with the development-only canonical-candidate adapter. The adapter
// resolves SVG identity; CP04 continues to own every gameplay mutation.
function applyLocateSelection(clicked) {
  if (typeof canPlay === "function" && !canPlay()) return;
  if (!clicked || !getLocateRegions().includes(clicked)) return;
  if (gameState.guessedStates.includes(clicked)) return;

  gameState.totalAttempts++;

  if (clicked === gameState.currentTarget) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak)
      gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(clicked);
    colorState(clicked, "#2D9E6B", true);
    shareLearningCue("Map target", clicked);
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();

    const next = pickRandomState();
    if (next) {
      gameState.currentTarget = next;
      showLocateTarget(next);
    }
    renderLocateKeyboardAnswer({
      focus: document.activeElement === locateAnswerSelect,
    });
    checkWin();
  } else {
    gameState.currentStreak = 0;
    trackMiss(gameState.currentTarget);
    // A miss must never reveal the requested country while retries remain.
    // The locked cue keeps the educational surface visible without becoming a
    // second answer channel.
    hideLearningCueSafe();
    flashRed(clicked);
    playSound(sfxWrong);
    updateHUD();

    if (gameState.gameMode === "challenge") {
      gameState.livesLeft--;
      updateHUD();
      if (gameState.livesLeft <= 0) endGame(false, "lives");
    }
  }
}

/* ============================================================
   FLAG MODE
   ============================================================ */
/* ============================================================
   FLAG EMOJI → TWEMOJI IMAGE URL
   Converts a flag emoji (two Regional Indicator chars) to a
   Twemoji CDN PNG URL. This renders correctly on Windows which
   has no built-in flag emoji font and shows "IN", "AU" etc.
   ============================================================ */
function flagEmojiToUrl(emoji) {
  const codepoints = [...emoji]
    .map((c) => c.codePointAt(0).toString(16))
    .join("-");
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codepoints}.png`;
}

function flagEmojiFromCountryCode(countryCode) {
  if (!/^[A-Z]{2}$/.test(countryCode || "")) return "";
  return [...countryCode]
    .map((letter) => String.fromCodePoint(0x1f1a5 + letter.charCodeAt(0)))
    .join("");
}

// A flag question is valid only when its reviewed country code, emoji table,
// and derived image code all agree. This prevents a stale answer field or an
// incorrect visual asset from becoming scoreable.
function flagIdentityFor(country) {
  const countryCode = FLAG_COUNTRY_CODES?.[country] || "";
  const flagEmoji = FLAGS?.[country] || "";
  const expectedEmoji = flagEmojiFromCountryCode(countryCode);
  return {
    country,
    countryCode,
    flagEmoji,
    valid: Boolean(countryCode && flagEmoji && flagEmoji === expectedEmoji),
  };
}

function getFlagRegions() {
  return CURRENT_REGIONS.filter((r) => FLAGS[r]);
}

function setupFlagMode() {
  const available = getFlagRegions();
  if (available.length === 0) {
    showFeedback("No flag data available for this map.", "wrong");
    return;
  }
  const target = pickRandomFlagTarget();
  if (target) showFlagTarget(target);
}

function pickRandomFlagTarget() {
  const available = getFlagRegions().filter(
    (r) => !gameState.guessedStates.includes(r),
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function showFlagTarget(name) {
  gameState.currentTarget = name;
  if (!flagContainer) return;
  const flagVal = FLAGS[name];
  if (!flagVal) return;

  // Remove any existing flag display (img or emoji span)
  const existing = flagContainer.querySelector(".flag-emoji, .flag-img");
  if (existing) existing.remove();

  // Render via Twemoji image — works on Windows which has no flag emoji font
  const img = document.createElement("img");
  img.className = "flag-img";
  img.src = flagEmojiToUrl(flagVal);
  img.alt = "Flag to identify";
  img.setAttribute("draggable", "false");
  flagContainer.insertBefore(
    img,
    flagContainer.querySelector(".flag-prompt-label").nextSibling,
  );

  flagContainer.style.animation = "none";
  void flagContainer.offsetWidth;
  flagContainer.style.animation = "";
}

function handleFlagSubmit(raw, input) {
  if (typeof canPlay === "function" && !canPlay()) return;
  if (!gameState.currentTarget) return;
  gameState.totalAttempts++;
  const result = MapMasterGameplay.resolveAnswer(raw, getFlagRegions());

  if (result.kind === "match" && result.id === gameState.currentTarget) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak)
      gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(gameState.currentTarget);
    colorState(gameState.currentTarget, "#2D9E6B", true);
    showFeedback(`✓ ${gameState.currentTarget}`, "correct");
    shareLearningCue("Flag prompt", gameState.currentTarget);
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();
    const next = pickRandomFlagTarget();
    if (next) showFlagTarget(next);
    checkWin();
  } else {
    gameState.currentStreak = 0;
    trackMiss(gameState.currentTarget);
    showFeedback(`✗ Not correct. Try again!`, "wrong");
    hideLearningCueSafe();
    playSound(sfxWrong);
    updateHUD();
  }
}

/* ============================================================
   CAPITAL MODE
   ============================================================ */
function getCapitalData() {
  if (currentMapKey === "world") return CAPITALS.world;
  if (CAPITALS[currentMapKey]) return CAPITALS[currentMapKey];
  return null;
}

function getCapitalRegions() {
  const data = getCapitalData();
  if (!data) return [];
  return CURRENT_REGIONS.filter((r) => data[r]);
}

function setupCapitalMode() {
  const available = getCapitalRegions();
  if (available.length === 0) {
    showFeedback("No capital data available for this map.", "wrong");
    return;
  }
  const target = pickRandomCapitalTarget();
  if (target) showCapitalTarget(target);
}

function pickRandomCapitalTarget() {
  const available = getCapitalRegions().filter(
    (r) => !gameState.guessedStates.includes(r),
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function showCapitalTarget(name) {
  gameState.currentTarget = name;
  if (!capitalPrompt) return;
  const regionEl = capitalPrompt.querySelector(".capital-region");
  if (regionEl) regionEl.textContent = name;
  capitalPrompt.style.animation = "none";
  void capitalPrompt.offsetWidth;
  capitalPrompt.style.animation = "";
}

function handleCapitalSubmit(raw, input) {
  if (typeof canPlay === "function" && !canPlay()) return;
  if (!gameState.currentTarget) return;
  const data = getCapitalData();
  if (!data) return;

  gameState.totalAttempts++;
  const correctCapital = data[gameState.currentTarget];
  const correctNorm = MapMasterGameplay.normalizeAnswer(correctCapital);

  if (MapMasterGameplay.normalizeAnswer(raw) === correctNorm) {
    gameState.score++;
    gameState.currentStreak++;
    if (gameState.currentStreak > gameState.bestStreak)
      gameState.bestStreak = gameState.currentStreak;
    gameState.guessedStates.push(gameState.currentTarget);
    colorState(gameState.currentTarget, "#2D9E6B", true);
    showFeedback(`✓ ${correctCapital}`, "correct");
    shareLearningCue(
      `Capital prompt: ${gameState.currentTarget}`,
      correctCapital,
    );
    playSound(sfxCorrect);
    onStreakUpdate();
    updateHUD();
    const next = pickRandomCapitalTarget();
    if (next) showCapitalTarget(next);
    checkWin();
  } else {
    gameState.currentStreak = 0;
    trackMiss(gameState.currentTarget);
    showFeedback(
      `✗ Incorrect. Hint: starts with "${correctCapital[0]}"`,
      "wrong",
    );
    hideLearningCueSafe();
    playSound(sfxWrong);
    updateHUD();
  }
}

/* ============================================================
   CP06 CHOICE SPRINTS
   ============================================================ */
function isChoiceMode() {
  return (
    gameState.gameType === "flagChoice" ||
    gameState.gameType === "capitalChoice"
  );
}

function getChoiceRegions() {
  if (gameState.dailyChallenge) return gameState.dailyPool.slice();
  const regions =
    gameState.gameType === "flagChoice"
      ? getFlagRegions()
      : getCapitalRegions();
  if (gameState.gameType !== "capitalChoice") return regions;

  const answerCounts = new Map();
  regions.forEach((region) => {
    const answer = choiceAnswerFor(region);
    const key = answer ? MapMasterGameplay.normalizeAnswer(answer) : "";
    if (key) answerCounts.set(key, (answerCounts.get(key) || 0) + 1);
  });
  return regions.filter((region) => {
    const answer = choiceAnswerFor(region);
    return (
      answer &&
      answerCounts.get(MapMasterGameplay.normalizeAnswer(answer)) === 1
    );
  });
}

function pickRandomChoiceTarget() {
  if (gameState.dailyChallenge)
    return gameState.dailyQuestions[gameState.dailyQuestionIndex] || null;
  const available = getChoiceRegions().filter(
    (name) => !gameState.guessedStates.includes(name),
  );
  return available.length
    ? available[Math.floor(Math.random() * available.length)]
    : null;
}

function choiceAnswerFor(name) {
  if (gameState.gameType === "flagChoice") return name;
  return getCapitalData()?.[name] || null;
}

function createChoiceQuestion(name) {
  const answerId = choiceAnswerFor(name);
  if (!answerId) return null;
  const version = (gameState.choiceQuestionVersion || 0) + 1;
  gameState.choiceQuestionVersion = version;
  const id = `choice:${gameState.sessionId}:${version}`;

  if (gameState.gameType === "flagChoice") {
    const identity = flagIdentityFor(name);
    if (!identity.valid) return null;
    return Object.freeze({
      id,
      kind: "flag",
      targetId: name,
      answerId,
      flagCode: identity.countryCode,
      flagEmoji: identity.flagEmoji,
    });
  }

  return Object.freeze({
    id,
    kind: "capital",
    targetId: name,
    answerId,
  });
}

function choiceVisualMatchesQuestion(question) {
  if (question.kind !== "flag") return true;
  if (typeof choiceVisual === "undefined" || !choiceVisual) return true;
  const image = choiceVisual.querySelector("img.flag-img");
  return Boolean(
    image &&
    image.dataset.questionId === question.id &&
    image.dataset.flagCode === question.flagCode &&
    image.src === flagEmojiToUrl(question.flagEmoji),
  );
}

function rejectChoiceQuestion() {
  const session = gameState.sessionId;
  gameState.currentTarget = null;
  gameState.choiceQuestion = null;
  gameState.choiceAnswer = null;
  if (typeof choiceOptions !== "undefined" && choiceOptions) {
    choiceOptions.querySelectorAll("button").forEach((option) => {
      option.disabled = true;
    });
  }
  hideLearningCueSafe();
  showFeedback(
    "This question could not be verified. Loading a new one.",
    "wrong",
  );
  setTimeout(() => {
    if (
      gameState.sessionId !== session ||
      gameState.phase !== "active" ||
      gameState.choiceQuestion
    )
      return;
    const next = pickRandomChoiceTarget();
    if (next) showChoiceTarget(next);
  }, 0);
}

function setupChoiceMode() {
  if (getChoiceRegions().length < 4) {
    showFeedback(
      "This sprint needs four distinct answers for this map.",
      "wrong",
    );
    return;
  }
  const target = pickRandomChoiceTarget();
  if (!target) {
    showFeedback("No choice questions available for this map.", "wrong");
    return;
  }
  showChoiceTarget(target);
}

function showChoiceTarget(name) {
  const question = createChoiceQuestion(name);
  if (!question || !choicePrompt || !choiceOptions) {
    rejectChoiceQuestion();
    return;
  }
  gameState.choiceQuestion = question;
  // These compatibility mirrors are deliberately never used as the scoring
  // authority; handleChoiceSelection reads the immutable question instead.
  gameState.currentTarget = question.targetId;
  gameState.choiceAnswer = question.answerId;
  choiceOptions.replaceChildren();
  if (choiceVisual) choiceVisual.replaceChildren();

  let candidates;
  if (gameState.gameType === "flagChoice") {
    choicePrompt.textContent = "Which country has this flag?";
    candidates = getChoiceRegions();
    const image = document.createElement("img");
    image.className = "flag-img";
    image.src = flagEmojiToUrl(question.flagEmoji);
    image.alt = "Flag to identify";
    image.draggable = false;
    image.dataset.questionId = question.id;
    image.dataset.flagCode = question.flagCode;
    const codeCue = document.createElement("p");
    codeCue.className = "flag-code-cue";
    codeCue.id = `flagCodeCue-${gameState.sessionId}`;
    codeCue.textContent = `Unicode regional-indicator code: ${[
      ...question.flagEmoji,
    ]
      .map(
        (character) =>
          `U+${character.codePointAt(0).toString(16).toUpperCase()}`,
      )
      .join(
        " ",
      )}. Use this code as a country-code clue, then choose an answer.`;
    image.setAttribute("aria-describedby", codeCue.id);
    choiceVisual?.append(image, codeCue);
  } else {
    choicePrompt.textContent = `Choose the capital of ${name}.`;
    candidates = getChoiceRegions()
      .map((region) => choiceAnswerFor(region))
      .filter(Boolean);
    if (choiceVisual) choiceVisual.textContent = name;
  }

  const options = MapMasterGameplay.buildChoiceOptions(
    question.answerId,
    candidates,
    4,
  );
  if (options.length !== 4) {
    gameState.currentTarget = null;
    gameState.choiceQuestion = null;
    gameState.choiceAnswer = null;
    showFeedback(
      "This sprint needs four distinct answers for this map.",
      "wrong",
    );
    return;
  }
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-option";
    button.textContent = option;
    button.addEventListener("click", () =>
      handleChoiceSelection(option, button),
    );
    choiceOptions.append(button);
  });
  choiceOptions.querySelector("button")?.focus({ preventScroll: true });
}

function handleChoiceSelection(answer, button) {
  const question = gameState.choiceQuestion;
  if (
    !canPlay() ||
    !isChoiceMode() ||
    !question ||
    question.id !== gameState.choiceQuestion?.id ||
    gameState.guessedStates.includes(question.targetId)
  )
    return;
  if (
    question.targetId !== gameState.currentTarget ||
    question.answerId !== gameState.choiceAnswer ||
    !choiceVisualMatchesQuestion(question)
  ) {
    rejectChoiceQuestion();
    return;
  }
  gameState.totalAttempts++;
  if (answer !== question.answerId) {
    gameState.currentStreak = 0;
    trackMiss(question.targetId);
    button.disabled = true;
    button.classList.add("choice-option--wrong");
    showFeedback("✗ Not correct. Try another answer.", "wrong");
    hideLearningCueSafe();
    playSound(sfxWrong);
    updateHUD();
    return;
  }

  gameState.score++;
  gameState.currentStreak++;
  if (gameState.currentStreak > gameState.bestStreak)
    gameState.bestStreak = gameState.currentStreak;
  gameState.guessedStates.push(question.targetId);
  if (gameState.dailyChallenge) gameState.dailyQuestionIndex += 1;
  choiceOptions?.querySelectorAll("button").forEach((option) => {
    option.disabled = true;
  });
  button.classList.add("choice-option--correct");
  onStreakUpdate();
  updateHUD();
  checkWin();
  if (gameState.phase !== "active") return;
  // Sprint selection is a high-frequency action. Its persistent response is
  // the updated score/streak; never leave a result card describing the next
  // question. A synchronous replacement also avoids background-tab timer
  // throttling that previously stretched this handoff to more than a second.
  showFeedback("");
  clearLearningCueSafe();
  const next = pickRandomChoiceTarget();
  if (next) showChoiceTarget(next);
  // Sound is supplementary. Creating/resuming an audio context must never
  // delay the next Sprint prompt or keyboard focus.
  setTimeout(() => playSound(sfxCorrect), 0);
}
