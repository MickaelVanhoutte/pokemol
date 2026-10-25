import { L } from '../i18n';
import type { SpeciesDef } from './schema';

/**
 * Every creature drawn by the little artist. To add a drawing: cut it with `npm run cards`
 * (see tools/cards-manifest.json), then add its entry here with the same id/slug.
 */
export const CREATURES: SpeciesDef[] = [
  {
    id: '001', slug: 'minousse', faces: 'left', name: L('Minousse', 'Sproutkit'), kind: L('Bestiole Chaton', 'Kitten Critter'),
    type: 'plante', base: { hp: 50, atk: 52, def: 50, spa: 62, spd: 62, spe: 46 },
    catchRate: 45, baseExp: 64, evYield: { spa: 1 }, rarity: 'uncommon',
    learnset: [[1, 'griffe'], [1, 'grondement'], [5, 'coup-de-liane'], [10, 'griffe-pousse'], [13, 'graine-dodo'],
      [17, 'pas-de-loup'], [21, 'feuille-coupante'], [26, 'ronron-soleil'], [31, 'rafale-de-graines']],
    dex: L(
      'Une petite pousse lui pousse sur le dos. Chaque fois qu’il ronronne, elle grandit un peu.',
      'A little sprout grows on its back. Every time it purrs, the sprout grows a bit.',
    ),
  },
  {
    id: '002', slug: 'braisou', faces: 'left', name: L('Braisou', 'Embunny'), kind: L('Bestiole Braise', 'Ember Critter'),
    type: 'feu', base: { hp: 45, atk: 58, def: 44, spa: 64, spd: 50, spe: 66 },
    catchRate: 45, baseExp: 64, evYield: { spe: 1 }, rarity: 'uncommon',
    learnset: [[1, 'griffe'], [1, 'grondement'], [5, 'flammeche'], [10, 'pas-de-loup'], [14, 'lueur-brulante'],
      [18, 'tourbillon-braises'], [23, 'queue-ardente'], [28, 'mordillage'], [34, 'grand-brasier']],
    dex: L(
      'Le bout de sa queue est une petite braise. Il s’en sert pour faire griller les guimauves.',
      'The tip of its tail is a tiny ember. It uses it to toast marshmallows.',
    ),
  },
  {
    id: '003', slug: 'clapotin', faces: 'left', name: L('Clapotin', 'Splashell'), kind: L('Bestiole Flaque', 'Puddle Critter'),
    type: 'eau', base: { hp: 52, atk: 50, def: 64, spa: 52, spd: 62, spe: 42 },
    catchRate: 45, baseExp: 64, evYield: { def: 1 }, rarity: 'uncommon',
    learnset: [[1, 'bousculade'], [1, 'fretillement'], [5, 'bulles'], [10, 'carapace-tambour'], [13, 'jet-d-eau'],
      [17, 'mordillage'], [22, 'carapace-roulante'], [28, 'coup-de-boule'], [33, 'grosse-vague']],
    dex: L(
      'Il tape sur sa carapace comme sur un tambour, et ses amis dansent dans les flaques.',
      'It drums on its shell, and its friends dance in the puddles.',
    ),
  },
  {
    id: '004', slug: 'zigzou', name: L('Zigzou', 'Ziggle'), kind: L('Bestiole Étincelle', 'Spark Critter'),
    type: 'electrique', base: { hp: 40, atk: 55, def: 38, spa: 52, spd: 46, spe: 88 },
    catchRate: 190, baseExp: 82, evYield: { spe: 1 }, rarity: 'common',
    learnset: [[1, 'bousculade'], [1, 'grondement'], [5, 'petite-etincelle'], [8, 'fretillement'], [11, 'zap-zap'],
      [14, 'pas-de-loup'], [17, 'frisson'], [21, 'queue-eclair'], [26, 'agilite-zigzag'], [32, 'grand-zigzag']],
    dex: L(
      'Sa queue en zigzag fait des étincelles quand il est content. Attention aux cheveux !',
      'Its zigzag tail sparks when it’s happy. Mind your hair!',
    ),
  },
  {
    id: '005', slug: 'chantouille', name: L('Chantouille', 'Croonball'), kind: L('Bestiole Chanteuse', 'Singer Critter'),
    type: 'fee', base: { hp: 105, atk: 44, def: 28, spa: 48, spd: 32, spe: 22 },
    catchRate: 170, baseExp: 76, evYield: { hp: 2 }, rarity: 'uncommon',
    learnset: [[1, 'berceuse'], [1, 'bousculade'], [5, 'micro-magique'], [9, 'chanson-douce'], [13, 'pirouette'],
      [17, 'bisou-magique'], [22, 'grosse-voix'], [28, 'eclat-de-lune']],
    dex: L(
      'Elle ne lâche jamais son micro. Ses chansons endorment même les orages.',
      'It never lets go of its microphone. Its songs can put even thunderstorms to sleep.',
    ),
  },
  {
    id: '006', slug: 'lunelle', name: L('Lunelle', 'Moonbun'), kind: L('Bestiole Lune', 'Moon Critter'),
    type: 'fee', base: { hp: 68, atk: 45, def: 48, spa: 60, spd: 66, spe: 38 },
    catchRate: 150, baseExp: 68, evYield: { spd: 1 }, rarity: 'common',
    learnset: [[1, 'bousculade'], [1, 'chanson-douce'], [5, 'pirouette'], [9, 'calin-lunaire'], [13, 'micro-magique'],
      [17, 'choc-mental'], [22, 'bisou-magique'], [28, 'eclat-de-lune']],
    dex: L(
      'Elle danse sous la lune avec la petite boucle de sa tête. On dit qu’elle porte bonheur.',
      'It dances under the moon with the little curl on its head. They say it brings good luck.',
    ),
  },
  {
    id: '007', slug: 'papivole', name: L('Papivole', 'Flutterbug'), kind: L('Bestiole Papillon', 'Butterfly Critter'),
    type: 'insecte', base: { hp: 48, atk: 35, def: 45, spa: 72, spd: 64, spe: 66 },
    catchRate: 120, baseExp: 100, evYield: { spa: 2, spd: 1 }, rarity: 'common', evolvesFrom: '012',
    learnset: [[1, 'bousculade'], [1, 'dard'], [8, 'coup-d-ailes'], [9, 'poudre-dodo'], [11, 'poudre-piquante'],
      [13, 'poudre-toxique'], [16, 'choc-mental'], [21, 'rayon-d-ailes'], [27, 'poudre-arc-en-ciel']],
    dex: L(
      'Ses gros yeux rouges voient toutes les couleurs, même celles qu’on n’a pas encore inventées.',
      'Its big red eyes see every color, even the ones nobody has invented yet.',
    ),
  },
  {
    id: '008', slug: 'ronflon', name: L('Ronflon', 'Snoozle'), kind: L('Bestiole Sieste', 'Napping Critter'),
    type: 'normal', base: { hp: 115, atk: 80, def: 58, spa: 50, spd: 80, spe: 25 },
    catchRate: 25, baseExp: 154, evYield: { hp: 2 }, rarity: 'rare',
    learnset: [[1, 'bousculade'], [1, 'gros-baillement'], [8, 'ronflement'], [12, 'coup-de-boule'], [14, 'mordillage'], [16, 'grondement'],
      [20, 'plat-du-ventre'], [27, 'grosse-voix']],
    dex: L(
      'Il dort 23 heures par jour. La dernière heure, il cherche un goûter.',
      'It sleeps 23 hours a day. It spends the last hour looking for a snack.',
    ),
  },
  {
    id: '009', slug: 'brumouille', name: L('Brumouille', 'Mistchief'), kind: L('Bestiole Brume', 'Mist Critter'),
    type: 'spectre', base: { hp: 32, atk: 35, def: 32, spa: 95, spd: 37, spe: 80 },
    catchRate: 190, baseExp: 95, evYield: { spa: 1 }, rarity: 'rare', evolvesTo: '010', evolveLevel: 16,
    learnset: [[1, 'bouh'], [1, 'brouillard'], [5, 'langue-fantome'], [8, 'coup-en-douce'], [9, 'regard-hypnotique'], [13, 'grimace'],
      [18, 'cauchemar'], [24, 'ombre-farceuse']],
    dex: L(
      'Une petite boule de brume qui sourit tout le temps. Les jours de pluie, elle se cache dans les nuages.',
      'A little ball of mist that is always smiling. On rainy days, it hides in the clouds.',
    ),
  },
  {
    id: '010', slug: 'grimouille', name: L('Grimouille', 'Grimist'), kind: L('Bestiole Brume', 'Mist Critter'),
    type: 'spectre', base: { hp: 47, atk: 55, def: 45, spa: 110, spd: 55, spe: 95 },
    catchRate: 90, baseExp: 126, evYield: { spa: 2 }, rarity: 'rare', evolvesFrom: '009', evolvesTo: '011', evolveLevel: 28,
    learnset: [[1, 'bouh'], [1, 'brouillard'], [5, 'langue-fantome'], [8, 'coup-en-douce'], [9, 'regard-hypnotique'], [13, 'grimace'],
      [16, 'mains-de-brume'], [19, 'cauchemar'], [27, 'ombre-farceuse'], [33, 'rire-sinistre']],
    dex: L(
      'Sa tête flotte toute seule et ses mains font des bêtises de leur côté. Personne ne sait qui commande.',
      'Its head floats on its own while its hands get up to mischief. Nobody knows who is in charge.',
    ),
  },
  {
    id: '011', slug: 'ombrouille', name: L('Ombrouille', 'Gloomgrin'), kind: L('Bestiole Ombre', 'Shadow Critter'),
    type: 'spectre', base: { hp: 62, atk: 70, def: 60, spa: 125, spd: 75, spe: 110 },
    catchRate: 45, baseExp: 190, evYield: { spa: 3 }, rarity: 'legendary', evolvesFrom: '010',
    learnset: [[1, 'bouh'], [1, 'brouillard'], [1, 'coup-en-douce'], [5, 'langue-fantome'], [9, 'regard-hypnotique'],
      [13, 'grimace'], [16, 'mains-de-brume'], [19, 'cauchemar'], [29, 'ombre-farceuse'], [35, 'rire-sinistre']],
    dex: L(
      'Il se cache dans ton ombre et attend que tu rigoles pour rigoler encore plus fort.',
      'It hides in your shadow and waits for you to laugh, so it can laugh even louder.',
    ),
  },
  {
    id: '012', slug: 'chenillou', faces: 'left', name: L('Chenillou', 'Wigglet'), kind: L('Bestiole Chenille', 'Caterpillar Critter'),
    type: 'insecte', base: { hp: 45, atk: 32, def: 38, spa: 22, spd: 22, spe: 46 },
    catchRate: 255, baseExp: 50, evYield: { hp: 1 }, rarity: 'common', evolvesTo: '007', evolveLevel: 8,
    learnset: [[1, 'bousculade'], [1, 'fil-de-soie'], [5, 'dard']],
    dex: L(
      'Il avance sur ses pattes rondes comme sur des roulettes. Un beau matin, il se réveillera avec des ailes.',
      'It rolls along on its round feet like little wheels. One fine morning it will wake up with wings.',
    ),
  },
  {
    id: '013', slug: 'piafou', faces: 'right', name: L('Piafou', 'Chirpie'), kind: L('Bestiole Oiseau', 'Bird Critter'),
    type: 'normal', base: { hp: 45, atk: 56, def: 42, spa: 38, spd: 40, spe: 62 },
    catchRate: 200, baseExp: 62, evYield: { spe: 1 }, rarity: 'common',
    learnset: [[1, 'picore'], [1, 'grondement'], [5, 'pas-de-loup'], [9, 'rafale'], [13, 'coup-d-ailes'],
      [18, 'bec-vrille'], [24, 'coup-de-boule'], [30, 'grosse-voix']],
    dex: L(
      'Il chante dès le lever du soleil en gonflant ses plumes brunes. Avec lui, pas besoin de réveil !',
      'It sings at sunrise, puffing up its brown feathers. With it around, who needs an alarm clock?',
    ),
  },
];

export const CREATURE_BY_ID: Record<string, SpeciesDef> = Object.fromEntries(CREATURES.map((c) => [c.id, c]));

export function creature(id: string): SpeciesDef {
  const c = CREATURE_BY_ID[id];
  if (!c) throw new Error(`Unknown creature ${id}`);
  return c;
}

export const STARTERS = ['001', '002', '003'] as const;

/** Battles mirror a drawing so both Bestioles face each other: ours looks right, the foe looks left. */
export function mirrored(c: SpeciesDef, foe: boolean): boolean {
  return c.faces === (foe ? 'right' : 'left');
}

export function artUrl(c: SpeciesDef): string {
  return `${import.meta.env.BASE_URL}cards/${c.id}-${c.slug}.webp`;
}
