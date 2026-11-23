/* ============================================================
   MapMaster | game.js
   Core game lifecycle: reset, start, end, win check,
   timer, streaks, UT easter egg, review mode.
   Depends on: data.js, state.js, ui.js, audio.js, modes.js
   ============================================================ */

/* ============================================================
   TIMER
   ============================================================ */
function syncDeadline() {
  if (gameState.gameMode !== "challenge" || gameState.deadline == null)
    return true;
  gameState.timeLeft = MapMasterGameplay.remainingSeconds(
    gameState.deadline,
    performance.now(),
  );
  if (gameState.timeLeft === 0) {
    updateHUD();
    endGame(false, "time");
    return false;
  }
  return true;
}

function canPlay() {
  if (gameState.phase !== "active" || gameState.reviewMode) return false;
  return syncDeadline();
}

function dismissLearningCue() {
  if (typeof hideLearningCue === "function") hideLearningCue();
}

function dismissLearningReview() {
  if (typeof hideLearningReview === "function") hideLearningReview();
}

function startTimer() {
  clearTimer();
  lastTickPlayed = -1;
  gameState.deadline = performance.now() + gameState.timeLeft * 1000;
  const session = gameState.sessionId;
  gameState.timerInterval = setInterval(() => {
    if (gameState.sessionId !== session || gameState.phase !== "active") return;
    if (!syncDeadline()) return;
    updateHUD();
    if (gameState.timeLeft <= 10 && gameState.timeLeft !== lastTickPlayed) {
      lastTickPlayed = gameState.timeLeft;
      playSound(sfxTick);
    }
  }, 1000);
}

/* ============================================================
   RESET
   ============================================================ */
function resetGame() {
  clearTimer();
  gameState.sessionId++;
  isSubmitting = false;
  gameState.phase = "idle";
  locateEligible = [];
  const coverageNotice = document.getElementById("mapCoverageNotice");
  if (coverageNotice) coverageNotice.textContent = "";
  gameState.deadline = null;
  gameState.progressionResultId = null;
  gameState.dailyQuestionIndex = 0;
  document.getElementById("reviewBanner")?.remove();
  resetMapStyles();
  gameState.score = 0;
  gameState.bonusPoints = 0;
  gameState.totalAttempts = 0;
  gameState.guessedStates = [];
  gameState.guessedUTs = [];
  gameState.missedRegions = [];
  gameState.unreviewableAttempts = 0;
  gameState.timerInterval = null;
  gameState.startTime = null;
  gameState.startedAt = null;
  gameState.currentTarget = null;
  gameState.choiceQuestion = null;
  gameState.choiceAnswer = null;
  gameState.timeLeft = gameState.selectedTime || 0;
  gameState.currentStreak = 0;
  gameState.bestStreak = 0;
  gameState.reviewMode = false;
  gameState.learningReviewIndex = 0;
  dismissLearningCue();
  dismissLearningReview();

  if (gameState.gameMode === "challenge" && gameState.gameType === "locate") {
    gameState.livesLeft = gameState.selectedLives;
  } else {
    gameState.livesLeft = 0;
  }

  stateInput.value = "";
  showFeedback("");

  if (progressBarFill) progressBarFill.style.width = "0%";
  if (progressLabel)
    progressLabel.textContent = `0 / ${CURRENT_REGIONS.length} ${regionLabel()}`;

  if (locatePrompt) {
    if (locateNameEl) locateNameEl.textContent = "";
    locatePrompt.classList.add("hidden");
  }
  document.getElementById("locateKeyboardAnswer")?.classList.add("hidden");
}

/* ============================================================
   START GAME
   ============================================================ */
