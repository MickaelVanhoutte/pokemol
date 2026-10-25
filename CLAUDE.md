# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Atelier Bestioles: le Rêve de Papeterre** is a FireRed/LeafGreen-style browser game built from a
child's real pencil drawings. Each creature ("Bestiole", EN "Critter") is a photo of a drawing, cut out
by `tools/cut-drawings.ts`. The repo is public and the game is live at
https://mickaelvanhoutte.github.io/pokemol/ (deployed by GitHub Pages on every push to `main`).

- [docs/story.md](docs/story.md): story, region, cast, flags, level curve.
- [docs/content.md](docs/content.md): how to add maps, NPCs, trainers, scripts, items, creatures and music.
- [docs/testing.md](docs/testing.md): unit tests, balance sims, headless playtests on phone sizes, deploy check.

## Standing rules from the project owner

- **Original names only.** No Pokémon names, branding or assets anywhere: the site is public.
  The game's own words are Bestiole, Crayon-ball, Atelier (gym), Maître d'Atelier (leader),
  Bestiodex, Team Gomme.
- **French first, English second.** Every player-visible text is written `L('français', 'English')`
  and shown with `tr()`. Use typographic `’` and `« »`. Gendered French uses `{g:féminin|masculin}`
  (the player picks girl or boy). `{name}` and `{rival}` are global placeholders.
  The space before `! ? : ;` becomes non-breaking automatically.
- **Drawing photos never leave the machine.** `img-source/` is gitignored; only the cut-out
  `public/cards/*.webp` is published. Back up `img-source/` before any history rewrite.
- **Graphics are drawn in code**: tiles, sprites, buildings, pixel icons, battle backdrops, the pencil
  look. Don't propose downloading tile packs, and don't use emoji as icons.
