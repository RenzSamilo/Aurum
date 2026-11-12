# Changelog

Aurum is released as git tags named `aurum-vX.Y.Z`. Apps pin a tag (see [docs/USING-AURUM.md](docs/USING-AURUM.md)). Both libraries share one version: `@aurum/react` in `packages/react/package.json` and `aurum_ui` in `packages/flutter/pubspec.yaml`.

Versions follow semver. Before 1.0, a minor bump (0.1 → 0.2) may change a public API; the entry says how to move.

## 0.1.0 (unreleased)

First version apps can install.

- **Installable from git.** `@aurum/react` ships a built `dist/` (JavaScript + type declarations + CSS), so a Vite or Next app installs it from a tag without compiling Aurum's TypeScript under its own tsconfig. `pnpm consumer:check` (in CI) installs it into a fresh app with a strict tsconfig and builds it.
- **App guide:** [docs/USING-AURUM.md](docs/USING-AURUM.md): install, brand file, token build, imports, updating the pin.
- **New on the web:** `TextField`, `TabBar`, `TopBar` + `BackButton`, `ProgressRing`, `Avatar` and `Badge`, matching the Flutter widgets. Each has a contract in `catalog/contracts/`, axe-core tests, and a preview in the docs app.
- **Release check:** pushing an `aurum-v*` tag checks it against both package versions and this file.
