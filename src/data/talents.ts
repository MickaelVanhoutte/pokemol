import { L, type LText } from '../i18n';
import { creature } from './creatures';
import { fairCopyOf } from './fairCopies';
import type { Major, StageKey, TypeId, Weather } from './schema';

/** What a talent does in battle (read by src/engine/pk/battle.ts). */
export type TalentEffect =
  /** ×1.5 power for moves of its type at a third of its HP or less. */
  | { kind: 'pinch'; type: TypeId }
  /** Moves of that type restore a quarter of its HP instead of hurting it. */
  | { kind: 'absorb'; type: TypeId }
  /** Damage from moves of these types is halved. */
  | { kind: 'halve'; types: TypeId[] }
  /** Super-effective hits do 25% less. */
  | { kind: 'filter' }
  /** Moves of 60 power or less are 50% stronger. */
  | { kind: 'technician' }
  /** Same-type bonus ×2 instead of ×1.5. */
  | { kind: 'adaptability' }
  /** One more critical-hit stage. */
  | { kind: 'superLuck' }
  /** Accuracy ×1.3. */
  | { kind: 'compoundEyes' }
  /** The foe can't lower its accuracy. */
  | { kind: 'keenEye' }
  /** Added effects of its moves are twice as likely. */
  | { kind: 'sereneGrace' }
  /** Added effects of the foe's moves don't reach it. */
  | { kind: 'shieldDust' }
  /** Hitting it up close may give the attacker a status. */
  | { kind: 'contactStatus'; status: Major; chance: number }
  /** Can't get that status. */
  | { kind: 'immune'; status: Major }
  /** Wakes up twice as fast. */
  | { kind: 'earlyBird' }
  /** A knockout from full HP leaves it with 1 HP. */
  | { kind: 'sturdy' }
  /** A stage change as soon as it enters the battle. */
  | { kind: 'entryStage'; target: 'self' | 'foe'; stat: StageKey; stages: number }
  /** +1 Speed at the end of every turn. */
  | { kind: 'speedBoost' }
  /** 1 chance in 3 to cure its status at the end of a turn. */
  | { kind: 'shedSkin' }
  /** Its status is cured when it is withdrawn or the battle ends. */
  | { kind: 'naturalCure' }
  /** Restores a third of its HP when withdrawn. */
  | { kind: 'regenerator' }
  /** Always escapes from wild Bestioles. */
  | { kind: 'runAway' }
  // ---- the families' powers (iteration 8)
  /** Heals this fraction of its HP at the end of each turn (more in sunshine). */
  | { kind: 'regen'; pct: number; sunPct: number }
  /** A stage up each time it knocks a foe out. */
  | { kind: 'statOnKO'; stat: StageKey }
  /** At full HP it takes half damage. */
  | { kind: 'fullHpGuard' }
  /** Super-effective hits do half damage, and its status moves never miss. */
  | { kind: 'prism' }
  /** Its moves of that type go first while it has full HP. */
  | { kind: 'galeWings'; type: TypeId }
  /** Its moves of that type hit Bestioles normally immune to them. */
  | { kind: 'ignoreImmunity'; type: TypeId }
  /** At night (or always), Sp. Atk and Sp. Def ×1.3. */
  | { kind: 'nightBoost'; always?: boolean }
  /** Asleep, it takes half damage and heals 1/8 of its HP each turn. */
  | { kind: 'sleepTank' }
  /** The first attack it receives after coming in passes through it. */
  | { kind: 'phaseFirst' }
  /** Every move gets the same-type bonus. */
  | { kind: 'allStab' }
  /** Physical moves do half damage to it. */
  | { kind: 'fluffy' }
  /** Moves with that flag are this much stronger. */
  | { kind: 'flagBoost'; flag: 'punch' | 'cut'; mult: number }
  /** Starts this weather when it comes in. */
  | { kind: 'entryWeather'; weather: Weather }
  /** Its physical hits may give the foe a status. */
  | { kind: 'touchStatus'; status: Major; chance: number }
  /** Its single-hit attacks hit again at a quarter of the power. */
  | { kind: 'parentalBond' }
  /** A sleeping foe loses an eighth of its HP at the end of each turn. */
  | { kind: 'badDreams' };