function startGame(options = {}) {
  if (
    typeof window !== "undefined" &&
    window.document &&
    !window.MapMasterGameplay
  ) {
    alert("Gameplay is still loading. Please try again.");
    return;
  }
  // A daily identity is session-scoped. Every ordinary launch is authoritative:
  // it must discard any completed, abandoned, or otherwise stale daily queue
  // before deriving its question pool or progression result identity.
  if (!options.daily) clearDailyContext();
  const choiceGame =
    gameState.gameType === "flagChoice" ||
    gameState.gameType === "capitalChoice";
  const pool = choiceGame
    ? getChoiceRegions()
    : gameState.gameType === "flag"
      ? getFlagRegions()
      : gameState.gameType === "capital"
        ? getCapitalRegions()
        : CURRENT_REGIONS;
  const minimumPool = choiceGame ? 4 : 1;
  if (pool.length < minimumPool) {
    alert(
      minimumPool === 4
        ? "This sprint needs four distinct answers for this map."
        : "No questions available for this map and game type.",
    );
    return;
  }
  // Ignore a repeated launch while the active game screen is already visible.
  if (screens.game && !screens.game.classList.contains("hidden")) return;
  resetGame();
  gameState.phase = "active";
  gameState.startTime = Date.now();
  gameState.startedAt = performance.now();
  gameState.progressionResultId = gameState.dailyChallenge
    ? `daily:${gameState.dailyChallenge.identity}`
    : `v1-${gameState.startTime}-${gameState.sessionId}`;
  updateHUD();
  showScreen("game");

  // Hide all mode UI first
  inputSection.classList.add("hidden");
  if (locatePrompt) locatePrompt.classList.add("hidden");
  if (flagContainer) flagContainer.classList.add("hidden");
  if (capitalPrompt) capitalPrompt.classList.add("hidden");
  if (typeof choiceContainer !== "undefined" && choiceContainer)
    choiceContainer.classList.add("hidden");
  const mapContainerEl = document.getElementById("mapContainer");
  if (mapContainerEl)
    mapContainerEl.classList.toggle(
      "hidden",
      gameState.gameType === "flagChoice" ||
        gameState.gameType === "capitalChoice",
    );

  if (gameState.gameType === "typing") {
    inputSection.classList.remove("hidden");
    stateInput.placeholder =
      regionLabel() === "Countries"
        ? "Type a country name..."
        : "Type a state name...";
  } else if (gameState.gameType === "locate") {
    locatePrompt.classList.remove("hidden");
    const svgDoc = getSvgDoc();
    if (svgLoaded && svgDoc && svgDoc.querySelector("path")) {
      setupLocateMode();
    }
  } else if (gameState.gameType === "flag") {
    inputSection.classList.remove("hidden");
    flagContainer.classList.remove("hidden");
    stateInput.placeholder = "Type the country name...";
    setupFlagMode();
  } else if (gameState.gameType === "capital") {
    inputSection.classList.remove("hidden");
    capitalPrompt.classList.remove("hidden");
    stateInput.placeholder = "Type the capital city...";
    setupCapitalMode();
  } else if (
    gameState.gameType === "flagChoice" ||
    gameState.gameType === "capitalChoice"
  ) {
    if (typeof choiceContainer !== "undefined" && choiceContainer)
      choiceContainer.classList.remove("hidden");
    setupChoiceMode();
  }

  const hintBtnEl = document.getElementById("hintBtn");
  if (hintBtnEl)
    hintBtnEl.classList.toggle(
      "hidden",
      gameState.gameType === "locate" ||
        gameState.gameType === "flagChoice" ||
        gameState.gameType === "capitalChoice",
    );

  if (gameState.gameMode === "challenge" && gameState.gameType !== "locate")
    startTimer();
}

/* ============================================================
   END GAME
   ============================================================ */
