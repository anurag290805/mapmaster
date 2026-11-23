const test = require("node:test");
const assert = require("node:assert/strict");
const {
  shouldShowOnboarding,
  safeRead,
  safeWrite,
} = require("../js/navigation-core.js");
test("onboarding runs once per session even without storage", () => {
  assert.equal(shouldShowOnboarding(null, false), true);
  assert.equal(shouldShowOnboarding("done", false), false);
  assert.equal(shouldShowOnboarding(null, true), false);
});
test("storage failures fall back without throwing", () => {
  const denied = {
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("denied");
    },
  };
  assert.equal(safeRead(denied, "x"), null);
  assert.equal(safeWrite(denied, "x", "done"), false);
  let value;
  const ok = {
    getItem() {
      return value;
    },
    setItem(k, v) {
      value = v;
    },
  };
  assert.equal(safeWrite(ok, "x", "done"), true);
  assert.equal(safeRead(ok, "x"), "done");
});
test("a pending introduction is not forced again after a reload", () => {
  assert.equal(shouldShowOnboarding("pending", false), false);
  assert.equal(shouldShowOnboarding("done", false), false);
});
test("screen transition stays exclusive and stops an exited game", () => {
  const fs = require("node:fs"),
    vm = require("node:vm");
  const src = fs.readFileSync("js/ui.js", "utf8");
  const begin = src.indexOf("function showScreen("),
    end = src.indexOf(
      "/* ============================================================\n   HUD + PROGRESS",
      begin,
    );
  assert.ok(begin >= 0 && end > begin);
  function screen(hidden) {
    const classes = new Set(hidden ? ["hidden"] : []);
    return {
      classList: {
        contains: (x) => classes.has(x),
        add: (x) => classes.add(x),
        remove: (...xs) => xs.forEach((x) => classes.delete(x)),
      },
      setAttribute() {},
      focus() {},
    };
  }
  const screens = {
    start: screen(false),
    play: screen(true),
    scope: screen(true),
    game: screen(true),
  };
  let stops = 0,
    removed = 0;
  const ctx = {
    screens,
    previousScreen: "",
    clearTimer() {
      stops++;
    },
    getSvgDoc() {
      return {
        removeEventListener() {
          removed++;
        },
      };
    },
    handleLocateClick() {},
    gameState: { startTime: 1 },
    updateBreadcrumb() {},
    window: { scrollTo() {} },
    document: { dispatchEvent() {} },
    CustomEvent: class {
      constructor(name, opts) {
        this.detail = opts.detail;
      }
    },
  };
  vm.createContext(ctx);
  vm.runInContext(src.slice(begin, end), ctx);
  ctx.showScreen("play");
  ctx.showScreen("scope");
  ctx.showScreen("game");
  ctx.showScreen("start");
  assert.deepEqual(
    Object.keys(screens).filter(
      (k) => !screens[k].classList.contains("hidden"),
    ),
    ["start"],
  );
  assert.equal(stops, 1);
  assert.equal(removed, 1);
  assert.equal(ctx.gameState.startTime, null);
});

function navigationWithDeniedStorage() {
  const vm = require("node:vm");
  const fs = require("node:fs");
  function element() {
    const handlers = {};
    return {
      handlers,
      dataset: {},
      isConnected: true,
      open: false,
      textContent: "",
      classList: { contains: () => true, add() {}, remove() {}, toggle() {} },
      addEventListener(type, fn) {
        (handlers[type] ||= []).push(fn);
      },
      dispatch(type, extra = {}) {
        for (const fn of handlers[type] || [])
          fn({ currentTarget: this, preventDefault() {}, ...extra });
      },
      click() {
        this.dispatch("click");
      },
      setAttribute() {},
      removeAttribute() {},
      focus() {},
      querySelectorAll() {
        return [];
      },
      appendChild() {},
      showModal() {
        if (this.open) throw Error("already open");
        this.open = true;
      },
      close() {
        this.open = false;
        this.dispatch("close");
      },
    };
  }
  const elements = new Map();
  const get = (selector) => {
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  };
  const handlers = {};
  const doc = {
    querySelector: get,
    querySelectorAll: () => [],
    createElement: element,
    addEventListener(type, fn) {
      (handlers[type] ||= []).push(fn);
    },
    dispatch(type, event) {
      for (const fn of handlers[type] || []) fn(event);
    },
  };
  const denied = {
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("denied");
    },
  };
  const window = {
    localStorage: denied,
    sessionStorage: denied,
    MapMasterNavigation: require("../js/navigation-core.js"),
  };
  const context = {
    document: doc,
    window,
    CONTINENT_KEYS: [],
    screens: { game: element() },
    buttons: {},
    darkMode: false,
    soundEnabled: true,
    themeToggleBtn: element(),
    soundToggleBtn: element(),
  };
  vm.runInNewContext(fs.readFileSync("js/navigation.js", "utf8"), context);
  return { get, doc };
}

