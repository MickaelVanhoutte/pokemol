/**
 * The Lac des Couleurs (src/data/maps/lac.ts), between the third and fourth badges. Team Gomme stopped up its three
 * springs: grey eraser mud runs down to Marker Road and blocks it. {rival} sends you there, Prof. Fusain waits at
 * the camp. Freeing the red, yellow and blue springs brings the colours back (a cinematic), then {rival} points at
 * the dark patches and battles you, and the Prof gives you the Bocal-Scaphandre to dive there.
 *
 * Under the water lie the lake's legend and its seven memory pearls (one per colour, each a memory of the legend):
 * the sunken chapel and its fresco (the Carte des Fonds, the crypt down to the Abysses), the hidden valley through
 * the tunnel, and the depths of the port, the lighthouse and the Ink City canal. With all seven on the altar of the
 * Abysses, Aquarelline wakes up.
 */
import { L, tr, type LText } from '../i18n';
import { playJingle } from '../audio/music';
import { sfx } from '../audio/sfx';
import { item, PEARLS } from '../data/items';
import { partyOf, rivalLacTeam } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { localDay } from '../overworld/berries';
import {
  ask, bubble, fight, flag, getGame, giveItem, refreshMap, say, sayAll, scripts, setFlag, shake, showPicture,
  showToast, wait, warpTo, wildBattle,
} from '../overworld/controller';
import { LOOKS } from '../overworld/sprites';
import { healParty, save, update } from '../state/game';
import { memoryUrl } from '../ui/memoryArt';
import { PROF, RIVAL } from './cast';
import { comeUp } from './choices';
import { guideComes, guideTalk } from './guides';
import { guide } from '../data/guides';

const num = (name: string) => save.value?.flags[name] ?? 0;
const has = (id: string) => !!save.value?.bag[id];

// ------------------------------------------------------------------ the mud on Marker Road

scripts.r4boue = async () => {
  await say(flag('lac.appel')
    ? L('Cette boue grise descend du Lac des Couleurs, au nord de Village-Plume. Tant qu’elle coulera, impossible de passer !', 'This grey mud comes down from the Lake of Colours, north of Featherby. As long as it keeps flowing, nobody can get through!')
    : L('Pouah, cette boue grise colle à tout ! On dirait de la gomme fondue…', 'Yuck, this grey mud sticks to everything! It looks like melted eraser…'), L('Randonneur', 'Hiker'));
};

/** Stuck in front of the mud: {rival} comes along and sends you to the lake. */
scripts.lacAppel = async () => {
  setFlag('lac.appel');
  const g = getGame();
  await bubble('player', '!', 600);
  const rival = await comeUp('rivalBoue', LOOKS.rival);
  await sayAll([
    L('Hé, {name} ! Toi aussi, tu es {g:bloquée|bloqué} par cette boue grise ?', 'Hey, {name}! Are you stuck behind this grey mud too?'),
    L('Le Prof. Fusain m’a appelé : elle vient du Lac des Couleurs, au nord de Village-Plume. Quelqu’un a bouché ses sources !', 'Prof. Charcoal called me: it comes from the Lake of Colours, north of Featherby. Someone stopped up its springs!'),
    L('Il nous attend là-bas. On y va en remontant la rivière de Village-Plume, en bateau.', 'He’s waiting for us there. You get there by sailing up Featherby’s river.'),
    has('bateau')
      ? L('Ton Bateau en Papier fera l’affaire. Le premier arrivé a gagné !', 'Your Paper Boat will do. Last one there is a rotten egg!')
      : L('Tu n’as pas de bateau ? La Plieuse du port en donne à ceux qui ont le Badge Aquarelle. Le premier arrivé a gagné !', 'No boat? The Paper Folder at the port gives them to anyone with the Watercolor Badge. Last one there is a rotten egg!'),
  ], RIVAL);
  for (let i = 0; i < 6 && !g.blocked(rival.x, rival.y + 1, rival); i++) await g.walk(rival, ['down'], 120);
  g.remove('rivalBoue');
};

// ------------------------------------------------------------------ the camp and the three springs

const SPRINGS = [
  { id: 'rouge', name: L('rouge', 'red'), map: 'lac', x: 7, y: 7, guard: 'lacG1' },
  { id: 'jaune', name: L('jaune', 'yellow'), map: 'lac', x: 22, y: 3, guard: '' },
  { id: 'bleue', name: L('bleue', 'blue'), map: 'sourceBleue', x: 5, y: 1, guard: 'lacChef' },
] as const;
const springsLeft = () => SPRINGS.filter((s) => !flag(`lac.source:${s.id}`)).length;
/** Where each spring's colour comes from on the lake (the blue one through its cave's mouth). */
const SPRING_SPOTS = [{ x: 7, y: 7 }, { x: 22, y: 3 }, { x: 37, y: 13 }];

