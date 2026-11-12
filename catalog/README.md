# How Aurum grows

Aurum gets bigger every time you build an app. Good pieces are saved instead of rebuilt, but only once they've proven they're reusable.

The full list of components is in [CATALOG.md](CATALOG.md) (generated, don't edit it by hand).

## Three shelves

| Shelf | What goes here | Example | Folder (React / Flutter) |
| --- | --- | --- | --- |
| **Core** | Basic building blocks for any app | Button, Switch, List row, Sheet | `src/core/` / `lib/src/core/<group>/` |
| **Patterns** | Bigger pieces made from core, still any topic | Stat card, avatar stack, day strip, plan picker | `src/patterns/<group>/` / `lib/src/patterns/<group>/` |
| **Kits** | Pieces that only make sense for one kind of app | Bank card, lesson card, chat bubble, rep counter | `src/kits/<kit>/` / `lib/src/kits/<kit>/` |

Apps import core from the main entry and opt into the rest: `@aurum/react/patterns` and `@aurum/react/kits/finance` on the web, `package:aurum_ui/patterns.dart` and `package:aurum_ui/kits/finance.dart` in Flutter. Each shelf folder gets its `index.ts` / entry `.dart` file when its first component is promoted, so an app only pulls in the kits it uses.

Imports only point down: kits can use patterns and core, patterns can use core, and core uses neither. One kit never imports another. If two kits want the same piece, it belongs on the patterns shelf.

## Kits

Listed in [kits.json](kits.json). Adding one is one line.

| Kit | For |
| --- | --- |
| `fitness` | Workouts, sets and reps, streaks, body stats, nutrition (TREN) |
| `finance` | Balances, bank cards, transactions, budgets |
| `productivity` | Tasks, calendars, notes, timers |
| `learning` | Courses, lessons, schedules, quizzes |
| `assistant` | AI chat, model picker, tool results |
| `social` | Profiles, feeds, comments, messages |
| `commerce` | Products, cart, checkout, orders |
| `media` | Players, galleries, reading views |
| `travel` | Maps, places, bookings, tickets |
| `marketing` | Website-only: hero, pricing, testimonials, FAQ, footer |

## Tags

Each component is filed by **what it does** (its shelf and group) and tagged with **which apps it suits**. A stat card sits on the patterns shelf once, tagged `fitness, finance, productivity`, instead of being copied into three kits. "Browse by topic" in CATALOG.md uses the tags.

## The rule of two

1. **Build it in the app.** A new piece starts inside the app that needs it. Add it to `candidates` in [components.json](components.json) with the app name and file.
2. **Second app wants it?** Add that app to its `foundIn`. CATALOG.md marks it **Ready to promote**.
3. **Promote it.** Move the code onto the lowest shelf it fits (core, then patterns, then a kit), build both React and Flutter versions where it makes sense, and move the entry from `candidates` to `components` with both apps in `usedBy`.

`pnpm catalog:check` (run in CI) refuses a pattern or kit component with fewer than two apps in `usedBy`. Core is exempt, because it's the base everything else stands on.

## What the check enforces

`pnpm catalog` rewrites CATALOG.md. `pnpm catalog:check` fails when:

- a public component in `core/`, `patterns/` or `kits/` isn't in the catalog,
- a catalog entry points at a file that doesn't define it, or sits on the wrong shelf,
- an import points up a shelf, or across kits,
- a tag or kit isn't in kits.json,
- CATALOG.md is out of date.

## Contracts: React and Flutter stay matched

Every component built for both platforms has a contract in [contracts/](contracts/): one list of props, with what each is called in React and in Flutter. The check reads the real React props interface and the real Flutter constructor, so:

- a prop added on only one side fails CI until the contract says what the other side does,
- an option added to one side (say a new button size) fails until the other side has it, or the contract lists it as missing,
- every difference is written down: `why` when it's on purpose (Flutter disables by passing `onPressed: null`), `todo` when it's a gap to close.

[CONTRACTS.md](CONTRACTS.md) is generated from them. Its "Gaps to close" list is the to-do list for keeping the two libraries matched.

```json
{ "name": "variant", "values": ["filled", "tinted", "gray", "plain", "glass"],
  "missing": { "react": ["glass"] }, "todo": "Build the glass variant for web." }
```