export interface TalentDef {
  id: string;
  name: LText;
  desc: LText;
  effect: TalentEffect;
}

const T = (id: string, name: LText, desc: LText, effect: TalentEffect): TalentDef => ({ id, name, desc, effect });

export const TALENTS: TalentDef[] = [
  T('seve-rebelle', L('Sève Rebelle', 'Wild Sap'),
    L('Quand il ne lui reste qu’un tiers de ses PV, ses capacités Plante sont 50 % plus fortes.', 'At a third of its HP or less, its Grass moves are 50% stronger.'),
    { kind: 'pinch', type: 'plante' }),
  T('braise-tetue', L('Braise Têtue', 'Stubborn Ember'),
    L('Quand il ne lui reste qu’un tiers de ses PV, ses capacités Feu sont 50 % plus fortes.', 'At a third of its HP or less, its Fire moves are 50% stronger.'),
    { kind: 'pinch', type: 'feu' }),
  T('grosse-vague', L('Grosse Vague', 'Big Wave'),
    L('Quand il ne lui reste qu’un tiers de ses PV, ses capacités Eau sont 50 % plus fortes.', 'At a third of its HP or less, its Water moves are 50% stronger.'),
    { kind: 'pinch', type: 'eau' }),
  T('grignote-feuilles', L('Grignote-Feuilles', 'Leaf Nibbler'),
    L('Les capacités Plante ne lui font rien : il les grignote et récupère un quart de ses PV.', 'Grass moves don’t hurt it: it nibbles them and gets back a quarter of its HP.'),
    { kind: 'absorb', type: 'plante' }),
  T('eponge', L('Éponge', 'Sponge'),
    L('Les capacités Eau ne lui font rien : il les boit et récupère un quart de ses PV.', 'Water moves don’t hurt it: it soaks them up and gets back a quarter of its HP.'),
    { kind: 'absorb', type: 'eau' }),
  T('pile-rechargeable', L('Pile Rechargeable', 'Battery Pack'),
    L('Les capacités Électrique ne lui font rien : il se recharge et récupère un quart de ses PV.', 'Lightning moves don’t hurt it: it recharges and gets back a quarter of its HP.'),
    { kind: 'absorb', type: 'electrique' }),
  T('elan', L('Élan', 'Momentum'),
    L('Il va de plus en plus vite : sa Vitesse monte à la fin de chaque tour.', 'It keeps speeding up: its Speed rises at the end of every turn.'),
    { kind: 'speedBoost' }),
  T('poils-electriques', L('Poils Électriques', 'Fuzzy Spark'),
    L('Le toucher peut paralyser l’attaquant (3 chances sur 10).', 'Touching it may paralyse the attacker (3 chances in 10).'),
    { kind: 'contactStatus', status: 'paralyze', chance: 30 }),
  T('pieds-legers', L('Pieds Légers', 'Light Feet'),
    L('Il arrive toujours à fuir les Bestioles sauvages.', 'It always gets away from wild Critters.'),
    { kind: 'runAway' }),
  T('bonne-etoile', L('Bonne Étoile', 'Lucky Star'),
    L('Les effets en plus de ses capacités arrivent deux fois plus souvent.', 'The added effects of its moves happen twice as often.'),
    { kind: 'sereneGrace' }),
  T('rembourrage', L('Rembourrage', 'Padding'),
    L('Bien rembourré, il ne prend que la moitié des dégâts des capacités Feu et Électrique.', 'Well padded, it takes only half the damage from Fire and Lightning moves.'),
    { kind: 'halve', types: ['feu', 'electrique'] }),
  T('recoloriage', L('Recoloriage', 'Recolor'),
    L('Quand il revient dans sa Crayon-ball, il se recolorie et récupère un tiers de ses PV.', 'When it returns to its Pencil Ball, it colours itself in again and gets back a third of its HP.'),
    { kind: 'regenerator' }),
  T('leve-tot', L('Lève-Tôt', 'Early Riser'),
    L('Il se réveille deux fois plus vite.', 'It wakes up twice as fast.'),
    { kind: 'earlyBird' }),
  T('souple', L('Souple', 'Bendy'),
    L('Trop souple pour être paralysé.', 'Too bendy to be paralysed.'),
    { kind: 'immune', status: 'paralyze' }),
  T('petit-soin', L('Petit Soin', 'Self-Care'),
    L('Ses problèmes de statut disparaissent quand il revient dans sa Crayon-ball ou après un combat.', 'Its status problems go away when it returns to its Pencil Ball or after a battle.'),
    { kind: 'naturalCure' }),
  T('poudre-bouclier', L('Poudre Bouclier', 'Dust Coat'),
    L('Une fine poudre le protège des effets en plus des capacités adverses.', 'A fine powder shields it from the added effects of the foe’s moves.'),
    { kind: 'shieldDust' }),
  T('mille-yeux', L('Mille Yeux', 'Many Eyes'),
    L('Avec tous ses yeux, il vise mieux : précision +30 %.', 'With all its eyes, it aims better: accuracy +30%.'),
    { kind: 'compoundEyes' }),
  T('increvable', L('Increvable', 'Unbreakable'),
    L('Avec tous ses PV, un coup qui devrait le mettre K.O. lui laisse 1 PV.', 'At full HP, a hit that should knock it out leaves it with 1 HP.'),
    { kind: 'sturdy' }),
  T('brume-epaisse', L('Brume Épaisse', 'Thick Mist'),
    L('Il arrive dans un nuage de brume : son esquive monte.', 'It arrives in a cloud of mist: its evasiveness rises.'),
    { kind: 'entryStage', target: 'self', stat: 'eva', stages: 1 }),
  T('regard-noir', L('Regard Noir', 'Stink Eye'),
    L('En arrivant, il fait les gros yeux : l’Attaque de l’adversaire baisse.', 'It glares as it arrives: the foe’s Attack drops.'),
    { kind: 'entryStage', target: 'foe', stat: 'atk', stages: -1 }),
  T('petits-traits', L('Petits Traits', 'Light Strokes'),
    L('Il soigne les petits gestes : ses capacités de 60 de puissance ou moins sont 50 % plus fortes.', 'It takes care of small strokes: its moves of 60 power or less are 50% stronger.'),
    { kind: 'technician' }),
  T('nouvelle-peau', L('Nouvelle Peau', 'Fresh Skin'),
    L('Il mue parfois : à la fin d’un tour, 1 chance sur 3 de guérir de son statut.', 'It sometimes sheds: at the end of a turn, 1 chance in 3 to cure its status.'),
    { kind: 'shedSkin' }),
  T('oeil-de-lynx', L('Œil de Lynx', 'Hawk Eye'),
    L('Rien ne lui brouille la vue : l’adversaire ne peut pas baisser sa précision.', 'Nothing blurs its sight: the foe can’t lower its accuracy.'),
    { kind: 'keenEye' }),
  T('coup-de-chance', L('Coup de Chance', 'Lucky Break'),
    L('Ses coups critiques arrivent plus souvent.', 'It lands critical hits more often.'),
    { kind: 'superLuck' }),
  T('trait-assure', L('Trait Assuré', 'Bold Line'),
    L('Un trait sûr de lui : les capacités de son type sont encore plus fortes (×2 au lieu de ×1,5).', 'A confident line: moves of its own type are even stronger (×2 instead of ×1.5).'),
    { kind: 'adaptability' }),
  T('papier-epais', L('Papier Épais', 'Thick Paper'),
    L('Dessiné sur du papier épais : les coups super efficaces lui font 25 % de dégâts en moins.', 'Drawn on thick paper: super-effective hits do 25% less damage to it.'),
    { kind: 'filter' }),
  // ---- the families' powers: one per family, its main talent (docs/bestioles.md)
  T('jardin-secret', L('Jardin Secret', 'Secret Garden'),
    L('Récupère 1/16 de ses PV à chaque tour, et 1/8 au soleil.', 'Gets back 1/16 of its HP each turn, and 1/8 in sunshine.'),
    { kind: 'regen', pct: 1 / 16, sunPct: 1 / 8 }),
  T('feu-de-joie', L('Feu de Joie', 'Bonfire'),
    L('Chaque fois qu’il met un adversaire K.O., son Atq. Spé. augmente.', 'Each time it knocks a foe out, its Sp. Atk rises.'),
    { kind: 'statOnKO', stat: 'spa' }),
  T('carapace-pleine', L('Carapace Pleine', 'Full Shell'),
    L('Quand il a tous ses PV, il ne prend que la moitié des dégâts.', 'At full HP, it takes only half the damage.'),
    { kind: 'fullHpGuard' }),
  T('ailes-prisme', L('Ailes Prisme', 'Prism Wings'),
    L('Les coups super efficaces lui font moitié moins mal, et ses capacités de statut ne ratent jamais.', 'Super-effective hits do half the damage, and its status moves never miss.'),
    { kind: 'prism' }),
  T('premier-envol', L('Premier Envol', 'First Flight'),
    L('Quand il a tous ses PV, ses capacités Vol passent en premier.', 'At full HP, its Flying moves go first.'),
    { kind: 'galeWings', type: 'vol' }),
  T('foudre-tetue', L('Foudre Têtue', 'Stubborn Bolt'),
    L('Ses capacités Électrique touchent même les Bestioles Sol.', 'Its Lightning moves even hit Ground Critters.'),
    { kind: 'ignoreImmunity', type: 'electrique' }),
  T('pleine-lune', L('Pleine Lune', 'Full Moon'),
    L('La nuit, son Atq. Spé. et sa Déf. Spé. sont 30 % plus fortes.', 'At night, its Sp. Atk and Sp. Def are 30% higher.'),
    { kind: 'nightBoost' }),
  T('clair-de-lune', L('Clair de Lune', 'Moonlight'),
    L('Son Atq. Spé. et sa Déf. Spé. sont 30 % plus fortes, de jour comme de nuit.', 'Its Sp. Atk and Sp. Def are 30% higher, by day and by night.'),
    { kind: 'nightBoost', always: true }),
  T('trio-de-choc', L('Trio de Choc', 'Shock Trio'),
    L('Ses attaques qui frappent une fois frappent encore, à un quart de la puissance : ils sont trois !', 'Its single-hit attacks hit again at a quarter of the power: there are three of them!'),
    { kind: 'parentalBond' }),
  T('cri-de-charge', L('Cri de Charge', 'Battle Cry'),
    L('En entrant au combat, son Attaque augmente.', 'When it comes into battle, its Attack rises.'),
    { kind: 'entryStage', target: 'self', stat: 'atk', stages: 1 }),
  T('vol-de-nuit', L('Vol de Nuit', 'Night Flight'),
    L('Sa Vitesse augmente à la fin de chaque tour.', 'Its Speed rises at the end of every turn.'),
    { kind: 'speedBoost' }),
  T('troisieme-oeil', L('Troisième Œil', 'Third Eye'),
    L('Son troisième œil hante les rêves : un adversaire endormi perd un huitième de ses PV à chaque tour.', 'Its third eye haunts dreams: a sleeping foe loses an eighth of its HP every turn.'),
    { kind: 'badDreams' }),
  T('plein-phare', L('Plein Phare', 'Full Beam'),
    L('Sa lanterne s’allume en grand : la Précision de l’adversaire baisse.', 'Its lantern blazes at full beam: the foe’s accuracy drops.'),
    { kind: 'entryStage', target: 'foe', stat: 'acc', stages: -1 }),
  T('gros-dodo', L('Gros Dodo', 'Deep Nap'),
    L('Quand il dort, il ne prend que la moitié des dégâts et récupère 1/8 de ses PV à chaque tour.', 'While asleep, it takes half the damage and gets back 1/8 of its HP each turn.'),
    { kind: 'sleepTank' }),
  T('passe-muraille', L('Passe-Muraille', 'Wall Walker'),
    L('La première attaque qu’il reçoit après être entré le traverse à moitié : elle ne fait que la moitié des dégâts.', 'The first attack it receives after coming in half passes through it, doing only half the damage.'),
    { kind: 'phaseFirst' }),
  T('arc-en-ciel', L('Arc-en-ciel', 'Rainbow'),
    L('Toutes ses capacités ont le bonus de type, quelle que soit leur couleur.', 'All its moves get the same-type bonus, whatever their colour.'),
    { kind: 'allStab' }),
  T('fourrure-douce', L('Fourrure Douce', 'Soft Fur'),
    L('Les capacités physiques ne lui font que la moitié des dégâts.', 'Physical moves do only half the damage to it.'),
    { kind: 'fluffy' }),
  T('poings-d-acier', L('Poings d’Acier', 'Iron Fists'),
    L('Ses coups de poing sont 30 % plus forts.', 'Its punches are 30% stronger.'),
    { kind: 'flagBoost', flag: 'punch', mult: 1.3 }),
  T('peau-de-mousse', L('Peau de Mousse', 'Moss Coat'),
    L('Les capacités Eau et Plante ne lui font que la moitié des dégâts.', 'Water and Grass moves do only half the damage to it.'),
    { kind: 'halve', types: ['eau', 'plante'] }),
  T('sable-sec', L('Sable Sec', 'Dry Sand'),
    L('Le sable sec boit l’eau et étouffe les plantes : les capacités Eau et Plante ne lui font que la moitié des dégâts.', 'Dry sand soaks up water and smothers plants: Water and Grass moves do only half the damage to it.'),
    { kind: 'halve', types: ['eau', 'plante'] }),
  T('laine-douillette', L('Laine Douillette', 'Snug Wool'),
    L('Sa laine épaisse amortit les coups : les capacités physiques ne lui font que la moitié des dégâts.', 'Its thick wool cushions the blows: physical moves do only half the damage to it.'),
    { kind: 'fluffy' }),
  T('rapiecage', L('Rapiéçage', 'Patched Up'),
    L('Ses haillons rapiécés amortissent les coups : les capacités Combat ne lui font que la moitié des dégâts.', 'Its patched rags soften the blows: Fighting moves do only half the damage to it.'),
    { kind: 'halve', types: ['combat'] }),
  T('vent-de-sable', L('Vent de Sable', 'Sand Wind'),
    L('Il soulève une tempête de sable quand il entre en combat.', 'It whips up a sandstorm when it comes in.'),
    { kind: 'entryWeather', weather: 'sable' }),
  T('patinoire', L('Patinoire', 'Ice Rink'),
    L('Il fait tomber la grêle quand il entre en combat.', 'It brings hail when it comes in.'),
    { kind: 'entryWeather', weather: 'grele' }),
  T('perle-de-pluie', L('Perle de Pluie', 'Rain Pearl'),
    L('Il fait tomber la pluie quand il entre en combat.', 'It brings rain when it comes in.'),
    { kind: 'entryWeather', weather: 'pluie' }),
  T('venin-frais', L('Venin Frais', 'Fresh Venom'),
    L('Ses capacités physiques empoisonnent l’adversaire 3 fois sur 10.', 'Its physical moves poison the foe 3 times in 10.'),
    { kind: 'touchStatus', status: 'poison', chance: 30 }),
  T('ciseaux-affutes', L('Ciseaux Affûtés', 'Sharp Scissors'),
    L('Ses capacités tranchantes (griffes, ciseaux, feuilles, ailes) sont 50 % plus fortes.', 'Its cutting moves (claws, scissors, leaves, wings) are 50% stronger.'),
    { kind: 'flagBoost', flag: 'cut', mult: 1.5 }),
  T('bebe-poche', L('Bébé Poche', 'Pouch Baby'),
    L('Son petit frappe aussi : chaque attaque touche une deuxième fois, à un quart de la puissance.', 'Its little one joins in: each attack hits a second time, at a quarter of the power.'),
    { kind: 'parentalBond' }),
  // iteration 11 families
  T('pressentiment', L('Pressentiment', 'Foresight'),
    L('Il sent venir la première attaque après son entrée : elle ne lui fait que la moitié des dégâts.', 'It senses the first attack after it comes in: that one does only half the damage.'),
    { kind: 'phaseFirst' }),
  T('griffes-malines', L('Griffes Malines', 'Sly Claws'),
    L('Ses capacités tranchantes (griffes, ciseaux, feuilles, ailes) sont 50 % plus fortes.', 'Its cutting moves (claws, scissors, leaves, wings) are 50% stronger.'),
    { kind: 'flagBoost', flag: 'cut', mult: 1.5 }),
  T('gaz-piquant', L('Gaz Piquant', 'Stinging Gas'),
    L('Qui le frappe de près respire son gaz : 3 fois sur 10, il est empoisonné.', 'Whoever hits it up close breathes in its gas: 3 times in 10, they are poisoned.'),
    { kind: 'contactStatus', status: 'poison', chance: 30 }),
  T('coquille-de-fer', L('Coquille de Fer', 'Iron Shell'),
    L('Les capacités Feu et Combat ne lui font que la moitié des dégâts.', 'Fire and Fighting moves do only half the damage to it.'),
    { kind: 'halve', types: ['feu', 'combat'] }),
  T('colere-noire', L('Colère Noire', 'Black Fury'),
    L('Chaque fois qu’il met un adversaire K.O., son Attaque monte.', 'Each time it knocks a foe out, its Attack goes up.'),
    { kind: 'statOnKO', stat: 'atk' }),
  T('nage-eclair', L('Nage Éclair', 'Dart Swim'),
    L('Quand il a tous ses PV, ses capacités Eau passent en premier.', 'At full HP, its Water moves go first.'),
    { kind: 'galeWings', type: 'eau' }),
  // the two legendaries and the unfinished cocoon they come from
  T('pas-fini', L('Pas Fini', 'Not Done Yet'),
    L('Tant qu’il a tous ses PV, il ne prend que la moitié des dégâts : on ne gomme pas un dessin pas fini !', 'At full HP, it takes only half the damage: you don’t rub out a drawing that isn’t finished!'),
    { kind: 'fullHpGuard' }),
  T('veilleuse', L('Veilleuse', 'Night-light'),
    L('La nuit, elle brille : son Atq. Spé. et sa Déf. Spé. sont 30 % plus fortes.', 'At night it glows: its Sp. Atk and Sp. Def are 30% stronger.'),
    { kind: 'nightBoost' }),
  T('mauvais-reves', L('Mauvais Rêves', 'Bad Dreams'),
    L('Un adversaire endormi fait des cauchemars : il perd un huitième de ses PV à chaque tour.', 'A sleeping foe has nightmares: it loses an eighth of its HP every turn.'),
    { kind: 'badDreams' }),
  // iteration 17
  T('peinture-rupestre', L('Peinture Rupestre', 'Cave Painting'),
    L('Il est peint sur la roche des grottes : les capacités Eau et Sol ne lui font que la moitié des dégâts.', 'It is painted on cave rock: Water and Ground moves do only half the damage to it.'),
    { kind: 'halve', types: ['eau', 'sol'] }),
  T('vent-arriere', L('Vent Arrière', 'Tailwind'),
    L('Quand il a tous ses PV, ses capacités Électrique passent en premier.', 'At full HP, its Lightning moves go first.'),
    { kind: 'galeWings', type: 'electrique' }),
  T('chasse-cauchemar', L('Chasse-Cauchemar', 'Nightmare Chaser'),
    L('Sa lumière chasse les mauvais rêves : les capacités Spectre et Ténèbres ne lui font que la moitié des dégâts.', 'Its light chases bad dreams away: Ghost and Dark moves do only half the damage to it.'),
    { kind: 'halve', types: ['spectre', 'tenebres'] }),
  T('flocons-fous', L('Flocons Fous', 'Snow Flurry'),
    L('En arrivant, il secoue sa coquille : il se met à grêler.', 'It shakes its shell as it arrives: hail starts to fall.'),
    { kind: 'entryWeather', weather: 'grele' }),
  T('atchoum', L('Atchoum', 'Achoo'),
    L('Il arrive dans un nuage de poussière : la Précision de l’adversaire baisse.', 'It arrives in a cloud of dust: the foe’s accuracy drops.'),
    { kind: 'entryStage', target: 'foe', stat: 'acc', stages: -1 }),
  // iteration 18: the new Ateliers' Bestioles
  T('bouclier-punaise', L('Bouclier Punaise', 'Pin Shield'),
    L('Sa carapace ronde le protège : les capacités Feu et Vol ne lui font que la moitié des dégâts.', 'Its round shell shields it: Fire and Flying moves do only half the damage to it.'),
    { kind: 'halve', types: ['feu', 'vol'] }),
  T('lanterne', L('Lanterne', 'Lantern'),
    L('La nuit, sa lanterne s’allume : son Atq. Spé. et sa Déf. Spé. sont 30 % plus fortes.', 'At night its lantern lights up: its Sp. Atk and Sp. Def are 30% higher.'),
    { kind: 'nightBoost' }),
  T('averse-d-ete', L('Averse d’Été', 'Summer Shower'),
    L('Elle chante en arrivant : il se met à pleuvoir.', 'It sings as it arrives: rain starts to fall.'),
    { kind: 'entryWeather', weather: 'pluie' }),
  T('herbier', L('Herbier', 'Herbarium'),
    L('Pressée entre deux pages, elle reprend des forces : elle récupère 1/16 de ses PV à chaque tour, et 1/8 au soleil.', 'Pressed between two pages, it gets its strength back: 1/16 of its HP each turn, and 1/8 in sunshine.'),
    { kind: 'regen', pct: 1 / 16, sunPct: 1 / 8 }),
  // iteration 19: the sea, the caves and the sandpaper
  T('poisson-d-avril', L('Poisson d’Avril', 'April Fool'),
    L('En arrivant, il fait une farce à l’adversaire : surpris, son Attaque baisse.', 'It plays a prank on the foe as it arrives: startled, the foe’s Attack drops.'),
    { kind: 'entryStage', target: 'foe', stat: 'atk', stages: -1 }),
  T('soie-urticante', L('Soie Urticante', 'Stinging Silk'),
    L('Ses rubans piquent : le toucher peut empoisonner l’attaquant (3 chances sur 10).', 'Its ribbons sting: touching it may poison the attacker (3 chances in 10).'),
    { kind: 'contactStatus', status: 'poison', chance: 30 }),
  T('poussiere-de-poncage', L('Poussière de Ponçage', 'Sanding Dust'),
    L('Il arrive en se frottant : une tempête de sable se lève.', 'It arrives rubbing itself down: a sandstorm blows up.'),
    { kind: 'entryWeather', weather: 'sable' }),
  T('vernis', L('Vernis', 'Varnish'),
    L('Une couche de vernis le protège : les capacités Eau et Plante ne lui font que la moitié des dégâts.', 'A coat of varnish shields it: Water and Grass moves do only half the damage to it.'),
    { kind: 'halve', types: ['eau', 'plante'] }),
  T('averse-d-encre', L('Averse d’Encre', 'Ink Shower'),
    L('Il fait tomber une pluie d’encre quand il entre en combat.', 'It brings a shower of ink when it comes in.'),
    { kind: 'entryWeather', weather: 'pluie' }),
  // the Lac des Couleurs
  T('huit-couleurs', L('Huit Couleurs', 'Eight Colours'),
    L('Chacun de ses bras a sa couleur : toutes ses capacités ont le bonus de type.', 'Each of its arms has its own colour: all its moves get the same-type bonus.'),
    { kind: 'allStab' }),
  T('voile-d-aquarelle', L('Voile d’Aquarelle', 'Watercolour Veil'),
    L('Ses voiles de couleur adoucissent tout : les coups super efficaces lui font moitié moins mal, et ses capacités de statut ne ratent jamais.', 'Its veils of colour soften everything: super-effective hits do half the damage, and its status moves never miss.'),
    { kind: 'prism' }),
  T('pelage-d-hiver', L('Pelage d’Hiver', 'Winter Coat'),
    L('Bien emmitouflé, il ne prend que la moitié des dégâts des capacités Feu et Combat.', 'Snugly wrapped up, it takes only half the damage from Fire and Fighting moves.'),
    { kind: 'halve', types: ['feu', 'combat'] }),
  T('caoutchouc', L('Caoutchouc', 'Rubbery'),
    L('Tout en gomme, il rebondit : les capacités physiques ne lui font que la moitié des dégâts.', 'All rubber, it bounces back: physical moves do only half the damage to it.'),
    { kind: 'fluffy' }),
  T('copeaux-amortis', L('Copeaux Amortis', 'Shaving Cushion'),
    L('Sa collerette de copeaux amortit les coups : les capacités Combat et Sol ne lui font que la moitié des dégâts.', 'Its collar of shavings cushions the blows: Fighting and Ground moves do only half the damage to it.'),
    { kind: 'halve', types: ['combat', 'sol'] }),
];

