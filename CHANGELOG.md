# Changelog

Aurum is released as git tags named `aurum-vX.Y.Z`. Apps pin a tag (see [docs/USING-AURUM.md](docs/USING-AURUM.md)). Both libraries share one version: `@aurum/react` in `packages/react/package.json` and `aurum_ui` in `packages/flutter/pubspec.yaml`.

Versions follow semver. Before 1.0, a minor bump (0.1 → 0.2) may change a public API; the entry says how to move.

## Unreleased

- **Floating tab bar on the web:** `FloatingTabBar`, the React twin of Flutter's `AurumFloatingTabBar`: a glass capsule inset from the screen edges, a bubble that slides to the selected tab, optional round glass `action`. Web extras: `showLabels` (default on) and `selection="filled"` for a solid accent pill. Content clears it with `padding-bottom: var(--aurum-floating-tab-bar-space)`.
- **Continuous corners for app markup:** `autoSquircle()` gives every `.aurum-squircle` element continuous corners in Safari and Firefox (Chromium draws them natively). Call it once at startup.
- **Capsules keep round ends:** in Chromium, capsule buttons, capsule text fields, glass segmented controls and `radius="pill"` glass were drawn as squared-off superellipses. They now have true semicircle ends, matching iOS and the Safari fallback. `Squircle` and `Glass` take `radius="pill"`.
- **`pnpm aurum check <app folder>`:** lists plain `border-radius` corners, hand-built `<nav>` bars and raw colours in an app, with the fix for each. `--strict` exits with an error when it finds any.
- **Rules:** `pnpm aurum rules` now says where glass goes (tab bar, toolbars, buttons over imagery) and how to get continuous corners on your own boxes.

## 0.1.1 (unreleased)

- **Optional success colour:** brand files may set `success.hue`, `chroma`, `chromaDark`, `lightnessLight` and `lightnessDark` independently of the accent. Omitted or empty `success` preserves the existing accent-matched appearance, including dark chroma, across all four modes on React and Flutter.
- Invalid `success` fields fail at brand loading, and success colours must pass the existing contrast checks. Existing brand files and generated outputs are unchanged; no migration is needed.

## 0.1.0 (unreleased)

First version apps can install.

- **Installable from git.** `@aurum/react` ships a built `dist/` (JavaScript + type declarations + CSS), so a Vite or Next app installs it from a tag without compiling Aurum's TypeScript under its own tsconfig. `pnpm consumer:check` (in CI) installs it into a fresh app with a strict tsconfig and builds it.
- **App guide:** [docs/USING-AURUM.md](docs/USING-AURUM.md): install, brand file, token build, imports, updating the pin.
- **New on the web:** `TextField`, `TabBar`, `TopBar` + `BackButton`, `ProgressRing`, `Avatar` and `Badge`, matching the Flutter widgets. Each has a contract in `catalog/contracts/`, axe-core tests, and a preview in the docs app.
- **Web glass:** `Button variant="glass"`, `Card material="thin"` (any level), `SegmentedControl glass`, and `Glass` now takes `tint` and `rim` (on by default, like Flutter: a light-catching edge and top sheen). New tokens `--material-rim-high | low | sheen`; reduced transparency and opaque brands turn them off. Still open: `Glass lifted` on the web.
- **Glass performance:** [docs/GLASS-PERFORMANCE.md](docs/GLASS-PERFORMANCE.md) and `pnpm bench:glass` (glass over an animated WebGL canvas, phone profile). Solid surfaces (reduced transparency, opaque brands) now drop `backdrop-filter` entirely via `--material-backdrop: none`; in WebKit that took the solid overlay from 21 to 26 fps.
- **Release check:** pushing an `aurum-v*` tag checks it against both package versions and this file.
