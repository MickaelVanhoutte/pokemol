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
  - Their look (`gang` in `LOOKS`, drawn by `fromLook`): a charcoal uniform with their sign on the
    chest (a pink and blue school eraser), a cap shaped like an eraser with a white G, black gloves and
    boots, a frown and a smirk. Grunts are masked, admins wear a cape with a high collar (Rature red,
    Blanche white, Captain Buvard ink blue), and the Great Eraser's face is rubbed out.
  - Admins: **Rature** (*Smudge*) and **Blanche** (*Whiteout*); grunts: "Sbire Gomme".
  - Boss: **le Grand Effaceur** (*the Great Eraser*), the little voice that says "your drawings
    aren't good enough".
- The **rival** is named by the player (presets Feutre / Crayon / Pinceau, EN Marker / Crayon / Brush;
  `{rival}` in texts). He picks the starter strong against yours (`RIVAL_COUNTER`). He is cocky in
  Act 1 and becomes an ally in Act 3.
- **Clues along the way**: the Prof's camera and catch-phrase, a slip where he says "ma puce", a
  notebook-line sky and map margins, and NPCs mentioning crayons. There are also 12 torn sketchbook
  pages (key items `page-1`…`page-12`, texts in `src/data/pages.ts`), each a memory of the real world.
- **Ending** (iteration 16, `src/story/finale.ts`, see "The two endings"): at the Edge of the Page the
  Great Eraser's face comes back, and it is the player's own (`doubtLook`: their look, greyed, in his
  uniform, a worried face): « Je suis toi. Le toi qui doute. » He wants to rub out Coconfus, last night's
  unfinished butterfly. The last answer, the battle (his battle intro shows that face), then the page turns
  white and the player wakes up in the real bedroom (`chambre`). Papa took photos of the new drawings, then
  notices the butterfly on the last page: the drawing screen (`DrawingScreen`, screen `drawing`) shows it
  rubbed out and drawn again as Libellune, or growing into Noctaile from its smudges. Credits follow, then
  "the next night" the player goes back to the dream, where Coconfus evolves into that drawing (party, PC or
  daycare) and stops being pale.

## The two endings

Iteration 16 (Oct 2026), the owner's design. **Team Gomme are the little artist's doubts**, and the Great
Eraser is the doubting self. **Coconfus** (EN *Muddlecoon*, id 073, Bug/Dark, `src/story/coconfus.ts`) is the
butterfly the child could not finish drawing before falling asleep (pages 3, 5, 6 and 11 hint at it): a
muddled cocoon with a hole rubbed through it, half a stained-glass wing and the start of a spiral. Its two
evolutions are the legendaries, by a story-only rule (`evolutions: [{ to, story: 1 | 2 }]`, never by level):
- **ending 1, touch it up**: the player listens to the doubts to do better. Awake, the child rubs Coconfus out
  and redraws it, better: **Libellune** (Bug/Fairy);
- **ending 2, keep it**: the player listens to the doubts but accepts imperfection as part of drawing. The
  smudges become the drawing: **Noctaile** (Dark/Psychic).

Neither answer is wrong. Each choice is `choose(id, …)` in `src/story/choices.ts`: flag `choix:<id>` = 1 or
2, plus `choix:<id>:a` / `:b` for the maps. `endingOf()` takes the majority of the seven story choices and the
final answer to the Great Eraser, which counts double; a tie (an older save that missed some) goes to the final
answer. When Coconfus is in the party it reacts to each answer (a pink glow, or a dark spiral).

