import { L, tr, type LText } from '../i18n';
import { playJingle } from '../audio/music';
import { fxSound, sfx } from '../audio/sfx';
import { item } from '../data/items';
import { GUIDES, type Guide } from '../data/guides';
import { arrivals, bubble, flag, getGame, giveItem, say, sayAll, scripts, setFlag, shake, wait } from '../overworld/controller';
import { DIRS, type Actor } from '../overworld/game';
import { isWater } from '../overworld/tiles';
import type { Dir } from '../save/schema';

/**
 * The Colour Guides (`src/data/guides.ts`): an old tradition of Papeterre that every child knows from a nursery
 * rhyme, « La comptine des sept couleurs » (the book on the shelf at home; Mom sang it). Townsfolk talk about their
 * guide before the player meets them. Arriving on its map once its tool is useful, a guide comes in its own little
 * scene, quotes its line of the rhyme, and hands the tool over; then it stays on that map with a tip.
 */

/** The rhyme, two lines a page; each guide quotes its own line. */
export const COMPTINE: LText[] = [
  L('« Rouge roule à toute allure,\nOrange forge, chaud et dur,', '“Red rides fast as it can go,\nOrange forges, hot aglow,'),
  L('Jaune pêche sous la pluie,\nVert taille les buissons fleuris,', 'Yellow fishes in the rain,\nGreen trims bushes down the lane,'),
  L('Bleu fait flotter le papier,\nIndigo plonge au fond du lac,', 'Blue folds paper into boats,\nIndigo dives where nothing floats,'),
  L('Violet casse les cailloux : crac !\nSept couleurs pour t’aider ! »', 'Violet cracks the rocks: crack-crack!\nSeven colours have your back!”'),
];

/** A narrator's line (no speaker), or a sound and a shake, in a meeting. */
type Beat = LText | { n: LText } | { fx: () => Promise<void> | void };

interface Meeting {
  /** Heard before the guide shows up (from off-screen, or someone else's words). */
  call: Beat[];
  /** Ms per tile as it comes (Coquelicot rides in). */
  walkMs?: number;
  /** Once it stands in front of the player: who it is, through the rhyme and a little moment of its own. */
  meet: Beat[];
  give: LText;
  tip: LText;
}

const splash = { fx: () => { fxSound('water'); return shake(250); } };
const bonk = { fx: async () => { fxSound('rock'); await shake(200); await wait(180); fxSound('rock'); await shake(200); } };

