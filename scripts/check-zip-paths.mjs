// Lists a ZIP's entry names and fails if any uses "\" as a folder separator.
// Linux web hosts (and unzip) treat "\" as part of the file name, so a ZIP
// made by Windows PowerShell's Compress-Archive unpacks as flat files named
// "folder\file" and every link 404s (ERR-061). Usage:
//   node scripts/check-zip-paths.mjs release-build/docs-v1.10.81.zip
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/check-zip-paths.mjs <file.zip>'); process.exit(1); }
const b = readFileSync(file);
const names = [];
for (let i = 0; i < b.length - 46; i++) {
  if (b.readUInt32LE(i) !== 0x02014b50) continue; // central directory entry
  const n = b.readUInt16LE(i + 28); const e = b.readUInt16LE(i + 30); const c = b.readUInt16LE(i + 32);
  names.push(b.subarray(i + 46, i + 46 + n).toString());
  i += 45 + n + e + c;
}
const bad = names.filter((x) => x.includes('\\'));
console.log(`${names.length} entries, ${bad.length} with "\\"`);
console.log(names.slice(0, 3).join('\n'));
if (!names.length || bad.length) { console.error(bad.slice(0, 5).join('\n')); process.exit(1); }
