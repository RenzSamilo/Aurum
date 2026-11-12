// Component contracts: one prop list per component, shared by React and Flutter.
//
// catalog/contracts/<component>.json names each prop once, says what it is called on each
// platform, and explains every difference: `why` for an intentional platform-only prop,
// `todo` for a gap to close. The check reads the real React props interface and the real
// Flutter constructor (or function), so a prop added on one side only fails CI until the
// contract says what the other side does.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SIDES = ['react', 'flutter'];
// Plumbing every component has; not part of the design contract.
const IGNORE = { react: new Set(['ref', 'className']), flutter: new Set(['key', 'context']) };

function matchBlock(src, openIdx, open = '{', close = '}') {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === open) depth++;
    else if (src[i] === close && --depth === 0) return src.slice(openIdx + 1, i);
  }
  return null;
}

function splitTop(body) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const ch of body) {
    if ('([{<'.includes(ch)) depth++;
    if (')]}>'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const literalUnion = (t) => (/^'[^']*'(\s*\|\s*'[^']*')*$/.test(t) ? [...t.matchAll(/'([^']*)'/g)].map((m) => m[1]) : null);

// --- React -------------------------------------------------------------------
export function readReactProps(file, iface) {
  const src = stripComments(readFileSync(file, 'utf8'));
  const head = new RegExp(`export\\s+interface\\s+${iface}\\b[^{]*\\{`).exec(src);
  if (!head) return null;
  const body = matchBlock(src, head.index + head[0].length - 1);
  const props = new Map();
  let depth = 0;
  for (const line of body.split('\n')) {
    if (depth === 0) {
      const m = /^\s*('?[\w-]+'?)\??\s*:\s*(.+?);?\s*$/.exec(line);
      if (m) {
        const name = m[1].replace(/'/g, '');
        const type = m[2].trim();
        const alias = /^\w+$/.test(type) ? new RegExp(`export\\s+type\\s+${type}\\s*=\\s*([^;]+);`).exec(src) : null;
        props.set(name, { type, values: literalUnion(type) ?? (alias ? literalUnion(alias[1].trim()) : null) });
      }
    }
    depth += (line.match(/[{(]/g) ?? []).length - (line.match(/[})]/g) ?? []).length;
  }
  return props;
}

// --- Flutter -----------------------------------------------------------------
export function readFlutterParams(file, symbol) {
  const src = stripComments(readFileSync(file, 'utf8').replace(/^\s*\/\/\/.*$/gm, ''));
  const head = new RegExp(`(?:const\\s+${symbol}|\\s${symbol}(?:<[^>]*>)?)\\s*\\(\\s*\\{`).exec(src);
  if (!head) return null;
  const body = matchBlock(src, head.index + head[0].length - 1);
  const enums = new Map();
  for (const m of src.matchAll(/enum\s+(\w+)\s*\{/g)) {
    const enumBody = matchBlock(src, m.index + m[0].length - 1).split(';')[0];
    enums.set(m[1], splitTop(enumBody).map((v) => /^\w+/.exec(v)[0]));
  }
  const params = new Map();
  for (const raw of splitTop(body)) {
    const p = raw.replace(/^required\s+/, '').split('=')[0].trim();
    let name;
    let type;
    if (/^(this|super)\./.test(p)) {
      name = p.split('.')[1];
      const field = new RegExp(`final\\s+([\\w<>?, ]+?)\\s+${name}\\s*;`).exec(src);
      type = field?.[1];
    } else {
      const m = /^(.+?)\s+(\w+)$/.exec(p);
      if (!m) continue;
      [, type, name] = m;
    }
    const base = type?.replace(/\?$/, '');
    params.set(name, { type, values: enums.get(base) ?? null });
  }
  return params;
}

// --- Check -------------------------------------------------------------------
export function checkContracts(root, components, fail) {
  const dir = join(root, 'catalog/contracts');
  const contracts = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .sort()
        .map((f) => ({ file: `catalog/contracts/${f}`, ...JSON.parse(readFileSync(join(dir, f), 'utf8')) }))
    : [];
  const byName = new Map(components.map((c) => [c.name, c]));
  const covered = new Set(contracts.map((c) => c.component));
  for (const c of components) {
    if (c.react && c.flutter && !covered.has(c.name)) fail(`"${c.name}" is built for React and Flutter but has no contract in catalog/contracts/`);
  }

  for (const k of contracts) {
    const where = k.file;
    const comp = byName.get(k.component);
    if (!comp) {
      fail(`${where}: no component named "${k.component}" in components.json`);
      continue;
    }
    const actual = {
      react: comp.react && readReactProps(join(root, comp.react.file), k.react?.props),
      flutter: comp.flutter && readFlutterParams(join(root, comp.flutter.file), k.flutter?.symbol),
    };
    if (comp.react && !actual.react) fail(`${where}: interface ${k.react?.props} not found in ${comp.react.file}`);
    if (comp.flutter && !actual.flutter) fail(`${where}: ${k.flutter?.symbol}({...}) not found in ${comp.flutter.file}`);
    if (!actual.react || !actual.flutter) continue;

    const seen = { react: new Set(), flutter: new Set() };
    const names = new Set();
    for (const p of k.props) {
      if (names.has(p.name)) fail(`${where}: prop "${p.name}" listed twice`);
      names.add(p.name);
      for (const side of SIDES) {
        const sideName = side in p ? p[side] : p.name;
        if (sideName === null) {
          if (!p.why && !p.todo) fail(`${where}: "${p.name}" has no ${side} version; add "why" (on purpose) or "todo" (a gap)`);
          continue;
        }
        seen[side].add(sideName);
        if (p.inherited?.includes(side)) continue;
        const real = actual[side].get(sideName);
        if (!real) {
          fail(`${where}: "${p.name}" expects ${side} prop "${sideName}", which ${side === 'react' ? k.react.props : k.flutter.symbol} doesn't have`);
          continue;
        }
        if (p.values && real.values) {
          const want = p.values.filter((v) => !(p.missing?.[side] ?? []).includes(v));
          if (want.join('|') !== real.values.join('|')) {
            fail(`${where}: "${p.name}" on ${side} has [${real.values.join(', ')}], contract expects [${want.join(', ')}]. Add the value, or list it under "missing" with a "todo".`);
          }
        }
      }
      if (p.missing && !p.todo) fail(`${where}: "${p.name}" lists missing values; add a "todo" saying what to build`);
    }
    for (const side of SIDES) {
      for (const name of actual[side].keys()) {
        if (!IGNORE[side].has(name) && !seen[side].has(name)) {
          fail(`${where}: ${side} has prop "${name}" that the contract doesn't list. Add it, and say what the other platform does.`);
        }
      }
    }
  }
  return contracts;
}

// --- Report --------------------------------------------------------------------
export function renderContracts(contracts) {
  const show = (p, side) => {
    const n = side in p ? p[side] : p.name;
    if (n === null) return '—';
    const miss = p.missing?.[side];
    return `\`${n}\`${miss ? ` (no ${miss.join(', ')})` : ''}`;
  };
  const gaps = contracts.flatMap((k) => k.props.filter((p) => p.todo).map((p) => `- [ ] **${k.component}**: ${p.todo}`));
  const sections = contracts.map((k) => {
    const rows = k.props.map((p) => {
      const notes = [p.values ? `${p.values.join(' / ')}.` : '', p.note ?? '', p.why ?? '', p.todo ? `**To do:** ${p.todo}` : '']
        .filter(Boolean)
        .join(' ');
      return `| ${p.name} | ${show(p, 'react')} | ${show(p, 'flutter')} | ${notes} |`;
    });
    return `### ${k.component}\n\n\`${k.react.props}\` · \`${k.flutter.symbol}\`\n\n| Prop | React | Flutter | Notes |\n| --- | --- | --- | --- |\n${rows.join('\n')}`;
  });
  return `<!-- Generated by tools/catalog/build.mjs from catalog/contracts/*.json. Do not edit by hand: run \`pnpm catalog\`. -->

# Aurum component contracts

Each component has one list of props shared by React and Flutter. A prop added on only one side fails CI until its contract says what the other side does: a different name, an intentional difference (why), or a gap to close (to do).

## Gaps to close (${gaps.length})

${gaps.length ? gaps.join('\n') : 'None. React and Flutter match.'}

## Components

${sections.join('\n\n')}
`;
}
