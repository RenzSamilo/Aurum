#!/usr/bin/env node
// Aurum cheat sheet for people and coding agents. Reads the catalog, the contracts and
// the generated tokens, so it is always current. Run it before building a screen.
//
//   pnpm aurum list [--shelf core|pattern|kit] [--tag fitness]   components, by shelf
//   pnpm aurum show <component>                                  props on React and Flutter, files, notes
//   pnpm aurum tokens [group]                                    token names for CSS and Dart
//   pnpm aurum kits                                              topic kits and candidates
//   pnpm aurum rules                                             the house rules, in one screen
//   pnpm aurum eject <component> --to <dir> [--platform react|flutter] [--force]   copy its source into an app to own
//   pnpm aurum ejected <dir>                                     what changed upstream since each eject

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolveRoot();
function resolveRoot() {
  return join(dirname(fileURLToPath(import.meta.url)), '..');
}
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const { components, candidates = [] } = readJson('catalog/components.json');
const { kits } = readJson('catalog/kits.json');
const contractDir = join(root, 'catalog/contracts');
const contracts = existsSync(contractDir)
  ? readdirSync(contractDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(contractDir, f), 'utf8')))
  : [];

const [cmd = 'help', ...args] = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const out = (s = '') => console.log(s);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const find = (q) =>
  components.find((c) => [c.name, c.react?.symbol, c.flutter?.symbol].filter(Boolean).some((n) => norm(n) === norm(q)));

