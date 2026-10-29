// v1.10.81 - the supporters' names on Support & About: the latest 10 first,
// and "Show all" opens the whole list with a search, so anyone can find their
// own name. supporters.json adds each new supporter at the end, so the list
// is shown newest first. Names are text only (parseSupporters checked them).
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

const LATEST = 10;
const chip = {
  display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.8rem',
  background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.22)', color: 'var(--text-primary)',
};

export default function SupportersList({ names }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const newestFirst = useMemo(() => [...names].reverse(), [names]);
  const q = query.trim().toLowerCase();
  const found = useMemo(() => (q ? newestFirst.filter((n) => n.toLowerCase().includes(q)) : newestFirst), [newestFirst, q]);
  if (!names.length) return null;
  const more = names.length - LATEST;

  return (
    <div style={{ marginTop: '0.9rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.45rem' }}>
        {open ? 'Thank you, everyone' : `Thank you${names.length > LATEST ? ` - the latest ${LATEST}` : ''}`}
      </div>
      {!open && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {newestFirst.slice(0, LATEST).map((n, i) => <span key={`${n}-${i}`} style={chip}>{n}</span>)}
        </div>
      )}
      {open && (
        <>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: 360, marginBottom: '0.55rem' }}>
            <Search size={15} aria-hidden="true" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input type="search" className="form-input" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a name" aria-label="Search supporters" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} />
          </label>
          <div role="list" aria-label="All supporters, newest first"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
            {found.map((n, i) => <span role="listitem" key={`${n}-${i}`} style={chip}>{n}</span>)}
          </div>
          <p aria-live="polite" style={{ margin: '0.45rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {q ? (found.length ? `${found.length} found` : `No supporter named "${query.trim()}" yet.`) : `${names.length} supporters, newest first.`}
          </p>
        </>
      )}
      {more > 0 && (
        <button type="button" className="btn btn-secondary" aria-expanded={open}
          onClick={() => { setOpen(!open); setQuery(''); }}
          style={{ marginTop: '0.6rem', padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}>
          {open ? 'Show the latest only' : `Show all ${names.length} supporters`}
        </button>
      )}
    </div>
  );
}