| # | Id | Where | Touch it up (1) | Keep it (2) |
|---|---|---|---|---|
| 1 | `tache` | Route 1, after the first grunt | wipe the eraser mark off Coconfus | « elle te va bien » |
| 2 | `musee` | Ville-Pastel, Apprentice Lison at the Atelier door after the badge | « recommence-le » | « garde-le, il est unique » |
| 3 | `pont` | Atelier Aquarelle, Marine after her badge (`marineAfter`) | paint the bridge again, neat | keep the watercolour runs (`u` tiles on Featherby's bridge) |
| 4 | `feutre` | Ville-Feutre's warehouse, Zélie freed (`feutreRestore`) | colour it all back | keep a few grey lines (`x` tiles in the streets, the locals say why) |
| 5 | `rival` | Misty Tower top, the rival after Blanche (`towerFreed` → `rivalDoubts`): « je suis nul » | « entraîne-toi ! » | « t’es génial comme t’es » |
| 6 | `encre` | Atelier Encre, Nocturne after the badge (`encreChoice`): the ink blot on her fresco | rub it out, paint it again (`V` stars) | turn it into a moon (`N`) |
| 7 | `hameau` | Hameau-Brouillon, the Elder of Sketches (`hameauChoice`): « tu veux bien nous finir ? » | colour the hamlet in (patch `hameauColour`, buildings coloured) | « vous êtes beaux comme ça, pas finis » (it stays sketched) |

| final | `final` (counts double) | Edge of the Page, the Great Eraser with the player's face (`finalBoss`) | « on ne l’efface pas : on le redessine ! » | « il n’est pas parfait, c’est pour ça qu’il est à moi » |

Lison's drawing then hangs in the Museum of First Sketches (`lisonMusee`), redone or as it was. The rival's
lines on Route Blanche and when he heals you at the fortress follow choice 5 (`choix:rival:a` / `:b`); his team
does not change. The ending is saved as `fin` (1 or 2) with the win over the Great Eraser.

**What the doubt becomes.** After the battle the Great Eraser listens: « je serai ta gomme… pour recommencer »
(ending 1) or « je serai ton ombre, elle fait partie du dessin » (ending 2), and Papa's words on the last page
follow the ending too.

**Saves that saw the old ending** (`ending` set, no `fin`): a pale Coconfus waits at the Edge of the Page
(`coconBord`). Talking to it gives Coconfus if needed, then plays the face reveal, the last answer, a blink of
waking up with the last page and its drawing, and the evolution, without the battle.

**Coconfus in Acts 2 and 3.** Admin Rature and Admin Blanche say their boss wants « ce cocon raté ». At the end
of the Eraser Factory (`usineEnd` → `paleCocoon`), the Great Eraser recognises « le dessin raté d’hier soir »
and rubs it: flag `coconPale`, and its card is drawn washed out (`monArtUrl`) until the ending.

**The legendaries are visions until the ending** (`src/story/legends.ts`). Libellune (L32, Bois Perdu, at
night) and Noctaile (L38, Grotte des Ratures) are met once as a battle where Crayon-balls go through them
(`wildBattle(…, { noCatch })`, the `blocked` event with `reflet`), flag `vision:<slug>`; the player notices
Coconfus's eyes, or its spirals. After the ending, the one Coconfus did not become waits there for real at L55
(flag `fin`: 1 Libellune, 2 Noctaile). Older saves that caught them keep them.

**Coconfus in Act 1.** Leaving Bourg-Gribouille, the first grunt (`r1gomme`, a scripted battle, L3) chases it
down Route 1 (`route1Gomme`, a trigger across the route); it flees north after choice 1. The second grunt of the
Misty Woods holds it prisoner (`coconBois` NPC); beating him, it joins the team at L10 (`coconfusJoins`, flag
`gift:coconfus`), and the rival finds it weird. The Prof, shown it, has never photographed it: « il n’est pas
fini » (`prof:coconfus`). Saves that crossed the woods before iteration 16 meet it in the next town they visit,
a little under their lead's level. The legendaries and Coconfus never come out of the Tombola's machine.

Speaker names live in `src/story/cast.ts`; Papa, the Great Eraser and the leaders are defined where
they are used.

## Region path

| # | Maps (ids) | What happens | Flags set |
|---|---|---|---|
| 0 | `NewGameScreen` | Falling asleep (`SleepIntroView`, about 19 s, a tap skips a beat): a desk lamp, the sketchbook page, the pencil trying a wing, rubbing it out, trying again, seen through heavy eyelids, blurrier and blurrier, with the night lines; pencil and eraser sounds (`sfx.pencil`, `sfx.rub`) while the title music fades out; eyes shut, coloured fireflies of the dream while the title theme fades in (`playMusic('title', false, 6)`) and plays on under the Prof's speech; a white light opens the dream. Then the Prof's speech, girl/boy, the look picker (« Dessine-toi ! »), name and rival name | — |
| 1 | `maison`, `maisonRival`, `bourg` (Bourg-Gribouille), `labo` | Wake up; starter at the lab (camera clue); tutorial battle against the rival (friendly, coached) | `intro`, `rivalStarter`, `rival1` |
| 2 | `route1` (Chemin des Crayons) | A grunt chases Coconfus and erases a patch of grass (`r1Erased`); choice 1; first trainers; wild L3–4 | `a1.r1seen`, `choix:tache` |
| 3 | `ville` (Ville-Pastel), `atelierPastel` | 🏅 **Mireille**, Insect; Lison's drawing (choice 2) | `badge:pastel`, `choix:musee` |
| 4 | `route2` (Route des Craies), `bois` (Bois Brumeux) | West gate opens with the badge. Two grunts erase the woods; beating the second runs `boisRestore`, and Coconfus joins | `a1.bois`, `gift:coconfus` |
| 5 | `plume` (Village-Plume), `atelierPlume` | 🏅 **Gaspard**, Normal. The bridge east is erased, so the player goes through the cave | `badge:plume` |
| 6 | `grotte1`, `grotte2` (Grotte Gribouillis) | Cave trainers and the optional strong `gardien`; exits to the port | — |
| 7 | `route3`, `port` (Port-Aquarelle), `atelierAquarelle`, `tombola` | 🏅 **Marine**, Water (`marineAfter` restores the bridge). Fair with the **Tombola** side quest (golden ticket hidden on Route 4) | `badge:aquarelle`, `a2.bridge`, `a2.tombola` |
| 8 | `route4`, `feutre` (Ville-Feutre), `entrepot1`/`entrepot2`, `atelierFluo` | The city is drained of colour (`drained`: real greys, `tintUnless: 'a2.feutre'`). Admin Rature in the warehouse; `feutreRestore`. 🏅 **Zélie**, Electric | `a2.feutre`, `badge:fluo` |
| 9 | `montFusain1`/`2`, `braise` (Village-Braise), `atelierBraise` | 🏅 **Ambre**, Fire | `badge:braise` |
| 10 | `route6`, `paillette` (Bourg-Paillette), `atelierPaillette` | 🏅 **Célestine**, Fairy | `badge:paillette` |
| 11 | `tour1`–`tour3` (Tour Brumeuse) | Team Gomme holds it. The rival heals your team; Admin Blanche at the top | `a3.tour` |
| 12 | `route7`, `gouache` (Jardin-Gouache), `atelierGouache` | 🏅 **Basile**, Grass | `badge:gouache` |
| 13 | `route8`, `encre` (Cité-Encre) | The Atelier is locked: Nocturne’s note (`atelierEncreDoor`) sends you back south | `a3.note` |
| 13b | `port` → ferry (`passeur`) → `phareIle`, `phare1`–`phare3` (Phare de l’Encrier) | Grunts, a block-and-plate room (2F), **Captain Buvard** at the lantern; Nocturne gets her Midnight Ink back (`phareEnd`) | `a3.phare` |
| 13c | `encre`, `atelierEncre`, `usine1`–`usine3` | 🏅 **Nocturne**, Ghost. Then the Eraser Factory: Rature and Blanche again; the Great Eraser escapes | `badge:encre`, `a3.usine` |
| 13d | `encre` (west exit) → `route9` (Route de la Marge), `brouillon` (Hameau-Brouillon), `esquisses` (Forêt des Esquisses), `forteresse1`–`3` (Forteresse Gomme) | Act 4 (`src/story/act4.ts`, maps in `src/data/maps/marge.ts`): a white wall closes the north of Cité-Encre (`murBlanc` patch, `encreNorth`). West past the red margin (`margeCross`, doodles of wings in the margin), the hamlet of unfinished drafts (choice 7, `hameauChoice`: coloured in, or left sketched: `sketchUnless` buildings and a patch), the sketched forest (sketch grass `g`), the fortress (1F crayon barriers, 2F glossy paper, 3F the rival heals you, then Buvard, Rature and Blanche, who say they are the little voices of doubt). Pulling the Giant Eraser's lever (`grandeGomme`) brings the wall down and blows you back to Cité-Encre | `a4.marge`, `choix:hameau`, `a4.rival`, `a4.machine` |
| 14 | `routeBlanche`, `bordPage` (Le Bord de la Page) | Half-drawn world: final rival battle, then the Great Eraser with the choice | `tr:rivalFinal`, `tr:effaceur` |
| 15 | `chambre` | The real bedroom, Papa, the drawings on the desk, credits | `ending` |

**Detours of the late game.** Besides the lighthouse trip (the story's back-and-forth from Cité-Encre
down to Port-Aquarelle and its island), two optional places break the straight line north:
- **Piste Cyclable** (`piste`): a long downhill bike road from Jardin-Gouache (east exit) to Ville-Feutre
  (east exit), with cyclists, grass and items. The Pencil Bike is required (`pisteBike`), and its gate
  at the Gouache end only opens from the Gouache side (`pisteGate`, flag `piste.open`), so it is a
  shortcut back south, never a way to skip ahead.
- **Grotte des Échos** (`grotteEchos`, door on Route 8): two boulders (Strong Gloves) fill the two
  pits of the passage; at the back, a red-eyed shadow is **Ombrouille** L36, met once
  (`echoShadow`, flag `static:ombrouille` when caught or beaten). It no longer appears in the
  Misty Tower. Ombrouille is no longer a legendary (iteration 12): a rare final form, total 520; the
  Great Eraser's one is L31 (after iteration 15) and Nocturne's at the Grand Concours L49.
- **The two legendaries** (iteration 12, `src/story/legends.ts`, maps in `src/data/maps/legendes.ts`),
  the good dream and the bad dream, total 600 each. Each is met once; caught, it is gone
  (`static:<slug>`); knocked out, it comes back after a night of sleep (`sleepUntil` counts
  `nuits`; `ko:<slug>` stores the night it can return, `koDay:<slug>` the real day) — the map's
  `onEnter` sets `away:<slug>`, which hides its NPC.
  - **Libellune** (Bug/Fairy), a vision at L32 before the ending and L55 after it (see "The two endings"), in the **Bois Perdu**: a gap in the Misty Woods' southern brambles
    (`boisPerduGate`, 6th badge) opens on a maze where only the fireflies (`y` tiles) mark the way;
    every wrong turn (`boisPerduLost` triggers) sends you back to the start. Libellune comes to the
    clearing only at night. A kid in the Misty Woods gives the hint.
  - **Noctaile** (Dark/Psychic), a vision at L38 before the ending and L55 after it, at the bottom of the **Grotte des Ratures** (cave door on Route 8):
    1F crayon barriers that need both levers, 2F glossy paper whose holes drop you back to 1F, 3F two
    boulders to push into two pits (12 pushes) in front of Noctaile.

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
  their team raised to `REMATCH_LEVEL[badges]` (L7 with no badge, L42 with eight, L55 after the ending). Prize
  as usual.
- *The following Bestiole* has lines for each place and for its friendship, and once a day it may
  find an item.

**Post-game** (`ending` set):
- the Prof rewards the 12 pages (`pagesReward`) and a complete Bestiodex (`dexDiploma`);
- Atelier Masters offer rematches at +12 levels;
- Mom has new lines;
- the dream legendary Coconfus did not become waits in its lair at L55 (`src/story/legends.ts`);
- a path opens at the top of the Edge of the Page (`bordPage` patch) to **Masterpiece Square**
  (`galerie`, `src/data/maps/galerie.ts`, a balloon stop once visited), with an Inn and a shop.

**Grand Concours** (`concours` hall, scripts in `src/story/postgame.ts`, teams in
`src/data/postgame.ts` `CONCOURS`): the door script (`concoursDoor`) clears `gc:1`…`gc:4` and warps
in. Four Grandes Maîtresses (Marine, Ambre, Célestine, Nocturne) stand in doorways and step
aside once beaten (`gc:<n>`, NPC `hideIf`), then Prof. Fusain (6 Bestioles). No healing in
between, the bag is allowed; a loss is a normal blackout and the next attempt starts over. Since iteration 16
the Grandes Maîtresses stand at L52–57 and Prof. Fusain at L51–52, above the story's finale; the sims use a
level 58 team (Normal 31–100%, Prof. Fusain 45–62%). Winning
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
| Route 1 | Margot L3, Iris L4 (1 Bestiole each), Léo L3/L4, Arthur L4/L4; wild L3–4 | — |
| Atelier Pastel | L5–6 | Mireille L7/L9 (Chrysalou, Papivole) |
| Route 2, Bois Brumeux | L7–10 (4 + 6 trainers) | — |
| Atelier Plume | L11 | Gaspard L10/L8 |
| Cave, Route 3, Atelier Aquarelle | L10–16 (optional Gardien L14–15); Route 3 trainers have three Bestioles | Marine L17/18/20 (Clapoflot) |
| Route 4, Ville-Feutre | L16–20 (Route 4 has 5 trainers) | Rature L20/19/21, Zélie L21/21/23 |
| Mont Fusain, Braise | L20–23 (wild L19–23) | Ambre L23/20/24 |
| Route 6, Paillette, Tour | L23–27 | Célestine L26/27/28/29 (Lamacorne added), Blanche L23/24/23/24 |
| Routes 7–8, Gouache, Lighthouse, Encre, Factory | L27–33 (three Bestioles per trainer) | Basile L27–30 (four), Buvard L29–31, Nocturne L30–33 (five, an Ombrouille ace), Rature L31–32 and Blanche L33–34 (five each) |
| Act 4: Route de la Marge, Forêt des Esquisses, Forteresse Gomme | L35–40, four Bestioles each (wild L34–39) | Buvard L40–42, Rature L39–40, Blanche L41–43 (five each, one after the other; the rival heals you first) |
| Finale | Route Blanche: Gaston and Mila L40–41 (four each), sketch grass | Rival L40–41 and his starter L45 (6), Great Eraser L40–41 and Ombrouille L45 (5) |

Run `npm run balance` for the current numbers instead of trusting this table.

**Training on the way (iteration 15, Oct 2026).** The owner had to grind on Normal. `npm run curve`
showed why: with the XP spread over a team, a player who fought every trainer arrived at each Atelier
several levels behind, and the routes forced no wild battles at all. The balance sim hid it, because it
assumed generous hand-written levels. Now the sim fights at the curve's levels.

Changes:
- XP follows the Gen 5 formula: `baseExp × level / 5`, then scaled by the level gap (catch-up XP).
  Catching a Bestiole gives XP too.
- The curve assumes a team of five that shares the XP evenly.
- Act 1's routes doubled in size. Bands of tall grass across them force about 3 wild battles per crossing (Route 2 and the
  woods have a slightly higher encounter rate). New trainers: Margot and Arthur on Route 1, Anouk and Colette on
  Route 2, Timothée and Maëlle in the woods. Paul, the second grunt, Pierrot's Zigzou and Gaspard's
  Ronflon went down a level.

