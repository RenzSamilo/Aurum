# Using Aurum in an app

For an app repo (React or Flutter) that wants Aurum's components and its own brand. Aurum lives in the public repo [`RenzSamilo/Aurum`](https://github.com/RenzSamilo/Aurum) and is released as git tags named `aurum-vX.Y.Z`. Always pin a tag, never `main`.

Install pin: **`aurum-v0.2.0`**. What changed in each tag: [CHANGELOG.md](../CHANGELOG.md).

## 1. Get access

Nothing to set up: the repo is public, so any machine (laptop, CI, Vercel, Codemagic) can install it. Only a private fork needs a read token in CI, via `git config --global url."https://x-access-token:${TOKEN}@github.com/".insteadOf "https://github.com/"`.

## 2. Install

**React** (Vite, Next, react-three-fiber):

```sh
pnpm add "github:RenzSamilo/Aurum#aurum-v0.2.0&path:/packages/react"
```

The package ships built JavaScript, type declarations and CSS, so there is no build step and no `transpilePackages`. It needs React 19.

**Flutter** (`pubspec.yaml`):

```yaml
dependencies:
  aurum_ui:
    git:
      url: https://github.com/RenzSamilo/Aurum.git
      path: packages/flutter
      ref: aurum-v0.2.0
```

Then `flutter pub get`. Fonts (Inter, Fraunces) and icons come with the package.

## 3. Get Aurum's tools (token build and cheat sheet)

The brand build and the `aurum` cheat sheet run from a checkout of the same tag. Keep it in the app folder, ignored by git:

```sh
git clone --depth 1 --branch aurum-v0.2.0 https://github.com/RenzSamilo/Aurum.git .aurum
pnpm --dir .aurum install --frozen-lockfile --filter aurum   # only the token tools, a few seconds
echo ".aurum/" >> .gitignore
```

Cheat sheet from the app: `node .aurum/tools/aurum.mjs list | show Button | tokens color | rules`.

## 4. Add your brand file

Copy `.aurum/tokens/brand/aurum.json` (or one of `.aurum/tokens/brand/examples/*.json`) to `aurum.brand.json` in the app root and edit it. Set `"$schema": "./.aurum/tools/tokens/brand.schema.json"` for editor hints. The fields are described in the [README](../README.md#make-it-yours-one-file-per-app). Use `"surfaces": { "material": "opaque" }` for a flat look, or when [GLASS-PERFORMANCE.md](GLASS-PERFORMANCE.md) says to (busy WebGL backgrounds on older phones).

```json
{
  "$schema": "./.aurum/tools/tokens/brand.schema.json",
  "name": "Keiz",
  "accent": { "hue": 265, "chroma": 0.1 },
  "surfaces": { "material": "translucent" }
}
```

Success follows the resolved accent by default, including dark chroma. Omit `success` or use `{}` to keep that behaviour. An independent green can be added as:

```json
"success": { "hue": 148, "chroma": 0.14, "lightnessLight": 0.46, "lightnessDark": 0.74, "chromaDark": 0.17 }
```

All five fields are optional. `hue` accepts 0–360, `chroma`/`chromaDark` 0–0.37, and `lightnessLight`/`lightnessDark` 0–1. Hue and lightness inherit their matching accent fields; light chroma inherits `accent.chroma`. Dark chroma falls back through `success.chromaDark`, `success.chroma`, `accent.chromaDark`, then `accent.chroma`. Nulls, unknown keys, nonnumeric or out-of-range values are rejected. Generated success colours must still pass contrast in every mode.

## 5. Build your tokens

From the app root:

```sh
# React
node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --css src/aurum-tokens.css
# Flutter
node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --dart lib/aurum_brand.g.dart
```

Commit the generated file. The build refuses a brand that fails WCAG contrast in any mode and prints the failing pair. Tip: add it as a script, `"aurum:tokens": "node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --css src/aurum-tokens.css"`.

Need the brand colours outside code (an art tool, a design file)? `--hex brand-colors.json` writes every colour token as `#RRGGBB`, per mode. KeizArt reads this file to keep its style-pack accents on-brand.

## 6. Import

**React**, once at the app root, in this order:

```ts
import '@aurum/react/aurum.css';   // base styles, fonts, default tokens
import './aurum-tokens.css';        // your brand, overrides the defaults
import { autoSquircle, Button, Card, setAurumPreferences } from '@aurum/react';

autoSquircle(); // continuous corners on your own .aurum-squircle boxes in Safari and Firefox
```

Aurum components already have continuous (G2) corners and glass where it belongs. For your own markup:

- **Rounded boxes:** add `className="aurum-squircle"` and set the radius in CSS with `--aurum-radius: var(--radius-lg);`. A plain `border-radius` gives circular corners. Capsules and circles (`--radius-pill`, `50%`) are fine with plain `border-radius`.
- **Bottom tabs:** use `FloatingTabBar` (a glass capsule that floats over content) or `TabBar` (a full-width glass bar). Give the scrolling content `padding-bottom: var(--aurum-floating-tab-bar-space)`.
- **Buttons over imagery or a busy background:** `Button variant="glass"`.
- **Check your app:** `node .aurum/tools/aurum.mjs check .` lists plain corners, hand-built nav bars and raw colours, with the fix for each.

**Flutter:**

```dart
import 'package:aurum_ui/aurum_ui.dart';
import 'aurum_brand.g.dart'; // defines e.g. keizBrand

MaterialApp(
  theme: aurumTheme(Brightness.light, brand: keizBrand),
  darkTheme: aurumTheme(Brightness.dark, brand: keizBrand),
);
```

## 7. Update to a newer tag

1. Read the new entries in [CHANGELOG.md](../CHANGELOG.md).
2. Change the tag in the install line (`package.json`) or `ref:` (`pubspec.yaml`), then `pnpm install` or `flutter pub get`.
3. Move the tools to the same tag: `rm -rf .aurum` and repeat step 3 with the new tag.
4. Rebuild tokens (step 5) and commit the regenerated file.
5. Run the app's tests and look at a few screens in light and dark.

## Need one component to differ?

Don't fork Aurum. Copy just that component into the app and change the copy: `node .aurum/tools/aurum.mjs eject Button --to src/ui --platform react` (or `--to lib/ui --platform flutter`). See [catalog/README.md](../catalog/README.md#eject-when-one-app-needs-a-component-to-differ).
