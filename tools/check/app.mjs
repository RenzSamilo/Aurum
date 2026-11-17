// `aurum check <app dir>`: finds the places an app drifts from Aurum's look, so an agent
// can fix them before a person notices. It reads the app's CSS and TSX/JSX files (not
// node_modules, dist or generated token files) and reports:
//
//   corners  rounded rectangles drawn with plain border-radius: circular corners, not continuous (G2)
//   nav      hand-built <nav> bars where TabBar or FloatingTabBar would give glass for free
//   colour   raw colours (#hex, rgb(), hsl(), oklch()) outside a custom-property definition
//   setup    .aurum-squircle used in markup without autoSquircle(), so Safari shows circular corners
//
// Heuristics, not proof: a finding is a place to look. Lines with `aurum-check: ignore` are skipped.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', '.aurum', 'coverage', 'test-results', 'playwright-report']);
const GENERATED = /(aurum-tokens|tokens)\.css$|\.g\.dart$/;
// Radii that are already right: capsules and circles have no straight edge to ease into, so
// a continuous corner looks the same as a circular one. 0 and inherit are not corners.
const FINE_RADIUS = /^(0|0px|inherit|initial|unset|50%|999+px|9999px|var\(--radius-pill\)|var\(--aurum-radius[^)]*\))$/;
const RAW_COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/;

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(css|tsx|jsx)$/.test(name) && !GENERATED.test(name)) files.push(p);
  }
  return files;
}

/** CSS rule blocks with their selector and the line each declaration is on. Comments are blanked, keeping line numbers. */
function cssBlocks(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const blocks = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < clean.length; i++) {
    if (clean[i] === '{') {
      stack.push({ selector: clean.slice(start, i).trim(), open: i });
      start = i + 1;
    } else if (clean[i] === '}') {
      const b = stack.pop();
      if (b) blocks.push({ selector: b.selector, body: clean.slice(b.open + 1, i), offset: b.open + 1 });
      start = i + 1;
    } else if (clean[i] === ';' && stack.length) start = i + 1;
  }
  const lineAt = (idx) => clean.slice(0, idx).split('\n').length;
  return { blocks, lineAt, lines: src.split('\n') };
}

/** Pure check over in-memory files: [{ path, text }]. Returns findings sorted by file and line. */
export function checkFiles(files) {
  const findings = [];
  const add = (kind, path, line, message) => findings.push({ kind, path, line, message });
  let squircleInMarkup = false;
  let autoSquircleCalled = false;

  for (const { path, text } of files) {
    const ignored = (line) => /aurum-check:\s*ignore/.test(text.split('\n')[line - 1] ?? '');
    if (path.endsWith('.css')) {
      const { blocks, lineAt } = cssBlocks(text);
      for (const b of blocks) {
        if (b.selector.startsWith('@') && !b.selector.startsWith('@media') && !b.selector.startsWith('@supports')) continue;
        const continuous = /--aurum-radius|corner-shape/.test(b.body) || /aurum-squircle/.test(b.selector);
        for (const m of b.body.matchAll(/(?:^|[;\s])((?:border(?:-[a-z]+)*-radius)\s*:\s*([^;]+))/g)) {
          const value = m[2].trim();
          const line = lineAt(b.offset + m.index + m[0].indexOf(m[1]));
          if (ignored(line) || continuous) continue;
          if (value.split(/\s+/).every((v) => FINE_RADIUS.test(v))) continue;
          const parts = value.split(/\s+/);
          const fix =
            parts.length > 1
              ? 'Continuous corners take one radius: pick one --radius-* token, or mark the line aurum-check: ignore if the mixed shape is on purpose.'
              : /--space-/.test(value)
                ? `Use a --radius-* token instead of a space token, then set --aurum-radius to it and add class aurum-squircle.`
                : `Set --aurum-radius: ${value} and add class aurum-squircle (or use <Squircle>/<Card>).`;
          add('corners', path, line, `${b.selector}: ${m[1].trim()} gives circular corners. ${fix}`);
        }
        for (const m of b.body.matchAll(/(?:^|[;\s])([a-z-]+)\s*:\s*([^;]+)/g)) {
          const [, prop, value] = m;
          if (prop.startsWith('--')) continue;
          const line = lineAt(b.offset + m.index + m[0].indexOf(prop));
          if (ignored(line) || !RAW_COLOUR.test(value)) continue;
          add('colour', path, line, `${b.selector}: ${prop} uses a raw colour. Use a --color-* token.`);
        }
      }
    } else {
      const lines = text.split('\n');
      lines.forEach((l, i) => {
        if (/aurum-squircle/.test(l)) squircleInMarkup = true;
        if (/autoSquircle\s*\(/.test(l)) autoSquircleCalled = true;
        if (/<nav\b/.test(l) && !ignored(i + 1)) {
          add('nav', path, i + 1, 'Hand-built <nav>. For bottom tabs use FloatingTabBar (glass capsule) or TabBar from @aurum/react.');
        }
      });
    }
  }
  if (squircleInMarkup && !autoSquircleCalled) {
    add('setup', '(app)', 0, 'Markup uses aurum-squircle but nothing calls autoSquircle(). Call it once in main.tsx so Safari and Firefox get continuous corners too.');
  }
  return findings.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
}

export function checkApp(dir) {
  const files = walk(dir).map((p) => ({ path: relative(dir, p), text: readFileSync(p, 'utf8') }));
  return { files: files.length, findings: checkFiles(files) };
}
