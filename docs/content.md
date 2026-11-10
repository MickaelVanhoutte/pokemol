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
| `rival:pastel`, `tr:rivalCourse` | `pastelRival`, `rivalCourse` (`src/story/course.ts`) | The rival's race to the eight badges: told in Ville-Pastel, halfway on Route 6 (`repair()` sets them for games already past) |
| `gift:<tool>` (ciseaux, canne-bois, bateau, bocal, velo, maillet, gants) | `guideTalk` (`src/story/guides.ts`) | A Colour Guide gave its tool |
| `guides` | `guideTalk` | The first Colour Guide told about the seven of them |
| `gift:calque` | Prof. Fusain's aide (Inn) | Tracing Paper given |
| `gift:crayonMagique` | Capucine (Ville-Pastel) | Magic Pencil given (4 badges, after Pandoudou) |
| `gift:crayonMagique5`, `gift:crayonMagique6`, `gift:crayonMagiqueGlace` | Capucine | one more Magic Pencil for each later set of Pandoudou drawings (Grass/Fairy at 5 badges, Psychic/Dark at 6, Ice after the ending) |
| `a3.note`, `a3.phare` | Nocturne's note on the Atelier door; Captain Buvard beaten | The lighthouse trip (the ferryman appears with `a3.note`, the Atelier opens with `a3.phare`) |
| `piste.open` | `pisteGate` from the Gouache side | The Piste Cyclable's gate is open |
| `static:<species>` | a one-time battle (`echoShadow`, `src/story/legends.ts`) | A Bestiole met once was caught (the legendaries, after the ending) or caught or beaten (Ombrouille) |
| `nuits` | `sleepUntil` | Nights slept at home or at the Inn |
| `ko:<slug>`, `koDay:<slug>` | `src/story/legends.ts` | A legendary knocked out: the night count and the real day it comes back |
| `away:<slug>` | the legendary's map `onEnter` | Its NPC is hidden (caught, not back yet, or Libellune by day) |
| `rematch:<trainerId>` | `rematch()` on a win | Post-game rematch won (Town Map objectives) |
| `ep:1`, `ep:t1`…`ep:t3` (1 redrawn, 2 kept), `ep:tN:a` / `:b`, `ep:done`, `ep:wins`, `re:effaceur` | `src/story/epilogue.ts` | « La page d’après »: the doubt asked for help, each stain's answer, the page finished, the doubt's rematches won and the week of the last one |
| `re:<trainerId>` | `trainerBattle()` on a first win, `routeRematch()` | Local day of a route trainer's last battle: the next day they want a rematch (a ♪ bubble) |
| `trade:<id>` | `trade()` in `src/story/world.ts` | In-game trade done (`TRADES`, one per town) |
| `quest:<id>`, `quest:<id>.<step>` | side-quest scripts in `src/story/world.ts` | Favours for townspeople: `lulu` (`.asked`, `.found`), `feu`, `amitie`, `lettre` (`.sent`) |
| `followerHas` | `followerPicks`, `talkFollower` | What the following Bestiole holds (index + 1 in `FOLLOWER_FINDS`) |
| `followerHug` | `talkFollower` | Local day of the first chat with it (+3 friendship) |
| `visit:<map>` | `visitTown` (a town's `onEnter`) | Balloon destination unlocked |
| `champion` | `gc5` (Grand Concours) | Grand Concours won at least once |
| `gc:<1-4>` | Grand Concours scripts | Grand Maître beaten in the current attempt (cleared at the door) |
| `choix:<id>` (1 or 2), `choix:<id>:a` / `:b` | `choose()` in `src/story/choices.ts` | A story choice: 1 touches the drawing up (Libellune ending), 2 keeps it as it is (Noctaile ending). Maps use `:a` / `:b` to show its consequence, and some later scenes remember it ([story.md](story.md#the-two-endings)) |
| `gift:feutre-or` | `feutreRestore` (Zélie, Ville-Feutre warehouse), or `repair()` for saves past `a2.feutre` | Feutre d'Or given: fair copies in battle |
| `fair:<id>` | `fight()` | That Bestiole's fair copy was seen in a battle (Bestiodex button) |
| `gift:coconfus` | `coconfusJoins()` (Misty Woods, or the next town for older saves) | Coconfus joined the team |
| `prof:coconfus` | the Prof's wrapper in `src/story/coconfus.ts` | The Prof said he never photographed Coconfus |
| `don:<npc>` | `onInteract` in `controller.ts` | That townsperson (`gift` on the NPC) gave its present |
| `cadeau:<npc or trainer>` | `afterStoryTalk` / `repentTalk` in `controller.ts` | That resident (`afterStory.gift`) or old Team Gomme grunt (`REPENT_GIFTS`) gave its present |
| `couleurs:bord` | `rematch()` after the 4th Atelier Master rematch, or `repair()` | The Edge of the Page is coloured in again (patch `bordColour`) |
| `ilePage` | the Prof's post-game wrapper (`act3.ts`), once the Bestiodex is complete (`DEX_GOAL`) | The Prof told about the hidden island: the ferryman goes there |
| `ile:visite`, `away:baleincre`, `static:baleincre`, `ko:baleincre` / `koDay:baleincre` | `ilePageEnter` / `baleincre` in `src/story/legends.ts` | The First Page Isle was visited; the Great Inkwell is away, caught, or knocked out until a night or a day has passed |
| `reel:dessin`, `reel:fenetre`, `reel:livre`, `reel:parents` (0–5); `reel:jour` (a real day), `reel:visite`, `reel:fait` | `src/story/realLife.ts` | Levels grown in the real house after the ending; the real day of the last wake-up there; the player is in the house today; the day's one thing is done |
| `prix:<track>:<id>` | `collect()` in `src/data/progress.ts` (trainer card, Progress page) | That Progress reward was collected |
| `prof:photo` (1, or 2 when sparkly) | the Prof's wrapper in `src/story/coconfus.ts`, after the ending | The Prof photographed what Coconfus became: the photo hangs in the lab (patch `profPhoto`, `labPhoto`) |
| `coconPale` | `usineEnd` (Eraser Factory) | The Great Eraser rubbed Coconfus: its card is washed out until the ending |
| `vision:<slug>` | `src/story/legends.ts` | The vision of a dream legendary was met (before the ending) |
| `fin` (1 or 2) | the ending | The form Coconfus took: 1 Libellune, 2 Noctaile; the other one waits in its lair |
| `reveil:bisou` | `mamanReelle` (the real living room) | Maman already said good morning |
| `reveil:dodo` | `litReel` (the real bedroom) | The player went back to bed after the ending: a game loaded in the bedroom goes back to the dream |
| `lac.appel`, `lac.arrivee`, `lac.brief` | `src/story/lac.ts` | The lake expedition: the rival met at the Route 4 mud, arrived at the Lac des Couleurs, the Prof's briefing at the camp |
| `lac.source:rouge` / `:jaune` / `:bleue`, `lac.sources` | `source`, `colourBack` (`src/story/lac.ts`) | A spring freed; all three (the colours come back, the Route 4 mud is gone: patch `boue`) |
| `tr:rivalLac`, `gift:bocal`, `plongee` | `rivalBattle`, `profLac` (Myrtille comes), `diveDown` | The rival beaten at the lake; the Bocal-Scaphandre given (diving); the first dive (the tip is shown once) |
| `perle:<colour>` (7, `PEARLS` in `src/data/items.ts`), `legende` | `pearl()`, `autel` (`src/story/lac.ts`) | A memory pearl found (its key item `perle-<colour>` goes back to the altar); the seven placed on the altar of the Abysses: Aquarelline is awake |
| `abysses`, `vallon` | `abyssesEnter`, `vallonEnter` | First visit to the Abysses, to the hidden valley |
| `static:aquarelline`, `ko:aquarelline` / `koDay:aquarelline`, `away:aquarelline` | `aquarelline`, `abyssesEnter` | Like the legendaries above: caught, knocked out until a night or a day has passed, or not woken yet |

Read flags with `flag(name)` and write them with `setFlag(name, v?)` (`src/overworld/controller.ts`).
Maps react without code:
- NPC `showIf` / `hideIf`;
- trigger `if` / `unless`;
- `patches[].if` / `unless`;
- `tintUnless` (with `drained: true`, the map is drawn in greys until the flag is set: Ville-Feutre). With
  `primaries` (flag and red, yellow or blue), the greys take on the colour of each flag set, mixed like paints
  (`src/data/primaries.ts`: the Lac des Couleurs and its springs).
- `sketchUnless` on a building (only its pencil lines until the flag) and on a town (Hameau-Brouillon): the shared
  Inn and shop entered from it are drawn in pencil too, their people included, and its Inn's windows stay unlit.
  A sign there is the pencil sign `i`. The same goes for a drained town: its Inn, shop and houses are as grey as its
  streets. A place of its own inside it (a cave, a warehouse) sets its own `drained` and `tintUnless` (or `primaries`).

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
    one town's Inn only (only the innkeeper is everywhere; the balloon pilot stands outside), and a helper's `service`
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
  An entry with `if: '<flag>'` only shows up once that flag is set: the Bestioles met after the story
  (`afterStory: true` on the species, which also keeps them out of the Tombola until the ending).
- `backdrop`: the battle background (`grass | forest | cave | tower | lab | beach | city | volcano |
  sketch`).
- `indoor`, `tint`, `fog`, `onEnter` (towns use `'visitTown'`), `awake` (the real world: no follower).
- `ambient`: what drifts in the air (`src/overworld/ambient.ts`): `'petals'` (gardens), `'leaves'` (woods), `'motes'`
  (caves, the museum), `'ink'` (the Ink City side), `'crumbs'` (Team Gomme's places), `'glitter'` (Glitter), `'fireflies'`.
  Outdoors without one, fireflies come out at night. Keep specks as little shapes with a darker edge: single pixels
  vanish in the paper grain.
- Building doors open dark when the player steps in, and coming out the player appears in the doorway and steps out
  (`src/overworld/doors.ts`): a warp target just below a door, facing down, does it by itself.
- `generic: true` marks a shared interior. Town houses share three rooms (`maisonVille`, `maisonPetite`,
  `maisonAtelier` in `maps/interiors.ts`): the town lists who lives in each house in its `residents`, with
  `fromDoor: [[town, x, y]]` (the tile in front of the door); they are put in the room that door leads to, and a
  test checks every door. A save made on a tile where a house now stands steps to the nearest free tile on load
  (`Game.unstick`).
- `patches`: `{ id, x, y, rows, if?, unless? }` redraws a block while the flag condition holds. In
  patch rows, `?` keeps the tile underneath.
- `recolour: { if, border?, backdrop? }`: once the flag is set, the border around the map and the battle
  backdrop change too (a sketched map coloured in by its patches, `src/data/afterStory.ts`).
- On an NPC, `afterStory: { text, gift? }`: once the story is over, a `text` NPC says these lines instead,
  and gives `gift` (`{ item, n?, text }`) the first time (`cadeau:<npc id>`).
- On an NPC, `gift: { item, n?, text, if? }`: the first time they are talked to, after their lines, they give it
  (`don:<npc id>`, announced with `gotItem`). Players talk to townsfolk hoping for help, so a town has one giver
  (`src/data/balloons.test.ts` checks it): a few berries, balls or a cure, ideally with a tip for the next Atelier.
  Keep a town's other folk few, each with a line that says something (lore, a tip, a quest), not only scenery.
- **Papeterre's calendar** (roadmap milestone 11, `src/data/events.ts`, scripts in `src/story/calendar.ts`), from the
  real day (`localDay()`): a daily swarm (`SWARMS`, `swarmOf`: from the second badge, on a route already visited, one
  uncommon Bestiole that lives there comes out about one time in two, at the route's levels, `swarmRow`); a weekly
  market on the week's sixth day (`marketTown`: the towns with a shop in turn; a stall, NPC `marchande` with
  `onlyOn: 'market'` in the shared shop, sells `marketItem`, one a week, flag `marche:semaine`); the Bal des Étoiles
  in Bourg-Paillette, 21–23 December (`isBal`, NPC `balDanseuse` `onlyOn: 'bal'`: a dance and a sparkly Hypnopaon
  once a year, flag `bal:<year>`). The innkeeper's « Quoi de neuf ? » (from the second badge) and the Town Map's
  « Aujourd'hui : » tell the news (`todayNews`). The real house keeps a quiet day a week once every activity is grown
  (`reel:semaine`), and the Tombola's first ticket of the day is half price (`tombola:jour`).
- **Challenge rules and New Game+** (roadmap milestone 10; optional save fields `rules` and `plus`, no new save version): the prologue's last page offers optional rules
  (`src/state/rules.ts`, `save.rules`): one colour only (`monotype`: catches of that type only, `catchForbidden`),
  one catch per place (`onePerMap`, flag `catch:<map>`, legends excepted), a sealed bag (`battleBag`: Croque-Carnets
  only in battle), a level cap (`levelCapOf`: the next Master's ace, then the Great Eraser's, none after the story;
  battle XP stops there, `BattleSetup.levelCap`, and Lollipops refuse), and paid Inns (`innPrice`, the first visit
  free). A blocked catch says « Ta règle de défi : pas de capture ici ! » (`blocked` with `rule`). Gifts and trades
  are not checked (on your honour). A finished slot can start again as a New Game+ (`newGame({ plusFrom })`): the
  Bestiodex's seen pages, sparkly odds ×3 and an egg of the old lead Bestiole in the PC (`plusEgg`: its IVs, nature,
  sparkle and nickname); not its catches, Hall of Fame or drawn Bestiole (they would skip story gates). The trainer
  card shows `PARTIE +` and the rules.
- **Weather** (roadmap milestone 9, `src/state/weather.ts`): every outdoor map (`hasSky`: not indoors, under water,
  in a dungeon, in the real house or on a sketched page; `sky: false` opts one out) has one sky a real day, from the
  day and the map's id (`skyOver`): clear 55%, rain 15%, wind 15%, fog 10%, snow 5% where it can snow (`SNOWY`,
  rain elsewhere); Act 1's places are always clear. `Game.sky` is drawn after the place's own air (graphite rain
  strokes and a greyer light, paper flakes, gusts, fog banks; only the light under MOUVEMENTS : DOUX). Rain and snow
  start the battles fought there with rain or hail for the whole fight (`BattleSetup.weather`). An encounter row can
  ask for a sky (`sky: 'rain'`), on top of the usual ones; the Town Map shows a visited place's weather.
- On an NPC, `when: ['day' | 'evening' | 'night', …]`: only there at those times of the day (day 7–19 h, evening
  19–21 h, night 21–7 h, the device's clock shifted by naps). Each town has one person of the night (a stargazer,
  the lamplighter, the baker before dawn…) and its children go home at night. `night: [lines]` replaces `text` after
  dark. Neither goes on a trainer, a script, a giver or an Inn helper (`maps.test.ts`), so nothing the story needs
  ever hides. When the time of day turns while you stand there, `updateTime` rebuilds the map (`refreshMap`, at most
  every 30 s) and they come and go.
- The Pencil Balloon (`src/data/balloons.ts`) stands at least 2 tiles from the town's exits (and the 5 tiles leading
  in) and from every door, with nobody standing within 2 tiles (a wanderer within 4): test-enforced. Move the
  town's `fly` tile in `WORLD` with it.

A **new outdoor map** also needs a place on the Town Map: an entry in `WORLD`
(`src/data/worldmap.ts`, a rect on the 24×20 grid). `worldmap.test.ts` checks every outdoor map has one,
that border warps point the right way on the grid, and that every map (interiors included, through
their doors) resolves to a place.

- `obstacles: [{ x, y, kind: 'bush' | 'boulder' | 'rock' }]`: things in the way, cleared with key
  items (Scissors cut bushes, the Mallet breaks cracked rocks, the Strong Gloves push boulders).
  They stand on walkable ground and come back when the map is entered again. They are used to
  hide optional pockets with items (stencils 13–20, 25–29), never the main road.
- `surf: { rate, table }` and `fishing: { low, mid, high }` (tables like `encounters`): water
  encounters while sailing (Paper Boat) or fishing. The one rod uses the list of the team's level (`low`, then
  `mid` from N.20, `high` from N.35, `src/data/fishing.ts`) and hooks a Bestiole close under the team, within the
  list's range. Water tables hold Clapotin, Roupillon (surfing) and Gouttelotl (high lists): add new water drawings there.

