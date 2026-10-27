import { L, tr, type LText } from '../i18n';
import { creature, monLabel, typesOf } from '../data/creatures';
import { item } from '../data/items';
import { createMon } from '../engine/pk/creature';
import { newSeed } from '../engine/rng';
import { addItem, save, see, takeItem, update } from '../state/game';
import { ask, flag, getGame, say, sayAll, scripts, setFlag, showPicture } from '../overworld/controller';
import { ORIGINALS, originalUrl } from '../data/originals';
import { playJingle } from '../audio/music';
import { sfx } from '../audio/sfx';

/** The little life of Papeterre: trades with its people, and small favours to do for them. */

// ------------------------------------------------------------------ trades

interface Trade {
  id: string;
  who: LText;
  /** First trainer of the Bestiole you get (shown in its summary). */
  ot: string;
  want: string;
  give: string;
  nick: string;
}

/** One trade per town: between them, every starter, a second Touffou and a Piafou. */
export const TRADES: Trade[] = [
  { id: 'ville', who: L('Gamin Hugo', 'Kid Hugo'), ot: 'Hugo', want: '012', give: '013', nick: 'Plumette' },
  { id: 'port', who: L('Marin Yves', 'Sailor Yves'), ot: 'Yves', want: '004', give: '003', nick: 'Bouée' },
  { id: 'feutre', who: L('Fillette Nina', 'Girl Nina'), ot: 'Nina', want: '006', give: '016', nick: 'Frisette' },
  { id: 'braise', who: L('Randonneur Paul', 'Hiker Paul'), ot: 'Paul', want: '009', give: '002', nick: 'Étincelle' },
  { id: 'paillette', who: L('Danseuse Maëlle', 'Dancer Maëlle'), ot: 'Maëlle', want: '005', give: '001', nick: 'Brindille' },
];

async function trade(t: Trade) {
  const vars = { w: tr(creature(t.want).name), g: tr(creature(t.give).name), k: t.nick, o: t.ot };
  if (flag(`trade:${t.id}`)) {
    await say(L('Mon {w} et moi, on est inséparables ! Et {k}, ça va ?', 'My {w} and I are inseparable! And how is {k}?'), t.who, vars);
    return;
  }
  const c = await ask(L('Tu as un {w} ? J’en rêve ! Je te l’échange contre mon {g}, {k}. D’accord ?', 'Do you have a {w}? I’d love one! I’ll trade you my {g}, {k}, for it. Deal?'),
    [L('Échanger', 'Trade'), L('Non merci', 'No thanks')], t.who, vars);
  if (c !== 0) {
    await say(L('Oh… Si tu changes d’avis, je suis là !', 'Oh… If you change your mind, I’ll be here!'), t.who);
    return;
  }
  const options = save.value!.party.map((m, i) => ({ m, i })).filter(({ m }) => m.species === t.want && !m.egg);
  if (!options.length) {
    await say(L('Tu n’as pas de {w} dans ton équipe… Reviens avec un {w} !', 'You don’t have a {w} in your party… Come back with one!'), t.who, vars);
    return;
  }
  let pick = options[0];
  if (options.length > 1) {
    const k = await ask(L('Lequel veux-tu échanger ?', 'Which one will you trade?'), [...options.map((o) => `${monLabel(o.m)} N.${o.m.level}`), L('Aucun', 'None')], t.who);
    if (k >= options.length) return;
    pick = options[k];
  }
  const given = pick.m;
  const got = createMon(t.give, given.level, { rng: newSeed() });
  Object.assign(got, { nickname: t.nick, ot: t.ot, met: { level: given.level, map: getGame().map.def.id, how: 'trade' } });
  update((d) => {
    // its held item stays with you
    if (given.item) addItem(d, given.item, 1);
    d.party[pick.i] = got;
    see(d, t.give);
    if (!d.dex.caught.includes(t.give)) d.dex.caught.push(t.give);
    d.flags[`trade:${t.id}`] = 1;
  });
  const g = getGame();
  await g.fadeTo(0.9, 300, 'white');
  await say(L('{name} envoie {m}…', '{name} sends {m}…'), undefined, { m: monLabel(given) });
  playJingle('caught', { fallback: sfx.capture });
  await g.fadeTo(0, 300);
  await say(L('… et reçoit {k}, le {g} de {o} !', '… and receives {k}, {o}’s {g}!'), undefined, vars);
  await say(L('Prends bien soin de {k} ! Moi, j’adore déjà mon {w}.', 'Take good care of {k}! I already love my {w}.'), t.who, vars);
}

