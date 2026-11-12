---
name: aurum
description: Build or change UI with the Aurum design system (React @aurum/react, Flutter aurum_ui). Use before writing any screen, component, style or token change in this repo or in an app that uses Aurum.
---

# Building with Aurum

Aurum is one design system with two libraries: `@aurum/react` for websites and `aurum_ui` for Flutter apps. Both are generated from one token source, and each app re-skins them with one brand file.

## Before you write UI

1. `pnpm aurum rules`: the house rules, in one screen.
2. `pnpm aurum list` (or `--tag fitness`, `--shelf core`): what already exists. Use it instead of building new.
3. `pnpm aurum show <component>`: its props on React and Flutter, and its file.
4. `pnpm aurum tokens [color|space|type|radius|spring|haptic|material]`: the only values to style with.

In an app outside this repo, run the same CLI from the Aurum checkout: `node <path-to-aurum>/tools/aurum.mjs list`.

## Changing Aurum itself

- Components sit on three shelves: `core/`, `patterns/<group>/` and `kits/<kit>/`. See `catalog/README.md`.
- Add every new component to `catalog/components.json`. If it's on both platforms, add or update its contract in `catalog/contracts/`, and change React and Flutter together.
- New app-specific pieces start as candidates and join the library when a second app needs them (the rule of two).
- Borrowed Astryx code goes in `packages/react/src/vendor/astryx/` with its copyright line, and the component lists it under `origin`.
- Then run `pnpm catalog` (regenerates CATALOG.md and CONTRACTS.md), `pnpm tokens` if you touched `tokens/`, and `pnpm catalog:check && pnpm guard && pnpm typecheck && pnpm test`. For Flutter, run `flutter analyze && flutter test` in `packages/flutter`.

## Gaps

`catalog/CONTRACTS.md` → "Gaps to close" lists the things one platform has and the other doesn't yet. Check it before promising a feature works on both.