scripts.lacEnter = async () => {
  if (!flag('lac.arrivee')) {
    setFlag('lac.arrivee');
    await say(L('Ohé, {name} ! Par ici, au camp, sur la rive !', 'Ahoy, {name}! Over here, at the camp on the shore!'), PROF);
    return;
  }
  // the last spring was freed in the cave: the colours come back as you step out
  if (!springsLeft() && !flag('lac.sources')) await colourBack();
};

scripts.profLac = async () => {
  if (!flag('lac.sources')) {
    if (!flag('lac.brief')) {
      setFlag('lac.brief');
      await sayAll([
        L('Te voilà ! Regarde-moi ce lac… Avant, on l’appelait le Lac des Couleurs.', 'There you are! Look at this lake… It used to be called the Lake of Colours.'),
        L('Trois sources le remplissent : une rouge, une jaune et une bleue. En se mélangeant, elles faisaient toutes les couleurs du monde !', 'Three springs fill it: a red one, a yellow one and a blue one. Mixing together, they made every colour in the world!'),
        L('Mais la Team Gomme les a bouchées avec de grosses gommes. Le lac est devenu gris, et la boue grise descend jusqu’à la Route des Feutres.', 'But Team Gomme plugged them with big erasers. The lake turned grey, and the grey mud runs all the way down to Marker Road.'),
        L('La source rouge est sur l’île de l’ouest. La jaune au nord, au fond d’un enclos de rochers. La bleue dans une grotte, sur l’île de l’est.', 'The red spring is on the west island. The yellow one is up north, inside a ring of rocks. The blue one is in a cave on the east island.'),
        L('Libère-les, et le lac retrouvera ses couleurs ! Moi, je reste au camp pour étudier l’eau… et prendre des photos.', 'Free them, and the lake will get its colours back! I’ll stay at the camp to study the water… and take pictures.'),
        L('Si tu vois une plongeuse sortir de l’eau, c’est Myrtille, la guide indigo. Elle connaît le fond du lac mieux que personne.', 'If you see a diver climbing out of the water, that’s Bilberry, the indigo guide. She knows the bottom of the lake better than anyone.'),
      ], PROF);
    } else {
      const n = springsLeft();
      await say(n > 1
        ? L('Encore {n} sources à libérer. Courage !', '{n} more springs to free. Keep going!')
        : L('Plus qu’une source ! Le lac commence déjà à frémir…', 'Just one spring left! The lake is already starting to stir…'), PROF, { n });
    }
  } else if (!flag('gift:bocal')) {
    if (!flag('tr:rivalLac')) {
      await say(L('Quelles couleurs ! Mais {rival} te cherchait, je crois. Il voulait te montrer quelque chose.', 'What colours! But {rival} was looking for you, I think. He wanted to show you something.'), PROF);
    } else {
      await sayAll([
        L('Bravo, {name} ! Le lac a retrouvé toutes ses couleurs. Clic-clac !', 'Well done, {name}! The lake has all its colours back. Click-clack!'),
        L('{rival} t’a montré les taches sombres ? Elles sont très profondes. On raconte que le fond du lac garde une vieille légende…', 'Did {rival} show you the dark patches? They are very deep. They say the bottom of the lake keeps an old legend…'),
        L('Moi, je suis trop vieux pour plonger… et le bocal est trop petit pour ma moustache ! Mais Myrtille, elle…', 'I’m too old to dive… and the jar is too small for my moustache! But Bilberry, now…'),
      ], PROF);
      // Myrtille, the indigo guide, brings the Jar Helmet (src/story/guides.ts)
      const myrtille = guide('indigo');
      if (!(await guideComes(myrtille, PROF))) await guideTalk(myrtille);
      await say(L('Et la boue de la Route des Feutres est partie : Ville-Feutre t’attend !', 'And the mud on Marker Road is gone: Felt City is waiting!'), PROF);
    }
  } else {
    await say(flag('legende')
      ? L('Aquarelline… Alors la légende était vraie ! Tu me laisseras la prendre en photo ?', 'Aquarelline… So the legend was true! Will you let me take its picture?')
      : L('Une chapelle engloutie, des perles… Les vieux du coin parlent d’une raie de toutes les couleurs, au fond du lac.', 'A sunken chapel, pearls… The old folk around here talk of a ray of every colour at the bottom of the lake.'), PROF);
  }
  update((d) => healParty(d));
  showToast(tr(L('Le Prof. soigne tes Bestioles.', 'The Prof heals your Critters.')));
};

