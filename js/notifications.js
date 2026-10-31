/* Small, isolated notification lifecycle; no game state or HTML injection. */
var MapMasterNotifications = Object.freeze({
  create(element, liveRegion) {
    let timer = null;
    function dismiss() {
      if (timer !== null) clearTimeout(timer);
      timer = null;
      element.hidden = true;
    }
    function show(message, duration = 0) {
      dismiss();
      element.hidden = false;
      liveRegion.textContent = message;
      if (duration > 0) timer = setTimeout(dismiss, duration);
    }
    return Object.freeze({ show, dismiss });
  }
});
