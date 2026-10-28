import { L, tr, type LText } from '../i18n';
import { flag, giveItem, say, sayAll, scripts, setFlag } from '../overworld/controller';
import { item } from '../data/items';
import { sfx } from '../audio/sfx';

/**
 * People who hand out the field tools (scissors, boat, rods, gloves, mallet, bike), each once,
 * sometimes only after a badge or a story step.
 */
function giver(id: string, who: LText, opts: { item: string; need?: string; notYet?: LText; before: LText[]; after: LText }) {
  scripts[id] = async () => {
    if (flag(`gift:${opts.item}`)) return void (await say(opts.after, who));
    if (opts.need && !flag(opts.need)) return void (await say(opts.notYet ?? opts.before[0], who));
    await sayAll(opts.before, who);
    giveItem(opts.item);
    setFlag(`gift:${opts.item}`);
    sfx.capture();
    await say(L('{name} reçoit : {i} !', '{name} received the {i}!'), undefined, { i: tr(item(opts.item).name) });
    await say(opts.after, who);
  };
}

giver('jardinier', L('Jardinier', 'Gardener'), {
  item: 'ciseaux', need: 'badge:pastel',
  notYet: L('Je taille les petits buissons de la région… Reviens avec le Badge de Mireille, je te prêterai mes ciseaux !', 'I trim the region’s little bushes… Come back with Mireille’s Badge and I’ll lend you my scissors!'),
  before: [L('Le Badge Pastel ! Bravo. Tiens, prends ces ciseaux à bouts ronds : ils coupent les petits buissons qui bloquent les chemins.', 'The Pastel Badge! Well done. Here, take these safety scissors: they cut the thin bushes that block paths.')],
  after: L('Devant un petit buisson, appuie sur A. Il y en a un sur la Route des Craies qui cache un joli jardin…', 'Face a thin bush and press A. There’s one on Chalk Road hiding a pretty garden…'),
});

giver('canneBois', L('Pêcheur', 'Fisher'), {
  item: 'canne-bois',
  before: [L('La rivière est pleine de Bestioles qui aiment l’eau. Tu veux essayer ? Tiens, ma vieille canne en bois !', 'The river is full of Critters that love water. Want to try? Here, my old wooden rod!')],
  after: L('Devant l’eau, appuie sur A pour pêcher. Patience…', 'Face the water and press A to fish. Be patient…'),
});

giver('bateauPapier', L('Plieuse', 'Paper Folder'), {
  item: 'bateau', need: 'badge:aquarelle',
  notYet: L('Je plie des bateaux en papier qui flottent pour de vrai ! Je n’en donne qu’à ceux qui ont le Badge de Marine.', 'I fold paper boats that really float! I only give them to people with Marine’s Badge.'),
  before: [L('Le Badge Aquarelle ! Alors tu mérites mon plus beau bateau en papier. Avec, tu peux naviguer sur l’eau !', 'The Watercolor Badge! Then you deserve my finest paper boat. With it, you can sail on water!')],
  after: L('Devant l’eau, appuie sur A pour naviguer. Il paraît qu’il y a des petites îles au sud du port…', 'Face the water and press A to sail. They say there are little islands south of the port…'),
});

giver('bonneCanne', L('Pêcheur', 'Fisher'), {
  item: 'bonne-canne',
  before: [L('Avec une vieille canne, on n’attrape que des petites Bestioles. Prends ma bonne canne !', 'With an old rod you only catch little Critters. Take my good rod!')],
  after: L('Les Bestioles qui mordent sont plus fortes avec la Bonne Canne.', 'Stronger Critters bite on a Good Rod.'),
});

giver('forgeron', L('Forgeron', 'Smith'), {
  item: 'gants', need: 'badge:braise',
  notYet: L('Ces gants poussent n’importe quel rocher. Je les donnerai à qui aura battu Ambre !', 'These gloves can push any boulder. I’ll give them to whoever beats Amber!'),
  before: [L('Tu as le Badge Braise ! Tiens, mes Gants Costauds : avec, tu pousses les gros rochers ronds.', 'You have the Ember Badge! Here are my Strong Gloves: with them, you can push big round boulders.')],
  after: L('Devant un rocher rond, appuie sur A pour enfiler les gants, puis marche dedans.', 'Face a round boulder, press A to put the gloves on, then walk into it.'),
});

giver('mineur', L('Mineur', 'Miner'), {
  item: 'maillet',
  before: [L('Bong, bong ! Je casse les rochers fissurés avec mon maillet en mousse. J’en ai un deuxième : il est pour toi !', 'Bonk, bonk! I break cracked rocks with my foam mallet. I have a spare one: it’s yours!')],
  after: L('Devant un rocher fissuré, appuie sur A. Il y en a dans la Grotte Gribouillis et sur la Route de l’Encre…', 'Face a cracked rock and press A. There are some in Scribble Cave and on Ink Path…'),
});

giver('superCanne', L('Pêcheuse', 'Fisher'), {
  item: 'super-canne',
  before: [L('Je pêche dans toute Papeterre. Tiens, ma Super Canne : les plus grosses Bestioles mordent avec !', 'I fish all over Papeterra. Here, my Super Rod: the biggest Critters bite on it!')],
  after: L('La Super Canne marche partout où il y a de l’eau.', 'The Super Rod works wherever there’s water.'),
});

giver('velociste', L('Vélociste', 'Bike Maker'), {
  item: 'velo', need: 'a2.feutre',
  notYet: L('Plus de couleurs, plus de vélos… Si quelqu’un chassait la Team Gomme, je lui offrirais mon plus beau vélo !', 'No colours, no bikes… If someone chased Team Eraser away, I’d give them my finest bike!'),
  before: [L('Les couleurs sont revenues grâce à toi ! Tiens, mon Vélo-Crayon : ses roues sont des taille-crayons, ça file !', 'The colours are back thanks to you! Here, my Pencil Bike: its wheels are pencil sharpeners, it zooms!')],
  after: L('Monte dessus avec VÉLO dans le menu. Pas à l’intérieur, hein !', 'Get on it with BIKE in the menu. Not indoors, mind!'),
});

/** Village-Braise's forge: too hot to go in, the smith works outside. */
scripts.forgeBraise = async () => {
  await say(L('Une chaleur de four s’échappe de la porte. Le forgeron travaille dehors, à côté.', 'Oven-like heat pours out of the door. The smith works outside, next to it.'));
};
