# Public polish report (12 Nov 2026)

## 1. Status

PR: [#14](https://github.com/RenzSamilo/Aurum/pull/14), one commit per task. All checks pass locally (pnpm catalog:check, guard, typecheck, test, tokens:check, build; flutter analyze + test in the package and the example).

- **Rename fallout: done.** All links point at RenzSamilo/Aurum; USING-AURUM no longer needs a token (one line kept for private forks).
- **Licence and hygiene: done.** LICENSE (MIT), CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue forms, PR template.
- **Safety sweep: done.** Nothing to fix in the tree; `.gitignore` now blocks env files and signing keys.
- **README landing page: done.** Hero, badges, Why Aurum, quick start, components, palettes, principles, Not Apple. Reference moved to docs/DEVELOPING.md.
- **Screenshots: done.** 4 web shots (light/dark, desktop/phone) and 6 Flutter sample screens, all under 300 KB; 4 used in the README.
- **Docs site: done (prepared).** `pnpm docs:build` + `.github/workflows/pages.yml`. Pages is off until you turn it on.

## 2. Safety sweep findings

- Current tree: no secrets, tokens, personal emails, local paths or claude.ai links.
- History (regex sweep of `git log -p --all`; gitleaks couldn't run here, its binary was blocked): no secrets or tokens.
- In history, your decision: (a) merge commits carry your Gmail address as author. Nothing to rewrite; to hide it on future web merges, turn on GitHub **Settings → Emails → Keep my email addresses private**. (b) Commit messages carry `Claude-Session` links. They need your login to open, so they're harmless; leave them.

## 3. Settings to change by hand

1. **Description and website:** repo page → gear next to **About** → Description: "Calm, tactile design system: one token file, React and Flutter." Website: `https://renzsamilo.github.io/Aurum/` (after step 4).
2. **Topics:** same dialog → `design-system`, `react`, `flutter`, `design-tokens`, `ui-components`, `dart`, `typescript`.
3. **Social preview:** Settings → General → Social preview → Edit → Upload `docs/assets/social-preview.png` (1280×640).
4. **GitHub Pages:** Settings → Pages → Source: **GitHub Actions**. Then Actions → Docs site → Run workflow (or merge #14).
5. **Private vulnerability reporting:** Settings → Security (Advanced Security) → Private vulnerability reporting → Enable.
6. **Release:** `aurum-v0.1.0` is already published, but its notes say `RenzSamilo/Viridian`. Releases → aurum-v0.1.0 → Edit → change the install line to `RenzSamilo/Aurum` → Update release.

## 4. Before/after

Before: a text-only README written for you, no licence file, private-repo setup steps. After: a visitor sees a palette hero, badges, three reasons, copy-paste installs, real screenshots and a gallery, plus a licence, contributing guide and templates.

## 5. Questions for Renz

1. The sample screens greet "Renz" ("Good morning, Renz"). Keep it, or switch to a neutral name before the screenshots go public?
2. Should the README link the live docs site once Pages is on?
