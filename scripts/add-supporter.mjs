// Record a payment in supporters.json (the tracker the app's Support & About
// page and the docs site read live from GitHub - no release needed, just
// commit and push this file).
//
//   node scripts/add-supporter.mjs "Asha Traders" 501
//   node scripts/add-supporter.mjs "Ravi K" 251 --anonymous   (counted, name not shown)
//   node scripts/add-supporter.mjs --undo "Asha Traders" 501   (a mistake: amount back)
//   node scripts/add-supporter.mjs --undo --remove-name "Asha Traders" 501  (and off the list)
// The same name again counts as the same supporter: the total goes up, the count does not.
//
// Only list a name the supporter is happy to see on a public page.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseSupporters } from '../src/utils/supporters.js';

const FILE = fileURLToPath(new URL('../supporters.json', import.meta.url));
const args = process.argv.slice(2);
const undo = args.includes('--undo');
const anonymous = args.includes('--anonymous');
const [name = '', amountText = ''] = args.filter((a) => !a.startsWith('--'));
const amount = Number(String(amountText).replace(/[₹,\s]/g, ''));
const cleanName = name.replace(/\s+/g, ' ').trim();

if (!cleanName || !Number.isFinite(amount) || amount <= 0) {
  console.error('Usage: node scripts/add-supporter.mjs "Name" <amount in rupees> [--anonymous | --undo]');
  process.exit(1);
}
if (cleanName.length > 60) { console.error('Keep the name to 60 characters (it is cut there on the page).'); process.exit(1); }

const raw = JSON.parse(readFileSync(FILE, 'utf8'));
const today = new Date();
const thanks = Array.isArray(raw.thanks) ? raw.thanks.filter((n) => typeof n === 'string') : [];
const listed = !anonymous;
// "supporters" counts people: a name already listed paying again adds to the
// total only. --undo takes the amount back; add --remove-name to also take
// the person off the list and the count (when it was their only payment).
const removeName = undo && args.includes('--remove-name');
const newPerson = !undo && (anonymous || !thanks.includes(cleanName));
const next = {
  ...raw,
  totalReceived: Math.round((Number(raw.totalReceived) || 0) + (undo ? -amount : amount)),
  supporters: Math.max(0, (Number(raw.supporters) || 0) + (newPerson ? 1 : 0) - (removeName ? 1 : 0)),
  thanks: removeName
    ? thanks.filter((n) => n !== cleanName)
    : (!undo && listed && !thanks.includes(cleanName) ? [...thanks, cleanName] : thanks),
  updated: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
};
if (next.totalReceived < 0) { console.error('That would make the total negative; nothing changed.'); process.exit(1); }
// The same check the app makes, so a file the app would refuse is never written.
if (!parseSupporters(next)) { console.error('The result would not show in the app; nothing changed.'); process.exit(1); }

writeFileSync(FILE, `${JSON.stringify(next, null, 2)}\n`);
const goal = next.goal?.amount ? ` of ₹${next.goal.amount.toLocaleString('en-IN')}` : '';
console.log(`${undo ? 'Removed' : 'Added'}: ${cleanName} ₹${amount.toLocaleString('en-IN')}${listed || undo ? '' : ' (not listed by name)'}${!undo && !newPerson ? ' (paid before: counted once)' : ''}`);
console.log(`Now: ₹${next.totalReceived.toLocaleString('en-IN')}${goal} from ${next.supporters} supporter${next.supporters === 1 ? '' : 's'}; names shown: ${next.thanks.length}`);
console.log('Commit and push supporters.json; the app and the docs site show it within a few minutes.');