On Normal the curve now brings the team to Mireille at L8/7 and to Gaspard at L13/13/11 (Gaspard's sims
went from about 30% to 66–75%).

Act 2 got the same treatment:
- Route 3 (26×34) and Route 4 (24×40) have forced bands of tall grass, and two more trainers each:
  Loïc and Romane, Nino and Clara.
- Mont Fusain got Géologue Armand and a slightly higher encounter rate. Its puzzles were left alone.
- Act 2's trainers were brought down to the curve: Marine 15/16/18, Zélie 19/19/21, Ambre 21/18/21.
  The wild Bestioles of Route 4 and Mont Fusain went down too.

On Normal the sims now give Marine and Zélie 93–100% and Ambre 41–91% (Minousse against Fire).
Act 3 last:
- Routes 6, 7 and 8 went to 24×40, with forced bands of tall grass. Each got two more trainers:
  Jeanne and Pépin, Octave and Agathe, a grunt and Médium Opale.
- Act 3 used to jump ten levels after Ambre (her ace L24, Célestine's L34) with little in between, so
  the whole act came down to the curve. Route and Atelier trainers sit at the team's level. The bosses
  were tuned one by one with the sim, for about 70–90% on Normal without items: Blanche and Basile are
  the hardest, at 40–95%.
- The finale came down by about 12 levels (rival L28–31, Great Eraser L27–31). So did the wild Bestioles
  of Act 3, the Cycling Track, the lighthouse, the echo cave and the legendaries' places (Ombrouille L36,
  Libellune L30, Noctaile L34), and the Super Rod (−7).