const BY_ID: Record<string, TalentDef> = Object.fromEntries(TALENTS.map((t) => [t.id, t]));

export function talent(id: string): TalentDef {
  const t = BY_ID[id];
  if (!t) throw new Error(`unknown talent ${id}`);
  return t;
}

/** Talent slots: 0 or 1 are the species' regular talents, 2 its hidden talent. */
export type TalentSlot = 0 | 1 | 2;

/** Chance (out of 1) to be born with the hidden talent. */
export const HIDDEN_TALENT_CHANCE = 0.25;

/**
 * A creature's talent: its species' talent in its slot (slot 1 falls back to 0 for one-talent species), or its
 * fair copy's when it is one and has its own.
 */
export function talentOf(m: { species: string; talent?: TalentSlot; fair?: boolean }): TalentDef {
  const own = m.fair ? fairCopyOf(m.species)?.talent : undefined;
  if (own) return talent(own);
  const sp = creature(m.species);
  return talent(m.talent === 2 ? sp.hiddenTalent : sp.talents[m.talent ?? 0] ?? sp.talents[0]);
}

/** The talent's effect when it is of that kind (typed), otherwise undefined. */
export function talentEffect<K extends TalentEffect['kind']>(m: { species: string; talent?: TalentSlot; fair?: boolean }, kind: K): Extract<TalentEffect, { kind: K }> | undefined {
  const e = talentOf(m).effect;
  return e.kind === kind ? (e as Extract<TalentEffect, { kind: K }>) : undefined;
}

/** A stable slot for Bestioles from saves made before talents existed (1 in 4 hidden, like new ones). */
export function talentFromUid(uid: string): TalentSlot {
  let h = 7;
  for (const c of uid) h = (h * 37 + c.charCodeAt(0)) >>> 0;
  return h % 4 === 0 ? 2 : ((h >>> 3) % 2) as TalentSlot;
}