A **new tile** needs:
- a `TileDef` in `src/overworld/tiles.ts` (`paint` with the `Painter`; flags `solid`, `encounter`,
  `over`, `ledge`, `animated`);
- a free character in `LEGEND`;
- the legend comment in `maps/index.ts` updated.

The map test rejects unknown characters.

**Music** follows the map automatically (`trackForMap` in `src/audio/mapMusic.ts`): every town has
its own theme (`TOWN_THEMES`), also played in its houses; the Ateliers play `atelier`; then routes,
caves and towers. Special maps are listed in `BY_MAP`. A new town needs a theme there. It also follows the
moment (`MusicMoment`, roadmap milestone 6): `fonds` under the water, `mer` on the boat, `velo` on the bike outdoors,
`routeNuit` on a route at night (the route theme slower, a tone down, with an echo: `nightOf`), and `route2` on the
later routes (`LATE_ROUTES`). `mapMusicNow()` checks it at every step, on the bike and when night falls, but only
switches while the map's own music or a moment's plays (`MOMENT_TRACKS`), never over a scene's. Legendary battles
play `legende`, the Grand Concours `concours` (its finale `champion`). The rival's
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
`drive`, `gallop`, `stab`, `rep`, `transpose`) write the repetitive parts.

The battles are more intense: a voice can name its instrument (`inst`: `strings`, bowed and held, a tremolo when
written in sixteenths; `staccato`, short bouncing strings for a running bass; `brass`), its loudness (`vol`) and
instruments doubling it (`with`, an octave apart with `oct`), so the music box keeps the melody with strings or brass
under it. Their drums add `K` a heavy kick, `n` a snare, `T` a timpani, `C` a crash and `X` kick and crash, written
in sixteenths (`drumStep: 0.5`) with the bars `BEAT`, `START`, `BOOM`, `FILL`, `ROLL`, `POUND`; `pump`, `sixteenths`,
`hit`, `push` and `cad` write the running basses, tremolos and brass. Keep a battle tune as loud as the others (an RMS
around 0.045 in its WAV): measure it rather than guess, as the instruments differ a lot. Give every tune its own
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
- **Fresques** (`F`) and `fresques: [{ x, y, id, species, size?, reward?, script? }]`: a sliding picture
  puzzle of a drawing, where any piece can be put into the gap (`src/ui/logic/fresque.ts`). Solving it sets `fresque:<id>`; patches with `unless` hide the secret room,
  and `items` with `showIf` fill it (or `reward` gives an item directly, or `script` plays a scene instead: the
  sunken chapel's). Every fresque counts towards a reward in `src/story/puzzles.ts`.
- **Signs** must sit on something solid (`S`, a wall, a rock): a test checks it.

### Diving

The Bocal-Scaphandre (`bocal`, from the Prof at the Lac des Couleurs) takes the player under the water:
- a map with `dive: '<map below>'` has dark patches of water (`d`, tile `deep`, water for sailing). Sailing on one,
  A asks to dive (`diveDown` in `controller.ts`) and warps to the same spot on the map below;
- a map with `underwater: '<map above>'` has circles of light (`5`, `lightshaft`): A there goes back up, in the boat
  (`surfaceUp`, `warpTo(…, { sail: true })`);
- `depthsOf(rows, edits)` (`src/data/maps/lac.ts`) draws the bottom from the surface map's own rows: water and
  bridges become sand (`1`), dark patches light, the rest rock (`4`); `edits` add seaweed (`2`, where Bestioles hide:
  « algues, en plongée » in the Bestiodex), coral (`3`), a wreck (`6`), clams (`9`)…;
- underwater maps spread `UNDERWATER` (the `underwater` battle backdrop, `dungeon` so no bike, a blue tint): the game
  draws rising bubbles and a glass jar on the player's head, and hides the follower;
- with the Carte des Fonds (`carte-fonds`), the Town Map marks every `d` tile of the maps that have a place on it.

A warp on water lands on water and keeps the boat (`warpTo` keeps sailing when it lands on water): rivers between
two maps, like Village-Plume's up to the lake. `maps.test.ts` checks that a warp on water lands on water.

## Story scripts

Add `scripts.myId = async () => { … }` in the act file (`src/story/act1.ts`…`act3.ts`, or `common.ts`
for shared ones), then reference `myId` from a map. Tools (import from `../overworld/controller`):

- Dialogue: `say(text, speaker?, vars?)`, `sayAll(lines, speaker?)`, `ask(text, choices, speaker?)`
  (resolves to the choice index), `showToast(msg)`. A choice that counts towards the ending goes
  through `choose(id, question, a, b)` (`src/story/choices.ts`, ids in `CHOICES`).
- Flags: `flag`, `setFlag`.
- Save: `update((d) => …)` from `src/state/game.ts`, `giveMon(species, level)`, `giveItem(id, n)`.
  An item the player receives is announced with `gotItem(id, line, vars?, speaker?)`: the item jingle, and its
  icon big over the world while the line is said (`ItemGet`). A badge is handed over by `trainerBattle` through
  `showBadge(id)` (`BadgeGetView`: it spins in, then « {name} reçoit le … de … ! »).
- Movement and screens: `warpTo(dest, { keepFade? })`, `openScreen(screen)` (resolves when the player
  is back in the world), `wait(ms)`.
- Effects: `flash(color?, ms?)`, `shake(ms?, 'rumble' | 'jolt' | 'quake')`, `bubble(actorId, '!' | '?' | '…' | '♪' | '♥' | 'zz')`
  (it pops in with its sound). Staging a bigger moment: see [Staging a scene](#staging-a-scene).
- Battles: `trainerBattle(id, actor?)` for normal trainers (before lines, battle, flag, badge,
  `afterScript`), or `fight(kind, name, party, opts)` for scripted ones (`friendly`, `tutorial`,
  `backdrop`, `look`, `grey`). Both return or set the result, and a loss blacks out unless `friendly`.
- Cut-scenes, through `const g = getGame()`:
  - `g.npc(id)`, `g.spawn(id, look, x, y, dir, mon?)` (`mon` draws a Bestiole's miniature), `g.remove(id)`;
  - `await g.walk(actor, ['up', 'up', 'left'])`;
  - `g.face(actor, dir)`, `g.faceToward(a, b)`;
  - `await g.fadeTo(1, ms, 'white' | 'black')`;
  - `g.player` is the player actor.

### Staging a scene

A big moment gets the cinema treatment (`src/overworld/scene.ts`, `getGame().camera`):

```ts
await staged(async () => {
  const g = getGame();
  g.camera.panTo(x * 16 + 8, y * 16 + 8, 900);   // look at something (map pixels, the middle of the view)
  await wait(1000);
  const friend = await comeUp('amie', LOOKS.girl);
  lookBetween(g.player, friend, 500);            // frame two people (lookAt(a) follows one as they walk)
  g.camera.zoomTo(2, 500);                        // 2 stays pixel-sharp; in-between zooms only while moving
  await bubble('amie', '!');
  g.camera.shake('jolt', 300);
  await say(L('…', '…'), FRIEND);
});                                               // the bars go, the camera comes back to the player
```

- Always `wait()` (never `setTimeout`): it runs on the scene clock, so a player holding B hurries the scene ×3.
  Text and questions are never hurried.
- `staged` gives the camera back even if the scene stops halfway; outside it, call `camera.follow(ms)` and
  `camera.zoomTo(1, ms)` yourself.
- MOUVEMENTS : DOUX turns pans into cuts and drops zooms and shakes: never rely on them to show something the text
  doesn't say.
- Bring people in with `comeUp` and send them off with `goAway` (they use the camera's real view, panned or not).
  Someone appearing or vanishing by magic is drawn in or rubbed out instead: `await sketchIn(id, look, x, y, dir)`,
  `await eraseOut(actor)`.
- A map that changes in the scene (a flag lifting a patch, `sketchUnless`, `tintUnless`): set the flag, then
  `await redraw('erase' | 'restore' | 'sketch' | 'rise', { at: { x, y } })` so it changes in front of the player instead
  of when the script ends. `at` is where the camera looks (and where a `restore` spreads from).

Scripts run one at a time and lock player input. To change an existing script after a story point
(post-game lines…), wrap it in a later act instead of editing it in place:
`const prev = scripts.x; scripts.x = async () => { if (!flag('ending')) return prev(); … }`.

### Writing a planche

Only the few biggest moments are drawn full screen; everything else stays on the map. A planche lives in
`src/story/planches.ts` and is built by a function, so its pictures can depend on the save:

```ts
export function photo(o: { look: Appearance; mon: { species: string; shiny?: boolean }; name: string; label: string }): Planche {
  return {
    id: 'photo',                     // unique: the view is keyed on it
    ms: 5200,                        // its length in scene ms (holding B runs it ×3)
    end: 'auto',                     // 'tap': it holds its last picture until a press
    beats: [{ at: 0 }, { at: 2600, caption: L('…', '…') }],  // a press jumps to the next beat
    images: () => ({ me: personUrl(o.look) }),               // loaded before it starts (browser only)
    cues: [{ at: 1, sound: 'shutter' }, { from: 3800, to: 4900, sound: 'pencil' }],
    draw(ctx, t, w, h, kit) { /* everything from t, in CSS pixels */ },
  };
}
```

- Draw everything from `t`: Android can empty a canvas, and the next frame paints it again. Work canvases come from
  `kit.scratch(i, w, h)` (cleared, kept while it plays); pictures from `kit.img(name)` (`undefined` until loaded).
- Helpers in `src/ui/planche/draw.ts`: `hatched` (a part of a picture pencilled in, `mode: 'in'`, or rubbed out,
  `'out'`, row by row; `filter: LINES` with `blend: 'multiply'` draws only its graphite lines first), `pencil` and
  `eraser` at the stroke's tip, `crumbs`, `grain`, `lids`, `fit`, and a camera: `camAt(keys, t, kit.calm)` + `look`.
  `kit.calm` (MOUVEMENTS : DOUX) means no zooms, knocks or flashes.
- `veil(t)`: a see-through planche (the world shows through this CSS `backdrop-filter`), like waking up.
- In a script: `await showPlanche(p)`, or `await withPlanche(p, () => sayAll([...], WHO))` to keep its last picture
  while someone talks. Captions are `L()` texts; `src/story/planches.test.ts` checks beats, captions and cues.

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
- `nature`, `talent`, `moves` on a party entry: written by hand, they always apply (neutral nature, talent slot 0
  and the last four moves learnt otherwise). Bosses (a `badge`, `fairCopy` or `items`), the rival's teams and the
  post-game teams also carry a `plan` (`planTeam`, `src/data/movesets.ts`: the best hit of each of its types, the hit
  that covers most other types, one status or set-up move, a nature for the side its moves lean on; stencil moves
  from L45). `partyOf` uses it on Hard, and on Normal only for post-game teams (ace L48+, `POSTGAME_ACE`, `planned`):
  the story's bosses keep the moves they were tuned with. A route trainer whose ace reaches L26 without an item gives
  it a Golden Berry (`ACE_BERRY_FROM`).
- `items`: potions in the trainer's bag (`potion`, `super-potion`, `retouche`), used by a thinking trainer when its
  Bestiole would fall to the next hit (or is asleep, frozen or paralysed while healthy). Give them to Atelier
  Masters from Marine on, admins and bosses, not to Act 1 trainers. `brainOf` (same file) decides by difficulty who
  thinks ahead and doubles them on Hard; the rival's are in `RIVAL_ITEMS`.
- Run `npm run balance` before and after changing levels or teams (see [testing.md](testing.md)).
  Keep the early game gentle ([story.md](story.md#level-curve-and-difficulty)).

### Battle intros: transitions and VS splashes

`fight()` picks how a battle begins with `introOf()` (`src/ui/battle/intro.ts`, pure, tested in
`intro.test.ts`): a **cover** that runs over the world, a **reveal** that opens the battle, and a VS
splash for bosses. Covers are `grass` / `cave` / `water` for wild Bestioles (from where they jumped
out: `wildBattle(…, { ground })`), `trainer`, `gomme` (Team Gomme), `boss` (Masters, the Great Eraser, the
Concours) and `legend` (legendaries, and wild battles that play the `final` music); `page` turns over the
battle on the way back. Reveals are `tear`, `erase`, `lift` (and `fade` for MOUVEMENTS : DOUX).

- **VS splash** (`src/ui/curtain/VsSplash.tsx`): Atelier Masters (and their rematches, through the base
  trainer's `badge`), `music: 'rival'`, the Great Eraser, legendaries and the Grand Concours. Its title
  line comes from `VS_TITLES`, its colour from the badge (or `VS_COLOURS`). A new kind of boss: add a
  `VsKind`, a title, a colour, a case in `introOf` and a test.
- **A new transition**: add its kind, duration (`COVER_MS` / `REVEAL_MS`), covered colour (`SHEET`),
  sounds and a `Draw` function in `src/ui/curtain/wipes.ts`. A `Draw` paints the whole frame from its
  progress `t` (0 to 1) with the move animations' `Brush`, and must end fully covered (or fully open):
  a canvas whose pixels are dropped repaints itself on the next frame. Check it at rest with
  `npm run demo -- m1` (« Toutes les transitions, image par image »).
- Scripts never call the curtain themselves: `fight()` and `playIntro` / `playOutro`
  (`src/ui/curtain/transitions.ts`) do.

## Creatures, moves, items

- **Talents** (`src/data/talents.ts`, the game's abilities):
  - each talent has an original name, a description and one `TalentEffect`. `src/engine/pk/battle.ts`
    runs these effects (damage, absorbing, contact, status immunity, entering, end of turn,
    switching out, fleeing, sleep);
  - species list `talents` (one or two regular) and a `hiddenTalent`;
  - a Bestiole stores a slot (`talent`: 0, 1 or 2), so an evolution keeps its slot;
  - new Bestioles get the hidden one 1 time in 4 (`HIDDEN_TALENT_CHANCE`), and older saves get a
    fixed slot from their uid;
  - trainers always use slot 0, so put the friendlier talent first: early Grognours and ghosts would
    otherwise halve Fire or dodge a lot;
  - battle messages come from the `talent` event.

  A new effect kind needs its hook in `battle.ts`, a test in `src/engine/pk/talents.test.ts` and,
  if it makes moves useless, a check in `ai.ts`.

  Every family has a **power**: a power talent as its only regular talent, or a signature move.
  [docs/bestioles.md](bestioles.md) lists them, with the stat bands, catch rates and base XP a new
  Bestiole should follow; `src/data/bestioles.test.ts` checks those rules.
- **Moves that change the field** (Nov 2026, roadmap milestone 7; `MoveEffect` in `src/data/schema.ts`):
  - `hazard`: Épingles lays pins on the foe's ground (`SideState.hazards`, three layers at most). Each Bestiole
    sent out there loses 1/8, 1/6 or 1/4 of its HP in `switchIn`; flyers pass over. Pins never knock one out.
  - `sweep`: Coup de Balai clears its own side's pins, seeds and ties.
  - `screen`: Calque Protecteur (physical) and Vitrail (special) halve that kind of damage for 5 turns
    (`SideState.screens`, in `computeDamage`); a critical hit goes through.
  - `pivot`: Demi-Tour Crayonné and Éclaboussure Fuyante land, then the user goes back at the end of the turn
    (`BattleState.pivot`). The trainer picks the healthiest teammate at once; the player is asked through the
    forced switch (`needSwitch` while the active Bestiole is still standing; `replace` refuses the active one).
  - `roar`: Grand Cri, priority −6, drags a random teammate of the foe out (it fails on a wild Bestiole).
  - `taunt`: Gribouillis Moqueur leaves only attacking moves for three turns (`Volatile.taunt`, `usableSlots`).

  Each has its events and lines (`hazard`, `hazardHurt`, `swept`, `screen`, `pivot`, `dragged`, `taunted`,
  `tauntEnd`), an AI score (`statusScore`) and a planner value (`statusValue`). They are learnt by a few Bestioles
  of the right type around L28–38, and Poing Étincelle and Poing Givré now have learners too
  (`src/engine/pk/fieldMoves.test.ts`).
- **Natures** (`src/data/natures.ts`): 25 kid-like personalities. Twenty raise one stat by 10% and
  lower another by 10%, and five change nothing. `calcStat` applies them in tenths, so rounding is
  exact. New Bestioles draw one at random. Trainers' Bestioles use the neutral `joyeuse`, so their
  battles stay the same. Bestioles from older saves get a fixed one from their uid.
  French names agree with « une nature » (feminine).

- **New Bestiole**: follow README "Add a new Bestiole". It covers her drawing as the original (photo in
  `img-source/`, manifest entry, `npm run cards -- <id>`, `ORIGINALS`), drawing it in her style with
  `npm run redraws -- <id>`, then adding the creature to `src/data/creatures.ts`. For a creature that evolves, list its ways to evolve in
  `evolutions: [{ to, level? | item? | friendship? }]` on the base form, and set `evolvesFrom` on each
  evolved form. Several rules make a branching evolution (Pandoudou's future forms):
  - `item` is a Crayon Magique used from the bag (`crayon-magique-<type>`). Water, Fire and Lightning
    are in the shops' `STOCK` from 4 badges, Grass and Fairy from 5, Psychic and Dark from 6, Ice after the ending
    (Pandoudou's eight forms); put another one there, or as a pickup, when a drawing needs it.
    Besides Pandoudou, Joufflux (Electric), Floconnet (Ice), Pétillapin (Fire), Érabou (Grass) and Poulpinceau (Water)
    evolve with one;
  - `friendship: 220` evolves on levelling up with a great friendship;
  - `level` is the usual one.

  A learnset entry at level 0 is an evolution move, learned the moment the Bestiole evolves into
  that form (`evolutionMoves`), so a form reached by a pencil at any level gets a move of its type.
  `evolutionFor()` in `src/engine/pk/creature.ts` applies the rules. Set `faces` for sideways drawings, and
  `rarity`, which weights the Tombola. Put it in an `encounters` table or a trainer party.
  The order of `CREATURES` is the Bestiodex order (`dexNo`), and a test keeps evolution lines side by
  side. It ends with the semi-legendaries (the rare three-form lines of Orajolotl and Festivouivre), then the
  legendaries, the Bestiodex's reward last. Ids are keys used by saves, maps and card files, so never renumber them.
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
    in `creatures.ts`). 25–29 give the side a Bestiole hits with more types to hit (two punches, Cri de Karaté,
    Grand Brasier, Griffe de Nuit): the rules test wants every final form to hit two other types on its side. A test checks every
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
parts can move: wrap the code that draws a part in `c.part(name, def, () => { … })` (`k.part` in the kid kit).
`npm run redraws` (or `drafts`) cuts the body and each part out on their own into
`public/rigs/<id>-<slug>/` and records them in `src/data/rigs.json`; `tools/out/rigs-sheet.png` shows them put
back together, each part framed with its pivot as a red dot. The card doesn't change.

- `pivot`: the drawing point it turns around (a wing's root, the base of a trunk).
- `motion`: `flap` (beats, `amp` degrees; a negative `amp` for a wing on the other side), `fold` (folds
  towards the pivot, butterfly wings, `amp` %), `swing` (trunk, tail), `nod`, `peek` (goes to `to`, in % of
  its own size, with `shrink` and `fade`), `throw` (flies to `to` in an arc, then is back: Érabreuil's acorn;
  the arm throwing it gets a `nod` with the same `period` and `phase`), `flicker` (sparks), `blink` (closed eyelids). `period` in seconds,
  `phase` (0–1) so parts move together.
- `behind`: under the body (a far wing, a part drawn first). `inside`: in front at rest, behind the rest
  once small (Clapotin's body into its shell). `clip`: cut off at the drawing's edge (Guettou going down
  its hole).
- `extra`: only in battle, not on the card (Joufflux's lightning): draw it last, so the card's random strokes
  stay the same. A part drawn in two goes (some before something else, some after) is called twice with the
  same name.
- `src/data/rigs.test.ts` checks each rig's pictures, boxes, pivots and motions.

### Fair copies (« mise au propre »)

Each fully grown Bestiole has a fair copy for battle ([story.md](story.md), "Mise au propre"): its data in
`FAIR_COPY` (`src/data/fairCopies.ts`: the base stats and its new `talent`; `type2` for the few that take a new
type, with `type` when the kept one isn't its first).

Its drawing has no design of its own: `tools/fair/make.ts` draws the card's own module (`tools/redraws/<slug>.ts`)
again in the `crayon` kit's `clean` style. That is a real « mise au propre »: a crisp black felt-tip outline, flat even
colour a little more vivid (`vivid()`), and the same moving parts. Then it sets the Feutre d'Or's gold star
(`c.star`) by itself on the body: on its main colour, away from the face, not under a part drawn in front. The owner
chose this over redesigned fair copies (October 2026).

Poupochette, drawn by the kid kit, keeps its hand-drawn module `tools/fair/poupochette.ts` (felt-tip outline over
her coloured pencil).

- `npm run fair [-- <slug>…]` writes its rig to `public/fair/<id>-<slug>/` and `src/data/fairRigs.json`, and
  `tools/out/fair-sheet.png` (the pencil card, the fair copy, battle size).
- `npm run fair -- --try <slug>…` only draws, into `tools/out/fair-try/` (several people can draw at once).
- `npm run fair:preview` writes `tools/out/fair-preview.html`: each fair copy moving beside its pencil drawing, its
  types, stats, talent and the moves of its new type, and the plan for those not drawn yet (`tools/out/fair-looks.json`). Show it to the owner.
- `src/data/fairCopies.test.ts` checks one per fully grown Bestiole, +20 % but HP, a new talent (or a new type with a
  move of it learned by level 45), and the rig's pictures.

### The kid kit (Poupochette)

Every Bestiole is drawn with the `crayon` kit of `tools/redraws`, except Poupochette: the owner likes her rougher
look, drawn by the kid kit (`tools/drafts/kid.ts`: potato shapes, pencil lines gone over twice, zig-zag colouring;
`layered: true` makes front parts hide back ones). `npm run drafts` redraws her card, miniature and rig. Don't add
new Bestioles there; the old « brouillon » status (`draft: true`) is gone.

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
- **A first catch** (a species never caught, once `flags.dex` is set: `firstCatch` in `src/state/game.ts`, checked
  before `addMon` writes it down) shows its Bestiodex page stamped « Enregistré ! » (`showDexPage`, `DexPageView`)
  before the nickname question. The small moments' views are in `src/ui/views/MomentViews.tsx`.
- **Nicknames** are offered with `offerNickname(uid)` from a script, after a capture, a gift or the
  starter. The `NicknameView` entry is drawn over the map through `nameOverlay`. New Bestioles get
  `met` through `addMon(s, m, how, place)` / `giveMon(species, level, how)`.
- Build screens from the paper kit (`src/ui/paper`): `Frame` (title strip, body, bottom bar),
  `ActionBar`, `Window`, `TextBox`, `MenuList` with `useMenuNav`, `YesNo`, `QtyPicker`. That keeps the FRLG layout
  and the keyboard, touch and B-button behaviour consistent.
- **Every menu works the same way (B on the left, A on the right, as on the console):**
  - leaving a screen is « ◀ Retour », always at the bottom left and always the same size: `Frame`'s `onBack`, or an
    `ActionBar` in a view that isn't a `Frame` (Bag, Party, Summary, Look). The B key does the same;
  - the main action, if any, goes at the bottom right in butter (`action`, a `pbtn--accent`), a short line between
    the two (`hint`);
  - the top only says where you are: the title, money or counters (`right`), and ◀ ▶ to change page, pocket, box or
    Bestiole (`Frame`'s `onSide`, or `MenuList`'s `onSide`). The ← → keys do the same as those arrows;
  - the word is « Retour » / "Back" (no Sortir, Fermer, Éteindre…). « Annuler » only cancels something under way, in
    the same place (a swap, the shop's quantity, the ANNULER line closing a small menu);
  - small boxes follow it too: cancel on the left, OK on the right (shop quantity, nickname, learning a move).
  `src/ui/paper/actionBar.test.ts` checks it from the sources.
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
  you bottom left. The drawings live in the camera layer (`.pk-cam`), the HP boxes in the HUD over it
  (`.pk-hud`, with the same columns), so the battle camera zooms the scene and never the boxes. The foe's column ends low enough that its feet are always
  below the backdrop's horizon (46% of the picture). Boxes are two short rows (name and level; the
  bar, with your HP written inside it); experience is a thin blue line over your box, shown only
  while it fills. Trainer battles show the foe's team as little Croque-Carnets under its box (black: knocked out,
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
- Back buttons: `pbtn--b` (the `ActionBar`'s) shows a "B" hint and must really answer to X/B.
  Use `pbtn--back` (a plain ◀) where B means something else (the prologue's way back to the title). Touch screens
  always get the ◀, because their only B button is on the map.
- Per-device options go in `src/state/prefs.ts` and get a row in `ROWS` in
  `src/ui/views/OptionsView.tsx`.
- **MOUVEMENTS : DOUX** (`prefs.motion === 'calm'`, `calmMotion()` in `src/anim/calm.ts`, class `.app.is-calm`)
  starts from the device's "reduce motion" setting. Any new transition, camera move or shake must
  check it and fall back to a plain fade (or nothing). Easing maths for animations live in
  `src/anim/ease.ts` (`src/ui/battle/fx/core.ts` re-exports them for the move recipes).
