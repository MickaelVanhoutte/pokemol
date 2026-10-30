import { L, tr, type LText } from '../i18n';
import { playJingle } from '../audio/music';
import { sfx } from '../audio/sfx';
import { item } from '../data/items';
import { GUIDES, type Guide } from '../data/guides';
import { arrivals, bubble, flag, getGame, giveItem, say, sayAll, scripts, setFlag } from '../overworld/controller';
import { DIRS, type Actor } from '../overworld/game';
import { isWater } from '../overworld/tiles';
import type { Dir } from '../save/schema';

/**
 * The Colour Guides (`src/data/guides.ts`): arriving on its map once its tool is useful, a guide calls out, walks
 * up, introduces itself and hands the tool over, then goes back to its place on that map. The first one met also
 * tells about the seven of them.
 */

const LINES: Record<Guide['id'], { hello: LText; give: LText; tip: LText }> = {
  vert: {
    hello: L('Je suis Pistache, le guide vert. Je m’occupe de tout ce qui pousse : les herbes, les fleurs… et les buissons !', 'I’m Pistachio, the green guide. I look after everything that grows: grass, flowers… and bushes!'),
    give: L('Tu as le Badge de Mireille ! Alors prends mes Ciseaux à Bouts Ronds : ils coupent les petits buissons qui bloquent les chemins.', 'You have Mireille’s Badge! Then take my Safety Scissors: they cut the thin bushes that block paths.'),
    tip: L('Devant un petit buisson, appuie sur A. Il y en a un sur la Route des Craies qui cache un joli coin…', 'Face a thin bush and press A. There’s one on Chalk Road hiding a pretty nook…'),
  },
  jaune: {
    hello: L('Je suis Mimosa, la guide jaune. Mon ciré jaune, on le voit de loin, même sous la pluie !', 'I’m Mimosa, the yellow guide. You can spot my yellow raincoat from afar, even in the rain!'),
    give: L('La rivière est pleine de Bestioles qui aiment l’eau. Tiens, ma Canne à Pêche !', 'The river is full of Critters that love water. Here, my Fishing Rod!'),
    tip: L('Devant l’eau, appuie sur A pour pêcher. Plus ton équipe est forte, plus les Bestioles qui mordent sont fortes !', 'Face the water and press A to fish. The stronger your team, the stronger the Critters that bite!'),
  },
  bleu: {
    hello: L('Je suis Azur, le guide bleu : la mer, les rivières, tout ce qui est bleu, c’est moi !', 'I’m Azure, the blue guide: the sea, the rivers, everything blue is me!'),
    give: L('Le Badge de Marine ! Tiens, je t’ai plié mon plus beau bateau en papier. Il flotte pour de vrai !', 'Marine’s Badge! Here, I folded you my finest paper boat. It really floats!'),
    tip: L('Devant l’eau, appuie sur A pour naviguer. Il paraît qu’en remontant la rivière de Village-Plume, on arrive à un grand lac…', 'Face the water and press A to sail. They say that sailing up the river from Featherby leads to a big lake…'),
  },
  indigo: {
    hello: L('Je suis Myrtille, la guide indigo : la couleur de l’eau tout au fond, là où la lumière n’arrive presque plus.', 'I’m Bilberry, the indigo guide: the colour of the water deep down, where the light hardly reaches.'),
    give: L('Tiens, mon Bocal-Scaphandre. Avec, tu pourras plonger dans les taches sombres du lac !', 'Here, my Jar Helmet. With it, you can dive into the dark patches of the lake!'),
    tip: L('En bateau, sur une eau toute sombre, appuie sur A pour plonger. Pour remonter, cherche un rond de lumière.', 'Sailing over very dark water, press A to dive. To come back up, look for a circle of light.'),
  },
  rouge: {
    hello: L('Je suis Coquelicot, le guide rouge : rouge comme la vitesse !', 'I’m Poppy, the red guide: red like speed!'),
    give: L('Grâce à toi, les couleurs sont revenues à Ville-Feutre. Tiens, mon Vélo-Crayon : ses roues sont des taille-crayons, ça file !', 'Thanks to you, the colours are back in Felt City. Here, my Pencil Bike: its wheels are pencil sharpeners, it zooms!'),
    tip: L('Monte dessus avec VÉLO dans le menu. Pas à l’intérieur, hein ! Et essaie la Piste Cyclable, vers le Jardin-Gouache.', 'Get on it with BIKE in the menu. Not indoors, mind! And try the Cycling Track, towards Gouache Garden.'),
  },
  violet: {
    hello: L('Je suis Lavande, la guide violette. Dans la montagne, je cherche les améthystes : de jolies pierres violettes cachées dans les rochers.', 'I’m Lavender, the violet guide. In the mountains I look for amethysts: pretty violet stones hidden in the rocks.'),
    give: L('Pour ouvrir les rochers fissurés, rien de tel qu’un Maillet en Mousse. J’en ai un deuxième : il est pour toi !', 'To open cracked rocks, nothing beats a Foam Mallet. I have a spare one: it’s yours!'),
    tip: L('Devant un rocher fissuré, appuie sur A. Bong ! Il y en a dans la Grotte Gribouillis et sur la Route de l’Encre…', 'Face a cracked rock and press A. Bonk! There are some in Scribble Cave and on Ink Path…'),
  },
  orange: {
    hello: L('Je suis Clémentine, la guide orange : orange comme les braises de la forge !', 'I’m Clementine, the orange guide: orange like the embers of the forge!'),
    give: L('Tu as battu Ambre ! Tiens, mes Gants Costauds : avec, tu pousses les gros rochers ronds.', 'You beat Amber! Here are my Strong Gloves: with them, you can push big round boulders.'),
    tip: L('Devant un rocher rond, appuie sur A pour enfiler les gants, puis marche dedans. Une grotte de la Route 8 cache quelque chose derrière ses rochers…', 'Face a round boulder, press A to put the gloves on, then walk into it. A cave on Route 8 hides something behind its boulders…'),
  },
};

