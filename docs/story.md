# Story, region and progression

## The frame

The player *is* the little artist (girl or boy, picked in the prologue). They fall asleep on the
sketchbook and dream of **Papeterre** (EN *Papeterra*), a region drawn on a giant sheet of paper,
where every drawing is alive.

- **Prof. Fusain** (*Prof. Charcoal*) photographs every Bestiole "so none ever gets lost". At the end
  he turns out to be **Papa**, who photographs the real drawings for the same reason.
- **Team Gomme** (*Team Eraser*) rubs out the scenery, leaving blank paper (`erased` tiles, `patches`).
  They also grey out Bestioles to control them: Team Gomme trainers have `grey: true`, and their
  Bestioles get their colour back when beaten.
  - Admins: **Rature** (*Smudge*) and **Blanche** (*Whiteout*); grunts: "Sbire Gomme".
  - Boss: **le Grand Effaceur** (*the Great Eraser*), the little voice that says "your drawings
    aren't good enough".
- The **rival** is named by the player (presets Feutre / Crayon / Pinceau, EN Marker / Crayon / Brush;
  `{rival}` in texts). He picks the starter strong against yours (`RIVAL_COUNTER`). He is cocky in
  Act 1 and becomes an ally in Act 3.
- **Clues along the way**: the Prof's camera and catch-phrase, a slip where he says "ma puce", a
  notebook-line sky and map margins, and NPCs mentioning crayons. There are also 12 torn sketchbook
  pages (key items `page-1`…`page-12`, texts in `src/data/pages.ts`), each a memory of the real world.
- **Ending**: the player answers the Great Eraser "Mes dessins sont beaux parce que ce sont les
  miens !", beats him, and the page turns white. The player wakes up in the real bedroom (`chambre`):
  Papa took photos of the new drawings "comme ça, ils ne se perdront jamais". Credits follow, then
  "the next night" the player goes back to the dream for the post-game.

Speaker names live in `src/story/cast.ts`; Papa, the Great Eraser and the leaders are defined where
they are used.

## Region path

| # | Maps (ids) | What happens | Flags set |
|---|---|---|---|
| 0 | `NewGameScreen` | Night lines, the Prof's speech, girl/boy, avatar, name and rival name | — |
| 1 | `maison`, `maisonRival`, `bourg` (Bourg-Gribouille), `labo` | Wake up; starter at the lab (camera clue); tutorial battle against the rival (friendly, coached) | `intro`, `rivalStarter`, `rival1` |
| 2 | `route1` (Chemin des Crayons) | A grunt erases a patch of grass (`r1Erased`); first trainers; wild L2–4 | `a1.r1seen` |
| 3 | `ville` (Ville-Pastel), `atelierPastel` | 🏅 **Mireille**, Insect | `badge:pastel` |
| 4 | `route2` (Route des Craies), `bois` (Bois Brumeux) | West gate opens with the badge. Two grunts erase the woods; beating the second runs `boisRestore` | `a1.bois` |
| 5 | `plume` (Village-Plume), `atelierPlume` | 🏅 **Gaspard**, Normal. The bridge east is erased, so the player goes through the cave | `badge:plume` |
| 6 | `grotte1`, `grotte2` (Grotte Gribouillis) | Cave trainers and the optional strong `gardien`; exits to the port | — |
| 7 | `route3`, `port` (Port-Aquarelle), `atelierAquarelle`, `tombola` | 🏅 **Marine**, Water (`marineAfter` restores the bridge). Fair with the **Tombola** side quest (golden ticket hidden on Route 4) | `badge:aquarelle`, `a2.bridge`, `a2.tombola` |
| 8 | `route4`, `feutre` (Ville-Feutre), `entrepot1`/`entrepot2`, `atelierFluo` | The city is drained of colour (`tintUnless: 'a2.feutre'`). Admin Rature in the warehouse; `feutreRestore`. 🏅 **Zélie**, Electric | `a2.feutre`, `badge:fluo` |
| 9 | `montFusain1`/`2`, `braise` (Village-Braise), `atelierBraise` | 🏅 **Ambre**, Fire | `badge:braise` |
| 10 | `route6`, `paillette` (Bourg-Paillette), `atelierPaillette` | 🏅 **Célestine**, Fairy | `badge:paillette` |
| 11 | `tour1`–`tour3` (Tour Brumeuse) | Team Gomme holds it. The rival heals your team; Admin Blanche at the top | `a3.tour` |
| 12 | `route7`, `gouache` (Jardin-Gouache), `atelierGouache` | 🏅 **Basile**, Grass | `badge:gouache` |
| 13 | `route8`, `encre` (Cité-Encre) | The Atelier is locked: Nocturne’s note (`atelierEncreDoor`) sends you back south | `a3.note` |
| 13b | `port` → ferry (`passeur`) → `phareIle`, `phare1`–`phare3` (Phare de l’Encrier) | Grunts, a block-and-plate room (2F), **Captain Buvard** at the lantern; Nocturne gets her Midnight Ink back (`phareEnd`) | `a3.phare` |
| 13c | `encre`, `atelierEncre`, `usine1`–`usine3` | 🏅 **Nocturne**, Ghost. Then the Eraser Factory: Rature and Blanche again; the Great Eraser escapes | `badge:encre`, `a3.usine` |
| 14 | `routeBlanche`, `bordPage` (Le Bord de la Page) | Half-drawn world: final rival battle, then the Great Eraser with the choice | `tr:rivalFinal`, `tr:effaceur` |
| 15 | `chambre` | The real bedroom, Papa, the drawings on the desk, credits | `ending` |