- Post-game is unchanged: the Grand Concours at L44–49, rematches at +12.

The sim's teammates now grow like a player's: level evolutions, plus the electric Magic Pencil and
friendship from L20.

`curve.test.ts` checks the whole story: route trainers no higher than the team's lead, Atelier Masters
and admins at most five levels above it. A boss's strength is mostly its team, so `npm run balance`
tunes them.

**Wild levels under the trainers (Oct 2026).** The owner noticed wild Bestioles stronger than the trainers of
the same route. Every map's wild levels are now capped at the ace of its weakest trainer (the ranges keep two
levels of spread), and a test keeps it so. The Piste Cyclable's cyclists came up four levels to their area
instead. With a little less wild XP the team runs about a level lower in places, so a dozen route trainers and
Marine, Célestine, Basile, Admin Blanche (second fight) and the Great Eraser came down a level or two.

**A longer game (iteration 16, Oct 2026).** The owner wants the story to end around L45–50, like the
GBA games. Act 1 is unchanged. From Route 3 on, every trainer with fewer than three Bestioles got one more,
picked from the wild Bestioles around (in its grown form at that level, `grownForm`), and the leaders and
admins got bigger teams (Célestine Lamacorne, Basile Clochegueule, Nocturne Ossagarde and Pantharuse with an
Ombrouille ace, Rature Fumerax, Blanche Triboulon). Levels follow the curve: route trainers at the team's lead,
then each boss tuned with the sims to about 70–90% on Normal (some sit at the team's level: five Bestioles at
equal level are a fight). Wild levels rose by 1 (Act 2) to 4 (Act 3), the optional places with them (Piste,
echo cave L38 Ombrouille, Bois Perdu, Grotte des Ratures, the island, the Super Rod).

