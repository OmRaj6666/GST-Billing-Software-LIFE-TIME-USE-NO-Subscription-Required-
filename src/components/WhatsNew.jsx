// v1.10.81 - on Support & About: the weekly update (a new version every
// Saturday, decided with the maintainer), where to report problems and ask
// for features (GitHub issue forms), and "What's new" from the CHANGELOG.md
// that ships with the app. The changelog is shown as text (changelog.js
// parses it), never as HTML.
import { useEffect, useState } from 'react';
import { Bug, Lightbulb, CalendarClock, ListChecks, Sparkles } from 'lucide-react';
import { parseChangelog, inlineParts } from '../utils/changelog';

const REPO = 'https://github.com/OmRaj6666/GST-Billing-Software-LIFE-TIME-USE-NO-Subscription-Required-';
const CHANGELOG_URL = `${REPO}/blob/main/CHANGELOG.md`;
const card = { padding: '1.25rem 1.5rem' };

function Inline({ text }) {
  return inlineParts(text).map((p, i) => {
    if (p.t === 'b') return <strong key={i}>{p.v}</strong>;
    if (p.t === 'i') return <em key={i}>{p.v}</em>;
    if (p.t === 'code') return <code key={i}>{p.v}</code>;
    if (p.t === 'link') return <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{p.v}</a>;
    return <span key={i}>{p.v}</span>;
  });
}

function Release({ entry }) {
  return (
    <>
      {entry.summary && <p style={{ margin: '0.35rem 0 0.6rem', fontWeight: 600, lineHeight: 1.5 }}><Inline text={entry.summary} /></p>}
      {entry.sections.map((s) => (
        <div key={s.title} style={{ marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0.5rem 0 0.25rem' }}>{s.title}</div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.84rem', lineHeight: 1.55 }}>
            {s.blocks.map((b, i) => (b.kind === 'para'
              ? <li key={i} style={{ listStyle: 'none', marginLeft: '-1.1rem' }}><Inline text={b.text} /></li>
              : (
                <li key={i} style={{ marginBottom: '0.25rem' }}>
                  <Inline text={b.text} />
                  {b.children.length > 0 && (
                    <ul style={{ margin: '0.2rem 0 0', paddingLeft: '1.1rem' }}>
                      {b.children.map((c, j) => <li key={j}><Inline text={c} /></li>)}
                    </ul>
                  )}
                </li>
              )))}
          </ul>
        </div>
      ))}
    </>
  );
}

const longDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

export default function WhatsNew() {
  const [entries, setEntries] = useState(null);
  useEffect(() => {
    let live = true;
    fetch('/api/changelog')
      .then((r) => (r.ok ? r.json() : { text: '' }))
      .then(({ text }) => { if (live) setEntries(parseChangelog(text, 6)); })
      .catch(() => { if (live) setEntries([]); });
    return () => { live = false; };
  }, []);

  return (
    <>
      <div className="glass-panel" style={{ ...card, marginBottom: '1.25rem' }} aria-labelledby="weekly-title">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <CalendarClock size={26} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <h3 id="weekly-title" style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>A new update every Saturday</h3>
            <p style={{ margin: '0 0 0.5rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '72ch' }}>
              Every Saturday we release one update with that week&apos;s fixes and new features. The app tells you when it is
              ready: click <b>Update</b> in the sidebar, and your invoices and settings are kept. Anything urgent, such as the
              app not opening, is fixed straight away.
            </p>
            <p style={{ margin: '0 0 0.9rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: '72ch' }}>
              Tell us on GitHub what is wrong or what you need. We read every request each week, the ones most people ask
              for come first, and you get a reply there when it is done.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href={`${REPO}/issues/new?template=bug_report.yml`} target="_blank" rel="noopener noreferrer">
                <Bug size={16} /> Report a problem
              </a>
              <a className="btn btn-secondary" href={`${REPO}/issues/new?template=feature_request.yml`} target="_blank" rel="noopener noreferrer">
                <Lightbulb size={16} /> Ask for a feature
              </a>
              <a className="btn btn-secondary" href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">
                <ListChecks size={16} /> See all requests
              </a>
              {/* The changelog: the list below, or every version on GitHub. */}
              {entries && entries.length > 0 ? (
                <button type="button" className="btn btn-secondary"
                  onClick={() => document.getElementById('whats-new')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                  <Sparkles size={16} /> What&apos;s new
                </button>
              ) : (
                <a className="btn btn-secondary" href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer">
                  <Sparkles size={16} /> Changelog
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {entries && entries.length > 0 && (
        <div id="whats-new" className="glass-panel" style={{ ...card, marginBottom: '1.25rem', scrollMarginTop: '1rem' }} aria-labelledby="whats-new-title">
          <h3 id="whats-new-title" style={{ margin: '0 0 0.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} /> What&apos;s new
          </h3>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            The latest updates. Every version since the first is in the <a href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>full changelog</a>, and the downloads are on <a href={`${REPO}/releases`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>GitHub Releases</a>.
          </p>
          {entries.map((e, i) => (
            <details key={e.version} open={i === 0} style={{ borderTop: '1px solid var(--border-color)', padding: '0.65rem 0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                v{e.version} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem' }}>· {longDate(e.date)}</span>
              </summary>
              <Release entry={e} />
            </details>
          ))}
        </div>
      )}
    </>
  );
}
