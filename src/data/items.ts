import { L } from '../i18n';
import { move } from './moves';
import { TYPES } from './types';
import type { ItemDef } from './schema';

/** Stencils, in order (pochoir-01…): the first eight are the Atelier Masters' rewards. */
export const STENCIL_MOVES = [
  'rayon-d-ailes', 'coup-de-boule', 'pluie-d-aquarelle', 'eclair-fluo', 'queue-ardente', 'eclat-de-lune',
  'rafale-de-graines', 'ombre-farceuse', 'reve-eveille', 'poing-crayon', 'tache-d-encre', 'gros-baillement',
  'eboulis', 'rayon-givre', 'secousse', 'griffe-dragon', 'aile-d-acier', 'pate-gluante', 'bouclier-papier', 'grand-vol',
];
export const stencilId = (n: number) => `pochoir-${String(n).padStart(2, '0')}`;

/** A stencil teaches its move to any compatible Bestiole, as often as you like (it never wears out). */
function stencil(moveId: string, i: number): ItemDef {
  const mv = move(moveId);
  const n = String(i + 1).padStart(2, '0');
  return {
    id: stencilId(i + 1), name: L(`Pochoir ${n} ${mv.name.fr}`, `Stencil ${n} ${mv.name.en}`), price: 0, kind: 'stencil', amount: 0, move: moveId,
    desc: L(`${mv.desc.fr} Un pochoir ne s’use jamais.`, `${mv.desc.en} A stencil never wears out.`),
  };
}