The curve now brings the team to Marine at L17, Ambre L23, Célestine L25, Basile L29, Nocturne L32 and the end
of the Factory at L34 (it was L29). Act 4, beyond the margin (23 trainers with four Bestioles, about 6 forced wild
battles), takes it to L41, Route Blanche to L42 and the Great Eraser to L42–43 (`curve.test.ts` checks it now runs
down to the finale and ends at 42 or more). The finale bosses keep a high ace (L45) with lower teammates: on
Normal the rival sits at 44–79% and the Great Eraser at 42–57%. A player who fights a little more than the
forced minimum, or rematches route trainers, arrives around L45.
Normal sims: 52–100% (Basile with Minousse is the hardest); Easy 89–100%; Hard 0–100% depending on the starter.

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
  on Route 3 (L14–16), Braisou on Mont Fusain (L18–20). Every team can find a type counter (Minousse
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

**Smoothed stats (iteration 8).** Base-stat totals follow bands, and catch rates and base XP follow each family's gen-1 model:
- 3-stage lines: about 310 / 410 / 515;
- 2-stage lines: about 310 / 480;
- standalones: 470–515;
- Ombrouille: 580.

The new brouillons' baby forms went down from 395–460 to 285–325; Papivole went up from 330 to 470, Ronflon to 470, Lamacorne to 480, Touffou's evolutions to 500.

Teams retuned with the sims:
- Mireille's Papivole L7;
- Gaspard's Ronflon L9, Max's Papivole L9;
- the Hermit's and Ambre's Ronflon L21;
- Nocturne 36/37/39;
- the Great Eraser's Ronflon L39 and Papivole L38;
- Prof. Fusain's team L44 except his last one.

**Twenty more Bestioles (iteration 11), 70 in all.** Drawn in her style with the `crayon` kit
(`tools/redraws`), chosen for the types the game lacked (Dark, Psychic, Ice, Steel, then Grass, Poison,
Ghost, Fighting, Dragon), each line inspired by a gen-1 one with all its gen-1 forms:
- Dormipsy → Cuillipsy → Psymagus (Psychic, L16/L36, rare): Route 3 and Route 4 (rare), Cuillipsy on Route 7.
- Chapardou → Pantharuse (Dark, L28): Route 3 and Route 6 at night, Piste Cyclable.
- Fumeron → Fumerax (Poison/Dark, L35): Route 4, Route 8. Team Gomme grunts use them.
- Coquilou → Coquifort (Ice/Steel, L30): surfing at Port-Aquarelle, Super Rod and surf at the lighthouse island.
- Glissonde (Water/Ice, rare): surfing around the lighthouse island.
- Canarmure (Steel/Flying): Route 6 by day, Piste Cyclable.
- Clochiflor → Clochegueule → Gloutoflor (Grass, L21/L36): Route 2, Misty Woods, Route 6, Route 7.
- Osselot → Ossagarde (Ground/Ghost, L28): Mont Fusain, the Misty Tower, the echo cave.
- Fâchinge → Furisinge (Fighting, L28): Route 4, Mont Fusain, Route 7, the echo cave.
- Hippomine → Hippoplume (Water/Dragon, L32): Good and Super Rods at Port-Aquarelle, Super Rod at the lighthouse.

26 trainers without a balance row use them (route trainers, Atelier apprentices, Team Gomme grunts),
and the Grand Concours got Glissonde (Marine), Canarmure L44 (Ambre), Psymagus L44 (Célestine) and
Pantharuse (Nocturne). Those stages, which the sims won 98–100% of the time, now sit at 50–93% on Normal.
The ten final forms joined `TOWER_POOL`.

**Fifteen more Bestioles (iteration 17), 88 in all.** The owner asked for original ideas (not modelled on
existing creatures) with double types the game lacked. Drawn with the `crayon` kit; the owner turned down
a broccoli line (replaced by the stapler crocodile) and asked for the mammoth to spray lava onto its own back.
- Agrafou → Crocagrafe (Steel/Dark, L30): a crocodile with a stapler for a head, binder clips on its back.
  Route 4; Crocagrafe on Route 9. Team Gomme grunts use them (Route 4, warehouse, Route 9, fortress).
- Ocrinou → Mammouchaud (Rock/Fire, L28): a mammoth out of a cave painting. Grotte Gribouillis; Mammouchaud
  in the echo cave. Miner Bob, Geologist Armand, Painter Victor.
- Faonvole → Cerfoudre (Electric/Flying, L26): a fawn flying like a kite (*cerf-volant*). Route 4 and Route 6 by
  day; Cerfoudre on the Piste Cyclable and Route Blanche. Kid Tim, Bastien, Cyclist Léa.
- Allumou → Allumbattant (Fire/Fighting, L27): a matchstick stick-figure, then a boxer. Mont Fusain;
  Allumbattant on Route 9. Juggler Paco (a fourth Bestiole), Hector, Grand Master Ambre (in place of Canarmure).
- Lumignon → Projétoile (Electric/Psychic, L26): a bedroom night-light, then a star projector. Route 3 and
  Route 4 at night; Projétoile on Route 8 at night. Kid Lise, Medium Opale.
- Plissou → Plisserpent → Festivouivre (Dragon/Fairy, L30/L44, rare): a fairy parade dragon of folded pearly
  paper, gold and rose, with a unicorn horn and paper flowers (the owner found the first red-and-gold version not
  fairy enough, then butterfly wings and pastel colours too close to Libellune, and picked pearl and gold). Route 7
  (rare); Plisserpent in the Sketch Forest (rare). Sparkler Mia, Sleepwalker Gaston, Grand Master Célestine.
- Globargot (Ice/Psychic, rare): a snail with a snow globe for a shell (a tiny house inside: a dream clue).
  Lighthouse island; Dreamer Mila.
- Moutoussière (Normal/Ghost, rare): the dust sheep under the bed. Misty Tower; Storyteller Rose, Medium Sélène.

Each took the place of one Bestiole in an existing team, at the same level (the ace's level kept, for the
wild-level rule); Miner Bob got Ocrinou as a second Bestiole, so the curve keeps its XP before Marine (a
first try swapped Caver Max's Papivole, a final form worth much more XP, and the Marine row fell by 15–26
points). Lumignon learns Berceuse at L17, not L1: Kid Lise's sleeping powder dropped the Braisou row to 3%.
On Normal, the rows that moved: Marine 96/93/84% (was 91/88/70), Grand Master Ambre 68/74/95% (was 31/97/88),
Grand Master Célestine 58/51/58% (was 53/79/50). Swapping Mont Fusain and Braise Atelier Bestioles for Allumou
cost the team a level before Ambre (her Hard rows fell to 10–49%): Allumou is an extra Bestiole for Paco
instead, and Ambre keeps her Braisou. Kid Tim's Faonvole is L16 (Hard: 31/4/2%, was 43/2/2). The finals and the two standalones joined `TOWER_POOL`.

**Ten Bestioles for the Ateliers' types (iteration 18), 98 in all.** The owner noticed that the Atelier Masters
and apprentices had only one or two Bestioles of the Atelier's type: the teams dated from before the dex grew.
Ten more, drawn with the `crayon` kit; the owner turned down a paintbrush plant line (replaced by the squirrels)
and asked for Érabreuil to throw its acorn rather than eat it (the `throw` motion of the battle rigs).
- Punaisette → Punaisaure (Bug → Bug/Steel, L20): a shield bug whose back is a drawing-pin head, then a knight
  beetle with a pin for a horn. Routes 1–2 and the Misty Woods; Punaisaure on Route 7. Apprentice Lou.
  Power: Bouclier Punaise (Fire and Flying halved).
- Lumiver → Lampyrette (Bug → Bug/Electric, L18): a glow-worm, then a firefly with a light-bulb belly. Routes 1–2
  and the Misty Woods at night; Lampyrette on Route 4 at night (rare). Apprentice Malo, Rocker Jimmy. Power:
  Lanterne (`nightBoost`).
- Érabou → Érabreuil (Grass, L26): a squirrel with a maple-leaf tail nibbling an acorn, then an autumn squirrel
  with an acorn-cap helmet who throws its acorns. Routes 3–4; Érabreuil on Route 7 and in the Lost Wood.
  Gardener Rosa, Landscaper Arno, Basile. Power: Lancer de Gland (Grass physical 85, 20% flinch).
- Nénurette (Water/Grass, rare): a tree frog on a lily pad, a water lily on its head. Route 3. Swimmer Lila,
  Landscaper Arno. Power: Averse d’Été (rain as it comes in).
- Tachou → Tachombre (Ghost, L30): a living ink blot, then a great ink splash with a gold pen nib. Misty Tower
  and Route 8; Tachombre in the Scribble-Out Cave. Storyteller Ombelin, Nocturne. Power: Giclée d’Encre (Ghost
  special 90, 20% accuracy drop).
- Fanétome (Ghost/Grass, rare): a pressed flower back as a little ghost. Route 8 and the Lost Wood at night.
  Calligrapher Saki, Basile, Nocturne. Power: Herbier (`regen`).

Every Master's team is now all of the Atelier's type (Mireille, Gaspard and Célestine already were): Marine
Hippomine, Givrinou, Clapoflot; Zélie Boulonnet, Lumignon, Zigzou; Ambre Braisou, Toufeu, Braisaure; Basile
Érabreuil, Fanétome, Clochegueule, Bouquétigre; Nocturne Tachombre, Grimouille, Ossagarde, Fanétome, Ombrouille.
Each apprentice has at least two of three. A first Marine with Nénurette (rain) behind Clapoflot fell to 82/9/8% on
Normal, and a Zélie with Lampyrette to 43/82/13%: Marine has Givrinou, Zélie Lumignon. On Normal: Marine 87/77/81%
(was 97/95/87), Zélie 90/99/90% (was 100/94/87), Ambre 77/74/100% (was 72/67/98), Basile 61/80/67% (was 11/81/36),
Nocturne 82/85/84% (was 75/85/78). The new teams give a little more XP, so one teammate is a level up at the
finale: Effaceur 69/64/65% (was 56/47/49), inside the finale's 50–75% band. On Hard, Marine is 31/3/9% (was 45/17/2).
The six finals and standalones joined `TOWER_POOL`.

**The sea, the caves and the sandpaper (iteration 19), 107 in all.** After the Ateliers, the gaps were elsewhere:
every fishing rod pulled up Clapotin, sailing met Clapotin and Piafou, no cave had a bat, the last routes only
showed Bestioles met before, and Poison (5), Rock and Ice (6) were the rarest types. Nine more, drawn with the
`crayon` kit; the owner turned down a pangolin (now a porcupine), a sheet of tracing paper that copied the foe (twice),
a paper snowflake, an origami penguin, a cotton-wool fox and a hermit crab in an ice-cream cone, so the Ice one waits.
- Avrilou → Léviafarce (Water → Water/Dark, L20): an April fish of paper with its strip of tape, that can only
  flop about (Gigotage, a move that does nothing: `{ kind: 'nothing' }`, "But nothing happens!"), then a sea serpent
  with a jester's collar. Every rod on every coast, Avrilou above all with the Old Rod; Léviafarce rare with the
  Super Rod off the Inkwell Isle. Captain Buvard's rematch. Power: Poisson d’Avril (`entryStage`, the foe's Attack −1).
