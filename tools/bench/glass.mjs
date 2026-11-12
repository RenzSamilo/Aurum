#!/usr/bin/env node
// Glass performance bench. Serves the built docs app and runs glass-bench.html
// (Aurum glass over an animated WebGL canvas) in a phone profile, once per mode:
// none (canvas only), opaque (solid surfaces), translucent (glass). Prints frame
// rate, median and 95th-percentile frame time, and the share of janky frames.
//
//   pnpm build && pnpm bench:glass                      # Chromium, iPhone 11 profile, CPU x4 slower
//   pnpm bench:glass --engine webkit                   # Playwright WebKit (npx playwright install webkit)
//   pnpm bench:glass --runs 5 --seconds 8 --throttle 1
//
// Software-rendered (headless, no GPU) numbers are for comparing modes, not
// absolute phone frame rates. Confirm on a real iPhone: open glass-bench.html
// from `pnpm dev` over the LAN and read the page title.

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = join(root, 'apps/docs/dist');
const { values: args } = parseArgs({
  options: {
    engine: { type: 'string', default: 'chromium' },
    runs: { type: 'string', default: '3' },
    seconds: { type: 'string', default: '6' },
    throttle: { type: 'string', default: '4' },
  },
});
if (!existsSync(join(dist, 'glass-bench.html'))) throw new Error('Run `pnpm build` first: apps/docs/dist/glass-bench.html is missing.');

// Playwright is not a dependency of this repo; use the one installed on the machine.
const require = createRequire(join(process.cwd(), 'noop.js'));
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = createRequire(import.meta.url)('playwright');
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const file = join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(dist) || !existsSync(file) || statSync(file).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const engine = playwright[args.engine];
const browser = await engine.launch();
const device = { ...playwright.devices['iPhone 11'] };
delete device.defaultBrowserType;
if (args.engine === 'firefox') delete device.isMobile;

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const rows = [];
for (const mode of ['none', 'opaque', 'translucent']) {
  const runs = [];
  for (let i = 0; i < Number(args.runs); i++) {
    const context = await browser.newContext(device);
    const page = await context.newPage();
    if (args.engine === 'chromium' && Number(args.throttle) > 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(args.throttle) });
    }
    await page.goto(`${base}/glass-bench.html?mode=${mode}&seconds=${args.seconds}`);
    await page.waitForFunction(() => window.__bench, null, { timeout: (Number(args.seconds) + 30) * 1000 });
    runs.push(await page.evaluate(() => window.__bench));
    await context.close();
  }
  rows.push({
    mode,
    fps: median(runs.map((r) => r.fps)),
    p50: median(runs.map((r) => r.p50)),
    p95: median(runs.map((r) => r.p95)),
    jank: median(runs.map((r) => r.jank)),
  });
}
await browser.close();
server.close();

const none = rows[0].fps;
console.log(`Glass bench: ${args.engine}, iPhone 11 profile (414x896 @2x)${args.engine === 'chromium' ? `, CPU x${args.throttle} slower` : ''}, median of ${args.runs} runs x ${args.seconds}s`);
console.log('mode         fps    p50 ms  p95 ms  jank %  vs canvas only');
for (const r of rows) {
  console.log(
    `${r.mode.padEnd(12)} ${String(r.fps).padStart(5)}  ${String(r.p50).padStart(6)}  ${String(r.p95).padStart(6)}  ${String(r.jank).padStart(6)}  ${((r.fps / none) * 100).toFixed(0)}%`,
  );
}
