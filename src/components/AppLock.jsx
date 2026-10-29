// v1.10.77 (#84) - optional PIN lock: a 6 or 8 digit PIN asked when the app
// opens (and on "Lock now"). A screen lock for a shared PC, not encryption;
// the PIN is checked by the server, which stores only a hash (server.js,
// /api/lock). Forgotten PIN: a file named RESET-PIN in the app folder.
import { useEffect, useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { getLockStatus, verifyPin, setSessionToken } from '../store';
import { UNLOCKED_KEY, LOCK_EVENT } from '../utils/appLock';

function LockScreen({ length, onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const input = useRef(null);

  const submit = async (value) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await verifyPin(value);
      if (res?.token) setSessionToken(res.token);
      onUnlock();
    } catch (err) {
      setPin('');
      if (err.status === 429) setError(`Too many wrong tries. Wait ${err.body?.wait || 30} seconds and try again.`);
      else if (err.status === 401) setError('Wrong PIN. Try again.');
      else setError('Could not check the PIN. Is the app still running?');
      setTimeout(() => input.current?.focus(), 0);
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, length);
    setPin(v);
    setError('');
    if (v.length === length) submit(v);
  };

  return (
    <div className="app-lock-screen">
      <form className="glass-panel app-lock-card" onSubmit={(e) => { e.preventDefault(); if (pin.length === length) submit(pin); }}>
        <Lock size={32} aria-hidden="true" />
        <h1>Enter your PIN</h1>
        <p className="text-muted">Free GST Billing is locked.</p>
        <input ref={input} className="form-input app-lock-input" type="password" inputMode="numeric" autoComplete="off" autoFocus
          aria-label={`${length} digit PIN`} placeholder={'•'.repeat(length)} value={pin} onChange={onChange} disabled={busy} maxLength={length} />
        <p className="app-lock-error" role="alert">{error}</p>
        <button type="button" className="app-lock-link" onClick={() => setShowHelp((v) => !v)}>Forgot PIN?</button>
        {showHelp && (
          <p className="app-lock-help">
            Open the Free-GST-Billing folder on this PC (where you start the app), make a new text file there named <strong>RESET-PIN</strong>, then reload this page. The PIN is removed and the file deleted. Your invoices are not touched.
          </p>
        )}
      </form>
    </div>
  );
}

// Shows the app only after the PIN, when a PIN is set. Asked once per
// browser tab: a reload in the same tab does not ask again.
export default function AppLockGate({ children }) {
  const [lock, setLock] = useState({ checked: false, enabled: false, length: 6 });
  const [unlocked, setUnlocked] = useState(() => {
    try { return sessionStorage.getItem(UNLOCKED_KEY) === '1'; } catch { return false; }
  });
  // The app has been on screen once (it stays mounted from then on).
  const [shown, setShown] = useState(unlocked);

  useEffect(() => {
    // If the server cannot be reached the app shows its own error screens; the
    // lock does not block that.
    getLockStatus()
      .then((s) => { setLock({ checked: true, enabled: !!s.enabled, length: s.length === 8 ? 8 : 6 }); if (!s.enabled) setShown(true); })
      .catch(() => { setLock((l) => ({ ...l, checked: true })); setShown(true); });
    const relock = () => {
      setUnlocked(false);
      setSessionToken(null);
      getLockStatus().then((s) => setLock({ checked: true, enabled: !!s.enabled, length: s.length === 8 ? 8 : 6 })).catch(() => {});
    };
    window.addEventListener(LOCK_EVENT, relock);
    return () => window.removeEventListener(LOCK_EVENT, relock);
  }, []);

  if (!lock.checked) return null;
  const locked = lock.enabled && !unlocked;
  const onUnlock = () => {
    try { sessionStorage.setItem(UNLOCKED_KEY, '1'); } catch { /* storage blocked */ }
    setUnlocked(true);
    setShown(true);
  };
  // Locked before the app was ever shown: the app is not rendered at all.
  if (locked && !shown) return <LockScreen length={lock.length} onUnlock={onUnlock} />;
  // Locked again (Lock now): the app stays mounted but hidden, so anything
  // typed and not yet saved is still there after the PIN. display: contents
  // keeps the wrapper out of the layout.
  return (
    <>
      <div style={{ display: locked ? 'none' : 'contents' }} aria-hidden={locked || undefined}>{children}</div>
      {locked && <LockScreen length={lock.length} onUnlock={onUnlock} />}
    </>
  );
}
