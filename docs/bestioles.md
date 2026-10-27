# Designing a Bestiole

Every Bestiole should have its place in a team, from the first route to the Grand Concours. In the
originals, many creatures are never worth using: weak types, no good moves, poor abilities, low stats
(Butterfree is the usual example). These rules avoid that here. `src/data/bestioles.test.ts` checks them,
so a new creature that breaks one fails `npm test` with the rule it breaks.

The project skill `.claude/skills/new-bestiole/SKILL.md` walks through adding one, step by step.

## 1. Pick a model

Start from a gen-1 creature with the same role (a first-route bird, a cave rock, a late dragon…). Its
numbers are the starting point for the base stats, catch rate and base XP. Keep the role in the spread:
Taupitrio is fast and fragile, Montagnoc slow and tough, Ronflon all HP. Only the names, drawings and
powers are original, never the model's name.

## 2. Base stats

The base-stat total (the sum of the six) must sit in its band, by stage (`band()` in the rules test):

| Stage | Band | Usual target |
|---|---|---|
| First form of a line | 190–340 | about 300 (draft babies 285–325) |
| Middle form | 200–430 | about 400–410 |
| Final form | 460–545 | 470–530 (starter finals 515, Dragopataud 540) |
| Never evolves | 450–520 | 470–510, by rarity |
| `rarity: 'legendary'` | 560–600 | 600 (Libellune, Noctaile) |

A line's stage comes from `evolvesFrom` and `evolutions`. Finals are close, not equal: the spread and the
power make the difference, not 80 points of stats.

## 3. Catch rate and base XP

Take them from the model:
- first forms: catch rate 255–170 (190 for most), base XP 50–100;
- middle forms: catch rate 120–75, base XP 110–150;
- finals and standalones: catch rate 45 (25 for rare finds like Ronflon or Lunéclat), base XP 150–220;
- starters: 45 at every stage (64 / 142 / 208 base XP).

The rules test checks that an evolution is never easier to catch than its earlier form, and that it gives
more XP. XP grows as `level³` (`xpAt`), and the yield is the Gen 3 one: `baseExp × level / 7`, ×1.5 from a
trainer, ×1.5 for a traded Bestiole.

## 4. A power for every family

Each family gets one "super power" that makes up for its weak point. It is either:
- **a power talent**: the species' only regular talent (`talents: ['<power>']`). The hidden talent stays as
  the 25% alternative, so one Bestiole in four of that family plays without the power; or
- **a signature move**: a damaging move with power 70+ (or that goes first) that no other family learns by
  level-up, learned by about level 30, with an animation of its own in `src/ui/battle/fx/recipes.ts`.

Pick what fixes the family's problem: a double weakness wants a defensive talent, weak types want a
strong move or a damage bonus, low stats want a talent that changes how it fights.

| Family | Power | Kind | Weak point it fixes |
|---|---|---|---|
| Minousse → Bouquétigre | Jardin Secret: heals 1/16 HP a turn, 1/8 in sunshine | `regen` | — |
| Braisou → Dragobraise | Feu de Joie: +1 Sp. Atk after it knocks a foe out | `statOnKO` | — |
| Clapotin → Tortorrent | Carapace Pleine: half damage at full HP | `fullHpGuard` | — |
| Chenillou → Papivole | Ailes Prisme: super-effective hits halved, its status moves never miss | `prism` | Rock ×4, weak types |
| Piafou → Piafurie | Premier Envol: Flying moves go first at full HP | `galeWings` | Ordinary |
| Zigzou → Zigzéclair | Foudre Têtue: Electric hits Ground types | `ignoreImmunity` | Ground walls it |
| Lunelle → Lunéclat | Pleine Lune: Sp. Atk and Sp. Def ×1.3 at night | `nightBoost` | Average |
| Ronflon | Gros Dodo: half damage and 1/8 HP a turn while asleep | `sleepTank` | Slow, few tools |
| Brumouille → Ombrouille | Passe-Muraille: the first attack after it comes in does half damage | `phaseFirst` | Fragile |
| Lamacorne | Arc-en-ciel: every move gets the same-type bonus | `allStab` | Average |
| Touffou and its three forms | Fourrure Douce: physical damage halved | `fluffy` | Low stats |
| Boxouille → Quadripoing | Poings d’Acier: punches ×1.3, and Rafale de Poings | `flagBoost` `punch` | — |
| Cailloutou → Montagnoc | Peau de Mousse: Water and Grass damage halved | `halve` | Water and Grass ×4 |
| Givrinou → Banquisette | Patinoire: hail as it comes in | `entryWeather` | — |
| Sifflasse → Cobrasse | Venin Frais: its physical hits poison 30% of the time | `touchStatus` | Weak types |
| Dragounet → Dragopataud | Perle de Pluie: rain as it comes in | `entryWeather` | — |
| Ciseaumante | Ciseaux Affûtés: cutting moves ×1.5 | `flagBoost` `cut` | — |
| Poupochette | Bébé Poche: the baby hits again at a quarter of the power | `parentalBond` | — |
| Taupinou → Taupitrio | Surgissement (Ground 70, goes first) | signature move | Fragile |
| Boulonnet → Triboulon | Canon Aimant (Steel special 90, 30% paralysis) | signature move | No strong Steel move |
| Chantouille → Chantouffe | Grand Concert (Fairy special 95, 10% sleep) | signature move | Weak |
| Ptérocaille | Piqué Fossile (Rock 80, goes first) | signature move | Weak Rock moves |
| Dormipsy → Psymagus | Pressentiment: the first attack after it comes in does half damage | `phaseFirst` | Fragile |
| Chapardou → Pantharuse | Griffes Malines: cutting moves ×1.5 | `flagBoost` `cut` | Average stats |
| Fumeron → Fumerax | Gaz Piquant: hitting it up close poisons 30% of the time | `contactStatus` (listed in `POWER_TALENTS`) | Slow |
| Coquilou → Coquifort | Coquille de Fer: Fire and Fighting damage halved | `halve` (listed in `POWER_TALENTS`) | Fire and Fighting ×4 |
| Glissonde | Chant Polaire (Ice special 90, 10% sleep) | signature move | — |
| Canarmure | Épée-Crayon (Steel physical 90, cut, high crit) | signature move | No strong Steel move |
| Clochiflor → Gloutoflor | Gueule-Piège (Grass physical 85, drains 30%) | signature move | Fragile |
| Osselot → Ossagarde | Os-Boomerang (Ground physical 75) | signature move | Slow |
| Fâchinge → Furisinge | Colère Noire: +1 Attack after it knocks a foe out | `statOnKO` | — |
| Hippomine → Hippoplume | Nage Éclair: Water moves go first at full HP | `galeWings` | Fragile |
| Libellune (legendary) | Veilleuse: Sp. Atk and Sp. Def ×1.3 at night; Rêve Vitrail (Fairy special 100, drains 25%) | `nightBoost` + signature move | — |
| Noctaile (legendary) | Mauvais Rêves: a sleeping foe loses 1/8 HP each turn; Ombre-Songe (Dark special 95, 20% sleep) | `badDreams` + signature move | — |

