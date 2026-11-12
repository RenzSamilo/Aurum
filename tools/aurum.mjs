#!/usr/bin/env node
// Aurum cheat sheet for people and coding agents. Reads the catalog, the contracts and
// the generated tokens, so it is always current. Run it before building a screen.
//
//   pnpm aurum list [--shelf core|pattern|kit] [--tag fitness]   components, by shelf
//   pnpm aurum show <component>                                  props on React and Flutter, files, notes
//   pnpm aurum tokens [group]                                    token names for CSS and Dart
//   pnpm aurum kits                                              topic kits and candidates
//   pnpm aurum rules                                             the house rules, in one screen

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
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
10. After changing tokens or the catalog: pnpm tokens, pnpm catalog. CI runs the checks.`);
  },

  help() {
    out(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  },
};

await (commands[cmd] ?? commands.help)();
