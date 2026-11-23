/*
 * MapMaster sound effects.
 *
 * All effects are authored here with the browser Web Audio API; no audio files,
 * remote requests, or audio library are used. Audio is purely supplementary.
 */
(function () {
  const STORAGE_KEY = "mapmaster-sound-v1";
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const cooldowns = { correct: 80, incorrect: 120, tick: 850, streak: 700, complete: 900, achievement: 1100, level: 1100 };
  const patterns = {
    correct: { wave: "sine", notes: [659, 880], duration: 0.1, volume: 0.045 },
    incorrect: { wave: "triangle", notes: [220, 185], duration: 0.13, volume: 0.035 },
    tick: { wave: "square", notes: [740], duration: 0.035, volume: 0.018 },
    streak: { wave: "sine", notes: [523, 659, 784], duration: 0.1, volume: 0.035 },
    complete: { wave: "triangle", notes: [523, 659, 784, 1047], duration: 0.14, volume: 0.04 },
    achievement: { wave: "sine", notes: [784, 988, 1175], duration: 0.12, volume: 0.035 },
    level: { wave: "triangle", notes: [392, 523, 784], duration: 0.13, volume: 0.035 },
  };
  let context = null;
  let enabled = true;
  let lastPlayed = new Map();
  let lastSoundAt = -Infinity;

  try {
    enabled = window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch (_) {
    // Storage can be denied; sound remains controllable for the current visit.
  }

  function savePreference() {
    try {
      window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch (_) {
      // Persistence is optional; never make settings unusable when it is absent.
    }
  }

  function getContext() {
    if (!AudioContextCtor) return null;
    if (!context || context.state === "closed") {
      try {
        context = new AudioContextCtor();
      } catch (_) {
        context = null;
      }
    }
    return context;
  }

  function play(event) {
    const pattern = patterns[event];
    if (!enabled || !pattern || !AudioContextCtor) return;
    const nowMs = performance.now();
    if (nowMs - lastSoundAt < 180) return;
    if (nowMs - (lastPlayed.get(event) || -Infinity) < cooldowns[event]) return;
    lastPlayed.set(event, nowMs);
    lastSoundAt = nowMs;

    const audio = getContext();
    if (!audio) return;
    // A rejected resume is expected before a user gesture. It is intentionally silent.
    if (audio.state === "suspended") audio.resume().catch(() => {});
    try {
      const start = audio.currentTime + 0.005;
      pattern.notes.forEach((frequency, index) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const noteStart = start + index * 0.075;
        const noteEnd = noteStart + pattern.duration;
        oscillator.type = pattern.wave;
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(pattern.volume, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd + 0.01);
      });
    } catch (_) {
      // Unsupported or interrupted audio must never affect game input or timing.
    }
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    soundEnabled = enabled;
    savePreference();
    return enabled;
  }

  window.MapMasterAudio = {
    isSupported: () => Boolean(AudioContextCtor),
    isEnabled: () => enabled,
    setEnabled,
    play,
  };

  // Compatibility names used by CP04–CP08. Events stay semantic, not asset-based.
  window.soundEnabled = enabled;
  window.sfxCorrect = "correct";
  window.sfxWrong = "incorrect";
  window.sfxStreak = "streak";
  window.sfxTick = "tick";
  window.sfxWin = "complete";
  window.sfxLose = "incorrect";
})();

let soundEnabled = window.MapMasterAudio.isEnabled();
const sfxCorrect = window.sfxCorrect;
const sfxWrong = window.sfxWrong;
const sfxStreak = window.sfxStreak;
const sfxTick = window.sfxTick;
const sfxWin = window.sfxWin;
const sfxLose = window.sfxLose;
let lastTickPlayed = -1;

function playSound(event) {
  window.MapMasterAudio?.play(event);
}
