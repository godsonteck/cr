#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const certPath = process.env.CSC_LINK;
const certPassword = process.env.CSC_KEY_PASSWORD;

if (!certPath || !certPassword) {
  console.warn('\n================================================================');
  console.warn('[!] Notice: Building Windows installer without code signing.');
  console.warn('    CSC_LINK and CSC_KEY_PASSWORD were not provided.');
  console.warn('    When running on destination PC, click "More info" -> "Run anyway"');
  console.warn('    if Windows SmartScreen appears.');
  console.warn('================================================================\n');
} else {
  console.log('\n[*] Code-signing certificate detected. Packaging signed installer...\n');
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const builderArgs = ['electron-builder', '--win', 'nsis', '--publish', 'never'];

const result = spawnSync(command, builderArgs, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (result.status !== 0) {
  console.error('\n[x] Build failed with exit code:', result.status);
  process.exit(result.status ?? 1);
}

// Search for the generated installer in release/ and dist/
const searchDirs = [
  path.resolve(process.cwd(), 'release'),
  path.resolve(process.cwd(), 'dist'),
];

let installerPath = null;
for (const dir of searchDirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    // Find setup exe (ignoring elevate.exe or blockmap files)
    const exe = files.find(f => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('elevate'));
    if (exe) {
      installerPath = path.join(dir, exe);
      break;
    }
  }
}

if (!installerPath) {
  console.warn('\n[!] Could not automatically locate the installer .exe in release/ or dist/.');
  process.exit(0);
}

const desktopDir = path.join(os.homedir(), 'Desktop');
if (fs.existsSync(desktopDir)) {
  const destPath = path.join(desktopDir, path.basename(installerPath));
  fs.copyFileSync(installerPath, destPath);
  console.log('\n================================================================');
  console.log(`[SUCCESS] Installer successfully copied to your Desktop:`);
  console.log(`          ${destPath}`);
  console.log('================================================================\n');
} else {
  console.log(`\n[SUCCESS] Installer created at: ${installerPath}\n`);
}

process.exit(0);
