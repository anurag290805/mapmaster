/* Small, testable policy for the CP03 guest onboarding preference. */
(function (root) {
  function safeRead(storage, key) { try { return storage && storage.getItem(key); } catch (_) { return null; } }
  function safeWrite(storage, key, value) { try { storage.setItem(key, value); return true; } catch (_) { return false; } }
  function shouldShowOnboarding(value, seenThisSession) { return value !== 'done' && value !== 'pending' && !seenThisSession; }
  const api = { safeRead, safeWrite, shouldShowOnboarding };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MapMasterNavigation = api;
})(typeof window !== 'undefined' ? window : globalThis);
