/* CP03 navigation and guest onboarding. Game logic remains in existing modules. */
(() => {
  const menu = document.querySelector('#menuToggle');
  const nav = document.querySelector('#primaryNav');
  const settings = document.querySelector('#settingsDialog');
  const guide = document.querySelector('#onboardingDialog');
  const policy = window.MapMasterNavigation;
  const key = 'mapmaster-onboarding-v1';
  let storage = null, sessionStore = null;
  try { storage = window.localStorage; } catch (_) { /* storage can be denied */ }
  try { sessionStore = window.sessionStorage; } catch (_) { /* storage can be denied */ }
  let guideSeen = false, guideIndex = 0, guideReturn = null, pendingMode = null;
  const steps = [
    ['Welcome, explorer.', 'MapMaster is a geography game for curious minds. Play as a guest and explore at your own pace.'],
    ['Choose a game.', 'Recall names, identify flags or capitals, or find a place on the map. Then choose the world, a continent, or a country.'],
    ['Make it your journey.', 'Practice has no countdown. Challenge adds a timer; locate also uses lives. Hints can cost time in challenge.'],
    ['Ready to explore?', 'Correct answers earn points and a streak. Your theme can be saved on this device; game progress is not saved yet. Some maps and questions have known limitations.']
  ];
  function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); }
  menu.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(open)); });
  function leaveGame() {
    if (!screens.game.classList.contains('hidden')) {
      if (!window.confirm('Leave this game? Your current session will end.')) return false;
      clearTimer(); gameState.startTime = null;
    }
    return true;
  }
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => {
    const target = button.dataset.go;
    if (!leaveGame()) return;
    pendingMode = null; closeMenu(); showScreen(target);
  }));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    pendingMode = button.dataset.mode; closeMenu(); showScreen('scope');
  }));
  const quick = document.querySelector('#continentQuick');
  CONTINENT_KEYS.forEach(key => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'region-link';
    button.textContent = `${MAPS[key].name} · ${MAPS[key].regions.length}`;
    button.addEventListener('click', () => { pendingMode = null; applyMap(key); resetSetupSelections(); showScreen('setup'); });
    quick.appendChild(button);
  });
  const modeButtons = { typing: buttons.typingMode, locate: buttons.locateMode, flag: buttons.flagMode, capital: buttons.capitalMode };
  document.addEventListener('mapmaster:screen', e => {
    const name = e.detail.screen;
    const active = ['play','scope','progress','help'].includes(name) ? name : (['countrySelect','continentSelect'].includes(name) ? 'scope' : (['setup','challenge','game','win','lose'].includes(name) ? 'play' : 'start'));
    nav.querySelectorAll('[data-go]').forEach(b => { if (b.dataset.go === active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    if (name === 'setup') {
      document.querySelector('#setupNotice').textContent = '';
      document.querySelectorAll('#gameModeSection button, #difficultySection button').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('selected'))));
    }
    if (name === 'setup') document.querySelector('#setupNotice').textContent = '';
    if (name === 'setup') document.querySelector('#setupNotice').textContent = ['northAmerica','southAmerica'].includes(currentMapKey) ? 'This region’s map currently fails to load; locate play is not available reliably.' : '';
    if (name === 'setup' && pendingMode) {
      const selected = modeButtons[pendingMode]; pendingMode = null;
      if (selected && !selected.disabled) selected.click();
      else document.querySelector('#setupNotice').textContent = 'That game is not available for this scope. Please choose another game.';
    }
    if (name === 'setup') document.querySelectorAll('#gameModeSection button, #difficultySection button').forEach(b => b.setAttribute('aria-pressed',String(b.classList.contains('selected'))));
  });
  document.querySelectorAll('#gameModeSection button, #difficultySection button, .country-btn, .continent-btn').forEach(button => button.addEventListener('click', () => {
    const group = button.parentElement; group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed',String(b.classList.contains('selected'))));
  }));
  function syncSettings() {
    const t=document.querySelector('#settingsTheme'), s=document.querySelector('#settingsSound');
    t.textContent = darkMode ? 'Dark · switch to light' : 'Light · switch to dark';
    s.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    s.setAttribute('aria-pressed',String(soundEnabled));
  }
  let settingsReturn = null;
  document.querySelector('#openSettings').addEventListener('click', e => { settingsReturn=e.currentTarget; closeMenu(); syncSettings(); settings.showModal(); });
  document.querySelector('[data-close="settingsDialog"]').addEventListener('click', () => settings.close());
  settings.addEventListener('close', () => { if (settingsReturn && settingsReturn.isConnected) settingsReturn.focus(); });
  document.querySelector('#settingsTheme').addEventListener('click', () => { themeToggleBtn.click(); syncSettings(); });
  document.querySelector('#settingsSound').addEventListener('click', () => { soundToggleBtn.click(); syncSettings(); });
  document.querySelector('#settingsHelp').addEventListener('click', () => { settings.close(); if (leaveGame()) showScreen('help'); });
  function renderGuide() {
    document.querySelector('#guideCount').textContent = `STEP ${guideIndex + 1} OF ${steps.length}`;
    document.querySelector('#onboardTitle').textContent = steps[guideIndex][0];
    document.querySelector('#guideText').textContent = steps[guideIndex][1];
    document.querySelector('#guideBack').disabled = guideIndex === 0;
    document.querySelector('#guideNext').textContent = guideIndex === steps.length - 1 ? 'Start exploring →' : 'Continue →';
  }
  function openGuide(source) { guideReturn = source; guideIndex = 0; renderGuide(); guide.showModal(); }
  function finishGuide() { guideSeen = true; policy.safeWrite(storage, key, 'done'); policy.safeWrite(sessionStore, key, 'done'); guide.close(); }
  document.querySelector('#replayGuide').addEventListener('click', e => openGuide(e.currentTarget));
  document.querySelector('#settingsGuide').addEventListener('click', () => { settings.close(); openGuide(document.querySelector('#openSettings')); });
  document.querySelector('#guideNext').addEventListener('click', () => { if (guideIndex === steps.length - 1) finishGuide(); else { guideIndex++; renderGuide(); } });
  document.querySelector('#guideBack').addEventListener('click', () => { if (guideIndex) { guideIndex--; renderGuide(); } });
  document.querySelector('#skipGuide').addEventListener('click', finishGuide);
  document.querySelector('#guideSkip').addEventListener('click', finishGuide);
  guide.addEventListener('cancel', event => { event.preventDefault(); finishGuide(); });
  guide.addEventListener('close', () => { if (guideReturn && guideReturn.isConnected) guideReturn.focus(); });
  const prior = policy.safeRead(storage,key) || policy.safeRead(sessionStore,key);
  // Remember the attempt in memory even when neither storage mechanism is available.
  if (policy.shouldShowOnboarding(prior, guideSeen)) {
    guideSeen = true;
    if (!policy.safeWrite(storage, key, 'pending')) policy.safeWrite(sessionStore, key, 'pending');
    openGuide(document.querySelector('.site-brand'));
  }
})();
