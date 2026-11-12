#!/usr/bin/env node
// Proves an app outside this repo can use @aurum/react: packs the package the way a
// git install does, installs it into a fresh Vite + TypeScript app with a strict
// tsconfig (skipLibCheck off), then type-checks and builds that app.
//
//   pnpm consumer:check

import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const app = mkdtempSync(join(tmpdir(), 'aurum-consumer-'));
const run = (cmd, args, cwd = app) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

try {
  run('pnpm', ['pack', '--pack-destination', app], join(root, 'packages/react'));
  const tarball = readdirSync(app).find((f) => f.endsWith('.tgz'));
  cpSync(join(here, 'app'), app, { recursive: true });
  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify({
      name: 'aurum-consumer',
      private: true,
      type: 'module',
      dependencies: { '@aurum/react': `file:./${tarball}`, react: '19.3.1', 'react-dom': '19.3.1' },
      devDependencies: {
        '@types/react': '19.3.0',
        '@types/react-dom': '19.3.0',
        '@vitejs/plugin-react': '6.2.1',
        typescript: '5.9.3',
        vite: '8.3.5',
      },
    }),
  );
  run('pnpm', ['install', '--ignore-workspace', '--silent']);
  run('pnpm', ['exec', 'tsc', '--noEmit', '-p', '.']);
  run('pnpm', ['exec', 'vite', 'build', '--logLevel', 'warn']);
  console.log('Consumer check passed: a fresh Vite app installs, type-checks and builds with @aurum/react.');
} finally {
  rmSync(app, { recursive: true, force: true });
}
