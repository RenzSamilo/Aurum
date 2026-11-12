// Builds dist/: JavaScript + type declarations (tsc) and the CSS files, so apps
// can install @aurum/react from git without compiling Aurum's TypeScript under
// their own tsconfig. dist/ is committed; CI fails if it is out of date.

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(pkg, 'src');
const dist = join(pkg, 'dist');

rmSync(dist, { recursive: true, force: true });
execFileSync(process.execPath, [join(pkg, 'node_modules/typescript/bin/tsc'), '-p', join(pkg, 'tsconfig.build.json')], {
  stdio: 'inherit',
});

// tsc copies only code. Copy the stylesheets and the vendored licenses next to it.
for (const entry of readdirSync(src, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/\.css$|^LICENSE$|^README\.md$/.test(entry.name)) continue;
  const from = join(entry.parentPath, entry.name);
  cpSync(from, join(dist, relative(src, from)));
}
// Fully specified imports ('./haptics.js'), so strict ESM resolvers (Node, webpack
// in Next.js) load dist/ as well as Vite does.
const specifier = /((?:from|import)\s*['"])(\.{1,2}\/[^'"]+?)(['"])/g;
for (const entry of readdirSync(dist, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/\.(js|d\.ts)$/.test(entry.name)) continue;
  const file = join(entry.parentPath, entry.name);
  const code = readFileSync(file, 'utf8').replace(specifier, (all, head, path, tail) => {
    if (/\.(js|css|json)$/.test(path)) return all;
    const base = join(entry.parentPath, path);
    if (existsSync(`${base}.js`)) return `${head}${path}.js${tail}`;
    if (existsSync(join(base, 'index.js'))) return `${head}${path}/index.js${tail}`;
    throw new Error(`${relative(pkg, file)}: cannot resolve ${path}`);
  });
  writeFileSync(file, code);
}
console.log('Built packages/react/dist');
