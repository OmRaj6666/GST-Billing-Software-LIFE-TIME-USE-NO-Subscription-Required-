#!/usr/bin/env node
/**
 * Free GST Billing Software — Automated Desktop Binary Packager (.dmg / .exe)
 *
 * Runs `vite build` to generate the client assets, prepares dependencies,
 * and packages native binaries using `electron-builder`:
 * - macOS: .dmg installer and .zip archive
 * - Windows: .exe installer (NSIS) and portable standalone .exe
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const REPO_ROOT = resolve(new URL('.', import.meta.url).pathname, '..');
const targetArg = process.argv[2] || 'current'; // 'mac', 'win', 'all', 'current'

console.log('\n========================================================');
console.log(' Free GST Billing Software — Desktop Packaging Pipeline');
console.log('========================================================\n');

try {
  // Step 1: Ensure web assets are compiled
  console.log('📦 Step 1: Building production web frontend (Vite)...');
  execSync('npm run build', { cwd: REPO_ROOT, stdio: 'inherit' });

  // Step 2: Determine packaging command
  console.log(`\n🚀 Step 2: Packaging desktop binaries for target: [${targetArg}]...`);

  let buildCmd = 'npx electron-builder';
  if (targetArg === 'mac') {
    buildCmd += ' --mac';
  } else if (targetArg === 'win') {
    buildCmd += ' --win';
  } else if (targetArg === 'all') {
    buildCmd += ' -mw';
  } else {
    // Current platform
    if (process.platform === 'darwin') buildCmd += ' --mac';
    else if (process.platform === 'win32') buildCmd += ' --win';
    else buildCmd += ' --linux';
  }

  console.log(`Executing: ${buildCmd}`);
  execSync(buildCmd, { cwd: REPO_ROOT, stdio: 'inherit' });

  console.log('\n✅ Packaging complete! Output files are available in:');
  console.log(`   ${resolve(REPO_ROOT, 'release-desktop')}\n`);
} catch (error) {
  console.error('\n❌ Packaging encountered an error:');
  console.error(error.message);
  console.log('\n💡 Note: Make sure dependencies are installed: `npm install`\n');
  process.exit(1);
}