- Médusoie → Voilamère (Water/Poison, L30): a tissue-paper jellyfish with crepe-paper ribbons, then a great one
  with a ruffled sail. Sailing off every coast; Voilamère off the Inkwell Isle. Swimmer Loïc, a lighthouse grunt.
  Power: Soie Urticante (`contactStatus`, poison 30%).
- Chiroplie → Vampapier (Poison/Flying, L22): a bat of folded black paper with googly eyes, then a vampire with a
  cape. Scribble Cave and Mount Charcoal; Vampapier in the Echo Cave. Team Gomme grunts (Rocket's bats). Power:
  Croc-buvard (Poison physical 75, drains 50%).
- Ponçou → Râpépic (Ground, L24): a hedgehog with a sandpaper back, then a porcupine whose quills are strips of
  sandpaper and nail files, orange gnawing teeth. Route 4 and Mount Charcoal; Râpépic on the cycling track (rare).
  Caver Rémi, Cyclist Noé, Painter Victor. Power: Poussière de Ponçage (sandstorm as it comes in).
- Galibou (Rock, rare): an owl painted on a pebble, varnished; it flaps its painted wing but can't fly (it still
  learns Grand Vol). Route 3 by the water and the Echo Cave. Painter Victor. Power: Vernis (Water and Grass halved).