function endGame(isWin, reason = "") {
  if (gameState.phase !== "active") return;
  gameState.phase = "ended";
  const session = gameState.sessionId;
  clearTimer();
  const dailyTerminal =
    gameState.dailyChallenge && window.MapMasterDaily?.recordTerminal
      ? window.MapMasterDaily.recordTerminal({
          isWin,
          score: gameState.score,
          totalAttempts: gameState.totalAttempts,
          bestStreak: gameState.bestStreak,
          elapsedSeconds: getElapsedTime(),
          challenge: gameState.dailyChallenge,
        })
      : null;
  const progressionFeedback = emitProgressionTerminalResult(
    isWin,
    dailyTerminal?.progressionAllowed,
  );

  if (isWin) {
    playSound(sfxWin);
    launchConfetti();
    CURRENT_REGIONS.forEach((s) => colorState(s, "#2D9E6B"));

    if (gameState.gameMode === "challenge") {
      const elapsed = getElapsedTime();
      const accuracy = MapMasterGameplay.accuracy(
        gameState.score + gameState.guessedUTs.length,
        gameState.totalAttempts,
      );
      // Animate stats counting up after screen transition settles
      const bestStreak = gameState.bestStreak;
      setTimeout(() => {
        if (gameState.sessionId !== session || gameState.phase !== "ended")
          return;
        animateValue(display.finalTime, 0, elapsed, 800, (v) => formatTime(v));
        animateValue(display.finalAccuracy, 0, accuracy, 800, (v) => v);
        if (finalStreak)
          animateValue(finalStreak, 0, bestStreak, 600, (v) => v);
      }, 300);
      display.finalTime.textContent = formatTime(elapsed);
      display.finalAccuracy.textContent = accuracy;
    } else {
      display.finalTime.textContent = "--";
      display.finalAccuracy.textContent = "--";
      if (finalStreak)
        animateValue(finalStreak, 0, gameState.bestStreak, 600, (v) => v);
    }

    // UT Easter egg stat
    const utBonusStat = document.getElementById("utBonusStat");
    const finalUTBonus = document.getElementById("finalUTBonus");
    if (utBonusStat && finalUTBonus) {
      if (currentMapKey === "india" && gameState.guessedUTs.length > 0) {
        finalUTBonus.textContent = `+${gameState.bonusPoints} (${gameState.guessedUTs.length}/${INDIA_UTS.length} UTs)`;
        utBonusStat.classList.remove("hidden");
      } else {
        utBonusStat.classList.add("hidden");
      }
    }

    renderMissedSummary("winMissedList", "winLearningCopy");
    setReviewButtonVisibility("winReviewBtn");
    showProgressionFeedback("winProgressionAward", progressionFeedback);
    showScreen("win");
    window.MapMasterDaily?.renderTerminal?.(dailyTerminal, true);
  } else {
    playSound(sfxLose);
    addUnansweredQuestionsToReview();
    renderMissedSummary("missedList", "loseLearningSummary");
    setReviewButtonVisibility("reviewBtn");
    showProgressionFeedback("loseProgressionAward", progressionFeedback);

    display.loseReason.textContent =
      reason === "time"
        ? "⏰ Time's up! Better luck next time."
        : "💔 You ran out of lives!";
    showScreen("lose");
    window.MapMasterDaily?.renderTerminal?.(dailyTerminal, false);
  }
}

function emitProgressionTerminalResult(isWin, dailyProgressionAllowed = true) {
  if (gameState.dailyChallenge && (!isWin || !dailyProgressionAllowed))
    return null;
  const progression =
    typeof window !== "undefined" ? window.MapMasterProgression : null;
  if (!progression?.recordTerminalResult) return null;
  const id =
    gameState.progressionResultId ||
    `v1-${gameState.startTime || 0}-${gameState.sessionId}`;
  gameState.progressionResultId = id;
  const award = progression.recordTerminalResult({
    id,
    outcome: isWin ? "won" : "lost",
    gameType: gameState.gameType,
    mapKey: currentMapKey,
    gameMode: gameState.gameMode,
    selectedTime: gameState.selectedTime ?? null,
    selectedLives: gameState.selectedLives ?? null,
    score: gameState.score,
    correctAnswers: gameState.score + gameState.guessedUTs.length,
    totalAttempts: gameState.totalAttempts,
    bestStreak: gameState.bestStreak,
    elapsedSeconds: getElapsedTime(),
  });
  let leveledUp = false;
  if (award?.unlocked?.length) playSound("achievement");
  if (award?.xp && typeof progression.getState === "function") {
    const totalXp = progression.getState().totalXp;
    const levels = window.MapMasterProgressionCore?.levelProgress;
    leveledUp =
      typeof levels === "function" &&
      levels(totalXp - award.xp).level < levels(totalXp).level;
    if (leveledUp) playSound("level");
  }
  return { award, leveledUp };
}

function showProgressionFeedback(elementId, feedback) {
  const element = document.getElementById(elementId);
  if (!element) return;
  const award = feedback?.award;
  if (!award?.eligible || award.duplicate) {
    element.textContent = "";
    return;
  }
  const parts = [];
  if (award.xp) parts.push(`+${award.xp} XP`);
  if (award.unlocked?.length) {
    parts.push(
      `${award.unlocked.length} achievement${award.unlocked.length === 1 ? "" : "s"} unlocked`,
    );
  }
  if (feedback.leveledUp) parts.push("Level up!");
  element.textContent = parts.join(" · ");
}

