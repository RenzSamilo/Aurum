# Developing Aurum

The command and layout reference for working on Aurum itself. To use Aurum in an app, see [USING-AURUM.md](USING-AURUM.md). To contribute, see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Layout

```
tokens/
  brand/aurum.json  the default brand: accent, neutrals, status hues, fonts, corner scale
  brand/examples/   sample brands (CI builds them to prove re-skinning works)
  primitive/        raw values that never change per brand: space, type, motion, materials, haptics
  semantic/         meaning per mode: light, dark, contrast-light, contrast-dark
catalog/
  components.json   every component: its shelf (core, pattern, kit), tags, React + Flutter files
  kits.json         topic kits (fitness, finance, learning, ...)
  contracts/        one prop list per component, shared by React and Flutter
  CATALOG.md        generated list of everything; see catalog/README.md for how Aurum grows
  CONTRACTS.md      generated: React vs Flutter props side by side, plus gaps to close
tools/
  catalog/build.mjs checks the catalog and writes CATALOG.md
  tokens/build.mjs  Style Dictionary build -> CSS, TypeScript, Dart; fails on contrast
  license-guard.mjs fails on Apple fonts, SF Symbols or Apple.com brand colours
  readme/           README hero and screenshots (docs/assets/)
packages/
  react/            @aurum/react (tokens.css, tokens.ts, base styles)
  flutter/          aurum_ui (generated tokens, ThemeExtension, theme) + example app
apps/
  docs/             web token preview (also the static docs site)
docs/
  assets/           README hero, social preview, screenshots
```

Generated files (never edit by hand):

- `packages/react/src/tokens/tokens.css` and `tokens.ts`
- `packages/flutter/lib/src/tokens/aurum_tokens.g.dart` and `aurum_brand.g.dart`
- `catalog/CATALOG.md`, `catalog/CONTRACTS.md`, `tokens/brand/PALETTES.md` and `tokens/brand/swatches/`

## Commands

```sh
pnpm install
pnpm tokens          # rebuild tokens for every platform
pnpm dev             # web preview at localhost:5173
pnpm guard           # license guard
pnpm catalog         # check the component catalog, rewrite catalog/CATALOG.md
pnpm aurum list      # cheat sheet: components, props (show <name>), tokens, kits, rules
pnpm brands          # build the example brands into the Flutter example
pnpm palettes        # rebuild tokens/brand/PALETTES.md and the swatches
pnpm typecheck && pnpm build
pnpm docs:build      # static docs site in apps/docs/dist (what GitHub Pages serves)
pnpm readme:hero     # rebuild docs/assets/hero.svg and social-preview.png from the swatches
pnpm readme:shots    # rebuild docs/assets/screens/ (needs Playwright on the machine)

cd packages/flutter/example && flutter run   # Flutter preview
```

Change a value in `tokens/`, run `pnpm tokens`, and both the web preview and the Flutter preview pick it up.

Checks CI runs: `pnpm catalog:check && pnpm guard && pnpm typecheck && pnpm test`, plus `flutter analyze && flutter test` in `packages/flutter` and `packages/flutter/example`.

## Docs site

`apps/docs` builds to a static site with relative paths, so it works under `https://<owner>.github.io/Aurum/`. `.github/workflows/pages.yml` builds and deploys it on every push to `main` once GitHub Pages is set to **GitHub Actions** in the repo settings.

## Releasing

Apps pin git tags named `aurum-vX.Y.Z`.

1. Bump `version` in `packages/react/package.json` and `packages/flutter/pubspec.yaml` to the same number, and add a `## X.Y.Z` section to [CHANGELOG.md](../CHANGELOG.md).
2. `pnpm build` (rebuilds `packages/react/dist`, which is committed), then merge to `main`.
3. On GitHub, **Releases → Draft a new release**, tag `aurum-vX.Y.Z` on `main`, paste the CHANGELOG section as notes, publish. The *Release check* workflow confirms the tag matches both versions and the changelog, and that a fresh app can install it.
