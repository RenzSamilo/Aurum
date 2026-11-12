# Glass performance: when to pick opaque

**Short answer:** over a live WebGL scene (react-three-fiber, video, anything that redraws every frame) on an iPhone 11 or older, use an opaque brand: `"surfaces": { "material": "opaque" }`. Over normal, mostly still pages, translucent glass is fine.

## Why

Glass (`backdrop-filter: blur() saturate()`) has to re-blur what is behind it every time that content changes. Over a still page that happens rarely. Over a WebGL canvas it happens every frame, for every glass surface on screen.

## What was measured (12 Nov 2026)

`apps/docs/glass-bench.html`: a full-screen animated WebGL shader (changes everywhere, every frame) under a glass top bar, a glass card, a glass button, a glass segmented control and a glass tab bar. Each mode ran 3 × 6 s; medians shown. Phone profile 414 × 896 at 2× pixel ratio.

| Engine | Mode | fps | median frame | p95 frame | vs canvas alone |
| --- | --- | --- | --- | --- | --- |
| WebKit (WebKitGTK 2.52, Safari's engine) | canvas alone | 31.2 | 32 ms | 38 ms | 100% |
| | opaque | 26.0 | 38 ms | 45 ms | 83% |
| | **translucent** | **17.1** | **58 ms** | **66 ms** | **55%** |
| Chromium, CPU 4× slower | canvas alone | 41.2 | 16.7 ms | 33.4 ms | 100% |
| | opaque | 41.3 | 16.7 ms | 33.4 ms | 100% |
| | translucent | 39.5 | 33.2 ms | 33.4 ms | 96% |

How to read it:

- **WebKit is the one that matters for iPhone**, since every iPhone browser uses it. There, glass made each frame about **20 ms slower than opaque** (median 58 vs 38 ms) and cost a third of the frame rate (17 vs 26 fps). The whole iPhone frame budget is 16.7 ms.
- **Opaque now skips the backdrop filter completely.** Before this change, solid surfaces still had `backdrop-filter: blur(0) saturate()`, and WebKit still re-read the canvas behind them: opaque measured 21 fps then, 26 fps now. Reduced transparency and opaque brands set `--material-backdrop: none`.
- **Chromium barely notices** (its compositor blurs on a separate thread), so a desktop Chrome check will hide the problem.
- These runs were in a cloud container **without a GPU**, so everything is slower than a phone. Compare the rows with each other, not with a real iPhone's frame rate. Playwright's own WebKit build couldn't be downloaded there, so WebKit ran through WebKitGTK and its WebDriver instead.

## Rule for apps

| App surface | Brand setting |
| --- | --- |
| Glass over still content (lists, settings, forms) | `translucent` (default) |
| Glass over a live 3D/WebGL canvas or video, on iPhone 11-class phones | `opaque` |
| Mixed: mostly still pages, one 3D screen | `translucent`, and call `setAurumPreferences({ transparency: 'reduced' })` while the 3D screen is open |

The last row works because the reduced-transparency setting swaps every glass surface for a solid one at runtime, without a second brand file. Users who turn on "Solid surfaces" in an app's settings get the same thing.

**Keiz-HQ (react-three-fiber, iPhone 11 Safari): use `opaque`**, or the runtime switch above if only some screens show the 3D scene.

## Rerun it

```sh
pnpm build
pnpm bench:glass                      # Chromium, iPhone 11 profile, CPU 4x slower
pnpm bench:glass --engine webkit      # needs `npx playwright install webkit` (works on a Mac)
```

On a real phone (the real answer): `pnpm dev --host`, then open `http://<your-computer>:5173/glass-bench.html?mode=translucent` on the iPhone, wait 7 s, and read the result that appears on screen. Repeat with `mode=opaque` and `mode=none`. If translucent stays within a few fps of opaque at about 60 fps, translucent is fine for that app.
