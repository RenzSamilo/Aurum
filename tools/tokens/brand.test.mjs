import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';
import { brandTokens, loadBrand } from './brand.mjs';
import { contrast } from './color.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const scratch = await mkdtemp(join(tmpdir(), 'aurum-success-test-'));
after(() => rm(scratch, { recursive: true, force: true }));
let fixtureId = 0;
const green = { hue: 148, chroma: 0.14, lightnessLight: 0.46, lightnessDark: 0.74, chromaDark: 0.17 };
const customAccent = { hue: 35, chroma: 0.14, lightnessLight: 0.48, lightnessDark: 0.79, chromaDark: 0.09 };

async function brandFile(raw) {
  const path = join(scratch, `${++fixtureId}.json`);
  await writeFile(path, typeof raw === 'string' ? raw : JSON.stringify(raw));
  return path;
}

async function colors(raw) {
  return brandTokens(await loadBrand(await brandFile(raw))).color;
}

async function build(raw) {
  const path = await brandFile(raw);
  const result = spawnSync(process.execPath, [
    'tools/tokens/build.mjs', '--brand', path, '--css', `${path}.css`, '--dart', `${path}.dart`,
  ], { cwd: root, encoding: 'utf8' });
  assert.ifError(result.error);
  return {
    ...result,
    css: result.status === 0 ? await readFile(`${path}.css`, 'utf8') : null,
    dart: result.status === 0 ? await readFile(`${path}.dart`, 'utf8') : null,
  };
}

function cssModes(css) {
  const block = (selector) => {
    const start = css.indexOf(`${selector} {\n`);
    assert.ok(start >= 0, `Missing CSS selector ${selector}`);
    const body = css.slice(start).split('}')[0];
    return Object.fromEntries([...body.matchAll(/--([\w-]+): ([^;]+);/g)].map((m) => [m[1], m[2]]));
  };
  const light = block(':root');
  const dark = { ...light, ...block(':root[data-theme="dark"]') };
  return {
    light, dark,
    contrastLight: { ...light, ...block(':root[data-contrast="more"]') },
    contrastDark: { ...dark, ...block(':root[data-contrast="more"][data-theme="dark"]') },
  };
}

function dartModes(dart) {
  return Object.fromEntries([...dart.matchAll(/  (light|dark|contrastLight|contrastDark): AurumColors\(\n([\s\S]*?)\n  \)/g)]
    .map((m) => [m[1], Object.fromEntries([...m[2].matchAll(/    (\w+): ([^\n]+),/g)].map((v) => [v[1], v[2]]))]));
}

function dartRgb(value) {
  const match = /^Color\(0xFF(\w{2})(\w{2})(\w{2})\)$/.exec(value);
  assert.ok(match, `Expected opaque Dart colour: ${value}`);
  return `rgb(${match.slice(1).map((v) => parseInt(v, 16)).join(' ')})`;
}

test('explicit green success overrides the ember accent in brand tokens', async () => {
  const color = await colors({ name: 'Custom', accent: customAccent, success: green });
  assert.deepEqual(color['brand-success'], {
    light: { $value: 'oklch(0.46 0.14 148)' }, dark: { $value: 'oklch(0.74 0.17 148)' },
  });
  assert.deepEqual(color['brand-accent'], {
    light: { $value: 'oklch(0.48 0.14 35)' }, dark: { $value: 'oklch(0.79 0.09 35)' },
  });
});

test('omitted and empty success inherit resolved accent, including chromaDark', async () => {
  for (const path of ['tokens/brand/aurum.json', 'tokens/brand/examples/ember.json']) {
    const raw = JSON.parse(await readFile(join(root, path), 'utf8'));
    for (const extra of [{}, { success: {} }]) {
      const color = await colors({ ...raw, ...extra });
      assert.deepEqual(color['brand-success'], color['brand-accent'], path);
    }
  }
  for (const extra of [{}, { success: {} }]) {
    const color = await colors({ name: 'Custom', accent: customAccent, ...extra });
    assert.deepEqual(color['brand-success'], {
      light: { $value: 'oklch(0.48 0.14 35)' }, dark: { $value: 'oklch(0.79 0.09 35)' },
    });
    const defaults = await colors({ name: 'Defaults', ...extra });
    assert.deepEqual(defaults['brand-success'], {
      light: { $value: 'oklch(0.48 0.09 175)' }, dark: { $value: 'oklch(0.79 0.09 175)' },
    });
  }
});

test('partial success falls back per field and prefers its own chroma in dark mode', async () => {
  const cases = [
    [{ hue: 148 }, 'oklch(0.48 0.14 148)', 'oklch(0.79 0.09 148)'],
    [{ chroma: 0.12 }, 'oklch(0.48 0.12 35)', 'oklch(0.79 0.12 35)'],
    [{ chromaDark: 0.07 }, 'oklch(0.48 0.14 35)', 'oklch(0.79 0.07 35)'],
    [{ chroma: 0.12, chromaDark: 0.07 }, 'oklch(0.48 0.12 35)', 'oklch(0.79 0.07 35)'],
    [{ lightnessLight: 0.46 }, 'oklch(0.46 0.14 35)', 'oklch(0.79 0.09 35)'],
    [{ lightnessDark: 0.74 }, 'oklch(0.48 0.14 35)', 'oklch(0.74 0.09 35)'],
    [{ hue: 0, chroma: 0, lightnessLight: 0, lightnessDark: 0, chromaDark: 0 }, 'oklch(0 0 0)', 'oklch(0 0 0)'],
  ];
  for (const [success, light, dark] of cases) {
    const color = await colors({ name: 'Custom', accent: customAccent, success });
    assert.deepEqual(color['brand-success'], { light: { $value: light }, dark: { $value: dark } });
  }
});