/** A spring of the lake: the eraser stopping it up, or the colour flowing. */
scripts.source = async () => {
  const g = getGame();
  const sp = SPRINGS.find((s) => s.map === g.map.def.id && Math.abs(s.x - g.player.x) + Math.abs(s.y - g.player.y) === 1);
  if (!sp) return;
  if (flag(`lac.source:${sp.id}`)) return void (await say(L('La source {c} coule à gros bouillons.', 'The {c} spring is bubbling away.'), undefined, { c: tr(sp.name) }));
  if (sp.guard && !flag(`tr:${sp.guard}`)) return void (await say(L('Une grosse gomme bouche la source… mais un Sbire Gomme la surveille !', 'A big eraser plugs the spring… but an Eraser Grunt is guarding it!')));
  const c = await ask(L('Une énorme gomme bouche la source {c}. La retirer ?', 'A huge eraser plugs the {c} spring. Pull it out?'), [L('Oui', 'Yes'), L('Non', 'No')], undefined, { c: tr(sp.name) });
  if (c !== 0) return;
  await say(L('Tu tires de toutes tes forces…', 'You pull with all your might…'));
  await shake(600);
  setFlag(`lac.source:${sp.id}`);
  refreshMap();
  sfx.sparkle();
  await say(L('Plop ! La gomme saute, et l’eau {c} jaillit !', 'Pop! The eraser flies out, and {c} water gushes up!'), undefined, { c: tr(sp.name) });
  if (springsLeft()) {
    showToast(tr(L('Sources libérées : {n}/3', 'Springs freed: {n}/3'), { n: 3 - springsLeft() }));
  } else if (g.map.def.id === 'lac') {
    await colourBack();
  } else {
    await say(L('L’eau bleue file vers le lac… Il faut aller voir dehors !', 'The blue water rushes off towards the lake… Go and see outside!'));
  }
};

/** The three springs flow again: the colours spread over the lake from each of them, then {rival} comes along. */
async function colourBack() {
  const g = getGame();
  setFlag('lac.sources');
  await wait(300);
  const spread = g.colourReturn(SPRING_SPOTS, 4500);
  refreshMap();
  sfx.sparkle();
  await spread;
  playJingle('item', { fallback: sfx.sparkle });
  await say(L('Les trois couleurs se mélangent… Le Lac des Couleurs brille de nouveau de toutes ses couleurs !', 'The three colours mix together… The Lake of Colours shines with all its colours again!'));
  const rival = await comeUp('rivalSources', LOOKS.rival);
  await sayAll([
    L('Waouh ! Tu as vu ça ?! Toutes les couleurs sont revenues d’un coup !', 'Whoa! Did you see that?! All the colours came back at once!'),
    L('… Hé, regarde là-bas. Ces taches sombres, sur l’eau. Elles, elles ne sont pas parties.', '… Hey, look over there. Those dark patches on the water. They didn’t go away.'),
  ], RIVAL);
  g.face(rival, 'down');
  await bubble('rivalSources', '?', 700);
  await sayAll([
    L('C’est drôlement profond, à mon avis. On pourrait peut-être plonger, là-dedans !', 'They look really deep to me. Maybe we could dive in there!'),
    L('Mais d’abord… on n’a pas fini notre course. Voyons qui est le plus fort !', 'But first… our race isn’t over. Let’s see who’s stronger!'),
  ], RIVAL);
  await rivalBattle();
  g.remove('rivalSources');
}

async function rivalBattle() {
  const starter = String(num('rivalStarter') || 2).padStart(3, '0');
  const out = await fight('trainer', RIVAL, partyOf(rivalLacTeam(starter), newSeed()), {
    trainer: { id: 'rivalLac', name: RIVAL, party: [], money: 1600, before: [], after: [L('J’étais à deux doigts !', 'I was this close!')] },
    look: LOOKS.rival, music: 'rival',
  });
  if (out.result !== 'win') return;
  setFlag('tr:rivalLac');
  await sayAll([
    L('Bon, d’accord, tu as gagné la course. Et le combat. Mais la prochaine fois…', 'Fine, you won the race. And the battle. But next time…'),
    L('Le Prof. a un truc pour toi, au camp. Un truc pour plonger, je parie ! Moi, je file voir si la boue est partie de la Route des Feutres.', 'The Prof has something for you at the camp. Something for diving, I bet! I’m off to see if the mud has gone from Marker Road.'),
  ], RIVAL);
}