const GROUP = [
  L('Nous sommes sept Guides des Couleurs : une couleur chacun, comme l’arc-en-ciel.', 'We are seven Colour Guides: one colour each, like the rainbow.'),
  L('Quand une couleur peut t’aider sur ton chemin, son guide vient te trouver !', 'When a colour can help you on your way, its guide comes to find you!'),
];

/** Introduces the guide (and the seven of them, the first time) and hands its tool over. */
export async function guideTalk(gd: Guide) {
  const l = LINES[gd.id];
  await say(l.hello, gd.name);
  if (!flag('guides')) {
    setFlag('guides');
    await sayAll(GROUP, gd.name);
  }
  await say(l.give, gd.name);
  giveItem(gd.tool);
  setFlag(`gift:${gd.tool}`);
  playJingle('item', { fallback: sfx.capture });
  await say(L('{name} reçoit : {i} !', '{name} received the {i}!'), undefined, { i: tr(item(gd.tool).name) });
  await say(l.tip, gd.name);
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
 * The guide calls out, walks up to the player, talks and gives its tool, then walks off. `call` is said first
 * (by the guide, or by someone else in a scene). Returns false when there is no room for it to come.
 */
export async function guideComes(gd: Guide, call?: { text: LText; who?: LText }): Promise<boolean> {
  const from = approachFrom();
  if (!from) return false;
  const g = getGame(), p = g.player;
  await bubble('player', '!', 500);
  await say(call?.text ?? L('Hé, {name} ! Attends une seconde !', 'Hey, {name}! Wait a second!'), call ? call.who : gd.name);
  const [dx, dy] = DIRS[from.dir];
  const walker: Actor = g.spawn(`guide-walk-${gd.id}`, gd.look, p.x + dx * from.n, p.y + dy * from.n, BACK[from.dir]);
  await g.walk(walker, Array(from.n - 1).fill(BACK[from.dir]), 170);
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
    await say(LINES[gd.id].tip, gd.name);
  };
}

/** Village-Braise's forge: too hot to go in, Clémentine works outside. */
scripts.forgeBraise = async () => {
  await say(L('Une chaleur de four s’échappe de la porte. On travaille dehors, à côté.', 'Oven-like heat pours out of the door. Work is done outside, next to it.'));
};