const MEETINGS: Record<Guide['id'], Meeting> = {
  vert: {
    call: [L('Hé ! C’est toi qui viens de battre Mireille ?', 'Hey! Are you the one who just beat Mireille?')],
    meet: [
      L('Elle n’arrête pas de parler de toi, là-dedans ! Moi, c’est Pistache. Je taille toutes les haies de Ville-Pastel.', 'She can’t stop talking about you in there! I’m Pistachio. I trim every hedge in Pastel City.'),
      L('« Vert taille les buissons fleuris »… Tu connais la comptine ? Le vert, c’est moi !', '“Green trims bushes down the lane”… You know the rhyme? Green, that’s me!'),
      { fx: () => fxSound('slash') },
      { n: L('Clic-clac ! En deux coups de ciseaux, Pistache égalise la haie juste à côté.', 'Snip-snip! Two snips, and Pistachio has evened out the hedge next to you.') },
    ],
    give: L('Un Badge d’Atelier, ça mérite un coup de main. Tiens, mes Ciseaux à Bouts Ronds !', 'An Atelier Badge deserves a helping hand. Here, my Safety Scissors!'),
    tip: L('Un petit buisson te barre la route ? Appuie sur A devant, et clic-clac ! Il y en a un sur la Route des Craies qui cache un joli coin…', 'A thin bush in your way? Press A in front of it, and snip-snip! There’s one on Chalk Road hiding a pretty nook…'),
  },
  jaune: {
    call: [L('Toi, là ! Viens vite, ça tire !', 'You there! Quick, it’s pulling!')],
    meet: [
      L('Tiens-moi ça, je n’y arrive plus ! Allez… tire, tire !', 'Hold this, I can’t manage! Come on… pull, pull!'),
      splash,
      { n: L('Plouf ! Une Bestiole saute hors de l’eau, éclabousse tout le monde… et file dans la rivière.', 'Splash! A Critter leaps out of the water, soaks everyone… and darts off down the river.') },
      L('Ha ha ha ! Trempés tous les deux ! Mon ciré jaune, lui, n’a rien senti.', 'Ha ha ha! Soaked, both of us! My yellow raincoat didn’t feel a thing.'),
      L('« Jaune pêche sous la pluie »… Je suis Mimosa. Et toi, tu as de la poigne !', '“Yellow fishes in the rain”… I’m Mimosa. And you’ve got a good grip!'),
    ],
    give: L('Garde-la, cette canne : elle te va mieux qu’à moi. J’en ai plein d’autres à la maison !', 'Keep that rod: it suits you better than me. I’ve got plenty more at home!'),
    tip: L('Devant l’eau, appuie sur A pour pêcher. Plus ton équipe est forte, plus les Bestioles qui mordent sont fortes !', 'Face the water and press A to fish. The stronger your team, the stronger the Critters that bite!'),
  },
  bleu: {
    call: [L('Ah, te voilà ! Marine m’a dit que tu arrivais.', 'Ah, there you are! Marine told me you were coming.')],
    meet: [
      L('Je suis Azur. Ne bouge pas, regarde bien… Un pli ici, un pli là…', 'I’m Azure. Don’t move, watch closely… A fold here, a fold there…'),
      { fx: () => sfx.pencil(3) },
      { n: L('En un clin d’œil, Azur plie une grande feuille bleue… C’est un bateau !', 'In the blink of an eye, Azure folds a big blue sheet… It’s a boat!') },
      L('« Bleu fait flotter le papier » ! Celui-là flotte pour de vrai, promis.', '“Blue folds paper into boats”! This one really floats, I promise.'),
    ],
    give: L('Avec le Badge de Marine, tu sauras le mener. Il est à toi !', 'With Marine’s Badge, you’ll know how to steer it. It’s yours!'),
    tip: L('Devant l’eau, appuie sur A pour naviguer. Il paraît qu’en remontant la rivière de Village-Plume, on arrive à un grand lac…', 'Face the water and press A to sail. They say that sailing up the river from Featherby leads to a big lake…'),
  },
  indigo: {
    call: [L('Myrtille ! Par ici !', 'Bilberry! Over here!')],
    meet: [
      { n: L('Une plongeuse sort de l’eau, toute ruisselante, un grand bocal sous le bras.', 'A diver climbs out of the water, dripping wet, a big jar under her arm.') },
      L('Brrr ! L’eau est fraîche, aujourd’hui… Bonjour ! Je suis Myrtille.', 'Brrr! The water’s chilly today… Hello! I’m Bilberry.'),
      L('« Indigo plonge au fond du lac »… Ça fait des années que je cherche les perles de la vieille légende. Je n’en ai jamais trouvé une seule.', '“Indigo dives where nothing floats”… I’ve been looking for the pearls of the old legend for years. I’ve never found a single one.'),
    ],
    give: L('Toi, tu auras peut-être plus de chance. Tiens, je te prête mon Bocal-Scaphandre !', 'Maybe you’ll be luckier. Here, I’ll lend you my Jar Helmet!'),
    tip: L('En bateau, sur une eau toute sombre, appuie sur A pour plonger. Pour remonter, cherche un rond de lumière.', 'Sailing over very dark water, press A to dive. To come back up, look for a circle of light.'),
  },
  rouge: {
    call: [L('Attention, attention ! Ça freine pas bien !', 'Look out, look out! The brakes aren’t great!')],
    walkMs: 70,
    meet: [
      { fx: () => fxSound('whoosh') },
      { n: L('Skrrrr ! Un vélo tout rouge s’arrête pile devant toi.', 'Skreeech! A bright red bike stops right in front of you.') },
      L('Ouf ! Pardon ! Mon vélo avait perdu son rouge, il ne roulait plus… et les couleurs sont revenues d’un coup !', 'Phew! Sorry! My bike had lost its red, it wouldn’t ride… and the colours came back all at once!'),
      L('C’est grâce à toi, hein ? Moi, c’est Coquelicot. « Rouge roule à toute allure » !', 'It’s thanks to you, right? I’m Poppy. “Red rides fast as it can go”!'),
    ],
    give: L('Prends le Vélo-Crayon : ses roues sont des taille-crayons, ça file ! J’en ai un autre au garage.', 'Take the Pencil Bike: its wheels are pencil sharpeners, it zooms! I’ve got another in the garage.'),
    tip: L('Monte dessus avec VÉLO dans le menu. Pas à l’intérieur, hein ! Et essaie la Piste Cyclable, vers le Jardin-Gouache.', 'Get on it with BIKE in the menu. Not indoors, mind! And try the Cycling Track, towards Gouache Garden.'),
  },
  violet: {
    call: [bonk, { n: L('Bong ! … Bong ! Ça résonne dans toute la montagne.', 'Bonk! … Bonk! It echoes all over the mountain.') }, L('Oh ! Il y a quelqu’un ?', 'Oh! Is someone there?')],
    meet: [
      L('Bonjour ! Je ne t’avais pas {g:entendue|entendu} arriver, avec tout ce bruit. Je suis Lavande.', 'Hello! I didn’t hear you coming, with all that noise. I’m Lavender.'),
      L('Je cherche des améthystes : de jolies pierres violettes cachées au cœur des rochers. « Violet casse les cailloux : crac ! »', 'I look for amethysts: pretty violet stones hidden inside the rocks. “Violet cracks the rocks: crack-crack!”'),
      L('C’est un peu bruyant, comme métier…', 'It’s a bit of a noisy job…'),
    ],
    give: L('Tiens, mon Maillet en Mousse de rechange. Ça casse les rochers fissurés sans faire mal à personne !', 'Here, my spare Foam Mallet. It breaks cracked rocks without hurting anyone!'),
    tip: L('Devant un rocher fissuré, appuie sur A. Bong ! Il y en a dans la Grotte Gribouillis et sur la Route de l’Encre…', 'Face a cracked rock and press A. Bonk! There are some in Scribble Cave and on Ink Path…'),
  },
  orange: {
    call: [L('Te voilà ! Ambre m’a tout raconté.', 'There you are! Amber told me everything.')],
    meet: [
      L('Battre Ambre, il fallait que je voie qui avait fait ça ! Moi, c’est Clémentine. Je travaille à la forge, juste à côté.', 'Beating Amber, I had to see who did that! I’m Clementine. I work at the forge, right next door.'),
      L('« Orange forge, chaud et dur »… Tu vois les étincelles ? C’est mon orange à moi !', '“Orange forges, hot aglow”… See the sparks? That’s my orange!'),
      { fx: () => fxSound('fire') },
    ],
    give: L('Ces Gants Costauds, je les ai forgés pour quelqu’un de courageux. Ils sont à toi !', 'I forged these Strong Gloves for someone brave. They’re yours!'),
    tip: L('Devant un rocher rond, appuie sur A pour enfiler les gants, puis marche dedans. Une grotte de la Route 8 cache quelque chose derrière ses rochers…', 'Face a round boulder, press A to put the gloves on, then walk into it. A cave on Route 8 hides something behind its boulders…'),
  },
};