scripts.rivalLac = async () => {
  if (flag('lac.sources')) return rivalBattle();
  const left = SPRINGS.filter((s) => !flag(`lac.source:${s.id}`)).map((s) => tr(s.name));
  await sayAll([
    L('Je surveille le camp ! … Bon, d’accord, je me repose un peu.', 'I’m guarding the camp! … Fine, I’m having a little rest.'),
    left.length === 3
      ? L('Pour la source jaune, au nord, il y a des gros blocs de gomme à pousser. Si tu te coinces, ressors de l’enclos : ils reviennent à leur place.', 'For the yellow spring up north, there are big eraser blocks to push. If you get stuck, step out of the ring: they go back where they were.')
      : L('Il reste la source {l}. Tu peux le faire !', 'There’s still the {l} spring. You can do it!'),
  ], RIVAL, { l: left.join(tr(L(' et la ', ' and the '))) });
};

// ------------------------------------------------------------------ the legend: seven memory pearls

/** Each pearl's memory, by colour: the legend of the lake, told in order from red to violet. */
const MEMORIES: Record<string, LText> = {
  rouge: L('Il y a très longtemps, une peintre venait chaque soir au bord du lac rincer ses pinceaux. Le rouge de ses coquelicots s’en allait dans l’eau, en petits nuages.', 'Long, long ago, a painter came to the lake every evening to rinse her brushes. The red of her poppies drifted off into the water in little clouds.'),
  orange: L('Elle ne jetait jamais ses taches ni ses dessins ratés. Elle disait : « Une tache, c’est une couleur qui se promène. »', 'She never threw away her stains or her spoiled drawings. She used to say: “A stain is just a colour going for a walk.”'),
  jaune: L('Un matin, toutes ces couleurs rincées se sont mises à bouger ensemble… Une grande raie est née du lac, faite de toutes les taches de la peintre.', 'One morning, all those rinsed-out colours started moving together… A great ray rose from the lake, made of all the painter’s stains.'),
  verte: L('La peintre l’a appelée Aquarelline. Elles nageaient ensemble, et partout où passait Aquarelline, l’eau prenait des couleurs.', 'The painter named her Aquarelline. They swam together, and wherever Aquarelline went, the water took on colours.'),
  bleue: L('Aquarelline a porté les couleurs jusqu’à la mer. C’est elle qui a rendu si bleue l’eau du port.', 'Aquarelline carried the colours all the way to the sea. She is the one who made the harbour water so blue.'),
  indigo: L('Les gens du lac lui ont bâti une chapelle. Mais un jour, quelqu’un a trouvé le lac trop taché, pas assez parfait… et a voulu tout nettoyer.', 'The lake folk built her a chapel. But one day, someone found the lake too stained, not perfect enough… and wanted to clean it all up.'),
  violette: L('Triste, Aquarelline a plongé au fond du lac avec ses couleurs, serrées comme des perles. La chapelle a coulé avec elle. Elle dort là, et attend qu’on les lui rapporte.', 'Sadly, Aquarelline dived to the bottom of the lake with her colours, held tight like pearls. The chapel sank with her. She sleeps there, waiting for someone to bring them back.'),
};

/** Where each pearl waits (the green one is the Keeper's). */
const PEARL_AT: Record<string, string> = { lacFonds: 'rouge', chapelle: 'orange', abysses: 'jaune', portFonds: 'bleue', phareFonds: 'indigo', encreFonds: 'violette' };

const pearlsFound = () => PEARLS.filter(([id]) => flag(`perle:${id}`)).length;

/** Gives a pearl and plays its memory. */
async function pearl(id: string) {
  const i = PEARLS.findIndex(([p]) => p === id);
  setFlag(`perle:${id}`);
  giveItem(`perle-${id}`);
  playJingle('item', { fallback: sfx.capture });
  await say(L('Tu trouves la {i} !', 'You found the {i}!'), undefined, { i: tr(item(`perle-${id}`).name) });
  await say(L('La perle s’illumine… Un souvenir remonte à la surface.', 'The pearl lights up… A memory rises to the surface.'));
  const pic = await memoryUrl(id).catch(() => '');
  if (pic) await showPicture(pic, tr(L('Souvenir {n}/7', 'Memory {n}/7'), { n: i + 1 }));
  await say(MEMORIES[id]);
  const n = pearlsFound();
  if (n < PEARLS.length) showToast(tr(L('Perles-souvenirs : {n}/7', 'Memory pearls: {n}/7'), { n }));
  else await say(L('Les sept perles se mettent à vibrer toutes ensemble… Elles appellent quelque chose, tout au fond du lac.', 'All seven pearls start humming together… They are calling to something at the very bottom of the lake.'));
}

