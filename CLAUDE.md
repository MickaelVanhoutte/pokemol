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
  (`.claude/skills/new-bestiole/SKILL.md`) walks through adding a Bestiole drawn in her style; the skill
  `bestiole-design` (`.claude/skills/bestiole-design/SKILL.md`) designs it first: the concept card the owner picks,
  silhouette, shapes, colours, face and family ladder.

## Standing rules from the project owner

- **Original names only.** No Pokémon names, branding or assets anywhere: the site is public.
  The game's own words are Bestiole, Croque-Carnet, Atelier (gym), Maître d'Atelier (leader),
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
  The story ends around L42–45 (iteration 16). A wild Bestiole is never stronger than the trainers of its
  map: its level stays at or under the weakest trainer's ace there (`src/data/maps.test.ts`).
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
npm run fair -- toufeu                        # its fair copy, from its card (its rig; `--try` only draws, into tools/out/fair-try)
npm run fair:preview                          # tools/out/fair-preview.html: the fair copies moving, for the owner
npm run dex                                   # tools/out/bestiodex.html: every Bestiole's stats, talents, moves, and a Types page
npm run cards -- 013                          # cut one of her drawings out of its photo into public/originals
npm run icons                                 # regenerate public/icon-*.png
npm run music -- title                        # record tunes into src/audio/recordings (Chrome + macOS afconvert)
npm run demo -- m1                            # tools/out/demo-m1/: a playable demo page for the owner (Artifact)
```

There is no linter. TypeScript is strict with `noUnusedLocals`/`noUnusedParameters`.
CI (`.github/workflows/deploy.yml`) runs `npm ci`, `npm test` and `npm run build`, then publishes `dist/`.
`vite.config.ts` has `base: '/pokemol/'`: asset URLs go through `import.meta.env.BASE_URL`.

## Architecture

Stack: Vite + TypeScript + Preact + `@preact/signals`; the overworld is a hand-written canvas engine.

**Shell.** `src/main.tsx` renders `App` and imports `src/story` so every story script registers
itself. A new game opens on `SleepIntroView` (falling asleep at the desk, pencil sounds, the title theme
fading in) before the Prof's speech in `NewGameScreen`. `src/state/router.ts` holds one `screen` signal; `src/app.tsx` switches on it, inside `Guard` (`src/ui/Guard.tsx`): a screen that throws, or a world loop failing 30
frames in a row (`worldBroken`, `src/state/crash.ts`), shows a torn page with Retour, Recharger and an export of the game. The overworld,
title, new-game prologue, battle and each menu are separate screens. A script can `await openScreen(…)`
and resume when the player returns to the world. `App` is keyed on the locale, so switching language
re-renders everything.

**State.**
- `src/state/game.ts`: the `save` signal (`SaveData` v5 from `src/save/schema.ts`: party, PC `boxes` of 30 (8 at first, `spareBox` adds one when they are nearly full), bag, flags, `steps`, `daycare`…).
  Up to `SLOTS` (3) games live side by side (a parent's and a child's): `slot` is the one being played,
  stored under `atelier-bestioles.save` (game 1, the key of the single save before) or `….save.2` / `.3`;
  the title screen picks one (`peekSlot`, `savedSlots`), and each game keeps its own `difficulty`, applied by
  `loadSave`. `update(fn)` mutates it; it is written to storage only by SAUVER in the
  start menu (`persist()`), or after every change when the player turned on the auto-save option
  (`autosave()`, off by default, GBA style). `migrate` and `migrateV2` load older
  saves (v2 parties go to the PC); `repair()` then fills in what newer versions added (it runs on every
  load, so it must stay idempotent). Changing the save shape means bumping `SAVE_VERSION`, adding a
  migration or repair step and a test (`src/state/game.test.ts`).
  A save that can't be played (`playable()`, or `repair()` throwing) is turned down, never crashing the title: `persist()`
  keeps the save it replaces under `<key>.prev` (loaded instead, with a line, when the last one is damaged,
  `restoredPrev`) and an unreadable one under `<key>.bad`; `deleteSave` erases all three.
- `src/state/clock.ts`: day, evening and night from the device's clock plus `save.clockShift` (sleeping
  at an Inn or at home, `sleepUntil`). Encounter entries can be `time: 'night'`; outdoor maps get a multiplied tint.
- `src/state/prefs.ts`: per-device preferences outside the save (text speed, battle speed, sound, music)
  so Options also work from the title screen. The difficulty is a pref too, but each game carries its own
  (`save.difficulty`) and Options writes it into the game being played.

**Data** (`src/data`) is plain TypeScript objects with `L()` texts:
- creatures (`faces` marks sideways drawings; `talents` + `hiddenTalent` index `src/data/talents.ts`,
  the first talent being the family's power; `evolutions` rules by level, item or friendship, or
  `story` (Coconfus becomes Libellune or Noctaile only at the ending);
  `grownForm(id, level)` for trainer teams), natures;
- moves, the type chart, items (`kind: 'key'` for story items); one fishing rod, whose catch follows the
  team's level (`fishing.ts`, a map's `fishing: { low, mid, high }`);
- trainers (levels are the Normal difficulty; `partyOf` applies `DIFFICULTY`; bosses carry a `plan`, a moveset and
  nature from `src/data/movesets.ts`, used on Hard and after the story: `planTeam`, `planned`), badges, sketchbook pages;
- `maps/<area>.ts`, merged in `maps/index.ts`. Map rows are strings; `LEGEND` in
  `src/overworld/mapTypes.ts` maps each character to a tile id;
- `custom.ts`: the player's own Bestiole, drawn at the Atelier des Brouillons (`save.atelier`): registered as
  species `CUSTOM_ID` (`'000'`) at load time, outside `CREATURES`; `artUrl` / `miniFor` read its saved drawing,
  and Bestiodex totals use `dexCount`, which leaves it out; a complete Bestiodex is `DEX_GOAL` (every species but its
  reward, `dexReward: true`: Baleincre on the hidden island);
- `worldmap.ts`: the Town Map layout (`WORLD`), where-am-I (`regionOf`, `playerSpot`) and the
  balloon towns. Next objectives for the map live in `src/story/objective.ts`.

**Overworld** (`src/overworld`):
- `game.ts`: the `Game` class. It runs the canvas loop and draws the prerendered map layers, actors,
  fades, speech bubbles and the "pencilize" post-pass (`pencil.ts`). It also provides the
  cut-scene helpers `walk`, `face`, `faceToward`, `spawn`, `remove`, `fadeTo`. Someone joining a
  cut-scene walks in with `comeUp` and leaves with `goAway` (`src/story/choices.ts`): they start and end off screen (or at
  the door of a room that fits the screen) and find their way around trees and walls (`pathTo`), never appearing or
  vanishing in view; `walkTo` takes someone to the spot where they stay. The one exception is magic: someone drawn into
  the page or rubbed out of it (`sketchIn` / `eraseOut`, `src/overworld/scene.ts`: pencil lines then colours, or
  rubbed out from the top in crumbs), like the Great Eraser.
- Staging (see [docs/content.md](docs/content.md#staging-a-scene)): `Game.camera` (`camera.ts`) follows the player
  exactly as before (`frame`), or pans, follows someone (`look`), zooms (drawn into a smaller view, scaled up) and
  shakes (`rumble`, `jolt`, `quake`); `Game.visibleTiles()` is what it shows, used by `comeUp`/`goAway`. `scene.ts`
  has the cinema bars (`staged(fn)`, which always gives the camera back) and `lookAt` / `lookBetween`. Scene time
  (`src/anim/sceneClock.ts`): holding B while a script runs (no question open) makes walking, `wait`, fades, the
  camera and the colour returns three times faster (`sceneNow`, `sceneWait`); text never hurries. Bubbles pop in
  with their sound (`bubble`), and a trainer who spots you gets a camera knock and zoom and the `spotted` (or
  `spottedGomme`) jingle.
- The world redrawn in front of you (`redraw.ts`, `redraw(kind, { at })` in `scene.ts`): right after setting the flags
  that change a map, it keeps a picture of the view, rebuilds the map (`refreshMap`, which keeps the camera) and takes
  the old picture away: `erase` (an eraser sweeping bands), `restore` (colour flooding out in a circle), `sketch` (pencil
  strokes hatching the new drawing in), `rise` (a wall coming up). Used for the woods and the hamlet.
- Planches (`src/ui/planche/`; the story's own in `src/story/planches.ts`, see
  [docs/content.md](docs/content.md#writing-a-planche)): a few big moments drawn full screen over the world, under the
  dialog box and the touch buttons (`PlancheView`, z-index 18). A `Planche` is a `draw(ctx, t, w, h, kit)` redrawn from
  scene time (holding B hurries it, a press jumps to its next beat), beats with captions, sound cues and pictures made
  when it starts; `draw.ts` pencils a picture in or rubs it out through hatching (`hatched`), and has crumbs, the
  pencil, the eraser, eyelids (`lids`, shared with the prologue) and a camera (`camAt`, `look`). `showPlanche(p)` waits
  for it (`end: 'tap'`: until a press), `withPlanche(p, fn)` keeps its last picture while someone talks. Used for the
  Prof's photo (`profPhoto`, `act1.ts`), the Great Eraser's face (`reveal`, `finale.ts`) and waking up (`eyesOpen`).
- The weather (`src/state/weather.ts`): one sky a real day per outdoor map (`Game.sky`), drawn over it, carried into
  battles (rain, hail) and into a few encounter rows (`sky`).
- The living world: `particles.ts` (grass blades from tall grass, dust landing from a ledge, rings behind the boat,
  a pool stepped and drawn by `Game`), a soft shadow under everyone, `doors.ts` (doorways open, `stepOut` from a
  building), `ambient.ts` (each map's `ambient`, fireflies outdoors at night), and the time of day's tint from
  `tintAt(hour)` (`src/state/clock.ts`, blended over an hour round 7 h, 19 h and 21 h; `Game` slides to a new tint
  over two seconds, `updateTime(true)` snaps it when the game starts).
  The ways out of an outdoor map (warps on its edge) light up as the player comes within three steps (`drawExitHints`:
  a breathing light and a chevron sliding out), and a river that is a way out runs on off the page, with no bank drawn
  across it. The bike and the paper boat turn with the player (`fieldSprites.ts`: from the side, or end-on going up or down).
- `tiles.ts`, `buildings.ts` and `sprites.ts` paint pixel art with the `Painter` from `pixel.ts`
  (16px tiles). `LOOKS` gives the trainer and NPC chibis; `lookOf()` turns the player's look into one.
- Wherever a character shows big (battle intros, the player's back in battle, the prologue, the trainer
  card) it is drawn in coloured pencil by `personUrl()` (`src/ui/personArt.ts`), from an `Appearance`
  (`src/data/appearance.ts`: the player's `save.player.look`, or a story character's `Look` through
  `fromLook`). The player picks it in the prologue and changes it from the trainer card (`LookView`).
- `controller.ts` is the glue between the save, the maps and the story:
  - movement, interactions, warps (including `to: 'back'` for shared interiors), trainer sight;
  - wild encounters, rolled as FireRed does by `encounterRate.ts` (map `rate` 21 on a route, 7 in a cave, 2 on
    water; calm steps after each battle, odds growing step by step);
  - `arrivals`: scenes that start by themselves once the player is free on a map (checked after every warp and
    every script): the seven Colour Guides bringing the field tools (`src/data/guides.ts`, `src/story/guides.ts`);
  - flags, `fight()` (transition and VS splash, music, outcome, blackout), `trainerBattle()`, rematches, evolutions (`checkEvolutions(grown)`:
    as on the GBA, only a Bestiole that just grew a level evolves, never one caught or received past its level);
  - the `scripts` registry. `dialog.ts` provides `say` / `sayAll` / `ask` (a box asked for while another is open waits its turn; tests close boxes with `closeDialog`, as the UI does).

**Story** (`src/story`): async functions registered as `scripts.<id>`. `world.ts` holds the town trades
(`TRADES`) and the side quests (`quest:*` flags). `choices.ts` holds the story's choices (`choose`,
`endingOf`: the two endings) and Coconfus's helpers; `act4.ts` is beyond the margin; `epilogue.ts` is « La page
d’après », after the Grand Concours (the doubt, an ally now, a page to finish, its weekly training battle); `realLife.ts` is the days in the real house after the ending (one activity a
real day, levels in `src/data/realLife.ts` that boost catching, sparkles, XP and money); `finale.ts` is the
Great Eraser (with the player's face, `doubtLook`), waking up, the `drawing` screen (`DrawingScreen`) and the
evolution; `coconfus.ts` wraps other scripts, so it is imported last. Maps reference script ids from:
- NPCs (`script`), triggers, `interact` spots;
- building doors (`script`), `onEnter`;
- a trainer's `afterScript`.

Progress lives in `save.flags`. Maps react to flags declaratively:
- `showIf` / `hideIf` on NPCs, and `if` / `unless` on triggers; `when` (day, evening, night) and `night` lines on
  townsfolk, the map rebuilt when the time of day turns (`updateTime`);
- `patches`, which redraw part of the map (erased or restored areas; `?` keeps the tile underneath);
- `tintUnless` (and `drained`, real greys until the flag; `primaries` tint them one paint colour at a time);
- `sketchUnless` on buildings and on a town (only pencil lines until the flag; its Inn and shop rooms too).

`setFlag` marks the map dirty, and the map is rebuilt after the running script ends. The flag
conventions are in [docs/content.md](docs/content.md#flags).

**Battles.**
- Getting in and out (`src/ui/curtain`): `fight()` asks `introOf()` (`src/ui/battle/intro.ts`, pure) for a
  cover, a reveal and maybe a VS splash, then `playIntro` / `playOutro` (`transitions.ts`) run them on the
  curtain, a canvas `App` mounts above every screen (`Curtain.tsx`), so a transition started over the world
  ends over the battle. Each transition (`wipes.ts`) is drawn in coloured pencil from its progress alone,
  with the move animations' `Brush` (the covered page is hatched once into a picture, `sheetImage`, and the `lift`
  reveal only moves the canvas by CSS: redrawing full-screen hatching every frame stuttered on phones); the VS splash (`VsSplash.tsx`) puts the foe and the player face to
  face on a torn page. Durations follow the battle speed; MOUVEMENTS : DOUX (`prefs.motion`,
  `calmMotion()` in `src/anim/calm.ts`) turns them into fades. Shared easing maths: `src/anim/ease.ts`.
- The battle camera (`fx/camera.ts`): the scene is two layers, `.pk-cam` (backdrop, drawings, effect canvases)
  and `.pk-hud` (HP boxes; the foe's column keeps a `.pk-hp-space` for its box). `FxStage.play` with
  `camera: 'hit' | 'self'` stays still on plain hits and status moves (the owner found a zoom on every move too
  much); a super-effective or critical hit gets a short push onto the target (×1.05, ×1.08: keep it small)
  (`translate` + `scale` from its top-left corner, only ever zooming in), and freezes everything for
  `hitStopMs` (critical hit: plus a white flash and `sfx.crit`; final blow, from `moveOutcome().ko`: the
  longest). A faint pushes the camera onto the Bestiole (`stage.focus`), it goes back to pencil and slides
  down (`.fx-faint`, slower for a trainer's last one while the music fades). A Bestiole sent out comes out of
  a thrown Croque-Carnet (`throwBook`, `thrownOut`) after its trainer steps out (`.is-leaving`); a wild foe
  is already there. Off with ANIMATIONS : NON and MOUVEMENTS : DOUX.
- Counting (`tally.ts`, pure; `Tallies.tsx`): in battle the HP number runs down with its bar (`BattleHp`,
  `drainMs`; the damage message waits for it) and a low bar blinks (yours beeps once, `sfx.lowHp`); the
  experience bar fills at the battle speed with a rising glide; a level grown shows gold rings
  (`levelGlow`) and the GBA window, each stat's gain then the new stats (`levelGains`, `LevelUpWindow`, a
  tap turns the page); the prize money counts up over the scene (`BattleProps.reward`, `MoneyTicker`).
- `src/engine/pk` is pure and deterministic:
  - `createBattle(setup)` and `act(state, playerAction, enemyAction)` return a `Step`
    `{ state, events, snaps }` built on a `structuredClone`;
  - randomness comes from `state.rng`;
  - `blocked()` means waiting for a forced switch or a move-learn choice;
  - `ai.ts` has `aiChoose(st, slip)`: plain trainers score moves; a `smart` side (`brainOf` in `src/data/trainers.ts`,
    by difficulty) estimates damage (`expectedDamage`, no random numbers), finishes knock-outs, drinks potions from its
    bag (`SideState.items`, the `useItem` event with `side: 1`) and switches out of a bad `matchup` (`switches` left);
  - catching is FireRed's formula (`catchChance`) with a hidden pity counter (`missedBalls`: the 16th ball of a
    battle always holds); `boosts.catch` multiplies the ball (×2 on Easy, `DIFFICULTY.catch`, and the real house);
  - `creature.ts` covers stats, XP (`level³`, Gen 3 yield, ×1.5 for traded Bestioles) and evolutions; the level cap is 100
    (`MAX_LEVEL`; the Challenge Tower still battles at 50);
- `src/ui/battle/BattleScreen.tsx` dispatches actions:
  - it plays the events as text (`messages.ts`) and animations (`BattleScene.tsx`);
  - it keeps the bag, party and learn-move overlays inside itself, because the router would unmount
    the battle;
  - a long press (or right click) on a move button (`MoveButton`'s `onHold`) shows `MoveInfo` over the
    scene: type, kind, power, accuracy, PP and description;
  - on Easy and Normal, a pencil thumb marks the moves that hit the foe's weak spot once its species was met before
    (`weakSpotSlots`, `src/ui/battle/weakSpots.ts`; `fight()` passes the Bestiodex's `seen` from before the battle).
    The selected move has a darker frame (`--pencil-frame-on`), and long names shrink to fit their button.
- The fair copy (« mise au propre », `src/data/fairCopies.ts`): with the Feutre d'Or (`feutre-or`, from Zélie), a
  side makes one fully grown Bestiole a fair copy per battle: the AU PROPRE toggle in the move menu, a move action
  with `fair: true`, `canFairCopy`; it transforms before anyone moves. `Mon.fair` (battle only, dropped by the
  copy-back and `repair()`) switches `statsOf`, `talentOf` and `monTypes` (use it instead of `typesOf(m.species)` in
  battle) to the fair copy, and `Sprite` to its rig (`FAIR_RIG_OF`, `public/fair/`). Trainers with `fairCopy` (`true`,
  or `'dark'` for the Great Eraser's black scribbles) transform their ace (`fairAce`) as soon as it fights.
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
    Bestiole while `vol.sub > 0`), talents, held items, send-out and the Croque-Carnet (always drawn): a little
    sketchbook that opens at the foe's feet, draws it a bit more at each tick and pulls it into its page if caught
    (`crayonBall`, `ballTimes` in `statusFx.ts`, which also time the sprite's `is-captured`);
  - a new move needs a recipe (`recipes.test.ts` fails without one). The option ANIMATIONS
    (`prefs.moveFx`) turns them off, except the Croque-Carnet.
- A battle drawing (`Sprite` in `BattleScene.tsx`) is a `.pk-sprite` box, which takes the move motions,
  the mirroring and every state (grey, faint, doll, capture, the victory dance `fx-victory`), around a
  `.pk-idle` layer that breathes or hovers while it waits (`idleOf`, `src/data/rigs.ts`). A Bestiole drawn
  with moving parts has a battle rig (`RIG_OF`: `public/rigs/<id>-<slug>/`, `src/data/rigs.json`), its body
  and each part a separate picture moved by CSS (`flap`, `fold`, `swing`, `nod`, `reach`, `peek`, `throw`,
  `flicker`, `blink`); shiny and pale ones recolour each piece (`rigLayerUrl`). The drawing sizes itself with
  container units of its platform, so the box shrinks to it and the effects still find it.

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
- Every menu has the same bottom bar (`ActionBar`, also `Frame`'s): « ◀ Retour » (B) always bottom left and the same
  size, the main action (A) bottom right; the top only says where you are, with ◀ ▶ (also ← →) to turn pages. One
  word, « Retour ». See [docs/content.md](docs/content.md#ui); `src/ui/paper/actionBar.test.ts` checks it;
- `src/ui/views/*` are pure views (props in, callbacks out). `src/ui/screens/*` are thin wrappers
  bound to the save. Item, menu and badge icons are pixel art from `src/ui/icons.ts`.
- The small moments (`MomentViews.tsx`, over the world): a badge spinning in (`showBadge`), an item's icon shown big
  while its line is said (`gotItem`, used wherever the item jingle plays), the Bestiodex page of a first catch
  stamped « Enregistré ! » (`showDexPage`, `firstCatch`).
- Evolution (`EvolutionView`, timings in `src/ui/views/evolution.ts`): its own tune (`evolution`), rings of light, the
  new form bigger at each swap, a sparkle burst; only a fresh B press stops it, never with `locked` (the ending's
  Coconfus, `evoOverlay.locked`); the music before it comes back. Menus (`Frame`) open like a turned page
  (`openScreen` plays `sfx.page`). The credits roll up (`CreditsScreen`, `creditsRoll.ts`), B held ×3.

**Audio.**
- The original tunes are notes in `src/audio/tunes.ts`. `npm run music` plays them on a music box
  (`tools/music/synth.ts`, in headless Chrome: the melody on a music box, the bass on a felt piano, the
  harmony on chimes by voice order, brushes, shaker, wood block and bell, a small room reverb; battles add
  strings, brass and real drums through a voice's `inst` / `with`, see [docs/content.md](docs/content.md)) and
  records each into `src/audio/recordings/<id>.m4a` (committed; Vite hashes the names, so a re-recorded
  tune is downloaded again). Phones only play the recordings: synthesizing on the phone crackled.
  `src/audio/music.ts` downloads them all after launch (`preloadMusic`), decodes on demand (jingles and
  the last 3 tunes kept decoded) and loops each inside its recording (`LOOP_MARGIN`). After changing a
  tune's notes, run `npm run music -- <id>`. The title menu's music box (`JukeboxScreen`) plays each one. `mapMusic.ts` picks the track for each map; battles pick theirs in `fight()`.
- Both audio contexts are suspended while the page is hidden (app in the background, phone locked):
  `src/audio/background.ts`.
- `sfx.ts` plays sound effects, and `fxSound(kind)` the sounds of the move animations: each effect
  layer lists its `sounds` (fire whoosh, splash, thunder, slash, stat arpeggios…). Everything respects the prefs.

**Drawings → cards.** Every card `public/cards/<id>-<slug>.webp` is drawn in code, as SVG:
- her Bestioles (and new ones) by `tools/redraws` (`npm run redraws`). The `crayon` kit copies her
  technique: dense coloured-pencil strokes that run over the line, a second pass across in places,
  paper specks, one wobbly graphite (or felt-tip) outline, lopsided shapes. It writes
  `tools/out/redraws-sheet.png`: her drawing, the redraw, battle size and miniature side by side;
- Poupochette alone by the rougher kid kit of `tools/drafts` (`npm run drafts`), a look the owner wants kept
  ([docs/content.md](docs/content.md#the-kid-kit-poupochette)).

Each fully grown Bestiole also has a fair copy for battle (`npm run fair`): a rig only, no card or miniature.
It is its card's own drawing gone over neatly, in the `crayon` kit's `clean` style: a black felt-tip outline, flat
colour a little more vivid, and a gold star set by itself on the body. Poupochette keeps a hand-drawn
`tools/fair/poupochette.ts` ([docs/content.md](docs/content.md#fair-copies--mise-au-propre-)).
A part that moves in battle is drawn inside `c.part(name, { pivot, motion… }, () => …)` (both kits);
`npm run redraws` / `npm run drafts` then also write its battle rig (`tools/redraws/rig.ts`, checked on
`tools/out/rigs-sheet.png`) without changing the card ([docs/content.md](docs/content.md#moving-parts-in-battle)).
Both are drawn on a see-through sheet and trimmed by `cutRender` (`src/art/cutout.ts`: their own alpha, so
what their lines enclose stays see-through; a white part is drawn as paper), and make the overworld
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
  `fromMap`: only the innkeeper is in every Inn (the balloon pilot stands outside by his balloon, `src/data/balloons.ts`),
  each town's Inn has its own helper,
  and a helper's `service` label is listed on the Town Map (`src/data/inns.test.ts`). The shop sells
  the `STOCK` list in `ShopScreen.tsx`, each item after a number of badges (`'ending'`: after the
  story, the Magic Lollipop); no held items, which come from the trainer card's Progress rewards
  (`src/data/progress.ts`, flags `prix:*`), quests, pick-ups and the tower. The houses you can enter in towns share three rooms too (`maisonVille`,
  `maisonPetite`, `maisonAtelier`): who lives there is in the town map's `residents`, each with a `fromDoor`
  (the tile in front of its door), and `src/data/maps/index.ts` puts them in the room that door leads to.
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
- The start menu (and so SAUVER) opens only through `menuAllowed()`: the menu button queues a press like the
  keyboard, and `Game.update` drops it while a script runs (`lock`); dialogs and overlays keep it shut too.
- Progress must be saved before a cut-scene's dialog, not after: a trainer's `storyFlag` is set with
  its win, and the final scenes resume from their map's `onEnter` (`bordPage`, `ending`) if the app was
  closed midway.
- Android Chrome can drop the pixels of canvases when memory runs low (after a battle full of
  animations): cached drawings must be images, not canvases. Sprite sheets and field sprites draw from a
  decoded image copy, map layers become pictures once painted (`asPictures`: repainting a lost layer on the way back from a battle held up the page lifting off the world), and the game loop survives a frame that
  throws. Data-URL caches (`personUrl`, `monArtUrl`) are safe.
- `TextBox` tags its pages, page number and typed count with the text they belong to, so a new
  message starts empty in the same render. Don't reset them in an effect: that painted one frame
  of the new text at the old length (the "text shows then rolls back" flash).
