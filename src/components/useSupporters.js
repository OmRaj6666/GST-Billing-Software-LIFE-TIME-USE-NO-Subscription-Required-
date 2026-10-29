// The maintainer's supporters tracker (supporters.json on GitHub), shared by
// the Support page and the Dashboard's daily support card. The last figures
// seen are kept per PC so they still show offline.
import { useEffect, useState } from 'react';
import { SUPPORTERS_URL, parseSupporters } from '../utils/supporters';

const TRACKER_CACHE = 'freegstbill_supportersCache';
const readCache = () => { try { return parseSupporters(JSON.parse(localStorage.getItem(TRACKER_CACHE) || 'null')); } catch { return null; } };

export default function useSupporters() {
  const [tracker, setTracker] = useState(readCache);
  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    fetch(SUPPORTERS_URL, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        const t = parseSupporters(raw);
        if (!t) return;
        setTracker(t);
        try { localStorage.setItem(TRACKER_CACHE, JSON.stringify(raw)); } catch { /* storage full or blocked */ }
      })
      .catch(() => { /* offline: the last figures seen stay */ })
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, []);
  return tracker;
}