**Detours of the late game.** Besides the lighthouse trip (the story's back-and-forth from Cité-Encre
down to Port-Aquarelle and its island), two optional places break the straight line north:
- **Piste Cyclable** (`piste`): a long downhill bike road from Jardin-Gouache (east exit) to Ville-Feutre
  (east exit), with cyclists, grass and items. The Pencil Bike is required (`pisteBike`), and its gate
  at the Gouache end only opens from the Gouache side (`pisteGate`, flag `piste.open`), so it is a
  shortcut back south, never a way to skip ahead.
- **Grotte des Échos** (`grotteEchos`, door on Route 8): two boulders (Strong Gloves) fill the two
  pits of the passage; at the back, a red-eyed shadow is **Ombrouille** L45, met once
  (`echoShadow`, flag `static:ombrouille` when caught or beaten). It no longer appears in the
  Misty Tower.

**Running shoes.** Heading north out of Bourg-Gribouille after the lab (`momShoes`, trigger at the
town's exit), Mom runs out of the house with the Zip Sneakers (key item `baskets`, flag `shoes`).
Holding B runs only once you own them. Older saves already past Bourg get them in `repair()`.

**Touffou** (EN Fuzzkit, Eevee-like). Capucine in Ville-Pastel gives one at L8 (`touffouGift`, flag
`gift:touffou`); it is also a rare wild find on Route 6. It evolves with a magic pencil used from the
bag: Water → **Touflot** (Fluffin), Fire → **Toufeu** (Flufflame), Lightning → **Toufoudre**
(Fluffbolt). The three pencils are sold in shops from 4 badges, and Capucine gives one of the
player's choice once they have 4 badges (`gift:crayonMagique`). The new form learns a move of its
type on the spot (learnset level 0). Marine's and Ambre's Grand Concours teams use Touflot and
Toufeu, and all three are in the battle tower pool.

**Field tools** (key items, each given once by someone, `src/story/field.ts`):

| Tool | Giver | Condition |
|---|---|---|
| Safety Scissors | Gardener, Ville-Pastel | badge 1 |
| Old Rod | Fisher, Village-Plume | — |
| Paper Boat | Paper Folder, Port-Aquarelle | badge 3 |
| Good Rod | Fisher, Port-Aquarelle | — |
| Pencil Bike | Bike maker, Ville-Feutre | `a2.feutre` |
| Foam Mallet | Miner, Mont Fusain | — |
| Strong Gloves | Smith, Village-Braise | badge 5 |
| Super Rod | Fisher, Jardin-Gouache | — |

**Pension Crayonnée** (Pencil Day Care, `pension` map, house on Route 2, `src/story/daycare.ts`,
rules in `src/state/daycare.ts`): Mamie Pension keeps up to 2 Bestioles in `save.daycare`. They
gain 1 XP per step (level-up moves replace the oldest one) and cost 100 ₽ + 100 ₽ per level gained
to take back. Two of the same evolution family (`familyRoot`) have a 50% chance every 256 steps to
leave an egg (`daycare.egg`), collected from her: the base form at L5, 3 IVs from the parents, the
nature of a parent holding the Pierre Immuable (Everstone, pickup in the Pension), the hidden
talent half the time if a parent has it. An egg is a `Mon` with `egg.steps` (600–1200): it can't
fight (`partyAlive`, battles and the repel ignore it), counts down per step in the party and
hatches in `HatchView` with the nickname prompt.

They open optional pockets with the new stencils: Route 2 garden, Scribble Cave nook, Port islets
(by boat), Mont Fusain boulder, Route 6, Route 7 and Route 8.

**Fast travel.** `visitTown` (each town's `onEnter`) sets `visit:<map>`. The Pencil Balloon pilot in the
Inn flies to visited towns (the list and landing tiles are the `fly` entries of `WORLD` in
`src/data/worldmap.ts`).

**Town Map.** Mom gives the Carte de Papeterre with her first lines (`bag.carte`; old saves get it on
load). START > CARTE shows the region drawn from `WORLD` (`src/data/worldmap.ts`), the player's place
(`playerSpot`, through `regionOf` for interiors and dungeons) and a star on the next objective.
Objectives are the ordered steps of `src/story/objective.ts`: the first one whose flags aren't all set
is shown, from talking to Mom to the Great Eraser, then the post-game (Bestiodex, pages, rematches,
`rematch:<trainerId>` set on a rematch win). A story step means a new entry there; the story test
checks every step's flags are set somewhere and its target is on the map.

**Living world** (`src/story/world.ts`).
- *Day and night* follow the device's clock (day 7–19 h, evening 19–21 h, night). Outdoors get a
  warm or blue tint (`TIME_TINT` in the controller, multiplied). Sleeping heals the party and turns
  the clock to 22 h (from day or evening) or to 8 h (at night): the bed at home, the Inn's beds and
  the innkeeper's « Dormir » (`sleepUntil` in `src/story/common.ts`). Healing Centers are Inns
  (Auberges): the innkeeper's « Se reposer » heals without changing the time. At night: Lunelle on Routes 1, 2 and 6, Brumouille on
  Route 1 and more often in the Misty Woods, Grimouille on Route 6; Piafou only comes out by day.
  The trainer card shows the time.
- *Trades*, one per town (`TRADES`): Hugo in Ville-Pastel (Chenillou → Piafou « Plumette »), Yves in
  Port-Aquarelle (Zigzou → Clapotin « Bouée »), Nina in Ville-Feutre (Lunelle → Touffou « Frisette »),
  Paul in Village-Braise (Brumouille → Braisou « Étincelle »), Maëlle in Bourg-Paillette
  (Chantouille → Minousse « Brindille »). Between them, every starter. Traded Bestioles keep their
  first trainer (`ot`), show « Échangé » in their summary, and the Calligrapher won't rename them.
- *Favours*:
  - Margaux (Port-Aquarelle) lost her Lunelle Lulu on Route 3: Lulu hides behind the rocks
    (an NPC drawn as her mini); bring the news back for a Greedy Bell and 2 Golden Berries, and Lulu
    is then home next to Margaux.
  - Théo (Ville-Feutre) has never seen a Fire Bestiole: show him one for a Fierce Marble.
  - Rosalie (Jardin-Gouache) wants a Bestiole at 220+ friendship: a Snack and a Prism Berry.
  - Mamie Encre (Cité-Encre) sends a letter to her brother Papi Plume (Village-Plume): he gives
    5 Super Crayon-balls and a reply; bringing it back gives a Spiky Helmet.
- *Route rematches*: once beaten, route trainers want a rematch the next day (a ♪ bubble), with
  their team raised to `REMATCH_LEVEL[badges]` (L7 with no badge up to L47 after the ending). Prize
  as usual.
- *The following Bestiole* has lines for each place and for its friendship, and once a day it may
  find an item.

**Post-game** (`ending` set):
- the Prof rewards the 12 pages (`pagesReward`) and a complete Bestiodex (`dexDiploma`);
- Atelier Masters offer rematches at +12 levels;
- Mom has new lines;
- a path opens at the top of the Edge of the Page (`bordPage` patch) to **Masterpiece Square**
  (`galerie`, `src/data/maps/galerie.ts`, a balloon stop once visited), with an Inn and a shop.

**Grand Concours** (`concours` hall, scripts in `src/story/postgame.ts`, teams in
`src/data/postgame.ts` `CONCOURS`): the door script (`concoursDoor`) clears `gc:1`…`gc:4` and warps
in. Four Grandes Maîtresses (Marine, Ambre, Célestine, Nocturne at L45–48) stand in doorways and step
aside once beaten (`gc:<n>`, NPC `hideIf`), then Prof. Fusain (6 Bestioles, L47–50). No healing in
between, the bag is allowed; a loss is a normal blackout and the next attempt starts over. Winning
sets `champion`, appends a `save.hallOfFame` entry (`hallEntry`: species, nickname, level, sparkle)
and shows the Hall of Fame (`HallView`, screen `hall`); the Hall Keeper on the square shows it again.
`npm run balance` has rows for each fight with a level 50 team.

**Tour des Défis** (`tourDefis` lobby, `tourSalle` battle room): pick 3 party Bestioles; they fight
as level 50 copies (`towerCopy`, `fight({ borrowed })`: nothing is written back, no bag, no prize,
no blackout). Opponents come from `towerFoe(streak)`: 3 different species from `TOWER_POOL` (the
legendary from round 3), IVs, held items and stencil moves growing each round of 7. `save.tower`
keeps `streak`, `best` and `points` (1 per win, a bonus at the end of a round); the streak survives
breaks and ends on a loss. Points buy `TOWER_STOCK` items (and missing stencils) at the Exchange
(`ShopScreen` with `tower`). The trainer card shows a gold star each for the Concours, the
Bestiodex diploma, the 12 pages and a tower streak of 21.

These work by wrapping the Act 1 scripts: `const prev = scripts.prof; scripts.prof = …`. That is why
`src/story/index.ts` imports the acts in order.

**Puzzles and mini-games** (rules in [content.md](content.md#puzzles)). Story puzzles never need
the optional Strong Gloves; every puzzle room sits next to its stairs or door, and leaving and
coming back resets it (a mechanism once triggered stays open).

| Where | Puzzle | Needed? |
|---|---|---|
| Scribble Cave depths (`grotte2`) | Fresque of Clapotin by the exit: a secret room (Loupe, Super Crayon-balls) | optional |
| Eraser Warehouse 1F (`entrepot1`) | Crayon barriers: the south switch opens the red gate, the north one the blue line to the stairs | story (Act 2) |
| Mount Charcoal crater (`montFusain2`) | Two boulders (gloves) into two holes; they land on the plates of the vault in `montFusain1` (Bille Ardente, Golden Berries) | optional |
| Mount Charcoal crater | Fresque of Braisou by the exit: a secret room (Painter’s Apron, Super Potions) | optional |
| Misty Tower 2F (`tour2`) | Glossy paper hall: 4 slides from the 1F stairs to the top stairs; a hole drops you back to 1F | story (Act 3) |
| Misty Tower top (`tour3`) | Fresque of Grimouille: lifts the gate of an alcove (Stubborn Specs) | optional |
| Eraser Factory 2F (`usine2`) | Two eraser blocks on two plates raise the shutter to the stairs; a third block down the hole opens the 1F storeroom (Stubborn Scarf, Super Potions) | shutter: story; storeroom: optional |
| Masterpiece Square (`galerie`) | 4×4 fresque of Ombrouille on an easel (Stubborn Band) | post-game |
| Fair tent, Port-Aquarelle (`tombola`) | Mémo-Bestioles: 6 pairs, a prize a day by tries (≤10 gold, ≤14 silver) | optional |

Completing the four fresques (`fresqueDone`) gives 10 Super Crayon-balls and 3 Prism Berries
(`fresquesReward`).

**Page locations**: pages 1–2 in `home.ts`, 3–4 in `pastel.ts`, 5 in `plume.ts`, 6 in `aquarelle.ts`,
7–8 in `paillette.ts`, 9 in `dungeons.ts`, 10 in `gouache.ts`, 11 in `encre.ts`, 12 in `dream.ts`.
All are `hidden: true` pickups, found by pressing A in front of them (`pageFound` counts them).

**Older badges.** `LEGACY_BADGES` in `src/data/badges.ts` keeps two badge ids from the previous
version (`grotte`, `tour`) so old saves still display them.

## Level curve and difficulty

Trainer levels in `src/data/trainers.ts` are the **Normal** difficulty. Approximate team levels:

| Stage | Trainers | Leader |
|---|---|---|
| Route 1 | Iris L4 (1 Bestiole), Léo L3/L4 | — |
| Atelier Pastel | L5–6 | Mireille L7/L9 (Chrysalou, Papivole) |
| Route 2, Bois Brumeux | L7–11 | — |
| Atelier Plume | L11 | Gaspard L10/L10 |
| Cave, Route 3, Atelier Aquarelle | L10–16 (optional Gardien L14–15) | Marine L16–19 |
| Route 4, Ville-Feutre | L17–21 | Rature L18–20, Zélie L22–24 |
| Mont Fusain, Braise | L22–24 | Ambre L23–24 |
| Paillette, Tour | L27–31 | Célestine L31–34, Blanche L30–31 (×4) |
| Gouache, Encre, Factory | L31–38 | Basile L35–38 (Bouquétigre ace), Nocturne L35–38 |
| Finale | — | Rival L40–43 (6), Great Eraser L39–41 (5) |

Run `npm run balance` for the current numbers instead of trusting this table.

**The owner's request (Oct 2026):** the first battles must let players learn the mechanics.
- The first trainers have one or two low-level Bestioles; the starter alone should win Act 1 route
  battles.
- Leaders should be beatable once the player has one teammate.
- Insect moves come late on purpose: Chenillou only knows Bump and Silk Thread, and Papivole gets
  its powders from L12. The bug line is Chenillou → Chrysalou (L7) → Papivole (L10, learns
  Wing Gust as it evolves). Gaspard is
  the only Act 1 trainer with a Ronflon (it is still a rare wild find on Route 1).
- Fairy Bestioles on Route 1 resist Mireille's insects; the Atelier guide NPC says so.

**Difficulty** is a per-device pref (`prefs.difficulty`, Options row DIFFICULTÉ). `DIFFICULTY` in
`src/data/trainers.ts` sets:

| | Levels | Trainer IVs | AI |
|---|---|---|---|
| Easy | −15% (at least −1) | 6 | Random move 35% of the time (`aiChoose` `slip`) |
| Normal | as written | 12 | Best move |
| Hard | +10% | 20 | Best move |

Every trainer team goes through `partyOf`, including rematches and the final rival. The lab tutorial
passes `'normal'` explicitly.

**Act 2 ramp (Oct 2026).** Act 2 was lowered so it continues Act 1 without a jump. Route trainers sit
2–4 levels below the expected starter level, and each leader's ace matches it. Mont Fusain and Ambre
barely moved, so Act 3 (from Route 6, L27) is unchanged.
- Each starter is also a rare wild find (weight 3–4): Minousse in the Bois Brumeux (L8–10), Clapotin
  on Route 3 (L14–16), Braisou on Mont Fusain (L20–22). Every team can find a type counter (Minousse
  against Ambre needs one), and the Bestiodex can be completed without Tombola luck.
- Still tough on Normal: Camper Tom (three starters) for Braisou, and Ambre for a Minousse team
  without a Water or Fire Bestiole.

**Starter evolutions (Oct 2026).** Minousse becomes Minoufleur and Braisou becomes Braisaure at
L16 (Grass and Fire, about 410 base stats, learning Nibble and Ember Swirl as they evolve; Braisaure
gets Dragon Claw at L44). Clapotin has no evolution yet. `grownForm(id, level)` gives the form a
level has reached: the balance sim uses it for the player's starter, and the final rival's starter
(L43) is evolved with it. Hand-written teams use the new forms from L24: Forgeronne Inès, Ambre's
ace (L24, berry), Jardinière Rosa, both of Basile's, Cycliste Bastien and Prof. Fusain at the Grand
Concours. Grande Maîtresse Ambre keeps her Braisou: an evolved ace there dropped the Grass and Water
teams from about 75% to 40%.

**Starter finals and brouillons (Oct 2026).** Clapotin → Clapoflot (L16) → Tortorrent (L32), Minoufleur →
Bouquétigre (Grass/Poison, L32), Braisaure → Dragobraise (Fire/Flying, L32): about 410 then 500 base stats.
These four are *brouillons* (`draft: true`), drawn in code by `tools/drafts` until the little artist draws
them; the Bestiodex stamps them BROUILLON and the credits list them apart. Teams from L32 use the finals
(Rosa, Basile's ace, Bastien, the final rival through `grownForm`, Prof. Fusain at L45 so the Concours
finale stays around 50–75% on Normal). The finals made Nocturne and the Great Eraser a bit easier
(Normal: about 94% and 60–75%).

**Ten more brouillons (Oct 2026)**, after the gen-1 ideas, to fill the missing types and evolutions:
- Piaflèche (Normal/Flying, Piafou at L18);
- Zigzéclair (Electric, Zigzou with the Electric Magic Pencil);
- Lunéclat (Fairy, Lunelle at 220 friendship);
- Boxouille (Fighting: Grotte Gribouillis depths, Mont Fusain, Grotte des Échos);
- Cailloutou (Rock/Ground: both cave floors, Mont Fusain, Grotte des Échos);
- Taupinou (Ground: Route 3, the cave entrance);
- Givrinou (Ice/Water: surfing at Port-Aquarelle and Inkwell Isle);
- Sifflasse (Poison: Route 4);
- Dragounet (Dragon: Super Rod at Port-Aquarelle and Inkwell Isle);
- Boulonnet (Electric/Steel: Route 4).

New moves: Balayette, Gros poing, Tête de fer, Tremblement, Crochet venin, Crocs givrés.

Trainers using them:
- Mineur Bob (Cailloutou), Gamin Tim and Électricienne Volta (Boulonnet);
- Mont Fusain's Olga (Boxouille) and Rémi (Cailloutou);
- Team Gomme's Sifflasse (Route 4 grunt, Admin Blanche) and Buvard's Givrinou;
- Célestine's ace (Lunéclat) and Cycliste Léa (Zigzéclair);
- Piaflèche for trainers from L27.

Zélie keeps her old team: with Boulonnet or Zigzéclair, Water and Grass teams fell to 1–10%. Spéléo Max keeps his too: any rock or ground there dropped Fire teams to 40%.

**Fifteen more brouillons (Oct 2026), 50 Bestioles in all.** They finish the gen-1 style lines:
- Piaflèche → Piafurie (L36);
- Boxouille → Musclouille (L28) → Quadripoing (L40);
- Cailloutou → Rocailloux (L25) → Montagnoc (L38);
- Taupinou → Taupitrio (L26);
- Givrinou → Banquisette (L34);
- Sifflasse → Cobrasse (L30);
- Dragounet → Dragondine (L30) → Dragopataud (Dragon/Flying, L45);
- Boulonnet → Triboulon (L30);
- Chantouille → Chantouffe (friendship 220).

Three never evolve: Ciseaumante (Bug/Flying, Route 7, new move Coup de ciseaux), Poupochette
(Normal, Route 6) and Ptérocaille (Rock/Flying, Grotte des Échos).

Where to meet the middle forms:
- the Grotte des Échos: Musclouille, Rocailloux, Taupitrio;
- Route 8: Cobrasse, and Piafurie by day;
- the Piste Cyclable: Triboulon;
- around Inkwell Isle: Banquisette surfing, Dragondine on the Super Rod.

Trainers using them:
- Admin Blanche (Cobrasse, both fights) and the Factory grunts (Cobrasse, Triboulon);
- Captain Buvard (Banquisette) and Admin Rature's second fight (Piafurie);
- Randonneur Jules (Rocailloux) and Cycliste Inès (Chantouffe).

These Team Gomme fights went from about 55–97% to 53–92% on Normal.

**Held items on trainers.** From badge 4, a few leaders' aces hold a berry (Zélie, Ambre, Célestine,
Basile), and the Great Eraser's last Bestiole and the final rival hold one too. `npm run balance`
includes them; each was kept only if the leader's row stayed within about 10 points of the version
without items (Nocturne's and the second Admin Rature's were removed for that reason). Players have
berries, the Tracing Paper and battle items of their own, which the simulation doesn't use.
