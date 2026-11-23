/* MapMaster CP08 | Local, versioned progression adapter and safe dashboard. */
(function () {
  const STORAGE_KEY = "mapmaster-progression-v1";
  const ACHIEVEMENTS = {
    "first-finish": ["First Finish", "Win any completed game."],
    "timed-finisher": ["Against the Clock", "Win a timed challenge."],
    "perfect-recall": ["Perfect Recall", "Win with 100% accuracy."],
    "five-in-a-row": ["Five in a Row", "Reach a streak of five."],
    "sprint-starter": ["Sprint Starter", "Win a Capital or Flag Sprint."],
    explorer: ["Explorer", "Complete three different game types."],
  };

  function safeLoad() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function safeSave(state) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  function safeRemove() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // Private or unavailable storage is a supported no-persistence state.
    }
  }

  function notifySaveChange() {
    document.dispatchEvent(new CustomEvent("mapmaster:local-save-changed"));
  }

  function textElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    return element;
  }

  function formatRecordKey(key) {
    const [type, map, mode, time, lives] = key.split("|");
    const label = type === "flagChoice" ? "Flag Sprint" : type === "capitalChoice" ? "Capital Sprint" : type;
    const bits = [label, map, mode];
    if (time !== "practice") bits.push(`${time}s`);
    if (lives !== "none") bits.push(`${lives} life${lives === "1" ? "" : "s"}`);
    return bits.join(" · ");
  }

  function render() {
    if (!state || !core) return;
    const level = core.levelProgress(state.totalXp);
    const levelNode = document.getElementById("progressLevel");
    const xpNode = document.getElementById("progressXp");
    const meter = document.getElementById("progressXpMeter");
    const bar = document.getElementById("progressXpBar");
    const summary = document.getElementById("progressSummary");
    const achievements = document.getElementById("achievementList");
    const records = document.getElementById("personalBestList");
    if (!levelNode || !xpNode || !meter || !bar || !summary || !achievements || !records) return;

    levelNode.textContent = `Level ${level.level}`;
    xpNode.textContent = `${state.totalXp} XP`;
    // Keep XP feedback on the compositor: the meter shell remains stable while
    // its fill scales from the left rather than triggering a layout animation.
    bar.style.setProperty("--mm-progress", String(level.current / 100));
    meter.setAttribute("aria-valuenow", String(level.current));
    meter.setAttribute("aria-valuetext", `${level.current} of ${level.needed} XP toward level ${level.level + 1}`);
    summary.textContent = state.stats.completedSessions
      ? `${level.needed - level.current} XP to level ${level.level + 1} · ${state.stats.completedSessions} completed session${state.stats.completedSessions === 1 ? "" : "s"}.`
      : "Start with Daily Easy: five capital questions toward your first finish.";

    achievements.replaceChildren();
    if (!state.achievements.length) {
      achievements.append(textElement("li", "progress-empty", "No achievements yet. Finish a game to unlock your first one."));
    } else {
      state.achievements.forEach((id) => {
        const detail = ACHIEVEMENTS[id];
        if (!detail) return;
        const item = textElement("li", "achievement-item", "");
        item.append(textElement("strong", "", detail[0]), textElement("span", "", detail[1]));
        achievements.append(item);
      });
    }

    records.replaceChildren();
    const entries = Object.entries(state.records);
    if (!entries.length) {
      records.append(textElement("li", "progress-empty", "No personal bests yet. Completed games will appear here."));
    } else {
      entries.sort(([a], [b]) => a.localeCompare(b)).forEach(([key, record]) => {
        const item = textElement("li", "record-item", "");
        const fastest = record.fastestWinSeconds == null ? "—" : `${record.fastestWinSeconds}s`;
        item.append(
          textElement("strong", "", formatRecordKey(key)),
          textElement("span", "", `Best score ${record.highestScore} · Accuracy ${record.highestAccuracy}% · Fastest win ${fastest}`),
        );
        records.append(item);
      });
    }
  }

  let core = null;
  let state = null;
  function initialise() {
    core = window.MapMasterProgressionCore;
    if (!core) return;
    state = core.migrateProgress(safeLoad());
    window.MapMasterProgression = {
      recordTerminalResult(result) {
        const applied = core.applyTerminalResult(state, result);
        state = applied.state;
        if (applied.award.eligible && !applied.award.duplicate) {
          safeSave(state);
          notifySaveChange();
        }
        render();
        return applied.award;
      },
      getState() { return state; },
      replaceState(next) {
        state = core.migrateProgress(next);
        safeSave(state);
        render();
        notifySaveChange();
      },
      reset() {
        state = core.createInitialProgress();
        safeRemove();
        render();
        notifySaveChange();
      },
    };
    document.getElementById("resetProgressBtn")?.addEventListener("click", () => window.MapMasterProgression.reset());
    render();
  }

  if (window.MapMasterProgressionCore) initialise();
  else document.addEventListener("mapmaster:progression-ready", initialise, { once: true });
})();
