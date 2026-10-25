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
| 13 | `route8`, `encre` (Cité-Encre), `atelierEncre`, `usine1`–`usine3` | 🏅 **Nocturne**, Ghost. Then the Eraser Factory: Rature and Blanche again; the Great Eraser escapes | `badge:encre`, `a3.usine` |
| 14 | `routeBlanche`, `bordPage` (Le Bord de la Page) | Half-drawn world: final rival battle, then the Great Eraser with the choice | `tr:rivalFinal`, `tr:effaceur` |
| 15 | `chambre` | The real bedroom, Papa, the drawings on the desk, credits | `ending` |

**Fast travel.** `visitTown` (each town's `onEnter`) sets `visit:<map>`. The Pencil Balloon pilot in the
Healing Center flies to visited towns.

**Post-game** (`ending` set):
- the Prof rewards the 12 pages (`pagesReward`) and a complete Bestiodex (`dexDiploma`);
- Atelier Masters offer rematches at +12 levels;
- Mom has new lines.

These work by wrapping the Act 1 scripts: `const prev = scripts.prof; scripts.prof = …`. That is why
`src/story/index.ts` imports the acts in order.

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
| Atelier Pastel | L5–6 | Mireille L6/L8 |
| Route 2, Bois Brumeux | L7–11 | — |
| Atelier Plume | L11 | Gaspard L10/L10 |
| Cave, Route 3, Atelier Aquarelle | L10–16 (optional Gardien L14–15) | Marine L16–19 |
| Route 4, Ville-Feutre | L17–21 | Rature L18–20, Zélie L22–24 |
| Mont Fusain, Braise | L22–24 | Ambre L23–25 |
| Paillette, Tour | L27–31 | Célestine L31–34, Blanche L30–31 (×4) |
| Gouache, Encre, Factory | L31–38 | Basile L35–38, Nocturne L35–38 |
| Finale | — | Rival L40–43 (6), Great Eraser L39–41 (5) |

Run `npm run balance` for the current numbers instead of trusting this table.

**The owner's request (Oct 2026):** the first battles must let players learn the mechanics.
- The first trainers have one or two low-level Bestioles; the starter alone should win Act 1 route
  battles.
- Leaders should be beatable once the player has one teammate.
- Insect moves come late on purpose (Chenillou Dard at L7, Papivole powders from L12). Gaspard is
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
