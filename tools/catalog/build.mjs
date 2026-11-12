#!/usr/bin/env node
// Checks the component catalog and writes catalog/CATALOG.md.
//
//   node tools/catalog/build.mjs           check, then rewrite CATALOG.md
//   node tools/catalog/build.mjs --check   check, and fail if CATALOG.md is out of date
//
// Rules it enforces:
//   1. Shelves: core (any app) -> pattern (bigger, any topic) -> kit (one topic).
//      Files live on their shelf: src/core/, src/patterns/<group>/, src/kits/<kit>/.
//   2. Every public component in those folders is in the catalog, and every catalog
//      entry points at a file that really defines its symbol.
//   3. Imports only point down: kits may use patterns and core, patterns may use core,
//      core uses neither. A kit never imports another kit.
//   4. Rule of two: a pattern or kit component needs two apps in `usedBy`.
//   5. Tags and kits must be listed in catalog/kits.json.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const check = process.argv.includes('--check');
const read = (p) => readFileSync(join(root, p), 'utf8');

const { kits } = JSON.parse(read('catalog/kits.json'));
const { components, candidates = [] } = JSON.parse(read('catalog/components.json'));

const SHELVES = ['core', 'pattern', 'kit'];
const GROUPS = {
  core: ['controls', 'surfaces', 'navigation', 'feedback', 'identity'],
  pattern: ['data', 'identity', 'forms', 'onboarding', 'settings', 'states', 'selection', 'media'],
};
const kitIds = new Set(kits.map((k) => k.id));
const errors = [];
const fail = (msg) => errors.push(msg);

const PLATFORMS = {
  react: {
    base: 'packages/react/src',
    shelfDir: { core: ['core'], pattern: ['patterns'], kit: ['kits'] },
    defines: (src, sym) => new RegExp(`export\\s+(function|const)\\s+${sym}\\b`).test(src),
    publicSymbols: (src) => [...src.matchAll(/export\s+function\s+([A-Z]\w*)/g)].map((m) => m[1]),
    ext: ['.tsx', '.ts'],
  },
  flutter: {
    base: 'packages/flutter/lib/src',
    // foundations/ holds AurumGlass, which is a core surface.
    shelfDir: { core: ['core', 'foundations'], pattern: ['patterns'], kit: ['kits'] },
    defines: (src, sym) =>
      new RegExp(`^(class\\s+${sym}\\b|\\S.*\\s${sym}\\s*(<[^>]*>)?\\s*\\()`, 'm').test(src),
    publicSymbols: (src) =>
      [...src.matchAll(/^class\s+([A-Z]\w*)(<[^>]*>)?\s+extends\s+(StatelessWidget|StatefulWidget)/gm)].map((m) => m[1]),
    ext: ['.dart'],
  },
};

// --- 5. kits and tags ---------------------------------------------------------
for (const k of kits) {
  if (!/^[a-z]+$/.test(k.id)) fail(`kits.json: kit id "${k.id}" must be lowercase letters only`);
  if (!['active', 'planned'].includes(k.status)) fail(`kits.json: kit "${k.id}" status must be active or planned`);
}
function checkTags(where, tags) {
  if (!Array.isArray(tags) || tags.length === 0) return fail(`${where}: needs at least one tag ("any" or kit ids)`);
  for (const t of tags) if (t !== 'any' && !kitIds.has(t)) fail(`${where}: unknown tag "${t}" (add it to catalog/kits.json)`);
}

