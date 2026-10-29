// v1.10.77 (#85) - edit many products at once: the list becomes a grid of
// inputs (name, HSN/SAC, purchase price, selling price, GST %, unit, stock),
// and one Save writes only the rows that changed. Same rules as the single
// product form (a name is required; GST % 0-100; selling price is mirrored to
// `rate` for older readers).
import { useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import { getAllProducts, saveProduct } from '../store';
import { toast } from './Toast';
import { bulkRowToProduct } from '../utils/products';

const FIELDS = [
  ['name', 'Name', 'text', 180],
  ['hsn', 'HSN/SAC', 'text', 90],
  ['purchasePrice', 'Purchase price', 'number', 100],
  ['sellingPrice', 'Selling price', 'number', 100],
  ['taxPercent', 'GST %', 'number', 70],
  ['unit', 'Unit', 'unit', 90],
  ['stock', 'Stock', 'number', 80],
];

const valueOf = (p, k) => {
  if (k === 'sellingPrice') return p.sellingPrice ?? p.rate ?? '';
  return p[k] ?? '';
};

export default function ProductBulkEdit({ products, units, onDone }) {
  const [edits, setEdits] = useState({}); // id -> { field: value }
  const [saving, setSaving] = useState(false);
  const changedIds = useMemo(() => Object.keys(edits).filter((id) => Object.keys(edits[id]).length), [edits]);

  const setCell = (p, k, v) => setEdits((prev) => {
    const row = { ...(prev[p.id] || {}) };
    if (String(v) === String(valueOf(p, k))) delete row[k]; else row[k] = v;
    return { ...prev, [p.id]: row };
  });

  const saveAll = async () => {
    setSaving(true);
    // Only the changed cells go onto the latest saved copy of each product, so
    // stock that moved meanwhile (an invoice in another tab) is not undone.
    let latest;
    try { latest = await getAllProducts(); } catch { setSaving(false); toast('Could not load products. Try again.', 'error'); return; }
    const plans = changedIds
      .map((id) => (latest || []).find((p) => p.id === id))
      .filter(Boolean) // deleted meanwhile: nothing to update
      .map((p) => bulkRowToProduct(p, edits[p.id]));
    const bad = plans.find((r) => r.error);
    if (bad) { setSaving(false); toast(`Not saved: ${bad.error}`, 'warning'); return; }
    const results = await Promise.allSettled(plans.map((r) => saveProduct(r.product)));
    setSaving(false);
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed) toast(`${plans.length - failed} saved, ${failed} failed. Try again.`, 'error');
    else toast(`${plans.length} product${plans.length === 1 ? '' : 's'} updated`, 'success');
    onDone(!failed);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <strong style={{ fontSize: '0.9rem' }}>Bulk edit</strong>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {changedIds.length ? `${changedIds.length} product${changedIds.length === 1 ? '' : 's'} changed` : 'Change any cells, then save once.'}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => onDone(false)} disabled={saving}><X size={15} /> Cancel</button>
          <button type="button" className="btn btn-primary" onClick={saveAll} disabled={saving || !changedIds.length}>
            <Save size={15} /> {saving ? 'Saving…' : `Save changes${changedIds.length ? ` (${changedIds.length})` : ''}`}
          </button>
        </span>
      </div>
      <div className="table-scroll">
        <table className="data-table bulk-edit-table" style={{ minWidth: 820 }}>
          <thead><tr>{FIELDS.map(([k, label]) => <th key={k}>{label}</th>)}</tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={edits[p.id] && Object.keys(edits[p.id]).length ? { background: 'var(--info-bg)' } : undefined}>
                {FIELDS.map(([k, label, type, w]) => {
                  const v = edits[p.id]?.[k] ?? valueOf(p, k);
                  return (
                    <td key={k} style={{ padding: '0.3rem 0.4rem' }}>
                      {type === 'unit' ? (
                        <select className="form-input" style={{ width: w, padding: '0.3rem' }} value={v || 'Nos'} aria-label={`${label} of ${p.name}`}
                          onChange={(e) => setCell(p, k, e.target.value)}>
                          {[...new Set([...(units || []).map((u) => u.label || u), v].filter(Boolean))].map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <input className="form-input" style={{ width: w, padding: '0.3rem 0.45rem' }} type={type} step="any" value={v}
                          aria-label={`${label} of ${p.name}`} onChange={(e) => setCell(p, k, e.target.value)} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
