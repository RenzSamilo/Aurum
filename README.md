# Aurum

A base design system for calm, precise, tactile interfaces. Each app re-skins it with one brand file. It takes its principles from Apple's Human Interface Guidelines (continuous corners, spring motion, materials, meaningful haptics) and uses only original or openly licensed assets.

One token source feeds two libraries:

| Package | For | Path |
| --- | --- | --- |
| `@aurum/react` | Websites (React, CSS variables) | `packages/react` |
| `aurum_ui` | Mobile apps (Flutter) | `packages/flutter` |

## Layout

```
tokens/
  brand/aurum.json  the default brand: accent, neutrals, status hues, fonts, corner scale
  brand/examples/   sample brands (CI builds them to prove re-skinning works)
  primitive/        raw values that never change per brand: space, type, motion, materials, haptics
  semantic/         meaning per mode: light, dark, contrast-light, contrast-dark
tools/
  tokens/build.mjs  Style Dictionary build -> CSS, TypeScript, Dart; fails on contrast
  license-guard.mjs fails on Apple fonts, SF Symbols or Apple.com brand colours
packages/
  react/            @aurum/react (tokens.css, tokens.ts, base styles)
  flutter/          aurum_ui (generated tokens, ThemeExtension, theme) + example app
apps/
  docs/             web token preview
```

Generated files (never edit by hand):

- `packages/react/src/tokens/tokens.css` and `tokens.ts`
- `packages/flutter/lib/src/tokens/aurum_tokens.g.dart` and `aurum_brand.g.dart`

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

## Make it yours (one file per app)

1. Copy `tokens/brand/aurum.json` into your app as `my.brand.json`. Change `name`, `accent.hue` (0 to 360) and `accent.chroma`. Optional: `secondary` (the ornament colour), `neutral` tint, `danger`/`warning` hues, `font`, `radius.scale`.
2. Build it:

   ```sh
   node path/to/aurum/tools/tokens/build.mjs --brand my.brand.json \
     --css src/aurum-tokens.css \
     --dart lib/my_brand.g.dart
   ```

3. Web: import your `aurum-tokens.css` after `@aurum/react/aurum.css`. Flutter: `aurumTheme(Brightness.light, brand: myBrand)`.

The build checks every mode (light, dark, both high-contrast) against WCAG and refuses a brand that fails, with the exact pair and ratio. Text roles, spacing, springs, materials and haptics stay the same across brands, so every app feels like Aurum.

The default look is **old green**: bottle-green accent on parchment, green-black dark surfaces with a muted sage accent, gilt gold for ornament (`--color-accent-secondary`, `accentSecondary`), and Fraunces serif titles over Inter. `tokens/brand/examples/` has other starting points (Lagoon is the earlier teal, Ember is warm orange).

Fonts: `font.ui` sets the UI font and `font.display` the title font (display, page, section and card roles); `font.displayWeight` and `font.displayTracking` tune titles. Delete `font.display` for an all-sans look. Inter and Fraunces ship with Aurum; any other font must be a variable font with a `wght` axis, bundled in your app.

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
  theme: aurumTheme(Brightness.light),            // add brand: myBrand for your app
  darkTheme: aurumTheme(Brightness.dark),
);

// In a widget
final c = context.aurum;                           // semantic colours
context.aurumText(AurumType.body);                 // brand font, optical size, primary text
AurumMotion.control.description;                  // SpringDescription
RoundedSuperellipseBorder(borderRadius: BorderRadius.circular(context.aurumRadii.lg));
```

## Components

| | Web | Flutter |
| --- | --- | --- |
| Button | `<Button>` | `AurumButton` |
| Switch | `<Switch>` | `AurumSwitch` |
| Segmented control | `<SegmentedControl>` | `AurumSegmentedControl` |
| Grouped list | `<ListSection>` + `<ListRow>` | `AurumListSection` + `AurumListRow` |
| Card | `<Card>` | `AurumCard` |
| Sheet | `<Sheet>` | `showAurumSheet()` |
| Glass | `<Glass>` | `AurumGlass` |
| Continuous corners | `<Squircle>`, `useSquircle()` | `RoundedSuperellipseBorder` |
| Haptics | `playHaptic(intent)` | `AurumHaptics.play(intent)` |

Every component works with a keyboard and a screen reader, honours reduced motion, and is checked by tests (axe-core on the web, Flutter's accessibility guidelines on mobile).

## Assets and licences

- Inter Variable 4.1, OFL-1.1 (`packages/flutter/fonts/Inter-OFL.txt`; web via `@fontsource-variable/inter`)
- Fraunces Variable, OFL-1.1 (`packages/flutter/fonts/Fraunces-OFL.txt`; Latin subset with opsz and wght axes; web via `@fontsource-variable/fraunces`)
- Phosphor icons, MIT (`@phosphor-icons/react`, `phosphor_glyphs` on Flutter)
- No SF Pro, SF Symbols, New York, Apple artwork or Apple.com colours. CI enforces this with `pnpm guard`.

## Roadmap

- **Phase 0** (done): monorepo, token pipeline, CI, previews.
- **Phase 1**: brand layer; Button, Switch, Segmented control, List row + card, Sheet on both platforms; haptics; glass; squircle polyfill for Safari and Firefox.
- **Phase 2**: v1 components and generic flows (settings, list and detail, form, onboarding).
- **Phase 3**: pickers, charts, polish.
