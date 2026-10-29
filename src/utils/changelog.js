// v1.10.81 - "What's new" on the Support & About page, from the CHANGELOG.md
// that ships with the app (GET /api/changelog). Only the little Markdown the
// changelog uses is understood, and the result is plain data the page shows as
// text - no HTML is ever built from the file.
//
// parseChangelog(md, limit) -> [{ version, date, summary, sections: [{ title,
//   blocks: [{ kind: 'item' | 'para', text, children: [text] }] }] }]
// "How to update" is left out (whoever reads it already has the version), and
// so is an entry not released yet (no date).

const ENTRY = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})\s*$/;

export function parseChangelog(md, limit = 6) {
  const lines = String(md || '').split(/\r?\n/);
  const entries = [];
  let entry = null; let section = null; let skip = false; let last = null;
  const startEntry = (m) => {
    entry = { version: m[1], date: m[2], summary: '', sections: [] };
    entries.push(entry); section = null; skip = false; last = null;
  };
  for (const raw of lines) {
    if (raw.startsWith('## ')) {
      const m = ENTRY.exec(raw.trim());
      if (m) startEntry(m); else entry = null; // unreleased or not an entry
      continue;
    }
    if (!entry) continue;
    if (raw.startsWith('### ')) {
      const title = raw.slice(4).trim();
      skip = /^how to update/i.test(title);
      section = skip ? null : { title, blocks: [] };
      if (section) entry.sections.push(section);
      last = null;
      continue;
    }
    if (skip || raw.startsWith('#### ') || raw.trim() === '---' || raw.trim().startsWith('>')) { if (!raw.trim()) last = null; continue; }
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { last = null; continue; }
    if (!section) { // the bold one-paragraph summary under the version line
      entry.summary = `${entry.summary} ${line.trim()}`.trim();
      continue;
    }
    const item = /^- (.*)$/.exec(line);
    const child = /^ {2,}- (.*)$/.exec(line);
    if (item) { last = { kind: 'item', text: item[1], children: [] }; section.blocks.push(last); }
    else if (child && last) { last.children.push(child[1]); }
    else if (last) { // continuation of the last item or child
      if (last.children.length && /^ {4,}/.test(line)) last.children[last.children.length - 1] += ` ${line.trim()}`;
      else last.text += ` ${line.trim()}`;
    } else { last = { kind: 'para', text: line.trim(), children: [] }; section.blocks.push(last); }
  }
  for (const e of entries) e.summary = e.summary.replace(/^\*\*|\*\*$/g, '').trim();
  return entries.slice(0, limit);
}

// Inline Markdown -> [{ t: 'text' | 'b' | 'i' | 'code' | 'link', v, href? }].
// Links only to http(s) addresses; anything else stays text.
export function inlineParts(text) {
  const out = [];
  const re = /\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let at = 0; let m;
  const s = String(text || '');
  while ((m = re.exec(s))) {
    if (m.index > at) out.push({ t: 'text', v: s.slice(at, m.index) });
    if (m[1] !== undefined) out.push({ t: 'b', v: m[1] });
    else if (m[2] !== undefined) out.push({ t: 'i', v: m[2] });
    else if (m[3] !== undefined) out.push({ t: 'code', v: m[3] });
    else out.push({ t: 'link', v: m[4], href: m[5] });
    at = re.lastIndex;
  }
  if (at < s.length) out.push({ t: 'text', v: s.slice(at) });
  // A relative link such as [docs/AUDIT.md](docs/AUDIT.md) is kept as its text.
  return out.map((p) => (p.t === 'text' ? { ...p, v: p.v.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') } : p));
}