Who got them: Swimmer Loïc Médusoie, the grunts at the Misty Woods and on Route 4 Chiroplie, the tower grunt
Vampapier, a lighthouse grunt Voilamère, Caver Rémi Ponçou, Cyclist Noé and Painter Victor Râpépic, Victor Galibou,
Captain Buvard's rematch Léviafarce (L39, in place of Glissonde; L41 dropped the row to 44/45/43%), Route 9's grunt
Vampapier. Swaps keep the XP close: a Pêcheur Gus with an Avrilou, a Captain Buvard with Voilamère (Braisou 88% →
50%) and 26-weight Chiroplie in the Scribble Cave (less XP from the cave, Hard Marine's starter a level down) were
undone or toned down, and Chiroplie's base XP is the model's 54. On Normal only Buvard's rematch moves: 55/55/53%
(was 59/58/61); on Hard, Ambre's second row 57/49/89% (was 64/60/91) and the cycling track's Noé 78/87/83%. The four
finals and Galibou joined `TOWER_POOL`.

**Wild encounters as in FireRed (iteration 20).** The owner felt interrupted all the time. Each step in the grass had a
flat 13–16% chance (8–11% in caves, 10% on water), and nothing kept a battle from starting one step after another: 1 in 4
came within 2 steps. `src/overworld/encounterRate.ts` now follows FireRed's code (pret/pokefirered, `wild_encounter.c`):
- FireRed's rates: 21 on routes; 14 in the woods (Bois Brumeux, Forêt des Esquisses, Bois Perdu); 7 in caves; 10 for
  Mont Fusain and the Tour Brumeuse, which already had a little more; 2 on water;
- 6 to 8 calm steps after any battle, during which only 1 step in 20 gets a roll; odds that grow with each failed roll;
  the first step onto other ground (from the path into the grass) skipped 4 times in 10; ×0.8 on the bike; the spray
  keeps the odds at their lowest.

That makes a wild battle every 10 steps or so on a route (was 6–7), 13 in a wood, 21 in a cave (was 9–12) and 50 on water
(was 10). The curve now divides the forced steps by `meanSteps`, and the forced wild battles of the whole story on Normal
went from 38.6 to 24.3. To make up for it, a wild Bestiole gives ×1.5 XP like a trainer's, which brings the curve back
(only one teammate a level down at Ambre). On Normal the sims are the same except Ambre 70/69/100% (was 77/74/100) and Kid
Tim 77/49/57% (was 92/87/87). Tim's drop is the sim's: its Zigzou reaches L17 and forgets Petite Étincelle for Frisson,
which a player chooses not to. On Hard: Gaspard 51/18/36% (was 63/27/46), Zélie 89/100/94% (was 46/96/58).

**Small fixes the owner asked for (iteration 20).** Coach Effort rubs out one stat's effort or all of them (it used to be
all or nothing). A long list of choices (six Bestioles and « Aucune ») went off the top of the screen in landscape: it now
scrolls, and in landscape it stands beside the text. The Bestiodex no longer stamps the brouillons BROUILLON.
A blackout cost half the purse; it now costs what FireRed charges (`blackoutLoss`: the party's top level × 4 × 2 to
30 by badges, so 480 ₽ at L20 with two badges). The PC adds a box at the end whenever less than a box's worth of room
is left (`spareBox`), so it never fills up.

**Inns of their own, natures, born qualities, talents and effort (Oct 2026).** The owner found the Inn
too crowded from the start, all ten Inns alike, and the Move Forgetter useless (no move ever has to be
forgotten). Now only the innkeeper and the Pencil Balloon pilot are in every Inn; each town's Inn has its
own helper (`fromMap`), listed on the Town Map for the towns visited:

| Inn | Helper |
|---|---|
| Ville-Pastel | Prof's aide (Tracing Paper) and the sailor who explains the PC and the beds |
| Village-Plume | Calligrapher (nicknames) |
| Port-Aquarelle | Move Rememberer |
| Ville-Feutre | Coach Effort: shows a Bestiole's effort points, rubs out one stat's or all of them for free |
| Village-Braise | Mood Teller: nature, 2 000 ₽ (the stat to raise, then the one to lower) |
| Bourg-Paillette | Star Polisher: one born quality to S (IV 31), 3 000 ₽ |
| Jardin-Gouache | Talent Gardener: 3 000 ₽, 8 000 ₽ for the hidden talent |
| Cité-Encre, Hameau-Brouillon, Place des Chefs-d'Œuvre | a resident with a word about the town |

