import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkFiles } from './app.mjs';

const kinds = (files) => checkFiles(files).map((f) => `${f.kind}:${f.path}:${f.line}`);

test('flags plain rounded rectangles, but not capsules, circles or squircles', () => {
  const css = [
    '.tile { border-radius: var(--radius-lg); }',
    '.pill { border-radius: var(--radius-pill); }',
    '.dot { border-radius: 50%; }',
    '.card { --aurum-radius: var(--radius-lg); border-radius: var(--aurum-radius); }',
    '.aurum-squircle.x { border-radius: 12px; }',
    '/* .old { border-radius: 8px; } */',
    '.skip { border-radius: 8px; /* aurum-check: ignore */ }',
  ].join('\n');
  assert.deepEqual(kinds([{ path: 'a.css', text: css }]), ['corners:a.css:1']);
});

test('explains mixed radii and space tokens used as radii', () => {
  const [mixed, space] = checkFiles([{ path: 'a.css', text: '.a { border-radius: 4px 8px; }\n.b { border-radius: var(--space-8); }' }]);
  assert.match(mixed.message, /one radius/);
  assert.match(space.message, /--radius-\* token instead of a space token/);
});

test('flags raw colours outside custom-property definitions', () => {
  const css = ':root { --brand-dot: #1db954; }\n.a { color: #fff; }\n.b { background: rgb(0 0 0 / 0.5); }\n.c { color: var(--color-accent); }';
  assert.deepEqual(kinds([{ path: 'a.css', text: css }]), ['colour:a.css:2', 'colour:a.css:3']);
});

test('flags hand-built nav bars and a missing autoSquircle call', () => {
  const tsx = 'export const Bar = () => <nav className="tabs"><div className="aurum-squircle" /></nav>;';
  assert.deepEqual(kinds([{ path: 'Bar.tsx', text: tsx }]), ['setup:(app):0', 'nav:Bar.tsx:1']);
  const withSetup = [{ path: 'Bar.tsx', text: tsx }, { path: 'main.tsx', text: 'autoSquircle();' }];
  assert.deepEqual(kinds(withSetup), ['nav:Bar.tsx:1']);
});
