# Roadmap: three axes to make Atelier Bestioles bright

## Context

The owner asked where the game should go next to be memorable, fun, worth discovering, replaying and
continuing after the credits, as a Pokémon-style fan game. Decisions taken with the owner:

- battles stay **1v1** (no double battles);
- **no link between save slots**;
- public fan-game players count as much as the family;
- the rival must **not** drop by after each Atelier: the `arrivals` mechanism already brings a Colour Guide
  there (`src/story/guides.ts:166`), and two arrivals on one map would collide. The rival keeps his story
  scenes and gets a postgame loop instead.

This document is written for another model to implement milestone by milestone. Every section names the
exact files, types and functions as they are today (line numbers from the current tree, Nov 2026).

### Where the game stands (measured)

Already strong: 83 maps, 129 Bestioles (64 lines, 84 talents, 163 moves, 140 items), 8 Ateliers,
142 trainers, 8 story choices and 2 endings, a custom Bestiole, 5 legendaries, Concours, tower, real-house
days, 27 tunes, planches, a staging engine, polished phone UX, 73 test files, balance and curve sims.

| Gap | Evidence |
|---|---|
| The cast appears once and goes | Rival: 4 battles, team never changes with choices, no NPC after `tr:rivalFinal`. Masters never seen outside their Atelier. Great Eraser gone after `tr:effaceur`. |
| The world is a diorama | `NpcDef` has no time field; nothing re-evaluates NPCs when the phase changes. No overworld weather. One `route` tune for 11 routes; no bike, surf, underwater or legend music. No calendar events. |
| Battles are won by numbers | `ai.ts` switches only when it cannot damage; never estimates KO; enemy `item` actions are ignored by `act()`. 8 of 142 trainers hold items; `partyOf` forces neutral nature and talent 0. No hazards, screens, pivot, force-switch, Taunt. Eggs inherit no moves. |
| The postgame is one good evening | `CONCOURS` is 5 fixed teams forever; wins = `hallOfFame.length`. Master rematch = +12 levels once (Mireille's ace at L20 after the ending). Tower rewards stop at streak 21. Real-house scenes stop after 20 days (`wakesAtHome`). |
| A second run is the same run | Nothing carries over; no New Game+; no rules. `DIFFICULTY.hard` = +10 % levels and IV 20. |

### Project rules that bind every milestone

- Ship each milestone on its own: commit with the noreply email, deploy check, a demo page or Artifact for
  the owner, `docs/histoire.md` updated FR + EN (spoiler-free), `docs/story.md` / `docs/content.md` for the
  technical side, same commit.
- Every player text is `L('français', 'English')`, typographic `’` and `« »`, `{g:f|m}` for gender.
- Balance before shipping anything that touches teams, AI or levels: `npm run balance -- normal`,
  `npm run curve`; `src/data/curve.test.ts` and `src/data/maps.test.ts` must pass. Normal bosses stay about
  70–90 %; the gentle start (Act 1) must not get harder.
- Phones first: check 360 and 412 px at 100 % and 130 %, and 770×350 landscape, for any new screen
  (`docs/testing.md`, `--mute-audio`).
- Save shape changes bump `SAVE_VERSION`, go through `repair()` (idempotent) and get a test in
  `src/state/game.test.ts`.
- New moves need a recipe (`src/ui/battle/fx/recipes.ts`, `recipes.test.ts`), a `describe` case in
  `src/ui/battle/messages.ts` (the `switch (e.t)` has no default: a new event kind fails typecheck), and a
  `desc` for `MoveInfo`.
- No emoji icons, graphics drawn in code, original names only.

Effort scale: S ≈ half a day, M ≈ 1–2 days, L ≈ 3–4 days of focused work.

---

## Axis 1. A world that lives and a cast that comes back

### 1.1 The rival's arc, tightened (M)

**Goal.** The rival's team reflects choice 5 at the finale, and he stays in the game after the ending with a
weekly rematch at the Galerie. No new mid-story appearances (the arrivals conflict).

**Today.** Scenes: `labTable` (act1.ts:140), `pastelRival` (course.ts:18), `lacAppel`/`rivalLac`
(lac.ts:44, 214), `rivalCourse` (course.ts:45), `rivalTower` / `rivalDoubts` (act3.ts:80, 107),
`forteresseTop` (act4.ts:200), `rivalFinal` (act3.ts:354). Teams: `rivalLacTeam`, `rivalCourseTeam`,
`rivalFinalTeam` + `RIVAL_ACE` (trainers.ts:862-896). Choice 5 flags `choix:rival:a` (train) / `:b`
(you're great as you are). His NPC look `LOOKS.rival` (sprites.ts:324). Postgame: nothing.

**Changes.**
1. `src/data/trainers.ts`: `rivalFinalTeam(rivalStarter, choice?: 'a' | 'b')`.
   - `'a'`: the two L41 fillers 007 and 027 become their grown forms via `grownForm(id, 44)` at L44, each with
     a held item (`plume-vive`, `bandeau-tetu`); ace unchanged.
   - `'b'`: same team as today, ace gets `shiny: true` and nickname « Mon Trait » / "My Line" (needs a hook:
     `partyOf` forces `shiny: false`, so `rivalFinal` patches the Mon after `partyOf`: `party[last].shiny = true;
     party[last].nickname = …`).
   - `act3.ts:354` passes `flag('choix:rival:a') ? 'a' : flag('choix:rival:b') ? 'b' : undefined`.
   - Balance: the `'a'` team is a touch stronger; run `npm run balance -- normal 300 rivalFinal` with
     both (add `CHOICE=a|b` env to `tools/balance.ts` `foeParty`), keep 44–79 % or better.
2. Postgame rival at the Galerie.
   - `src/data/maps/galerie.ts` `galerie` NPCs: `{ id: 'rivalGalerie', x: 17, y: 14, look: LOOKS.rival,
     facing: 'left', script: 'rivalGalerie', showIf: 'champion' }` (a free tile near the tower).
   - `src/story/postgame.ts` `scripts.rivalGalerie`:
     - weekly gate: `const week = Math.floor(localDay() / 7)`; flag `re:rival` holds the last week fought;
       if equal, lines only (one of 3 by `choix:rival`, plus a hint of what he trains).
     - else `ask` « Une revanche ? », heal first (`update(healParty)`, like `rivalFinal`), then
       `fight('trainer', RIVAL, partyOf(rivalPostTeam(starter, wins), newSeed()), { trainer: { id:
       'rivalPost', name: RIVAL, party: [], money: 6000, fairCopy: true, before: [], after: [...] }, look:
       LOOKS.rival, backdrop: 'city', music: 'rival' })`; on win `setFlag('re:rival', week)` and
       `setFlag('rival:revanches', n + 1)`.
   - `rivalPostTeam(starter, wins)` in trainers.ts: `rivalFinalTeam(starter, choice)` with every level
     `+ 10 + 2 * min(wins, 10)` capped at `MAX_LEVEL` and the fillers grown (`grownForm`), six Bestioles.
   - `src/story/objective.ts` `POST`: add `step('rival', 'galerie', L('{rival} t’attend Place des
     Chefs-d’Œuvre pour une revanche.', '{rival} is waiting for a rematch at Masterpiece Square.'),
     ['rival:revanches'])` after `concours`.
   - `src/data/progress.ts`: a milestone in `revanches`? No: new track `rival` (post: true), steps at 1, 5, 10
     (`sucette-magique`, `biscuits()`, `crayon-lilas`), `count: (s) => s.flags['rival:revanches'] ?? 0`.
3. Tests: `src/story/story.test.ts` picks up the new script id and flags automatically; add a unit test for
   `rivalPostTeam` (six members, levels capped, monotonic in `wins`).
4. Docs: `docs/story.md` rival paragraph; `docs/histoire.md` one line « votre rival vous attend après
   l’histoire » (no spoiler).

### 1.2 Townsfolk with a day (M)

**Goal.** A few NPCs per town are only there by day, evening or night, say other lines after dark, and the
map reflects a phase change while you stand there.

**Today.** `NpcDef` (mapTypes.ts:24-57) has no time field. `visibleNpc` (controller.ts:137-146) applies
`showIf`, `RETIRED`, `hideIf`, `fromMap`, `fromDoor`. `updateTime()` (controller.ts:123-128) only sets
`game.timeTint` and `game.night`; called every 30 s (`setInterval`, controller.ts:93), on `loadMap`,
`enterWorld`, `sleepUntil`, `reveilMaison`. `refreshMap()` (controller.ts:211-224) keeps actors whose id
already exists (`old && old.npc ? old : n`). `dayPhase()` = `phaseAt(hourNow(clockShift))`.

**Changes.**
1. `src/overworld/mapTypes.ts` `NpcDef`: add
   ```ts
   /** Only there at these times of day (day 7–19 h, evening 19–21 h, night 21–7 h). */
   when?: DayPhase[];
   /** Lines said at night instead of `text` (no script). */
   night?: LText[];
   ```
2. `visibleNpc`: `if (n.when && !n.when.includes(dayPhase())) return false;`.
3. `onInteract` (controller.ts:445 area, where `afterStory` is read): if `def.night && dayPhase() === 'night'`
   use those lines instead of `text` (after `afterStory`, before `later`).
4. Phase-change hook in `updateTime`: keep a module `let lastPhase: DayPhase | null`; when the phase differs
   and `game.lock === 0` and `screen.value.id === 'overworld'`, call `refreshMap()` (it keeps the player and
   vehicles). Because `refreshMap` keeps existing actors by id, an NPC that must disappear is removed by the
   filter (its id is no longer in the new list), and a new one appears: no walking needed. Do it only when
   no dialog is open (`!dialogOpen()` or equivalent; the controller has `menuAllowed()` logic to copy).
5. Content (data only, `src/data/maps/*.ts`), about 3–5 NPCs per town, with ids suffixed `Nuit`/`Soir`:
   - Inn (`interiors.ts` `centre`): a `fromMap`-less night regular who tells a Bestiole bedtime story (`when:
     ['night']`), a traveller by day.
   - Each town: a stall keeper by day with a wandering child; at night a watchman (`LOOKS.clerk` with a
     lantern line), a stargazer in Paillette, cats (`mon: '014'`?) in Encre's alleys, Mamie on her porch in
     the evening. The children of the day go `when: ['day', 'evening']`.
   - Night-only dialogue for the innkeeper and shop clerk (`night` lines).
6. Tests: `src/data/maps.test.ts`: every `when` value is a `DayPhase`; an NPC with `when` is not a trainer
   and has no `script` that the story depends on (`story.test.ts` already checks ids). A controller test (or
   `src/story/*.test.ts` style) that `visibleNpc` honours `when` with a mocked `clockShift`.
7. Phones: nothing visual new.

### 1.3 Weather over Papeterre (L)

**Goal.** One weather per region per real day: rain, snow, wind, fog or clear. It is drawn in the pencil
look, starts battles with that weather, and changes a few wild tables.

**Today.** `ambient.ts`: `AmbientKind` union (7 kinds), `AMBIENT_COUNT`, pure `speckAt(kind, i, t, w, h,
camX, camY)`, `drawAmbient(ctx, kind, w, h, camX, camY, t)`; `MapDef.ambient?`, `MapDef.fog?`. Draw order
in `Game.renderView` (game.ts:1079-1137): particles, drained, colourBack, tint, bubbles, time tint
(`multiply`, skipped indoors), ambient (clipped to the map), fog ellipses, fade. `createBattle`
(battle.ts:231-253) hard-codes `weather: null`; `BattleSetup` (battle.ts:185-193) has no weather field.
`EncounterTable.table[]` rows have `time?` and `if?` (mapTypes.ts:127-137); the roll is inline in `onStep`
(controller.ts:401-425) with `meetsTime`. `regionOf(mapId, returnTo)` (worldmap.ts:109). `localDay()`
(berries.ts:4). `game.ts` does not gate particles on `prefs.motion`.

**Changes.**
1. `src/state/weather.ts` (new, pure):
   ```ts
   export type Sky = 'clear' | 'rain' | 'snow' | 'wind' | 'fog';
   /** Weather today over a region: seeded by the day and the region, most days clear. */
   export function skyOver(region: string | null, day = localDay()): Sky
   ```
   Hash `day * 31 + hash(region)` → `[0,1)`; clear 55 %, rain 15 %, wind 15 %, fog 10 %, snow 5 % but snow
   only where `SNOW_REGIONS` (`braise` heights, `galerie`, `ilePage`) and never in `bourg`/`route1` (the gentle
   start). `skyToBattle(sky): Weather | null` → rain → `'pluie'`, snow → `'grele'`, others `null`.
   `MapDef.sky?: false` opts a map out (indoors are out by default: `def.indoor || def.underwater || def.awake`).
2. Drawing (game.ts): a `sky` field on `Game` set by `controller.loadMap` and by the day change in
   `updateTime`; in `renderView` after the ambient block:
   - rain: `drawAmbient` with a new `AmbientKind` `'rain'` (short slanted graphite strokes, 40 specks,
     falling fast; add to `AmbientKind`, `AMBIENT_COUNT`, `COLOURS`, `speckAt`), plus a 6 % blue multiply tint
     added to the time tint (`tintShown` × `[235,240,255]`);
   - snow: `'snow'` kind (paper-white specks drifting), tint `[245,248,255]`;
   - wind: no new specks, instead `petals`/`leaves` ambient speed ×3 and a sideways drift (add a `wind` param
     to `speckAt`);
   - fog: reuse the `def.fog` ellipses path with alpha 0.16.
   - Gate everything with `calmMotion()` (import from `src/anim/calm.ts`): under MOUVEMENTS : DOUX draw only
     the tint.
3. Battles: `BattleSetup.weather?: Weather` → `createBattle` sets `weather: setup.weather ? { kind,
   turns: 99 } : null` (99 = lasts the battle, like the GBA's overworld weather). `fight()`
   (controller.ts:1070) passes `weather: skyToBattle(g.sky)` for outdoor maps only (`!def.indoor`). The UI
   already shows weather via `.pk-weather--<kind>`; the AI's `likes()` already values it.
4. Encounters: `table[]` row gets `sky?: Sky`; filter in `onStep` next to `meetsTime`:
   `(!r.sky || r.sky === g.sky)`. Add 4–6 rows (data) : e.g. a Water species in the rain on Route 3, Floconnet
   in the snow on the Braise heights after the ending. Keep wild levels under the trainer cap
   (`maps.test.ts` checks).
5. Town Map (`TownMapView.tsx`): the cursor notes line gets the sky glyph drawn in code (`sketchIcons.ts`
   style small doodle: drops, flake, swirl, haze) for the hovered region: `skyOver(regionOf(id))`.
6. `updateTime`: when `localDay()` changes, recompute `g.sky` and `refreshMap()` is not needed (no NPCs
   depend on it) but the tint target changes.
7. Tests: `weather.test.ts` (deterministic, distribution over 10 000 days roughly as specified, never snow
   in `bourg`); `pk.test.ts`: a battle created with `weather: 'pluie'` has rain for the whole fight;
   `maps.test.ts`: `sky` rows valid.
8. Perf: measure with the existing headless playtest on 360 px; rain count ≤ 40; specks are `fillRect`s like
   today.

### 1.4 Music for each moment (M, mostly composing)

**Today.** `TrackId` union (tunes.ts:10-13); `TRACKS: Record<TrackId, Track>` (tunes.ts:122);
recordings `src/audio/recordings/<id>.m4a` made by `npm run music -- <id>`; `JukeboxScreen.tsx:9-36`
has `Record<TrackId, {name, where}>` (typecheck forces an entry). `trackForMap` (mapMusic.ts:27) is called
by `OverworldScreen.tsx:80-88` on `save.player.map` change and by `controller.mapMusic()`. Bike/boat state
lives on `Game` (`biking`, `surfing`), not saved; underwater = `def.underwater`. `fight()` picks the track
at controller.ts:1048.

**Changes.**
1. New `TrackId`s: `'velo'`, `'mer'`, `'fonds'`, `'legende'`, `'concours'`, `'routeNuit'`, `'route2'`
   (Act 3+ routes). Compose in `tunes.ts` with the existing helpers (`bars`, `rep`, `arp`, `strum`, `drive`),
   bpm and instruments per the music-box palette (`docs/content.md` music section). Record each; commit
   the `.m4a`.
2. `trackForMap(def, returnTo, ctx?: { night?: boolean; biking?: boolean; surfing?: boolean })`:
   - `def.underwater` → `'fonds'`; `ctx.surfing` → `'mer'`; `ctx.biking` outdoors → `'velo'`;
   - routes: `def.act >= 3`? There is no act field: use a `ROUTE2` set `{route6, route7, route8, route9,
     piste, esquisses}` → `'route2'`; `ctx.night` on any route → `'routeNuit'` (one night variant only).
   - `OverworldScreen` effect: also depend on a `vehicle` signal; add `game.onVehicle` callback fired by
     `toggleBike()` (game.ts:812), `sail()` (:787) and `setMap` reset, which calls `mapMusic()`.
3. `fight()`: `legends.ts` battles pass `music: 'legende'` (they already call `wildBattle(…, { music })`);
   `concoursBattle` passes `'concours'` for n < 5 (keep `'champion'` for the Prof).
4. Jukebox entries, `docs/content.md` music table, `tests`: `src/audio/*.test.ts` if any checks recordings
   exist for every `trackIds()` (add one if missing: `fs.existsSync` per id).

### 1.5 A calendar: swarms, market day, the Bal des Étoiles (M)

**Today.** Daily patterns use `localDay()` stored in a flag (`memo`, `followerHug`, `re:<id>`,
`berry:*`, `koDay:*`, `reel:jour`). `TownMapView` shows one `currentObjective`. No events module.

**Changes.**
1. `src/data/events.ts` (pure):
   ```ts
   export function swarmOf(day: number, flags): { map: string; species: string } | null
   export function marketTown(day: number): string | null      // one town, weekly (day % 7 === 6)
   export function isBal(now: Date): boolean                   // Dec 21–23, night
   ```
   Swarm: pick from a `SWARMS` list of `(map, species)` pairs (uncommon species already on that map or a
   neighbour), index `day % SWARMS.length`, skipping maps not yet visited (`flags['seen:<map>']`), null
   before badge 2.
2. Swarm effect: in `onStep`'s table filter, if `swarmOf(...)?.map === g.map.def.id` push a row `{ id:
   species, w: sum of weights, min, max from the map's range }` so it is about half the encounters. The
   Prof's assistant in `labo` (new NPC `assistante`, `showIf: 'badge:plume'`) says where today's swarm
   is; the Town Map lists it under the objective line (add a second line slot in `TownMapView`).
3. Market day: `boutique` (interiors.ts) gets an NPC `marchande` with `fromMap: [town]` computed… `fromMap`
   is static, so instead `visibleNpc` gains a generic `showWhen?: (s: SaveData) => boolean` on `NpcDef`
   (functions are fine in map data; `story.test.ts` ignores them). The stall sells 3 items from a rotating
   list (`MARKET_STOCK[day % n]`), one of them never sold elsewhere (`baie-prisme`, a stencil, a Crayon
   Magique after badge 6), via `openScreen({ id: 'shop', market: day })` → `ShopScreen` `market?` prop
   with its own stock. A visiting trainer (`LOOKS.hiker`) with a themed team stands by the stall
   (`trainerBattle` once per week: flag `re:marche` = week).
4. Bal des Étoiles: `paillette` map NPCs with `showWhen: (s) => isBal(new Date())`: lanterns as
   obstacles with `showIf`-like `showWhen`, a dance scene script `bal` (the rival walks in with `comeUp`
   if `champion`, else Célestine), a guaranteed sparkly wild `Hypnopaon` once (`flag bal:<year>`).
5. Tests: `events.test.ts` (determinism, no swarm before badge 2, every `SWARMS` species exists on that
   map or neighbour, the market stock ids exist); `maps.test.ts` tolerates `showWhen`.
6. Docs: `docs/histoire.md` « des jours de marché, des essaims, un bal en hiver ».

---

## Axis 2. Battles worth thinking about, still 1v1

### 2.1 Trainers who think (M)

**Today.** `aiChoose(st, slip)` (ai.ts:22) → `choose` (ai.ts:28): wild/slip random; switch only when
`!canHurt`; score = `power × talentPowerMult × eff × STAB × acc × stage`, status heuristics, ×0.85–1.15.
`computeDamage(st, atkSide, defSide, mv, power, forceCrit?)` (battle.ts:503) uses the rng (pass a copy and
`forceCrit = false`). `act()` ignores enemy `item` actions; `useItem` (battle.ts:953) and `itemUsable`
(:931) are hard-coded to `st.sides[0]`. `effectiveStat(side, key, crit?, night)` (:266). `DIFFICULTY`
(trainers.ts:44). `BattleScreen.tsx:348` passes `DIFFICULTY[prefs.difficulty].slip`. Sims:
`tools/balance.ts` `winRate` plays the player with `aiChoose` on mirrored sides; `pk.test.ts:508` AI-vs-AI
200 seeds must all end.

**Changes.**
1. `ai.ts` scoring with lookahead (keep it cheap: a handful of `computeDamage` calls per turn):
   - `estimate(st, side, mv)`: `computeDamage({ rng: st.rng, weather: st.weather, night: st.night },
     me, foe, mv, power, false).dmg` on clones? `computeDamage` reads sides only; no mutation except the
     rng in the passed object, so pass `{ rng: st.rng, … }` literal. Multiply by `acc / 100`.
   - **KO now**: if `estimate ≥ target.hp` and I move first (`effectiveStat(me,'spe') > effectiveStat(foe,'spe')`
     or priority higher), score ×2.
   - **Danger**: `foeBest = max over foe's known moves of estimate(foe → me)`; if `foeBest ≥ m.hp` and the foe
     is faster: prefer priority moves that KO, else consider switching (below); status and set-up moves
     ×0.2.
   - **Set-up** (`stage self`): ×1.6 when `foeBest < m.hp / 3`, ×0.3 when `foeBest ≥ m.hp / 2`.
   - **Heal**: threshold becomes dynamic: heal when `hp - foeBest ≤ 0` and `heal amount > foeBest`.
2. Switching (trainers only, `st.kind === 'trainer'`, not trapped/charging, `DIFFICULTY.switching`):
   - matchup score of a Mon vs the foe: `best outgoing estimate / foe.hp − best incoming estimate / my hp`;
   - switch when the active's score ≤ −0.5 and a benched one scores ≥ +0.3 better, at most once every 3
     turns (`st.turn − lastSwitchTurn`, store in `SideState` as `aiSwitchedAt?: number`), never when the
     active can KO now.
   - On Easy: switching off; on Normal: on from badge 3 (the trainer def gets `smart?: boolean` set by
     `trainerBattle` for Masters/admins/rival and any trainer whose ace ≥ L20; the field goes on `BattleSetup`
     as `enemyBrain: 'simple' | 'smart'`); Hard: always smart.
3. Items for the enemy (`DIFFICULTY.items`: easy 0, normal 1 for bosses, hard 2 for bosses, 1 for others
   ≥ badge 5):
   - `SideSetup.items?: { id: string; n: number }[]` → `SideState.items`.
   - `act()`: handle an enemy `{ type: 'item', item, target }` before moves (same place as the enemy
     switch, battle.ts:1136): generalise `useItem(st, side, …)` and `itemUsable(st, side, …)` to take the
     side (player call sites pass 0). The event `useItem` gains `side` (messages.ts:134 then says « {name}
     utilise… » for side 1; events.ts:84 animates either side).
   - AI: use `potion`/`super-potion` when `hp < 40 %` and `hp + amount > foeBest`; `rappel` never (keep it
     simple); one use per turn, consumes `items[i].n`.
   - A boss's items come from `TrainerDef.items?: string[]` (data): Masters from Marine on get
     `['super-potion']`, Act 4 admins `['super-potion','super-potion']`, Concours stages
     `['potion-max']`-like (use existing `heal` items only).
4. Tests: `ai.test.ts` (new): KO-now preferred; switches out of a hopeless matchup; heals at the threshold;
   enemy item consumed once; `pk.test.ts` AI-vs-AI still ends (cap switches). `tools/balance.ts`: add
   `BRAIN=simple|smart` env and run both; store the before/after table in `docs/story.md` level-curve
   section. Target: Normal bosses still 70–90 %; if a boss drops under 60 %, lower one level rather than
   dumbing the AI.
5. Docs: `docs/content.md` trainers section (`items`, `smart`), `docs/story.md` difficulty table (Hard: smart
   AI + items).

### 2.2 Teams with a plan (M)

**Today.** `TrainerMon { species; level; item? }`; `partyOf` forces `nature: NEUTRAL_NATURE`, `talent: 0`,
`shiny: false`; `talents.test.ts:71` asserts trainers get talent 0. `createMon(species, level, st, ivs?)`
takes no nature/talent. Masters' teams: trainers.ts:137 (mireille) … 675 (nocturne). Celestine, basile,
nocturne, concours stages and the Great Eraser have `fairCopy`.

**Changes.**
1. `TrainerMon` gains `nature?: string; talent?: TalentSlot; moves?: string[]` (explicit moveset, up to 4
   ids; the rest from `movesAt`). `partyOf` applies them: `nature: t.nature ?? NEUTRAL_NATURE`, `talent:
   t.talent ?? 0`, moves override. Update `talents.test.ts:71` to « trainers without `talent` get 0 ».
2. Data pass over `src/data/trainers.ts`:
   - every trainer from Route 6 on: one held item on the ace (type booster or berry);
   - all 8 Masters, 3 admins, Buvard, the rival's teams, the Concours and the Great Eraser: natures that fit,
     talent 1 where it is the better one, explicit movesets with coverage, a readable theme:
     Marine rain (`pluie` setter + a water ace), Zélie speed, Ambre sun, Célestine status + Fairy, Basile
     seeds/drain, Nocturne status stall (toxic + protect + rest); Great Eraser: all five `fairCopy: 'dark'`
     ready, with `bouclier-papier` and `substitute` on the ace;
   - Act 4 admins and the finale rival to 6 Bestioles (he already has 6; Rature/Blanche/Buvard 5 → 6).
3. Sims: `npm run curve` unaffected (levels only). `npm run balance -- normal` and `-- hard`: tune levels
   down by 1–2 where a boss falls under 65 % on Normal. Record the table in `docs/story.md`.
4. Tests: `trainers.test.ts` (new or existing): every `moves` id exists and is in the species' learnset or
   stencils; `nature` exists; `item` is `kind: 'hold' | 'berry'`.

### 2.3 Missing move kinds and boss signatures (L)

**Today.** `MoveEffect` union (schema.ts:19-54, 20 kinds). `Volatile` (battle.ts:16-41),
`SideState.guard` (Varnish, whole side), `changeStage` (:422), `switchIn(st, side, to, out)` (:439),
`onEntry` (:459), `useMove` (:559), `applyStatusMove` (:782), end-of-turn block (:1161-1264),
`checkFaints` auto-sends the next alive (:1053). `plan()` (:1275), sort at :1145. `Recipe` (fx/core.ts:62),
`MOVE_FX` (recipes.ts:20), `describe` (messages.ts:26), `eventFx` (events.ts:40).

**New effects** (each: schema variant, engine, event(s), message, recipe, AI score, 2–3 moves, docs):
1. `{ kind: 'hazard'; hazard: 'pointes' | 'colle' }` (Spikes-like damage on entry 1/8; sticky glue −1 Speed
   on entry). State: `SideState.hazards: { pointes: number; colle: boolean }`; applied in `switchIn` after
   `onEntry` for the side that enters (grounded only for `pointes`: not `vol` type / `invuln`). Events
   `hazardSet{side,hazard}`, `hazardHurt{side,hazard,amount}`. Cleared by a new `{ kind: 'sweep' }` on
   a Normal status move (« Coup de Balai »). Moves: « Épingles » (Bug/Poison, Nocturne), « Colle Forte »
   (Normal).
2. `{ kind: 'screen'; screen: 'phys' | 'spec'; turns: 5 }`: `SideState.screens: { phys: number; spec:
   number }`, halve damage in `computeDamage` by category (add a `defSide.screens` check next to the
   weather multipliers, battle.ts:523), tick down at end of turn next to `guard--`. Events `screenUp`,
   `screenDown`. Moves: « Calque Protecteur » (Psy, phys), « Vitrail » (Fairy, spec).
3. `{ kind: 'pivot' }`: after the hit lands and the user is alive, `st.needSwitch`-like prompt for the user:
   for side 0 set `needSwitch = true` with a new `st.pivot: Side | null` so `blocked()` waits for a
   `replace`; for side 1 the AI picks the best matchup (reuse 2.1's matchup score) and `switchIn` at once.
   Event `pivot{side}`. Moves: « Demi-Tour Crayonné » (Bug), « Éclaboussure Fuyante » (Water).
4. `{ kind: 'roar' }`: force the foe to a random alive teammate (`switchIn` with a random index), fails on
   a wild foe (ends the battle? No: fails, « Ça n’a aucun effet » on wild) and on the last Bestiole. Priority
   −6 via `MoveDef.priority`. Event `dragged{side,idx}`. Move « Grand Cri ».
5. `{ kind: 'taunt'; turns: 3 }`: `Volatile.taunt: number`; `usableSlots(m, vol)` excludes status moves
   while `taunt > 0`; event `taunted`. Move « Gribouillis Moqueur » (Dark).
6. `{ kind: 'encore' }` optional; skip if time is short.

**Also**: add `poing-etincelle` and `poing-givre` to two learnsets each (data). Give the new moves to bosses
(2.2's movesets) and to 8–10 species' learnsets at sensible levels; 2–3 new stencils in `items.ts`.

**AI**: hazard +40 if none set and foe has ≥ 2 alive; screen +35 when `foeBest` of that category is high;
pivot scored as a damaging move +20 when the matchup is bad; roar +30 when the foe is set up (`stages`
sum ≥ 2); taunt +30 when the foe's last move was status.

**Tests**: `mechanics.test.ts`: each effect (damage on entry, screen halving, pivot prompts/blocks, roar
fails on wild and last, taunt blocks status); `recipes.test.ts` passes; messages typecheck; AI-vs-AI ends.
`docs/content.md` moves section lists the new kinds. Phone check of the new recipes in a battle demo page
(`tools/demo/make.ts` has battle demos sharing one module).

### 2.4 Breeding that matters, and a tower worth climbing (M)

**Today.** `makeEgg(a, b, st)` (daycare.ts:38): `createMon(familyRoot, 5)`, 3 random IVs, nature by
`pierre-immuable`, hidden talent 50 %; moves never inherited. `towerFoe(streak, st)` (postgame.ts:130)
draws 3 random species from `TOWER_POOL`; `TOWER_STOCK` (:175); rewards stop at streak 21
(`progress.ts` `tour` track).

**Changes.**
1. Egg moves: `SpeciesDef.eggMoves?: string[]` (schema.ts) on first forms, 2–4 each for ~40 lines (data).
   `makeEgg`: `inherited = parents' moves ∩ root.eggMoves`; put them in the egg's `moves` replacing the
   weakest level-ups (max 4). New held item « Ruban Rouge » (`hold: 'ribbon'`): a parent holding it passes
   5 IVs instead of 3. `canHold` unchanged. Daycare lady (`src/story/daycare.ts`) explains both once
   (flag `pension:tip`).
2. Tower archetypes: `TOWER_TEAMS: { name: LText; species: string[]; items; moves? }[]` (6–8 themed teams:
   rain, sun, stall, glass cannon, bulky, status) chosen from round 2 with 50 % chance, else random as
   today; the foe's class line names the theme (« Aquarelliste Juliette, équipe Pluie »). Streak rewards
   continue: `progress.ts` `tour` steps at 28, 35, 49 (`ruban-rouge`, `crayon-magique-glace`, a `sucette`
   pack); `TOWER_STOCK` adds `ruban-rouge: 24`.
3. Tests: `daycare.test.ts`: inheritance deterministic by seed; eggMoves ids exist and are learnable by that
   family; `postgame.test.ts`: every `TOWER_TEAMS` species in `TOWER_POOL`.

---

## Axis 3. After the credits, and again

### 3.1 A Concours and Masters that grow (M)

**Today.** `CONCOURS: ConcoursStage[]` fixed (postgame.ts:27-80); `concoursBattle(n)`
(story/postgame.ts:37) → `partyOf(st.trainer.party, newSeed())`; wins = `save.hallOfFame.length`;
`gc5` pushes `hallEntry`. Master rematch `rematch(id, actor)` (controller.ts:969-988): `+12` levels,
`trainerParty(strong, newSeed())`, flag `rematch:<id>`, no limit. `rematchParty(t, step, level)` and
`REMATCH_LEVEL` (trainers.ts:72-86) scale route trainers to the player's `teamLevel`.

**Changes.**
1. `postgame.ts`: `concoursStage(n, wins): ConcoursStage` built from a per-Master `ConcoursPlan`:
   ```ts
   interface ConcoursPlan { base: TrainerMon[]; sixth: TrainerMon; variants: TrainerMon[][] /* 2 alt teams */ }
   ```
   - levels: `base level + 2 * min(wins, 8)` (cap L70 Normal; `partyOf` adds the difficulty shift);
   - from `wins ≥ 2` append `sixth`; from `wins ≥ 1` natures and talents from 2.2's fields; from `wins ≥ 3`
     pick `variants[wins % 2]` instead of `base`;
   - the Prof (stage 5) gets his ace as a fair copy already (`fairCopy: true`), from `wins ≥ 4` his team is
     the player's own Hall of Fame team species mirrored (« j’ai dessiné les tiennes ») built with
     `createMon` from `hallOfFame[0].team` at the stage level: a memorable twist that costs little.
   - `concoursBattle(n)` reads `const wins = s().hallOfFame?.length ?? 0` and uses `concoursStage(n, wins)`;
     `HallEntry` gains `round?: number` (= wins + 1), shown by `HallView`.
   - `progress.ts` `concours` steps: 1, 3, 5, 10 (`biscuits(3)`), 20 (`sucette-magique` ×10).
2. Master rematches: `masterRematchParty(t: TrainerDef, times: number, level: number): TrainerMon[]`:
   - start from the team of 2.2 (with items/natures), grow every member with `grownForm(species, lvl)`;
   - add to 6 by drawing from `MASTER_POOL[t.id]` (3 species each, data) ;
   - levels: `max(45, level + 2) + 2 * min(times, 5)` for the ace, teammates −1/−2, cap L75;
   - `rematch()` uses it with `times = flag('rematch:<id>:n')`, sets `rematch:<id>:n` += 1 and keeps
     `rematch:<id>` (Town Map and `rematchesWon` unchanged); money `tdef.money * (2 + times)` capped ×6;
     daily gate like route trainers: `re:<id>` = `localDay()` (one rematch a day per Master; say so in his
     refusal line « reviens demain »).
3. Tests: `postgame.test.ts`: `concoursStage` monotonic in wins, 6 members from win 2, never above the cap,
   variants valid species; `masterRematchParty` returns 6 valid grown species and respects the cap; the
   `curve` test is untouched (postgame). Sims: add `CONCOURS_WINS=n` env to `tools/balance.ts` rows
   `gc1..gc5` and check wins 0, 3, 8 against a L60/L66/L75 team of 6.
4. Docs: `docs/story.md` postgame section; `histoire.md` « le Concours grandit avec vous ».

### 3.2 The rival and the Great Eraser after the ending: « La page d’après » (L)

**Goal.** A short epilogue arc (3–4 scenes, one new small map) that ends with a repeatable Great Eraser
rematch. Spoiler-free in `histoire.md` (« une dernière page s’ouvre après l’histoire »).

**Today.** `finalBoss` (finale.ts:73-93): `reveal(boss)`, `lastAnswer()`, `trainerBattle('effaceur',
undefined, unmasked())`; `effaceur` trainer (trainers.ts:852: 5 Bestioles L39–42, `fairCopy: 'dark'`,
`grey: true`); `bordPage` map (dream.ts:82-154): `effaceur` NPC `hideIf: 'tr:effaceur'`, `coconBord`
for legacy saves, patches on `couleurs:bord` (after 4 Master rematches, `BORD_REMATCHES`). `unmasked()`
builds the boss's look from `doubtLook(playerLook())`. `galerie` map (galerie.ts:13-62) 22×18 with free
space on the east side; `eraseOut`/`sketchIn` in `scene.ts`; planches in `src/story/planches.ts`.

**Changes.**
1. Trigger: flags `champion` and `couleurs:bord` (so the player has done the Concours once and 4 Master
   rematches). `arrivals` entry in a new `src/story/epilogue.ts` (imported before `coconfus.ts` in
   `src/story/index.ts`): on `galerie` with those flags and `!flag('ep:1')`, the doubt (the player's own
   greyed look, `doubtLook`, no cap, `gang: undefined`) is **sketched in** (`sketchIn`, the magic exception
   allowed by CLAUDE.md) by the fresque and asks for help: a page at the Bord won't finish (`ep:1`). This
   is the only arrival besides the Guides; it runs on `galerie` where no Guide ever comes (Guides' `map`
   values are story maps), so no collision.
2. New map `margeBlanche` (`src/data/maps/dream.ts`, 16×12, `backdrop: 'sketch'`, `ambient: 'crumbs'`,
   warps from `bordPage` top-right once `ep:1`, patch `epWay`): a half-erased page with 3 fresque-like
   « taches » (interact spots) to **redraw or keep** (one more pair of choice-style answers, `choose('ep',…)`
   reusing `choices.ts`, no effect on `fin`), two wild rows (L55–58, `afterStory` species), one trainer: the
   repentant Captain Buvard (new def `buvardEp`, L58 ×5, the one admin who went to see the fresco).
3. Scene 3: at the page's end the doubt says what it learnt (one line per `choix:ep` answer), then offers to
   « s’entraîner pour de vrai »: the **Great Eraser rematch**, trainer `effaceurEp`: 6 Bestioles L62–66,
   `fairCopy: 'dark'`, items, the 2.3 moves, `look: unmasked()`, music `'final'`, intro `vs: 'boss'`.
   Win → `ep:done`, 20 000, the Sucette pack, and a new Planche: the page finished (reuse `hatched` from
   `src/ui/planche/draw.ts`, a picture of the player's party drawn in). Repeatable weekly via the doubt NPC
   at `margeBlanche` (`re:effaceur` = week), levels +2 per win up to L80.
4. Rival tie-in: from `ep:done`, 1.1's `rivalPostTeam` gets +4 levels and he mentions the doubt.
5. `objective.ts` `POST`: `step('epilogue', 'galerie', L('Une page blanche t’attend, Place des
   Chefs-d’Œuvre.', 'A blank page is waiting at Masterpiece Square.'), ['ep:done'])` after `concours`;
   `progress.ts` `aventure` track gets a 10th step for `ep:done`.
6. Tests: `story.test.ts` covers ids/flags; `maps.test.ts` wild cap vs `buvardEp`; `puzzles.test.ts` if any
   block puzzle is added (keep none). Phone check of the new map and the planche in landscape.
7. Docs: `docs/story.md` new « Épilogue » section with the texts' intent (the theme: the doubt learns to
   help rather than erase); `histoire.md` one spoiler-free paragraph FR/EN.

### 3.3 Something to do every day (S–M)

**Today.** `wakesAtHome` (realLife.ts) false once every activity is at `REAL_MAX`; `ORIGINALS` is 21 ids
(originals.ts); Tombola has no daily anything (`MACHINE_PRICE = 1000`); route rematches daily; Memo daily.

**Changes.**
1. `wakesAtHome`: after all activities are maxed, still wake at home **once a week** (`reel:jour` week) for a
   « journée tranquille »: no levels, Papa shows one original drawing from `ORIGINALS[(week) % 21]` on the
   fridge (`frigo` script already cycles), Maman gives a Goûter. Flag `reel:semaine`.
2. Tombola: the first ticket of the day is half price and the roll gets a +1 rarity step (`machineRoll(seed,
   topLevel, ending, lucky)`); flag `tombola:jour` = `localDay()`; the keeper says it.
3. Tower « Défi du jour »: `towerDesk` offers a second queue with today's rule from
   `DAILY_RULES[localDay() % n]` (`monotype(type of the day)`, `noItems`, `level 30`, `threeSame`): the
   player's copies are filtered/adjusted (`towerCopy` with a `level` arg), rewards ×2 points; flag
   `tour:jour` = day once done. Rule enforcement is inside the tower only (the borrowed copies), no engine
   change: `noItems` = `bag: {}` is already how borrowed fights work; `level 30` = `towerCopy(m, 30)`.
4. Town Map: the second line slot from 1.5 shows « Aujourd’hui : … » (swarm, market, Tombola luck, Défi du
   jour), from `src/data/events.ts` `todayLines(s)`.
5. Tests: `realLife.test.ts` weekly rule; `events.test.ts` `todayLines`.

### 3.4 New Game+ and challenge rules (L)

**Today.** Title: `TitleScreen.tsx` menu Continue/New/Musiques/Settings/Credits; `startNew(n)` → `go({ id:
'newgame' })`; `NewGameScreen.finish()` → `newGame(name, look, g, rival)` (game.ts:313) → `freshSave`
(:292, not exported). `SaveData` v5 (schema.ts). `repair()` idempotent. Difficulty is a pref copied into
the save. Enforcement points: catch persisted in `fight` post-battle `update` (controller.ts:1106-1114);
`throwBall` refuses with `blocked` when `st.noCatch`; XP in `awardXp`/`xpShares` (battle.ts:1015-1041) and
`addXp` (creature.ts:215); bag in battle = `BattleProps.bag` (`{}` for borrowed); Inn heal `scripts.auberge`
(common.ts:51); shop `STOCK`/`onSale` (ShopScreen.tsx); `wildBattle` (controller.ts:1246).

**Changes.**
1. Save v6 (`schema.ts`): 
   ```ts
   /** New Game+: what came over from a finished game (v6). */
   plus?: { from: number; createdAt: number; carriedUid?: string };
   /** Challenge rules picked at new game (v6); absent = none. */
   rules?: { monotype?: TypeId; onePerMap?: boolean; sealedBag?: boolean; levelCap?: boolean; paidInn?: boolean };
   ```
   `SAVE_VERSION = 6`; `migrate` accepts 5; `repair` leaves both undefined; test in `game.test.ts`.
2. Title flow: in the slot picker's `new` mode, an occupied slot with `flags.ending` shows a third choice
   « Nouvelle partie + » besides « Effacer » : `startNew(n, { plusFrom: n })`. Router `{ id: 'newgame';
   plusFrom?: number }`. `NewGameScreen` gets a step `rules` after `rival` (a `MenuList` of toggles with
   « ◀ Retour » / « Suivant » per the ActionBar rule; monotype opens a type picker) shown only when
   `plusFrom` or when the player holds ◀ on the name step? Simpler: always show the rules step with all off
   by default, one line of explanation « Pour corser l’aventure (facultatif) ». `finish()` → `newGame(name,
   look, g, rival, { rules, plus })`.
3. `newGame` carry-over (`game.ts`): read `peekSlot(plusFrom)`; copy `dex.seen/caught`, the `prix:*`
   flags? No (rewards would be re-claimable): copy `dexDiploma`, `pagesReward`, `tower.best`,
   `hallOfFame` (shown greyed as « d’avant »), `atelier` (the custom design), and one Bestiole chosen on a
   `PartyView`-like picker from the old party (`carriedUid`): it comes as an **egg** (`{ ...mon, level: 5,
   xp: xpAt(5), moves: movesAt(species root, 5) + its egg moves, egg: { steps: 300 }, nickname kept,
   ivs kept, shiny kept }`) in the party after the starter is given (set `flags['plus:egg']`, hatched in
   `giveStarter` script by `addMon`). Sparkly: `shinyChance` ×3 when `plus` (realLife.ts `shinyChance(flags)`
   → add `plus` arg from the save). Money 3000 as usual. Difficulty: the owner's current pref.
4. Rules enforcement (each is a small, testable check):
   - `monotype`: `addMon` is not the gate (the starter is forced); gate at **catch**: `fight` passes
     `noCatch: true` when `rules.monotype` and the wild's `typesOf` lacks the type; the ball message
     « Ce Croque-Carnet n’attrape que les Bestioles {type} » via `blocked{reflet: false, rule: 'monotype'}`
     (extend the event). Gifts/trades of the wrong type are refused by the giver with a line (one helper
     `allowedByRules(s, species)` in `src/state/rules.ts`, used by `giveMon`, trades `TRADES`, Tombola).
     The starter picker shows only starters of that type? The three starters are Grass/Fire/Water: monotype
     of another type gets the starter anyway (« ta première Bestiole fait exception »).
   - `onePerMap`: flag `catch:<map>` set when a catch or gift happens on that map (`fight` post-battle
     `update`); `fight` passes `noCatch: true` when the flag is set; the Croque-Carnet says « Tu as déjà
     rempli une page ici ». Legendaries and story gifts exempt (`how !== 'caught'`).
   - `sealedBag`: `fight` passes `bag: {}` (like borrowed) and `BattlePanel` greys the SAC entry with a
     tooltip line; the Croque-Carnet must still work: pass `bag` filtered to `kind === 'ball'`.
   - `levelCap`: cap = ace level of the next Master (`BADGES` order → `TRAINERS[leader].party` max level,
     +0 on Normal; after 8 badges the Great Eraser's ace; after `ending` none). `awardXp`: before `addXp`,
     clamp `amount` so `xpAt(cap + 1) − 1` is not exceeded (engine needs the cap: `BattleSetup.levelCap?:
     number` → `st.levelCap`); `useLollipop` and `daycareStep` respect it too (`rules.ts` `levelCapOf(s)`).
   - `paidInn`: `scripts.auberge` charges `50 × badges + 100` (free the first time, `visitedCenter`), with a
     refusal line when broke; `scripts.bed` at home free.
   - Hall of Fame and trainer card show the active rules as small pencil badges (`sketchIcons.ts` doodles:
     a single colour drop, a page, a sealed bag, a ruler, a coin) and `HallEntry.rules?` is recorded.
5. Tests: `rules.test.ts` (`allowedByRules`, `levelCapOf` per badge count); `pk.test.ts` XP clamp at the
   cap; `game.test.ts` v6 migration and `newGame` carry-over (dex, egg, no prizes copied); story test that
   the giveStarter script hatches the carried egg; `actionBar.test.ts` for the new screen.
6. Phones: the rules step and the slot picker's third button at 360 px / 130 %; landscape.
7. Docs: `docs/content.md` « Règles de défi » and save v6; `histoire.md` « Nouvelle partie + » paragraph.

---

## Recommended order (each a separate milestone, with its own commit and deploy check)

| # | Milestone | Effort | Why here |
|---|---|---|---|
| 1 | 2.1 Trainers who think | M | Fastest felt gain; makes Hard honest; everything later leans on the matchup score. |
| 2 | 3.1 Concours and Masters that grow | M | The postgame stops being one evening. |
| 3 | 1.1 The rival's arc | M | Needs 3.1's `wins`; the one character everyone remembers. |
| 4 | 1.2 Townsfolk with a day | M | Data-heavy, engine-light; the world starts breathing. |
| 5 | 2.2 Teams with a plan | M | Needs 2.1 for the sims to mean anything; prepares 2.3 and 3.1 variants. |
| 6 | 1.4 Music for each moment | M | Independent; can run in parallel with 5 (different files). |
| 7 | 2.3 Missing move kinds, boss signatures | L | Engine work; gives 3.2's boss his tools. |
| 8 | 3.2 La page d’après | L | Needs 3.1 (flags), 2.3 (moves), 1.1 (rival tie-in). |
| 9 | 1.3 Weather | L | Independent; the biggest perf risk, so after the content lands. |
| 10 | 3.4 New Game+ and rules | L | Save v6 last among the big ones, once the content it carries is final. |
| 11 | 1.5 Calendar, then 3.3 Something every day | M + S | Share `src/data/events.ts`; data-heavy, low risk. |
| 12 | 2.4 Egg moves and tower archetypes | M | Depth for the long tail. |

Independent pairs that could be worked at the same time in separate sessions (no shared files): 1.4 with
2.2; 1.2 with 2.1; 1.3 with 3.4.

## Verification, per milestone

- `npm test`, `npm run typecheck`; new tests named above beside the data they check.
- `npm run balance -- normal` (and `-- hard`) and `npm run curve` whenever teams, AI, moves or levels move;
  paste the table into `docs/story.md`'s level-curve section with the date.
- Headless playtest (`docs/testing.md`) at 360×740 and 412×870 at 100 % and 130 %, and 740×360, for each
  new screen, map or planche; `--mute-audio`.
- Demo page (`npm run demo`) or Artifact for the owner at each milestone; `docs/histoire.md` FR + EN in the
  same commit; after pushing, check https://mickaelvanhoutte.github.io/pokemol/ is live with the change.