Shops sell effort Biscuits (+10, 1 000 ₽) and Erasers (−10, 300 ₽) from 3 badges, and the STATS page of
the summary shows effort points. Magic Lollipops (+1 level) lie off the beaten track on 13 maps from
Mont Fusain to Route Blanche (most of them hidden), and shops sell them for 10 000 ₽ after the ending. The
level curve assumes a player who picks none up.

**Bestioles alive in battle (Oct 2026).** The owner asked for little animations: wings beating, Ocrinou's
trunk, Taupinou in and out of its hole, Clapotin hiding in its shell, Zigzou's sparks. Every Bestiole now
breathes (or hovers) while it waits, and the first fifteen have moving parts drawn apart (battle rigs):
Clapotin (the whole turtle into its shell: hiding only the head looked like it lost it), Zigzou (tail,
lightning), Papivole and Noctaile (folding wings), Piafou, Libellune, Canarmure (wing, pencil-sword),
Ocrinou (trunk), Taupinou (its hole), Dragobraise, Piaflèche, Piafurie, Dragopataud, Ciseaumante,
Ptérocaille (wings). Then every other Bestiole, by batches shown on an animated preview page: tails, arms,
vines, fins, sparks, notes, Zzz, snow, tongues, jaws. The owner's own requests: Lunelle's belly moon twinkles,
Ronflon brings its apple to its mouth (`reach`), Ombrouille sticks out its tongue, Ciseaumante snips,
Minoufleur's near vine moved behind its body (it looked like it came out of its mouth). After a win or a
capture, your Bestiole dances (a hop while turning round, twice) during the tune. The rigs add about
5.5 MB to the offline download.

**Stronger first Atelier Masters, and smaller things (Oct 2026).** The owner rolled over the first two
Ateliers, nearly one hit each: Mireille's ace (L7) and Gaspard's (L10) were below their own apprentices
and the no-grind team, Basile's (L28) too. Now Mireille has Chenillou L7, Chrysalou L8, Papivole L8;
Gaspard Piafou L11, Ronflon L8, Piaflèche L12 (Ronflon at L9 or more, with Ronflement, won 0–35%);
Basile L27/27/28/30. Sims on Normal (Minousse / Braisou / Clapotin): Mireille 89/100/99% (was 100), Gaspard
78/81/89% (was 95/95/98), Basile 56/95/76% (was 37/96/80); Easy 93–100%; Hard Mireille 59/91/85%, Gaspard
60/28/45%. Also: the title screen and the credits show only her own drawings (no all-Bestiodex from the
title any more), a PC at the Day Care, the summary's ◀ ▶ switch Bestiole (keeping the page), a Team Gomme
Bestiole stays on screen while its colours come back, a won battle is left only once the victory tune has
played, the title theme starts on the first page, and any fresque piece can be put into the gap.

**A music box instead of 8-bit (Oct 2026).** The owner found the GBA square waves out of place next to the
pencil and pastel look. The tunes stayed note for note; only the instruments changed. They listened to
four sounds on a test page (8-bit, music box, acoustic workshop with recorder and ukulele, felt piano) and
picked the music box: music box melody, felt piano bass, chime arpeggios, brushes and a bell, a small room
reverb. Team Gomme's tunes keep their unease with an out-of-tune double on the music box. Played live on
the phone it crackled (5 to 8 times the work of the 8-bit sound, measured offline), so the tunes are
now recorded once (`npm run music`) and the game plays the recordings, downloaded in the background at
launch (4 MB).

**Evolutions redrawn (Oct 2026).** The owner found some evolved forms too close to their earlier form (a
recolour, a bigger copy). Redrawn with a new silhouette: Clochegueule slimmer, Gloutoflor with vines and a
flytrap jaw, Ossagarde tall with a raised club, Furisinge punching in iron cuffs, Hippoplume with quills and a
pen-nib snout. Zigzéclair, Banquisette and Dragondine were brouillons: they moved to the `crayon` kit and lost
`draft: true` (26 brouillons left).

**Family powers (iteration 8).** Every family got a power, a talent or a signature move
([docs/bestioles.md](bestioles.md) lists them). Trainers use talent slot 0, so their Bestioles always have
it. Retuned with the sims:
- Passe-Muraille first let the whole first attack through, which gave Team Gomme's ghosts a free turn and
  dropped Nocturne, the late admins and the Great Eraser by 20–40 points. It now halves that attack.
- Apprenti Malo leads with Chenillou and his Touffou is L4: Fourrure Douce halves the physical moves a
  young Minousse has, and the row fell from 88% to 37%.
- Captain Buvard's Banquisette L34 and Grimouille L35 (Patinoire's hail chips the whole team).
- Admin Blanche's second fight: Grimouille L36, Ronflon L37.
- The Great Eraser: Zigzou L38, Grimouille L39.
- Prof. Fusain at the Grand Concours keeps L44 but his Lamacorne and last Bestiole hold no berry.

On Normal, most rows stayed within 10 points; Zélie with Clapotin went from 24% to 41%, Basile with
Minousse from 86% to 70%. Hard got harder late in the game. Piafurie on the Prof's team (Premier Envol)
dropped that row to 22–38%, so it stayed out.

**Held items on trainers.** From badge 4, a few leaders' aces hold a berry (Zélie, Ambre, Célestine,
Basile), and the Great Eraser's last Bestiole and the final rival hold one too. `npm run balance`
includes them; each was kept only if the leader's row stayed within about 10 points of the version
without items (Nocturne's and the second Admin Rature's were removed for that reason). Players have
berries, the Tracing Paper and battle items of their own, which the simulation doesn't use.