export const ITEMS: ItemDef[] = [
  {
    id: 'crayon-ball', name: L('Crayon-ball', 'Pencil Ball'), price: 200, kind: 'ball', amount: 10,
    desc: L('Une balle en crayon pour attraper les Bestioles sauvages.', 'A pencil ball to catch wild Critters.'),
  },
  {
    id: 'super-crayon-ball', name: L('Super Crayon-ball', 'Great Pencil Ball'), price: 600, kind: 'ball', amount: 15,
    desc: L('Une balle plus efficace que la Crayon-ball.', 'A ball that works better than a Pencil Ball.'),
  },
  {
    id: 'potion', name: L('Potion', 'Potion'), price: 300, kind: 'heal', amount: 20,
    desc: L('Rend 20 PV à une Bestiole.', 'Restores 20 HP to a Critter.'),
  },
  {
    id: 'super-potion', name: L('Super Potion', 'Super Potion'), price: 700, kind: 'heal', amount: 60,
    desc: L('Rend 60 PV à une Bestiole.', 'Restores 60 HP to a Critter.'),
  },
  {
    id: 'retouche', name: L('Retouche', 'Touch-Up'), price: 250, kind: 'status', amount: 0,
    desc: L('Un coup de pinceau qui soigne tous les problèmes de statut.', 'A brush stroke that cures every status problem.'),
  },
  {
    id: 'rappel', name: L('Rappel', 'Revive'), price: 1500, kind: 'revive', amount: 50,
    desc: L('Réveille une Bestiole K.O. avec la moitié de ses PV.', 'Revives a fainted Critter with half its HP.'),
  },
  // ---------------------------------------------------------------- field items (used on the map)
  {
    id: 'spray', name: L('Spray Anti-Gribouille', 'Shoo Spray'), price: 350, kind: 'field', amount: 100, field: 'repel',
    desc: L('Pendant 100 pas, les Bestioles sauvages plus faibles que la première de ton équipe t’évitent.', 'For 100 steps, wild Critters weaker than the first one in your party stay away.'),
  },
  {
    id: 'super-spray', name: L('Super Spray', 'Super Shoo Spray'), price: 500, kind: 'field', amount: 200, field: 'repel',
    desc: L('Pendant 200 pas, les Bestioles sauvages plus faibles que la première de ton équipe t’évitent.', 'For 200 steps, wild Critters weaker than the first one in your party stay away.'),
  },
  {
    id: 'fil-ariane', name: L('Fil d’Ariane', 'Ariadne Thread'), price: 550, kind: 'field', amount: 0, field: 'escape',
    desc: L('Dans une grotte, une tour ou un repaire : suis le fil jusqu’au dernier Centre de soin.', 'In a cave, tower or hideout: follow the thread back to the last Healing Center.'),
  },
  // ---------------------------------------------------------------- battle items (on the creature fighting)
  {
    id: 'sirop-attaque', name: L('Sirop d’Attaque', 'Attack Syrup'), price: 500, kind: 'battle', amount: 0, boost: 'atk',
    desc: L('Une gorgée qui augmente l’Attaque de la Bestiole au combat, jusqu’à ce qu’elle revienne.', 'A sip that raises the Attack of the Critter in battle, until it is withdrawn.'),
  },
  {
    id: 'sirop-defense', name: L('Sirop de Défense', 'Defense Syrup'), price: 550, kind: 'battle', amount: 0, boost: 'def',
    desc: L('Une gorgée qui augmente la Défense de la Bestiole au combat.', 'A sip that raises the Defense of the Critter in battle.'),
  },
  {
    id: 'sirop-vitesse', name: L('Sirop de Vitesse', 'Speed Syrup'), price: 350, kind: 'battle', amount: 0, boost: 'spe',
    desc: L('Une gorgée qui augmente la Vitesse de la Bestiole au combat.', 'A sip that raises the Speed of the Critter in battle.'),
  },
  {
    id: 'sirop-special', name: L('Sirop Spécial', 'Special Syrup'), price: 350, kind: 'battle', amount: 0, boost: 'spa',
    desc: L('Une gorgée qui augmente l’Attaque Spéciale de la Bestiole au combat.', 'A sip that raises the Sp. Atk of the Critter in battle.'),
  },
  {
    id: 'sirop-precision', name: L('Sirop de Précision', 'Accuracy Syrup'), price: 950, kind: 'battle', amount: 0, boost: 'acc',
    desc: L('Une gorgée qui augmente la Précision de la Bestiole au combat.', 'A sip that raises the accuracy of the Critter in battle.'),
  },
  {
    id: 'taille-crayon', name: L('Taille-crayon', 'Pencil Sharpener'), price: 650, kind: 'battle', amount: 0, boost: 'crit',
    desc: L('Une mine bien taillée : la Bestiole au combat porte plus souvent des coups critiques.', 'A sharp tip: the Critter in battle lands critical hits more often.'),
  },
  {
    id: 'vernis', name: L('Vernis Protecteur', 'Protective Varnish'), price: 700, kind: 'battle', amount: 0, boost: 'guard',
    desc: L('Un coup de vernis : pendant 5 tours, l’ennemi ne peut pas faire baisser les stats de ton équipe.', 'A coat of varnish: for 5 turns, the foe can’t lower your team’s stats.'),
  },
  // ---------------------------------------------------------------- berries (a Bestiole can hold one)
  {
    id: 'baie-bleue', name: L('Baie Bleue', 'Blue Berry'), price: 0, kind: 'berry', amount: 10,
    desc: L('Tenue, elle rend 10 PV quand les PV tombent à la moitié. Se mange aussi depuis le sac.', 'When held, restores 10 HP once HP drops to half. Can also be eaten from the bag.'),
  },
  {
    id: 'baie-doree', name: L('Baie Dorée', 'Golden Berry'), price: 0, kind: 'berry', amount: 30,
    desc: L('Tenue, elle rend 30 PV quand les PV tombent à la moitié. Se mange aussi depuis le sac.', 'When held, restores 30 HP once HP drops to half. Can also be eaten from the bag.'),
  },
  {
    id: 'baie-cerise', name: L('Baie Cerise', 'Cherry Berry'), price: 0, kind: 'berry', amount: 0, cures: ['paralyze'],
    desc: L('Tenue, elle guérit la paralysie.', 'When held, it cures paralysis.'),
  },
  {
    id: 'baie-reveil', name: L('Baie Réveil', 'Wake Berry'), price: 0, kind: 'berry', amount: 0, cures: ['sleep'],
    desc: L('Tenue, elle réveille la Bestiole qui s’endort.', 'When held, it wakes up its holder.'),
  },
  {
    id: 'baie-peche', name: L('Baie Pêche', 'Peach Berry'), price: 0, kind: 'berry', amount: 0, cures: ['poison'],
    desc: L('Tenue, elle guérit le poison.', 'When held, it cures poison.'),
  },
  {
    id: 'baie-givree', name: L('Baie Givrée', 'Frost Berry'), price: 0, kind: 'berry', amount: 0, cures: ['burn'],
    desc: L('Tenue, elle soigne les brûlures.', 'When held, it heals a burn.'),
  },
  {
    id: 'baie-menthe', name: L('Baie Menthe', 'Mint Berry'), price: 0, kind: 'berry', amount: 0, cures: ['confusion'],
    desc: L('Tenue, elle chasse la confusion en combat.', 'When held, it snaps its holder out of confusion.'),
  },
  {
    id: 'baie-prisme', name: L('Baie Prisme', 'Prism Berry'), price: 0, kind: 'berry', amount: 0,
    cures: ['sleep', 'paralyze', 'poison', 'burn', 'confusion'],
    desc: L('Tenue, elle guérit n’importe quel problème de statut, et la confusion.', 'When held, it cures any status problem, and confusion.'),
  },
  // ---------------------------------------------------------------- held items
  {
    id: 'gouter', name: L('Goûter', 'Snack'), price: 0, kind: 'hold', amount: 0, hold: 'regen',
    desc: L('À faire tenir. La Bestiole en grignote un peu à chaque tour de combat et récupère des PV.', 'An item to hold. Its holder nibbles a bit every turn of battle and regains HP.'),
  },
  // coloured pencils: moves of one type hit 20% harder
  ...([
    ['crayon-gris', 'normal', L('Crayon Gris', 'Grey Pencil'), L('gris', 'grey')],
    ['crayon-vert', 'plante', L('Crayon Vert', 'Green Pencil'), L('vert', 'green')],
    ['crayon-rouge', 'feu', L('Crayon Rouge', 'Red Pencil'), L('rouge', 'red')],
    ['crayon-bleu', 'eau', L('Crayon Bleu', 'Blue Pencil'), L('bleu', 'blue')],
    ['crayon-jaune', 'electrique', L('Crayon Jaune', 'Yellow Pencil'), L('jaune', 'yellow')],
    ['crayon-rose', 'fee', L('Crayon Rose', 'Pink Pencil'), L('rose', 'pink')],
    ['crayon-olive', 'insecte', L('Crayon Olive', 'Olive Pencil'), L('vert olive', 'olive')],
    ['crayon-mauve', 'psy', L('Crayon Mauve', 'Mauve Pencil'), L('mauve', 'mauve')],
    ['crayon-violet', 'spectre', L('Crayon Violet', 'Purple Pencil'), L('violet', 'purple')],
    ['crayon-orange', 'combat', L('Crayon Orange', 'Orange Pencil'), L('orange', 'orange')],
    ['crayon-noir', 'tenebres', L('Crayon Noir', 'Black Pencil'), L('noir', 'black')],
    ['crayon-ciel', 'vol', L('Crayon Bleu Ciel', 'Sky Blue Pencil'), L('bleu ciel', 'sky blue')],
    ['crayon-marron', 'sol', L('Crayon Marron', 'Brown Pencil'), L('marron', 'brown')],
    ['crayon-ocre', 'roche', L('Crayon Ocre', 'Ochre Pencil'), L('ocre', 'ochre')],
    ['crayon-blanc', 'glace', L('Crayon Blanc', 'White Pencil'), L('blanc', 'white')],
    ['crayon-lilas', 'poison', L('Crayon Lilas', 'Lilac Pencil'), L('lilas', 'lilac')],
    ['crayon-indigo', 'dragon', L('Crayon Indigo', 'Indigo Pencil'), L('indigo', 'indigo')],
    ['crayon-argent', 'acier', L('Crayon Argenté', 'Silver Pencil'), L('argenté', 'silver')],
  ] as const).map(([id, type, name, colour]): ItemDef => ({
    id, name, price: 0, kind: 'hold', amount: 0, hold: 'typeBoost', type,
    desc: L(`Un crayon de couleur ${colour.fr} bien taillé. À faire tenir : les capacités de type ${TYPES[type].name.fr} font 20 % de dégâts en plus.`,
      `A sharp ${colour.en} colouring pencil. To hold: ${TYPES[type].name.en}-type moves do 20% more damage.`),
  })),
  // magic pencils: some Bestioles evolve when redrawn with one (used from the bag)
  ...(['feu', 'eau', 'electrique', 'plante', 'glace', 'fee', 'psy', 'tenebres'] as const).map((type): ItemDef => ({
    id: `crayon-magique-${type}`, name: L(`Crayon Magique ${TYPES[type].name.fr}`, `Magic ${TYPES[type].name.en} Pencil`),
    price: 2100, kind: 'evo', amount: 0, type,
    desc: L(`Un crayon qui scintille, couleur ${TYPES[type].name.fr}. Certaines Bestioles évoluent quand on les redessine avec.`,
      `A shimmering ${TYPES[type].name.en}-coloured pencil. Some Critters evolve when they are redrawn with it.`),
  })),
  // stronger held items
  {
    id: 'bandeau-tetu', name: L('Bandeau Têtu', 'Stubborn Band'), price: 6000, kind: 'hold', amount: 0, hold: 'lockAtk',
    desc: L('Attaque ×1,5, mais la Bestiole s’entête : elle ne peut utiliser que sa première capacité tant qu’elle reste au combat.', 'Attack ×1.5, but its holder is stubborn: it can only use the first move it picks until it is withdrawn.'),
  },
  {
    id: 'lunettes-tetues', name: L('Lunettes Têtues', 'Stubborn Specs'), price: 6000, kind: 'hold', amount: 0, hold: 'lockSpa',
    desc: L('Atq. Spé. ×1,5, mais la Bestiole s’entête : elle ne peut utiliser que sa première capacité tant qu’elle reste au combat.', 'Sp. Atk ×1.5, but its holder is stubborn: it can only use the first move it picks until it is withdrawn.'),
  },
  {
    id: 'echarpe-tetue', name: L('Écharpe Têtue', 'Stubborn Scarf'), price: 6000, kind: 'hold', amount: 0, hold: 'lockSpe',
    desc: L('Vitesse ×1,5, mais la Bestiole s’entête : elle ne peut utiliser que sa première capacité tant qu’elle reste au combat.', 'Speed ×1.5, but its holder is stubborn: it can only use the first move it picks until it is withdrawn.'),
  },
  {
    id: 'bille-ardente', name: L('Bille Ardente', 'Fierce Marble'), price: 6000, kind: 'hold', amount: 0, hold: 'powerCost',
    desc: L('Une bille qui brûle les doigts : les attaques font 30 % de dégâts en plus, mais coûtent un peu de PV à chaque coup.', 'A marble that burns your fingers: attacks do 30% more damage, but each one costs a little HP.'),
  },
  {
    id: 'tablier-peintre', name: L('Tablier de Peintre', 'Painter’s Apron'), price: 6000, kind: 'hold', amount: 0, hold: 'specialGuard',
    desc: L('Déf. Spé. ×1,5, mais la Bestiole ne peut utiliser que des capacités offensives.', 'Sp. Def ×1.5, but its holder can only use attacking moves.'),
  },
  {
    id: 'casque-pointes', name: L('Casque à Pointes', 'Spiky Helmet'), price: 4000, kind: 'hold', amount: 0, hold: 'spikes',
    desc: L('Une Bestiole qui frappe le porteur au corps à corps perd un sixième de ses PV.', 'A Critter that hits the holder with a physical move loses a sixth of its HP.'),
  },
  {
    id: 'ruban-tenace', name: L('Ruban Tenace', 'Steadfast Ribbon'), price: 4000, kind: 'hold', amount: 0, hold: 'holdOn',
    desc: L('Si ses PV sont au maximum, la Bestiole tient bon avec 1 PV au lieu d’être K.O. Ne sert qu’une fois.', 'At full HP, its holder survives a knockout hit with 1 HP. Works once.'),
  },
  {
    id: 'plume-vive', name: L('Plume Vive', 'Swift Quill'), price: 3000, kind: 'hold', amount: 0, hold: 'quickStart',
    desc: L('Une plume à dessin si légère que, parfois, la Bestiole agit en premier.', 'A drawing quill so light that its holder sometimes moves first.'),
  },
  {
    id: 'loupe', name: L('Loupe de Dessinateur', 'Drafter’s Loupe'), price: 3000, kind: 'hold', amount: 0, hold: 'critUp',
    desc: L('Une loupe qui aide à viser : plus de coups critiques.', 'A magnifying glass that helps aim: more critical hits.'),
  },
  {
    id: 'couronne-carton', name: L('Couronne en Carton', 'Cardboard Crown'), price: 3000, kind: 'hold', amount: 0, hold: 'flinchUp',
    desc: L('Une couronne qui impressionne : quand le porteur attaque, l’ennemi peut avoir peur et ne pas agir.', 'An impressive crown: when its holder attacks, the foe may flinch.'),
  },
  {
    id: 'clochette', name: L('Clochette Gourmande', 'Greedy Bell'), price: 3000, kind: 'hold', amount: 0, hold: 'drainHit',
    desc: L('Rend au porteur un huitième des dégâts qu’il inflige.', 'Restores an eighth of the damage its holder deals.'),
  },
  {
    id: 'papier-calque', name: L('Papier Calque', 'Tracing Paper'), price: 0, kind: 'hold', amount: 0, hold: 'shareXp',
    desc: L('À faire tenir. La Bestiole décalque tout ce que voit l’équipe : elle reçoit la moitié de l’expérience, même sans combattre.', 'An item to hold. Its holder traces everything the team sees: it gets half the experience, even without fighting.'),
  },
  ...STENCIL_MOVES.map(stencil),
  {
    id: 'baskets', name: L('Baskets-Éclair', 'Zip Sneakers'), price: 0, kind: 'key', amount: 0,
    desc: L('Des baskets dessinées au feutre rouge, avec un éclair sur le côté. Maintiens B pour courir !', 'Sneakers drawn in red felt-tip, with a lightning bolt on the side. Hold B to run!'),
  },
  {
    id: 'carte', name: L('Carte de Papeterre', 'Papeterra Map'), price: 0, kind: 'key', amount: 0,
    desc: L('Toute la région dessinée sur une feuille. Choisis LIRE pour voir où tu es et où aller ensuite.', 'The whole region drawn on one sheet. Choose READ to see where you are and where to go next.'),
  },
  {
    id: 'ticket-or', name: L('Ticket d’or', 'Golden Ticket'), price: 0, kind: 'key', amount: 0,
    desc: L('Un ticket brillant tombé de la poche du monsieur de la tombola, à Port-Aquarelle.', 'A shiny ticket dropped by the fair man of Port Aquarelle.'),
  },
  ...Array.from({ length: 12 }, (_, i): ItemDef => ({
    id: `page-${i + 1}`, name: L(`Page déchirée n°${i + 1}`, `Torn page #${i + 1}`), price: 0, kind: 'key', amount: 0,
    desc: L('Une page arrachée d’un cahier de dessin. Choisis LIRE pour la regarder.', 'A page torn from a sketchbook. Choose READ to look at it.'),
  })),
];

export const ITEM_BY_ID: Record<string, ItemDef> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/** Things a Bestiole can hold (anything but key items and stencils). */
export const canHold = (def: ItemDef) => def.kind !== 'key' && def.kind !== 'stencil';

export function item(id: string): ItemDef {
  const i = ITEM_BY_ID[id];
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
}
