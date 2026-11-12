# Contributing to Aurum

Thanks for helping. Aurum is one token source feeding a React library and a Flutter library, so most changes touch both.

## Before you start

- Read [catalog/README.md](catalog/README.md) (how Aurum grows) and run `pnpm aurum rules` (the house rules).
- Check `pnpm aurum list` first. Reuse what exists before adding something new.
- For a new component, open a **Component request** issue so we can agree on the shelf and the contract.

## How Aurum grows

- **Shelves.** Every component sits on one: `core/` (any app), `patterns/<group>/` (bigger pieces, still any topic) or `kits/<kit>/` (one kind of app). Imports only point down a shelf, and kits never import each other.
- **Rule of two.** New pieces start inside the app that needs them, listed as a `candidate` in `catalog/components.json`. They join the library when a second app needs them. CI refuses a pattern or kit used by fewer than two apps.
- **Contracts.** A component on both platforms has a prop list in `catalog/contracts/`. Change React and Flutter together. When one side lacks something, the contract says why (on purpose) or what's left to do (`todo`).

## Rules for changes

- Style with tokens only (`pnpm aurum tokens`), never raw colours, sizes or timings.
- Tap targets are at least 48px, icon-only controls have a label, motion honours reduced motion.
- No Apple assets: no SF fonts, SF Symbols, Apple imagery or Apple.com colours. `pnpm guard` enforces it.
- **Borrowed code needs its licence.** Keep the original copyright line, add a row to the vendor folder's README (file, source path, commit, changes), and list it under `origin` in the catalog. See [Borrowing from Astryx](catalog/README.md#borrowing-from-astryx).

## Run the checks

```sh
pnpm install
pnpm catalog          # after changing the catalog or contracts
pnpm tokens           # after changing tokens/
pnpm catalog:check && pnpm guard && pnpm typecheck && pnpm test
cd packages/flutter && flutter analyze && flutter test
```

If you changed `packages/react/src`, run `pnpm build` and commit `packages/react/dist` (CI checks it's current). More commands and the repo layout: [docs/DEVELOPING.md](docs/DEVELOPING.md).

## Pull requests

One topic per PR. Fill in the template: what changed on React, on Flutter, and in the contract. By contributing you agree your work is released under the [MIT licence](LICENSE) and that you follow the [Code of Conduct](CODE_OF_CONDUCT.md).
