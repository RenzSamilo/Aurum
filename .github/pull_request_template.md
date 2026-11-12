## What changed

<!-- One or two sentences. -->

## React

<!-- What changed in packages/react, or "none". -->

## Flutter

<!-- What changed in packages/flutter, or "none" (and why, if React changed). -->

## Contract

<!-- Updated catalog/contracts/<component>.json? Any new "todo" gaps? Or "not a component change". -->

## Checklist

- [ ] `pnpm catalog:check && pnpm guard && pnpm typecheck && pnpm test`
- [ ] `flutter analyze && flutter test` in `packages/flutter`
- [ ] Tokens only, no raw values; 48px targets; labels on icon-only controls
- [ ] `pnpm build` and `packages/react/dist` committed (if React source changed)
- [ ] Borrowed code keeps its licence and has a vendor README row
