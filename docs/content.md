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
| `gift:calque` | Prof. Fusain's aide (Inn) | Tracing Paper given |
| `gift:crayonMagique` | Capucine (Ville-Pastel) | Magic Pencil given (4 badges, after Touffou) |
| `a3.note`, `a3.phare` | Nocturne's note on the Atelier door; Captain Buvard beaten | The lighthouse trip (the ferryman appears with `a3.note`, the Atelier opens with `a3.phare`) |
| `piste.open` | `pisteGate` from the Gouache side | The Piste Cyclable's gate is open |
| `static:<species>` | a one-time battle (`echoShadow`) | A Bestiole met once was caught or beaten |
| `rematch:<trainerId>` | `rematch()` on a win | Post-game rematch won (Town Map objectives) |
| `re:<trainerId>` | `trainerBattle()` on a first win, `routeRematch()` | Local day of a route trainer's last battle: the next day they want a rematch (a ♪ bubble) |
| `trade:<id>` | `trade()` in `src/story/world.ts` | In-game trade done (`TRADES`, one per town) |
| `quest:<id>`, `quest:<id>.<step>` | side-quest scripts in `src/story/world.ts` | Favours for townspeople: `lulu` (`.asked`, `.found`), `feu`, `amitie`, `lettre` (`.sent`) |
| `followerFind` | `talkFollower` | Local day the following Bestiole last found an item |
| `visit:<map>` | `visitTown` (a town's `onEnter`) | Balloon destination unlocked |
| `champion` | `gc5` (Grand Concours) | Grand Concours won at least once |
| `gc:<1-4>` | Grand Concours scripts | Grand Maître beaten in the current attempt (cleared at the door) |

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
  - `mon: '<creature id>'` draws the NPC as that Bestiole's little overworld sprite (`public/minis/`),
    for Bestioles living on the map (Lulu).
- `signs`, `triggers` (an area that runs a script when stepped on), `interact` (A on a tile runs a
  script).
- `items`: pick-ups. `hidden: true` is invisible and found with A (used for the sketchbook pages).
  Pick-ups are solid: put them on dead ends or open ground so they never block a path.
- `berries`: `{ x, y, item }` bushes on a `B` (bush) tile next to a walkable one; A gives 1–3 berries
  once per local day (`src/overworld/berries.ts`).
- `encounters`: `{ rate, table: [{ id, w, min, max }] }`, where `w` is the weight. Add
  `anyTile: true` in caves.
  An entry with `time: 'night'` (or `'day'`) only shows up then (evening counts as day): the clock
  is the device's, shifted by sleeping at an Inn or at home (`save.clockShift`, `src/state/clock.ts`).
  Keep at least one entry for each time in every table. The Bestiodex habitats say « la nuit ».
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

- `obstacles: [{ x, y, kind: 'bush' | 'boulder' | 'rock' }]`: things in the way, cleared with key
  items (Scissors cut bushes, the Mallet breaks cracked rocks, the Strong Gloves push boulders).
  They stand on walkable ground and come back when the map is entered again. They are used to
  hide optional pockets with items (stencils 13–20), never the main road.
- `surf: { rate, table }` and `fishing: { old, good, super }` (tables like `encounters`): water
  encounters while sailing (Paper Boat) or fishing with each rod. Water tables hold Clapotin,
  Givrinou (surfing) and Dragounet (Super Rod): add new water drawings there.

A **new tile** needs:
- a `TileDef` in `src/overworld/tiles.ts` (`paint` with the `Painter`; flags `solid`, `encounter`,
  `over`, `ledge`, `animated`);
- a free character in `LEGEND`;
- the legend comment in `maps/index.ts` updated.

The map test rejects unknown characters.

**Music** follows the map automatically (`trackForMap` in `src/audio/mapMusic.ts`): every town has
its own theme (`TOWN_THEMES`), also played in its houses; the Ateliers play `atelier`; then routes,
caves and towers. Special maps are listed in `BY_MAP`. A new town needs a theme there. The rival's
scenes call `playMusic('rival')` and `mapMusic()` to come back.

**Jingles** (`playJingle` in `src/audio/music.ts`) play once and bring the music back: `badge`,
`item` (pick-ups), `caught`, `victory` (battle won, no resume), `evolved`, `heal`. Each takes a
sound effect as `fallback` for players with the music off. Battles pick theirs in
`fight()`: `wild`, `trainer`, `gommeBattle` (grey Team Gomme teams), `leader` (Atelier Masters,
rematches, the rival's last duel, the Grands Maîtres), `final` (the Great Eraser), `champion`
(Prof. Fusain at the Grand Concours); `opts.music` overrides it.

A tune in `src/audio/music.ts` is a `Track`: `bpm`, `bar` (8 eighths for 4/4, 6 for a waltz or 6/8),
an optional `swing`, up to three `voices` (melody first) and `drums`. Notes are `C#5:2` (length in
eighths, `.5` for a sixteenth, `.` for a rest), bars separated by `|`; the test checks that every bar
of every voice has the right length. Each voice picks a `wave` (`square`, `pulse25`, `pulse12`,
`triangle`, `sine`, `sawtooth`), a `vol`, a `gate` (short and bouncy below 0.6), `vibrato` (cents),
`detune` (cents: a wobbly second oscillator, used for Team Gomme) and `echo` (eighths). Drums are
`k` kick, `s` snare, `h` hat, `o` open hat, `r` rim, `t` tom, `c` crash. Helpers (`arp`, `oct`,
`drive`, `gallop`, `stab`, `rep`, `transpose`) write the repetitive parts. Give every tune its own
key, tempo and texture, and a name in the music box (`JukeboxScreen.tsx`).

### Puzzles

Puzzles are map data; `src/data/puzzles.test.ts` solves each one on the real maps with small
searches (and caps pushes, slides and presses), so a new puzzle needs a case there too.

- **Pushables**: `obstacles` of `kind: 'boulder'` (needs the Strong Gloves) or `'block'` (a Gomme
  eraser block anyone can push). Give an `id` to one that can fall down a hole. They go back to
  their place each time the map is entered: keep puzzle rooms next to a door or stairs.
- **Holes** (`O`) and `holes: [{ x, y, to?, fall? }]`: a pushable pushed in fills the hole for good
  (`hole:<map>:<x>,<y>`, and `fell:<id>`). With `to`, it lands on that floor below: add an obstacle
  there with `showIf: 'hole:<map>:<x>,<y>'`. With `fall: true` the player falls through too.
- **Plates** (`@`) and `puzzles: [{ flag, plates }]`: once boulders or blocks cover all the plates
  (on this map, or by landing from above), `flag` is set; a patch with `unless: flag` drawing `G`
  is the gate it opens.
- **Crayon barriers**: `Z` red standing, `j` blue lying (and `z`, `J` for the opposite); a switch
  `L` swaps them until the player leaves. Never put a barrier next to a switch.
- **Glossy paper** (`I`): the player slides until something is in the way (`slideFrom` in
  `src/overworld/puzzles.ts`). No wild Bestioles while sliding; keep people off it.
- **Fresques** (`F`) and `fresques: [{ x, y, id, species, size?, reward? }]`: a sliding picture
  puzzle of a drawing. Solving it sets `fresque:<id>`; patches with `unless` hide the secret room,
  and `items` with `showIf` fill it (or `reward` gives an item directly). The four fresques count
  towards a reward in `src/story/puzzles.ts`.
- **Signs** must sit on something solid (`S`, a wall, a rock): a test checks it.

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

- **Talents** (`src/data/talents.ts`, the game's abilities):
  - each talent has an original name, a description and one `TalentEffect`. `src/engine/pk/battle.ts`
    runs these effects (damage, absorbing, contact, status immunity, entering, end of turn,
    switching out, fleeing, sleep);
  - species list `talents` (one or two regular) and a `hiddenTalent`;
  - a Bestiole stores a slot (`talent`: 0, 1 or 2), so an evolution keeps its slot;
  - new Bestioles get the hidden one 1 time in 4 (`HIDDEN_TALENT_CHANCE`), and older saves get a
    fixed slot from their uid;
  - trainers always use slot 0, so put the friendlier talent first: early Ronflon and ghosts would
    otherwise halve Fire or dodge a lot;
  - battle messages come from the `talent` event.

  A new effect kind needs its hook in `battle.ts`, a test in `src/engine/pk/talents.test.ts` and,
  if it makes moves useless, a check in `ai.ts`.

  Every family has a **power**: a power talent as its only regular talent, or a signature move.
  [docs/bestioles.md](bestioles.md) lists them, with the stat bands, catch rates and base XP a new
  Bestiole should follow; `src/data/bestioles.test.ts` checks those rules.
- **Natures** (`src/data/natures.ts`): 25 kid-like personalities. Twenty raise one stat by 10% and
  lower another by 10%, and five change nothing. `calcStat` applies them in tenths, so rounding is
  exact. New Bestioles draw one at random. Trainers' Bestioles use the neutral `joyeuse`, so their
  battles stay the same. Bestioles from older saves get a fixed one from their uid.
  French names agree with « une nature » (feminine).

- **New drawing**: follow README "Add a new drawing". It covers the photo in `img-source/`, the
  manifest entry, `npm run cards -- <id>`, checking `tools/out/contact-sheet.png`, then adding the
  creature to `src/data/creatures.ts`. For a creature that evolves, list its ways to evolve in
  `evolutions: [{ to, level? | item? | friendship? }]` on the base form, and set `evolvesFrom` on each
  evolved form. Several rules make a branching evolution (Touffou's future forms):
  - `item` is a Crayon Magique used from the bag (`crayon-magique-<type>`). Water, Fire and Lightning
    are in the shops' `STOCK` (Touffou); put another one there, or as a pickup, when a drawing needs it;
  - `friendship: 220` evolves on levelling up with a great friendship;
  - `level` is the usual one.

  A learnset entry at level 0 is an evolution move, learned the moment the Bestiole evolves into
  that form (`evolutionMoves`), so a form reached by a pencil at any level gets a move of its type.
  `evolutionFor()` in `src/engine/pk/creature.ts` applies the rules. Set `faces` for sideways drawings, and
  `rarity`, which weights the Tombola. Put it in an `encounters` table or a trainer party.
  The order of `CREATURES` is the Bestiodex order (`dexNo`), and a test keeps evolution lines side by
  side. Ids are keys used by saves, maps and card files, so never renumber them.
- **Moves** (`src/data/moves.ts`): `type`, `cat` (`phys` / `spec` / `status`), `power`, `acc`
  (`null` never misses), `pp`, `priority`, `effects`, and the flags `punch` / `cut` that Poings d’Acier
  and Ciseaux Affûtés boost. Every damaging move also needs an animation in
  `src/ui/battle/fx/recipes.ts` (`recipes.test.ts` checks it): pick builders from `effects.ts`
  (projectile, beam, slash, bite, bolt, wave…), a crayon from `PAL` and a motion for the user. The effect kinds (status, confuse, flinch,
  stage, heal, multi…) are listed in `src/data/schema.ts` and run by `src/engine/pk/battle.ts`.
  Beyond the basics, there are:
  - `toxic` (badly poisoned) and freeze (`status: 'freeze'`);
  - `weather` (rain, sun, sand, hail for 5 turns);
  - `protect`;
  - `charge` (two-turn moves, `invuln: 'air' | 'ground'`, `sunSkips`);
  - `trap`, `seed` and `substitute`.

  Their per-creature state lives in `Volatile`, and the weather in `BattleState.weather`. Add the
  matching text in `src/ui/battle/messages.ts` if a new event appears, and a score in
  `src/engine/pk/ai.ts`.
- **Types**: there are 18. The chart in `src/data/types.ts` is the classic one (attacker → defender
  multipliers). Species may have a `type2`: use `typesOf(id)` and `effectiveness(moveType, types)`,
  which multiplies both, and the `TypeBadges` component. Each type has a held coloured pencil (a test
  checks it). Some types can't get a status: Fire can't be burned, Ice can't be frozen, Poison and
  Metal can't be poisoned, Electric can't be paralysed.
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

### Brouillons (drafts)

A Bestiole the little artist hasn't drawn yet can be drawn in code as a *brouillon*: a module in
`tools/drafts/` (`<slug>.ts`, listed in `DRAFTS` in `tools/drafts/make.ts`) that draws with the kid kit
(`tools/drafts/kid.ts`: potato shapes, pencil lines gone over twice, zig-zag colouring; `layered: true`
makes front parts hide back ones, which reads better for busy designs). `npm run drafts [-- <id>]` cuts it
out like a photo and writes its card and miniature. Its creature entry gets `draft: true`. When she draws
it: add her photo to `tools/cards-manifest.json` with the same id and slug, run `npm run cards -- <id>`,
remove it from `DRAFTS` and drop `draft: true`.

## UI

- **A particular Bestiole** is shown with `monLabel(m)` (its nickname, or the species name) and
  `monArtUrl(m)` (`src/ui/monArt.ts`: the sparkly recoloured drawing when `m.shiny`). Plain
  `tr(creature(id).name)` and `artUrl` are only for species: the Bestiodex, pickers, credits.
- **Nicknames** are offered with `offerNickname(uid)` from a script, after a capture, a gift or the
  starter. The `NicknameView` entry is drawn over the map through `nameOverlay`. New Bestioles get
  `met` through `addMon(s, m, how, place)` / `giveMon(species, level, how)`.
- Build screens from the paper kit (`src/ui/paper`): `Frame` (title strip and back button),
  `Window`, `TextBox`, `MenuList` with `useMenuNav`, `YesNo`, `QtyPicker`. That keeps the FRLG layout
  and the keyboard, touch and B-button behaviour consistent.
- **The hand-drawn look** (grainy graphite lines, never black ink) comes from `src/ui/paper/sketch.ts`, drawn once at start-up into CSS
  variables: pencil frames (`--pencil-frame`, `--frame-<crayon>`, `--frame-thin-<crayon>` for bars
  and tags), coloured-pencil hatching (`--hatch-<crayon>`, `--hatch-t-<type>`, `--hatch-ink`),
  sketched round buttons (`--blob-<crayon>`) and a wobbly line (`--rule`). The crayons are pastels:
  paper, pink, coral, peach, butter, mint, sky, lavender. To colour a box in, give it a `sk-<crayon>`
  class (or set `--sk-fill`, `--sk-hatch` and `--pencil-frame` together) and use
  `border: Npx solid transparent; border-image: var(--pencil-frame) 24 / Npx stretch` with
  `background: var(--sk-hatch) 0 0 / 72px 72px padding-box, var(--sk-fill) padding-box`. Keep
  `stretch`: tiled (`round`/`repeat`) SVG borders leave a thin gap in Chrome. No flat fills, radii or
  clean CSS borders on new UI.
- **Font and menu icons.** The interface font is Patrick Hand (handwriting; CSS `var(--pixel)`, a
  name kept from the pixel font it replaced). Menu entries get pencil doodles from
  `src/ui/sketchIcons.ts` (`MenuList` items with an `icon` that has a doodle there); items keep
  their pixel icons (`src/ui/icons.ts`).
- Pure views go in `src/ui/views`. A screen wrapper in `src/ui/screens` connects a view to the save.
  A new screen also needs a `Screen` variant in `src/state/router.ts` and a case in `src/app.tsx`.
- Battle scene: each side is a column (`.pk-side`), the HP box above the drawing: the foe top right,
  you bottom left. The foe's column ends low enough that its feet are always
  below the backdrop's horizon (46% of the picture). Boxes are two short rows (name and level; the
  bar, with your HP written inside it); experience is a thin blue line over your box, shown only
  while it fills. Trainer battles show the foe's team as little Crayon-balls under its box (black: knocked out,
  grey: status). Your Bestiole is drawn bigger and runs past the bottom edge (the scene clips it),
  so it feels closer than the foe.
- The battle panel never changes height. If something doesn't fit, it pages (`TextBox`) or opens an
  overlay inside `BattleScreen`.
- Questions work like the GBA games everywhere:
  - the question is typed first, then the choice window appears;
  - ↑↓ (or the joystick on touch) moves the cursor;
  - A (or a tap on the map) picks;
  - B answers with the last choice.

  In scripts use `ask()`. In the prologue use `Ask`.
- Lists where an entry has a description (bag, shop) use `MenuList` with `tapFocus`: on touch, the
  first tap only moves the cursor (the description shows), a second tap picks. Exits are buttons
  beside the list, not entries in it.
- Back buttons: `pbtn--b` shows a "B" hint and must really answer to X/B (`Frame` and menus do).
  Use `pbtn--back` (a plain ◀) where B means something else. Touch screens always get the ◀,
  because their only B button is on the map.
- Per-device options go in `src/state/prefs.ts` and get a row in `ROWS` in
  `src/ui/views/OptionsView.tsx`.
