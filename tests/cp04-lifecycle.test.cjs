const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const rules = { exports: {} };
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/shared/gameplay.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports: rules.exports },
);
const classList = () => ({
  add() {},
  remove() {},
  toggle() {},
  contains() {
    return true;
  },
});
const element = () => ({
  textContent: "",
  innerHTML: "",
  value: "",
  style: {},
  classList: classList(),
  querySelector() {
    return { nextSibling: null, textContent: "", remove() {} };
  },
  insertBefore() {},
  setAttribute() {},
  remove() {},
});
function fixture(type = "typing", mode = "challenge") {
  let now = 0,
    nextId = 0,
    screen = "setup";
  const timers = new Map(),
    deferred = [];
  const state = {
    gameType: type,
    gameMode: mode,
    selectedTime: 10,
    selectedLives: 1,
    timeLeft: 10,
    livesLeft: 1,
    score: 0,
    bonusPoints: 0,
    totalAttempts: 0,
    guessedStates: [],
    guessedUTs: [],
    missedRegions: [],
    timerInterval: null,
    startTime: null,
    startedAt: null,
    currentTarget: null,
    currentStreak: 0,
    bestStreak: 0,
    reviewMode: false,
    phase: "idle",
    sessionId: 0,
    deadline: null,
  };
  const docs = [];
  function mapDoc() {
    const handlers = new Set();
    const doc = {
      handlers,
      querySelectorAll() {
        return [];
      },
      querySelector() {
        return {};
      },
      addEventListener(type, fn) {
        if (type === "click") handlers.add(fn);
      },
      removeEventListener(type, fn) {
        if (type === "click") handlers.delete(fn);
      },
    };
    docs.push(doc);
    return doc;
  }
  let doc = mapDoc();
  const ctx = {
    gameState: state,
    CURRENT_REGIONS: ["Japan", "India"],
    currentMapKey: "world",
    INDIA_UTS: [],
    FLAGS: { Japan: "🇯🇵", India: "🇮🇳" },
    CAPITALS: { world: { Japan: "Tokyo", India: "Delhi" } },
    MapMasterGameplay: rules.exports,
    normalize: (s) => s.toLowerCase().replace(/\s+/g, ""),
    performance: { now: () => now },
    Date,
    Math: Object.assign(Object.create(Math), { random: () => 0 }),
    stateInput: element(),
    inputSection: element(),
    locatePrompt: element(),
    locateNameEl: element(),
    flagContainer: element(),
    capitalPrompt: element(),
    progressBarFill: null,
    progressLabel: null,
    finalStreak: element(),
    svgLoaded: true,
    lastTickPlayed: -1,
    screens: {
      game: {
        classList: {
          contains() {
            return screen !== "game";
          },
        },
      },
    },
    document: {
      getElementById() {
        return null;
      },
      createElement() {
        return element();
      },
    },
    display: {
      finalTime: element(),
      finalAccuracy: element(),
      loseReason: element(),
    },
    setTimeout(fn) {
      deferred.push(fn);
      return deferred.length;
    },
    setInterval(fn) {
      const id = ++nextId;
      timers.set(id, fn);
      return id;
    },
    clearInterval(id) {
      timers.delete(id);
    },
    clearTimer() {
      if (state.timerInterval) timers.delete(state.timerInterval);
      state.timerInterval = null;
    },
    getSvgDoc() {
      return doc;
    },
    getRegionName(el) {
      return el.name || null;
    },
    resetMapStyles() {},
    colorState() {},
    flashRed() {},
    showFeedback() {},
    updateHUD() {},
    playSound() {},
    launchConfetti() {},
    animateValue() {},
    showUTAchievement() {},
    regionLabel() {
      return "Countries";
    },
    formatTime: (n) => String(n),
    getElapsedTime() {
      return Math.floor(now / 1000);
    },
    pickRandomState() {
      return (
        ctx.CURRENT_REGIONS.find((r) => !state.guessedStates.includes(r)) ||
        null
      );
    },
    showScreen(name) {
      if (screen === "game" && name !== "game") {
        ctx.clearTimer();
        if (state.phase === "active") state.phase = "abandoned";
        state.startTime = null;
      }
      screen = name;
    },
    sfxTick: null,
    sfxWin: null,
    sfxLose: null,
    sfxCorrect: null,
    sfxWrong: null,
    sfxStreak: null,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("js/modes.js", "utf8"), ctx);
  vm.runInContext(fs.readFileSync("js/game.js", "utf8"), ctx);
  return {
    ctx,
    state,
    timers,
    deferred,
    docs,
    setNow(value) {
      now = value;
    },
    replaceDoc() {
      doc = mapDoc();
      return doc;
    },
    screen: () => screen,
    submit(value) {
      ctx.stateInput.value = value;
      ctx.handleTypingSubmit();
    },
    release() {
      while (deferred.length) deferred.shift()();
    },
    click(name) {
      ctx.handleLocateClick({ target: { tagName: "path", name } });
    },
  };
}
function snapshot(s) {
  return JSON.stringify({
    score: s.score,
    bonus: s.bonusPoints,
    attempts: s.totalAttempts,
    streak: s.currentStreak,
    best: s.bestStreak,
    lives: s.livesLeft,
    time: s.timeLeft,
    target: s.currentTarget,
    guessed: s.guessedStates,
    missed: s.missedRegions,
    phase: s.phase,
  });
}

