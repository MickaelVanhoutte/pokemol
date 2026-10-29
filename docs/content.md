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
| `a1.*` … `a4.*` | story scripts | Act milestones (`a1.bois`, `a2.feutre`, `a3.usine`, `a4.marge`, `a4.rival`, `a4.machine`… see [story.md](story.md#region-path)) |
| `tr:<trainerId>` | `trainerBattle()` on a win | Trainer beaten (NPC trainers stop battling; also used as a story gate) |
| a trainer's `storyFlag` (`a1.bois`…) | `trainerBattle()` on a win, saved together with `tr:` and the badge | What the win unlocks; its `afterScript` only plays the scene |
| `badge:<badgeId>` | `trainerBattle()` for leaders | Badge owned (also pushed to `save.badges`) |
| `item:<map>:<x>,<y>` | pick-ups | Item on the ground already taken |
| `berry:<map>:<x>,<y>` | berry bushes | Local day number the bush was last picked (it regrows the next day) |
| `gift:calque` | Prof. Fusain's aide (Inn) | Tracing Paper given |
| `gift:crayonMagique` | Capucine (Ville-Pastel) | Magic Pencil given (4 badges, after Touffou) |
| `a3.note`, `a3.phare` | Nocturne's note on the Atelier door; Captain Buvard beaten | The lighthouse trip (the ferryman appears with `a3.note`, the Atelier opens with `a3.phare`) |
| `piste.open` | `pisteGate` from the Gouache side | The Piste Cyclable's gate is open |
| `static:<species>` | a one-time battle (`echoShadow`, `src/story/legends.ts`) | A Bestiole met once was caught (the legendaries, after the ending) or caught or beaten (Ombrouille) |
| `nuits` | `sleepUntil` | Nights slept at home or at the Inn |
| `ko:<slug>`, `koDay:<slug>` | `src/story/legends.ts` | A legendary knocked out: the night count and the real day it comes back |
| `away:<slug>` | the legendary's map `onEnter` | Its NPC is hidden (caught, not back yet, or Libellune by day) |
| `rematch:<trainerId>` | `rematch()` on a win | Post-game rematch won (Town Map objectives) |
| `re:<trainerId>` | `trainerBattle()` on a first win, `routeRematch()` | Local day of a route trainer's last battle: the next day they want a rematch (a ♪ bubble) |
| `trade:<id>` | `trade()` in `src/story/world.ts` | In-game trade done (`TRADES`, one per town) |
| `quest:<id>`, `quest:<id>.<step>` | side-quest scripts in `src/story/world.ts` | Favours for townspeople: `lulu` (`.asked`, `.found`), `feu`, `amitie`, `lettre` (`.sent`) |
| `followerFind` | `talkFollower` | Local day the following Bestiole last found an item |
| `visit:<map>` | `visitTown` (a town's `onEnter`) | Balloon destination unlocked |
| `champion` | `gc5` (Grand Concours) | Grand Concours won at least once |
| `gc:<1-4>` | Grand Concours scripts | Grand Maître beaten in the current attempt (cleared at the door) |
| `choix:<id>` (1 or 2), `choix:<id>:a` / `:b` | `choose()` in `src/story/choices.ts` | A story choice: 1 touches the drawing up (Libellune ending), 2 keeps it as it is (Noctaile ending). Maps use `:a` / `:b` to show its consequence, and some later scenes remember it ([story.md](story.md#the-two-endings)) |
| `gift:feutre-or` | `feutreRestore` (Zélie, Ville-Feutre warehouse), or `repair()` for saves past `a2.feutre` | Feutre d'Or given: fair copies in battle |
| `fair:<id>` | `fight()` | That Bestiole's fair copy was seen in a battle (Bestiodex button) |
| `gift:coconfus` | `coconfusJoins()` (Misty Woods, or the next town for older saves) | Coconfus joined the team |
| `prof:coconfus` | the Prof's wrapper in `src/story/coconfus.ts` | The Prof said he never photographed Coconfus |
| `prix:<track>:<id>` | `collect()` in `src/data/progress.ts` (trainer card, Progress page) | That Progress reward was collected |
| `prof:photo` (1, or 2 when sparkly) | the Prof's wrapper in `src/story/coconfus.ts`, after the ending | The Prof photographed what Coconfus became: the photo hangs in the lab (patch `profPhoto`, `labPhoto`) |
| `coconPale` | `usineEnd` (Eraser Factory) | The Great Eraser rubbed Coconfus: its card is washed out until the ending |
| `vision:<slug>` | `src/story/legends.ts` | The vision of a dream legendary was met (before the ending) |
| `fin` (1 or 2) | the ending | The form Coconfus took: 1 Libellune, 2 Noctaile; the other one waits in its lair |
| `reveil:bisou` | `mamanReelle` (the real living room) | Maman already said good morning |
| `reveil:dodo` | `litReel` (the real bedroom) | The player went back to bed after the ending: a game loaded in the bedroom goes back to the dream |

Read flags with `flag(name)` and write them with `setFlag(name, v?)` (`src/overworld/controller.ts`).
Maps react without code:
- NPC `showIf` / `hideIf`;
- trigger `if` / `unless`;
- `patches[].if` / `unless`;
- `tintUnless` (with `drained: true`, the map is drawn in greys until the flag is set: Ville-Feutre).
- `sketchUnless` on a building (only its pencil lines until the flag) and on a town (Hameau-Brouillon): the shared
  Inn and shop entered from it are drawn in pencil too, their people included, and its Inn's windows stay unlit.
  A sign there is the pencil sign `i`.

After a script that changed flags, the map is rebuilt (`refreshMap()`).

## Maps

One file per area in `src/data/maps/`, exported as a `Record<string, MapDef>` and spread into `MAPS`
in `maps/index.ts`. The fields are documented in `src/overworld/mapTypes.ts`.

- `rows`: one character per 16px tile; every row the same width. The legend is the comment at the
  top of `maps/index.ts` (`LEGEND` in `mapTypes.ts` is the source of truth). `border` is the tile
  drawn outside the map.
- `warps`: tiles that move the player to `{ map, x, y, facing }`. Add the matching warp on the other
  map. Shared interiors use `to: 'back'`.
- Routes between Ateliers train the team on the way. Bands of tall grass cross the whole route, so
  about 20–25 grass steps can't be avoided: about 3 wild battles per crossing (the owner's choice).
  Each route also has 4–6 trainers whose sight crosses the path. `npm run curve` shows the forced
  battles per route. Keep items, berries and hidden pages at the same coordinates when redrawing a
  route: the save keys them by `x,y`. A wild Bestiole is never stronger than the trainers of its map:
  the highest wild level stays at or under the ace of the weakest trainer there (the owner's rule,
  checked by the "wild levels" test in `src/data/maps.test.ts`).
- `buildings`: drawn over the rows. They take `kind`, a position and size, a `door` column, and a
  `to` target. A `script` instead of `to` gates the door. `kind` is one of `'house' | 'lab' | 'center'
  | 'shop' | 'cave' | 'tower' | 'gym'…`; `roof` sets the colour.
- `npcs`:
  - `look` comes from `LOOKS` in `src/overworld/sprites.ts` or is inline `{ hair, shirt, pants }`
    (a trainer's look is also drawn in coloured pencil for the battle intro, through `fromLook`);
  - `text: LText[]` for simple talkers, `script` for story NPCs;
  - `trainer` plus `sight` (tiles) for trainers who spot the player;
  - `wander`, `showIf` / `hideIf`, and `fromMap` in shared interiors: the Inn's helpers each stand in
    one town's Inn only (only the innkeeper and the pilot are everywhere), and a helper's `service`
    (« Natures ») is listed for that town on the Town Map. `src/data/inns.test.ts` checks it.
  - `mon: '<creature id>'` draws the NPC as that Bestiole's little overworld sprite (`public/minis/`),
    for Bestioles living on the map (Lulu).
- `signs`, `triggers` (an area that runs a script when stepped on), `interact` (A on a tile runs a
  script).
- `items`: pick-ups. `hidden: true` is invisible and found with A (used for the sketchbook pages).
  Pick-ups are solid: put them on dead ends or open ground so they never block a path.
- `berries`: `{ x, y, item }` bushes on a `B` (bush) tile next to a walkable one; A gives 1–3 berries
  once per local day (`src/overworld/berries.ts`).
- `encounters`: `{ rate, table: [{ id, w, min, max }] }`, where `w` is the weight. Add
  `anyTile: true` in caves. `rate` is FireRed's encounter rate: 21 on a route, 14 in a wood, 7 in a cave
  (10 for Mont Fusain and the Tour Brumeuse), 2 on water. `src/overworld/encounterRate.ts` rolls it the GBA's
  way: rate/100 a step, a few calm steps after every battle (6 on a route, 8 in a cave), odds that grow with
  each step without a Bestiole, a first step from the path into the grass that wakes nothing 4 times in 10,
  ×0.8 on the bike. That makes about one wild battle every 10 steps on a route, 21 in a cave, 50 on water.
  An entry with `time: 'night'` (or `'day'`) only shows up then (evening counts as day): the clock
  is the device's, shifted by sleeping at an Inn or at home (`save.clockShift`, `src/state/clock.ts`).
  Keep at least one entry for each time in every table. The Bestiodex habitats say « la nuit ».
- `backdrop`: the battle background (`grass | forest | cave | tower | lab | beach | city | volcano |
  sketch`).
- `indoor`, `tint`, `fog`, `onEnter` (towns use `'visitTown'`), `awake` (the real world: no follower).
- `generic: true` marks a shared interior. Town houses share three rooms (`maisonVille`, `maisonPetite`,
  `maisonAtelier` in `maps/interiors.ts`): the town lists who lives in each house in its `residents`, with
  `fromDoor: [[town, x, y]]` (the tile in front of the door); they are put in the room that door leads to, and a
  test checks every door. A save made on a tile where a house now stands steps to the nearest free tile on load
  (`Game.unstick`).
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

A tune in `src/audio/tunes.ts` is a `Track`: `bpm`, `bar` (8 eighths for 4/4, 6 for a waltz or 6/8),
an optional `swing`, up to three `voices` (melody first) and `drums`. Notes are `C#5:2` (length in
eighths, `.5` for a sixteenth, `.` for a rest), bars separated by `|`; the test checks that every bar
of every voice has the right length. The voice order picks the instrument: the melody on a music
box, the bass on a felt piano, the harmony or arpeggio on chimes (struck notes ring and fade, low ones
longer, each a few cents off as if played by hand). A voice can add `detune` (cents: an out-of-tune
double, the uneasy music box of Team Gomme) and `echo` (eighths). Drums are soft: `k` kick, `s` brush,
`h` shaker, `o` long shaker, `r` wood block, `t` tom, `c` a little bell. Helpers (`arp`, `oct`,
`drive`, `gallop`, `stab`, `rep`, `transpose`) write the repetitive parts. Give every tune its own
key, tempo and texture, and a name in the music box (`JukeboxScreen.tsx`). Then record it:
`npm run music -- <id>` writes `src/audio/recordings/<id>.m4a` (the game plays only recordings; a test
checks that every tune has one). It needs Google Chrome and macOS's `afconvert`; the WAVs stay in
`tools/out/music` to listen to.

### Routes

The owner found the first routes "too simple and linear" (one straight path through full-width bands of tall
grass), so every route between towns was redrawn the same way (Route 4, `route4` in `maps/feutre.ts`, is the model):
- belts of trees split it into areas, crossed by a short passage of tall grass; the path winds through them;
- things off the main way: a side meadow, a hidden nook, a pond or river with an islet or far bank for the paper
  boat, a ledge (`_`, crossed only going down) to jump back as a shortcut, an `obstacles` bush, rock or boulder
  opening a shortcut once the tool is in the bag;
- tall grass you must cross, and patches you can walk round; each route with its own character (water, ledges,
  hedges, clearings…).

What has to stay: the map's size, warps and buildings (neighbours point into it), its trainers, NPCs, signs and
triggers (a story trigger must still be crossed by every way through), and **items at their exact coordinates**
(a picked item is remembered by position: moving it gives it twice). Its forced tall-grass steps between its two
towns stay close to before: the level curve counts them (`forcedSteps` in `src/data/curve.ts`, where obstacles count
as solid), and `src/data/curve.test.ts` checks that a player who never grinds keeps up.

### The museum

Ville-Pastel's **Musée des premiers croquis** (`musee` in `src/data/maps/pastel.ts`) hangs her original
drawings (`src/data/originals.ts`) in frames: the `q` tile (`cadre`, on a wall or on a stand). Each frame is
an `interact` spot whose script `musee:<id>` (`src/story/world.ts`) calls `showPicture(url, caption)`
(`src/overworld/controller.ts`, the `PictureView` overlay; a third argument lists pictures that fade one into
the next before it, as at the Great Eraser's reveal). A new original needs a frame there:
`src/data/originals.test.ts` checks it.

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
  puzzle of a drawing, where any piece can be put into the gap (`src/ui/logic/fresque.ts`). Solving it sets `fresque:<id>`; patches with `unless` hide the secret room,
  and `items` with `showIf` fill it (or `reward` gives an item directly). The four fresques count
  towards a reward in `src/story/puzzles.ts`.
- **Signs** must sit on something solid (`S`, a wall, a rock): a test checks it.

## Story scripts

Add `scripts.myId = async () => { … }` in the act file (`src/story/act1.ts`…`act3.ts`, or `common.ts`
for shared ones), then reference `myId` from a map. Tools (import from `../overworld/controller`):

- Dialogue: `say(text, speaker?, vars?)`, `sayAll(lines, speaker?)`, `ask(text, choices, speaker?)`
  (resolves to the choice index), `showToast(msg)`. A choice that counts towards the ending goes
  through `choose(id, question, a, b)` (`src/story/choices.ts`, ids in `CHOICES`).
- Flags: `flag`, `setFlag`.
- Save: `update((d) => …)` from `src/state/game.ts`, `giveMon(species, level)`, `giveItem(id, n)`.
- Movement and screens: `warpTo(dest, { keepFade? })`, `openScreen(screen)` (resolves when the player
  is back in the world), `wait(ms)`.
- Effects: `flash(color?, ms?)`, `shake(ms?)`, `bubble(actorId, '!' | '?' | '…' | '♪' | '♥' | 'zz')`.
- Battles: `trainerBattle(id, actor?)` for normal trainers (before lines, battle, flag, badge,
  `afterScript`), or `fight(kind, name, party, opts)` for scripted ones (`friendly`, `tutorial`,
  `backdrop`, `look`, `grey`). Both return or set the result, and a loss blacks out unless `friendly`.
- Cut-scenes, through `const g = getGame()`:
  - `g.npc(id)`, `g.spawn(id, look, x, y, dir, mon?)` (`mon` draws a Bestiole's miniature), `g.remove(id)`;
  - `await g.walk(actor, ['up', 'up', 'left'])`;
  - `g.face(actor, dir)`, `g.faceToward(a, b)`;
  - `await g.fadeTo(1, ms, 'white' | 'black')`, `await g.wipeTo(…)`;
  - `g.player` is the player actor.

Scripts run one at a time and lock player input. To change an existing script after a story point
(post-game lines…), wrap it in a later act instead of editing it in place:
`const prev = scripts.x; scripts.x = async () => { if (!flag('ending')) return prev(); … }`.

## Trainers

`src/data/trainers.ts`, one `T({...})` per trainer, then an NPC with `trainer: '<id>'` and `sight`. An Atelier's
own trainers (besides its Master) are in `src/data/teams/<town>.ts`, merged into `TRAINERS`; its puzzle has its
test in `src/data/ateliers/<town>.test.ts`, with the searches of `src/data/puzzleSearch.ts`.

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

- **New Bestiole**: follow README "Add a new Bestiole". It covers her drawing as the original (photo in
  `img-source/`, manifest entry, `npm run cards -- <id>`, `ORIGINALS`), drawing it in her style with
  `npm run redraws -- <id>`, then adding the creature to `src/data/creatures.ts`. For a creature that evolves, list its ways to evolve in
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
  and Ciseaux Affûtés boost. Every move also needs an animation in
  `src/ui/battle/fx/recipes.ts` (`recipes.test.ts` checks it): pick builders from `effects.ts`
  (projectile, beam, slash, bite, bolt, wave…) or `statusFx.ts` (powder, aura, shield, weatherIn…), a
  crayon from `PAL` and a motion for the user. Builders bring their own sounds (`sounds` on each layer,
  played by `fxSound` in `src/audio/sfx.ts`); the test also checks that every move makes one. A status move's own animation should not repeat what its
  event shows next (the stat chevrons, the Zzz of sleep): `src/ui/battle/fx/events.ts` plays those. The effect kinds (status, confuse, flinch,
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
- **Items** (`src/data/items.ts`): `kind: 'heal' | 'status' | 'revive' | 'ball' | 'key' | 'berry' | 'hold' | 'battle' | 'stencil' | 'field' | 'evo' | 'effort' | 'level'`.
  - `effort`: biscuits (+10) and erasers (−10) of one `stat`'s effort points (`addEvs`), from the bag;
    sold from 3 badges.
  - `level`: the Magic Lollipop, one level (`growLevel`) played in the world (`useLollipop`: moves,
    evolution, « Encore une ? »). Before the ending it is only found on the map, after the 3rd badge
    (`src/data/inns.test.ts`); shops sell it once the story is over (`'ending'` in `STOCK`).
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
    `stencil` on a badge in `src/data/badges.ts` for a leader's reward, or a Progress reward). Stencils
    21–24 are Progress rewards that every species learning an earlier stencil learns too (`STENCIL_HEIRS`
    in `creatures.ts`). A test checks every
    stencil teaches a real move and fits at least one species.
  - Any non-key item except stencils can be held (party ITEM menu or bag GIVE). Trainer parties can give an `item`,
    and species a `wildItem` (`{ id, pct }`) that wild ones sometimes carry.
  - The shop sells the list in `STOCK` (`ShopScreen.tsx`), each item after a number of badges. No shop
    sells held items: they are found, given by quests, won as Progress rewards or exchanged at the tower
    (`TOWER_STOCK`); `src/data/progress.test.ts` checks the old shop ones are all Progress rewards.
  - **Progress rewards** (`TRACKS` in `src/data/progress.ts`, the trainer card's PROGRÈS page): tracks
    of milestones, each with a `count(save)` and `steps` of `{ id, goal, reward }`; the page shows each
    track's first milestone not collected, and « Récupérer » once it is reached (`collect`, flag
    `prix:<track>:<id>`). Post-game tracks (`post: true`) show after the ending. Keep a step's `id` when
    changing its goal or reward (saves remember it); a new step on a track an old save finished simply
    waits to be collected. Back in the world, a toast says when a reward waits (`tellRewards` in
    `controller.ts`), and the start menu entry shows a « ! ».
  - Item icons are pixel art in `src/ui/icons.ts` (`ROWS`, or a painter in `PAINTED`).

### Moving parts in battle

In battle every Bestiole breathes (or hovers, when it flies; `idleOf` in `src/data/rigs.ts`), and its own
parts can move: wrap the code that draws a part in `c.part(name, def, () => { … })` (`k.part` in a layered
brouillon). `npm run redraws` (or `drafts`) cuts the body and each part out on their own into
`public/rigs/<id>-<slug>/` and records them in `src/data/rigs.json`; `tools/out/rigs-sheet.png` shows them put
back together, each part framed with its pivot as a red dot. The card doesn't change.

- `pivot`: the drawing point it turns around (a wing's root, the base of a trunk).
- `motion`: `flap` (beats, `amp` degrees; a negative `amp` for a wing on the other side), `fold` (folds
  towards the pivot, butterfly wings, `amp` %), `swing` (trunk, tail), `nod`, `peek` (goes to `to`, in % of
  its own size, with `shrink` and `fade`), `throw` (flies to `to` in an arc, then is back: Érabreuil's acorn;
  the arm throwing it gets a `nod` with the same `period` and `phase`), `flicker` (sparks), `blink` (closed eyelids). `period` in seconds,
  `phase` (0–1) so parts move together.
- `behind`: under the body (a far wing, a part drawn first). `inside`: in front at rest, behind the rest
  once small (Clapotin's body into its shell). `clip`: cut off at the drawing's edge (Taupinou going down
  its hole).
- `extra`: only in battle, not on the card (Zigzou's lightning): draw it last, so the card's random strokes
  stay the same. A part drawn in two goes (some before something else, some after) is called twice with the
  same name.
- `src/data/rigs.test.ts` checks each rig's pictures, boxes, pivots and motions.

### Fair copies (« mise au propre »)

Each fully grown Bestiole has a fair copy for battle ([story.md](story.md), "Mise au propre"): its data in
`FAIR_COPY` (`src/data/fairCopies.ts`: the base stats and its new `talent`; `type2` for the few that take a new
type, with `type` when the kept one isn't its first) and its drawing in `tools/fair/<slug>.ts`, a module like a redraw's
(`{ id, slug, seed, size, tilt, draw(c) } satisfies Fair`) drawn with the `crayon` kit in felt-tip
(`crayon(seed, { felt: true })`: her coloured pencil under a felt-tip outline, `c.shine()` for white glints,
`c.star()` for the gold star every fair copy carries; `FAIR_STYLE=marker` tries flat felt-tip colouring instead). It
starts from the pencil module's own shapes, faces the same way, and grows what defines it, bigger and fiercer
(docs/bestioles.md, "Its fair copy"). It needs at least one moving part (`c.part`, as above). `make.ts` picks up
every module of the folder.

- `npm run fair [-- <slug>…]` writes its rig to `public/fair/<id>-<slug>/` and `src/data/fairRigs.json`, and
  `tools/out/fair-sheet.png` (the pencil card, the fair copy, battle size).
- `npm run fair -- --try <slug>…` only draws, into `tools/out/fair-try/` (several people can draw at once).
- `npm run fair:preview` writes `tools/out/fair-preview.html`: each fair copy moving beside its pencil drawing, its
  types, stats, talent and the moves of its new type, and the plan for those not drawn yet (`tools/out/fair-looks.json`). Show it to the owner.
- `src/data/fairCopies.test.ts` checks one per fully grown Bestiole, +20 % but HP, a new talent (or a new type with a
  move of it learned by level 45), and the rig's pictures.

### Brouillons (drafts)

The *brouillons* are Bestioles drawn in code more roughly than the redraws: a module in
`tools/drafts/` (`<slug>.ts`, listed in `DRAFTS` in `tools/drafts/make.ts`) that draws with the kid kit
(`tools/drafts/kid.ts`: potato shapes, pencil lines gone over twice, zig-zag colouring; `layered: true`
makes front parts hide back ones, which reads better for busy designs). `npm run drafts [-- <id>]` cuts it
out like a photo and writes its card and miniature. Its creature entry gets `draft: true` (the Bestiodex
shows no stamp: the owner asked to drop it). New Bestioles use the `crayon` kit of `tools/redraws` instead; to redo a
brouillon in her style, move it there and drop `draft: true`.

### The player's own Bestiole (Atelier des Brouillons)

In Hameau-Brouillon, la Dessinatrice (`atelierPerso`, `src/story/act4.ts`) opens the workshop (screen `atelier`,
`src/ui/views/AtelierView.tsx`): a drawing sheet, then types, stats, talent, moves and a name. The design is kept in
`save.atelier` (`CustomDesign`, `src/data/custom.ts`) and becomes a species at load time: `registerCustom` puts
`CUSTOM_ID` (`'000'`) into `CREATURE_BY_ID` (an effect on the `save` signal in `src/state/game.ts`), never into
`CREATURES`, so dex numbers, the Tombola, tests and static pools don't see it.
- Limits (`designProblems`): 1–2 types, a stat total of `STAT_TOTAL` (480), each stat 30–130 in steps of 5, a
  talent of `CUSTOM_TALENTS`, 1–4 moves of `customMovePool` (its types and Normal, under 100 power, no family's
  own move) with an attacking one of its own type.
- Pictures: `artUrl` and `miniFor` read the saved drawing (webp, at most 384 px) and miniature (`src/art/drawn.ts`
  `miniOfDrawing`, made in the browser); caches key on `customRevision()`. As a fair copy, `fairCopyOf` grows its
  stats (`grownBase`) and `monArtUrl` goes over it in felt-tip (`makeFair`).
- The fill pencil (`fillArea` in `src/art/drawn.ts`) closes small gaps in a line and refuses an open outline.
- Counts that complete the Bestiodex use `dexCount`, which leaves it out. The Bestiodex lists it first as N°000.
- Retouching keeps the Bestiole (level, IVs, nature): new moves, full health. Starting over keeps it too.
- `npm run balance` with `CUSTOM=glass|mage|wall` puts a sample design in the team from Act 4 on (`MATE=<id>`: an
  ordinary Bestiole there instead, to compare).

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
