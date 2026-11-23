/// <reference types="vite/client" />

// CP10 keeps offline support intentionally narrow: production builds cache the
// generated same-origin app shell only. Development never registers a worker,
// so HMR and local test sessions remain unaffected.
function registerOfflineShell() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const scope = new URL(import.meta.env.BASE_URL, window.location.href)
    .pathname;
  void navigator.serviceWorker.register(`${scope}service-worker.js`, { scope });
}

if (document.readyState === "complete") registerOfflineShell();
else window.addEventListener("load", registerOfflineShell, { once: true });
