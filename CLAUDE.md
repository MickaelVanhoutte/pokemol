# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Atelier Bestioles: le Rêve de Papeterre** is a FireRed/LeafGreen-style browser game built from a
child's real pencil drawings. In the game each creature ("Bestiole", EN "Critter") is drawn in code in
her style (`tools/redraws`); her own drawings are kept as the originals (`public/originals`, cut out of
photos by `tools/cut-drawings.ts`), shown in the credits. The repo is public and the game is live at
https://mickaelvanhoutte.github.io/pokemol/ (deployed by GitHub Pages on every push to `main`).

- [docs/histoire.md](docs/histoire.md): the story for the family, spoiler-free (French, then English).
- [docs/story.md](docs/story.md): story, region, cast, flags, level curve.
- [docs/content.md](docs/content.md): how to add maps, NPCs, trainers, scripts, items, creatures and music.
- [docs/testing.md](docs/testing.md): unit tests, balance sims, headless playtests on phone sizes, deploy check.
- [docs/bestioles.md](docs/bestioles.md): design rules for a Bestiole (stat bands, catch rate, base XP, the
  family's power, moves), checked by `src/data/bestioles.test.ts`. The project skill `new-bestiole`
  (`.claude/skills/new-bestiole/SKILL.md`) walks through adding a Bestiole drawn in her style.

## Standing rules from the project owner

- **Original names only.** No Pokémon names, branding or assets anywhere: the site is public.
  The game's own words are Bestiole, Crayon-ball, Atelier (gym), Maître d'Atelier (leader),
  Bestiodex, Team Gomme.
- **Every Bestiole is drawn three-quarters, turned to the left** (`faces: 'left'`), never straight
  from the front: it looks silly in battle, and battles mirror the drawings so both Bestioles face each
  other (`src/data/bestioles.test.ts` checks that `faces` is set). Far limbs start hidden behind the
  body, every part stays attached, nothing hangs limp. An evolution is never a recolour: first forms are
  cute and simple, evolved forms bigger, more complex and more impressive (new silhouette and features).
- **French first, English second.** Every player-visible text is written `L('français', 'English')`
  and shown with `tr()`. Use typographic `’` and `« »`. Gendered French uses `{g:féminin|masculin}`
  (the player picks girl or boy). `{name}` and `{rival}` are global placeholders.
  The space before `! ? : ;` becomes non-breaking automatically.
- **Drawing photos never leave the machine.** `img-source/` is gitignored; only her cut-out drawings
  `public/originals/*.webp` are published. Back up `img-source/` before any history rewrite.
- **Graphics are drawn in code**: tiles, sprites, buildings, pixel icons, battle backdrops, the pencil
  look. Don't propose downloading tile packs, and don't use emoji as icons.
- **Phones are the main target.** Check 360 and 412px wide at 100% and 130% root font size
  (the owner's phone uses large text), and landscape. Landscape CSS lives under
  `@media (orientation: landscape) and (max-height: 540px)`.
- **Commits** use the GitHub noreply email:
  `git -c user.email=51904030+MickaelVanhoutte@users.noreply.github.com commit …`.
  `package-lock.json` must resolve from `registry.npmjs.org`: this machine may default to a
  corporate registry, so check the `resolved` URLs after `npm install`.
- **Balance with simulations** before shipping changes to teams or stats (`npm run balance`, and
  `npm run curve`: on Normal a player who never grinds must keep up, see `src/data/curve.test.ts`).
  The owner asked for a gentle start: see [docs/story.md](docs/story.md#level-curve-and-difficulty).
- Ship each milestone separately, then check that the deploy is live (see [docs/testing.md](docs/testing.md)).
- **No spoilers outside the technical docs.** The README and [docs/histoire.md](docs/histoire.md)
  never reveal the twists or the ending (who the Prof and the Great Eraser really are, the waking up,
  the final choice, surprises along the way: what solves a mystery, evolution names, legendaries).
  Those belong in [docs/story.md](docs/story.md) (and flag tables in docs/content.md).
- **Keep [docs/histoire.md](docs/histoire.md) up to date.** Any change to the story, places,
  characters or side content updates it in the same commit, in French and English.

## Commands

```bash
npm run dev                                   # http://localhost:5173/pokemol/ (.claude/launch.json "dev")
npm test                                      # vitest, node environment, src/**/*.test.ts
npx vitest run src/data/maps.test.ts          # one file
npx vitest run -t "difficulty"                # tests whose name matches
npm run typecheck                             # tsc --noEmit (src + tools, excludes tools/out)
npm run build                                 # typecheck + vite build to dist/ (PWA service worker included)
npm run balance -- [easy|normal|hard] [n] [rows] # simulated trainer fights along the story (rows: ids, comma-separated)
npm run curve -- [easy|normal|hard]          # the team's levels at each trainer without grinding (src/data/curve.ts)
npm run redraws -- 013                        # draw a Bestiole in her style (card, mini, tools/out/redraws-sheet.png)
npm run cards -- 013                          # cut one of her drawings out of its photo into public/originals
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
- `src/state/game.ts`: the `save` signal (`SaveData` v5 from `src/save/schema.ts`: party, 8 PC `boxes` of 30, bag, flags, `steps`, `daycare`…; localStorage key
  `atelier-bestioles.save`). `update(fn)` mutates it; it is written to storage only by SAUVER in the
  start menu (`persist()`), or after every change when the player turned on the auto-save option
  (`autosave()`, off by default, GBA style). `migrate` and `migrateV2` load older
  saves (v2 parties go to the PC); `repair()` then fills in what newer versions added (it runs on every
  load, so it must stay idempotent). Changing the save shape means bumping `SAVE_VERSION`, adding a
  migration or repair step and a test (`src/state/game.test.ts`).
- `src/state/clock.ts`: day, evening and night from the device's clock plus `save.clockShift` (sleeping
  at an Inn or at home, `sleepUntil`). Encounter entries can be `time: 'night'`; outdoor maps get a multiplied tint.
- `src/state/prefs.ts`: per-device preferences outside the save (text speed, difficulty, battle
  speed, sound, music) so Options also work from the title screen.

**Data** (`src/data`) is plain TypeScript objects with `L()` texts:
- creatures (`faces` marks sideways drawings; `talents` + `hiddenTalent` index `src/data/talents.ts`,
  the first talent being the family's power; `evolutions` rules by level, item or friendship;
  `grownForm(id, level)` for trainer teams), natures;
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
  (16px tiles). `LOOKS` gives the trainer and NPC chibis; `lookOf()` turns the player's look into one.
- Wherever a character shows big (battle intros, the player's back in battle, the prologue, the trainer
  card) it is drawn in coloured pencil by `personUrl()` (`src/ui/personArt.ts`), from an `Appearance`
  (`src/data/appearance.ts`: the player's `save.player.look`, or a story character's `Look` through
  `fromLook`). The player picks it in the prologue and changes it from the trainer card (`LookView`).
- `controller.ts` is the glue between the save, the maps and the story:
  - movement, interactions, warps (including `to: 'back'` for shared interiors), trainer sight;
  - flags, `fight()` (wipe, music, intro, outcome, blackout), `trainerBattle()`, evolutions, rematches;
  - the `scripts` registry. `dialog.ts` provides `say` / `sayAll` / `ask`.

**Story** (`src/story`): async functions registered as `scripts.<id>`. `world.ts` holds the town trades
(`TRADES`) and the side quests (`quest:*` flags). Maps reference script ids from:
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
  - `creature.ts` covers stats, XP (`level³`, Gen 3 yield, ×1.5 for traded Bestioles) and evolutions; the level cap is 100
    (`MAX_LEVEL`; the Challenge Tower still battles at 50);
- `src/ui/battle/BattleScreen.tsx` dispatches actions:
  - it plays the events as text (`messages.ts`) and animations (`BattleScene.tsx`);
  - it keeps the bag, party and learn-move overlays inside itself, because the router would unmount
    the battle;
  - a long press (or right click) on a move button (`MoveButton`'s `onHold`) shows `MoveInfo` over the
    scene: type, kind, power, accuracy, PP and description.
- `BattlePanel` has a fixed height. Its mode comes from the pure `panelMode()`. Long text is
  paginated by `TextBox` rather than growing the panel.
- Backdrops are drawn in coloured pencil on a canvas (`backdrops.ts`, with the `Pencil` of
  `src/ui/paper/pencilCanvas.ts`).
- Move animations live in `src/ui/battle/fx/`:
  - `recipes.ts` gives each move a `Recipe`: motions of the two drawings (Web Animations on the
    `translate` / `rotate` / `scale` properties, which keep mirrored drawings mirrored) and timed layers
    from `effects.ts`, drawn by the flipbook `Brush` (`brush.ts`, 12 wobbles a second) with the doodles
    of `doodles.ts`;
  - `stage.ts` plays them on two canvases, `.pk-fx` over the drawings and `.pk-fx-back` under them;
  - `outcome.ts` reads the events after a `move`: only a move that lands animates, as on the GBA;
  - `events.ts` (with the builders of `statusFx.ts`) animates the other events: a status taking hold,
    stat chevrons, healing, weather arriving, the paper shield and doll (`doll.ts` stands in for the
    Bestiole while `vol.sub > 0`), talents, held items, send-out and the Crayon-ball (always drawn);
  - a new move needs a recipe (`recipes.test.ts` fails without one). The option ANIMATIONS
    (`prefs.moveFx`) turns them off, except the Crayon-ball.

**UI kit** (`src/ui/paper`):
- the font is Patrick Hand (handwriting); menu entries use pencil doodles (`src/ui/sketchIcons.ts`),
  item icons stay pixel art;
- `sketch.ts` draws the hand-drawn look at start-up (pencil frames, pastel crayon hatching, sketched
  round buttons) into CSS variables; boxes pick a crayon with `sk-<crayon>` classes. See
  [docs/content.md](docs/content.md#ui);
- `Window` (a pencil border drawn with an SVG `border-image`) and `TextBox` (fixed number of lines,
  `paginate()` measures pages);
- `MenuList` and `useMenuNav` (a capture-phase key handler; nested menus rely on
  `stopImmediatePropagation`), `Frame`, `YesNo`, `HpBar`…
- `src/ui/views/*` are pure views (props in, callbacks out). `src/ui/screens/*` are thin wrappers
  bound to the save. Item, menu and badge icons are pixel art from `src/ui/icons.ts`.

**Audio.**
- `src/audio/music.ts` is a small Web Audio sequencer (pulse, triangle, sine and sawtooth voices,
  noise drums) playing original tracks; the title menu's music box (`JukeboxScreen`) plays each one. `mapMusic.ts` picks the track for each map; battles pick theirs in `fight()`.
- `sfx.ts` plays sound effects, and `fxSound(kind)` the sounds of the move animations: each effect
  layer lists its `sounds` (fire whoosh, splash, thunder, slash, stat arpeggios…). Everything respects the prefs.

**Drawings → cards.** Every card `public/cards/<id>-<slug>.webp` is drawn in code, as SVG:
- her Bestioles (and new ones) by `tools/redraws` (`npm run redraws`). The `crayon` kit copies her
  technique: dense coloured-pencil strokes that run over the line, a second pass across in places,
  paper specks, one wobbly graphite (or felt-tip) outline, lopsided shapes. It writes
  `tools/out/redraws-sheet.png`: her drawing, the redraw, battle size and miniature side by side;
- the *brouillons* by `tools/drafts` (`npm run drafts`, rougher kid kit, `draft: true`, see
  [docs/content.md](docs/content.md#brouillons-drafts)).

Both go through `src/art/cutout.ts` (paper flattening, ink mask) like a photo and make the overworld
miniature `public/minis/<id>-<slug>.png` (`tools/minis.ts`, `src/art/mini.ts`: shrunk, a fitted 6-colour
palette, a dark outline). The miniature is the follower (`Game.follower`, refreshed from the party by
`refreshFollower`); a test requires one per creature. Sparkly (shiny) Bestioles are recoloured at run time
by `src/art/shiny.ts`, the same hue turn for the card (`monArtUrl`) and the follower (`miniFor(id, true)`). Her own drawings stay as the originals:
`tools/cards-manifest.json` (crop box, erase polygons, `scale`, `options`) → `tools/cut-drawings.ts` →
`public/originals/`, listed in `src/data/originals.ts` and shown in the credits. Sheets land in
`tools/out/` (gitignored scratch, also excluded from `tsc`).

## Gotchas

- In dev only, `window.__ab` (save, `update`, `warpTo`, `runScript`, `setFlag`, `fight`,
  `trainerBattle`, `createMon`…) and `window.__battle` (`dispatch`, `state`) exist for playtesting.
  See [docs/testing.md](docs/testing.md).
- Eggs are `Mon`s in the party with `egg: { steps }`. Anything that picks fighters, heals, evolves,
  teaches or names must skip them (`partyAlive`, `fight()`, `canUseOn`, `evolutionOf`, `monLabel`).
- Shared interiors: one `centre` (the Inn, « Auberge », in place of a Healing Center: the innkeeper
  heals, its beds sleep until night or morning) and one `boutique` (shop) map serve every town
  (`generic: true`). Their exits warp `to: 'back'`, which uses `player.returnTo`. Per-town NPCs use
  `fromMap`. The shop sells the `STOCK` list in `ShopScreen.tsx`, each item after a number of badges.
- Sideways drawings set `faces: 'left' | 'right'`. Battle sprites are mirrored so ours looks right and
  the foe looks left.
- The pencilize pass skips pure black (`#000`, the void around interiors).
- `src/story/story.test.ts` checks every script id and every flag a map waits for. Flags starting
  with `a2.` to `a9.` are exempt (a leftover from when later acts weren't written yet).
- Dungeon puzzles (pushable blocks and boulders, holes to the floor below, weight plates, crayon
  barriers, glossy paper, fresques) are map data, explained in [docs/content.md](docs/content.md#puzzles);
  `src/data/puzzles.test.ts` solves each one on the real maps.
- After the ending (`ending` flag), Atelier Masters offer rematches at +12 levels.
- New Bestioles strong enough for the battle tower go in `TOWER_POOL` (`src/data/postgame.ts`).
  `fight({ borrowed })` battles with copies that never come back to the save (tower).
- The web app manifest `id` in `vite.config.ts` (`/pokemol/?app=atelier-bestioles`) is the app's
  identity for browsers: never change it, or every installed copy becomes a different app. When
  Android Chrome says the game is already installed but it isn't, another web app installed from
  `mickaelvanhoutte.github.io` is the cause (Chrome mixes up apps sharing an origin). Uninstalling
  that app fixes it; the manifest doesn't. In that case Chrome sends no install offer, so the
  title-screen install toast (`installWay` in `src/state/pwa.ts`) stays hidden.
- Progress must be saved before a cut-scene's dialog, not after: a trainer's `storyFlag` is set with
  its win, and the final scenes resume from their map's `onEnter` (`bordPage`, `ending`) if the app was
  closed midway.
- `TextBox` tags its pages, page number and typed count with the text they belong to, so a new
  message starts empty in the same render. Don't reset them in an effect: that painted one frame
  of the new text at the old length (the "text shows then rolls back" flash).