test("deadline wins over both correct and incorrect submissions exactly at the boundary", () => {
  for (const answer of ["Japan", "wrong"]) {
    const f = fixture();
    f.ctx.CURRENT_REGIONS = ["Japan"];
    f.ctx.startGame();
    f.setNow(10000);
    f.submit(answer);
    assert.equal(f.screen(), "lose");
    assert.equal(
      f.ctx.display.loseReason.textContent.includes("Time's up"),
      true,
    );
    assert.equal(f.state.score, 0);
    assert.equal(f.state.totalAttempts, 0);
    assert.equal(f.state.currentStreak, 0);
    const after = snapshot(f.state);
    f.submit("Japan");
    f.ctx.endGame(true);
    f.ctx.endGame(false, "lives");
    assert.equal(snapshot(f.state), after);
  }
});

test("deadline takes priority over a simultaneous final-life wrong map click", () => {
  const f = fixture("locate");
  f.ctx.startGame();
  f.setNow(10000);
  f.click("India");
  assert.equal(f.screen(), "lose");
  assert.match(f.ctx.display.loseReason.textContent, /Time/);
  assert.equal(f.state.livesLeft, 1);
  assert.equal(f.state.totalAttempts, 0);
});

test("hint penalty at the boundary ends once without subsequent answer mutations", () => {
  const f = fixture();
  f.ctx.startGame();
  f.ctx.useHint();
  assert.equal(f.screen(), "lose");
  const after = snapshot(f.state);
  f.ctx.useHint();
  f.submit("Japan");
  f.ctx.endGame(true);
  assert.equal(snapshot(f.state), after);
});

test("duplicate submissions do not change score, attempts or streak", () => {
  const f = fixture("typing", "practice");
  f.ctx.startGame();
  f.submit("Japan");
  f.release();
  const after = snapshot(f.state);
  f.submit("Japan");
  assert.equal(snapshot(f.state), after);
});

for (const type of ["typing", "flag", "capital", "locate"]) {
  test(`${type} completes a two-question practice game exactly once`, () => {
    const f = fixture(type, "practice");
    f.ctx.startGame();
    for (const region of ["Japan", "India"]) {
      if (type === "locate") f.click(region);
      else {
        const answer =
          type === "capital" ? f.ctx.CAPITALS.world[region] : region;
        f.submit(answer);
        f.release();
      }
    }
    assert.equal(f.screen(), "win");
    assert.equal(f.state.score, 2);
    assert.equal(f.state.totalAttempts, 2);
    assert.equal(f.state.bestStreak, 2);
    const after = snapshot(f.state);
    f.ctx.endGame(false, "time");
    assert.equal(snapshot(f.state), after);
  });
}

test("abandoned timer callback cannot affect a restarted session", () => {
  const f = fixture();
  f.ctx.startGame();
  const oldTick = [...f.timers.values()][0];
  f.ctx.showScreen("start");
  f.ctx.startGame();
  const before = snapshot(f.state);
  f.setNow(20000);
  oldTick();
  assert.equal(snapshot(f.state), before);
  assert.equal(f.screen(), "game");
});

