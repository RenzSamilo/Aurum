# Aurum

A design system for calm, precise, tactile interfaces. It takes its principles from Apple's Human Interface Guidelines (continuous corners, spring motion, materials, meaningful haptics) and uses only original or openly licensed assets.

One token source feeds two libraries:

| Package | For | Path |
| --- | --- | --- |
| `@aurum/react` | Websites (React, CSS variables) | `packages/react` |
| `aurum_ui` | Mobile apps (Flutter) | `packages/flutter` |

## Layout

```
tokens/
  primitive/        raw values: colour (OKLCH), space, radius, type, motion, materials, haptics
  semantic/         meaning per mode: light, dark, contrast-light, contrast-dark
tools/
  build-tokens.mjs  Style Dictionary build -> CSS, TypeScript, Dart
  license-guard.mjs fails on Apple fonts, SF Symbols or Apple.com brand colours
packages/
  react/            @aurum/react (tokens.css, tokens.ts, base styles)
  flutter/          aurum_ui (generated tokens, ThemeExtension, theme) + example app
apps/
  docs/             web token preview
```

Generated files (never edit by hand):

- `packages/react/src/tokens/tokens.css` and `tokens.ts`
- `packages/flutter/lib/src/tokens/aurum_tokens.g.dart`

## Commands

```sh
pnpm install
pnpm tokens          # rebuild tokens for every platform
pnpm dev             # web preview at localhost:5173
pnpm guard           # license guard
pnpm typecheck && pnpm build

cd packages/flutter/example && flutter run   # Flutter preview
```

Change a value in `tokens/`, run `pnpm tokens`, and both the web preview and the Flutter preview pick it up.

## Using it

**React**

```ts
import '@aurum/react/aurum.css';
import { spring, setAurumPreferences } from '@aurum/react';

// Follow the system, or override per user. Safari ignores prefers-reduced-transparency,
// so offer a "Solid surfaces" setting and pass it here.
setAurumPreferences({ theme: 'dark', transparency: 'reduced' });
```

Modes are data attributes on `<html>`: `data-theme`, `data-contrast`, `data-transparency`, `data-motion`. Without them, system preferences apply.

**Flutter**

```dart
import 'package:aurum_ui/aurum_ui.dart';

MaterialApp(
  theme: aurumTheme(Brightness.light),
  darkTheme: aurumTheme(Brightness.dark),
);

// In a widget
final c = context.aurum;                      // semantic colours
AurumType.body.style(color: c.textPrimary);   // Inter with optical size
AurumMotion.control.description;             // SpringDescription
RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(AurumRadius.lg));
```

## Assets and licences

- Inter Variable 4.1, OFL-1.1 (`packages/flutter/fonts/Inter-OFL.txt`; web via `@fontsource-variable/inter`)
- Phosphor icons, MIT (`@phosphor-icons/react`, `phosphor_glyphs` on Flutter)
- No SF Pro, SF Symbols, New York, Apple artwork or Apple.com colours. CI enforces this with `pnpm guard`.

## Roadmap

- **Phase 0** (this): monorepo, token pipeline, CI, previews.
- **Phase 1**: Button, Switch, Segmented control, List row + card, Sheet on both platforms; haptics; glass; squircle polyfill for Safari and Firefox.
- **Phase 2**: v1 components and the first real food-log flow.
- **Phase 3**: pickers, charts, polish.