/** A big clam on the bottom, holding a pearl. */
scripts.perle = async () => {
  const id = PEARL_AT[getGame().map.def.id];
  if (!id || flag(`perle:${id}`)) return;
  await say(L('Un gros coquillage… Il s’entrouvre doucement.', 'A big clam… It slowly opens up.'));
  await pearl(id);
  refreshMap();
};

/** The sunken chapel's fresco, put back together: the Carte des Fonds, and the crypt opens. */
scripts.chapelleFresque = async () => {
  await say(L('C’est une grande raie de toutes les couleurs, qui nage au-dessus d’une peintre…', 'It’s a great ray of every colour, swimming above a painter…'));
  giveItem('carte-fonds');
  playJingle('item', { fallback: sfx.capture });
  await say(L('Derrière la toile, il y a une vieille carte roulée : {i} !', 'Behind the canvas there’s an old rolled-up map: the {i}!'), undefined, { i: tr(item('carte-fonds').name) });
  await say(L('Elle montre toutes les eaux profondes de la région. (Sur la carte du monde, les endroits où plonger sont marqués.)', 'It shows every deep water in the region. (On the Town Map, the places to dive are now marked.)'));
  await shake(600);
  await say(L('Au fond de la chapelle, les dalles s’écartent : un escalier descend encore plus bas !', 'At the back of the chapel, the flagstones slide apart: a staircase leads even further down!'));
};

// ------------------------------------------------------------------ the Abysses and Aquarelline

/** Caught, it is gone for good; knocked out, it comes back after a night of sleep (or the next real day). */
const aquaAway = () => flag('static:aquarelline') || !(num('nuits') >= num('ko:aquarelline') || localDay() >= num('koDay:aquarelline'));

scripts.abyssesEnter = async () => {
  setFlag('away:aquarelline', !flag('legende') || aquaAway() ? 1 : 0);
  if (flag('abysses')) return;
  setFlag('abysses');
  await say(L('Il fait très sombre, et tout est silencieux… Au fond, un autel de pierre attend, avec sept petits creux.', 'It’s very dark, and everything is silent… At the far end, a stone altar waits, with seven little hollows.'));
};

scripts.autel = async () => {
  if (flag('legende')) return void (await say(L('Les sept perles brillent dans l’autel, comme un arc-en-ciel au fond de l’eau.', 'The seven pearls shine in the altar, like a rainbow at the bottom of the water.')));
  const n = pearlsFound();
  if (n < PEARLS.length) {
    await say(n
      ? L('Sept petits creux, de sept couleurs… Tu as {n} perle(s). Il en manque encore {m}.', 'Seven little hollows, in seven colours… You have {n} pearl(s). {m} still missing.')
      : L('Sept petits creux, de sept couleurs… On dirait qu’on doit y poser quelque chose de rond.', 'Seven little hollows, in seven colours… Something round seems to belong in them.'), undefined, { n, m: PEARLS.length - n });
    if (n && !has('carte-fonds')) await say(L('(La fresque de la chapelle cache peut-être un indice…)', '(Maybe the chapel’s fresco hides a clue…)'));
    return;
  }
  if ((await ask(L('Poser les sept Perles-souvenirs dans l’autel ?', 'Place the seven memory pearls in the altar?'), [L('Oui', 'Yes'), L('Non', 'No')])) !== 0) return;
  for (const [, fr, en] of PEARLS) {
    sfx.blip();
    showToast(tr(L(`Perle ${fr}`, `${en} pearl`)));
    await wait(380);
  }
  update((d) => {
    for (const [id] of PEARLS) delete d.bag[`perle-${id}`];
  });
  await shake(900);
  setFlag('legende');
  setFlag('away:aquarelline', 0);
  const g = getGame();
  const spread = g.colourReturn([{ x: 12, y: 1 }], 2400);
  refreshMap();
  sfx.sparkle();
  await spread;
  await sayAll([
    L('Les sept perles s’allument une à une : rouge, orange, jaune, vert, bleu, indigo, violet…', 'The seven pearls light up one by one: red, orange, yellow, green, blue, indigo, violet…'),
    L('Toutes les couleurs remontent du fond… et quelque chose de très grand ouvre les yeux.', 'Every colour rises from the deep… and something very big opens its eyes.'),
  ]);
};