for (const t of TRADES) scripts[`trade_${t.id}`] = () => trade(t);

// ------------------------------------------------------------------ small favours

const reward = async (id: string, n = 1) => {
  update((d) => addItem(d, id, n));
  playJingle('item', { fallback: sfx.confirm });
  await say(L('{name} reçoit {i}{n} !', '{name} received {i}{n}!'), undefined, { i: tr(item(id).name), n: n > 1 ? ` ×${n}` : '' });
};

const MARGAUX = L('Fillette Margaux', 'Girl Margaux');

/** Port-Aquarelle: Margaux’s Lunelle ran off along Route 3. */
scripts.margaux = async () => {
  if (flag('quest:lulu')) {
    await say(L('Lulu et moi, on te dit encore merci !', 'Lulu and I say thank you again!'), MARGAUX);
    return;
  }
  if (flag('quest:lulu.found')) {
    await sayAll([
      L('LULU ! Tu l’as retrouvée ! Elle était où ?', 'LULU! You found her! Where was she?'),
      L('Derrière les rochers de la Route 3 ? Elle adore se cacher… Merci, merci !', 'Behind the rocks on Route 3? She loves to hide… Thank you, thank you!'),
    ], MARGAUX);
    setFlag('quest:lulu');
    await reward('clochette');
    await reward('baie-doree', 2);
    return;
  }
  await sayAll([
    L('Ma Lunelle, Lulu, a couru après une luciole sur la Route 3… et elle n’est pas revenue !', 'My Moonbun, Lulu, chased a firefly onto Route 3… and she hasn’t come back!'),
    L('Tu veux bien la chercher ? Elle aime se cacher derrière les rochers.', 'Could you look for her? She likes to hide behind rocks.'),
  ], MARGAUX);
  setFlag('quest:lulu.asked');
};

/** Route 3: Lulu, hiding behind the rocks. */
scripts.lulu = async () => {
  sfx.cry('006');
  await say(L('C’est Lulu, la Lunelle de Margaux ! Elle a l’air perdue… Elle se met à te suivre.', 'It’s Lulu, Margaux’s Moonbun! She looks lost… She starts following you.'));
  setFlag('quest:lulu.found');
};

/** Ville-Feutre: a boy who has never seen a Fire Bestiole. */
scripts.theo = async () => {
  const who = L('Garçon Théo', 'Boy Theo');
  if (flag('quest:feu')) {
    await say(L('Le feu, c’est trop beau ! Je le dessine partout maintenant.', 'Fire is so pretty! I draw it everywhere now.'), who);
    return;
  }
  const hot = save.value!.party.find((m) => !m.egg && typesOf(m.species).includes('feu'));
  if (!hot) {
    await say(L('Tu as déjà vu une Bestiole Feu ? Moi jamais… Si tu en as une, montre-la-moi !', 'Have you ever seen a Fire Critter? I never have… If you have one, show me!'), who);
    return;
  }
  await say(L('Waouh ! {n} ! Ça brille comme un feu de cheminée ! Tiens, c’est pour toi.', 'Whoa! {n}! It glows like a fireplace! Here, this is for you.'), who, { n: monLabel(hot) });
  setFlag('quest:feu');
  await reward('bille-ardente');
};

/** Jardin-Gouache: a botanist who wants to see a Bestiole that adores its trainer. */
scripts.rosalie = async () => {
  const who = L('Botaniste Rosalie', 'Botanist Rosalie');
  if (flag('quest:amitie')) {
    await say(L('Une Bestiole aimée pousse comme une fleur au soleil.', 'A loved Critter grows like a flower in the sun.'), who);
    return;
  }
  const dear = save.value!.party.find((m) => !m.egg && (m.friendship ?? 0) >= 220);
  if (!dear) {
    await say(L('Les fleurs poussent mieux quand on leur parle. Les Bestioles aussi ! Montre-moi une Bestiole qui t’adore vraiment.', 'Flowers grow better when you talk to them. Critters do too! Show me a Critter that truly adores you.'), who);
    return;
  }
  await say(L('Regarde comme {n} te regarde ! Ça, c’est de l’amitié. Tiens, pour vous deux.', 'Look how {n} looks at you! Now that’s friendship. Here, for both of you.'), who, { n: monLabel(dear) });
  setFlag('quest:amitie');
  await reward('gouter');
  await reward('baie-prisme');
};