test("old locate listener cannot apply an answer to a later session", () => {
  const f = fixture("locate");
  f.ctx.startGame();
  const oldListener = [...f.docs[0].handlers][0];
  assert.equal(typeof oldListener, "function");
  f.ctx.showScreen("start");
  f.replaceDoc();
  f.ctx.startGame();
  const before = snapshot(f.state);
  oldListener({ target: { tagName: "path", name: "India" } });
  assert.equal(snapshot(f.state), before);
});

test("each mode times out without accepting a later answer; locate can lose its last life", () => {
  for (const type of ["typing", "flag", "capital", "locate"]) {
    const f = fixture(type);
    f.ctx.startGame();
    f.setNow(10000);
    [...f.timers.values()][0]();
    assert.equal(f.screen(), "lose");
    const after = snapshot(f.state);
    if (type === "locate") f.click("Japan");
    else f.submit(type === "capital" ? "Tokyo" : "Japan");
    assert.equal(snapshot(f.state), after);
  }
  const f = fixture("locate");
  f.ctx.startGame();
  const tick = [...f.timers.values()][0];
  f.setNow(9999);
  f.click("India");
  assert.equal(f.screen(), "lose");
  assert.match(f.ctx.display.loseReason.textContent, /lives/);
  assert.equal(f.state.livesLeft, 0);
  const afterLifeLoss = snapshot(f.state);
  f.setNow(10000);
  tick();
  assert.match(f.ctx.display.loseReason.textContent, /lives/);
  assert.equal(snapshot(f.state), afterLifeLoss);
});

test("a correct final answer before the deadline wins even if its old timer later fires", () => {
  const f = fixture();
  f.ctx.CURRENT_REGIONS = ["Japan"];
  f.ctx.startGame();
  const tick = [...f.timers.values()][0];
  f.setNow(9999);
  f.submit("Japan");
  assert.equal(f.screen(), "win");
  const after = snapshot(f.state);
  f.setNow(10000);
  tick();
  f.ctx.endGame(false, "time");
  assert.equal(snapshot(f.state), after);
});

test("repeated game endings preserve the first result and screen", () => {
  const f = fixture();
  f.ctx.startGame();
  f.ctx.endGame(false, "lives");
  const after = snapshot(f.state);
  const reason = f.ctx.display.loseReason.textContent;
  f.ctx.endGame(false, "time");
  f.ctx.endGame(true);
  assert.equal(f.screen(), "lose");
  assert.equal(f.ctx.display.loseReason.textContent, reason);
  assert.equal(snapshot(f.state), after);

  const winner = fixture();
  winner.ctx.CURRENT_REGIONS = ["Japan"];
  winner.ctx.startGame();
  winner.submit("Japan");
  const result = [
    winner.ctx.display.finalTime.textContent,
    winner.ctx.display.finalAccuracy.textContent,
  ];
  winner.ctx.endGame(false, "time");
  winner.ctx.endGame(true);
  assert.equal(winner.screen(), "win");
  assert.deepEqual(
    [
      winner.ctx.display.finalTime.textContent,
      winner.ctx.display.finalAccuracy.textContent,
    ],
    result,
  );
});

test("old feedback callback cannot restore map color in a new session", () => {
  const ui = fs.readFileSync("js/ui.js", "utf8");
  const section = ui.slice(
    ui.indexOf("function flashRed("),
    ui.indexOf("function resetMapStyles()"),
  );
  const tasks = [],
    path = { style: { fill: "old" } },
    state = { sessionId: 1, phase: "active" };
  const ctx = {
    gameState: state,
    getPathByName: () => path,
    document: { getElementById: () => null },
    setTimeout(fn) {
      tasks.push(fn);
    },
  };
  vm.runInNewContext(section, ctx);
  ctx.flashRed(null);
  state.sessionId++;
  path.style.fill = "new";
  tasks.forEach((fn) => fn());
  assert.equal(path.style.fill, "new");
});

test("rapid repeated locate setup keeps a single current listener", () => {
  const f = fixture("locate", "practice");
  f.ctx.startGame();
  const doc = f.docs[0];
  const first = [...doc.handlers][0];
  f.ctx.setupLocateMode();
  f.ctx.setupLocateMode();
  assert.equal(doc.handlers.size, 1);
  assert.notEqual([...doc.handlers][0], first);
  f.state.gameType = "typing";
  const before = snapshot(f.state);
  first({ target: { tagName: "path", name: "India" } });
  assert.equal(snapshot(f.state), before);
});
