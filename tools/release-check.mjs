#!/usr/bin/env node
// Checks a release tag before apps pin it: aurum-vX.Y.Z must match the version in
// packages/react/package.json and packages/flutter/pubspec.yaml, and CHANGELOG.md
// must have a "## X.Y.Z" section.
//
//   node tools/release-check.mjs aurum-v0.1.0

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tag = process.argv[2] ?? '';
const m = /^aurum-v(\d+\.\d+\.\d+)$/.exec(tag);
if (!m) {
  console.error(`"${tag}" is not a release tag. Use aurum-vX.Y.Z, for example aurum-v0.1.0.`);
  process.exit(1);
}
const version = m[1];
const react = JSON.parse(readFileSync(join(root, 'packages/react/package.json'), 'utf8')).version;
const flutter = /^version:\s*(\S+)/m.exec(readFileSync(join(root, 'packages/flutter/pubspec.yaml'), 'utf8'))?.[1];
const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
const problems = [
  react !== version && `packages/react/package.json is ${react}`,
  flutter !== version && `packages/flutter/pubspec.yaml is ${flutter}`,
  !new RegExp(`^## ${version.replaceAll('.', '\\.')}\\b`, 'm').test(changelog) && `CHANGELOG.md has no "## ${version}" section`,
].filter(Boolean);
if (problems.length) {
  console.error(`${tag} does not match:\n${problems.map((p) => `  ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`${tag} matches package.json, pubspec.yaml and CHANGELOG.md.`);
