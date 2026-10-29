// v1.10.77 (#84) - shared by the PIN lock screen and its Settings panel.
export const UNLOCKED_KEY = 'gst_unlocked';
export const LOCK_EVENT = 'freegstbill-lock';

// Ask for the PIN again now (Settings > App lock > Lock now).
export const lockNow = () => {
  try { sessionStorage.removeItem(UNLOCKED_KEY); } catch { /* storage blocked */ }
  window.dispatchEvent(new Event(LOCK_EVENT));
};

// v1.10.80 (#98) - the PIN was turned on, changed or off: Lock buttons
// elsewhere on screen show or hide themselves.
export const LOCK_CHANGED_EVENT = 'freegstbill-lock-changed';
export const lockSettingsChanged = () => window.dispatchEvent(new Event(LOCK_CHANGED_EVENT));