/** The first guide met: what the guides are, as the rhyme says. */
const TRADITION = [
  L('Les Guides des Couleurs, comme dans la comptine : quand un voyageur a besoin d’aide, sa couleur vient le trouver. C’est comme ça depuis toujours, à Papeterre.', 'The Colour Guides, like in the rhyme: when travellers need help, their colour comes to find them. It’s always been that way in Papeterra.'),
  L('Tu croiseras les autres en chemin. Sept couleurs pour t’aider !', 'You’ll meet the others on the way. Seven colours have your back!'),
];

async function beats(list: Beat[], who: LText) {
  for (const b of list) {
    if (typeof b === 'object' && 'fx' in b) await b.fx();
    else if (typeof b === 'object' && 'n' in b) await say(b.n);
    else await say(b, who);
  }
}

/** The guide's moment and its tool: who it is (and the tradition, the first time), the gift, a tip. */
export async function guideTalk(gd: Guide) {
  const m = MEETINGS[gd.id];
  await beats(m.meet, gd.name);
  if (!flag('guides')) {
    setFlag('guides');
    await sayAll(TRADITION, gd.name);
  }
  await say(m.give, gd.name);
  giveItem(gd.tool);
  setFlag(`gift:${gd.tool}`);
  playJingle('item', { fallback: sfx.capture });
  await say(L('{name} reçoit : {i} !', '{name} received the {i}!'), undefined, { i: tr(item(gd.tool).name) });
  await say(m.tip, gd.name);
}