// --- 1, 2, 4. library entries ---------------------------------------------------
const names = new Set();
const cataloged = { react: new Set(), flutter: new Set() };
for (const c of components) {
  const where = `components.json "${c.name}"`;
  if (names.has(c.name)) fail(`${where}: duplicate name`);
  names.add(c.name);
  if (!SHELVES.includes(c.shelf)) fail(`${where}: shelf must be one of ${SHELVES.join(', ')}`);
  if (c.shelf === 'kit') {
    if (!kitIds.has(c.kit)) fail(`${where}: kit "${c.kit}" is not in catalog/kits.json`);
  } else {
    if (c.kit) fail(`${where}: only kit components have a "kit"`);
    if (!GROUPS[c.shelf]?.includes(c.group)) fail(`${where}: group must be one of ${GROUPS[c.shelf]?.join(', ')}`);
  }
  checkTags(where, c.tags);
  if (c.shelf !== 'core') {
    const apps = new Set(c.usedBy ?? []);
    if (apps.size < 2) fail(`${where}: rule of two, a ${c.shelf} needs two apps in "usedBy" (has ${apps.size}). Keep it a candidate until then.`);
  }
  if (!c.react && !c.flutter) fail(`${where}: needs a react or flutter implementation`);
  for (const p of ['react', 'flutter']) {
    const impl = c[p];
    if (!impl) continue;
    const plat = PLATFORMS[p];
    if (!existsSync(join(root, impl.file))) {
      fail(`${where}: ${p} file ${impl.file} does not exist`);
      continue;
    }
    if (!plat.defines(read(impl.file), impl.symbol)) fail(`${where}: ${impl.file} does not define ${impl.symbol}`);
    const rel = relative(plat.base, impl.file).split('/');
    const allowed = plat.shelfDir[c.shelf] ?? [];
    if (!allowed.includes(rel[0])) fail(`${where}: ${p} file must live under ${plat.base}/${allowed[0]}/ for shelf "${c.shelf}"`);
    if (c.shelf === 'kit' && rel[1] !== c.kit) fail(`${where}: ${p} file must live under ${plat.base}/kits/${c.kit}/`);
    cataloged[p].add(impl.symbol);
  }
}

// --- candidates ---------------------------------------------------------------
for (const c of candidates) {
  const where = `candidate "${c.name}"`;
  if (names.has(c.name)) fail(`${where}: already in the library, remove the candidate`);
  if (!SHELVES.includes(c.target)) fail(`${where}: target must be one of ${SHELVES.join(', ')}`);
  if (c.target === 'kit' && !kitIds.has(c.kit)) fail(`${where}: kit "${c.kit}" is not in catalog/kits.json`);
  checkTags(where, c.tags);
  for (const f of c.foundIn ?? []) {
    if (!existsSync(join(root, f.file))) fail(`${where}: ${f.file} does not exist`);
    else if (!new RegExp(`class\\s+${f.symbol}\\b`).test(read(f.file))) fail(`${where}: ${f.file} has no class ${f.symbol}`);
  }
}