- **Phones are the main target.** Check 360 and 412px wide at 100% and 130% root font size
  (the owner's phone uses large text), and landscape. Landscape CSS lives under
  `@media (orientation: landscape) and (max-height: 540px)`.
- **Commits** use the GitHub noreply email:
  `git -c user.email=51904030+MickaelVanhoutte@users.noreply.github.com commit …`.
  `package-lock.json` must resolve from `registry.npmjs.org`: this machine may default to a
  corporate registry, so check the `resolved` URLs after `npm install`.
- **Balance with simulations** before shipping changes to teams or stats (`npm run balance`).
  The owner asked for a gentle start: see [docs/story.md](docs/story.md#level-curve-and-difficulty).
- Ship each milestone separately, then check that the deploy is live (see [docs/testing.md](docs/testing.md)).

## Commands

```bash
npm run dev                                   # http://localhost:5173/pokemol/ (.claude/launch.json "dev")
npm test                                      # vitest, node environment, src/**/*.test.ts
npx vitest run src/data/maps.test.ts          # one file
npx vitest run -t "difficulty"                # tests whose name matches
npm run typecheck                             # tsc --noEmit (src + tools, excludes tools/out)
npm run build                                 # typecheck + vite build to dist/ (PWA service worker included)
npm run balance -- [easy|normal|hard] [n]     # simulated trainer fights along the story
npm run cards -- 013                          # cut out one drawing (see README "Add a new drawing")
npm run icons                                 # regenerate public/icon-*.png
```

There is no linter. TypeScript is strict with `noUnusedLocals`/`noUnusedParameters`.
CI (`.github/workflows/deploy.yml`) runs `npm ci`, `npm test` and `npm run build`, then publishes `dist/`.
`vite.config.ts` has `base: '/pokemol/'`: asset URLs go through `import.meta.env.BASE_URL`.

## Architecture

Stack: Vite + TypeScript + Preact + `@preact/signals`; the overworld is a hand-written canvas engine.

**Shell.** `src/main.tsx` renders `App` and imports `src/story` so every story script registers
itself. `src/state/router.ts` holds one `screen` signal; `src/app.tsx` switches on it. The overworld,
title, new-game prologue, battle and each menu are separate screens. A script can `await openScreen(…)`
and resume when the player returns to the world. `App` is keyed on the locale, so switching language
re-renders everything.

**State.**
- `src/state/game.ts`: the `save` signal (`SaveData` v4 from `src/save/schema.ts`, localStorage key
  `atelier-bestioles.save`). `update(fn)` mutates and persists it. `migrate` and `migrateV2` load older
  saves (v2 parties go to the PC); `repair()` then fills in what newer versions added (it runs on every
  load, so it must stay idempotent). Changing the save shape means bumping `SAVE_VERSION`, adding a
  migration or repair step and a test (`src/state/game.test.ts`).
- `src/state/prefs.ts`: per-device preferences outside the save (text speed, difficulty, battle
  speed, sound, music) so Options also work from the title screen.

**Data** (`src/data`) is plain TypeScript objects with `L()` texts:
- creatures (`faces` marks sideways drawings);
- moves, the type chart, items (`kind: 'key'` for story items);
- trainers (levels are the Normal difficulty; `partyOf` applies `DIFFICULTY`), badges, sketchbook pages;
- `maps/<area>.ts`, merged in `maps/index.ts`. Map rows are strings; `LEGEND` in
  `src/overworld/mapTypes.ts` maps each character to a tile id;
- `worldmap.ts`: the Town Map layout (`WORLD`), where-am-I (`regionOf`, `playerSpot`) and the
  balloon towns. Next objectives for the map live in `src/story/objective.ts`.

**Overworld** (`src/overworld`):
- `game.ts`: the `Game` class. It runs the canvas loop and draws the prerendered map layers, actors,
  fades and wipes, speech bubbles and the "pencilize" post-pass (`pencil.ts`). It also provides the
  cut-scene helpers `walk`, `face`, `faceToward`, `spawn`, `remove`, `fadeTo`, `wipeTo`.
- `tiles.ts`, `buildings.ts` and `sprites.ts` paint pixel art with the `Painter` from `pixel.ts`
  (16px tiles). `LOOKS` and `lookImage()` give the trainer and NPC chibis, also used in battle intros.
- `controller.ts` is the glue between the save, the maps and the story:
  - movement, interactions, warps (including `to: 'back'` for shared interiors), trainer sight;
  - flags, `fight()` (wipe, music, intro, outcome, blackout), `trainerBattle()`, evolutions, rematches;
  - the `scripts` registry. `dialog.ts` provides `say` / `sayAll` / `ask`.

**Story** (`src/story`): async functions registered as `scripts.<id>`. Maps reference script ids from:
- NPCs (`script`), triggers, `interact` spots;
- building doors (`script`), `onEnter`;
- a trainer's `afterScript`.

Progress lives in `save.flags`. Maps react to flags declaratively:
- `showIf` / `hideIf` on NPCs, and `if` / `unless` on triggers;
- `patches`, which redraw part of the map (erased or restored areas; `?` keeps the tile underneath);
- `tintUnless`.

`setFlag` marks the map dirty, and the map is rebuilt after the running script ends. The flag
conventions are in [docs/content.md](docs/content.md#flags).

**Battles.**
- `src/engine/pk` is pure and deterministic:
  - `createBattle(setup)` and `act(state, playerAction, enemyAction)` return a `Step`
    `{ state, events, snaps }` built on a `structuredClone`;
  - randomness comes from `state.rng`;
  - `blocked()` means waiting for a forced switch or a move-learn choice;
  - `ai.ts` has `aiChoose(st, slip)`;
  - `creature.ts` covers stats, XP (`level³`, Gen 3 yield) and evolutions; the level cap is 50.
- `src/ui/battle/BattleScreen.tsx` dispatches actions:
  - it plays the events as text (`messages.ts`) and animations (`BattleScene.tsx`);
  - it keeps the bag, party and learn-move overlays inside itself, because the router would unmount
    the battle.
- `BattlePanel` has a fixed height. Its mode comes from the pure `panelMode()`. Long text is
  paginated by `TextBox` rather than growing the panel.
- Backdrops are drawn in coloured pencil on a canvas (`backdrops.ts`).

**UI kit** (`src/ui/paper`):
- `Window` (a pencil border drawn with an SVG `border-image`) and `TextBox` (fixed number of lines,
  `paginate()` measures pages);
- `MenuList` and `useMenuNav` (a capture-phase key handler; nested menus rely on
  `stopImmediatePropagation`), `Frame`, `YesNo`, `HpBar`…
- `src/ui/views/*` are pure views (props in, callbacks out). `src/ui/screens/*` are thin wrappers
  bound to the save. Item, menu and badge icons are pixel art from `src/ui/icons.ts`.

**Audio.**
- `src/audio/music.ts` is a small Web Audio sequencer (square, triangle and noise) playing original
  tracks. `mapMusic.ts` picks the track for each map; battles pick theirs in `fight()`.
- `sfx.ts` plays sound effects. Everything respects the prefs.

**Drawings → cards.** `tools/cards-manifest.json` (crop box, erase polygons, `scale`, `options`) goes
through `tools/cut-drawings.ts` and `src/art/cutout.ts` (paper flattening, ink mask) to produce
`public/cards/<id>-<slug>.webp`. The contact sheet lands in `tools/out/` (gitignored scratch, also
excluded from `tsc`).

## Gotchas

- In dev only, `window.__ab` (save, `update`, `warpTo`, `runScript`, `setFlag`, `fight`,
  `trainerBattle`, `createMon`…) and `window.__battle` (`dispatch`, `state`) exist for playtesting.
  See [docs/testing.md](docs/testing.md).
- Shared interiors: one `centre` (Healing Center) and one `boutique` (shop) map serve every town
  (`generic: true`). Their exits warp `to: 'back'`, which uses `player.returnTo`. Per-town NPCs use
  `fromMap`. The shop sells the `STOCK` list in `ShopScreen.tsx`, each item after a number of badges.
- Sideways drawings set `faces: 'left' | 'right'`. Battle sprites are mirrored so ours looks right and
  the foe looks left.
- The pencilize pass skips pure black (`#000`, the void around interiors).
- `src/story/story.test.ts` checks every script id and every flag a map waits for. Flags starting
  with `a2.` to `a9.` are exempt (a leftover from when later acts weren't written yet).
- After the ending (`ending` flag), Atelier Masters offer rematches at +12 levels (capped at 50).
