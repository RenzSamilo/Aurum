#!/usr/bin/env node
// Screenshots of the docs app (apps/docs) for the README: light and dark,
// desktop and phone width. Run `pnpm docs:build` first.
//
//   pnpm readme:shots   ->  docs/assets/screens/web-{light,dark}-{desktop,phone}.png
//

import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
const dist = join(root, 'apps/docs/dist');
const out = join(root, 'docs/assets/screens');
if (!existsSync(join(dist, 'index.html'))) throw new Error('Run `pnpm docs:build` first: apps/docs/dist/index.html is missing.');
mkdirSync(out, { recursive: true });

// Playwright is not a dependency of this repo; use the one installed on the machine (as tools/bench does).
const { chromium } = createRequire(join(process.cwd(), 'noop.js'))('playwright');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  let file = join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(dist) || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/`;

const sizes = {
  desktop: { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  for (const [name, size] of Object.entries(sizes)) {
    const context = await browser.newContext({ ...size, colorScheme: scheme, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const path = join(out, `web-${scheme}-${name}.png`);
    await page.screenshot({ path });
    console.log(`Wrote ${path.slice(root.length + 1)}`);
    await context.close();
  }
}
await browser.close();
server.close();