test("denied storage still presents onboarding once and allows skip and Help replay", () => {
  const { get, doc } = navigationWithDeniedStorage();
  const guide = get("#onboardingDialog");
  assert.equal(guide.open, true);
  get("#guideSkip").click();
  assert.equal(guide.open, false);
  doc.dispatch("mapmaster:screen", { detail: { screen: "help" } });
  assert.equal(guide.open, false);
  get("#replayGuide").click();
  assert.equal(guide.open, true);
  get("#skipGuide").click();
  assert.equal(guide.open, false);
});

test("denied storage allows guide completion and replay from Settings", () => {
  const { get, doc } = navigationWithDeniedStorage();
  const guide = get("#onboardingDialog");
  assert.equal(guide.open, true);
  for (let i = 0; i < 4; i++) get("#guideNext").click();
  assert.equal(guide.open, false);
  doc.dispatch("mapmaster:screen", { detail: { screen: "play" } });
  assert.equal(guide.open, false);
  get("#openSettings").click();
  get("#settingsGuide").click();
  assert.equal(guide.open, true);
  get("#guideSkip").click();
  assert.equal(guide.open, false);
});

test("repeated starts and navigation leave at most one live challenge timer", () => {
  const fs = require("node:fs"),
    vm = require("node:vm");
  const game = fs.readFileSync("js/game.js", "utf8"),
    ui = fs.readFileSync("js/ui.js", "utf8");
  const section = (s, from, to) => {
    const begin = s.indexOf(from),
      end = s.indexOf(to, begin);
    assert.ok(begin >= 0 && end > begin, `could not isolate ${from}`);
    return s.slice(begin, end);
  };
  const classes = (hidden) => {
    const set = new Set(hidden ? ["hidden"] : []);
    return {
      contains: (x) => set.has(x),
      add: (x) => set.add(x),
      remove: (...xs) => xs.forEach((x) => set.delete(x)),
      toggle() {},
    };
  };
  const screen = (hidden) => ({
    classList: classes(hidden),
    setAttribute() {},
    focus() {},
  });
  const active = new Map();
  let nextId = 1,
    now = 0;
  const screens = {
    start: screen(false),
    game: screen(true),
    play: screen(true),
  };
  const gameState = {
    gameType: "typing",
    gameMode: "challenge",
    timeLeft: 120,
    startTime: null,
    timerInterval: null,
  };
  const ctx = {
    screens,
    gameState,
    CURRENT_REGIONS: ["Japan"],
    performance: { now: () => now },
    MapMasterGameplay: {
      remainingSeconds: (deadline, time) =>
        Math.max(0, Math.ceil((deadline - time) / 1000)),
    },
    previousScreen: "",
    lastTickPlayed: -1,
    inputSection: screen(true),
    locatePrompt: null,
    flagContainer: null,
    capitalPrompt: null,
    stateInput: {},
    resetGame() {
      ctx.clearTimer();
      gameState.timeLeft = 120;
    },
    updateHUD() {},
    regionLabel() {
      return "Countries";
    },
    getSvgDoc() {
      return null;
    },
    handleLocateClick() {},
    updateBreadcrumb() {},
    window: {
      scrollTo() {},
      MapMasterGameplay: {
        remainingSeconds: (deadline, time) =>
          Math.max(0, Math.ceil((deadline - time) / 1000)),
      },
    },
    document: {
      getElementById() {
        return null;
      },
      dispatchEvent() {},
    },
    CustomEvent: class {},
    setInterval(fn) {
      const id = nextId++;
      active.set(id, fn);
      return id;
    },
    clearInterval(id) {
      active.delete(id);
    },
    playSound() {},
    sfxTick: null,
    endGame() {},
    clearDailyContext() {},
  };
  vm.createContext(ctx);
  vm.runInContext(
    section(
      ui,
      "function clearTimer()",
      "/* ============================================================\n   CONFETTI",
    ),
    ctx,
  );
  vm.runInContext(
    section(
      ui,
      "function showScreen(",
      "/* ============================================================\n   HUD + PROGRESS",
    ),
    ctx,
  );
  vm.runInContext(
    section(
      game,
      "function syncDeadline()",
      "/* ============================================================\n   RESET",
    ),
    ctx,
  );
  vm.runInContext(
    section(
      game,
      "function startGame(",
      "/* ============================================================\n   END GAME",
    ),
    ctx,
  );
  ctx.startGame();
  ctx.startGame();
  assert.equal(active.size, 1);
  now += 1000;
  [...active.values()][0]();
  assert.equal(gameState.timeLeft, 119);
  ctx.showScreen("play");
  assert.equal(active.size, 0);
  assert.equal(gameState.timerInterval, null);
  ctx.showScreen("start");
  ctx.startGame();
  ctx.startGame();
  assert.equal(active.size, 1);
  assert.equal(gameState.timeLeft, 120);
  ctx.showScreen("start");
  assert.equal(active.size, 0);
});
