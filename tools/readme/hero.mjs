#!/usr/bin/env node
// Builds docs/assets/hero.svg (README hero) and docs/assets/social-preview.png
// from the generated palette swatches in tokens/brand/swatches/. Colours come
// from the swatches themselves, so the hero follows the tokens.
//
//   node tools/readme/hero.mjs          # SVG only
//   node tools/readme/hero.mjs --png    # also the 1280x640 social preview (needs Playwright)

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
const swatchDir = join(root, 'tokens/brand/swatches');
const out = join(root, 'docs/assets');

// Default palette first, then the rest alphabetically.
const files = (await readdir(swatchDir)).filter((f) => f.endsWith('.svg')).sort((a, b) => (a === 'aurum.svg' ? -1 : b === 'aurum.svg' ? 1 : a.localeCompare(b)));
const inner = async (f) => (await readFile(join(swatchDir, f), 'utf8')).replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Pull the default palette's light canvas, card, text and accent colours from its swatch.
const def = await inner('aurum.svg');
const fills = [...def.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1]);
const [canvas, card, text, secondaryText, accent, , secondary] = fills;

const W = 1280, H = 640, cols = 3, scale = 0.6, sw = 360 * scale, sh = 184 * scale, gap = 18;
const gridW = cols * sw + (cols - 1) * gap, gridH = Math.ceil(files.length / cols) * sh + (Math.ceil(files.length / cols) - 1) * gap;
const gx = W - 64 - gridW, gy = (H - gridH) / 2;

const cells = await Promise.all(files.map(async (f, i) => {
  const x = gx + (i % cols) * (sw + gap), y = gy + Math.floor(i / cols) * (sh + gap);
  return `  <svg x="${x}" y="${y}" width="${sw}" height="${sh}" viewBox="0 0 360 184">${await inner(f)}</svg>`;
}));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Aurum design system: nine palettes in light and dark">
  <rect width="${W}" height="${H}" fill="${canvas}"/>
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="40" fill="${card}"/>
  <text x="64" y="270" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="${text}">Aurum</text>
  <text x="66" y="324" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="26" fill="${secondaryText}">A calm, tactile design system.</text>
  <text x="66" y="362" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="26" fill="${secondaryText}">One token file, React and Flutter.</text>
  <rect x="64" y="404" width="236" height="56" rx="28" fill="${accent}"/>
  <text x="182" y="439" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="${card}">${files.length} palettes</text>
${cells.join('\n')}
</svg>
`;
await writeFile(join(out, 'hero.svg'), svg);
console.log('Wrote docs/assets/hero.svg');

if (process.argv.includes('--png')) {
  // Playwright is not a dependency of this repo; use the one installed on the machine (as tools/bench does).
  const { chromium } = createRequire(join(process.cwd(), 'noop.js'))('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.setContent(`<style>html,body{margin:0}</style>${svg}`);
  await page.screenshot({ path: join(out, 'social-preview.png') });
  await browser.close();
  console.log('Wrote docs/assets/social-preview.png');
}
