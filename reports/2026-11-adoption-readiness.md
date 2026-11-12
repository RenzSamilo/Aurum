# Aurum adoption readiness (Nov 2026)

## 1. Status

All four tasks are in one PR, one commit each, because this session can push only one branch: [#13](https://github.com/RenzSamilo/Aurum/pull/13).

- **Installable from another repo: done.** `@aurum/react` ships a built `dist/` (JS, types, CSS). Tested from outside the repo: pnpm install pinned to a commit and to a tag, a strict-tsconfig Vite app, the Flutter git dependency, a brand build and eject.
- **Web gaps: done.** TextField, TabBar, TopBar + BackButton, ProgressRing, Avatar and Badge each have a contract, axe tests and a docs preview.
- **Web glass gaps: done.** Button `glass`, Card `material`, Segmented `glass`, plus Glass `tint` and `rim`. Glass `lifted` is still open.
- **Glass performance: done**, with one caveat: it was measured in WebKitGTK, because the Playwright WebKit download is blocked in the cloud. See [docs/GLASS-PERFORMANCE.md](../docs/GLASS-PERFORMANCE.md).

## 2. How an app installs Aurum

Pin **`aurum-v0.1.0`**. The tag doesn't exist yet: after merging, publish a GitHub release with that tag on `main`. Full guide: [docs/USING-AURUM.md](../docs/USING-AURUM.md).

```sh
# React
pnpm add "github:RenzSamilo/Aurum#aurum-v0.1.0&path:/packages/react"
# Tools (token build, cheat sheet), ignored by git
git clone --depth 1 --branch aurum-v0.1.0 https://github.com/RenzSamilo/Aurum.git .aurum
pnpm --dir .aurum install --frozen-lockfile --filter aurum
node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --css src/aurum-tokens.css   # or --dart lib/aurum_brand.g.dart
```

Flutter `pubspec.yaml`: `aurum_ui: { git: { url: https://github.com/RenzSamilo/Aurum.git, path: packages/flutter, ref: aurum-v0.1.0 } }`

## 3. Gaps still open

- [ ] **Glass**: web `lifted` shadow. Safari's squircle clip cuts off a box-shadow, so this needs a wrapper like Card's.
- [ ] **Segmented control**: a whole-group `semanticLabel` in Flutter.
- Not in contracts: **Floating tab bar** is Flutter-only. Press scale is Flutter-only on purpose, because the web uses CSS `:active`.

## 4. Glass verdict for Keiz-HQ on iPhone 11: opaque

The test ran glass over an animated WebGL canvas in WebKit at 414×896 @2x, taking the median of 3 runs. The canvas alone ran at 31.2 fps (32 ms per frame). With an opaque overlay it ran at 26.0 fps (38 ms). With translucent glass it dropped to 17.1 fps (58 ms), so glass adds about 20 ms per frame. Chromium hides the cost (41.3 fps vs 39.5 fps). There was no GPU, so compare the rows with each other, not with a real phone. Use `"surfaces": { "material": "opaque" }`, or `setAurumPreferences({ transparency: 'reduced' })` while the 3D screen is open. Solid surfaces now skip `backdrop-filter` entirely, which took opaque from 21 to 26 fps. To confirm on the phone, open `glass-bench.html` from `pnpm dev --host`.

## 5. Questions for Renz

1. **Make Viridian public?** It's MIT-licensed, but while it's private, every app's CI and hosting (Vercel, Codemagic) needs a read token (`AURUM_TOKEN`, see USING-AURUM step 1).
2. **Keep the web Glass rim on by default?** It matches Flutter, but it changes the look of existing web glass (tab bar, Glass). To go back, use `rim={false}` per use, or I can flip the default.
3. **OK with `packages/react/dist` being committed?** CI fails if it's stale. The other option is a build-on-release workflow: cleaner diffs, but there's one more moving part.

## 6. What KeizFlow's "UI with Aurum" rule should say

- Install pinned to a tag, never `main`. Tools go in `.aurum/` at the same tag. Before writing UI, run `node .aurum/tools/aurum.mjs rules`, then `list`, `show <Component>` and `tokens`.
- One brand file (`aurum.brand.json`) per app, built with `.aurum/tools/tokens/build.mjs`, with the generated file committed. Import order: `@aurum/react/aurum.css`, then `./aurum-tokens.css`.
- Review checks: no raw colours or px spacing outside tokens. Use Aurum components before custom ones. Every icon-only control needs an `aria-label` / `semanticLabel`. No glass on list cards. On 3D/WebGL screens, use an opaque brand or reduced transparency.
- If one component needs to differ, eject it (`aurum.mjs eject X --to src/ui`). Don't fork. A second app wanting the same change means it's time to promote it into Aurum (the rule of two).
- When updating the pin, read CHANGELOG, move `.aurum` to the new tag, rebuild tokens, then run the app's tests.
