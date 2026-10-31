(() => {
  const theme = document.querySelector('#showcase-theme');
  theme.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    theme.setAttribute('aria-pressed', String(dark));
    theme.textContent = dark ? 'Light appearance' : 'Dark appearance';
  });
  const dialog = document.querySelector('#demo-dialog');
  const opener = document.querySelector('#open-dialog');
  opener.addEventListener('click', () => dialog.showModal());
  dialog.addEventListener('close', () => opener.focus());
  const toast = document.querySelector('#demo-toast');
  const notices = MapMasterNotifications.create(toast, document.querySelector('#live-region'));
  const card = document.querySelector('#demo-card');
  card.addEventListener('click', () => card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true')));
  const tip = document.querySelector('#tooltip-trigger');
  const tipText = document.querySelector('#tip-text');
  function closeTip() { tipText.hidden = true; tip.setAttribute('aria-expanded', 'false'); }
  tip.addEventListener('click', () => { const opening = tipText.hidden; tipText.hidden = !opening; tip.setAttribute('aria-expanded', String(opening)); });
  tip.addEventListener('keydown', event => { if (event.key === 'Escape') closeTip(); });
  document.querySelector('#show-toast').addEventListener('click', () => {
    notices.show('Example notification: saved for later.');
  });
  document.querySelector('#dismiss-toast').addEventListener('click', () => { notices.dismiss(); document.querySelector('#show-toast').focus(); });
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function select(tab) {
    tabs.forEach(t => { const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; document.getElementById(t.getAttribute('aria-controls')).hidden = !active; });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next]); tabs[next].focus();
    });
  });
})();
