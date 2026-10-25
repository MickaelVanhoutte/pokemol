import { L } from '../i18n';
import type { CreatureDef } from './schema';

/**
 * Every creature drawn by the artist. To add a drawing: cut it with `npm run cards`
 * (see tools/cards-manifest.json), then add its entry here with the same id/slug.
 */
export const CREATURES: CreatureDef[] = [
  {
    id: '001', slug: 'minousse', name: L('Minousse', 'Sproutkit'),
    type: 'plante', stage: 'bebe', hp: 60, retreat: 1, weakness: 'feu', resistance: 'eau',
    rarity: 'uncommon', series: 1, catchRate: 0.3,
    attacks: [
      {
        id: 'griffe-pousse', name: L('Griffe-pousse', 'Sprout Swipe'), cost: 1, damage: 10,
        effects: [{ kind: 'heal', amount: 10, target: 'self' }],
        text: L('Soigne 10 dégâts à Minousse.', 'Heal 10 damage from Sproutkit.'),
      },
      {
        id: 'graine-dodo', name: L('Graine dodo', 'Sleepy Seed'), cost: 2, damage: 20,
        effects: [{ kind: 'coin', heads: [{ kind: 'status', status: 'sleep', target: 'defender' }] }],
        text: L('Lancez une pièce. Si c’est face, le défenseur s’endort.', 'Flip a coin. If heads, the defender falls asleep.'),
      },
    ],
    flavor: L(
      'Une petite pousse lui pousse sur le dos. Chaque fois qu’il ronronne, elle grandit un peu.',
      'A little sprout grows on its back. Every time it purrs, the sprout grows a bit.',
    ),
  },
  {
    id: '002', slug: 'braisou', name: L('Braisou', 'Embunny'),
    type: 'feu', stage: 'bebe', hp: 50, retreat: 1, weakness: 'eau',
    rarity: 'uncommon', series: 1, catchRate: 0.3,
    attacks: [
      { id: 'flammeche', name: L('Flammèche', 'Ember Puff'), cost: 1, damage: 20 },
      {
        id: 'queue-ardente', name: L('Queue ardente', 'Blazing Tail'), cost: 3, damage: 50,
        effects: [{ kind: 'discardEnergy', count: 1, target: 'self' }],
        text: L('Défaussez 1 énergie de Braisou.', 'Discard 1 energy from Embunny.'),
      },
    ],
    flavor: L(
      'Le bout de sa queue est une petite braise. Il s’en sert pour faire griller les guimauves.',
      'The tip of its tail is a tiny ember. It uses it to toast marshmallows.',
    ),
  },
  {
    id: '003', slug: 'clapotin', name: L('Clapotin', 'Splashell'),
    type: 'eau', stage: 'bebe', hp: 60, retreat: 1, weakness: 'plante',
    rarity: 'uncommon', series: 1, catchRate: 0.3,
    attacks: [
      {
        id: 'bulles', name: L('Bulles', 'Bubbles'), cost: 1, damage: 10,
        effects: [{ kind: 'coin', heads: [{ kind: 'status', status: 'paralyze', target: 'defender' }] }],
        text: L('Lancez une pièce. Si c’est face, le défenseur est paralysé.', 'Flip a coin. If heads, the defender is paralyzed.'),
      },
      {
        id: 'carapace-tambour', name: L('Carapace-tambour', 'Shell Drum'), cost: 2, damage: 20,
        effects: [{ kind: 'protect', amount: 20 }],
        text: L(
          'Pendant le prochain tour de l’adversaire, Clapotin subit 20 dégâts de moins.',
          'During your opponent’s next turn, Splashell takes 20 less damage.',
        ),
      },
    ],
    flavor: L(
      'Il tape sur sa carapace comme sur un tambour, et ses amis dansent dans les flaques.',
      'It drums on its shell, and its friends dance in the puddles.',
    ),
  },
  {
    id: '004', slug: 'zigzou', name: L('Zigzou', 'Ziggle'),
    type: 'electrique', stage: 'bebe', hp: 50, retreat: 1, weakness: 'combat',
    rarity: 'common', series: 1, catchRate: 0.45,
    attacks: [
      {
        id: 'zap-zap', name: L('Zap-zap', 'Zap-Zap'), cost: 1, damage: 10, mod: { kind: 'perHeads', flips: 2 },
        text: L('Lancez 2 pièces. 10 dégâts pour chaque face.', 'Flip 2 coins. 10 damage for each heads.'),
      },
      {
        id: 'queue-eclair', name: L('Queue éclair', 'Lightning Tail'), cost: 2, damage: 30,
        effects: [{ kind: 'coin', tails: [{ kind: 'selfDamage', amount: 10 }] }],
        text: L('Lancez une pièce. Si c’est pile, Zigzou s’inflige 10 dégâts.', 'Flip a coin. If tails, Ziggle does 10 damage to itself.'),
      },
    ],
    flavor: L(
      'Sa queue en zigzag fait des étincelles quand il est content. Attention aux cheveux !',
      'Its zigzag tail sparks when it’s happy. Mind your hair!',
    ),
  },
  {
    id: '005', slug: 'chantouille', name: L('Chantouille', 'Croonball'),
    type: 'fee', stage: 'bebe', hp: 60, retreat: 1, weakness: 'spectre',
    rarity: 'uncommon', series: 1, catchRate: 0.3,
    attacks: [
      { id: 'micro-magique', name: L('Micro magique', 'Magic Mic'), cost: 1, damage: 10 },
      {
        id: 'berceuse', name: L('Berceuse', 'Lullaby'), cost: 2, damage: 0,
        effects: [{ kind: 'status', status: 'sleep', target: 'defender' }],
        text: L('Le défenseur s’endort.', 'The defender falls asleep.'),
      },
    ],
    flavor: L(
      'Elle ne lâche jamais son micro. Ses chansons endorment même les orages.',
      'It never lets go of its microphone. Its songs can put even thunderstorms to sleep.',
    ),
  },
  {
    id: '006', slug: 'lunelle', name: L('Lunelle', 'Moonbun'),
    type: 'fee', stage: 'bebe', hp: 50, retreat: 1, weakness: 'spectre',
    rarity: 'common', series: 1, catchRate: 0.45,
    attacks: [
      {
        id: 'calin-lunaire', name: L('Câlin lunaire', 'Moon Hug'), cost: 1, damage: 0,
        effects: [{ kind: 'heal', amount: 10, target: 'team' }],
        text: L('Soigne 10 dégâts à chacune de vos Bestioles.', 'Heal 10 damage from each of your Critters.'),
      },
      {
        id: 'pirouette', name: L('Pirouette', 'Twirl'), cost: 2, damage: 20, mod: { kind: 'perHeads', flips: 2 },
        text: L('Lancez 2 pièces. 20 dégâts pour chaque face.', 'Flip 2 coins. 20 damage for each heads.'),
      },
    ],
    flavor: L(
      'Elle danse sous la lune avec la petite boucle de sa tête. On dit qu’elle porte bonheur.',
      'It dances under the moon with the little curl on its head. They say it brings good luck.',
    ),
  },
  {
    id: '007', slug: 'papivole', name: L('Papivole', 'Flutterbug'),
    type: 'insecte', stage: 'bebe', hp: 50, retreat: 0, weakness: 'feu',
    rarity: 'common', series: 1, catchRate: 0.45,
    attacks: [
      {
        id: 'poudre-dodo', name: L('Poudre dodo', 'Sleep Powder'), cost: 1, damage: 10,
        effects: [{ kind: 'coin', heads: [{ kind: 'status', status: 'sleep', target: 'defender' }] }],
        text: L('Lancez une pièce. Si c’est face, le défenseur s’endort.', 'Flip a coin. If heads, the defender falls asleep.'),
      },
      {
        id: 'battement-ailes', name: L('Coup d’ailes', 'Wing Gust'), cost: 2, damage: 20,
        effects: [{ kind: 'forceSwitch' }],
        text: L(
          'Le vent pousse le défenseur : l’adversaire l’échange avec une Bestiole de son banc, au hasard.',
          'The wind pushes the defender away: your opponent switches it with a random benched Critter.',
        ),
      },
    ],
    flavor: L(
      'Ses gros yeux rouges voient toutes les couleurs, même celles qu’on n’a pas encore inventées.',
      'Its big red eyes see every color, even the ones nobody has invented yet.',
    ),
  },
  {
    id: '008', slug: 'ronflon', name: L('Ronflon', 'Snoozle'),
    type: 'normal', stage: 'bebe', hp: 100, retreat: 3, weakness: 'combat',
    rarity: 'rare', series: 1, catchRate: 0.15,
    attacks: [
      {
        id: 'baillement', name: L('Gros bâillement', 'Big Yawn'), cost: 1, damage: 0,
        effects: [{ kind: 'heal', amount: 30, target: 'self' }, { kind: 'status', status: 'sleep', target: 'self' }],
        text: L('Ronflon se soigne de 30 dégâts et s’endort.', 'Snoozle heals 30 damage and falls asleep.'),
      },
      {
        id: 'gros-dodo', name: L('Plat du ventre', 'Belly Flop'), cost: 3, damage: 50,
        effects: [{ kind: 'coin', tails: [{ kind: 'status', status: 'sleep', target: 'self' }] }],
        text: L('Lancez une pièce. Si c’est pile, Ronflon s’endort.', 'Flip a coin. If tails, Snoozle falls asleep.'),
      },
    ],
    flavor: L(
      'Il dort 23 heures par jour. La dernière heure, il cherche un goûter.',
      'It sleeps 23 hours a day. It spends the last hour looking for a snack.',
    ),
  },
  {
    id: '009', slug: 'brumouille', name: L('Brumouille', 'Mistchief'),
    type: 'spectre', stage: 'bebe', hp: 50, retreat: 1, weakness: 'tenebres', resistance: 'combat',
    rarity: 'rare', series: 1, catchRate: 0.25, evolvesTo: '010', evolveLevel: 5,
    attacks: [
      {
        id: 'bouh', name: L('Bouh !', 'Boo!'), cost: 1, damage: 10,
        effects: [{ kind: 'discardHand', count: 1 }],
        text: L(
          'Le défenseur sursaute et laisse tomber une carte de sa main, au hasard.',
          'The defender jumps and drops a random card from their hand.',
        ),
      },
      {
        id: 'brouillard', name: L('Brouillard qui pique', 'Stinging Fog'), cost: 2, damage: 30,
        effects: [{ kind: 'status', status: 'blind', target: 'defender' }],
        text: L(
          'Le défenseur ne voit plus rien : sa prochaine attaque rate sur face.',
          'The defender can’t see a thing: its next attack misses on heads.',
        ),
      },
    ],
    flavor: L(
      'Une petite boule de brume qui sourit tout le temps. Les jours de pluie, elle se cache dans les nuages.',
      'A little ball of mist that is always smiling. On rainy days, it hides in the clouds.',
    ),
  },
  {
    id: '010', slug: 'grimouille', name: L('Grimouille', 'Grimist'),
    type: 'spectre', stage: 'grand', hp: 80, retreat: 1, weakness: 'tenebres', resistance: 'combat',
    rarity: 'rare', series: 1, catchRate: 0.1, evolvesFrom: '009', evolvesTo: '011', evolveLevel: 10,
    attacks: [
      {
        id: 'grimace', name: L('Grimace', 'Scary Face'), cost: 1, damage: 20,
        effects: [{ kind: 'coin', heads: [{ kind: 'status', status: 'confuse', target: 'defender' }] }],
        text: L('Lancez une pièce. Si c’est face, le défenseur est confus.', 'Flip a coin. If heads, the defender is confused.'),
      },
      {
        id: 'mains-de-brume', name: L('Mains de brume', 'Mist Hands'), cost: 3, damage: 50,
        effects: [{ kind: 'cantRetreat' }],
        text: L(
          'Les petites mains attrapent le défenseur : il ne peut pas battre en retraite au prochain tour.',
          'The little hands grab the defender: it can’t retreat during the next turn.',
        ),
      },
    ],
    flavor: L(
      'Sa tête flotte toute seule et ses mains font des bêtises de leur côté. Personne ne sait qui commande.',
      'Its head floats on its own while its hands get up to mischief. Nobody knows who is in charge.',
    ),
  },
  {
    id: '011', slug: 'ombrouille', name: L('Ombrouille', 'Gloomgrin'),
    type: 'spectre', stage: 'maitre', hp: 120, retreat: 2, weakness: 'tenebres', resistance: 'combat',
    rarity: 'holo', series: 1, catchRate: 0.05, evolvesFrom: '010',
    attacks: [
      {
        id: 'ombre-farceuse', name: L('Ombre farceuse', 'Prankster Shadow'), cost: 2, damage: 40,
        effects: [{ kind: 'discardHand', count: 1 }],
        text: L('Le défenseur laisse tomber une carte de sa main, au hasard.', 'The defender drops a random card from their hand.'),
      },
      {
        id: 'cauchemar', name: L('Cauchemar', 'Nightmare'), cost: 3, damage: 60,
        mod: { kind: 'bonusIfStatus', status: 'sleep', bonus: 60 },
        text: L('Si le défenseur est endormi, cette attaque inflige 60 dégâts de plus.', 'If the defender is asleep, this attack does 60 more damage.'),
      },
    ],
    flavor: L(
      'Il se cache dans ton ombre et attend que tu rigoles pour rigoler encore plus fort.',
      'It hides in your shadow and waits for you to laugh, so it can laugh even louder.',
    ),
  },
];

export const CREATURE_BY_ID: Record<string, CreatureDef> = Object.fromEntries(CREATURES.map((c) => [c.id, c]));

export function creature(id: string): CreatureDef {
  const c = CREATURE_BY_ID[id];
  if (!c) throw new Error(`Unknown creature ${id}`);
  return c;
}

export const STARTERS = ['001', '002', '003'] as const;

export function artUrl(c: CreatureDef): string {
  return `${import.meta.env.BASE_URL}cards/${c.id}-${c.slug}.webp`;
}