/* ============================================================
   WIN CHECK
   ============================================================ */
function checkWin() {
  if (gameState.dailyChallenge) {
    if (
      gameState.dailyQuestions.length > 0 &&
      new Set(gameState.guessedStates).size >= gameState.dailyQuestions.length
    )
      endGame(true);
    return;
  }
  let total;
  if (gameState.gameType === "flag" || gameState.gameType === "flagChoice")
    total = getFlagRegions().length;
  else if (
    gameState.gameType === "capital" ||
    gameState.gameType === "capitalChoice"
  )
    total = getCapitalRegions().length;
  else if (gameState.gameType === "locate") total = getLocateRegions().length;
  else total = CURRENT_REGIONS.length;
  if (total > 0 && new Set(gameState.guessedStates).size >= total)
    endGame(true);
}

/* ============================================================
   STREAK
   ============================================================ */
function onStreakUpdate() {
  if (gameState.currentStreak > 0 && gameState.currentStreak % 5 === 0) {
    playSound(sfxStreak);
  }
}

function trackMiss(region) {
  if (region && !gameState.missedRegions.includes(region)) {
    gameState.missedRegions.push(region);
  }
}

function reviewQuestionPool() {
  if (gameState.dailyChallenge) return gameState.dailyQuestions;
  if (gameState.gameType === "typing") return CURRENT_REGIONS;
  if (
    gameState.gameType === "flagChoice" ||
    gameState.gameType === "capitalChoice"
  )
    return getChoiceRegions();
  if (gameState.gameType === "capital") return getCapitalRegions();
  if (gameState.gameType === "flag") return getFlagRegions();
  if (gameState.gameType === "locate") return getLocateRegions();
  return [];
}

function addUnansweredQuestionsToReview() {
  reviewQuestionPool().forEach((region) => {
    if (!gameState.guessedStates.includes(region)) trackMiss(region);
  });
}

function renderMissedSummary(listId, summaryId) {
  const list = document.getElementById(listId);
  const summary = document.getElementById(summaryId);
  const items = gameState.missedRegions;
  const unreviewableAttempts = gameState.unreviewableAttempts || 0;
  if (summary) {
    summary.textContent = items.length
      ? `Revisit ${items.length} ${items.length === 1 ? "question" : "questions"} that were incorrect or unfinished.`
      : unreviewableAttempts
        ? "Unrecognized free-recall attempts are not included because they do not identify a country or state to review."
        : "No missed answers this session — great recall.";
  }
  if (!list) return;
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("em");
    empty.textContent = "None — great run!";
    list.append(empty);
    return;
  }
  items.slice(0, 8).forEach((region) => {
    const tag = document.createElement("span");
    tag.className = "missed-tag";
    tag.textContent = region;
    list.append(tag);
  });
  if (items.length > 8) {
    const more = document.createElement("span");
    more.className = "missed-tag missed-more";
    more.textContent = `+${items.length - 8} more`;
    list.append(more);
  }
}

function setReviewButtonVisibility(buttonId) {
  const button = document.getElementById(buttonId);
  if (button)
    button.classList.toggle("hidden", gameState.missedRegions.length === 0);
}

/* ============================================================
   UT ACHIEVEMENT TOAST
   ============================================================ */
