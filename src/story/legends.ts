/**
 * The two legendary Bestioles (src/data/maps/legendes.ts): Libellune, the good dream, comes to the
 * clearing of the Lost Woods at night; Noctaile, the bad dream, waits at the bottom of the
 * Scribble-Out Cave. Each is met once; caught, it is gone for good; knocked out, it comes back after a
 * night of sleep (or the next real day).
 */
import { L, type LText } from '../i18n';
import { localDay } from '../overworld/berries';
import { dayPhase, flag, getGame, say, sayAll, scripts, setFlag, shake, warpTo, wildBattle } from '../overworld/controller';
import { save } from '../state/game';

const num = (name: string) => save.value?.flags[name] ?? 0;

/** Whether a legendary is not in its place right now: caught, knocked out and not back yet, or out of its hours. */
function away(slug: string, nightOnly = false) {
  if (flag(`static:${slug}`)) return true;
  const back = num('nuits') >= num(`ko:${slug}`) || localDay() >= num(`koDay:${slug}`);
  return !back || (nightOnly && dayPhase() !== 'night');
}

async function meet(o: { id: string; slug: string; level: number; intro: LText[]; caught: LText; gone: LText; waits: LText }) {
  if (flag(`static:${o.slug}`)) return;
  await sayAll(o.intro);
  await shake(500);
  const out = await wildBattle(o.id, o.level, { music: 'final' });
  if (out === 'capture') {
    setFlag(`static:${o.slug}`);
    await say(o.caught);
  } else if (out === 'win') {
    // knocked out: it comes back after a night's sleep, or the next day
    setFlag(`ko:${o.slug}`, num('nuits') + 1);
    setFlag(`koDay:${o.slug}`, localDay() + 1);
    await say(o.gone);
  } else if (out === 'flee') {
    await say(o.waits);
  }
}

// ------------------------------------------------------------------ the Lost Woods and Libellune

scripts.boisPerduGate = async () => {
  if (!flag('badge:paillette')) {
    await say(L('Des ronces épaisses barrent le passage… De l’autre côté, de petites lumières dansent entre les arbres.', 'Thick brambles block the way… On the other side, little lights are dancing between the trees.'));
    await say(L('(Elles s’écarteront peut-être pour quelqu’un qui a gagné plus de badges.)', '(Maybe they will part for someone who has won more badges.)'));
    const g = getGame();
    await g.walk(g.player, ['up'], 160);
    return;
  }
  await warpTo({ map: 'boisPerdu', x: 10, y: 15, facing: 'up' });
};

scripts.boisPerduEnter = async () => {
  setFlag('away:libellune', away('libellune', true) ? 1 : 0);
};

scripts.boisPerduLost = async () => {
  await say(L('Les lucioles s’éteignent… Tu tournes en rond !', 'The fireflies go out… You’re going round in circles!'));
  await warpTo({ map: 'boisPerdu', x: 10, y: 15, facing: 'up' });
};

scripts.libellune = async () => {
  if (away('libellune', true)) return;
  await meet({
    id: '071', slug: 'libellune', level: 38,
    intro: [
      L('Une libellule de vitrail boit au petit étang. Ses ailes brillent de toutes les couleurs…', 'A stained-glass dragonfly is drinking at the little pond. Its wings shine with every colour…'),
      L('Elle se retourne vers toi !', 'It turns towards you!'),
    ],
    caught: L('Libellune s’est posée dans ta Crayon-ball. Elle brille encore un peu à travers.', 'Glassfly settled into your Pencil Ball. It still glows a little through it.'),
    gone: L('Libellune s’envole au-dessus des arbres… Elle reviendra peut-être après une nuit de sommeil.', 'Glassfly flies off above the trees… Maybe it will come back after a night’s sleep.'),
    waits: L('Libellune n’a pas bougé. Elle te regarde toujours.', 'Glassfly hasn’t moved. It is still watching you.'),
  });
  setFlag('away:libellune', away('libellune', true) ? 1 : 0);
};

// ------------------------------------------------------------------ the Scribble-Out Cave and Noctaile

scripts.ratures3Enter = async () => {
  setFlag('away:noctaile', away('noctaile') ? 1 : 0);
};

scripts.noctaile = async () => {
  if (away('noctaile')) return;
  await meet({
    id: '072', slug: 'noctaile', level: 42,
    intro: [
      L('Un grand papillon d’ombre ouvre ses ailes. Des spirales roses y tournent… Tu as la tête qui tourne.', 'A great shadow moth opens its wings. Pink spirals turn on them… Your head is spinning.'),
      L('Noctaile fonce sur toi !', 'Nightmoth swoops at you!'),
    ],
    caught: L('Noctaile est dans ta Crayon-ball. Tout est calme… Ce soir, on dormira tranquille.', 'Nightmoth is in your Pencil Ball. All is calm… Tonight, everyone will sleep soundly.'),
    gone: L('Noctaile se dissout dans le noir… Il reviendra sûrement après une nuit.', 'Nightmoth melts into the dark… It will surely be back after a night.'),
    waits: L('Noctaile flotte toujours au fond de la grotte.', 'Nightmoth is still floating at the bottom of the cave.'),
  });
  setFlag('away:noctaile', away('noctaile') ? 1 : 0);
};
