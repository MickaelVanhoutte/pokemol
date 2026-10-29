/**
 * Papeterre after the ending: Team Gomme put their erasers away and coloured in their uniforms (no more
 * battles, a few give an eraser back), and the colours come back to the Blank Road and the Edge of the Page in
 * stages as the post-game goes on. Residents' new lines are on the maps (`afterStory` on an NPC).
 */
import { L, type LText } from '../i18n';
import type { Look } from '../overworld/sprites';
import { BADGES } from './badges';
import { TRAINERS } from './trainers';
import type { Reward } from './progress';

/** What an old grunt says, picked by its trainer id. */
export const REPENT_LINES: LText[] = [
  L('On a rangé nos gommes. Maintenant, on apprend à dessiner… C’est bien plus dur que d’effacer !', 'We’ve put our erasers away. Now we’re learning to draw… It’s much harder than rubbing out!'),
  L('Regarde mon uniforme : je l’ai colorié moi-même. Ça dépasse un peu… mais j’aime bien comme ça.', 'Look at my uniform: I coloured it in myself. It goes over the lines a bit… but I like it that way.'),
  L('Avant, je gommais tout ce qui dépassait. Maintenant, je laisse dépasser. C’est drôlement reposant.', 'I used to rub out everything that went over the lines. Now I let it. It’s awfully relaxing.'),
  L('J’ai fait mon premier dessin hier : un Chenillou avec trois pattes de trop. Je l’ai gardé.', 'I made my first drawing yesterday: a Chenillou with three legs too many. I kept it.'),
  L('Effacer, c’était mon métier. Maintenant, je taille les crayons des autres. Ils n’ont jamais été aussi pointus !', 'Rubbing out was my job. Now I sharpen other people’s pencils. They’ve never been so pointy!'),
  L('On disait qu’une page blanche, c’était parfait. Mais avec un dessin dessus, c’est tellement plus joli !', 'They said a blank page was perfect. But with a drawing on it, it’s so much prettier!'),
  L('Pardon pour avant… Tu veux voir mon dessin ? C’est un soleil. Ou une pomme. Je ne sais plus très bien.', 'Sorry about before… Want to see my drawing? It’s a sun. Or an apple. I’m not quite sure any more.'),
  L('Ma Bestiole a retrouvé toutes ses couleurs. Elle ne veut plus que je la dessine en gris, et elle a bien raison.', 'My Critter got all its colours back. It won’t let me draw it in grey any more, and it’s quite right.'),
];

/** Team Gomme's admins, where you last met them (the fortress top). */
export const ADMIN_LINES: Record<string, LText[]> = {
  rature3: [
    L('Pfff. Le Grand Effaceur est parti, et moi, je ne sais faire que des ratures.', 'Pfff. The Great Eraser is gone, and all I know how to do is scribble things out.'),
    L('… Ville-Feutre m’a demandé de tracer les lignes de leur terrain de jeux. Des traits bien droits. J’ai dit oui. Pfff.', '… Felt City asked me to draw the lines of their playground. Nice straight lines. I said yes. Pfff.'),
  ],
  buvard2: [
    L('Ho ho ! J’ai rangé mon buvard au fond de la cale. Maintenant, je collectionne les taches : chacune a sa forme à elle !', 'Ho ho! I’ve stowed my blotter in the hold. Now I collect blots: every one has a shape of its own!'),
  ],
  blanche3: [
    L('Tout ce blanc… J’ai dessiné une petite fleur au coin de ma cape. Juste une. Pour commencer.', 'All this white… I drew a little flower in the corner of my cape. Just one. To start with.'),
  ],
};

/** Earlier places of the admins: after the ending they are only at the fortress top. */
export const RETIRED = ['rature', 'rature2', 'blanche', 'blanche2', 'buvard'];

/** A few old grunts give back an eraser (it rubs out effort points), once. */
export const REPENT_GIFTS: Record<string, Reward> = {
  r4gomme: { item: 'gomme-pv', n: 3 },
  gomme1: { item: 'gomme-attaque', n: 3 },
  e1g1: { item: 'gomme-defense', n: 3 },
  tgomme1: { item: 'gomme-atq-spe', n: 3 },
  ph1a: { item: 'gomme-def-spe', n: 3 },
  u1g1: { item: 'gomme-vitesse', n: 3 },
};
export const REPENT_GIFT_LINE = L('Tiens, je n’en ai plus besoin. Une gomme, ça sert à corriger un petit peu… pas à tout effacer.', 'Here, I don’t need these any more. An eraser is for fixing things a little… not for rubbing everything out.');

/** Team Gomme stops battling once the story is over. */
export const repentant = (trainer: string | undefined, ending: boolean) => ending && !!trainer && !!TRAINERS[trainer]?.grey;

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const SHIRTS = ['#f2a65a', '#7ac6e8', '#9ed36a', '#f29ac8', '#f2d23e', '#b48ae0', '#5bd6a0', '#f27f6a'];
const PANTS = ['#3a5aa8', '#5a3a2a', '#2a6a4a', '#6a4a8a'];

/** An old grunt's uniform, coloured in by hand (the eraser cap stays). */
export function repentLook(id: string, look: Look): Look {
  const h = hash(id);
  return { ...look, shirt: SHIRTS[h % SHIRTS.length], pants: PANTS[(h >> 3) % PANTS.length], ...(look.cape ? { cape: SHIRTS[(h >> 5) % SHIRTS.length] } : {}) };
}

export const repentLine = (id: string): LText[] => ADMIN_LINES[id] ?? [REPENT_LINES[hash(id) % REPENT_LINES.length]];

/**
 * The colours come back in stages: along the Blank Road's path at the ending (`ending`), the whole Blank
 * Road once the Grand Concours is won (`champion`), and the Edge of the Page after rematches with this many
 * Atelier Masters (`couleurs:bord`).
 */
export const BORD_REMATCHES = 4;
export const rematchesWon = (flags: Record<string, number>) =>
  BADGES.filter((b) => {
    const leader = Object.values(TRAINERS).find((t) => t.badge === b.id);
    return !!leader && !!flags[`rematch:${leader.id}`];
  }).length;