function showUTAchievement() {
  const existing = document.getElementById("utAchievement");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "utAchievement";
  toast.innerHTML = `
    <span class="ut-achievement-icon">🇮🇳</span>
    <div class="ut-achievement-text">
      <strong>India Expert!</strong>
      <span>You discovered all Union Territories</span>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("ut-achievement-show"));
  setTimeout(() => {
    toast.classList.remove("ut-achievement-show");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

/* ============================================================
   MAP SELECTION
   ============================================================ */
function applyMap(mapKey) {
  // Map selection is only part of the ordinary setup flow. Detach an abandoned
  // daily queue before any normal-mode setup can read it.
  clearDailyContext();
  currentMapKey = mapKey;
  CURRENT_REGIONS = MAPS[mapKey].regions;
  svgLoaded = false;
  replaceMapDocument(MAPS[mapKey].svg);

  applyAccentColor(mapKey);

  const headerSubEl = document.getElementById("headerSub");
  if (headerSubEl) headerSubEl.textContent = MAPS[mapKey].name + " Edition";

  const setupSub = document.getElementById("setupSubtitle");
  if (setupSub) {
    let descriptor;
    if (mapKey === "world") {
      descriptor = "countries of the World";
    } else if (CONTINENT_KEYS.includes(mapKey)) {
      descriptor = "countries of " + MAPS[mapKey].name;
    } else {
      descriptor = "states of " + MAPS[mapKey].name;
    }
    setupSub.textContent = "How well do you know the " + descriptor + "?";
  }

  clearTimer();
  gameState.score = 0;
  gameState.totalAttempts = 0;
  gameState.guessedStates = [];
  gameState.currentStreak = 0;
  gameState.bestStreak = 0;
  gameState.currentTarget = null;

  if (progressBarFill) progressBarFill.style.width = "0%";
  if (progressLabel)
    progressLabel.textContent =
      "0 / " + CURRENT_REGIONS.length + " " + regionLabel();

  updateGameTypeAvailability();
}

function clearDailyContext() {
  gameState.dailyChallenge = null;
  gameState.dailyQuestions = [];
  gameState.dailyPool = [];
  gameState.dailyQuestionIndex = 0;
}

// Kept in the classic runtime so the TypeScript daily UI can reuse the CP04
// engine without depending on global lexical bindings or loading CP05 assets.
window.MapMasterDailyRuntime = {
  start(challenge) {
    if (
      !challenge ||
      !Array.isArray(challenge.questions) ||
      !Array.isArray(challenge.pool) ||
      !Number.isInteger(challenge.config?.timeSeconds)
    )
      return false;
    currentMapKey = "world";
    CURRENT_REGIONS = challenge.pool.slice();
    const headerSubEl = document.getElementById("headerSub");
    if (headerSubEl) headerSubEl.textContent = "Daily Challenge";
    gameState.gameType = "capitalChoice";
    gameState.gameMode = "challenge";
    gameState.selectedTime = challenge.config.timeSeconds;
    gameState.selectedLives = null;
    gameState.timeLeft = challenge.config.timeSeconds;
    gameState.dailyChallenge = challenge;
    gameState.dailyQuestions = challenge.questions.slice();
    gameState.dailyPool = challenge.pool.slice();
    gameState.dailyQuestionIndex = 0;
    startGame({ daily: true });
    return true;
  },
  clear() {
    clearDailyContext();
  },
};

function resetSetupSelections() {
  clearDailyContext();
  gameState.gameType = null;
  gameState.gameMode = null;
  [
    buttons.typingMode,
    buttons.locateMode,
    buttons.flagMode,
    buttons.capitalMode,
    buttons.capitalChoiceMode,
    buttons.flagChoiceMode,
    buttons.practiceMode,
    buttons.challengeMode,
  ].forEach((b) => b && b.classList.remove("selected"));
  if (homeStartBtn) homeStartBtn.disabled = true;
  updateGameTypeAvailability();
}

/* ============================================================
   REVIEW MODE
   ============================================================ */
function enterReviewMode() {
  if (gameState.phase === "active") return;
  gameState.reviewMode = true;
  showScreen("game");

  inputSection.classList.add("hidden");
  if (locatePrompt) locatePrompt.classList.add("hidden");
  if (flagContainer) flagContainer.classList.add("hidden");
  if (capitalPrompt) capitalPrompt.classList.add("hidden");
  if (typeof choiceContainer !== "undefined")
    choiceContainer?.classList.add("hidden");
  dismissLearningCue();

  const svgDoc = getSvgDoc();
  if (svgDoc)
    svgDoc.querySelectorAll("path").forEach((p) => {
      p.style.fill = "#e2d9d0";
    });

  gameState.guessedStates.forEach((r) => colorState(r, "#2D9E6B"));
  gameState.missedRegions.forEach((r) => colorState(r, "#ef4444"));

  const existing = document.getElementById("reviewBanner");
  if (existing) existing.remove();
  const banner = document.createElement("div");
  banner.id = "reviewBanner";
  banner.innerHTML = `
    <span class="review-title">📖 Review Mode</span>
    <span class="review-sub">🟢 Guessed &nbsp; 🔴 Missed (${gameState.missedRegions.length})</span>
    <button id="reviewExitBtn">← Back to Menu</button>
  `;
  const mapCont = document.getElementById("mapContainer");
  if (mapCont) mapCont.prepend(banner);

  if (typeof showLearningReview === "function") showLearningReview();

  document.getElementById("reviewExitBtn")?.addEventListener("click", () => {
    banner.remove();
    showScreen("start");
  });
}

function learningReviewRecord(target) {
  if (
    gameState.gameType === "capital" ||
    gameState.gameType === "capitalChoice"
  ) {
    return {
      prompt: `Capital prompt: ${target}`,
      answer: getCapitalData()?.[target] || "Unavailable for this item.",
    };
  }
  if (gameState.gameType === "flag" || gameState.gameType === "flagChoice") {
    return { prompt: "Flag prompt", answer: target };
  }
  if (gameState.gameType === "locate")
    return { prompt: "Map target", answer: target };
  return { prompt: "Accepted name", answer: target };
}

function showLearningReview() {
  const panel = document.getElementById("learningReview");
  const previous = document.getElementById("learningReviewPrevious");
  const next = document.getElementById("learningReviewNext");
  const exit = document.getElementById("learningReviewExit");
  if (!panel || !previous || !next || !exit) return;
  panel.classList.remove("hidden");
  gameState.learningReviewIndex = 0;

  const render = () => {
    const items = gameState.missedRegions;
    const empty = items.length === 0;
    const index = Math.min(
      gameState.learningReviewIndex,
      Math.max(items.length - 1, 0),
    );
    gameState.learningReviewIndex = index;
    const record = empty
      ? {
          prompt: "No missed answers to review.",
          answer:
            "Complete a session with an incorrect or unfinished answer to revisit it here.",
        }
      : learningReviewRecord(items[index]);
    const learning = buildLearningRecord(record.prompt, record.answer);
    document.getElementById("learningReviewProgress").textContent = items.length
      ? `Review ${index + 1} of ${items.length}`
      : "No missed answers to review.";
    document.getElementById("learningReviewPrompt").textContent =
      learning.prompt;
    document.getElementById("learningReviewAnswer").textContent = empty
      ? learning.answer
      : `Current game answer: ${learning.answer}`;
    document.getElementById("learningReviewSource").textContent =
      learning.sourceNote;
    previous.disabled = empty || index === 0;
    next.disabled = empty || index >= items.length - 1;
  };

  previous.onclick = () => {
    gameState.learningReviewIndex--;
    render();
  };
  next.onclick = () => {
    gameState.learningReviewIndex++;
    render();
  };
  exit.onclick = () => showScreen("start");
  render();
}

/* ============================================================
   HINT SYSTEM
   ============================================================ */
function generateHint() {
  const type = gameState.gameType;

  if (type === "typing") {
    const unguessed = CURRENT_REGIONS.filter(
      (r) => !gameState.guessedStates.includes(r),
    );
    if (unguessed.length === 0) return null;
    const pick = unguessed[Math.floor(Math.random() * unguessed.length)];
    return `Try: ${pick[0]}${"_".repeat(pick.length - 1)}  (${pick.length} letters)`;
  }

  const target = gameState.currentTarget;
  if (!target) return null;

  if (type === "flag") {
    return `Country starts with "${target[0]}"`;
  } else if (type === "capital") {
    const data = getCapitalData();
    const capital = data ? data[target] : null;
    return capital
      ? `Capital starts with "${capital[0]}"`
      : `Region: ${target[0]}...`;
  } else if (type === "locate") {
    const path = getPathByName(target);
    if (path) {
      const orig = path.style.fill;
      path.style.fill = "#F0C040";
      const session = gameState.sessionId;
      setTimeout(() => {
        if (session === gameState.sessionId && gameState.phase === "active")
          path.style.fill = orig;
      }, 1200);
    }
    return `Highlighted on map for 1 second`;
  }
  return null;
}

function useHint() {
  if (!canPlay()) return;
  const hint = generateHint();
  if (!hint) return;

  if (gameState.gameMode === "challenge") {
    if (gameState.gameType === "locate") {
      gameState.livesLeft = Math.max(0, gameState.livesLeft - 1);
      if (gameState.livesLeft === 0) {
        endGame(false, "lives");
        return;
      }
    } else {
      gameState.deadline -= 10000;
      if (!syncDeadline()) return;
    }
    updateHUD();
  }
  showFeedback(`💡 ${hint}`, "hint");
}
