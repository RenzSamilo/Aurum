# Using Aurum in an app

For an app repo (React or Flutter) that wants Aurum's components and its own brand. Aurum lives in the private repo `RenzSamilo/Viridian` and is released as git tags named `aurum-vX.Y.Z`. Always pin a tag, never `main`.

Current tag: **`aurum-v0.1.0`**. What changed in each tag: [CHANGELOG.md](../CHANGELOG.md).

## 1. Get access

The repo is private, so every machine that installs Aurum needs read access to it.

- **Your laptop:** works if `git clone https://github.com/RenzSamilo/Viridian.git` works (GitHub CLI login, a credential helper, or SSH).
- **CI and hosting** (GitHub Actions, Vercel, Codemagic): give the build a read-only token for this repo and run this before installing:

  ```sh
  git config --global url."https://x-access-token:${AURUM_TOKEN}@github.com/".insteadOf "https://github.com/"
  ```

## 2. Install

**React** (Vite, Next, react-three-fiber):

```sh
pnpm add "github:RenzSamilo/Viridian#aurum-v0.1.0&path:/packages/react"
```

The package ships built JavaScript, type declarations and CSS, so there is no build step and no `transpilePackages`. It needs React 19.

**Flutter** (`pubspec.yaml`):

```yaml
dependencies:
  aurum_ui:
    git:
      url: https://github.com/RenzSamilo/Viridian.git
      path: packages/flutter
      ref: aurum-v0.1.0
```

Then `flutter pub get`. Fonts (Inter, Fraunces) and icons come with the package.

## 3. Get Aurum's tools (token build and cheat sheet)

The brand build and the `aurum` cheat sheet run from a checkout of the same tag. Keep it in the app folder, ignored by git:

```sh
git clone --depth 1 --branch aurum-v0.1.0 https://github.com/RenzSamilo/Viridian.git .aurum
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

## 5. Build your tokens

From the app root:

```sh
# React
node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --css src/aurum-tokens.css
# Flutter
node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --dart lib/aurum_brand.g.dart
```

Commit the generated file. The build refuses a brand that fails WCAG contrast in any mode and prints the failing pair. Tip: add it as a script, `"aurum:tokens": "node .aurum/tools/tokens/build.mjs --brand aurum.brand.json --css src/aurum-tokens.css"`.

## 6. Import

**React**, once at the app root, in this order:

```ts
import '@aurum/react/aurum.css';   // base styles, fonts, default tokens
import './aurum-tokens.css';        // your brand, overrides the defaults
import { Button, Card, setAurumPreferences } from '@aurum/react';
```

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
