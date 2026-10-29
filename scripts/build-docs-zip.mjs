// npm run docs:zip - build the docs site and zip it for upload to
// the docs host, as release-build/docs-v<version>.zip.
//
// Never zip it with PowerShell's Compress-Archive: it writes "\" paths and
// the host unpacks flat files, so every link 404s (ERR-061). Windows' own
// tar.exe and Info-ZIP's zip both write "/". The result is checked before it
// is handed over.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const OUT = join(ROOT, 'docs-site', 'out');
const FOLDER = 'free-gst-software-documentation';
const zip = join(ROOT, 'release-build', `docs-v${version}.zip`);

execFileSync(process.execPath, [join(ROOT, 'docs-site', 'build.mjs')], { stdio: 'inherit' });
if (!existsSync(join(OUT, FOLDER, 'index.html'))) { console.error(`x ${FOLDER}/index.html was not built.`); process.exit(1); }
mkdirSync(join(ROOT, 'release-build'), { recursive: true });
rmSync(zip, { force: true });
if (process.platform === 'win32') {
  const tar = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
  execFileSync(tar, ['-a', '-c', '-f', zip, '-C', OUT, FOLDER], { stdio: 'inherit' });
} else {
  execFileSync('zip', ['-qr', zip, FOLDER], { cwd: OUT, stdio: 'inherit' });
}
execFileSync(process.execPath, [join(ROOT, 'scripts', 'check-zip-paths.mjs'), zip], { stdio: 'inherit' });
console.log(`\nDocs ZIP ready: ${zip}`);
console.log(`Upload it in place of /${FOLDER}/ on the docs host and extract it there.`);
