#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const certPath = process.env.CSC_LINK;
const certPassword = process.env.CSC_KEY_PASSWORD;

if (!certPath || !certPassword) {
  console.error('\nWindows Smart App Control blocks unsigned installer EXEs.');
  console.error('A valid code-signing certificate is required before distributing the desktop app.\n');
  console.error('Set the following environment variables before running the build:');
  console.error('  CSC_LINK=<path to your .pfx or .p12 certificate>');
  console.error('  CSC_KEY_PASSWORD=<certificate password>\n');
  console.error('PowerShell example:');
  console.error('  $env:CSC_LINK = "C:\\Certificates\\CRCosmetics.pfx"');
  console.error('  $env:CSC_KEY_PASSWORD = "your-password"');
  console.error('  npm run pos:desktop:build\n');
  process.exit(1);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['electron-builder', '--win', 'nsis'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