const has = (id: string) => !!save.value?.bag[id];

/** Cité-Encre: Mamie Encre writes to her brother in Village-Plume, far south. */
scripts.encreOld = async () => {
  const who = L('Mamie Encre', 'Granny Ink');
  if (has('lettre-papi')) {
    update((d) => void takeItem(d, 'lettre-papi'));
    await sayAll([
      L('Une lettre de mon frère ! Tu es {g:allée|allé} jusqu’à Village-Plume pour moi ?', 'A letter from my brother! You went all the way to Featherby for me?'),
      L('Il dit que ses Piafou chantent toujours le matin… Merci, ça me fait chaud au cœur.', 'He says his Chirpies still sing every morning… Thank you, it warms my heart.'),
    ], who);
    setFlag('quest:lettre');
    await reward('casque-pointes');
    return;
  }
  if (has('lettre-mamie')) {
    await say(L('Tu as donné ma lettre à Papi Plume, à Village-Plume ?', 'Did you give my letter to Grandpa Feather in Featherby?'), who);
    return;
  }
  if (!flag('quest:lettre.sent') && !flag('quest:lettre')) {
    await say(L('Tu voyages beaucoup, toi. Tu veux bien porter cette lettre à mon frère, Papi Plume, à Village-Plume ? C’est loin au sud…', 'You travel a lot. Would you take this letter to my brother, Grandpa Feather, in Featherby? It’s far to the south…'), who);
    setFlag('quest:lettre.sent');
    await reward('lettre-mamie');
    return;
  }
  await say(L('Tu sais, on raconte que le monde a un bord. Comme une page de cahier. Et que tout au bout, quelqu’un dort…', 'You know, they say the world has an edge. Like a notebook page. And that at the very end, someone is sleeping…'), who);
};

/** Village-Plume: Papi Plume, Mamie Encre’s brother. */
scripts.papiPlume = async () => {
  const who = L('Papi Plume', 'Grandpa Feather');
  if (has('lettre-mamie')) {
    update((d) => void takeItem(d, 'lettre-mamie'));
    await sayAll([
      L('Une lettre de ma sœur, Mamie Encre ! Ça fait si longtemps…', 'A letter from my sister, Granny Ink! It’s been so long…'),
      L('Tiens, rapporte-lui ma réponse, veux-tu ? Et prends ça pour ta peine.', 'Here, take her my reply, will you? And have this for your trouble.'),
    ], who);
    await reward('lettre-papi');
    await reward('super-crayon-ball', 5);
    return;
  }
  if (flag('quest:lettre')) {
    await say(L('Ma sœur m’a encore écrit, grâce à toi. On s’écrit toutes les semaines, maintenant !', 'My sister wrote to me again, thanks to you. We write every week now!'), who);
    return;
  }
  await say(L('Ma sœur vit loin au nord, à la Cité-Encre. Elle me manque…', 'My sister lives far up north, in Ink City. I miss her…'), who);
};

// ------------------------------------------------------------------ the museum of first sketches

/** The curator of the museum in Ville-Pastel. */
scripts.musee = async () => {
  const who = L('Conservatrice', 'Curator');
  await sayAll([
    L('Bienvenue au Musée des premiers croquis !', 'Welcome to the Museum of First Sketches!'),
    L('Ici, on garde les tout premiers croquis des Bestioles, tels qu’ils ont été dessinés la toute première fois.', 'Here we keep the very first sketches of the Critters, just as they were drawn the very first time.'),
    L('Regarde-les de près : les Bestioles ont bien changé depuis… mais on les reconnaît toujours !', 'Take a close look: the Critters have changed a lot since… but you can always recognise them!'),
  ], who);
};

// each frame shows one of her drawings
for (const id of ORIGINALS) {
  scripts[`musee:${id}`] = async () => {
    const c = creature(id);
    await showPicture(originalUrl(c), tr(L('Premier croquis de {n}', 'First sketch of {n}'), { n: tr(c.name) }));
  };
}