// --- 2, 3. scan the shelves -----------------------------------------------------
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const rank = { core: 0, foundations: 0, patterns: 1, kits: 2 };
for (const [p, plat] of Object.entries(PLATFORMS)) {
  for (const shelfDir of ['core', 'patterns', 'kits']) {
    for (const abs of walk(join(root, plat.base, shelfDir))) {
      if (!plat.ext.some((x) => abs.endsWith(x)) || abs.endsWith('.g.dart')) continue;
      const file = relative(root, abs);
      const src = readFileSync(abs, 'utf8');
      for (const sym of plat.publicSymbols(src)) {
        if (!cataloged[p].has(sym)) fail(`${file}: ${sym} is not in catalog/components.json`);
      }
      const ownKit = shelfDir === 'kits' ? relative(join(root, plat.base, 'kits'), abs).split('/')[0] : null;
      for (const m of src.matchAll(/(?:import|export)\s[^;]*?['"](\.{1,2}\/[^'"]+)['"]/g)) {
        const target = relative(join(root, plat.base), resolve(dirname(abs), m[1])).split('/');
        if (!(target[0] in rank)) continue;
        if (rank[target[0]] > rank[shelfDir]) fail(`${file}: ${shelfDir} must not import from ${target[0]}/ (imports only point down)`);
        if (target[0] === 'kits' && ownKit && target[1] !== ownKit) fail(`${file}: kit "${ownKit}" must not import kit "${target[1]}"`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Catalog check failed (${errors.length}):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}

// --- write CATALOG.md ----------------------------------------------------------
const yes = (impl) => (impl ? '✓' : '—');
const row = (c) => `| ${c.name} | ${yes(c.react)} | ${yes(c.flutter)} | ${c.tags.join(', ')} | ${c.notes ?? ''} |`;
const head = '| Component | React | Flutter | Tags | Notes |\n| --- | :-: | :-: | --- | --- |';
const byGroup = (list, groups) =>
  groups
    .map((g) => [g, list.filter((c) => c.group === g)])
    .filter(([, l]) => l.length)
    .map(([g, l]) => `### ${g[0].toUpperCase() + g.slice(1)}\n\n${head}\n${l.map(row).join('\n')}`)
    .join('\n\n');

const core = components.filter((c) => c.shelf === 'core');
const patterns = components.filter((c) => c.shelf === 'pattern');
const kitParts = kits.map((k) => {
  const list = components.filter((c) => c.shelf === 'kit' && c.kit === k.id);
  const waiting = candidates.filter((c) => c.target === 'kit' && c.kit === k.id).length;
  const body = list.length ? `${head}\n${list.map(row).join('\n')}` : '_No components yet._';
  return `### ${k.name} (\`${k.id}\`, ${k.status})\n\n${k.description}${waiting ? ` ${waiting} candidate${waiting > 1 ? 's' : ''} waiting.` : ''}\n\n${body}`;
});
const candRows = candidates.map((c) => {
  const apps = new Set((c.foundIn ?? []).map((f) => f.app));
  const target = c.target === 'kit' ? `kit: ${c.kit}` : c.target;
  const ready = apps.size >= 2 ? '**Ready to promote**' : 'Waiting for a second app';
  return `| ${c.name} | ${target} | ${[...apps].join(', ')} | ${c.tags.join(', ')} | ${ready} |`;
});
const tagParts = kits.map((k) => {
  const lib = components.filter((c) => c.tags.includes(k.id)).map((c) => c.name);
  const cand = candidates.filter((c) => c.tags.includes(k.id)).map((c) => `${c.name} (candidate)`);
  const all = [...lib, ...cand];
  return `- **${k.name}:** core components, plus ${all.length ? all.join(', ') : 'nothing topic-specific yet'}`;
});

const md = `<!-- Generated by tools/catalog/build.mjs from catalog/*.json. Do not edit by hand: run \`pnpm catalog\`. -->

# Aurum component catalog

${components.length} components in the library, ${candidates.length} candidates waiting. How the shelves work: [README.md](README.md).

## Core

Building blocks for any app.

${byGroup(core, GROUPS.core)}

## Patterns

Bigger pieces built from core that still fit any topic.

${patterns.length ? byGroup(patterns, GROUPS.pattern) : '_None yet. The first candidate used by two apps lands here._'}

## Kits

Pieces that only make sense for one kind of app.

${kitParts.join('\n\n')}

## Candidates

Built inside one app. They join the library once a second app needs them (rule of two).

| Candidate | Goes to | Found in | Tags | Status |
| --- | --- | --- | --- | --- |
${candRows.join('\n')}

## Browse by topic

${tagParts.join('\n')}
`;

const out = join(root, 'catalog/CATALOG.md');
if (check) {
  if (!existsSync(out) || readFileSync(out, 'utf8') !== md) {
    console.error('catalog/CATALOG.md is out of date. Run `pnpm catalog` and commit it.');
    process.exit(1);
  }
  console.log(`Catalog OK: ${components.length} components, ${candidates.length} candidates, ${kits.length} kits.`);
} else {
  writeFileSync(out, md);
  console.log(`Wrote catalog/CATALOG.md: ${components.length} components, ${candidates.length} candidates, ${kits.length} kits.`);
}