scripts.aquarelline = async () => {
  if (!flag('legende') || aquaAway()) return;
  await sayAll([
    L('Aquarelline flotte devant toi, immense et calme. Ses voiles laissent des traînées de toutes les couleurs.', 'Aquarelline floats before you, huge and calm. Its veils leave trails of every colour.'),
    L('Elle te regarde longtemps… comme si elle reconnaissait quelqu’un qui aime les taches.', 'It looks at you for a long time… as if it recognised someone who likes stains.'),
  ]);
  await shake(500);
  const out = await wildBattle('115', 40, { music: 'final' });
  if (out === 'capture') {
    setFlag('static:aquarelline');
    await say(L('Aquarelline est dans ton Croque-Carnet… Elle laisse une petite traînée de couleur derrière elle.', 'Aquarelline is in your Snapbook… It leaves a little trail of colour behind.'));
  } else if (out === 'win') {
    setFlag('ko:aquarelline', num('nuits') + 1);
    setFlag('koDay:aquarelline', localDay() + 1);
    await say(L('Aquarelline s’éloigne doucement dans le noir… Elle reviendra peut-être après une nuit de sommeil.', 'Aquarelline drifts slowly away into the dark… Maybe it will come back after a night’s sleep.'));
  } else if (out === 'flee') {
    await say(L('Aquarelline n’a pas bougé. Elle t’attend, toujours aussi calme.', 'Aquarelline hasn’t moved. It’s waiting for you, as calm as ever.'));
  }
  setFlag('away:aquarelline', aquaAway() ? 1 : 0);
};

// ------------------------------------------------------------------ the hidden valley and the Keeper

scripts.vallonEnter = async () => {
  if (flag('vallon')) return;
  setFlag('vallon');
  await say(L('Un vallon caché, plein de fleurs de toutes les couleurs… Personne n’a dû venir ici depuis longtemps.', 'A hidden valley full of flowers of every colour… Nobody can have come here for a long time.'));
};

scripts.vallonTunnel = async () => {
  if ((await ask(L('Le tunnel sous l’étang ramène au fond du lac. Replonger ?', 'The tunnel under the pond leads back to the bottom of the lake. Dive back in?'), [L('Oui', 'Yes'), L('Non', 'No')])) !== 0) return;
  await warpTo({ map: 'lacFonds', x: 1, y: 19, facing: 'right' });
};

const KEEPER = L('Gardienne', 'Keeper');

scripts.gardienne = async () => {
  if (flag('perle:verte')) {
    await say(flag('legende')
      ? L('Aquarelline s’est réveillée ! Je l’ai senti jusqu’ici, dans mes pinceaux. Merci.', 'Aquarelline has woken up! I felt it all the way here, in my brushes. Thank you.')
      : L('Les perles aiment l’eau profonde. Regarde bien où la Carte des Fonds te dit de plonger… Il y en a même dans la mer.', 'The pearls like deep water. Look carefully at where the Depths Map tells you to dive… There are some even in the sea.'), KEEPER);
    return;
  }
  await sayAll([
    L('Oh ! Une visite ! Tu es {g:passée|passé} par le tunnel sous le lac ? Personne ne l’avait fait depuis… pfiou !', 'Oh! A visitor! You came through the tunnel under the lake? Nobody has done that since… phew!'),
    L('Je suis la Gardienne des Couleurs. Ma famille garde la légende du lac depuis toujours.', 'I’m the Keeper of Colours. My family has kept the lake’s legend forever.'),
    L('Mon arrière-arrière-grand-mère était peintre. Chaque soir, elle rinçait ses pinceaux dans le lac…', 'My great-great-grandmother was a painter. Every evening she rinsed her brushes in the lake…'),
    L('Aquarelline dort au fond, en serrant ses souvenirs comme des perles. Sept perles, sept couleurs, éparpillées dans les eaux de la région.', 'Aquarelline sleeps at the bottom, holding her memories tight like pearls. Seven pearls, seven colours, scattered through the region’s waters.'),
    L('Ma famille garde la verte. Tiens : rapporte-les toutes à l’autel des Abysses, sous la chapelle engloutie.', 'My family keeps the green one. Here: bring them all back to the altar of the Abyss, under the sunken chapel.'),
  ], KEEPER);
  await pearl('verte');
};