test('loadBrand rejects non-object success with a field error', async () => {
  for (const success of [null, [], 1, 'green', true]) {
    await assert.rejects(loadBrand(await brandFile({ name: 'Invalid', success })), /"success".*object/);
  }
});

test('loadBrand rejects unknown success keys, including object prototype names', async () => {
  for (const field of ['typo', 'toString', '__proto__', 'constructor']) {
    const path = await brandFile(`{"name":"Invalid","success":{"${field}":0}}`);
    await assert.rejects(loadBrand(path), (error) => error.message.includes(`"success.${field}"`));
  }
});

test('loadBrand accepts numeric bounds and rejects invalid or nonfinite success values', async () => {
  for (const [field, max] of Object.entries({ hue: 360, chroma: 0.37, lightnessLight: 1, lightnessDark: 1, chromaDark: 0.37 })) {
    for (const value of [0, max]) {
      const brand = await loadBrand(await brandFile({ name: 'Valid', success: { [field]: value } }));
      assert.equal(brand.success[field], value);
    }
    for (const value of [-0.01, max + 0.01, null, '0', true, [], {}]) {
      const path = await brandFile({ name: 'Invalid', success: { [field]: value } });
      await assert.rejects(loadBrand(path), (error) => error.message.includes(`"success.${field}"`));
    }
    for (const value of ['1e400', '-1e400']) {
      const path = await brandFile(`{"name":"Invalid","success":{"${field}":${value}}}`);
      await assert.rejects(loadBrand(path), (error) => error.message.includes(`"success.${field}"`));
    }
  }
});

test('green success changes only success in generated CSS and Dart across all four modes', async (t) => {
  const raw = JSON.parse(await readFile(join(root, 'tokens/brand/examples/ember.json'), 'utf8'));
  const baseline = await build(raw);
  const empty = await build({ ...raw, success: {} });
  const custom = await build({ ...raw, success: green });
  for (const result of [baseline, empty, custom]) assert.equal(result.status, 0, result.stderr);
  assert.equal(empty.css, baseline.css);
  assert.equal(empty.dart, baseline.dart);
  assert.equal(custom.css.replaceAll(/--color-success: [^;]+;/g, '--color-success: omitted;'),
    baseline.css.replaceAll(/--color-success: [^;]+;/g, '--color-success: omitted;'));
  assert.equal(custom.dart.replaceAll(/    success: [^\n]+/g, '    success: omitted,'),
    baseline.dart.replaceAll(/    success: [^\n]+/g, '    success: omitted,'));
  const baseCss = cssModes(baseline.css);
  const customCss = cssModes(custom.css);
  const baseDart = dartModes(baseline.dart);
  const customDart = dartModes(custom.dart);
  assert.deepEqual(Object.keys(customDart), ['light', 'dark', 'contrastLight', 'contrastDark']);
  for (const [mode, values] of Object.entries(customCss)) {
    const dark = mode === 'dark' || mode === 'contrastDark';
    assert.equal(values['color-success'], dark ? 'oklch(0.74 0.17 148)' : 'oklch(0.46 0.14 148)');
    assert.equal(baseCss[mode]['color-success'], baseCss[mode]['color-accent']);
    assert.deepEqual(Object.keys(values).filter((k) => values[k] !== baseCss[mode][k]), ['color-success']);
    assert.equal(customDart[mode].success, dark ? 'Color(0xFF50C76A)' : 'Color(0xFF006C24)');
    assert.deepEqual(Object.keys(customDart[mode]).filter((k) => customDart[mode][k] !== baseDart[mode][k]), ['success']);
    const cssRatios = [];
    const dartRatios = [];
    for (const [surface, dartSurface] of Object.entries({ canvas: 'surfaceCanvas', card: 'surfaceCard', inset: 'surfaceInset', elevated: 'surfaceElevated' })) {
      const cssRatio = contrast(values['color-success'], values[`color-surface-${surface}`]);
      const dartRatio = contrast(dartRgb(customDart[mode].success), dartRgb(customDart[mode][dartSurface]));
      assert.ok(cssRatio >= 4.5, `${mode} CSS success on ${surface}`);
      assert.ok(dartRatio >= 4.5, `${mode} Dart success on ${surface}`);
      cssRatios.push(cssRatio);
      dartRatios.push(dartRatio);
    }
    t.diagnostic(`${mode}: only success changed; minimum contrast CSS ${Math.min(...cssRatios).toFixed(2)}:1, Dart ${Math.min(...dartRatios).toFixed(2)}:1`);
  }
});

test('generation rejects success that fails contrast', async () => {
  const ember = JSON.parse(await readFile(join(root, 'tokens/brand/examples/ember.json'), 'utf8'));
  const result = await build({ ...ember, success: { ...green, lightnessLight: 0.9 } });
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, /light: color-success on color-surface-.*needs 4.5:1/);
  assert.match(result.stderr, /contrastLight: color-success on color-surface-.*needs 4.5:1/);
});
