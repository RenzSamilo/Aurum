#!/usr/bin/env node
// Fails if Apple-only assets or Apple.com brand colours end up in Aurum's code.
// Aurum is inspired by Apple's HIG; it must never ship Apple's fonts, symbols or brand.
//
// Scans code, tokens and asset folders. Markdown is skipped so docs can name what we avoid.

import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const SCAN = ['tokens', 'packages', 'apps'];
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.dart_tool', 'Pods', '.gradle', 'ephemeral']);
const TEXT_EXT = new Set(['.css', '.scss', '.ts', '.tsx', '.js', '.mjs', '.jsx', '.json', '.dart', '.yaml', '.yml', '.html', '.svg', '.plist', '.xml']);
const FONT_EXT = new Set(['.ttf', '.otf', '.woff', '.woff2']);

const RULES = [
  { name: 'Apple SF fonts', re: /\bSF[\s-]?(Pro|Compact|Mono|Arabic|Armenian|Georgian|Hebrew)\b|SFPro|SFCompact|SFMono|\.SFNS/i },
  { name: 'SF Symbols', re: /SF[\s-]?Symbols|\.sfsymbols/i },
  { name: 'Apple New York font', re: /["']New York["']|NewYork(Small|Medium|Large|ExtraLarge)/ },
  { name: 'Apple.com brand colour', re: /#(f5f5f7|1d1d1f|0071e3|86868b|6e6e73)\b/i },
];

const findings = [];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (FONT_EXT.has(ext) && /^(SF|NewYork)/i.test(entry.name)) {
      findings.push(`${relative(root, path)}: Apple font file`);
      continue;
    }
    if (!TEXT_EXT.has(ext)) continue;
    const lines = (await readFile(path, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      for (const rule of RULES) if (rule.re.test(line)) findings.push(`${relative(root, path)}:${i + 1}: ${rule.name}: ${line.trim().slice(0, 120)}`);
    });
  }
}

for (const dir of SCAN) await walk(join(root, dir)).catch((e) => (e.code === 'ENOENT' ? null : Promise.reject(e)));

if (findings.length) {
  console.error(`License guard failed. Aurum must not ship Apple assets or Apple.com brand colours:\n${findings.map((f) => `  ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('License guard passed: no Apple fonts, symbols or Apple.com brand colours.');