A new family can reuse a kind with new numbers (another `flagBoost`, `entryWeather` with sand or sun, a
`touchStatus` that burns…) under a new talent name. A new kind needs:
- its type in `TalentEffect` (`src/data/talents.ts`) and the `POWER_KINDS` list of the rules test;
- its hook in `src/engine/pk/battle.ts`, and in `ai.ts` when it changes damage (`talentPowerMult`,
  `stabOf`, `moveEffectiveness` are shared by both);
- a message in `src/ui/battle/messages.ts` if it shows a new note;
- a test in the "family powers" block of `src/engine/pk/talents.test.ts`.

Powers that act for the side that holds them help trainers too. Watch the sims for a power that gives a
free turn or chips every turn (the first Passe-Muraille let the whole first attack through, and Team
Gomme's ghosts dropped late fights by 20–40 points).

Moves can carry `punch: true` or `cut: true` (`MoveDef` in `src/data/schema.ts`) for `flagBoost` talents.

## 5. Moves

- Every final form learns a same-type move of power 80+ by level 40 (the rules test checks it), and one
  coverage move of another type by about level 35.
- The first moves stay weak: Act 1 must stay gentle, so no 80-power move before level 19 (Boulonnet’s
  Tête de fer is the earliest).
- Gap fillers exist for types that lacked strong moves: Bourdonnement (Bug), Boue Toxique (Poison), Lame
  de Pierre (Rock), Colère du Dragon (Dragon), Griffe de Nuit (Dark), Tempête Psy (Psychic).
- A level-0 learnset entry is learned on evolving (see docs/content.md).
- Stencils (`stencils: [...]`) add coverage the player can choose.

## 6. Draw it

Bestioles are drawn in code in the little artist's style (`tools/redraws`, see the `new-bestiole` skill).
Always in three-quarter view turned to the left, with `faces: 'left'`: a drawing straight from the front
looks silly in battle, and battles mirror the drawings so both Bestioles face each other. The rules test
checks that `faces` is set. Turned to the left, the near limbs are on the right and bigger, the far ones on
the left start hidden behind the body; the face, snout and mouth sit toward the left edge.

## 7. Place it

- Wild: an `encounters` table on a map at the story point where its level makes sense, with a weight
  that matches `rarity`. Night-only or day-only tables give the clock a use.
- Trainers: a few trainers near where it lives. Trainer Bestioles always use talent slot 0, so they always
  have the power.
- Strong finals and standalones go in `TOWER_POOL` (`src/data/postgame.ts`).
- Brouillons (not drawn yet) get `draft: true` (docs/content.md, "Brouillons").

## 8. Check it

```bash
npm test                                   # includes the rules test
npm run balance -- normal 300              # every row; also easy and hard
npm run balance -- normal 300 effaceur,gcFusain   # only some rows
```

Compare the rows of every trainer who uses the new Bestiole before and after. Act 1 stays gentle,
leaders sit around 40–90% on Normal with a teammate, the finale and the Concours champion around 50–75%.
A row that moves by more than about 10 points gets its team retuned (levels, items) or the power softened.
Then play it once on a phone size (docs/testing.md).
