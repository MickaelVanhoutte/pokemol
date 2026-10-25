# Adding content

Everything below is plain data or async scripts. Write every player-visible text as
`L('français', 'English')`. After a change, run `npm test`: the map and story tests catch most
mistakes, such as a wrong row width, a warp onto a wall, an NPC on a rock, an unknown script id or a
flag nobody sets.

## Flags

Progress is `save.flags: Record<string, number>`. Conventions:

| Flag | Set by | Meaning |
|---|---|---|
| `intro`, `rival1`, `visitedCenter`, `ending`, `pagesReward`, `dexDiploma` | story scripts | One-off story steps |
| `rivalStarter` | lab script | Rival's species, stored as a number (e.g. `3` for `'003'`) |
| `a1.*`, `a2.*`, `a3.*` | story scripts | Act milestones (`a1.bois`, `a2.feutre`, `a3.usine`… see [story.md](story.md#region-path)) |
| `tr:<trainerId>` | `trainerBattle()` on a win | Trainer beaten (NPC trainers stop battling; also used as a story gate) |
| a trainer's `storyFlag` (`a1.bois`…) | `trainerBattle()` on a win, saved together with `tr:` and the badge | What the win unlocks; its `afterScript` only plays the scene |
| `badge:<badgeId>` | `trainerBattle()` for leaders | Badge owned (also pushed to `save.badges`) |
| `item:<map>:<x>,<y>` | pick-ups | Item on the ground already taken |
| `berry:<map>:<x>,<y>` | berry bushes | Local day number the bush was last picked (it regrows the next day) |
| `gift:calque` | Prof. Fusain's aide (Healing Center) | Tracing Paper given |
| `rematch:<trainerId>` | `rematch()` on a win | Post-game rematch won (Town Map objectives) |
| `visit:<map>` | `visitTown` (a town's `onEnter`) | Balloon destination unlocked |

Read flags with `flag(name)` and write them with `setFlag(name, v?)` (`src/overworld/controller.ts`).
Maps react without code:
- NPC `showIf` / `hideIf`;
- trigger `if` / `unless`;
- `patches[].if` / `unless`;
- `tintUnless`.

After a script that changed flags, the map is rebuilt (`refreshMap()`).

## Maps

One file per area in `src/data/maps/`, exported as a `Record<string, MapDef>` and spread into `MAPS`
in `maps/index.ts`. The fields are documented in `src/overworld/mapTypes.ts`.

- `rows`: one character per 16px tile; every row the same width. The legend is the comment at the
  top of `maps/index.ts` (`LEGEND` in `mapTypes.ts` is the source of truth). `border` is the tile
  drawn outside the map.
- `warps`: tiles that move the player to `{ map, x, y, facing }`. Add the matching warp on the other
  map. Shared interiors use `to: 'back'`.
- `buildings`: drawn over the rows. They take `kind`, a position and size, a `door` column, and a
  `to` target. A `script` instead of `to` gates the door. `kind` is one of `'house' | 'lab' | 'center'
  | 'shop' | 'cave' | 'tower' | 'gym'…`; `roof` sets the colour.
- `npcs`:
  - `look` comes from `LOOKS` in `src/overworld/sprites.ts` or is inline `{ hair, shirt, pants }`;
  - `text: LText[]` for simple talkers, `script` for story NPCs;
  - `trainer` plus `sight` (tiles) for trainers who spot the player;
  - `wander`, `showIf` / `hideIf`, and `fromMap` in shared interiors.
- `signs`, `triggers` (an area that runs a script when stepped on), `interact` (A on a tile runs a
  script).
- `items`: pick-ups. `hidden: true` is invisible and found with A (used for the sketchbook pages).
  Pick-ups are solid: put them on dead ends or open ground so they never block a path.
- `berries`: `{ x, y, item }` bushes on a `B` (bush) tile next to a walkable one; A gives 1–3 berries
  once per local day (`src/overworld/berries.ts`).
- `encounters`: `{ rate, table: [{ id, w, min, max }] }`, where `w` is the weight. Add
  `anyTile: true` in caves.
- `backdrop`: the battle background (`grass | forest | cave | tower | lab | beach | city | volcano |
  sketch`).
- `indoor`, `tint`, `fog`, `onEnter` (towns use `'visitTown'`).
- `generic: true` marks a shared interior.
- `patches`: `{ id, x, y, rows, if?, unless? }` redraws a block while the flag condition holds. In
  patch rows, `?` keeps the tile underneath.

A **new outdoor map** also needs a place on the Town Map: an entry in `WORLD`
(`src/data/worldmap.ts`, a rect on the 24×20 grid). `worldmap.test.ts` checks every outdoor map has one,
that border warps point the right way on the grid, and that every map (interiors included, through
their doors) resolves to a place.

A **new tile** needs:
- a `TileDef` in `src/overworld/tiles.ts` (`paint` with the `Painter`; flags `solid`, `encounter`,
  `over`, `ledge`, `animated`);
- a free character in `LEGEND`;
- the legend comment in `maps/index.ts` updated.

The map test rejects unknown characters.

**Music** follows the map automatically (`trackForMap` in `src/audio/mapMusic.ts`): towns and
interiors, routes, caves and towers. Special maps are listed in `BY_MAP`.

## Story scripts

Add `scripts.myId = async () => { … }` in the act file (`src/story/act1.ts`…`act3.ts`, or `common.ts`
for shared ones), then reference `myId` from a map. Tools (import from `../overworld/controller`):

- Dialogue: `say(text, speaker?, vars?)`, `sayAll(lines, speaker?)`, `ask(text, choices, speaker?)`
  (resolves to the choice index), `showToast(msg)`.
- Flags: `flag`, `setFlag`.
- Save: `update((d) => …)` from `src/state/game.ts`, `giveMon(species, level)`, `giveItem(id, n)`.
- Movement and screens: `warpTo(dest, { keepFade? })`, `openScreen(screen)` (resolves when the player
  is back in the world), `wait(ms)`.
- Effects: `flash(color?, ms?)`, `shake(ms?)`, `bubble(actorId, '!' | '?' | '…' | '♪' | '♥' | 'zz')`.
- Battles: `trainerBattle(id, actor?)` for normal trainers (before lines, battle, flag, badge,
  `afterScript`), or `fight(kind, name, party, opts)` for scripted ones (`friendly`, `tutorial`,
  `backdrop`, `look`, `grey`). Both return or set the result, and a loss blacks out unless `friendly`.
- Cut-scenes, through `const g = getGame()`:
  - `g.npc(id)`, `g.spawn(id, look, x, y, dir)`, `g.remove(id)`;
  - `await g.walk(actor, ['up', 'up', 'left'])`;
  - `g.face(actor, dir)`, `g.faceToward(a, b)`;
  - `await g.fadeTo(1, ms, 'white' | 'black')`, `await g.wipeTo(…)`;
  - `g.player` is the player actor.

Scripts run one at a time and lock player input. To change an existing script after a story point
(post-game lines…), wrap it in a later act instead of editing it in place:
`const prev = scripts.x; scripts.x = async () => { if (!flag('ending')) return prev(); … }`.

## Trainers

`src/data/trainers.ts`, one `T({...})` per trainer, then an NPC with `trainer: '<id>'` and `sight`.

- `party`: `[{ species, level }]` at **Normal** difficulty. `partyOf` applies `DIFFICULTY`, and
  trainer IVs are fixed per difficulty.
- `before`: lines before the battle. `after[0]` is the defeat quote shown inside the battle (GBA
  style). For normal trainers, the other `after` lines are said after the battle. For leaders, they
  are said after the badge is given (use them to point to what comes next).
- `money`, `badge` (an id from `src/data/badges.ts`), `grey: true` for Team Gomme, and `afterScript`
  (a story script run right after the win).
- `storyFlag`: the story flag the win unlocks. Never set progress at the end of an `afterScript`: the
  app can be closed during its dialog and the battle never replays, which would block the story for
  good. `trainerBattle()` saves `tr:<id>`, `storyFlag` and the badge in one `update` before any line is
  said; `repair()` in `src/state/game.ts` also restores them for saves made by older versions.
- `item` on a party entry: a held item (berries are eaten in battle).
- Run `npm run balance` before and after changing levels or teams (see [testing.md](testing.md)).
  Keep the early game gentle ([story.md](story.md#level-curve-and-difficulty)).

## Creatures, moves, items

- **New drawing**: follow README "Add a new drawing". It covers the photo in `img-source/`, the
  manifest entry, `npm run cards -- <id>`, checking `tools/out/contact-sheet.png`, then adding the
  creature to `src/data/creatures.ts`. For a creature that evolves, set `evolvesTo` and `evolveLevel`
  on the base form and `evolvesFrom` on the evolved one. Set `faces` for sideways drawings, and
  `rarity`, which weights the Tombola. Put it in an `encounters` table or a trainer party.
- **Moves** (`src/data/moves.ts`): `type`, `cat` (`phys` / `spec` / `status`), `power`, `acc`
  (`null` never misses), `pp`, `priority`, and `effects`. The effect kinds (status, confuse, flinch,
  stage, heal, multi…) are listed in `src/data/schema.ts` and run by `src/engine/pk/battle.ts`.
  Add the matching text in `src/ui/battle/messages.ts` if a new event appears.
- **Types**: the chart is in `src/data/types.ts` (attacker → defender multipliers).
- **Items** (`src/data/items.ts`): `kind: 'heal' | 'status' | 'revive' | 'ball' | 'key' | 'berry' | 'hold' | 'battle' | 'stencil'`.
  Key items (pages, golden ticket) go in the OBJETS RARES pocket and are never sold.
  - `berry`: a Bestiole holding it eats it in battle as soon as it helps (`amount` HP at half HP or
    less, or a status in `cures`); berries can also be eaten from the bag. They have their own pocket.
  - `hold`: works while held; `hold` names the effect run by `src/engine/pk/battle.ts`:
    `regen` (Snack, 1/16 HP each turn), `shareXp` (Tracing Paper), `typeBoost` with `type` (coloured
    pencils, +20%), `lockAtk` / `lockSpa` / `lockSpe` (Stubborn items: ×1.5, one move until withdrawn),
    `powerCost` (Fierce Marble), `specialGuard` (Painter’s Apron), `spikes` (Spiky Helmet), `holdOn`
    (Steadfast Ribbon), `quickStart` (Swift Quill), `critUp` (Drafter’s Loupe), `flinchUp` (Cardboard
    Crown), `drainHit` (Greedy Bell). Both sides use them; a new effect needs its battle hook, a
    message in `messages.ts` for any new event, and a test in `pk.test.ts`.
  - `battle`: used from the bag in battle on the Bestiole fighting, with no party picker; `boost`
    is a stat raised one stage (syrups), `crit` (Pencil Sharpener) or `guard` (Protective Varnish:
    the foe can't lower your stats for 5 turns).
  - `stencil` (Pochoir): teaches its `move` to a compatible Bestiole as often as you like (never used
    up, POCHOIRS pocket, no ×count). Add the move to `STENCIL_MOVES` in `items.ts` (the id becomes
    `pochoir-NN`), list it in the `stencils` of every species that can learn it, and place it (a pick-up,
    or `stencil` on a badge in `src/data/badges.ts` for a leader's reward). A test checks every
    stencil teaches a real move and fits at least one species.
  - Any non-key item except stencils can be held (party ITEM menu or bag GIVE). Trainer parties can give an `item`,
    and species a `wildItem` (`{ id, pct }`) that wild ones sometimes carry.
  - The shop sells the list in `STOCK` (`ShopScreen.tsx`), each item after a number of badges.
  - Item icons are pixel art in `src/ui/icons.ts` (`ROWS`, or a painter in `PAINTED`).

## UI

- Build screens from the paper kit (`src/ui/paper`): `Frame` (title strip and back button),
  `Window`, `TextBox`, `MenuList` with `useMenuNav`, `YesNo`, `QtyPicker`. That keeps the FRLG layout
  and the keyboard, touch and B-button behaviour consistent.
- Pure views go in `src/ui/views`. A screen wrapper in `src/ui/screens` connects a view to the save.
  A new screen also needs a `Screen` variant in `src/state/router.ts` and a case in `src/app.tsx`.
- The battle panel never changes height. If something doesn't fit, it pages (`TextBox`) or opens an
  overlay inside `BattleScreen`.
- Per-device options go in `src/state/prefs.ts` and get a row in `ROWS` in
  `src/ui/views/OptionsView.tsx`.
