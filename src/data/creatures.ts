import { L, tr } from '../i18n';
import type { SpeciesDef, TypeId } from './schema';

/**
 * Every creature drawn by the little artist. To add a drawing: cut it with `npm run cards`
 * (see tools/cards-manifest.json), then add its entry here with the same id/slug.
 */
export const CREATURES: SpeciesDef[] = [
  {
    id: '001', slug: 'minousse', faces: 'left', name: L('Minousse', 'Sproutkit'), kind: L('Bestiole Chaton', 'Kitten Critter'),
    type: 'plante', base: { hp: 50, atk: 52, def: 50, spa: 62, spd: 62, spe: 46 },
    catchRate: 45, baseExp: 64, evYield: { spa: 1 }, rarity: 'uncommon',
    stencils: ['pochoir-02', 'pochoir-07', 'pochoir-09', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-15', 'pochoir-19'],
    talents: ['seve-rebelle'], hiddenTalent: 'grignote-feuilles',
    learnset: [[1, 'griffe'], [1, 'grondement'], [5, 'coup-de-liane'], [8, 'graine-gourmande'],
      [10, 'griffe-pousse'], [13, 'graine-dodo'], [17, 'pas-de-loup'], [21, 'feuille-coupante'],
      [26, 'ronron-soleil'], [31, 'rafale-de-graines'], [38, 'rayon-de-soleil']],
    dex: L(
      'Une petite pousse lui pousse sur le dos. Chaque fois qu’il ronronne, elle grandit un peu.',
      'A little sprout grows on its back. Every time it purrs, the sprout grows a bit.',
    ),
  },
  {
    id: '002', slug: 'braisou', faces: 'left', name: L('Braisou', 'Embunny'), kind: L('Bestiole Braise', 'Ember Critter'),
    type: 'feu', base: { hp: 45, atk: 58, def: 44, spa: 64, spd: 50, spe: 66 },
    catchRate: 45, baseExp: 64, evYield: { spe: 1 }, rarity: 'uncommon',
    stencils: ['pochoir-02', 'pochoir-05', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-16', 'pochoir-19'],
    talents: ['braise-tetue'], hiddenTalent: 'elan',
    learnset: [[1, 'griffe'], [1, 'grondement'], [5, 'flammeche'], [10, 'pas-de-loup'], [14, 'lueur-brulante'],
      [18, 'tourbillon-braises'], [23, 'queue-ardente'], [28, 'mordillage'], [30, 'grand-soleil'],
      [34, 'grand-brasier']],
    dex: L(
      'Le bout de sa queue est une petite braise. Il s’en sert pour faire griller les guimauves.',
      'The tip of its tail is a tiny ember. It uses it to toast marshmallows.',
    ),
  },
  {
    id: '003', slug: 'clapotin', faces: 'left', name: L('Clapotin', 'Splashell'), kind: L('Bestiole Flaque', 'Puddle Critter'),
    type: 'eau', base: { hp: 52, atk: 50, def: 64, spa: 62, spd: 62, spe: 44 },
    catchRate: 45, baseExp: 64, evYield: { def: 1 }, rarity: 'uncommon',
    stencils: ['pochoir-02', 'pochoir-03', 'pochoir-10', 'pochoir-12', 'pochoir-14', 'pochoir-15', 'pochoir-19'],
    talents: ['grosse-vague'], hiddenTalent: 'eponge',
    learnset: [[1, 'bousculade'], [1, 'fretillement'], [5, 'bulles'], [10, 'carapace-tambour'], [13, 'jet-d-eau'],
      [17, 'mordillage'], [19, 'averse'], [22, 'carapace-roulante'], [25, 'souffle-glace'], [28, 'coup-de-boule'],
      [33, 'grosse-vague']],
    dex: L(
      'Il tape sur sa carapace comme sur un tambour, et ses amis dansent dans les flaques.',
      'It drums on its shell, and its friends dance in the puddles.',
    ),
  },
  {
    id: '012', slug: 'chenillou', faces: 'left', name: L('Chenillou', 'Wigglet'), kind: L('Bestiole Chenille', 'Caterpillar Critter'),
    type: 'insecte', base: { hp: 45, atk: 32, def: 38, spa: 22, spd: 22, spe: 46 },
    catchRate: 255, baseExp: 50, evYield: { hp: 1 }, wildItem: { id: 'baie-bleue', pct: 5 }, rarity: 'common', evolutions: [{ to: '015', level: 7 }],
    stencils: ['pochoir-01', 'pochoir-12', 'pochoir-18'],
    talents: ['poudre-bouclier', 'nouvelle-peau'], hiddenTalent: 'pieds-legers',
    learnset: [[1, 'bousculade'], [1, 'fil-de-soie']],
    dex: L(
      'Il avance sur ses pattes rondes comme sur des roulettes. Un beau matin, il se réveillera avec des ailes.',
      'It rolls along on its round feet like little wheels. One fine morning it will wake up with wings.',
    ),
  },
  {
    id: '015', slug: 'chrysalou', faces: 'right', name: L('Chrysalou', 'Cocoonap'), kind: L('Bestiole Chrysalide', 'Chrysalis Critter'),
    type: 'insecte', base: { hp: 50, atk: 20, def: 60, spa: 25, spd: 30, spe: 25 },
    catchRate: 120, baseExp: 72, evYield: { def: 2 }, rarity: 'common', evolvesFrom: '012', evolutions: [{ to: '007', level: 10 }],
    stencils: ['pochoir-01', 'pochoir-12', 'pochoir-18'],
    talents: ['poudre-bouclier', 'nouvelle-peau'], hiddenTalent: 'increvable',
    learnset: [[1, 'bousculade'], [1, 'cocon-serre'], [7, 'cocon-serre']],
    dex: L(
      'Il ne bouge presque pas : à l’intérieur, il dessine en secret ses futures ailes. Sa coque pointue est plus dure qu’une mine de crayon.',
      'It hardly moves: inside, it secretly draws its future wings. Its pointy shell is harder than a pencil lead.',
    ),
  },
  {
    id: '007', slug: 'papivole', name: L('Papivole', 'Flutterbug'), kind: L('Bestiole Papillon', 'Butterfly Critter'),
    type: 'insecte', type2: 'vol', base: { hp: 48, atk: 35, def: 45, spa: 72, spd: 64, spe: 66 },
    catchRate: 120, baseExp: 100, evYield: { spa: 2, spd: 1 }, wildItem: { id: 'baie-menthe', pct: 5 }, rarity: 'common', evolvesFrom: '015',
    stencils: ['pochoir-01', 'pochoir-06', 'pochoir-07', 'pochoir-09', 'pochoir-12', 'pochoir-18', 'pochoir-19', 'pochoir-20'],
    talents: ['poudre-bouclier', 'mille-yeux'], hiddenTalent: 'bonne-etoile',
    learnset: [[1, 'bousculade'], [1, 'dard'], [10, 'coup-d-ailes'], [12, 'poudre-dodo'], [14, 'poudre-piquante'],
      [15, 'poudre-toxique'], [16, 'choc-mental'], [20, 'fil-enroule'], [21, 'rayon-d-ailes'], [27, 'poudre-arc-en-ciel']],
    dex: L(
      'Ses gros yeux rouges voient toutes les couleurs, même celles qu’on n’a pas encore inventées.',
      'Its big red eyes see every color, even the ones nobody has invented yet.',
    ),
  },
  {
    id: '013', slug: 'piafou', faces: 'right', name: L('Piafou', 'Chirpie'), kind: L('Bestiole Oiseau', 'Bird Critter'),
    type: 'normal', type2: 'vol', base: { hp: 45, atk: 56, def: 42, spa: 38, spd: 40, spe: 62 },
    catchRate: 200, baseExp: 62, evYield: { spe: 1 }, wildItem: { id: 'baie-peche', pct: 10 }, rarity: 'common',
    stencils: ['pochoir-01', 'pochoir-02', 'pochoir-11', 'pochoir-12', 'pochoir-17', 'pochoir-19', 'pochoir-20'],
    talents: ['oeil-de-lynx', 'coup-de-chance'], hiddenTalent: 'trait-assure',
    learnset: [[1, 'picore'], [1, 'grondement'], [5, 'pas-de-loup'], [9, 'rafale'], [13, 'coup-d-ailes'],
      [18, 'bec-vrille'], [24, 'coup-de-boule'], [27, 'grand-vol'], [30, 'grosse-voix']],
    dex: L(
      'Il chante dès le lever du soleil en gonflant ses plumes brunes. Avec lui, pas besoin de réveil !',
      'It sings at sunrise, puffing up its brown feathers. With it around, who needs an alarm clock?',
    ),
  },
  {
    id: '004', slug: 'zigzou', name: L('Zigzou', 'Ziggle'), kind: L('Bestiole Étincelle', 'Spark Critter'),
    type: 'electrique', base: { hp: 40, atk: 55, def: 38, spa: 52, spd: 46, spe: 88 },
    catchRate: 190, baseExp: 82, evYield: { spe: 1 }, wildItem: { id: 'baie-cerise', pct: 10 }, rarity: 'common',
    stencils: ['pochoir-02', 'pochoir-04', 'pochoir-11', 'pochoir-12', 'pochoir-17', 'pochoir-19'],
    talents: ['poils-electriques', 'pieds-legers'], hiddenTalent: 'pile-rechargeable',
    learnset: [[1, 'bousculade'], [1, 'grondement'], [5, 'petite-etincelle'], [8, 'fretillement'], [11, 'zap-zap'],
      [14, 'pas-de-loup'], [17, 'frisson'], [20, 'bouclier-papier'], [21, 'queue-eclair'], [26, 'agilite-zigzag'],
      [32, 'grand-zigzag']],
    dex: L(
      'Sa queue en zigzag fait des étincelles quand il est content. Attention aux cheveux !',
      'Its zigzag tail sparks when it’s happy. Mind your hair!',
    ),
  },
  {
    id: '005', slug: 'chantouille', name: L('Chantouille', 'Croonball'), kind: L('Bestiole Chanteuse', 'Singer Critter'),
    type: 'fee', type2: 'normal', base: { hp: 105, atk: 44, def: 28, spa: 48, spd: 32, spe: 22 },
    catchRate: 170, baseExp: 76, evYield: { hp: 2 }, wildItem: { id: 'baie-reveil', pct: 10 }, rarity: 'uncommon',
    stencils: ['pochoir-02', 'pochoir-04', 'pochoir-06', 'pochoir-09', 'pochoir-12', 'pochoir-14', 'pochoir-19'],
    talents: ['bonne-etoile', 'rembourrage'], hiddenTalent: 'recoloriage',
    learnset: [[1, 'berceuse'], [1, 'bousculade'], [5, 'micro-magique'], [9, 'chanson-douce'], [13, 'pirouette'],
      [17, 'bisou-magique'], [22, 'grosse-voix'], [25, 'pantin-papier'], [28, 'eclat-de-lune']],
    dex: L(
      'Elle ne lâche jamais son micro. Ses chansons endorment même les orages.',
      'It never lets go of its microphone. Its songs can put even thunderstorms to sleep.',
    ),
  },
  {
    id: '006', slug: 'lunelle', name: L('Lunelle', 'Moonbun'), kind: L('Bestiole Lune', 'Moon Critter'),
    type: 'fee', base: { hp: 68, atk: 45, def: 48, spa: 60, spd: 66, spe: 38 },
    catchRate: 150, baseExp: 68, evYield: { spd: 1 }, wildItem: { id: 'baie-bleue', pct: 15 }, rarity: 'common',
    stencils: ['pochoir-02', 'pochoir-03', 'pochoir-06', 'pochoir-09', 'pochoir-12', 'pochoir-14', 'pochoir-19'],
    talents: ['leve-tot', 'souple'], hiddenTalent: 'petit-soin',
    learnset: [[1, 'bousculade'], [1, 'chanson-douce'], [5, 'pirouette'], [9, 'calin-lunaire'],
      [13, 'micro-magique'], [17, 'choc-mental'], [20, 'bouclier-papier'], [22, 'bisou-magique'],
      [28, 'eclat-de-lune']],
    dex: L(
      'Elle danse sous la lune avec la petite boucle de sa tête. On dit qu’elle porte bonheur.',
      'It dances under the moon with the little curl on its head. They say it brings good luck.',
    ),
  },
  {
    id: '008', slug: 'ronflon', name: L('Ronflon', 'Snoozle'), kind: L('Bestiole Sieste', 'Napping Critter'),
    type: 'normal', base: { hp: 115, atk: 80, def: 58, spa: 50, spd: 80, spe: 25 },
    catchRate: 25, baseExp: 154, evYield: { hp: 2 }, wildItem: { id: 'gouter', pct: 5 }, rarity: 'rare',
    stencils: ['pochoir-02', 'pochoir-03', 'pochoir-04', 'pochoir-05', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-14', 'pochoir-15', 'pochoir-19'],
    talents: ['leve-tot', 'rembourrage'], hiddenTalent: 'increvable',
    learnset: [[1, 'bousculade'], [1, 'gros-baillement'], [8, 'ronflement'], [12, 'coup-de-boule'],
      [14, 'mordillage'], [16, 'grondement'], [20, 'plat-du-ventre'], [24, 'secousse'], [27, 'grosse-voix'],
      [33, 'eboulis']],
    dex: L(
      'Il dort 23 heures par jour. La dernière heure, il cherche un goûter.',
      'It sleeps 23 hours a day. It spends the last hour looking for a snack.',
    ),
  },
  {
    id: '009', slug: 'brumouille', name: L('Brumouille', 'Mistchief'), kind: L('Bestiole Brume', 'Mist Critter'),
    type: 'spectre', base: { hp: 32, atk: 35, def: 32, spa: 95, spd: 37, spe: 80 },
    catchRate: 190, baseExp: 95, evYield: { spa: 1 }, wildItem: { id: 'baie-givree', pct: 5 }, rarity: 'rare', evolutions: [{ to: '010', level: 16 }],
    stencils: ['pochoir-04', 'pochoir-08', 'pochoir-09', 'pochoir-11', 'pochoir-12', 'pochoir-18', 'pochoir-19'],
    talents: ['regard-noir', 'brume-epaisse'], hiddenTalent: 'petits-traits',
    learnset: [[1, 'bouh'], [1, 'brouillard'], [5, 'langue-fantome'], [8, 'coup-en-douce'], [9, 'regard-hypnotique'],
      [13, 'grimace'], [18, 'cauchemar'], [21, 'encre-toxique'], [24, 'ombre-farceuse'], [27, 'pantin-papier']],
    dex: L(
      'Une petite boule de brume qui sourit tout le temps. Les jours de pluie, elle se cache dans les nuages.',
      'A little ball of mist that is always smiling. On rainy days, it hides in the clouds.',
    ),
  },
  {
    id: '010', slug: 'grimouille', name: L('Grimouille', 'Grimist'), kind: L('Bestiole Brume', 'Mist Critter'),
    type: 'spectre', base: { hp: 47, atk: 55, def: 45, spa: 110, spd: 55, spe: 95 },
    catchRate: 90, baseExp: 126, evYield: { spa: 2 }, rarity: 'rare', evolvesFrom: '009', evolutions: [{ to: '011', level: 28 }],
    stencils: ['pochoir-04', 'pochoir-08', 'pochoir-09', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-18', 'pochoir-19'],
    talents: ['regard-noir', 'brume-epaisse'], hiddenTalent: 'petits-traits',
    learnset: [[1, 'bouh'], [1, 'brouillard'], [5, 'langue-fantome'], [8, 'coup-en-douce'], [9, 'regard-hypnotique'],
      [13, 'grimace'], [16, 'mains-de-brume'], [19, 'cauchemar'], [22, 'encre-toxique'], [27, 'ombre-farceuse'],
      [30, 'pantin-papier'], [33, 'rire-sinistre']],
    dex: L(
      'Sa tête flotte toute seule et ses mains font des bêtises de leur côté. Personne ne sait qui commande.',
      'Its head floats on its own while its hands get up to mischief. Nobody knows who is in charge.',
    ),
  },
  {
    id: '011', slug: 'ombrouille', name: L('Ombrouille', 'Gloomgrin'), kind: L('Bestiole Ombre', 'Shadow Critter'),
    type: 'spectre', type2: 'tenebres', base: { hp: 62, atk: 70, def: 60, spa: 125, spd: 75, spe: 110 },
    catchRate: 45, baseExp: 190, evYield: { spa: 3 }, rarity: 'legendary', evolvesFrom: '010',
    stencils: ['pochoir-04', 'pochoir-05', 'pochoir-08', 'pochoir-09', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-18', 'pochoir-19'],
    talents: ['regard-noir', 'brume-epaisse'], hiddenTalent: 'petits-traits',
    learnset: [[1, 'bouh'], [1, 'brouillard'], [1, 'coup-en-douce'], [5, 'langue-fantome'], [9, 'regard-hypnotique'],
      [13, 'grimace'], [16, 'mains-de-brume'], [19, 'cauchemar'], [22, 'encre-toxique'], [29, 'ombre-farceuse'],
      [32, 'pantin-papier'], [35, 'rire-sinistre']],
    dex: L(
      'Il se cache dans ton ombre et attend que tu rigoles pour rigoler encore plus fort.',
      'It hides in your shadow and waits for you to laugh, so it can laugh even louder.',
    ),
  },
  {
    id: '014', slug: 'lamacorne', faces: 'right', name: L('Lamacorne', 'Llamacorn'), kind: L('Bestiole Arc-en-ciel', 'Rainbow Critter'),
    type: 'psy', type2: 'fee', base: { hp: 65, atk: 55, def: 55, spa: 85, spd: 75, spe: 60 },
    catchRate: 60, baseExp: 140, evYield: { spa: 2 }, wildItem: { id: 'crayon-mauve', pct: 5 }, rarity: 'rare',
    stencils: ['pochoir-02', 'pochoir-06', 'pochoir-07', 'pochoir-09', 'pochoir-12', 'pochoir-16', 'pochoir-19'],
    talents: ['bonne-etoile', 'papier-epais'], hiddenTalent: 'recoloriage',
    learnset: [[1, 'bousculade'], [1, 'fretillement'], [6, 'choc-mental'], [12, 'coup-de-boule'],
      [19, 'chanson-douce'], [25, 'reve-eveille'], [28, 'souffle-dragon'], [32, 'eclat-de-lune'],
      [38, 'corne-arc-en-ciel']],
    dex: L(
      'Quand il est content, un petit arc-en-ciel jaillit de sa corne. La fleur de son flanc refleurit chaque printemps.',
      'When it is happy, a little rainbow bursts from its horn. The flower on its side blooms again every spring.',
    ),
  },
  {
    id: '016', slug: 'touffou', faces: 'left', name: L('Touffou', 'Fuzzkit'), kind: L('Bestiole Ébouriffée', 'Scruffy Critter'),
    type: 'normal', base: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 },
    catchRate: 45, baseExp: 65, evYield: { spd: 1 }, rarity: 'rare',
    // three magic pencils, three drawings: water, fire and lightning
    evolutions: [{ to: '017', item: 'crayon-magique-eau' }, { to: '018', item: 'crayon-magique-feu' }, { to: '019', item: 'crayon-magique-electrique' }],
    stencils: ['pochoir-02', 'pochoir-06', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-15', 'pochoir-17', 'pochoir-19'],
    talents: ['pieds-legers', 'trait-assure'], hiddenTalent: 'bonne-etoile',
    learnset: [[1, 'bousculade'], [1, 'fretillement'], [6, 'grondement'], [10, 'pas-de-loup'],
      [13, 'bouclier-papier'], [16, 'mordillage'], [22, 'coup-de-boule'], [26, 'pantin-papier'],
      [30, 'plat-du-ventre']],
    dex: L(
      'Sa fourrure ébouriffée change un peu chaque fois qu’on le redessine. On raconte qu’un jour, il pourra devenir bien des choses différentes.',
      'Its scruffy fur changes a little every time someone redraws it. They say that one day it could become many different things.',
    ),
  },
  {
    id: '017', slug: 'touflot', faces: 'right', name: L('Touflot', 'Fluffin'), kind: L('Bestiole Nageoire', 'Fin Critter'),
    type: 'eau', base: { hp: 108, atk: 54, def: 50, spa: 92, spd: 80, spe: 56 },
    catchRate: 45, baseExp: 170, evYield: { hp: 2 }, rarity: 'rare', evolvesFrom: '016',
    stencils: ['pochoir-02', 'pochoir-03', 'pochoir-06', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-14', 'pochoir-15', 'pochoir-17', 'pochoir-19'],
    talents: ['eponge', 'trait-assure'], hiddenTalent: 'grosse-vague',
    // [0, …]: learned the moment Touffou turns into it
    learnset: [[0, 'jet-d-eau'], [1, 'bousculade'], [1, 'fretillement'], [1, 'bulles'], [22, 'averse'],
      [26, 'pantin-papier'], [30, 'pluie-d-aquarelle'], [36, 'grosse-vague'], [42, 'bouclier-papier']],
    dex: L(
      'Quand Touffou touche un Crayon Magique Eau, sa fourrure devient lisse comme une vague. Il nage en tirant la langue et chante sous la pluie.',
      'When Fuzzkit touches a Magic Water Pencil, its fur turns smooth as a wave. It swims with its tongue out and sings in the rain.',
    ),
  },
  {
    id: '018', slug: 'toufeu', name: L('Toufeu', 'Flufflame'), kind: L('Bestiole Bouillotte', 'Hot-Water-Bottle Critter'),
    type: 'feu', base: { hp: 55, atk: 108, def: 50, spa: 80, spd: 92, spe: 55 },
    catchRate: 45, baseExp: 170, evYield: { atk: 2 }, rarity: 'rare', evolvesFrom: '016',
    stencils: ['pochoir-02', 'pochoir-05', 'pochoir-06', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-15', 'pochoir-17', 'pochoir-19'],
    talents: ['braise-tetue', 'trait-assure'], hiddenTalent: 'bonne-etoile',
    learnset: [[0, 'flammeche'], [1, 'bousculade'], [1, 'fretillement'], [1, 'grondement'], [16, 'mordillage'], [22, 'lueur-brulante'],
      [26, 'tourbillon-braises'], [30, 'coup-de-boule'], [36, 'queue-ardente'], [42, 'grand-brasier']],
    dex: L(
      'Assis dans son nid de flammes, il ne brûle jamais ses amis : sa fourrure est douce et tiède comme une bouillotte.',
      'Sitting in its nest of flames, it never burns its friends: its fur is soft and warm like a hot-water bottle.',
    ),
  },
  {
    id: '019', slug: 'toufoudre', faces: 'left', name: L('Toufoudre', 'Fluffbolt'), kind: L('Bestiole Pétillante', 'Fizzy Critter'),
    type: 'electrique', base: { hp: 55, atk: 55, def: 50, spa: 92, spd: 80, spe: 108 },
    catchRate: 45, baseExp: 170, evYield: { spe: 2 }, rarity: 'rare', evolvesFrom: '016',
    stencils: ['pochoir-02', 'pochoir-04', 'pochoir-06', 'pochoir-10', 'pochoir-11', 'pochoir-12', 'pochoir-13', 'pochoir-15', 'pochoir-17', 'pochoir-19'],
    talents: ['pile-rechargeable', 'trait-assure'], hiddenTalent: 'poils-electriques',
    learnset: [[0, 'petite-etincelle'], [1, 'bousculade'], [1, 'fretillement'], [1, 'grondement'], [16, 'zap-zap'], [22, 'frisson'],
      [26, 'agilite-zigzag'], [30, 'eclair-fluo'], [36, 'queue-eclair'], [42, 'grand-zigzag']],
    dex: L(
      'Ses poils se dressent en pointes pleines d’étincelles. Il court si vite qu’on ne voit qu’un trait jaune sur la page.',
      'Its fur stands up in spikes full of sparks. It runs so fast you only see a yellow streak across the page.',
    ),
  },
];

export const CREATURE_BY_ID: Record<string, SpeciesDef> = Object.fromEntries(CREATURES.map((c) => [c.id, c]));

export function creature(id: string): SpeciesDef {
  const c = CREATURE_BY_ID[id];
  if (!c) throw new Error(`Unknown creature ${id}`);
  return c;
}

/**
 * Bestiodex number: the position in CREATURES, which is ordered like a GBA dex (evolution lines
 * side by side). Ids stay the keys in saves, maps and card files and never change.
 */
export function dexNo(id: string): string {
  return String(CREATURES.findIndex((c) => c.id === id) + 1).padStart(3, '0');
}

/** A species' type(s): one, or two for dual-type Bestioles. */
export function typesOf(id: string): TypeId[] {
  const c = creature(id);
  return c.type2 ? [c.type, c.type2] : [c.type];
}

/** How a particular creature is called: its nickname, or its species' name. */
export function monLabel(m: { species: string; nickname?: string; egg?: unknown }): string {
  if (m.egg) return tr(L('Œuf', 'Egg'));
  return m.nickname || tr(creature(m.species).name);
}

export const STARTERS = ['001', '002', '003'] as const;

/** Battles mirror a drawing so both Bestioles face each other: ours looks right, the foe looks left. */
export function mirrored(c: SpeciesDef, foe: boolean): boolean {
  return c.faces === (foe ? 'right' : 'left');
}

export function artUrl(c: SpeciesDef): string {
  return `${import.meta.env.BASE_URL}cards/${c.id}-${c.slug}.webp`;
}