const commands = {
  list() {
    const shelf = flag('shelf');
    const tag = flag('tag');
    const list = components.filter((c) => (!shelf || c.shelf === shelf) && (!tag || c.tags.includes(tag) || c.tags.includes('any')));
    for (const s of ['core', 'pattern', 'kit']) {
      const group = list.filter((c) => c.shelf === s);
      if (!group.length) continue;
      out(`\n${s.toUpperCase()}`);
      for (const c of group) {
        const where = [c.react && `React ${c.react.symbol}`, c.flutter && `Flutter ${c.flutter.symbol}`].filter(Boolean).join(' · ');
        out(`  ${c.name.padEnd(20)} ${(c.group ?? c.kit).padEnd(11)} ${where}`);
      }
    }
    out(`\n${list.length} components. \`pnpm aurum show <name>\` for props.`);
  },

  show() {
    const q = args.join(' ');
    const c = q && find(q);
    if (!c) {
      out(`No component "${q}". Try: ${components.map((x) => x.name).join(', ')}`);
      process.exitCode = 1;
      return;
    }
    out(`${c.name}  (${c.shelf}${c.group ? ` / ${c.group}` : ''}${c.kit ? ` / kit ${c.kit}` : ''})`);
    if (c.react) out(`  React:   import { ${c.react.symbol} } from '@aurum/react'     ${c.react.file}`);
    if (c.flutter) out(`  Flutter: ${c.flutter.symbol}  (package:aurum_ui/aurum_ui.dart)     ${c.flutter.file}`);
    if (c.notes) out(`  Note: ${c.notes}`);
    if (c.origin) out(`  Borrowed from ${c.origin.source}: ${c.origin.notes ?? ''}`);
    const k = contracts.find((x) => x.component === c.name);
    if (!k) {
      out('\n  (One platform only, so no contract. Read the file for its props.)');
      return;
    }
    out('\n  Prop               React              Flutter            Notes');
    for (const p of k.props) {
      const side = (s) => {
        const n = s in p ? p[s] : p.name;
        return n === null ? '—' : n;
      };
      const notes = [p.values && p.values.join(' | '), p.note, p.why, p.todo && `TO DO: ${p.todo}`].filter(Boolean).join('. ');
      out(`  ${p.name.padEnd(18)} ${side('react').padEnd(18)} ${side('flutter').padEnd(18)} ${notes}`);
    }
  },

  async tokens() {
    const t = await import(join(root, 'packages/react/src/tokens/tokens.ts'));
    const group = args[0];
    const kebab = (k) => k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    const show = (name, css, dart, values) => {
      if (group && !name.startsWith(group)) return;
      out(`\n${name}  (CSS ${css} · Dart ${dart})`);
      out(`  ${values}`);
      if (/[A-Z]/.test(values) && css.includes('<')) out(`  CSS names are kebab-case: ${values.split(' ').map(kebab).join(' ')}`);
    };
    show('space', '--space-<n>', 'AurumSpace.s<n>', Object.keys(t.space).join(' '));
    show('radius', '--radius-<n>', 'context.aurumRadii.<n>', Object.keys(t.radius).join(' '));
    show('size', '--size-<name>', 'AurumSize.<name>', Object.keys(t.size).join(' '));
    show('type', 'class aurum-type-<role>, --type-<role>-size', 'context.aurumText(AurumType.<role>)', Object.keys(t.type).join(' '));
    show('color', '--color-<role>', 'context.aurum.<role>', Object.keys(t.color.light).join(' '));
    show('spring', '--spring-<name>-easing / -duration', 'AurumMotion.<name>', Object.keys(t.spring).join(' '));
    show('duration', '--duration-<name>', 'AurumMotion', Object.keys(t.duration).join(' '));
    show('material', '<Glass level> / --material-*', 'AurumMaterialLevel.<level>', Object.keys(t.material.blur).join(' '));
    show('haptic', "playHaptic('<intent>')", 'AurumHaptics.play(AurumHaptic.<intent>)', Object.keys(t.haptic).join(' '));
    show('z', '--z-<layer>', '(Flutter uses Overlay order)', Object.keys(t.z).join(' '));
  },

  kits() {
    for (const k of kits) {
      const inKit = components.filter((c) => c.kit === k.id).map((c) => c.name);
      const waiting = candidates.filter((c) => c.kit === k.id || c.tags.includes(k.id)).map((c) => c.name);
      out(`\n${k.id.padEnd(13)} ${k.status.padEnd(8)} ${k.description}`);
      if (inKit.length) out(`  in kit:     ${inKit.join(', ')}`);
      if (waiting.length) out(`  candidates: ${waiting.join(', ')}`);
    }
  },

  rules() {
    out(`Aurum house rules

1. Use Aurum components first (pnpm aurum list). Build new UI from them, not from raw HTML or Material widgets.
2. Use tokens, never raw values: colours, spacing, radii, type, motion (pnpm aurum tokens).
3. Every tap target is at least 48px. Every icon-only control has a label (aria-label / semanticLabel).
4. Motion uses the springs; reduced motion falls back to a fade. Haptics are opt-in, by meaning.
5. Glass only for controls floating over content, never on cards inside lists.
6. No Apple assets: no SF fonts, SF Symbols or Apple.com colours (pnpm guard). Icons are Phosphor.
7. New pieces start in the app. They join the library when a second app needs them (rule of two).
8. A component on both platforms has a contract (catalog/contracts). Change React and Flutter together.
9. Borrowed code (vendor/astryx) keeps its license and copyright line.
   Need one app to differ? pnpm aurum eject <component> --to <app folder>, instead of changing Aurum for everyone.
10. After changing tokens or the catalog: pnpm tokens, pnpm catalog. CI runs the checks.`);
  },

  // Copy a component's source file into an app, rewired to import the rest of Aurum from
  // the package. The copy is the app's to change. ejected.json records where it came from,
  // so `aurum ejected` can show what changed upstream since.
  eject() {
    const to = flag('to');
    const platform = flag('platform');
    const force = args.includes('--force');
    const valued = new Set(['--to', '--platform']);
    const q = args.filter((a, i) => !a.startsWith('--') && !valued.has(args[i - 1])).join(' ');
    const c = q && find(q);
    if (!c || !to) {
      out('Usage: pnpm aurum eject <component> --to <app folder> [--platform react|flutter] [--force]');
      process.exitCode = 1;
      return;
    }
    const sides = (platform ? [platform] : ['react', 'flutter']).filter((p) => c[p]);
    if (!sides.length) {
      out(`${c.name} has no ${platform} version.`);
      process.exitCode = 1;
      return;
    }
    const dest = resolve(to);
    const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim();
    const manifestPath = join(dest, 'ejected.json');
    const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { ejected: [] };
    const header = (file, comment) =>
      `${comment} Ejected from Aurum ${file} at ${commit} (\`pnpm aurum eject ${c.name}\`). This copy is yours to change.\n` +
      `${comment} See what changed upstream since: pnpm aurum ejected ${dest}\n`;

    // Plan every write first, so a refusal leaves the app folder untouched.
    const writes = []; // { from: repo path, to: absolute path, body }
    const plans = [];
    let hidden = [];
    for (const side of sides) {
      const file = c[side].file;
      let src = readFileSync(join(root, file), 'utf8');
      const copied = [file];
      if (side === 'react') {
        // Borrowed code isn't exported by @aurum/react, so its folder travels with the copy, license and all.
        for (const m of [...src.matchAll(/from '\.\.\/vendor\/([^/']+)\/[^']+'/g)]) {
          const vendorDir = join(root, 'packages/react/src/vendor', m[1]);
          for (const f of readdirSync(vendorDir)) {
            const relFile = relative(root, join(vendorDir, f));
            if (copied.includes(relFile)) continue;
            writes.push({ from: relFile, to: join(dest, 'vendor', m[1], f), body: readFileSync(join(vendorDir, f)) });
            copied.push(relFile);
          }
          src = src.replace(m[0], m[0].replace("'../vendor/", "'./vendor/"));
        }
        src = src.replace(/(from\s+)'\.{1,2}\/(?!vendor\/)[^']+'/g, "$1'@aurum/react'");
        writes.push({ from: file, to: join(dest, basename(file)), body: header(file, '//') + src });
        const css = file.replace(/\.tsx$/, '.css');
        if (existsSync(join(root, css))) {
          writes.push({ from: css, to: join(dest, basename(css)), body: header(css, '/*').replace(/\n/g, ' */\n') + readFileSync(join(root, css), 'utf8') });
          copied.push(css);
        }
      } else {
        const lines = src.split('\n');
        const rel = lines.filter((l) => /^import '\.{0,2}\/?[^:']+\.dart';$/.test(l) && !l.includes('package:'));
        src = lines.filter((l) => !rel.includes(l)).join('\n');
        // Everything public in the copy would clash with aurum_ui's export of the same name.
        const own = [...src.matchAll(/^(?:class|enum|typedef|mixin|extension)\s+([A-Z]\w*)|^[A-Za-z][\w<>?, ]*\s([a-z]\w*)(?:<[^>]*>)?\s*\(/gm)]
          .map((m) => m[1] ?? m[2])
          .filter((n) => n && !n.startsWith('_'));
        hidden = [...new Set(own)];
        if (rel.length) src = src.replace(/(import 'package:flutter\/[^']+';\n)/, `$1import 'package:aurum_ui/aurum_ui.dart' hide ${hidden.join(', ')};\n`);
        writes.push({ from: file, to: join(dest, basename(file)), body: header(file, '//') + src });
      }
      plans.push({ side, copied });
    }

    // Several components share one source file (Button, Switch and SegmentedControl live in
    // controls.tsx). A file this folder already holds is the app's own copy, maybe changed, so
    // it is never overwritten without --force. If an earlier eject wrote it from the same source
    // file, the copy already contains this component and is kept as it is.
    const recorded = new Set(manifest.ejected.flatMap((e) => e.files));
    const kept = [];
    const clashes = [];
    for (const w of writes) {
      if (force || !existsSync(w.to)) continue;
      if (recorded.has(w.from)) kept.push(w);
      else clashes.push(w);
    }
    if (clashes.length) {
      out(`Not ejecting ${c.name}: these files already exist and weren't written by an eject. Move them, or pass --force to overwrite them.`);
      for (const w of clashes) out(`  ${relative(process.cwd(), w.to) || w.to}`);
      process.exitCode = 1;
      return;
    }
    for (const w of writes) {
      if (kept.includes(w)) continue;
      mkdirSync(dirname(w.to), { recursive: true });
      writeFileSync(w.to, w.body);
    }
    for (const w of kept) out(`Kept your copy of ${relative(process.cwd(), w.to) || w.to}: it already has ${c.name} from an earlier eject (--force overwrites it).`);

    for (const { side, copied } of plans) {
      manifest.ejected = manifest.ejected.filter((e) => !(e.component === c.name && e.platform === side));
      manifest.ejected.push({ component: c.name, platform: side, files: copied, commit, date: new Date().toISOString().slice(0, 10) });
      out(`Ejected ${c.name} (${side}): ${copied.join(', ')} -> ${relative(process.cwd(), dest) || '.'}`);
    }
    mkdirSync(dest, { recursive: true });
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    if (sides.includes('flutter')) out(`Flutter: import your copy, and add \`hide ${hidden.join(', ')}\` where you import aurum_ui.`);
    if (sides.includes('react')) out('React: import the copy instead of @aurum/react for this component, and its .css after aurum.css.');
  },

  ejected() {
    const dir = resolve(args[0] ?? '.');
    const manifestPath = join(dir, 'ejected.json');
    if (!existsSync(manifestPath)) {
      out(`No ejected.json in ${dir}.`);
      process.exitCode = 1;
      return;
    }
    for (const e of JSON.parse(readFileSync(manifestPath, 'utf8')).ejected) {
      const changed = execFileSync('git', ['diff', '--stat', `${e.commit}..HEAD`, '--', ...e.files], { cwd: root }).toString().trim();
      out(`\n${e.component} (${e.platform}), ejected ${e.date} at ${e.commit}`);
      out(changed ? changed.replace(/^/gm, '  ') + `\n  Full diff: git -C ${root} diff ${e.commit}..HEAD -- ${e.files.join(' ')}` : '  No upstream changes.');
    }
  },

  help() {
    out(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 11).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  },
};

await (commands[cmd] ?? commands.help)();
