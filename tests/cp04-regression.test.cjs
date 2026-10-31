const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function runtime(type) {
  const state = { gameType: type, gameMode: 'challenge', guessedStates: [], guessedUTs: [], missedRegions: [], score: 0, bonusPoints: 0, totalAttempts: 0, currentStreak: 0, bestStreak: 0, livesLeft: 0, currentTarget: 'Japan', phase: 'active' };
  const ctx = { gameState: state, stateInput: {value: ''}, CURRENT_REGIONS: ['Afghanistan', 'Japan'], currentMapKey: 'world', INDIA_UTS: [], FLAGS: { Japan: '🇯🇵' }, CAPITALS: { world: { Japan: 'Tokyo' } }, normalize: s => s.toLowerCase().replace(/\s+/g, ''), setTimeout() {}, colorState() {}, showFeedback() {}, playSound() {}, onStreakUpdate() {}, updateHUD() {}, checkWin() {}, trackMiss() {}, endGame() { ctx.ended++; }, ended: 0, sfxCorrect: null, sfxWrong: null, regionLabel: () => 'Countries' };
  const ts = require('typescript');
  const source = fs.readFileSync('src/shared/gameplay.ts', 'utf8');
  const compiled = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2022}}).outputText;
  const rules = {exports:{}};
  vm.runInNewContext(compiled, {exports:rules.exports});
  ctx.MapMasterGameplay = rules.exports;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('js/modes.js', 'utf8'), ctx);
  return ctx;
}

test('I-01: partial input cannot score the same question repeatedly', () => {
  const ctx = runtime('typing');
  for (let i = 0; i < 2; i++) { ctx.stateInput.value = 'a'; ctx.handleTypingSubmit(); vm.runInContext('isSubmitting = false', ctx); }
  assert.equal(ctx.gameState.score, 0);
  assert.equal(ctx.gameState.guessedStates.length, 0);
});

for (const type of ['flag', 'capital']) {
  test(`I-13: incorrect ${type} challenge answer does not consume lives or end game`, () => {
    const ctx = runtime(type);
    if (type === 'flag') ctx.handleFlagSubmit('wrong', 'wrong');
    else ctx.handleCapitalSubmit('wrong', 'wrong');
    assert.equal(ctx.ended, 0);
    assert.equal(ctx.gameState.livesLeft, 0);
    assert.equal(ctx.gameState.totalAttempts, 1);
  });
}

test('expired deadline ends once and later actions are rejected', () => {
  const game = fs.readFileSync('js/game.js', 'utf8');
  const timerRules = game.slice(game.indexOf('function syncDeadline()'), game.indexOf('function startTimer()'));
  let endings = 0;
  const state = { gameMode: 'challenge', phase: 'active', deadline: 1000, timeLeft: 1, reviewMode: false };
  const ctx = { gameState: state, performance: { now: () => 1000 }, MapMasterGameplay: { remainingSeconds: (deadline, now) => Math.max(0, Math.ceil((deadline - now) / 1000)) }, updateHUD() {}, endGame(win, reason) { assert.equal(win, false); assert.equal(reason, 'time'); state.phase = 'ended'; endings++; } };
  vm.runInNewContext(timerRules, ctx);
  assert.equal(ctx.canPlay(), false);
  assert.equal(ctx.canPlay(), false);
  assert.equal(endings, 1);
});

test('duplicate guessed identities cannot cause a false win', () => {
  const game = fs.readFileSync('js/game.js', 'utf8');
  const section = game.slice(game.indexOf('function checkWin()'), game.indexOf('/* ============================================================\n   STREAK'));
  let wins = 0;
  const ctx = { gameState: { gameType: 'typing', guessedStates: ['Japan', 'Japan'] }, CURRENT_REGIONS: ['Japan', 'India'], endGame() { wins++; } };
  vm.runInNewContext(section, ctx);
  ctx.checkWin();
  assert.equal(wins, 0);
  ctx.gameState.guessedStates.push('India');
  ctx.checkWin();
  assert.equal(wins, 1);
});

for (const type of ['flag', 'capital']) {
  test(`a correct ${type} answer scores and advances the streak once`, () => {
    const ctx = runtime(type);
    if (type === 'flag') ctx.handleFlagSubmit('Japan', 'japan');
    else ctx.handleCapitalSubmit('Tokyo', 'tokyo');
    assert.equal(ctx.gameState.score, 1);
    assert.equal(ctx.gameState.totalAttempts, 1);
    assert.equal(ctx.gameState.currentStreak, 1);
    assert.deepEqual(Array.from(ctx.gameState.guessedStates), ['Japan']);
  });
}

test('result animation from an old session cannot update a new session', () => {
  const ui = fs.readFileSync('js/ui.js', 'utf8');
  const section = ui.slice(ui.indexOf('function animateValue('), ui.indexOf('/* ============================================================\n   MAP PINS'));
  const pending = [];
  const state = { sessionId: 1 };
  const ctx = { gameState: state, requestAnimationFrame(fn) { pending.push(fn); } };
  vm.runInNewContext(section, ctx);
  const display = { textContent: 'new session' };
  ctx.animateValue(display, 0, 100, 800, String);
  state.sessionId = 2;
  pending.shift()(100);
  assert.equal(display.textContent, 'new session');
  assert.equal(pending.length, 0);
});

test('a wrong-answer flash cannot overwrite review colors after the session ends', () => {
  const ui = fs.readFileSync('js/ui.js', 'utf8');
  const section = ui.slice(ui.indexOf('function flashRed('), ui.indexOf('function resetMapStyles()'));
  const tasks = [];
  const path = {style: {fill: 'original'}};
  const state = {sessionId: 1, phase: 'active'};
  const ctx = {gameState: state, getPathByName: () => path, document: {getElementById: () => null}, setTimeout(fn) {tasks.push(fn);}};
  vm.runInNewContext(section, ctx);
  ctx.flashRed(null);
  state.phase = 'ended';
  path.style.fill = 'review';
  tasks.forEach(fn => fn());
  assert.equal(path.style.fill, 'review');
});