const BACK: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

/** A straight line of free tiles from the player (5 at most): where the guide comes from. */
function approachFrom(): { dir: Dir; n: number } | null {
  const g = getGame(), p = g.player, f = g.followerShown() ? g.follower : null;
  const free = (x: number, y: number) =>
    !g.blocked(x, y) && !isWater(g.tileAt(x, y)) && !(f && f.x === x && f.y === y) && !g.map.warps.has(y * g.map.w + x);
  for (const n of [5, 4, 3, 2]) {
    for (const dir of ['down', 'left', 'right', 'up'] as Dir[]) {
      const [dx, dy] = DIRS[dir];
      if (Array.from({ length: n }, (_, k) => free(p.x + dx * (k + 1), p.y + dy * (k + 1))).every(Boolean)) return { dir, n };
    }
  }
  return null;
}

/**
 * The guide's call is heard, it comes up to the player (`who` says the call when it is someone else, the Prof
 * calling Myrtille), has its moment, gives its tool and goes off. False when there is no room for it to come.
 */
export async function guideComes(gd: Guide, who?: LText): Promise<boolean> {
  const from = approachFrom();
  if (!from) return false;
  const g = getGame(), p = g.player, m = MEETINGS[gd.id];
  await bubble('player', '!', 500);
  await beats(m.call, who ?? gd.name);
  const [dx, dy] = DIRS[from.dir];
  const walker: Actor = g.spawn(`guide-walk-${gd.id}`, gd.look, p.x + dx * from.n, p.y + dy * from.n, BACK[from.dir]);
  await g.walk(walker, Array(from.n - 1).fill(BACK[from.dir]), m.walkMs ?? 170);
  g.face(p, from.dir);
  await guideTalk(gd);
  await g.walk(walker, Array(from.n - 1).fill(from.dir), 170);
  g.remove(walker.id);
  return true;
}

// the guide that has something for the player on this map comes on arrival (once tried per visit when there is no room)
let tried: { id: string; map: unknown } | null = null;
arrivals.push(() => {
  const g = getGame();
  const gd = GUIDES.find((x) => !x.manual && x.map === g.map.def.id && !flag(`gift:${x.tool}`) && (!x.need || flag(x.need)));
  if (!gd || (tried?.id === gd.id && tried.map === g.map)) return null;
  return async () => {
    tried = { id: gd.id, map: getGame().map };
    await guideComes(gd);
  };
});

// afterwards each guide waits on its map (`guideNpc`) with its tip
for (const gd of GUIDES) {
  scripts[`guide:${gd.id}`] = async () => {
    if (!flag(`gift:${gd.tool}`)) return void (await guideTalk(gd));
    await say(MEETINGS[gd.id].tip, gd.name);
  };
}

/** The picture book on the shelf at home: the rhyme Mom used to sing. */
scripts.comptine = async () => {
  await say(L('Un vieux livre d’images : « La comptine des sept couleurs ». Maman te la chantait le soir.', 'An old picture book: “The Seven Colours Rhyme”. Mom used to sing it to you at night.'));
  await sayAll(COMPTINE);
};

/** Village-Braise's forge: too hot to go in, Clémentine works outside. */
scripts.forgeBraise = async () => {
  await say(flag('gift:gants')
    ? L('Une chaleur de four s’échappe de la porte. Clémentine travaille dehors, à côté.', 'Oven-like heat pours out of the door. Clementine works outside, next to it.')
    : L('La forge de Clémentine. Une chaleur de four s’échappe de la porte… Elle doit être à l’Atelier, à regarder les combats d’Ambre.', 'Clementine’s forge. Oven-like heat pours out of the door… She must be at the Atelier, watching Amber’s battles.'));
};
